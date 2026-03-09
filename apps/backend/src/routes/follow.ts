import { Router } from "express";
import { require_auth, optional_auth } from "../middlewares/auth.middleware";
import { follow, unfollow, list_followers, list_following, check_status } from "../controllers/follow.controller";

const router = Router();

/**
 * @openapi
 * /users/{id}/followers:
 *   get:
 *     summary: Get a user's followers
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of followers
 */
router.get("/:id/followers", list_followers);

/**
 * @openapi
 * /users/{id}/following:
 *   get:
 *     summary: Get users this user is following
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of following users
 */
router.get("/:id/following", list_following);

/**
 * @openapi
 * /users/{id}/follow-status:
 *   get:
 *     summary: Check if current user is following the target user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow status boolean
 */
router.get("/:id/follow-status", optional_auth, check_status);

/**
 * @openapi
 * /users/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully followed
 */
router.post("/:id/follow", require_auth, follow);

/**
 * @openapi
 * /users/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unfollowed
 */
router.delete("/:id/unfollow", require_auth, unfollow);

export default router;
