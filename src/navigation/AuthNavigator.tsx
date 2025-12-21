// src/navigation/AuthNavigator.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuthStore from '../store/useAuthStore';
import LoginScreen from '../screens/LoginScreen';
import RootNavigator from './RootNavigator'; // Votre navigateur principal existant
import { theme } from '../theme';

const Stack = createNativeStackNavigator();

const AuthNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Vérifier le statut d'authentification au lancement
    checkAuthStatus();
  }, []);

  // Écran de chargement pendant la vérification du token
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Utilisateur connecté - afficher l'app principale
          <Stack.Screen 
            name="Main" 
            component={RootNavigator} 
          />
        ) : (
          // Utilisateur non connecté - afficher l'écran de connexion
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AuthNavigator;