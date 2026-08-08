// src/modules/dish/dish.routes.ts
import { Router } from "express";
import dishController from "./dish.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createDishSchema, updateDishSchema } from "../../validators/dish.validator";

const router = Router();

router.get("/", dishController.getAll);
router.get("/:id", dishController.getById);

router.post("/", requireAuth, requireRole("ADMIN"), validate(createDishSchema), dishController.create);
router.put("/:id", requireAuth, requireRole("ADMIN"), validate(updateDishSchema), dishController.update);
router.delete("/:id", requireAuth, requireRole("ADMIN"), dishController.remove);

export default router;