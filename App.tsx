// App.tsx - Version avec authentification persistante complète
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet, Text, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUniqueId, getDeviceId } from 'react-native-device-info';
import RootNavigator from './src/navigation/RootNavigator';
import useAuthStore from './src/store/useAuthStore';
import { authApi } from './src/api/authApi';
//jjk
// Clés pour le storage
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ROLE: 'auth_role',
  REFRESH_TOKEN: 'refresh_token',
  AUTO_LOGIN_ENABLED: 'auto_login_enabled',
  DEVICE_ID: 'device_id'
};

// Fonction pour obtenir un ID unique du dispositif
const getDeviceUniqueId = async (): Promise<string> => {
  try {
    // Essayer d'abord de récupérer l'ID stocké
    const storedDeviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (storedDeviceId) {
      return storedDeviceId;
    }

    // Générer un nouvel ID unique basé sur les infos du dispositif
    let deviceId = '';
    
    try {
      // Tentative avec react-native-device-info si disponible
      const uniqueId = await getUniqueId();
      deviceId = uniqueId;
    } catch (error) {
      try {
        // Fallback avec getDeviceId
        const fallbackId = await getDeviceId();
        deviceId = fallbackId;
      } catch (fallbackError) {
        // Générer un ID aléaoire si rien d'autre ne fonctionne
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
    }

    // Stocker l'ID pour les futures utilisations
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    return deviceId;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ID du dispositif:', error);
    // ID de fallback
    return `fallback_${Date.now()}_${Platform.OS}`;
  }
};

// Interface pour la connexion avec device ID
interface DeviceLoginCredentials {
  phoneId: string;
}

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initStatus, setInitStatus] = useState('Initialisation...');
  const { token, login, logout } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitStatus('Initialisation...');

        // Étape 1: Obtenir l'ID unique du dispositif
        const deviceId = await getDeviceUniqueId();
        console.log('Device ID récupéré:', deviceId);

        setInitStatus('Vérification du token existant...');

        // Étape 2: Récupérer le token et les infos utilisateur du storage
        const [storedToken, storedUser, autoLoginEnabled] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER),
          AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED)
        ]);
        // Étape 4: Aucun token valide, tentative de connexion automatique avec Device ID
        console.log('Tentative de connexion automatique avec Device ID...', deviceId);
        setInitStatus('Connexion automatique avec Device ID...');
        
        try {
          // Préparer les credentials de connexion avec Device ID
          const deviceCredentials: DeviceLoginCredentials = {
            phoneId: deviceId
          };

          // Appel à l'API de connexion avec Device ID
          // Vous devrez adapter votre API pour accepter ce type de connexion
          const response = await authApi.loginWithDeviceId(deviceCredentials);
          console.log('result connect --------', response)
          // await login(response.user, response.token);
          
          // Sauvegarder les informations de connexion
          await Promise.all([
            AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token),
            AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.utilisateur)),
            AsyncStorage.setItem(STORAGE_KEYS.ROLE, JSON.stringify(response?.utilisateur?.role)),
            AsyncStorage.setItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED, 'true')
          ]);
          
          console.log('Connexion automatique réussie avec Device ID pour:', AsyncStorage.getItem(STORAGE_KEYS.TOKEN), response.utilisateur);
          setInitStatus('Connecté automatiquement');
          return;
        } catch (loginError) {
          console.log('Échec de la connexion automatique avec Device ID:', loginError);
          setInitStatus('Connexion automatique échouée');
        }

        // Étape 5: Aucune connexion possible, démarrer en mode déconnecté
        console.log('Démarrage en mode déconnecté');
        setInitStatus('Prêt - Mode déconnecté');
        
      } catch (error) {
        console.error('Erreur critique lors de l\'initialisation:', error);
        setInitStatus('Erreur de démarrage');
        
        // Nettoyer le storage en cas d'erreur critique
        try {
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.REFRESH_TOKEN
          ]);
          await logout();
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage:', cleanupError);
        }
      } finally {
        // Attendre un peu pour que l'utilisateur puisse voir le statut final
        setTimeout(() => {
          setIsInitializing(false);
        }, 1000);
      }
    };

    // Fonction pour sauvegarder automatiquement les changements d'état auth
    const setupAuthPersistence = () => {
      const { subscribe } = useAuthStore;
      
      subscribe((state) => {
        if (state.token && state.user) {
          // Sauvegarder quand l'utilisateur se connecte
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, state.token);
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
        } else {
          // Nettoyer quand l'utilisateur se déconnecte
          AsyncStorage.multiRemove([
            STORAGE_KEYS.TOKEN,
            STORAGE_KEYS.USER,
            STORAGE_KEYS.REFRESH_TOKEN
          ]);
        }
      });
    };

    initializeApp();
    setupAuthPersistence();
  }, []);

  // Afficher un écran de chargement pendant l'initialisation
  if (isInitializing) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{initStatus}</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar} />
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    minHeight: 24,
  },
  progressContainer: {
    width: '60%',
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
});