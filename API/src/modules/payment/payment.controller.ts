// src/modules/payment/payment.controller.ts
import { Request, Response } from "express";
import paymentService from "./payment.service";
import { BadRequestError } from "../../errors";

class PaymentController {
  async initiate(req: Request, res: Response) {
    const { orderId, method } = req.body;
    const result = await paymentService.initiate(orderId, req.user!.userId, method);
    return res.status(200).json(result);
  }

  async webhookStripe(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) throw new BadRequestError("Signature manquante.");
    await paymentService.handleWebhook("STRIPE", req.body, signature);
    return res.status(200).json({ received: true });
  }
}

export default new PaymentController();