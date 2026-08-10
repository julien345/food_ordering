// src/modules/delivery/delivery.routes.ts
import { Router } from "express";
import deliveryController from "./delivery.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { assignDeliverySchema } from "../../validators/delivery.validator";

const router = Router();

router.post("/", requireAuth, requireRole("ADMIN"), validate(assignDeliverySchema), deliveryController.assign);
router.get("/my-deliveries", requireAuth, requireRole("DELIVERY_AGENT"), deliveryController.getMyDeliveries);
router.patch("/:id/deliver", requireAuth, requireRole("ADMIN", "DELIVERY_AGENT"), deliveryController.markAsDelivered);

export default router;