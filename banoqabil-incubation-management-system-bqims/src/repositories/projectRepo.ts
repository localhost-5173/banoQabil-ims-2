import api from "../lib/axios"

export class ProjectRepo {
  async getAllProjects() {
    const response = await api.get("/api/admin/project")
    return response.data
  }

  async createProject(projectData: any, isMultipart = false) {
    const response = await api.post("/api/admin/createproject", projectData, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    })
    return response.data
  }

  async deleteProject(id: string) {
    const response = await api.delete(`/api/admin/project/${id}`)
    return response.data
  }

  async updateProject(id: string, projectData: any, isMultipart = false) {
    const response = await api.put(`/api/admin/project/${id}`, projectData, {
      headers: isMultipart
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    })
    return response.data
  }
}

export const projectRepo = new ProjectRepo()