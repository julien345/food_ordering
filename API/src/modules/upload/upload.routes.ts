// src/modules/upload/upload.routes.ts
import { Router } from "express";
import uploadController from "./upload.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";
import { upload } from "../../middlewares/upload.middleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/image",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("image"), // le champ du formulaire doit s'appeler "image"
  asyncHandler(uploadController.uploadImage.bind(uploadController))
);

export default router;