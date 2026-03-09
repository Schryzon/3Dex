import { Router } from "express";
import { create_report } from "../controllers/report.controller";
import { require_auth } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /reports:
 *   post:
 *     summary: Report content
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [target_type, reason]
 *             properties:
 *               target_type:
 *                 type: string
 *                 enum: [MODEL, POST, COMMENT]
 *               model_id:
 *                 type: string
 *               post_id:
 *                 type: string
 *               comment_id:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Report submitted
 */
router.post("/", require_auth, create_report);

export default router;
