import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { searchSkills as apiSearch, inspectSkill as apiInspect, isApiAvailable } from './api-client.js';
import { getCachedResults, setCachedResults } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let _skillsCache = null;
let _apiAvailable = null;

export function loadSkillsIndex() {
  if (_skillsCache) return _skillsCache;

  const indexPath = join(__dirname, '..', 'data', 'skills-index.json');
  try {
    const raw = readFileSync(indexPath, 'utf-8');
    _skillsCache = JSON.parse(raw);
    return _skillsCache;
  } catch (err) {
    const isFileNotFound = err instanceof Error && 'code' in err && err.code === 'ENOENT';
    if (isFileNotFound) {
      console.error(
        'Skills index not found. Run "npm run generate-index" first.'
      );
    } else {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Failed to load skills index:', errorMessage);
    }
    process.exit(1);
  }
}

async function checkApiAvailable() {
  if (_apiAvailable !== null) return _apiAvailable;
  _apiAvailable = await isApiAvailable();
  return _apiAvailable;
}

export async function findSkillSmart(query) {
  // Try cache first
  const cacheKey = `find_${query}`;
  const cached = getCachedResults(cacheKey);
  if (cached) return cached;

  // Try API
  if (await checkApiAvailable()) {
    try {
      const result = await apiSearch(query, { limit: 20 });
      if (result.results && result.results.length > 0) {
        setCachedResults(cacheKey, result.results);
        return result.results;
      }
    } catch {
      // Fall through to local
    }
  }

  // Fallback to local
  return searchSkillsLocal(query);
}

export async function inspectSkillSmart(name) {
  if (await checkApiAvailable()) {
    try {
      const result = await apiInspect(name);
      if (result.results && result.results.length > 0) {
        return result.results[0];
      }
    } catch {
      // Fall through to local
    }
  }

  return findSkill(name);
}

export function findSkill(name) {
  const skills = loadSkillsIndex();
  return skills.find(
    (s) => s.name === name || s.display_name.toLowerCase() === name.toLowerCase()
  );
}

export function searchSkillsLocal(query) {
  const skills = loadSkillsIndex();
  const q = query.toLowerCase();

  return skills.filter((s) => {
    if (s.name.toLowerCase().includes(q)) return true;
    if (s.display_name.toLowerCase().includes(q)) return true;
    if (s.description.toLowerCase().includes(q)) return true;
    if (s.category.toLowerCase().includes(q)) return true;
    if (s.tags && s.tags.some((t) => t.toLowerCase().includes(q))) return true;
    if (s.specialty && s.specialty.some((sp) => sp.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function filterByCategory(category) {
  const skills = loadSkillsIndex();
  return skills.filter((s) => s.category === category);
}

export function getCategories() {
  const skills = loadSkillsIndex();
  const cats = {};
  for (const s of skills) {
    if (!cats[s.category]) {
      cats[s.category] = 0;
    }
    cats[s.category]++;
  }
  return cats;
}
