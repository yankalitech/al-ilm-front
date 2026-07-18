import { create } from 'zustand'
import { getDownloads, deleteDownload, recordDownload, Telechargement } from '../api/downloadsApi'

interface DownloadsState {
  downloads: Telechargement[]
  isLoading: boolean
  error: string | undefined

  fetchDownloads: () => Promise<void>
  addDownload: (courseId: string) => Promise<string | null>
  removeDownload: (id: string) => Promise<void>
  clearError: () => void
}

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloads: [],
  isLoading: false,
  error: undefined,

  fetchDownloads: async () => {
    set({ isLoading: true, error: undefined })
    try {
      const downloads = await getDownloads()
      set({ downloads, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération',
        isLoading: false,
      })
    }
  },

  // Returns the signed URL for the file download, or null on error
  addDownload: async (courseId: string) => {
    try {
      const result = await recordDownload(courseId)
      // Refresh the list after recording
      await get().fetchDownloads()
      return result.fichierAccessUrl
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur lors du téléchargement' })
      return null
    }
  },

  removeDownload: async (id: string) => {
    try {
      await deleteDownload(id)
      set((state) => ({
        downloads: state.downloads.filter((d) => d.id !== id),
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erreur lors de la suppression' })
      throw error
    }
  },

  clearError: () => set({ error: undefined }),
}))
