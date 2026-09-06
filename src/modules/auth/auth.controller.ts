import { Request, Response } from "express";
import authService from "./auth.service";
import { BadRequestError } from "../../errors";

class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new BadRequestError("refreshToken requis.");

    const result = await authService.refresh(refreshToken);
    return res.status(200).json(result);
  }

  async me(req: Request, res: Response) {
    const profile = await authService.getProfile(req.user!.userId);
    return res.status(200).json(profile);
  }
}

export default new AuthController();