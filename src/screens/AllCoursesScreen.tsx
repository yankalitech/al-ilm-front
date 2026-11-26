// Liste de cours : tous les cours publiés (« Voir tous les cours » de l'accueil, route AllCourses)
// ou ceux d'un livre (route CoursesByLivre, params livreId + livreTitre : pas de bouton filtre).
// Recherche (titre, description) + bouton filtre : catégorie, puis livre (limité à la catégorie choisie).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Cours, getCoursList } from '../api/coursesApi';
import { getCoursesByLivre } from '../api/livresApi';
import { spacing } from '../styles/globalStyles';
import { ThemeColors, useTheme, useThemedStyles } from '../theme/ThemeContext';
import ScreenBackground from '../components/ScreenBackground';
import BottomNav from '../components/BottomNav';

type Option = { id: string; nom: string };

// Insensible à la casse et aux accents (« tafsir » trouve « TAFÂSIR »)
const normalize = (text?: string | null) =>
  (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return h > 0 ? `${h} h ${m.toString().padStart(2, '0')}` : `${m} min`;
};

const Chips = ({ options, selected, onSelect, allLabel }: {
  options: Option[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  allLabel: string;
}) => {
  const styles = useThemedStyles(createStyles);
  return (
  <View style={styles.chipsWrap}>
    {[{ id: '', nom: allLabel }, ...options].map((option) => {
      const active = (selected || '') === option.id;
      return (
        <TouchableOpacity
          key={option.id || 'all'}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => onSelect(option.id || null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
            {option.nom}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
  );
};

// Panneau des filtres : les choix ne s'appliquent qu'au bouton « Appliquer »
const FilterSheet = ({ visible, courses, categorieId, livreId, onApply, onClose }: {
  visible: boolean;
  courses: Cours[];
  categorieId: string | null;
  livreId: string | null;
  onApply: (categorieId: string | null, livreId: string | null) => void;
  onClose: () => void;
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [draftCategorie, setDraftCategorie] = useState(categorieId);
  const [draftLivre, setDraftLivre] = useState(livreId);

  useEffect(() => {
    if (visible) {
      setDraftCategorie(categorieId);
      setDraftLivre(livreId);
    }
  }, [visible, categorieId, livreId]);

  const categories = useMemo(() => categoryOptions(courses), [courses]);
  const livres = useMemo(() => livreOptions(courses, draftCategorie), [courses, draftCategorie]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filtres</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.sheetBody} contentContainerStyle={{ paddingBottom: spacing.md }}>
          <Text style={styles.sheetLabel}>Catégorie</Text>
          <Chips
            options={categories}
            selected={draftCategorie}
            onSelect={(id) => {
              setDraftCategorie(id);
              setDraftLivre(null); // le livre choisi peut ne pas appartenir à la nouvelle catégorie
            }}
            allLabel="Toutes"
          />
          <Text style={styles.sheetLabel}>Livre</Text>
          {livres.length > 0 ? (
            <Chips options={livres} selected={draftLivre} onSelect={setDraftLivre} allLabel="Tous" />
          ) : (
            <Text style={styles.sheetEmpty}>Aucun livre dans cette catégorie</Text>
          )}
        </ScrollView>

        <View style={styles.sheetActions}>
          <TouchableOpacity
            style={[styles.sheetButton, styles.sheetButtonSecondary]}
            onPress={() => {
              setDraftCategorie(null);
              setDraftLivre(null);
            }}
          >
            <Text style={styles.sheetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sheetButton, styles.sheetButtonPrimary]}
            onPress={() => onApply(draftCategorie, draftLivre)}
          >
            <Text style={[styles.sheetButtonText, { color: '#fff' }]}>Appliquer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Catégories et livres proposés : seulement ceux qui ont au moins un cours
const categoryOptions = (courses: Cours[]): Option[] => {
  const map = new Map<string, Option>();
  courses.forEach((c) => {
    const nom = c.livre?.categorie?.nom;
    if (c.livre?.categorieId && nom) map.set(c.livre.categorieId, { id: c.livre.categorieId, nom });
  });
  return [...map.values()].sort((a, b) => a.nom.localeCompare(b.nom));
};

const livreOptions = (courses: Cours[], categorieId: string | null): Option[] => {
  const map = new Map<string, Option>();
  courses.forEach((c) => {
    if (!c.livre || (categorieId && c.livre.categorieId !== categorieId)) return;
    map.set(c.livre.id, { id: c.livre.id, nom: c.livre.titre.trim() });
  });
  return [...map.values()].sort((a, b) => a.nom.localeCompare(b.nom));
};

const AllCoursesScreen = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<any>();
  const { livreId: bookId, livreTitre } = (useRoute().params || {}) as { livreId?: string; livreTitre?: string };
  const [courses, setCourses] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [categorieId, setCategorieId] = useState<string | null>(null);
  const [livreId, setLivreId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = bookId ? await getCoursesByLivre(bookId, '') : await getCoursList();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Libellés des filtres actifs (rappel sous la recherche)
  const activeLabels = useMemo(() => {
    const labels: string[] = [];
    const cat = categoryOptions(courses).find((o) => o.id === categorieId);
    const livre = livreOptions(courses, null).find((o) => o.id === livreId);
    if (cat) labels.push(cat.nom);
    if (livre) labels.push(livre.nom);
    return labels;
  }, [courses, categorieId, livreId]);

  const clearFilters = () => {
    setCategorieId(null);
    setLivreId(null);
  };

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return courses.filter((c) => {
      if (categorieId && c.livre?.categorieId !== categorieId) return false;
      if (livreId && c.livreId !== livreId) return false;
      return !q || normalize(c.titre).includes(q) || normalize(c.description).includes(q);
    });
  }, [courses, query, categorieId, livreId]);

  const renderItem = ({ item }: { item: Cours }) => {
    const isAudio = item.type === 'AUDIO';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CourseDetail', { id: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          {item.miniatureAccessUrl ? (
            <Image source={{ uri: item.miniatureAccessUrl }} style={styles.thumbnail} resizeMode="cover" />
          ) : (
            <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
              <Ionicons name={isAudio ? 'musical-notes' : 'videocam'} size={24} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.typeBadge}>
            <Ionicons name={isAudio ? 'musical-notes' : 'videocam'} size={10} color="#fff" />
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.titre}</Text>
          {!bookId && !!item.livre?.titre && (
            <Text style={styles.cardBook} numberOfLines={1}>{item.livre.titre.trim()}</Text>
          )}
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description || 'Aucune description disponible'}
          </Text>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.metaText}>{formatDuration(item.duree)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenBackground edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>{bookId ? (livreTitre || '').trim() : 'Tous les cours'}</Text>
      </View>

      <View style={styles.searchRow}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.placeholder} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un cours..."
          placeholderTextColor={colors.placeholder}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.placeholder} />
          </TouchableOpacity>
        )}
      </View>
        {!bookId && (
        <TouchableOpacity
          style={[styles.filterButton, activeLabels.length > 0 && styles.filterButtonActive]}
          onPress={() => setFiltersOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={22} color={activeLabels.length > 0 ? '#fff' : colors.text} />
          {activeLabels.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeLabels.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        )}
      </View>

      {activeLabels.length > 0 && (
        <View style={styles.activeFilters}>
          <Ionicons name="funnel-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.activeFiltersText} numberOfLines={1}>{activeLabels.join(' · ')}</Text>
          <TouchableOpacity onPress={clearFilters} hitSlop={8}>
            <Text style={styles.clearText}>Effacer</Text>
          </TouchableOpacity>
        </View>
      )}

      <FilterSheet
        visible={filtersOpen}
        courses={courses}
        categorieId={categorieId}
        livreId={livreId}
        onClose={() => setFiltersOpen(false)}
        onApply={(cat, livre) => {
          setCategorieId(cat);
          setLivreId(livre);
          setFiltersOpen(false);
        }}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <Text style={styles.countText}>
              {filtered.length} cours{filtered.length !== courses.length ? ` sur ${courses.length}` : ''}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="search-outline" size={64} color={colors.border} />
              <Text style={styles.emptyText}>Aucun cours ne correspond à ces critères</Text>
            </View>
          }
        />
      )}
      <BottomNav />
    </ScreenBackground>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: { padding: spacing.xs, marginRight: spacing.md },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.text },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, marginLeft: spacing.sm, color: colors.text, fontSize: 16, paddingVertical: 0 },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  activeFiltersText: { flex: 1, fontSize: 13, color: colors.textSecondary },
  clearText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: '75%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  sheetBody: { flexGrow: 0 },
  sheetLabel: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: spacing.sm, marginBottom: spacing.sm },
  sheetEmpty: { fontSize: 13, color: colors.textSecondary },
  sheetActions: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md },
  sheetButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  sheetButtonSecondary: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sheetButtonPrimary: { backgroundColor: colors.primary },
  sheetButtonText: { fontSize: 15, fontWeight: '600', color: colors.text },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    maxWidth: 220,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  listContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  countText: { fontSize: 13, color: colors.textSecondary, marginVertical: spacing.sm },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  emptyText: { marginTop: spacing.md, color: colors.textSecondary, fontSize: 16, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    height: 110,
  },
  thumbnailContainer: { width: 100, height: '100%' },
  thumbnail: { width: '100%', height: '100%' },
  placeholderThumbnail: { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  typeBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    borderRadius: 4,
  },
  cardContent: { flex: 1, padding: spacing.sm, justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardBook: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  cardDescription: { fontSize: 13, color: colors.textSecondary },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary },
});

export default AllCoursesScreen;
