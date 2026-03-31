import { useState, useEffect, useRef, useCallback } from "react";

interface SkillEntry {
  id: string;
  display_name: string;
  description: string;
  category: string;
  tags: string[];
  type: string;
}

interface Props {
  skills: SkillEntry[];
}

export default function SearchBar({ skills }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SkillEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(
    (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setOpen(false);
        window.dispatchEvent(new CustomEvent("search-change", { detail: { query: "" } }));
        return;
      }

      const lower = q.toLowerCase();
      const matched = skills.filter(
        (s) =>
          s.display_name.toLowerCase().includes(lower) ||
          s.description.toLowerCase().includes(lower) ||
          s.tags.some((t) => t.toLowerCase().includes(lower)) ||
          s.category.toLowerCase().includes(lower)
      );

      setResults(matched.slice(0, 8));
      setOpen(matched.length > 0);
      setHighlighted(-1);

      window.dispatchEvent(
        new CustomEvent("search-change", { detail: { query: q, matchedIds: matched.map((s) => s.id) } })
      );
    },
    [skills]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0 && results[highlighted]) {
      const entry = results[highlighted];
      const base = entry.type === "plugin" ? "/plugins" : "/skills";
      window.location.href = `${base}/${entry.id}`;
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>

        <input
          ref={inputRef}
          type="search"
          placeholder="Search skills..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-light dark:focus:ring-primary-light"
          aria-label="Search skills"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="search-results"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results count */}
      {query.trim() && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {results.length === 0 ? "No results found" : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {results.map((entry, i) => {
            const base = entry.type === "plugin" ? "/plugins" : "/skills";
            return (
              <li key={entry.id} role="option" aria-selected={i === highlighted}>
                <a
                  href={`${base}/${entry.id}`}
                  className={`block px-4 py-2.5 text-sm transition-colors ${
                    i === highlighted
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-light"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="font-medium">{entry.display_name}</span>
                  <span className="ml-2 text-xs text-slate-400">{entry.category}</span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
