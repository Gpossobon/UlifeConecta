import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import type { User } from "firebase/auth";

export type Comment = {
  id: string;
  author: string;
  authorId: string;
  createdAt: Timestamp | null;
  content: string;
};

function parseComment(id: string, value: Record<string, unknown>): Comment {
  if (typeof value.author !== "string" || typeof value.authorId !== "string" || typeof value.content !== "string") {
    throw new Error("Um comentário no Firestore tem dados inválidos.");
  }
  if (value.createdAt !== null && !(value.createdAt instanceof Timestamp)) {
    throw new Error("A data de um comentário no Firestore está em formato inválido.");
  }
  return {
    id,
    author: value.author,
    authorId: value.authorId,
    createdAt: value.createdAt instanceof Timestamp ? value.createdAt : null,
    content: value.content,
  };
}

export function subscribeToComments(
  db: Firestore,
  postId: number,
  onComments: (comments: Comment[]) => void,
  onError: (error: Error) => void,
) {
  const commentsQuery = query(
    collection(db, "posts", String(postId), "comments"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(
    commentsQuery,
    (snapshot) => {
      try {
        onComments(snapshot.docs.map((document) => parseComment(document.id, document.data())));
      } catch (error) {
        onError(error instanceof Error ? error : new Error("Não foi possível ler os comentários."));
      }
    },
    onError,
  );
}

export async function addComment(
  db: Firestore,
  postId: number,
  user: User,
  content: string,
) {
  await addDoc(collection(db, "posts", String(postId), "comments"), {
    author: user.displayName || user.email || "Estudante",
    authorId: user.uid,
    content,
    createdAt: serverTimestamp(),
  });
}
