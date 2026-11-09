/**
 * One-time 6-digit email codes for registration and password reset.
 * Only a hash is stored; codes expire after 10 minutes, allow 5 attempts,
 * and can be re-sent at most once a minute per address.
 */
import { createHash, randomInt } from 'node:crypto';
import { query } from './db.js';
import { codeEmail, sendMail } from './email.js';

export type Purpose = 'signup' | 'reset';

const TTL_MIN = 10;
const MAX_ATTEMPTS = 5;
const RESEND_SECONDS = 60;

const hashCode = (email: string, purpose: Purpose, code: string) => createHash('sha256').update(`${purpose}:${email}:${code}`).digest('hex');

export class CodeError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function issueCode(email: string, purpose: Purpose): Promise<void> {
  const { rows } = await query<{ wait: number }>(
    `SELECT EXTRACT(EPOCH FROM (last_sent_at + make_interval(secs => $3) - now()))::int AS wait
     FROM email_codes WHERE email = $1 AND purpose = $2`,
    [email, purpose, RESEND_SECONDS],
  );
  if (rows[0] && rows[0].wait > 0) throw new CodeError(`Please wait ${rows[0].wait}s before requesting another code.`, 429);

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await query(
    `INSERT INTO email_codes (email, purpose, code_hash, expires_at, attempts, last_sent_at)
     VALUES ($1, $2, $3, now() + make_interval(mins => $4), 0, now())
     ON CONFLICT (email, purpose) DO UPDATE
       SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0, last_sent_at = now()`,
    [email, purpose, hashCode(email, purpose, code), TTL_MIN],
  );
  try {
    await sendMail({ to: email, ...codeEmail(code, purpose) });
  } catch (e) {
    console.error('Failed to send code email', e);
    throw new CodeError("We couldn't send the email just now — please try again shortly.", 502);
  }
}

/** Throws CodeError when the code is wrong/expired; consumes it on success. */
export async function consumeCode(email: string, purpose: Purpose, code: string): Promise<void> {
  const clean = String(code ?? '').replace(/\D/g, '');
  const { rows } = await query<{ code_hash: string; attempts: number; expired: boolean }>(
    `SELECT code_hash, attempts, expires_at < now() AS expired FROM email_codes WHERE email = $1 AND purpose = $2`,
    [email, purpose],
  );
  const row = rows[0];
  if (!row) throw new CodeError('Please request a code first.');
  if (row.expired) throw new CodeError('That code has expired — request a new one.');
  if (row.attempts >= MAX_ATTEMPTS) throw new CodeError('Too many incorrect attempts — request a new code.', 429);
  if (clean.length !== 6 || hashCode(email, purpose, clean) !== row.code_hash) {
    await query('UPDATE email_codes SET attempts = attempts + 1 WHERE email = $1 AND purpose = $2', [email, purpose]);
    const left = MAX_ATTEMPTS - row.attempts - 1;
    throw new CodeError(left > 0 ? `That code isn't right — ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts — request a new code.');
  }
  await query('DELETE FROM email_codes WHERE email = $1 AND purpose = $2', [email, purpose]);
}
