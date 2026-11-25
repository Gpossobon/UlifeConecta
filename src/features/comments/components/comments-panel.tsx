import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Firestore, Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { MessageCircle, Send, X } from "lucide-react";
import { addComment, subscribeToComments, type Comment } from "../../../services/comments/comments-service";

type CommentsPanelProps = {
  post: {
    id: number;
    author: string;
    category: string;
    categoryIcon: string;
    content: string;
    comments: number;
  };
  db: Firestore;
  user: User;
  onCountChange: (count: number) => void;
  onClose: () => void;
};

function getCommentTime(timestamp: Timestamp | null) {
  if (!timestamp) return "agora";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp.toMillis()) / 60_000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.floor(hours / 24)} d`;
}

export function CommentsPanel({ post, db, user, onCountChange, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const onCountChangeRef = useRef(onCountChange);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCountChangeRef.current = onCountChange;
  }, [onCountChange]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);

    const unsubscribe = subscribeToComments(
      db,
      post.id,
      (nextComments) => {
        setComments(nextComments);
        onCountChangeRef.current(nextComments.length);
        setErrorMessage("");
        setLoading(false);
      },
      (error) => {
        setErrorMessage(`Não foi possível carregar os comentários: ${error.message}`);
        setLoading(false);
      },
    );

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unsubscribe();
    };
  }, [db, post.id]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    setErrorMessage("");
    try {
      await addComment(db, post.id, user, content);
      setDraft("");
      inputRef.current?.focus();
    } catch (error) {
      setErrorMessage(`Não foi possível enviar o comentário: ${error instanceof Error ? error.message : "erro desconhecido"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="comments-title"
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 id="comments-title" className="flex items-center gap-2 text-base text-gray-900">
            <MessageCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
            Comentários ({comments.length})
          </h2>
          <button onClick={onClose} aria-label="Fechar comentários" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="overflow-y-auto p-4">
          <p className="mb-2 text-xs text-red-600">{post.category} · Publicado por {post.author}</p>
          <p className="mb-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{post.content}</p>
          <h3 className="mb-4 text-sm text-gray-800">Respostas</h3>

          {loading && <p role="status" className="py-6 text-center text-sm text-gray-500">Carregando comentários...</p>}
          {!loading && comments.length === 0 && !errorMessage && (
            <p className="py-8 text-center text-sm text-gray-500">Ainda não há comentários. Seja o primeiro a responder.</p>
          )}

          <div className="flex flex-col gap-4">
            {comments.map((comment) => {
              const isCurrentUser = comment.authorId === user.uid;
              return (
                <article key={comment.id} className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${isCurrentUser ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`} aria-hidden="true">
                    {comment.author.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm text-gray-800">{comment.author}</p>
                      <span className="shrink-0 text-xs text-gray-400">{getCommentTime(comment.createdAt)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{comment.content}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {errorMessage && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
        </div>

        <form onSubmit={submitComment} className="border-t border-gray-100 p-3">
          <label htmlFor="comment-draft" className="sr-only">Escreva um comentário</label>
          <div className="flex items-end gap-2">
            <textarea
              id="comment-draft"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escreva um comentário..."
              rows={1}
              maxLength={1000}
              className="max-h-28 min-h-11 flex-1 resize-y rounded-xl bg-gray-100 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              disabled={!draft.trim() || submitting}
              aria-label="Enviar comentário"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 text-right text-xs text-gray-400">Comentários salvos no Firestore.</p>
        </form>
      </section>
    </div>
  );
}
