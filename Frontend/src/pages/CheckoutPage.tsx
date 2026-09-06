import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import { addressApi, CreateAddressDto } from '../api/address.api';
import { orderApi } from '../api/order.api';
import { paymentApi } from '../api/payment.api';
import { Address } from '../types';
import { formatFCFA } from '../utils/format';
import {
  MapPin,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Plus,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, total, fetchCart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick inline new address form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newLabel, setNewLabel] = useState('Maison');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Douala');

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    setLoading(true);
    try {
      await fetchCart();
      const addrs = await addressApi.getAll();
      setAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInlineAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await addressApi.create({
        label: newLabel,
        street: newStreet,
        city: newCity,
        isDefault: addresses.length === 0,
      });
      setAddresses([...addresses, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
      setNewStreet('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Erreur enregistrement adresse');
    }
  };

  const handlePlaceOrder = async () => {
    let targetAddressId = selectedAddressId;

    if (!targetAddressId) {
      if (newStreet.trim()) {
        try {
          const created = await addressApi.create({
            label: newLabel || 'Maison',
            street: newStreet.trim(),
            city: newCity || 'Douala',
            isDefault: addresses.length === 0,
          });
          setAddresses((prev) => [...prev, created]);
          setSelectedAddressId(created.id);
          targetAddressId = created.id;
          setShowNewAddressForm(false);
        } catch (aErr: any) {
          setErrorMsg(aErr.response?.data?.error || "Veuillez renseigner votre adresse de livraison.");
          return;
        }
      } else if (addresses.length > 0) {
        targetAddressId = addresses[0].id;
        setSelectedAddressId(targetAddressId);
      } else {
        setErrorMsg('Veuillez renseigner votre adresse de livraison (rue/quartier) à Douala ci-dessus.');
        setShowNewAddressForm(true);
        return;
      }
    }

    if (items.length === 0) {
      setErrorMsg('Votre panier est vide.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create Order
      const newOrder = await orderApi.create({
        addressId: targetAddressId,
      });

      if (!newOrder || !newOrder.id) {
        throw new Error("Impossible de créer la commande. Veuillez vérifier votre panier.");
      }

      // 2. Initiate Stripe Payment
      try {
        const paymentResponse = await paymentApi.initiate({
          orderId: newOrder.id,
          method: 'STRIPE',
        });

        // 3. Validate payment URL and redirect to Stripe
        if (
          paymentResponse?.paymentUrl &&
          (paymentResponse.paymentUrl.startsWith('http://') ||
            paymentResponse.paymentUrl.startsWith('https://'))
        ) {
          clearCart();
          window.location.href = paymentResponse.paymentUrl;
          return;
        }

        // If returned URL is relative or direct confirmation
        clearCart();
        navigate(`/orders/${newOrder.id}?payment=success`);
      } catch (pErr: any) {
        console.error('Erreur module paiement:', pErr);
        // La commande est créée, diriger vers le suivi avec explication
        clearCart();
        const pErrMsg =
          pErr.response?.data?.error ||
          pErr.message ||
          "Le module de paiement n'a pas pu être initialisé. Vous pouvez régler à la livraison ou réessayer.";
        setErrorMsg(pErrMsg);
        navigate(`/orders/${newOrder.id}`);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(
        err.response?.data?.error ||
        err.message ||
        'Impossible de finaliser la commande. Veuillez vérifier vos articles et votre adresse.'
      );
    }
  };

  
  const finalTotal = total;

  if (items.length === 0 && !loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-black text-slate-950">
            Votre panier est vide
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Ajoutez des plats savoureux de notre restaurant pour passer votre commande.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3.5 bg-slate-950 hover:bg-blue-900 text-white text-xs font-bold rounded-2xl shadow-md transition cursor-pointer"
        >
          Retourner au Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
          <Clock className="w-3.5 h-3.5" /> Étape finale de commande
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
          Validation de la Commande
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Vérifiez vos articles, confirmez votre adresse à Douala et réglez en toute sécurité.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Address and Delivery Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-950">
                    Adresse de livraison
                  </h2>
                  <p className="text-xs text-slate-500">
                    Où devons-nous vous livrer à Douala ?
                  </p>
                </div>
              </div>

              {!showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvelle adresse</span>
                </button>
              )}
            </div>

            {/* Existing Addresses list */}
            {!showNewAddressForm ? (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-5 h-5 rounded-full mt-0.5 border flex items-center justify-center transition ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-slate-950 text-sm">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                Par défaut
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {addr.street}, <span className="font-semibold text-slate-800">{addr.city}</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-blue-50/60 text-blue-600 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Inline Add Address Form */
              <form onSubmit={handleSaveInlineAddress} className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Nouvelle adresse à Douala
                  </h4>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Choisir une adresse existante
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom du lieu
                  </label>
                  <input
                    type="text"
                    required
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Ex: Bureau Akwa, Domicile Bonapriso"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Quartier, Rue & Repères précis
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="Ex: Akwa, Rue Pau, face Hôtel Prince de Galles"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                    >
                      Annuler
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Enregistrer cette adresse
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                2
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-slate-950">
                  Mode de Paiement
                </h2>
                <p className="text-xs text-slate-500">
                  Paiement sécurisé avec redirection instantanée
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl border-2 border-blue-600 bg-blue-50/40 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-950">
                    Stripe Checkout (Cartes & Mobile Money)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Visa, Mastercard, cartes internationales et paiements sécurisés
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-xl bg-blue-600 text-white shadow-xs">
                Actif
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Vos informations financières sont chiffrées en TLS 256-bit par Stripe.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 sticky top-28">
            <h3 className="font-display text-lg font-black text-slate-950 pb-3 border-b border-slate-100">
              Récapitulatif de la commande
            </h3>

            {/* Items list */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                      {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-800 truncate">
                      {item.dish.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-950 shrink-0">
                    {formatFCFA(item.dish.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Sous-total articles :</span>
                <span className="font-bold text-slate-900">
                  {formatFCFA(total)}
                </span>
              </div>
              
              <div className="flex justify-between pt-3 border-t border-slate-200/80 text-sm font-black text-slate-950">
                <span>Total à régler :</span>
                <span className="text-blue-700 text-xl font-black">
                  {formatFCFA(finalTotal)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              id="confirm-order-btn"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
              }`}
            >
              {isSubmitting ? (
                <span>Redirection vers Stripe...</span>
              ) : (
                <>
                  <span>Payer et Valider ({formatFCFA(finalTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Livraison estimée en 30 à 45 minutes à Douala</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
