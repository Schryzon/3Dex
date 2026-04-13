import { Router } from "express";
import {
    get_tagline,
    get_picks,
    toggle_dexie,
} from "../controllers/dexie.controller";
import { require_auth, optional_auth } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /dexie/tagline:
 *   get:
 *     summary: Get Dēxie's current situational message
 *     tags:
 *       - Dexie
 */
router.get("/tagline", optional_auth, get_tagline);

/**
 * @openapi
 * /dexie/picks:
 *   get:
 *     summary: Get Dēxie's personalised recommendations
 *     tags:
 *       - Dexie
 */
router.get("/picks", optional_auth, get_picks);

/**
 * @openapi
 * /dexie/toggle:
 *   patch:
 *     summary: Enable or disable Dēxie
 *     tags:
 *       - Dexie
 *     security:
 *       - bearerAuth: []
 */
router.patch("/toggle", require_auth, toggle_dexie);

export default router;
