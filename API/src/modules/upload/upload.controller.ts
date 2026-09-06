// src/modules/upload/upload.controller.ts
import { Request, Response } from "express";
import uploadService from "./upload.service";
import { BadRequestError } from "../../errors";

class UploadController {
  async uploadImage(req: Request, res: Response) {
    console.log("req.file:", req.file); // <-- temporaire
    console.log("req.body:", req.body); // <-- temporaire
    console.log("Content-Type reçu:", req.headers["content-type"]); // <-- temporaire
    if (!req.file) throw new BadRequestError("Aucun fichier fourni.");

    const folder = "julien-food"; // dossier Cloudinary, organise tes assets
    const url = await uploadService.uploadImage(req.file.buffer, folder);

    return res.status(200).json({ url });
  }
}

export default new UploadController();