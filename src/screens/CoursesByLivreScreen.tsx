import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCoursesByLivre, Cours } from '../api/livresApi';
import { colors, spacing } from '../styles/globalStyles';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import BottomNav from '../components/BottomNav';

interface RouteParams {
  livreId: string;
  livreTitre: string;
}

const CoursesByLivreScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { livreId, livreTitre } = route.params as RouteParams;

  const [cours, setCours] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCours();
  }, [livreId]);

  const loadCours = async () => {
    setLoading(true);
    try {
      const data = await getCoursesByLivre(livreId, '');
      setCours(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    } finally {
      setLoading(false);
    }
  };

  const isNew = (datePublication: string): boolean => {
    const pubDate = new Date(datePublication);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - pubDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusLabel = (etat: string): string | null => {
    switch (etat) {
      case 'EN_COURS':
        return 'In progress';
      default:
        return null;
    }
  };

  const renderCourseItem = ({ item }: { item: Cours }) => {
    const showNewTag = isNew(item.datePublication);
    const statusLabel = getStatusLabel(item.etat);

    return (
      <TouchableOpacity
        style={styles.courseItem}
        onPress={() => {
          // Navigation vers la page de détail du cours
          navigation.navigate('CourseDetail', { coursId: item.id });
        }}
      >
        <View style={styles.courseContent}>
          <View style={styles.courseInfo}>
            {showNewTag && (
              <Text style={styles.newTag}>New</Text>
            )}
            {statusLabel && (
              <Text style={styles.statusTag}>{statusLabel}</Text>
            )}
            <Text style={styles.courseTitle}>{item.titre}</Text>
            <Text style={styles.courseDuration}>{formatDuration(item.duree)}</Text>
          </View>
          
          <View style={styles.thumbnailContainer}>
            {item.miniatureAccessUrl ? (
              <Image
                source={{ uri: item.miniatureAccessUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                <Icon name="menu-book" size={40} color="#C4A962" />
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1D2E" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{livreTitre}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4A962" />
        </View>
      </View>
    );
  }

  return (

    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* <StatusBar barStyle="light-content" backgroundColor="#1A202C" /> */}
          
          {/* Header */}
          {/* <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
             <Text style={styles.headerTitle}>{livreTitle}</Text>
            </View>
          </View> */}
          {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={2}>
                      {livreTitre}
                    </Text>
                  </View>
                </View>
    
          {/* Liste des livres */}
         <FlatList
          data={cours}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
    
          <BottomNav />
        </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1D2E',
  },
  headerTitleContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1A202C', // Fond sombre comme dans l'image
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Pour centrer le titre malgré le bouton retour
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  courseItem: {
    marginBottom: 20,
  },
  courseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    marginRight: 16,
  },
  newTag: {
    fontSize: 13,
    color: '#7B8BA5',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  statusTag: {
    fontSize: 13,
    color: '#7B8BA5',
    fontWeight: '400',
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 24,
  },
  courseDuration: {
    fontSize: 14,
    color: '#7B8BA5',
    fontWeight: '400',
  },
  thumbnailContainer: {
    width: 120,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    backgroundColor: '#2A3447',
    justifyContent: 'center',
    alignItems: 'center',
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
    bottomNav: {
      flexDirection: 'row',
      backgroundColor: '#2D3748',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderTopWidth: 1,
      borderTopColor: '#4A5568',
    },
  navTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CoursesByLivreScreen;

// const CoursesByLivreScreen1 = ({ route }) => {
//   const { livreId, livreTitre } = route.params;

//   return (
//     <SafeAreaView style={globalStyles.safeArea}>
//       <View style={globalStyles.container}>
//         <Text style={globalStyles.headerTitle}>Cours du livre: {livreTitre}</Text>
//         <Text>Livre ID: {livreId}</Text>
//         <Text>Cette page listera les cours pour le livre sélectionné.</Text>
//       </View>
//     </SafeAreaView>
//   );
// };

