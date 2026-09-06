import { apiClient } from './client';
import { Order, OrderStatus, PaginatedOrders } from '../types';

export interface CreateOrderDto {
  addressId: string;
}

export interface AssignDeliveryDto {
  deliveryAgentId: string;
}

export const orderApi = {
  /**
   * Retrieves the current user's orders with standard pagination { data: Order[], meta: PaginationMeta }.
   */
  getMyOrders: async (params?: { page?: number; limit?: number }): Promise<PaginatedOrders> => {
    const res = await apiClient.get<PaginatedOrders | { data: Order[]; total?: number; meta?: any } | Order[]>(
      '/orders/my-orders',
      { params }
    );
    const raw = res.data;

    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
      const data = (raw as any).data as Order[];
      const meta = (raw as any).meta || {};
      const total = Number(meta.total ?? (raw as any).total ?? data.length);
      const page = Number(meta.page ?? params?.page ?? 1);
      const limit = Number(meta.limit ?? params?.limit ?? 10);
      const totalPages = Number(meta.totalPages ?? Math.max(1, Math.ceil(total / (limit || 10))));

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    }

    if (Array.isArray(raw)) {
      return {
        data: raw,
        meta: {
          total: raw.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? raw.length ?? 10,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      meta: {
        total: 0,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        totalPages: 1,
      },
    };
  },

  getAll: async (params?: { page?: number; limit?: number }): Promise<PaginatedOrders> => {
    const res = await apiClient.get<PaginatedOrders | Order[]>('/orders', { params });
    if (Array.isArray(res.data)) {
      return {
        data: res.data,
        meta: {
          total: res.data.length,
          page: 1,
          limit: res.data.length,
          totalPages: 1,
        },
      };
    }
    return res.data;
  },

  getById: async (id: string): Promise<Order> => {
    const res = await apiClient.get<Order>(`/orders/${id}`);
    return res.data;
  },

  getByNumber: async (orderNumber: number): Promise<Order> => {
    const res = await apiClient.get<Order>(`/orders/by-number/${orderNumber}`);
    return res.data;
  },

  create: async (dto: CreateOrderDto): Promise<Order> => {
    try {
      const res = await apiClient.post<any>('/api/orders', dto);
      return res.data?.data || res.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const res = await apiClient.post<any>('/orders', dto);
        return res.data?.data || res.data;
      }
      throw err;
    }
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return res.data;
  },

  /**
   * Assigns a delivery agent to an order that is ready for delivery.
   * Tries PATCH /orders/:id/assign, with fallback support for POST /deliveries.
   */
  assignDeliveryAgent: async (id: string, deliveryAgentId: string): Promise<Order> => {
    const res = await apiClient.patch<Order>(`/orders/${id}/assign`, {
      deliveryAgentId,
      agentId: deliveryAgentId,
    });
    return res.data;
  },
};
