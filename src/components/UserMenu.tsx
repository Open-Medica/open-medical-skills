import { useState, useEffect, useRef } from "react";
import { getCurrentUser, logout, type User } from "../lib/auth";

/**
 * UserMenu — React island for authenticated user dropdown.
 *
 * Rendered with `client:load` in the Astro Header.
 *
 * States:
 *  - Not mounted: animated placeholder to prevent layout shift
 *  - Loading: same placeholder while checking auth
 *  - Logged out: "Sign In" link
 *  - Logged in: avatar + dropdown with Saved Skills, Settings, Sign Out
 */
export default function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hydrate: fetch current user from API
  useEffect(() => {
    setMounted(true);
    getCurrentUser()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    if (dropdownOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [dropdownOpen]);

  function handleSignOut() {
    setDropdownOpen(false);
    logout();
  }

  // SSR placeholder — prevents layout shift
  if (!mounted || loading) {
    return (
      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
    );
  }

  // ------ Logged out ------
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <a
          href="/auth/signin"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-cyan-400 hover:to-teal-400 hover:shadow-md hover:shadow-cyan-500/20 active:scale-95"
        >
          Get Started
        </a>
        <a
          href="/auth/signin"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:border-slate-500"
        >
          <UserIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Sign In</span>
        </a>
      </div>
    );
  }

  // ------ Logged in ------
  const initials = getInitials(user.name || user.email || "U");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt="Avatar"
            className="h-7 w-7 rounded-full ring-2 ring-primary/20"
            width={28}
            height={28}
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-xs font-bold text-white ring-2 ring-primary/20">
            {initials}
          </span>
        )}
        <span className="hidden text-slate-700 dark:text-slate-300 sm:inline">
          {user.name || user.email || "Account"}
        </span>
        <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {/* User info header */}
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {user.name || "Account"}
            </p>
            {user.email && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <a
              href="/saved-skills"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setDropdownOpen(false)}
            >
              <HeartIcon className="h-4 w-4 text-slate-400" />
              Saved Skills
            </a>
          </div>

          {/* Sign out */}
          <div className="border-t border-slate-200 py-1 dark:border-slate-700">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <SignOutIcon className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
