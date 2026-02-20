import { Router } from "express";
import {
    list_cart,
    add_to_cart,
    update_cart_item,
    remove_from_cart,
    clear_cart,
} from "../controllers/cart.controller";
import { require_auth, Auth_Request } from "../middlewares/auth.middleware";

const router = Router();

// All cart routes require authentication
router.use(require_auth as any);

// GET /cart — List cart items
router.get("/", list_cart as any);

// POST /cart/add — Add item to cart
router.post("/add", add_to_cart as any);

// PATCH /cart/:id — Update cart item quantity
router.patch("/:id", update_cart_item as any);

// DELETE /cart/clear — Clear entire cart (must be before /:id)
router.delete("/clear", clear_cart as any);

// DELETE /cart/:id — Remove specific item
router.delete("/:id", remove_from_cart as any);

export default router;
