import { OrderStatus } from '../types';

/**
 * Format price in Franc CFA (FCFA) with space thousands separator, no decimals
 * Example: 5000 -> "5 000 FCFA"
 */
export function formatFCFA(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 FCFA';
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Human readable labels for OrderStatus
 */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  READY_FOR_DELIVERY: 'Prête pour la livraison',
  OUT_FOR_DELIVERY: 'En cours de livraison',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

/**
 * Badge styling for each status adhering to blue/white/neutral palette
 */
export const ORDER_STATUS_STYLES: Record<
  OrderStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  CONFIRMED: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
  },
  PREPARING: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-600',
  },
  READY_FOR_DELIVERY: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  OUT_FOR_DELIVERY: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    dot: 'bg-blue-600 animate-pulse',
  },
  DELIVERED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-600',
  },
  CANCELLED: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

/**
 * Format ISO date to French display
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export { extractApiErrorMessage } from './error';

