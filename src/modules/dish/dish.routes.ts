import { Router } from "express";
import dishController from "./dish.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createDishSchema, updateDishSchema } from "../../validators/dish.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(dishController.getAll.bind(dishController)));
router.get("/:id", asyncHandler(dishController.getById.bind(dishController)));

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  validate(createDishSchema),
  asyncHandler(dishController.create.bind(dishController))
);
router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  validate(updateDishSchema),
  asyncHandler(dishController.update.bind(dishController))
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(dishController.remove.bind(dishController))
);

export default router;