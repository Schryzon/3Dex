import bcrypt from "bcrypt";
import { Response } from "express";
import { Auth_Request } from "../middlewares/auth.middleware";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";
import { sign_user_urls } from "../services/storage.service";

/**
 * List all users (Admin only)
 */
export async function list_users(req: Auth_Request, res: Response): Promise<void> {
    const users = await prisma.user.findMany({
        orderBy: {
            created_at: 'desc'
        },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            created_at: true,
            updated_at: true
        }
    });

    res.json(users);
}

/**
 * Update current user profile
 */
export async function update_profile(req: Auth_Request, res: Response): Promise<void> {
    const { id } = req.user;
    const {
        display_name,
        bio,
        location,
        website,
        social_twitter,
        social_instagram,
        social_artstation,
        social_behance,
        addresses, // Json[]
        provider_config, // Json
        avatar_url,
        banner_url,
        show_nsfw
    } = req.body;

    // Validate addresses if provided? (Basic structure check logic could be here)

    const user = await prisma.user.update({
        where: { id },
        data: {
            display_name,
            bio,
            location,
            website,
            social_twitter,
            social_instagram,
            social_artstation,
            social_behance,
            addresses: addresses ? addresses : undefined,
            provider_config: provider_config ? provider_config : undefined,
            avatar_url,
            banner_url,
            show_nsfw: show_nsfw !== undefined ? !!show_nsfw : undefined
        }
    });

    res.json(await sign_user_urls(user));
}

/**
 * Apply for Artist or Provider role
 */
export async function apply_for_role(req: Auth_Request, res: Response): Promise<void> {
    const { id } = req.user;
    const {
        role,
        portfolio,
        provider_config,
        display_name,
        bio,
        website,
        location,
        social_twitter,
        social_instagram,
        social_artstation,
        social_behance,
    } = req.body; // role: 'ARTIST' | 'PROVIDER'

    if (!['ARTIST', 'PROVIDER'].includes(role)) {
        res.status(400).json({ message: "Invalid role! Must be ARTIST or PROVIDER." });
        return;
    }

    if (role === 'ARTIST' && (!portfolio || !Array.isArray(portfolio) || portfolio.length === 0)) {
        res.status(400).json({ message: "Portfolio is required for Artist application!" });
        return;
    }

    if (role === 'PROVIDER' && (!provider_config || !provider_config.printerTypes?.length || !provider_config.materials?.length)) {
        res.status(400).json({ message: "Printer types and materials are required for Provider application!" });
        return;
    }

    // Build the update data
    const updateData: any = {
        role: role,
        account_status: 'PENDING',
        display_name: display_name || undefined,
        bio: bio || undefined,
        website: website || undefined,
        location: location || undefined,
        social_twitter: social_twitter || undefined,
        social_instagram: social_instagram || undefined,
        social_artstation: social_artstation || undefined,
        social_behance: social_behance || undefined,
        status_history: {
            push: {
                status: 'PENDING',
                timestamp: new Date().toISOString(),
                reason: `User applied for ${role} role`
            }
        }
    };

    // Role-specific data
    if (role === 'ARTIST') {
        updateData.portfolio = portfolio;
    }
    if (role === 'PROVIDER') {
        updateData.provider_config = provider_config;
    }

    const user = await prisma.user.update({
        where: { id },
        data: updateData,
    });

    res.json({ message: "Application submitted successfully!", user: await sign_user_urls(user) });
}

/**
 * Get Public Profile
 */
export async function get_public_profile(req: Auth_Request, res: Response): Promise<void> {
    const username = req.params.username as string;

    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            display_name: true,
            avatar_url: true,
            banner_url: true,
            bio: true,
            role: true,
            account_status: true,
            location: true,
            website: true,
            social_twitter: true,
            social_instagram: true,
            social_artstation: true,
            provider_config: true,
            rating: true,
            review_count: true,
            created_at: true,
            portfolio: true, // Public portfolio
            _count: {
                select: {
                    followers: true,
                    following: true
                }
            }
        }
    });

    if (!user) {
        res.status(404).json({ message: "User not found!" });
        return;
    }

    res.json(await sign_user_urls(user));
}

/**
 * Search/Discovery for users (Publicly accessible)
 */
export async function search_users(req: Auth_Request, res: Response): Promise<void> {
    const { q, role } = req.query;

    if (!q && !role) {
        res.status(400).json({ message: "Search query or role is required!" });
        return;
    }

    const where: Prisma.UserWhereInput = {
        account_status: 'APPROVED'
    };

    if (q) {
        where.OR = [
            { username: { contains: q as string, mode: 'insensitive' } },
            { display_name: { contains: q as string, mode: 'insensitive' } }
        ];
    }

    if (role && ['ARTIST', 'PROVIDER'].includes(role as string)) {
        where.role = role as any;
    }

    const users = await prisma.user.findMany({
        where,
        take: 10,
        select: {
            id: true,
            username: true,
            display_name: true,
            avatar_url: true,
            bio: true,
            role: true,
            rating: true,
            review_count: true
        }
    });

    const signed_users = await Promise.all(
        users.map(u => sign_user_urls(u))
    );

    res.json(signed_users);
}

/**
 * Change user password
 */
export async function change_password(req: Auth_Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { old_pass, new_pass } = req.body;

    if (!old_pass || !new_pass) {
        res.status(400).json({ message: "Missing passwords!" });
        return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        res.status(404).json({ message: "User not found!" });
        return;
    }

    const valid = await bcrypt.compare(old_pass, user.password);
    if (!valid) {
        res.status(401).json({ message: "Wrong current password!" });
        return;
    }

    const hashed = await bcrypt.hash(new_pass, 10);
    await prisma.user.update({
        where: { id },
        data: { password: hashed }
    });

    res.json({ message: "Password updated successfully!" });
}

/**
 * Toggle 2FA status
 */
export async function toggle_2fa(req: Auth_Request, res: Response): Promise<void> {
    const { id } = req.user;
    const { enabled } = req.body;

    const user = await prisma.user.update({
        where: { id },
        data: { two_factor_enabled: !!enabled }
    });

    res.json({
        message: enabled ? "2FA enabled!" : "2FA disabled!",
        two_factor_enabled: user.two_factor_enabled
    });
}

/**
 * Delete own account (permanent)
 */
export async function delete_account(req: Auth_Request, res: Response): Promise<void> {
    const { id } = req.user;

    try {
        await prisma.user.delete({ where: { id } });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
            res.status(404).json({ message: "User not found." });
            return;
        }
        throw err;
    }

    // Clear auth cookie
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    res.json({ message: "Account deleted successfully." });
}
