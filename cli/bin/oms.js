#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { printBanner, printBannerCompact } from '../lib/banner.js';
import {
  formatSkillRow,
  formatSkillDetail,
  formatCategory,
} from '../lib/format.js';
import {
  findSkillSmart,
  inspectSkillSmart,
  findSkill,
  loadSkillsIndex,
  filterByCategory,
  listAllSkills,
} from '../lib/skills.js';
import { validateSkill, relateSkill } from '../lib/api-client.js';
import { installSkill, printInstallResults, getAvailableTargets } from '../lib/installer.js';
import { printDisclaimer } from '../lib/disclaimer.js';
import { getConfig } from '../lib/config.js';

const MAX_DESCRIPTION_WIDTH = 72;

const program = new Command();

program
  .name('oms')
  .description('Open Medical Skills CLI \u2014 physician-reviewed AI agent skills (research tool)')
  .version('2.0.0')
  .hook('preAction', () => {});

// ──────────────────────────────────────────────────────────────────
// oms find <query>
// ──────────────────────────────────────────────────────────────────
program
  .command('find <query>')
  .description('Search skills by semantic query (API-backed with local fallback)')
  .option('-c, --category <category>', 'Filter by medical category')
  .option('-l, --limit <n>', 'Max results', '20')
  .option('--json', 'Output as JSON')
  .action(async (query, opts) => {
    printBannerCompact();

    let results;

    if (opts.category) {
      // Category filter — local only
      results = filterByCategory(opts.category);
      if (results.length === 0) {
        console.error(chalk.red(`  No skills found in category "${opts.category}".`));
        process.exit(1);
      }
      // Further filter by query within category
      const q = query.toLowerCase();
      results = results.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.display_name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    } else {
      results = await findSkillSmart(query);
    }

    if (!results || results.length === 0) {
      console.log(chalk.yellow(`  No skills matched "${query}".`));
      console.log(chalk.gray(`  Try a broader search.\n`));
      return;
    }

    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    console.log(
      chalk.gray(`  ${results.length} result${results.length !== 1 ? 's' : ''} for "${chalk.white(query)}"\n`)
    );

    const limit = parseInt(opts.limit, 10);
    const displayed = results.slice(0, limit);

    for (let i = 0; i < displayed.length; i++) {
      const s = displayed[i];
      if (s.score !== undefined) {
        console.log(`  ${chalk.gray(`${String(i + 1).padStart(3)}.`)} ${chalk.bold.white(s.name)}  ${formatCategory(s.category || '')}  ${chalk.dim(`(${(s.score * 100).toFixed(0)}%)`)}`);
      } else {
        console.log(`  ${formatSkillRow(s, i)}`);
      }
      const desc = s.description || '';
      console.log(`       ${chalk.gray(truncateText(desc, MAX_DESCRIPTION_WIDTH))}`);
    }

    if (results.length > limit) {
      console.log(chalk.gray(`\n  ... and ${results.length - limit} more. Use --limit to see more.`));
    }

    console.log('');
    console.log(chalk.gray(`  Use ${chalk.white('oms inspect <skill-name>')} for details.`));
    console.log(chalk.gray(`  Use ${chalk.white('oms install <skill-name>')} to install.\n`));
    printDisclaimer();
  });

// ──────────────────────────────────────────────────────────────────
// oms list
// ──────────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all available skills')
  .option('-c, --category <category>', 'Filter by medical category')
  .option('-l, --limit <n>', 'Max results', '50')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    printBannerCompact();

    let skills = listAllSkills();

    if (opts.category) {
      skills = skills.filter(s => s.category === opts.category);
      if (skills.length === 0) {
        console.log(chalk.yellow(`  No skills in category "${opts.category}".`));
        return;
      }
    }

    if (opts.json) {
      console.log(JSON.stringify(skills, null, 2));
      return;
    }

    console.log(chalk.gray(`  ${skills.length} skill${skills.length !== 1 ? 's' : ''} available\n`));

    const limit = parseInt(opts.limit, 10);
    const displayed = skills.slice(0, limit);

    for (let i = 0; i < displayed.length; i++) {
      const s = displayed[i];
      console.log(`  ${chalk.gray(`${String(i + 1).padStart(3)}.`)} ${chalk.bold.white(s.name)}  ${formatCategory(s.category || '')}`);
    }

    if (skills.length > limit) {
      console.log(chalk.gray(`\n  ... and ${skills.length - limit} more. Use --limit to see more.`));
    }

    console.log('');
    console.log(chalk.gray(`  Use ${chalk.white('oms find <query>')} to search.`));
    console.log(chalk.gray(`  Use ${chalk.white('oms inspect <skill-name>')} for details.\n`));
    printDisclaimer();
  });

