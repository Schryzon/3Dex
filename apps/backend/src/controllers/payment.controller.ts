import { Request, Response } from "express";
import prisma from "../prisma";
import crypto from "crypto";
import { get_model_by_id } from "../services/model.service";

export async function initiate_checkout(req: Request, res: Response) {
    const { model_id } = req.body;

    // Mock Transaction ID
    const transaction_id = crypto.randomUUID();

    res.json({
        transaction_id,
        message: "Payment initiated",
        url: `https://mock-payment-gateway.com/pay/${transaction_id}`
    });
}

export async function confirm_payment(req: Request, res: Response) {
    const { model_id, transaction_id } = req.body;
    const user_id = (req as any).user.user_id; // Added via require_auth

    try {
        const model = await get_model_by_id(model_id);
        if (!model) {
            return res.status(404).json({ message: "Model not found" });
        }

        // Check if already purchased
        const existing = await prisma.purchase.findUnique({
            where: {
                user_id_model_id: {
                    user_id,
                    model_id
                }
            }
        });

        if (existing) {
            return res.json({ message: "Already purchased", purchase: existing });
        }

        const purchase = await prisma.purchase.create({
            data: {
                user_id,
                model_id,
                price_paid: model.price,
                license: "PERSONAL_USE"
            }
        });

        res.status(201).json({
            message: "Payment successful",
            purchase
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
