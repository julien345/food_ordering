// src/validators/category.validator.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  imageUrl: z.string().url("URL d'image invalide").optional(),
});

export const updateCategorySchema = createCategorySchema.partial();