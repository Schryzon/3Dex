import { Request, Response } from "express";
import prisma from "../prisma";
import { Auth_Request } from "../middlewares/auth.middleware";

export async function get_artist_stats(req: Auth_Request, res: Response) {
    const user_id = req.user.id;

    try {
        // 1. Total Sales Count
        const total_sales = await prisma.purchase.count({
            where: {
                model: { artist_id: String(user_id) }
            }
        });

        // 2. Total Earnings
        const purchases = await prisma.purchase.findMany({
            where: { model: { artist_id: String(user_id) } },
            select: { price_paid: true }
        });
        const total_earnings = purchases.reduce((sum, p) => sum + p.price_paid, 0);

        // 3. Recent Sales
        const recent_sales = await prisma.purchase.findMany({
            where: { model: { artist_id: String(user_id) } },
            orderBy: { created_at: 'desc' },
            take: 5,
            include: {
                model: { select: { title: true } },
                user: { select: { username: true } }
            }
        });

        // 4. Sales by Month (Last 12 Months)
        // Grouping by date in Prisma/SQL can be complex. 
        // We'll fetch last 12 months data and aggregate in JS for simplicity/portability.
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const lastYearSales = await prisma.purchase.findMany({
            where: {
                model: { artist_id: String(user_id) },
                created_at: { gte: oneYearAgo }
            },
            select: { created_at: true, price_paid: true }
        });

        const sales_by_month: Record<string, number> = {};
        lastYearSales.forEach(p => {
            const month = p.created_at.toISOString().slice(0, 7); // YYYY-MM
            sales_by_month[month] = (sales_by_month[month] || 0) + p.price_paid;
        });

        // 5. Top Models
        // Prisma doesn't support easy "groupBy relation count" with include details nicely yet
        // Accessing raw query might be better, or fetching models and their purchase counts.
        // Let's query models with their purchase count.
        const models = await prisma.model.findMany({
            where: { artist_id: String(user_id) },
            include: {
                _count: {
                    select: { purchases: true }
                }
            }
        });

        const top_models = models
            .sort((a, b) => b._count.purchases - a._count.purchases)
            .slice(0, 5)
            .map(m => ({
                id: m.id,
                title: m.title,
                sales: m._count.purchases
            }));

        res.json({
            total_sales,
            total_earnings,
            recent_sales,
            sales_by_month,
            top_models
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
