import { Request, Response } from "express";
import prisma from "../prisma";
import { Auth_Request } from "../middlewares/auth.middleware";

// POST /models/:id/reviews
export async function create_review(req: Auth_Request, res: Response) {
    const user_id = req.user.id;
    const model_id = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be 1-5!" });
    }

    try {
        // 1. Verify Verification: User must have purchased the model
        const purchase = await prisma.purchase.findUnique({
            where: {
                user_id_model_id: {
                    user_id: String(user_id),
                    model_id: String(model_id)
                }
            }
        });

        if (!purchase) {
            return res.status(403).json({ message: "You must buy the model first!" });
        }

        // 2. Create Review
        const review = await prisma.review.create({
            data: {
                user_id: String(user_id),
                model_id: String(model_id),
                rating,
                comment
            }
        });

        res.status(201).json(review);

    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "You already reviewed this model!" });
        }
        res.status(500).json({ message: error.message });
    }
}

// GET /models/:id/reviews
export async function list_reviews(req: Request, res: Response) {
    const model_id = req.params.id;

    try {
        const reviews = await prisma.review.findMany({
            where: { model_id: String(model_id) },
            orderBy: { created_at: 'desc' },
            include: {
                user: {
                    select: { username: true, id: true }
                }
            }
        });
        res.json(reviews);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Add a review for a user (Artist/Provider)
 */
export async function add_user_review(req: Auth_Request, res: Response): Promise<void> {
    const { id: reviewer_id } = req.user;
    const { target_user_id, rating, comment } = req.body;

    if (reviewer_id === target_user_id) {
        res.status(400).json({ message: "Cannot review yourself!" });
        return;
    }

    if (rating < 1 || rating > 5) {
        res.status(400).json({ message: "Rating must be between 1 and 5" });
        return;
    }

    try {
        const review = await prisma.user_Review.create({
            data: {
                reviewer_id,
                target_user_id,
                rating,
                comment
            }
        });

        // Update target user's aggregated rating
        const aggregations = await prisma.user_Review.aggregate({
            where: { target_user_id },
            _avg: { rating: true },
            _count: { rating: true }
        });

        await prisma.user.update({
            where: { id: target_user_id },
            data: {
                rating: aggregations._avg.rating || 0,
                review_count: aggregations._count.rating || 0
            }
        });

        res.json(review);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ message: "You have already reviewed this user!" });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
}

/**
 * Get reviews for a user
 */
export async function get_user_reviews(req: Auth_Request, res: Response): Promise<void> {
    const user_id = req.params.user_id as string;
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reviews = await prisma.user_Review.findMany({
        where: { target_user_id: user_id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip,
        include: {
            reviewer: { select: { id: true, username: true, avatar_url: true } }
        }
    });

    res.json(reviews);
}
