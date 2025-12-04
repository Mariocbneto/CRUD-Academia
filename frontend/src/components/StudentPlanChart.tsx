import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Student } from "../types/student";

type Props = {
  students: Student[];
  darkMode?: boolean;
};

// Cores para cada plano
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function StudentPlanChart({ students, darkMode = false }: Props) {
  const data = useMemo(() => {
    // Conta quantos alunos existem em cada plano
    const counts: Record<string, number> = {};
    
    students.forEach((s) => {
      counts[s.plan] = (counts[s.plan] || 0) + 1;
    });

    // Transforma no formato que o Recharts entende
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [students]);

  if (students.length === 0) {
    return (
      <div className="card" style={{ height: "350px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{color: '#9ca3af'}}>Sem alunos cadastrados.</p>
      </div>
    );
  }

  const legendColor = darkMode ? "#e5e7eb" : "#374151";

  return (
    <div className="card" style={{ height: "350px" }}>
      <h3 style={{ marginBottom: "1rem" }}>Alunos por Plano</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Faz virar uma "Rosca" (Donut)
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={darkMode ? "#1f2937" : "#fff"} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                backgroundColor: darkMode ? '#374151' : '#fff',
                color: darkMode ? '#f3f4f6' : '#000'
            }} 
          />
          <Legend wrapperStyle={{ color: legendColor }} itemStyle={{ color: legendColor }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}