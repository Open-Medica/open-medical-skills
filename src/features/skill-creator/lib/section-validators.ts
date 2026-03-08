/**
 * section-validators.ts -- Client-side validation for each skill section.
 *
 * Validates section content before it can be marked as "accepted" and before
 * the final skill output is generated. Validation rules are based on the
 * content schema in src/content.config.ts and patterns observed in existing skills.
 */

import type { SectionId, SkillMetadata, MedicalCategory, EvidenceLevel, SafetyClassification } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const VALID_CATEGORIES: MedicalCategory[] = [
  'diagnosis', 'treatment', 'lab-imaging', 'pharmacy', 'emergency',
  'surgery', 'nursing', 'pediatrics', 'mental-health', 'public-health',
  'research', 'education', 'administrative', 'clinical-research-summarizing',
];

const VALID_EVIDENCE_LEVELS: EvidenceLevel[] = ['high', 'moderate', 'low', 'expert-opinion'];
const VALID_SAFETY: SafetyClassification[] = ['safe', 'caution', 'restricted'];

function ok(): ValidationResult {
  return { valid: true, errors: [], warnings: [] };
}

function fail(errors: string[], warnings: string[] = []): ValidationResult {
  return { valid: false, errors, warnings };
}

/** Validate a single section's content. */
export function validateSection(
  sectionId: SectionId | string,
  content: string
): ValidationResult {
  const trimmed = content.trim();

  if (!trimmed) {
    return fail(['This section cannot be empty.']);
  }

  switch (sectionId) {
    case 'title': {
      if (trimmed.length < 3) return fail(['Title must be at least 3 characters.']);
      if (trimmed.length > 100) return fail(['Title must be 100 characters or fewer.']);
      const warnings: string[] = [];
      if (trimmed.startsWith('#')) warnings.push('Title should not include markdown heading syntax.');
      return { valid: true, errors: [], warnings };
    }

    case 'description': {
      if (trimmed.length < 50) return fail(['Description should be at least 50 characters long.']);
      const warnings: string[] = [];
      if (trimmed.length < 100) warnings.push('A longer description (100+ characters) is recommended.');
      return { valid: true, errors: [], warnings };
    }

    case 'quick-install': {
      const hasCodeBlock = /```/.test(trimmed) || /`[^`]+`/.test(trimmed);
      const warnings: string[] = [];
      if (!hasCodeBlock) warnings.push('Consider wrapping install commands in code blocks.');
      return { valid: true, errors: [], warnings };
    }

    case 'what-it-does': {
      const bulletCount = (trimmed.match(/^[\-\*]\s/gm) || []).length;
      const warnings: string[] = [];
      if (bulletCount < 3) warnings.push('Consider adding at least 4 bullet points describing capabilities.');
      return { valid: true, errors: [], warnings };
    }

    case 'clinical-use-cases': {
      const bulletCount = (trimmed.match(/^[\-\*]\s/gm) || []).length;
      const warnings: string[] = [];
      if (bulletCount < 2) warnings.push('Consider adding at least 3 clinical use case scenarios.');
      return { valid: true, errors: [], warnings };
    }

    case 'safety-evidence': {
      const hasSafety = /safe|caution|restricted/i.test(trimmed);
      const hasEvidence = /high|moderate|low|expert.?opinion/i.test(trimmed);
      const errors: string[] = [];
      if (!hasSafety) errors.push('Safety classification must be mentioned (Safe, Caution, or Restricted).');
      if (!hasEvidence) errors.push('Evidence level must be mentioned (High, Moderate, Low, or Expert Opinion).');
      return { valid: errors.length === 0, errors, warnings: [] };
    }

    case 'example-usage': {
      const warnings: string[] = [];
      if (trimmed.length < 50) warnings.push('Examples should include realistic input/output demonstrations.');
      return { valid: true, errors: [], warnings };
    }

    case 'technical-details': {
      const warnings: string[] = [];
      if (!/category/i.test(trimmed)) warnings.push('Consider specifying the medical category.');
      if (!/author/i.test(trimmed)) warnings.push('Consider specifying the author.');
      return { valid: true, errors: [], warnings };
    }

    case 'references': {
      const refCount = (trimmed.match(/^[\-\*]\s/gm) || []).length;
      const warnings: string[] = [];
      if (refCount < 2) warnings.push('Consider adding at least 3 academic or clinical references.');
      return { valid: true, errors: [], warnings };
    }

    default:
      return ok();
  }
}

/** Validate the complete skill metadata before output generation. */
export function validateMetadata(metadata: SkillMetadata): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!metadata.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name)) {
    errors.push('Skill name must be in kebab-case (e.g., "drug-interaction-checker").');
  }

  if (!metadata.displayName || metadata.displayName.trim().length < 3) {
    errors.push('Display name is required and must be at least 3 characters.');
  }

  if (!metadata.description || metadata.description.trim().length < 10) {
    errors.push('Description is required.');
  }

  if (!metadata.author || metadata.author.trim().length === 0) {
    errors.push('Author is required.');
  }

  if (metadata.repository && !/^https?:\/\/.+/.test(metadata.repository)) {
    errors.push('Repository must be a valid URL starting with http:// or https://.');
  }

  if (!VALID_CATEGORIES.includes(metadata.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}.`);
  }

  if (!VALID_EVIDENCE_LEVELS.includes(metadata.evidenceLevel)) {
    errors.push(`Evidence level must be one of: ${VALID_EVIDENCE_LEVELS.join(', ')}.`);
  }

  if (!VALID_SAFETY.includes(metadata.safetyClassification)) {
    errors.push(`Safety classification must be one of: ${VALID_SAFETY.join(', ')}.`);
  }

  if (metadata.dateAdded && !/^\d{4}-\d{2}-\d{2}$/.test(metadata.dateAdded)) {
    errors.push('Date must be in YYYY-MM-DD format.');
  }

  if (!metadata.tags || metadata.tags.length === 0) {
    warnings.push('Consider adding at least one tag.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/** Validate all sections are complete before generating output. */
export function validateAllSections(
  sections: Array<{ id: string; content: string; required: boolean }>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const section of sections) {
    if (section.required && !section.content.trim()) {
      errors.push(`Required section "${section.id}" is empty.`);
      continue;
    }

    if (section.content.trim()) {
      const result = validateSection(section.id as SectionId, section.content);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
