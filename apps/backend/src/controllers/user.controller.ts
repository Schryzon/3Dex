import { Request, Response } from "express";
import prisma from "../prisma";

export async function list_users(req: Request, res: Response) {
    const users = await prisma.user.findMany({
        orderBy: {
            created_at: 'desc'
        },
        select: {
            id: true,
            email: true,
            username: true,
            role: true,
            created_at: true,
            updated_at: true
        }
    });

    res.json(users);
}
