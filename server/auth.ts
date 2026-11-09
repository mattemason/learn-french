import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { NextFunction, Request, Response } from 'express';
import { query } from './db.js';

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const COOKIE = 'allez_session';
const SESSION_DAYS = 90;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltHex, hashHex] = stored.split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Optional allow-list of email domains, e.g. ALLOWED_DOMAINS="emason.com.au"
 * (ALLOWED_EMAIL_DOMAINS also accepted). Comma-separated; empty means anyone can register.
 */
export const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || process.env.ALLOWED_DOMAINS || '')
  .split(',')
  .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
  .filter(Boolean);

export function emailAllowed(email: string): boolean {
  if (!allowedDomains.length) return true;
  const domain = email.toLowerCase().split('@')[1] ?? '';
  return allowedDomains.includes(domain);
}

export const domainError = () =>
  `Accounts are limited to ${allowedDomains.map((d) => '@' + d).join(' or ')} email addresses.`;

const sha256 =(s: string) => createHash('sha256').update(s).digest('hex');

export async function createSession(res: Response, userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await query('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)', [sha256(token), userId, expires]);
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    // True behind Railway's HTTPS proxy (app has 'trust proxy' set); false on plain-http localhost.
    secure: res.req.secure,
    expires,
    path: '/',
  });
}

export async function destroySession(req: Request, res: Response) {
  const token = readCookie(req, COOKIE);
  if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [sha256(token)]);
  res.clearCookie(COOKIE, { path: '/' });
}

export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; name: string };
}

/** Attaches req.user when a valid session cookie is present. */
export async function loadUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = readCookie(req, COOKIE);
    if (token) {
      const { rows } = await query(
        `SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = $1 AND s.expires_at > now()`,
        [sha256(token)],
      );
      // Sessions for addresses outside the allow-list stop working if the list changes.
      if (rows[0] && emailAllowed(rows[0].email)) req.user = rows[0];
    }
    next();
  } catch (e) {
    next(e);
  }
}

export function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  next();
}

/**
 * Tiny in-memory limiter, keyed per route + IP + email address — so people
 * sharing one office IP don't lock each other out, and sign-up traffic never
 * eats into the login allowance.
 */
const attempts = new Map<string, { n: number; reset: number }>();
export function limitAttempts(route: string, max = 10, windowMs = 15 * 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const key = `${route}:${req.ip ?? 'unknown'}:${email}`;
    const now = Date.now();
    const a = attempts.get(key);
    if (!a || a.reset < now) attempts.set(key, { n: 1, reset: now + windowMs });
    else if (++a.n > max) return res.status(429).json({ error: 'Too many attempts — please wait a few minutes.' });
    next();
  };
}
