import { Request, Response } from "express";
import prisma from "../prisma";

export async function list_categories(req: Request, res: Response) {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export async function list_tags(req: Request, res: Response) {
    try {
        // Simple list of tags
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
            take: 50 // Limit to top 50 mostly usage? (Need aggregate for that, simple list for now)
        });
        res.json(tags);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
