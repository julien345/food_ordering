// src/modules/payment/providers/StripeProvider.ts
import Stripe from "stripe";
import { PaymentProvider, InitiatePaymentParams, InitiatePaymentResult, WebhookResult } from "./PaymentProvider.interface";

const ZERO_DECIMAL_CURRENCIES = ["xaf", "xof", "jpy", "krw", "vnd"];

class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  private toStripeAmount(amount: number, currency: string): number {
    return ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase())
      ? Math.round(amount)
      : Math.round(amount * 100);
  }

  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const lineItems = params.items.map((item) => ({
      price_data: {
        currency: params.currency,
        product_data: { name: item.name },
        unit_amount: this.toStripeAmount(item.unitPrice, params.currency),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: { orderId: params.orderId },
      success_url: `${process.env.FRONTEND_URL}/orders/${params.orderId}?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/orders/${params.orderId}?payment=cancelled`,
    });

    return {
      paymentUrl: session.url!,
      providerReference: session.id,
    };
  }

  constructWebhookEvent(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  }

  extractWebhookResult(event: Stripe.Event): WebhookResult | null {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      return { providerReference: session.id, status: "SUCCESS" };
    }
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      return { providerReference: session.id, status: "FAILED" };
    }
    return null;
  }
}

export default new StripeProvider();