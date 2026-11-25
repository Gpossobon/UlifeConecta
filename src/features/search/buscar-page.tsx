import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Search, X, Clock, HelpCircle, BookOpen, MapPin, Users,
  MessageCircle, ChevronRight, TrendingUp, Hash,
} from "lucide-react";

type PostResultData = {
  id: string;
  type: "post";
  category: string;
  icon: string;
  title: string;
  author: string;
  time: string;
};

type MaterialResultData = {
  id: string;
  type: "material";
  title: string;
  subject: string;
  fileType: string;
};

type VeteranResultData = {
  id: string;
  type: "veteran";
  name: string;
  course: string;
  semester: string;
  skills: string[];
};

type RoomResultData = {
  id: string;
  type: "room";
  name: string;
  block: string;
  free: boolean;
  until: string | null;
};

type SearchResult = PostResultData | MaterialResultData | VeteranResultData | RoomResultData;

const POSTS: PostResultData[] = [
  { id: "p1", type: "post", category: "Dúvida", icon: "HelpCircle", title: "Alguém sabe qual sala é a aula de Cálculo II hoje?", author: "Carlos Mendes", time: "15min" },
  { id: "p2", type: "post", category: "Material", icon: "BookOpen", title: "Resumo completo de Álgebra Linear — P1", author: "Beatriz Lima (Veterana)", time: "1h" },
  { id: "p3", type: "post", category: "Horário", icon: "Clock", title: "ATENÇÃO: Aula de Física III amanhã às 10h ao invés de 8h", author: "Mariana Santos", time: "2h" },
  { id: "p4", type: "post", category: "Sala", icon: "MapPin", title: "Sala C-105 mudou para Bloco D — galera do 3º período", author: "Pedro Oliveira", time: "3h" },
  { id: "p5", type: "post", category: "Grupo", icon: "Users", title: "Montando grupo de estudos para a prova de Programação", author: "Julia Ferreira", time: "5h" },
];

const MATERIALS: MaterialResultData[] = [
  { id: "m1", type: "material", title: "Resumo Completo – Álgebra Linear", subject: "Álgebra Linear", fileType: "PDF" },
  { id: "m2", type: "material", title: "Lista Resolvida – Cálculo II (Integrais)", subject: "Cálculo II", fileType: "PDF" },
  { id: "m3", type: "material", title: "Videoaula – Ponteiros em C do zero", subject: "Programação", fileType: "Vídeo" },
  { id: "m4", type: "material", title: "Slides – Ondas e Oscilações (Física III)", subject: "Física III", fileType: "Slides" },
  { id: "m5", type: "material", title: "Canal de Estatística no YouTube", subject: "Estatística", fileType: "Link" },
];

const VETERANS: VeteranResultData[] = [
  { id: "v1", type: "veteran", name: "Beatriz Lima", course: "Eng. Computação", semester: "7º", skills: ["Álgebra Linear", "Cálculo II"] },
  { id: "v2", type: "veteran", name: "Pedro Oliveira", course: "Eng. Computação", semester: "8º", skills: ["Programação", "Estrutura de Dados"] },
  { id: "v3", type: "veteran", name: "Carla Nunes", course: "Mat. Aplicada", semester: "6º", skills: ["Estatística", "Cálculo III"] },
  { id: "v4", type: "veteran", name: "Fernanda Costa", course: "Ciência da Comp.", semester: "7º", skills: ["Algoritmos", "Inteligência Artificial"] },
];

const ROOMS: RoomResultData[] = [
  { id: "r1", type: "room", name: "Sala A-101", block: "Bloco A", free: false, until: "09:40" },
  { id: "r2", type: "room", name: "Sala B-203", block: "Bloco B", free: false, until: "09:40" },
  { id: "r3", type: "room", name: "Laboratório 02", block: "Laboratórios", free: true, until: null },
  { id: "r4", type: "room", name: "Sala B-301", block: "Bloco B", free: true, until: null },
];

