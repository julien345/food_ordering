import { apiClient } from './client';
import { Cart } from '../types';

export interface AddToCartDto {
  dishId: string;
  quantity: number;
}

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const res = await apiClient.get<Cart>('/cart');
    return res.data;
  },

  addItem: async (dto: AddToCartDto): Promise<any> => {
    const res = await apiClient.post('/cart/items', dto);
    return res.data;
  },

  updateItem: async (itemId: string, quantity: number): Promise<any> => {
    const res = await apiClient.put(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },

  removeItem: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart');
  },
};
