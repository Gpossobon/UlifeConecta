import { useCallback, useEffect, useState } from "react";
import {
  createFeedPost,
  getInitialFeedPosts,
  removeFeedPost,
  restoreFeedPost,
  updateFeedPost,
} from "../services/feed-service";
import type { FeedPost, FeedStatus } from "../types";

export function useFeed() {
  const [posts, setPosts] = useState<FeedPost[]>(getInitialFeedPosts);
  const [likedPosts, setLikedPosts] = useState(new Set<number>());
  const [savedPosts, setSavedPosts] = useState(new Set<number>());
  const [justLiked, setJustLiked] = useState(new Set<number>());
  const [justSaved, setJustSaved] = useState(new Set<number>());
  const [feedStatus, setFeedStatus] = useState<FeedStatus>("loading");

  const loadFeed = useCallback(() => {
    setFeedStatus("loading");
    const timer = setTimeout(() => setFeedStatus("ready"), 950);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => loadFeed(), [loadFeed]);

  const toggleLike = useCallback((postId: number) => {
    const wasLiked = likedPosts.has(postId);
    setLikedPosts((previous) => {
      const next = new Set(previous);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
    if (!wasLiked) {
      setJustLiked((previous) => new Set(previous).add(postId));
      setTimeout(() => {
        setJustLiked((previous) => {
          const next = new Set(previous);
          next.delete(postId);
          return next;
        });
      }, 450);
    }
  }, [likedPosts]);

  const toggleSave = useCallback((postId: number) => {
    const wasSaved = savedPosts.has(postId);
    setSavedPosts((previous) => {
      const next = new Set(previous);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
    if (!wasSaved) {
      setJustSaved((previous) => new Set(previous).add(postId));
      setTimeout(() => {
        setJustSaved((previous) => {
          const next = new Set(previous);
          next.delete(postId);
          return next;
        });
      }, 450);
    }
    return !wasSaved;
  }, [savedPosts]);

  const createPost = useCallback((input: {
    category: string;
    categoryIcon: string;
    content: string;
    image?: string;
  }) => {
    const post = createFeedPost(input);
    setPosts((previous) => [post, ...previous]);
    return post;
  }, []);

  const updatePost = useCallback((id: number, updates: Partial<FeedPost>) => {
    setPosts((previous) => updateFeedPost(previous, id, updates));
  }, []);

  const deletePost = useCallback((id: number) => {
    const result = removeFeedPost(posts, id);
    setPosts(result.posts);
    return result.deleted;
  }, [posts]);

  const restorePost = useCallback((post: FeedPost) => {
    setPosts((previous) => restoreFeedPost(previous, post));
  }, []);

  const updateCommentCount = useCallback((postId: number, count: number) => {
    setPosts((previous) => updateFeedPost(previous, postId, { comments: count }));
  }, []);

  return {
    posts,
    likedPosts,
    savedPosts,
    justLiked,
    justSaved,
    feedStatus,
    loadFeed,
    toggleLike,
    toggleSave,
    createPost,
    updatePost,
    deletePost,
    restorePost,
    updateCommentCount,
  };
}
