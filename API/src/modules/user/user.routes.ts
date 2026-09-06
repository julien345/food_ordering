// src/modules/user/user.routes.ts
import { Router } from "express";
import userController from "./user.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createUserByAdminSchema, updateUserRoleSchema } from "../../validators/user.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(requireAuth, requireRole("ADMIN")); // Toutes les routes restent ADMIN-only

// 1. Liste globale (conserve le comportement query param d'origine si besoin)
router.get("/", asyncHandler(userController.getAll.bind(userController)));

// 2. Nouvelles routes dédiées et séparées par rôle (Placées AVANT la route avec paramètre :id)
router.get("/clients", asyncHandler(userController.getClients.bind(userController)));
router.get("/delivery-agents", asyncHandler(userController.getDeliveryAgents.bind(userController)));
router.get("/admins", asyncHandler(userController.getAdmins.bind(userController)));

// 3. Actions individuelles sur un utilisateur
router.get("/:id", asyncHandler(userController.getById.bind(userController)));
router.post("/", validate(createUserByAdminSchema), asyncHandler(userController.create.bind(userController)));
router.patch("/:id/role", validate(updateUserRoleSchema), asyncHandler(userController.updateRole.bind(userController)));
router.delete("/:id", asyncHandler(userController.remove.bind(userController)));

export default router;
