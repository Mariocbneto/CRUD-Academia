export type FinancialRecord = {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  date: string;
  student?: { name: string };
  teacher?: { name: string };
};