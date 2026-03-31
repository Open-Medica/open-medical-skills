import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import chalk from 'chalk';
import { printDisclaimer } from './disclaimer.js';

const INSTALL_TARGETS = {
  'claude-code': {
    global: () => join(homedir(), '.claude', 'skills'),
    description: 'Claude Code skills directory',
  },
  'cursor': {
    project: () => join(process.cwd(), '.cursor', 'rules'),
    global: () => join(homedir(), '.cursor', 'rules'),
    description: 'Cursor rules directory',
  },
  'windsurf': {
    project: () => join(process.cwd(), '.windsurf', 'rules'),
    description: 'Windsurf rules directory',
  },
  'manus': {
    global: () => join(homedir(), '.manus', 'skills'),
    description: 'Manus skills directory',
  },
  'local': {
    project: () => process.cwd(),
    description: 'Current directory',
  },
};

function resolveTargetPath(agent, skillName, { global: useGlobal = false } = {}) {
  const target = INSTALL_TARGETS[agent];
  if (!target) return null;

  const basePath = (useGlobal && target.global) ? target.global() : (target.project || target.global)();

  if (agent === 'manus') {
    return join(basePath, skillName);
  }
  return basePath;
}

export function getAvailableTargets() {
  return Object.keys(INSTALL_TARGETS);
}

export async function installSkill(skillName, skillContent, agent, options = {}) {
  const agents = agent === '*' ? Object.keys(INSTALL_TARGETS).filter(a => a !== 'local') : [agent];
  const results = [];

  for (const targetAgent of agents) {
    const targetPath = resolveTargetPath(targetAgent, skillName, options);
    if (!targetPath) {
      results.push({ agent: targetAgent, success: false, error: 'Unknown target' });
      continue;
    }

    try {
      if (!existsSync(targetPath)) {
        mkdirSync(targetPath, { recursive: true });
      }

      const fileName = targetAgent === 'manus' ? 'SKILL.md' : `${skillName}.md`;
      const filePath = join(targetPath, fileName);
      writeFileSync(filePath, skillContent, 'utf-8');

      results.push({ agent: targetAgent, success: true, path: filePath });
    } catch (err) {
      results.push({ agent: targetAgent, success: false, error: err.message });
    }
  }

  return results;
}

export function printInstallResults(results) {
  for (const result of results) {
    if (result.success) {
      console.log(
        `  ${chalk.green('\u2713')} ${chalk.white(result.agent)} \u2192 ${chalk.gray(result.path)}`
      );
    } else {
      console.log(
        `  ${chalk.red('\u2717')} ${chalk.white(result.agent)} \u2192 ${chalk.red(result.error)}`
      );
    }
  }
  console.log('');
  printDisclaimer();
}
