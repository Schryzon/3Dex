import { Request, Response } from "express";
import prisma from "../prisma";
import { Auth_Request } from "../middlewares/auth.middleware";
import { aggregate_stats } from "../services/cron.service";

export async function list_pending_models(req: Request, res: Response) {
    const { get_download_url_s3 } = await import("../services/storage.service");

    const raw = await prisma.model.findMany({
        where: {
            status: "PENDING"
        },
        orderBy: {
            created_at: "asc"
        },
        include: {
            artist: {
                select: { username: true, id: true, avatar_url: true, display_name: true }
            },
            category: true,
            tags: true
        }
    });

    // Sign URLs
    const models = await Promise.all(raw.map(async (m: any) => {
        const model = { ...m };
        if (model.preview_url && !model.preview_url.startsWith("http")) {
            model.preview_url = await get_download_url_s3(model.preview_url);
        }
        if (model.file_url && !model.file_url.startsWith("http")) {
            model.file_url = await get_download_url_s3(model.file_url);
        }
        return model;
    }));

    res.json(models);
}

export async function approve_model(req: Request, res: Response) {
    const id = req.params.id as string;

    if (typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const model = await prisma.model.update({
            where: { id },
            data: { status: "APPROVED" }
        });
        res.json(model);
    } catch (error) {
        res.status(404).json({ message: "Model not found!" });
    }
}

export async function reject_model(req: Auth_Request, res: Response) {
    const id = req.params.id as string;
    const admin_id = req.user.id;
    const { reason } = req.body;

    if (typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "A reason is required when rejecting a model." });
    }

    try {
        const model = await prisma.model.update({
            where: { id },
            data: { status: "REJECTED" },
            include: { artist: { select: { username: true } } }
        });

        // Audit log
        await prisma.admin_Audit_Log.create({
            data: {
                admin_id,
                action: "REJECT_MODEL",
                target_id: id,
                target_type: "MODEL",
                reason: reason.trim(),
                metadata: {
                    title: model.title,
                    artist_username: (model as any).artist?.username || null,
                    price: model.price,
                }
            }
        });

        res.json(model);
    } catch (error) {
        res.status(404).json({ message: "Model not found!" });
    }
}

/**
 * List users by status (PENDING, APPROVED, REJECTED)
 */
export async function list_users_by_status(req: Request, res: Response) {
    const status = req.query.status as string; // 'PENDING' | 'APPROVED' | 'REJECTED'

    if (!status) {
        return res.status(400).json({ message: "Status query param required" });
    }

    try {
        const roles = (req.query.roles as string)?.split(',') ?? ['ARTIST', 'PROVIDER'];
        const users = await prisma.user.findMany({
            where: {
                account_status: status as any,
                role: { in: roles as any }
            },
            orderBy: { created_at: 'asc' },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                portfolio: true, // This is Json[]
                provider_config: true, // For Providers
                created_at: true,
                avatar_url: true,
                display_name: true
            }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Approve User Application
 */
export async function approve_user(req: Auth_Request, res: Response) { // Auth_Request needed for admin ID
    const id = req.params.id as string;
    const admin_id = req.user.id;

    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                account_status: 'APPROVED',
                approved_at: new Date(),
                status_history: {
                    push: {
                        status: 'APPROVED',
                        timestamp: new Date().toISOString(),
                        admin_id: admin_id,
                        reason: 'Approved by admin'
                    }
                }
            }
        });

        // Audit log
        await prisma.admin_Audit_Log.create({
            data: {
                admin_id,
                action: 'APPROVE_USER',
                target_id: id,
                target_type: 'USER',
                reason: 'Application approved by admin',
                metadata: {
                    username: user.username,
                    role: user.role,
                    email: user.email,
                }
            }
        });

        res.json({ message: "User approved!", user });
    } catch (error: any) {
        res.status(404).json({ message: "User not found or error updating!" });
    }
}

/**
 * Reject User Application
 */
