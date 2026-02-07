import { Router } from "express";
import { initiate_checkout, midtrans_notification } from "../controllers/order.controller";
import { require_auth } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /orders/checkout:
 *   post:
 *     summary: Initiate an order with Midtrans Snap
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Snap Token Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 redirect_url:
 *                   type: string
 */
router.post("/checkout", require_auth, initiate_checkout);

/**
 * @openapi
 * /orders/notification:
 *   post:
 *     summary: Midtrans Webhook Endpoint
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: OK
 */
router.post("/notification", midtrans_notification);

export default router;
