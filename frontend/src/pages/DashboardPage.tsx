import { useEffect, useMemo, useState } from "react";
import { StudentForm } from "../components/StudentForm";
import { getComments } from "../services/comments";
import { getPosts } from "../services/posts";
import { getStudents } from "../services/students";
import { getUsers } from "../services/users";
import type { Student } from "../types/student";
import { deleteStudent } from "../services/students";

type Counts = {
  alunos: number;
  professores: number;
  aulas: number;
  financeiro: number;
};

const initialCounts: Counts = {
  alunos: 0,
  professores: 0,
  aulas: 0,
  financeiro: 0,
};

export function DashboardPage() {
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [menuOpen, setMenuOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [section, setSection] = useState<"dashboard" | "students" | "config">(
    "dashboard",
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getUsers(), getPosts(), getComments(), getStudents()])
      .then(([_, posts, comments, studentsData]) => {
        setCounts({
          alunos: studentsData.length,
          professores: 0, // placeholder até termos dados de professores
          aulas: posts.length,
          financeiro: comments.length,
        });
        setStudents(studentsData);
      })
      .catch((err) => {
        console.error(err);
        setCounts(initialCounts);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo(
    () => [
      {
        title: "Alunos",
        value: counts.alunos,
        icon: (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#f59e0b">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-3.5 3-6 8-6s8 2.5 8 6" />
          </svg>
        ),
      },
      {
        title: "Professores",
        value: counts.professores,
        icon: (
          <svg viewBox="0 0 64 64" width="32" height="32">
            <circle cx="32" cy="22" r="12" fill="#2563eb" />
            <path d="M12 56c3-12 10-18 20-18s17 6 20 18" fill="#2563eb" />
          </svg>
        ),
      },
      {
        title: "Aulas",
        value: counts.aulas,
        icon: (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#22c55e">
            <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12.5a.5.5 0 0 1-.74.44L12 15l-7.26 3.94A.5.5 0 0 1 4 18.5Z" />
          </svg>
        ),
      },
      {
        title: "Financeiro",
        value: counts.financeiro,
        icon: (
          <svg viewBox="0 0 64 64" width="32" height="32">
            <circle cx="32" cy="32" r="30" fill="#10b981" />
            <text
              x="32"
              y="34"
              fill="#ffffff"
              fontSize="18"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="Inter, system-ui, sans-serif"
            >
              $
            </text>
          </svg>
        ),
      },
    ],
    [counts],
  );

  return (
    <div className="hub">
      <aside className="sidebar">
        <div className="sidebar-header" onClick={() => setMenuOpen((v) => !v)}>
          <div className="sidebar-user">
            <div className="avatar mini" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="32" height="32">
                <circle
                  cx="32"
                  cy="22"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 54c2.5-12 10-18 20-18s17.5 6 20 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="label-strong">Admin</div>
              <div className="label-muted">General</div>
            </div>
          </div>
          <button className="ghost" aria-label="Alternar menu">
            Menu
          </button>
        </div>
        {menuOpen && (
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${section === "dashboard" ? "active" : ""}`}
              onClick={() => setSection("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`nav-item ${section === "students" ? "active" : ""}`}
              onClick={() => setSection("students")}
            >
              Alunos
            </button>
            <button className="nav-item">Professores</button>
            <button className="nav-item">Aulas</button>
            <button
              className={`nav-item ${section === "config" ? "active" : ""}`}
              onClick={() => setSection("config")}
            >
              Configuracao
            </button>
          </nav>
        )}
      </aside>

      <section className="hub-main">
        {section === "dashboard" ? (
          <>
            <header className="hub-header">
              <h1>Dashboard</h1>
              {loading && <span className="pill">Carregando...</span>}
            </header>

            <div className="cards-grid">
              {cards.map((card) => (
                <div key={card.title} className="card stats-card">
                  <div className="icon">{card.icon}</div>
                  <div>
                    <div className="stat-value">{card.value}</div>
                    <div className="stat-label">{card.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : section === "students" ? (
          <div className="students-main">
            <header className="hub-header">
              <h1>Alunos</h1>
              {loading && <span className="pill">Carregando...</span>}
            </header>

            <div className="search-bar card">
              <input
                type="text"
                placeholder="Buscar aluno pelo nome"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="search-hints">
                {students
                  .filter((s) =>
                    s.name.toLowerCase().includes(search.toLowerCase()),
                  )
                    .map((s) => (
                    <div key={s.id} className="hint-row">
                      <div className="hint-avatar">
                        {s.photo ? (
                          <img src={s.photo} alt={s.name} />
                        ) : (
                          <span className="avatar-fallback">{s.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="label-strong">{s.name}</div>
                        <div className="label-muted">{s.email}</div>
                      </div>
                      <div className="hint-actions">
                        <button
                          className="icon-button"
                          title="Editar"
                          onClick={() => setEditing(s)}
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-button danger"
                          title="Excluir"
                          onClick={async () => {
                            const ok = window.confirm(
                              `Você realmente quer deletar o aluno ${s.name}?`,
                            );
                            if (!ok) return;
                            await deleteStudent(s.id);
                            setStudents((prev) =>
                              prev.filter((st) => st.id !== s.id),
                            );
                            setCounts((prev) => ({
                              ...prev,
                              alunos: Math.max(prev.alunos - 1, 0),
                            }));
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <StudentForm
              student={editing}
              onCreated={(student) => {
                setStudents((prev) =>
                  [...prev, student].sort((a, b) =>
                    a.name.localeCompare(b.name),
                  ),
                );
                setCounts((prev) => ({ ...prev, alunos: prev.alunos + 1 }));
              }}
              onUpdated={(student) => {
                setStudents((prev) =>
                  prev
                    .map((st) => (st.id === student.id ? student : st))
                    .sort((a, b) => a.name.localeCompare(b.name)),
                );
                setEditing(null);
              }}
            />
          </div>
        ) : (
          <div className="config-main card">
            <div className="config-header">
              <h2>Configuracao</h2>
            </div>
            <div className="toggle-row">
              <div>
                <div className="label-strong">Ativar modo Escuro</div>
                <div className="label-muted">Alterna o tema do dashboard</div>
              </div>
              <button
                type="button"
                className={`toggle ${darkMode ? "on" : "off"}`}
                onClick={() => setDarkMode((v) => !v)}
                aria-pressed={darkMode}
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
