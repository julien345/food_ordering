import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().min(2, "Le label doit contenir au moins 2 caractères"),
  street: z.string().min(3, "La rue doit contenir au moins 3 caractères"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  latitude: z.number("La latitude doit être un nombre").optional(),
  longitude: z.number("La longitude doit être un nombre").optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;