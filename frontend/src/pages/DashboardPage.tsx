import { useEffect, useMemo, useState } from "react";
import { StudentForm } from "../components/StudentForm";
import { TeacherForm } from "../components/TeacherForm";
import { Modal } from "../components/Modal"; 
import { getStudents, deleteStudent } from "../services/students";
import { getTeachers, deleteTeacher } from "../services/teachers";
import { getFinancialRecords, createFinancialRecord } from "../services/financial";
import { getClasses, createClass, deleteClass } from "../services/classes";
import { FinancialChart } from "../components/FinancialChart";

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
  const [section, setSection] = useState<
    "dashboard" | "students" | "teachers" | "classes" | "financial" | "config"
  >("dashboard");

  // Dados Principais
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [gymClasses, setGymClasses] = useState<GymClass[]>([]);

  // Filtros
  const [search, setSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isClassModalOpen, setClassModalOpen] = useState(false);
  const [newClassData, setNewClassData] = useState({ name: "", timeStart: "08:00", timeEnd: "09:00", teacherId: "" });

  const [isFinanceModalOpen, setFinanceModalOpen] = useState(false);
  const [newFinanceData, setNewFinanceData] = useState({ description: "", amount: "", type: "INCOME" as "INCOME" | "EXPENSE" });

  const today = useMemo(() => new Date(), []);
  const todayDay = today.getDay(); 

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getStudents(), 
      getTeachers(), 
      getFinancialRecords(), 
      getClasses()
    ])
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
  }, []);


  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newClassData.teacherId) return alert("Selecione um professor");
    
    try {
      const created = await createClass({
        name: newClassData.name,
        dayOfWeek: todayDay, // Cria para hoje
        timeStart: newClassData.timeStart,
        timeEnd: newClassData.timeEnd,
        teacherId: Number(newClassData.teacherId)
      });
      // Atualiza lista localmente e fecha modal
      const teacher = teachers.find(t => t.id === created.teacherId);
      const classWithTeacher = { ...created, teacher }; // Acopla o objeto teacher para exibir o nome
      
      setGymClasses(prev => [...prev, classWithTeacher]);
      setCounts(prev => ({ ...prev, aulas: prev.aulas + 1 }));
      setClassModalOpen(false);
      setNewClassData({ name: "", timeStart: "08:00", timeEnd: "09:00", teacherId: "" });
    } catch (error) {
      alert("Erro ao criar aula");
    }
  }

  async function handleCreateFinance(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await createFinancialRecord({
        description: newFinanceData.description,
        amount: Number(newFinanceData.amount.replace(",", ".")),
        type: newFinanceData.type
      });
      
      setFinancialRecords(prev => [created, ...prev]);
      const amountNum = Number(created.amount);
      setCounts(prev => ({
        ...prev, 
        financeiro: created.type === 'INCOME' ? prev.financeiro + amountNum : prev.financeiro - amountNum
      }));
      setFinanceModalOpen(false);
      setNewFinanceData({ description: "", amount: "", type: "INCOME" });
    } catch (error) {
      alert("Erro ao salvar transação");
    }
  }

  const cards = useMemo(() => [
    { title: "Alunos", value: counts.alunos, icon: "👥", color: "#f59e0b" },
    { title: "Professores", value: counts.professores, icon: "🎓", color: "#2563eb" },
    { title: "Aulas Hoje", value: counts.aulas, icon: "🧘", color: "#22c55e" },
    { title: "Saldo Caixa", value: `R$ ${counts.financeiro.toFixed(2)}`, icon: "💲", color: "#10b981" },
  ], [counts]);

  return (
    <div className="hub">
      {/* SIDEBAR */}
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

      {/* MAIN CONTENT */}
      <section className="hub-main">
        
        {/* DASHBOARD */}
        {section === "dashboard" && (
          <>
            <header className="hub-header">
              <h1>Dashboard</h1>
              {loading && <span className="pill">Carregando...</span>}
            </header>
            
            {/* CARDS DE ESTATÍSTICAS */}
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
                      <button className="icon-button danger" onClick={() => { if(confirm("Deletar?")) { deleteStudent(s.id).then(() => { setStudents(p => p.filter(x => x.id !== s.id)); setCounts(p => ({...p, alunos: p.alunos - 1})); }) }}}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <StudentForm student={editing} 
              onCreated={(st) => { setStudents(p => [...p, st]); setCounts(p => ({...p, alunos: p.alunos + 1})); }} 
              onUpdated={(st) => { setStudents(p => p.map(x => x.id === st.id ? st : x)); setEditing(null); }} 
            />
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
                        <button className="icon-button danger" onClick={() => { if(confirm("Deletar?")) { deleteTeacher(t.id).then(() => { setTeachers(p => p.filter(x => x.id !== t.id)); setCounts(p => ({...p, professores: p.professores - 1})); }) }}}>🗑️</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <TeacherForm teacher={editingTeacher} 
               onCreated={(t) => { setTeachers(p => [...p, t]); setCounts(p => ({...p, professores: p.professores + 1})); }} 
               onUpdated={(t) => { setTeachers(p => p.map(x => x.id === t.id ? t : x)); setEditingTeacher(null); }} 
            />
          </div>
        )}

        {/* AULAS (COM MODAL) */}
        {section === "classes" && (
          <div className="students-main">
            <header className="hub-header">
              <h1>Aulas do Dia</h1>
              <span className="pill">{today.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit" })}</span>
              <button className="ghost" onClick={() => setClassModalOpen(true)}>+ Nova Aula</button>
            </header>

            <div className="cards-grid">
               {gymClasses.filter(c => c.dayOfWeek === todayDay).length === 0 && <p>Nenhuma aula hoje.</p>}
               {gymClasses.filter(c => c.dayOfWeek === todayDay).map(aula => (
                   <div key={aula.id} className="card stats-card">
                     <div className="icon">🧘</div>
                     <div style={{flex: 1}}>
                       <div className="stat-value">{aula.name}</div>
                       <div className="stat-label">{aula.timeStart} - {aula.timeEnd}</div>
                       <div className="label-strong" style={{fontSize: '0.9rem', color: '#6b7280'}}>Prof: {aula.teacher?.name || '---'}</div>
                     </div>
                     <button className="icon-button danger" onClick={() => { if(confirm("Cancelar aula?")) { deleteClass(aula.id).then(() => { setGymClasses(p => p.filter(c => c.id !== aula.id)); setCounts(p => ({...p, aulas: p.aulas - 1})); }) }}}>X</button>
                   </div>
               ))}
            </div>

            {/* MODAL CRIAR AULA */}
            <Modal isOpen={isClassModalOpen} onClose={() => setClassModalOpen(false)} title="Agendar Aula (Hoje)">
              <form onSubmit={handleCreateClass} className="form-grid" style={{gridTemplateColumns: '1fr'}}>
                 <label>Nome da Aula
                    <input required value={newClassData.name} onChange={e => setNewClassData({...newClassData, name: e.target.value})} placeholder="Ex: Pilates Avançado" />
                 </label>
                 <div style={{display:'flex', gap: '10px'}}>
                   <label style={{flex:1}}>Início
                      <input type="time" required value={newClassData.timeStart} onChange={e => setNewClassData({...newClassData, timeStart: e.target.value})} />
                   </label>
                   <label style={{flex:1}}>Fim
                      <input type="time" required value={newClassData.timeEnd} onChange={e => setNewClassData({...newClassData, timeEnd: e.target.value})} />
                   </label>
                 </div>
                 <label>Professor
                    <select required value={newClassData.teacherId} onChange={e => setNewClassData({...newClassData, teacherId: e.target.value})}>
                        <option value="">Selecione...</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name} - {t.classType}</option>)}
                    </select>
                 </label>
                 <div className="modal-actions">
                   <button type="button" className="ghost" onClick={() => setClassModalOpen(false)}>Cancelar</button>
                   <button type="submit" style={{background: '#2563eb', color:'white', padding:'0.5rem 1rem', borderRadius:'6px', border:'none', cursor:'pointer'}}>Salvar</button>
                 </div>
              </form>
            </Modal>
          </div>
        )}

        {/* FINANCEIRO (COM MODAL E TABELA NOVA) */}
        {section === "financial" && (
          <div className="students-main">
            <header className="hub-header">
               <h1>Financeiro</h1>
               <button className="ghost" onClick={() => setFinanceModalOpen(true)}>+ Nova Transação</button>
            </header>

            <div className="card table-container">
               <table className="data-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialRecords.map(rec => (
                      <tr key={rec.id}>
                         <td>{new Date(rec.date).toLocaleDateString()}</td>
                         <td>{rec.description}</td>
                         <td>
                            <span className={`pill ${rec.type === 'INCOME' ? 'success' : 'danger'}`}>
                               {rec.type === 'INCOME' ? 'Entrada' : 'Saída'}
                            </span>
                         </td>
                         <td style={{fontWeight: 'bold', color: rec.type === 'INCOME' ? '#16a34a' : '#dc2626'}}>
                            R$ {Number(rec.amount).toFixed(2)}
                         </td>
                      </tr>
                    ))}
                    {financialRecords.length === 0 && <tr><td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>Nenhum registro.</td></tr>}
                  </tbody>
               </table>
            </div>

            {/* MODAL FINANCEIRO */}
            <Modal isOpen={isFinanceModalOpen} onClose={() => setFinanceModalOpen(false)} title="Nova Movimentação">
               <form onSubmit={handleCreateFinance} className="form-grid" style={{gridTemplateColumns: '1fr'}}>
                  <label>Descrição
                     <input required placeholder="Ex: Mensalidade João" value={newFinanceData.description} onChange={e => setNewFinanceData({...newFinanceData, description: e.target.value})} />
                  </label>
                  <label>Valor (R$)
                     <input required type="number" step="0.01" placeholder="0.00" value={newFinanceData.amount} onChange={e => setNewFinanceData({...newFinanceData, amount: e.target.value})} />
                  </label>
                  <label>Tipo
                     <select value={newFinanceData.type} onChange={e => setNewFinanceData({...newFinanceData, type: e.target.value as any})}>
                        <option value="INCOME">Entrada (Receita)</option>
                        <option value="EXPENSE">Saída (Despesa)</option>
                     </select>
                  </label>
                  <div className="modal-actions">
                   <button type="button" className="ghost" onClick={() => setFinanceModalOpen(false)}>Cancelar</button>
                   <button type="submit" style={{background: '#10b981', color:'white', padding:'0.5rem 1rem', borderRadius:'6px', border:'none', cursor:'pointer'}}>Registrar</button>
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
                <div className="label-muted">Alterna o tema do dashboard</div>
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