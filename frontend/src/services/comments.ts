import { api } from "../lib/api";
import type { Comment, CommentWithRelations } from "../types/comment";
import type { CommentFormData, CommentUpdateFormData } from "../schemas/comment";

export async function getComments(): Promise<CommentWithRelations[]> {
  const { data } = await api.get<CommentWithRelations[]>("/comments");
  return data;
}

export async function getComment(id: number): Promise<CommentWithRelations> {
  const { data } = await api.get<CommentWithRelations>(`/comments/${id}`);
  return data;
}

export async function createComment(payload: CommentFormData): Promise<Comment> {
  const { data } = await api.post<Comment>("/comments", payload);
  return data;
}

export async function updateComment(
  id: number,
  payload: CommentUpdateFormData,
): Promise<Comment> {
  const { data } = await api.put<Comment>(`/comments/${id}`, payload);
  return data;
}

export async function deleteComment(id: number): Promise<void> {
  await api.delete(`/comments/${id}`);
}
