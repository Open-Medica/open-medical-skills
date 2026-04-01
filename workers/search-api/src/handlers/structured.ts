/**
 * Structured search handler — D1 SQL queries.
 *
 * Provides filtered, paginated tool search by category, domain, and other
 * structured fields via the Cloudflare D1 database.
 */

import type { Env, SearchResponse, SearchResult } from '../lib/types';

interface StructuredSearchParams {
  category?: string;
  domain?: string;
  limit?: number;
  offset?: number;
}

interface SkillRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  domain?: string;
}

/**
 * Perform a structured search against D1 with optional filters.
 *
 * @param params - Filter criteria (category, domain) and pagination (limit, offset)
 * @param env    - Worker environment bindings
 * @returns Filtered, paginated search results
 */
export async function handleStructuredSearch(
  params: StructuredSearchParams,
  env: Env
): Promise<SearchResponse> {
  const start = Date.now();
  const limit = Math.max(1, Math.min(100, params.limit ?? 20));
  const offset = Math.max(0, params.offset ?? 0);

  try {
    // Build WHERE clause from filters
    const conditions: string[] = [];
    const bindings: unknown[] = [];

    if (params.category) {
      conditions.push('category = ?');
      bindings.push(params.category);
    }

    if (params.domain) {
      conditions.push('domain = ?');
      bindings.push(params.domain);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Batch count + select into a single D1 round-trip
    const countStmt = env.DB.prepare(
      `SELECT COUNT(*) as total FROM skills ${whereClause}`
    ).bind(...bindings);
    const selectStmt = env.DB.prepare(
      `SELECT id, name, description, category, domain FROM skills ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset);

    const [countResult, dataResult] = await env.DB.batch([countStmt, selectStmt]);
    const total = (countResult.results?.[0] as Record<string, unknown>)?.total as number ?? 0;
    const records = dataResult.results as SkillRecord[] ?? [];

    const results: SearchResult[] = (records ?? []).map((record, index) => ({
      id: record.id || record.name || `skill-${index}`,
      name: record.name || '',
      description: record.description || '',
      category: record.category || 'uncategorized',
      domain: record.domain,
      score: 1.0, // Structured results don't have relevance scores
      source: 'structured' as const,
    }));

    return {
      results,
      total,
      query: JSON.stringify(params),
      took_ms: Date.now() - start,
    };
  } catch (err) {
    console.error('Structured search failed:', err);
    return {
      results: [],
      total: 0,
      query: JSON.stringify(params),
      took_ms: Date.now() - start,
    };
  }
}
