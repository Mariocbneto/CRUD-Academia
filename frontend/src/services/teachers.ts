import { api } from "../lib/api";
import type { Teacher } from "../types/teacher";
import type { TeacherFormData } from "../schemas/teacher";

export async function getTeachers(query?: string): Promise<Teacher[]> {
  const params = query ? { q: query } : undefined;
  const { data } = await api.get<Teacher[]>("/teachers", { params });
  return data;
}

export async function createTeacher(payload: TeacherFormData): Promise<Teacher> {
  const { data } = await api.post<Teacher>("/teachers", payload);
  return data;
}

export async function updateTeacher(id: number, payload: TeacherFormData): Promise<Teacher> {
  const { data } = await api.put<Teacher>(`/teachers/${id}`, payload);
  return data;
}

export async function deleteTeacher(id: number): Promise<void> {
  await api.delete(`/teachers/${id}`);
}
