import { Router } from "express";
import { get_artist_stats } from "../controllers/analytics.controller";
import { require_auth } from "../middlewares/auth.middleware";
import { require_artist } from "../middlewares/role.middleware";

const router = Router();

/**
 * @openapi
 * /analytics/artist:
 *   get:
 *     summary: Get artist dashboard stats
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *       403:
 *         description: Artist only
 */
router.get("/artist", require_auth, require_artist, get_artist_stats);

export default router;
