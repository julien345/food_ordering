import React, { useState, useEffect, useRef } from 'react';
import { XCircle } from 'lucide-react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { orderApi } from '../api/order.api';
import { Order } from '../types';
import { StatusTimeline } from '../components/common/StatusTimeline';
import { CancelOrderModal } from '../components/modals/CancelOrderModal';
import { paymentApi } from '../api/payment.api';
import { formatFCFA, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../utils/format';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  ChefHat,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [paymentConfirmedNotice, setPaymentConfirmedNotice] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

const handlePayNow = async () => {
  if (!order) return;
  setIsPaying(true);
  setErrorMsg(null);
  try {
    const { paymentUrl } = await paymentApi.initiate({ orderId: order.id, method: 'STRIPE' });
    window.location.href = paymentUrl;
  } catch (err: any) {
    setErrorMsg(err.response?.data?.error || 'Impossible de lancer le paiement.');
    setIsPaying(false);
  }
};

const [isCancelling, setIsCancelling] = useState(false);

const handleCancelOrder = async () => {
  if (!order) return;
  
  setIsCancelling(true);
  setErrorMsg(null);
  try {
    await orderApi.updateStatus(order.id, 'CANCELLED');
    setOrder(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    setIsCancelModalOpen(false); // Ferme le modal après succès
  } catch (err: any) {
    setErrorMsg(err.response?.data?.error || 'Impossible d\'annuler la commande.');
  } finally {
    setIsCancelling(false);
  }
};



  const pollCountRef = useRef(0);
  const intervalRef = useRef<any>(null);

  const fetchOrder = async (isBackground = false): Promise<Order | null> => {
    if (!id) return null;
    if (!isBackground) setLoading(true);
    try {
      const data = await orderApi.getById(id);
      setOrder(data);

      // If status is no longer PENDING, stop polling early
      if (data.status !== 'PENDING' && intervalRef.current) {
        clearInterval(intervalRef.current);
        setIsPolling(false);
      }

      return data;
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error ||
        'Impossible de charger les détails de la commande.'
      );
      return null;
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
  fetchOrder();

  if (paymentStatus === 'success') {
    setIsPolling(true);
    pollCountRef.current = 0;

    intervalRef.current = setInterval(async () => {
      pollCountRef.current += 1;
      const current = await fetchOrder(true);

      if (current && current.status !== 'PENDING') {
        clearInterval(intervalRef.current);
        setIsPolling(false);
        if (current.status !== 'CANCELLED') {
          setPaymentConfirmedNotice(true); // <-- ICI, seulement dans ce cas précis
        }
      } else if (pollCountRef.current >= 8) {
        clearInterval(intervalRef.current);
        setIsPolling(false);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }
}, [id, paymentStatus]);

  if (loading && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">
          Chargement des détails de votre commande...
        </p>
      </div>
    );
  }

  if (!order || errorMsg) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Commande introuvable
        </h2>
        <p className="text-xs text-slate-500">
          {errorMsg || 'Cette commande n’existe pas ou vous n’y avez pas accès.'}
        </p>
        <Link
          to="/orders"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
        >
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const statusStyle = ORDER_STATUS_STYLES[order.status];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Toutes mes commandes</span>
        </Link>

        <button
          onClick={() => fetchOrder()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin text-blue-600' : ''}`} />
          <span>Actualiser le statut</span>
        </button>
      </div>

      {/* Payment Confirmation Banner */}
      {paymentConfirmedNotice && (
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-bold text-sm sm:text-base">
                Paiement Stripe confirmé avec succès !
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Votre paiement a été validé. Nos cuisiniers à Douala ont reçu votre commande et commencent la préparation.
              </p>
            </div>
          </div>

          <button
            onClick={() => setPaymentConfirmedNotice(false)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold shrink-0"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              Détails de la commande
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
              Commande #{order.orderNumber ?? order.id}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Passée le {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        <div className="pt-6">
          <StatusTimeline
            currentStatus={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
            hideContainer={true}
          />
        </div>
      </div>

      {/* Grid: Items details + Delivery / Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Frozen Ordered Items List */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span>Articles commandés</span>
            </h3>
            <span className="text-xs text-slate-400">
              {order.items.length} {order.items.length > 1 ? 'articles' : 'article'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                  {item.dishImageUrlSnapshot ? (
                    <img
                      src={item.dishImageUrlSnapshot}
                      alt={item.dishNameSnapshot}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-sm">
                      {item.dishNameSnapshot.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {item.dishNameSnapshot}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>Quantité : <strong className="text-slate-800">{item.quantity}</strong></span>
                    <span>•</span>
                    <span>Prix unitaire : <strong className="text-blue-700">{formatFCFA(item.unitPrice)}</strong></span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    {formatFCFA(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Sous-total plats :</span>
              <span className="font-semibold text-slate-800">
                {formatFCFA(order.totalAmount - (order.totalAmount > 0 ? 1000 : 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison (Douala) :</span>
              <span className="font-semibold text-slate-800">
                1 000 FCFA
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Montant Total :</span>
              <span className="text-blue-700 text-base sm:text-lg font-extrabold">
                {formatFCFA(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Address & Delivery Agent Details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Address Snapshot */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Lieu de livraison à Douala</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <p className="text-xs font-bold text-slate-900">
                Adresse enregistrée lors de la commande :
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                {order.deliveryAddressSnapshot}
              </p>
            </div>
          </div>

          {/* Delivery Agent Card if assigned */}
          {order.delivery ? (
            <div className="bg-white rounded-3xl border border-blue-200 p-6 shadow-xs space-y-4 ring-1 ring-blue-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-display text-base font-bold text-blue-950 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Votre Livreur</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Assigné
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                    {order.delivery.agent?.firstName?.charAt(0) || 'L'}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {order.delivery.agent?.firstName} {order.delivery.agent?.lastName || ''}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Livreur officiel Julien's Food
                    </p>
                  </div>
                </div>

                {order.delivery.agent?.phone && (
                  <a
                    href={`tel:${order.delivery.agent.phone}`}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                    title="Appeler le livreur"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-center space-y-2">
              <ChefHat className="w-8 h-8 text-blue-600 mx-auto" />
              <h4 className="font-display text-sm font-bold text-slate-800">
                Préparation en cuisine
              </h4>
              <p className="text-xs text-slate-500">
                Un livreur Julien's Food sera automatiquement assigné dès que vos plats seront prêts.
              </p>
            </div>
          )}

  {/* Payment info */}
<div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
  <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
    <CreditCard className="w-4 h-4 text-blue-600" />
    <span>Règlement</span>
  </h3>

  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-500">Moyen de paiement :</span>
    <span className="font-bold text-slate-800">
      {order.payment ? "Stripe / Carte bancaire" : "Non renseigné"}
    </span>
  </div>

  <div className="flex items-center justify-between text-xs">
    <span className="text-slate-500">État du paiement :</span>
    {order.payment?.status === "SUCCESS" ? (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Payé avec succès
      </span>
    ) : order.payment?.status === "FAILED" ? (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        Échec du paiement
      </span>
    ) : order.payment?.status === "REFUNDED" ? (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Remboursé
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        En attente de paiement
      </span>
    )}
  </div>

  {/* On affiche le bloc d'actions tant que la commande est en attente (PENDING) */}
{order.status === 'PENDING' && (
  <div className="pt-2 flex flex-col sm:flex-row gap-2">
    
    {/* On n'affiche le bouton Payer que si le paiement n'est pas encore validé */}
    {order.payment?.status !== 'SUCCESS' && (
      <button
        onClick={handlePayNow}
        disabled={isPaying || isCancelling}
        className={`flex-1 py-2.5 px-3.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
          isPaying ? 'bg-amber-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>{isPaying ? 'Redirection vers Stripe...' : 'Payer maintenant'}</span>
      </button>
    )}

    {/* Le bouton Annuler reste disponible tant que le statut est PENDING */}
   <button
    onClick={() => setIsCancelModalOpen(true)} // 👈 Ouvre le magnifique modal
      disabled={isPaying || isCancelling}
      className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                              isCancelling
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50 shadow-2xs'
                            }`}
>
  <XCircle className="w-3.5 h-3.5" />
  <span>Annuler</span>
</button>
  </div>
)}

</div>
        </div>
      </div>
     <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        isCancelling={isCancelling}
      /> 
    </div>
  );
};
