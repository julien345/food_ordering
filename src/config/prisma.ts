// src/config/prisma.ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({ connectionString });

const basePrisma = new PrismaClient({ adapter });

// Convertit automatiquement les champs Decimal en number à la lecture,
// pour éviter d'avoir à écrire Number(...) partout dans le code métier.
const prisma = basePrisma.$extends({
  result: {
    dish: {
      price: {
        needs: { price: true },
        compute(dish) {
          return Number(dish.price);
        },
      },
    },
    order: {
      totalAmount: {
        needs: { totalAmount: true },
        compute(order) {
          return Number(order.totalAmount);
        },
      },
    },
    orderItem: {
      unitPrice: {
        needs: { unitPrice: true },
        compute(orderItem) {
          return Number(orderItem.unitPrice);
        },
      },
    },
    payment: {
      amount: {
        needs: { amount: true },
        compute(payment) {
          return Number(payment.amount);
        },
      },
    },
  },
});

export default prisma;