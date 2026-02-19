import { Response } from "express";
import { Auth_Request } from "../middlewares/auth.middleware";
import prisma from "../prisma";

/**
 * Create a new post
 */
export async function create_post(req: Auth_Request, res: Response): Promise<void> {
    const { id, role } = req.user;
    const { caption, media_urls } = req.body;

    // 1. Restrict posting to non-customers
    if (!['ARTIST', 'PROVIDER', 'ADMIN'].includes(role)) {
        res.status(403).json({ message: "Only Artists and Providers can post!" });
        return;
    }

    if (!media_urls || !Array.isArray(media_urls) || media_urls.length === 0) {
        res.status(400).json({ message: "At least one media URL is required!" });
        return;
    }

    const post = await prisma.post.create({
        data: {
            user_id: id,
            caption,
            media_urls
        },
        include: {
            user: { select: { id: true, username: true, display_name: true, avatar_url: true, role: true } }
        }
    });

    res.status(201).json(post);
}

/**
 * Get community feed posts
 */
export async function get_feed_posts(req: Auth_Request, res: Response): Promise<void> {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
        skip,
        include: {
            user: { select: { id: true, username: true, display_name: true, avatar_url: true, role: true } },
            _count: { select: { likes: true, comments: true } },
            likes: {
                where: { user_id: req.user?.id }, // Check if current user liked
                select: { user_id: true }
            }
        }
    });

    // Transform to add is_liked flag
    const feed = posts.map(post => ({
        ...post,
        is_liked: post.likes.length > 0,
        likes: undefined // Remove raw likes array
    }));

    res.json(feed);
}

/**
 * Get posts for a user
 */
export async function get_user_posts(req: Auth_Request, res: Response): Promise<void> {
    const user_id = req.params.user_id as string;
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip,
        include: {
            user: { select: { id: true, username: true, display_name: true, avatar_url: true, role: true } },
            _count: { select: { likes: true, comments: true } },
            likes: {
                where: { user_id: req.user?.id },
                select: { user_id: true }
            }
        }
    });

    const feed = posts.map(post => ({
        ...post,
        is_liked: post.likes.length > 0,
        likes: undefined
    }));

    res.json(feed);
}

/**
 * Toggle Like on a post
 */
export async function toggle_like(req: Auth_Request, res: Response): Promise<void> {
    const { id: user_id } = req.user;
    const post_id = req.params.post_id as string;

    const existing = await prisma.post_Like.findUnique({
        where: {
            user_id_post_id: { user_id, post_id }
        }
    });

    if (existing) {
        await prisma.post_Like.delete({
            where: { user_id_post_id: { user_id, post_id } }
        });
        await prisma.post.update({
            where: { id: post_id },
            data: { like_count: { decrement: 1 } }
        });
        res.json({ message: "Unliked" });
    } else {
        await prisma.post_Like.create({
            data: { user_id, post_id }
        });
        await prisma.post.update({
            where: { id: post_id },
            data: { like_count: { increment: 1 } }
        });
        res.json({ message: "Liked" });
    }
}

/**
 * Add a comment
 */
export async function add_comment(req: Auth_Request, res: Response): Promise<void> {
    const { id: user_id } = req.user;
    const post_id = req.params.post_id as string;
    const { content } = req.body;

    if (!content) {
        res.status(400).json({ message: "Content is required!" });
        return;
    }

    const comment = await prisma.post_Comment.create({
        data: {
            user_id,
            post_id,
            content
        },
        include: {
            user: { select: { id: true, username: true, avatar_url: true } }
        }
    });

    await prisma.post.update({
        where: { id: post_id },
        data: { comment_count: { increment: 1 } }
    });

    res.json(comment);
}

/**
 * Get comments for a post
 */
export async function get_comments(req: Auth_Request, res: Response): Promise<void> {
    const post_id = req.params.post_id as string;

    const comments = await prisma.post_Comment.findMany({
        where: { post_id },
        orderBy: { created_at: 'asc' },
        include: {
            user: { select: { id: true, username: true, avatar_url: true } }
        }
    });

    res.json(comments);
}

/**
 * Delete a post (Owner only)
 */
export async function delete_post(req: Auth_Request, res: Response): Promise<void> {
    const { id: user_id } = req.user;
    const post_id = req.params.post_id as string;

    const post = await prisma.post.findUnique({ where: { id: post_id } });

    if (!post) {
        res.status(404).json({ message: "Post not found!" });
        return;
    }

    if (post.user_id !== user_id) {
        res.status(403).json({ message: "Not authorized!" });
        return;
    }

    await prisma.post.delete({ where: { id: post_id } });

    res.json({ message: "Post deleted!" });
}

/**
 * Get aggregated stats for posts (likes/comments)
 */
export async function get_post_stats(req: Auth_Request, res: Response): Promise<void> {
    const { id: user_id } = req.user;

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const [likesMonth, likesYear, commentsMonth, commentsYear] = await Promise.all([
        prisma.post_Like.count({
            where: {
                post: { user_id },
                created_at: { gte: oneMonthAgo }
            }
        }),
        prisma.post_Like.count({
            where: {
                post: { user_id },
                created_at: { gte: oneYearAgo }
            }
        }),
        prisma.post_Comment.count({
            where: {
                post: { user_id },
                created_at: { gte: oneMonthAgo }
            }
        }),
        prisma.post_Comment.count({
            where: {
                post: { user_id },
                created_at: { gte: oneYearAgo }
            }
        })
    ]);

    res.json({
        month: { likes: likesMonth, comments: commentsMonth },
        year: { likes: likesYear, comments: commentsYear }
    });
}

