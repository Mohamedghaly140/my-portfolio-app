import type { Project } from "@/types/project";

/**
 * Bundled cover images keyed by project slug.
 * Requires are lazy so plain `bun test` can import this module's data
 * without resolving Metro assets. Slugs without an entry use a letter avatar (M3).
 *
 * App-only: kept out of `src/data/projects.ts` (and `scripts/sync-content.ts`'s
 * `DATA_MODULES`) so re-running `bun run sync-content` never overwrites it.
 */
export const projectCoverImages: Partial<
  Record<Project["slug"], ReturnType<typeof require>>
> = {
  get "orth-app"() {
    return require("@/assets/projects/orth.webp");
  },
  get "vimi-app"() {
    return require("@/assets/projects/vimi.webp");
  },
  get "meshwarak-app"() {
    return require("@/assets/projects/meshwarak.webp");
  },
  get "aydi-field-app"() {
    return require("@/assets/projects/aydi-field.webp");
  },
  get "aydi-business"() {
    return require("@/assets/projects/aydi-business.webp");
  },
};
