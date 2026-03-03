export const CATEGORIES = [
  "diagnosis",
  "treatment",
  "lab-imaging",
  "pharmacy",
  "emergency",
  "surgery",
  "nursing",
  "pediatrics",
  "mental-health",
  "public-health",
  "research",
  "education",
  "administrative",
  "clinical-research-summarizing",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  diagnosis: "Diagnosis",
  treatment: "Treatment",
  "lab-imaging": "Lab & Imaging",
  pharmacy: "Pharmacy",
  emergency: "Emergency",
  surgery: "Surgery",
  nursing: "Nursing",
  pediatrics: "Pediatrics",
  "mental-health": "Mental Health",
  "public-health": "Public Health",
  research: "Research",
  education: "Education",
  administrative: "Administrative",
  "clinical-research-summarizing": "Clinical Research",
};

/** Tailwind classes for category badge backgrounds and text */
export const CATEGORY_STYLES: Record<Category, { bg: string; text: string; border: string }> = {
  diagnosis: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  treatment: { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  "lab-imaging": { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  pharmacy: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
  emergency: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
  surgery: { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
  nursing: { bg: "bg-pink-50 dark:bg-pink-950/40", text: "text-pink-700 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" },
  pediatrics: { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
  "mental-health": { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  "public-health": { bg: "bg-lime-50 dark:bg-lime-950/40", text: "text-lime-700 dark:text-lime-300", border: "border-lime-200 dark:border-lime-800" },
  research: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  education: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
  administrative: { bg: "bg-gray-50 dark:bg-gray-900/40", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700" },
  "clinical-research-summarizing": { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
};

export const EVIDENCE_STYLES: Record<string, { dot: string; label: string }> = {
  high: { dot: "bg-green-500", label: "High Evidence" },
  moderate: { dot: "bg-amber-500", label: "Moderate Evidence" },
  low: { dot: "bg-red-500", label: "Low Evidence" },
  "expert-opinion": { dot: "bg-gray-400", label: "Expert Opinion" },
};

export const SAFETY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  safe: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", label: "Safe" },
  caution: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", label: "Caution" },
  restricted: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-300", label: "Restricted" },
};
