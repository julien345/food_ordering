import React from 'react';
import { DashboardStats, OrderStatus } from '../../types';
import { formatFCFA } from '../../utils/format';
import { getDishImageUrl } from '../../utils/image';
import {
  TrendingUp,
  Coins,
  Users,
  ShoppingBag,
  Award,
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Truck,
  XCircle,
  ArrowRight,
  Flame,
  UtensilsCrossed,
} from 'lucide-react';

interface AdminAnalyticsViewProps {
  stats: DashboardStats;
  totalOrdersCount: number;
  onFilterStatusSelect?: (status: OrderStatus | 'ALL') => void;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  stats,
  totalOrdersCount,
  onFilterStatusSelect,
}) => {
  const statusConfigs = [
    {
      key: 'PENDING' as OrderStatus,
      label: 'En attente',
      description: 'Paiement ou confirmation client',
      count: stats.orderCountsByStatus.PENDING || 0,
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-500',
    },
    {
      key: 'CONFIRMED' as OrderStatus,
      label: 'Confirmées',
      description: 'Validées, prêtes pour la cuisine',
      count: stats.orderCountsByStatus.CONFIRMED || 0,
      icon: CheckCircle2,
      color: 'blue',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      badge: 'bg-blue-500',
    },
    {
      key: 'PREPARING' as OrderStatus,
      label: 'En cuisine',
      description: 'En cours de préparation',
      count: stats.orderCountsByStatus.PREPARING || 0,
      icon: ChefHat,
      color: 'orange',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      badge: 'bg-orange-500',
    },
    {
      key: 'READY_FOR_DELIVERY' as OrderStatus,
      label: 'Prêtes',
      description: 'Cuites, en attente de coursier',
      count: stats.orderCountsByStatus.READY_FOR_DELIVERY ?? stats.orderCountsByStatus.READY ?? 0,
      icon: PackageCheck,
      color: 'sky',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-800',
      badge: 'bg-sky-500',
    },
    {
      key: 'OUT_FOR_DELIVERY' as OrderStatus,
      label: 'En cours de livraison',
      description: 'Prise en charge par un livreur',
      count: stats.orderCountsByStatus.OUT_FOR_DELIVERY || 0,
      icon: Truck,
      color: 'indigo',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-800',
      badge: 'bg-indigo-500',
    },
    {
      key: 'DELIVERED' as OrderStatus,
      label: 'Livrées',
      description: 'Remises aux clients avec succès',
      count: stats.orderCountsByStatus.DELIVERED || 0,
      icon: CheckCircle2,
      color: 'emerald',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badge: 'bg-emerald-500',
    },
    {
      key: 'CANCELLED' as OrderStatus,
      label: 'Annulées',
      description: 'Commandes annulées ou rejetées',
      count: stats.orderCountsByStatus.CANCELLED || 0,
      icon: XCircle,
      color: 'rose',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      badge: 'bg-rose-500',
    },
  ];

  const maxDishSold = Math.max(
    1,
    ...(stats.topDishes || []).map((d) => d.totalQuantitySold || 0)
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Top Metric Cards (4 Colonnes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Chiffre d'Affaires */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chiffre d'Affaires
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              {formatFCFA(stats.totalRevenue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sur les commandes livrées et encaissées
            </p>
          </div>
        </div>

        {/* Card 2: Panier Moyen */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Panier Moyen
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              {formatFCFA(stats.averageOrderValue)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Dépense moyenne par commande
            </p>
          </div>
        </div>

        {/* Card 3: Total des Commandes */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Commandes
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Commandes enregistrées au total
            </p>
          </div>
        </div>

        {/* Card 4: Clients */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Clients Enregistrés
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="font-display text-2xl sm:text-3xl font-black text-slate-900">
              {stats.newClientsLast30Days}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Clients actifs sur la plateforme
            </p>
          </div>
        </div>
      </div>

      {/* 2. Suivi des Commandes par Statut */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900">
              Suivi Opérationnel des Commandes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cliquez sur un statut pour filtrer directement la liste des commandes
            </p>
          </div>
          {onFilterStatusSelect && (
            <button
              onClick={() => onFilterStatusSelect('ALL')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>Voir toutes les commandes</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Grid des statuts avec statuts distincts pour 'Prêtes' et 'En cours de livraison' */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
          {statusConfigs.map((cfg) => {
            const IconComponent = cfg.icon;
            return (
              <button
                key={cfg.key}
                onClick={() => onFilterStatusSelect && onFilterStatusSelect(cfg.key)}
                className={`text-left p-4 rounded-2xl border transition group cursor-pointer hover:shadow-md ${cfg.bg} ${cfg.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center ${cfg.text} shadow-xs`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="font-display font-black text-xl text-slate-900">
                    {cfg.count}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 line-clamp-1">
                    {cfg.label}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {cfg.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Top Plats Vendus */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900">
                Top 5 des Plats les Plus Commandés
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Plats générant le plus de commandes auprès de vos clients
              </p>
            </div>
          </div>
        </div>

        {(!stats.topDishes || stats.topDishes.length === 0) ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl space-y-2">
            <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              Aucune vente enregistrée pour le moment. Les plats les plus populaires s'afficheront ici.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.topDishes.map((dish, idx) => {
              const pct = Math.round((dish.totalQuantitySold / maxDishSold) * 100);
              const imgUrl = getDishImageUrl(dish.image);

              return (
                <div
                  key={dish.dishId || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-[200px]">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 font-display font-bold text-xs text-slate-700 flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                      <img
                        src={imgUrl}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 line-clamp-1">
                        {dish.name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {dish.totalQuantitySold} portion{dish.totalQuantitySold > 1 ? 's' : ''} vendue{dish.totalQuantitySold > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 max-w-md flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-10 text-right">
                      {dish.totalQuantitySold}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
