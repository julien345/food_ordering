import React from 'react';
import { OrderStatus } from '../../types';
import {
  CreditCard,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Truck,
  Check,
  XCircle,
} from 'lucide-react';
import { ORDER_STATUS_LABELS } from '../../utils/format';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
  hideContainer?: boolean;
}

interface StepInfo {
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  description: string;
}

const STEPS: StepInfo[] = [
  {
    status: 'PENDING',
    label: 'En attente',
    icon: CreditCard,
    description: 'Paiement en attente de validation',
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmée',
    icon: CheckCircle2,
    description: 'Commande validée par la cuisine',
  },
  {
    status: 'PREPARING',
    label: 'En préparation',
    icon: ChefHat,
    description: 'Nos chefs préparent vos plats',
  },
  {
    status: 'READY_FOR_DELIVERY',
    label: 'Prête',
    icon: PackageCheck,
    description: 'Emballée, prête pour le coursier',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'En route',
    icon: Truck,
    description: 'Livreur en route vers votre adresse',
  },
  {
    status: 'DELIVERED',
    label: 'Livrée',
    icon: Check,
    description: 'Repas livré avec succès. Bon appétit !',
  },
];

const ORDERED_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_DELIVERY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  hideContainer = false,
}) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <XCircle className="w-6 h-6" />
        </div>
        <h4 className="font-display font-bold text-rose-900 text-base">
          Commande Annulée
        </h4>
        <p className="text-xs text-rose-600 mt-1 max-w-sm mx-auto">
          Cette commande a été annulée. Contactez notre restaurant au +237 699 11 22 33 pour plus d'informations.
        </p>
      </div>
    );
  }

  const currentIndex = ORDERED_STATUSES.indexOf(currentStatus);

  const content = (
    <>
      {!hideContainer && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Statut actuel
            </span>
            <h3 className="font-display text-lg font-bold text-blue-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              {ORDER_STATUS_LABELS[currentStatus]}
            </h3>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Étape {Math.max(1, currentIndex + 1)} sur 6
          </span>
        </div>
      )}

      {/* Desktop Horizontal Stepper */}
      <div className="hidden lg:grid grid-cols-6 gap-2 relative">
        {/* Connecting progress bar */}
        <div className="absolute top-5 left-[8%] right-[8%] h-1 bg-slate-100 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.status}
              className="flex flex-col items-center text-center relative z-10"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isPassed
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-105'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}
              >
                {isPassed ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              <div className="mt-3">
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-blue-700 font-extrabold'
                      : isPassed
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight line-clamp-2 px-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile / Tablet Vertical Stepper */}
      <div className="lg:hidden space-y-3 pt-2">
        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-start gap-3.5">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isPassed
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isPassed ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-0.5 h-5 my-0.5 ${
                      isPassed ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>

              <div className="pt-0.5">
                <p
                  className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-blue-700 font-extrabold'
                      : isPassed
                      ? 'text-slate-900'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  if (hideContainer) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
      {content}
    </div>
  );
};
