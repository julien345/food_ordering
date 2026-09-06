import { create } from 'zustand';
import { CartItem, Dish } from '../types';
import { cartApi } from '../api/cart.api';
import { dishApi } from '../api/dish.api';
import { useAuthStore } from './auth.store';

const GUEST_CART_STORAGE_KEY = 'julien_guest_cart';

interface StoredGuestCart {
  items: CartItem[];
  total: number;
}

const loadGuestCartFromStorage = (): StoredGuestCart => {
  try {
    const saved = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.items)) {
        return {
          items: parsed.items,
          total: typeof parsed.total === 'number' ? parsed.total : 0,
        };
      }
    }
  } catch {
    // ignore
  }
  return { items: [], total: 0 };
};

const saveGuestCartToStorage = (items: CartItem[], total: number) => {
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify({ items, total }));
  } catch {
    // ignore
  }
};

interface CartState {
  items: CartItem[];
  total: number;
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addItem: (dishId: string, quantity?: number, dishObj?: Dish) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncGuestCartToServer: () => Promise<void>;
  resetLocalCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getItemCount: () => number;
}

const initialGuest = loadGuestCartFromStorage();

export const useCartStore = create<CartState>((set, get) => ({
  items: initialGuest.items,
  total: initialGuest.total,
  isLoading: false,
  isOpen: false,
  error: null,

  fetchCart: async () => {
    const isAuth = useAuthStore.getState().isAuthenticated;
    if (!isAuth) {
      const guest = loadGuestCartFromStorage();
      set({ items: guest.items, total: guest.total, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await cartApi.getCart();
      set({
        items: data.items || [],
        total: data.total || 0,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.error || 'Erreur chargement panier',
      });
    }
  },

  addItem: async (dishId: string, quantity = 1, dishObj?: Dish) => {
    const isAuth = useAuthStore.getState().isAuthenticated;

    // GUEST VISITOR FLOW (Client-side persistence in localStorage)
    if (!isAuth) {
      set({ isLoading: true, error: null });
      let resolvedDish = dishObj;

      if (!resolvedDish) {
        const existing = get().items.find((it) => it.dishId === dishId);
        if (existing) {
          resolvedDish = existing.dish;
        } else {
          try {
            resolvedDish = await dishApi.getById(dishId);
          } catch {
            // fallback
          }
        }
      }

      if (!resolvedDish) {
        set({ isLoading: false, error: 'Plat introuvable' });
        return;
      }

      const currentItems = [...get().items];
      const existingIndex = currentItems.findIndex((it) => it.dishId === dishId);

      if (existingIndex >= 0) {
        currentItems[existingIndex] = {
          ...currentItems[existingIndex],
          quantity: currentItems[existingIndex].quantity + quantity,
        };
      } else {
        currentItems.push({
          id: `guest-${dishId}`,
          dishId,
          quantity,
          dish: resolvedDish,
        });
      }

      const newTotal = currentItems.reduce(
        (sum, it) => sum + (it.dish?.price || 0) * it.quantity,
        0
      );

      saveGuestCartToStorage(currentItems, newTotal);
      set({
        items: currentItems,
        total: newTotal,
        isLoading: false,
        isOpen: true, // open drawer to confirm added item
      });
      return;
    }

    // AUTHENTICATED USER FLOW (Server API)
    set({ isLoading: true, error: null });
    try {
      await cartApi.addItem({ dishId, quantity });
      await get().fetchCart();
      set({ isOpen: true }); // Open cart drawer to confirm addition
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        "Impossible d'ajouter cet article au panier";
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  updateItemQuantity: async (itemId: string, quantity: number) => {
    const isAuth = useAuthStore.getState().isAuthenticated;

    if (!isAuth) {
      if (quantity <= 0) {
        await get().removeItem(itemId);
        return;
      }
      const updated = get().items.map((it) =>
        it.id === itemId ? { ...it, quantity } : it
      );
      const newTotal = updated.reduce(
        (sum, it) => sum + (it.dish?.price || 0) * it.quantity,
        0
      );
      saveGuestCartToStorage(updated, newTotal);
      set({ items: updated, total: newTotal });
      return;
    }

    if (quantity <= 0) {
      await get().removeItem(itemId);
      return;
    }
    try {
      await cartApi.updateItem(itemId, quantity);
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Erreur mise à jour' });
    }
  },

  removeItem: async (itemId: string) => {
    const isAuth = useAuthStore.getState().isAuthenticated;

    if (!isAuth) {
      const updated = get().items.filter((it) => it.id !== itemId);
      const newTotal = updated.reduce(
        (sum, it) => sum + (it.dish?.price || 0) * it.quantity,
        0
      );
      saveGuestCartToStorage(updated, newTotal);
      set({ items: updated, total: newTotal });
      return;
    }

    try {
      await cartApi.removeItem(itemId);
      await get().fetchCart();
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Erreur suppression' });
    }
  },

  clearCart: async () => {
    const isAuth = useAuthStore.getState().isAuthenticated;

    if (!isAuth) {
      saveGuestCartToStorage([], 0);
      set({ items: [], total: 0 });
      return;
    }

    try {
      await cartApi.clearCart();
      set({ items: [], total: 0 });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Erreur vidage panier' });
    }
  },

  syncGuestCartToServer: async () => {
    const guestCart = loadGuestCartFromStorage();
    if (guestCart.items && guestCart.items.length > 0) {
      try {
        for (const item of guestCart.items) {
          try {
            await cartApi.addItem({ dishId: item.dishId, quantity: item.quantity });
          } catch {
            // continue syncing others
          }
        }
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    await get().fetchCart();
  },

  resetLocalCart: () => {
    saveGuestCartToStorage([], 0);
    set({ items: [], total: 0, error: null });
  },

  setIsOpen: (isOpen: boolean) => set({ isOpen }),

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
