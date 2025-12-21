// src/utils/storageUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés pour le storage (centralisées)
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  REFRESH_TOKEN: 'refresh_token',
  AUTO_LOGIN_ENABLED: 'auto_login_enabled',
  DEVICE_ID: 'device_id'
} as const;

// Types pour les données stockées
export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

// Classe utilitaire pour la gestion du storage
export class StorageUtils {
  
  // Récupérer le token d'authentification
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  // Récupérer les données utilisateur
  static async getUser(): Promise<StoredUser | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  // Récupérer le refresh token
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Erreur lors de la récupération du refresh token:', error);
      return null;
    }
  }

  // Vérifier si l'auto-login est activé
  static async isAutoLoginEnabled(): Promise<boolean> {
    try {
      const autoLoginEnabled = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED);
      return autoLoginEnabled === 'true';
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'auto-login:', error);
      return false;
    }
  }

  // Récupérer l'ID du dispositif
  static async getDeviceId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID du dispositif:', error);
      return null;
    }
  }

  // Sauvegarder le token
  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      throw error;
    }
  }

  // Sauvegarder les données utilisateur
  static async setUser(user: StoredUser): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
      throw error;
    }
  }

  // Sauvegarder le refresh token
  static async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du refresh token:', error);
      throw error;
    }
  }

  // Activer/désactiver l'auto-login
  static async setAutoLoginEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Erreur lors de la configuration de l\'auto-login:', error);
      throw error;
    }
  }

  // Sauvegarder l'ID du dispositif
  static async setDeviceId(deviceId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'ID du dispositif:', error);
      throw error;
    }
  }

  // Récupérer toutes les données d'authentification en une fois
  static async getAuthData(): Promise<{
    token: string | null;
    user: StoredUser | null;
    refreshToken: string | null;
    autoLoginEnabled: boolean;
    deviceId: string | null;
  }> {
    try {
      const [token, userJson, refreshToken, autoLoginEnabledStr, deviceId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID)
      ]);

      return {
        token,
        user: userJson ? JSON.parse(userJson) : null,
        refreshToken,
        autoLoginEnabled: autoLoginEnabledStr === 'true',
        deviceId
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'authentification:', error);
      return {
        token: null,
        user: null,
        refreshToken: null,
        autoLoginEnabled: false,
        deviceId: null
      };
    }
  }

  // Sauvegarder toutes les données d'authentification en une fois
  static async setAuthData(data: {
    token?: string;
    user?: StoredUser;
    refreshToken?: string;
    autoLoginEnabled?: boolean;
    deviceId?: string;
  }): Promise<void> {
    try {
      const operations: Promise<void>[] = [];

      if (data.token !== undefined) {
        operations.push(AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token));
      }
      if (data.user !== undefined) {
        operations.push(AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user)));
      }
      if (data.refreshToken !== undefined) {
        operations.push(AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken));
      }
      if (data.autoLoginEnabled !== undefined) {
        operations.push(AsyncStorage.setItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED, data.autoLoginEnabled.toString()));
      }
      if (data.deviceId !== undefined) {
        operations.push(AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, data.deviceId));
      }

      await Promise.all(operations);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données d\'authentification:', error);
      throw error;
    }
  }

  // Nettoyer toutes les données d'authentification
  static async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.AUTO_LOGIN_ENABLED
      ]);
      console.log('Données d\'authentification nettoyées');
    } catch (error) {
      console.error('Erreur lors du nettoyage des données d\'authentification:', error);
      throw error;
    }
  }

  // Nettoyer complètement le storage (y compris device ID)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('Toutes les données nettoyées');
    } catch (error) {
      console.error('Erreur lors du nettoyage complet:', error);
      throw error;
    }
  }

  // Vérifier si l'utilisateur est connecté
  static async isUserLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      return !!(token && user);
    } catch (error) {
      console.error('Erreur lors de la vérification de connexion:', error);
      return false;
    }
  }

  // Obtenir des informations de debug sur le storage
  static async getStorageDebugInfo(): Promise<Record<string, any>> {
    try {
      const authData = await this.getAuthData();
      return {
        hasToken: !!authData.token,
        tokenLength: authData.token?.length || 0,
        hasUser: !!authData.user,
        userId: authData.user?.id || null,
        userEmail: authData.user?.email || null,
        hasRefreshToken: !!authData.refreshToken,
        autoLoginEnabled: authData.autoLoginEnabled,
        hasDeviceId: !!authData.deviceId,
        deviceId: authData.deviceId
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des infos de debug:', error);
      return {};
    }
  }
}

// Fonctions utilitaires rapides (pour une utilisation simple)
export const getStoredToken = () => StorageUtils.getToken();
export const getStoredUser = () => StorageUtils.getUser();
export const getStoredRefreshToken = () => StorageUtils.getRefreshToken();
export const isAutoLoginEnabled = () => StorageUtils.isAutoLoginEnabled();
export const getStoredDeviceId = () => StorageUtils.getDeviceId();
export const isUserLoggedIn = () => StorageUtils.isUserLoggedIn();

// Export par défaut
export default StorageUtils;