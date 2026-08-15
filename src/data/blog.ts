import type { BlogPost } from "@/types/blog";

export const posts: BlogPost[] = [
  {
    slug: "flutter-socketio-streaming",
    title: "How I built real-time AI streaming in Flutter with Socket.IO",
    date: "2026-04-02",
    tags: ["Flutter", "Socket.IO", "AI", "Streaming"],
    excerpt:
      "A deep-dive into how ORTH streams AI-generated tokens in real time to a Flutter UI using Socket.IO and StreamController.",
    published: true,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPublishedPosts(): BlogPost[] {
  return posts.filter((p) => p.published);
}

export function getLatestPost(): BlogPost | undefined {
  return getPublishedPosts().sort((a, b) => b.date.localeCompare(a.date))[0];
}
