import { apiClient } from './client';
import { Delivery } from '../types';

export interface AssignDeliveryDto {
  orderId: string;
  agentId: string;
}

export interface PaginatedDeliveries {
  data: Delivery[];
  meta?: any;
}

export const deliveryApi = {
  assign: async (dto: AssignDeliveryDto): Promise<Delivery> => {
    const res = await apiClient.post<Delivery>('/deliveries', dto);
    return res.data;
  },

  /**
   * Retrieves deliveries assigned to the current delivery agent.
   * Handles both direct array Delivery[] and wrapped pagination object { data: Delivery[], meta: any }.
   */
  getMyDeliveries: async (): Promise<Delivery[]> => {
    const res = await apiClient.get<Delivery[] | PaginatedDeliveries | { data: Delivery[] }>('/deliveries/my-deliveries');
    if (Array.isArray(res.data)) {
      return res.data;
    }
    if (res.data && Array.isArray((res.data as any).data)) {
      return (res.data as any).data;
    }
    return [];
  },

  markAsDelivered: async (deliveryId: string): Promise<Delivery> => {
    const res = await apiClient.patch<Delivery>(`/deliveries/${deliveryId}/deliver`);
    return res.data;
  },
};
