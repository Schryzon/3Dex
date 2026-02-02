import { Router } from "express";
import { add_to_wishlist, get_my_wishlist, remove_from_wishlist } from "../controllers/wishlist.controller";
import { require_auth } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @openapi
 * /wishlist:
 *   get:
 *     summary: Get my wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wishlisted models
 */
router.get("/", require_auth, get_my_wishlist);

/**
 * @openapi
 * /wishlist/{model_id}:
 *   post:
 *     summary: Add to wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Added
 *       409:
 *         description: Already present
 */
router.post("/:model_id", require_auth, add_to_wishlist);

/**
 * @openapi
 * /wishlist/{model_id}:
 *   delete:
 *     summary: Remove from wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed
 */
router.delete("/:model_id", require_auth, remove_from_wishlist);

export default router;
