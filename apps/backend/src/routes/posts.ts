import { Router } from "express";
import {
    create_post,
    get_feed_posts,
    get_user_posts,
    toggle_like,
    add_comment,
    get_comments,
    delete_post,
    get_post_stats
} from "../controllers/post.controller";
import { require_auth } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               media_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created
 */
router.post("/", require_auth, create_post);

/**
 * @openapi
 * /posts/feed:
 *   get:
 *     summary: Get community feed
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/feed", require_auth, get_feed_posts);

/**
 * @openapi
 * /posts/stats:
 *   get:
 *     summary: Get engagement stats
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: Stats
 */
router.get("/stats", require_auth, get_post_stats);

/**
 * @openapi
 * /posts/user/{user_id}:
 *   get:
 *     summary: Get posts by user
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/user/:user_id", get_user_posts);

/**
 * @openapi
 * /posts/{post_id}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like toggled
 */
router.post("/:post_id/like", require_auth, toggle_like);

/**
 * @openapi
 * /posts/{post_id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 */
router.post("/:post_id/comments", require_auth, add_comment);

/**
 * @openapi
 * /posts/{post_id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:post_id/comments", get_comments);

/**
 * @openapi
 * /posts/{post_id}:
 *   delete:
 *     summary: Delete a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 */
router.delete("/:post_id", require_auth, delete_post);

export default router;
