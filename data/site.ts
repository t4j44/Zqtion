export const siteConfig = {
  name: "Zqtion",
  url: "https://zqtion.com",
  email: "zqtioncontact@gmail.com",
  phone: "+880 1340-347975",
  whatsapp: "https://wa.me/8801340347975",
  linkedin: "https://www.linkedin.com/company/zqtion/",
  youtube: "https://www.youtube.com/@BuildwithTajuddin/videos",
  location: "Worldwide",
  description:
    "Zqtion is a founder-led AI execution company for creative production, digital products, and practical automation.",
} as const;

export const navigation = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/insights", label: "Insights" },
  { href: "/prompts", label: "Prompts" },
  { href: "/ai-experiences", label: "Community" },
  { href: "/careers", label: "Careers" },
] as const;

export type Service = {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  outcomes: string[];
  capabilities: string[];
  idealFor: string;
};

export const services: Service[] = [
  {
    slug: "ai-creative-production",
    eyebrow: "Create",
    title: "AI creative production",
    summary:
      "Concept, direction, and production for campaign films, product visuals, social content, and experimental brand worlds.",
    outcomes: [
      "A campaign-ready creative direction",
      "Channel-specific film and visual assets",
      "A repeatable visual language for future content",
    ],
    capabilities: [
      "AI commercials and brand films",
      "Product and food visuals",
      "Short-form creative",
      "Concept development",
      "Editing and motion",
      "Creative prototyping",
    ],
    idealFor:
      "Founders and teams that need distinctive creative without a traditional production cycle.",
  },
  {
    slug: "web-products-mvps",
    eyebrow: "Build",
    title: "Web products and rapid MVPs",
    summary:
      "Conversion-focused websites, product prototypes, and focused MVPs designed to make an offer or idea real quickly.",
    outcomes: [
      "A clear, testable product or website",
      "Fast, responsive, accessible front-end execution",
      "Analytics- and iteration-ready foundations",
    ],
    capabilities: [
      "Marketing websites",
      "Landing pages",
      "Product prototypes",
      "Rapid MVP development",
      "Design systems",
      "SEO foundations",
    ],
    idealFor:
      "Early-stage teams that need to validate, launch, or improve a digital experience.",
  },
  {
    slug: "ai-automation-systems",
    eyebrow: "Automate",
    title: "AI automation and systems",
    summary:
      "Practical workflow design that removes repetitive work while keeping people in control of important decisions.",
    outcomes: [
      "A mapped and measurable workflow",
      "A working automation or assisted process",
      "Documentation your team can operate",
    ],
    capabilities: [
      "Workflow audits",
      "AI-assisted content systems",
      "Internal tools",
      "Data handoffs",
      "Prompt and agent workflows",
      "Human approval controls",
    ],
    idealFor:
      "Small teams with repeatable operational work that is slowing down delivery.",
  },
  {
    slug: "ai-strategy-prototyping",
    eyebrow: "Consult",
    title: "AI consultancy and prototyping",
    summary:
      "Practical advisory for teams deciding where AI can create value, what to test first, and how to move from opportunity to an evidence-backed prototype.",
    outcomes: [
      "Prioritized opportunities and risks",
      "A prototype before a major build commitment",
      "Clear build, buy, or stop recommendations",
    ],
    capabilities: [
      "AI opportunity audits",
      "Use-case prioritization",
      "Prototype sprints",
      "Tool selection",
      "Adoption roadmaps",
      "Team enablement",
    ],
    idealFor:
      "Leaders who want to test where AI is useful before committing budget to a large program.",
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Frame the outcome",
    text: "We define the user, problem, evidence, constraints, and success signal before choosing tools or visual treatments.",
  },
  {
    number: "02",
    title: "Prototype the risky part",
    text: "We test the idea, motion language, workflow, or product interaction most likely to fail before expanding scope.",
  },
  {
    number: "03",
    title: "Execute in visible cycles",
    text: "Short review loops keep the work grounded, expose trade-offs early, and prevent a long surprise at delivery.",
  },
  {
    number: "04",
    title: "Launch and learn",
    text: "We ship with measurement, documentation, and a clear next decision—not a handoff that creates dependency.",
  },
] as const;

export const engagements = [
  {
    name: "Diagnostic",
    duration: "Focused starting point",
    description:
      "A structured audit, opportunity map, or creative direction when the right scope is not yet obvious.",
  },
  {
    name: "Execution sprint",
    duration: "Defined outcome",
    description:
      "A bounded campaign, prototype, website, or automation with a clear finish line and review cadence.",
  },
  {
    name: "Embedded system",
    duration: "Ongoing collaboration",
    description:
      "A continuing creative or product execution partnership for teams with recurring priorities.",
  },
] as const;

export type TeamMember = {
  name: string;
  role: string;
  initials: string;
  description: string;
  bio?: string;
};

export const team: readonly TeamMember[] = [
  {
    name: "Tajuddin Ahamed",
    initials: "TA",
    role: "Founder · AI Strategy & Consulting",
    description:
      "Leads Zqtion across AI strategy, creative direction, client consulting, product thinking and AI-enabled execution.",
    bio: "Leads Zqtion across AI strategy, creative direction, client consulting, product thinking and AI-enabled execution.",
  },
  {
    name: "Mohammad Abu Ubayda",
    initials: "MA",
    role: "AI Creative Lead",
    description:
      "Leads visual experimentation, AI-assisted creative production and the development of high-impact brand content.",
    bio: "Leads visual experimentation, AI-assisted creative production and the development of high-impact brand content.",
  },
  {
    name: "Mehide Hasan Emon",
    initials: "MH",
    role: "Technical Lead",
    description:
      "Leads technical architecture, web systems, integrations and deployment across Zqtion's digital builds.",
    bio: "Leads technical architecture, web systems, integrations and deployment across Zqtion's digital builds.",
  },
  {
    name: "Syed Nabil Yaseen",
    initials: "SY",
    role: "Post-Production Lead",
    description:
      "Leads final editing, pacing and visual polish while supporting scripts and story development when required.",
    bio: "Leads final editing, pacing and visual polish while supporting scripts and story development when required.",
  },
] as const;

export const faqs = [
  {
    question: "What does Zqtion actually do?",
    answer:
      "Zqtion plans and executes AI-enabled creative, web products, rapid MVPs, and practical workflow automations. The exact team and method are shaped around the outcome rather than a fixed menu of deliverables.",
  },
  {
    question: "Is every project in the portfolio client work?",
    answer:
      "No. The portfolio includes founder-venture work, competition entries, and independent or fan-inspired experiments. Every project page identifies that relationship so capability proof is not presented as a client claim.",
  },
  {
    question: "Do you work internationally?",
    answer:
      "Yes. Zqtion is set up for remote collaboration worldwide. Availability, scope, and working hours are confirmed during the project brief.",
  },
  {
    question: "How much does a project cost?",
    answer:
      "Pricing depends on scope, production requirements, risk, and timeline. Zqtion first recommends the smallest credible engagement, then provides a written scope and quote before work begins.",
  },
  {
    question: "How is AI used in the work?",
    answer:
      "AI is used where it improves speed, exploration, or repeatability. Creative direction, product judgment, review, and important approvals remain human-led.",
  },
] as const;
