import analyticsRepository from "./analytics.repository";

class AnalyticsService {
  async getStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalRevenue, orderCountsByStatusRaw, topDishes, newClientsLast30Days, averageOrderValue] =
      await Promise.all([
        analyticsRepository.getTotalRevenue(),
        analyticsRepository.getOrderCountsByStatus(),
        analyticsRepository.getTopDishes(5),
        analyticsRepository.getNewClientsCount(thirtyDaysAgo),
        analyticsRepository.getAverageOrderValue(),
      ]);

    const orderCountsByStatus = Object.fromEntries(
      orderCountsByStatusRaw.map((entry) => [entry.status, entry._count.status])
    );

    return {
      totalRevenue,
      averageOrderValue,
      orderCountsByStatus,
      topDishes,
      newClientsLast30Days,
    };
  }
}

export default new AnalyticsService();