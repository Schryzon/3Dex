import { Request, Response } from "express";
import { get_user_notifications, get_unread_count, mark_as_read, mark_all_as_read } from "../services/notification.service";

export async function get_notifications(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const notifications = await get_user_notifications(userId);
        const unreadCount = await get_unread_count(userId);
        res.json({ data: notifications, unread_count: unreadCount });
    } catch (error: any) {
        console.error("[NOTIFICATIONS] Error fetching notifications:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function read_notification(req: Request, res: Response) {
    const userId = req.user?.id;
    const notificationId = req.params.id as string;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const notification = await mark_as_read(notificationId, userId);
        res.json(notification);
    } catch (error: any) {
        console.error("[NOTIFICATIONS] Error marking as read:", error.message);
        res.status(400).json({ message: error.message });
    }
}

export async function read_all_notifications(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        await mark_all_as_read(userId);
        res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
        console.error("[NOTIFICATIONS] Error marking all as read:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
