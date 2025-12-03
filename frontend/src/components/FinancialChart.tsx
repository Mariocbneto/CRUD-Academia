import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import type { FinancialRecord } from "../types/financial";
import { useMemo } from "react";

type Props = {
  records: FinancialRecord[];
  darkMode?: boolean;
};

export function FinancialChart({ records, darkMode = false }: Props) {
  
  const data = useMemo(() => {
    const income = records
      .filter((r) => r.type === "INCOME")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expense = records
      .filter((r) => r.type === "EXPENSE")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    return [
      { name: "Entradas", value: income, color: "#10b981" },
      { name: "Saídas", value: expense, color: "#ef4444" },
    ];
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>Sem dados financeiros para exibir no gráfico.</p>
      </div>
    );
  }

  const axisColor = darkMode ? "#e5e7eb" : "#6b7280";
  const gridColor = darkMode ? "#374151" : "#e5e7eb";
  
  const tooltipStyle = {
    backgroundColor: darkMode ? "#1f2937" : "#fff",
    borderColor: darkMode ? "#374151" : "#e5e7eb",
    color: darkMode ? "#f3f4f6" : "#1f2933",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
  };

  return (
    <div className="card" style={{ height: "400px", marginTop: "1rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Balanço Financeiro</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: axisColor, fontSize: 14 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: axisColor, fontSize: 12 }} 
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip 
            cursor={{ fill: "transparent" }}
            contentStyle={tooltipStyle} // Apliquei o estilo dinâmico aqui
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Valor"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}