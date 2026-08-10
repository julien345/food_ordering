import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // erreur non prévue = bug réel, on ne l'expose pas au client
  return res.status(500).json({ error: "Erreur serveur." });
}