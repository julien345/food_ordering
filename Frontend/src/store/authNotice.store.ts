import { create } from 'zustand';

interface AuthNoticeState {
  isOpen: boolean;
  message: string;
  subMessage: string;
  redirectUrl: string;
  secondsRemaining: number;
  triggerAuthNotice: (customMessage?: string, redirectUrl?: string) => void;
  closeNotice: () => void;
  tickSecond: () => void;
}

export const useAuthNoticeStore = create<AuthNoticeState>((set, get) => ({
  isOpen: false,
  message: "Vous devez avoir un compte pour commander avant d'être redirigé",
  subMessage: 'Choisissez une option ci-dessous ou laissez-vous rediriger...',
  redirectUrl: '/login?reason=order_auth_required',
  secondsRemaining: 10,

  triggerAuthNotice: (
    customMessage = "Vous devez avoir un compte pour commander avant d'être redirigé",
    redirectUrl = '/login?reason=order_auth_required'
  ) => {
    set({
      isOpen: true,
      message: customMessage,
      subMessage: 'Choisissez une option ci-dessous ou laissez-vous rediriger...',
      redirectUrl,
      secondsRemaining: 10,
    });
  },

  closeNotice: () => {
    set({ isOpen: false });
  },

  tickSecond: () => {
    const current = get().secondsRemaining;
    if (current > 1) {
      set({ secondsRemaining: current - 1 });
    } else {
      set({ secondsRemaining: 0, isOpen: false });
    }
  },
}));
