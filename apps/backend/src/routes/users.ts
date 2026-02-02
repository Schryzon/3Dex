import { Router } from "express";
import { list_users } from "../controllers/user.controller";
import { require_auth } from "../middlewares/auth.middleware";
import { require_admin } from "../middlewares/role.middleware";

const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Admin access required
 */
router.get("/", require_auth, require_admin, list_users);

export default router;
