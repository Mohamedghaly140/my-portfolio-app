export type SkillLevel = "Expert" | "Proficient" | "Familiar";

export interface Skill {
  name: string;
  level?: SkillLevel;
}

export interface SkillCategory {
  category: string;
  skills: Skill[];
}

export type LanguageProficiency =
  | "Native"
  | "Professional Working Proficiency";

export interface LanguageItem {
  name: string;
  level: LanguageProficiency;
}
