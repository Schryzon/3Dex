import { Request, Response } from "express";
import { create_order, handle_payment_webhook, get_user_orders } from "../services/order.service";

/**
 * initiate_checkout
 * POST /orders/checkout
 * Body: { model_ids: string[] }
 */
export async function initiate_checkout(req: Request, res: Response) {
    try {
        const user_id = (req as any).user.id;
        const { items, model_ids } = req.body as {
            items?: { model_id: string; quantity: number }[];
            model_ids?: string[];
        };

        let lines: { model_id: string; quantity: number }[];

        if (items && Array.isArray(items) && items.length > 0) {
            lines = items.map((it: any) => ({
                model_id: String(it.model_id),
                quantity: Number(it.quantity) || 1,
            }));
        } else if (model_ids && Array.isArray(model_ids) && model_ids.length > 0) {
            lines = model_ids.map((id: string) => ({
                model_id: String(id),
                quantity: 1,
            }));
        } else {
            return res.status(400).json({
                message: "items (array of { model_id, quantity }) is required",
            });
        }

        const result = await create_order(user_id, lines);
        res.json(result);
    } catch (error: any) {
        console.error("Checkout Error:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}

/**
 * midtrans_notification
 * POST /orders/notification
 * Public webhook endpoint for Midtrans
 */
export async function midtrans_notification(req: Request, res: Response) {
    try {
        const notification = req.body;
        const result = await handle_payment_webhook(notification);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Webhook Error:", error);
        res.status(500).json({ message: error.message });
    }
}

/**
 * list_orders
 * GET /orders
 */
export async function list_orders(req: Request, res: Response) {
    try {
        const user_id = (req as any).user.id;
        const orders = await get_user_orders(user_id);
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
