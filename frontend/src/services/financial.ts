import { api } from "../lib/api";
import type { FinancialRecord } from "../types/financial";

export async function getFinancialRecords(): Promise<FinancialRecord[]> {
  const { data } = await api.get("/financial");
  return data;
}

export async function createFinancialRecord(payload: any): Promise<FinancialRecord> {
  const { data } = await api.post("/financial", payload);
  return data;
}