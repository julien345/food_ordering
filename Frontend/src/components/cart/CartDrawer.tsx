import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { useAuthNoticeStore } from '../../store/authNotice.store';
import { formatFCFA } from '../../utils/format';
import { getDishImageUrl } from '../../utils/image';

export const CartDrawer: React.FC = () => {
  const {
    items,
    total,
    isOpen,
    setIsOpen,
    updateItemQuantity,
    removeItem,
    clearCart,
    fetchCart,
    isLoading,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const { triggerAuthNotice } = useAuthNoticeStore();

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    if (!isAuthenticated) {
      triggerAuthNotice(
        "Vous devez être connecté pour commander avant d'être redirigé",
        '/login?redirect=/checkout&reason=order_auth_required'
      );
    } else {
      navigate('/checkout');
    }
  };

 

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col sm:rounded-l-3xl overflow-hidden border-l border-slate-200/80">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-900/40">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black tracking-tight text-white">
                  Votre Panier
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{items.length} {items.length > 1 ? 'articles' : 'article'}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Douala express
                  </span>
                </div>
              </div>
            </div>

            <button
              id="close-cart-drawer-btn"
              onClick={() => setIsOpen(false)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body items list */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-18 h-18 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    Votre panier est vide
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Découvrez nos plats camerounais et grillades parfumées puis ajoutez-les à votre commande.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Explorer la Carte
                </button>
              </div>
            ) : (
              items.map((item) => {
                const dish = item.dish;
                const dishImage = getDishImageUrl(dish.imageUrl || (dish as any).image);

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5 items-center">
                    {/* Dish Image */}
                    <div className="w-18 h-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-xs">
                      {dishImage ? (
                        <img
                          src={dishImage}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-sm">
                          {dish.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Dish Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">
                          {dish.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-black text-slate-950 mt-0.5">
                        {formatFCFA(dish.price)}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between mt-2 pt-0.5">
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <button
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1.5 hover:bg-white text-slate-600 transition cursor-pointer"
                            aria-label="Diminuer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-black text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1.5 hover:bg-white text-slate-600 transition cursor-pointer"
                            aria-label="Augmenter"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-xs font-black text-blue-700">
                          {formatFCFA(dish.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer checkout area */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/80 space-y-4">
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Sous-total articles :</span>
                  <span className="font-bold text-slate-900">
                    {formatFCFA(total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison à Douala :</span>
                  
                </div>
                <div className="flex justify-between pt-2.5 border-t border-slate-200/80 text-sm font-black text-slate-950">
                  <span>Total à payer :</span>
                  <span className="text-blue-700 text-lg">
                    {formatFCFA(total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  id="checkout-proceed-btn"
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition active:scale-98 text-sm cursor-pointer"
                >
                  <span>Passer la commande</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Paiement 100% sécurisé
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-slate-400 hover:text-rose-600 underline font-medium cursor-pointer"
                  >
                    Vider le panier
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
