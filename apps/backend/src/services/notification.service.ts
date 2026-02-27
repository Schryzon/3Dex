import prisma from "../prisma";

/**
 * Internal method to create a notification
 */
export async function create_notification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
) {
    return prisma.notification.create({
        data: {
            user_id: userId,
            type,
            title,
            message,
            data: data || {},
        },
    });
}

/**
 * Fetch notifications for a user
 */
export async function get_user_notifications(userId: string, limit: number = 20) {
    return prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit,
    });
}

/**
 * Get unread notification count
 */
export async function get_unread_count(userId: string) {
    return prisma.notification.count({
        where: { user_id: userId, is_read: false },
    });
}

/**
 * Mark a single notification as read
 */
export async function mark_as_read(notificationId: string, userId: string) {
    // Ensure the notification belongs to the user
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification || notification.user_id !== userId) {
        throw new Error("Notification not found or unauthorized");
    }

    return prisma.notification.update({
        where: { id: notificationId },
        data: { is_read: true },
    });
}

/**
 * Mark all notifications as read for a user
 */
export async function mark_all_as_read(userId: string) {
    return prisma.notification.updateMany({
        where: { user_id: userId, is_read: false },
        data: { is_read: true },
    });
}
