import { useState } from "react";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { StaticDataNotice } from "./static-data-notice";

const dias = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const semanaAtual = ["25 Nov", "26 Nov", "27 Nov", "28 Nov", "29 Nov"];
const hoje = new Date().getDay();
const diaAtualIndex = hoje >= 1 && hoje <= 5 ? hoje - 1 : 0;

const aulas = [
  { id: 1, dia: 0, hora: "08:00", fim: "09:40", materia: "Cálculo II", professor: "Prof. Rodrigues", sala: "B-203", cor: "bg-red-500", alterado: true, obs: "Hoje na sala B-203 (mudança)" },
  { id: 2, dia: 0, hora: "10:00", fim: "11:40", materia: "Programação", professor: "Prof. Almeida", sala: "Lab-01", cor: "bg-blue-500", alterado: false, obs: null },
  { id: 3, dia: 1, hora: "08:00", fim: "09:40", materia: "Álgebra Linear", professor: "Prof. Costa", sala: "A-101", cor: "bg-purple-500", alterado: false, obs: null },
  { id: 4, dia: 1, hora: "13:00", fim: "14:40", materia: "Física III", professor: "Prof. Mendes", sala: "B-105", cor: "bg-orange-500", alterado: true, obs: "Aula às 10h hoje (adiantada)" },
  { id: 5, dia: 2, hora: "10:00", fim: "11:40", materia: "Cálculo II", professor: "Prof. Rodrigues", sala: "B-203", cor: "bg-red-500", alterado: false, obs: null },
  { id: 6, dia: 2, hora: "14:00", fim: "15:40", materia: "Estatística", professor: "Prof. Lima", sala: "C-302", cor: "bg-green-500", alterado: false, obs: null },
  { id: 7, dia: 3, hora: "08:00", fim: "09:40", materia: "Programação", professor: "Prof. Almeida", sala: "Lab-01", cor: "bg-blue-500", alterado: false, obs: null },
  { id: 8, dia: 3, hora: "10:00", fim: "11:40", materia: "Física III", professor: "Prof. Mendes", sala: "B-105", cor: "bg-orange-500", alterado: false, obs: null },
  { id: 9, dia: 4, hora: "13:00", fim: "14:40", materia: "Álgebra Linear", professor: "Prof. Costa", sala: "A-101", cor: "bg-purple-500", alterado: false, obs: null },
  { id: 10, dia: 4, hora: "15:00", fim: "16:40", materia: "Estatística", professor: "Prof. Lima", sala: "C-302", cor: "bg-green-500", alterado: false, obs: null },
];

export function HorariosPage() {
  const [diaAtivo, setDiaAtivo] = useState(diaAtualIndex);
  const [visualizacao, setVisualizacao] = useState<"dia" | "semana">("dia");
  const aulasDoDia = aulas.filter((a) => a.dia === diaAtivo);
  const alteradas = aulas.filter((a) => a.alterado);

  return (
    <div className="flex flex-col gap-0">
      <StaticDataNotice />
      {alteradas.length > 0 && (
        <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-amber-500 shrink-0" /><p className="text-xs text-amber-700">Alterações nesta semana</p></div>
          {alteradas.map((a) => (
            <div key={a.id} className="flex items-start gap-2 mb-1 last:mb-0">
              <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${a.cor}`} />
              <p className="text-xs text-gray-600"><span className="text-gray-800">{a.materia}</span> — {a.obs}</p>
            </div>
          ))}
        </div>
      )}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">Semana atual</p>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setVisualizacao("dia")} className={`px-3 py-1 rounded-md text-xs transition-colors ${visualizacao === "dia" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>Dia</button>
            <button onClick={() => setVisualizacao("semana")} className={`px-3 py-1 rounded-md text-xs transition-colors ${visualizacao === "semana" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>Semana</button>
          </div>
        </div>
        <div className="flex gap-2 justify-between">
          {dias.map((dia, i) => (
            <button key={dia} onClick={() => setDiaAtivo(i)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${diaAtivo === i ? "bg-red-600 text-white" : i === diaAtualIndex ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-100 text-gray-600"}`}>
              <span className="text-xs">{dia}</span>
              <span className="text-xs opacity-70">{semanaAtual[i].split(" ")[0]}</span>
              {aulas.filter((a) => a.dia === i && a.alterado).length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pb-4 flex flex-col gap-3">
        {visualizacao === "dia" ? (
          aulasDoDia.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3"><Clock className="w-10 h-10 text-gray-300" /><p className="text-sm text-gray-400">Sem aulas neste dia</p></div>
          ) : (
            aulasDoDia.map((aula) => (
              <div key={aula.id} className="flex items-stretch gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span className="text-xs text-gray-500 w-10 text-right">{aula.hora}</span>
                  <div className={`w-0.5 flex-1 ${aula.cor} opacity-30 min-h-[40px]`} />
                  <span className="text-xs text-gray-500 w-10 text-right">{aula.fim}</span>
                </div>
                <div className={`flex-1 border rounded-xl p-3 ${aula.alterado ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${aula.cor}`} /><p className="text-sm text-gray-800">{aula.materia}</p></div>
                    {aula.alterado ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-200 text-amber-700 rounded-full text-xs"><AlertCircle className="w-3 h-3" /> Alt.</span>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-full text-xs"><CheckCircle className="w-3 h-3" /> Normal</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{aula.professor}</p>
                  <p className="text-xs text-gray-500">Sala: <span className="text-gray-700">{aula.sala}</span></p>
                  {aula.obs && <p className="text-xs text-amber-600 mt-1.5 italic">{aula.obs}</p>}
                </div>
              </div>
            ))
          )
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {dias.map((dia, i) => {
              const aulasD = aulas.filter((a) => a.dia === i);
              return (
                <div key={dia} className={`flex gap-3 p-3 ${i < dias.length - 1 ? "border-b border-gray-100" : ""} ${i === diaAtualIndex ? "bg-red-50" : ""}`}>
                  <div className="w-8 shrink-0"><p className="text-xs text-gray-800">{dia}</p><p className="text-xs text-gray-500">{semanaAtual[i].split(" ")[0]}</p></div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    {aulasD.length === 0 ? <p className="text-xs text-gray-300 italic">Sem aulas</p> : aulasD.map((a) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${a.cor}`} />
                        <p className="text-xs text-gray-600 truncate">{a.hora} – {a.materia}</p>
                        {a.alterado && <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center py-6 gap-2">
        <div className="flex items-center gap-3 w-full max-w-xs px-8"><div className="flex-1 h-px bg-gray-200" /><div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center"><Clock className="w-3.5 h-3.5 text-red-600" /></div><div className="flex-1 h-px bg-gray-200" /></div>
        <p className="text-xs text-gray-400">Grade semanal completa</p>
      </div>
    </div>
  );
}
