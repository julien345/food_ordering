// src/modules/category/category.routes.ts
import { Router } from "express";
import categoryController from "./category.controller"; // <-- sans accolades
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createCategorySchema, updateCategorySchema } from "../../validators/category.validator";

const router = Router();

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

router.post("/", requireAuth, requireRole("ADMIN"), validate(createCategorySchema), categoryController.create);
router.put("/:id", requireAuth, requireRole("ADMIN"), validate(updateCategorySchema), categoryController.update);
router.delete("/:id", requireAuth, requireRole("ADMIN"), categoryController.remove);

export default router;