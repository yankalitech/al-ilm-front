import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { spacing } from '../styles/globalStyles';
import { ThemeColors, useTheme, useThemedStyles } from '../theme/ThemeContext';
import ScreenBackground from '../components/ScreenBackground';
import { getAllLivres, getLivresByCategorie, Livre } from '../api/livresApi';
import BottomNav from '../components/BottomNav';

// Sans catégorie (bouton « Voir tous les livres » de l'accueil) : affiche tous les livres
const LivresByCategScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { categoryId, categoryName = 'Tous les livres' } = route.params || {};
  const [livres, setLivres] = useState<Livre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLivres();
  }, [categoryId]);

  const loadLivres = async () => {
    try {
      const data = categoryId ? await getLivresByCategorie(categoryId) : await getAllLivres();
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
                <Ionicons name="book" size={40} color={colors.primary} />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={colors.placeholder} />
      <Text style={styles.emptyStateText}>
        {categoryId ? 'Aucun livre disponible dans cette catégorie' : 'Aucun livre disponible'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground edges={['top', 'left', 'right']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
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

      <BottomNav />
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
    color: colors.text,
    textAlign: 'center',
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  livreCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  statusBadgeProgress: {
    backgroundColor: colors.surfaceAlt,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  livreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  livreDuration: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.surfaceAlt,
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
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  navText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
});

export default LivresByCategScreen;