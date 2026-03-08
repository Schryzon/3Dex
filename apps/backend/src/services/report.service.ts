import prisma from "../prisma";
import { Report_Target, Report_Status } from "@prisma/client";

export const reportService = {
    async createReport(params: {
        reporter_id: string;
        target_type: Report_Target;
        model_id?: string;
        post_id?: string;
        comment_id?: string;
        reason: string;
    }) {
        return prisma.report.create({
            data: {
                reporter_id: params.reporter_id,
                target_type: params.target_type,
                model_id: params.model_id,
                post_id: params.post_id,
                comment_id: params.comment_id,
                reason: params.reason,
            }
        });
    },

    async getAggregatedReports() {
        // We'll fetch all PENDING reports, group them by target, and count them
        const pendingReports = await prisma.report.findMany({
            where: { status: "PENDING" },
            include: {
                reporter: {
                    select: { username: true }
                }
            },
            orderBy: { created_at: "desc" }
        });

        // Simple runtime grouping since Prisma groupBy doesn't support includes
        const grouped = pendingReports.reduce((acc, report) => {
            const key = report.model_id || report.post_id || report.comment_id || "unknown";
            if (!acc[key]) {
                acc[key] = {
                    target_id: key,
                    target_type: report.target_type,
                    count: 0,
                    reports: []
                };
            }
            acc[key].count += 1;
            acc[key].reports.push(report);
            return acc;
        }, {} as Record<string, { target_id: string, target_type: Report_Target, count: number, reports: any[] }>);

        return Object.values(grouped).sort((a, b) => b.count - a.count);
    },

    async dismissReportsByTarget(target_id: string) {
        return prisma.report.updateMany({
            where: {
                status: "PENDING",
                OR: [
                    { model_id: target_id },
                    { post_id: target_id },
                    { comment_id: target_id }
                ]
            },
            data: { status: "DISMISSED" }
        });
    },

    async deleteContentByTarget(target_id: string, target_type: Report_Target) {
        // Delete the content
        if (target_type === "MODEL") {
            await prisma.model.delete({ where: { id: target_id } });
        } else if (target_type === "POST") {
            await prisma.post.delete({ where: { id: target_id } });
        } else if (target_type === "COMMENT") {
            await prisma.post_Comment.delete({ where: { id: target_id } });
        }

        // Mark corresponding reports as REVIEWED (since action was taken)
        await prisma.report.updateMany({
            where: {
                status: "PENDING",
                OR: [
                    { model_id: target_id },
                    { post_id: target_id },
                    { comment_id: target_id }
                ]
            },
            data: { status: "REVIEWED" }
        });

        return { success: true };
    }
};
