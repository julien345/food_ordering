// src/validators/delivery.validator.ts
import { z } from "zod";

export const assignDeliverySchema = z.object({
  orderId: z.string().uuid("orderId invalide"),
  agentId: z.string().uuid("agentId invalide"),
});