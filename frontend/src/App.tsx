import { Navigate, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import { CommentsPage } from "./pages/CommentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PostsPage } from "./pages/PostsPage";
import { UsersPage } from "./pages/UsersPage";

function App() {
  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">CRUD Academia</div>
        <nav className="nav">
          <Link to="/">Dashboard</Link>
          <Link to="/users">Usuários</Link>
          <Link to="/posts">Posts</Link>
          <Link to="/comments">Comentários</Link>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/comments" element={<CommentsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">Front em Vite + React + TS + Zod + Axios</footer>
    </div>
  );
}

export default App;
