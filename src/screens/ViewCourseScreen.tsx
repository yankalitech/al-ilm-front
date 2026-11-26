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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { VideoRef } from 'react-native-video';
import MediaPlayer from '../components/MediaPlayer';
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
import { spacing } from '../styles/globalStyles';
import { ThemeColors, useTheme, useThemedStyles } from '../theme/ThemeContext';
import ScreenBackground from '../components/ScreenBackground';
import BottomNav from '../components/BottomNav';
import QualityPickerModal from '../components/QualityPickerModal';
import { QualityLabel, getPreferredQuality, pickQuality, setPreferredQuality } from '../utils/videoQuality';

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
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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
  const [duration, setDuration] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // Après un changement de qualité, la lecture reprend si elle était en cours
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Offline state
  const [mediaUri, setMediaUri] = useState<string>('');
  const [isOffline, setIsOffline] = useState(false);

  // Qualité vidéo (lecture en ligne) et sélecteur ouvert pour la lecture ou le téléchargement
  const [quality, setQuality] = useState<QualityLabel | null>(null);
  const [qualityPicker, setQualityPicker] = useState<'play' | 'download' | null>(null);
  const pendingSeekRef = useRef<number | null>(null);

  const videoRef = useRef<VideoRef>(null);
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
          // Vidéo : qualité préférée de l'utilisateur, sinon la meilleure disponible
          const selected = pickQuality(data.qualites, await getPreferredQuality());
          setQuality(selected?.label ?? null);
          setMediaUri(selected?.url || data.fichierAccessUrl || '');
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

  const onLoad = (data: any) => {
    setDuration(data.duration);
    // Après un changement de qualité : reprise au même endroit
    if (pendingSeekRef.current !== null) {
      videoRef.current?.seek(pendingSeekRef.current);
      pendingSeekRef.current = null;
    }
  };

  const changeQuality = (label: QualityLabel) => {
    setQualityPicker(null);
    const selected = cours?.qualites?.find((q) => q.label === label);
    if (!selected || label === quality) return;
    pendingSeekRef.current = currentTimeRef.current;
    setAutoPlayNext(isPlaying);
    setQuality(label);
    setMediaUri(selected.url);
    setPreferredQuality(label);
  };

  const onProgress = (data: any) => {
    currentTimeRef.current = data.currentTime;
  };

  const onEnd = () => {
    setIsPlaying(false);
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

    // Vidéo disponible en plusieurs qualités : l'utilisateur choisit (taille estimée affichée)
    if ((cours.qualites?.length ?? 0) > 1) {
      setQualityPicker('download');
      return;
    }
    startDownload();
  };

  const startDownload = async (qualite?: QualityLabel) => {
    setQualityPicker(null);
    if (!cours) return;
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Record download server-side and get signed URL
      const signedUrl = await addDownload(courseId, qualite);
      if (!signedUrl) throw new Error('URL de téléchargement non disponible');

      // Determine file extension from URL or type
      const ext = cours.type === 'AUDIO' ? 'mp3' : 'mp4';
      const fileName = `${cours.titre.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${qualite ? `_${qualite}` : ''}.${ext}`;

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

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chargement...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenBackground>
    );
  }

  if (!cours) {
    return (
      <ScreenBackground>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Cours introuvable</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {cours.livre?.titre || 'Cours'}
            </Text>
          </View>
        </View>

        {/* Lecteur (le même que dans l'appli admin) : contrôles natifs, plein écran, -15 s / +15 s */}
        <View style={styles.mediaContainer}>
          <MediaPlayer
            ref={videoRef}
            uri={mediaUri}
            type={cours.type}
            title={cours.type === 'AUDIO' ? cours.titre : undefined}
            artworkUri={cours.miniatureAccessUrl}
            autoPlay={autoPlayNext}
            style={cours.type === 'VIDEO' ? styles.videoWrapper : styles.audioPlayer}
            onLoad={onLoad}
            onProgress={onProgress}
            onEnd={onEnd}
            onPlayingChange={setIsPlaying}
          >
            {/* Choix de la qualité (vidéo en ligne uniquement) */}
            {!isDownloaded && quality && (cours.qualites?.length ?? 0) > 1 && (
              <TouchableOpacity style={styles.qualityBadge} onPress={() => setQualityPicker('play')}>
                <Ionicons name="settings-outline" size={14} color="#FFFFFF" />
                <Text style={styles.qualityBadgeText}>{quality}</Text>
              </TouchableOpacity>
            )}
          </MediaPlayer>
        </View>

        {/* Informations du cours */}
        <View style={styles.infoContainer}>
          <Text style={styles.courseTitle}>{cours.titre}</Text>
          <Text style={styles.courseAuthor}>
            {cours.livre?.auteur || 'Sheikh Ahmed'}
          </Text>

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
                color={colors.text}
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

      <QualityPickerModal
        visible={qualityPicker !== null}
        title={qualityPicker === 'download' ? 'Qualité du téléchargement' : 'Qualité de lecture'}
        qualites={cours.qualites ?? []}
        selected={qualityPicker === 'play' ? quality : null}
        durationSec={qualityPicker === 'download' ? cours.duree : undefined}
        onSelect={(label) => (qualityPicker === 'download' ? startDownload(label) : changeQuality(label))}
        onClose={() => setQualityPicker(null)}
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
    color: colors.text,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.text,
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
  audioPlayer: {
    width: '100%',
  },
  qualityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  qualityBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  audioContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surface,
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
    backgroundColor: 'transparent',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  courseAuthor: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  progressBarWrapper: {
    position: 'relative',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
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
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
  },
  controlButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  downloadButtonDone: {
    backgroundColor: colors.success,
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surfaceAlt,
  },
  descriptionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  descriptionContent: {
    overflow: 'hidden',
  },
  descriptionScroll: {
    maxHeight: 400,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    padding: spacing.lg,
  },
  bottomSpacer: {
    height: 120,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
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

export default CourseDetailScreen;