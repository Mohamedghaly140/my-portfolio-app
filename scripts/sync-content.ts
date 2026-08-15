/// <reference types="bun" />
/**
 * Sync portfolio content from the sibling web repo into src/data + src/types.
 *
 * Source of truth: ~/projects/my-portfolio (or PORTFOLIO_WEB_REPO_PATH).
 * Re-running overwrites the target files — do not hand-edit synced outputs.
 */

import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");

const DATA_MODULES = [
  "contact.ts",
  "projects.ts",
  "blog.ts",
  "skills.ts",
  "education.ts",
  "courses.ts",
  "experience.ts",
] as const;

const TYPE_MODULES = [
  "project.ts",
  "blog.ts",
  "skill.ts",
  "education.ts",
  "course.ts",
] as const;

const LANGUAGE_TYPES_APPENDIX = `
export type LanguageProficiency =
  | "Native"
  | "Professional Working Proficiency";

export interface LanguageItem {
  name: string;
  level: LanguageProficiency;
}
`;

function isDirectory(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile();
}

function resolveSourceRepo(): string {
  const fromEnv = process.env.PORTFOLIO_WEB_REPO_PATH?.trim();
  const path =
    fromEnv && fromEnv.length > 0
      ? resolve(fromEnv)
      : join(homedir(), "projects", "my-portfolio");

  if (!isDirectory(path)) {
    throw new Error(
      `Portfolio web repo not found at ${path}. Set PORTFOLIO_WEB_REPO_PATH or clone it to ~/projects/my-portfolio.`,
    );
  }
  return path;
}

function readText(path: string): string {
  if (!isFile(path)) {
    throw new Error(`Missing source file: ${path}`);
  }
  return readFileSync(path, "utf8");
}

