// Profil de l'utilisateur : identité (photo, nom, e-mail modifiables), activité réelle, raccourcis et aide.
// L'appli se connecte automatiquement avec l'identifiant du téléphone : pas de déconnexion ici.
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenBackground from '../components/ScreenBackground';
import BottomNav from '../components/BottomNav';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteAccount, deleteAvatar, getLocalProfile, getProfile, Profile, updateProfile, uploadAvatar } from '../api/profileApi';
import { clearAllLocalFiles } from '../utils/offlineUtils';
import { API_BASE_URL } from '../api/config';
import { ThemeColors, useTheme, useThemedStyles } from '../theme/ThemeContext';
import { spacing } from '../styles/globalStyles';

const CONTACT_EMAIL = 'yankalitech@gmail.com';
const NOM_MIN = 2;
const NOM_MAX = 50;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const getInitials = (name?: string) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

const memberSince = (date?: string) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '';

// Temps d'écoute : « 3 h 05 », « 42 min », « 0 min »
const formatListening = (seconds: number) => {
  const total = Math.floor(seconds / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} h ${m.toString().padStart(2, '0')}` : `${m} min`;
};

const ProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  // Seules les données du serveur sont affichées dans « Mon activité » (aucune valeur inventée)
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localIdentity, setLocalIdentity] = useState<{ nom?: string; email?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [photoMenu, setPhotoMenu] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      setProfile(await getProfile());
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Affiche tout de suite le profil enregistré, puis le met à jour depuis le serveur
    getLocalProfile().then(setLocalIdentity);
  }, []);

  // Recharge en revenant sur l'écran (ex. après un téléchargement)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const nom = profile?.nom ?? localIdentity?.nom;
  const email = profile ? profile.email : localIdentity?.email;

  const openEdit = () => {
    setDraftName(nom || '');
    setDraftEmail(email || '');
    setSaveError(null);
    setEditing(true);
  };

  const trimmed = draftName.trim().replace(/\s+/g, ' ');
  const nameValid = trimmed.length >= NOM_MIN && trimmed.length <= NOM_MAX;
  const emailTrimmed = draftEmail.trim().toLowerCase();
  const emailValid = !emailTrimmed || EMAIL_REGEX.test(emailTrimmed);
  const formValid = nameValid && emailValid;

  const saveName = async () => {
    if (!formValid || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      setProfile(await updateProfile({ nom: trimmed, email: emailTrimmed }));
      setEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Le nom n'a pas pu être enregistré");
    } finally {
      setSaving(false);
    }
  };

  const choosePhoto = async () => {
    setPhotoMenu(false);
    setPhotoError(null);
    try {
      const [file] = await pick({ type: [types.images], allowMultiSelection: false });
      if (!file?.uri) return;
      setPhotoBusy(true);
      setProfile(await uploadAvatar({ uri: file.uri, name: file.name, type: file.type }));
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return;
      setPhotoError(error instanceof Error ? error.message : "La photo n'a pas pu être envoyée");
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoMenu(false);
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      setProfile(await deleteAvatar());
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : "La photo n'a pas pu être supprimée");
    } finally {
      setPhotoBusy(false);
    }
  };

  // Suppression définitive : serveur (compte, photo, historique, téléchargements) puis téléphone
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      await clearAllLocalFiles();
      await AsyncStorage.clear();
      setConfirmDelete(false);
      navigation.reset({ index: 0, routes: [{ name: 'AccountDeleted' }] });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'La suppression a échoué, réessayez.');
    } finally {
      setDeleting(false);
    }
  };

  // Chiffres réels calculés par le serveur ; « – » tant qu'ils ne sont pas chargés
  const st = profile?.stats;
  const stats = [
    { icon: 'headset-outline', value: st ? String(st.coursEcoutes) : '–', label: 'Cours écoutés' },
    { icon: 'checkmark-done-outline', value: st ? String(st.coursTermines) : '–', label: 'Cours terminés' },
    { icon: 'download-outline', value: st ? String(st.coursTelecharges) : '–', label: 'Téléchargés' },
    { icon: 'time-outline', value: st ? formatListening(st.tempsEcouteSec) : '–', label: "Temps d'écoute" },
  ];

  const shortcuts = [
    { icon: 'headset-outline', title: 'Mes écoutes', subtitle: 'Reprendre là où vous vous êtes arrêté', onPress: () => navigation.navigate('ContinueListening') },
    { icon: 'download-outline', title: 'Mes téléchargements', subtitle: 'Cours disponibles hors connexion', onPress: () => navigation.navigate('Downloads') },
    { icon: 'color-palette-outline', title: 'Paramètres', subtitle: 'Thème clair ou sombre, couleur', onPress: () => navigation.navigate('Settings') },
  ];

  const help = [
    { icon: 'mail-outline', title: 'Nous contacter', subtitle: CONTACT_EMAIL, onPress: () => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Al-Ilm`) },
    { icon: 'shield-checkmark-outline', title: 'Politique de confidentialité', subtitle: 'Vos données et vos droits', onPress: () => Linking.openURL(`${API_BASE_URL}confidentialite`) },
  ];

  const renderRow = (item: { icon: string; title: string; subtitle: string; onPress: () => void }, last: boolean) => (
    <TouchableOpacity key={item.title} style={[styles.row, last && styles.rowLast]} onPress={item.onPress} activeOpacity={0.7}>
      <View style={styles.rowIcon}>
        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
    </TouchableOpacity>
  );

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={10}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {loading && !profile && !localIdentity ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        >
          {/* Identité */}
          <View style={styles.identityCard}>
            <TouchableOpacity onPress={() => setPhotoMenu(true)} activeOpacity={0.8} disabled={photoBusy || !profile}>
              {profile?.avatarAccessUrl ? (
                <Image source={{ uri: profile.avatarAccessUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(nom)}</Text>
                </View>
              )}
              {photoBusy && (
                <View style={[styles.avatar, styles.avatarBusy]}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color={colors.onPrimary} />
              </View>
            </TouchableOpacity>
            <Text style={styles.name}>{nom || 'Utilisateur'}</Text>
            {email ? (
              <Text style={styles.email}>{email}</Text>
            ) : (
              <TouchableOpacity onPress={openEdit} disabled={!profile}>
                <Text style={styles.addEmail}>+ Ajouter une adresse e-mail</Text>
              </TouchableOpacity>
            )}
            {!!profile?.createdAt && <Text style={styles.since}>Membre depuis {memberSince(profile.createdAt)}</Text>}
            {!!photoError && <Text style={styles.photoError}>{photoError}</Text>}
            <TouchableOpacity style={[styles.editButton, !profile && { opacity: 0.5 }]} onPress={openEdit} activeOpacity={0.7} disabled={!profile}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={styles.editButtonText}>Modifier mon profil</Text>
            </TouchableOpacity>
          </View>

          {!!loadError && (
            <View style={styles.errorBanner}>
              <Ionicons name="cloud-offline-outline" size={18} color={colors.error} />
              <Text style={styles.errorBannerText}>Profil non actualisé : {loadError}</Text>
            </View>
          )}

          {/* Activité */}
          <Text style={styles.sectionTitle}>Mon activité</Text>
          <View style={styles.statsGrid}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <Ionicons name={s.icon as any} size={22} color={colors.primary} />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Raccourcis</Text>
          <View style={styles.card}>{shortcuts.map((item, i) => renderRow(item, i === shortcuts.length - 1))}</View>

          <Text style={styles.sectionTitle}>Aide</Text>
          <View style={styles.card}>{help.map((item, i) => renderRow(item, i === help.length - 1))}</View>

          <Text style={styles.sectionTitle}>Mes données</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.row, styles.rowLast]}
              onPress={() => {
                setDeleteError(null);
                setConfirmDelete(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: `${colors.error}22` }]}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.error }]}>Supprimer mon compte</Text>
                <Text style={styles.rowSubtitle} numberOfLines={2}>Efface définitivement votre compte et toutes vos données</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>ilm Mohamadou ladan · version 1.0.0</Text>
        </ScrollView>
      )}

      {/* Modification du nom */}
      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => !saving && setEditing(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Modifier mon profil</Text>
            <Text style={styles.fieldLabel}>Nom</Text>
            <TextInput
              style={[styles.input, !!draftName && !nameValid && { borderColor: colors.error }]}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Votre nom"
              placeholderTextColor={colors.placeholder}
              maxLength={NOM_MAX + 10}
              returnKeyType="next"
            />
            <Text style={[styles.counter, !!draftName && !nameValid && { color: colors.error }]}>
              {!!draftName && !nameValid ? `Entre ${NOM_MIN} et ${NOM_MAX} caractères` : `${trimmed.length}/${NOM_MAX}`}
            </Text>
            <Text style={styles.fieldLabel}>Adresse e-mail (facultative)</Text>
            <TextInput
              style={[styles.input, !emailValid && { borderColor: colors.error }]}
              value={draftEmail}
              onChangeText={setDraftEmail}
              placeholder="exemple@mail.com"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            {!emailValid && <Text style={[styles.counter, { color: colors.error, textAlign: 'left' }]}>Adresse e-mail non valide</Text>}
            {!!saveError && <Text style={styles.saveError}>{saveError}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setEditing(false)} disabled={saving}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSave, (!formValid || saving) && { opacity: 0.5 }]}
                onPress={saveName}
                disabled={!formValid || saving}
              >
                {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.modalSaveText}>Enregistrer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Confirmation de suppression du compte */}
      <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => !deleting && setConfirmDelete(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.dangerIcon}>
              <Ionicons name="warning-outline" size={30} color={colors.error} />
            </View>
            <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Supprimer votre compte ?</Text>
            <Text style={styles.deleteText}>Seront supprimés définitivement, sur le serveur et sur ce téléphone :</Text>
            {['Votre profil (nom, e-mail, photo)', "Votre historique et votre progression d'écoute", 'Vos cours téléchargés', 'Vos préférences'].map((line) => (
              <View key={line} style={styles.deleteLine}>
                <Ionicons name="close-circle" size={16} color={colors.error} />
                <Text style={styles.deleteLineText}>{line}</Text>
              </View>
            ))}
            <Text style={styles.deleteWarning}>Cette action est irréversible.</Text>
            {!!deleteError && <Text style={styles.saveError}>{deleteError}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={() => setConfirmDelete(false)} disabled={deleting}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }, deleting && { opacity: 0.6 }]}
                onPress={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? <ActivityIndicator color="#fff" /> : <Text style={[styles.modalSaveText, { color: '#fff' }]}>Supprimer</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo de profil */}
      <Modal visible={photoMenu} transparent animationType="slide" onRequestClose={() => setPhotoMenu(false)}>
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setPhotoMenu(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Photo de profil</Text>
            <TouchableOpacity style={styles.sheetRow} onPress={choosePhoto}>
              <Ionicons name="images-outline" size={22} color={colors.primary} />
              <Text style={styles.sheetRowText}>{profile?.avatarAccessUrl ? 'Changer la photo' : 'Choisir une photo'}</Text>
            </TouchableOpacity>
            {!!profile?.avatarAccessUrl && (
              <TouchableOpacity style={styles.sheetRow} onPress={removePhoto}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={[styles.sheetRowText, { color: colors.error }]}>Supprimer la photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.sheetRow, { justifyContent: 'center', borderBottomWidth: 0 }]} onPress={() => setPhotoMenu(false)}>
              <Text style={[styles.sheetRowText, { color: colors.textSecondary }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNav />
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.sm,
    },
    headerTitle: { fontSize: 28, fontWeight: '700', color: colors.text },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    identityCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: spacing.lg,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    avatarText: { fontSize: 30, fontWeight: '700', color: colors.onPrimary },
    avatarBusy: { position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
    cameraBadge: {
      position: 'absolute',
      right: -2,
      bottom: spacing.md - 2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    email: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    addEmail: { fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: 6 },
    dangerIcon: {
      alignSelf: 'center',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: `${colors.error}1F`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    deleteText: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.sm },
    deleteLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 3 },
    deleteLineText: { flex: 1, fontSize: 14, color: colors.text },
    deleteWarning: { fontSize: 14, fontWeight: '700', color: colors.error, marginTop: spacing.md },
    photoError: { fontSize: 13, color: colors.error, marginTop: spacing.sm, textAlign: 'center' },
    fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: spacing.md, marginBottom: 6 },
    sheetOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    sheetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sheetRowText: { fontSize: 16, color: colors.text, fontWeight: '500' },
    name: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
    since: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    editButtonText: { fontSize: 14, fontWeight: '600', color: colors.primary },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
      padding: spacing.sm,
      borderRadius: 10,
      backgroundColor: colors.surfaceAlt,
    },
    errorBannerText: { flex: 1, fontSize: 13, color: colors.textSecondary },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    statCard: {
      flexBasis: '48%',
      flexGrow: 1,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 6 },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    rowLast: { borderBottomWidth: 0 },
    rowIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surfaceAlt,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rowTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
    rowSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    version: { textAlign: 'center', fontSize: 12, color: colors.placeholder, marginTop: spacing.lg },
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.lg },
    modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg },
    modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    modalHint: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    counter: { fontSize: 12, color: colors.textSecondary, marginTop: 6, textAlign: 'right' },
    saveError: { fontSize: 13, color: colors.error, marginTop: spacing.sm },
    modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
    modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalCancel: { borderWidth: 1, borderColor: colors.border },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: colors.text },
    modalSave: { backgroundColor: colors.primary },
    modalSaveText: { fontSize: 15, fontWeight: '600', color: colors.onPrimary },
  });

export default ProfileScreen;
