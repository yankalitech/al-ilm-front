// src/navigation/ModernDrawerNavigator.tsx
import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import {
  Provider as PaperProvider,
  Drawer,
  Text,
  Avatar,
  Button,
  Divider,
  Portal,
  Modal,
  Card,
} from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useAuthStore from '../store/useAuthStore';

// Theme moderne
const theme = {
  colors: {
    primary: '#6200EE',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    onSurface: '#000000',
    onBackground: '#000000',
  },
};

interface ModernDrawerProps {
  children: React.ReactNode;
  navigation: any;
}

const ModernDrawer: React.FC<ModernDrawerProps> = ({ children, navigation }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    setLogoutModalVisible(false);
    setDrawerOpen(false);
    navigation.navigate('Login');
  };

  const navigateAndClose = (screenName: string, params?: any) => {
    navigation.navigate(screenName, params);
    setDrawerOpen(false);
  };

  return (
    <PaperProvider theme={theme}>
      
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          
          <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
          
          <View style={styles.content}>
            {/* Header avec bouton menu */}
            <View style={styles.header}>
              <Button
                mode="text"
                onPress={() => setDrawerOpen(true)}
                icon="menu"
                contentStyle={styles.menuButton}
              >
                Menu
              </Button>
            </View>

            {/* Contenu principal */}
            <View style={styles.mainContent}>
              {children}
            </View>
          </View>

          {/* Drawer moderne */}
          <Portal>
            <Modal
              visible={drawerOpen}
              onDismiss={() => setDrawerOpen(false)}
              contentContainerStyle={styles.drawerModal}
            >
              <View style={styles.drawerContent}>
                {/* Header utilisateur */}
                <View style={styles.userSection}>
                  <Avatar.Icon 
                    size={64} 
                    icon="account" 
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <Text variant="headlineSmall" style={styles.userName}>
                    {isAuthenticated ? (user?.name || user?.email || 'Utilisateur') : 'Invité'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.userStatus}>
                    {isAuthenticated ? 'Connecté' : 'Non connecté'}
                  </Text>
                </View>

                <Divider style={styles.divider} />

                {/* Menu items */}
                <View style={styles.menuItems}>
                  <Drawer.Item
                    label="Accueil"
                    icon="home"
                    onPress={() => navigateAndClose('Main')}
                    style={styles.drawerItem}
                  />

                  {isAuthenticated && (
                    <>
                      <Drawer.Item
                        label="Mes cours"
                        icon="book-open-variant"
                        onPress={() => navigateAndClose('Main', { screen: 'CoursesList' })}
                        style={styles.drawerItem}
                      />
                      <Drawer.Item
                        label="Catégories"
                        icon="folder-multiple"
                        onPress={() => navigateAndClose('Main', { screen: 'ListCategories' })}
                        style={styles.drawerItem}
                      />
                    </>
                  )}
                </View>

                <Divider style={styles.divider} />

                {/* Section authentification */}
                <View style={styles.authSection}>
                  {isAuthenticated ? (
                    <Button
                      mode="outlined"
                      icon="logout"
                      onPress={() => setLogoutModalVisible(true)}
                      style={styles.logoutButton}
                      buttonColor="#FFF"
                      textColor="#F44336"
                    >
                      Se déconnecter
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      icon="login"
                      onPress={() => navigateAndClose('Login')}
                      style={styles.loginButton}
                    >
                      Se connecter
                    </Button>
                  )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text variant="bodySmall" style={styles.footerText}>
                    Version 1.0.0
                  </Text>
                </View>
              </View>
            </Modal>
          </Portal>

          {/* Modal de confirmation de déconnexion */}
          <Portal>
            <Modal
              visible={logoutModalVisible}
              onDismiss={() => setLogoutModalVisible(false)}
              contentContainerStyle={styles.logoutModal}
            >
              <Card>
                <Card.Title title="Déconnexion" />
                <Card.Content>
                  <Text>Êtes-vous sûr de vouloir vous déconnecter ?</Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => setLogoutModalVisible(false)}>
                    Annuler
                  </Button>
                  <Button mode="contained" onPress={handleLogout}>
                    Se déconnecter
                  </Button>
                </Card.Actions>
              </Card>
            </Modal>
          </Portal>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
  },
  menuButton: {
    justifyContent: 'flex-start',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  drawerModal: {
    margin: 0,
    justifyContent: 'flex-start',
  },
  drawerContent: {
    backgroundColor: 'white',
    width: 280,
    height: '100%',
    paddingTop: 40,
  },
  userSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  userName: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  userStatus: {
    marginTop: 4,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  menuItems: {
    flex: 1,
    paddingTop: 8,
  },
  drawerItem: {
    marginHorizontal: 8,
    marginVertical: 2,
  },
  authSection: {
    padding: 16,
  },
  loginButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginBottom: 8,
    borderColor: '#F44336',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    color: '#666',
  },
  logoutModal: {
    margin: 20,
  },
});

export default ModernDrawer;