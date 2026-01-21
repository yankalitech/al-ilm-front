import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '../styles/globalStyles';
import { getLivresByCategorie, Livre } from '../api/livresApi';

const LivresByCategScreen = ({ route, navigation }: any) => {
  const { categoryId, categoryName } = route.params;
  const [livres, setLivres] = useState<Livre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLivres();
  }, [categoryId]);

  const loadLivres = async () => {
    try {
      const data = await getLivresByCategorie(categoryId);
      setLivres(data);
    } catch (error) {
      console.error('Erreur de chargement des livres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLivrePress = (livre: Livre) => {
    navigation.navigate('CoursesByLivre', { livreId: livre.id, livreTitre: livre.titre });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderLivreItem = ({ item, index }: { item: Livre; index: number }) => {
    // Déterminer le statut du livre (vous pouvez ajuster selon vos données)
    const isNew = index === 0; // Le premier livre est "New"
    const isInProgress = item.progress && item.progress > 0; // Si vous avez un champ progress
    
    return (
      <TouchableOpacity
        style={styles.livreCard}
        onPress={() => handleLivrePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.livreContent}>
          {/* Section texte à gauche */}
          <View style={styles.livreInfo}>
            {/* Badge statut */}
            {isNew && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>New</Text>
              </View>
            )}
            {isInProgress && (
              <View style={[styles.statusBadge, styles.statusBadgeProgress]}>
                <Text style={styles.statusText}>In progress</Text>
              </View>
            )}
            
            {/* Titre du livre */}
            <Text style={styles.livreTitle} numberOfLines={2}>
              {item.titre}
            </Text>
            
            {/* Durée ou informations supplémentaires */}
            {item.duree && (
              <Text style={styles.livreDuration}>{item.duree}</Text>
            )}
          </View>

          {/* Image à droite */}
          <View style={styles.livreImageContainer}>
            {item.couvertureAccessUrl ? (
              <Image
                source={{ uri: item.couvertureAccessUrl }}
                style={styles.livreImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.livreImage, styles.placeholderImage]}>
                <Ionicons name="book" size={40} color="#C8A882" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color="#6B7280" />
      <Text style={styles.emptyStateText}>
        Aucun livre disponible dans cette catégorie
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C8A882" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1A202C" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {categoryName}
          </Text>
        </View>
      </View>

      {/* Liste des livres */}
      <FlatList
        data={livres}
        renderItem={renderLivreItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={26} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Categories')}
        >
          <Ionicons name="grid" size={26} color="#FFFFFF" />
          <Text style={[styles.navText, styles.navTextActive]}>Categories</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Library')}
        >
          <Ionicons name="bookmark-outline" size={26} color="#6B7280" />
          <Text style={styles.navText}>Library</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={26} color="#6B7280" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A202C', // Fond sombre comme dans l'image
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  livreCard: {
    backgroundColor: '#2D3748', // Fond des cartes
    borderRadius: 16,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  livreContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
  },
  livreInfo: {
    flex: 1,
    paddingRight: spacing.md,
    justifyContent: 'center',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4A5568',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  statusBadgeProgress: {
    backgroundColor: '#4A5568',
  },
  statusText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  livreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  livreDuration: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: spacing.xs,
  },
  livreImageContainer: {
    width: 120,
    height: 120,
  },
  livreImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#4A5568',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#A0AEC0',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2D3748',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  navText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default LivresByCategScreen;