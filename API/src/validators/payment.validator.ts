// src/validators/payment.validator.ts
import { z } from "zod";

export const initiatePaymentSchema = z.object({
  orderId: z.string().uuid("orderId invalide"),
  method: z.enum(["STRIPE"]), // seule méthode active pour l'instant
});