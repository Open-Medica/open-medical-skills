/**
 * Validation handler — checks skill health (DB existence, required fields,
 * repo accessibility).
 *
 * GET /api/validate?skill=<name>
 */

import type { Env } from '../lib/types';

interface ValidationResult {
  skill: string;
  valid: boolean;
  repo_accessible: boolean;
  errors: string[];
}

const REQUIRED_FIELDS = ['name', 'display_name', 'description', 'author', 'repository', 'category'];
const VALID_CATEGORIES = [
  'diagnosis', 'treatment', 'lab-imaging', 'pharmacy', 'emergency', 'surgery',
  'nursing', 'pediatrics', 'mental-health', 'public-health', 'research',
  'education', 'administrative', 'clinical-research-summarizing',
];

export async function handleValidate(
  skillName: string,
  env: Env,
): Promise<ValidationResult> {
  const errors: string[] = [];
  let repoAccessible = false;

  // Query D1 for the skill metadata
  try {
    const skill = await env.DB.prepare(
      'SELECT name, display_name, description, author, repository, category FROM skills WHERE name = ?'
    )
      .bind(skillName)
      .first<Record<string, unknown>>();

    if (!skill) {
      errors.push(`Skill "${skillName}" not found in database`);
    } else {
      // Validate required fields
      for (const field of REQUIRED_FIELDS) {
        if (!skill[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      // Validate category
      if (skill.category && !VALID_CATEGORIES.includes(skill.category as string)) {
        errors.push(`Invalid category: ${skill.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
      }

      // Check repository accessibility
      const repoUrl = skill.repository as string;
      if (repoUrl) {
        try {
          const normalizedUrl = repoUrl.startsWith('http') ? repoUrl : `https://${repoUrl}`;
          const repoResponse = await fetch(normalizedUrl, {
            method: 'HEAD',
            redirect: 'follow',
          });
          repoAccessible = repoResponse.ok || repoResponse.status === 301 || repoResponse.status === 302;
        } catch {
          errors.push(`Repository URL not accessible: ${repoUrl}`);
        }
      }
    }
  } catch (err) {
    errors.push(`Validation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  return {
    skill: skillName,
    valid: errors.length === 0,
    repo_accessible: repoAccessible,
    errors,
  };
}
