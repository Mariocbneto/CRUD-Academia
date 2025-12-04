import { useEffect, useState } from "react";
// Services
import { getStudents } from "../services/students";
import { getTeachers } from "../services/teachers";
import { getFinancialRecords } from "../services/financial";
import { getClasses } from "../services/classes";
// Types
import type { Student } from "../types/student";
import type { Teacher } from "../types/teacher";
import type { FinancialRecord } from "../types/financial";
import type { GymClass } from "../types/gymClass";
// Components
import { Sidebar } from "../components/Sidebar";
import { DashboardHome } from "../components/sections/DashboardHome";
import { StudentsSection } from "../components/sections/StudentsSection";
import { TeachersSection } from "../components/sections/TeachersSection";
import { FinancialSection } from "../components/sections/FinancialSection";
import { ClassesSection } from "../components/sections/ClassesSection";

type SectionType = "dashboard" | "students" | "teachers" | "classes" | "financial" | "config";

export function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(true);
  const [section, setSection] = useState<SectionType>("dashboard");

  // Estado Global de Dados
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [gymClasses, setGymClasses] = useState<GymClass[]>([]);
  const [counts, setCounts] = useState({ alunos: 0, professores: 0, aulas: 0, financeiro: 0 });

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    Promise.all([getStudents(), getTeachers(), getFinancialRecords(), getClasses()])
      .then(([studentsData, teachersData, financesData, classesData]) => {
        setStudents(studentsData);
        setTeachers(teachersData);
        setFinancialRecords(financesData);
        setGymClasses(classesData);

        const balance = financesData.reduce((acc, curr) => {
          const val = Number(curr.amount);
          return curr.type === 'INCOME' ? acc + val : acc - val;
        }, 0);

        setCounts({
          alunos: studentsData.length,
          professores: teachersData.length,
          aulas: classesData.length,
          financeiro: balance,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  return (
    <div className="hub">
      <Sidebar 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen} 
        section={section} 
        setSection={setSection} 
      />

      <section className="hub-main">
        {section === "dashboard" && (
          <DashboardHome 
            counts={counts} 
            financialRecords={financialRecords} 
            students={students} // <--- ADICIONADO: Necessário para o gráfico de pizza
            loading={loading} 
            darkMode={darkMode}
          />
        )}

        {section === "students" && (
          <StudentsSection students={students} onRefresh={loadData} />
        )}

        {section === "teachers" && (
          <TeachersSection teachers={teachers} onRefresh={loadData} /> 
        )}

        {section === "classes" && (
          <ClassesSection 
            classes={gymClasses} 
            teachers={teachers} 
            onRefresh={loadData} 
          />
        )}

        {section === "financial" && (
          <FinancialSection 
            records={financialRecords} 
            onRefresh={loadData} 
            students={students}
            teachers={teachers} // <--- ADICIONADO: Necessário para selecionar professor no pagamento
          />
        )}

        {section === "config" && (
          <div className="config-main card">
            <div className="config-header"><h2>Configuração</h2></div>
            <div className="toggle-row">
              <div className="label-strong">Ativar modo Escuro</div>
              <button 
                type="button" 
                className={`toggle ${darkMode ? "on" : "off"}`} 
                onClick={() => setDarkMode((v) => !v)}
              >
                <span className="thumb" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}