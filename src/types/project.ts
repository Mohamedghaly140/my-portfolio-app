export type ProjectCategory = "mobile" | "frontend" | "backend" | "ai" | "other";

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Project {
  slug: string;
  title: string;
  category: string;
  categories: ProjectCategory[];
  description: string;
  year: number;
  status: "Live" | "In Development" | "Archived";
  tags: string[];
  coverImage?: ProjectImage;
  liveUrl?: string;
  githubUrl?: string;
  playstoreUrl?: string;
  appstoreUrl?: string;
  featured?: boolean;
  company?: string;
}
