import { ENV } from './config/env';
import express from 'express';
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/category/category.routes";
import dishRoutes from "./modules/dish/dish.routes";
import addressRoutes from "./modules/address/address.routes";
import cartRoutes from "./modules/cart/cart.routes";
import orderRoutes from "./modules/order/order.routes";
import deliveryRoutes from "./modules/delivery/delivery.routes";
const app = express();

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

export default app;