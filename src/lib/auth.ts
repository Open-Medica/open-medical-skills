/**
 * Authentication client library for OpenMedica.
 *
 * Flow (new — cookie-based, multi-provider):
 * 1. User signs in via GitHub, Google, or email magic link
 * 2. API handles OAuth exchange or magic link verification
 * 3. API sets an httpOnly session cookie
 * 4. Client calls /auth/me to check session state
 * 5. All subsequent requests include credentials (cookies)
 *
 * Supports: GitHub OAuth, Google OAuth, email magic link.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_URL = import.meta.env.PUBLIC_API_URL || '/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  github_id: string | null;
  google_id: string | null;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * Fetch the currently authenticated user from the API session cookie.
 * Returns null if not logged in or on any error.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Saved skills
// ---------------------------------------------------------------------------

/**
 * Fetch the list of skill names saved by the current user.
 */
export async function getSavedSkills(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/auth/saved-skills`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.skills.map((s: { skill_name: string }) => s.skill_name);
  } catch {
    return [];
  }
}

/**
 * Save a skill to the current user's saved list.
 */
export async function saveSkill(skillName: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/saved-skills`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skill_name: skillName }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Remove a skill from the current user's saved list.
 */
export async function unsaveSkill(skillName: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/saved-skills/${encodeURIComponent(skillName)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Magic link
// ---------------------------------------------------------------------------

/**
 * Request a magic link email for passwordless sign-in.
 */
export async function sendMagicLink(email: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

/**
 * Sign out by calling the API (clears session cookie) then redirect home.
 */
export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  window.location.href = '/';
}

// ---------------------------------------------------------------------------
// OAuth URLs
// ---------------------------------------------------------------------------

/**
 * Get the URL to start GitHub OAuth flow (server-side redirect).
 */
export function getGitHubAuthUrl(): string {
  return `${API_URL}/auth/github`;
}

/**
 * Get the URL to start Google OAuth flow (server-side redirect).
 */
export function getGoogleAuthUrl(): string {
  return `${API_URL}/auth/google`;
}

