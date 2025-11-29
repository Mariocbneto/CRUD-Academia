import { api } from "../lib/api";
import type { Student } from "../types/student";
import type { StudentFormData } from "../schemas/student";

export async function getStudents(query?: string): Promise<Student[]> {
  const params = query ? { q: query } : undefined;
  const { data } = await api.get<Student[]>("/students", { params });
  return data;
}

export async function createStudent(payload: StudentFormData): Promise<Student> {
  const { data } = await api.post<Student>("/students", payload);
  return data;
}

export async function updateStudent(id: number, payload: StudentFormData): Promise<Student> {
  const { data } = await api.put<Student>(`/students/${id}`, payload);
  return data;
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/students/${id}`);
}
