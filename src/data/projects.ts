import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    slug: "orth-app",
    title: "ORTH App",
    category: "Mobile App",
    categories: ["mobile", "ai"],
    description:
      "AI-powered agronomy assistant with real-time streaming responses, audio playback, and clean architecture.",
    year: 2025,
    status: "Live",
    tags: ["Flutter", "Socket.IO", "Clean Architecture", "Cubit", "Freezed"],
    featured: true,
    coverImage: {
      src: "/projects/orth.webp",
      width: 400,
      height: 400,
      alt: "ORTH agronomy assistant mobile app interface",
    },
    appstoreUrl: "https://apps.apple.com/us/app/orth/id6754557886",
    playstoreUrl: "https://play.google.com/store/apps/details?id=com.aydi.orth.app",
    company: "Aydi Technologies",
  },
  {
    slug: "vimi-app",
    title: "VIMI App",
    category: "Mobile App",
    categories: ["mobile"],
    description:
      "Full-featured e-commerce app with dual-role access — shoppers browse and order, while admins manage the entire store from a dedicated mobile dashboard.",
    year: 2023,
    status: "Live",
    tags: ["Flutter", "BLoC", "Clean Architecture", "E-Commerce", "Multi-Role"],
    featured: true,
    coverImage: {
      src: "/projects/vimi.webp",
      width: 400,
      height: 400,
      alt: "VIMI e-commerce mobile app storefront interface",
    },
    appstoreUrl: "https://apps.apple.com/eg/app/vimi-store/id6740061265",
    company: "Freelance",
  },
  {
    slug: "meshwarak-app",
    title: "Meshwarak App",
    category: "Mobile App",
    categories: ["mobile"],
    description: "Stop searching and start your journey with Meshwarak, the app that brings you the best ride offers from different ride-hailing companies in one place!",
    year: 2024,
    status: "Live",
    tags: ["Flutter", "Bloc/Cubit", "Clean Architecture"],
    featured: false,
    coverImage: {
      src: "/projects/meshwarak.webp",
      width: 400,
      height: 400,
      alt: "Meshwarak ride comparison mobile app interface",
    },
    appstoreUrl: "https://apps.apple.com/eg/app/meshwarak-%D9%85%D8%B4%D9%88%D8%A7%D8%B1%D9%83/id6450388462",
    company: "Freelance",
  },
  {
    slug: "aydi-field-app",
    title: "Aydi Field App",
    category: "Mobile App",
    categories: ["mobile"],
    description:
      "Simplify your field operations and record-keeping. Built with an offline-first architecture so field workers stay productive with or without connectivity.",
    year: 2023,
    status: "Live",
    tags: ["Flutter", "GetX", "SQLite", "Offline-First", "REST APIs", "Clean Architecture", "Multi-Role"],
    featured: false,
    coverImage: {
      src: "/projects/aydi-field.webp",
      width: 480,
      height: 480,
      alt: "Aydi Field mobile app for agricultural field operations",
    },
    playstoreUrl: "https://play.google.com/store/apps/details?id=com.aydi.field.app",
    company: "Aydi Technologies",
  },
  {
    slug: "aydi-business",
    title: "Aydi Business",
    category: "Mobile App",
    categories: ["mobile"],
    description:
      "The essential software solution to streamline your field operations and enable you to effortlessly control your costs, resources and data.",
    year: 2022,
    status: "Live",
    tags: ["Flutter", "Bloc/Cubit", "REST APIs", "Clean Architecture", "Multi-Role"],
    featured: true,
    coverImage: {
      src: "/projects/aydi-business.webp",
      width: 400,
      height: 400,
      alt: "Aydi Business mobile operations dashboard interface",
    },
    playstoreUrl: "https://play.google.com/store/apps/details?id=com.aydi.business.app",
    appstoreUrl: "https://apps.apple.com/eg/app/aydi-business/id6443989185",
    company: "Aydi Technologies",
  },
  {
    slug: "sagar-app",
    title: "Sagar App",
    category: "Mobile App",
    categories: ["mobile"],
    description:
      "Real-time chat application with instant messaging, built on Socket.IO for live communication and React Query for efficient data synchronization.",
    year: 2023,
    status: "Live",
    tags: ["React Native", "Socket.IO", "React Query", "Real-time"],
    featured: false,
    company: "WhyNotTech",
  },
  {
    slug: "aydi-eye",
    title: "Aydi Eye",
    category: "Web App",
    categories: ["frontend"],
    description:
      "Company portal for Aydi Eye — contributed to feature development, bug fixes, and performance optimization using React, Next.js, and React Query.",
    year: 2023,
    status: "Live",
    tags: ["React", "Next.js", "React Query", "TypeScript"],
    featured: false,
    liveUrl: "https://eye.aydi.com/",
    company: "Aydi Technologies",
  },
  {
    slug: "aydi-admin-dashboard",
    title: "Aydi Admin Dashboard",
    category: "Web App",
    categories: ["frontend"],
    description:
      "Admin dashboard built with React and Next.js. Collaborated with PMs and UI/UX teams to deliver reusable components and server-side authentication for enhanced security.",
    year: 2022,
    status: "Live",
    tags: ["React", "Next.js", "TypeScript", "Authentication"],
    featured: false,
    liveUrl: "https://admin.aydi.com/",
    company: "Aydi Technologies",
  },
  {
    slug: "vts-website",
    title: "VTS Website",
    category: "Web App",
    categories: ["frontend", "backend"],
    description:
      "Redesigned VTS's website with localization support, user-centric design, and a contact form backed by Node.js and MongoDB.",
    year: 2021,
    status: "Live",
    tags: ["React", "Node.js", "MongoDB", "Localization"],
    featured: false,
    liveUrl: "https://visionalization.com/",
    company: "VTS",
  },
  {
    slug: "ghadan-website",
    title: "Ghadan Website",
    category: "Web App",
    categories: ["frontend"],
    description:
      "Led the redesign of the Ghadan company website, delivering an updated and engaging user experience.",
    year: 2020,
    status: "Live",
    tags: ["React"],
    featured: false,
    liveUrl: "https://ghadan.co/",
    company: "VTS",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}
