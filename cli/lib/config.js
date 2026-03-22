import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.oms');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const CACHE_DIR = join(CONFIG_DIR, 'cache');

const DEFAULTS = {
  apiUrl: 'https://api.openmedicalskills.org',
  defaultAgent: 'claude-code',
  offlineMode: false,
};

export function getConfig() {
  const env = {
    apiUrl: process.env.OMS_API_URL,
    defaultAgent: process.env.OMS_DEFAULT_AGENT,
  };

  let fileConfig = {};
  try {
    if (existsSync(CONFIG_FILE)) {
      fileConfig = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch {
    // Ignore invalid config
  }

  return { ...DEFAULTS, ...fileConfig, ...Object.fromEntries(Object.entries(env).filter(([, v]) => v)) };
}

export function getCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
  return CACHE_DIR;
}

export function getCachedResults(key) {
  const file = join(getCacheDir(), `${key}.json`);
  try {
    if (existsSync(file)) {
      const data = JSON.parse(readFileSync(file, 'utf-8'));
      const ONE_HOUR = 60 * 60 * 1000;
      if (Date.now() - data.timestamp < ONE_HOUR) {
        return data.results;
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

export function setCachedResults(key, results) {
  const file = join(getCacheDir(), `${key}.json`);
  try {
    writeFileSync(file, JSON.stringify({ timestamp: Date.now(), results }));
  } catch {
    // Ignore cache write errors
  }
}
