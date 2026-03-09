import { Request, Response } from "express";
import { follow_user, unfollow_user, get_followers, get_following, check_follow_status } from "../services/follow.service";

export async function follow(req: Request, res: Response) {
    const followerId = req.user!.id;
    const followingId = req.params.id as string; // Target user's ID

    try {
        await follow_user(followerId, followingId);
        res.json({ message: "Successfully followed user" });
    } catch (error: any) {
        console.error("[FOLLOW] Error following user:", error.message);
        res.status(400).json({ message: error.message });
    }
}

export async function unfollow(req: Request, res: Response) {
    const followerId = req.user!.id;
    const followingId = req.params.id as string;

    try {
        await unfollow_user(followerId, followingId);
        res.json({ message: "Successfully unfollowed user" });
    } catch (error: any) {
        console.error("[FOLLOW] Error unfollowing user:", error.message);
        res.status(400).json({ message: error.message });
    }
}

export async function list_followers(req: Request, res: Response) {
    const userId = req.params.id as string;
    try {
        const followers = await get_followers(userId);
        res.json({ data: followers });
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function list_following(req: Request, res: Response) {
    const userId = req.params.id as string;
    try {
        const following = await get_following(userId);
        res.json({ data: following });
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function check_status(req: Request, res: Response) {
    const followerId = req.user?.id;
    const followingId = req.params.id as string;

    if (!followerId) {
        return res.json({ is_following: false });
    }

    try {
        const isFollowing = await check_follow_status(followerId, followingId);
        res.json({ is_following: isFollowing });
    } catch (error: any) {
        res.status(500).json({ message: "Internal server error" });
    }
}
