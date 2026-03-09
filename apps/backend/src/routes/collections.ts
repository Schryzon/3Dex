import { Router } from "express";
import { require_auth, optional_auth } from "../middlewares/auth.middleware";
import * as collectionController from "../controllers/collection.controller";

const router = Router();

/**
 * @openapi
 * /collections/my:
 *   get:
 *     summary: Get current authenticated user's collections
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 */
router.get("/my", require_auth, collectionController.get_my_collections);

/**
 * @openapi
 * /collections/user/{userId}:
 *   get:
 *     summary: Get a specific user's public collections
 *     tags:
 *       - Collections
 */
router.get("/user/:userId", collectionController.get_user_public_collections);

/**
 * @openapi
 * /collections/{id}:
 *   get:
 *     summary: Get collection details
 *     tags:
 *       - Collections
 */
router.get("/:id", optional_auth, collectionController.get_collection);

/**
 * @openapi
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 */
router.post("/", require_auth, collectionController.create_collection);

/**
 * @openapi
 * /collections/{id}:
 *   put:
 *     summary: Update a collection
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", require_auth, collectionController.update_collection);

/**
 * @openapi
 * /collections/{id}:
 *   delete:
 *     summary: Delete a collection
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", require_auth, collectionController.delete_collection);

/**
 * @openapi
 * /collections/{id}/items:
 *   post:
 *     summary: Add model to collection
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 */
router.post("/:id/items", require_auth, collectionController.add_item);

/**
 * @openapi
 * /collections/{id}/items/{modelId}:
 *   delete:
 *     summary: Remove model from collection
 *     tags:
 *       - Collections
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id/items/:modelId", require_auth, collectionController.remove_item);

export default router;
