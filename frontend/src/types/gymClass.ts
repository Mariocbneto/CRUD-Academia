import type { Teacher } from "./teacher";

export type GymClass = {
  id: number;
  name: string;
  
  // MUDANÇA: O banco envia a data como string ISO (ex: "2023-11-25T00:00:00.000Z")
  date: string; 
  
  timeStart: string;
  timeEnd: string;
  teacherId: number;
  
  // Relacionamento (pode vir ou não, dependendo da rota)
  teacher?: Teacher;
  
  // NOVO CAMPO: Identificador do grupo de aulas (agenda gerada)
  groupId?: string | null;
  
  createdAt?: string;
  updatedAt?: string;
};