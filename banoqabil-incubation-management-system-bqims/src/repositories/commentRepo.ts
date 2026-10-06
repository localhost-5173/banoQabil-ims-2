// repositories/commentRepo.ts
import api from "../lib/axios";

export interface Comment {
  _id: string;
  content: string;
  post: string;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CommentResponse {
  docs: Comment[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class CommentRepo {
  async createComment(postId: string, content: string) {
    const response = await api.post("/api/comments/createcomment", {
      postId,
      content
    });
    return response.data;
  }

  async getCommentsByPost(postId: string, page: number = 1, limit: number = 10) {
    const response = await api.get<CommentResponse>(
      `/api/comments/post/${postId}/comments`,
      {
        params: { page, limit }
      }
    );
    return response.data;
  }

  async updateComment(id: string, content: string) {
    const response = await api.put(`/api/comments/updatecomment/${id}`, {
      content
    });
    return response.data;
  }

  async deleteComment(id: string) {
    const response = await api.delete(`/api/comments/deletecomment/${id}`);
    return response.data;
  }
}

export const commentRepo = new CommentRepo();