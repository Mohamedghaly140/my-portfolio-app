import { z } from "zod";

const canonicalSlug = /^[a-z0-9-]{1,64}$/;
const uniqueSlugsSchema = z
  .array(z.string().regex(canonicalSlug))
  .min(1)
  .max(6)
  .refine((slugs) => new Set(slugs).size === slugs.length, "slugs must be unique");

export const projectGridBlockSchema = z.strictObject({
  type: z.literal("project_grid"),
  version: z.literal(1),
  slugs: uniqueSlugsSchema,
});

export const sourceListBlockSchema = z.strictObject({
  type: z.literal("source_list"),
  version: z.literal(1),
  slugs: uniqueSlugsSchema,
});

export const leadFormBlockSchema = z.strictObject({
  type: z.literal("lead_form"),
  version: z.literal(1),
  draft: z.strictObject({
    opportunityType: z.string().nullable(),
    summary: z.string().max(1000).nullable(),
    technologies: z.array(z.string().max(80)).max(20),
    timeline: z.string().max(240).nullable(),
    projectStage: z.string().max(160).nullable(),
    primaryTechnicalProblem: z.string().max(1000).nullable(),
  }),
});

export const contactHandoffBlockSchema = z.strictObject({
  type: z.literal("contact_handoff"),
  version: z.literal(1),
  status: z.enum(["ready", "submitted", "failed"]),
  leadReference: z.string().max(64).optional(),
});

export const toolStatusSchema = z.strictObject({
  version: z.literal(1),
  activeLabel: z.string().min(1).max(60).nullable(),
});

export const chatUIBlockSchema = z.discriminatedUnion("type", [
  projectGridBlockSchema,
  sourceListBlockSchema,
  leadFormBlockSchema,
  contactHandoffBlockSchema,
]);

export type ProjectGridBlock = z.infer<typeof projectGridBlockSchema>;
export type SourceListBlock = z.infer<typeof sourceListBlockSchema>;
export type LeadFormBlock = z.infer<typeof leadFormBlockSchema>;
export type ContactHandoffBlock = z.infer<typeof contactHandoffBlockSchema>;
export type ChatUIBlock = z.infer<typeof chatUIBlockSchema>;
export type ToolStatus = z.infer<typeof toolStatusSchema>;

export const CHAT_BLOCK_DATA_PART_NAME = {
  project_grid: "data-projectGrid",
  source_list: "data-sourceList",
  lead_form: "data-leadForm",
  contact_handoff: "data-contactHandoff",
} as const;

const blockSchemaByDataPartName: Record<string, z.ZodTypeAny> = {
  "data-projectGrid": projectGridBlockSchema,
  "data-sourceList": sourceListBlockSchema,
  "data-leadForm": leadFormBlockSchema,
  "data-contactHandoff": contactHandoffBlockSchema,
};

export type ParsedChatDataPart = { kind: "block"; block: ChatUIBlock } | { kind: "unknown" } | null;

export function parseChatDataPart(part: unknown): ParsedChatDataPart {
  if (typeof part !== "object" || part === null || !("type" in part)) return null;
  const { type } = part as { type: unknown };
  if (typeof type !== "string") return null;
  if (!type.startsWith("data-")) return null;
  if (type === "data-toolStatus") return null;
  // Object.hasOwn, not `in`: part.type is untrusted wire data.
  if (!Object.hasOwn(blockSchemaByDataPartName, type)) return { kind: "unknown" };

  const schema = blockSchemaByDataPartName[type];
  const data = "data" in part ? (part as { data: unknown }).data : undefined;
  const result = schema.safeParse(data);
  return result.success ? { kind: "block", block: result.data as ChatUIBlock } : { kind: "unknown" };
}

export function parseToolStatusPart(part: unknown): ToolStatus | null {
  if (typeof part !== "object" || part === null || !("type" in part)) return null;
  if ((part as { type: unknown }).type !== "data-toolStatus") return null;
  const data = "data" in part ? (part as { data: unknown }).data : undefined;
  const result = toolStatusSchema.safeParse(data);
  return result.success ? result.data : null;
}

export type RenderableChatBlock = { kind: "block"; block: ChatUIBlock } | { kind: "unknown" };

export function chatBlocksFromParts(parts: readonly unknown[]): RenderableChatBlock[] {
  const blocks: RenderableChatBlock[] = [];
  for (const part of parts) {
    const parsed = parseChatDataPart(part);
    if (parsed !== null) blocks.push(parsed);
  }
  return blocks;
}

/** Only visible block identity matters for memoization; invalid payloads share one UI. */
export function chatBlockFingerprint(parts: readonly unknown[]): string {
  return chatBlocksFromParts(parts)
    .map((entry) => {
      if (entry.kind === "unknown") return "unknown";

      const block = entry.block;
      switch (block.type) {
        case "project_grid":
        case "source_list":
          return `${block.type}:v${block.version}:${block.slugs.join(",")}`;
        case "lead_form":
          return `${block.type}:v${block.version}:${JSON.stringify(block.draft)}`;
        case "contact_handoff":
          return `${block.type}:v${block.version}:${block.status}:${block.leadReference ?? ""}`;
      }
    })
    .join("|");
}
