import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, ArrowRight, UserPlus, X, Pause, Play } from 'lucide-react';
import { useAuthNoticeStore } from '../../store/authNotice.store';

export const AuthRequiredModal: React.FC = () => {
  const {
    isOpen,
    message,
    subMessage,
    redirectUrl,
    secondsRemaining,
    closeNotice,
    tickSecond,
  } = useAuthNoticeStore();

  const navigate = useNavigate();
  const timerRef = useRef<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsPaused(false);
      return;
    }

    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const state = useAuthNoticeStore.getState();
      if (state.secondsRemaining <= 1) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        closeNotice();
        navigate(state.redirectUrl);
      } else {
        tickSecond();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, isPaused, navigate, closeNotice, tickSecond]);

  if (!isOpen) return null;

  const handleImmediateLogin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    closeNotice();
    navigate(redirectUrl);
  };

  const handleImmediateRegister = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    closeNotice();
    navigate('/register');
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    closeNotice();
  };

  return (
    <div
      id="auth-required-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="auth-required-modal-card"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-950/20 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          id="auth-required-close-btn"
          onClick={handleCancel}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Badge */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-800 text-[11px] font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Authentification requise</span>
            </div>
            <h3 className="font-display text-lg font-extrabold text-slate-950 leading-tight">
              Compte requis pour commander
            </h3>
          </div>
        </div>

        {/* User Message */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 font-medium leading-relaxed space-y-1">
          <p className="font-bold text-amber-950 text-sm">
            {message}
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            {subMessage}
          </p>
        </div>

        {/* Visual Countdown Progress Bar & Pause Toggle */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              {isPaused ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-amber-700 font-bold">Minuteur en pause</span>
                </>
              ) : (
                <>
                  <span>Redirection vers la connexion dans :</span>
                  <strong className="text-blue-600 font-black">{secondsRemaining}s</strong>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-2 py-0.5 rounded-md hover:bg-slate-200/60 transition cursor-pointer"
              title={isPaused ? 'Reprendre le décompte' : 'Mettre en pause'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3 h-3 text-blue-600 fill-blue-600" />
                  <span>Reprendre</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-slate-500" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </div>

          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isPaused ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.max(0, (secondsRemaining / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Actions - Clear, spacious, easily clickable */}
        <div className="space-y-2.5 pt-1">
          <button
            id="auth-required-login-now-btn"
            onClick={handleImmediateLogin}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm transition active:scale-[0.99] cursor-pointer"
          >
            <span>Se connecter à mon compte</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="auth-required-register-btn"
              onClick={handleImmediateRegister}
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl flex items-center justify-center gap-1.5 text-xs transition active:scale-[0.99] cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Créer un compte</span>
            </button>

            <button
              id="auth-required-cancel-btn"
              onClick={handleCancel}
              className="py-3 px-3 bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-800 font-semibold rounded-2xl text-xs transition cursor-pointer border border-slate-200"
            >
              Continuer à explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
