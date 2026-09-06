import React, { useState, useEffect } from 'react';
import { deliveryApi } from '../api/delivery.api';
import { Delivery } from '../types';
import { formatFCFA, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '../utils/format';
import { useAuthStore } from '../store/auth.store';
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  RefreshCw,
  Navigation,
} from 'lucide-react';

export const DeliveryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const data = await deliveryApi.getMyDeliveries();
      setDeliveries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (deliveryId: string) => {
    try {
      await deliveryApi.markAsDelivered(deliveryId);
      setFeedback('Livraison marquée comme effectuée avec succès !');
      setTimeout(() => setFeedback(null), 4000);
      loadDeliveries();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de la confirmation');
    }
  };

  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];
  const activeDeliveries = safeDeliveries.filter((d) => d && !d.deliveredAt);
  const completedDeliveries = safeDeliveries.filter((d) => d && !!d.deliveredAt);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Espace Livreur Julien's Food</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900">
            Mes Livraisons Assignées
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connecté en tant que : <strong className="text-slate-800">{user?.firstName} {user?.lastName}</strong> ({user?.phone})
          </p>
        </div>

        <button
          onClick={loadDeliveries}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Actualiser</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Active Deliveries */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
          <span>Livraisons en cours ({activeDeliveries.length})</span>
        </h2>

        {loading ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 animate-pulse h-36" />
        ) : activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
            <Truck className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-display font-bold text-slate-800 text-sm">
              Aucune course en cours
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Dès qu'une commande sera prête en cuisine à Douala et vous sera assignée par l'administrateur, elle apparaîtra ici.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => {
              const order = delivery.order;
              return (
                <div
                  key={delivery.id}
                  className="bg-white rounded-3xl border-2 border-blue-500 p-6 shadow-md ring-4 ring-blue-50 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-display text-lg font-extrabold text-blue-900">
                        Commande #{order?.orderNumber || '—'}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        Assignée le {formatDate(delivery.createdAt)}
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      En cours d'acheminement
                    </span>
                  </div>

                  {/* Destination Address snapshot */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Adresse de livraison :
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {order?.deliveryAddressSnapshot || 'Douala'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="text-xs text-slate-600">
                      Montant encaissé / Payé :{' '}
                      <strong className="text-blue-700 font-extrabold text-sm">
                        {formatFCFA(order?.totalAmount)}
                      </strong>
                    </div>

                    <button
                      onClick={() => handleMarkDelivered(delivery.id)}
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/20 text-xs sm:text-sm flex items-center gap-2 transition active:scale-98 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirmer la livraison effectuée</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Deliveries History */}
      {completedDeliveries.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Historique de mes livraisons terminées ({completedDeliveries.length})
          </h2>

          <div className="space-y-3">
            {completedDeliveries.map((del) => (
              <div
                key={del.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <span className="font-display font-bold text-slate-900 text-sm">
                    Commande #{del.order?.orderNumber || '—'}
                  </span>
                  <p className="text-slate-500 mt-0.5 truncate max-w-md">
                    {del.order?.deliveryAddressSnapshot}
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Livrée avec succès
                  </span>
                  {del.deliveredAt && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatDate(del.deliveredAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
