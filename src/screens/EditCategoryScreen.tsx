import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { globalStyles, colors } from '../styles/globalStyles';
import { useCategoriesStore } from '../store/useCategoriesStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import {iconsList} from '../utils/globalsConstant';

const EditCategoryScreen = () => {
  // Navigation et paramètres
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId } = route.params;

  // États locaux
  const [nom, setNom] = useState('');
  const [icone, setIcone] = useState('');
  const [ordreAffichage, setOrdreAffichage] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Store
  const { category, updateCategory, viewCategory } = useCategoriesStore();

  // Charger les données de la catégorie à modifier
  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  useEffect(() => {
    if (category) {
        setNom(category.nom);
        setIcone(category.icone);
        setOrdreAffichage(category.ordre_affichage?.toString() || '');
    } 
  }, [category])
  const loadCategoryData = () => {
    try {
      viewCategory({id: categoryId});
      console.log('categories view', category)
      
    } catch (error) {
      console.error('Erreur lors du chargement de la catégorie:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données de la catégorie',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIcon = (iconName) => {
    setIcone(iconName);
    setShowIconModal(false);
  };

  const handleUpdate = () => {
    // Validation des données
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie est obligatoire');
      return;
    }

    if (!icone) {
      Alert.alert('Erreur', 'Veuillez sélectionner une icône');
      return;
    }

    try {
      // Données de mise à jour
      const updatedData = {
        nom: nom.trim(),
        icone,
        categoryId
      };

      console.log('Mise à jour de la catégorie:', updatedData);
      
      // Appel du store pour mettre à jour
      updateCategory(updatedData);

      Alert.alert(
        'Succès',
        'La catégorie a été modifiée avec succès',
        [{ text: 'OK', onPress: () => navigation.navigate('ListCategories') }]
      );

    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de modifier la catégorie');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Confirmer',
      'Êtes-vous sûr de vouloir annuler les modifications ?',
      [
        { text: 'Non', style: 'cancel' },
        { text: 'Oui', onPress: () => navigation.goBack() }
      ]
    );
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderIconItem = ({ item }) => (
    <TouchableOpacity
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        margin: 5,
        backgroundColor: icone === item.name ? colors.primary : colors.background,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: icone === item.name ? colors.primary : colors.border,
        width: 80,
        height: 80
      }}
      onPress={() => handleSelectIcon(item.name)}
    >
      <Ionicons 
        name={item.name} 
        size={24} 
        color={icone === item.name ? colors.background : colors.text} 
      />
      <Text 
        style={{ 
          fontSize: 10, 
          marginTop: 5, 
          textAlign: 'center',
          color: icone === item.name ? colors.background : colors.text 
        }}
        numberOfLines={2}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: colors.text, fontSize: 16 }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.container}>
        {/* Header */}
        <View style={globalStyles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Modifier Catégorie</Text>
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={globalStyles.formContainer}>
          {/* Nom de la catégorie */}
          <View style={globalStyles.inputContainer}>
            <Text style={globalStyles.label}>Nom de la catégorie</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Ex: Jurisprudence islamique (Fiqh)"
              placeholderTextColor={colors.placeholder}
              value={nom}
              onChangeText={setNom}
            />
          </View>

          {/* Sélection d'icône */}
          <View style={globalStyles.inputContainer}>
            <Text style={globalStyles.label}>Icône</Text>
            <TouchableOpacity
              style={globalStyles.dropdown}
              onPress={() => setShowIconModal(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {icone ? (
                  <Ionicons name={icone} size={20} color={colors.text} style={{ marginRight: 10 }} />
                ) : null}
                <Text style={{ color: icone ? colors.text : colors.placeholder }}>
                  {icone ? `Icône sélectionnée: ${iconsList.find(icon => icon.name === icone)?.label || icone}` : 'Sélectionner une icône'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Ordre d'affichage */}
          {/* <View style={globalStyles.inputContainer}>
            <Text style={globalStyles.label}>Ordre d'affichage (optionnel)</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Ex: 1, 2, 3..."
              placeholderTextColor={colors.placeholder}
              value={ordreAffichage}
              onChangeText={setOrdreAffichage}
              keyboardType="numeric"
            />
          </View> */}

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity 
              style={[
                globalStyles.button, 
                { 
                  flex: 1, 
                  backgroundColor: colors.border,
                }
              ]} 
              onPress={handleCancel}
            >
              <Text style={[globalStyles.buttonText, { color: colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[globalStyles.button, { flex: 1 }]} 
              onPress={handleUpdate}
            >
              <Text style={globalStyles.buttonText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de sélection d'icône */}
        <Modal visible={showIconModal} transparent animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000077' }}>
            <View
              style={{
                backgroundColor: colors.background,
                marginHorizontal: 20,
                borderRadius: 15,
                padding: 20,
                maxHeight: '80%'
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                  Choisir une icône
                </Text>
                <TouchableOpacity onPress={() => setShowIconModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={iconsList}
                renderItem={renderIconItem}
                keyExtractor={(item) => item.name}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: colors.border,
                    borderRadius: 8
                  }}
                  onPress={() => setShowIconModal(false)}
                >
                  <Text style={{ color: colors.text }}>Annuler</Text>
                </TouchableOpacity>
                
                {icone && (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      backgroundColor: colors.primary,
                      borderRadius: 8
                    }}
                    onPress={() => setShowIconModal(false)}
                  >
                    <Text style={{ color: colors.background }}>Confirmer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default EditCategoryScreen;