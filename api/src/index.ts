import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';

type Env = {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  API_KEY: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  RESEND_API_KEY: string;
  SITE_URL: string;
};

type Skill = {
  name: string;
  display_name: string;
  description: string;
  author: string;
  repository: string;
  category: string;
  tags: string[];
  version: string;
  license: string;
  evidence_level: string;
  safety_classification: string;
  specialty: string[];
  reviewer: string;
  date_added: string;
  verified: boolean;
};

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createSession(db: D1Database, userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  await db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').bind(userId, token, expiresAt).run();
  return token;
}

async function getUserFromSession(db: D1Database, token: string) {
  const result = await db.prepare(`
    SELECT u.* FROM users u
    JOIN sessions s ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > datetime('now')
  `).bind(token).first();
  return result;
}

function getSessionToken(c: any): string | null {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return getCookie(c, 'session') || null;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors({
  origin: (origin, c) => origin || '*',
  credentials: true,
}));

app.use('/api/*', async (c, next) => {
  const env = c.env;
  const token = env.API_KEY || '';
  if (!token) {
    await next();
    return;
  }
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const providedToken = authHeader.slice(7);
  if (providedToken !== token) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  await next();
});

app.get('/', (c) => {
  return c.json({
    name: 'Open Medical Skills API',
    version: '1.0.0',
    description: 'API for medical AI skills registry',
    endpoints: [
      'GET /api/health - Health check',
      'GET /api/skills - List all skills',
      'GET /api/skills/:name - Get skill details',
      'GET /api/skills/search?q=:query - Search skills',
      'GET /api/skills/search/vector?q=:query - Semantic search',
      'GET /api/categories - List categories',
      'GET /api/stats - Statistics',
      'GET /auth/github - GitHub OAuth login',
      'GET /auth/google - Google OAuth login',
      'POST /auth/magic-link - Send magic link email',
      'GET /auth/verify - Verify magic link',
      'GET /auth/me - Current user',
      'POST /auth/logout - Logout',
      'GET /auth/saved-skills - Get saved skills',
      'POST /auth/saved-skills - Save a skill',
      'DELETE /auth/saved-skills/:name - Unsave a skill'
    ],
    documentation: 'https://github.com/Open-Medica/open-medical-skills'
  });
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/skills', async (c) => {
  const db = c.env.DB;
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);
  const category = c.req.query('category');

  let query = 'SELECT * FROM skills ORDER BY display_name LIMIT ? OFFSET ?';
  let bindings: (string | number)[] = [limit, offset];

  if (category) {
    query = 'SELECT * FROM skills WHERE category = ? ORDER BY display_name LIMIT ? OFFSET ?';
    bindings = [category, limit, offset];
  }

  const { results } = await db.prepare(query).bind(...bindings).all();
  return c.json({ skills: results, count: results.length });
});

app.get('/api/skills/:name', async (c) => {
  const db = c.env.DB;
  const name = c.req.param('name');

  const { results } = await db
    .prepare('SELECT * FROM skills WHERE name = ? OR display_name = ?')
    .bind(name, name)
    .all();

  if (results.length === 0) {
    return c.json({ error: 'Skill not found' }, 404);
  }

  return c.json({ skill: results[0] });
});

app.get('/api/skills/search', async (c) => {
  const db = c.env.DB;
  const q = c.req.query('q') || '';
  const category = c.req.query('category');
  const limit = parseInt(c.req.query('limit') || '20', 10);

  if (!q) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  const searchTerm = `%${q}%`;
  let query = `
    SELECT * FROM skills
    WHERE name LIKE ? OR display_name LIKE ? OR description LIKE ? OR tags LIKE ?
  `;
  const bindings: (string | number)[] = [searchTerm, searchTerm, searchTerm, searchTerm];

  if (category) {
    query += ' AND category = ?';
    bindings.push(category);
  }

  query += ' ORDER BY display_name LIMIT ?';
  bindings.push(limit);

  const { results } = await db.prepare(query).bind(...bindings).all();
  return c.json({ query: q, skills: results, count: results.length });
});

app.get('/api/skills/search/vector', async (c) => {
  const vectorize = c.env.VECTORIZE;
  const q = c.req.query('q') || '';
  const limit = parseInt(c.req.query('limit') || '5', 10);

  if (!q) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  const { results } = await vectorize.query(q, { topK: limit });

  return c.json({
    query: q,
    matches: results.map((r) => ({
      score: r.score,
      id: r.id,
      metadata: r.metadata
    }))
  });
});

app.get('/api/categories', async (c) => {
  const db = c.env.DB;

  const { results } = await db
    .prepare('SELECT category, COUNT(*) as count FROM skills GROUP BY category ORDER BY count DESC')
    .all();

  return c.json({ categories: results });
});

