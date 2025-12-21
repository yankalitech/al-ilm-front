import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { globalStyles, colors } from '../styles/globalStyles';
import { useCategoriesStore } from '../store/useCategoriesStore' 
import { useNavigation } from '@react-navigation/native';

const CategoriesListScreen = () => {
  // États locaux
  const navigation = useNavigation();
  const [categories_elt, setCategories] = useState([]);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const {  categories, fetchStats, deleteCategory } = useCategoriesStore()

  // Données de test (à remplacer par un appel API)
  const mockCategories = [
    {
      id: '1',
      nom: 'Jurisprudence islamique (Fiqh)',
      icone: 'book',
      ordre_affichage: 1,
      date_creation: '2024-01-15T10:30:00Z',
      date_mise_a_jour: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      nom: 'Théologie islamique (Aqida)',
      icone: 'star',
      ordre_affichage: 2,
      date_creation: '2024-01-14T14:20:00Z',
      date_mise_a_jour: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      nom: 'Langue arabe',
      icone: 'library',
      ordre_affichage: 3,
      date_creation: '2024-01-13T09:15:00Z',
      date_mise_a_jour: '2024-01-13T09:15:00Z'
    },
    {
      id: '4',
      nom: 'Histoire islamique',
      icone: 'globe',
      ordre_affichage: 4,
      date_creation: '2024-01-12T16:45:00Z',
      date_mise_a_jour: '2024-01-12T16:45:00Z'
    },
    {
      id: '5',
      nom: 'Spiritualité et Soufisme',
      icone: 'heart',
      ordre_affichage: 5,
      date_creation: '2024-01-11T11:30:00Z',
      date_mise_a_jour: '2024-01-11T11:30:00Z'
    }
  ];

  useEffect(() => {
    // Charger les catégories (simulé)
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Ici vous feriez un appel API
      const response = await fetchStats();
      setCategories(response?.data);
      
      // Pour la démo, on utilise les données mockées
    //   const sortedCategories = mockCategories.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
    //   setCategories(sortedCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleAddCategory = () => {
    // Navigation vers la page d'ajout
    navigation.navigate('AddCategories');
    console.log('Navigation vers AddCategories');
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setShowOptionsModal(true);
  };

  const handleEditCategory = () => {
    setShowOptionsModal(false);
    // Navigation vers la page d'édition
    // Navigation depuis la liste
    navigation.navigate('EditCategory', { categoryId: selectedCategory.id });
    console.log('Éditer la catégorie:', selectedCategory.nom);
  };

  const handleDeleteCategory = () => {
    setShowOptionsModal(false);
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer la catégorie "${selectedCategory?.nom}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteCategoryVal(selectedCategory.id)
        }
      ]
    );
  };

  const deleteCategoryVal = (categoryId: any) => {
    deleteCategory({id: categoryId})
    // navigation.push('CurrentScreenName');
    navigation.reset({
      index: 0,
      routes: [{ name: 'ListCategories' }],
    });
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.background,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.border
      }}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      {/* Icône de la catégorie */}
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: colors.primary + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 15
        }}
      >
        <Ionicons name={item.icone} size={24} color={colors.primary} />
      </View>

      {/* Contenu principal */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4
          }}
          numberOfLines={2}
        >
          {item.nom}
        </Text>
        {/* <Text
          style={{
            fontSize: 12,
            color: colors.placeholder,
            marginBottom: 2
          }}
        >
          Ordre: {item.ordre_affichage}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.placeholder
          }}
        >
          Créé le {formatDate(item.date_creation)}
        </Text> */}
      </View>

      {/* Indicateur d'action */}
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Ionicons name="ellipsis-vertical" size={16} color={colors.text} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60
      }}
    >
      <Ionicons name="folder-open-outline" size={80} color={colors.placeholder} />
      <Text
        style={{
          fontSize: 18,
          color: colors.placeholder,
          marginTop: 16,
          textAlign: 'center'
        }}
      >
        Aucune catégorie
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.placeholder,
          marginTop: 8,
          textAlign: 'center',
          paddingHorizontal: 40
        }}
      >
        Commencez par créer votre première catégorie de cours
      </Text>
    </View>
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
          <Text style={globalStyles.headerTitle}>Catégories</Text>
          <TouchableOpacity onPress={handleAddCategory}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Liste des catégories */}
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 10,
            flexGrow: 1
          }}
          ListEmptyComponent={renderEmptyState}
          refreshing={false}
          onRefresh={loadCategories}
        />

        {/* Bouton flottant d'ajout */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 30,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8
          }}
          onPress={handleAddCategory}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.background} />
        </TouchableOpacity>

        {/* Modal d'options */}
        <Modal visible={showOptionsModal} transparent animationType="fade">
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#00000077',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            activeOpacity={1}
            onPress={() => setShowOptionsModal(false)}
          >
            <View
              style={{
                backgroundColor: colors.background,
                borderRadius: 15,
                padding: 20,
                marginHorizontal: 40,
                minWidth: 250
              }}
            >
              {selectedCategory && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <View
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: colors.primary + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10
                      }}
                    >
                      <Ionicons name={selectedCategory.icone} size={30} color={colors.primary} />
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: colors.text,
                        textAlign: 'center'
                      }}
                    >
                      {selectedCategory.nom}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: colors.border + '50'
                    }}
                    onPress={handleEditCategory}
                  >
                    <Ionicons name="create-outline" size={20} color={colors.text} />
                    <Text style={{ marginLeft: 12, fontSize: 16, color: colors.text }}>
                      Modifier
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: '#ff4444' + '20',
                      marginTop: 10
                    }}
                    onPress={handleDeleteCategory}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    <Text style={{ marginLeft: 12, fontSize: 16, color: '#ff4444' }}>
                      Supprimer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      paddingVertical: 12,
                      marginTop: 15
                    }}
                    onPress={() => setShowOptionsModal(false)}
                  >
                    <Text style={{ fontSize: 16, color: colors.placeholder }}>
                      Annuler
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default CategoriesListScreen;