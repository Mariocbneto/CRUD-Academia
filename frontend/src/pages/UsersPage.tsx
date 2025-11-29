import { useEffect, useState } from "react";
import { getUsers } from "../services/users";
import type { User } from "../types/user";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch((err: unknown) => {
        console.error(err);
        setError("Falha ao carregar usuários");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1>Usuários</h1>
      <p>Listagem inicial. Depois acrescentamos formulários de CRUD.</p>
      {loading && <p>Carregando...</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} — {user.email}
          </li>
        ))}
      </ul>
    </section>
  );
}
