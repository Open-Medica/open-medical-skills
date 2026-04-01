import { useState, useEffect } from "react";
import { getCurrentUser, type User } from "../lib/auth";

/**
 * SubmitAuthBanner — shown at the top of the submit page.
 *
 * - If signed in: shows "Signed in as [name]" with avatar
 * - If signed out: shows a prompt to sign in for a smoother experience
 *
 * Also dispatches a custom event with the user so the
 * SubmissionForm can pre-fill the author field.
 */
export default function SubmitAuthBanner() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    getCurrentUser().then((u) => {
      if (u) {
        setUser(u);
        window.dispatchEvent(
          new CustomEvent("oms:auth-user", { detail: u })
        );
      }
    });
  }, []);

  if (!mounted) return null;

  // Signed in
  if (user) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-900/20">
        {user.avatar_url && (
          <img
            src={user.avatar_url}
            alt="Avatar"
            className="h-8 w-8 rounded-full ring-2 ring-primary/20"
            width={32}
            height={32}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Signed in as{" "}
            <span className="font-semibold text-primary dark:text-primary-light">
              {user.name || user.email || "User"}
            </span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your name will be pre-filled in the submission form.
          </p>
        </div>
        <svg
          className="h-5 w-5 shrink-0 text-primary dark:text-primary-light"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  // Signed out
  return (
    <div className="mt-6 flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          Sign in for a smoother submission experience
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your GitHub username will be pre-filled and linked to your submission.
        </p>
      </div>
      <a
        href="/auth/signin"
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Sign in
      </a>
    </div>
  );
}
