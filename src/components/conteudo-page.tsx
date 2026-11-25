import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { BookOpen, ExternalLink, FileText, Link as LinkIcon, Search, Star, Video } from "lucide-react";
import { useFirebaseAuth } from "../auth/firebase-auth";

type ContentType = "PDF" | "Vídeo" | "Slides" | "Link";

type LearningContent = {
  id: string;
  title: string;
  subject: string;
  type: ContentType;
  author: string;
  description: string;
  rating: number | null;
  featured: boolean;
  tags: string[];
  url: string | null;
};

const CONTENT_TYPES = ["Todos", "PDF", "Vídeo", "Slides", "Link"] as const;
const TYPE_ICONS: Record<ContentType, typeof FileText> = {
  PDF: FileText,
  Vídeo: Video,
  Slides: FileText,
  Link: LinkIcon,
};
const TYPE_STYLES: Record<ContentType, string> = {
  PDF: "bg-purple-100 text-purple-600",
  Vídeo: "bg-red-100 text-red-600",
  Slides: "bg-orange-100 text-orange-600",
  Link: "bg-blue-100 text-blue-600",
};

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

export function ConteudoPage() {
  const { db } = useFirebaseAuth();
  const [queryText, setQueryText] = useState("");
  const [selectedType, setSelectedType] = useState<(typeof CONTENT_TYPES)[number]>("Todos");
  const [selectedSubject, setSelectedSubject] = useState("Todas");
  const [content, setContent] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const contentQuery = query(collection(db, "contents"), orderBy("title", "asc"));
    return onSnapshot(
      contentQuery,
      (snapshot) => {
        try {
          setContent(snapshot.docs.map((document) => parseContent(document.id, document.data())));
          setErrorMessage("");
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "Não foi possível ler os materiais.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setErrorMessage(`Não foi possível carregar os materiais: ${error.message}`);
        setLoading(false);
      },
    );
  }, [db]);

  const subjects = useMemo(() => ["Todas", ...new Set(content.map((item) => item.subject))], [content]);
  const filteredContent = useMemo(() => {
    const normalizedQuery = queryText.trim().toLocaleLowerCase("pt-BR");
    return content.filter((item) => {
      const matchesQuery = !normalizedQuery
        || [item.title, item.subject, item.author, item.description, ...item.tags]
          .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
      const matchesType = selectedType === "Todos" || item.type === selectedType;
      const matchesSubject = selectedSubject === "Todas" || item.subject === selectedSubject;
      return matchesQuery && matchesType && matchesSubject;
    });
  }, [content, queryText, selectedSubject, selectedType]);

  const featuredContent = content.find((item) => item.featured);

  return (
    <div className="flex flex-col gap-0">
      <header className="bg-white px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg text-gray-900">Conteúdo acadêmico</h1>
            <p className="text-sm text-gray-500">Materiais para apoiar seus estudos</p>
          </div>
        </div>
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            placeholder="Buscar materiais e disciplinas..."
            aria-label="Buscar materiais e disciplinas"
            className="w-full rounded-xl bg-gray-100 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </label>
      </header>

      {featuredContent && !queryText && selectedType === "Todos" && selectedSubject === "Todas" && (
        <section aria-labelledby="featured-content-title" className="mx-4 mt-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-red-600">
            <Star className="h-3.5 w-3.5 fill-red-500" aria-hidden="true" />
            Em destaque
          </div>
          <h2 id="featured-content-title" className="text-sm text-gray-900">{featuredContent.title}</h2>
          <p className="mt-1 text-xs text-gray-500">{featuredContent.subject} · {featuredContent.author}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{featuredContent.description}</p>
          {featuredContent.rating !== null && (
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {featuredContent.rating}
            </div>
          )}
        </section>
      )}

      <section className="px-4 pt-4" aria-label="Filtrar por formato">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              aria-pressed={selectedType === type}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${selectedType === type ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-2" aria-label="Filtrar por disciplina">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setSelectedSubject(subject)}
              aria-pressed={selectedSubject === subject}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${selectedSubject === subject ? "border border-red-300 bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}
            >
              {subject}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 py-3" aria-label="Materiais disponíveis">
        {!loading && !errorMessage && (
          <p className="text-xs text-gray-400" aria-live="polite">
            {filteredContent.length} material{filteredContent.length === 1 ? "" : "is"}
          </p>
        )}
        {loading && <p role="status" className="py-8 text-center text-sm text-gray-500">Carregando materiais do Firebase...</p>}
        {errorMessage && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
        {!loading && !errorMessage && filteredContent.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12">
            <BookOpen className="h-10 w-10 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-500">
              {content.length === 0 ? "Ainda não há materiais publicados." : "Nenhum conteúdo encontrado."}
            </p>
            {content.length === 0 && (
              <p className="max-w-sm text-center text-xs text-gray-400">
                Os materiais aparecem aqui quando documentos válidos são adicionados à coleção <code>contents</code> do Firestore.
              </p>
            )}
          </div>
        )}
        {!errorMessage && filteredContent.map((item) => {
          const Icon = TYPE_ICONS[item.type];
          return (
            <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TYPE_STYLES[item.type]}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-sm leading-snug text-gray-800">{item.title}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${TYPE_STYLES[item.type]}`}>{item.type}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.author} · <span className="text-red-500">{item.subject}</span></p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{tag}</span>
                    ))}
                    {item.rating !== null && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        {item.rating}
                      </span>
                    )}
                  </div>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs text-white hover:bg-red-700"
                    >
                      {item.type === "Link" || item.type === "Vídeo" ? "Abrir material" : "Baixar material"}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400">Link do material ainda não adicionado.</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
