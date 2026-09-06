import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthRequiredModal } from './components/common/AuthRequiredModal';
import { AppRouter } from './router/AppRouter';
import { useAuthStore } from './store/auth.store';
import { useCartStore } from './store/cart.store';

export default function App() {
  const { user, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';
  const isDelivery = isAuthenticated && user?.role === 'DELIVERY_AGENT';
  const isStaff = isAdmin || isDelivery;

  useEffect(() => {
    if (isAuthenticated && !isStaff) {
      fetchCart();
    }
  }, [isAuthenticated, isStaff, fetchCart]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <AppRouter />
        </main>
        {!isStaff && <CartDrawer />}
        <AuthRequiredModal />
        <Footer />
      </div>
    </BrowserRouter>
  );
}
