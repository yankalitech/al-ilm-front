import { API_BASE_URL, getAuthOptions } from './authApi'
import { Cours } from './coursesApi'

export interface ProgressionCours {
  id: string
  utilisateurId: string
  coursId: string
  position: number
  terminee: boolean
  derniereEcoute: string
  cours: Cours & { miniatureAccessUrl: string | null }
}

export async function updateProgress(
  courseId: string,
  position: number,
  terminee = false
): Promise<ProgressionCours> {
  const options = await getAuthOptions()
  const response = await fetch(`${API_BASE_URL}api/courses/${courseId}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options },
    body: JSON.stringify({ position, terminee }),
  })
  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour de la progression')
  }
  return response.json()
}

export async function getHistory(): Promise<ProgressionCours[]> {
  const options = await getAuthOptions()
  const response = await fetch(`${API_BASE_URL}api/history`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...options },
  })
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération de l\'historique')
  }
  return response.json()
}
