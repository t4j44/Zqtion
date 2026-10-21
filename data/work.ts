export type WorkRelationship = "Delivered website" | "Zqtion open source" | "Competition entry" | "Independent concept" | "Creative lab";
export type WorkGroup = "Digital products & websites" | "Open source & AI tools" | "Motion design & commercials" | "AI films & experiments";

export type WorkVideo = {
  title: string;
  videoId: string;
  videoUrl: string;
  orientation?: "landscape" | "portrait";
};

type WorkItemBase = {
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
  group?: WorkGroup;
  links?: { label: string; url: string }[];
  gallery?: { src: string; alt: string; caption: string; width: number; height: number }[];
  sourceTitle?: string;
  socialImage?: string;
  /** Optional curated still (path under /public, e.g. "/work/spark.jpg", 16:9, at least 1600px wide). Falls back to the YouTube still. */
  poster?: string;
  /** Crops baked-in letterbox bars from the still (1 = none). */
  thumbZoom?: number;
  featured?: boolean;
  orientation?: "landscape" | "portrait";
};

export type WorkItem = WorkItemBase & (
  | { kind?: "video"; videoId: string; videoUrl: string; additionalVideos?: WorkVideo[] }
  | { kind: "website" | "product"; poster: string; videoId?: never; videoUrl?: never; additionalVideos?: never }
);

