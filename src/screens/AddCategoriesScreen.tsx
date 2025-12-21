import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { globalStyles, colors } from '../styles/globalStyles';
import { useCategoriesStore } from '../store/useCategoriesStore';
import { useNavigation } from '@react-navigation/native';

const CategoriesScreen = () => {
  // États locaux
  const navigation = useNavigation();
  const [nom, setNom] = useState('');
  const [icone, setIcone] = useState('');
  const [ordreAffichage, setOrdreAffichage] = useState('');
  const [showIconModal, setShowIconModal] = useState(false);
  const {  categories, createCategory } = useCategoriesStore()

  // Liste d'icônes prédéfinies (Ionicons)
  const iconsList = [
    { name: 'book', label: 'Livre' },
    { name: 'library', label: 'Bibliothèque' },
    { name: 'school', label: 'École' },
    { name: 'globe', label: 'Globe' },
    { name: 'heart', label: 'Cœur' },
    { name: 'star', label: 'Étoile' },
    { name: 'moon', label: 'Lune' },
    { name: 'sunny', label: 'Soleil' },
    { name: 'leaf', label: 'Feuille' },
    { name: 'water', label: 'Eau' },
    { name: 'flame', label: 'Flamme' },
    { name: 'diamond', label: 'Diamant' },
    { name: 'medal', label: 'Médaille' },
    { name: 'ribbon', label: 'Ruban' },
    { name: 'flower', label: 'Fleur' },
    { name: 'tree', label: 'Arbre' },
    { name: 'mountain', label: 'Montagne' },
    { name: 'telescope', label: 'Télescope' },
    { name: 'compass', label: 'Boussole' },
    { name: 'map', label: 'Carte' },
    { name: 'key', label: 'Clé' },
    { name: 'lock-closed', label: 'Cadenas' },
    { name: 'shield', label: 'Bouclier' },
    { name: 'trophy', label: 'Trophée' },
    { name: 'gift', label: 'Cadeau' },
    { name: 'balloon', label: 'Ballon' },
    { name: 'bulb', label: 'Ampoule' },
    { name: 'flash', label: 'Éclair' },
    { name: 'umbrella', label: 'Parapluie' },
    { name: 'glasses', label: 'Lunettes' },
    { name: 'musical-notes', label: 'Notes musicales' },
    { name: 'camera', label: 'Caméra' },
    { name: 'color-palette', label: 'Palette' },
    { name: 'brush', label: 'Pinceau' },
    { name: 'calculator', label: 'Calculatrice' },
    { name: 'flask', label: 'Fiole' },
    { name: 'telescope', label: 'Télescope' },
    { name: 'microscope', label: 'Microscope' },
    { name: 'fitness', label: 'Fitness' },
    { name: 'basketball', label: 'Basketball' }
  ];

  const handleSelectIcon = (iconName:any) => {
    setIcone(iconName);
    setShowIconModal(false);
  };

  const handleSave = () => {
    // Logique de sauvegarde
    const categoryData = {
      nom,
      icone
    };
    
    console.log('Sauvegarde de la catégorie:', categoryData);
    createCategory(categoryData)
    // Réinitialiser le formulaire
    setNom('');
    setIcone('');
    setOrdreAffichage('');
    navigation.navigate('ListCategories')
  };

  // Fonction utilitaire pour générer un UUID simple
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.container}>
        {/* Header */}
        <View style={globalStyles.header}>
          <TouchableOpacity onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Nouvelle Catégorie</Text>
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
            <Text style={globalStyles.label}>Ordre d'affichage</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Ex: 1, 2, 3..."
              placeholderTextColor={colors.placeholder}
              value={ordreAffichage}
              onChangeText={setOrdreAffichage}
              keyboardType="numeric"
            />
          </View> */}

          {/* Save Button */}
          <TouchableOpacity style={globalStyles.button} onPress={handleSave}>
            <Text style={globalStyles.buttonText}>Enregistrer</Text>
          </TouchableOpacity>
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

export default CategoriesScreen;