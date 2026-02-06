import { Request, Response } from "express";
import prisma from "../prisma";

export async function list_pending_models(req: Request, res: Response) {
    const models = await prisma.model.findMany({
        where: {
            status: "PENDING"
        },
        orderBy: {
            created_at: "asc"
        },
        include: {
            artist: {
                select: { username: true, id: true }
            }
        }
    });

    res.json(models);
}

export async function approve_model(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const model = await prisma.model.update({
            where: { id },
            data: { status: "APPROVED" }
        });
        res.json(model);
    } catch (error) {
        res.status(404).json({ message: "Model not found!" });
    }
}

export async function reject_model(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== 'string') {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
        const model = await prisma.model.update({
            where: { id },
            data: { status: "REJECTED" }
        });
        res.json(model);
    } catch (error) {
        res.status(404).json({ message: "Model not found!" });
    }
}
