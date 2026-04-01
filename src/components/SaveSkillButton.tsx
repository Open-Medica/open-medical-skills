import { useState, useEffect } from "react";
import { getCurrentUser, getSavedSkills, saveSkill, unsaveSkill } from "../lib/auth";

interface Props {
  skillName: string;
}

/**
 * SaveSkillButton — React island for saving/unsaving a skill.
 *
 * Props: { skillName: string }
 * Rendered with `client:idle` on skill cards and detail pages.
 *
 * States:
 *  - Not mounted: hidden (no layout shift — button is additive)
 *  - Not logged in: "Sign in to save" link
 *  - Logged in, not saved: heart outline + "Save"
 *  - Logged in, saved: filled heart + "Saved" (click to unsave)
 */
export default function SaveSkillButton({ skillName }: Props) {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    async function checkState() {
      const user = await getCurrentUser();
      if (cancelled) return;

      if (!user) {
        setLoggedIn(false);
        return;
      }

      setLoggedIn(true);
      const skills = await getSavedSkills();
      if (cancelled) return;
      setSaved(skills.includes(skillName));
    }

    checkState();
    return () => { cancelled = true; };
  }, [skillName]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!loggedIn) {
      window.location.href = '/auth/signin';
      return;
    }

    setLoading(true);
    if (saved) {
      const ok = await unsaveSkill(skillName);
      if (ok) setSaved(false);
    } else {
      const ok = await saveSkill(skillName);
      if (ok) setSaved(true);
    }
    setLoading(false);
  }

  // Don't render anything during SSR/before mount
  if (!mounted) return null;

  // Not logged in
  if (!loggedIn) {
    return (
      <a
        href="/auth/signin"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 transition-colors hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-400 dark:hover:border-primary dark:hover:text-primary-light"
        onClick={(e) => e.stopPropagation()}
      >
        <HeartOutlineIcon className="h-3.5 w-3.5" />
        Save
      </a>
    );
  }

  // Logged in
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
        saved
          ? "border-pink-300 bg-pink-50 text-pink-600 hover:bg-pink-100 dark:border-pink-800 dark:bg-pink-950/30 dark:text-pink-400 dark:hover:bg-pink-950/50"
          : "border-slate-300 text-slate-500 hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-400 dark:hover:border-primary dark:hover:text-primary-light"
      } ${loading ? "opacity-50 cursor-wait" : ""}`}
      aria-label={saved ? `Unsave ${skillName}` : `Save ${skillName}`}
    >
      {saved ? (
        <HeartFilledIcon className="h-3.5 w-3.5" />
      ) : (
        <HeartOutlineIcon className="h-3.5 w-3.5" />
      )}
      {saved ? "Saved" : "Save"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function HeartOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function HeartFilledIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
