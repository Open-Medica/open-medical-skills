#!/usr/bin/env node
/**
 * Generate SQL seed file from skills-index.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const skillsPath = join(__dirname, '../cli/data/skills-index.json');
const outputPath = join(__dirname, '../api/migrations/0002_seed.sql');

const skills = JSON.parse(readFileSync(skillsPath, 'utf-8'));

const statements = [
  `-- Auto-generated seed file from skills-index.json`,
  `-- Generated: ${new Date().toISOString()}`,
  `-- Total skills: ${skills.length}`,
  ``,
];

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return str.replace(/'/g, "''");
}

for (const skill of skills) {
  const tags = escapeSql(JSON.stringify(skill.tags || []));
  const specialty = escapeSql(JSON.stringify(skill.specialty || []));
  
  statements.push(`INSERT OR REPLACE INTO skills (name, display_name, description, author, repository, category, tags, version, license, evidence_level, safety_classification, specialty, reviewer, date_added, verified)`);
  statements.push(`VALUES (`);
  statements.push(`  '${escapeSql(skill.name)}',`);
  statements.push(`  '${escapeSql(skill.display_name)}',`);
  statements.push(`  '${escapeSql(skill.description)}',`);
  statements.push(`  '${escapeSql(skill.author || 'Open Medical Skills Community')}',`);
  statements.push(`  '${escapeSql(skill.repository || '')}',`);
  statements.push(`  '${escapeSql(skill.category)}',`);
  statements.push(`  '${tags}',`);
  statements.push(`  '${escapeSql(skill.version || '1.0.0')}',`);
  statements.push(`  '${escapeSql(skill.license || 'MIT')}',`);
  statements.push(`  '${escapeSql(skill.evidence_level || 'moderate')}',`);
  statements.push(`  '${escapeSql(skill.safety_classification || 'safe')}',`);
  statements.push(`  '${specialty}',`);
  statements.push(`  '${escapeSql(skill.reviewer || 'Pending Review')}',`);
  statements.push(`  '${escapeSql(skill.date_added || new Date().toISOString().split('T')[0])}',`);
  statements.push(`  ${skill.verified ? 1 : 0}`);
  statements.push(`);`);
  statements.push(``);
}

writeFileSync(outputPath, statements.join('\n'));

console.log(`Generated ${outputPath} with ${skills.length} skills`);
