import { useState, useEffect } from "react";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "../lib/categories";

interface Props {
  counts: Record<string, number>;
  total: number;
}

export default function CategoryFilter({ counts, total }: Props) {
  const [active, setActive] = useState<string>("all");

  // Sync with URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat && CATEGORIES.includes(cat as Category)) {
      setActive(cat);
    }
  }, []);

  function select(category: string) {
    setActive(category);

    const url = new URL(window.location.href);
    if (category === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    window.history.replaceState({}, "", url.toString());

    // Dispatch custom event for other components to listen
    window.dispatchEvent(
      new CustomEvent("category-change", { detail: { category } })
    );
  }

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => select("all")}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
          active === "all"
            ? "border-primary bg-primary text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600"
        }`}
      >
        All
        <span className="ml-1.5 text-xs opacity-75">{total}</span>
      </button>

      {CATEGORIES.map((cat) => {
        const count = counts[cat] ?? 0;
        if (count === 0) return null;
        const label = CATEGORY_LABELS[cat];
        const isActive = active === cat;

        return (
          <button
            key={cat}
            onClick={() => select(cat)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600"
            }`}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-75">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
