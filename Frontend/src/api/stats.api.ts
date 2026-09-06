import { apiClient } from './client';
import { DashboardStats, Order, Dish, User, TopDishStat } from '../types';

export const statsApi = {
  /**
   * Récupère les statistiques depuis l'API backend.
   * Route principale : GET /analytics/stats (avec fallback /api/analytics/stats)
   */
  getStats: async (): Promise<DashboardStats | null> => {
    // La route officielle du backend est GET /analytics/stats
    const endpoints = [
      '/analytics/stats',
      '/api/analytics/stats',
      '/analytics',
      '/api/analytics',
      '/stats',
      '/api/stats',
    ];

    for (const url of endpoints) {
      try {
        const res = await apiClient.get<any>(url);
        const data = res.data?.data || res.data;

        if (data && typeof data === 'object') {
          const rawStatus =
            data.orderCountsByStatus ||
            data.ordersByStatus ||
            data.statusCounts ||
            data.countsByStatus ||
            {};

          const rawTopDishes =
            data.topDishes ||
            data.topSellingDishes ||
            data.popularDishes ||
            data.bestSellers ||
            [];

          const topDishes: TopDishStat[] = Array.isArray(rawTopDishes)
            ? rawTopDishes.map((d: any) => ({
                dishId: String(d.dishId || d.id || d._id || ''),
                name: String(d.name || d.dishName || d.title || 'Plat'),
                image: d.image || d.imageUrl || null,
                totalQuantitySold:
                  Number(d.totalQuantitySold ?? d.quantity ?? d.soldCount ?? d.totalSold) || 0,
              }))
            : [];

          return {
            totalRevenue:
              Number(data.totalRevenue ?? data.revenue ?? data.totalSales ?? data.ca) || 0,
            averageOrderValue:
              Number(data.averageOrderValue ?? data.avgOrderValue ?? data.panierMoyen) || 0,
            orderCountsByStatus: {
              PENDING: Number(rawStatus.PENDING ?? rawStatus.pending) || 0,
              CONFIRMED: Number(rawStatus.CONFIRMED ?? rawStatus.confirmed) || 0,
              PREPARING: Number(rawStatus.PREPARING ?? rawStatus.preparing) || 0,
              READY_FOR_DELIVERY:
                Number(
                  rawStatus.READY_FOR_DELIVERY ??
                    rawStatus.ready_for_delivery ??
                    rawStatus.READY ??
                    rawStatus.ready
                ) || 0,
              OUT_FOR_DELIVERY:
                Number(rawStatus.OUT_FOR_DELIVERY ?? rawStatus.out_for_delivery) || 0,
              READY:
                Number(
                  rawStatus.READY ??
                    rawStatus.ready ??
                    rawStatus.READY_FOR_DELIVERY ??
                    rawStatus.ready_for_delivery
                ) || 0,
              DELIVERED: Number(rawStatus.DELIVERED ?? rawStatus.delivered) || 0,
              CANCELLED: Number(rawStatus.CANCELLED ?? rawStatus.cancelled) || 0,
            },
            topDishes,
            newClientsLast30Days:
              Number(
                data.newClientsLast30Days ??
                  data.newClients ??
                  data.newUsersCount ??
                  data.totalClients
              ) || 0,
          };
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          continue;
        }
        console.warn(`Erreur récupération statistiques sur ${url}:`, err.message || err);
      }
    }
    return null;
  },

  /**
   * Calcule les métriques en temps réel à partir des listes d'entités en mémoire
   */
  computeFromLocalData: (
    orders: Order[] = [],
    dishes: Dish[] = [],
    users: User[] = []
  ): DashboardStats => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeDishes = Array.isArray(dishes) ? dishes : [];
    const safeUsers = Array.isArray(users) ? users : [];

    // 1. Chiffre d'affaires & Panier moyen
    const deliveredOrConfirmedOrders = safeOrders.filter(
      (o) => o && o.status !== 'CANCELLED'
    );
    const deliveredOrders = safeOrders.filter((o) => o && o.status === 'DELIVERED');

    const totalRevenue = deliveredOrders.reduce(
      (acc, o) => acc + (Number(o.totalAmount) || 0),
      0
    );

    const qualifyingOrders = deliveredOrders.length > 0 ? deliveredOrders : deliveredOrConfirmedOrders;
    const averageOrderValue =
      qualifyingOrders.length > 0
        ? Math.round(totalRevenue / qualifyingOrders.length)
        : 0;

    // 2. Répartition par statut
    const orderCountsByStatus = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY_FOR_DELIVERY: 0,
      OUT_FOR_DELIVERY: 0,
      READY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    safeOrders.forEach((o) => {
      if (!o || !o.status) return;
      if (o.status === 'PENDING') orderCountsByStatus.PENDING++;
      else if (o.status === 'CONFIRMED') orderCountsByStatus.CONFIRMED++;
      else if (o.status === 'PREPARING') orderCountsByStatus.PREPARING++;
      else if (o.status === 'READY_FOR_DELIVERY' || (o.status as string) === 'READY') {
        orderCountsByStatus.READY_FOR_DELIVERY++;
        orderCountsByStatus.READY++;
      } else if (o.status === 'OUT_FOR_DELIVERY') {
        orderCountsByStatus.OUT_FOR_DELIVERY++;
      } else if (o.status === 'DELIVERED') orderCountsByStatus.DELIVERED++;
      else if (o.status === 'CANCELLED') orderCountsByStatus.CANCELLED++;
    });

    // 3. Top plats vendus
    const dishSalesMap = new Map<string, { name: string; image: string | null; qty: number }>();

    // Initialiser avec tous les plats existants
    safeDishes.forEach((d) => {
      if (d && d.id) {
        dishSalesMap.set(d.id, {
          name: d.name,
          image: d.imageUrl || null,
          qty: 0,
        });
      }
    });

    // Sommer les quantités des commandes non annulées
    safeOrders
      .filter((o) => o && o.status !== 'CANCELLED')
      .forEach((order) => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            if (!item) return;
            const dishId = item.dishId || (item.dish && item.dish.id);
            if (!dishId) return;

            const existing = dishSalesMap.get(dishId);
            const qty = Number(item.quantity) || 1;
            if (existing) {
              existing.qty += qty;
              if (!existing.image && (item.dishImageUrlSnapshot || item.dish?.imageUrl)) {
                existing.image = item.dishImageUrlSnapshot || item.dish?.imageUrl || null;
              }
            } else {
              dishSalesMap.set(dishId, {
                name: item.dishNameSnapshot || item.dish?.name || 'Plat',
                image: item.dishImageUrlSnapshot || item.dish?.imageUrl || null,
                qty: qty,
              });
            }
          });
        }
      });

    const topDishes = Array.from(dishSalesMap.entries())
      .map(([dishId, val]) => ({
        dishId,
        name: val.name,
        image: val.image,
        totalQuantitySold: val.qty,
      }))
      .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, 5);

    // 4. Nouveaux clients (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clientUsers = safeUsers.filter((u) => u && (u.role === 'CLIENT' || !u.role));
    const newClientsLast30Days = clientUsers.length;

    return {
      totalRevenue,
      averageOrderValue,
      orderCountsByStatus,
      topDishes,
      newClientsLast30Days,
    };
  },
};
