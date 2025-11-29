import { useEffect, useState } from "react";
import { getComments } from "../services/comments";
import type { CommentWithRelations } from "../types/comment";

export function CommentsPage() {
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getComments()
      .then(setComments)
      .catch((err: unknown) => {
        console.error(err);
        setError("Falha ao carregar comentários");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1>Comentários</h1>
      <p>Listagem inicial com usuário e post incluídos.</p>
      {loading && <p>Carregando...</p>}
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {comments.map((comment) => (
          <li key={comment.id} className="card">
            <p>{comment.content}</p>
            <small>
              Autor: {comment.user?.name ?? "N/A"} — Post: {comment.post?.title ?? "N/A"}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}
