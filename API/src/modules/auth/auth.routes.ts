import { Router } from "express";
import authController from "./auth.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema,updateProfileSchema } from "../../validators/auth.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(authController.register.bind(authController)));
router.post("/login", validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post("/refresh", asyncHandler(authController.refresh.bind(authController)));
router.get("/profile", requireAuth, asyncHandler(authController.getProfile.bind(authController)));
router.patch("/profile", requireAuth, validate(updateProfileSchema), asyncHandler(authController.updateProfile.bind(authController)));
export default router;