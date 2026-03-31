/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  ALLOWED_ORIGIN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  /** OAuth callback URL — must match the one registered in the GitHub OAuth App */
  OAUTH_REDIRECT_URI: string;
}

/**
 * Valid medical categories — must match src/lib/categories.ts and src/content.config.ts
 */
export const VALID_CATEGORIES = [
  'diagnosis',
  'treatment',
  'lab-imaging',
  'pharmacy',
  'emergency',
  'surgery',
  'nursing',
  'pediatrics',
  'mental-health',
  'public-health',
  'research',
  'education',
  'administrative',
  'clinical-research-summarizing',
] as const;

export type MedicalCategory = (typeof VALID_CATEGORIES)[number];

/**
 * Submission data from the web form
 */
export interface SubmissionData {
  name: string;
  display_name: string;
  description: string;
  author: string;
  repository: string;
  category: MedicalCategory;
  tags?: string[];
  version?: string;
  license?: string;
  install?: {
    npx?: string;
    wget?: string;
    git?: string;
    docker?: string;
  };
  clinical_evidence?: string;
  safety_guardrails?: string;
}

/**
 * API response
 */
export interface ApiResponse {
  success: boolean;
  pr_url?: string;
  error?: string;
  errors?: string[];
}
