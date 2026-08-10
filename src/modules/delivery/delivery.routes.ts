import { Router } from "express";
import deliveryController from "./delivery.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { assignDeliverySchema } from "../../validators/delivery.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate(assignDeliverySchema),
  asyncHandler(deliveryController.assign.bind(deliveryController))
);
router.get(
  "/my-deliveries",
  requireAuth,
  requireRole("DELIVERY_AGENT"),
  asyncHandler(deliveryController.getMyDeliveries.bind(deliveryController))
);
router.patch(
  "/:id/deliver",
  requireAuth,
  requireRole("ADMIN", "DELIVERY_AGENT"),
  asyncHandler(deliveryController.markAsDelivered.bind(deliveryController))
);

export default router;