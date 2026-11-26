// Profil de l'utilisateur connecté (routes sécurisées /api/profile et /api/profile/avatar)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, getAuthOptions } from './authApi';

export interface ProfileStats {
  coursTelecharges: number; // cours dans « Mes téléchargements »
  coursEcoutes: number; // cours dont la lecture a été commencée
  coursTermines: number; // cours écoutés jusqu'au bout
  tempsEcouteSec: number; // temps d'écoute cumulé
}

export interface Profile {
  id: string;
  nom: string;
  email: string | null;
  role: string;
  createdAt: string;
  avatarAccessUrl: string | null;
  stats: ProfileStats;
}

export interface PickedImage {
  uri: string;
  name?: string | null;
  type?: string | null;
}

const USER_KEY = 'auth_user';

async function parse(response: Response): Promise<Profile> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Erreur ${response.status}`);
  await saveLocally(data);
  return data;
}

async function jsonRequest(method: 'GET' | 'PATCH', body?: object): Promise<Profile> {
  const options = await getAuthOptions();
  const response = await fetch(`${API_BASE_URL}api/profile`, {
    method,
    headers: { 'Content-Type': 'application/json', ...options },
    body: body ? JSON.stringify(body) : undefined,
  });
  return parse(response);
}

// Garde l'utilisateur enregistré sur le téléphone à jour (affiché tout de suite à l'ouverture)
async function saveLocally(profile: Profile) {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    const current = raw ? JSON.parse(raw) : {};
    await AsyncStorage.setItem(USER_KEY, JSON.stringify({ ...current, nom: profile.nom, email: profile.email }));
  } catch {}
}

export const getProfile = () => jsonRequest('GET');

// email : '' pour retirer l'adresse
export const updateProfile = (changes: { nom?: string; email?: string }) => jsonRequest('PATCH', changes);

export async function uploadAvatar(image: PickedImage): Promise<Profile> {
  const options = await getAuthOptions();
  const form = new FormData();
  form.append('photo', {
    uri: image.uri,
    name: image.name || 'photo.jpg',
    type: image.type || 'image/jpeg',
  } as any);
  const response = await fetch(`${API_BASE_URL}api/profile/avatar`, {
    method: 'POST',
    headers: { ...options }, // le Content-Type multipart est ajouté automatiquement
    body: form,
  });
  return parse(response);
}

export async function deleteAvatar(): Promise<Profile> {
  const options = await getAuthOptions();
  const response = await fetch(`${API_BASE_URL}api/profile/avatar`, { method: 'DELETE', headers: { ...options } });
  return parse(response);
}

// Nom et e-mail enregistrés sur le téléphone, affichés en attendant le serveur (pas de statistiques)
export async function getLocalProfile(): Promise<{ nom?: string; email?: string | null } | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Supprime définitivement le compte et toutes ses données sur le serveur
export async function deleteAccount(): Promise<void> {
  const options = await getAuthOptions();
  const response = await fetch(`${API_BASE_URL}api/profile`, { method: 'DELETE', headers: { ...options } });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Erreur ${response.status}`);
  }
}
