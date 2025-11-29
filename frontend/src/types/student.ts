export type Student = {
  id: number;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  plan: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
  startDate: string;
  endDate: string;
  photo?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
