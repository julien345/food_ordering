// src/validators/dish.validator.ts
import { z } from "zod";

export const createDishSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être supérieur à 0"),
  imageUrl: z.string().url("URL d'image invalide").optional(),
  categoryId: z.string().uuid("categoryId invalide"),
  isAvailable: z.boolean().optional()
});

export const updateDishSchema = createDishSchema.partial();