import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { authApi } from './../api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useNavigation } from '@react-navigation/native';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ROLE: 'auth_role',
  REFRESH_TOKEN: 'refresh_token',
  AUTO_LOGIN_ENABLED: 'auto_login_enabled',
  DEVICE_ID: 'device_id'
};

interface DeviceLoginCredentials {
  email: string;
  motDePasse: string;
}

export default function AdminLoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
   const [loginSuccess, setLoginSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fonction de navigation interne pour gérer l'authentification réussie
  const handleLoginSuccessInternal = () => {
    setIsAuthenticated(true);
    // Si une fonction onLoginSuccess est fournie, l'appeler
    setLoginSuccess(true)
  }
  // Vérification des informations de connexion au montage du composant
  useEffect(() => {

    // Fonction de fermeture interne
    const handleCloseInternal = () => {
      // Si une fonction onClose est fournie, l'appeler
      if (loginSuccess) {
        setLoginSuccess(false)
      }
      // Sinon, vous pouvez ajouter une logique de navigation par défaut
      // Par exemple : navigation.goBack() ou navigation.navigate('Home')
    };
      checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      setIsCheckingStorage(true);
      
      const [
        token,
        user,
        role,
        autoLoginEnabled
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ROLE),
        AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED)
      ]);

      console.log('Vérification des données stockées:', {
        hasToken: !!token,
        hasUser: !!user,
        hasRole: !!role,
        autoLoginEnabled
      });

      // Si toutes les informations nécessaires sont présentes et l'auto-login est activé
      if (token && user && role && autoLoginEnabled === 'true') {
        try {
          const parsedUser = JSON.parse(user);
          const parsedRole = JSON.parse(role);
          
          console.log('Utilisateur trouvé en stockage:', parsedUser);
          console.log('Rôle trouvé en stockage:', parsedRole);

          // Optionnel: Vérifier la validité du token avec l'API
          // await validateTokenWithAPI(token);

          // Si tout est valide, rediriger automatiquement
          Alert.alert(
            'Connexion automatique', 
            `Bienvenue ${parsedUser.nom || parsedUser.email}`,
            [
              {
                text: 'Continuer',
                onPress: () => {
                  handleLoginSuccessInternal();
                }
              },
              {
                text: 'Se déconnecter',
                style: 'destructive',
                onPress: clearStorageAndShowLogin
              }
            ]
          );
        } catch (parseError) {
          console.error('Erreur lors du parsing des données:', parseError);
          clearStorageAndShowLogin();
        }
      } else {
        // Aucune information valide trouvée, afficher le formulaire de connexion
        setShowLoginForm(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du stockage:', error);
      setShowLoginForm(true);
    } finally {
      setIsCheckingStorage(false);
    }
  };

  // Optionnel: Valider le token avec l'API
  const validateTokenWithAPI = async (token: string) => {
    try {
      // Remplacez par votre endpoint de validation
      const response = await authApi.validateToken(token);
      if (!response.ok) {
        throw new Error('Token invalide');
      }
      return true;
    } catch (error) {
      console.error('Token invalide:', error);
      throw error;
    }
  };

  const clearStorageAndShowLogin = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.ROLE),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED),
      ]);
      console.log('Stockage nettoyé');
      setShowLoginForm(true);
    } catch (error) {
      console.error('Erreur lors du nettoyage du stockage:', error);
      setShowLoginForm(true);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const deviceCredentials: DeviceLoginCredentials = {
        email: email,
        motDePasse: password
      };

      // Appel à l'API de connexion avec Device ID
      const response = await authApi.loginWithDeviceId(deviceCredentials);
      console.log('result connect --------', response);
      
      // Sauvegarder les informations de connexion
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.utilisateur)),
        AsyncStorage.setItem(STORAGE_KEYS.ROLE, JSON.stringify(response?.utilisateur?.role)),
        AsyncStorage.setItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED, 'true')
      ]);
      
      console.log('Connexion automatique réussie avec Device ID pour:', response.utilisateur);

      if (response.token) {
        Alert.alert('Succès', 'Connexion admin réussie', [
          {
            text: 'OK',
            onPress: () => {
              handleLoginSuccessInternal();
            }
          }
        ]);
      } else {
        Alert.alert('Erreur', response.message || 'Identifiants invalides');
      }
    } catch (error) {
      console.error('Erreur login admin:', error);
      Alert.alert('Erreur', 'Erreur de connexion. Vérifiez votre connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  // Affichage du loader pendant la vérification
  if (isCheckingStorage) {
    // Si pas de login form à afficher (redirection en cours), ne rien afficher
  if (!showLoginForm) {
    return null;
  }
    return (
      <SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Vérification des informations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Si l'utilisateur est authentifié, afficher l'écran principal
  if (isAuthenticated) {
    navigation.navigate('Home');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header sans bouton retour */}
          <View style={styles.header}>
            <Text style={styles.titleCentered}>Admin Login</Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            {/* Champ Email */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Username or Email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Champ Password */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#94a3b8" 
                />
              </TouchableOpacity>
            </View>

            {/* Bouton Login */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Bouton pour forcer la déconnexion (optionnel) */}
            <TouchableOpacity
              style={styles.clearStorageButton}
              onPress={clearStorageAndShowLogin}
            >
              <Text style={styles.clearStorageButtonText}>
                Effacer les données stockées
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Accès réservé aux administrateurs uniquement
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  titleCentered: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#1e40af',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearStorageButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  clearStorageButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  authenticatedContainer: {
    flex: 1,
    padding: 20,
  },
  dashboardContent: {
    flex: 1,
    paddingTop: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
  },
  dashboardCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    padding: 8,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
});