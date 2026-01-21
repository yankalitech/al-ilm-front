// src/api/authApi.ts
import useAuthStore from '../store/useAuthStore';
import {getStoredToken} from '../utils/storageUtils'

//export const API_BASE_URL = 'https://al-ilm-test.dev-ci-cd.com/';
export const API_BASE_URL = 'http://192.168.1.108:3000/'
export const options = {
  'Authorization' : `Bearer ${getStoredToken()}`
}
export const getAuthOptions = async () => {
  const token = await getStoredToken();
  return {
    'Authorization': `Bearer ${token}`
  };
}
// Intercepteur pour ajouter automatiquement le token aux requêtes
export const createAuthenticatedFetch = () => {
  return async (url: string, options: RequestInit = {}) => {
    const { token } = useAuthStore.getState();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Ajouter le token si disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Si le token est invalide (401), déconnecter l'utilisateur
    if (response.status === 401) {
      const { logout } = useAuthStore.getState();
      await logout();
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    return response;
  };
};

// Instance de fetch authentifiée
export const authFetch = createAuthenticatedFetch();

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  motDePasse: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}
export interface DeviceLoginCredentials {
  phoneId: string;
}

// Fonctions d'API d'authentification
export const authApi = {

  loginWithDeviceId: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion avec Device ID');
    }

    return data;
  },
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }

    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    return data;
  },

  logout: async (): Promise<void> => {
    await authFetch('/api/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    const response = await authFetch('/api/auth/me');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des informations utilisateur');
    }

    return response.json();
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await authFetch('/api/auth/refresh', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors du rafraîchissement du token');
    }

    return data;
  },
};
