import { useEffect, useMemo, useState } from "react";
import { StudentForm } from "../components/StudentForm";
import { TeacherForm } from "../components/TeacherForm";
import { Modal } from "../components/Modal";
import { FinancialChart } from "../components/FinancialChart";

import { getStudents, deleteStudent } from "../services/students";
import { getTeachers, deleteTeacher } from "../services/teachers";
import { getFinancialRecords, createFinancialRecord } from "../services/financial";
import { getClasses, generateClasses, deleteClass } from "../services/classes";

import type { Student } from "../types/student";
import type { Teacher } from "../types/teacher";
import type { FinancialRecord } from "../types/financial";
import type { GymClass } from "../types/gymClass";

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
  const [section, setSection] = useState<"dashboard" | "students" | "teachers" | "classes" | "financial" | "config">("dashboard");

  // Dados
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [gymClasses, setGymClasses] = useState<GymClass[]>([]);

  // Filtros/Edição
  const [search, setSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // --- ESTADOS DO MODAL DE AGENDA ---
  const [isClassModalOpen, setClassModalOpen] = useState(false);
  const [agendaForm, setAgendaForm] = useState({
    name: "",
    teacherId: "",
    timeStart: "08:00",
    timeEnd: "09:00",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    weekDays: [] as number[]
  });

  // --- ESTADOS DO MODAL FINANCEIRO ---
  const [isFinanceModalOpen, setFinanceModalOpen] = useState(false);
  const [newFinanceData, setNewFinanceData] = useState({ description: "", amount: "", type: "INCOME" as "INCOME" | "EXPENSE" });

  const today = useMemo(() => new Date(), []);
  
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
          aulas: classesData.length, // Total de aulas cadastradas no mês
          financeiro: balance,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  // --- HANDLERS ---

  function toggleWeekDay(day: number) {
    setAgendaForm(prev => {
      const exists = prev.weekDays.includes(day);
      if (exists) return { ...prev, weekDays: prev.weekDays.filter(d => d !== day) };
      return { ...prev, weekDays: [...prev.weekDays, day] };
    });
  }

  async function handleGenerateAgenda(e: React.FormEvent) {
    e.preventDefault();
    if (agendaForm.weekDays.length === 0) return alert("Selecione pelo menos um dia da semana.");
    if (!agendaForm.teacherId) return alert("Selecione um professor.");

    try {
      setLoading(true);
      await generateClasses({
        ...agendaForm,
        teacherId: Number(agendaForm.teacherId)
      });
      alert("Agenda gerada com sucesso!");
      setClassModalOpen(false);
      loadData(); // Recarrega para mostrar as novas aulas
    } catch (error) {
      alert("Erro ao gerar agenda.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFinance(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createFinancialRecord({
        description: newFinanceData.description,
        amount: Number(newFinanceData.amount.replace(",", ".")),
        type: newFinanceData.type
      });
      setFinanceModalOpen(false);
      setNewFinanceData({ description: "", amount: "", type: "INCOME" });
      loadData();
    } catch (error) {
      alert("Erro ao salvar.");
    }
  }

  // Filtra aulas de HOJE para exibir no card
  const todaysClasses = gymClasses.filter(c => {
    // 1. Proteção: Se a aula não tiver data definida, ignora
    if (!c.date) return false;

    // 2. Converte para objeto Date
    const dateObj = new Date(c.date);

    // 3. Proteção: Verifica se a data é válida (evita o RangeError)
    if (isNaN(dateObj.getTime())) return false;

    // 4. Agora é seguro chamar toISOString
    const classDate = dateObj.toISOString().split('T')[0];
    const todayDate = today.toISOString().split('T')[0];
    
    return classDate === todayDate;
  });
  const cards = useMemo(() => [
    { title: "Alunos", value: counts.alunos, icon: "👥", color: "#f59e0b" },
    { title: "Professores", value: counts.professores, icon: "🎓", color: "#2563eb" },
    { title: "Aulas Hoje", value: todaysClasses.length, icon: "🧘", color: "#22c55e" }, // Mostra aulas de HOJE
    { title: "Saldo Caixa", value: `R$ ${counts.financeiro.toFixed(2)}`, icon: "💲", color: "#10b981" },
  ], [counts, todaysClasses]);

  return (
    <div className="hub">
      <aside className="sidebar">
        <div className="sidebar-header" onClick={() => setMenuOpen((v) => !v)}>
          <div className="sidebar-user">
            <div className="avatar mini">A</div>
            <div>
              <div className="label-strong">Admin</div>
              <div className="label-muted">General</div>
            </div>
          </div>
        </div>
        {menuOpen && (
          <nav className="sidebar-nav">
            <button className={`nav-item ${section === "dashboard" ? "active" : ""}`} onClick={() => setSection("dashboard")}>Dashboard</button>
            <button className={`nav-item ${section === "students" ? "active" : ""}`} onClick={() => setSection("students")}>Alunos</button>
            <button className={`nav-item ${section === "teachers" ? "active" : ""}`} onClick={() => setSection("teachers")}>Professores</button>
            <button className={`nav-item ${section === "classes" ? "active" : ""}`} onClick={() => setSection("classes")}>Aulas</button>
            <button className={`nav-item ${section === "financial" ? "active" : ""}`} onClick={() => setSection("financial")}>Financeiro</button>
            <button className={`nav-item ${section === "config" ? "active" : ""}`} onClick={() => setSection("config")}>Configuração</button>
          </nav>
        )}
      </aside>

      <section className="hub-main">
        {/* DASHBOARD */}
        {section === "dashboard" && (
          <>
            <header className="hub-header">
              <h1>Dashboard</h1>
              {loading && <span className="pill">Carregando...</span>}
            </header>
            <div className="cards-grid">
              {cards.map((card) => (
                <div key={card.title} className="card stats-card">
                  <div className="icon" style={{color: card.color}}>{card.icon}</div>
                  <div>
                    <div className="stat-value">{card.value}</div>
                    <div className="stat-label">{card.title}</div>
                  </div>
                </div>
              ))}
            </div>
            <FinancialChart records={financialRecords} darkMode={darkMode} />
          </>
        )}

        {/* ALUNOS */}
        {section === "students" && (
          <div className="students-main">
            <header className="hub-header"><h1>Alunos</h1></header>
            <div className="search-bar card">
              <input type="text" placeholder="Buscar aluno..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <div className="search-hints">
                {students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())).map((s) => (
                  <div key={s.id} className="hint-row">
                    <div className="hint-avatar">
                      {s.photo ? <img src={s.photo} alt={s.name} /> : <span className="avatar-fallback">{s.name[0]}</span>}
                    </div>
                    <div>
                      <div className="label-strong">{s.name}</div>
                      <div className="label-muted">{s.plan}</div>
                      {s.createdAt && <div className="label-muted" style={{fontSize: '0.75rem'}}>Cadastro: {new Date(s.createdAt).toLocaleDateString()}</div>}
                    </div>
                    <div className="hint-actions">
                      <button className="icon-button" onClick={() => setEditing(s)}>✏️</button>
                      <button className="icon-button danger" onClick={() => { if(confirm("Deletar?")) { deleteStudent(s.id).then(() => { loadData(); }) }}}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <StudentForm student={editing} onCreated={() => loadData()} onUpdated={() => { loadData(); setEditing(null); }} />
          </div>
        )}

        {/* PROFESSORES */}
        {section === "teachers" && (
          <div className="students-main">
            <header className="hub-header"><h1>Professores</h1></header>
            <div className="search-bar card">
               <input type="text" placeholder="Buscar professor..." value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} />
              <div className="search-hints">
                {teachers.filter((t) => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).map((t) => (
                    <div key={t.id} className="hint-row">
                      <div className="hint-avatar">
                         {t.photo ? <img src={t.photo} alt={t.name} /> : <span className="avatar-fallback">{t.name[0]}</span>}
                      </div>
                      <div>
                        <div className="label-strong">{t.name}</div>
                        <div className="label-muted">{t.classType}</div>
                      </div>
                      <div className="hint-actions">
                        <button className="icon-button" onClick={() => setEditingTeacher(t)}>✏️</button>
                        <button className="icon-button danger" onClick={() => { if(confirm("Deletar?")) { deleteTeacher(t.id).then(() => loadData()) }}}>🗑️</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <TeacherForm teacher={editingTeacher} onCreated={() => loadData()} onUpdated={() => { loadData(); setEditingTeacher(null); }} />
          </div>
        )}

        {/* AULAS (AGENDA) */}
        {section === "classes" && (
          <div className="students-main">
            <header className="hub-header">
              <h1>Aulas (Agenda)</h1>
              <button className="ghost" onClick={() => setClassModalOpen(true)}>+ Gerar Agenda</button>
            </header>

            <div className="cards-grid">
               {todaysClasses.length === 0 && <p style={{gridColumn: '1/-1', textAlign:'center', color:'#888'}}>Nenhuma aula agendada para hoje ({today.toLocaleDateString()}).</p>}
               {todaysClasses.map(aula => (
                   <div key={aula.id} className="card stats-card">
                     <div className="icon">🧘</div>
                     <div style={{flex: 1}}>
                       <div className="stat-value">{aula.name}</div>
                       <div className="stat-label">{aula.timeStart} - {aula.timeEnd}</div>
                       <div className="label-strong" style={{fontSize: '0.9rem', color: '#6b7280'}}>
                         {aula.teacher?.name}
                       </div>
                     </div>
                     <button className="icon-button danger" onClick={() => { if(confirm("Cancelar esta aula?")) { deleteClass(aula.id).then(() => loadData()) }}}>X</button>
                   </div>
               ))}
            </div>

            {/* MODAL GERAR AGENDA */}
            <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title="Gerar Agenda de Aulas">
              <form onSubmit={handleGenerateAgenda} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                  <label>Nome da Atividade
                    <input required placeholder="Ex: Musculação Manhã" value={agendaForm.name} onChange={e => setAgendaForm({...agendaForm, name: e.target.value})} />
                  </label>
                  <label>Professor
                    <select required value={agendaForm.teacherId} onChange={e => setAgendaForm({...agendaForm, teacherId: e.target.value})}>
                      <option value="">Selecione...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.classType})</option>)}
                    </select>
                  </label>
                </div>

                <label>Dias da Semana (Repetir)</label>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, idx) => (
                    <button key={idx} type="button" onClick={() => toggleWeekDay(idx)}
                      style={{
                        padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
                        background: agendaForm.weekDays.includes(idx) ? '#2563eb' : 'transparent',
                        color: agendaForm.weekDays.includes(idx) ? '#fff' : 'inherit', cursor: 'pointer', fontWeight: '600'
                      }}
                    >
                      {dayName}
                    </button>
                  ))}
                </div>

                <div style={{display:'flex', gap:'10px'}}>
                  <label style={{flex:1}}>Início
                    <input type="time" required value={agendaForm.timeStart} onChange={e => setAgendaForm({...agendaForm, timeStart: e.target.value})} />
                  </label>
                  <label style={{flex:1}}>Fim
                    <input type="time" required value={agendaForm.timeEnd} onChange={e => setAgendaForm({...agendaForm, timeEnd: e.target.value})} />
                  </label>
                </div>

                <div style={{display:'flex', gap:'10px'}}>
                  <label style={{flex:1}}>Data Inicial
                    <input type="date" required value={agendaForm.startDate} onChange={e => setAgendaForm({...agendaForm, startDate: e.target.value})} />
                  </label>
                  <label style={{flex:1}}>Data Final
                    <input type="date" required value={agendaForm.endDate} onChange={e => setAgendaForm({...agendaForm, endDate: e.target.value})} />
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="ghost" onClick={() => setClassModalOpen(false)}>Cancelar</button>
                  <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                    Gerar Agenda
                  </button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* FINANCEIRO */}
        {section === "financial" && (
          <div className="students-main">
            <header className="hub-header">
               <h1>Financeiro</h1>
               <button className="ghost" onClick={() => setFinanceModalOpen(true)}>+ Nova Transação</button>
            </header>
            <div className="card table-container">
               <table className="data-table">
                  <thead>
                    <tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Valor</th></tr>
                  </thead>
                  <tbody>
                    {financialRecords.map(rec => (
                      <tr key={rec.id}>
                         <td>{new Date(rec.date).toLocaleDateString()}</td>
                         <td>{rec.description}</td>
                         <td><span className={`pill ${rec.type === 'INCOME' ? 'success' : 'danger'}`}>{rec.type === 'INCOME' ? 'Entrada' : 'Saída'}</span></td>
                         <td style={{fontWeight: 'bold', color: rec.type === 'INCOME' ? '#16a34a' : '#dc2626'}}>R$ {Number(rec.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
            <Modal isOpen={isFinanceModalOpen} onClose={() => setFinanceModalOpen(false)} title="Nova Movimentação">
               <form onSubmit={handleCreateFinance} className="form-grid" style={{gridTemplateColumns: '1fr'}}>
                  <label>Descrição<input required placeholder="Ex: Mensalidade João" value={newFinanceData.description} onChange={e => setNewFinanceData({...newFinanceData, description: e.target.value})} /></label>
                  <label>Valor (R$)<input required type="number" step="0.01" value={newFinanceData.amount} onChange={e => setNewFinanceData({...newFinanceData, amount: e.target.value})} /></label>
                  <label>Tipo
                     <select value={newFinanceData.type} onChange={e => setNewFinanceData({...newFinanceData, type: e.target.value as any})}>
                        <option value="INCOME">Entrada</option>
                        <option value="EXPENSE">Saída</option>
                     </select>
                  </label>
                  <div className="modal-actions">
                   <button type="button" className="ghost" onClick={() => setFinanceModalOpen(false)}>Cancelar</button>
                   <button type="submit" style={{background: '#10b981', color:'white', padding:'0.5rem 1rem', borderRadius:'6px', border:'none', cursor:'pointer'}}>Salvar</button>
                 </div>
               </form>
            </Modal>
          </div>
        )}

        {/* CONFIGURAÇÃO */}
        {section === "config" && (
          <div className="config-main card">
            <div className="config-header"><h2>Configuração</h2></div>
            <div className="toggle-row">
              <div>
                <div className="label-strong">Ativar modo Escuro</div>
              </div>
              <button type="button" className={`toggle ${darkMode ? "on" : "off"}`} onClick={() => setDarkMode((v) => !v)} aria-pressed={darkMode}>
                <span className="thumb" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}