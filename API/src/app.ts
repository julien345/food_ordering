import { ENV } from './config/env';
import cors from "cors";
import express from 'express';
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/category/category.routes";
import dishRoutes from "./modules/dish/dish.routes";
import addressRoutes from "./modules/address/address.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/order/order.routes";
import deliveryRoutes from "./modules/delivery/delivery.routes";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import paymentRoutes from "./modules/payment/payment.routes";
import userRoutes from "./modules/user/user.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";

// Controller (utilisé directement pour la route webhook, hors du router payment classique)
import paymentController from "./modules/payment/payment.controller";

const app = express();

app.use(cors({
  origin:[
    ENV.FRONTEND_URL || ""
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Webhook route for Stripe
app.post(
  "/payments/webhook/stripe",
  express.raw({ type: "application/json" }),
  paymentController.webhookStripe.bind(paymentController)
);

// Middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({limit: '5mb', extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/dishes", dishRoutes);
app.use("/addresses", addressRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/deliveries", deliveryRoutes);
app.use("/payments", paymentRoutes);
app.use("/users", userRoutes);
app.use("/uploads", uploadRoutes);
app.use("/analytics", analyticsRoutes);
// Error handling middleware
app.use(errorHandler);
export default app;