import { apiClient } from './client';
import { AuthResponse, User } from '../types';
import { cleanPhoneNumber } from '../utils/phone.utils';
import { normalizeUser } from './admin.api';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const authApi = {
  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const cleanedPhone = cleanPhoneNumber(dto.phone);
    const payload = {
      ...dto,
      phone: cleanedPhone,
    };
    try {
      const res = await apiClient.post<any>('/api/auth/register', payload);
      const data = res.data?.data || res.data;
      return {
        ...data,
        user: normalizeUser(data.user || data),
      };
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await apiClient.post<any>('/auth/register', payload);
        const data = fallbackRes.data?.data || fallbackRes.data;
        return {
          ...data,
          user: normalizeUser(data.user || data),
        };
      }
      throw err;
    }
  },

  login: async (dto: LoginDto): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<any>('/api/auth/login', dto);
      const data = res.data?.data || res.data;
      return {
        ...data,
        user: normalizeUser(data.user || data),
      };
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await apiClient.post<any>('/auth/login', dto);
        const data = fallbackRes.data?.data || fallbackRes.data;
        return {
          ...data,
          user: normalizeUser(data.user || data),
        };
      }
      throw err;
    }
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
      const res = await apiClient.post<any>('/api/auth/refresh', {
        refreshToken,
      });
      return res.data?.data || res.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await apiClient.post<any>('/auth/refresh', {
          refreshToken,
        });
        return fallbackRes.data?.data || fallbackRes.data;
      }
      throw err;
    }
  },

  /**
   * Récupère le profil de l'utilisateur connecté via GET /api/auth/profile
   */
  getProfile: async (): Promise<User> => {
    try {
      const res = await apiClient.get<any>('/api/auth/profile');
      const data = res.data?.data || res.data;
      return normalizeUser(data.user || data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await apiClient.get<any>('/auth/profile');
        const data = fallbackRes.data?.data || fallbackRes.data;
        return normalizeUser(data.user || data);
      }
      throw err;
    }
  },

  /** Alias pour compatibilité */
  getMe: async (): Promise<User> => {
    return authApi.getProfile();
  },

  /**
   * Met à jour le profil de l'utilisateur connecté via PATCH /api/auth/profile
   */
  updateProfile: async (dto: UpdateProfileDto): Promise<User> => {
    const cleanedPhone = cleanPhoneNumber(dto.phone);
    const payload = {
      ...dto,
      phone: cleanedPhone,
    };
    try {
      const res = await apiClient.patch<any>('/api/auth/profile', payload);
      const data = res.data?.data || res.data;
      return normalizeUser(data.user || data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        try {
          const fallbackRes = await apiClient.patch<any>('/auth/profile', payload);
          const data = fallbackRes.data?.data || fallbackRes.data;
          return normalizeUser(data.user || data);
        } catch (patchErr: any) {
          if (patchErr.response?.status === 404 || patchErr.response?.status === 405) {
            const putRes = await apiClient.put<any>('/api/auth/profile', payload);
            const data = putRes.data?.data || putRes.data;
            return normalizeUser(data.user || data);
          }
          throw patchErr;
        }
      }
      throw err;
    }
  },

  /** Alias pour compatibilité */
  updateMe: async (dto: UpdateProfileDto): Promise<User> => {
    return authApi.updateProfile(dto);
  },
};

