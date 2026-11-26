import AsyncStorage from '@react-native-async-storage/async-storage'
import type { VideoQualite } from '../api/coursesApi'

export type QualityLabel = VideoQualite['label']

const PREF_KEY = 'video_quality_pref'

export const QUALITY_ORDER: QualityLabel[] = ['720p', '480p', '360p']

// Débit approximatif de chaque qualité (vidéo + son), pour estimer la taille d'un téléchargement
const MB_PER_MINUTE: Record<QualityLabel, number> = {
  '720p': 15.5,
  '480p': 8.3,
  '360p': 5.3,
}

export const QUALITY_DESCRIPTIONS: Record<QualityLabel, string> = {
  '720p': 'Haute définition',
  '480p': 'Bonne qualité',
  '360p': 'Économie de données / connexion faible',
}

export function estimateSizeMB(label: QualityLabel, durationSec: number): number {
  return Math.max(1, Math.round((MB_PER_MINUTE[label] * durationSec) / 60))
}

export async function getPreferredQuality(): Promise<QualityLabel | null> {
  try {
    const value = await AsyncStorage.getItem(PREF_KEY)
    return value && (QUALITY_ORDER as string[]).includes(value) ? (value as QualityLabel) : null
  } catch {
    return null
  }
}

export async function setPreferredQuality(label: QualityLabel): Promise<void> {
  try {
    await AsyncStorage.setItem(PREF_KEY, label)
  } catch {
    // préférence non mémorisée, sans conséquence
  }
}

// Qualité à utiliser : la préférence de l'utilisateur si elle existe pour ce cours,
// sinon la meilleure qualité inférieure disponible, sinon la meilleure disponible.
export function pickQuality(qualites: VideoQualite[] | undefined, preferred: QualityLabel | null): VideoQualite | null {
  if (!qualites || qualites.length === 0) return null
  if (!preferred) return qualites[0]
  const preferredIndex = QUALITY_ORDER.indexOf(preferred)
  return qualites.find((q) => QUALITY_ORDER.indexOf(q.label) >= preferredIndex) ?? qualites[qualites.length - 1]
}
