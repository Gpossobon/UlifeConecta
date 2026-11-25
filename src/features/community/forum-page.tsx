import { useState } from "react";
import { MessageCircle, Search, TrendingUp, Heart, Eye, ChevronRight, Pin, Clock, Hash } from "lucide-react";
import { StaticDataNotice } from "../../shared/components/static-data-notice";

type Topic = {
  id: number;
  titulo: string;
  descricao: string;
  autor: string;
  avatar: string;
  color: string;
  categoria: string;
  catCor: string;
  respostas: number;
  views: number;
  likes: number;
  pinned: boolean;
  hot: boolean;
  ultimaAtividade: string;
};

const topicos: Topic[] = [
  { id: 1, titulo: "📢 Bem-vindos ao Fórum UlifeConecta!", descricao: "Espaço oficial para discussões gerais da comunidade acadêmica.", autor: "Admin UlifeConecta", avatar: "A", color: "bg-red-100 text-red-600", categoria: "Geral", catCor: "bg-red-100 text-red-600", respostas: 34, views: 892, likes: 76, pinned: true, hot: false, ultimaAtividade: "2h" },
  { id: 2, titulo: "Qual é a melhor estratégia para a P1 de Cálculo?", descricao: "Vamos trocar dicas de como estudar e quais exercícios priorizar.", autor: "Carlos Mendes", avatar: "C", color: "bg-orange-100 text-orange-600", categoria: "Estratégia", catCor: "bg-orange-100 text-orange-600", respostas: 21, views: 445, likes: 38, pinned: false, hot: true, ultimaAtividade: "30min" },
  { id: 3, titulo: "Grupo de Estudos – Programação (semana das provas)", descricao: "Montando grupo para estudar listas e provas antigas. Quem topa?", autor: "Julia Ferreira", avatar: "J", color: "bg-green-100 text-green-600", categoria: "Grupo de Estudo", catCor: "bg-green-100 text-green-600", respostas: 15, views: 312, likes: 29, pinned: false, hot: true, ultimaAtividade: "1h" },
  { id: 4, titulo: "Avaliação do RU esta semana – o que acharam?", descricao: "Discussão sobre o cardápio e qualidade das refeições.", autor: "Mariana Santos", avatar: "M", color: "bg-blue-100 text-blue-600", categoria: "Campus", catCor: "bg-blue-100 text-blue-600", respostas: 42, views: 678, likes: 55, pinned: false, hot: false, ultimaAtividade: "3h" },
  { id: 5, titulo: "Dicas de extensão para VSCode – compartilhe as suas!", descricao: "Thread colaborativa com extensões úteis para programação.", autor: "Pedro Oliveira (Veterano)", avatar: "P", color: "bg-purple-100 text-purple-600", categoria: "Tecnologia", catCor: "bg-purple-100 text-purple-600", respostas: 27, views: 534, likes: 61, pinned: false, hot: false, ultimaAtividade: "5h" },
  { id: 6, titulo: "Calendário acadêmico 2026/2 – datas importantes", descricao: "Compilado com provas, feriados e prazos do semestre.", autor: "Beatriz Lima (Veterana)", avatar: "B", color: "bg-pink-100 text-pink-600", categoria: "Informativo", catCor: "bg-pink-100 text-pink-600", respostas: 8, views: 921, likes: 88, pinned: false, hot: false, ultimaAtividade: "1d" },
];

const categorias = ["Todas", "Geral", "Estratégia", "Grupo de Estudo", "Campus", "Tecnologia", "Informativo"];

export function ForumPage() {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todas");
  const [ordenar, setOrdenar] = useState<"recente" | "popular">("recente");

  let filtered = topicos.filter((topico) => {
    const matchSearch = topico.titulo.toLowerCase().includes(search.toLowerCase())
      || topico.descricao.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoria === "Todas" || topico.categoria === categoria;
    return matchSearch && matchCategory;
  });

  if (ordenar === "popular") filtered = [...filtered].sort((a, b) => b.likes - a.likes);

  const pinnedTopics = filtered.filter((topico) => topico.pinned);
  const normalTopics = filtered.filter((topico) => !topico.pinned);
  const totalReplies = topicos.reduce((total, topico) => total + topico.respostas, 0);
  const totalViews = topicos.reduce((total, topico) => total + topico.views, 0);

  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar tópicos..."
            aria-label="Buscar tópicos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setOrdenar("recente")}
            aria-pressed={ordenar === "recente"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${ordenar === "recente" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" /> Recentes
          </button>
          <button
            onClick={() => setOrdenar("popular")}
            aria-pressed={ordenar === "popular"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors ${ordenar === "popular" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> Populares
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categorias.map((item) => (
            <button
              key={item}
              onClick={() => setCategoria(item)}
              aria-pressed={categoria === item}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${categoria === item ? "bg-red-100 text-red-600 border border-red-300" : "bg-gray-100 text-gray-500"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><Hash className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />{topicos.length} tópicos</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><MessageCircle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />{totalReplies} respostas</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><Eye className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />{totalViews} visualizações</div>
      </div>

      <StaticDataNotice />

      <div className="flex flex-col px-4 pt-4 pb-4 gap-3">
        {pinnedTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pin className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
              <span className="text-xs text-gray-500">Fixado</span>
            </div>
            {pinnedTopics.map((topic) => <TopicCard key={topic.id} topico={topic} />)}
          </div>
        )}
        {normalTopics.length === 0 && pinnedTopics.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <MessageCircle className="w-10 h-10 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-400">Nenhum tópico encontrado</p>
          </div>
        ) : (
          normalTopics.map((topic) => <TopicCard key={topic.id} topico={topic} />)
        )}
      </div>

      <div className="flex flex-col items-center py-6 gap-2">
        <div className="flex items-center gap-3 w-full max-w-xs px-8">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <p className="text-xs text-gray-400">Fim do fórum</p>
      </div>
    </div>
  );
}

function TopicCard({ topico }: { topico: Topic }) {
  return (
    <div className={`bg-white border rounded-xl p-3 mb-3 ${topico.pinned ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            {topico.pinned && <Pin className="w-3.5 h-3.5 text-red-400 shrink-0" aria-hidden="true" />}
            {topico.hot && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
                <TrendingUp className="w-3 h-3" aria-hidden="true" /> Em alta
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs ${topico.catCor}`}>{topico.categoria}</span>
          </div>
          <p className="text-sm text-gray-800 leading-snug">{topico.titulo}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" aria-hidden="true" />
      </div>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{topico.descricao}</p>
      <div className="flex items-center gap-1.5 mb-3">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${topico.color}`} aria-hidden="true">{topico.avatar}</div>
        <span className="text-xs text-gray-500">{topico.autor}</span>
        <span className="text-xs text-gray-500 ml-1">· {topico.ultimaAtividade}</span>
      </div>
      <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />{topico.respostas}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><Eye className="w-3.5 h-3.5" aria-hidden="true" />{topico.views}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><Heart className="w-3.5 h-3.5" aria-hidden="true" />{topico.likes}</div>
        <button type="button" className="ml-auto text-xs text-red-600">Ver tópico</button>
      </div>
    </div>
  );
}
