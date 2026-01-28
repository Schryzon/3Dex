import { Router } from "express";
import {
  list_models,
  upload_model,
  get_model_detail,
  download_model
} from "../controllers/model.controller";
import { require_auth } from "../middlewares/auth.middleware";
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

export default router;
