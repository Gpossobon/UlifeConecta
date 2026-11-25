import { useState } from "react";
import {
  HelpCircle, BookOpen, Clock, MapPin, Users, MessageCircle,
  Heart, Bookmark, Settings, ChevronRight, Edit3, LogOut, Bell, Shield, Moon,
} from "lucide-react";
import type { User } from "firebase/auth";

const USER = {
  name: "Você",
  username: "@estudante",
  course: "Eng. da Computação",
  semester: "4º Semestre",
  avatarLetter: "V",
  bio: "Estudante apaixonado por tecnologia e matemática. 📐💻",
  replies: 7,
  badges: [
    { label: "Colaborador", color: "bg-blue-100 text-blue-600", icon: "⭐" },
    { label: "Ativo", color: "bg-green-100 text-green-600", icon: "🔥" },
  ],
};

type ProfilePost = {
  id: number;
  author: string;
  category: string;
  categoryIcon: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
};

type PerfilPageProps = {
  savedPostIds: Set<number>;
  allPosts: ProfilePost[];
  user: User;
  onSignOut: () => Promise<void>;
};

const SETTINGS_ITEMS = [
  { icon: Bell, label: "Notificações", sub: "Gerenciar alertas e avisos", chevron: true, danger: false },
  { icon: Shield, label: "Privacidade", sub: "Visibilidade do perfil", chevron: true, danger: false },
  { icon: Moon, label: "Tema", sub: "Claro (padrão)", chevron: true, danger: false },
  { icon: LogOut, label: "Sair da conta", sub: null, chevron: false, danger: true },
];

const ICON_MAP = { HelpCircle, BookOpen, Clock, MapPin, Users, MessageCircle };
const ICON_COLOR: Record<string, string> = {
  HelpCircle: "text-red-500",
  BookOpen: "text-blue-500",
  Clock: "text-orange-500",
  MapPin: "text-green-500",
  Users: "text-purple-500",
  MessageCircle: "text-gray-500",
};

export function PerfilPage({ savedPostIds, allPosts, user, onSignOut }: PerfilPageProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "salvos">("posts");
  const profileName = user.displayName || user.email?.split("@")[0] || "Estudante";
  const profileEmail = user.email || "@estudante";
  const myPosts = allPosts.filter((post) => post.author === "Você"
    || post.author === user.displayName
    || post.author === user.email);
  const savedPosts = allPosts.filter((post) => savedPostIds.has(post.id));

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      <div className="bg-white border-b border-gray-100 px-4 pt-5 pb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-2xl shrink-0">
              {USER.avatarLetter}
            </div>
            <button type="button" aria-label="Editar foto do perfil" className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <Edit3 className="w-3 h-3 text-gray-500" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-gray-900">{profileName}</p>
              {USER.badges.map((badge) => (
                <span key={badge.label} className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}>{badge.icon} {badge.label}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{profileEmail}</p>
            <p className="text-xs text-red-500 mt-0.5">{USER.course} · {USER.semester}</p>
          </div>
          <button type="button" aria-label="Configurações do perfil" className="p-2 rounded-xl border border-gray-200 hover:border-gray-300 transition shrink-0">
            <Settings className="w-4 h-4 text-gray-500" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">{USER.bio}</p>
        <div className="flex gap-0 divide-x divide-gray-100 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
          {[
            { label: "Publicações", value: myPosts.length },
            { label: "Respostas", value: USER.replies },
            { label: "Salvos", value: savedPostIds.size },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 flex flex-col items-center py-3">
              <span className="text-gray-900 text-lg">{value}</span>
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          aria-pressed={activeTab === "posts"}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition border-b-2 ${activeTab === "posts" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}
        >
          <Edit3 className="w-4 h-4" aria-hidden="true" /> Minhas publicações
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("salvos")}
          aria-pressed={activeTab === "salvos"}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition border-b-2 ${activeTab === "salvos" ? "border-red-600 text-red-600" : "border-transparent text-gray-500"}`}
        >
          <Bookmark className="w-4 h-4" aria-hidden="true" /> Salvos
          {savedPostIds.size > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
              {savedPostIds.size}
            </span>
          )}
        </button>
      </div>

      {activeTab === "posts" && (
        <div className="flex flex-col px-4 py-4 gap-3">
          {myPosts.length === 0 ? (
            <EmptyState icon={Edit3} label="Você ainda não publicou nada" />
          ) : (
            myPosts.map((post) => {
              const Icon = ICON_MAP[post.categoryIcon as keyof typeof ICON_MAP] ?? MessageCircle;
              const iconColor = ICON_COLOR[post.categoryIcon] ?? "text-gray-500";
              return (
                <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} aria-hidden="true" />
                    <span className={`text-xs ${iconColor}`}>{post.category}</span>
                    <span className="ml-auto text-xs text-gray-400">{post.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 pt-2.5 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><Heart className="w-3.5 h-3.5" aria-hidden="true" /> {post.likes}</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400"><MessageCircle className="w-3.5 h-3.5" aria-hidden="true" /> {post.comments}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "salvos" && (
        <div className="flex flex-col px-4 py-4 gap-3">
          {savedPosts.length === 0 ? (
            <EmptyState icon={Bookmark} label="Nenhum post salvo ainda" />
          ) : (
            savedPosts.map((post) => {
              const Icon = ICON_MAP[post.categoryIcon as keyof typeof ICON_MAP] ?? MessageCircle;
              const iconColor = ICON_COLOR[post.categoryIcon] ?? "text-gray-500";
              return (
                <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">{post.author.charAt(0)}</div>
                    <span className="text-xs text-gray-600 truncate flex-1">{post.author}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      <Icon className={`w-3 h-3 ${iconColor}`} aria-hidden="true" /> {post.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">{post.time}</p>
                    <span className="flex items-center gap-1 text-xs text-red-500">
                      <Bookmark className="w-3 h-3 fill-red-500" aria-hidden="true" /> Salvo
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className="px-4 pb-8 mt-2">
        <p className="text-xs text-gray-400 mb-2 px-1">Configurações</p>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.label === "Sair da conta" ? onSignOut : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition ${item.danger ? "text-red-500" : "text-gray-700"}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.danger ? "text-red-500" : "text-gray-400"}`} aria-hidden="true" />
                <div className="flex-1 text-left">
                  <p className={`text-sm ${item.danger ? "text-red-500" : "text-gray-800"}`}>{item.label}</p>
                  {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
                </div>
                {item.chevron && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700">⚠️ Perfil demonstrativo — autenticação e dados reais ainda não estão integrados.</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, label }: { icon: typeof Edit3; label: string }) {
  return (
    <div className="flex flex-col items-center py-12 gap-3">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-300" aria-hidden="true" />
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
