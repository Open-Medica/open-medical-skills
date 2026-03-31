/**
 * skill-assembler.ts -- Assembles completed sections into SKILL.md and content YAML.
 *
 * Takes the user's accepted section content and metadata, then generates:
 * 1. A SKILL.md file with YAML front matter
 * 2. A content YAML file matching the Zod schema in src/content.config.ts
 */

import yaml from 'js-yaml';
import type { SkillSection, SkillMetadata, SkillOutput } from '../types';
import { GITHUB_REPO_FULL, GITHUB_REPO_URL } from '../../../lib/constants';

/** Section ID to markdown heading mapping. */
const SECTION_HEADINGS: Record<string, string> = {
  title: '', // Title becomes the H1, not an H2
  description: '', // Description goes right after the H1
  'quick-install': '## Quick Install',
  'what-it-does': '## What It Does',
  'clinical-use-cases': '## Clinical Use Cases',
  'safety-evidence': '## Safety & Evidence',
  'example-usage': '## Example Usage',
  'technical-details': '## Technical Details',
  references: '## References',
};

/**
 * Generate the complete SKILL.md file from sections and metadata.
 */
export function assembleSkillMd(
  sections: SkillSection[],
  metadata: SkillMetadata
): string {
  const parts: string[] = [];

  // YAML front matter
  const frontMatter = yaml.dump(
    {
      name: metadata.name,
      description: metadata.description,
    },
    { lineWidth: 80, flowLevel: -1 }
  ).trim();

  parts.push(`---\n${frontMatter}\n---`);
  parts.push('');

  for (const section of sections) {
    const content = section.content.trim();
    if (!content) continue;

    if (section.id === 'title') {
      parts.push(`# ${content}`);
      parts.push('');
    } else if (section.id === 'description') {
      parts.push(content);
      parts.push('');
    } else {
      const heading = SECTION_HEADINGS[section.id] || `## ${section.customTitle || section.displayName}`;
      // If the content already starts with the heading, don't duplicate it
      if (content.startsWith(heading)) {
        parts.push(content);
      } else {
        parts.push(heading);
        parts.push('');
        parts.push(content);
      }
      parts.push('');
    }
  }

  // Footer
  parts.push('---');
  parts.push('');
  parts.push(
    `*This skill is part of [Open Medical Skills](${GITHUB_REPO_URL}), a curated marketplace of medical AI skills maintained by physicians for physicians and the healthcare industry.*`
  );
  parts.push('');

  return parts.join('\n');
}

/**
 * Generate the content YAML file matching the Zod schema.
 */
export function assembleContentYaml(
  sections: SkillSection[],
  metadata: SkillMetadata
): string {
  const titleSection = sections.find((s) => s.id === 'title');
  const descSection = sections.find((s) => s.id === 'description');

  const installCmd = `npx skills add ${GITHUB_REPO_FULL} --skill ${metadata.name}`;
  const gitCmd = `git clone ${GITHUB_REPO_URL}.git && cp -r open-medical-skills/skills/${metadata.name} ~/.claude/skills/`;

  const data: Record<string, unknown> = {
    name: metadata.name,
    display_name: titleSection?.content.trim() || metadata.displayName,
    description: descSection?.content.trim().split('\n')[0] || metadata.description,
    author: metadata.author,
    repository:
      metadata.repository ||
      `${GITHUB_REPO_URL}/tree/main/skills/${metadata.name}`,
    category: metadata.category,
    tags: metadata.tags.length > 0 ? metadata.tags : [metadata.category],
    version: metadata.version || '1.0.0',
    license: metadata.license || 'MIT',
    type: 'skill',
    install: {
      npx: installCmd,
      git: gitCmd,
    },
    evidence_level: metadata.evidenceLevel,
    safety_classification: metadata.safetyClassification,
    specialty: metadata.specialty.length > 0 ? metadata.specialty : [metadata.category],
    reviewer: 'Pending Review',
    date_added: metadata.dateAdded || new Date().toISOString().split('T')[0],
    status: 'coming-soon',
    verified: false,
  };

  return yaml.dump(data, {
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: false,
    noRefs: true,
  });
}

/**
 * Generate both output files from the completed skill draft.
 */
export function assembleSkillOutput(
  sections: SkillSection[],
  metadata: SkillMetadata
): SkillOutput {
  return {
    skillMd: assembleSkillMd(sections, metadata),
    contentYaml: assembleContentYaml(sections, metadata),
    skillName: metadata.name,
  };
}
