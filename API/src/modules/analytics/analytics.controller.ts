import { Request, Response } from "express";
import analyticsService from "./analytics.service";

class AnalyticsController {
  async getStats(req: Request, res: Response) {
    const stats = await analyticsService.getStats();
    return res.status(200).json(stats);
  }
}

export default new AnalyticsController();