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
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;

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

    // Count total matching rows
    const countQuery = `SELECT COUNT(*) as total FROM skills ${whereClause}`;
    const countResult = await env.DB.prepare(countQuery)
      .bind(...bindings)
      .first<{ total: number }>();
    const total = countResult?.total ?? 0;

    // Fetch paginated results
    const dataQuery = `SELECT id, name, description, category, domain FROM skills ${whereClause} ORDER BY name ASC LIMIT ? OFFSET ?`;
    const { results: records } = await env.DB.prepare(dataQuery)
      .bind(...bindings, limit, offset)
      .all<SkillRecord>();

    const results: SearchResult[] = (records ?? []).map((record, index) => ({
      id: record.id || String(index),
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
