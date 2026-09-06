import { Router } from "express";
import analyticsController from "./analytics.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/stats", asyncHandler(analyticsController.getStats.bind(analyticsController)));

export default router;