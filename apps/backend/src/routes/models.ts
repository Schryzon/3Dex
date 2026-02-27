import { Router } from "express";
import {
  list_models,
  upload_model,
  get_model_detail,
  download_model,
  delete_model,
  update_model,
  get_upload_signed_url
} from "../controllers/model.controller";
import { buy_model } from "../controllers/purchase.controller";

import { require_auth, optional_auth } from "../middlewares/auth.middleware";
import { require_artist } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { upload_model_schema, model_id_param } from "../validators/model.validator";
import { buy_model_schema } from "../validators/purchase.validator";

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
router.get("/", optional_auth, list_models);

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
router.get("/:id/download", require_auth, validate(model_id_param, "params"), download_model);

router.post(
  "/:id/buy",
  require_auth,
  validate(model_id_param, "params"),
  validate(buy_model_schema, "body"),
  buy_model
);

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
router.get("/:id", optional_auth, get_model_detail);

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

// PATCH /models/:id — Update model details (Artist owner or Admin)
router.patch("/:id", require_auth, update_model);

/**
 * @openapi
 * /models/upload-url:
 *   post:
 *     summary: Get presigned upload URL for GLB files (Artist only)
 *     tags:
 *       - Models
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               content_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Presigned URL and Key
 *       400:
 *         description: Invalid file type or missing fields
 */
router.post("/upload-url", require_auth, require_artist, get_upload_signed_url);

export default router;
