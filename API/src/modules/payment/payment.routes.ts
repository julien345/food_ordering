// src/modules/payment/payment.routes.ts
import { Router } from "express";
import paymentController from "./payment.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { initiatePaymentSchema } from "../../validators/payment.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/initiate",
  requireAuth,
  validate(initiatePaymentSchema),
  asyncHandler(paymentController.initiate.bind(paymentController))
);

export default router;