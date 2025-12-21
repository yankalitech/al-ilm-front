// src/store/useAuthStore.ts - Version temporaire sans persistance
import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setToken: (token: string, user: User) => void;
  checkAuthStatus: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>((set, get) => ({
  // État initial
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      // Simulation d'un appel API - remplacez par votre vraie URL
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      // Stockage du token et des infos utilisateur (en mémoire seulement)
      set({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      // Optionnel : appel API pour invalider le token côté serveur
      const { token } = get();
      if (token) {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    }

    // Nettoyage du state
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  setToken: (token: string, user: User) => {
    set({
      token,
      user,
      isAuthenticated: true,
      error: null,
    });
  },

  checkAuthStatus: async () => {
    // Sans persistance, on considère que l'utilisateur n'est pas connecté au démarrage
    set({ isAuthenticated: false, isLoading: false });
  },
}));

export default useAuthStore;