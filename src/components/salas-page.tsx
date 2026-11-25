import { useState } from "react";
import { MapPin, Search, Users, Wifi, Monitor, CheckCircle, XCircle, Info } from "lucide-react";
import { StaticDataNotice } from "./static-data-notice";

type Resource = "wifi" | "projetor" | "computadores" | "ar";

type Room = {
  id: string;
  nome: string;
  capacidade: number;
  livre: boolean;
  aula: string | null;
  fim: string | null;
  recursos: Resource[];
  obs?: string;
};

type Block = {
  id: string;
  nome: string;
  cor: string;
  salas: Room[];
};

const blocos: Block[] = [
  {
    id: "A",
    nome: "Bloco A",
    cor: "bg-blue-500",
    salas: [
      { id: "A-101", nome: "Sala A-101", capacidade: 40, livre: false, aula: "Álgebra Linear", fim: "09:40", recursos: ["wifi", "projetor"] },
      { id: "A-102", nome: "Sala A-102", capacidade: 35, livre: true, aula: null, fim: null, recursos: ["wifi"] },
      { id: "A-203", nome: "Sala A-203", capacidade: 50, livre: true, aula: null, fim: null, recursos: ["wifi", "projetor", "ar"] },
    ],
  },
  {
    id: "B",
    nome: "Bloco B",
    cor: "bg-red-500",
    salas: [
      { id: "B-105", nome: "Sala B-105", capacidade: 45, livre: false, aula: "Física III", fim: "11:40", recursos: ["wifi", "projetor", "ar"] },
      { id: "B-203", nome: "Sala B-203", capacidade: 40, livre: false, aula: "Cálculo II", fim: "09:40", recursos: ["wifi", "projetor"] },
      { id: "B-301", nome: "Sala B-301", capacidade: 60, livre: true, aula: null, fim: null, recursos: ["wifi", "projetor", "ar"] },
    ],
  },
  {
    id: "C",
    nome: "Bloco C",
    cor: "bg-green-500",
    salas: [
      { id: "C-105", nome: "Sala C-105 → Bloco D", capacidade: 30, livre: true, aula: null, fim: null, recursos: ["wifi"], obs: "Sala transferida para Bloco D-105" },
      { id: "C-302", nome: "Sala C-302", capacidade: 35, livre: false, aula: "Estatística", fim: "14:40", recursos: ["wifi", "projetor"] },
    ],
  },
  {
    id: "LAB",
    nome: "Laboratórios",
    cor: "bg-purple-500",
    salas: [
      { id: "Lab-01", nome: "Laboratório 01", capacidade: 30, livre: false, aula: "Programação", fim: "11:40", recursos: ["wifi", "computadores"] },
      { id: "Lab-02", nome: "Laboratório 02", capacidade: 30, livre: true, aula: null, fim: null, recursos: ["wifi", "computadores"] },
    ],
  },
];

export function SalasPage() {
  const [search, setSearch] = useState("");
  const [blocoAtivo, setBlocoAtivo] = useState<string | null>(null);
  const [apenasLivres, setApenasLivres] = useState(false);

  const getRecursoIcon = (recurso: Resource) => {
    if (recurso === "wifi") return <Wifi className="w-3.5 h-3.5" />;
    if (recurso === "ar") return <span className="text-xs">❄</span>;
    return <Monitor className="w-3.5 h-3.5" />;
  };

  const blocosFiltrados = blocos
    .filter((bloco) => !blocoAtivo || bloco.id === blocoAtivo)
    .map((bloco) => ({
      ...bloco,
      salas: bloco.salas.filter((sala) => {
        const matchSearch = sala.nome.toLowerCase().includes(search.toLowerCase())
          || sala.id.toLowerCase().includes(search.toLowerCase());
        const matchLivre = !apenasLivres || sala.livre;
        return matchSearch && matchLivre;
      }),
    }))
    .filter((bloco) => bloco.salas.length > 0);

  const totalLivres = blocos.flatMap((bloco) => bloco.salas).filter((sala) => sala.livre).length;
  const totalSalas = blocos.flatMap((bloco) => bloco.salas).length;

  return (
    <div className="flex flex-col gap-0">
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar sala..."
            aria-label="Buscar sala"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          <button
            onClick={() => setBlocoAtivo(null)}
            aria-pressed={!blocoAtivo}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${!blocoAtivo ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            Todos
          </button>
          {blocos.map((bloco) => (
            <button
              key={bloco.id}
              onClick={() => setBlocoAtivo(bloco.id === blocoAtivo ? null : bloco.id)}
              aria-pressed={blocoAtivo === bloco.id}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${blocoAtivo === bloco.id ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {bloco.nome}
            </button>
          ))}
        </div>
        <button
          onClick={() => setApenasLivres(!apenasLivres)}
          aria-pressed={apenasLivres}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors ${apenasLivres ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-100 text-gray-600"}`}
        >
          <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          Apenas salas livres
        </button>
      </div>

      <StaticDataNotice />

      <div className="flex gap-4 px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">{totalLivres} livres</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-600">{totalSalas - totalLivres} em uso</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">{totalSalas} salas no total</div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-5">
        {blocosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <MapPin className="w-10 h-10 text-gray-300" aria-hidden="true" />
            <p className="text-sm text-gray-400">Nenhuma sala encontrada</p>
          </div>
        ) : (
          blocosFiltrados.map((bloco) => (
            <div key={bloco.id}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${bloco.cor}`} />
                <p className="text-sm text-gray-700">{bloco.nome}</p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="flex flex-col gap-2">
                {bloco.salas.map((sala) => (
                  <div
                    key={sala.id}
                    className={`bg-white border rounded-xl p-3 ${sala.livre ? "border-green-200" : "border-gray-200"}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm text-gray-800">{sala.nome}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Users className="w-3 h-3 text-gray-400" aria-hidden="true" />
                          <span className="text-xs text-gray-500">{sala.capacidade} lugares</span>
                        </div>
                      </div>
                      {sala.livre ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs shrink-0">
                          <CheckCircle className="w-3 h-3" aria-hidden="true" /> Livre
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs shrink-0">
                          <XCircle className="w-3 h-3" aria-hidden="true" /> Em uso
                        </span>
                      )}
                    </div>
                    {sala.aula && (
                      <p className="text-xs text-gray-500 mb-2">
                        <span className="text-gray-700">{sala.aula}</span> · até {sala.fim}
                      </p>
                    )}
                    {sala.obs && (
                      <div className="flex items-start gap-1.5 mb-2 p-2 bg-amber-50 rounded-lg">
                        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-xs text-amber-700">{sala.obs}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {sala.recursos.map((recurso) => (
                        <span key={recurso} className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs">
                          {getRecursoIcon(recurso)} {recurso}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col items-center py-6 gap-2">
        <div className="flex items-center gap-3 w-full max-w-xs px-8">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <p className="text-xs text-gray-400">Todas as salas exibidas</p>
      </div>
    </div>
  );
}
