// src/validators/order.validator.ts
import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid("addressId invalide"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_DELIVERY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]),
});