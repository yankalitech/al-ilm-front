import { create } from 'zustand'
import { 
  getCoursList, 
  addCours, 
  getCoursElement, 
  updateCours, 
  deleteCoursElement,
  getCoursByCategory,
  searchCours,
  CoursData,
  CoursUpdateData
} from '../api/coursesApi'

// Interface pour un cours
interface Cours {
  id: string
  titre: string
  description?: string
  type: 'AUDIO' | 'VIDEO'
  duree: number
  etat: 'NOUVEAU' | 'EN_COURS' | 'PUBLIE'
  fichierAccessUrl: string
  fichierUrl: string
  miniatureUrl?: string
  miniatureAccessUrl?: string
  categorieId: string
  createdAt: string
  updatedAt: string
}

interface CoursState {
  // State
  cours?: Cours[]
  coursActuel?: Cours
  coursLoading: boolean
  coursError?: string
  
  // Actions
  fetchCours: () => Promise<void>
  createCours: (coursData: CoursData) => Promise<Cours>
  viewCours: (coursId: string) => Promise<Cours>
  updateCoursData: (coursData: CoursUpdateData) => Promise<Cours>
  deleteCours: (coursId: string) => Promise<void>
  fetchCoursByCategory: (categorieId: string) => Promise<void>
  searchCoursData: (query: string) => Promise<void>
  clearCoursActuel: () => void
  clearError: () => void
}

export const useCoursStore = create<CoursState>((set, get) => ({
  // State initial
  cours: [],
  coursActuel: undefined,
  coursLoading: false,
  coursError: undefined,

  // Récupérer tous les cours
  fetchCours: async () => {
    set({ coursLoading: true, coursError: undefined })
    try {
      const cours = await getCoursList()
      set({
        cours: cours,
        coursLoading: false
      })
    } catch (error) {
      console.error('Erreur lors du fetch des cours :', error)
      set({ 
        coursError: error instanceof Error ? error.message : 'Erreur inconnue',
        coursLoading: false 
      })
    }
  },

  // Créer un nouveau cours
  createCours: async (coursData: CoursData) => {
    set({ coursLoading: true, coursError: undefined })
    try {
      const nouveauCours = await addCours(coursData)
      
      // Mise à jour immédiate du state
      // const currentCours = get().cours || []
      // set({
      //   cours: [...currentCours, nouveauCours],
      //   coursLoading: false
      // })
      
      return nouveauCours
    } catch (error) {
      console.error('Erreur lors de la création du cours :', error)
      set({ 
        coursError: error instanceof Error ? error.message : 'Erreur lors de la création',
        coursLoading: false 
      })
      throw error
    }
  },

  // Visualiser un cours spécifique
  viewCours: async (coursId: string) => {
    set({ coursLoading: true, coursError: undefined })
    try {
      const cours = await getCoursElement(coursId)
      set({
        coursActuel: cours,
        coursLoading: false
      })
      
      console.log('cours récupéré :', cours)
      return cours
    } catch (error) {
      console.error('Erreur lors de la récupération du cours :', error)
      set({ 
        coursError: error instanceof Error ? error.message : 'Erreur lors de la récupération',
        coursLoading: false 
      })
      throw error
    }
  },

  // Mettre à jour un cours
  updateCoursData: async (coursData: CoursUpdateData) => {
    set({ coursLoading: true, coursError: undefined })
    try {
      const coursModifie = await updateCours(coursData)
      
      // Mise à jour du state
      const currentCours = get().cours || []
      const updatedCours = currentCours.map(cours => 
        cours.id === coursData.coursId ? coursModifie : cours
      )
      
      set({
        cours: updatedCours,
        coursActuel: coursModifie,
        coursLoading: false
      })
      
      return coursModifie
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cours :', error)
      set({ 
        coursError: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
        coursLoading: false 
      })
      throw error
    }
  },

  // Supprimer un cours
  deleteCours: async (coursId: string) => {
    set({ coursLoading: true, coursError: undefined })
    try {
      await deleteCoursElement(coursId)
      
      // Mise à jour du state en retirant le cours supprimé
      const currentCours = get().cours || []
      const filteredCours = currentCours.filter(cours => cours.id !== coursId)
      
      set({
        cours: filteredCours,
        coursActuel: undefined, // Clear if it was the current course
        coursLoading: false
      })
    } catch (error) {
      console.error('Erreur lors de la suppression du cours :', error)
      set({ 
        coursError: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        coursLoading: false 
      })
      throw error
    }
  },

  // Récupérer les cours par catégorie
  fetchCoursByCategory: async (categorieId: string) => {
    set({ coursLoading: true, coursError: undefined })
    try {
      const cours = await getCoursByCategory(categorieId)
      set({
        cours: cours,
        coursLoading: false
      })
    } catch (error) {
      console.error('Erreur lors du fetch des cours par catégorie :', error)
      set({ 
        coursError: error instanceof Error ? error.message : 'Erreur lors de la récupération',
        coursLoading: false 
      })
    }
  },

  // Rechercher des cours
  searchCoursData: async (query: string) => {
    set({ coursLoading: true, coursError: undefined })
    try {
      const cours = await searchCours(query)
      set({
        cours: cours,
        coursLoading: false
      })
    } catch (error) {
      console.error('Erreur lors de la recherche de cours :', error)
      set({ 
        coursError: error instanceof Error ? error.message : 'Erreur lors de la recherche',
        coursLoading: false 
      })
    }
  },

  // Utilitaires
  clearCoursActuel: () => {
    set({ coursActuel: undefined })
  },

  clearError: () => {
    set({ coursError: undefined })
  }
}))