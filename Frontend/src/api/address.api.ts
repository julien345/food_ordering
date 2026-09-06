import { apiClient } from './client';
import { Address } from '../types';

export interface CreateAddressDto {
  label: string;
  street: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  label?: string;
  street?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export const addressApi = {
  getAll: async (): Promise<Address[]> => {
    const res = await apiClient.get<Address[]>('/addresses');
    return res.data;
  },

  getById: async (id: string): Promise<Address> => {
    const res = await apiClient.get<Address>(`/addresses/${id}`);
    return res.data;
  },

  create: async (dto: CreateAddressDto): Promise<Address> => {
    const res = await apiClient.post<Address>('/addresses', dto);
    return res.data;
  },

  update: async (id: string, dto: UpdateAddressDto): Promise<Address> => {
    const res = await apiClient.put<Address>(`/addresses/${id}`, dto);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
  },
};
