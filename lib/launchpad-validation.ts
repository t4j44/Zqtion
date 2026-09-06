export const availabilityOptions = ["8–12 hours", "More than 12 hours", "Less than 8 hours — please discuss"] as const;
export const laptopOptions = ["Yes, reliable access", "Shared access", "No — please discuss"] as const;
export const studyOptions = ["First-year university student", "University student — later year", "Recent graduate", "Self-taught learner", "Career switcher", "School/college student aged 18+", "Other legally eligible beginner"] as const;

const fieldRules = {
  fullName: [2, 100], email: [5, 160], phone: [6, 40], location: [2, 160], institution: [0, 160],
  studyLevel: [1, 100], primaryTrack: [1, 100], secondaryTrack: [0, 100],
  linkedin: [0, 500], portfolio: [0, 500], github: [0, 500], otherLinks: [0, 1200],
  whyZqtion: [20, 1500], learningGoals: [20, 1500], priorExperiment: [10, 1500],
  strongestSkill: [2, 300], improveSkill: [2, 300], weeklyAvailability: [1, 100], laptopAccess: [1, 100],
  toolsUsed: [2, 500], startAvailability: [2, 160], roleAnswer: [20, 1500], submissionId: [36, 36],
} as const;
export type ApplicationFields = Record<keyof typeof fieldRules, string>;
export type LaunchpadApplication = ApplicationFields & { ageConfirmed: true; acknowledgement: true; privacyConsent: true };
export type ApplicationErrors = Partial<Record<keyof ApplicationFields | "ageConfirmed" | "acknowledgement" | "privacyConsent", string>>;

function isPublicLink(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

export function validateApplication(body: Record<string, unknown>, trackSlugs: readonly string[]) {
  const fields = {} as ApplicationFields;
  const errors: ApplicationErrors = {};
  for (const [key, [minimum, maximum]] of Object.entries(fieldRules)) {
    const name = key as keyof ApplicationFields;
    const raw = body[name];
    const value = typeof raw === "string" ? raw.trim() : "";
    fields[name] = value;
    if (raw !== undefined && typeof raw !== "string") errors[name] = "Please enter a text value.";
    else if (value.length < minimum) errors[name] = `Please enter at least ${minimum} characters.`;
    else if (value.length > maximum) errors[name] = `Please use no more than ${maximum} characters.`;
  }
  fields.email = fields.email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = "Enter a valid email address.";
  if (!/^[+()\d\s.-]{6,40}$/.test(fields.phone) || fields.phone.replace(/\D/g, "").length < 6) errors.phone = "Enter a valid phone number, including your country code.";
  if (!trackSlugs.includes(fields.primaryTrack)) errors.primaryTrack = "Choose one of the available tracks.";
  if (fields.secondaryTrack && (!trackSlugs.includes(fields.secondaryTrack) || fields.secondaryTrack === fields.primaryTrack)) errors.secondaryTrack = "Choose a different second track, or leave it empty.";
  if (!(availabilityOptions as readonly string[]).includes(fields.weeklyAvailability)) errors.weeklyAvailability = "Choose your weekly availability.";
  if (!(laptopOptions as readonly string[]).includes(fields.laptopAccess)) errors.laptopAccess = "Choose your laptop/desktop access.";
  if (!(studyOptions as readonly string[]).includes(fields.studyLevel)) errors.studyLevel = "Choose your current learning or career stage.";
  for (const name of ["linkedin", "portfolio", "github"] as const) {
    if (fields[name] && !isPublicLink(fields[name])) errors[name] = "Use a complete http(s) link without embedded credentials.";
  }
  if (fields.otherLinks && (fields.otherLinks.split(/\s+/).length > 3 || fields.otherLinks.split(/\s+/).some((link) => !isPublicLink(link)))) errors.otherLinks = "Use up to three complete http(s) links, one per line.";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(fields.submissionId)) errors.submissionId = "Please retry the application.";
  if (body.ageConfirmed !== true) errors.ageConfirmed = "The initial cohort is limited to applicants aged 18 or older.";
  if (body.acknowledgement !== true) errors.acknowledgement = "Please acknowledge the unpaid program and no-employment-guarantee terms.";
  if (body.privacyConsent !== true) errors.privacyConsent = "Please agree to application processing before submitting.";
  return { errors, application: { ...fields, ageConfirmed: true, acknowledgement: true, privacyConsent: true } as LaunchpadApplication, valid: Object.keys(errors).length === 0 };
}
