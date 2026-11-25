import { useState } from "react";
import { Users, Star, MessageCircle, Search, BookOpen, Award } from "lucide-react";
import { StaticDataNotice } from "./static-data-notice";

const veteranos = [
  { id: 1, nome: "Beatriz Lima", semestre: "7º Semestre", curso: "Eng. da Computação", avatar: "B", color: "bg-purple-100 text-purple-600", rating: 4.9, respostas: 87, materiais: 12, especialidades: ["Álgebra Linear", "Cálculo I", "Cálculo II"], online: true, destaque: true },
  { id: 2, nome: "Pedro Oliveira", semestre: "8º Semestre", curso: "Eng. da Computação", avatar: "P", color: "bg-blue-100 text-blue-600", rating: 4.7, respostas: 64, materiais: 8, especialidades: ["Programação", "Estrutura de Dados", "Banco de Dados"], online: true, destaque: false },
  { id: 3, nome: "Carla Nunes", semestre: "6º Semestre", curso: "Matemática Aplicada", avatar: "C", color: "bg-red-100 text-red-600", rating: 4.8, respostas: 73, materiais: 15, especialidades: ["Estatística", "Cálculo III", "Álgebra Linear"], online: false, destaque: false },
  { id: 4, nome: "João Alves", semestre: "9º Semestre", curso: "Eng. da Computação", avatar: "J", color: "bg-green-100 text-green-600", rating: 4.6, respostas: 51, materiais: 6, especialidades: ["Física I", "Física II", "Física III"], online: false, destaque: false },
  { id: 5, nome: "Fernanda Costa", semestre: "7º Semestre", curso: "Ciência da Computação", avatar: "F", color: "bg-orange-100 text-orange-600", rating: 4.9, respostas: 92, materiais: 20, especialidades: ["Programação", "Algoritmos", "Inteligência Artificial"], online: true, destaque: false },
];

const especialidades = ["Todas", "Programação", "Cálculo", "Álgebra Linear", "Física", "Estatística"];

export function VeteranosPage() {
  const [search, setSearch] = useState("");
  const [apenasOnline, setApenasOnline] = useState(false);
  const [especialidade, setEspecialidade] = useState("Todas");

  const filtered = veteranos.filter((veterano) => {
    const matchSearch = veterano.nome.toLowerCase().includes(search.toLowerCase())
      || veterano.especialidades.some((item) => item.toLowerCase().includes(search.toLowerCase()));
    const matchOnline = !apenasOnline || veterano.online;
    const matchEspecialidade = especialidade === "Todas"
      || veterano.especialidades.some((item) => item.toLowerCase().includes(especialidade.toLowerCase()));
    return matchSearch && matchOnline && matchEspecialidade;
  });

  const online = veteranos.filter((veterano) => veterano.online).length;
  const respostas = veteranos.reduce((total, veterano) => total + veterano.respostas, 0);

  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar veterano ou matéria..."
            aria-label="Buscar veterano ou matéria"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {especialidades.map((item) => (
            <button
              key={item}
              onClick={() => setEspecialidade(item)}
              aria-pressed={especialidade === item}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${especialidade === item ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          onClick={() => setApenasOnline(!apenasOnline)}
          aria-pressed={apenasOnline}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors ${apenasOnline ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-600"}`}
        >
          <div className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
          Apenas online ({online})
        </button>
      </div>

      <StaticDataNotice />

      <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl text-white">
        <p className="text-xs opacity-80 mb-1">Comunidade de veteranos</p>
        <div className="flex items-end gap-1">
          <span className="text-2xl">{veteranos.length}</span>
          <span className="text-sm opacity-80 mb-0.5">veteranos ativos</span>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
            <span className="text-xs opacity-90">{online} online agora</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
            <span className="text-xs opacity-90">{respostas} respostas</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Users className="w-10 h-10 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-400">Nenhum veterano encontrado</p>
          </div>
        ) : (
          filtered.map((veterano) => (
            <div key={veterano.id} className={`bg-white border rounded-2xl p-4 ${veterano.destaque ? "border-red-300 shadow-sm" : "border-gray-200"}`}>
              {veterano.destaque && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Award className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
                  <span className="text-xs text-red-500">Veterano Destaque</span>
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${veterano.color}`} aria-hidden="true">
                    {veterano.avatar}
                  </div>
                  {veterano.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" aria-label="Online" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{veterano.nome}</p>
                  <p className="text-xs text-gray-500">{veterano.semestre} · {veterano.curso}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span className="text-xs text-gray-700">{veterano.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">· {veterano.respostas} respostas</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Chamar ${veterano.nome}`}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs shrink-0"
                >
                  Chamar
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {veterano.especialidades.map((item) => (
                  <span key={item} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">{item}</span>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MessageCircle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                  {veterano.respostas} respondidas
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <BookOpen className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                  {veterano.materiais} materiais
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col items-center py-6 gap-2">
        <div className="flex items-center gap-3 w-full max-w-xs px-8">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <p className="text-xs text-gray-400">Todos os veteranos exibidos</p>
      </div>
    </div>
  );
}
