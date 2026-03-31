# Coding Conventions

**Analysis Date:** 2026-03-22

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `SearchBar.tsx`, `ThemeToggle.tsx`, `SkillOutputModal.tsx`)
- Utility/utility functions: camelCase with `.ts` extension (e.g., `llm-proxy.ts`, `skill-assembler.ts`, `auth.ts`)
- Astro components: PascalCase with `.astro` extension (e.g., `Header.astro`, `SkillGrid.astro`, `BaseLayout.astro`)
- YAML content files: kebab-case with `.yaml` or `.yml` extension (e.g., `skill-name.yaml`)
- Config files: camelCase with `.ts` (e.g., `tsconfig.json`, `astro.config.mjs`)

**Functions:**
- Exported functions: camelCase (e.g., `exchangeCode()`, `fetchUser()`, `saveAuth()`, `handleSemanticSearch()`)
- Internal/private functions: camelCase with leading underscore prefix for cache/state management (e.g., `_skillsCache`, `_apiAvailable`)
- Component event handlers: camelCase with prefix `handle` (e.g., `handleKeyDown()`, `handleClick()`, `toggleTheme()`)
- Async functions that fetch data: `fetch*` or `handle*` prefix (e.g., `fetchUser()`, `handleValidate()`)

**Variables:**
- State variables: camelCase (e.g., `isDarkMode`, `isLoggedIn`, `submitted`, `submitting`)
- Type/interface names: PascalCase (e.g., `GitHubUser`, `SkillSection`, `LLMProviderConfig`)
- Constants: UPPER_SNAKE_CASE for configuration values (e.g., `STORAGE_KEY_TOKEN`, `API_BASE_URL`, `GITHUB_CLIENT_ID`)
- Array/collection names: plural or suffixed (e.g., `results`, `skills`, `sections`, `messages`)
- Local identifiers: single letters acceptable in loops (e.g., `s`, `i`, `h`)

**Types:**
- Interfaces: PascalCase with `I` prefix optional (e.g., `GitHubUser`, `SkillSection`, `ChatMessage`)
- Type aliases: PascalCase (e.g., `MedicalCategory`, `EvidenceLevel`, `SafetyClassification`)
- Union type literals: kebab-case (e.g., `'lab-imaging'`, `'clinical-research-summarizing'`)
- Record/map types: Record<string, Type> pattern (e.g., `Record<Category, string>`)

## Code Style

**Formatting:**
- No ESLint/Prettier config in repository (not enforced)
- Implied style: 2-space indentation, single quotes for strings, semicolons
- JSX: Attributes on same line or new lines for readability
- Trailing commas: Observed in multi-line arrays/objects

**Linting:**
- No linting framework configured or enforced
- TypeScript strict mode enabled in `tsconfig.json`: `extends: "astro/tsconfigs/strict"`
- JSX import source configured: `jsxImportSource: "react"`

**Comments:**
- TSDoc/JSDoc style for exported functions and types: `/** ... */`
- Section dividers used: `// ---------------------------------------------------------------------------`
- Single-line comments: `//` for inline explanations
- No automatic documentation generation observed

**Destructuring:**
- Consistent use of destructuring for imports and function parameters (e.g., `const { query, setQuery } = ...`)
- Object destructuring with type annotations in interfaces (e.g., `{ id: string; display_name: string }`)

## Import Organization

**Order:**
1. Node.js built-ins (e.g., `import { readFileSync } from 'node:fs'`)
2. Third-party packages (e.g., `import { useState } from 'react'`)
3. Relative imports from project (e.g., `import { getCollection } from 'astro:content'`)
4. Type imports grouped together (e.g., `import type { Env } from './lib/types'`)

**Path Aliases:**
- Not explicitly configured in `tsconfig.json`
- Relative paths used throughout: `../layouts`, `../lib`, `./components`

**Type Imports:**
- Explicit `import type` syntax used for type-only imports (e.g., `import type { LLMProviderConfig } from '../types'`)
- Preserves runtime vs. type-level distinction clearly

## Error Handling

**Pattern:**
- Try-catch blocks used for async operations and file I/O
- Error type narrowing: `err instanceof Error ? err.message : String(err)`
- Error code checking: `'code' in err && err.code === 'ENOENT'`
- JSON parse errors caught silently with fallback: `.catch(() => ({}))`
- Custom error messages passed to constructors: `throw new Error("message")`

