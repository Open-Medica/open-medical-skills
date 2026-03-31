import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bearerAuth } from 'hono/bearer-auth';
import { env } from 'hono/adapter';

type Env = {
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  API_KEY: string;
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

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

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
      'GET /api/stats - Statistics'
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

export default app;
