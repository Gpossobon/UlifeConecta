import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart, MessageCircle, Bookmark, Plus, Home, Search,
  Bell, User, X, BookOpen, Clock, MapPin, Users, HelpCircle,
  MoreHorizontal, Pencil, Trash2, CalendarDays, LibraryBig,
  GraduationCap, MessagesSquare
} from "lucide-react";
import { DuvidasPage }         from "./components/duvidas-page";
import { MaterialPage }        from "./components/material-page";
import { HorariosPage }        from "./components/horarios-page";
import { SalasPage }           from "./components/salas-page";
import { VeteranosPage }       from "./components/veteranos-page";
import { ForumPage }           from "./components/forum-page";
import { BuscarPage }          from "./components/buscar-page";
import { ConteudoPage }        from "./components/conteudo-page";
import { PerfilPage }          from "./components/perfil-page";
import { CommentsPanel }       from "./components/comments-panel";
import { NotificationsPanel }  from "./components/notifications-panel";
import { useFirebaseAuth } from "./auth/firebase-auth";

type BottomTab = "home" | "search" | "veterans" | "content" | "profile";
type FeedCategory = "all" | "duvida" | "material" | "horario" | "sala" | "veteranos" | "forum";

function ImageWithFallback(props) {
  const [didError, setDidError] = useState(false);
  const { src, alt, style, className, ...rest } = props;
  return didError ? (
    <div className={`inline-block bg-gray-100 text-center align-middle ${className ?? ""}`} style={style}>
      <div className="flex items-center justify-center w-full h-full">
        <img
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=="
          alt="Imagem indisponível"
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={() => setDidError(true)} />
  );
}

function useFocusTrap(containerRef: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const el = containerRef.current;
    const sel = 'button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(el.querySelectorAll<HTMLElement>(sel));
    const timer = setTimeout(() => { getFocusable()[0]?.focus(); }, 80);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (!els.length) return;
      const [first, last] = [els[0], els[els.length - 1]];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => { clearTimeout(timer); el.removeEventListener("keydown", onKeyDown); };
  }, [active]);
}

function SkeletonCard() {
  return (
    <article className="bg-white border-b border-gray-200 px-4 py-4 animate-pulse" aria-hidden="true">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded-full w-2/5" />
          <div className="h-2.5 bg-gray-100 rounded-full w-1/4" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      </div>
      <div className="flex gap-5 pt-2 border-t border-gray-100">
        <div className="h-5 w-10 bg-gray-100 rounded-full" />
        <div className="h-5 w-10 bg-gray-100 rounded-full" />
      </div>
    </article>
  );
}

function FeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center py-14 px-6 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-red-500" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-gray-800 mb-1">Não foi possível carregar o feed</p>
        <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente.</p>
      </div>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
      >
        Tentar novamente
      </button>
    </div>
  );
}

function FeedEmpty() {
  return (
    <div className="flex flex-col items-center py-14 px-6 gap-3">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-gray-300" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 12h8M12 8v8m-9 4h18" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-gray-600 text-center">Nenhuma publicação ainda</p>
      <p className="text-xs text-gray-400 text-center">Seja o primeiro a publicar nesta categoria!</p>
    </div>
  );
}

