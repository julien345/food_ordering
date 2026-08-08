import { z } from "zod";

export const addToCartSchema = z.object({
  dishId: z.string().uuid("dishId invalide"),
  quantity: z.number().int().positive("La quantité doit être supérieure à 0").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive("La quantité doit être supérieure à 0"),
});