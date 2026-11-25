import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, Plus, Home, Search,
  Bell, User, X, BookOpen, Clock, MapPin, Users, HelpCircle, Bookmark,
} from "lucide-react";
import { DuvidasPage } from "../community/duvidas-page";
import { HorariosPage } from "../community/horarios-page";
import { SalasPage } from "../community/salas-page";
import { VeteranosPage } from "../community/veteranos-page";
import { ForumPage } from "../community/forum-page";
import { BuscarPage } from "../search/buscar-page";
import { ConteudoPage } from "../content/components/conteudo-page";
import { PerfilPage } from "../profile/perfil-page";
import { CommentsPanel } from "../comments/components/comments-panel";
import { NotificationsPanel }  from "../notifications/notifications-panel";
import { useFirebaseAuth } from "../auth/firebase-auth";
import { useFeed } from "./hooks/use-feed";
import { CommunitySidebar } from "./components/community-sidebar";
import { FeedPostList } from "./components/feed-post-list";
import { useFocusTrap } from "./hooks/use-focus-trap";
import type { BottomTab, FeedCategory, FeedPost } from "./types";

export default function MobileFeed() {
  const { user, db, signOutUser } = useFirebaseAuth();
  const [activeTab, setActiveTab]           = useState<BottomTab>("home");
  const [profileSection, setProfileSection] = useState<"posts" | "salvos">("posts");
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>("all");
  const feed = useFeed();
  const { posts, likedPosts, savedPosts, justLiked, justSaved } = feed;
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, action?: { label: string; onClick: () => void }) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, action });
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  };

  const fabRef        = useRef<HTMLButtonElement>(null);
  const modalRef      = useRef<HTMLDivElement>(null);
  const prevModalOpen = useRef(false);
  const [openCommentsPost, setOpenCommentsPost] = useState<FeedPost | null>(null);
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
  const [editingPost, setEditingPost]         = useState<FeedPost | null>(null);
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

  const sideNavItems: { id: BottomTab | "notifications" | "saved"; label: string; icon: any }[] = [
    { id: "home",          label: "Início",        icon: Home },
    { id: "search",        label: "Buscar",        icon: Search },
    { id: "notifications", label: "Notificações",  icon: Bell },
    { id: "saved",         label: "Salvos",        icon: Bookmark },
    { id: "veterans",      label: "Veteranos",     icon: Users },
    { id: "content",       label: "Conteúdo",      icon: BookOpen },
    { id: "profile",       label: "Perfil",        icon: User },
  ];

  const tabTitles: Record<BottomTab, string | null> = {
    home: null, search: "Buscar", veterans: "Veteranos", content: "Conteúdo", profile: "Perfil",
  };

  const toggleSave = (postId: number) => {
    if (feed.toggleSave(postId)) {
      showToast("Salvo! Acesse em Perfil → Salvos", { label: "Ver salvos", onClick: () => { setToast(null); setActiveTab("profile"); } });
    } else {
      showToast("Removido dos salvos");
    }
  };

  const handleCommentCountChange = (postId: number, count: number) => {
    feed.updateCommentCount(postId, count);
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

  const openEditModal = (post: FeedPost) => {
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
    feed.updatePost(editingPost!.id, {
      content: editContent.trim(),
      category: editCategory,
      categoryIcon: opt?.iconName ?? editingPost!.categoryIcon,
      image: editImage ?? undefined,
    });
    setEditingPost(null);
    showToast("Publicação atualizada!");
  };

  const handleDeletePost = (postId: number) => {
    setPostMenuId(null);
    const deleted = feed.deletePost(postId);
    if (!deleted) return;
    showToast("Publicação excluída", {
      label: "Desfazer",
      onClick: () => {
        feed.restorePost(deleted);
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
    feed.createPost({ category: newCategory, categoryIcon: opt.iconName, content: newContent, image: newImage ?? undefined });
    setPublishSuccess(true);
    setTimeout(() => { setShowCreatePost(false); setActiveTab("home"); setSelectedCategory("all"); resetForm(); }, 1400);
  };

  const goHome = () => { setActiveTab("home"); setSelectedCategory("all"); };
  const isHome = activeTab === "home";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="order-2 flex min-w-0 flex-1 flex-col">
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

      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {activeTab === "search"   && <BuscarPage />}
        {activeTab === "veterans" && <VeteranosPage />}
        {activeTab === "content"  && <ConteudoPage />}
        {activeTab === "profile"  && <PerfilPage savedPostIds={savedPosts} allPosts={posts} user={user} onSignOut={signOutUser} activeSection={profileSection} onActiveSectionChange={setProfileSection} />}
        {activeTab === "home" && (
          <>
            {selectedCategory === "duvida"    && <DuvidasPage />}
            {selectedCategory === "material"  && <ConteudoPage />}
            {selectedCategory === "horario"   && <HorariosPage />}
            {selectedCategory === "sala"      && <SalasPage />}
            {selectedCategory === "veteranos" && <VeteranosPage />}
            {selectedCategory === "forum"     && <ForumPage />}
            {selectedCategory === "all" && (
              <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
                <section className="min-w-0 overflow-hidden rounded-none bg-white lg:rounded-2xl lg:border lg:border-gray-200" aria-label="Feed da comunidade">
                  <FeedPostList
                    posts={posts}
                    status={feed.feedStatus}
                    likedPosts={likedPosts}
                    savedPosts={savedPosts}
                    justLiked={justLiked}
                    justSaved={justSaved}
                    openMenuId={postMenuId}
                    onRetry={feed.loadFeed}
                    onToggleLike={feed.toggleLike}
                    onToggleSave={toggleSave}
                    onOpenComments={setOpenCommentsPost}
                    onToggleMenu={(postId) => setPostMenuId((current) => current === postId ? null : postId)}
                    onEdit={openEditModal}
                    onDelete={handleDeletePost}
                  />
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
            "fixed bottom-24 right-6 w-14 h-14 bg-red-600 rounded-full shadow-lg lg:hidden",
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-4 pt-2 z-10 lg:hidden">
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
      </div>

      <aside className="order-1 hidden h-full w-[300px] shrink-0 flex-col border-r border-gray-200 bg-white lg:flex" aria-label="Navegação principal">
        <div className="border-b border-gray-200 px-7 py-8">
          <button type="button" className="relative text-left" onClick={goHome} aria-label="UlifeConecta — Início">
            <span className="text-2xl font-extrabold tracking-tight text-red-600">UlifeConecta</span>
            <svg className="absolute -bottom-1 left-0 h-2 w-full" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 5 Q 50 0, 100 5 T 200 5" stroke="#dc2626" strokeWidth="2" fill="none" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-5 py-5" aria-label="Menu principal">
          {sideNavItems.map(({ id, label, icon: Icon }) => {
            const isActive = id === "notifications"
              ? showNotifications
              : id === "saved"
                ? activeTab === "profile" && profileSection === "salvos"
                : activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (id === "notifications") {
                    setShowNotifications(true);
                  } else if (id === "saved") {
                    setProfileSection("salvos");
                    setActiveTab("profile");
                  } else if (id === "home") {
                    goHome();
                  } else if (id === "profile") {
                    setProfileSection("posts");
                    setActiveTab("profile");
                  } else {
                    setActiveTab(id);
                  }
                }}
                aria-current={isActive ? "page" : undefined}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                  isActive ? "bg-red-600 text-white" : "text-slate-700 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                <span className="relative flex w-full items-center gap-4">
                  <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                  {id === "notifications" && unreadCount > 0 && (
                    <span className={`ml-auto flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs ${
                      isActive ? "bg-white text-red-600" : "bg-red-600 text-white"
                    }`} aria-label={`${unreadCount} notificações não lidas`}>
                      {unreadCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 p-5">
          <button
            type="button"
            onClick={() => setShowCreatePost(true)}
            aria-haspopup="dialog"
            aria-expanded={showCreatePost}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-600 px-4 py-4 text-base text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <Plus className="h-6 w-6" aria-hidden="true" />
            Nova Publicação
          </button>
        </div>
      </aside>

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
            className="fixed left-4 right-4 z-20 flex items-center justify-between gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3 shadow-xl lg:left-[320px]"
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
