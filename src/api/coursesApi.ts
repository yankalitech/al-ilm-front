import {API_BASE_URL, getAuthOptions} from "./authApi"

// Interface pour les données de cours
export interface CoursData {
  titre: string
  description?: string
  type: 'audio' | 'video'
  etat: 'nouveau' | 'en_cours' | 'publie'
  categorieId: string
  file: File
  miniature?: File
}

export interface CoursUpdateData {
  coursId: string
  titre?: string
  description?: string
  type?: 'audio' | 'video'
  etat?: 'nouveau' | 'en_cours' | 'publie'
  categorieId?: string
  file?: File
  miniature?: File
}



// Récupérer la liste de tous les cours
export async function getCoursList() {
  try {
    const options = await getAuthOptions()
    console.log('value list course ---', API_BASE_URL)
    const response = await fetch(`${API_BASE_URL}api/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log('data return cours ----', data)
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des cours :', error);
    throw error;
  }
}

// Récupérer un cours spécifique par ID
export async function getCoursElement(id: string) {
  try {
    // const response = await fetch(`${API_BASE_URL}api/courses/${id}`);
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/courses/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log('data return cours ----', data)
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du cours :', error);
    throw error;
  }
}

// Supprimer un cours
export async function deleteCoursElement(id: string) {
  try {
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log('data return cours deleted ----', data)
    return data;
  } catch (error) {
    console.error('Erreur lors de la suppression du cours :', error);
    throw error;
  }
}

// Créer un nouveau cours avec fichier
export async function addCours(coursData: CoursData) {
  try {
    console.log('api create cours ----------')
    const options = await getAuthOptions()
    // Création du FormData pour l'upload de fichiers
    const formData = new FormData()
    formData.append('titre', coursData.titre)
    formData.append('type', coursData.type)
    formData.append('etat', coursData.etat)
    formData.append('categorieId', coursData.categorieId)
    formData.append('file', coursData.file)
    
    if (coursData.description) {
      formData.append('description', coursData.description)
    }
    
    if (coursData.miniature) {
      formData.append('miniature', coursData.miniature)
    }

    const response = await fetch(`${API_BASE_URL}api/courses`, {
      method: 'POST',
      headers: {
        ...options
      },
      body: formData, // Pas de Content-Type header, le navigateur le définit automatiquement
    });

    console.log('response create cours ----', response)
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création du cours');
    }

    const data = response;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création du cours :', error);
    throw error;
  }
}

// Mettre à jour un cours existant
export async function updateCours(coursData: CoursUpdateData) {
  try {
    console.log('api update cours ----------', coursData)
    const options = await getAuthOptions()
    // Création du FormData pour l'upload de fichiers
    const formData = new FormData()
    
    if (coursData.titre) formData.append('titre', coursData.titre)
    if (coursData.description) formData.append('description', coursData.description)
    if (coursData.type) formData.append('type', coursData.type)
    if (coursData.etat) formData.append('etat', coursData.etat)
    if (coursData.categorieId) formData.append('categorieId', coursData.categorieId)
    if (coursData.file) formData.append('file', coursData.file)
    if (coursData.miniature) formData.append('miniature', coursData.miniature)

    const response = await fetch(`${API_BASE_URL}api/courses/${coursData.coursId}`, {
      method: 'PUT',
      headers: {
        ...options
      },
      body: formData,
    });

    console.log('response update cours ----', response)
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la mise à jour du cours');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours :', error);
    throw error;
  }
}

// Récupérer les cours par catégorie
export async function getCoursByCategory(categorieId: string) {
  try {
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/courses?categorieId=${categorieId}`);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log('data return cours by category ----', data)
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des cours par catégorie :', error);
    throw error;
  }
}

// Rechercher des cours
export async function searchCours(query: string) {
  try {
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/courses/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log('data return cours search ----', data)
    return data;
  } catch (error) {
    console.error('Erreur lors de la recherche de cours :', error);
    throw error;
  }
}