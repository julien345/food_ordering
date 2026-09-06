import { apiClient } from './client';
import { User } from '../types';
import { adminApi, PaginatedUsersResponse, CreateAdminUserDto, AdminAssignableRole, normalizeUser } from './admin.api';

export * from './admin.api';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
  role: AdminAssignableRole;
  password?: string;
}

export const userApi = {
  // Endpoints sémantiques ciblés
  getClients: adminApi.getClients,
  getDeliveryAgents: adminApi.getDeliveryAgents,
  getAdmins: adminApi.getAdmins,

  getAll: async (): Promise<User[]> => {
    try {
      // Récupère les données combinées des 3 endpoints sémantiques
      const [clientsRes, deliveryRes, adminsRes] = await Promise.allSettled([
        adminApi.getClients(),
        adminApi.getDeliveryAgents(),
        adminApi.getAdmins(),
      ]);

      const users: User[] = [];
      if (clientsRes.status === 'fulfilled') users.push(...(clientsRes.value.data || []));
      if (deliveryRes.status === 'fulfilled') users.push(...(deliveryRes.value.data || []));
      if (adminsRes.status === 'fulfilled') users.push(...(adminsRes.value.data || []));

      if (users.length > 0) return users.map(normalizeUser);

      // Fallback historique sur /users ou /api/users
      const res = await apiClient.get<any>('/users');
      const data = res.data;
      if (Array.isArray(data)) return data.map(normalizeUser);
      if (data && Array.isArray(data.data)) return data.data.map(normalizeUser);
      if (data && Array.isArray(data.users)) return data.users.map(normalizeUser);
      return [];
    } catch (err) {
      console.warn('userApi.getAll fetch error:', err);
      return [];
    }
  },

  create: async (dto: CreateUserDto): Promise<User> => {
    return adminApi.createUser(dto);
  },

  updateRole: async (userId: string, role: AdminAssignableRole): Promise<User> => {
    return adminApi.updateUserRole(userId, role);
  },
};

