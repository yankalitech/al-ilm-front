// Paramètres : apparence (clair / sombre / comme le téléphone) et couleur d'accent.
// Le fond des écrans (motif géométrique) prend automatiquement ces couleurs.
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import ScreenBackground, { BackgroundPattern } from '../components/ScreenBackground';
import BottomNav from '../components/BottomNav';
import { ACCENTS, ThemeColors, ThemeMode, useTheme, useThemedStyles } from '../theme/ThemeContext';
import { spacing } from '../styles/globalStyles';

const MODES: { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'system', label: 'Automatique', icon: 'phone-portrait-outline' },
  { id: 'light', label: 'Clair', icon: 'sunny-outline' },
  { id: 'dark', label: 'Sombre', icon: 'moon-outline' },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { colors, mode, setMode, accent, setAccent } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Apparence</Text>
        <View style={styles.card}>
          <View style={styles.modeRow}>
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.modeOption, active && styles.modeOptionActive]}
                  onPress={() => setMode(m.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={m.icon as any} size={24} color={active ? colors.onPrimary : colors.text} />
                  <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.hint}>
            « Automatique » suit le réglage clair ou sombre de votre téléphone.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Couleur</Text>
        <View style={styles.card}>
          <View style={styles.accentRow}>
            {ACCENTS.map((a) => {
              const active = accent === a.id;
              return (
                <TouchableOpacity key={a.id} style={styles.accentOption} onPress={() => setAccent(a.id)} activeOpacity={0.7}>
                  <View style={[styles.swatch, { backgroundColor: a.color }, active && { borderColor: colors.text }]}>
                    {active && <Ionicons name="checkmark" size={20} color="#fff" />}
                  </View>
                  <Text style={[styles.accentLabel, active && { color: colors.text, fontWeight: '600' }]}>{a.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Aperçu du fond avec les couleurs choisies */}
          <View style={styles.preview}>
            <BackgroundPattern />
            <View style={styles.previewCard}>
              <View style={styles.previewDot} />
              <View style={{ flex: 1 }}>
                <View style={[styles.previewLine, { width: '70%' }]} />
                <View style={[styles.previewLine, { width: '45%', opacity: 0.5 }]} />
              </View>
            </View>
            <Text style={styles.previewCaption}>Aperçu du fond d'écran</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>À propos</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Application</Text>
            <Text style={styles.aboutValue}>Al-Ilm</Text>
          </View>
          <View style={[styles.aboutRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
      <BottomNav />
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    backButton: { padding: spacing.xs, marginRight: spacing.md },
    headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
    content: { padding: spacing.lg, paddingBottom: spacing.xl },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeRow: { flexDirection: 'row', gap: spacing.sm },
    modeOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    modeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    modeLabel: { fontSize: 13, color: colors.text, fontWeight: '500' },
    modeLabelActive: { color: colors.onPrimary, fontWeight: '700' },
    hint: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm },
    accentRow: { flexDirection: 'row', justifyContent: 'space-between' },
    accentOption: { alignItems: 'center', gap: 6 },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: 'transparent',
    },
    accentLabel: { fontSize: 12, color: colors.textSecondary },
    preview: {
      marginTop: spacing.md,
      height: 150,
      borderRadius: 12,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '75%',
      padding: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.surface,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewDot: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.primary },
    previewLine: { height: 8, borderRadius: 4, backgroundColor: colors.text, marginVertical: 3, opacity: 0.8 },
    previewCaption: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.sm },
    aboutRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    aboutLabel: { fontSize: 15, color: colors.textSecondary },
    aboutValue: { fontSize: 15, color: colors.text, fontWeight: '500' },
  });

export default SettingsScreen;
