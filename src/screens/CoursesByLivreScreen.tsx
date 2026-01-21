import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const CoursesByLivreScreen = ({ route }) => {
  const { livreId, livreTitre } = route.params;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.headerTitle}>Cours du livre: {livreTitre}</Text>
        <Text>Livre ID: {livreId}</Text>
        <Text>Cette page listera les cours pour le livre sélectionné.</Text>
      </View>
    </SafeAreaView>
  );
};

export default CoursesByLivreScreen;
