export type InsightSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Insight = {
  slug: string;
  title: string;
  description: string;
  category: "Creative" | "Products" | "Automation";
  published: string;
  readTime: string;
  answer: string;
  sections: InsightSection[];
};

export const insights: Insight[] = [
  {
    slug: "ai-commercial-production-without-losing-the-idea",
    title: "How to use AI in commercial production without losing the idea",
    description:
      "A practical production framework for keeping concept, continuity, and human judgment ahead of tool novelty.",
    category: "Creative",
    published: "2026-08-08",
    readTime: "6 min read",
    answer:
      "Use AI after the communication idea is clear. Lock the audience, single takeaway, story beats, and visual rules first; then generate shots, test continuity, edit for meaning, and disclose synthetic or independent work where relevant.",
    sections: [
      {
        heading: "The failure pattern",
        paragraphs: [
          "AI makes it easy to generate impressive fragments. That is not the same as producing a persuasive commercial. A sequence can look expensive and still fail because the audience, promise, or emotional turn is unclear.",
          "The most common mistake is choosing a model or effect before deciding what the viewer should understand or feel. Tool-first production creates more options but usually weakens the edit.",
        ],
      },
      {
        heading: "Start with a production contract",
        paragraphs: [
          "Before generating anything, define a short creative contract: who the work is for, the one message it must carry, the action it should support, the non-negotiable brand rules, and the channels where it will live.",
        ],
        bullets: [
          "One audience, not everyone",
          "One primary message",
          "Three to five story beats",
          "A small set of continuity rules",
          "A declared approval owner",
        ],
      },
      {
        heading: "Prototype continuity before volume",
        paragraphs: [
          "Generate the hardest connected shots first. If a character, product, environment, or camera transition cannot remain coherent across two or three key moments, a larger shot list will multiply the problem.",
          "A short continuity prototype also exposes where conventional filming, 3D, compositing, or stock may be more reliable than generation.",
        ],
      },
      {
        heading: "Edit for comprehension",
        paragraphs: [
          "The edit should be judged without the production story attached. If a viewer needs to know that the film was made with AI to find it interesting, the idea is probably not strong enough yet.",
          "Use sound, rhythm, and shot duration to make the message legible. Keep novelty in service of the idea, then make the production relationship and any brand inspiration clear in the caption or case study.",
        ],
      },
    ],
  },
  {
    slug: "brief-an-ai-execution-partner",
    title: "How to brief an AI execution partner",
    description:
      "The information that prevents vague scope, wasted generations, and avoidable revision loops.",
    category: "Products",
    published: "2026-08-08",
    readTime: "5 min read",
    answer:
      "A useful AI project brief defines the user, business outcome, current baseline, required inputs, constraints, owner, deadline, and evidence of success. References should explain what to learn from—not what to copy.",
    sections: [
      {
        heading: "A deliverable is not an outcome",
        paragraphs: [
          "“We need a website” or “make an AI video” describes output, not the decision the work must improve. A strong brief explains what is currently happening, what should change, and who needs to change it.",
        ],
      },
      {
        heading: "The eight fields that matter",
        paragraphs: [
          "A short but complete brief creates more speed than a long mood board. It gives the execution team enough context to challenge the format when a cheaper or clearer path exists.",
        ],
        bullets: [
          "Target user or audience",
          "Painful current situation",
          "Desired business outcome",
          "Existing assets and data",
          "Required deliverables and channels",
          "Legal, brand, and technical constraints",
          "Decision owner and reviewers",
          "Deadline and success evidence",
        ],
      },
      {
        heading: "Use references as evidence",
        paragraphs: [
          "For every reference, state what is useful: pacing, hierarchy, interaction, tone, information density, or production finish. This prevents accidental imitation and makes the desired quality easier to discuss.",
        ],
      },
      {
        heading: "Leave room for a smaller answer",
        paragraphs: [
          "The brief should allow the partner to recommend a diagnostic, prototype, or manual test before a full build. If the problem is not validated, more production can make the wrong idea look more convincing without making it more useful.",
        ],
      },
    ],
  },
  {
    slug: "when-to-automate-a-workflow",
    title: "When should a small team automate a workflow?",
    description:
      "A decision test for separating valuable automation from an expensive way to preserve a broken process.",
    category: "Automation",
    published: "2026-08-08",
    readTime: "7 min read",
    answer:
      "Automate a workflow when it is repeated often, uses reasonably consistent inputs, has clear exception rules, costs meaningful time or delay, and can be monitored. Fix or simplify the process before automating it.",
    sections: [
      {
        heading: "Frequency is not enough",
        paragraphs: [
          "A task can happen every day and still be a poor automation candidate. If every case requires ambiguous judgment or the input data is unreliable, the automation will create review work and hidden errors.",
        ],
      },
      {
        heading: "The five-part automation test",
        paragraphs: [
          "Score the workflow before choosing a platform or agent framework. A good candidate is frequent, structured enough to describe, valuable to speed up, observable after it runs, and reversible when it fails.",
        ],
        bullets: [
          "Repeated: it consumes time every week",
          "Stable: the basic steps do not change constantly",
          "Structured: inputs and outputs can be checked",
          "Valuable: delay or manual effort has a real cost",
          "Governable: a person can review exceptions and stop the system",
        ],
      },
      {
        heading: "Start with assisted work",
        paragraphs: [
          "The first version should often prepare a draft, classify an item, or collect information for approval. This keeps a human at the decision point while the team learns where errors and edge cases occur.",
        ],
      },
      {
        heading: "Measure the full loop",
        paragraphs: [
          "Track time saved, exception rate, correction effort, and downstream delay. An automation that runs quickly but creates untracked cleanup is not working. Keep a manual fallback and document ownership before expanding it.",
        ],
      },
    ],
  },
];

export function getInsightBySlug(slug: string) {
  return insights.find((insight) => insight.slug === slug);
}
