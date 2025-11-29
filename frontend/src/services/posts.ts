import { api } from "../lib/api";
import type { Post, PostWithRelations } from "../types/post";
import type { PostFormData, PostUpdateFormData } from "../schemas/post";

export async function getPosts(): Promise<PostWithRelations[]> {
  const { data } = await api.get<PostWithRelations[]>("/posts");
  return data;
}

export async function getPost(id: number): Promise<PostWithRelations> {
  const { data } = await api.get<PostWithRelations>(`/posts/${id}`);
  return data;
}

export async function createPost(payload: PostFormData): Promise<Post> {
  const { data } = await api.post<Post>("/posts", payload);
  return data;
}

export async function updatePost(id: number, payload: PostUpdateFormData): Promise<Post> {
  const { data } = await api.put<Post>(`/posts/${id}`, payload);
  return data;
}

export async function deletePost(id: number): Promise<void> {
  await api.delete(`/posts/${id}`);
}
