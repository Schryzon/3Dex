import { Router } from "express";
import {
    list_users,
    update_profile,
    change_password,
    toggle_2fa,
    apply_for_role,
    get_public_profile,
    delete_account
} from "../controllers/user.controller";
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
 */
router.get("/", require_auth, require_admin, list_users);

/**
 * @openapi
 * /users/profile:
 *   patch:
 *     summary: Update current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch("/profile", require_auth, update_profile);

/**
 * @openapi
 * /users/security/password:
 *   post:
 *     summary: Change user password
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed
 */
router.post("/security/password", require_auth, change_password);

/**
 * @openapi
 * /users/security/2fa:
 *   post:
 *     summary: Toggle 2FA status
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status updated
 */
router.post("/security/2fa", require_auth, toggle_2fa);

/**
 * @openapi
 * /users/apply-role:
 *   post:
 *     summary: Apply for Artist or Provider role
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application submitted
 */
router.post("/apply-role", require_auth, apply_for_role);

/**
 * @openapi
 * /users/me:
 *   delete:
 *     summary: Permanently delete own account
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 */
router.delete("/me", require_auth, delete_account);

/**
 * @openapi
 * /users/{username}:
 *   get:
 *     summary: Get public profile
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: User profile
 */
router.get("/:username", get_public_profile);

export default router;
