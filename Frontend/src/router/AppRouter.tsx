import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AddressesPage } from '../pages/AddressesPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrdersPage } from '../pages/OrdersPage';
import { OrderDetailPage } from '../pages/OrderDetailPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { DeliveryPage } from '../pages/DeliveryPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { useAuthStore } from '../store/auth.store';

export const AppRouter: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';
  const isDelivery = isAuthenticated && user?.role === 'DELIVERY_AGENT';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : isDelivery ? (
            <Navigate to="/delivery" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : isDelivery ? (
            <Navigate to="/delivery" replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      {/* Protected Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes for Clients (Redirect to /admin for Admin, /delivery for Delivery Agent) */}
      <Route
        path="/addresses"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : isDelivery ? (
            <Navigate to="/delivery" replace />
          ) : (
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <AddressesPage />
            </ProtectedRoute>
          )
        }
      />
      <Route
        path="/checkout"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : isDelivery ? (
            <Navigate to="/delivery" replace />
          ) : (
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <CheckoutPage />
            </ProtectedRoute>
          )
        }
      />
      <Route
        path="/orders"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : isDelivery ? (
            <Navigate to="/delivery" replace />
          ) : (
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <OrdersPage />
            </ProtectedRoute>
          )
        }
      />
      <Route
        path="/orders/:id"
        element={
          isAdmin ? (
            <Navigate to="/admin" replace />
          ) : isDelivery ? (
            <Navigate to="/delivery" replace />
          ) : (
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <OrderDetailPage />
            </ProtectedRoute>
          )
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Delivery Agent Routes */}
      <Route
        path="/delivery"
        element={
          <ProtectedRoute allowedRoles={['DELIVERY_AGENT', 'ADMIN']}>
            <DeliveryPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAdmin ? '/admin' : isDelivery ? '/delivery' : '/'}
            replace
          />
        }
      />
    </Routes>
  );
};
