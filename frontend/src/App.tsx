import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import { LoginPage } from "./pages/LoginPage";
import { CommentsPage } from "./pages/CommentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PostsPage } from "./pages/PostsPage";
import { UsersPage } from "./pages/UsersPage";

function App() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<{ token: string; userName: string } | null>(() => {
    const saved = localStorage.getItem("auth");
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = Boolean(auth?.token);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleLoginSuccess(token: string, userName: string) {
    const payload = { token, userName };
    setAuth(payload);
    localStorage.setItem("auth", JSON.stringify(payload));
    navigate("/", { replace: true });
  }

  function handleLogout() {
    setAuth(null);
    localStorage.removeItem("auth");
    navigate("/login", { replace: true });
  }

  return (
    <div className="layout">
      {isAuthenticated && (
        <header className="topbar">
          <div className="brand">CRUD Academia</div>
          <div className="user-box">
            <span>{auth?.userName ?? "Usuário"}</span>
            <button className="ghost" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>
      )}
      <main className="content">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/users"
            element={isAuthenticated ? <UsersPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/posts"
            element={isAuthenticated ? <PostsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/comments"
            element={isAuthenticated ? <CommentsPage /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </main>
      {isAuthenticated && <footer className="footer" />}
    </div>
  );
}

export default App;
