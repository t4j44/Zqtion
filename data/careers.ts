export const launchpad = {
  name: "Zqtion Launchpad",
  subtitle: "12-Week AI-Native Apprenticeship",
  weeks: 12,
  hours: "8–12 hours / week",
  seatsPerTrack: 3,
  acknowledgement: "I understand that Zqtion Launchpad is a 12-week, part-time, unpaid learning program. Completion does not guarantee employment. High-performing participants may be considered for future paid opportunities depending on performance, business need and availability.",
  opportunity: "High-performing Launchpad participants receive priority consideration for future paid project, freelance, internship, part-time or permanent opportunities at Zqtion as suitable roles, revenue and business needs become available.",
} as const;

export const pods = ["Creative", "Growth", "Intelligence", "Technology"] as const;
export type Pod = typeof pods[number];
export type CareerTrack = {
  slug: string;
  title: string;
  pod: Pod;
  summary: string;
  responsibilities: string[];
  learning: string[];
  requirements: string[];
  optional: string[];
  tools: string[];
  artifact: string;
  question: string;
};

export const careerTracks: CareerTrack[] = [
  {
    slug: "ai-creative-prompt-engineering", title: "AI Creative & Prompt Engineering", pod: "Creative",
    summary: "Turn a creative idea into a visual direction, then test and refine it with AI-assisted production.",
    responsibilities: ["Research references and develop campaign concepts.", "Write image/video prompts, create storyboards and product visual experiments.", "Test character consistency, continuity and visual detail.", "Organize generated assets and document useful prompts and workflows.", "Collaborate with editors and designers; review and improve outputs after feedback."],
    learning: ["Prompt engineering and image/video generation workflows", "Storytelling, visual direction and commercial creative", "Continuity and creative quality assurance"],
    requirements: ["Visual curiosity and interest in advertising, film or design", "Attention to detail and willingness to experiment repeatedly", "No professional creative experience required"],
    optional: ["Canva or Photoshop", "Photography or filmmaking", "Previous AI-generation experiments"],
    tools: ["Available image/video AI tools", "Canva", "Reference boards"],
    artifact: "A documented campaign concept with a storyboard, visual experiments and a repeatable prompt workflow.",
    question: "Describe a simple product visual you would create. What would you test to make it feel consistent?",
  },
  {
    slug: "video-editing-post-production", title: "Video Editing & Post-Production", pod: "Creative",
    summary: "Shape raw footage and generated assets into clear, well-paced stories.",
    responsibilities: ["Organize footage, assets and project files.", "Build rough cuts and edit short-form or internal portfolio videos.", "Add subtitles, basic sound design and color correction.", "Improve pacing after review.", "Export compressed, correctly sized versions for different platforms."],
    learning: ["Story pacing and editing decisions", "Audio, color and AI-assisted editing", "Compression, exports and project handoff"],
    requirements: ["Laptop/desktop capable of basic video editing", "Patience and a sense of timing", "Previous editing employment is not required"],
    optional: ["A personal edit or school project", "Familiarity with any editing tool"],
    tools: ["CapCut", "DaVinci Resolve", "Premiere if already available"],
    artifact: "A finished short film or portfolio edit, with organized source files and platform-specific exports.",
    question: "What makes a short video feel well-paced? Describe one edit you would change and why.",
  },
  {
    slug: "reels-short-form-content", title: "Reels & Short-Form Content", pod: "Creative",
    summary: "Build the short-form pipeline from the first hook to an honest review of performance.",
    responsibilities: ["Research trends and identify useful hooks.", "Script reels and prepare shot/edit plans.", "Edit short videos, write captions and test opening variations.", "Repurpose longer content and maintain a content calendar.", "Study retention and report observed performance without inventing results."],
    learning: ["Idea → hook → script → edit → approved publication → analysis", "Platform formats and audience attention", "Interpreting retention and improving a concept"],
    requirements: ["Familiarity with short-form platforms", "Curiosity about why content works", "Willingness to study performance; no professional experience required"],
    optional: ["A personal reel or script", "Basic video editing"], tools: ["CapCut", "Platform analytics when authorized", "Sheets"],
    artifact: "A small short-form series with hook variations, a publishing plan and a documented review.",
    question: "Write two different opening hooks for a 20-second video about a useful everyday product.",
  },
  {
    slug: "brand-graphic-design", title: "Brand & Graphic Design", pod: "Creative",
    summary: "Make visual communication clearer through typography, hierarchy and a consistent design system.",
    responsibilities: ["Create posters, carousels, campaign assets and social templates.", "Design pitch visuals, presentation layouts and event graphics.", "Research references and maintain brand consistency.", "Resize and adapt designs between platforms.", "Refine composition and legibility after critique."],
    learning: ["Typography, composition and visual hierarchy", "Branding and reusable visual systems", "Figma, Canva and AI-assisted design"],
    requirements: ["Visual curiosity and attention to detail", "Willingness to explain and revise design decisions", "Portfolio helpful, not mandatory"],
    optional: ["Canva or Figma experiments", "Drawing, photography or personal design work"], tools: ["Figma", "Canva", "Available image tools"],
    artifact: "A coherent mini brand system and a set of campaign assets with documented design decisions.",
    question: "Choose a poster or social graphic you have seen. What would you change to make its message clearer?",
  },
  {
    slug: "communications-social-media", title: "Communications & Social Media", pod: "Growth",
    summary: "Connect the content calendar, creative team and audience with clear, responsible communication.",
    responsibilities: ["Maintain calendars and prepare publishing schedules.", "Coordinate designers/editors and draft captions in Zqtion's tone.", "Schedule approved posts and monitor comments or community questions.", "Track trends, competitors and platform presentation.", "Prepare monthly reports using available, verified information."],
    learning: ["Social media planning through reporting", "Brand tone and community communication", "Cross-functional coordination and platform optimization"],
    requirements: ["Clear communication and familiarity with major platforms", "Reliability and responsibility", "No previous social-media job required"],
    optional: ["Student club or community experience", "A personal content calendar"], tools: ["Sheets", "Native scheduling tools", "Shared content calendar"],
    artifact: "A practical content calendar, coordinated campaign and evidence-based social report.",
    question: "A planned post is delayed because the design is not ready. How would you communicate and adjust the plan?",
  },
  {
    slug: "content-copywriting", title: "Content & Copywriting", pod: "Growth",
    summary: "Research, write and edit useful words that sound like a person and stay grounded in facts.",
    responsibilities: ["Research topics and write captions, hooks and LinkedIn posts.", "Develop video scripts, website copy and email drafts.", "Prepare case-study and Insight drafts with clear sourcing.", "Edit AI-assisted writing for accuracy, voice and usefulness.", "Maintain a consistent tone and revise after feedback."],
    learning: ["Persuasive writing, storytelling and brand voice", "SEO fundamentals and research discipline", "Editing AI content without adding unsupported claims"],
    requirements: ["Reasonably good English or Bangla writing", "Basic English reading and willingness to revise", "No degree or professional writing experience required"],
    optional: ["Personal posts, essays or scripts", "Research or editing experience"], tools: ["Docs", "AI writing assistants", "Source and fact-checking notes"],
    artifact: "A small writing portfolio with a researched article, campaign copy and a documented editing process.",
    question: "Explain a familiar app to someone who has never used it, in three clear sentences.",
  },
  {
    slug: "business-development-partnerships", title: "Business Development & Partnerships", pod: "Growth",
    summary: "Find relevant relationships and turn research into thoughtful partnership proposals.",
    responsibilities: ["Research organizations, startup communities and university partnerships.", "Identify relevant events and partnership opportunities.", "Prepare partner briefs, meeting research and draft outreach.", "Track communications and maintain the partnership pipeline.", "Follow up professionally under supervision; make no independent commitments."],
    learning: ["Partnership strategy and ecosystem mapping", "Proposal development and professional communication", "Relationship management"],
    requirements: ["Organized thinking and strong research habits", "Interest in communicating with people", "No business-development experience required"],
    optional: ["Student club or event coordination", "Presentation experience"], tools: ["Sheets or a supervised CRM", "Public organization websites", "Docs"],
    artifact: "An evidence-based partner map and a reviewed partnership brief with a realistic next step.",
    question: "Suggest one type of organization Zqtion could collaborate with. What would both sides gain?",
  },
  {
    slug: "sales-outreach", title: "Sales & Outreach", pod: "Growth",
    summary: "Learn thoughtful B2B sales: understand the fit before asking for someone's time.",
    responsibilities: ["Learn Zqtion's services and research potential customers.", "Draft personalized LinkedIn/email outreach and follow-ups for approval.", "Qualify responses and prepare discovery notes.", "Maintain CRM records and track the pipeline.", "Analyze response rates. No spam, mass low-quality messages or misleading claims."],
    learning: ["Modern B2B sales and qualification", "Personalized communication and professional follow-up", "Pipeline discipline and honest measurement"],
    requirements: ["Clear communication, resilience and professionalism", "Willingness to learn sales without pressure tactics", "No prior sales job required"],
    optional: ["Customer-facing volunteering", "Writing or research practice"], tools: ["Supervised CRM", "Docs", "Approved business communication channels"],
    artifact: "A researched outreach sequence and a documented qualification/pipeline exercise.",
    question: "How would you decide whether a company genuinely needs Zqtion before writing an outreach message?",
  },
  {
    slug: "lead-research-prospecting", title: "Lead Research & Prospecting", pod: "Growth",
    summary: "Find a smaller set of properly qualified opportunities, not a large list of random contacts.",
    responsibilities: ["Define customer segments and research relevant companies.", "Identify decision-makers using publicly available business information.", "Verify sources, categorize prospects and explain why each fits.", "Score leads, remove duplicates and maintain supervised CRM records.", "Prepare useful personalization notes while respecting privacy and platform rules."],
    learning: ["Customer-fit research and qualification", "Source verification and responsible business-data handling", "CRM hygiene and prioritization"],
    requirements: ["Patience, attention to detail and good research habits", "Basic spreadsheet literacy", "Professional prospecting experience not required"],
    optional: ["Public-source research", "Spreadsheet cleanup"], tools: ["Public business websites", "Sheets", "Supervised CRM"],
    artifact: "A small, verified prospect dataset with sources, fit reasons and personalization notes.",
    question: "What three signals would help you distinguish a qualified opportunity from a random company?",
  },
  {
    slug: "ai-market-research", title: "AI / Market R&D", pod: "Intelligence",
    summary: "Test tools and market assumptions, then explain what actually worked and where the limits are.",
    responsibilities: ["Monitor AI tools, models, relevant GitHub projects and workflows.", "Research competitors, markets and tool pricing from primary sources.", "Run bounded comparisons and document experiments.", "Prepare weekly research notes and adoption recommendations.", "Report problem → technology → test → result → limitation → use case → recommendation."],
    learning: ["Research design and source evaluation", "Tool comparison and practical experimentation", "Communicating uncertainty and business relevance"],
    requirements: ["High curiosity and comfort reading online", "Willingness to verify claims rather than repeat marketing", "No research employment or advanced degree required"],
    optional: ["Personal tool comparisons", "Basic technical curiosity"], tools: ["Primary documentation", "Public GitHub repositories", "Experiment logs"],
    artifact: "A reproducible tool/workflow comparison with limitations and an evidence-backed recommendation.",
    question: "A tool claims to save 80% of someone's time. How would you test whether that claim matters for Zqtion?",
  },
  {
    slug: "data-cleaning-operations", title: "Data Cleaning & Operations", pod: "Intelligence",
    summary: "Make information dependable enough for other people to use.",
    responsibilities: ["Clean spreadsheets and remove duplicate records.", "Normalize names, categories and formats.", "Validate records, structure CSVs and support CRM cleanup.", "Organize files and document changes.", "Run quality checks and flag ambiguous data instead of guessing."],
    learning: ["Excel/Sheets and structured data", "Data quality, validation and change documentation", "Operational discipline"],
    requirements: ["Attention to detail and patience", "Basic computer literacy", "No specialist data experience required"],
    optional: ["Spreadsheet formulas", "File organization experience"], tools: ["Excel or Google Sheets", "CSV files", "Quality checklists"],
    artifact: "A cleaned sample dataset with a change log, validation rules and a quality checklist.",
    question: "Two spreadsheet rows look like the same person but have different emails. What would you do before removing one?",
  },
  {
    slug: "data-analysis-insights", title: "Data Analysis & Insights", pod: "Intelligence",
    summary: "Turn reliable numbers into useful questions, findings and business decisions.",
    responsibilities: ["Analyze approved social, lead-funnel or sales datasets.", "Summarize campaign results and calculate basic metrics.", "Compare periods and identify patterns.", "Prepare recommendations with assumptions and limitations.", "Maintain recurring reports and verify AI-assisted calculations."],
    learning: ["Excel/Sheets, introductory SQL and descriptive statistics", "Business analysis and metric definitions", "Responsible AI-assisted analysis"],
    requirements: ["Basic comfort with numbers", "Curiosity about what a metric means", "Advanced math and professional experience are not necessary"],
    optional: ["Spreadsheet formulas", "Any personal data project"], tools: ["Sheets or Excel", "SQL practice datasets", "AI assistants with verified calculations"],
    artifact: "A reproducible analysis with clear metric definitions, charts, limitations and recommendations.",
    question: "Website visits increased but inquiries stayed the same. What would you investigate before drawing a conclusion?",
  },
  {
    slug: "data-visualization-reporting", title: "Data Visualization & Reporting", pod: "Intelligence",
    summary: "Help people see the point of an analysis through clear charts and reports.",
    responsibilities: ["Create dashboards, charts and monthly scorecards.", "Translate analysis into concise visual reports.", "Prepare leadership summaries and KPI presentations.", "Choose appropriate comparisons and label sources clearly.", "Improve clarity, accessibility and dashboard usability after review."],
    learning: ["Chart selection and visual storytelling", "Dashboard UX and executive communication", "Reporting with Sheets, Looker Studio or Power BI"],
    requirements: ["Interest in numbers and design", "Willingness to prioritize clarity over decoration", "Professional dashboard experience not required"],
    optional: ["A chart or presentation you have made", "Spreadsheet familiarity"], tools: ["Sheets", "Looker Studio", "Power BI where available"],
    artifact: "A focused dashboard or scorecard that explains a decision, with sources and metric definitions.",
    question: "You need to show how inquiries changed over six months. What chart would you choose, and why?",
  },
  {
    slug: "ai-automation-digital-execution", title: "AI Automation & Digital Execution", pod: "Technology",
    summary: "Map repetitive work and prototype small, safe automations with people in control.",
    responsibilities: ["Map workflows and identify repetitive steps.", "Test AI tools and prototype small internal automations.", "Assist with websites and sandbox API integrations.", "Test agent workflows, document processes and troubleshoot failures.", "Use test data and human approval; never independently control production credentials or systems."],
    learning: ["Prompt engineering, AI-assisted coding and APIs", "Automation, database and web deployment fundamentals", "Agents, MCP concepts and human-in-the-loop systems"],
    requirements: ["Logical thinking, curiosity and willingness to troubleshoot", "Access to a laptop/desktop", "Coding experience helpful, not mandatory"],
    optional: ["A small script or no-code workflow", "Basic HTML or programming"], tools: ["Browser developer tools", "Sandbox APIs", "Approved automation tools", "Version control"],
    artifact: "A bounded automation prototype with test cases, documentation and a human approval point.",
    question: "Describe a repetitive task you would automate. Which step should still require a person's approval?",
  },
];

