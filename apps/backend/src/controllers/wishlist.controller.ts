import { Request, Response } from "express";
import prisma from "../prisma";
import { Auth_Request } from "../middlewares/auth.middleware";

// POST /wishlist/:model_id
export async function add_to_wishlist(req: Auth_Request, res: Response) {
    const user_id = req.user.id;
    const model_id = req.params.model_id;

    try {
        const item = await prisma.wishlist.create({
            data: {
                user_id: String(user_id),
                model_id: String(model_id)
            }
        });
        res.status(201).json(item);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "Already in wishlist!" });
        }
        res.status(500).json({ message: error.message });
    }
}

// DELETE /wishlist/:model_id
export async function remove_from_wishlist(req: Auth_Request, res: Response) {
    const user_id = req.user.id;
    const model_id = req.params.model_id;

    try {
        await prisma.wishlist.delete({
            where: {
                user_id_model_id: {
                    user_id: String(user_id),
                    model_id: String(model_id)
                }
            }
        });
        res.json({ message: "Removed from wishlist!" });
    } catch (error: any) {
        res.status(404).json({ message: "Item not found!" });
    }
}

// GET /wishlist
export async function get_my_wishlist(req: Auth_Request, res: Response) {
    const user_id = req.user.id;

    try {
        const items = await prisma.wishlist.findMany({
            where: { user_id: String(user_id) },
            include: {
                model: {
                    include: {
                        artist: { select: { username: true } }
                    }
                }
            }
        });
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
