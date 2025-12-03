import { api } from "../lib/api";
import type { GymClass } from "../types/gymClass";

export async function getClasses(): Promise<GymClass[]> {
  const { data } = await api.get("/classes");
  return data;
}

export async function createClass(payload: any): Promise<GymClass> {
  const { data } = await api.post("/classes", payload);
  return data;
}

export async function deleteClass(id: number): Promise<void> {
  await api.delete(`/classes/${id}`);
}