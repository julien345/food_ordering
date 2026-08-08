// src/modules/auth/auth.routes.ts
import { Router } from "express";
import  authController  from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../../validators/auth.validator";
import { requireAuth } from "../../middlewares/auth.middleware";
const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", requireAuth, authController.me);
export default router;
