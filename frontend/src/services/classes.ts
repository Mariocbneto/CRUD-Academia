import { api } from "../lib/api";
import type { GymClass } from "../types/gymClass";

export async function getClasses(start?: string, end?: string): Promise<GymClass[]> {
  const params = { start, end };
  const { data } = await api.get<GymClass[]>("/classes", { params });
  return data;
}

export async function generateClasses(payload: any): Promise<void> {
  await api.post("/classes/generate", payload);
}

export async function deleteClass(id: number): Promise<void> {
  await api.delete(`/classes/${id}`);
}