export async function reject_user(req: Auth_Request, res: Response) {
    const id = req.params.id as string;
    const { reason } = req.body;
    const admin_id = req.user.id;

    if (!reason) {
        return res.status(400).json({ message: "Rejection reason required!" });
    }

    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                account_status: 'REJECTED',
                rejected_at: new Date(),
                status_history: {
                    push: {
                        status: 'REJECTED',
                        timestamp: new Date().toISOString(),
                        admin_id: admin_id,
                        reason: reason
                    }
                }
            }
        });

        // Audit log
        await prisma.admin_Audit_Log.create({
            data: {
                admin_id,
                action: "REJECT_USER",
                target_id: id,
                target_type: "USER",
                reason: reason.trim(),
                metadata: {
                    username: user.username,
                    role: user.role,
                    email: user.email,
                }
            }
        });

        res.json({ message: "User rejected!", user });
    } catch (error: any) {
        res.status(404).json({ message: "User not found or error updating!" });
    }
}

export async function trigger_stats_aggregation(req: Request, res: Response) {
    try {
        const { aggregate_stats } = require("../services/cron.service");
        const stats = await aggregate_stats();
        res.json({ message: "Stats aggregation triggered successfully", data: stats });
    } catch (error: any) {
        console.error("Stats aggregation failed:", error);
        res.status(500).json({ message: "Failed to aggregate stats", error: error.message });
    }
}

/**
 * Dashboard Summary for Admin
 */
export async function get_dashboard_summary(req: Request, res: Response) {
    try {
        const [
            pendingModelsCount,
            pendingUsersCount,
            pendingReportsCount,
            latestModels,
            latestUsers,
            latestReports,
            latestStats
        ] = await Promise.all([
            prisma.model.count({ where: { status: 'PENDING' } }),
            prisma.user.count({ where: { account_status: 'PENDING', role: { in: ['ARTIST', 'PROVIDER'] } } }),
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.model.findMany({
                where: { status: 'PENDING' },
                take: 3,
                orderBy: { created_at: 'desc' },
                include: { artist: { select: { username: true } } }
            }),
            prisma.user.findMany({
                where: { account_status: 'PENDING', role: { in: ['ARTIST', 'PROVIDER'] } },
                take: 3,
                orderBy: { created_at: 'desc' },
                select: { id: true, username: true, role: true, portfolio: true, created_at: true }
            }),
            prisma.report.findMany({
                where: { status: 'PENDING' },
                take: 3,
                orderBy: { created_at: 'desc' },
                include: { reporter: { select: { username: true } } }
            }),
            prisma.stats.findMany({ 
                take: 5, 
                orderBy: { created_at: 'desc' } 
            })
        ]);

        res.json({
            counts: {
                models: pendingModelsCount,
                users: pendingUsersCount,
                reports: pendingReportsCount
            },
            recent: {
                models: latestModels,
                users: latestUsers,
                reports: latestReports
            },
            stats: latestStats?.[0]?.data || null,
            history: latestStats.map((s: any) => ({
                date: s.created_at,
                transactions: s.data.total_transactions || 0
            })).reverse()
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Get Admin Audit Logs — paginated and filterable
 */
export async function get_audit_logs(req: Request, res: Response) {
    try {
        const {
            action,
            admin_id,
            from,
            to,
            page = 1,
            limit = 30
        } = req.query;

        const where: any = {};

        if (action) where.action = action;
        if (admin_id) where.admin_id = admin_id;
        if (from || to) {
            where.created_at = {};
            if (from) where.created_at.gte = new Date(from as string);
            if (to)   where.created_at.lte = new Date(to as string);
        }

        const take = Number(limit);
        const skip = (Number(page) - 1) * take;

        const [logs, total] = await Promise.all([
            prisma.admin_Audit_Log.findMany({
                where,
                orderBy: { created_at: 'desc' },
                take,
                skip,
                include: {
                    admin: {
                        select: { id: true, username: true, display_name: true, avatar_url: true }
                    }
                }
            }),
            prisma.admin_Audit_Log.count({ where })
        ]);

        res.json({
            data: logs,
            meta: {
                total,
                page: Number(page),
                limit: take,
                pages: Math.ceil(total / take)
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
