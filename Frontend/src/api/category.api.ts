import { apiClient } from './client';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export type { CreateCategoryDto, UpdateCategoryDto };

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await apiClient.get<Category[] | { data: Category[] }>('/categories');
    let list: Category[] = [];
    if (Array.isArray(res.data)) {
      list = res.data;
    } else if (res.data && Array.isArray((res.data as any).data)) {
      list = (res.data as any).data;
    }
    return list.map((cat: any) => ({
      ...cat,
      image: cat.image ?? cat.imageUrl ?? null,
    }));
  },

  getById: async (id: string): Promise<Category> => {
    const res = await apiClient.get<any>(`/categories/${id}`);
    const data = res.data?.data || res.data;
    return {
      ...data,
      image: data.image ?? data.imageUrl ?? null,
    };
  },

  create: async (dto: CreateCategoryDto): Promise<Category> => {
    const payload: { name: string; image?: string } = {
      name: dto.name,
    };
    if (dto.image) {
      payload.image = dto.image;
    }
    const res = await apiClient.post<any>('/categories', payload);
    const data = res.data?.data || res.data;
    return {
      ...data,
      image: data.image ?? data.imageUrl ?? null,
    };
  },

  update: async (id: string, dto: UpdateCategoryDto): Promise<Category> => {
    const payload: { name?: string; image?: string } = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.image !== undefined) payload.image = dto.image;

    const res = await apiClient.put<any>(`/categories/${id}`, payload);
    const data = res.data?.data || res.data;
    return {
      ...data,
      image: data.image ?? data.imageUrl ?? null,
    };
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
