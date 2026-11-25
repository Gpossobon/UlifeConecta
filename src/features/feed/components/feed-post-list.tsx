import {
  Check,
  CircleAlert,
  Plus,
} from "lucide-react";
import { FeedPostCard } from "./feed-post-card";
import type { FeedPost, FeedStatus } from "../types";

type FeedPostListProps = {
  posts: FeedPost[];
  status: FeedStatus;
  likedPosts: Set<number>;
  savedPosts: Set<number>;
  justLiked: Set<number>;
  justSaved: Set<number>;
  openMenuId: number | null;
  onRetry: () => void;
  onToggleLike: (id: number) => void;
  onToggleSave: (id: number) => void;
  onOpenComments: (post: FeedPost) => void;
  onToggleMenu: (id: number) => void;
  onEdit: (post: FeedPost) => void;
  onDelete: (id: number) => void;
};

function SkeletonCard() {
  return (
    <article className="animate-pulse border-b border-gray-200 bg-white px-4 py-4" aria-hidden="true">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-2/5 rounded-full bg-gray-200" />
          <div className="h-2.5 w-1/4 rounded-full bg-gray-100" />
        </div>
      </div>
      <div className="mb-3 space-y-2">
        <div className="h-3 w-full rounded-full bg-gray-100" />
        <div className="h-3 w-5/6 rounded-full bg-gray-100" />
        <div className="h-3 w-3/4 rounded-full bg-gray-100" />
      </div>
      <div className="flex gap-5 border-t border-gray-100 pt-2">
        <div className="h-5 w-10 rounded-full bg-gray-100" />
        <div className="h-5 w-10 rounded-full bg-gray-100" />
      </div>
    </article>
  );
}

function FeedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 px-6 py-14">
      <CircleAlert className="h-14 w-14 text-red-500" aria-hidden="true" />
      <div className="text-center">
        <p className="mb-1 text-gray-800">Não foi possível carregar o feed</p>
        <p className="text-sm text-gray-500">Verifique sua conexão e tente novamente.</p>
      </div>
      <button onClick={onRetry} className="rounded-full bg-red-600 px-5 py-2.5 text-sm text-white transition hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
        Tentar novamente
      </button>
    </div>
  );
}

function FeedEmpty() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14">
      <Plus className="h-14 w-14 text-gray-300" aria-hidden="true" />
      <p className="text-center text-gray-600">Nenhuma publicação ainda</p>
      <p className="text-center text-xs text-gray-400">Seja o primeiro a publicar nesta categoria!</p>
    </div>
  );
}

function FeedCompletionNotice() {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8">
      <div className="flex w-full max-w-xs items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
          <Check className="h-4 w-4 text-red-600" aria-hidden="true" />
        </div>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <p className="text-center text-sm text-gray-400">Você está em dia com o feed!</p>
      <p className="text-center text-xs text-gray-300">Todas as publicações foram exibidas</p>
    </div>
  );
}

export function FeedPostList(props: FeedPostListProps) {
  if (props.status === "loading") {
    return (
      <section aria-label="Carregando publicações" aria-busy="true">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </section>
    );
  }
  if (props.status === "error") return <FeedError onRetry={props.onRetry} />;
  if (props.posts.length === 0) return <FeedEmpty />;

  return (
    <>
      {props.posts.map((post) => (
        <FeedPostCard
          key={post.id}
          post={post}
          liked={props.likedPosts.has(post.id)}
          saved={props.savedPosts.has(post.id)}
          justLiked={props.justLiked.has(post.id)}
          justSaved={props.justSaved.has(post.id)}
          menuOpen={props.openMenuId === post.id}
          onToggleLike={() => props.onToggleLike(post.id)}
          onToggleSave={() => props.onToggleSave(post.id)}
          onOpenComments={() => props.onOpenComments(post)}
          onToggleMenu={() => props.onToggleMenu(post.id)}
          onEdit={() => props.onEdit(post)}
          onDelete={() => props.onDelete(post.id)}
        />
      ))}
      <FeedCompletionNotice />
    </>
  );
}
