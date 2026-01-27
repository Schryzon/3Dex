import { Router } from "express";
import {
  list_models,
  upload_model,
  get_model_detail,
} from "../controllers/model.controller";
import { require_auth } from "../middlewares/auth.middleware";
import { require_artist } from "../middlewares/role.middleware";

const router = Router();

/**
 * @openapi
 * /models:
 *   get:
 *     summary: Get all models
 *     tags:
 *       - Models
 *     responses:
 *       200:
 *         description: List of models
 */
router.get("/", list_models);

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

router.post("/", require_auth, require_artist, upload_model);

export default router;