/** Rewrite import specifiers so they resolve under this app's `@/*` → `src/*`. */
function rewriteImports(source: string): string {
  return source.replace(
    /from\s+(["'])([^"']+)\1/g,
    (_full, quote: string, specifier: string) => {
      const next = rewriteSpecifier(specifier);
      return `from ${quote}${next}${quote}`;
    },
  );
}

function rewriteSpecifier(specifier: string): string {
  // Web repo `@/lib/data/...` → app `@/data/...`
  if (specifier.startsWith("@/lib/data/")) {
    return `@/data/${specifier.slice("@/lib/data/".length)}`;
  }
  // Web root `@/types/...` already matches app `src/types/...` under `@/*`.
  if (specifier.startsWith("@/types/") || specifier.startsWith("@/data/")) {
    return specifier;
  }
  return specifier;
}

function collectImportSpecifiers(source: string): string[] {
  const specs = new Set<string>();
  const fromRe = /\bfrom\s+(["'])([^"']+)\1/g;
  const sideEffectRe = /^import\s+(["'])([^"']+)\1/gm;
  let match: RegExpExecArray | null;
  while ((match = fromRe.exec(source)) !== null) {
    specs.add(match[2]!);
  }
  while ((match = sideEffectRe.exec(source)) !== null) {
    specs.add(match[2]!);
  }
  return [...specs];
}

function loadAllowedPackages(): Set<string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  return new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
}

function packageNameFromSpecifier(specifier: string): string {
  if (specifier.startsWith("@")) {
    const parts = specifier.split("/");
    return parts.slice(0, 2).join("/");
  }
  return specifier.split("/")[0]!;
}

function assertSafeImports(
  path: string,
  source: string,
  allowed: Set<string>,
): void {
  for (const specifier of collectImportSpecifiers(source)) {
    if (specifier.startsWith("./") || specifier.startsWith("../")) continue;
    if (specifier.startsWith("@/types/") || specifier.startsWith("@/data/")) {
      continue;
    }
    if (specifier.startsWith("@/")) {
      throw new Error(
        `Unsafe import in ${relative(ROOT, path)}: "${specifier}". Only @/types/* and @/data/* aliases are allowed.`,
      );
    }
    const pkgName = packageNameFromSpecifier(specifier);
    if (!allowed.has(pkgName)) {
      throw new Error(
        `Unsafe import in ${relative(ROOT, path)}: "${specifier}" (package "${pkgName}" is not in this app's package.json). Refusing to sync a server-only or unknown module.`,
      );
    }
  }
}

function splitExperience(source: string): { typeFile: string; dataFile: string } {
  const interfaceMatch = source.match(
    /export interface ExperienceItem \{[\s\S]*?\n\}/,
  );
  if (!interfaceMatch) {
    throw new Error(
      "Could not find `export interface ExperienceItem` in experience.ts",
    );
  }
  const typeFile = `${interfaceMatch[0]}\n`;
  const withoutInterface = source
    .replace(interfaceMatch[0], "")
    .replace(/^\n+/, "");
  const dataFile = `import type { ExperienceItem } from "@/types/experience";\n\n${withoutInterface}`;
  return { typeFile, dataFile };
}

function appendLanguageTypes(skillSource: string): string {
  if (skillSource.includes("export type LanguageProficiency")) {
    return ensureTrailingNewline(skillSource);
  }
  return ensureTrailingNewline(
    `${skillSource.trimEnd()}\n${LANGUAGE_TYPES_APPENDIX}`,
  );
}

function typeLanguagesExport(skillsSource: string): string {
  let next = skillsSource;
  if (!/\bLanguageItem\b/.test(next)) {
    next = next.replace(
      /import type \{ SkillCategory \} from ["']@\/types\/skill["'];/,
      'import type { LanguageItem, SkillCategory } from "@/types/skill";',
    );
  }
  next = next.replace(
    /export const languages(?!\s*:\s*LanguageItem\[\])\s*=/,
    "export const languages: LanguageItem[] =",
  );
  return next;
}

function ensureTrailingNewline(text: string): string {
  return text.endsWith("\n") ? text : `${text}\n`;
}

async function writeText(path: string, contents: string): Promise<void> {
  await Bun.write(path, ensureTrailingNewline(contents));
}

async function main(): Promise<void> {
  const sourceRepo = resolveSourceRepo();
  const allowed = loadAllowedPackages();

  mkdirSync(join(ROOT, "src", "data"), { recursive: true });
  mkdirSync(join(ROOT, "src", "types"), { recursive: true });

  const written: string[] = [];

  for (const name of TYPE_MODULES) {
    const srcPath = join(sourceRepo, "types", name);
    const destPath = join(ROOT, "src", "types", name);
    let contents = rewriteImports(readText(srcPath));
    if (name === "skill.ts") {
      contents = appendLanguageTypes(contents);
    }
    assertSafeImports(destPath, contents, allowed);
    await writeText(destPath, contents);
    written.push(relative(ROOT, destPath));
  }

  for (const name of DATA_MODULES) {
    const srcPath = join(sourceRepo, "lib", "data", name);
    const destPath = join(ROOT, "src", "data", name);
    const raw = readText(srcPath);

    if (name === "experience.ts") {
      const { typeFile, dataFile } = splitExperience(raw);
      const typeDest = join(ROOT, "src", "types", "experience.ts");
      const typed = rewriteImports(typeFile);
      const data = rewriteImports(dataFile);
      assertSafeImports(typeDest, typed, allowed);
      assertSafeImports(destPath, data, allowed);
      await writeText(typeDest, typed);
      await writeText(destPath, data);
      written.push(relative(ROOT, typeDest), relative(ROOT, destPath));
      continue;
    }

    let contents = rewriteImports(raw);
    if (name === "skills.ts") {
      contents = typeLanguagesExport(contents);
    }
    assertSafeImports(destPath, contents, allowed);
    await writeText(destPath, contents);
    written.push(relative(ROOT, destPath));
  }

  console.log(`Synced ${written.length} files from ${sourceRepo}:`);
  for (const file of written) {
    console.log(`  ${file}`);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
