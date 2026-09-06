import { apiClient } from './client';
import { Dish, PaginatedDishes } from '../types';
import { uploadApi } from './upload.api';

export interface CreateDishDto {
  name: string;
  description?: string;
  price: number;
  image?: string;
  imageUrl?: string;
  categoryId: string;
  isAvailable?: boolean;
}

export interface UpdateDishDto {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  imageUrl?: string;
  categoryId?: string;
  isAvailable?: boolean;
}

export const dishApi = {
  /**
   * Retrieves dishes with standard wrapped pagination { data: Dish[], meta: any }.
   */
  getAll: async (params?: { page?: number; limit?: number; categoryId?: string }): Promise<PaginatedDishes> => {
    const res = await apiClient.get<PaginatedDishes | { data: Dish[]; meta?: any; total?: number } | Dish[]>(
      '/dishes',
      { params }
    );
    const raw = res.data;

    let data: Dish[] = [];
    let meta = {
      total: 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
      totalPages: 1,
    };

    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
      data = (raw as any).data;
      const rawMeta = (raw as any).meta || {};
      const total = Number(rawMeta.total ?? (raw as any).total ?? data.length);
      const limit = Number(rawMeta.limit ?? params?.limit ?? data.length ?? 100);
      const page = Number(rawMeta.page ?? params?.page ?? 1);
      const totalPages = Number(rawMeta.totalPages ?? Math.max(1, Math.ceil(total / (limit || 100))));
      meta = { total, page, limit, totalPages };
    } else if (Array.isArray(raw)) {
      data = raw;
      meta.total = raw.length;
      meta.limit = params?.limit ?? raw.length;
      meta.totalPages = 1;
    }

    // Normalise imageUrl / image pour chaque plat
    const normalizedData: Dish[] = data.map((d: any) => ({
      ...d,
      imageUrl: d.imageUrl || d.image || null,
      image: d.image || d.imageUrl || null,
    }));

    return {
      data: normalizedData,
      meta,
    };
  },

  getById: async (id: string): Promise<Dish> => {
    const res = await apiClient.get<Dish>(`/dishes/${id}`);
    return res.data;
  },

  create: async (dto: CreateDishDto): Promise<Dish> => {
    const imageVal = (dto.image || dto.imageUrl || '').trim();
    const payload: any = {
      name: dto.name.trim(),
      price: Number(dto.price),
      categoryId: dto.categoryId,
      isAvailable: dto.isAvailable ?? true,
    };
    if (dto.description && dto.description.trim()) {
      payload.description = dto.description.trim();
    }
    if (imageVal) {
      payload.image = imageVal;
      payload.imageUrl = imageVal;
    }

    let res;
    try {
      res = await apiClient.post<any>('/dishes', payload);
    } catch (err: any) {
      if (err.response?.status === 404) {
        res = await apiClient.post<any>('/api/dishes', payload);
      } else {
        throw err;
      }
    }

    const raw = res.data?.data || res.data;
    const returnedImg = raw?.image || raw?.imageUrl || imageVal;
    return {
      ...raw,
      image: returnedImg,
      imageUrl: returnedImg,
    };
  },

  update: async (id: string, dto: UpdateDishDto): Promise<Dish> => {
    const imageVal = (dto.image || dto.imageUrl || '').trim();
    const payload: any = {
      ...dto,
    };
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.price !== undefined) payload.price = Number(dto.price);
    if (dto.description !== undefined) {
      payload.description = dto.description.trim();
    }
    if (imageVal) {
      payload.image = imageVal;
      payload.imageUrl = imageVal;
    }

    let res;
    try {
      res = await apiClient.put<any>(`/dishes/${id}`, payload);
    } catch (err: any) {
      if (err.response?.status === 404) {
        res = await apiClient.put<any>(`/api/dishes/${id}`, payload);
      } else {
        throw err;
      }
    }

    const raw = res.data?.data || res.data;
    const returnedImg = raw?.image || raw?.imageUrl || imageVal;
    return {
      ...raw,
      image: returnedImg,
      imageUrl: returnedImg,
    };
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/dishes/${id}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        await apiClient.delete(`/api/dishes/${id}`);
      } else {
        throw err;
      }
    }
  },

  /**
   * Uploads an image file to the backend delegating to uploadApi
   */
  uploadImage: async (file: File): Promise<{ image: string; url: string }> => {
    const res = await uploadApi.uploadImage(file);
    return {
      image: res.image,
      url: res.url,
    };
  },
};
