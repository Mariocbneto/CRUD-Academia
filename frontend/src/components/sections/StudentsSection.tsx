import { useState } from "react";
import { StudentForm } from "../StudentForm";
import { deleteStudent } from "../../services/students";
import type { Student } from "../../types/student";

type Props = {
  students: Student[];
  onRefresh: () => void;
};

export function StudentsSection({ students, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);

  const filtered = students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(id: number) {
    if (confirm("Deletar aluno?")) {
      await deleteStudent(id);
      onRefresh();
    }
  }

  return (
    <div className="students-main">
      <header className="hub-header"><h1>Alunos</h1></header>
      <div className="search-bar card">
        <input type="text" placeholder="Buscar aluno..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="search-hints">
          {filtered.map((s) => (
            <div key={s.id} className="hint-row">
              <div className="hint-avatar">
                {s.photo ? <img src={s.photo} alt={s.name} /> : <span className="avatar-fallback">{s.name[0]}</span>}
              </div>
              <div>
                <div className="label-strong">{s.name}</div>
                <div className="label-muted">{s.plan}</div>
                {s.createdAt && <div className="label-muted" style={{ fontSize: '0.75rem' }}>Cadastro: {new Date(s.createdAt).toLocaleDateString()}</div>}
              </div>
              <div className="hint-actions">
                <button className="icon-button" onClick={() => setEditing(s)}>✏️</button>
                <button className="icon-button danger" onClick={() => handleDelete(s.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <StudentForm student={editing} onCreated={onRefresh} onUpdated={() => { onRefresh(); setEditing(null); }} />
    </div>
  );
}