import React from 'react';
import { UtensilsCrossed, Phone, MapPin, Clock, ShieldCheck, Truck, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export const Footer: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';
  const isDelivery = isAuthenticated && user?.role === 'DELIVERY_AGENT';
  const isClient = !isAuthenticated || user?.role === 'CLIENT';

  return (
    <footer className="bg-slate-950 text-slate-400 pt-14 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-2xl font-black tracking-tight text-white block leading-none">
                  Julien's
                </span>
                <span className="text-[11px] font-black tracking-wider px-1.5 py-0.5 rounded-md bg-blue-600 text-white uppercase leading-none shadow-xs">
                  Food
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              L'excellence de la gastronomie et des grillades savoureuses préparées avec des ingrédients frais du terroir et livrées avec soin à Douala.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Qualité artisanale & hygiène garantie</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="text-xs space-y-2.5">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition">
                  La Carte
                </Link>
              </li>
              {isClient && isAuthenticated && (
                <>
                  <li>
                    <Link to="/orders" className="text-slate-400 hover:text-white transition">
                      Mes commandes
                    </Link>
                  </li>
                  <li>
                    <Link to="/addresses" className="text-slate-400 hover:text-white transition">
                      Mes adresses
                    </Link>
                  </li>
                </>
              )}
              {isDelivery && (
                <li>
                  <Link to="/delivery" className="text-blue-400 hover:text-blue-300 font-bold transition flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Espace Livraisons</span>
                  </Link>
                </li>
              )}
              {isAdmin && (
                <li>
                  <Link to="/admin" className="text-blue-400 hover:text-blue-300 font-bold transition flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Tableau de bord</span>
                  </Link>
                </li>
              )}
              {isAuthenticated && (
                <li>
                  <Link to="/profile" className="text-slate-400 hover:text-white transition">
                    Mon Profil
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Hours & Service */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Horaires du service</span>
            </h4>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span>Lundi - Jeudi</span>
                <span className="text-white font-bold">11h00 - 23h00</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span>Vendredi - Samedi</span>
                <span className="text-white font-bold">11h00 - 00h00</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span>Dimanche</span>
                <span className="text-white font-bold">12h00 - 23h00</span>
              </div>
              <div className="pt-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Service de livraison actif
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Contact direct</span>
            </h4>
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Besoin d'un renseignement ou d'un service traiteur sur-mesure ?
              </p>
              <a
                href="tel:+237699112233"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-blue-400 border border-slate-800 text-xs font-bold transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+237 699 11 22 33</span>
              </a>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Douala, Cameroun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Julien's Food. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Douala, Cameroun</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
