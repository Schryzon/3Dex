import { Request, Response } from "express";
import { create_order, handle_payment_webhook } from "../services/order.service";

/**
 * initiate_checkout
 * POST /orders/checkout
 * Body: { model_ids: string[] }
 */
export async function initiate_checkout(req: Request, res: Response) {
    try {
        const user_id = (req as any).user.id;
        const { model_ids } = req.body;

        if (!model_ids || !Array.isArray(model_ids) || model_ids.length === 0) {
            return res.status(400).json({ message: "model_ids array is required" });
        }

        const result = await create_order(user_id, model_ids);
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

        // Midtrans sends notification
        const result = await handle_payment_webhook(notification);

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Webhook Error:", error);
        // Return 200 to acknowledge receipt even on logic error to prevent retries? 
        // Or 500 to retry? 
        // Typically if signature invalid, we want to know.
        res.status(500).json({ message: error.message });
    }
}
