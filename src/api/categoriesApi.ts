import {API_BASE_URL, getAuthOptions} from "./authApi"
export async function getCategoriesList() {
  try {
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/categories`,
      
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options
          }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log('data return categories ----', data)
    // Selon le format de l'API, adapte ici
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error);
    throw error;
  }
}

export async function getCategoriesElement(id: string) {
  try {
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/categories/${id}`,

      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options
          }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log('data return categories ----', data)
    // Selon le format de l'API, adapte ici
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error);
    throw error;
  }
}

export async function deleteCategoriesElement(id: string) {
  try {
    const options = await getAuthOptions()
    const response = await fetch(`${API_BASE_URL}api/categories/${id}`,{
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
    console.log('data return categories ----', data)
    // Selon le format de l'API, adapte ici
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error);
    throw error;
  }
}

export async function addCategories(newCategory: any) {
  console.log('api get liste ----------')
  const options = await getAuthOptions()
  const response = await fetch(`${API_BASE_URL}api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options
        },
        body: JSON.stringify(newCategory),
      });
       console.log('data return categories ----', response)
      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

}

export async function updateCategories(newCategory: any) {
  console.log('api get liste ----------', newCategory)
  const options = await getAuthOptions()
  const response = await fetch(`${API_BASE_URL}api/categories/${newCategory.categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options
        },
        body: JSON.stringify(newCategory),
      });
       console.log('data return categories ----', response)
      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

}

