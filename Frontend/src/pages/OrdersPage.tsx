import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../api/order.api';
import { paymentApi } from '../api/payment.api';
import { Order, PaginationMeta, OrderStatus } from '../types';
import { CancelOrderModal } from '../components/modals/CancelOrderModal';
import { formatFCFA, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../utils/format';
import {
  ShoppingBag,
  ArrowRight,
  Clock,
  MapPin,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CreditCard,
  XCircle,
  Truck,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  UtensilsCrossed,
} from 'lucide-react';

type FilterTab = 'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED';

const ACTIVE_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_DELIVERY',
  'OUT_FOR_DELIVERY',
];

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  useEffect(() => {
    loadOrders(1);
  }, []);

  const loadOrders = async (targetPage = 1) => {
    setLoading(true);
    try {
      const response = await orderApi.getMyOrders({ page: targetPage, limit: 8 });
      const ordersList = Array.isArray(response?.data) ? response.data : [];
      setOrders(ordersList);

      if (response?.meta) {
        setMeta(response.meta);
      } else {
        setMeta({
          total: ordersList.length,
          page: targetPage,
          limit: 8,
          totalPages: Math.max(1, Math.ceil(ordersList.length / 8)),
        });
      }
    } catch (err) {
      console.error('Erreur lors du chargement des commandes:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > meta.totalPages || newPage === meta.page || loading) {
      return;
    }
    loadOrders(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayNow = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      const { paymentUrl } = await paymentApi.initiate({ orderId, method: 'STRIPE' });
      window.location.href = paymentUrl;
    } catch (err) {
      console.error('Erreur lors du lancement du paiement:', err);
      setPayingOrderId(null);
    }
  };

  const handleCancelOrder = async () => {
  // On s'assure qu'une commande a bien été sélectionnée
  if (!selectedOrderId) return;

  setCancellingOrderId(selectedOrderId);
  try {
    // 1. Appel de l'API avec le paramètre 'status' corrigé
    const updated = await orderApi.updateStatus(selectedOrderId, 'CANCELLED');
    
    // 2. Mise à jour de la liste locale
    setOrders((prev) => prev.map((o) => (o.id === selectedOrderId ? updated : o)));
    
    // 3. Fermeture automatique du modal après succès
    setIsCancelModalOpen(false);
    setSelectedOrderId(null);
  } catch (err) {
    console.error('Erreur lors de l\'annulation de la commande:', err);
  } finally {
    setCancellingOrderId(null);
  }
};


  const safeOrders = Array.isArray(orders) ? orders : [];

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ACTIVE') {
      return safeOrders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    }
    if (activeTab === 'DELIVERED') {
      return safeOrders.filter((o) => o.status === 'DELIVERED');
    }
    if (activeTab === 'CANCELLED') {
      return safeOrders.filter((o) => o.status === 'CANCELLED');
    }
    return safeOrders;
  }, [safeOrders, activeTab]);

  const activeCount = useMemo(() => {
    return safeOrders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length;
  }, [safeOrders]);

  const deliveredCount = useMemo(() => {
    return safeOrders.filter((o) => o.status === 'DELIVERED').length;
  }, [safeOrders]);

  const cancelledCount = useMemo(() => {
    return safeOrders.filter((o) => o.status === 'CANCELLED').length;
  }, [safeOrders]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-7">
      {/* Refined Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Mes Commandes
            </h1>
            {meta.total > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                {meta.total} {meta.total === 1 ? 'commande' : 'commandes'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Suivi en temps réel de vos délices, préparation en cuisine et livraison express à Douala
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => loadOrders(meta.page)}
            disabled={loading}
            title="Rafraîchir la liste"
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <Link
            to="/"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Commander</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      {!loading && safeOrders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Toutes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {safeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer select-none ${
              activeTab === 'ACTIVE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {activeCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            <span>En cours</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'ACTIVE' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('DELIVERED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              activeTab === 'DELIVERED'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Livrées</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'DELIVERED' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {deliveredCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              activeTab === 'CANCELLED'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Annulées</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'CANCELLED' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cancelledCount}
            </span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200/80 animate-pulse h-36" />
          ))}
        </div>
      ) : safeOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-black text-slate-950">
              Aucune commande passée
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Vous n'avez pas encore passé de commande. Découvrez notre carte de délicieux plats traditionnels camerounais.
            </p>
          </div>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            Découvrir la carte
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-3">
          <p className="text-xs font-semibold text-slate-600">
            Aucune commande dans cet onglet.
          </p>
          <button
            onClick={() => setActiveTab('ALL')}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Voir toutes les commandes
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Refined Order Cards */}
          {filteredOrders.map((order) => {
            const statusStyle = ORDER_STATUS_STYLES[order.status] || {
              bg: 'bg-slate-50',
              text: 'text-slate-700',
              border: 'border-slate-200',
              dot: 'bg-slate-400',
            };

            const isPendingPayment = order.status === 'PENDING' && order.payment?.status !== 'SUCCESS';
            const isPaying = payingOrderId === order.id;
            const isCancelling = cancellingOrderId === order.id;
            const isDelivered = order.status === 'DELIVERED';
            const isCancelled = order.status === 'CANCELLED';
            const isActive = ACTIVE_STATUSES.includes(order.status) && !isPendingPayment;

            const itemsCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
            const displayedItems = (order.items || []).slice(0, 3);
            const remainingCount = (order.items || []).length - 3;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Refined Top Strip */}
                <div className="bg-slate-50/70 px-5 py-3.5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 tracking-tight font-display">
                        Commande #{order.orderNumber ?? order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${statusStyle.dot} ${
                          isActive ? 'animate-pulse' : ''
                        }`}
                      />
                      <span>{ORDER_STATUS_LABELS[order.status] || order.status}</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Items list preview (crisp & clean, not chunky pills) */}
                  <div className="space-y-2.5">
                    {displayedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0 flex items-center justify-center">
                            {item.dishImageUrlSnapshot ? (
                              <img
                                src={item.dishImageUrlSnapshot}
                                alt={item.dishNameSnapshot}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {item.dishNameSnapshot}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Quantité : <strong className="text-slate-700">{item.quantity}</strong>
                            </p>
                          </div>
                        </div>

                        <span className="font-semibold text-slate-800 shrink-0 ml-3">
                          {formatFCFA(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}

                    {remainingCount > 0 && (
                      <p className="text-[11px] font-semibold text-blue-600 pl-12 pt-0.5">
                        + {remainingCount} autre{remainingCount > 1 ? 's' : ''} article{remainingCount > 1 ? 's' : ''} dans cette commande
                      </p>
                    )}
                  </div>

                  {/* Delivery destination snapshot */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-slate-700 font-medium truncate max-w-sm">
                        {order.deliveryAddressSnapshot || 'Douala, Cameroun'}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-500">
                      {itemsCount} {itemsCount > 1 ? 'articles' : 'article'} • Livraison Douala
                    </div>
                  </div>

                  {/* Bottom Strip: Total & Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Montant Total
                      </span>
                      <span className="font-display text-lg sm:text-xl font-black text-slate-950">
                        {formatFCFA(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isPendingPayment && (
                        <>
                          <button
                            onClick={() => handlePayNow(order.id)}
                            disabled={isPaying || isCancelling}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer ${
                              isPaying
                                ? 'bg-amber-300 text-white cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title="Payer la commande par carte"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{isPaying ? 'Redirection...' : 'Payer maintenant'}</span>
                          </button>
                          <button
                              onClick={() => {
                                setSelectedOrderId(order.id); // Stocke l'ID de la commande à annuler
                                setIsCancelModalOpen(true);    // Ouvre le magnifique modal
                              }}
                              disabled={isPaying || cancellingOrderId === order.id}
                              className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                                cancellingOrderId === order.id
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50 shadow-2xs'
                              }`}
                              title="Annuler cette commande"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>{cancellingOrderId === order.id ? 'Annulation...' : 'Annuler'}</span>
                        </button>
                          
                        </>
                      )}

                      <Link
                        to={`/orders/${order.id}`}
                        className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Détails & Suivi</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                Affichage de{' '}
                <span className="font-bold text-slate-900">
                  {(meta.page - 1) * meta.limit + 1}
                </span>{' '}
                à{' '}
                <span className="font-bold text-slate-900">
                  {Math.min(meta.page * meta.limit, meta.total)}
                </span>{' '}
                sur <span className="font-bold text-slate-900">{meta.total}</span> commandes
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1 || loading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Précédent</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      meta.totalPages > 6 &&
                      Math.abs(pageNum - meta.page) > 2 &&
                      pageNum !== 1 &&
                      pageNum !== meta.totalPages
                    ) {
                      if (Math.abs(pageNum - meta.page) === 3) {
                        return (
                          <span key={pageNum} className="px-1 text-slate-400 text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    const isCurrent = pageNum === meta.page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages || loading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 text-xs font-bold shadow-2xs"
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedOrderId(null);
        }}
        onConfirm={handleCancelOrder} // Lance la nouvelle fonction sans window.confirm
        isCancelling={cancellingOrderId !== null}
      />
    </div>
  );
};