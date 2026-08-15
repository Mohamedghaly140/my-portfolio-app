/** Temporary type-only placeholder until Task 4 lands full block parsers. */

export type ProjectGridBlock = {
  type: "project_grid";
  version: 1;
  slugs: string[];
};

export type SourceListBlock = {
  type: "source_list";
  version: 1;
  slugs: string[];
};

export type LeadFormBlock = {
  type: "lead_form";
  version: 1;
  draft: {
    opportunityType: string | null;
    summary: string | null;
    technologies: string[];
    timeline: string | null;
    projectStage: string | null;
    primaryTechnicalProblem: string | null;
  };
};

export type ContactHandoffBlock = {
  type: "contact_handoff";
  version: 1;
  status: "ready" | "submitted" | "failed";
  leadReference?: string;
};
