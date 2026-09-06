import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().min(2, "Le label doit contenir au moins 2 caractères"),
  street: z.string().min(3, "La rue doit contenir au moins 3 caractères"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();