const TRENDING = ["Cálculo II", "Álgebra Linear", "Sala B-203", "Física III", "Ponteiros C", "Prova P1"];
const RECENT_DEFAULT = ["Cálculo II", "sala B-203", "veteranos Programação"];
const ICON_MAP = { HelpCircle, BookOpen, MapPin, Users, MessageCircle, Clock };

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matches(item: SearchResult, query: string) {
  const fields = item.type === "post"
    ? [item.title, item.category, item.author, item.time]
    : item.type === "material"
      ? [item.title, item.subject, item.fileType]
      : item.type === "veteran"
        ? [item.name, item.course, item.semester, ...item.skills]
        : [item.name, item.block, item.free ? "Livre" : item.until ?? ""];

  return normalize(fields.join(" ")).includes(normalize(query));
}

function search(query: string): SearchResult[] {
  if (!query.trim()) return [];
  return [
    ...POSTS.filter((item) => matches(item, query)),
    ...MATERIALS.filter((item) => matches(item, query)),
    ...VETERANS.filter((item) => matches(item, query)),
    ...ROOMS.filter((item) => matches(item, query)),
  ];
}

function PostResult({ item }: { item: PostResultData }) {
  const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? MessageCircle;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-red-500" aria-hidden="true" /></div>
      <div className="flex-1 min-w-0"><p className="text-sm text-gray-800 leading-snug truncate">{item.title}</p><p className="text-xs text-gray-400 mt-0.5">{item.author} · {item.time}</p></div>
      <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-xs shrink-0">{item.category}</span>
    </div>
  );
}

function MaterialResult({ item }: { item: MaterialResultData }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4 text-blue-500" aria-hidden="true" /></div>
      <div className="flex-1 min-w-0"><p className="text-sm text-gray-800 leading-snug truncate">{item.title}</p><p className="text-xs text-gray-400 mt-0.5">{item.subject}</p></div>
      <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-xs shrink-0">{item.fileType}</span>
    </div>
  );
}

function VeteranResult({ item }: { item: VeteranResultData }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-600 text-sm" aria-hidden="true">{item.name.charAt(0)}</div>
      <div className="flex-1 min-w-0"><p className="text-sm text-gray-800">{item.name}</p><p className="text-xs text-gray-400 mt-0.5">{item.course} · {item.semester} sem.</p></div>
      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs shrink-0">Veterano</span>
    </div>
  );
}

function RoomResult({ item }: { item: RoomResultData }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-green-500" aria-hidden="true" /></div>
      <div className="flex-1 min-w-0"><p className="text-sm text-gray-800">{item.name}</p><p className="text-xs text-gray-400 mt-0.5">{item.block}</p></div>
      <span className={`px-2 py-0.5 rounded-full text-xs shrink-0 ${item.free ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-500"}`}>
        {item.free ? "Livre" : `Até ${item.until}`}
      </span>
    </div>
  );
}

function Section({ title, count, icon: Icon, children }: { title: string; count: number; icon: typeof Search; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        <p className="text-xs text-gray-500">{title}</p>
        <span className="ml-auto text-xs text-gray-400">{count}</span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 px-3">{children}</div>
    </div>
  );
}