function CommunitySidebar({
  onSelectCategory,
  onSelectTab,
}: {
  onSelectCategory: (category: FeedCategory) => void;
  onSelectTab: (tab: BottomTab) => void;
}) {
  const trends: { label: string; title: string; posts: number; category: FeedCategory }[] = [
    { label: "Dúvida em Alta", title: "Prova de Cálculo II", posts: 23, category: "duvida" },
    { label: "Material Popular", title: "Resumos de Física III", posts: 18, category: "material" },
    { label: "Discussão Ativa", title: "Mudança de Horários", posts: 15, category: "horario" },
  ];

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

export default function MobileFeed() {
  const { user, db, signOutUser } = useFirebaseAuth();
  const [activeTab, setActiveTab]           = useState<BottomTab>("home");
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>("all");

  const [posts, setPosts] = useState([
    { id: 1, author: "Carlos Mendes", category: "Dúvida", categoryIcon: "HelpCircle", time: "15min", content: "Alguém sabe qual sala é a aula de Cálculo II hoje? O app da faculdade não está atualizando...", likes: 12, comments: 8, solved: false, image: undefined },
    { id: 2, author: "Beatriz Lima (Veterana)", category: "Material", categoryIcon: "BookOpen", time: "1h", content: "Resumo completo de Álgebra Linear que eu fiz no semestre passado. Pode ajudar quem está estudando para a P1! 📚", image: "https://images.unsplash.com/photo-1761546571631-a4d61b55cd2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0Ym9vayUyMG5vdGVzJTIwc3R1ZHl8ZW58MXx8fHwxNzc3MzE0MTcyfDA&ixlib=rb-4.1.0&q=80&w=1080", likes: 45, comments: 12, solved: false },
    { id: 3, author: "Mariana Santos", category: "Horário", categoryIcon: "Clock", time: "2h", content: "ATENÇÃO: Aula de Física III amanhã será às 10h ao invés de 8h. Sala B-203.", likes: 23, comments: 5, solved: false, image: undefined },
    { id: 4, author: "Pedro Oliveira (Veterano)", category: "Sala", categoryIcon: "MapPin", time: "3h", content: "Galera do 3º período, a sala C-105 mudou de prédio. Agora é no Bloco D, sala 105. Não se percam!", likes: 18, comments: 4, solved: true, image: undefined },
    { id: 5, author: "Julia Ferreira", category: "Grupo de Estudo", categoryIcon: "Users", time: "5h", content: "Montando grupo de estudos para a prova de Programação. Quem tiver interesse, chama no direct!", likes: 31, comments: 15, solved: false, image: undefined },
  ]);

  const [likedPosts, setLikedPosts] = useState(new Set<number>());
  const [savedPosts, setSavedPosts] = useState(new Set<number>());
  const [justLiked, setJustLiked] = useState(new Set<number>());
  const [justSaved, setJustSaved] = useState(new Set<number>());
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, action?: { label: string; onClick: () => void }) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, action });
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  };

  const [feedStatus, setFeedStatus] = useState<"loading" | "ready" | "error">("loading");
  const fabRef        = useRef<HTMLButtonElement>(null);
  const modalRef      = useRef<HTMLDivElement>(null);
  const prevModalOpen = useRef(false);
  const [openCommentsPost, setOpenCommentsPost] = useState<null | typeof posts[0]>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount]             = useState(3);
  const [showCreatePost, setShowCreatePost]   = useState(false);
  const [newCategory, setNewCategory]         = useState<string | null>(null);
  const [newContent, setNewContent]           = useState("");
  const [newImage, setNewImage]               = useState<string | null>(null);
  const [newImageName, setNewImageName]       = useState<string | null>(null);
  const [formError, setFormError]             = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess]   = useState(false);

  const [postMenuId, setPostMenuId]           = useState<number | null>(null);
  const [editingPost, setEditingPost]         = useState<typeof posts[0] | null>(null);
  const [editContent, setEditContent]         = useState("");
  const [editCategory, setEditCategory]       = useState<string | null>(null);
  const [editImage, setEditImage]             = useState<string | null>(null);
  const [editImageName, setEditImageName]     = useState<string | null>(null);
  const [editFormError, setEditFormError]     = useState<string | null>(null);
  const editModalRef                          = useRef<HTMLDivElement>(null);

  const feedCategories: { id: FeedCategory; label: string; icon: any }[] = [
    { id: "all",      label: "Tudo",      icon: Home },
    { id: "duvida",   label: "Dúvidas",   icon: HelpCircle },
    { id: "material", label: "Material",  icon: BookOpen },
    { id: "horario",  label: "Horários",  icon: Clock },
    { id: "sala",     label: "Salas",     icon: MapPin },
    { id: "veteranos",label: "Veteranos", icon: Users },
    { id: "forum",    label: "Fórum",     icon: MessageCircle },
  ];

  const categoryOptions = [
    { key: "Dúvida",   icon: HelpCircle,    iconName: "HelpCircle",    color: "text-red-600",    activeBorder: "border-red-500",    activeBg: "bg-red-50" },
    { key: "Material", icon: BookOpen,       iconName: "BookOpen",      color: "text-blue-600",   activeBorder: "border-blue-500",   activeBg: "bg-blue-50" },
    { key: "Horário",  icon: Clock,          iconName: "Clock",         color: "text-orange-600", activeBorder: "border-orange-500", activeBg: "bg-orange-50" },
    { key: "Sala",     icon: MapPin,         iconName: "MapPin",        color: "text-green-600",  activeBorder: "border-green-500",  activeBg: "bg-green-50" },
    { key: "Grupo",    icon: Users,          iconName: "Users",         color: "text-purple-600", activeBorder: "border-purple-500", activeBg: "bg-purple-50" },
    { key: "Fórum",    icon: MessageCircle,  iconName: "MessageCircle", color: "text-gray-700",   activeBorder: "border-gray-500",   activeBg: "bg-gray-50" },
  ];

  const bottomNavItems: { id: BottomTab; label: string; icon: any }[] = [
    { id: "home",     label: "Início",    icon: Home },
    { id: "search",   label: "Buscar",    icon: Search },
    { id: "veterans", label: "Veteranos", icon: Users },
    { id: "content",  label: "Conteúdo",  icon: BookOpen },
    { id: "profile",  label: "Perfil",    icon: User },
  ];

  const tabTitles: Record<BottomTab, string | null> = {
    home: null, search: "Buscar", veterans: "Veteranos", content: "Conteúdo", profile: "Perfil",
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, any> = { HelpCircle, BookOpen, Clock, MapPin, Users, MessageCircle };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  const toggleLike = (postId: number) => {
    const wasLiked = likedPosts.has(postId);
    setLikedPosts((prev) => { const s = new Set(prev); s.has(postId) ? s.delete(postId) : s.add(postId); return s; });
    if (!wasLiked) {
      setJustLiked((prev) => { const s = new Set(prev); s.add(postId); return s; });
      setTimeout(() => setJustLiked((prev) => { const s = new Set(prev); s.delete(postId); return s; }), 450);
    }
  };

  const toggleSave = (postId: number) => {
    const wasSaved = savedPosts.has(postId);
    setSavedPosts((prev) => { const s = new Set(prev); s.has(postId) ? s.delete(postId) : s.add(postId); return s; });
    if (!wasSaved) {
      setJustSaved((prev) => { const s = new Set(prev); s.add(postId); return s; });
      setTimeout(() => setJustSaved((prev) => { const s = new Set(prev); s.delete(postId); return s; }), 450);
      showToast("Salvo! Acesse em Perfil → Salvos", { label: "Ver salvos", onClick: () => { setToast(null); setActiveTab("profile"); } });
    } else {
      showToast("Removido dos salvos");
    }
  };

  const handleCommentCountChange = (postId: number, count: number) => {
    setPosts((previous) => previous.map((post) => post.id === postId ? { ...post, comments: count } : post));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setNewImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = useCallback(() => {
    setNewCategory(null); setNewContent(""); setNewImage(null);
    setNewImageName(null); setFormError(null); setPublishSuccess(false);
  }, []);

  const loadFeed = useCallback(() => {
    setFeedStatus("loading");
    const t = setTimeout(() => setFeedStatus("ready"), 950);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => loadFeed(), [loadFeed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (postMenuId !== null)    setPostMenuId(null);
      else if (editingPost)       setEditingPost(null);
      else if (showCreatePost)    { setShowCreatePost(false); resetForm(); }
      else if (openCommentsPost)  setOpenCommentsPost(null);
      else if (showNotifications) setShowNotifications(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [postMenuId, editingPost, showCreatePost, openCommentsPost, showNotifications, resetForm]);

  useEffect(() => {
    if (showCreatePost) { prevModalOpen.current = true; }
    else if (prevModalOpen.current) { prevModalOpen.current = false; fabRef.current?.focus(); }
  }, [showCreatePost]);

  useFocusTrap(modalRef, showCreatePost);
  useFocusTrap(editModalRef, editingPost !== null);

  const openEditModal = (post: typeof posts[0]) => {
    setPostMenuId(null);
    setEditingPost(post);
    setEditContent(post.content);
    setEditCategory(post.category);
    setEditImage((post.image as string | null | undefined) ?? null);
    setEditImageName(null);
    setEditFormError(null);
  };

  const handleSaveEdit = () => {
    if (!editCategory) { setEditFormError("Selecione uma categoria antes de salvar."); return; }
    if (editContent.trim().length < 10) { setEditFormError("Escreva pelo menos 10 caracteres."); return; }
    setEditFormError(null);
    const opt = categoryOptions.find((c) => c.key === editCategory);
    setPosts((prev) => prev.map((p) => p.id === editingPost!.id
      ? { ...p, content: editContent.trim(), category: editCategory, categoryIcon: opt?.iconName ?? p.categoryIcon, image: editImage ?? undefined }
      : p
    ));
    setEditingPost(null);
    showToast("Publicação atualizada!");
  };

  const handleDeletePost = (postId: number) => {
    setPostMenuId(null);
    const deleted = posts.find((p) => p.id === postId)!;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast("Publicação excluída", {
      label: "Desfazer",
      onClick: () => {
        setPosts((prev) => { const exists = prev.some((p) => p.id === deleted.id); return exists ? prev : [deleted, ...prev]; });
        setToast(null);
      },
    });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setEditImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    if (!newCategory) { setFormError("Selecione uma categoria antes de publicar."); return; }
    if (newContent.trim().length < 10) { setFormError("Escreva pelo menos 10 caracteres no conteúdo."); return; }
    setFormError(null);
    const opt = categoryOptions.find((c) => c.key === newCategory)!;
    const newPost = { id: Date.now(), author: "Você", category: newCategory, categoryIcon: opt.iconName, time: "agora", content: newContent.trim(), image: newImage ?? undefined, likes: 0, comments: 0, solved: false };
    setPosts((prev) => [newPost, ...prev]);
    setPublishSuccess(true);
    setTimeout(() => { setShowCreatePost(false); setActiveTab("home"); setSelectedCategory("all"); resetForm(); }, 1400);
  };

  const goHome = () => { setActiveTab("home"); setSelectedCategory("all"); };
  const isHome = activeTab === "home";

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4 flex items-center justify-between relative overflow-hidden">
          <svg className="absolute left-0 top-0 w-40 h-24 opacity-10" viewBox="0 0 120 90" fill="none">
            <path d="M0 45 Q 30 15, 60 45 T 120 45" stroke="#dc2626" strokeWidth="3" />
            <path d="M0 55 Q 30 25, 60 55 T 120 55" stroke="#dc2626" strokeWidth="2" />
          </svg>
          <svg className="absolute left-0 top-0 w-40 h-24 opacity-20" viewBox="0 0 120 90" fill="none">
            <path d="M0 35 Q 30 10, 60 35 T 120 35" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M0 65 Q 30 40, 60 65 T 120 65" stroke="#d1d5db" strokeWidth="1" />
          </svg>
          <svg className="absolute right-0 top-0 w-40 h-24 opacity-10" viewBox="0 0 120 90" fill="none">
            <path d="M120 45 Q 90 15, 60 45 T 0 45" stroke="#dc2626" strokeWidth="3" />
            <path d="M120 55 Q 90 25, 60 55 T 0 55" stroke="#dc2626" strokeWidth="2" />
          </svg>
          <svg className="absolute right-0 top-0 w-40 h-24 opacity-20" viewBox="0 0 120 90" fill="none">
            <path d="M120 35 Q 90 10, 60 35 T 0 35" stroke="#9ca3af" strokeWidth="1.5" />
            <path d="M120 65 Q 90 40, 60 65 T 0 65" stroke="#d1d5db" strokeWidth="1" />
          </svg>
          <button className="relative z-10" onClick={goHome}>
            <h1 className="text-3xl relative z-10">
              <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text text-transparent" style={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
                Ulife<span className="text-red-600">Conecta</span>
              </span>
            </h1>
            <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 200 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 0, 100 5 T 200 5" stroke="#dc2626" strokeWidth="2" fill="none" />
            </svg>
          </button>
          <div className="flex items-center gap-3 relative z-10">
            {!isHome && tabTitles[activeTab] && (
              <span className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 rounded-full text-xs">
                {tabTitles[activeTab]}
              </span>
            )}
            <button
              className="relative focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 rounded-full p-0.5"
              aria-label={`Notificações${unreadCount > 0 ? ` — ${unreadCount} não lida${unreadCount !== 1 ? "s" : ""}` : ""}`}
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-6 h-6 text-gray-700" aria-hidden="true" />
              {unreadCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {isHome && (
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {feedCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={selectedCategory === cat.id}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 ${
                      selectedCategory === cat.id ? "bg-red-600 text-white" : "bg-white border border-gray-300 text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    <span className="text-sm">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === "search"   && <BuscarPage />}
        {activeTab === "veterans" && <VeteranosPage />}
        {activeTab === "content"  && <ConteudoPage />}
        {activeTab === "profile"  && <PerfilPage savedPostIds={savedPosts} allPosts={posts} user={user} onSignOut={signOutUser} />}
        {activeTab === "home" && (
          <>
            {selectedCategory === "duvida"    && <DuvidasPage />}
            {selectedCategory === "material"  && <MaterialPage />}
            {selectedCategory === "horario"   && <HorariosPage />}
            {selectedCategory === "sala"      && <SalasPage />}
            {selectedCategory === "veteranos" && <VeteranosPage />}
            {selectedCategory === "forum"     && <ForumPage />}
            {selectedCategory === "all" && (
              <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
                <section className="min-w-0 overflow-hidden rounded-none bg-white lg:rounded-2xl lg:border lg:border-gray-200" aria-label="Feed da comunidade">
                {feedStatus === "loading" && (
                  <section aria-label="Carregando publicações" aria-busy="true">
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                  </section>
                )}
                {feedStatus === "error" && <FeedError onRetry={loadFeed} />}
                {feedStatus === "ready" && posts.length === 0 && <FeedEmpty />}
                {feedStatus === "ready" && posts.length > 0 && (
                  <>
                  {posts.map((post) => (
                    <article key={post.id} className="bg-white border-b border-gray-200">
                      <div className="px-4 pt-4 pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                              {post.author.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm">{post.author}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{post.time}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-red-600">
                                  <span aria-hidden="true">{getCategoryIcon(post.categoryIcon)}</span>
                                  {post.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {post.solved && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full" title="Dúvida resolvida">
                                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Resolvido
                              </span>
                            )}
                            <div className="relative">
                              <button
                                onClick={() => setPostMenuId(postMenuId === post.id ? null : post.id)}
                                aria-label="Opções da publicação"
                                aria-expanded={postMenuId === post.id}
                                aria-haspopup="menu"
                                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-red-600"
                              >
                                <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                              </button>
                              <AnimatePresence>
                                {postMenuId === post.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                    transition={{ duration: 0.14 }}
                                    role="menu"
                                    aria-label="Opções"
                                    className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-xl shadow-lg min-w-44 overflow-hidden"
                                  >
                                    <button role="menuitem" onClick={() => openEditModal(post)} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                                      <Pencil className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                      Editar publicação
                                    </button>
                                    <div className="h-px bg-gray-100 mx-3" />
                                    <button role="menuitem" onClick={() => handleDeletePost(post.id)} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                                      Excluir publicação
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm mb-3 leading-relaxed">{post.content}</p>
                        {post.image && (
                          <ImageWithFallback src={post.image} alt="Post" className="w-full rounded-lg mb-3 object-cover max-h-64" />
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-5">
                            <motion.button
                              onClick={() => toggleLike(post.id)}
                              animate={justLiked.has(post.id) ? { scale: [1, 1.4, 0.88, 1] } : { scale: 1 }}
                              whileTap={{ scale: 0.75 }}
                              transition={{ duration: 0.38, ease: "easeOut" }}
                              aria-pressed={likedPosts.has(post.id)}
                              aria-label={`${likedPosts.has(post.id) ? "Descurtir" : "Curtir"} — ${post.likes + (likedPosts.has(post.id) ? 1 : 0)} curtidas`}
                              className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Heart className={`w-5 h-5 transition-colors duration-200 ${likedPosts.has(post.id) ? "fill-red-600 text-red-600" : ""}`} />
                              <motion.span
                                key={post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                                initial={{ y: -6, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm tabular-nums"
                                aria-hidden="true"
                              >
                                {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                              </motion.span>
                            </motion.button>
                            <button onClick={() => setOpenCommentsPost(post)} aria-label={`Ver ${post.comments} comentários`} className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors">
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-sm" aria-hidden="true">{post.comments}</span>
                            </button>
                          </div>
                          <motion.button
                            onClick={() => toggleSave(post.id)}
                            animate={justSaved.has(post.id) ? { scale: [1, 1.3, 0.92, 1] } : { scale: 1 }}
                            whileTap={{ scale: 0.75 }}
                            transition={{ duration: 0.38, ease: "easeOut" }}
                            aria-pressed={savedPosts.has(post.id)}
                            aria-label={savedPosts.has(post.id) ? "Remover dos salvos" : "Salvar publicação"}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <Bookmark className={`w-5 h-5 transition-colors duration-200 ${savedPosts.has(post.id) ? "fill-red-600 text-red-600" : ""}`} />
                          </motion.button>
                        </div>
                      </div>
                    </article>
                  ))}
                  <div className="flex flex-col items-center py-8 px-4 gap-3">
                    <div className="flex items-center gap-3 w-full max-w-xs">
                      <div className="flex-1 h-px bg-gray-200" />
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-red-600" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <p className="text-sm text-gray-400 text-center">Você está em dia com o feed!</p>
                    <p className="text-xs text-gray-300 text-center">Todas as publicações foram exibidas</p>
                  </div>
                  </>
                )}
                </section>
                <CommunitySidebar
                  onSelectCategory={(category) => setSelectedCategory(category)}
                  onSelectTab={(tab) => setActiveTab(tab)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {isHome && (
        <button
          ref={fabRef}
          onClick={() => setShowCreatePost(true)}
          aria-label="Nova publicação"
          aria-haspopup="dialog"
          aria-expanded={showCreatePost}
          className={[
            "fixed bottom-24 right-6 w-14 h-14 bg-red-600 rounded-full shadow-lg",
            "flex items-center justify-center hover:bg-red-700 transition-colors z-20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-600",
          ].join(" ")}
        >
          <Plus className="w-7 h-7 text-white" aria-hidden="true" />
        </button>
      )}

      {postMenuId !== null && (
        <div className="fixed inset-0 z-20" aria-hidden="true" onClick={() => setPostMenuId(null)} />
      )}

      <AnimatePresence>
        {editingPost && (
          <motion.div
            key="edit-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end"
            onClick={(e) => { if (e.target === e.currentTarget) setEditingPost(null); }}
          >
            <motion.div
              ref={editModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-post-title"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="bg-white w-full rounded-t-3xl p-6 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 id="edit-post-title" className="text-xl text-gray-900">Editar Publicação</h2>
                <button onClick={() => setEditingPost(null)} aria-label="Fechar edição" className="focus-visible:ring-2 focus-visible:ring-red-600 rounded-full p-0.5">
                  <X className="w-6 h-6 text-gray-700" aria-hidden="true" />
                </button>
              </div>
              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-2">Categoria <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {categoryOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = editCategory === opt.key;
                    return (
                      <button key={opt.key} onClick={() => { setEditCategory(opt.key); setEditFormError(null); }} aria-pressed={isSelected}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all focus-visible:ring-2 focus-visible:ring-red-600 ${isSelected ? `${opt.activeBg} ${opt.activeBorder}` : "border border-gray-200 bg-white hover:border-gray-300"}`}>
                        <Icon className={`w-5 h-5 ${isSelected ? opt.color : "text-gray-400"}`} />
                        <span className={`text-xs ${isSelected ? opt.color : "text-gray-500"}`}>{opt.key}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">Conteúdo <span className="text-red-500">*</span></label>
                <textarea value={editContent} onChange={(e) => { setEditContent(e.target.value); if (editFormError) setEditFormError(null); }}
                  className={`w-full min-h-32 p-3 border rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${editFormError && editContent.trim().length < 10 ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                <span className={`text-xs mt-1 block ${editContent.trim().length === 0 ? "text-gray-400" : editContent.trim().length < 10 ? "text-orange-500" : "text-green-600"}`}>
                  {editContent.length} caracteres {editContent.trim().length >= 10 ? "✓" : "(mín. 10)"}
                </span>
              </div>
              <div className="mb-5">
                <label className="block text-sm text-gray-700 mb-2">Imagem (opcional)</label>
                {editImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={editImage} alt="Preview" className="w-full max-h-48 object-cover" />
                    <button onClick={() => { setEditImage(null); setEditImageName(null); }} aria-label="Remover imagem"
                      className="absolute top-2 right-2 w-7 h-7 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors">
                    <span className="text-sm text-gray-500">Clique para adicionar imagem</span>
                    <span className="text-xs text-gray-400">JPG, PNG ou GIF</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
                  </label>
                )}
              </div>
              {editFormError && (
                <div role="alert" className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-red-500 shrink-0" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm text-red-700">{editFormError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setEditingPost(null)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                <button onClick={handleSaveEdit} className={`flex-1 py-3 rounded-xl text-white text-sm transition-colors ${editCategory && editContent.trim().length >= 10 ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"}`}>Salvar alterações</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowCreatePost(false); resetForm(); } }}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="create-post-title"
            className="bg-white w-full rounded-t-3xl p-6 animate-slide-up max-h-[92vh] overflow-y-auto">
            {publishSuccess ? (
              <div role="status" aria-live="polite" className="flex flex-col items-center py-12 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-green-600" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-gray-800">Publicação criada com sucesso!</p>
                <p className="text-sm text-gray-500">Você já pode ver no feed…</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 id="create-post-title" className="text-xl text-gray-900">Nova Publicação</h2>
                  <button onClick={() => { setShowCreatePost(false); resetForm(); }} aria-label="Fechar modal" className="focus-visible:ring-2 focus-visible:ring-red-600 rounded-full p-0.5">
                    <X className="w-6 h-6 text-gray-700" aria-hidden="true" />
                  </button>
                </div>
                <div className="mb-5">
                  <label className="block text-sm text-gray-700 mb-2">Categoria <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {categoryOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = newCategory === opt.key;
                      return (
                        <button key={opt.key} onClick={() => { setNewCategory(opt.key); setFormError(null); }} aria-pressed={isSelected}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all focus-visible:ring-2 focus-visible:ring-red-600 ${isSelected ? `${opt.activeBg} ${opt.activeBorder}` : "border border-gray-200 bg-white hover:border-gray-300"}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? opt.color : "text-gray-400"}`} />
                          <span className={`text-xs ${isSelected ? opt.color : "text-gray-500"}`}>{opt.key}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-2">Conteúdo <span className="text-red-500">*</span></label>
                  <textarea value={newContent} onChange={(e) => { setNewContent(e.target.value); if (formError) setFormError(null); }}
                    placeholder="Descreva sua dúvida ou compartilhe informações..."
                    className={`w-full min-h-32 p-3 border rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${formError && newContent.trim().length < 10 ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                  <span className={`text-xs mt-1 block ${newContent.trim().length === 0 ? "text-gray-400" : newContent.trim().length < 10 ? "text-orange-500" : "text-green-600"}`}>
                    {newContent.length} caracteres {newContent.trim().length >= 10 ? "✓" : "(mín. 10)"}
                  </span>
                </div>
                <div className="mb-5">
                  <label className="block text-sm text-gray-700 mb-2">Imagem (opcional)</label>
                  {newImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200">
                      <img src={newImage} alt="Preview" className="w-full max-h-48 object-cover" />
                      <button onClick={() => { setNewImage(null); setNewImageName(null); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </button>
                      {newImageName && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 px-3 py-1.5">
                          <p className="text-xs text-white truncate">{newImageName}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4 16l4-4a3 3 0 014.24 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-500">Clique para adicionar imagem</span>
                      <span className="text-xs text-gray-400">JPG, PNG ou GIF</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
                {formError && (
                  <div role="alert" className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-red-500 shrink-0" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                    </svg>
                    <p className="text-sm text-red-700">{formError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setShowCreatePost(false); resetForm(); }} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button onClick={handlePublish} className={`flex-1 py-3 rounded-xl text-white text-sm transition-colors ${newCategory && newContent.trim().length >= 10 ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"}`}>Publicar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-4 pt-2 z-10">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {bottomNavItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} aria-current={isActive ? "page" : undefined} aria-label={label}
                className="flex flex-col items-center gap-0.5 relative px-2 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 rounded-lg">
                {isActive && <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-600" aria-hidden="true" />}
                <Icon className={`w-6 h-6 transition-colors ${isActive ? "text-red-600" : "text-gray-400"}`} aria-hidden="true" />
                <span className={`text-xs transition-colors ${isActive ? "text-red-600" : "text-gray-400"}`} aria-hidden="true">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {openCommentsPost && (
        <CommentsPanel
          post={{ id: openCommentsPost.id, author: openCommentsPost.author, category: openCommentsPost.category, categoryIcon: openCommentsPost.categoryIcon, content: openCommentsPost.content, comments: openCommentsPost.comments }}
          db={db}
          user={user}
          onCountChange={(count) => handleCommentCountChange(openCommentsPost.id, count)}
          onClose={() => setOpenCommentsPost(null)}
        />
      )}

      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={() => setUnreadCount(0)}
          onGoToPost={(postId) => { setShowNotifications(false); setActiveTab("home"); setSelectedCategory("all"); }}
        />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            key="save-toast"
            initial={{ y: 16, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="fixed left-4 right-4 z-20 flex items-center justify-between gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-xl"
            style={{ bottom: "88px" }}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm leading-tight">{toast.message}</p>
            {toast.action && (
              <button onClick={toast.action.onClick} className="text-red-400 text-sm shrink-0 hover:text-red-300 transition-colors">
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        :focus-visible { outline: 2.5px solid #dc2626; outline-offset: 2px; border-radius: 6px; }
        :focus:not(:focus-visible) { outline: none; }
      `}</style>
    </div>
  );
}
