// Affiché après la suppression du compte : plus aucune donnée sur le serveur ni sur le téléphone.
// À la prochaine ouverture, l'appli recrée automatiquement un compte vide.
import React, { useEffect } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import ScreenBackground from '../components/ScreenBackground';
import { ThemeColors, useTheme, useThemedStyles } from '../theme/ThemeContext';
import { spacing } from '../styles/globalStyles';

const AccountDeletedScreen = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  // Le bouton retour ferme l'appli (les écrans précédents n'ont plus de compte)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <ScreenBackground edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.icon}>
          <Ionicons name="checkmark" size={48} color={colors.onPrimary} />
        </View>
        <Text style={styles.title}>Compte supprimé</Text>
        <Text style={styles.text}>
          Votre compte et toutes vos données (profil, photo, historique d'écoute, téléchargements) ont été supprimés
          définitivement, sur le serveur comme sur ce téléphone.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => BackHandler.exitApp()} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Fermer l'application</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Si vous rouvrez l'application, un nouveau compte vide sera créé.</Text>
      </View>
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    icon: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
    text: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 23 },
    button: {
      marginTop: spacing.xl,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: spacing.xl,
      borderRadius: 12,
    },
    buttonText: { fontSize: 16, fontWeight: '600', color: colors.onPrimary },
    hint: { fontSize: 13, color: colors.placeholder, marginTop: spacing.md, textAlign: 'center' },
  });

export default AccountDeletedScreen;
