import type { FeedPost } from "../types";

const DEMO_POSTS: FeedPost[] = [
  { id: 1, author: "Carlos Mendes", category: "Dúvida", categoryIcon: "HelpCircle", time: "15min", content: "Alguém sabe qual sala é a aula de Cálculo II hoje? O app da faculdade não está atualizando...", likes: 12, comments: 8, solved: false },
  { id: 2, author: "Beatriz Lima (Veterana)", category: "Material", categoryIcon: "BookOpen", time: "1h", content: "Resumo completo de Álgebra Linear que eu fiz no semestre passado. Pode ajudar quem está estudando para a P1! 📚", image: "https://images.unsplash.com/photo-1761546571631-a4d61b55cd2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZXh0Ym9vayUyMG5vdGVzJTIwc3R1ZHl8ZW58MXx8fHwxNzc3MzE0MTcyfDA&ixlib=rb-4.1.0&q=80&w=1080", likes: 45, comments: 12, solved: false },
  { id: 3, author: "Mariana Santos", category: "Horário", categoryIcon: "Clock", time: "2h", content: "ATENÇÃO: Aula de Física III amanhã será às 10h ao invés de 8h. Sala B-203.", likes: 23, comments: 5, solved: false },
  { id: 4, author: "Pedro Oliveira (Veterano)", category: "Sala", categoryIcon: "MapPin", time: "3h", content: "Galera do 3º período, a sala C-105 mudou de prédio. Agora é no Bloco D, sala 105. Não se percam!", likes: 18, comments: 4, solved: true },
  { id: 5, author: "Julia Ferreira", category: "Grupo de Estudo", categoryIcon: "Users", time: "5h", content: "Montando grupo de estudos para a prova de Programação. Quem tiver interesse, chama no direct!", likes: 31, comments: 15, solved: false },
];

export function getInitialFeedPosts() {
  return DEMO_POSTS.map((post) => ({ ...post }));
}

export function createFeedPost(input: {
  category: string;
  categoryIcon: string;
  content: string;
  image?: string;
}): FeedPost {
  return {
    id: Date.now(),
    author: "Você",
    category: input.category,
    categoryIcon: input.categoryIcon,
    time: "agora",
    content: input.content.trim(),
    image: input.image,
    likes: 0,
    comments: 0,
    solved: false,
  };
}

export function updateFeedPost(posts: FeedPost[], id: number, updates: Partial<FeedPost>) {
  return posts.map((post) => post.id === id ? { ...post, ...updates } : post);
}

export function removeFeedPost(posts: FeedPost[], id: number) {
  return {
    deleted: posts.find((post) => post.id === id),
    posts: posts.filter((post) => post.id !== id),
  };
}

export function restoreFeedPost(posts: FeedPost[], post: FeedPost) {
  return posts.some((current) => current.id === post.id) ? posts : [post, ...posts];
}
