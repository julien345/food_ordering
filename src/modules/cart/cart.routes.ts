import { Router } from "express";
import cartController from "./cart.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { addToCartSchema, updateCartItemSchema } from "../../validators/cart.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/", requireAuth, asyncHandler(cartController.getCart.bind(cartController)));
router.post("/items", requireAuth, validate(addToCartSchema), asyncHandler(cartController.addItem.bind(cartController)));
router.put("/items/:itemId", requireAuth, validate(updateCartItemSchema), asyncHandler(cartController.updateItem.bind(cartController)));
router.delete("/items/:itemId", requireAuth, asyncHandler(cartController.removeItem.bind(cartController)));
router.delete("/", requireAuth, asyncHandler(cartController.clearCart.bind(cartController)));

export default router;