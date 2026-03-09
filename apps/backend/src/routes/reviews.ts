import { Router } from "express";
import {
    create_review,
    list_reviews,
    add_user_review,
    get_user_reviews,
    get_review_stats
} from "../controllers/review.controller";
import { require_auth } from "../middlewares/auth.middleware";

const router = Router();

// Model Reviews

router.get("/model/:id/stats", get_review_stats);
router.get("/model/:id", list_reviews);
router.post("/model/:id", require_auth, create_review);

// User Reviews
/**
 * @openapi
 * /reviews/user:
 *   post:
 *     summary: Create a review for a user (Artist/Provider)
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [target_user_id, rating]
 *             properties:
 *               target_user_id:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review created
 */
router.post("/user", require_auth, add_user_review);

/**
 * @openapi
 * /reviews/user/{user_id}:
 *   get:
 *     summary: Get reviews for a user
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/user/:user_id", get_user_reviews);

export default router;
