/**
 * Allez ! server — one Railway service:
 *   - serves the built single-page app from dist/
 *   - accounts (email + password, httpOnly session cookie)
 *   - learner progress sync (Postgres, one JSON document per learner)
 *   - optional AI tutor proxy
 */
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbConfigured, migrate, query } from './db.js';
import { createSession, destroySession, hashPassword, limitAttempts, loadUser, requireUser, verifyPassword, type AuthedRequest } from './auth.js';
import { aiConfigured, tutorHandler } from './tutor.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(here, '..', 'dist');

app.set('trust proxy', 1); // Railway terminates TLS at its proxy
app.disable('x-powered-by');
app.use(express.json({ limit: '3mb' }));

const api = express.Router();
const wrap = (fn: (req: AuthedRequest, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);

api.get('/health', (_req, res) => res.json({ ok: true }));
api.get('/config', (_req, res) => res.json({ accounts: dbConfigured, ai: aiConfigured && dbConfigured }));

if (dbConfigured) {
  api.use(loadUser);

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  api.post('/auth/signup', limitAttempts(), wrap(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const name = String(req.body?.name ?? '').trim().slice(0, 40);
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Use at least 8 characters for your password.' });
    const exists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rowCount) return res.status(409).json({ error: 'An account with this email already exists — try logging in.' });
    const { rows } = await query('INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email, await hashPassword(password), name]);
    await createSession(res, rows[0].id);
    res.json({ user: rows[0] });
  }));

  api.post('/auth/login', limitAttempts(), wrap(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const { rows } = await query('SELECT id, email, name, password_hash FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    await createSession(res, user.id);
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  }));

  api.post('/auth/logout', wrap(async (req, res) => {
    await destroySession(req, res);
    res.json({ ok: true });
  }));

  api.get('/auth/me', (req: AuthedRequest, res) => (req.user ? res.json({ user: req.user }) : res.status(401).json({ user: null })));

  api.delete('/auth/account', requireUser, wrap(async (req, res) => {
    await query('DELETE FROM users WHERE id = $1', [req.user!.id]);
    res.clearCookie('allez_session', { path: '/' });
    res.json({ ok: true });
  }));

  api.get('/state', requireUser, wrap(async (req, res) => {
    const { rows } = await query('SELECT state, client_updated_at FROM learner_state WHERE user_id = $1', [req.user!.id]);
    res.json(rows[0] ? { state: rows[0].state, updatedAt: Number(rows[0].client_updated_at) } : { state: null, updatedAt: 0 });
  }));

  /** Last-write-wins by the client's updatedAt; a stale write gets 409 + the newer state. */
  api.put('/state', requireUser, wrap(async (req, res) => {
    const state = req.body?.state;
    const updatedAt = Number(state?.updatedAt);
    if (!state || typeof state !== 'object' || !Number.isFinite(updatedAt)) return res.status(400).json({ error: 'Invalid state.' });
    const force = req.body?.force === true;
    const { rows } = await query(
      `INSERT INTO learner_state (user_id, state, client_updated_at, saved_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (user_id) DO UPDATE SET state = EXCLUDED.state, client_updated_at = EXCLUDED.client_updated_at, saved_at = now()
       WHERE $4 OR learner_state.client_updated_at <= EXCLUDED.client_updated_at
       RETURNING client_updated_at`,
      [req.user!.id, state, updatedAt, force],
    );
    if (rows.length) return res.json({ ok: true, updatedAt });
    const current = await query('SELECT state, client_updated_at FROM learner_state WHERE user_id = $1', [req.user!.id]);
    res.status(409).json({ state: current.rows[0].state, updatedAt: Number(current.rows[0].client_updated_at) });
  }));

  api.post('/tutor', requireUser, wrap(tutorHandler));
}

api.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use('/api', api);

// Static app: long-cache hashed assets, never cache index.html.
app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
app.use(express.static(dist, { index: false, maxAge: '1h' }));
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(dist, 'index.html'));
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

migrate()
  .then(() => {
    app.listen(PORT, () => console.log(`Allez ! listening on :${PORT} · db=${dbConfigured} · ai=${aiConfigured}`));
  })
  .catch((e) => {
    console.error('Database migration failed', e);
    process.exit(1);
  });
