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
  Platform
} from 'react-native';
// import { Ionicons } from '@react-native-vector-icons/ionicons';;
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { globalStyles, colors } from '../styles/globalStyles';
import { pick, types } from '@react-native-documents/picker';
import { useCoursStore } from '../store/useCourseStore';
import { useCategoriesStore } from '../store/useCategoriesStore';
import { useNavigation } from '@react-navigation/native';

const AddCourseScreen = () => {
  // États locaux du formulaire
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [miniatureFile, setMiniatureFile] = useState<any>(null);
  const [markAsNew, setMarkAsNew] = useState(true);
  const [etat, setEtat] = useState<'nouveau' | 'en_cours' | 'publie'>('nouveau');
  
  // États pour les modals
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEtatModal, setShowEtatModal] = useState(false);
  
  // Types de cours
  const courseTypes = [
    { label: 'Vidéo', value: 'video' },
    { label: 'Audio', value: 'audio' },
  ];
  
  // États de publication
  const etats = [
    { label: 'Nouveau', value: 'NOUVEAU' },
    { label: 'En cours', value: 'EN_COURS' },
    { label: 'Publié', value: 'PUBLIE' },
  ];

  const [type, setType] = useState('');

  // Stores Zustand
  const { createCours, coursLoading, coursError, clearError } = useCoursStore();
  const { categories, fetchStats } = useCategoriesStore();

  // Charger les catégories au montage
  useEffect(() => {
    if (fetchStats) {
      fetchStats();
    }
  }, [fetchStats]);

  // Gestion des erreurs
  useEffect(() => {
    if (coursError) {
      Alert.alert('Erreur', coursError);
      clearError();
    }
  }, [coursError, clearError]);

  // Sélection du type de cours
  const handleSelectType = (item: { label: string; value: string }) => {
    setType(item.value);
    setShowTypeModal(false);
    // Réinitialiser le fichier si le type change
    setSelectedFile(null);
  };

  // Sélection de la catégorie
  const handleSelectCategory = (item: any) => {
    console.log('print categories value ----', item)
    setCategorieId(item.id);
    setShowCategoryModal(false);
  };

  // Sélection de l'état
  const handleSelectEtat = (item: { label: string; value: 'nouveau' | 'en_cours' | 'publie' }) => {
    setEtat(item.value);
    setShowEtatModal(false);
  };

  // Upload du fichier principal
  const handleFileUpload = async () => {
    if (!type) {
      Alert.alert('Attention', 'Veuillez d\'abord sélectionner un type de cours');
      return;
    }

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
        console.log('Fichier choisi : ', selectedFileData);
      }
    } catch (err: any) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('Sélection annulée par l\'utilisateur');
      } else {
        console.error('Erreur DocumentPicker', err);
        Alert.alert('Erreur', 'Erreur lors de la sélection du fichier');
      }
    }
  };

  // Upload de la miniature
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
        console.log('Miniature choisie : ', selectedMiniature);
      }
    } catch (err: any) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('Sélection miniature annulée');
      } else {
        console.error('Erreur sélection miniature', err);
        Alert.alert('Erreur', 'Erreur lors de la sélection de la miniature');
      }
    }
  };

  // Validation et soumission
  const handlePublish = async () => {
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

    if (!selectedFile) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier');
      return;
    }

    try {
      // Préparer les données pour l'API
      const coursData = {
        titre: title.trim(),
        description: description.trim() || undefined,
        type: type as 'audio' | 'video',
        etat: etat,
        categorieId: categorieId,
        file: {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name
        } as any, // Conversion pour React Native
        miniature: miniatureFile ? {
          uri: miniatureFile.uri,
          type: miniatureFile.type,
          name: miniatureFile.name
        } as any : undefined
      };

      // Appel de l'API via le store
      const nouveauCours = await createCours(coursData);
      
      // Succès - réinitialiser le formulaire
      setTitle('');
      setDescription('');
      setType('');
      setCategorieId('');
      setSelectedFile(null);
      setMiniatureFile(null);
      setMarkAsNew(true);
      setEtat('nouveau');

      Alert.alert(
        'Succès', 
        'Le cours a été créé avec succès !',
        [{ text: 'OK' }]
      );

      console.log('Nouveau cours créé:', nouveauCours);
      navigation.navigate('ListCours');
      
    } catch (error) {
      console.error('Erreur lors de la création du cours:', error);
      Alert.alert(
        'Erreur', 
        'Une erreur est survenue lors de la création du cours'
      );
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
  const handleCoursesPress = () => {
    navigation.navigate('ListCours');
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header fixe */}
        <View style={globalStyles.header}>
          <TouchableOpacity onPress={handleCoursesPress}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Ajout d'un cours</Text>
        </View>

        {/* Contenu scrollable */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingBottom: 50, // Espace en bas pour éviter que le bouton soit coupé
            flexGrow: 1 
          }}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[globalStyles.formContainer, { paddingTop: 20 }]}>
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

            {/* File Upload */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>
                Fichier {type ? `${type === 'video' ? 'vidéo' : 'audio'}` : ''} *
              </Text>
              <TouchableOpacity style={globalStyles.dropdown} onPress={handleFileUpload}>
                <Text style={{ color: selectedFile ? colors.text : colors.placeholder }}>
                  {selectedFile?.name || 'Charger un fichier'}
                </Text>
                <Ionicons name="cloud-upload-outline" size={20} color={colors.text} />
              </TouchableOpacity>
              {selectedFile && (
                <Text style={{ fontSize: 12, color: colors.placeholder, marginTop: 5 }}>
                  Taille: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </Text>
              )}
            </View>

            {/* Miniature Upload */}
            <View style={globalStyles.inputContainer}>
              <Text style={globalStyles.label}>Miniature (optionnel)</Text>
              <TouchableOpacity style={globalStyles.dropdown} onPress={handleMiniatureUpload}>
                <Text style={{ color: miniatureFile ? colors.text : colors.placeholder }}>
                  {miniatureFile?.name || 'Charger une miniature'}
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

            {/* Publish Button */}
            <TouchableOpacity 
              style={[
                globalStyles.button, 
                { marginTop: 30, marginBottom: 20 }, // Plus d'espace autour du bouton
                (coursLoading || !title || !type || !categorieId || !selectedFile) && { opacity: 0.6 }
              ]} 
              onPress={handlePublish}
              disabled={coursLoading || !title || !type || !categorieId || !selectedFile}
            >
              {coursLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={globalStyles.buttonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>

            {/* Informations utiles */}
            <View style={{
              backgroundColor: '#f8f9fa',
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
                📝 Informations importantes :
              </Text>
              <Text style={{ fontSize: 12, color: colors.placeholder, lineHeight: 18 }}>
                • La durée sera calculée automatiquement{'\n'}
                • Formats supportés: MP4, MOV, AVI (vidéo) / MP3, WAV, AAC (audio){'\n'}
                • Taille max recommandée: 500 MB{'\n'}
                • La miniature améliore l'attrait visuel de votre cours
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
                      borderBottomColor: '#f0f0f0' 
                    }}
                    onPress={() => handleSelectType(item)}
                  >
                    <Text style={{ fontSize: 16 }}>{item.label}</Text>
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
                      alignItems: 'center'
                    }}
                    onPress={() => handleSelectCategory(item)}
                  >
                    {item.icone && (
                      <Ionicons 
                              name={item.icone} 
                              size={24} 
                              color={colors.background} 
                            />
                      // <Text style={{ marginRight: 10, fontSize: 18 }}>{item.icone}</Text>
                    )}
                    &nbsp; &nbsp; &nbsp;
                    <Text style={{ fontSize: 16, flex: 1, marginLeft: 10}}>{item.nom}</Text>
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
                      borderBottomColor: '#f0f0f0' 
                    }}
                    onPress={() => handleSelectEtat(item)}
                  >
                    <Text style={{ 
                      fontSize: 16,
                      // color: item.value === etat ? colors.primary : colors.text,
                      fontWeight: item.value === etat ? 'bold' : 'normal'
                    }}>
                      {item.label}
                    </Text>
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

export default AddCourseScreen;