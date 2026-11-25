export type FeedPost = {
  id: number;
  author: string;
  category: string;
  categoryIcon: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  solved: boolean;
  image?: string;
};

export type FeedStatus = "loading" | "ready" | "error";
export type FeedCategory = "all" | "duvida" | "material" | "horario" | "sala" | "veteranos" | "forum";
export type BottomTab = "home" | "search" | "veterans" | "content" | "profile";
