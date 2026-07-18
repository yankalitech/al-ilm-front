import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Video from 'react-native-video';
import NetInfo from '@react-native-community/netinfo';
import { getCoursElement, Cours } from '../api/coursesApi';
import { useHistoryStore } from '../store/useHistoryStore';
import { useDownloadsStore } from '../store/useDownloadsStore';
import {
  getLocalFilePath,
  isFileDownloaded,
  downloadFileToDevice,
  removeLocalFilePath,
} from '../utils/offlineUtils';
import { colors, spacing } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

interface RouteParams {
  coursId?: string;
  id?: string;
  resumePosition?: number;
}

// Composant Image sécurisé avec gestion d'erreur
const SafeImage = ({ source, style, fallbackIcon = "image-outline" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = (error) => {
    console.log('Erreur chargement image:', error.nativeEvent);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  if (imageError) {
    return (
      <View style={[style, { 
        backgroundColor: '#2D3748', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }]}>
        <Ionicons name={fallbackIcon} size={60} color="#C4A962" />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={source}
        style={style}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={() => setImageLoading(true)}
        resizeMode="cover"
      />
      {imageLoading && (
        <View style={[style, {
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#2D3748'
        }]}>
          <ActivityIndicator size="small" color="#5B9FED" />
        </View>
      )}
    </View>
  );
};

const CourseDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params as RouteParams;
  const courseId = params.id || params.coursId || '';
  const resumePosition = params.resumePosition;

  const { saveProgress, getProgressForCourse, fetchHistory } = useHistoryStore();
  const { addDownload } = useDownloadsStore();

  const [cours, setCours] = useState<Cours | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [hasMediaError, setHasMediaError] = useState(false);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Offline state
  const [mediaUri, setMediaUri] = useState<string>('');
  const [isOffline, setIsOffline] = useState(false);

  const videoRef = useRef<Video>(null);
  const descriptionHeight = useRef(new Animated.Value(0)).current;
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    loadCours();
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [courseId]);

  useEffect(() => {
    Animated.timing(descriptionHeight, {
      toValue: isDescriptionExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDescriptionExpanded]);

  // Start/stop progress save interval based on play state
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = setInterval(() => {
        if (currentTimeRef.current > 0) {
          saveProgress(courseId, Math.floor(currentTimeRef.current));
        }
      }, 5000);
    } else {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, courseId]);

  const loadCours = async () => {
    setLoading(true);
    try {
      const [netState, localPath] = await Promise.all([
        NetInfo.fetch(),
        getLocalFilePath(courseId),
        fetchHistory(), // safe: has its own error handling, won't throw
      ]);
      const connected = !!netState.isConnected;
      setIsOffline(!connected);
      setIsDownloaded(!!localPath);

      if (localPath) {
        setMediaUri(`file://${localPath}`);
      }

      if (connected) {
        const data = await getCoursElement(courseId);
        setCours(data);
        setDuration(data.duree);
        if (!localPath) {
          setMediaUri(data.fichierAccessUrl || '');
        }
      } else if (!localPath) {
        Alert.alert('Hors-ligne', 'Ce cours n\'est pas disponible hors-ligne.');
      }

      // History is now loaded — safe to read saved position
      const savedProgress = getProgressForCourse(courseId);
      const resumeAt = resumePosition ?? savedProgress?.position;
      if (resumeAt && resumeAt > 0) {
        setTimeout(() => {
          if (videoRef.current) videoRef.current.seek(resumeAt);
          setCurrentTime(resumeAt);
          currentTimeRef.current = resumeAt;
        }, 800);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du cours:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du cours');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const seekBackward = () => {
    const newPosition = Math.max(0, currentTime - 15);
    if (videoRef.current) {
      videoRef.current.seek(newPosition);
    }
    setCurrentTime(newPosition);
  };

  const seekForward = () => {
    const newPosition = Math.min(duration, currentTime + 15);
    if (videoRef.current) {
      videoRef.current.seek(newPosition);
    }
    setCurrentTime(newPosition);
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && duration > 0) {
      const seekTime = (value / 100) * duration;
      videoRef.current.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  const onLoad = (data: any) => {
    setDuration(data.duration);
    setIsMediaLoading(false);
    setHasMediaError(false);
  };

  const onProgress = (data: any) => {
    setCurrentTime(data.currentTime);
    currentTimeRef.current = data.currentTime;
  };

  const onError = (error: any) => {
    console.error('Erreur de lecture:', error);
    setHasMediaError(true);
    setIsMediaLoading(false);
    Alert.alert('Erreur', 'Impossible de lire ce fichier média');
  };

  const onEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    if (videoRef.current) {
      videoRef.current.seek(0);
    }
    // Mark as completed
    saveProgress(courseId, duration > 0 ? duration : Math.floor(currentTimeRef.current), true);
  };

  const handleDownload = async () => {
    if (isDownloaded) {
      Alert.alert(
        'Supprimer le fichier local',
        'Supprimer le fichier téléchargé de cet appareil ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              await removeLocalFilePath(courseId);
              setIsDownloaded(false);
            },
          },
        ]
      );
      return;
    }

    if (!cours) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Record download server-side and get signed URL
      const signedUrl = await addDownload(courseId);
      if (!signedUrl) throw new Error('URL de téléchargement non disponible');

      // Determine file extension from URL or type
      const ext = cours.type === 'AUDIO' ? 'mp3' : 'mp4';
      const fileName = `${cours.titre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;

      await downloadFileToDevice(courseId, signedUrl, fileName, (p) => {
        setDownloadProgress(p);
      });

      setIsDownloaded(true);
      Alert.alert('Téléchargement terminé', 'Ce cours est maintenant disponible hors-ligne.');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      Alert.alert('Erreur', 'Le téléchargement a échoué. Veuillez réessayer.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chargement...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B9FED" />
        </View>
      </SafeAreaView>
    );
  }

  if (!cours) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Cours introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {cours.livre?.titre || 'Cours'}
            </Text>
          </View>
        </View>

        {/* Container Vidéo/Audio */}
        <View style={styles.mediaContainer}>
          {cours.type === 'VIDEO' ? (
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={{ uri: mediaUri }}
                style={styles.videoPlayer}
                paused={!isPlaying}
                resizeMode="contain"
                onLoad={onLoad}
                onProgress={onProgress}
                onError={onError}
                onEnd={onEnd}
                controls={false}
                repeat={false}
              />
              {isMediaLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#5B9FED" />
                  <Text style={styles.loadingText}>Chargement...</Text>
                </View>
              )}
              {hasMediaError && (
                <View style={styles.errorOverlay}>
                  <Ionicons name="alert-circle" size={60} color="#dc3545" />
                  <Text style={styles.errorOverlayText}>Erreur de lecture</Text>
                </View>
              )}
            </View>
          ) : (
            // Pour AUDIO, afficher une image ou un placeholder
            <View style={styles.audioContainer}>
              {cours.miniatureAccessUrl ? (
                <SafeImage
                  source={{ uri: cours.miniatureAccessUrl }}
                  style={styles.audioImage}
                  fallbackIcon="musical-notes"
                />
              ) : (
                <View style={[styles.audioImage, styles.audioPlaceholder]}>
                  <Ionicons name="musical-notes" size={80} color="#C4A962" />
                </View>
              )}
              {/* Lecteur audio caché */}
              <Video
                ref={videoRef}
                source={{ uri: mediaUri }}
                style={{ width: 0, height: 0 }}
                paused={!isPlaying}
                onLoad={onLoad}
                onProgress={onProgress}
                onError={onError}
                onEnd={onEnd}
                controls={false}
                repeat={false}
              />
            </View>
          )}
        </View>

        {/* Informations du cours */}
        <View style={styles.infoContainer}>
          <Text style={styles.courseTitle}>{cours.titre}</Text>
          <Text style={styles.courseAuthor}>
            {cours.livre?.auteur || 'Sheikh Ahmed'}
          </Text>

          {/* Barre de progression */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
              </View>
              {/* Slider invisible pour permettre de glisser */}
              <View style={styles.sliderOverlay}>
                <TouchableOpacity
                  style={styles.sliderTouchArea}
                  onPress={(e) => {
                    const locationX = e.nativeEvent.locationX;
                    const percentage = (locationX / width) * 100;
                    handleSeek(percentage);
                  }}
                />
              </View>
            </View>
          </View>

          {/* Contrôles de lecture */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={seekBackward}
              disabled={hasMediaError}
            >
              <Text style={styles.controlButtonText}>-15s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
              disabled={hasMediaError || isMediaLoading}
            >
              {isMediaLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.playButtonText}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={seekForward}
              disabled={hasMediaError}
            >
              <Text style={styles.controlButtonText}>+15s</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton de téléchargement */}
          <TouchableOpacity
            style={[styles.downloadButton, isDownloaded && styles.downloadButtonDone]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <View style={styles.downloadProgressRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.downloadButtonText}>
                  {Math.round(downloadProgress * 100)}%
                </Text>
              </View>
            ) : (
              <View style={styles.downloadProgressRow}>
                <Ionicons
                  name={isDownloaded ? 'checkmark-circle' : 'download-outline'}
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.downloadButtonText}>
                  {isDownloaded ? 'Téléchargé — Supprimer' : 'Télécharger'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {isOffline && (
            <View style={styles.offlineBanner}>
              <Ionicons name="cloud-offline-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.offlineBannerText}>Mode hors-ligne</Text>
            </View>
          )}
        </View>

        {/* Section Description extensible */}
        {cours.description && (
          <View style={styles.descriptionSection}>
            <TouchableOpacity
              style={styles.descriptionHeader}
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <Text style={styles.descriptionHeaderText}>Description</Text>
              <Ionicons
                name={isDescriptionExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.descriptionContent,
                {
                  maxHeight: descriptionHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000],
                  }),
                  opacity: descriptionHeight,
                },
              ]}
            >
              <ScrollView style={styles.descriptionScroll} nestedScrollEnabled>
                <Text style={styles.descriptionText}>{cours.description}</Text>
              </ScrollView>
            </Animated.View>
          </View>
        )}

        {/* Espace en bas */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom || spacing.sm }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={26} color="#6B7280" />
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Downloads')}
        >
          <Ionicons name="download-outline" size={26} color="#6B7280" />
          <Text style={styles.navText}>Téléchargements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ContinueListening')}
        >
          <Ionicons name="headset-outline" size={26} color="#6B7280" />
          <Text style={styles.navText}>Mes écoutes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={26} color="#6B7280" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.md,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  mediaContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  audioContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioImage: {
    width: '100%',
    height: '100%',
  },
  audioPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3EE',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorOverlayText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  infoContainer: {
    padding: spacing.xl,
    backgroundColor: '#1A202C',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  courseAuthor: {
    fontSize: 18,
    color: '#CBD5E0',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  timeText: {
    fontSize: 14,
    color: '#CBD5E0',
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  progressBarWrapper: {
    position: 'relative',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#4A5568',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#5B9FED',
    borderRadius: 3,
  },
  sliderOverlay: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 26,
  },
  sliderTouchArea: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  controlButton: {
    backgroundColor: '#2D3748',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#5B9FED',
    fontSize: 16,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#5B9FED',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  downloadButton: {
    backgroundColor: '#2D3748',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  downloadButtonDone: {
    backgroundColor: '#27AE60',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  offlineBannerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  descriptionSection: {
    backgroundColor: '#2D3748',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#374151',
  },
  descriptionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  descriptionContent: {
    overflow: 'hidden',
  },
  descriptionScroll: {
    maxHeight: 400,
  },
  descriptionText: {
    fontSize: 15,
    color: '#CBD5E0',
    lineHeight: 22,
    padding: spacing.lg,
  },
  bottomSpacer: {
    height: 120,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2D3748',
    paddingTop: spacing.sm,
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

export default CourseDetailScreen;