import { Router } from "express";
import {
    approve_model,
    list_pending_models,
    reject_model,
    list_users_by_status,
    approve_user,
    reject_user,
    trigger_stats_aggregation,
    get_dashboard_summary,
    get_audit_logs
} from "../controllers/admin.controller";
import {
    get_reports,
    dismiss_report,
    delete_reported_content
} from "../controllers/report.controller";
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

// User Approval Routes
/**
 * @openapi
 * /admin/users/status:
 *   get:
 *     summary: List users by account status
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users/status", require_auth, require_admin, list_users_by_status);

/**
 * @openapi
 * /admin/users/{id}/approve:
 *   post:
 *     summary: Approve a user application
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
 *         description: User approved
 */
router.post("/users/:id/approve", require_auth, require_admin, approve_user);

/**
 * @openapi
 * /admin/users/{id}/reject:
 *   post:
 *     summary: Reject a user application
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User rejected
 */
router.post("/users/:id/reject", require_auth, require_admin, reject_user);

// Stats Trigger
/**
 * @openapi
 * /admin/stats/trigger:
 *   post:
 *     summary: Trigger stats aggregation
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats aggregated
 */
router.post("/stats/trigger", require_auth, require_admin, trigger_stats_aggregation);

/**
 * @openapi
 * /admin/summary:
 *   get:
 *     summary: Get dashboard summary for admin
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary
 */
router.get("/summary", require_auth, require_admin, get_dashboard_summary);

// Report Management
/**
 * @openapi
 * /admin/reports:
 *   get:
 *     summary: Get aggregated reports
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of aggregated reports
 */
router.get("/reports", require_auth, require_admin, get_reports);

/**
 * @openapi
 * /admin/reports/{id}/dismiss:
 *   post:
 *     summary: Dismiss all reports for a specific target id
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
 *         description: Reports dismissed
 */
router.post("/reports/:id/dismiss", require_auth, require_admin, dismiss_report);

/**
 * @openapi
 * /admin/reports/{type}/{id}/delete:
 *   delete:
 *     summary: Delete reported content and mark reports as reviewed
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [MODEL, POST, COMMENT]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content deleted
 */
router.delete("/reports/:type/:id/delete", require_auth, require_admin, delete_reported_content);

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     summary: Get admin audit logs (paginated)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [DELETE_MODEL, DELETE_POST, DELETE_COMMENT, BAN_USER, REJECT_MODEL]
 *       - in: query
 *         name: admin_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Paginated audit logs
 */
router.get("/audit-logs", require_auth, require_admin, get_audit_logs);

export default router;
