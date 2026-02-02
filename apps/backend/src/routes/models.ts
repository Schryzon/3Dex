import { Router } from "express";
import {
  list_models,
  upload_model,
  get_model_detail,
  download_model,
  delete_model
} from "../controllers/model.controller";
import { require_auth } from "../middlewares/auth.middleware";
import { require_artist } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { upload_model_schema, model_id_param } from "../validators/model.validator";
import { buy_model_schema } from "../validators/purchase.validator";
import { create_review, list_reviews } from "../controllers/review.controller";

const router = Router();

/**
 * @openapi
 * /models:
 *   get:
 *     summary: Get all models
 *     tags:
 *       - Models
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: integer
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: integer
 *       - in: query
 *         name: artist_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, newest, oldest]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, ALL]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of models
 */
router.get("/", list_models);

/**
 * @openapi
 * /models/{id}/download:
 *   get:
 *     summary: Download model (only if purchased)
 *     tags:
 *       - Models
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Download link
 *       403:
 *         description: Not purchased
 *       404:
 *         description: Model not found
 */
router.get("/:id/download", require_auth, validate(model_id_param), download_model);

/* NOT IMPLEMENTED YET, /:id/buy DOES NOT EXIST
router.post(
  "/:id/buy",
  require_auth,
  validate(model_id_param, "params"),
  validate(buy_model_schema, "body"),
  buy_model
);
*/

/**
 * @openapi
 * /models/{id}:
 *   get:
 *     summary: Get model detail by ID
 *     tags:
 *       - Models
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Model detail
 *       404:
 *         description: Model not found
 */
router.get("/:id", get_model_detail);

router.post("/", require_auth, require_artist, validate(upload_model_schema), upload_model);

// DELETE /models/:id
/**
 * @openapi
 * /models/{id}:
 *   delete:
 *     summary: Delete a model (Artist or Admin)
 *     tags:
 *       - Models
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
 *         description: Model deleted
 *       403:
 *         description: Forbidden
 */
router.delete("/:id", require_auth, delete_model);

// REVIEWS
// REVIEWS

/**
 * @openapi
 * /models/{id}/reviews:
 *   get:
 *     summary: List reviews for a model
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get("/:id/reviews", list_reviews);

/**
 * @openapi
 * /models/{id}/reviews:
 *   post:
 *     summary: Add a review (Purchasers only)
 *     tags:
 *       - Reviews
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
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added
 *       403:
 *         description: Not purchased
 */
router.post("/:id/reviews", require_auth, create_review);

export default router;
