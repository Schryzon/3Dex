import prisma from "../prisma";
import { create_notification } from "./notification.service";

/**
 * Follow a user
 */
export async function follow_user(followerId: string, followingId: string) {
    if (followerId === followingId) {
        throw new Error("You cannot follow yourself");
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
        where: { id: followingId }
    });

    if (!targetUser) {
        throw new Error("User to follow not found");
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
        where: {
            follower_id_following_id: {
                follower_id: followerId,
                following_id: followingId
            }
        }
    });

    if (existingFollow) {
        throw new Error("Already following this user");
    }

    const follow = await prisma.follow.create({
        data: {
            follower_id: followerId,
            following_id: followingId,
        }
    });

    // Notify the target user
    const follower = await prisma.user.findUnique({
        where: { id: followerId },
        select: { username: true, display_name: true }
    });

    if (follower) {
        const name = follower.display_name || follower.username;
        await create_notification(
            followingId,
            "FOLLOW",
            "New Follower",
            `${name} started following you.`,
            { follower_id: followerId, follower_username: follower.username }
        );
    }

    return follow;
}

/**
 * Unfollow a user
 */
export async function unfollow_user(followerId: string, followingId: string) {
    // Check if following
    const existingFollow = await prisma.follow.findUnique({
        where: {
            follower_id_following_id: {
                follower_id: followerId,
                following_id: followingId
            }
        }
    });

    if (!existingFollow) {
        throw new Error("You are not following this user");
    }

    return prisma.follow.delete({
        where: { id: existingFollow.id }
    });
}

/**
 * Get followers list
 */
export async function get_followers(userId: string) {
    const follows = await prisma.follow.findMany({
        where: { following_id: userId },
        include: {
            follower: {
                select: { id: true, username: true, display_name: true, avatar_url: true, role: true }
            }
        }
    });
    return follows.map(f => f.follower);
}

/**
 * Get following list
 */
export async function get_following(userId: string) {
    const follows = await prisma.follow.findMany({
        where: { follower_id: userId },
        include: {
            following: {
                select: { id: true, username: true, display_name: true, avatar_url: true, role: true }
            }
        }
    });
    return follows.map(f => f.following);
}

/**
 * Check follow status
 */
export async function check_follow_status(followerId: string, followingId: string) {
    const follow = await prisma.follow.findUnique({
        where: {
            follower_id_following_id: {
                follower_id: followerId,
                following_id: followingId
            }
        }
    });
    return !!follow;
}
