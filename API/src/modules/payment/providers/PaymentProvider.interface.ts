// src/modules/payment/providers/PaymentProvider.interface.ts
export interface PaymentItem {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface InitiatePaymentParams {
  orderId: string;
  currency: string;
  items: PaymentItem[];
}

export interface InitiatePaymentResult {
  paymentUrl: string;
  providerReference: string;
}

export interface WebhookResult {
  providerReference: string;
  status: "SUCCESS" | "FAILED";
}

export interface PaymentProvider {
  initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult>;
  constructWebhookEvent(rawBody: Buffer, signature: string): any;
  extractWebhookResult(event: any): WebhookResult | null;
}