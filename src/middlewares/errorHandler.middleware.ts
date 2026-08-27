import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import { MulterError } from "multer";
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Le fichier dépasse la taille maximale autorisée (5 Mo)." });
    }
    return res.status(400).json({ error: "Erreur lors de l'upload du fichier." });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // erreur non prévue = bug réel, on ne l'expose pas au client
  return res.status(500).json({ error: "Erreur serveur." });

  
}

