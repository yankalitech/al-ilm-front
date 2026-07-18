import { create } from 'zustand'
import { getHistory, updateProgress, ProgressionCours } from '../api/progressApi'

interface HistoryState {
  history: ProgressionCours[]
  isLoading: boolean
  error: string | undefined

  fetchHistory: () => Promise<void>
  saveProgress: (courseId: string, position: number, terminee?: boolean) => Promise<void>
  getProgressForCourse: (courseId: string) => ProgressionCours | undefined
  clearError: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  isLoading: false,
  error: undefined,

  fetchHistory: async () => {
    set({ isLoading: true, error: undefined })
    try {
      const history = await getHistory()
      set({ history, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erreur lors de la récupération',
        isLoading: false,
      })
    }
  },

  saveProgress: async (courseId: string, position: number, terminee = false) => {
    try {
      const updated = await updateProgress(courseId, position, terminee)
      // Update local state immediately for responsiveness
      set((state) => {
        const existingIndex = state.history.findIndex((p) => p.coursId === courseId)
        if (existingIndex >= 0) {
          const newHistory = [...state.history]
          newHistory[existingIndex] = { ...newHistory[existingIndex], position, terminee }
          return { history: newHistory }
        }
        return { history: [updated, ...state.history] }
      })
    } catch (error) {
      // Silent fail for progress updates — don't disrupt playback
      console.error('Erreur sauvegarde progression:', error)
    }
  },

  getProgressForCourse: (courseId: string) => {
    return get().history.find((p) => p.coursId === courseId)
  },

  clearError: () => set({ error: undefined }),
}))
