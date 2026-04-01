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

const ALLOWED_REPO_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org', 'huggingface.co'];
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

      // Check repository accessibility with SSRF domain whitelist
      const repoField = skill.repository as string;
      if (repoField) {
        try {
          const normalizedUrl = repoField.startsWith('http') ? repoField : `https://${repoField}`;
          const repoUrl = new URL(normalizedUrl);

          if (!ALLOWED_REPO_HOSTS.includes(repoUrl.hostname)) {
            // Unknown host — skip fetch to prevent SSRF, mark as unknown
            errors.push(`Repository host not in allowlist: ${repoUrl.hostname}`);
          } else {
            try {
              const repoResponse = await fetch(normalizedUrl, {
                method: 'HEAD',
                redirect: 'follow',
              });
              repoAccessible = repoResponse.ok;
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Unknown error';
              const repoError = message.includes('ENOTFOUND') ? 'DNS resolution failed' :
                message.includes('TIMEOUT') ? 'Connection timed out' :
                `Could not reach repository: ${message}`;
              errors.push(`Repository URL not accessible: ${repoError}`);
            }
          }
        } catch {
          errors.push(`Invalid repository URL: ${repoField}`);
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
