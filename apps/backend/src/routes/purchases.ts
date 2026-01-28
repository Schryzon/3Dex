import { Router } from "express";
import { my_purchases } from "../controllers/purchase.controller";
import { require_auth } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /me/purchases:
 *   get:
 *     summary: Get my purchase history
 *     tags:
 *       - Purchases
 *     responses:
 *       200:
 *         description: List of purchases
 *       401:
 *         description: Unauthorized
 */
router.get("/me/purchases", require_auth, my_purchases);

export default router;
