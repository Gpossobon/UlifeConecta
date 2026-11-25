import { useState } from "react";
import { BookOpen, Download, Star, Search, FileText, Video, Link as LinkIcon, Eye } from "lucide-react";
import { StaticDataNotice } from "./static-data-notice";

function ImageWithFallback(props: any) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;
  return didError ? (
    <div className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`} style={style}>
      <div className="flex items-center justify-center w-full h-full"><BookOpen className="w-8 h-8 text-gray-300" /></div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={() => setDidError(true)} />
  );
}

const materiais = [
  { id: 1, titulo: "Resumo Completo – Álgebra Linear", autor: "Beatriz Lima (Veterana)", avatar: "B", color: "bg-purple-100 text-purple-600", materia: "Álgebra Linear", tipo: "PDF", tipoIcon: "file", downloads: 142, views: 389, rating: 4.9, image: "https://images.unsplash.com/photo-1693921398753-c5d114e8ae6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeSUyMG1hdGVyaWFsJTIwdGV4dGJvb2slMjB1bml2ZXJzaXR5fGVufDF8fHx8MTc5NTU2NjE4Mnww&ixlib=rb-4.1.0&q=80&w=1080", tags: ["Resumo", "P1", "P2"], destaque: true },
  { id: 2, titulo: "Lista Resolvida – Cálculo II (Integrais)", autor: "Pedro Oliveira (Veterano)", avatar: "P", color: "bg-blue-100 text-blue-600", materia: "Cálculo II", tipo: "PDF", tipoIcon: "file", downloads: 98, views: 251, rating: 4.7, image: "https://images.unsplash.com/photo-1676302447092-14a103558511?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxjdWx1cyUyMG1hdGglMjBub3RlcyUyMHN0dWR5fGVufDF8fHx8MTc5NTU2NjE4Nnww&ixlib=rb-4.1.0&q=80&w=1080", tags: ["Lista", "Exercícios"], destaque: false },
  { id: 3, titulo: "Videoaula – Ponteiros em C explicado do zero", autor: "João Alves", avatar: "J", color: "bg-green-100 text-green-600", materia: "Programação", tipo: "Vídeo", tipoIcon: "video", downloads: 0, views: 512, rating: 4.8, image: null, tags: ["Vídeo", "Iniciante"], destaque: false },
  { id: 4, titulo: "Slides – Ondas e Oscilações (Física III)", autor: "Mariana Santos", avatar: "M", color: "bg-orange-100 text-orange-600", materia: "Física III", tipo: "Slides", tipoIcon: "file", downloads: 76, views: 198, rating: 4.5, image: null, tags: ["Slides", "Prova"], destaque: false },
  { id: 5, titulo: "Link – Canal de Estatística no YouTube", autor: "Carla Nunes", avatar: "C", color: "bg-red-100 text-red-600", materia: "Estatística", tipo: "Link", tipoIcon: "link", downloads: 0, views: 134, rating: 4.6, image: null, tags: ["Externo", "Vídeos"], destaque: false },
];

const disciplinas = ["Todas", "Álgebra Linear", "Cálculo II", "Programação", "Física III", "Estatística"];
const tipos = ["Todos", "PDF", "Vídeo", "Slides", "Link"];

export function MaterialPage() {
  const [search, setSearch] = useState("");
  const [disciplina, setDisciplina] = useState("Todas");
  const [tipo, setTipo] = useState("Todos");

  const filtered = materiais.filter((m) => {
    const matchSearch = m.titulo.toLowerCase().includes(search.toLowerCase()) || m.materia.toLowerCase().includes(search.toLowerCase());
    const matchDisciplina = disciplina === "Todas" || m.materia === disciplina;
    const matchTipo = tipo === "Todos" || m.tipo === tipo;
    return matchSearch && matchDisciplina && matchTipo;
  });

  const getTipoIcon = (tipoIcon: string) => {
    if (tipoIcon === "video") return <Video className="w-4 h-4" />;
    if (tipoIcon === "link") return <LinkIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getTipoBg = (t: string) => {
    if (t === "Vídeo") return "bg-red-100 text-red-600";
    if (t === "Link") return "bg-blue-100 text-blue-600";
    if (t === "Slides") return "bg-orange-100 text-orange-600";
    return "bg-purple-100 text-purple-600";
  };

  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Buscar materiais..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {tipos.map((t) => <button key={t} onClick={() => setTipo(t)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${tipo === t ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>{t}</button>)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {disciplinas.map((d) => <button key={d} onClick={() => setDisciplina(d)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${disciplina === d ? "bg-red-100 text-red-600 border border-red-300" : "bg-gray-100 text-gray-500"}`}>{d}</button>)}
        </div>
      </div>
      <StaticDataNotice />
      {disciplina === "Todas" && tipo === "Todos" && search === "" && (
        <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-white border-b border-gray-100">
          <p className="text-xs text-red-500 mb-2 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-red-500" /> Em destaque</p>
          {materiais.filter((m) => m.destaque).map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-red-200 overflow-hidden shadow-sm">
              {m.image && <ImageWithFallback src={m.image} alt={m.titulo} className="w-full h-32 object-cover" />}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm text-gray-800 leading-snug">{m.titulo}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 shrink-0 ${getTipoBg(m.tipo)}`}>{getTipoIcon(m.tipoIcon)} {m.tipo}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{m.autor} · {m.materia}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {m.rating}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {m.views}</span>
                  {m.downloads > 0 && <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {m.downloads}</span>}
                  <button className="ml-auto px-3 py-1 bg-red-600 text-white rounded-full text-xs">{m.tipo === "Link" ? "Acessar" : "Baixar"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col px-4 py-3 gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3"><BookOpen className="w-10 h-10 text-gray-300" /><p className="text-sm text-gray-400">Nenhum material encontrado</p></div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getTipoBg(m.tipo)}`}>{getTipoIcon(m.tipoIcon)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug mb-0.5">{m.titulo}</p>
                <p className="text-xs text-gray-500 mb-1.5">{m.autor} · <span className="text-red-500">{m.materia}</span></p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {m.rating}</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {m.views}</span>
                  {m.downloads > 0 && <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {m.downloads}</span>}
                </div>
              </div>
              <button className="px-2.5 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs shrink-0">{m.tipo === "Link" ? "Ir" : "Baixar"}</button>
            </div>
          ))
        )}
      </div>
      <div className="flex flex-col items-center py-8 gap-2">
        <div className="flex items-center gap-3 w-full max-w-xs px-8"><div className="flex-1 h-px bg-gray-200" /><div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 text-red-600" /></div><div className="flex-1 h-px bg-gray-200" /></div>
        <p className="text-xs text-gray-400">Fim dos materiais</p>
      </div>
    </div>
  );
}
