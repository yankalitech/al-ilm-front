// src/navigation/DrawerNavigator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@react-native-vector-icons/ionicons';
// import { spacing, typography } from '../styles/globalStyles';
import RootNavigator from './RootNavigator';
import LoginScreen from '../screens/LoginScreen';
import useAuthStore from '../store/useAuthStore';
import { useTheme } from '@react-navigation/native';
console.log('🔧 DrawerNavigator chargé');
const Drawer = createDrawerNavigator();

const colors = {
  primary: '#4A90E2',
  background: '#2C3E50',
  surface: '#34495E',
  text: '#FFFFFF',
  textSecondary: '#BDC3C7',
  placeholder: '#7F8C8D',
  border: '#4A5568',
  success: '#27AE60',
  error: '#E74C3C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.text,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
};

// Contenu personnalisé du drawer
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const theme = useTheme();
  console.log("🎨 Theme dans drawer:", theme);  
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            props.navigation.closeDrawer();
          },
        },
      ]
    );
  };

  const navigateToLogin = () => {
    props.navigation.navigate('Login');
  };

  return (
    <DrawerContentScrollView 
      {...props} 
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={{ flex: 1 }}
    >
      {/* Header du drawer */}
      <View style={styles.drawerHeader}>
        <Ionicons name="person-circle" size={64} color={colors.primary} />
        {isAuthenticated ? (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || user?.email}</Text>
            <Text style={styles.userStatus}>Connecté</Text>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Invité</Text>
            <Text style={styles.userStatus}>Non connecté</Text>
          </View>
        )}
      </View>

      {/* Séparateur */}
      <View style={styles.separator} />

      {/* Menu principal */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            props.navigation.navigate('Main');
            props.navigation.closeDrawer();
          }}
        >
          <Ionicons name="home-outline" size={24} color={colors.text} />
          <Text style={styles.menuText}>Accueil</Text>
        </TouchableOpacity>

        {isAuthenticated ? (
          <>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.navigate('Main', { screen: 'CoursesList' });
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="book-outline" size={24} color={colors.text} />
              <Text style={styles.menuText}>Mes cours</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                props.navigation.navigate('Main', { screen: 'ListCategories' });
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name="folder-outline" size={24} color={colors.text} />
              <Text style={styles.menuText}>Catégories</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Section d'authentification */}
      <View style={styles.authSection}>
        <View style={styles.separator} />
        
        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={[styles.menuText, { color: colors.error }]}>Se déconnecter</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
            <Ionicons name="log-in-outline" size={24} color={colors.primary} />
            <Text style={[styles.menuText, { color: colors.primary }]}>Se connecter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer */}
      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        swipeEnabled: true,
        swipeMinDistance: 50,
      }}
    >
      <Drawer.Screen name="Main" component={RootNavigator} />
      <Drawer.Screen name="Login" component={LoginScreen} />
    </Drawer.Navigator>
  );
};

const styles = {
  drawerHeader: {
    padding: spacing.xl,
    alignItems: 'center' as const,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    alignItems: 'center' as const,
    marginTop: spacing.md,
  },
  userName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  userStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  menuSection: {
    flex: 1,
    paddingTop: spacing.md,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    borderRadius: 8,
  },
  menuText: {
    ...typography.body,
    marginLeft: spacing.md,
    flex: 1,
  },
  authSection: {
    paddingBottom: spacing.lg,
  },
  loginButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  drawerFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center' as const,
  },
  footerText: {
    ...typography.caption,
    fontSize: 12,
  },
};

export default DrawerNavigator;