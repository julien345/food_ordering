import { ENV } from './config/env';
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

// Controller (utilisé directement pour la route webhook, hors du router payment classique)
import paymentController from "./modules/payment/payment.controller";

const app = express();

// Webhook route for Stripe
app.post(
  "/payments/webhook/stripe",
  express.raw({ type: "application/json" }),
  paymentController.webhookStripe.bind(paymentController)
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// Error handling middleware
app.use(errorHandler);
export default app;