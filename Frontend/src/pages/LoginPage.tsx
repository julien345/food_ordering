import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ChefHat,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import loginBg from '../assets/images/gourmet_restaurant_bg_1788543759874.jpg';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, isLoading, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      const res = await login({ email, password });
      if (res.user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (res.user?.role === 'DELIVERY_AGENT') {
        navigate('/delivery', { replace: true });
      } else {
        navigate(redirect, { replace: true });
      }
    } catch (err: any) {
      setLocalError(
        err.response?.data?.error ||
        err.message ||
        'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.'
      );
    }
  };

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setLocalError(null);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden">
      {/* Immersive Atmospheric Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginBg}
          alt="Atmosphère gastronomique Julien's Food"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-50 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/70" />
        <div className="absolute inset-0 bg-radial from-blue-900/10 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Main Dual-Column Content Wrapper */}
      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Gastronomic Showcase (Hidden on small screens, magnificent on lg) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4 text-white">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Cuisine Camerounaise Authentique</span>
            </div>

            <h1 className="font-display text-4xl font-black tracking-tight leading-tight text-white">
              L'excellence de la cuisine camerounaise.
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Julien's Food vous livre le meilleur de la cuisine camerounaise directement chez vous ou à votre bureau à Douala.
            </p>
          </div>

          {/* Value Pillars */}
          <div className="space-y-3.5 py-2 border-y border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Saveurs authentiques du terroir</p>
                <p className="text-slate-400">Ingrédients locaux frais et recettes camerounaises fait-maison</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <ChefHat className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Spécialités culinaires du Cameroun</p>
                <p className="text-slate-400">Ndolè, Poulet DG, Koki, Eru et plats emblématiques</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Livraison soignée à Douala</p>
                <p className="text-slate-400">Emballage hermétique, vos repas arrivent chauds et prêts à déguster</p>
              </div>
            </div>
          </div>

          {/* Social Proof Quote */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-xs text-slate-300 italic">
            "Chaque commande est préparée avec minutie et passion pour vous faire savourer le meilleur de la cuisine camerounaise."
            <div className="mt-2 not-italic font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>L'Équipe Julien's Food • Cuisine Camerounaise</span>
            </div>
          </div>
        </div>

        {/* Right Column: Refined Authentication Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-9 rounded-3xl border border-white/40 shadow-2xl shadow-black/40 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-700/20">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl font-black text-slate-950 tracking-tight">
                Connexion à votre espace
              </h2>
              <p className="text-xs text-slate-500">
                Accédez à votre compte, vos commandes et vos avantages
              </p>
            </div>

            {reason === 'order_auth_required' && (
              <div
                id="login-auth-required-banner"
                className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-0.5 text-left">
                  <span className="font-bold block text-amber-950">
                    Compte requis pour commander
                  </span>
                  <span className="text-amber-800 leading-relaxed block">
                    Vous devez être connecté pour finaliser votre commande. Connectez-vous ou créez un compte pour valider votre panier.
                  </span>
                </div>
              </div>
            )}

            {localError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{localError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Mot de passe
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition active:scale-[0.99] cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Connexion en cours...' : 'Se connecter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Demo test credentials helper pills for testing */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                Connexion rapide (comptes de test)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('sophie@test.com', 'password123')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition text-center truncate cursor-pointer"
                  title="Remplir compte Client"
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('livreur4@test.com', 'password123')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition text-center truncate cursor-pointer"
                  title="Remplir compte Livreur"
                >
                  Livreur
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@test.com', 'password123')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition text-center truncate cursor-pointer"
                  title="Remplir compte Admin"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
              Vous n'avez pas encore de compte ?{' '}
              <Link
                to="/register"
                className="text-blue-600 font-bold hover:underline ml-1"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
