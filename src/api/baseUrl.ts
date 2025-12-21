// src/api/baseUrl.ts - Version mise à jour avec authentification
import useAuthStore from '../store/useAuthStore';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Interface pour les options de requête
interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
}

// Fonction utilitaire pour créer des requêtes authentifiées
export const createApiRequest = async (
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<Response> => {
  const { requireAuth = true, ...requestOptions } = options;
  
  // Configuration des headers par défaut
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...requestOptions.headers,
  };

  // Ajouter le token d'authentification si nécessaire
  if (requireAuth) {
    const { token, logout } = useAuthStore.getState();
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }
    
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers,
    });

    // Gestion automatique de la déconnexion en cas de token invalide
    if (response.status === 401 && requireAuth) {
      const { logout } = useAuthStore.getState();
      await logout();
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    return response;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Fonctions utilitaires pour les différents types de requêtes
export const apiGet = (endpoint: string, options: ApiRequestOptions = {}) => {
  return createApiRequest(endpoint, { 
    ...options, 
    method: 'GET' 
  });
};

export const apiPost = (endpoint: string, data: any = null, options: ApiRequestOptions = {}) => {
  return createApiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiPut = (endpoint: string, data: any = null, options: ApiRequestOptions = {}) => {
  return createApiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiDelete = (endpoint: string, options: ApiRequestOptions = {}) => {
  return createApiRequest(endpoint, {
    ...options,
    method: 'DELETE',
  });
};

// Fonction pour les requêtes publiques (sans authentification)
export const publicApiRequest = (endpoint: string, options: RequestInit = {}) => {
  return createApiRequest(endpoint, { 
    ...options, 
    requireAuth: false 
  });
};