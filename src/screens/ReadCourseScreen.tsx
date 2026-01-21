
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from 'react-native';
import Video from 'react-native-video';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCoursElement } from '../api/coursesApi';
import { colors, spacing } from '../styles/globalStyles';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * 0.5625; // 16:9 aspect ratio

const CoursePlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params as { courseId: string };

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const data = await getCoursElement(courseId);
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course:', error);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!course) return null;

  // Détermine le type de média et les URLs
  const isVideo = course.type === 'VIDEO' || course.type === 'video';
  const mediaUrl = course.fichierAccessUrl;
  const thumbnailUrl = course.miniatureAccessUrl;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Section Lecteur Média */}
      <View style={styles.mediaContainer}>
        {mediaUrl ? (
          <Video
            source={{ uri: mediaUrl }}
            style={styles.video}
            controls={true}
            resizeMode={isVideo ? "contain" : "cover"}
            poster={thumbnailUrl}
            posterResizeMode="cover"
            onError={(e) => {
              console.log("Video Error:", e);
              setVideoError(true);
            }}
            ignoreSilentSwitch="ignore"
            playInBackground={false}
            playWhenInactive={false}
          />
        ) : (
          <View style={styles.placeholderContainer}>
             <Ionicons name="alert-circle-outline" size={50} color={colors.textSecondary} />
             <Text style={styles.errorText}>Média non disponible</Text>
          </View>
        )}
        
        {/* Bouton Retour Overlay */}
        <TouchableOpacity style={styles.backButtonOverlay} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Section Contenu */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>{course.titre}</Text>
          
          <View style={styles.metaContainer}>
            <View style={[styles.badge, { backgroundColor: isVideo ? colors.primary : '#9c27b0' }]}>
              <Ionicons 
                name={isVideo ? "videocam" : "musical-notes"} 
                size={12} 
                color="#fff" 
                style={{ marginRight: 4 }}
              />
              <Text style={styles.badgeText}>{isVideo ? 'Vidéo' : 'Audio'}</Text>
            </View>
            
            {course.duree && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.metaText}>{course.duree} min</Text>
              </View>
            )}
            
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                {new Date(course.datePublication || course.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>À propos de ce cours</Text>
          <Text style={styles.description}>
            {course.description || "Aucune description disponible pour ce cours."}
          </Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  mediaContainer: {
    width: width,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#fff',
    marginTop: 10,
  },
  contentContainer: {
    flex: 1,
  },
  headerSection: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  descriptionSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    opacity: 0.9,
  },
});

export default CoursePlayerScreen;
