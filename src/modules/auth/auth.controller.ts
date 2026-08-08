// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import  authService  from "./auth.service";

 class AuthController {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      if (err.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(409).json({ error: "Cet email est déjà utilisé." });
      }
      if (err.message === "PHONE_ALREADY_EXISTS") {
        return res.status(409).json({ error: "Ce numéro de téléphone est déjà utilisé." });
      }
      console.error("REGISTER ERROR:", err);
      return res.status(500).json({ error: "Erreur serveur." });
    }
  };

  async login(req: Request, res: Response) {
    try {
      const data = req.body;
      const result = await authService.login(data);
      return res.status(200).json(result);
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ error: "Email ou mot de passe incorrect." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  };

  async refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken requis." });
    }
    const result = await authService.refresh(refreshToken);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("REFRESH ERROR:", err);
    if (err.message === "INVALID_REFRESH_TOKEN") {
      return res.status(401).json({ error: "Refresh token invalide ou expiré." });
    }
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
async me(req: Request, res: Response) {
    try {
      const profile = await authService.getProfile(req.user!.userId);
      return res.status(200).json(profile);
    } catch (err: any) {
      if (err.message === "USER_NOT_FOUND") {
        return res.status(404).json({ error: "Utilisateur introuvable." });
      }
      return res.status(500).json({ error: "Erreur serveur." });
    }
  };
};

export  default new AuthController();