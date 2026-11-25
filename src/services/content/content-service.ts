import { collection, onSnapshot, orderBy, query, type Firestore } from "firebase/firestore";
import type { ContentType, LearningContent } from "../../features/content/types";

function parseContent(id: string, value: Record<string, unknown>): LearningContent {
  const allowedTypes: ContentType[] = ["PDF", "Vídeo", "Slides", "Link"];
  if (
    typeof value.title !== "string"
    || typeof value.subject !== "string"
    || typeof value.author !== "string"
    || typeof value.description !== "string"
    || !allowedTypes.includes(value.type as ContentType)
    || (value.rating !== undefined && typeof value.rating !== "number")
    || (value.featured !== undefined && typeof value.featured !== "boolean")
    || (value.tags !== undefined && (!Array.isArray(value.tags) || !value.tags.every((tag) => typeof tag === "string")))
    || (value.url !== undefined && typeof value.url !== "string")
  ) {
    throw new Error(`O material "${id}" está incompleto ou usa um formato inválido.`);
  }

  let url: string | null = null;
  if (typeof value.url === "string" && value.url.trim()) {
    try {
      const parsedUrl = new URL(value.url);
      if (parsedUrl.protocol !== "https:") throw new Error("URL inválida");
      url = parsedUrl.toString();
    } catch {
      throw new Error(`O link do material "${value.title}" precisa ser uma URL HTTPS válida.`);
    }
  }

  return {
    id,
    title: value.title,
    subject: value.subject,
    type: value.type as ContentType,
    author: value.author,
    description: value.description,
    rating: typeof value.rating === "number" ? value.rating : null,
    featured: value.featured === true,
    tags: Array.isArray(value.tags) ? value.tags as string[] : [],
    url,
  };
}

export function subscribeToContent(
  db: Firestore,
  onContent: (items: LearningContent[]) => void,
  onError: (error: Error) => void,
) {
  const contentQuery = query(collection(db, "contents"), orderBy("title", "asc"));
  return onSnapshot(
    contentQuery,
    (snapshot) => {
      try {
        onContent(snapshot.docs.map((document) => parseContent(document.id, document.data())));
      } catch (error) {
        onError(error instanceof Error ? error : new Error("Não foi possível ler os materiais."));
      }
    },
    onError,
  );
}
