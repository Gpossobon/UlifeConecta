import { useState } from "react";
import { HelpCircle, Search, CheckCircle, Clock, MessageCircle, Heart, ChevronRight } from "lucide-react";
import { StaticDataNotice } from "../../shared/components/static-data-notice";

const duvidas = [
  { id: 1, author: "Carlos Mendes", avatar: "C", color: "bg-red-100 text-red-600", materia: "Cálculo II", time: "15min", content: "Alguém sabe qual sala é a aula de Cálculo II hoje? O app da faculdade não está atualizando...", likes: 12, comments: 8, solved: true, tags: ["Sala", "Horário"] },
  { id: 2, author: "Lucas Prado", avatar: "L", color: "bg-blue-100 text-blue-600", materia: "Programação", time: "30min", content: "Como faço para usar ponteiros em C? Estou travado na lista 3 e não consigo entender a sintaxe...", likes: 7, comments: 14, solved: false, tags: ["Linguagem C", "Ponteiros"] },
  { id: 3, author: "Ana Beatriz", avatar: "A", color: "bg-purple-100 text-purple-600", materia: "Álgebra Linear", time: "1h", content: "Alguém tem o resumo de transformações lineares? Minha prova é amanhã e estou perdida nos autovetores.", likes: 23, comments: 5, solved: false, tags: ["Resumo", "Prova"] },
  { id: 4, author: "Rafael Torres", avatar: "R", color: "bg-green-100 text-green-600", materia: "Física III", time: "2h", content: "A aula de Física III de amanhã foi cancelada ou mudou de horário? Não recebi e-mail nenhum.", likes: 18, comments: 9, solved: true, tags: ["Horário", "Cancelamento"] },
  { id: 5, author: "Camila Souza", avatar: "C", color: "bg-yellow-100 text-yellow-600", materia: "Estatística", time: "3h", content: "Como interpretar o p-valor em testes de hipótese? Nunca consigo lembrar quando rejeitar H0.", likes: 31, comments: 11, solved: false, tags: ["Conceito", "Prova"] },
];

const materias = ["Todas", "Cálculo II", "Programação", "Álgebra Linear", "Física III", "Estatística"];

export function DuvidasPage() {
  const [search, setSearch] = useState("");
  const [materiaFiltro, setMateriaFiltro] = useState("Todas");
  const [showSolved, setShowSolved] = useState<"todas" | "abertas" | "resolvidas">("todas");

  const filtered = duvidas.filter((d) => {
    const matchSearch = d.content.toLowerCase().includes(search.toLowerCase()) || d.materia.toLowerCase().includes(search.toLowerCase());
    const matchMateria = materiaFiltro === "Todas" || d.materia === materiaFiltro;
    const matchSolved = showSolved === "todas" || (showSolved === "resolvidas" && d.solved) || (showSolved === "abertas" && !d.solved);
    return matchSearch && matchMateria && matchSolved;
  });

  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar dúvidas..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div className="flex gap-2 mb-3">
          {(["todas", "abertas", "resolvidas"] as const).map((s) => (
            <button key={s} onClick={() => setShowSolved(s)}
              className={`px-3 py-1.5 rounded-full text-xs capitalize transition-colors ${showSolved === s ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {materias.map((m) => (
            <button key={m} onClick={() => setMateriaFiltro(m)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${materiaFiltro === m ? "bg-red-100 text-red-600 border border-red-300" : "bg-gray-100 text-gray-500"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <StaticDataNotice />
      <div className="flex gap-3 px-4 py-3 bg-red-50 border-b border-red-100">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-400" /><span className="text-xs text-gray-600">{duvidas.filter((d) => !d.solved).length} abertas</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs text-gray-600">{duvidas.filter((d) => d.solved).length} resolvidas</span></div>
        <div className="flex items-center gap-1.5 ml-auto"><HelpCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-xs text-red-600">{duvidas.length} no total</span></div>
      </div>
      <div className="flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3"><HelpCircle className="w-10 h-10 text-gray-300" /><p className="text-sm text-gray-400">Nenhuma dúvida encontrada</p></div>
        ) : (
          filtered.map((d) => (
            <article key={d.id} className="bg-white border-b border-gray-100 px-4 py-4">
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${d.color}`}>{d.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-800">{d.author}</span>
                    {d.solved ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs shrink-0"><CheckCircle className="w-3 h-3" /> Resolvido</span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs shrink-0"><Clock className="w-3 h-3" /> Aberta</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <span>{d.time}</span><span>•</span><span className="text-red-500">{d.materia}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{d.content}</p>
              <div className="flex items-center gap-2 mb-3">
                {d.tags.map((tag) => <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs">#{tag}</span>)}
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                <button className="flex items-center gap-1.5 text-gray-500 text-xs"><Heart className="w-4 h-4" /> {d.likes}</button>
                <button className="flex items-center gap-1.5 text-gray-500 text-xs"><MessageCircle className="w-4 h-4" /> {d.comments} respostas</button>
                <button className="ml-auto flex items-center gap-1 text-red-600 text-xs">Responder <ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </article>
          ))
        )}
      </div>
      <div className="flex flex-col items-center py-8 gap-2">
        <div className="flex items-center gap-3 w-full max-w-xs"><div className="flex-1 h-px bg-gray-200" /><div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center"><CheckCircle className="w-3.5 h-3.5 text-red-600" /></div><div className="flex-1 h-px bg-gray-200" /></div>
        <p className="text-xs text-gray-400">Fim das dúvidas</p>
      </div>
    </div>
  );
}
