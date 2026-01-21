
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { searchCourses } from '../api/coursesApi';
import { colors, spacing } from '../styles/globalStyles';

type SearchScreenRouteProp = RouteProp<{ Search: { query: string } }, 'Search'>;

const SearchScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<SearchScreenRouteProp>();
  const { query } = route.params || { query: '' };

  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (text: string) => {
    if (!text.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    Keyboard.dismiss();
    
    try {
      // Le token est géré en interne par getAuthOptions dans l'API, on passe une chaîne vide
      const data = await searchCourses(text, '');
      setResults(data || []);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (course: any) => {
    // Navigation vers les détails du cours
    navigation.navigate('CourseDetail' as never, { courseId: course.id } as never);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.resultCard}
      onPress={() => handleCoursePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        {item.miniatureAccessUrl ? (
          <Image 
            source={{ uri: item.miniatureAccessUrl }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Ionicons 
              name={item.type === 'AUDIO' || item.type === 'audio' ? 'musical-notes' : 'videocam'} 
              size={24} 
              color={colors.textSecondary} 
            />
          </View>
        )}
        <View style={styles.typeBadge}>
           <Ionicons 
              name={item.type === 'AUDIO' || item.type === 'audio' ? 'musical-notes' : 'videocam'} 
              size={10} 
              color="#fff" 
            />
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.titre}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description || 'Aucune description disponible'}
        </Text>
        <View style={styles.cardMeta}>
           {item.duree && (
             <View style={styles.metaItem}>
               <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
               <Text style={styles.metaText}>{item.duree} min</Text>
             </View>
           )}
           <View style={styles.metaItem}>
             <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
             <Text style={styles.metaText}>
               {new Date(item.datePublication || item.createdAt || Date.now()).toLocaleDateString()}
             </Text>
           </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header avec barre de recherche */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => performSearch(searchQuery)}
            placeholder="Rechercher..."
            placeholderTextColor={colors.placeholder}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.placeholder} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contenu */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.centerContainer}>
              <Ionicons 
                name={hasSearched ? "search-outline" : "search"} 
                size={64} 
                color={colors.border} 
              />
              <Text style={styles.emptyText}>
                {hasSearched 
                  ? 'Aucun résultat trouvé pour cette recherche' 
                  : 'Entrez un mot-clé pour rechercher des cours'}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
   borderBottomColor: colors.border,
  },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.md,
//     backgroundColor: colors.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  listContainer: {
    padding: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  emptyText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    height: 110,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thumbnailContainer: {
    width: 110,
    height: '100%',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default SearchScreen;
