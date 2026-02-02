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
