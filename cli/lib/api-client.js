import { getConfig } from './config.js';

const DEFAULT_TIMEOUT = 10000;

async function apiFetch(path, params = {}) {
  const config = getConfig();
  const url = new URL(path, config.apiUrl);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'oms-cli/2.0.0' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchSkills(query, { limit = 20, category } = {}) {
  const params = { q: query, limit };
  if (category) params.category = category;
  return apiFetch('/api/search', params);
}

export async function inspectSkill(name) {
  return apiFetch('/api/search/structured', { name: `eq.${name}` });
}

export async function validateSkill(name) {
  return apiFetch('/api/validate', { skill: name });
}

export async function relateSkill(name) {
  return apiFetch('/api/search/graph', { tool: name });
}

export function isApiAvailable() {
  return apiFetch('/api/search', { q: 'test', limit: 1 })
    .then(() => true)
    .catch(() => false);
}
