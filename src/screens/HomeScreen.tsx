import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useCategoriesStore } from '../store/useCategoriesStore' 
import {getCategoriesList} from '../api/categoriesApi'
import { getNewCourses } from '../api/coursesApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) * 0.45;

// Import de vos styles globaux
import { colors, spacing, typography } from '../styles/globalStyles';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {  categories, fetchStats } = useCategoriesStore()

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // TODO: Remplacer par vos appels API
      await Promise.all([
        loadPublications(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Erreur de chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDuration = (seconds: any) => {
    if (!seconds) return 'N/A';
    const totalSeconds = parseInt(seconds, 10);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes} min ${remainingSeconds} s`;
  };

  const loadPublications = async () => {
    try {
      const response = await getNewCourses();
      console.log('data cours ', response)
      const data = response?.data || response || [];
      console.log('data cours ', data)
      const formattedData = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        titre: item.titre,
        type: item.type === 'VIDEO' ? 'Video' : item.type === 'AUDIO' ? 'Audio' : item.type,
        duree: formatDuration(item.duree),
        image_url: item.miniatureAccessUrl || null,
      })) : [];

      setPublications(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement des publications:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const loadCategories = async () => {
    // TODO: Remplacer par votre appel API
    // Exemple: const response = await fetch('YOUR_API_URL/categories');
    // const data = await response.json();
    
    // Structure attendue de l'API:
    // {
    //   id: string,
    //   nom: string,
    //   icone: string, // Nom de l'icône Ionicons
    // }
    
    await fetchStats();
  };

  const handleSearch = () => {
    // Navigation vers la page de recherche avec la requête
    navigation.navigate('Search', { query: searchQuery });
  };

  const handlePublicationPress = (publication: any) => {
    // Navigation vers les détails de la publication
    navigation.navigate('PublicationDetails', { id: publication.id });
  };

  const handleCategoryPress = (category: any) => {
    // Navigation vers la liste des cours de cette catégorie
    navigation.navigate('CategoryCourses', { 
      categoryId: category.id, 
      categoryName: category.nom 
    });
  };

  const renderPublicationCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.publicationCard}
      onPress={() => handlePublicationPress(item)}
      activeOpacity={0.8}
    >
      {item.image_url ? (
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.publicationImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.publicationImage, styles.placeholderImage]}>
          <Ionicons 
            name={item.type === 'Audio' ? 'musical-notes' : 'videocam'} 
            size={40} 
            color={colors.textSecondary} 
          />
        </View>
      )}
      
      <View style={styles.publicationGradient} />
      
      <View style={styles.publicationContent}>
        <Text style={styles.publicationTitle} numberOfLines={2}>
          {item.titre}
        </Text>
        <Text style={styles.publicationMeta}>
          {item.type} • {item.duree}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item, index }: { item: any; index: number }) => {
    const isLeftColumn = index % 2 === 0;
    return (
      <TouchableOpacity 
        style={[
          styles.categoryCard,
          { marginRight: isLeftColumn ? spacing.md : 0 }
        ]}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.7}
      >
        <Ionicons name={item.icone} size={28} color={colors.text} />
        <Text style={styles.categoryText}>{item.nom}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Al-Ilm</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.placeholder} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for courses"
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* New Publications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nouvelles Publications</Text>
          
          {publications.length > 0 ? (
            <FlatList
              horizontal
              data={publications}
              renderItem={renderPublicationCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.publicationsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune publication disponible
              </Text>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          
          {categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.categoryRow}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune catégorie disponible
              </Text>
            </View>
          )}
        </View>

        {/* Quick Access */}
        <View style={[styles.section, { marginBottom: spacing.xxl }]}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessContainer}>
            <TouchableOpacity 
              style={styles.quickAccessButton}
              onPress={() => navigation.navigate('Downloads')}
            >
              <Text style={styles.quickAccessText}>My Downloads</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAccessButton}
              onPress={() => navigation.navigate('ContinueListening')}
            >
              <Text style={styles.quickAccessText}>Continue Listening</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Bookmarks')}
        >
          <Ionicons name="bookmark-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  publicationsList: {
    paddingHorizontal: spacing.lg,
  },
  publicationCard: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  publicationImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  placeholderImage: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publicationGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  publicationContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  publicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  publicationMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  quickAccessContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  quickAccessButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAccessText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  emptyState: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default HomeScreen;