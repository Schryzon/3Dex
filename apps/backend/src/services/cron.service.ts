import prisma from "../prisma";

/**
 * Aggregate stats for the last 7 days
 */
export async function aggregate_stats() {
    console.log("Starting Stats Aggregation...");
    const now = new Date();
    const seven_days_ago = new Date(now);
    seven_days_ago.setDate(now.getDate() - 7);

    // 1. Top Selling Models (Purchases + Print Orders?)
    // Focusing on Purchases (Assets) for now + completed Print Orders?
    // Let's stick to Purchases model for simplified "Top Models"
    const top_models_raw = await prisma.purchase.groupBy({
        by: ['model_id'],
        where: {
            created_at: {
                gte: seven_days_ago,
                lte: now
            }
        },
        _count: {
            model_id: true
        },
        orderBy: {
            _count: {
                model_id: 'desc'
            }
        },
        take: 10
    });

    // Enrich Model Data
    const top_models = [];
    for (const item of top_models_raw) {
        const model = await prisma.model.findUnique({
            where: { id: item.model_id },
            select: { id: true, title: true, preview_url: true, price: true, artist: { select: { username: true } } }
        });
        if (model) {
            top_models.push({ ...model, sales: item._count.model_id });
        }
    }

    // 2. Top Artists (By Revenue or Sales Count?)
    // Let's do Sales Count
    // Requires joining Purchase -> Model -> Artist. Prisma groupBy doesn't support deep relations easily.
    // Alternative: Fetch all purchases and aggregate in memory? Or raw query.
    // Raw Query is cleaner for complex aggregation.

    // Using simple approach: We have top_models, let's just aggregate artists from them for MVP?
    // Or fetch Top 50 models and aggregate.
    // Or... we already have `role` 'ARTIST'.

    // Let's use Raw Query for Top Artists by Sales Volume
    // "SELECT m.artist_id, COUNT(p.id) as sales FROM Purchase p JOIN Model m ON p.model_id = m.id WHERE ... GROUP BY m.artist_id ORDER BY sales DESC"

    // Prisma Raw Query
    /*
    const top_artists_raw = await prisma.$queryRaw`
        SELECT m."artist_id", COUNT(p.id) as sales 
        FROM "Purchase" p 
        JOIN "Model" m ON p."model_id" = m.id 
        WHERE p.created_at >= ${seven_days_ago} 
        GROUP BY m."artist_id" 
        ORDER BY sales DESC 
        LIMIT 10;
    `;
    */
    // To avoid Raw Query type issues in TS without generation, I'll stick to JS logic on recent purchases.
    // 7 days data isn't huge for MVP.
    const recent_purchases = await prisma.purchase.findMany({
        where: { created_at: { gte: seven_days_ago } },
        include: { model: { select: { artist_id: true } } }
    });

    const artist_stats: Record<string, number> = {};
    recent_purchases.forEach(p => {
        const aid = p.model.artist_id;
        artist_stats[aid] = (artist_stats[aid] || 0) + 1;
    });

    const sorted_artists = Object.entries(artist_stats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const top_artists = [];
    for (const [aid, sales] of sorted_artists) {
        const artist = await prisma.user.findUnique({
            where: { id: aid },
            select: { id: true, username: true, avatar_url: true, display_name: true }
        });
        if (artist) {
            top_artists.push({ ...artist, sales });
        }
    }

    // 3. Store Aggregation
    await prisma.stats.create({
        data: {
            period_start: seven_days_ago,
            period_end: now,
            data: {
                top_models,
                top_artists,
                total_transactions: recent_purchases.length
            }
        }
    });

    console.log("Stats aggregated successfully.");
    return { top_models, top_artists };
}
