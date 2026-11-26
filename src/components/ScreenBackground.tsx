// Fond des écrans : couleur du thème + motif géométrique (étoiles à 8 branches) teinté
// avec la couleur d'accent choisie dans les paramètres.
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const PATTERN = require('../assets/pattern.png');

export const BackgroundPattern = () => {
  const { colors } = useTheme();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <Image
        source={PATTERN}
        resizeMode="repeat"
        style={[StyleSheet.absoluteFill, { width: undefined, height: undefined, tintColor: colors.pattern, opacity: colors.patternOpacity }]}
      />
    </View>
  );
};

// Remplace <SafeAreaView> à la racine d'un écran
const ScreenBackground = ({ children, edges = ['top', 'left', 'right'] }: { children: React.ReactNode; edges?: Edge[] }) => (
  <SafeAreaView style={styles.root} edges={edges}>
    <BackgroundPattern />
    {children}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default ScreenBackground;
