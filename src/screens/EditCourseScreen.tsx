import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { globalStyles, colors } from '../styles/globalStyles';
import { pick, types } from '@react-native-documents/picker';
import { useCoursStore } from '../store/useCourseStore';
import { useCategoriesStore } from '../store/useCategoriesStore';

const EditCourseScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  
  // États locaux du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [miniatureFile, setMiniatureFile] = useState(null);
  const [currentMiniatureUrl, setCurrentMiniatureUrl] = useState('');
  const [markAsNew, setMarkAsNew] = useState(true);
  const [etat, setEtat] = useState('nouveau');
  const [type, setType] = useState('');
  
  // États de chargement
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  
  // États pour les modals
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEtatModal, setShowEtatModal] = useState(false);
  
  // Types de cours
  const courseTypes = [
    { label: 'Vidéo', value: 'VIDEO' },
    { label: 'Audio', value: 'AUDIO' },
  ];
  
  // États de publication
  const etats = [
    { label: 'Nouveau', value: 'NOUVEAU' },
    { label: 'En cours', value: 'EN_COURS' },
    { label: 'Publié', value: 'PUBLIE' },
  ];

  // Stores Zustand
  const { viewCours, updateCoursData, coursLoading, coursError, clearError } = useCoursStore();
  const { categories, fetchStats } = useCategoriesStore();

  // Charger les données du cours et les catégories
  useEffect(() => {
    loadInitialData();
  }, [courseId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Charger les catégories si nécessaire
      if (fetchStats) {
        await fetchStats();
      }
      
      // Charger les données du cours
      const courseData = await viewCours(courseId);
      
      if (courseData) {
        // Remplir les champs avec les données existantes
        console.log('value of course --------', courseData)
        setTitle(courseData.titre || '');
        setDescription(courseData.description || '');
        setType(courseData.type || '');
        setCategorieId(courseData.categorieId || '');
        setEtat(courseData.etat || 'nouveau');
        setMarkAsNew(courseData.isNew || false);
        setCurrentMiniatureUrl(courseData.miniatureUrl || '');
        
        setInitialData(courseData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du cours');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Gestion des erreurs
  useEffect(() => {
    if (coursError) {
      Alert.alert('Erreur', coursError);
      clearError();
    }
  }, [coursError, clearError]);

  // Vérifier si des modifications ont été apportées
  const hasChanges = () => {
    if (!initialData) return false;
    
    return (
      title !== initialData.titre ||
      description !== (initialData.description || '') ||
      type !== initialData.type ||
      categorieId !== initialData.categorieId ||
      etat !== initialData.etat ||
      markAsNew !== (initialData.isNew || false) ||
      selectedFile !== null ||
      miniatureFile !== null
    );
  };

  // Sélection du type de cours
  const handleSelectType = (item) => {
    setType(item.value);
    setShowTypeModal(false);
    // Si le type change, on peut vouloir permettre de changer le fichier
  };

  // Sélection de la catégorie
  const handleSelectCategory = (item) => {
    setCategorieId(item.id);
    setShowCategoryModal(false);
  };

  // Sélection de l'état
  const handleSelectEtat = (item) => {
    setEtat(item.value);
    setShowEtatModal(false);
  };

  // Upload du nouveau fichier principal
  const handleFileUpload = async () => {
    if (!type) {
      Alert.alert('Attention', 'Veuillez d\'abord sélectionner un type de cours');
      return;
    }

    Alert.alert(
      'Remplacer le fichier',
      'Êtes-vous sûr de vouloir remplacer le fichier existant ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Remplacer', 
          onPress: async () => {
            try {
              let fileTypes;
              
              if (type === 'video') {
                fileTypes = [types.video];
              } else if (type === 'audio') {
                fileTypes = [types.audio];
              } else {
                fileTypes = [types.allFiles];
              }

              const result = await pick({
                type: fileTypes,
                allowMultiSelection: false,
                copyTo: 'cachesDirectory',
              });

              if (result && result.length > 0) {
                const selectedFileData = result[0];
                setSelectedFile(selectedFileData);
                console.log('Nouveau fichier choisi : ', selectedFileData);
              }
            } catch (err) {
              if (err.code === 'DOCUMENT_PICKER_CANCELED') {
                console.log('Sélection annulée par l\'utilisateur');
              } else {
                console.error('Erreur DocumentPicker', err);
                Alert.alert('Erreur', 'Erreur lors de la sélection du fichier');
              }
            }
          }
        }
      ]
    );
  };

  // Upload de la nouvelle miniature
  const handleMiniatureUpload = async () => {
    try {
      const result = await pick({
        type: [types.images],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });

      if (result && result.length > 0) {
        const selectedMiniature = result[0];
        setMiniatureFile(selectedMiniature);
        console.log('Nouvelle miniature choisie : ', selectedMiniature);
      }
    } catch (err) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('Sélection miniature annulée');
      } else {
        console.error('Erreur sélection miniature', err);
        Alert.alert('Erreur', 'Erreur lors de la sélection de la miniature');
      }
    }
  };

  // Validation et soumission
  const handleUpdate = async () => {
    // Vérifier s'il y a des modifications
    if (!hasChanges()) {
      Alert.alert('Information', 'Aucune modification n\'a été détectée');
      return;
    }

    // Validation des champs obligatoires
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return;
    }

    if (!type) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de cours');
      return;
    }

    if (!categorieId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    try {
      // Préparer les données pour l'API
      const updateData = {
        coursId: courseId,
        titre: title.trim(),
        description: description.trim() || undefined,
        type: type,
        etat: etat,
        categorieId: categorieId,
        isNew: markAsNew
      };

      // Ajouter le nouveau fichier principal si sélectionné
      if (selectedFile) {
        updateData.file = {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name
        };
      }

      // Ajouter la nouvelle miniature si sélectionnée
      if (miniatureFile) {
        updateData.miniature = {
          uri: miniatureFile.uri,
          type: miniatureFile.type,
          name: miniatureFile.name
        };
      }

      // Appel de l'API via le store
      const updatedCours = await updateCoursData(updateData);

      Alert.alert(
        'Succès', 
        'Le cours a été modifié avec succès !',
        [
          { 
            text: 'OK', 
            onPress: () =>  navigation.navigate('ViewCourse', { courseId: courseId })
          }
        ]
      );

      console.log('Cours modifié:', updatedCours);
      
    } catch (error) {
      console.error('Erreur lors de la modification du cours:', error);
      Alert.alert(
        'Erreur', 
        'Une erreur est survenue lors de la modification du cours'
      );
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Modifications non sauvegardées',
        'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?',
        [
          { text: 'Continuer l\'édition', style: 'cancel' },
          { 
            text: 'Quitter sans sauvegarder', 
            style: 'destructive',
            onPress: () => navigation.navigate('ViewCourse', { courseId: courseId })
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Obtenir le label de la catégorie sélectionnée
  const getSelectedCategoryLabel = () => {
    const selectedCategory = categories?.find(cat => cat.id === categorieId);
    return selectedCategory?.nom || 'Sélectionner la catégorie de cours';
  };

  // Obtenir le label de l'état sélectionné
  const getSelectedEtatLabel = () => {
    const selectedEtat = etats.find(e => e.value === etat);
    return selectedEtat?.label || 'Nouveau';
  };

  // Affichage du loading initial
  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.text }}>Chargement des données...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={globalStyles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Modifier le cours</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Contenu scrollable */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingBottom: 50,
            flexGrow: 1 
          }}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[globalStyles.formContainer, { paddingTop: 20 }]}>
            
            {/* Indicateur de modifications */}
            {hasChanges() && (
              <View style={{
                backgroundColor: '#fff3cd',
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Ionicons name="warning-outline" size={20} color="#856404" />
                <Text style={{
                  marginLeft: 8,
                  color: '#856404',
                  fontSize: 14,
                  fontWeight: '500'
                }}>
                  Vous avez des modifications non sauvegardées
                </Text>
              </View>
            )}

            {/* Course Title */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>Titre du cours *</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Entrer le titre du cours"
                placeholderTextColor={colors.placeholder}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>Description</Text>
              <TextInput
                style={[globalStyles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Description du cours (optionnel)"
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Course Type */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>Type du cours *</Text>
              <TouchableOpacity
                style={globalStyles.dropdown}
                onPress={() => setShowTypeModal(true)}
              >
                <Text style={{ color: type ? colors.text : colors.placeholder }}>
                  {courseTypes.find((item) => item.value === type)?.label || 'Sélectionner le type'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* File Upload - Fichier actuel + option de remplacement */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>
                Fichier {type ? `${type === 'video' ? 'vidéo' : 'audio'}` : ''} *
              </Text>
              
              {/* Affichage du fichier actuel */}
              {initialData?.fileName && !selectedFile && (
                <View style={{
                  backgroundColor: '#e9ecef',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                      Fichier actuel:
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.placeholder }} numberOfLines={1}>
                      {initialData.fileName}
                    </Text>
                    {initialData.fileSize && (
                      <Text style={{ fontSize: 12, color: colors.placeholder }}>
                        Taille: {(initialData.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </Text>
                    )}
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                </View>
              )}
              
              {/* Nouveau fichier sélectionné */}
              {selectedFile && (
                <View style={{
                  backgroundColor: '#d4edda',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#155724' }}>
                      Nouveau fichier:
                    </Text>
                    <Text style={{ fontSize: 12, color: '#155724' }} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#155724' }}>
                      Taille: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <Ionicons name="close-circle" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              )}
              
              <TouchableOpacity style={globalStyles.dropdown} onPress={handleFileUpload}>
                <Text style={{ color: colors.text }}>
                  {selectedFile ? 'Changer le fichier' : 'Remplacer le fichier'}
                </Text>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Miniature Upload - Actuelle + option de remplacement */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>Miniature (optionnel)</Text>
              
              {/* Affichage de la miniature actuelle */}
              {currentMiniatureUrl && !miniatureFile && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.placeholder, marginBottom: 5 }}>
                    Miniature actuelle:
                  </Text>
                  <Image
                    source={{ uri: currentMiniatureUrl }}
                    style={{
                      width: 100,
                      height: 60,
                      borderRadius: 8,
                      resizeMode: 'cover'
                    }}
                  />
                </View>
              )}
              
              {/* Nouvelle miniature sélectionnée */}
              {miniatureFile && (
                <View style={{ marginBottom: 8 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 5
                  }}>
                    <Text style={{ fontSize: 12, color: '#155724', fontWeight: '500' }}>
                      Nouvelle miniature:
                    </Text>
                    <TouchableOpacity onPress={() => setMiniatureFile(null)}>
                      <Ionicons name="close-circle" size={20} color="#dc3545" />
                    </TouchableOpacity>
                  </View>
                  <Image
                    source={{ uri: miniatureFile.uri }}
                    style={{
                      width: 100,
                      height: 60,
                      borderRadius: 8,
                      resizeMode: 'cover'
                    }}
                  />
                </View>
              )}
              
              <TouchableOpacity style={globalStyles.dropdown} onPress={handleMiniatureUpload}>
                <Text style={{ color: colors.text }}>
                  {miniatureFile ? 'Changer la miniature' : 
                   currentMiniatureUrl ? 'Remplacer la miniature' : 'Ajouter une miniature'}
                </Text>
                <Ionicons name="image-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Category */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>Catégorie *</Text>
              <TouchableOpacity 
                style={globalStyles.dropdown}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={{ color: categorieId ? colors.text : colors.placeholder }}>
                  {getSelectedCategoryLabel()}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* État de publication */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>État de publication</Text>
              <TouchableOpacity 
                style={globalStyles.dropdown}
                onPress={() => setShowEtatModal(true)}
              >
                <Text style={{ color: colors.text }}>
                  {getSelectedEtatLabel()}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Mark as new toggle */}
            <View style={globalStyles.toggleContainer}>
              <Text style={globalStyles.label}>Marquer comme nouveau</Text>
              <Switch
                value={markAsNew}
                onValueChange={(value) => {
                  setMarkAsNew(value);
                  if (value) {
                    setEtat('nouveau');
                  }
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            {/* Action Buttons */}
            <View style={{ marginTop: 30, marginBottom: 20 }}>
              {/* Update Button */}
              <TouchableOpacity 
                style={[
                  globalStyles.button, 
                  { marginBottom: 15 },
                  (coursLoading || !title || !type || !categorieId || !hasChanges()) && { opacity: 0.6 }
                ]} 
                onPress={handleUpdate}
                disabled={coursLoading || !title || !type || !categorieId || !hasChanges()}
              >
                {coursLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={globalStyles.buttonText}>Sauvegarder les modifications</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity 
                style={[globalStyles.button, { backgroundColor: '#6c757d' }]}
                onPress={handleCancel}
                disabled={coursLoading}
              >
                <Ionicons name="close" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={globalStyles.buttonText}>Annuler</Text>
              </TouchableOpacity>
            </View>

            {/* Informations utiles */}
            <View style={{
              backgroundColor: '#e7f3ff',
              padding: 15,
              borderRadius: 8,
              marginTop: 10,
              marginBottom: 30
            }}>
              <Text style={{ 
                fontSize: 14, 
                color: colors.text, 
                fontWeight: '600',
                marginBottom: 8
              }}>
                ℹ️ Informations de modification :
              </Text>
              <Text style={{ fontSize: 12, color: colors.placeholder, lineHeight: 18 }}>
                • Les fichiers ne seront remplacés que si vous en sélectionnez de nouveaux{'\n'}
                • La modification de la durée sera recalculée automatiquement si nécessaire{'\n'}
                • Les statistiques (vues, likes) seront conservées{'\n'}
                • Un backup automatique de l'ancien fichier sera créé
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Modal de sélection du type */}
        <Modal visible={showTypeModal} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000077' }}>
            <View style={{
              backgroundColor: '#fff',
              marginHorizontal: 30,
              borderRadius: 8,
              padding: 20,
              maxHeight: '50%'
            }}>
              <Text style={{ fontSize: 18, marginBottom: 15, fontWeight: 'bold' }}>
                Choisir un type
              </Text>
              <FlatList
                data={courseTypes}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ 
                      paddingVertical: 15, 
                      borderBottomWidth: 1, 
                      borderBottomColor: '#f0f0f0',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onPress={() => handleSelectType(item)}
                  >
                    <Text style={{ fontSize: 16 }}>{item.label}</Text>
                    {type === item.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={{ marginTop: 15, alignSelf: 'flex-end' }}
                onPress={() => setShowTypeModal(false)}
              >
                <Text style={{ color: 'red', fontSize: 16 }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de sélection de catégorie */}
        <Modal visible={showCategoryModal} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000077' }}>
            <View style={{
              backgroundColor: '#fff',
              marginHorizontal: 30,
              borderRadius: 8,
              padding: 20,
              maxHeight: '70%'
            }}>
              <Text style={{ fontSize: 18, marginBottom: 15, fontWeight: 'bold' }}>
                Choisir une catégorie
              </Text>
              <FlatList
                data={categories || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ 
                      paddingVertical: 15, 
                      borderBottomWidth: 1, 
                      borderBottomColor: '#f0f0f0',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onPress={() => handleSelectCategory(item)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {item.icone && (
                        <Ionicons 
                          name={item.icone} 
                          size={24} 
                          color={colors.primary} 
                        />
                      )}
                      <Text style={{ fontSize: 16, flex: 1, marginLeft: 10 }}>{item.nom}</Text>
                    </View>
                    {categorieId === item.id && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', color: colors.placeholder, marginTop: 20 }}>
                    Aucune catégorie disponible
                  </Text>
                }
              />
              <TouchableOpacity
                style={{ marginTop: 15, alignSelf: 'flex-end' }}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={{ color: 'red', fontSize: 16 }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de sélection de l'état */}
        <Modal visible={showEtatModal} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000077' }}>
            <View style={{
              backgroundColor: '#fff',
              marginHorizontal: 30,
              borderRadius: 8,
              padding: 20,
              maxHeight: '50%'
            }}>
              <Text style={{ fontSize: 18, marginBottom: 15, fontWeight: 'bold' }}>
                État de publication
              </Text>
              <FlatList
                data={etats}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ 
                      paddingVertical: 15, 
                      borderBottomWidth: 1, 
                      borderBottomColor: '#f0f0f0',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onPress={() => handleSelectEtat(item)}
                  >
                    <Text style={{ 
                      fontSize: 16,
                      fontWeight: item.value === etat ? 'bold' : 'normal'
                    }}>
                      {item.label}
                    </Text>
                    {etat === item.value && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={{ marginTop: 15, alignSelf: 'flex-end' }}
                onPress={() => setShowEtatModal(false)}
              >
                <Text style={{ color: 'red', fontSize: 16 }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditCourseScreen;