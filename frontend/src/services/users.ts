import { api } from "../lib/api";
import type { User } from "../types/user";
import type { UserFormData, UserUpdateFormData } from "../schemas/user";

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}

export async function getUser(id: number): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
}

export async function createUser(payload: UserFormData): Promise<User> {
  const { data } = await api.post<User>("/users", payload);
  return data;
}

export async function updateUser(id: number, payload: UserUpdateFormData): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
