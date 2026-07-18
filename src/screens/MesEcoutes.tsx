import React, { useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@react-native-vector-icons/ionicons'
import { useNavigation } from '@react-navigation/native'
import { useHistoryStore } from '../store/useHistoryStore'
import { colors, spacing } from '../styles/globalStyles'
import BottomNav from '../components/BottomNav'

const formatDuration = (seconds: number) => {
  if (!seconds) return 'N/A'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const formatDate = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MesEcoutes() {
  const navigation = useNavigation()
  const { history, isLoading, error, fetchHistory, clearError } = useHistoryStore()

  useEffect(() => {
    fetchHistory()
  }, [])

  const handlePress = (item: any) => {
    ;(navigation as any).navigate('CourseDetail', { id: item.cours.id, resumePosition: item.position })
  }

  const renderItem = ({ item }: { item: any }) => {
    const cours = item.cours
    if (!cours) return null
    const progress = cours.duree > 0 ? Math.min(item.position / cours.duree, 1) : 0

    return (
      <TouchableOpacity style={styles.item} onPress={() => handlePress(item)} activeOpacity={0.8}>
        {cours.miniatureAccessUrl ? (
          <Image source={{ uri: cours.miniatureAccessUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumb]}>
            <Ionicons
              name={cours.type === 'AUDIO' ? 'musical-notes' : 'videocam'}
              size={28}
              color={colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.titre} numberOfLines={2}>
            {cours.titre}
          </Text>
          {cours.livre && (
            <Text style={styles.meta} numberOfLines={1}>
              {cours.livre.titre}
            </Text>
          )}

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {formatDuration(item.position)} / {formatDuration(cours.duree)}
            </Text>
          </View>

          <Text style={styles.date}>{formatDate(item.derniereEcoute)}</Text>
        </View>

        {item.terminee ? (
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        ) : (
          <Ionicons name="play-circle-outline" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Écoutes</Text>
        <View style={{ width: 24 }} />
      </View>

      {error && history.length === 0 ? (
        <View style={styles.errorState}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Impossible de charger l'historique</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => { clearError(); fetchHistory(); }}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading && history.length === 0 ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={history.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchHistory} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="headset-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucune écoute</Text>
              <Text style={styles.emptySubtitle}>
                Votre historique d'écoute apparaîtra ici
              </Text>
            </View>
          }
        />
      )}
      <BottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  list: {
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  placeholderThumb: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  titre: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: colors.placeholder,
    minWidth: 70,
    textAlign: 'right',
  },
  date: {
    fontSize: 11,
    color: colors.placeholder,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
})
