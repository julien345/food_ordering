// src/modules/address/address.routes.ts
import { Router } from "express";
import addressController from "./address.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createAddressSchema, updateAddressSchema } from "../../validators/address.validator";

const router = Router();

// Toutes les routes nécessitent d'être connecté — pas de rôle spécifique requis
router.get("/", requireAuth, addressController.getAll);
router.get("/:id", requireAuth, addressController.getById);
router.post("/", requireAuth, validate(createAddressSchema), addressController.create);
router.put("/:id", requireAuth, validate(updateAddressSchema), addressController.update);
router.delete("/:id", requireAuth, addressController.remove);

export default router;