import { useState, useRef, useEffect } from "react";
import {
  X, Heart, MessageCircle, Users, Bell, BookOpen,
  CheckCheck, ChevronRight, AlertCircle, Clock, Info,
} from "lucide-react";

type NotifType = "comment" | "like" | "mention" | "veteran" | "system" | "material";

export interface Notification {
  id: number;
  type: NotifType;
  read: boolean;
  time: string;
  actor: string;
  actorLetter: string;
  actorColor: string;
  title: string;
  body: string;
  postId?: number;
  postSnippet?: string;
}

const SEED: Notification[] = [
  { id: 1, type: "comment", read: false, time: "2min", actor: "Pedro Oliveira (Veterano)", actorLetter: "P", actorColor: "bg-blue-100 text-blue-600", title: "Pedro respondeu seu post", body: "\"Galera, Cálculo II está no Bloco C, sala 204 hoje. Confirma no portal também!\"", postId: 1, postSnippet: "Alguém sabe qual sala é a aula de Cálculo II…" },
  { id: 2, type: "like", read: false, time: "8min", actor: "Ana Figueiredo", actorLetter: "A", actorColor: "bg-pink-100 text-pink-600", title: "Ana curtiu seu comentário", body: "Seu comentário recebeu uma nova curtida.", postId: 2, postSnippet: "Resumo completo de Álgebra Linear…" },
  { id: 3, type: "mention", read: false, time: "35min", actor: "Beatriz Lima (Veterana)", actorLetter: "B", actorColor: "bg-purple-100 text-purple-600", title: "Beatriz mencionou você", body: "\"@Você sim, está na página 8 do PDF. Qualquer dúvida é só chamar!\"", postId: 2, postSnippet: "Resumo completo de Álgebra Linear…" },
  { id: 4, type: "veteran", read: false, time: "1h", actor: "Fernanda Costa (Veterana)", actorLetter: "F", actorColor: "bg-purple-100 text-purple-600", title: "Nova resposta de veterano", body: "Fernanda, veterana de Ciência da Computação, respondeu uma dúvida que você está seguindo.", postId: 1, postSnippet: "Alguém sabe qual sala é a aula de Cálculo II…" },
  { id: 5, type: "material", read: true, time: "3h", actor: "Beatriz Lima (Veterana)", actorLetter: "B", actorColor: "bg-purple-100 text-purple-600", title: "Novo material compartilhado", body: "Beatriz publicou: \"Lista Resolvida – Cálculo II (Integrais)\".", postId: 2 },
  { id: 6, type: "system", read: true, time: "5h", actor: "UlifeConecta", actorLetter: "U", actorColor: "bg-red-100 text-red-600", title: "Bem-vindo ao UlifeConecta! 🎉", body: "Seu perfil está ativo. Comece fazendo uma pergunta ou explorando o feed." },
  { id: 7, type: "comment", read: true, time: "1d", actor: "Lucas Ramos", actorLetter: "L", actorColor: "bg-orange-100 text-orange-600", title: "Lucas comentou na mesma publicação", body: "\"O portal estava fora do ar mais cedo, acho que voltou agora.\"", postId: 1, postSnippet: "Alguém sabe qual sala é a aula de Cálculo II…" },
];

const TYPE_CONFIG: Record<NotifType, { icon: typeof MessageCircle; iconBg: string; iconColor: string; label: string }> = {
  comment: { icon: MessageCircle, iconBg: "bg-blue-50", iconColor: "text-blue-500", label: "Comentário" },
  like: { icon: Heart, iconBg: "bg-red-50", iconColor: "text-red-500", label: "Curtida" },
  mention: { icon: AlertCircle, iconBg: "bg-yellow-50", iconColor: "text-yellow-500", label: "Menção" },
  veteran: { icon: Users, iconBg: "bg-purple-50", iconColor: "text-purple-500", label: "Veterano" },
  material: { icon: BookOpen, iconBg: "bg-green-50", iconColor: "text-green-500", label: "Material" },
  system: { icon: Info, iconBg: "bg-gray-100", iconColor: "text-gray-500", label: "Sistema" },
};

interface NotificationsPanelProps {
  onClose: () => void;
  onMarkAllRead: () => void;
  onGoToPost?: (postId: number) => void;
}

