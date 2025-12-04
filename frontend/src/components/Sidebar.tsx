import type { Dispatch, SetStateAction } from "react";

type SectionType = "dashboard" | "students" | "teachers" | "classes" | "financial" | "config";

type Props = {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  section: SectionType;
  setSection: Dispatch<SetStateAction<SectionType>>;
};

export function Sidebar({ menuOpen, setMenuOpen, section, setSection }: Props) {
  return (
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
  );
}