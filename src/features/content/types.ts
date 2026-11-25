export type ContentType = "PDF" | "Vídeo" | "Slides" | "Link";

export type LearningContent = {
  id: string;
  title: string;
  subject: string;
  type: ContentType;
  author: string;
  description: string;
  rating: number | null;
  featured: boolean;
  tags: string[];
  url: string | null;
};
