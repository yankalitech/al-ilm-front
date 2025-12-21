import { create } from 'zustand'
import { getCategoriesList, addCategories, getCategoriesElement, updateCategories, deleteCategoriesElement } from '../api/categoriesApi'

interface DashboardState {
  categories?: any[],
  category?: any,
  fetchStats?: () => Promise<void>
  createCategory?: (categorie: any) => Promise<void>
  viewCategory?: (categorie: any) => Promise<void>
   updateCategories?: (categorie: any) => Promise<void>
   deleteCategory?: (categorie: any) => Promise<void>
}

export const useCategoriesStore = create<DashboardState>((set) => ({
  categories: [],
  fetchStats: async () => {
    try {
      const categories = await getCategoriesList(); // Retourne un tableau
      console.log('categoties result ', categories)
      set({
        categories: categories, // Nombre de catégories
      });
    } catch (error) {
      console.error('Erreur lors du fetch des catégories :', error);
    }
  },

  // Création d'une nouvelle catégorie
  createCategory: async (newCategory: { name: string, icone: string }) => {
    try {
      const response = await addCategories(newCategory);

      const createdCategory = response;

      // Mise à jour immédiate du state en ajoutant la nouvelle catégorie
      // set({
      //   categories: [...get().categories, createdCategory],
      // });

      return createdCategory;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie :', error);
      throw error;
    }
  },
  viewCategory: async (categoryId:{id: string}) => {
    try {
      const response = await getCategoriesElement(categoryId?.id); // Retourne un tableau
      const category = response;
      set({
        category: category,
      });
      console.log('value result cat val', category)
      return category
    } catch (error) {
      console.error('Erreur lors du fetch des catégories :', error);
    }
  },
  deleteCategory: async (categoryId:{id: string}) => {
    try {
      const response = await deleteCategoriesElement(categoryId?.id); // Retourne un tableau
      const category = response;
      
      return category
    } catch (error) {
      console.error('Erreur lors du fetch des catégories :', error);
    }
  },
  updateCategory: async (newCategory: { idCategory: string, name: string, icone: string }) => {
    try {
      const response = await updateCategories(newCategory);

      const createdCategory = response;

      // Mise à jour immédiate du state en ajoutant la nouvelle catégorie
      set({
        category:  createdCategory,
        categories: [...get().categories, createdCategory],
      });

      return createdCategory;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie :', error);
      throw error;
    }
  },
}));

