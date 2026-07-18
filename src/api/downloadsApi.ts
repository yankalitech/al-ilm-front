import { API_BASE_URL, getAuthOptions } from './authApi'
import { Cours } from './coursesApi'

export interface Telechargement {
  id: string
  utilisateurId: string
  coursId: string
  dateTelechargement: string
  cours: Cours & { fichierAccessUrl: string | null }
}

export interface RecordDownloadResponse {
  telechargement: Omit<Telechargement, 'cours'>
  fichierAccessUrl: string | null
}

export async function recordDownload(courseId: string): Promise<RecordDownloadResponse> {
  const options = await getAuthOptions()
  const response = await fetch(`${API_BASE_URL}api/courses/${courseId}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options },
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || 'Erreur lors de l\'enregistrement du téléchargement')
  }
  return response.json()
}

export async function getDownloads(): Promise<Telechargement[]> {
  const options = await getAuthOptions()
  const response = await fetch(`${API_BASE_URL}api/downloads`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...options },
  })
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des téléchargements')
  }
  return response.json()
}

export async function deleteDownload(id: string): Promise<void> {
  const options = await getAuthOptions()
  const response = await fetch(`${API_BASE_URL}api/downloads/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...options },
  })
  if (!response.ok) {
    throw new Error('Erreur lors de la suppression du téléchargement')
  }
}
