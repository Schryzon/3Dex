import { Response } from "express";
import { Auth_Request } from "../middlewares/auth.middleware";
import prisma from "../prisma";
import { get_download_url_s3 } from "../services/storage.service";

// GET /cart — List all cart items for logged-in user
export async function list_cart(req: Auth_Request, res: Response) {
    const user_id = req.user.id;

    try {
        const items = await prisma.cart_Item.findMany({
            where: { user_id },
            include: {
                model: {
                    include: {
                        artist: { select: { id: true, username: true, avatar_url: true } },
                        category: true,
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });

        // Sign preview URLs
        const signed_items = await Promise.all(
            items.map(async (item) => {
                const model = { ...item.model };
                if (model.preview_url && !model.preview_url.startsWith("http")) {
                    model.preview_url = await get_download_url_s3(model.preview_url);
                }
                return { ...item, model };
            })
        );

        res.json(signed_items);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// POST /cart/add — Add item to cart
export async function add_to_cart(req: Auth_Request, res: Response) {
    const user_id = req.user.id;
    const { modelId, quantity = 1 } = req.body;

    if (!modelId) {
        return res.status(400).json({ message: "modelId is required" });
    }

    try {
        // Verify model exists
        const model = await prisma.model.findUnique({ where: { id: modelId } });
        if (!model) {
            return res.status(404).json({ message: "Model not found" });
        }

        // Prevent free models in cart
        if (model.price === 0) {
            return res.status(400).json({ message: "Free models cannot be added to the cart. Please download them directly." });
        }

        // Upsert: add or update quantity
        const item = await prisma.cart_Item.upsert({
            where: {
                user_id_model_id: { user_id, model_id: modelId },
            },
            update: {
                quantity: { increment: quantity },
            },
            create: {
                user_id,
                model_id: modelId,
                quantity,
            },
            include: {
                model: {
                    include: {
                        artist: { select: { id: true, username: true, avatar_url: true } },
                        category: true,
                    },
                },
            },
        });

        // Sign preview URL
        const result = { ...item, model: { ...item.model } };
        if (result.model.preview_url && !result.model.preview_url.startsWith("http")) {
            result.model.preview_url = await get_download_url_s3(result.model.preview_url);
        }

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// PATCH /cart/:id — Update cart item quantity
export async function update_cart_item(req: Auth_Request, res: Response) {
    const user_id = req.user.id;
    const item_id = req.params.id as string;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "quantity must be >= 1" });
    }

    try {
        const item = await prisma.cart_Item.findFirst({
            where: { id: item_id, user_id },
        });

        if (!item) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        const updated = await prisma.cart_Item.update({
            where: { id: item_id },
            data: { quantity },
            include: {
                model: {
                    include: {
                        artist: { select: { id: true, username: true, avatar_url: true } },
                        category: true,
                    },
                },
            },
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// DELETE /cart/:id — Remove item from cart
export async function remove_from_cart(req: Auth_Request, res: Response) {
    const user_id = req.user.id;
    const item_id = req.params.id as string;

    try {
        const item = await prisma.cart_Item.findFirst({
            where: { id: item_id, user_id },
        });

        if (!item) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        await prisma.cart_Item.delete({ where: { id: item_id } });
        res.json({ message: "Item removed from cart" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// DELETE /cart/clear — Clear all cart items for user
export async function clear_cart(req: Auth_Request, res: Response) {
    const user_id = req.user.id;

    try {
        await prisma.cart_Item.deleteMany({ where: { user_id } });
        res.json({ message: "Cart cleared" });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
