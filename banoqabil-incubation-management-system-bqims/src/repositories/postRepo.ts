import api from "../lib/axios";

export class PostRepo {
  async getAllPosts() {
    const response = await api.get("/api/admin/post")
    return response.data
  }

  async getPostById(id: string) {
    const response = await api.get(`/api/admin/post/${id}`)
    return response.data
  }

  async createPost(postData: any) {
    const response = await api.post("/api/admin/post", postData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  }

  async updatePost(id: string, postData: any) {
    const response = await api.put(`/api/admin/post/${id}`, postData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
  

  async deletePost(id: string) {
    const response = await api.delete(`/api/admin/post/${id}`)
    return response.data
  }
}

export const postRepo = new PostRepo()