const legacyWork: WorkItem[] = [
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
    thumbZoom: 1.1,
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
    thumbZoom: 1.4,
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
    title: "MOJO — VFX Product Study",
    shortTitle: "MOJO VFX",
    sourceTitle: "MOJO VFX 4",
    year: "2026",
    discipline: "Product film · VFX study · Short-form",
    group: "Motion design & commercials",
    relationship: "Independent concept",
    disclosure:
      "An independent, uncommissioned product study using MOJO packaging as a creative reference. The published film is titled MOJO VFX 4 on Zqtion's channel. No client relationship or brand endorsement is claimed. The legacy case-study URL is preserved.",
    summary:
      "A short beverage VFX study centered on MOJO packaging and product-led visual experimentation.",
    challenge:
      "Keep a recognizable product at the center of a compact effects-led visual sequence.",
    whatThisProved:
      "The published release demonstrates product-led VFX and a clear packaging anchor. Commercial impact and the production software used were not independently verified.",
    approach: [
      "The product and packaging remain the visible anchor of the study.",
      "The release presents a short-form VFX concept rather than a documented client campaign.",
      "The original public video remains available for viewers to assess the work.",
    ],
    deliverables: ["Beverage VFX study", "Published YouTube film"],
    videoId: "tlUPzwuj7ck",
    videoUrl: "https://www.youtube.com/watch?v=tlUPzwuj7ck",
    featured: true,
  },
  {
    slug: "mojo-product-visual-lab",
    title: "Chicken Tikka — Photo-to-Reel Study",
    shortTitle: "Food in motion",
    sourceTitle: "Chiceken tikka reel 3. (Photo to Reel)",
    year: "2026",
    discipline: "Food visuals · Photo-to-reel · Short-form",
    group: "Motion design & commercials",
    relationship: "Independent concept",
    disclosure:
      "An independent, uncommissioned food-visual study published on Zqtion's channel as Chiceken tikka reel 3. (Photo to Reel). No restaurant client, commercial commission, production software or campaign outcome is claimed. The legacy case-study URL is preserved.",
    summary:
      "A chicken-tikka product reel exploring how a food image can become a compact moving visual.",
    challenge:
      "Keep food texture and the subject immediately legible in a short photo-to-reel format.",
    whatThisProved:
      "The public release demonstrates food-led composition and a photo-to-reel format. The published title and imagery establish that scope; no conversion result is inferred.",
    approach: [
      "Food remains the principal visual subject.",
      "Close-up composition emphasizes the product's texture and appearance.",
      "The original published reel is retained as the evidence for the work.",
    ],
    deliverables: ["Food photo-to-reel study", "Published YouTube release"],
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

const newWork: WorkItem[] = [
  {
    slug: "g-force-tyres-mobile", title: "G Force Tyres Mobile — Website Development", shortTitle: "G Force Tyres", year: "2026",
    discipline: "Website development · Responsive experience", relationship: "Delivered website", group: "Digital products & websites", kind: "website", poster: "/work/gforce-desktop.webp",
    disclosure: "Website development by Zqtion, as supplied by the owner. The public website and responsive navigation were inspected for this case study. No independent commissioning document, client endorsement or commercial result is claimed.",
    summary: "A mobile tyre-fitting website that starts with the fitting location, makes tyre-size entry clear and explains the route to an appointment.",
    challenge: "Help visitors understand the fitting journey on a phone: where the vehicle is, which tyre size they need and what happens before a booking is confirmed.",
    whatThisProved: "The published site demonstrates a location-first search interface, a responsive navigation system and clear fitting guidance. Live stock, payment handling and completed bookings were outside this portfolio review.",
    approach: ["Organized the public experience around postcode and manual tyre-size entry.", "Connected service information, tyre guides and booking guidance through a responsive navigation system.", "Made availability and payment-confirmation conditions visible rather than implying an instant confirmed fitting."],
    deliverables: ["Responsive public website", "Tyre-search interface", "Service and fitting guidance", "Desktop and mobile navigation"],
    links: [{label:"Visit website",url:"https://www.gforcetyres-mobile.co.uk/"}],
    gallery: [{src:"/work/gforce-mobile.webp",alt:"G Force Tyres homepage at a 390px phone viewport",caption:"The live homepage on a phone. Genuine site capture, 21 October 2026.",width:381,height:824},{src:"/work/gforce-guidance.webp",alt:"G Force Tyres public booking guidance on a phone",caption:"Published guidance explains postcode, tyre-size and booking conditions. No booking was submitted.",width:390,height:843}]
  },
  {
    slug: "gruffet", title: "Gruffet — Open-source Business Research", shortTitle: "Gruffet", year: "2026",
    discipline: "Open-source product · Business research", relationship: "Zqtion open source", group: "Open source & AI tools", kind: "product", poster:"/work/gruffet-mark.svg", socialImage:"/work/gruffet-social.webp",
    disclosure: "A Zqtion open-source product, released under the MIT license. v0.1.0 is an early preview. The repository and implementation were inspected; this case study does not certify contact accuracy or production reliability.",
    summary: "Discover local businesses, investigate their public websites and keep the evidence behind each contact and competitor finding.",
    challenge: "A spreadsheet of names is difficult to trust when nobody can explain the source, the checks performed or which records still need human review.",
    whatThisProved: "The early release implements a repeatable discovery, enrichment, verification, review and Excel-export workflow. Evidence can be inspected alongside the result; agreement between sources still does not guarantee that a contact is current or sales-qualified.",
    approach: ["Discover businesses through OpenStreetMap and investigate publicly available website information.", "Separate rule-based contact and identity checks from uncertain records that need coding-agent or human review.", "Export research, source evidence, review tiers and competitor findings into an Excel workbook."],
    deliverables: ["Python command-line tool", "Local business discovery", "Public website research", "Contact verification rules", "Competitor research", "Evidence-backed Excel exports"],
    links: [{label:"View on GitHub",url:"https://github.com/Zqtion/Gruffet"},{label:"Read documentation",url:"https://github.com/Zqtion/Gruffet#-quick-start"},{label:"Watch introduction",url:"https://youtu.be/EKDWPiF0M6c"}]
  },
  {
    slug: "gruffet-product-explainer",title:"Gruffet — Product Motion Explainer",shortTitle:"Gruffet in motion",year:"2026",
    discipline:"Motion design · Product storytelling",relationship:"Creative lab",group:"Motion design & commercials",poster:"/work/gruffet-explainer.webp",
    videoId:"EKDWPiF0M6c",videoUrl:"https://youtu.be/EKDWPiF0M6c",sourceTitle:"Tired of paying for B2B lead lists full of dead numbers and fake names? 📉",
    disclosure:"A founder-supplied promotional film for Zqtion's own Gruffet product, published by Tajuddin Ahamed on BuildwithTajuddin. The interface sequences illustrate the workflow; they are not independently validated live output. No third-party SaaS client is claimed.",
    summary:"A 56-second product explainer that makes a research workflow visible through type, interface-led motion and a clear problem-to-process narrative.",
    challenge:"Explain the difference between an unsupported lead list and a research process that retains its sources, within a compact introduction.",
    whatThisProved:"The published film demonstrates concise product storytelling and interface-led motion. It is promotional communication, not a reliability benchmark or a guarantee that any contact is accurate.",
    approach:["Opened with the problem of unreliable business-contact lists.","Organized the explanation around discovery, verification, agent review and sourced export.","Used animated typography and illustrative interface sequences to connect the stages."],
    deliverables:["56-second landscape explainer","Kinetic typography","Illustrative interface motion","Published YouTube film"]
  },
  {
    slug:"bold-kinetic-type-showreel",title:"Bold Kinetic Type Showreel",shortTitle:"Type in motion",year:"2026",
    discipline:"Motion design · Kinetic typography",relationship:"Creative lab",group:"Motion design & commercials",poster:"/work/kinetic-type.webp",
    videoId:"osWc8m3qnhI",videoUrl:"https://youtu.be/osWc8m3qnhI",sourceTitle:"Bold kinetic type showreel",
    disclosure:"A self-published motion study supplied by the owner, released by Tajuddin Ahamed on BuildwithTajuddin. No third-party client, production software or campaign result is claimed.",
    summary:"A 31-second typography study that uses repetition, scale and contrasting blue and orange fields to make language move.",
    challenge:"Give a typography-only sequence variety and rhythm without relying on a product render, cinematic footage or a borrowed client story.",
    whatThisProved:"The release demonstrates type-led composition, rhythmic transitions and a consistent visual vocabulary across a short landscape sequence.",
    approach:["Made typography the primary visual material.","Used repeated words, changes in scale and contrasting color fields to establish hierarchy.","Connected compositions through motion rather than adding unrelated footage."],
    deliverables:["31-second landscape showreel","Type-led compositions","Motion transitions","Published YouTube film"]
  }
];

const legacyPosters: Record<string,string> = {"spark-dhaka-2050":"spark","emotional-telecom-concept":"the-call","meeting-my-past-self":"past-self","ai-microfilm-collection":"microfilms","sports-film-the-leap":"the-leap","mojo-product-visual-lab":"product-lab","ai-vfx-creative-lab":"creative-lab"};
export const workItems: WorkItem[] = [...newWork,...legacyWork.map(item=>({...item,poster:`/work/${legacyPosters[item.slug]}.webp`,group: item.group ?? "AI films & experiments" as const}))];
export const workGroups: WorkGroup[] = ["Digital products & websites","Open source & AI tools","Motion design & commercials","AI films & experiments"];
const featuredSlugs = ["g-force-tyres-mobile","gruffet","bold-kinetic-type-showreel","spark-dhaka-2050"];
export const featuredWork = featuredSlugs.map(slug=>{const item=workItems.find(item=>item.slug===slug);if(!item)throw new Error(`Missing featured project: ${slug}`);return item;});

export function getWorkBySlug(slug: string) {
  return workItems.find((item) => item.slug === slug);
}
