import api from "../lib/axios"

export class TeamRepo {
  // Fetch all users
  async getAllTeams(page: number, limit: number) {
    const response = await api.get(`/api/admin/team?page=${page}&limit=${limit}`)
    return response.data
  }

  async getfields() {
    const response = await api.get("/api/admin/team/fields")
    return response.data
  }
  // Add a new user
  async addTeams(teamData: any) {
    const response = await api.post("/api/admin/createteam", teamData)
    return response.data
  }

  // Delete user by ID
  async deleteTeam(id: string) {
    const response = await api.delete(`/api/admin/team/${id}`)
    return response.data
  }

  // Update user by ID (Optional)
  async updateTeam(id: string, teamData: any) {
    const response = await api.put(`/api/admin/team/${id}`, teamData)
    return response.data
  }
}

export const teamRepo = new TeamRepo()
