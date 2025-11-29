import { useEffect, useMemo, useState } from "react";
import { StudentForm } from "../components/StudentForm";
import { TeacherForm } from "../components/TeacherForm";
import { getComments } from "../services/comments";
import { getPosts } from "../services/posts";
import { getStudents, deleteStudent } from "../services/students";
import { getTeachers, deleteTeacher } from "../services/teachers";
import { getUsers } from "../services/users";
import type { Student } from "../types/student";
import type { Teacher } from "../types/teacher";

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
  const [section, setSection] = useState<
    "dashboard" | "students" | "teachers" | "classes" | "config"
  >("dashboard");
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [assignments, setAssignments] = useState<Record<string, number | null>>({});

  const today = useMemo(() => new Date(), []);
  const todayDay = today.getDay(); // 0 domingo ... 6 sábado

  const classTypeLabel: Record<Teacher["classType"], string> = {
    MUSCULACAO: "Musculação",
    PILATES: "Pilates",
    FUNCIONAL: "Funcional",
    CROSS_TRAINING: "Cross Training",
    YOGA: "Yoga",
    ZUMBA_DANCA: "Zumba / Dança",
    HIIT: "HIIT",
    SPINNING: "Spinning / Ciclismo Indoor",
    ALONGAMENTO: "Alongamento",
    FISIOTERAPIA_REABILITACAO: "Fisioterapia / Reabilitação",
  };

  const daySlots: Record<number, { classType: Teacher["classType"]; start: string; end: string }[]> =
    {
      0: [
        { classType: "YOGA", start: "09:00", end: "10:00" },
        { classType: "ALONGAMENTO", start: "14:00", end: "15:00" },
        { classType: "PILATES", start: "17:00", end: "18:00" },
      ],
      1: [
        { classType: "MUSCULACAO", start: "08:00", end: "09:00" },
        { classType: "FUNCIONAL", start: "14:00", end: "15:00" },
        { classType: "SPINNING", start: "18:00", end: "19:00" },
      ],
      2: [
        { classType: "PILATES", start: "09:00", end: "10:00" },
        { classType: "CROSS_TRAINING", start: "16:00", end: "17:00" },
        { classType: "ZUMBA_DANCA", start: "19:00", end: "20:00" },
      ],
      3: [
        { classType: "FUNCIONAL", start: "07:30", end: "08:30" },
        { classType: "HIIT", start: "12:00", end: "12:40" },
        { classType: "ALONGAMENTO", start: "18:30", end: "19:30" },
      ],
      4: [
        { classType: "YOGA", start: "07:00", end: "08:00" },
        { classType: "PILATES", start: "13:00", end: "14:00" },
        { classType: "SPINNING", start: "19:00", end: "20:00" },
      ],
      5: [
        { classType: "MUSCULACAO", start: "08:00", end: "09:00" },
        { classType: "CROSS_TRAINING", start: "17:00", end: "18:00" },
        { classType: "ZUMBA_DANCA", start: "19:00", end: "20:00" },
      ],
      6: [
        { classType: "YOGA", start: "10:00", end: "11:00" },
        { classType: "PILATES", start: "14:00", end: "15:00" },
        { classType: "MUSCULACAO", start: "17:00", end: "19:00" },
      ],
    };

  const todaySlots = daySlots[todayDay] ?? [];

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getUsers(), getPosts(), getComments(), getStudents(), getTeachers()])
      .then(([_, _posts, comments, studentsData, teachersData]) => {
        setCounts({
          alunos: studentsData.length,
          professores: teachersData.length,
          aulas: 0,
          financeiro: comments.length,
        });
        setStudents(studentsData);
        setTeachers(teachersData);
        const initial: Record<string, number | null> = {};
        todaySlots.forEach((slot, idx) => {
          const key = `${todayDay}-${idx}`;
          const options = teachersData.filter((t) => t.classType === slot.classType);
          const choice = options.length
            ? options[Math.floor(Math.random() * options.length)].id
            : null;
          initial[key] = choice;
        });
        setAssignments(initial);
      })
      .catch((err) => {
        console.error(err);
        setCounts(initialCounts);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // sempre que os professores ou os slots do dia mudarem, tenta preencher os vazios
    setAssignments((prev) => {
      const next = { ...prev };
      todaySlots.forEach((slot, idx) => {
        const key = `${todayDay}-${idx}`;
        if (next[key] === undefined || next[key] === null) {
          const options = teachers.filter((t) => t.classType === slot.classType);
          const choice = options.length
            ? options[Math.floor(Math.random() * options.length)].id
            : null;
          next[key] = choice;
        }
      });
      return next;
    });
  }, [teachers, todaySlots, todayDay]);

  useEffect(() => {
    const assignedCount = Object.values(assignments).filter((v) => v !== null).length;
    setCounts((prev) => ({ ...prev, aulas: assignedCount }));
  }, [assignments]);

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
            <button
              className={`nav-item ${section === "teachers" ? "active" : ""}`}
              onClick={() => setSection("teachers")}
            >
              Professores
            </button>
            <button
              className={`nav-item ${section === "classes" ? "active" : ""}`}
              onClick={() => setSection("classes")}
            >
              Aulas
            </button>
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
        ) : section === "teachers" ? (
          <div className="students-main">
            <header className="hub-header">
              <h1>Professores</h1>
              {loading && <span className="pill">Carregando...</span>}
            </header>

            <div className="search-bar card">
              <input
                type="text"
                placeholder="Buscar professor pelo nome"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
              />
              <div className="search-hints">
                {teachers
                  .filter((t) =>
                    t.name.toLowerCase().includes(teacherSearch.toLowerCase()),
                  )
                  .map((t) => (
                    <div key={t.id} className="hint-row">
                      <div className="hint-avatar">
                        {t.photo ? (
                          <img src={t.photo} alt={t.name} />
                        ) : (
                          <span className="avatar-fallback">{t.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="label-strong">{t.name}</div>
                        <div className="label-muted">{t.classType}</div>
                      </div>
                      <div className="hint-actions">
                        <button
                          className="icon-button"
                          title="Editar"
                          onClick={() => setEditingTeacher(t)}
                        >
                          ✏️
                        </button>
                        <button
                          className="icon-button danger"
                          title="Excluir"
                          onClick={async () => {
                            const ok = window.confirm(
                              `Você realmente quer deletar o professor ${t.name}?`,
                            );
                            if (!ok) return;
                            await deleteTeacher(t.id);
                            setTeachers((prev) =>
                              prev.filter((prof) => prof.id !== t.id),
                            );
                            setCounts((prev) => ({
                              ...prev,
                              professores: Math.max(prev.professores - 1, 0),
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

            <TeacherForm
              teacher={editingTeacher}
              onCreated={(teacher) => {
                setTeachers((prev) =>
                  [...prev, teacher].sort((a, b) =>
                    a.name.localeCompare(b.name),
                  ),
                );
                setCounts((prev) => ({
                  ...prev,
                  professores: prev.professores + 1,
                }));
              }}
              onUpdated={(teacher) => {
                setTeachers((prev) =>
                  prev
                    .map((p) => (p.id === teacher.id ? teacher : p))
                    .sort((a, b) => a.name.localeCompare(b.name)),
                );
                setEditingTeacher(null);
              }}
            />
          </div>
        ) : section === "classes" ? (
          <div className="students-main">
            <header className="hub-header">
              <h1>Aulas de hoje</h1>
              <span className="pill">
                {today.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })}
              </span>
            </header>
            <div className="cards-grid">
              {todaySlots.map((slot, idx) => {
                const key = `${todayDay}-${idx}`;
                const assignedId = assignments[key] ?? null;
                const assigned = teachers.find((t) => t.id === assignedId);
                const options = teachers.filter((t) => t.classType === slot.classType);
                return (
                  <div key={key} className="card stats-card">
                    <div className="icon">
                      <span role="img" aria-label="Aula">
                        🧘
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="stat-value">{classTypeLabel[slot.classType]}</div>
                      <div className="stat-label">
                        {slot.start} - {slot.end}
                      </div>
                      <div className="label-strong" style={{ marginTop: "0.35rem" }}>
                        {assigned ? `Professor: ${assigned.name}` : "Professor: não definido"}
                      </div>
                    </div>
                    <select
                      className="class-select"
                      value={assignedId ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAssignments((prev) => ({
                          ...prev,
                          [key]: val ? Number(val) : null,
                        }));
                      }}
                    >
                      <option value="">Selecionar professor</option>
                      {options.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
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

