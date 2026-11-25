import { CalendarDays, GraduationCap, LibraryBig, MessagesSquare } from "lucide-react";
import type { BottomTab, FeedCategory } from "../types";

type CommunitySidebarProps = {
  onSelectCategory: (category: FeedCategory) => void;
  onSelectTab: (tab: BottomTab) => void;
};

const trends: { label: string; title: string; posts: number; category: FeedCategory }[] = [
  { label: "Dúvida em Alta", title: "Prova de Cálculo II", posts: 23, category: "duvida" },
  { label: "Material Popular", title: "Resumos de Física III", posts: 18, category: "material" },
  { label: "Discussão Ativa", title: "Mudança de Horários", posts: 15, category: "horario" },
];

export function CommunitySidebar({ onSelectCategory, onSelectTab }: CommunitySidebarProps) {
  const quickLinks = [
    { label: "Calendário Acadêmico", icon: CalendarDays, onClick: () => onSelectCategory("horario") },
    { label: "Biblioteca Digital", icon: LibraryBig, onClick: () => onSelectTab("content") },
    { label: "Portal do Aluno", icon: GraduationCap, onClick: () => onSelectTab("profile") },
    { label: "Grupos de Estudo", icon: MessagesSquare, onClick: () => onSelectCategory("forum") },
  ];
  const onlineVeterans = ["Beatriz Lima", "Pedro Oliveira", "Fernanda Costa"];

  return (
    <aside className="hidden self-start lg:block" aria-label="Informações da comunidade">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <section className="p-6" aria-labelledby="trends-title">
          <h2 id="trends-title" className="mb-5 text-base text-gray-600">Tendências</h2>
          <div className="space-y-6">
            {trends.map((trend) => (
              <button
                key={trend.title}
                type="button"
                onClick={() => onSelectCategory(trend.category)}
                className="block w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <span className="block text-sm text-gray-500">{trend.label}</span>
                <span className="mt-1 block text-base text-gray-900">{trend.title}</span>
                <span className="mt-1 block text-sm text-gray-500">{trend.posts} publicações</span>
              </button>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-200 p-6" aria-labelledby="quick-links-title">
          <h2 id="quick-links-title" className="mb-4 text-base text-gray-600">Links Rápidos</h2>
          <nav aria-label="Links rápidos">
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, icon: Icon, onClick }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={onClick}
                    className="flex items-center gap-2.5 text-left text-sm text-gray-700 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section className="border-t border-gray-200 p-6" aria-labelledby="online-veterans-title">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 id="online-veterans-title" className="text-base text-gray-600">Veteranos Online</h2>
            <span className="flex items-center gap-1.5 text-xs text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
              {onlineVeterans.length} online
            </span>
          </div>
          <ul className="space-y-3">
            {onlineVeterans.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => onSelectTab("veterans")}
                  className="flex w-full items-center gap-2.5 text-left text-sm text-gray-700 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-xs text-red-600">
                    {name.charAt(0)}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" aria-label="online" />
                  </span>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
