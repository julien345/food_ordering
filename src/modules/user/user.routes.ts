// src/modules/user/user.routes.ts
import { Router } from "express";
import userController from "./user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createUserByAdminSchema, updateUserRoleSchema } from "../../validators/user.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(requireAuth, requireRole("ADMIN")); // toutes les routes de ce module sont ADMIN-only

router.get("/", asyncHandler(userController.getAll.bind(userController)));
router.get("/:id", asyncHandler(userController.getById.bind(userController)));
router.post("/", validate(createUserByAdminSchema), asyncHandler(userController.create.bind(userController)));
router.patch("/:id/role", validate(updateUserRoleSchema), asyncHandler(userController.updateRole.bind(userController)));
router.delete("/:id", asyncHandler(userController.remove.bind(userController)));

export default router;