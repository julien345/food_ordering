export type UserRole = 'CLIENT' | 'ADMIN' | 'DELIVERY_AGENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
  role: UserRole;
}

export interface CreateUserByAdminInput {
  email: string;
  firstName: string;
  lastName?: string;
  phone: string;
  role: AdminAssignableRole | UserRole;
  password?: string;
}

export type AdminAssignableRole = 'ADMIN' | 'DELIVERY_AGENT';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  image?: string | null;
  createdAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  image?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  image?: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  image?: string | null;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
}

export interface PaginatedDishes {
  data: Dish[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  userId?: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  dishId: string;
  dish: Dish;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  dishNameSnapshot: string;
  dishImageUrlSnapshot: string | null;
  dishId: string;
  dish?: Dish;
}

export interface Delivery {
  id: string;
  orderId: string;
  agentId: string;
  agent?: User;
  order?: Order;
  deliveredAt?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddressSnapshot: string;
  userId: string;
  addressId: string;
  items: OrderItem[];
  payment?: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  } | null;
  delivery?: Delivery | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedOrders {
  data: Order[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

export interface TopDishStat {
  dishId: string;
  name: string;
  image?: string | null;
  totalQuantitySold: number;
}

export interface DashboardStats {
  totalRevenue: number;
  averageOrderValue: number;
  orderCountsByStatus: {
    PENDING: number;
    CONFIRMED: number;
    PREPARING: number;
    READY_FOR_DELIVERY: number;
    OUT_FOR_DELIVERY: number;
    READY: number;
    DELIVERED: number;
    CANCELLED: number;
    [key: string]: number;
  };
  topDishes: TopDishStat[];
  newClientsLast30Days: number;
}
