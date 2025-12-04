import { useMemo } from "react";
import { FinancialChart } from "../FinancialChart";
import type { FinancialRecord } from "../../types/financial";
import { StudentPlanChart } from "../StudentPlanChart"; 
import type { Student } from "../../types/student"; 

type Props = {
  counts: { alunos: number; professores: number; aulas: number; financeiro: number };
  financialRecords: FinancialRecord[];
  students: Student[]; 
  loading: boolean;
  darkMode: boolean;
};

export function DashboardHome({ counts, financialRecords,students, loading, darkMode }: Props) {
  const cards = useMemo(() => [
    { title: "Alunos", value: counts.alunos, icon: "👥", color: "#f59e0b" },
    { title: "Professores", value: counts.professores, icon: "🎓", color: "#2563eb" },
    { title: "Aulas (Mês)", value: counts.aulas, icon: "🧘", color: "#22c55e" },
    { title: "Saldo Caixa", value: `R$ ${counts.financeiro.toFixed(2)}`, icon: "💲", color: "#10b981" },
  ], [counts]);

  return (
    <>
      <header className="hub-header">
        <h1>Dashboard</h1>
        {loading && <span className="pill">Carregando...</span>}
      </header>
      <div className="cards-grid">
        {cards.map((card) => (
          <div key={card.title} className="card stats-card">
            <div className="icon" style={{ color: card.color }}>{card.icon}</div>
            <div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.title}</div>
            </div>
          </div>
        ))}
      </div>
      <FinancialChart records={financialRecords} darkMode={darkMode} />
      
      <StudentPlanChart students={students} darkMode={darkMode} />
    </>
  );
}