// ──────────────────────────────────────────────────────────────────
// oms inspect <skill-name>
// ──────────────────────────────────────────────────────────────────
program
  .command('inspect <skill-name>')
  .description('Show detailed information about a skill')
  .option('--json', 'Output as JSON')
  .action(async (skillName, opts) => {
    printBannerCompact();

    const skill = await inspectSkillSmart(skillName);
    if (!skill) {
      console.error(chalk.red(`  Error: Skill "${skillName}" not found.`));
      console.log(chalk.gray(`  Run ${chalk.white('oms find <query>')} to search.\n`));
      process.exit(1);
    }

    if (opts.json) {
      console.log(JSON.stringify(skill, null, 2));
      return;
    }

    console.log(formatSkillDetail(skill));
    printDisclaimer();
  });

// ──────────────────────────────────────────────────────────────────
// oms install <skill-name>
// ──────────────────────────────────────────────────────────────────
program
  .command('install <skill-name>')
  .description('Install a skill to an IDE/agent')
  .option('-a, --agent <agent>', 'Target: claude-code, cursor, windsurf, manus, local, *', 'claude-code')
  .option('-g, --global', 'Install to global directory (where supported)')
  .option('--dry-run', 'Show what would be installed without doing it')
  .action(async (skillName, opts) => {
    printBannerCompact();

    // Find the skill locally first
    const skill = findSkill(skillName);
    if (!skill) {
      console.error(chalk.red(`  Error: Skill "${skillName}" not found.`));
      console.log(chalk.gray(`  Run ${chalk.white('oms find <query>')} to search.\n`));
      process.exit(1);
    }

    // Safety warnings
    if (skill.safety_classification === 'restricted') {
      console.log(
        chalk.red.bold('  WARNING: ') +
        chalk.red('This skill has a RESTRICTED safety classification.')
      );
      console.log(
        chalk.red('  It should only be used under direct physician supervision.\n')
      );
    } else if (skill.safety_classification === 'caution') {
      console.log(
        chalk.yellow.bold('  NOTICE: ') +
        chalk.yellow('This skill has a CAUTION safety classification.')
      );
      console.log(
        chalk.yellow('  Review outputs carefully before clinical application.\n')
      );
    }

    const agent = opts.agent;
    const validTargets = [...getAvailableTargets(), '*'];
    if (!validTargets.includes(agent)) {
      console.error(chalk.red(`  Invalid agent "${agent}". Valid: ${validTargets.join(', ')}`));
      process.exit(1);
    }

    console.log(`  ${chalk.gray('Skill:')}  ${chalk.bold.white(skill.display_name)}`);
    console.log(`  ${chalk.gray('Agent:')}  ${chalk.white(agent === '*' ? 'all targets' : agent)}`);
    console.log('');

    if (opts.dryRun) {
      console.log(chalk.gray('  (dry run \u2014 no files written)\n'));
      return;
    }

    // Try to load SKILL.md content from skills directory
    let skillContent;
    try {
      const { fileURLToPath } = await import('node:url');
      const { dirname, join } = await import('node:path');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const skillMdPath = join(__dirname, '..', '..', 'skills', skillName, 'SKILL.md');
      skillContent = readFileSync(skillMdPath, 'utf-8');
    } catch {
      // Fallback: generate basic content from YAML data
      skillContent = [
        '---',
        `name: ${skill.name}`,
        `description: ${skill.description}`,
        `metadata:`,
        `  author: ${skill.author}`,
        `  version: ${skill.version || '1.0.0'}`,
        `  medical_category: ${skill.category}`,
        `  evidence_level: ${skill.evidence_level || 'moderate'}`,
        `  safety: ${skill.safety_classification || 'safe'}`,
        '---',
        '',
        `# ${skill.display_name}`,
        '',
        skill.description,
        '',
        '> This is a research and learning tool. Not a substitute for professional medical judgment.',
        '',
      ].join('\n');
    }

    console.log(chalk.gray('  Installing...\n'));
    const results = await installSkill(skillName, skillContent, agent, { global: opts.global });
    printInstallResults(results);
  });

