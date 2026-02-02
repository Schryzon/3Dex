import { Router } from "express";
import { initiate_checkout, confirm_payment } from "../controllers/payment.controller";
import { require_auth } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /payments/checkout:
 *   post:
 *     summary: Initiate a mock checkout
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initiated
 */
router.post("/checkout", require_auth, initiate_checkout);

/**
 * @openapi
 * /payments/confirm:
 *   post:
 *     summary: Confirm a mock payment
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model_id:
 *                 type: string
 *               transaction_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment successful
 */
router.post("/confirm", require_auth, confirm_payment);

export default router;
