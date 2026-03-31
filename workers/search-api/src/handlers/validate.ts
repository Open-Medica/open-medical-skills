/**
 * Validation handler — checks skill health (repo access, YAML schema validity).
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

  // Query Supabase for the skill metadata
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/skill_tracker?name=eq.${encodeURIComponent(skillName)}`,
      {
        headers: {
          'apikey': env.SUPABASE_KEY || '',
          'Authorization': `Bearer ${env.SUPABASE_KEY || ''}`,
        },
      }
    );

    if (!response.ok) {
      errors.push(`Could not look up skill "${skillName}" in database`);
    } else {
      const skills = await response.json() as Record<string, unknown>[];

      if (skills.length === 0) {
        errors.push(`Skill "${skillName}" not found in database`);
      } else {
        const skill = skills[0];

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