// ──────────────────────────────────────────────────────────────────
// oms validate <skill-name>
// ──────────────────────────────────────────────────────────────────
program
  .command('validate <skill-name>')
  .description('Check skill health (repo access, YAML schema)')
  .option('--json', 'Output as JSON')
  .action(async (skillName, opts) => {
    printBannerCompact();

    try {
      const result = await validateSkill(skillName);

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log(`  ${chalk.bold.white('Validation: ')} ${chalk.white(skillName)}\n`);

      if (result.valid) {
        console.log(`  ${chalk.green('\u2713')} YAML schema valid`);
      } else {
        console.log(`  ${chalk.red('\u2717')} YAML schema invalid`);
        if (result.errors) {
          for (const err of result.errors) {
            console.log(`    ${chalk.red('\u2192')} ${err}`);
          }
        }
      }

      if (result.repo_accessible !== undefined) {
        console.log(
          result.repo_accessible
            ? `  ${chalk.green('\u2713')} Repository accessible`
            : `  ${chalk.red('\u2717')} Repository not accessible`
        );
      }

      console.log('');
    } catch (err) {
      console.error(chalk.red(`  Error: Could not validate "${skillName}".`));
      console.error(chalk.gray(`  ${err.message}`));
      console.log(chalk.gray('\n  The validation API may be unavailable. Try again later.\n'));
      process.exit(1);
    }

    printDisclaimer();
  });

// ──────────────────────────────────────────────────────────────────
// oms relate <skill-name>
// ──────────────────────────────────────────────────────────────────
program
  .command('relate <skill-name>')
  .description('Find related skills via graph traversal')
  .option('--json', 'Output as JSON')
  .action(async (skillName, opts) => {
    printBannerCompact();

    try {
      const result = await relateSkill(skillName);

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      if (!result.related || result.related.length === 0) {
        console.log(chalk.yellow(`  No related skills found for "${skillName}".\n`));
        return;
      }

      console.log(`  ${chalk.bold.white('Related to:')} ${chalk.hex('#0D9488')(skillName)}\n`);

      for (let i = 0; i < result.related.length; i++) {
        const r = result.related[i];
        const score = r.score !== undefined ? chalk.dim(` (${(r.score * 100).toFixed(0)}%)`) : '';
        console.log(`  ${chalk.gray(`${String(i + 1).padStart(3)}.`)} ${chalk.bold.white(r.name)}  ${formatCategory(r.category || '')}${score}`);
        if (r.description) {
          console.log(`       ${chalk.gray(truncateText(r.description, MAX_DESCRIPTION_WIDTH))}`);
        }
      }

      if (result.categories && result.categories.length > 0) {
        console.log(`\n  ${chalk.gray('Categories:')} ${result.categories.map(c => formatCategory(c)).join(', ')}`);
      }

      console.log('');
    } catch (err) {
      console.error(chalk.red(`  Error: Could not find related skills for "${skillName}".`));
      console.error(chalk.gray(`  ${err.message}\n`));
      process.exit(1);
    }

    printDisclaimer();
  });

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ──────────────────────────────────────────────────────────────────
// Parse
// ──────────────────────────────────────────────────────────────────
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  printBanner();
  program.outputHelp();
  console.log('');
  printDisclaimer();
}
