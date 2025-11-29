import { useEffect, useState } from "react";
import { getPosts } from "../services/posts";
import type { PostWithRelations } from "../types/post";

export function PostsPage() {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPosts()
      .then(setPosts)
      .catch((err: unknown) => {
        console.error(err);
        setError("Falha ao carregar posts");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <h1>Posts</h1>
      <p>Listagem inicial com usuário e comentários incluídos.</p>
      {loading && <p>Carregando...</p>}
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {posts.map((post) => (
          <li key={post.id} className="card">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>Autor: {post.user?.name ?? "N/A"}</small>
            {post.comments?.length ? (
              <details>
                <summary>{post.comments.length} comentário(s)</summary>
                <ul>
                  {post.comments.map((c) => (
                    <li key={c.id}>{c.content}</li>
                  ))}
                </ul>
              </details>
            ) : (
              <small>Sem comentários</small>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
