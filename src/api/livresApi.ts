// services/courseService.ts
import {API_BASE_URL, getAuthOptions} from "./authApi"
// Remplacez par votre URL de production ou IP locale (ex: http://192.168.1.x:3000)
// Attention : Sur Android Emulator, localhost est 10.0.2.2


// types.ts

export interface Livre {
  id: string;
  titre: string;
  description: string | null;
  categorieId: string;
  couvertureUrl?: string | null;
  couvertureAccessUrl?: string | null;
  categorie?: any;
}

export interface Cours {
  id: string;
  titre: string;
  description: string | null;
  type: 'AUDIO' | 'VIDEO';
  duree: number; // en secondes
  etat: 'NOUVEAU' | 'EN_COURS' | 'PUBLIE';
  datePublication: string;
  miniatureAccessUrl: string | null; // L'URL signée (ou celle du livre en fallback)
  livreId: string;
  livre?: Livre; // L'API inclut les infos du livre
}

// services/livreService.ts

export const getCoursesByLivre = async (livreId: string, token: string): Promise<Cours[]> => {
  try {
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/livres/${livreId}/courses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options
      }
    });

    if (!response.ok) {
      console.error('Erreur récupération cours du livre:', response.status);
      return [];
    }

    const data: Cours[] = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur réseau:', error);
    return [];
  }
};


// Tous les livres publiés (accueil et écran « Tous les livres »), du plus récent au plus ancien
export const getAllLivres = async (): Promise<Livre[]> => {
  try {
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/livres`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options
      }
    });

    if (!response.ok) {
      console.error('Erreur récupération livres:', response.status);
      return [];
    }

    const data: (Livre & { estPublie?: boolean; createdAt?: string })[] = await response.json();
    // L'API renvoie aussi les livres non publiés : on ne garde que ceux visibles par les utilisateurs
    return data
      .filter((livre) => livre.estPublie !== false)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  } catch (error) {
    console.error('Erreur réseau:', error);
    return [];
  }
};

export const getLivresByCategorie = async (categorieId: string): Promise<Livre[]> => {
  try {

    // Le token est optionnel. 
    // S'il est présent et valide (Admin/Instructeur), l'API renverra tous les livres.
    // Sinon, elle ne renverra que les livres publiés.

    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/categories/${categorieId}/livres`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options
      }
    });

    if (!response.ok) {
      console.error('Erreur récupération livres:', response.status);
      return [];
    }

    const data: Livre[] = await response.json();
    console.log('data return livres ----', data)
    return data;
  } catch (error) {
    console.error('Erreur réseau:', error);
    return [];
  }
};