export function BuscarPage() {
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<string[]>(RECENT_DEFAULT);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.clearTimeout(timer);
  }, []);

  const results = search(query);
  const postResults = results.filter((item): item is PostResultData => item.type === "post");
  const materialResults = results.filter((item): item is MaterialResultData => item.type === "material");
  const veteranResults = results.filter((item): item is VeteranResultData => item.type === "veteran");
  const roomResults = results.filter((item): item is RoomResultData => item.type === "room");
  const isSearching = query.trim().length > 0;

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;
    setRecents((previous) => [value, ...previous.filter((recent) => recent !== value)].slice(0, 5));
    setQuery(value);
  };

  const removeRecent = (value: string) => setRecents((previous) => previous.filter((recent) => recent !== value));

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSubmit(query)}
            placeholder="Buscar posts, materiais, veteranos, salas..."
            aria-label="Buscar posts, materiais, veteranos ou salas"
            className="w-full pl-9 pr-10 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
          {query.length > 0 && (
            <button onClick={() => setQuery("")} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {!isSearching && (
        <div className="px-4 py-4 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-red-500" aria-hidden="true" />
              <p className="text-sm text-gray-700">Em alta agora</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map((term) => (
                <button key={term} onClick={() => handleSubmit(term)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-xs text-red-600 hover:bg-red-100 transition">
                  <Hash className="w-3 h-3" aria-hidden="true" /> {term}
                </button>
              ))}
            </div>
          </div>

          {recents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  <p className="text-sm text-gray-700">Buscas recentes</p>
                </div>
                <button onClick={() => setRecents([])} className="text-xs text-gray-400 hover:text-red-500 transition">Limpar</button>
              </div>
              <div className="flex flex-col divide-y divide-gray-100">
                {recents.map((recent) => (
                  <div key={recent} className="flex items-center justify-between py-2.5">
                    <button onClick={() => handleSubmit(recent)} className="flex items-center gap-3 flex-1 text-left">
                      <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" aria-hidden="true" />
                      <span className="text-sm text-gray-600">{recent}</span>
                    </button>
                    <button onClick={() => removeRecent(recent)} aria-label={`Remover busca recente ${recent}`}>
                      <X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-700 mb-3">Explorar por categoria</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Dúvidas", icon: HelpCircle, color: "bg-red-50 border-red-100 text-red-600", q: "Dúvida" },
                { label: "Materiais", icon: BookOpen, color: "bg-blue-50 border-blue-100 text-blue-600", q: "Material" },
                { label: "Horários", icon: Clock, color: "bg-orange-50 border-orange-100 text-orange-600", q: "Horário" },
                { label: "Salas", icon: MapPin, color: "bg-green-50 border-green-100 text-green-600", q: "Sala" },
              ].map(({ label, icon: Icon, color, q }) => (
                <button key={label} onClick={() => handleSubmit(q)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border ${color} hover:opacity-80 transition`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm">{label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-50" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isSearching && results.length > 0 && (
        <div className="px-4 py-4 flex flex-col gap-5">
          <p className="text-xs text-gray-400">
            {results.length} resultado{results.length !== 1 ? "s" : ""} para{" "}
            <span className="text-gray-700">"{query}"</span>
          </p>
          {postResults.length > 0 && <Section title="Publicações" count={postResults.length} icon={MessageCircle}>{postResults.map((item) => <PostResult key={item.id} item={item} />)}</Section>}
          {materialResults.length > 0 && <Section title="Materiais" count={materialResults.length} icon={BookOpen}>{materialResults.map((item) => <MaterialResult key={item.id} item={item} />)}</Section>}
          {veteranResults.length > 0 && <Section title="Veteranos" count={veteranResults.length} icon={Users}>{veteranResults.map((item) => <VeteranResult key={item.id} item={item} />)}</Section>}
          {roomResults.length > 0 && <Section title="Salas" count={roomResults.length} icon={MapPin}>{roomResults.map((item) => <RoomResult key={item.id} item={item} />)}</Section>}
        </div>
      )}

      {isSearching && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="w-7 h-7 text-gray-300" aria-hidden="true" />
          </div>
          <p className="text-gray-500 text-center">Nenhum resultado para <span className="text-gray-800">"{query}"</span></p>
          <p className="text-sm text-gray-400 text-center">Tente palavras como "Cálculo", "sala B-203" ou o nome de um veterano.</p>
          <button onClick={() => setQuery("")}
            className="mt-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm text-gray-600 hover:border-red-400 hover:text-red-600 transition">
            Limpar busca
          </button>
        </div>
      )}
    </div>
  );
}
