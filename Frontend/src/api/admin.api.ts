import { apiClient } from './client';
import { User } from '../types';
import { cleanPhoneNumber } from '../utils/phone.utils';

export interface PaginatedUsersResponse {
  data: User[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
}

export type AdminAssignableRole = 'ADMIN' | 'DELIVERY_AGENT';

export interface CreateAdminUserDto {
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
  role: AdminAssignableRole;
  password?: string;
}

/**
 * Normalise un objet utilisateur pour garantir que user.phone est fidèlement conservé
 * et transmis sans être filtré ou oublié, conformément au select Prisma.
 * Les variantes erronées (user.phoneNumber, user.telephone) sont strictement supprimées.
 */
export const normalizeUser = (user: any): User => {
  if (!user || typeof user !== 'object') return user;

  // Récupère l'objet racine si encapsulé dans user ou profile
  const rawUser = user.user && typeof user.user === 'object' ? user.user : user;

  // STRICTEMENT user.phone, aucune variante phoneNumber ou telephone
  const phone =
    rawUser.phone !== undefined && rawUser.phone !== null
      ? String(rawUser.phone).trim()
      : '';

  return {
    ...rawUser,
    id: String(rawUser.id ?? user.id ?? ''),
    email: String(rawUser.email ?? user.email ?? ''),
    firstName: String(rawUser.firstName ?? user.firstName ?? ''),
    lastName: rawUser.lastName ?? user.lastName ?? '',
    phone: phone,
    role: rawUser.role ?? user.role,
  };
};

const normalizeUsersResponse = (resData: any): PaginatedUsersResponse => {
  if (!resData) {
    return { data: [] };
  }
  let rawList: any[] = [];
  let meta = resData.meta;

  // Standard shape: { data: User[], meta: any }
  if (Array.isArray(resData.data)) {
    rawList = resData.data;
  } else if (Array.isArray(resData)) {
    // Raw array shape: User[]
    rawList = resData;
    meta = { total: resData.length };
  } else if (Array.isArray(resData.users)) {
    // Fallback for { users: User[] }
    rawList = resData.users;
    meta = resData.meta || { total: resData.users.length };
  } else if (Array.isArray(resData.clients)) {
    rawList = resData.clients;
    meta = resData.meta || { total: resData.clients.length };
  } else if (Array.isArray(resData.deliveryAgents)) {
    rawList = resData.deliveryAgents;
    meta = resData.meta || { total: resData.deliveryAgents.length };
  } else if (Array.isArray(resData.admins)) {
    rawList = resData.admins;
    meta = resData.meta || { total: resData.admins.length };
  }

  return {
    data: rawList.map(normalizeUser),
    meta,
  };
};

/**
 * Exécute une requête GET vers l'endpoint spécifié en gérant les variantes de chemin (/api/... et /...)
 * ainsi que le fallback sur /api/users avec filtre par rôle.
 */
const fetchUsersEndpoint = async (
  endpoint: string,
  fallbackRole?: AdminAssignableRole | 'CLIENT'
): Promise<PaginatedUsersResponse> => {
  try {
    const res = await apiClient.get<any>(endpoint);
    const normalized = normalizeUsersResponse(res.data);
    if (normalized.data && normalized.data.length > 0) {
      return normalized;
    }
  } catch (err: any) {
    // Si l'endpoint échoue (404 ou autre), tenter avec ou sans le préfixe /api
  }

  const altEndpoint = endpoint.startsWith('/api/')
    ? endpoint.replace(/^\/api/, '')
    : `/api${endpoint}`;

  try {
    const altRes = await apiClient.get<any>(altEndpoint);
    const normalized = normalizeUsersResponse(altRes.data);
    if (normalized.data && normalized.data.length > 0) {
      return normalized;
    }
  } catch {
    // Poursuivre vers les fallbacks par rôle
  }

  // Fallback si l'API backend expose plutôt GET /api/users?role=...
  if (fallbackRole) {
    try {
      const roleRes = await apiClient.get<any>('/api/users', { params: { role: fallbackRole } });
      const normalized = normalizeUsersResponse(roleRes.data);
      if (normalized.data && normalized.data.length > 0) {
        return normalized;
      }
    } catch {
      try {
        const roleRes = await apiClient.get<any>('/users', { params: { role: fallbackRole } });
        const normalized = normalizeUsersResponse(roleRes.data);
        if (normalized.data && normalized.data.length > 0) {
          return normalized;
        }
      } catch {
        // Poursuivre
      }
    }
  }

  // Fallback global sur /api/users ou /users et filtrage par rôle si spécifié
  try {
    const globalRes = await apiClient.get<any>('/api/users');
    const normalized = normalizeUsersResponse(globalRes.data);
    if (fallbackRole && normalized.data.length > 0) {
      return {
        ...normalized,
        data: normalized.data.filter((u) => u.role === fallbackRole),
      };
    }
    return normalized;
  } catch {
    try {
      const globalRes = await apiClient.get<any>('/users');
      const normalized = normalizeUsersResponse(globalRes.data);
      if (fallbackRole && normalized.data.length > 0) {
        return {
          ...normalized,
          data: normalized.data.filter((u) => u.role === fallbackRole),
        };
      }
      return normalized;
    } catch {
      return { data: [] };
    }
  }
};

export const adminApi = {
  /**
   * GET /api/users/clients
   * Récupère la liste paginée des clients
   */
  getClients: async (): Promise<PaginatedUsersResponse> => {
    return fetchUsersEndpoint('/api/users/clients', 'CLIENT');
  },

  /**
   * GET /api/users/delivery-agents
   * Récupère la liste paginée des livreurs
   */
  getDeliveryAgents: async (): Promise<PaginatedUsersResponse> => {
    return fetchUsersEndpoint('/api/users/delivery-agents', 'DELIVERY_AGENT');
  },

  /**
   * GET /api/users/admins
   * Récupère la liste paginée des administrateurs
   */
  getAdmins: async (): Promise<PaginatedUsersResponse> => {
    return fetchUsersEndpoint('/api/users/admins', 'ADMIN');
  },

  /**
   * POST /api/users ou /users
   * Crée un compte utilisateur (rôles stricts : ADMIN ou DELIVERY_AGENT)
   */
  createUser: async (dto: CreateAdminUserDto): Promise<User> => {
    if ((dto.role as string) === 'CLIENT') {
      throw new Error("Règle métier : l'administrateur ne peut pas créer un utilisateur avec le rôle CLIENT.");
    }

    // Nettoyage automatique du format du téléphone (espaces, tirets, parenthèses, remplacement du 0 par +237)
    const cleanedPhone = cleanPhoneNumber(dto.phone);
    if (!cleanedPhone) {
      throw new Error("Le numéro de téléphone est obligatoire et doit être valide (ex: +237 690 00 00 00).");
    }
    const payload: any = {
      email: dto.email.trim(),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName ? dto.lastName.trim() : undefined,
      phone: cleanedPhone,
      role: dto.role,
    };
    if (dto.password && dto.password.trim()) {
      payload.password = dto.password.trim();
    }

    try {
      const res = await apiClient.post<any>('/api/users', payload);
      // Contrairement à la route d'inscription publique, la route admin POST /api/users
      // renvoie uniquement l'objet User brut sans aucun token { id, email, firstName, lastName, phone, role }.
      // Lecture directe de l'objet utilisateur sans chercher de propriété accessToken.
      const raw = res.data?.data || res.data;
      return normalizeUser({
        ...raw,
        phone: raw?.phone ?? cleanedPhone,
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await apiClient.post<any>('/users', payload);
        const raw = fallbackRes.data?.data || fallbackRes.data;
        return normalizeUser({
          ...raw,
          phone: raw?.phone ?? cleanedPhone,
        });
      }
      throw err;
    }
  },

  /**
   * PATCH /api/users/:id ou /users/:id
   * Met à jour le rôle d'un utilisateur (rôles stricts : ADMIN ou DELIVERY_AGENT)
   */
  updateUserRole: async (userId: string, role: AdminAssignableRole): Promise<User> => {
    if ((role as string) === 'CLIENT') {
      throw new Error("Règle métier : l'administrateur ne peut pas attribuer le rôle CLIENT.");
    }

    try {
      const res = await apiClient.patch<any>(`/api/users/${userId}`, { role });
      return res.data?.data || res.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        const fallbackRes = await apiClient.patch<any>(`/users/${userId}`, { role });
        return fallbackRes.data?.data || fallbackRes.data;
      }
      throw err;
    }
  },
};

// Exportations nommées individuelles pour flexibilité
export const getClients = adminApi.getClients;
export const getDeliveryAgents = adminApi.getDeliveryAgents;
export const getAdmins = adminApi.getAdmins;
export const createAdminUser = adminApi.createUser;
export const updateAdminUserRole = adminApi.updateUserRole;
