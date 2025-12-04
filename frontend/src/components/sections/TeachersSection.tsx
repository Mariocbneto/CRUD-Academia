import { useState } from "react";
import { TeacherForm } from "../TeacherForm"; // <--- SEU COMPONENTE EXISTENTE
import { deleteTeacher } from "../../services/teachers";
import type { Teacher } from "../../types/teacher";

type Props = {
  teachers: Teacher[];
  onRefresh: () => void;
};

export function TeachersSection({ teachers, onRefresh }: Props) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Teacher | null>(null);

  // Filtra visualmente
  const filtered = teachers.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(id: number) {
    if (confirm("Deletar professor?")) {
      await deleteTeacher(id);
      onRefresh();
    }
  }

  return (
    <div className="students-main">
      <header className="hub-header"><h1>Professores</h1></header>
      
      <div className="search-bar card">
        <input 
          type="text" 
          placeholder="Buscar professor..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <div className="search-hints">
          {filtered.map((t) => (
            <div key={t.id} className="hint-row">
              <div className="hint-avatar">
                {t.photo ? <img src={t.photo} alt={t.name} /> : <span className="avatar-fallback">{t.name[0]}</span>}
              </div>
              <div>
                <div className="label-strong">{t.name}</div>
                <div className="label-muted">{t.classType}</div>
              </div>
              <div className="hint-actions">
                <button className="icon-button" onClick={() => setEditing(t)}>✏️</button>
                <button className="icon-button danger" onClick={() => handleDelete(t.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reutilizando seu componente de formulário */}
      <TeacherForm 
        teacher={editing} 
        onCreated={onRefresh} 
        onUpdated={() => { onRefresh(); setEditing(null); }} 
      />
    </div>
  );
}