export function NotificationsPanel({ onClose, onMarkAllRead, onGoToPost }: NotificationsPanelProps) {
  const [items, setItems] = useState<Notification[]>(SEED);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selected) setSelected(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const unreadCount = items.filter((item) => !item.read).length;
  const markRead = (id: number) => setItems((previous) => previous.map((item) => item.id === id ? { ...item, read: true } : item));
  const markAllRead = () => {
    setItems((previous) => previous.map((item) => ({ ...item, read: true })));
    onMarkAllRead();
  };
  const handleSelect = (notification: Notification) => {
    if (!notification.read) markRead(notification.id);
    setSelected(notification);
  };
  const visible = filter === "unread" ? items.filter((item) => !item.read) : items;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex flex-col justify-end"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-panel-title"
        tabIndex={-1}
        className="bg-white w-full rounded-t-3xl flex flex-col animate-slide-up focus:outline-none"
        style={{ maxHeight: "88vh" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {selected ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
              <button onClick={() => setSelected(null)} aria-label="Voltar às notificações" className="p-1.5 rounded-full hover:bg-gray-100 transition">
                <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" aria-hidden="true" />
              </button>
              <p className="text-sm text-gray-800">Notificação</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0 ${selected.actorColor}`}>
                  {selected.actorLetter}
                </div>
                <div>
                  <p className="text-sm text-gray-800">{selected.actor}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${TYPE_CONFIG[selected.type].iconBg} ${TYPE_CONFIG[selected.type].iconColor}`}>
                      {(() => {
                        const Icon = TYPE_CONFIG[selected.type].icon;
                        return <Icon className="w-3 h-3" aria-hidden="true" />;
                      })()}
                      {TYPE_CONFIG[selected.type].label}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" /> {selected.time}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2">
                <p className="text-sm text-gray-800">{selected.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{selected.body}</p>
              </div>
              {selected.postId && selected.postSnippet && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Publicação relacionada</p>
                  <button
                    onClick={() => {
                      onGoToPost?.(selected.postId!);
                      onClose();
                    }}
                    className="w-full text-left bg-white border border-gray-200 rounded-2xl p-3.5 flex items-center gap-3 hover:border-red-300 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />
                    <p className="text-sm text-gray-600 flex-1 truncate">{selected.postSnippet}</p>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              )}
              <div className="px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700">⚠️ Destino de navegação ao clicar na publicação pendente de validação com o fluxo real de posts.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 pb-3 pt-1 shrink-0">
              <div>
                <p id="notifications-panel-title" className="text-gray-800">Notificações</p>
                {unreadCount > 0 && (
                  <p className="text-xs text-red-500 mt-0.5" role="status" aria-live="polite">
                    {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} aria-label="Marcar todas como lidas" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                    <CheckCheck className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
                    <span className="text-xs text-gray-600">Marcar tudo</span>
                  </button>
                )}
                <button onClick={onClose} aria-label="Fechar notificações" className="p-1.5 rounded-full hover:bg-gray-100 transition">
                  <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div role="tablist" aria-label="Filtrar notificações" className="flex border-b border-gray-100 px-4 shrink-0">
              {(["all", "unread"] as const).map((value) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={filter === value}
                  onClick={() => setFilter(value)}
                  className={`flex-1 py-2.5 text-sm border-b-2 transition ${filter === value ? "border-red-600 text-red-600" : "border-transparent text-gray-400"}`}
                >
                  {value === "all" ? "Todas" : `Não lidas${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center py-16 px-6 gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-gray-300" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    {filter === "unread" ? "Nenhuma notificação não lida" : "Nenhuma notificação ainda"}
                  </p>
                  <p className="text-xs text-gray-300 text-center">
                    {filter === "unread" ? "Você está em dia com tudo!" : "Interaja com o feed para começar a receber notificações."}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-gray-50">
                  {visible.map((notification) => {
                    const config = TYPE_CONFIG[notification.type];
                    const Icon = config.icon;
                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleSelect(notification)}
                        aria-label={`${notification.read ? "" : "Não lida — "}${notification.title}. ${notification.time}`}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition relative ${!notification.read ? "bg-red-50 hover:bg-red-50" : ""}`}
                      >
                        {!notification.read && <span className="absolute top-4 left-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${notification.actorColor}`}>{notification.actorLetter}</div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${config.iconBg} border-2 border-white`}>
                            <Icon className={`w-2.5 h-2.5 ${config.iconColor}`} aria-hidden="true" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>{notification.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{notification.body}</p>
                          <p className="text-xs text-gray-300 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" /> {notification.time}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-200 shrink-0 mt-1" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mx-4 my-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 leading-relaxed">
                  ⚠️ Regras de push, agrupamento, prioridade e frequência de notificações pendentes de validação.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
