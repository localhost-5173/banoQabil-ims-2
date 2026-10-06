import api from "../lib/axios"

export class UserRepo {
  // Fetch all users
  async getAllUsers(page = 1, limit = 10, search = "", filters: any = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      ...filters
    });
    const response = await api.get(`/api/user/signup?${params.toString()}`);
    return response.data;
  }
  // Add a new user
  async addUser(userData: any) {
    const response = await api.post("/api/user/signup", userData)
    return response.data
  }

  // Delete user by ID
  async deleteUser(id: string) {
    const response = await api.delete(`/api/user/delete/${id}`)
    return response.data
  }

  // Update user by ID (Optional)
  async updateUser(id: string, userData: any) {
    const response = await api.put(`/api/user/update/${id}`, userData)
    return response.data
  }

  // Verify user by ID
  async verifyUser(id: string) {
    const response = await api.patch(`/api/user/verify-user/${id}`)
    return response.data
  }

  // Resend verification email
  async resendVerification(email: string) {
    const response = await api.post("/api/user/resend-verification", { email })
    return response.data
  }

  async loginAdmin(Data: any) {
    const response = await api.post(`/api/admin/login`, Data)
    return response.data
  }

  async getEnums() {
    const response = await api.get("/api/user/enums")
    return response.data
  }

}



// Create a single instance to use everywhere
export const userRepo = new UserRepo()
