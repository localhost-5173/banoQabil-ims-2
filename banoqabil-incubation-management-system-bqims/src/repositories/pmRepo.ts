import api from "../lib/axios";

export class PMRepo {
  async createPM(pmData: any) {
    const response = await api.post("/api/admin/pm", pmData);
    return response.data;
  }

  async getPMs() {
    const response = await api.get("/api/admin/pm");
    return response.data;
  }

  async getPMById(id: string) {
    const response = await api.get(`/api/admin/pm/${id}`);
    return response.data;
  }

  async updatePM(id: string, pmData: any) {
    const response = await api.put(`/api/admin/pm/${id}`, pmData);
    return response.data;
  }

  async deletePM(id: string) {
    const response = await api.delete(`/api/admin/pm/${id}`);
    return response.data;
  }
}

export const pmRepo = new PMRepo();


