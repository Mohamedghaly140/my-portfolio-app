import type { LanguageItem, SkillCategory } from "@/types/skill";

export const skillCategories: SkillCategory[] = [
  {
    category: "Mobile",
    skills: [
      { name: "Flutter", level: "Expert" },
      { name: "Dart", level: "Expert" },
      { name: "React Native", level: "Proficient" },
      { name: "GetX", level: "Proficient" },
      { name: "Bloc / Cubit", level: "Expert" },
      { name: "Cross-Platform", level: "Expert" },
    ],
  },
  {
    category: "Frontend",
    skills: [
      { name: "React", level: "Expert" },
      { name: "Next.js", level: "Expert" },
      { name: "TypeScript", level: "Expert" },
      { name: "JavaScript", level: "Expert" },
      { name: "HTML5", level: "Expert" },
      { name: "CSS3", level: "Expert" },
      { name: "Tailwind CSS", level: "Expert" },
      { name: "Bootstrap", level: "Proficient" },
      { name: "Redux / Zustand", level: "Proficient" },
    ],
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js", level: "Proficient" },
      { name: "Express.js", level: "Proficient" },
      { name: "NestJS", level: "Proficient" },
      { name: "MongoDB", level: "Proficient" },
      { name: "Socket.IO", level: "Proficient" },
      { name: "RESTful APIs", level: "Expert" },
      { name: "Firebase", level: "Proficient" },
    ],
  },
  {
    category: "Architecture",
    skills: [
      { name: "Clean Architecture", level: "Expert" },
      { name: "OOP / SOLID", level: "Expert" },
      { name: "Freezed", level: "Expert" },
      { name: "GetIt", level: "Proficient" },
    ],
  },
  {
    category: "Tools & AI",
    skills: [
      { name: "Git & GitHub", level: "Expert" },
      { name: "Claude Code", level: "Expert" },
      { name: "Cursor", level: "Expert" },
      { name: "Codex", level: "Expert" },
      { name: "Unit Testing", level: "Proficient" },
      { name: "Docker", level: "Familiar" },
    ],
  },
];

export const softSkills = [
  "Ability to wear many hats and learn new technologies quickly",
  "Creative Problem Solving",
  "Time Management",
  "Attention to Details",
  "Team Player",
  "Self-learner",
];

export const languages: LanguageItem[] = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "Professional Working Proficiency" },
];
