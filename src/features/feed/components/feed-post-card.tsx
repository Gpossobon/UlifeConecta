import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bookmark,
  BookOpen,
  Clock,
  Heart,
  HelpCircle,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import type { FeedPost } from "../types";

type FeedPostCardProps = {
  post: FeedPost;
  liked: boolean;
  saved: boolean;
  justLiked: boolean;
  justSaved: boolean;
  menuOpen: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onOpenComments: () => void;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const CATEGORY_ICONS = { HelpCircle, BookOpen, Clock, MapPin, Users, MessageCircle };

function ImageWithFallback({ src, alt }: { src: string; alt: string }) {
  const [didError, setDidError] = useState(false);
  if (didError) {
    return (
      <div className="mb-3 flex h-48 items-center justify-center rounded-lg bg-gray-100">
        <BookOpen className="h-8 w-8 text-gray-300" aria-label="Imagem indisponível" />
      </div>
    );
  }
  return <img src={src} alt={alt} className="mb-3 max-h-64 w-full rounded-lg object-cover" onError={() => setDidError(true)} />;
}

export function FeedPostCard({
  post,
  liked,
  saved,
  justLiked,
  justSaved,
  menuOpen,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onToggleMenu,
  onEdit,
  onDelete,
}: FeedPostCardProps) {
  const CategoryIcon = CATEGORY_ICONS[post.categoryIcon as keyof typeof CATEGORY_ICONS];

  return (
    <article className="border-b border-gray-200 bg-white">
      <div className="px-4 pb-3 pt-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm">{post.author}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{post.time}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-red-600">
                  {CategoryIcon && <CategoryIcon className="h-4 w-4" aria-hidden="true" />}
                  {post.category}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {post.solved && (
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700" title="Dúvida resolvida">
                <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 shrink-0" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Resolvido
              </span>
            )}
            <div className="relative">
              <button
                onClick={onToggleMenu}
                aria-label="Opções da publicação"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.14 }}
                    role="menu"
                    aria-label="Opções"
                    className="absolute right-0 top-9 z-30 min-w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <button role="menuitem" onClick={onEdit} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50">
                      <Pencil className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      Editar publicação
                    </button>
                    <div className="mx-3 h-px bg-gray-100" />
                    <button role="menuitem" onClick={onDelete} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Excluir publicação
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <p className="mb-3 text-sm leading-relaxed">{post.content}</p>
        {post.image && <ImageWithFallback src={post.image} alt="Imagem da publicação" />}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <div className="flex items-center gap-5">
            <motion.button
              onClick={onToggleLike}
              animate={justLiked ? { scale: [1, 1.4, 0.88, 1] } : { scale: 1 }}
              whileTap={{ scale: 0.75 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              aria-pressed={liked}
              aria-label={`${liked ? "Descurtir" : "Curtir"} — ${post.likes + (liked ? 1 : 0)} curtidas`}
              className="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-red-600"
            >
              <Heart className={`h-5 w-5 transition-colors duration-200 ${liked ? "fill-red-600 text-red-600" : ""}`} />
              <motion.span
                key={post.likes + (liked ? 1 : 0)}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="tabular-nums text-sm"
                aria-hidden="true"
              >
                {post.likes + (liked ? 1 : 0)}
              </motion.span>
            </motion.button>
            <button onClick={onOpenComments} aria-label={`Ver ${post.comments} comentários`} className="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-red-600">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm" aria-hidden="true">{post.comments}</span>
            </button>
          </div>
          <motion.button
            onClick={onToggleSave}
            animate={justSaved ? { scale: [1, 1.3, 0.92, 1] } : { scale: 1 }}
            whileTap={{ scale: 0.75 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            aria-pressed={saved}
            aria-label={saved ? "Remover dos salvos" : "Salvar publicação"}
            className="text-gray-600 transition-colors hover:text-red-600"
          >
            <Bookmark className={`h-5 w-5 transition-colors duration-200 ${saved ? "fill-red-600 text-red-600" : ""}`} />
          </motion.button>
        </div>
      </div>
    </article>
  );
}