**Response errors:**
- HTTP error checking: `if (!response.ok) { ... throw new Error(...) }`
- JSON extraction from error responses: `const data = await response.json().catch(() => ({}))`
- Errors logged with context: `console.error('Context:', err)`

**Validation:**
- Conditional checks before operations (e.g., `if (!q.trim())`, `if (!data.access_token)`)
- Default/fallback values in parsing: `parseInt(..., 10)` with base argument, `Math.min(value, max)`

## Logging

**Framework:** console (no abstraction layer)

**Patterns:**
- Error logging: `console.error('operation failed:', err)` with context
- No info/debug/warn variants observed
- Only errors logged in user-facing code

**In Cloudflare Workers:**
- `console.error()` for request processing errors (e.g., `console.error('Search API error:', err)`)
- No structured logging observed

## Comments and Documentation

**When to Comment:**
- Complex algorithms or non-obvious logic (e.g., OAuth flow explanation in `auth.ts`)
- Configuration constants explained with rationale
- Security considerations noted (e.g., "client secret never touches browser")
- Flow diagrams for multi-step processes

**JSDoc/TSDoc:**
- Used for exported functions with parameters and return types documented
- Example: `/** Generate a random state parameter to prevent CSRF attacks. */`
- Not used for private functions or obvious helpers

**Section headers:**
- Files divided with section dividers: `// ---------------------------------------------------------------------------`
- Sections labeled: `// Configuration`, `// Types`, `// Persistence`, `// Error Handling`

## Function Design

**Size:** Functions kept small and focused
- Average function: 10-30 lines
- Helper functions extracted: `generateState()`, `verifyState()`, `corsHeaders()`

**Parameters:**
- Prefer object parameter for multiple arguments (e.g., `{ category, domain, limit, offset }`)
- Props interfaces for React components: `interface Props { skills: SkillEntry[] }`

**Return Values:**
- Functions return data directly or async Promises
- Void return for side-effect functions (e.g., `saveAuth()`, `toggleTheme()`)
- Type annotations explicit: `Promise<string>`, `boolean`, `SkillEntry[]`

## Module Design

**Exports:**
- Named exports for utility functions: `export function getToken()`, `export const CATEGORIES`
- Default export for React components: `export default function SearchBar(...)`
- Type exports: `export type MedicalCategory = ...`
- Mixed: Some modules export both default and named (React island + helper)

**Barrel Files:**
- Minimal use; content schemas in single file `src/content.config.ts`
- No `index.ts` re-exports observed

**Module Patterns:**
- Auth module (`auth.ts`): Logical grouping by feature (token, user, state, persistence)
- Categories module (`categories.ts`): Constants + styling maps together
- Skill creator types (`types.ts`): All interfaces in one file
- Handler modules: One function per file (`handlers/semantic.ts`, `handlers/graph.ts`)

## Astro-Specific Patterns

**Front matter:**
- Import statements in YAML front matter (between `---` markers)
- Const declarations for computed data
- Async operations allowed (e.g., `getCollection()`)

**Client directives:**
- `client:load` for interactive islands that must hydrate on page load (SearchBar, CategoryFilter, ThemeToggle)
- `client:only="react"` for client-only features (chat interface, forms)
- Islands architecture: mix `.astro` (static) and `.tsx` (interactive)

## Framework-Specific (React)

**Hooks:**
- `useState` for simple state (query, results, open, highlighted)
- `useEffect` for side effects (localStorage, event listeners, debouncing)
- `useRef` for DOM access (input focus, container refs)
- `useCallback` for memoized functions to optimize re-renders

**Props:**
- Interface-based prop typing: `interface Props { ... }`
- Destructuring in function signature: `function Component({ prop1, prop2 }: Props)`

**Conditional rendering:**
- Ternary operators for simple cases: `isDarkMode ? <sun /> : <moon />`
- Short-circuit with `&&`: `{query && <button>Clear</button>}`
- JSX inline or extracted to variables

## TypeScript

**Type Safety:**
- Strict mode enabled (`astro/tsconfigs/strict`)
- Explicit return type annotations on functions: `(): Promise<Response>`, `(): boolean`
- Generic types used: `<HTMLInputElement>`, `<HTMLDivElement>`, `Record<string, number>`

**Type narrowing:**
- `instanceof Error` checks in catch blocks
- Property existence checks: `'code' in err`
- Type assertions minimal but used: `as Record<string, string>`, `as CustomEvent<GitHubUser>`

---

*Convention analysis: 2026-03-22*
