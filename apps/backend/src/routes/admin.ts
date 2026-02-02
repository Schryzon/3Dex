import { Router } from "express";
import { approve_model, list_pending_models, reject_model } from "../controllers/admin.controller";
import { require_auth } from "../middlewares/auth.middleware";
import { require_admin } from "../middlewares/role.middleware";

const router = Router();

// Retrieve pending models
/**
 * @openapi
 * /admin/pending:
 *   get:
 *     summary: List all pending models
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending models
 *       403:
 *         description: Admin access required
 */
router.get("/pending", require_auth, require_admin, list_pending_models);

// Approve a model
/**
 * @openapi
 * /admin/{id}/approve:
 *   post:
 *     summary: Approve a model
 *     tags:
 *       - Admin
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
 *         description: Model approved
 *       404:
 *         description: Model not found
 */
router.post("/:id/approve", require_auth, require_admin, approve_model);

// Reject a model
/**
 * @openapi
 * /admin/{id}/reject:
 *   post:
 *     summary: Reject a model
 *     tags:
 *       - Admin
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
 *         description: Model rejected
 *       404:
 *         description: Model not found
 */
router.post("/:id/reject", require_auth, require_admin, reject_model);

export default router;
