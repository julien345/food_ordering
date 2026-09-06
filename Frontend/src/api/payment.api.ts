import { apiClient } from './client';

export interface InitiatePaymentDto {
  orderId: string;
  method?: 'STRIPE' | string;
}

export interface InitiatePaymentResponse {
  paymentUrl: string;
  sessionId?: string;
  [key: string]: any;
}

export const paymentApi = {
  initiate: async (dto: InitiatePaymentDto): Promise<InitiatePaymentResponse> => {
    const payload = {
      orderId: dto.orderId,
      method: dto.method || 'STRIPE',
    };

    const endpoints = [
      '/api/payments/initiate',
      '/payments/initiate',
      '/api/payment/initiate',
      '/payment/initiate',
      '/api/payments/stripe',
      '/payments/stripe',
    ];

    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        const res = await apiClient.post<any>(endpoint, payload);
        const data = res.data?.data || res.data;
        const paymentUrl =
          data?.paymentUrl ||
          data?.url ||
          data?.checkoutUrl ||
          data?.sessionUrl ||
          data?.redirectUrl;

        if (paymentUrl) {
          return {
            ...data,
            paymentUrl,
          };
        }

        if (data && typeof data === 'object') {
          return {
            ...data,
            paymentUrl: data.paymentUrl || data.url || '',
          };
        }
      } catch (err: any) {
        lastError = err;
        // If not 404 (endpoint exists but failed for business logic), throw immediately
        if (err.response && err.response.status !== 404) {
          throw err;
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error("L'URL du module de paiement n'a pas pu être générée.");
  },
};
