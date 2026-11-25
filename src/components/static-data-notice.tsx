export function StaticDataNotice() {
  return (
    <div role="note" aria-label="Aviso: dados demonstrativos"
      className="mx-4 mt-3 mb-1 flex items-start gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"
        className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 5.5v.5M8 8v3" />
      </svg>
      <p className="text-xs text-gray-500 leading-relaxed">
        <span className="text-gray-700">Dados demonstrativos.</span>{" "}
        Esta tela ainda não sincroniza seus dados com o Firebase.
      </p>
    </div>
  );
}
