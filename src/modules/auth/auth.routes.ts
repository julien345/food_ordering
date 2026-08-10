import { Router } from "express";
import authController from "./auth.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../../validators/auth.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(authController.register.bind(authController)));
router.post("/login", validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post("/refresh", asyncHandler(authController.refresh.bind(authController)));
router.get("/me", requireAuth, asyncHandler(authController.me.bind(authController)));

export default router;