export const coreTraining = ["AI fundamentals", "Prompt engineering", "AI-assisted research", "Fact-checking and hallucinations", "Professional communication", "Task management", "Quality assurance", "File/version management", "Workplace collaboration", "Feedback handling", "Responsible AI", "Confidentiality", "Productivity systems", "Zqtion workflow and brand principles"];
export const programTimeline = [
  { weeks: "01–02", title: "Build your foundation", text: "Zqtion Core Training and your track's fundamentals. Learn the tools, standards and safe ways of working." },
  { weeks: "03–04", title: "Practice with a purpose", text: "Role-specific challenges with small scopes, clear briefs and feedback. No high-impact responsibility." },
  { weeks: "05–08", title: "Contribute with support", text: "Supervised internal projects, simulations and selected low-risk support work. Ask, test and improve." },
  { weeks: "09–11", title: "Own a bounded challenge", text: "Take ownership of an individual or pod project, with mentor review and clear permission boundaries." },
  { weeks: "12", title: "Show your work. Plan your next step.", text: "Final presentation, mentor review, written feedback and a career discussion. Certification follows successful completion." },
];
export const memberBenefits = [
  { title: "Practical training", text: "A structured core curriculum, role-specific practice and free training. No expensive AI subscription required." },
  { title: "Supervised experience", text: "Internal projects, simulations, portfolio experiments and selected low-risk support work with a clear brief." },
  { title: "Proof of work", text: "At least one meaningful finished artifact on successful completion, shareable only where confidentiality and permissions allow." },
  { title: "Completion certificate", text: "Zqtion Launchpad — Certificate of Completion, identifying your track, cohort, 12-week duration and completion date." },
  { title: "Written feedback", text: "An end-of-program review of strengths, improvement areas, reliability, quality, communication and learning ability." },
  { title: "An earned recommendation", text: "Exceptional performers may receive a LinkedIn recommendation or written reference. It is earned, not automatic." },
  { title: "Career presentation", text: "CV, LinkedIn and portfolio guidance, project descriptions and practice explaining your skills in interviews." },
  { title: "A mentor and a pod", text: "Weekly review, questions, critique and career feedback within a cross-functional group." },
  { title: "A wider perspective", text: "See how creative, growth, intelligence and technology work together, and discover where you are strongest." },
  { title: "A possible next step", text: launchpad.opportunity },
];
export const applicantRequirements = ["Curiosity and genuine interest in your track", "Reliability and clear communication", "Basic English reading/writing and computer literacy", "Approximately 8–12 hours each week", "Laptop/desktop access for most tracks and a workable internet connection", "Willingness to follow instructions, accept feedback and use AI ethically"];
export const memberResponsibilities = ["Attend agreed training and review sessions; complete assignments.", "Communicate blockers early and meet realistic deadlines.", "Document decisions, organize files and follow version conventions.", "Respect confidential information and ask before publishing any work.", "Fact-check AI outputs; never fabricate data or results.", "Collaborate respectfully and improve work after review."];
export const launchpadFaqs = [
  { question: "Is this paid?", answer: "No. The planned initial cohort is an unpaid, learning-first, part-time apprenticeship. There is no participation fee. Read the terms before applying; unpaid participation is not a promise of future paid work." },
  { question: "Is a job guaranteed after 12 weeks?", answer: `No. ${launchpad.opportunity} Selection depends on performance, business need, revenue, legal eligibility and availability.` },
  { question: "Can beginners and first-year university students apply?", answer: "Yes. First-year students, recent graduates, self-taught learners and career switchers are welcome. Most tracks do not require a previous job, internship, certificate, perfect portfolio or computer-science degree." },
  { question: "Can school or college students apply?", answer: "The initial cohort is limited to applicants aged 18 or older who are legally eligible in an accepted jurisdiction. Under-18 enrollment is not offered; separate consent, privacy and safeguarding procedures would be needed first." },
  { question: "Is it remote, and how much time is needed?", answer: "The program is remote-first, part-time, approximately 8–12 hours each week for 12 weeks. Session times, start dates and accepted locations must be confirmed before enrollment." },
  { question: "Are all 42 places guaranteed to be filled?", answer: "No. Fourteen tracks with up to three places each creates a maximum advertised capacity of 42. Actual places depend on mentor capacity and suitable learning work; Zqtion may fill fewer places or defer a track." },
  { question: "What is required for the certificate?", answer: "Meaningful participation, completed required assignments, a final project, professional conduct and mentor approval. Registration or attendance alone does not earn a certificate." },
  { question: "Will I be doing unpaid employee work?", answer: "The program is designed around structured training and supervised, low-risk practice, not unsupervised replacement of paid employees. Apprentices must not independently control contracts, payments, production secrets, commercial commitments or publication." },
  { question: "What does selection involve?", answer: "Application, shortlist, a 30–60 minute practical challenge, a 15–20 minute conversation, then selection. The challenge should be bounded practice, not an unpaid production deliverable." },
  { question: "Do I need paid tools or a public portfolio?", answer: "No expensive AI subscription or polished portfolio is required. Share something you have tried, even a learning experiment. Tools depend on the track and approved access. Never share private client data or credentials." },
];
