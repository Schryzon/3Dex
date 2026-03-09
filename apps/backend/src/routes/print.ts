import { Router } from "express";
import {
    get_providers,
    create_print_order,
    manage_print_order,
    get_provider_jobs
} from "../controllers/print.controller";
import { require_auth } from "../middlewares/auth.middleware";

const router = Router();

// Public/Auth: Search providers
/**
 * @openapi
 * /print/providers:
 *   get:
 *     summary: Search for printing providers
 *     tags:
 *       - Print Service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [rating]
 *     responses:
 *       200:
 *         description: List of providers
 */
router.get("/providers", require_auth, get_providers);

// Customer: Place Order
/**
 * @openapi
 * /print/orders:
 *   post:
 *     summary: Create a print order
 *     tags:
 *       - Print Service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider_id, items, shipping_address]
 *             properties:
 *               provider_id:
 *                 type: string
 *               shipping_address:
 *                 type: object
 *               courier_name:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     model_id:
 *                       type: string
 *                     print_config:
 *                       type: object
 *     responses:
 *       201:
 *         description: Order created
 */
router.post("/orders", require_auth, create_print_order);

// Provider: Get Jobs
/**
 * @openapi
 * /print/jobs:
 *   get:
 *     summary: Get incoming print jobs (Provider)
 *     tags:
 *       - Print Service
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of print jobs
 */
router.get("/jobs", require_auth, get_provider_jobs);

// Provider: Manage Job
/**
 * @openapi
 * /print/jobs/{order_id}:
 *   patch:
 *     summary: Manage a print job (Accept, Reject, Ship)
 *     tags:
 *       - Print Service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [ACCEPT, REJECT, SHIP, COMPLETE]
 *               tracking_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated
 */
router.patch("/jobs/:order_id", require_auth, manage_print_order);

export default router;
