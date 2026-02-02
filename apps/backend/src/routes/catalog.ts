import { Router } from "express";
import { list_categories, list_tags } from "../controllers/catalog.controller";

const router = Router();

/**
 * @openapi
 * /catalog/categories:
 *   get:
 *     summary: List all categories
 *     tags:
 *       - Catalog
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/categories", list_categories);

/**
 * @openapi
 * /catalog/tags:
 *   get:
 *     summary: List all tags
 *     tags:
 *       - Catalog
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get("/tags", list_tags);

export default router;
