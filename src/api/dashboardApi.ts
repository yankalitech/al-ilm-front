export async function getDashboardStats() {
  // Simule une API distante
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalCourses: 120,
        categories: 15,
        downloads: 5234,
      })
    }, 800)
  })
}
