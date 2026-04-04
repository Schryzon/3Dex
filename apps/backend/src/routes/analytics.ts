import { Router } from "express";
import { get_artist_stats, get_provider_stats, get_public_stats } from "../controllers/analytics.controller";
import { require_auth } from "../middlewares/auth.middleware";
import { require_artist, require_provider } from "../middlewares/role.middleware";

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

/**
 * @openapi
 * /analytics/provider:
 *   get:
 *     summary: Get provider dashboard stats
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provider dashboard stats
 *       403:
 *         description: Provider only
 */
router.get("/provider", require_auth, require_provider, get_provider_stats);

router.get("/public", get_public_stats);

export default router;
