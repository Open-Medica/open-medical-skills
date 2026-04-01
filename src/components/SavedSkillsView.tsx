import { useState, useEffect } from "react";
import { getCurrentUser, getSavedSkills, unsaveSkill } from "../lib/auth";

/**
 * SavedSkillsView — React island for the /saved-skills page.
 *
 * Rendered with `client:load`.
 * Checks auth, redirects to sign-in if not logged in,
 * fetches saved skills, and displays them.
 */
export default function SavedSkillsView() {
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/auth/signin";
        return;
      }

      const saved = await getSavedSkills();
      setSkills(saved);
      setLoading(false);
    }
    load();
  }, []);

  async function handleRemove(skillName: string) {
    setRemoving(skillName);
    const ok = await unsaveSkill(skillName);
    if (ok) {
      setSkills((prev) => prev.filter((s) => s !== skillName));
    }
    setRemoving(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-primary-light" />
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 py-16 text-center">
        <svg className="mb-4 h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        <h2 className="text-lg font-medium text-slate-300">No saved skills yet</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Browse the catalog and save skills you want to come back to.
        </p>
        <a
          href="/skills"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Browse Skills
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skillName) => (
        <div
          key={skillName}
          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-700"
        >
          <a
            href={`/skills/${skillName}`}
            className="min-w-0 flex-1 text-sm font-medium text-white hover:text-primary-light transition-colors truncate"
          >
            {formatSkillName(skillName)}
          </a>
          <button
            onClick={() => handleRemove(skillName)}
            disabled={removing === skillName}
            className="ml-3 flex-shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-950/30 hover:text-red-400 disabled:opacity-50"
            aria-label={`Remove ${skillName} from saved`}
            title="Remove from saved"
          >
            {removing === skillName ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-slate-400" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Convert a kebab-case skill name to a readable title.
 * e.g. "prior-authorization-review" -> "Prior Authorization Review"
 */
function formatSkillName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
