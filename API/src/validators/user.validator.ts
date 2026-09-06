// src/validators/user.validator.ts
import { z } from "zod";

export const createUserByAdminSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, "Le mot de passe doit contenir au moins une lettre et un chiffre"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Format de numéro de téléphone international invalide")
    .optional(),
  role: z.enum(["ADMIN", "DELIVERY_AGENT"]),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "DELIVERY_AGENT"]),
});

export type CreateUserByAdminInput = z.infer<typeof createUserByAdminSchema>;