app.get('/api/stats', async (c) => {
  const db = c.env.DB;

  const [{ count: total }] = await db
    .prepare('SELECT COUNT(*) as count FROM skills')
    .all() as { count: number }[];

  const [{ count: verified }] = await db
    .prepare('SELECT COUNT(*) as count FROM skills WHERE verified = 1')
    .all() as { count: number }[];

  const categories = await db
    .prepare('SELECT category, COUNT(*) as count FROM skills GROUP BY category')
    .all();

  return c.json({
    total_skills: total,
    verified_skills: verified,
    categories: categories.results.length,
    by_category: categories.results
  });
});

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

// GitHub OAuth — redirect to GitHub
app.get('/auth/github', (c) => {
  const redirectUri = `${c.env.SITE_URL}/auth/callback`;
  const stateValue = `github:${generateToken()}`;
  setCookie(c, 'oauth_state', stateValue, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 5 * 60, // 5 minutes
  });
  const url = `https://github.com/login/oauth/authorize?client_id=${c.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email&state=${encodeURIComponent(stateValue)}`;
  return c.redirect(url);
});

// Google OAuth — redirect to Google
app.get('/auth/google', (c) => {
  const redirectUri = `${c.env.SITE_URL}/auth/callback`;
  const stateValue = `google:${generateToken()}`;
  setCookie(c, 'oauth_state', stateValue, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 5 * 60, // 5 minutes
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${c.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(stateValue)}`;
  return c.redirect(url);
});

// OAuth callback — handles both GitHub and Google
app.get('/auth/callback', async (c) => {
  const db = c.env.DB;
  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code || !state) {
    return c.json({ error: 'Missing code or state parameter' }, 400);
  }

  // Verify CSRF: state from query must match the cookie we set before redirect
  const storedState = getCookie(c, 'oauth_state');
  if (!storedState || storedState !== state) {
    return c.json({ error: 'Invalid OAuth state — possible CSRF attack' }, 403);
  }

  // Clear the one-time state cookie
  deleteCookie(c, 'oauth_state', { path: '/' });

  // Extract provider from state (format: "provider:random")
  const provider = state.split(':')[0];

  try {
    let email: string | null = null;
    let name: string | null = null;
    let avatarUrl: string | null = null;
    let githubId: string | null = null;
    let googleId: string | null = null;

    if (provider === 'github') {
      // Exchange code for access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: c.env.GITHUB_CLIENT_ID,
          client_secret: c.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
      if (!tokenData.access_token) {
        return c.json({ error: 'Failed to exchange GitHub code' }, 400);
      }

      // Fetch user profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'OpenMedica' },
      });
      const userData = await userRes.json() as { id: number; login: string; name?: string; avatar_url?: string; email?: string };

      githubId = String(userData.id);
      name = userData.name || userData.login;
      avatarUrl = userData.avatar_url || null;
      email = userData.email || null;

      // If no public email, fetch from emails endpoint
      if (!email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'OpenMedica' },
        });
        const emails = await emailsRes.json() as { email: string; primary: boolean; verified: boolean }[];
        const primary = emails.find(e => e.primary && e.verified);
        email = primary?.email || emails[0]?.email || null;
      }
    } else if (provider === 'google') {
      // Exchange code for tokens
      const redirectUri = `${c.env.SITE_URL}/auth/callback`;
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: c.env.GOOGLE_CLIENT_ID,
          client_secret: c.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
      if (!tokenData.access_token) {
        return c.json({ error: 'Failed to exchange Google code' }, 400);
      }

      // Fetch user profile
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json() as { id: string; email?: string; name?: string; picture?: string };

      googleId = userData.id;
      email = userData.email || null;
      name = userData.name || null;
      avatarUrl = userData.picture || null;
    } else {
      return c.json({ error: 'Unsupported OAuth provider' }, 400);
    }

    // Upsert user: find by provider ID, then by email, or create
    let user: Record<string, unknown> | null = null;

    if (githubId) {
      user = await db.prepare('SELECT * FROM users WHERE github_id = ?').bind(githubId).first();
    }
    if (!user && googleId) {
      user = await db.prepare('SELECT * FROM users WHERE google_id = ?').bind(googleId).first();
    }
    if (!user && email) {
      user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    }

    if (user) {
      // Update existing user with new provider info
      const updates: string[] = [];
      const values: (string | null)[] = [];

      if (githubId && !user.github_id) { updates.push('github_id = ?'); values.push(githubId); }
      if (googleId && !user.google_id) { updates.push('google_id = ?'); values.push(googleId); }
      if (name && !user.name) { updates.push('name = ?'); values.push(name); }
      if (avatarUrl && !user.avatar_url) { updates.push('avatar_url = ?'); values.push(avatarUrl); }
      if (email && !user.email) { updates.push('email = ?'); values.push(email); }

      if (updates.length > 0) {
        updates.push("updated_at = datetime('now')");
        const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        values.push(user.id as string);
        await db.prepare(updateQuery).bind(...values).run();
      }
    } else {
      // Create new user
      const id = generateToken().slice(0, 32);
      await db.prepare(
        'INSERT INTO users (id, email, name, avatar_url, github_id, google_id) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id, email, name, avatarUrl, githubId, googleId).run();
      user = { id };
    }

    // Create session
    const sessionToken = await createSession(db, user.id as string);

    // Set cookie and redirect to home
    setCookie(c, 'session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return c.redirect(c.env.SITE_URL);
  } catch (err) {
    console.error('OAuth callback error:', err);
    return c.json({ error: 'Authentication failed' }, 500);
  }
});

// Magic link — send email
app.post('/auth/magic-link', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{ email?: string }>();

  if (!body.email || !body.email.includes('@')) {
    return c.json({ error: 'Valid email is required' }, 400);
  }

  const email = body.email.toLowerCase().trim();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  // Find or create user
  let user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  if (!user) {
    const id = generateToken().slice(0, 32);
    await db.prepare('INSERT INTO users (id, email) VALUES (?, ?)').bind(id, email).run();
    user = { id };
  }

  // Store magic link token as a short-lived session
  await db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').bind(user.id as string, token, expiresAt).run();

  // Send email via Resend
  const verifyUrl = `${c.env.SITE_URL}/auth/verify?token=${token}`;

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'OpenMedica <noreply@openmedica.us>',
      to: [email],
      subject: 'Sign in to OpenMedica',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Sign in to OpenMedica</h2>
          <p>Click the button below to sign in. This link expires in 15 minutes.</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Sign In</a>
          <p style="color: #666; font-size: 14px; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!emailRes.ok) {
    console.error('Resend error:', await emailRes.text());
    return c.json({ error: 'Failed to send email' }, 500);
  }

  return c.json({ success: true, message: 'Magic link sent' });
});

// Verify magic link token
app.get('/auth/verify', async (c) => {
  const db = c.env.DB;
  const token = c.req.query('token');

  if (!token) {
    return c.json({ error: 'Missing token' }, 400);
  }

  // Look up the magic link session
  const magicSession = await db.prepare(
    "SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')"
  ).bind(token).first();

  if (!magicSession) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  const userId = magicSession.user_id as string;

  // Delete the magic link token (one-time use)
  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();

  // Create a real 30-day session
  const sessionToken = await createSession(db, userId);

  setCookie(c, 'session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  return c.redirect(c.env.SITE_URL);
});

// Get current user
app.get('/auth/me', async (c) => {
  const db = c.env.DB;
  const token = getSessionToken(c);

  if (!token) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const user = await getUserFromSession(db, token);
  if (!user) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  return c.json({ user });
});

// Logout
app.post('/auth/logout', async (c) => {
  const db = c.env.DB;
  const token = getSessionToken(c);

  if (token) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }

  deleteCookie(c, 'session', { path: '/' });
  return c.json({ success: true });
});

// Get saved skills
app.get('/auth/saved-skills', async (c) => {
  const db = c.env.DB;
  const token = getSessionToken(c);

  if (!token) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const user = await getUserFromSession(db, token);
  if (!user) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  const { results } = await db.prepare(
    'SELECT skill_name, saved_at FROM saved_skills WHERE user_id = ? ORDER BY saved_at DESC'
  ).bind((user as Record<string, unknown>).id as string).all();

  return c.json({ saved_skills: results });
});

// Save a skill
app.post('/auth/saved-skills', async (c) => {
  const db = c.env.DB;
  const token = getSessionToken(c);

  if (!token) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const user = await getUserFromSession(db, token);
  if (!user) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  const body = await c.req.json<{ skill_name?: string }>();
  if (!body.skill_name) {
    return c.json({ error: 'skill_name is required' }, 400);
  }

  await db.prepare(
    'INSERT OR IGNORE INTO saved_skills (user_id, skill_name) VALUES (?, ?)'
  ).bind((user as Record<string, unknown>).id as string, body.skill_name).run();

  return c.json({ success: true });
});

// Unsave a skill
app.delete('/auth/saved-skills/:name', async (c) => {
  const db = c.env.DB;
  const token = getSessionToken(c);

  if (!token) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  const user = await getUserFromSession(db, token);
  if (!user) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  const skillName = c.req.param('name');
  await db.prepare(
    'DELETE FROM saved_skills WHERE user_id = ? AND skill_name = ?'
  ).bind((user as Record<string, unknown>).id as string, skillName).run();

  return c.json({ success: true });
});

export default app;
