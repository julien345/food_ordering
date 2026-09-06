// order.routes.ts
import { Router } from "express";
import orderController from "./order.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../../validators/order.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/my-orders", requireAuth, asyncHandler(orderController.getMyOrders.bind(orderController)));
router.post("/", requireAuth, validate(createOrderSchema), asyncHandler(orderController.create.bind(orderController)));

router.get("/", requireAuth, requireRole("ADMIN"), asyncHandler(orderController.getAll.bind(orderController)));

router.get("/:id", requireAuth, asyncHandler(orderController.getById.bind(orderController)));

router.patch(
  "/:id/status",
  requireAuth,
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateStatus.bind(orderController))
);

export default router;