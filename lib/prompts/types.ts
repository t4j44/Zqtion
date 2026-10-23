export type PromptContentType = "ui-design" | "image" | "vibe-coding" | "video" | "automation" | "agent" | "mcp" | "marketing" | "productivity" | "education";
export type PromptVariable = { key: string; label: string; defaultValue: string; hint: string };
export type Prompt = {
  id: string; slug: string; locale: "en"; title: string; description: string; answerFirstSummary: string;
  category: string; contentType: PromptContentType; tags: string[]; tools: string[];
  difficulty: "beginner" | "intermediate" | "advanced"; style: string; useCases: string[]; audiences: string[];
  prompt: string; variables: PromptVariable[];
  specification: Record<string, string>;
  learning: { whyItWorks: string; anatomy: { label: string; explanation: string }[]; mistakes: string[]; tips: string[]; methodIds: string[]; lessonId?: string };
  example: { input: string; expected: string };
  preview: { type: "static-ui" | "image" | "interactive" | "code" | "none"; variant: string; label: string };
  createdAt: string; updatedAt: string; author: string;
  seo: { title: string; description: string; canonicalPath: string };
};
export type PromptCardData = Pick<Prompt, "id" | "slug" | "title" | "description" | "category" | "tags" | "tools" | "difficulty" | "style" | "preview">;
export type PromptFilters = { q?: string; category?: string; tool?: string; difficulty?: string; style?: string; saved?: string[]; page?: number };
export type PromptMethod = { slug: string; title: string; description: string; definition: string; formula: string[]; steps: string[]; before: string; after: string; mistakes: string[]; when: string; faq: { question: string; answer: string }[]; related: string[] };
