import React from 'react';
import { XCircle, X } from 'lucide-react';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCancelling,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
      {/* Arrière-plan flouté et sombre */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={isCancelling ? undefined : onClose}
      />

      {/* Conteneur du Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 p-6 shadow-xl transition-all animate-in zoom-in-95 duration-200 z-10">
        
        {/* Bouton de fermeture d'angle */}
        <button
          onClick={onClose}
          disabled={isCancelling}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contenu de la boîte de dialogue */}
        <div className="text-center space-y-4 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Annuler la commande ?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Voulez-vous vraiment annuler cette commande ? Cette action est irréversible et arrêtera sa préparation.
            </p>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="flex-1 order-2 sm:order-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Conserver la commande
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 order-1 sm:order-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {isCancelling ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Annulation...</span>
              </>
            ) : (
              <span>Confirmer l'annulation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
