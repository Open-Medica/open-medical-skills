#!/usr/bin/env node

/**
 * Semantic deduplication check for CI.
 *
 * Usage: node scripts/dedup-check.js <yaml-file-path> [yaml-file-path...]
 *
 * Calls the OMS search API dedup endpoint to check for similar existing skills.
 * Exit code 0 if no duplicates, exit code 1 if duplicates found (advisory).
 */

import { readFileSync } from 'node:fs';

const API_URL = process.env.OMS_API_URL || 'https://api.openmedica.us';
const THRESHOLD = parseFloat(process.env.OMS_DEDUP_THRESHOLD || '0.85');

function parseYamlDescription(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  if (match) return match[1].replace(/\\n/g, ' ').trim();

  // Try multiline
  const multiMatch = content.match(/^description:\s*[|>]-?\s*\n([\s\S]*?)(?=^\w+:|\z)/m);
  if (multiMatch) return multiMatch[1].trim().replace(/\n/g, ' ');

  return null;
}

async function checkDedup(filePath) {
  const description = parseYamlDescription(filePath);
  if (!description) {
    console.log(`  SKIP: Could not parse description from ${filePath}`);
    return false;
  }

  try {
    const url = new URL('/api/dedup', API_URL);
    url.searchParams.set('q', description);
    url.searchParams.set('threshold', THRESHOLD.toString());

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'oms-dedup-check/1.0' },
    });

    if (!response.ok) {
      console.log(`  WARN: API returned ${response.status} for ${filePath}`);
      return false;
    }

    const result = await response.json();

    if (result.is_duplicate && result.duplicates.length > 0) {
      console.log(`\n  DUPLICATE CANDIDATES for ${filePath}:`);
      for (const dup of result.duplicates) {
        console.log(`    - ${dup.name} (similarity: ${(dup.similarity * 100).toFixed(1)}%)`);
        console.log(`      ${dup.description.slice(0, 100)}...`);
      }
      return true;
    }

    console.log(`  OK: No semantic duplicates for ${filePath}`);
    return false;
  } catch (err) {
    console.log(`  WARN: Dedup check failed for ${filePath}: ${err.message}`);
    return false;
  }
}

async function main() {
  const files = process.argv.slice(2).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

  if (files.length === 0) {
    console.log('No YAML files to check.');
    process.exit(0);
  }

  console.log(`Checking ${files.length} file(s) for semantic duplicates...\n`);

  let hasDupes = false;
  for (const file of files) {
    const isDupe = await checkDedup(file);
    if (isDupe) hasDupes = true;
  }

  if (hasDupes) {
    console.log('\n  WARNING: Potential duplicates found (advisory — not blocking).\n');
    process.exit(1);
  }

  console.log('\n  All checks passed — no semantic duplicates.\n');
  process.exit(0);
}

main();
