import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    const isCheckout = location.pathname === '/checkout';
    const reasonParam = isCheckout ? '&reason=order_auth_required' : '';
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}${reasonParam}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50/40">
        <div className="max-w-md w-full bg-white rounded-2xl border-2 border-blue-600 p-8 text-center shadow-none">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-title text-2xl font-bold text-slate-900 tracking-tight mb-2.5">
            Accès restreint
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Votre compte actuel ({user.role}) ne dispose pas des autorisations requises pour accéder à cet espace ({allowedRoles.join(', ')}).
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retourner au menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
