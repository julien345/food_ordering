// src/middlewares/upload.middleware.ts
import multer from "multer";
import { BadRequestError } from "../errors";

const storage = multer.memoryStorage(); // buffer en RAM, jamais écrit sur disque

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new BadRequestError("Seuls les fichiers JPEG, PNG et WebP sont acceptés."));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
});