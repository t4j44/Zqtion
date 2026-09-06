export type WorkRelationship = "Competition entry" | "Independent concept" | "Creative lab";

export type WorkVideo = {
  title: string;
  videoId: string;
  videoUrl: string;
  orientation?: "landscape" | "portrait";
};

export type WorkItem = {
  slug: string;
  title: string;
  shortTitle: string;
  year: string;
  discipline: string;
  relationship: WorkRelationship;
  disclosure: string;
  summary: string;
  challenge: string;
  whatThisProved: string;
  approach: string[];
  deliverables: string[];
  videoId: string;
  videoUrl: string;
  additionalVideos?: WorkVideo[];
  featured?: boolean;
  orientation?: "landscape" | "portrait";
};

export const workItems: WorkItem[] = [
  {
    slug: "spark-dhaka-2050",
    title: "SPARK — A Social Fiction Short Film",
    shortTitle: "SPARK",
    year: "2026",
    discipline: "AI film · Worldbuilding · Social fiction",
    relationship: "Competition entry",
    disclosure:
      "Created as an independent entry for a global storytelling competition hosted by YY Ventures and Orange Corners Bangladesh. No award or placement is claimed.",
    summary:
      "A speculative short film that imagines Dhaka in 2050 through a story shaped around the idea of a more sustainable and equitable future.",
    challenge:
      "Turn a broad future-facing social theme into a compact story with a coherent world, emotional pace, and cinematic visual language.",
    whatThisProved:
      "A narrative-first workflow can hold a speculative world together across generated shots without turning the film into a technology montage.",
    approach: [
      "Built a clear narrative spine before generating visual sequences.",
      "Used a consistent near-future Dhaka design language across environments and characters.",
      "Edited the film around story beats rather than treating generated shots as a montage.",
    ],
    deliverables: ["2:11 short film", "Concept and narrative", "AI-assisted visual production", "Edit and sound direction"],
    videoId: "myz4yRXFE2M",
    videoUrl: "https://www.youtube.com/watch?v=myz4yRXFE2M",
    featured: true,
  },
  {
    slug: "emotional-telecom-concept",
    title: "Emotional Telecom Film — Independent Concept",
    shortTitle: "The Call",
    year: "2026",
    discipline: "AI commercial · Storytelling · Film",
    relationship: "Independent concept",
    disclosure:
      "An independent, uncommissioned telecom storytelling concept. It is not official work for, endorsed by, or affiliated with Grameenphone or another telecom brand.",
    summary:
      "A compact emotional commercial exploring distance, family, and connection through an AI-assisted production workflow.",
    challenge:
      "Create an emotionally legible one-minute story while maintaining character continuity and a restrained commercial tone.",
    whatThisProved:
      "A compact AI-assisted film can sustain an emotional idea when continuity, sound, and edit rhythm are treated as the system rather than afterthoughts.",
    approach: [
      "Started with the emotional beat and audience takeaway, not the generation tool.",
      "Designed shots around continuity, eye-lines, and pacing.",
      "Used sound and edit rhythm to connect scenes that were produced independently.",
    ],
    deliverables: ["1:09 concept film", "Narrative treatment", "AI-assisted scenes", "Edit and sound design"],
    videoId: "8UU5R8v3XMk",
    videoUrl: "https://www.youtube.com/watch?v=8UU5R8v3XMk",
    featured: true,
  },
  {
    slug: "meeting-my-past-self",
    title: "Meeting My Past Self in the AI Future",
    shortTitle: "Past Self",
    year: "2026",
    discipline: "AI microfilm · Narrative concept · Visual storytelling",
    relationship: "Creative lab",
    disclosure:
      "A self-initiated film published by Tajuddin Ahamed on BuildwithTajuddin. This is a creator experiment, not a third-party client commission.",
    summary:
      "A 1:26 AI microfilm built around an encounter between a present self and a past self inside an imagined AI future.",
    challenge:
      "Make a time-bending premise understandable inside a compact runtime while keeping the emotional idea ahead of the technology.",
    whatThisProved:
      "A single readable encounter can carry a time-bending concept more clearly than a larger sequence of disconnected generated images.",
    approach: [
      "Centered the film on one immediately readable encounter rather than a montage of generated scenes.",
      "Used a compact setup, reveal, and resolution suited to short-form viewing.",
      "Presented the work as self-initiated experimentation rather than client-result proof.",
    ],
    deliverables: ["1:26 AI microfilm", "Narrative concept", "AI-assisted visual production", "YouTube release"],
    videoId: "q_4me0VwaZo",
    videoUrl: "https://youtu.be/q_4me0VwaZo",
    featured: true,
  },
  {
    slug: "ai-microfilm-collection",
    title: "AI Microfilm Collection — Play and City Life",
    shortTitle: "AI Microfilms",
    year: "2026",
    discipline: "AI microfilm · Visual storytelling · Short-form",
    relationship: "Creative lab",
    disclosure:
      "A self-initiated collection published by Tajuddin Ahamed on BuildwithTajuddin. These are creator experiments, not third-party client commissions.",
    summary:
      "Two compact visual stories built around a panda pull-up gag and a playful response to city traffic.",
    challenge:
      "Make a complete visual premise understandable in under ninety seconds without depending on a long explanation.",
    whatThisProved:
      "Short-form AI stories work best when each release is built around one setup, one visual turn, and one clear ending.",
    approach: [
      "Kept each release centered on one immediately readable idea.",
      "Used a compact setup, visual turn, and ending suited to short-form viewing.",
      "Presented the collection as self-initiated experimentation rather than client-result proof.",
    ],
    deliverables: ["0:42 panda microfilm", "0:28 city-traffic microfilm", "Two YouTube releases"],
    videoId: "RtBa4fjEjbc",
    videoUrl: "https://youtu.be/RtBa4fjEjbc",
    additionalVideos: [
      {
        title: "How to Win Against the City Traffic",
        videoId: "Jspxt8bE6T0",
        videoUrl: "https://youtu.be/Jspxt8bE6T0",
      },
    ],
  },
  {
    slug: "sports-film-the-leap",
    title: "The Leap — Sports Film Concept",
    shortTitle: "The Leap",
    year: "2026",
    discipline: "AI commercial · Sports · Visual metaphor",
    relationship: "Independent concept",
    disclosure:
      "A self-initiated sportswear concept inspired by the visual language of global athletic campaigns. It is not commissioned by, endorsed by, or affiliated with Nike.",
    summary:
      "A kinetic sports concept using transformation and momentum to explore the feeling of pushing past a limit.",
    challenge:
      "Create premium sports energy without relying on a recognizable campaign, athlete endorsement, or unsupported brand claim.",
    whatThisProved:
      "Movement, lighting, and match-cut discipline can create campaign energy without relying on an endorsement or a copied campaign narrative.",
    approach: [
      "Designed the film around a simple movement metaphor.",
      "Used lighting, camera energy, and match cuts to create continuity.",
      "Kept brand-inspired references disclosed and separate from authorship.",
    ],
    deliverables: ["Spec film", "Visual direction", "AI-assisted production", "Edit and motion"],
    videoId: "tlUPzwuj7ck",
    videoUrl: "https://www.youtube.com/watch?v=tlUPzwuj7ck",
    featured: true,
  },
  {
    slug: "mojo-product-visual-lab",
    title: "Beverage Product Visual Lab",
    shortTitle: "Product Lab",
    year: "2026",
    discipline: "Product film · VFX study · Short-form",
    relationship: "Independent concept",
    disclosure:
      "Independent, uncommissioned product studies using MOJO packaging as a creative reference. Zqtion does not claim a client relationship or brand endorsement.",
    summary:
      "A set of short beverage studies exploring ice, particles, portals, urban energy, and packshot-focused visual direction.",
    challenge:
      "Build several distinct product worlds while keeping the pack recognizable and the execution suitable for short-form viewing.",
    whatThisProved:
      "A product can remain the visual anchor across multiple effects-led worlds when silhouette, reveal timing, and small-screen legibility are protected.",
    approach: [
      "Developed each film around one clear physical or environmental idea.",
      "Prioritized the product silhouette and reveal before effects density.",
      "Cut for immediate visual comprehension on small screens.",
    ],
    deliverables: ["Vertical product reels", "Packshot studies", "Motion and VFX concepts", "Social-ready edits"],
    videoId: "GkyqartrbWo",
    videoUrl: "https://www.youtube.com/watch?v=GkyqartrbWo",
  },
  {
    slug: "ai-vfx-creative-lab",
    title: "AI VFX Creative Lab",
    shortTitle: "Creative Lab",
    year: "2026",
    discipline: "Short-form · AI VFX · Prompt systems",
    relationship: "Creative lab",
    disclosure:
      "Fan-inspired experiments are independent and uncommissioned. Character and franchise references remain the property of their respective rights holders; no affiliation with Marvel, DC, athletes, or film studios is claimed.",
    summary:
      "A fast-moving short-form laboratory for testing transformation effects, character consistency, compositing, and cinematic prompt systems.",
    challenge:
      "Turn trend-driven experiments into transferable production learning rather than presenting popularity as client proof.",
    whatThisProved:
      "Narrow experiments can produce reusable continuity, compositing, and prompt-system lessons without being misrepresented as client outcomes.",
    approach: [
      "Tested one visual or continuity problem per short.",
      "Recorded repeatable prompting and compositing patterns.",
      "Used public response only as a creative signal, not as a business-result claim.",
    ],
    deliverables: ["Short-form experiments", "Prompt studies", "Compositing tests", "Creative workflow learning"],
    videoId: "d9apZlb22gE",
    videoUrl: "https://youtube.com/shorts/d9apZlb22gE",
    additionalVideos: [
      {
        title: "Building a Blockbuster with AI | Transformers",
        videoId: "WX2XbBxSDG0",
        videoUrl: "https://youtube.com/shorts/WX2XbBxSDG0",
        orientation: "portrait",
      },
      {
        title: "How I Created This Cinematic Look with AI",
        videoId: "f7FYYLeFbqQ",
        videoUrl: "https://youtube.com/shorts/f7FYYLeFbqQ",
        orientation: "portrait",
      },
    ],
    orientation: "portrait",
  },
];

export const featuredWork = workItems.filter((item) => item.featured);

export function getWorkBySlug(slug: string) {
  return workItems.find((item) => item.slug === slug);
}
