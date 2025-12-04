import type { Student } from "./student";
import type { Teacher } from "./teacher";

export type FinancialRecord = {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: string; // ISO String
  
  // Relacionamentos opcionais
  studentId?: number | null;
  student?: Student;
  
  teacherId?: number | null;
  teacher?: Teacher;
  
  createdAt?: string;
  updatedAt?: string;
};