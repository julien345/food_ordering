import React, { useState } from 'react';
import { Dish } from '../../types';
import { formatFCFA } from '../../utils/format';
import { getDishImageUrl } from '../../utils/image';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { Plus, Check, EyeOff, UtensilsCrossed, Eye } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
  onQuickView?: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onQuickView }) => {
  const { addItem, isLoading } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const isStaffReadOnly = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'DELIVERY_AGENT');
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const resolvedImageUrl = getDishImageUrl(dish.imageUrl || dish.image);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isStaffReadOnly || !dish.isAvailable) return;

    try {
      await addItem(dish.id, 1, dish);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch {
      // Error handled by store
    }
  };

  return (
    <div
      id={`dish-card-${dish.id}`}
      onClick={() => onQuickView && onQuickView(dish)}
      className="group bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200/90 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer ring-1 ring-black/[0.02]"
    >
      {/* Dish Image Frame */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        {resolvedImageUrl && !imgError ? (
          <img
            src={resolvedImageUrl}
            alt={dish.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 ${
              !dish.isAvailable ? 'grayscale opacity-60' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center mb-2 shadow-xs border border-slate-100">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-slate-800 text-sm line-clamp-2">
              {dish.name}
            </span>
          </div>
        )}

        {/* Gradient shadow for text contrast if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {dish.category ? (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-white/95 text-slate-900 backdrop-blur-md shadow-xs border border-white/60 tracking-tight">
              {dish.category.name}
            </span>
          ) : <div />}

          {!dish.isAvailable && (
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-slate-950/90 text-white backdrop-blur-md flex items-center gap-1 shadow-xs">
              <EyeOff className="w-3 h-3" /> Épuisé
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
              {dish.name}
            </h3>
          </div>

          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {dish.description || 'Préparé avec passion et des ingrédients locaux frais sélectionnés du terroir de Douala.'}
          </p>
        </div>

        {/* Bottom Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
              Prix
            </span>
            <span className="font-display text-lg font-black text-slate-950 block mt-0.5">
              {formatFCFA(dish.price)}
            </span>
          </div>

          {isStaffReadOnly ? (
            <div
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1.5 select-none cursor-default"
              title={user?.role === 'ADMIN' ? 'Mode aperçu administrateur (Lecture seule)' : 'Mode aperçu livreur (Lecture seule)'}
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>Aperçu</span>
            </div>
          ) : (
            <button
              id={`add-to-cart-${dish.id}`}
              onClick={handleAddToCart}
              disabled={!dish.isAvailable || isLoading}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-xs cursor-pointer active:scale-95 ${
                !dish.isAvailable
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : justAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 group-hover:bg-blue-700'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Ajouté</span>
                </>
              ) : !dish.isAvailable ? (
                <span>Indisponible</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
