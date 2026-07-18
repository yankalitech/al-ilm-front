import AsyncStorage from '@react-native-async-storage/async-storage'
import RNFS from 'react-native-fs'

const LOCAL_FILES_KEY = 'downloaded_files'

type LocalFilesMap = Record<string, string> // courseId → absolute file path

// In-memory cache to avoid repeated AsyncStorage reads
let memoryCache: LocalFilesMap | null = null

async function readMap(): Promise<LocalFilesMap> {
  if (memoryCache) return memoryCache
  try {
    const raw = await AsyncStorage.getItem(LOCAL_FILES_KEY)
    memoryCache = raw ? JSON.parse(raw) : {}
    return memoryCache!
  } catch {
    return {}
  }
}

async function writeMap(map: LocalFilesMap): Promise<void> {
  memoryCache = map
  await AsyncStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(map))
}

export async function getLocalFilePath(courseId: string): Promise<string | null> {
  const map = await readMap()
  const path = map[courseId]
  if (!path) return null
  // Verify the file still exists on disk
  try {
    const exists = await RNFS.exists(path)
    return exists ? path : null
  } catch {
    return null
  }
}

export function isFileDownloaded(courseId: string): boolean {
  if (!memoryCache) return false
  return !!memoryCache[courseId]
}

export async function saveLocalFilePath(courseId: string, path: string): Promise<void> {
  const map = await readMap()
  map[courseId] = path
  await writeMap(map)
}

export async function removeLocalFilePath(courseId: string): Promise<void> {
  const map = await readMap()
  const path = map[courseId]
  if (path) {
    try {
      const exists = await RNFS.exists(path)
      if (exists) await RNFS.unlink(path)
    } catch (e) {
      console.warn('Impossible de supprimer le fichier local:', e)
    }
  }
  delete map[courseId]
  await writeMap(map)
}

// Download a file from a remote URL to the local Documents directory.
// Calls onProgress with a value from 0 to 1.
export async function downloadFileToDevice(
  courseId: string,
  remoteUrl: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const localPath = `${RNFS.DocumentDirectoryPath}/al-ilm-${courseId}-${fileName}`

  const result = await RNFS.downloadFile({
    fromUrl: remoteUrl,
    toFile: localPath,
    progress: (res) => {
      if (onProgress && res.contentLength > 0) {
        onProgress(res.bytesWritten / res.contentLength)
      }
    },
    progressDivider: 5,
  }).promise

  if (result.statusCode !== 200) {
    throw new Error(`Échec du téléchargement (statut ${result.statusCode})`)
  }

  await saveLocalFilePath(courseId, localPath)
  return localPath
}
