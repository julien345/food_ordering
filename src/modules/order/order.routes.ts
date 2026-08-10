// src/modules/order/order.routes.ts
import { Router } from "express";
import orderController from "./order.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../../validators/order.validator";

const router = Router();

// Client : ses propres commandes
router.get("/my-orders", requireAuth, orderController.getMyOrders);
router.post("/", requireAuth, validate(createOrderSchema), orderController.create);

// Admin : toutes les commandes
router.get("/", requireAuth, requireRole("ADMIN"), orderController.getAll);

// Accessible à tous les connectés (le service vérifie ownership pour les clients)
router.get("/:id", requireAuth, orderController.getById);

// Transition de statut : ouvert à CLIENT/ADMIN/DELIVERY_AGENT, le service filtre selon la transition précise
router.patch("/:id/status", requireAuth, validate(updateOrderStatusSchema), orderController.updateStatus);

export default router;