// address.routes.ts
import { Router } from "express";
import addressController from "./address.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { createAddressSchema, updateAddressSchema } from "../../validators/address.validator";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/", requireAuth, asyncHandler(addressController.getAll.bind(addressController)));
router.get("/:id", requireAuth, asyncHandler(addressController.getById.bind(addressController)));
router.post("/", requireAuth, validate(createAddressSchema), asyncHandler(addressController.create.bind(addressController)));
router.put("/:id", requireAuth, validate(updateAddressSchema), asyncHandler(addressController.update.bind(addressController)));
router.delete("/:id", requireAuth, asyncHandler(addressController.remove.bind(addressController)));

export default router;