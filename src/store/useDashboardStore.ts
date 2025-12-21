import { create } from 'zustand'
import { getDashboardStats } from '../api/dashboardApi'

interface DashboardState {
  totalCourses: number
  categories: number
  downloads: number
  fetchStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  totalCourses: 0,
  categories: 0,
  downloads: 0,
  fetchStats: async () => {
    const data = await getDashboardStats()
    set(data)
  },
}))
