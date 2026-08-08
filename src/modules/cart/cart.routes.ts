// src/modules/cart/cart.routes.ts
import { Router } from "express";
import cartController from "./cart.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { addToCartSchema, updateCartItemSchema } from "../../validators/cart.validator";

const router = Router();

router.get("/", requireAuth, cartController.getCart);
router.post("/items", requireAuth, validate(addToCartSchema), cartController.addItem);
router.put("/items/:itemId", requireAuth, validate(updateCartItemSchema), cartController.updateItem);
router.delete("/items/:itemId", requireAuth, cartController.removeItem);
router.delete("/", requireAuth, cartController.clearCart);

export default router;