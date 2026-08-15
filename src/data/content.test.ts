import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

import { posts } from "./blog";
import { courses } from "./courses";
import { education } from "./education";
import { experience } from "./experience";
import { projects } from "./projects";
import { skillCategories } from "./skills";

/** Slugs with a bundled cover under assets/projects/ (filename = slug's cover basename). */
const COVERED_SLUGS: Record<string, string> = {
  "orth-app": "orth.webp",
  "vimi-app": "vimi.webp",
  "meshwarak-app": "meshwarak.webp",
  "aydi-field-app": "aydi-field.webp",
  "aydi-business": "aydi-business.webp",
};

const ASSETS_PROJECTS_DIR = join(import.meta.dir, "../../assets/projects");

describe("M2 content layer exit criteria", () => {
  test("projects has exactly 10 records", () => {
    expect(projects).toHaveLength(10);
  });

  test("experience has exactly 3 records", () => {
    expect(experience).toHaveLength(3);
  });

  test("education has exactly 2 records", () => {
    expect(education).toHaveLength(2);
  });

  test("courses has exactly 5 records", () => {
    expect(courses).toHaveLength(5);
  });

  test("skillCategories has exactly 5 categories totalling exactly 32 skills", () => {
    expect(skillCategories).toHaveLength(5);
    const totalSkills = skillCategories.reduce(
      (sum, category) => sum + category.skills.length,
      0,
    );
    expect(totalSkills).toBe(32);
  });

  test("posts has exactly 1 record", () => {
    expect(posts).toHaveLength(1);
  });

  test("every project slug has a bundled cover file or letter-avatar fallback", () => {
    const coveredSlugs = Object.keys(COVERED_SLUGS);
    expect(coveredSlugs).toHaveLength(5);

    for (const [slug, filename] of Object.entries(COVERED_SLUGS)) {
      const project = projects.find((p) => p.slug === slug);
      expect(project).toBeDefined();
      expect(project?.coverImage).toBeDefined();
      expect(existsSync(join(ASSETS_PROJECTS_DIR, filename))).toBe(true);
    }

    const fallbackSlugs = projects
      .filter((p) => !p.coverImage)
      .map((p) => p.slug)
      .sort();

    expect(fallbackSlugs).toEqual(
      [
        "aydi-admin-dashboard",
        "aydi-eye",
        "ghadan-website",
        "sagar-app",
        "vts-website",
      ].sort(),
    );

    const allSlugs = projects.map((p) => p.slug);
    expect(new Set([...coveredSlugs, ...fallbackSlugs]).size).toBe(10);
    expect(allSlugs.every((slug) => coveredSlugs.includes(slug) || fallbackSlugs.includes(slug))).toBe(
      true,
    );
  });
});
