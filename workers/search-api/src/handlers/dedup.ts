/**
 * Deduplication handler — finds semantically similar skills.
 *
 * GET /api/dedup?q=<description>&threshold=0.85
 */

import type { Env } from '../lib/types';
import { embedQuery } from '../lib/embed';

interface DedupResult {
  query: string;
  threshold: number;
  duplicates: Array<{
    name: string;
    description: string;
    category: string;
    similarity: number;
  }>;
  is_duplicate: boolean;
}

export async function handleDedup(
  description: string,
  threshold: number,
  env: Env,
): Promise<DedupResult> {
  // Generate embedding for the description
  const embedding = await embedQuery(description, env);

  // Search Qdrant for similar embeddings above threshold
  const qdrantPayload = {
    vector: embedding,
    limit: 10,
    score_threshold: threshold,
    with_payload: true,
  };

  const qdrantResponse = await fetch(
    `${env.QDRANT_URL}/collections/${env.QDRANT_COLLECTION}/points/search`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qdrantPayload),
    }
  );

  if (!qdrantResponse.ok) {
    throw new Error(`Qdrant search failed: ${qdrantResponse.status}`);
  }

  const qdrantData = await qdrantResponse.json() as {
    result: Array<{
      id: string | number;
      score: number;
      payload?: Record<string, unknown>;
    }>;
  };

  const duplicates = (qdrantData.result || []).map((hit) => ({
    name: (hit.payload?.name as string) || String(hit.id),
    description: (hit.payload?.description as string) || '',
    category: (hit.payload?.category as string) || '',
    similarity: Math.round(hit.score * 1000) / 1000,
  }));

  return {
    query: description.slice(0, 200),
    threshold,
    duplicates,
    is_duplicate: duplicates.length > 0,
  };
}
