import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Image,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { globalStyles, colors } from '../styles/globalStyles';

// Clés de stockage
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  ROLE: 'auth_role',
  REFRESH_TOKEN: 'refresh_token',
  AUTO_LOGIN_ENABLED: 'auto_login_enabled',
  DEVICE_ID: 'device_id'
};

interface UserProfile {
  id: string;
  nom: string;
  email: string;
  role: string;
  phoneId: string | null;
  dernierActive: string | null;
  visites: number;
  createdAt: string;
}

const ProfileScreen = ({ navigation }: any) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Charger les données utilisateur depuis AsyncStorage
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [token, userData, role, autoLoginEnabled] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ROLE),
        AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED)
      ]);
      console.log('geting value user  ', userData)
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserProfile(parsedUser);
      } else {
        // Si pas de données utilisateur, rediriger vers login
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminLogin' }],
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      Alert.alert('Erreur', 'Impossible de charger les données utilisateur');
    } finally {
      setLoading(false);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Obtenir la couleur du rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return '#ff3b30';
      case 'USER': return '#34c759';
      case 'MODERATOR': return '#ff9500';
      default: return colors.placeholder;
    }
  };

  // Obtenir le texte du rôle
  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'USER': return 'Utilisateur';
      case 'MODERATOR': return 'Modérateur';
      default: return role;
    }
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      setShowLogoutModal(false);
      
      // Supprimer toutes les données du localStorage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.ROLE),
        AsyncStorage.removeItem(STORAGE_KEYS.AUTO_LOGIN_ENABLED)
      ]);
      
      // Rediriger vers la page de login
      navigation.reset({
        index: 0,
        routes: [{ name: 'AdminLogin' }],
      });
    console.log('state nav ---',navigation.getState());

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  // Quitter l'application
  const handleExitApp = () => {
    setShowExitModal(false);
    BackHandler.exitApp();
  };

  // Options du menu
  const menuOptions = [
    {
      id: 'edit',
      title: 'Modifier le profil',
      subtitle: 'Mettre à jour vos informations',
      icon: 'person-outline',
      color: colors.primary,
      onPress: () => {
        // Navigation vers page d'édition du profil
        Alert.alert('Info', 'Fonctionnalité à implémenter');
      }
    },
    {
      id: 'settings',
      title: 'Paramètres',
      subtitle: 'Configuration de l\'application',
      icon: 'settings-outline',
      color: colors.primary,
      onPress: () => {
        // Navigation vers paramètres
        Alert.alert('Info', 'Fonctionnalité à implémenter');
      }
    },
    {
      id: 'help',
      title: 'Aide & Support',
      subtitle: 'Centre d\'aide et FAQ',
      icon: 'help-circle-outline',
      color: colors.primary,
      onPress: () => {
        Alert.alert('Info', 'Fonctionnalité à implémenter');
      }
    },
    {
      id: 'about',
      title: 'À propos',
      subtitle: 'Version de l\'application',
      icon: 'information-circle-outline',
      color: colors.primary,
      onPress: () => {
        Alert.alert('À propos', 'Application de gestion de cours\nVersion 1.0.0');
      }
    }
  ];

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      ) : !userProfile ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.placeholder} />
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorSubtitle}>Impossible de charger les données utilisateur</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadUserData}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={globalStyles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Profil</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Section Profil Principal */}
        <View style={styles.profileSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(userProfile.nom)}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Informations principales */}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile.nom}</Text>
            <Text style={styles.userEmail}>{userProfile.email}</Text>
            
            {/* Badge rôle */}
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userProfile.role) }]}>
              <Ionicons name="shield-checkmark" size={14} color="white" />
              <Text style={styles.roleText}>{getRoleText(userProfile.role)}</Text>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="eye" size={20} color="#1976d2" />
              </View>
              <Text style={styles.statNumber}>{userProfile.visites}</Text>
              <Text style={styles.statLabel}>Visites</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="calendar" size={20} color="#7b1fa2" />
              </View>
              <Text style={styles.statNumber}>
                {Math.floor((new Date().getTime() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </Text>
              <Text style={styles.statLabel}>Jours</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#e8f5e8' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#388e3c" />
              </View>
              <Text style={styles.statNumber}>Active</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        {/* Informations détaillées */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Informations</Text>
          
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>ID Utilisateur</Text>
              <Text style={styles.detailValue}>{userProfile.id.slice(0, 8)}...</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="mail" size={18} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{userProfile.email}</Text>
            </View>
          </View>
          
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="time" size={18} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Membre depuis</Text>
              <Text style={styles.detailValue}>{formatDate(userProfile.createdAt)}</Text>
            </View>
          </View>
          
          {userProfile.phoneId && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="call" size={18} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Téléphone</Text>
                <Text style={styles.detailValue}>{userProfile.phoneId}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Options</Text>
          
          {menuOptions.map((option) => (
            <TouchableOpacity 
              key={option.id}
              style={styles.menuItem}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${option.color}20` }]}>
                <Ionicons name={option.icon as any} size={20} color={option.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{option.title}</Text>
                <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions de déconnexion */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.exitButton}
            onPress={() => setShowExitModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={20} color="#ff9500" />
            <Text style={styles.exitText}>Quitter l'application</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
      )}

      {/* Modal de confirmation de déconnexion */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <Ionicons name="log-out-outline" size={32} color="#ff3b30" />
            </View>
            
            <Text style={styles.modalTitle}>Se déconnecter</Text>
            <Text style={styles.modalMessage}>
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à l'application.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.modalConfirmText}>Se déconnecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmation de sortie */}
      <Modal visible={showExitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <Ionicons name="exit-outline" size={32} color="#ff9500" />
            </View>
            
            <Text style={styles.modalTitle}>Quitter l'application</Text>
            <Text style={styles.modalMessage}>
              Voulez-vous vraiment quitter l'application ?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowExitModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalConfirmButton, { backgroundColor: '#ff9500' }]}
                onPress={handleExitApp}
              >
                <Text style={styles.modalConfirmText}>Quitter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  // États de chargement et d'erreur
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.placeholder,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  errorSubtitle: {
    fontSize: 16,
    color: colors.placeholder,
    textAlign: 'center' as const,
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },

  // Section profil principal
  profileSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  editAvatarButton: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34c759',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center' as const,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.placeholder,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },

  // Sections
  statsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  detailsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  menuSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  actionsSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },

  // Statistiques
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.placeholder,
  },

  // Détails
  detailItem: {
    backgroundColor: 'white',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.placeholder,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500' as const,
  },

  // Menu
  menuItem: {
    backgroundColor: 'white',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.primary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: colors.placeholder,
  },

  // Actions
  logoutButton: {
    backgroundColor: 'white',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff3b30',
    gap: 8,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  exitButton: {
    backgroundColor: 'white',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff9500',
    gap: 8,
  },
  exitText: {
    color: '#ff9500',
    fontSize: 16,
    fontWeight: '600' as const,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000077',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContainer: {
    backgroundColor: 'white',
    marginHorizontal: 40,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center' as const,
    width: '85%',
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.placeholder,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.placeholder,
    alignItems: 'center' as const,
  },
  modalCancelText: {
    color: colors.placeholder,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ff3b30',
    alignItems: 'center' as const,
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

export default ProfileScreen;