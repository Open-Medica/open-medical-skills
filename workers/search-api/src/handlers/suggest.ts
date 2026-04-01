/**
 * Autocomplete suggestion handler — D1 LIKE prefix search.
 *
 * Provides fast typeahead suggestions by querying tool names that
 * match a given prefix, returning up to 10 results.
 */

import type { Env } from '../lib/types';

const MAX_SUGGESTIONS = 10;

/**
 * Fetch autocomplete suggestions for the given prefix.
 *
 * @param prefix - The user-typed prefix to match against tool names
 * @param env    - Worker environment bindings
 * @returns Array of matching tool name strings (max 10)
 */
export async function handleSuggest(
  prefix: string,
  env: Env
): Promise<string[]> {
  // Sanitize prefix — strip LIKE wildcards to prevent injection
  const sanitized = prefix.replace(/[%_]/g, '');
  if (!sanitized) {
    return [];
  }

  const pattern = `${sanitized}%`;

  try {
    const { results } = await env.DB.prepare(
      'SELECT name, display_name FROM skills WHERE display_name LIKE ? OR name LIKE ? ORDER BY name ASC LIMIT ?'
    )
      .bind(pattern, pattern, MAX_SUGGESTIONS)
      .all<{ name: string; display_name: string }>();

    return (results ?? []).map((r) => r.name).filter(Boolean);
  } catch (err) {
    console.error('Suggest request failed:', err);
    return [];
  }
}
