# Testing Patterns

**Analysis Date:** 2026-03-22

## Test Framework

**Runner:**
- Not detected in codebase
- No Jest, Vitest, or test configuration files in project root
- No `package.json` scripts for testing (only `dev`, `build`, `preview`, `astro`, `generate-cli-index`)

**Assertion Library:**
- Not configured

**Run Commands:**
- No test commands available: `pnpm test`, `pnpm test:watch`, `pnpm test:coverage` not present

## Test File Organization

**Location:**
- No test files in `src/` directory
- No dedicated `__tests__/` or `test/` directories in project root
- Testing not implemented or enforced

**Naming:**
- Not applicable — no test files in source code

**Structure:**
- Not applicable — no test files in source code

## Testing Status: Not Implemented

**Current State:**
The Open Medical Skills codebase has **zero test coverage**. No unit tests, integration tests, or end-to-end tests are present in the source directory (`.test.ts`, `.spec.ts` files only exist in `node_modules/`).

## Code Validation Patterns (Alternative to Unit Tests)

While formal testing is not implemented, validation patterns are used in the codebase:

### Content Schema Validation (Zod)

**Location:** `src/content.config.ts`

```typescript
const skills = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './content/skills' }),
  schema: z.object({
    name: z.string(),
    display_name: z.string(),
    description: z.string(),
    author: z.string(),
    repository: z.string().url(),  // URL validation
    category: z.enum([...]),       // Enum validation
    tags: z.array(z.string()).default([]),
    evidence_level: z.enum(['high', 'moderate', 'low', 'expert-opinion']).default('moderate'),
    safety_classification: z.enum(['safe', 'caution', 'restricted']).default('safe'),
    status: z.enum(['published', 'draft', 'coming-soon']).default('draft'),
    verified: z.boolean().default(false),
    date_added: z.string(),
    // ... 20+ more fields
  }),
});
```

**What it validates:**
- YAML file structure at build time
- Category enums match exactly (canonical 14 categories)
- URL format for repository links
- Evidence levels and safety classifications constrained
- Required fields enforced
- Type safety for optional fields with defaults

**How it works:**
- Astro Content Layer API automatically validates all YAML files during `pnpm build`
- Build fails if any YAML violates schema
- No runtime validation needed — errors caught at build time

### Client-side Section Validation (Skill Creator)

**Location:** `src/features/skill-creator/lib/section-validators.ts`

Functions validate individual sections before LLM refinement:
- Category enum check
- Required field presence
- Format constraints (date YYYY-MM-DD, URL validation)
- Metadata completeness

### Cloudflare Worker Input Validation

**Location:** `workers/search-api/src/index.ts`

```typescript
if (url.pathname === '/api/search' || url.pathname === '/api/search/') {
  const q = url.searchParams.get('q');
  if (!q) return jsonError('Missing query parameter "q"', 400);  // Validation
  const limit = Math.min(
    parseInt(url.searchParams.get('limit') || '20', 10),
    100  // Constraint enforcement
  );
```

**Patterns:**
- Query parameter presence checks
- Integer parsing with base argument
- Min/max enforcement (limit capped at 100)
- Method validation (`GET` only)
- CORS preflight handling

### Error Handling in Async Code

**Location:** `src/lib/auth.ts`

```typescript
export async function exchangeCode(code: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/github/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {  // HTTP error check
    const data = await response.json().catch(() => ({}));
    throw new Error((data as Record<string, string>).error || "Failed to exchange authorization code");
  }

  const data = (await response.json()) as { access_token: string };

  if (!data.access_token) {  // Response validation
    throw new Error("No access token received");
  }

  return data.access_token;
}
```

**Patterns:**
- `response.ok` check before consuming response body
- Safe JSON parsing with `.catch()`
- Type assertion after validation: `(data as Record<string, string>)`
- Null/undefined checks before use
- Custom error messages with fallbacks

### Type Safety (TypeScript Strict Mode)

**Location:** `tsconfig.json`

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

**What it enforces:**
- No implicit `any` types
- Explicit return type annotations required
- Strict null/undefined checks
- Type narrowing required in conditionals
- Property existence verified before access

## Build-Time Validation

**Astro Build:**
- `pnpm build` triggers Astro's content validation
- All YAML schema violations fail the build
- No invalid skills/plugins can be published
- Type-checked TypeScript compilation

**Workflow validation:**
- GitHub Actions validate PR submissions (`.github/workflows/validate-submission.yml`)
- Checks YAML format, categories, URL validity
- Blocks PRs that don't pass schema

## Testing Recommendations

**For Future Implementation:**

### Unit Testing

**Suggested framework:** Vitest (Vite-native, fast, less config)

**Test locations:**
- `src/lib/__tests__/` for utilities (auth, categories)
- `src/components/__tests__/` for React components
- `src/features/skill-creator/lib/__tests__/` for assembler, validators

**What to test:**
- Auth token exchange flow (`auth.ts`)
- Category mapping and styling (`categories.ts`)
- Skill assembler output generation (`skill-assembler.ts`)
- Section validators edge cases (`section-validators.ts`)
- LLM proxy request formatting (`llm-proxy.ts`)

### Integration Testing

**Test locations:** `workers/search-api/__tests__/`

**What to test:**
- Search API route handling
- CORS header generation
- Query parameter validation
- Error response formats
- Rate limiting (in-memory Map)

### E2E Testing (Optional)

**Suggested framework:** Playwright

**Test scenarios:**
- Homepage search + category filter
- Skill detail page rendering
- Submission form workflow
- Auth flow (GitHub OAuth)
- Chat-to-create-skill feature

## Mocking Strategy (for future tests)

**What to mock:**
- `fetch()` calls (use MSW or manual mocks)
- `localStorage` and `sessionStorage`
- `crypto.getRandomValues()` for deterministic tests
- GitHub API responses for auth tests

**What NOT to mock:**
- TypeScript validation (test actual Zod schemas)
- Component rendering (use React Testing Library)
- Astro content collection loading (use actual test fixtures)

## Coverage Goals (Recommended)

**Target:** 70% statement coverage minimum, 100% for critical paths

**Critical paths (must test):**
- Auth flow (token exchange, state verification)
- Content validation (schema enforcement)
- API error handling
- Search/filter logic
- Skill assembler output correctness

**Nice to have (test if time):**
- Component interaction (keyboard navigation, theme toggle)
- LLM integration (with mock providers)
- Submission pipeline

---

*Testing analysis: 2026-03-22*

## Notes

- **Why no tests?** Static site deployed via Astro with Cloudflare Pages. Most content is validated at build time via Zod schemas. Client-side is lightweight (search, filter, theme toggle). API is minimal (Cloudflare Worker). Testing ROI is lower than a traditional dynamic application.

- **Schema as contract:** Zod schemas in `src/content.config.ts` serve as the primary validation mechanism. Any YAML that doesn't match the schema fails the build. This is equivalent to contract testing.

- **Type safety via TypeScript:** Strict mode in `tsconfig.json` catches many bugs at compile time that unit tests would catch at runtime.

- **Recommendation:** Start with Vitest for utility functions (auth, validators) and integration tests for Workers. Component tests can wait until interactive features increase in complexity. Focus on E2E tests for critical user workflows.
