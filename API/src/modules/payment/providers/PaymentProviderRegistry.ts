// src/modules/payment/providers/PaymentProviderRegistry.ts
import { PaymentProvider } from "./PaymentProvider.interface";
import stripeProvider from "./StripeProvider";
import { PaymentMethod } from "../../../generated/prisma/client";

const providers: Partial<Record<PaymentMethod, PaymentProvider>> = {
  STRIPE: stripeProvider,
  // MTN_MOMO / ORANGE_MONEY : non implémentés pour l'instant, hors scope du projet
};

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = providers[method];
  if (!provider) {
    throw new Error(`Aucun fournisseur de paiement configuré pour la méthode : ${method}`);
  }
  return provider;
}