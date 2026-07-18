import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@react-native-vector-icons/ionicons'
import { useNavigation } from '@react-navigation/native'
import { useDownloadsStore } from '../store/useDownloadsStore'
import { isFileDownloaded } from '../utils/offlineUtils'
import { colors, spacing } from '../styles/globalStyles'
import BottomNav from '../components/BottomNav'

const formatDuration = (seconds: number) => {
  if (!seconds) return 'N/A'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m} min ${s} s`
}

export default function MesTelechargements() {
  const navigation = useNavigation()
  const { downloads, isLoading, error, fetchDownloads, removeDownload } = useDownloadsStore()

  useEffect(() => {
    fetchDownloads()
  }, [])

  const handlePress = (item: any) => {
    ;(navigation as any).navigate('CourseDetail', { id: item.cours.id })
  }

  const handleDelete = (id: string, titre: string) => {
    Alert.alert(
      'Supprimer le téléchargement',
      `Supprimer "${titre}" de vos téléchargements ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => removeDownload(id),
        },
      ]
    )
  }

  const renderItem = ({ item }: { item: any }) => {
    const cours = item.cours
    const localAvailable = isFileDownloaded(cours.id)

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
          <View style={styles.badges}>
            <Text style={styles.duration}>{formatDuration(cours.duree)}</Text>
            {localAvailable && (
              <View style={styles.offlineBadge}>
                <Ionicons name="cloud-offline-outline" size={12} color={colors.success} />
                <Text style={styles.offlineText}>Hors-ligne</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id, cours.titre)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Mes Téléchargements</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading && downloads.length === 0 ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <FlatList
          data={downloads}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={downloads.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchDownloads} colors={[colors.primary]} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="download-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucun téléchargement</Text>
              <Text style={styles.emptySubtitle}>
                Téléchargez des cours pour les écouter hors-ligne
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
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  duration: {
    fontSize: 12,
    color: colors.placeholder,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  offlineText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '500',
  },
  deleteBtn: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
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
})
