import { Router } from "express";
import { require_auth } from "../middlewares/auth.middleware";
import { get_notifications, read_notification, read_all_notifications } from "../controllers/notification.controller";

const router = Router();

// Apply auth middleware to all notification routes
router.use(require_auth);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications and unread count
 */
router.get("/", get_notifications);

/**
 * @openapi
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success message
 */
router.put("/read-all", read_all_notifications);

/**
 * @openapi
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a single notification as read
 *     tags:
 *       - Notifications
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
 *         description: Updated notification
 */
router.put("/:id/read", read_notification);

export default router;
