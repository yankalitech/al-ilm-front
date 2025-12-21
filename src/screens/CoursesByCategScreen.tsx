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
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '../styles/globalStyles';

interface Course {
  id: string;
  titre: string;
  duree: string;
  statut?: 'new' | 'in_progress' | null;
  progression?: number; // 0-100 pour les cours en progression
  image_url?: string | null;
}

const CategoryCoursesScreen = ({ route, navigation }: any) => {
  const { categoryId, categoryName } = route.params;
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [categoryId]);

  const loadCourses = async () => {
    try {
      // TODO: Remplacer par votre appel API
      // Exemple: const response = await fetch(`YOUR_API_URL/categories/${categoryId}/courses`);
      // const data = await response.json();
      
      // Structure attendue de l'API:
      // {
      //   id: string,
      //   titre: string,
      //   duree: string,
      //   statut: 'new' | 'in_progress' | null,
      //   progression: number, // 0-100 (uniquement si statut = 'in_progress')
      //   image_url: string,
      // }
      
      const mockData: Course[] = [
        {
          id: '1',
          titre: 'The Fundamentals of Islamic Jurisprudence',
          duree: '1h 30m',
          statut: 'new',
          image_url: null,
        },
        {
          id: '2',
          titre: 'Advanced Studies in Fiqh',
          duree: '2h 15m',
          statut: null,
          image_url: null,
        },
        {
          id: '3',
          titre: 'Fiqh for Everyday Life',
          duree: '45m',
          statut: 'in_progress',
          progression: 60,
          image_url: null,
        },
        {
          id: '4',
          titre: 'Comparative Fiqh',
          duree: '1h 45m',
          statut: null,
          image_url: null,
        },
        {
          id: '5',
          titre: 'Fiqh of Worship',
          duree: '1h 15m',
          statut: null,
          image_url: null,
        },
        {
          id: '6',
          titre: 'Fiqh of Transactions',
          duree: '2h 00m',
          statut: null,
          image_url: null,
        },
      ];
      
      setCourses(mockData);
    } catch (error) {
      console.error('Erreur de chargement des cours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (course: Course) => {
    // Navigation vers les détails du cours
    navigation.navigate('CourseDetails', { courseId: course.id });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderStatusBadge = (statut?: 'new' | 'in_progress' | null) => {
    if (statut === 'new') {
      return (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>New</Text>
        </View>
      );
    }
    if (statut === 'in_progress') {
      return (
        <View style={[styles.statusBadge, styles.progressBadge]}>
          <Text style={styles.statusText}>In progress</Text>
        </View>
      );
    }
    return null;
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.courseContent}>
        <View style={styles.courseInfo}>
          {renderStatusBadge(item.statut)}
          
          <Text style={styles.courseTitle} numberOfLines={2}>
            {item.titre}
          </Text>
          
          <View style={styles.durationContainer}>
            {item.statut === 'in_progress' && item.progression ? (
              <Text style={styles.progressText}>{item.progression}%</Text>
            ) : null}
            <Text style={styles.courseDuration}>{item.duree}</Text>
          </View>
        </View>

        <View style={styles.courseImageContainer}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.courseImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.courseImage, styles.placeholderImage]}>
              <Ionicons name="book" size={32} color={colors.primary} />
            </View>
          )}
        </View>
      </View>

      {/* Barre de progression pour les cours en cours */}
      {item.statut === 'in_progress' && item.progression ? (
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${item.progression}%` }
            ]} 
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyStateText}>
        Aucun cours disponible dans cette catégorie
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {categoryName}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Liste des cours */}
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
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
          <Ionicons name="home-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Categories')}
        >
          <Ionicons name="grid" size={24} color={colors.primary} />
          <Text style={[styles.navText, styles.navTextActive]}>Categories</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Library')}
        >
          <Ionicons name="bookmark-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.navText}>Library</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerSpacer: {
    width: 32, // Pour équilibrer avec le bouton back
  },
  listContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseContent: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  progressBadge: {
    backgroundColor: colors.textSecondary,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.background,
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  courseDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  courseImageContainer: {
    width: 120,
    height: 120,
  },
  courseImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderImage: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    marginTop: 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
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
    paddingVertical: spacing.sm,
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
    marginTop: spacing.xs,
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default CategoryCoursesScreen;