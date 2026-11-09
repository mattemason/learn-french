import pg from 'pg';

const url = process.env.DATABASE_URL;

export const dbConfigured = !!url;

export const pool = url
  ? new pg.Pool({
      connectionString: url,
      max: 10,
      // Railway's private network (postgres.railway.internal) needs no TLS.
      // Set PGSSL=true when connecting through a public proxy URL.
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
  : null;

export async function query<T extends pg.QueryResultRow = any>(text: string, params: unknown[] = []) {
  if (!pool) throw new Error('DATABASE_URL is not set');
  return pool.query<T>(text, params);
}

/** Idempotent schema setup, run on every boot. */
export async function migrate() {
  if (!pool) return;
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      name text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash text PRIMARY KEY,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS learner_state (
      user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      state jsonb NOT NULL,
      client_updated_at bigint NOT NULL,
      saved_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS email_codes (
      email text NOT NULL,
      purpose text NOT NULL,
      code_hash text NOT NULL,
      expires_at timestamptz NOT NULL,
      attempts integer NOT NULL DEFAULT 0,
      last_sent_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (email, purpose)
    );
    CREATE TABLE IF NOT EXISTS ai_usage (
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day date NOT NULL,
      count integer NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, day)
    );
  `);
  await query(`DELETE FROM sessions WHERE expires_at < now()`);
  await query(`DELETE FROM email_codes WHERE expires_at < now() - interval '1 day'`);
}
