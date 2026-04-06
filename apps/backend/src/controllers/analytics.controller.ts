import { Request, Response } from "express";
import prisma from "../prisma";
import { Auth_Request } from "../middlewares/auth.middleware";

export async function get_public_stats(req: Request, res: Response) {
    try {
        const models = await prisma.model.count({ where: { status: 'APPROVED' } });
        const customers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
        const artists = await prisma.user.count({ where: { role: 'ARTIST' } });
        const providers = await prisma.user.count({ where: { role: 'PROVIDER' } });

        res.json({
            models,
            customers,
            artists,
            providers,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

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

        // 3. Total Customers (Unique buyers)
        const unique_customers = await prisma.purchase.groupBy({
            by: ['user_id'],
            where: { model: { artist_id: String(user_id) } }
        });
        const total_customers = unique_customers.length;

        // 4. Recent Sales
        const recent_sales = await prisma.purchase.findMany({
            where: { model: { artist_id: String(user_id) } },
            orderBy: { created_at: 'desc' },
            take: 5,
            include: {
                model: { select: { title: true } },
                user: { select: { username: true } }
            }
        });

        // 5. Sales by Month (Last 12 Months) - Full Timeline
        const months: { month: string; earnings: number }[] = [];
        const now = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
            months.push({ month: monthStr, earnings: 0 });
        }

        const oneYearAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const lastYearSales = await prisma.purchase.findMany({
            where: {
                model: { artist_id: String(user_id) },
                created_at: { gte: oneYearAgo }
            },
            select: { created_at: true, price_paid: true }
        });

        lastYearSales.forEach(p => {
            const m = p.created_at.toISOString().slice(0, 7);
            const entry = months.find(x => x.month === m);
            if (entry) entry.earnings += p.price_paid;
        });

        // 6. Earnings Growth (This month vs Last month)
        const currentMonth = now.toISOString().slice(0, 7);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.toISOString().slice(0, 7);

        const currentEarnings = months.find(m => m.month === currentMonth)?.earnings || 0;
        const previousEarnings = months.find(m => m.month === lastMonth)?.earnings || 0;
        
        let earnings_growth = 0;
        if (previousEarnings > 0) {
            earnings_growth = ((currentEarnings - previousEarnings) / previousEarnings) * 100;
        } else if (currentEarnings > 0) {
            earnings_growth = 100; // 100% growth if starting from zero
        }

        // 7. Top Models (With Revenue)
        const models = await prisma.model.findMany({
            where: { artist_id: String(user_id) },
            include: {
                _count: {
                    select: { purchases: true }
                },
                purchases: {
                    select: { price_paid: true }
                }
            }
        });

        const top_models = models
            .sort((a, b) => b._count.purchases - a._count.purchases)
            .slice(0, 5)
            .map(m => ({
                id: m.id,
                title: m.title,
                sales: m._count.purchases,
                revenue: m.purchases.reduce((acc, p) => acc + p.price_paid, 0)
            }));

        res.json({
            total_sales,
            total_earnings,
            total_customers,
            earnings_growth: Math.round(earnings_growth),
            recent_sales,
            sales_by_month: months,
            top_models
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function get_provider_stats(req: Auth_Request, res: Response) {
    const user_id = req.user.id;

    try {
        // 1. Total print jobs (orders assigned to this provider)
        const total_jobs = await prisma.order.count({
            where: { provider_id: String(user_id) }
        });

        // 2. Completed jobs
        const completed_jobs = await prisma.order.count({
            where: {
                provider_id: String(user_id),
                status: 'PAID'
            }
        });

        // 3. Total Earnings
        const provider_orders = await prisma.order.findMany({
            where: {
                provider_id: String(user_id),
                status: 'PAID'
            },
            select: { total_amount: true }
        });
        const total_earnings = provider_orders.reduce((sum, o) => sum + o.total_amount, 0);

        // 4. Jobs by status
        const pending_jobs = await prisma.order.count({
            where: { provider_id: String(user_id), status: 'PENDING' }
        });
        const failed_jobs = await prisma.order.count({
            where: { provider_id: String(user_id), status: 'FAILED' }
        });

        // 5. Recent Orders
        const recent_orders = await prisma.order.findMany({
            where: { provider_id: String(user_id) },
            orderBy: { created_at: 'desc' },
            take: 5,
            include: {
                user: { select: { username: true } },
                items: {
                    select: {
                        price: true,
                        print_status: true,
                        model: { select: { title: true } }
                    }
                }
            }
        });

        // 6. Monthly Earnings (Last 12 months)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const lastYearOrders = await prisma.order.findMany({
            where: {
                provider_id: String(user_id),
                status: 'PAID',
                created_at: { gte: oneYearAgo }
            },
            select: { created_at: true, total_amount: true }
        });

        const earnings_by_month: Record<string, number> = {};
        lastYearOrders.forEach(o => {
            const month = o.created_at.toISOString().slice(0, 7);
            earnings_by_month[month] = (earnings_by_month[month] || 0) + o.total_amount;
        });

        // 7. Average rating & review count
        const user_data = await prisma.user.findUnique({
            where: { id: String(user_id) },
            select: { rating: true, review_count: true }
        });

        res.json({
            total_jobs,
            completed_jobs,
            pending_jobs,
            failed_jobs,
            total_earnings,
            completion_rate: total_jobs > 0 ? Math.round((completed_jobs / total_jobs) * 100) : 0,
            recent_orders,
            earnings_by_month,
            rating: user_data?.rating || 0,
            review_count: user_data?.review_count || 0,
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
