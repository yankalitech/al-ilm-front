import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Share,
  Modal,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Video from 'react-native-video';
import { globalStyles, colors } from '../styles/globalStyles';
import { useCoursStore } from '../store/useCourseStore';
import { useCategoriesStore } from '../store/useCategoriesStore';

const { width } = Dimensions.get('window');

// Composant de lecture audio/vidéo
const MediaPlayer = ({ uri, type, title, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value) => {
    if (videoRef.current && duration > 0) {
      const seekTime = (value / 100) * duration;
      videoRef.current.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
    setIsLoading(false);
    setHasError(false);
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleError = (error) => {
    console.error('Erreur de lecture:', error);
    setHasError(true);
    setIsLoading(false);
    Alert.alert('Erreur', 'Impossible de lire ce fichier média');
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        {/* Header du lecteur */}
        <View style={styles.playerHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.playerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.playerContent}>
          {/* Lecteur vidéo/audio */}
          <View style={[
            styles.videoContainer, 
            type === 'AUDIO' && styles.audioContainer
          ]}>
            <Video
              ref={videoRef}
              source={{ uri }}
              style={type === 'VIDEO' ? styles.video : styles.audio}
              paused={!isPlaying}
              resizeMode="contain"
              onLoad={handleLoad}
              onProgress={handleProgress}
              onError={handleError}
              onEnd={() => setIsPlaying(false)}
              controls={false}
              repeat={false}
            />

            {/* Overlay pour audio avec icône */}
            {type === 'AUDIO' && (
              <View style={styles.audioOverlay}>
                <Ionicons 
                  name="musical-notes" 
                  size={80} 
                  color={colors.primary} 
                />
                <Text style={styles.audioTitle}>{title}</Text>
              </View>
            )}

            {/* Indicateur de chargement */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            )}

            {/* Message d'erreur */}
            {hasError && (
              <View style={styles.errorOverlay}>
                <Ionicons name="alert-circle" size={60} color="#dc3545" />
                <Text style={styles.errorText}>
                  Erreur de lecture
                </Text>
              </View>
            )}
          </View>

          {/* Contrôles de lecture */}
          {!hasError && (
            <View style={styles.controls}>
              {/* Barre de progression */}
              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>
                  {formatTime(currentTime)}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${progressPercentage}%` }
                    ]} 
                  />
                  <TouchableOpacity
                    style={[
                      styles.progressThumb,
                      { left: `${progressPercentage}%` }
                    ]}
                    onPress={() => {}}
                  />
                </View>
                <Text style={styles.timeText}>
                  {formatTime(duration)}
                </Text>
              </View>

              {/* Boutons de contrôle */}
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => handleSeek(Math.max(0, progressPercentage - 10))}
                >
                  <Ionicons name="play-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.playButton]}
                  onPress={handlePlayPause}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={32} 
                    color="#fff" 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => handleSeek(Math.min(100, progressPercentage + 10))}
                >
                  <Ionicons name="play-forward" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

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
        backgroundColor: '#f0f0f0', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }]}>
        <Ionicons name={fallbackIcon} size={40} color="#ccc" />
        <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
          Image indisponible
        </Text>
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
          backgroundColor: '#f0f0f0'
        }]}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      )}
    </View>
  );
};

// Fonction utilitaire pour nettoyer les URLs Google Cloud
const cleanGoogleCloudUrl = (url) => {
  if (!url) return null;
  
  try {
    // Décoder les caractères encodés dans l'URL
    const decodedUrl = decodeURIComponent(url);
    
    // Vérifier si l'URL est bien formée
    new URL(decodedUrl);
    
    return decodedUrl;
  } catch (error) {
    console.error('URL invalide:', error);
    return null;
  }
};

const ViewCourseScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  
  // États locaux
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  // Stores Zustand
  const { viewCours, deleteCours } = useCoursStore();
  const { categories } = useCategoriesStore();

  // Charger les détails du cours
  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await viewCours(courseId);
      
      // Debug pour les URLs d'images
      console.log('URL miniature reçue:', courseData?.miniatureAccessUrl);
      console.log('URL nettoyée:', courseData?.miniatureAccessUrl);
      // cleanGoogleCloudUrl(courseData?.miniatureAccessUrl)
      setCourse(courseData);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement du cours:', err);
      setError('Impossible de charger les détails du cours');
    } finally {
      setLoading(false);
    }
  };

  // Obtenir les informations de la catégorie
  const getCategoryInfo = () => {
    if (!course?.categorieId || !categories) return null;
    return categories.find(cat => cat.id === course.categorieId);
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir le badge d'état
  const getEtatBadge = () => {
    const etats = {
      'NOUVEAU': { label: 'Nouveau', color: '#28a745', bgColor: '#d4edda' },
      'EN_COURS': { label: 'En cours', color: '#ffc107', bgColor: '#fff3cd' },
      'PUBLIE': { label: 'Publié', color: '#17a2b8', bgColor: '#d1ecf1' }
    };
    
    const etatInfo = etats[course?.etat] || etats.NOUVEAU;
    
    return (
      <View style={{
        backgroundColor: etatInfo.bgColor,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        alignSelf: 'flex-start'
      }}>
        <Text style={{
          color: etatInfo.color,
          fontSize: 12,
          fontWeight: 'bold'
        }}>
          {etatInfo.label}
        </Text>
      </View>
    );
  };

  // Supprimer le cours
  const handleDelete = () => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCours(courseId);
              Alert.alert('Succès', 'Le cours a été supprimé avec succès');
              navigation.navigate('ListCours');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le cours');
            }
          }
        }
      ]
    );
  };

  // Partager le cours
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Découvrez ce cours : ${course.titre}\n${course.description || ''}`,
        title: course.titre,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  // Naviguer vers la page de modification
  const handleEdit = () => {
    navigation.navigate('EditCourse', { courseId: course.id });
  };

  // Ouvrir le lecteur média
  const handlePlayMedia = () => {
    if (!course.fichierAccessUrl) {
      Alert.alert('Erreur', 'Aucun fichier disponible pour la lecture');
      return;
    }

    const cleanedUrl = course.fichierAccessUrl;
    if (!cleanedUrl) {
      Alert.alert('Erreur', 'URL du fichier invalide');
      return;
    }

    setShowPlayer(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.text }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.placeholder} />
          <Text style={{ marginTop: 16, color: colors.text, textAlign: 'center' }}>
            {error || 'Cours non trouvé'}
          </Text>
          <TouchableOpacity 
            style={[globalStyles.button, { marginTop: 20 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={globalStyles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categoryInfo = getCategoryInfo();
  const cleanedImageUrl = course?.miniatureAccessUrl;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {/* Header avec actions */}
      <View style={[globalStyles.header, { justifyContent: 'space-between' }]}>
        <TouchableOpacity onPress={() => navigation.navigate('ListCours')}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={globalStyles.headerTitle} numberOfLines={1}>
          Détails du cours
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleShare} style={{ marginRight: 15 }}>
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleEdit} style={{ marginRight: 15 }}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#dc3545" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.formContainer}>
          {/* Miniature avec gestion d'erreur améliorée */}
          {cleanedImageUrl && (
            <View style={{ marginBottom: 20 }}>
              <SafeImage
                source={{ uri: cleanedImageUrl }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 12,
                }}
                fallbackIcon="image-outline"
              />
            </View>
          )}

          {/* Titre et état */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: colors.text,
                flex: 1,
                marginRight: 10
              }}>
                {course.titre}
              </Text>
              {getEtatBadge()}
            </View>
            
            {course.isNew && (
              <View style={{
                backgroundColor: '#ffeaa7',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                alignSelf: 'flex-start',
                marginTop: 5
              }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#d63031' }}>
                  NOUVEAU
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {course.description && (
            <View style={componentStyles.infoSection}>
              <Text style={componentStyles.sectionTitle}>Description</Text>
              <Text style={componentStyles.descriptionText}>{course.description}</Text>
            </View>
          )}

          {/* Informations générales */}
          <View style={componentStyles.infoSection}>
            <Text style={componentStyles.sectionTitle}>Informations générales</Text>
            
            <View style={componentStyles.infoRow}>
              <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
              <Text style={componentStyles.infoLabel}>Type :</Text>
              <Text style={componentStyles.infoValue}>
                {course.type === 'VIDEO' ? 'Vidéo' : course.type === 'AUDIO' ? 'Audio' : course.type}
              </Text>
            </View>

            {categoryInfo && (
              <View style={componentStyles.infoRow}>
                <Ionicons name={categoryInfo.icone || "folder-outline"} size={20} color={colors.primary} />
                <Text style={componentStyles.infoLabel}>Catégorie :</Text>
                <Text style={componentStyles.infoValue}>{categoryInfo.nom}</Text>
              </View>
            )}

            {course.duree && (
              <View style={componentStyles.infoRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={componentStyles.infoLabel}>Durée :</Text>
                <Text style={componentStyles.infoValue}>{course.duree} min</Text>
              </View>
            )}

            <View style={componentStyles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={componentStyles.infoLabel}>Créé le :</Text>
              <Text style={componentStyles.infoValue}>{formatDate(course.datePublication)}</Text>
            </View>

            {course.updatedAt && course.updatedAt !== course.datePublication && (
              <View style={componentStyles.infoRow}>
                <Ionicons name="refresh-outline" size={20} color={colors.primary} />
                <Text style={componentStyles.infoLabel}>Modifié le :</Text>
                <Text style={componentStyles.infoValue}>{formatDate(course.updatedAt)}</Text>
              </View>
            )}
          </View>

          {/* Informations du fichier */}
          <View style={componentStyles.infoSection}>
            <Text style={componentStyles.sectionTitle}>Fichier</Text>
            
            {course.fileName && (
              <View style={componentStyles.infoRow}>
                <Ionicons name="document-outline" size={20} color={colors.primary} />
                <Text style={componentStyles.infoLabel}>Nom :</Text>
                <Text style={[componentStyles.infoValue, { flex: 1 }]} numberOfLines={2}>
                  {course.fileName}
                </Text>
              </View>
            )}

            {course.fileSize && (
              <View style={componentStyles.infoRow}>
                <Ionicons name="archive-outline" size={20} color={colors.primary} />
                <Text style={componentStyles.infoLabel}>Taille :</Text>
                <Text style={componentStyles.infoValue}>{formatFileSize(course.fileSize)}</Text>
              </View>
            )}

            {course.fichierAccessUrl && (
              <TouchableOpacity 
                style={[globalStyles.button, { marginTop: 15, backgroundColor: colors.secondary, color : colors.primary }]}
                onPress={handlePlayMedia}
              >
                <Ionicons 
                  name={course.type === 'VIDEO' ? "play" : "musical-notes"} 
                  size={20} 
                  color= {colors.primary }
                  style={{ marginRight: 8 }} 
                />
                <Text style={[globalStyles.buttonText, { marginTop: 15,  color : colors.primary }]}>
                  {course.type === 'VIDEO' ? 'Lire la vidéo' : 'Écouter l\'audio'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Statistiques */}
          <View style={componentStyles.infoSection}>
            <Text style={componentStyles.sectionTitle}>Statistiques</Text>
            
            <View style={componentStyles.statsContainer}>
              <View style={componentStyles.statItem}>
                <Ionicons name="eye-outline" size={24} color={colors.primary} />
                <Text style={componentStyles.statNumber}>{course.vues || 0}</Text>
                <Text style={componentStyles.statLabel}>Vues</Text>
              </View>
              
              <View style={componentStyles.statItem}>
                <Ionicons name="heart-outline" size={24} color={colors.primary} />
                <Text style={componentStyles.statNumber}>{course.likes || 0}</Text>
                <Text style={componentStyles.statLabel}>Likes</Text>
              </View>
              
              <View style={componentStyles.statItem}>
                <Ionicons name="download-outline" size={24} color={colors.primary} />
                <Text style={componentStyles.statNumber}>{course.telechargements || 0}</Text>
                <Text style={componentStyles.statLabel}>Téléchargements</Text>
              </View>
            </View>
          </View>

          {/* Actions supplémentaires */}
          <View style={{ marginTop: 30, marginBottom: 20 }}>
            <TouchableOpacity 
              style={[globalStyles.button, { backgroundColor: colors.primary }]}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={globalStyles.buttonText}>Modifier ce cours</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Lecteur média */}
      {showPlayer && course.fichierAccessUrl && (
        <MediaPlayer
          uri={course.fichierAccessUrl}
          type={course.type}
          title={course.titre}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </SafeAreaView>
  );
};

// Styles spécifiques à cette page
const componentStyles = {
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 10,
    minWidth: 80,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.placeholder,
    marginLeft: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.primary,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.placeholder,
    marginTop: 2,
  },
};

// Styles pour le lecteur média
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  playerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerContent: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  audioContainer: {
    backgroundColor: '#1a1a1a',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  audio: {
    width: 0,
    height: 0,
  },
  audioOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  audioTitle: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
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
  errorText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginHorizontal: 10,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginLeft: -8,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    padding: 15,
    marginHorizontal: 10,
  },
  playButton: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewCourseScreen;