import prisma from "../../config/prisma";

class AnalyticsRepository {
  async getTotalRevenue() {
    const result = await prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async getOrderCountsByStatus() {
    return prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });
  }

  async getTopDishes(limit: number) {
    const grouped = await prisma.orderItem.groupBy({
      by: ["dishId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const dishIds = grouped.map((g) => g.dishId);
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds } },
      select: { id: true, name: true, image: true },
    });
    const dishMap = new Map(dishes.map((d) => [d.id, d]));

    return grouped.map((g) => ({
      dishId: g.dishId,
      name: dishMap.get(g.dishId)?.name ?? "Plat supprimé",
      image: dishMap.get(g.dishId)?.image ?? null,
      totalQuantitySold: g._sum.quantity ?? 0,
    }));
  }

  async getNewClientsCount(sinceDate: Date) {
    return prisma.user.count({
      where: { role: "CLIENT", deletedAt: null, createdAt: { gte: sinceDate } },
    });
  }

  async getAverageOrderValue() {
    const result = await prisma.order.aggregate({
      where: { status: { notIn: ["PENDING", "CANCELLED"] } },
      _avg: { totalAmount: true },
    });
    return result._avg.totalAmount ?? 0;
  }
}

export default new AnalyticsRepository();