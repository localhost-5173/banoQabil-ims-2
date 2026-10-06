import api from "../lib/axios"

export interface DashboardStats {
  totalStudents: number
  totalPMs: number
  totalTeams: number
  totalProjects: number
  todayAttendance: {
    total: number
    present: number
    rate: number
  }
  courseDistribution: { course: string; count: number }[]
  genderDistribution: { gender: string; count: number }[]
  shiftDistribution: { shift: string; count: number }[]
  attendanceTrend: {
    date: string
    present: number
    absent: number
    late: number
    total: number
  }[]
}

export class DashboardRepo {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get("/api/admin/dashboard-stats")
    return res.data
  }
}

export const dashboardRepo = new DashboardRepo()
