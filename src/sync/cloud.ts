/**
 * Account + progress sync with the app's own server (Railway + Postgres).
 *
 * Local-first: the learner's state always lives on the device. When signed
 * in, changes are pushed (debounced) and the latest state is pulled on start.
 * If the app is served without a backend (e.g. a static host), everything
 * still works and accounts simply don't appear.
 */
import { create } from 'zustand';
import { useStore, type LearnerState } from '@/state/store';

export interface ServerConfig { accounts: boolean; ai: boolean; allowedDomains?: string[] }
export interface Account { id: string; email: string; name: string }
export type SyncStatus = 'checking' | 'unavailable' | 'signed-out' | 'syncing' | 'synced' | 'offline' | 'error';

export interface Conflict { localXp: number; localLessons: number; serverXp: number; serverLessons: number; server: LearnerState }

interface CloudState {
  config: ServerConfig;
  account: Account | null;
  status: SyncStatus;
  conflict: Conflict | null;
}

export const useCloud = create<CloudState>(() => ({
  config: { accounts: false, ai: false },
  account: null,
  status: 'checking',
  conflict: null,
}));

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    const err = new Error(data?.error ?? `Request failed (${res.status})`) as Error & { status?: number; data?: any };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

function snapshot(): LearnerState {
  const s = useStore.getState() as any;
  return Object.fromEntries(Object.entries(s).filter(([k, v]) => typeof v !== 'function' && k !== 'celebrations')) as unknown as LearnerState;
}

const lessonsOf = (s: Partial<LearnerState>) => Object.keys(s.lessons ?? {}).length;
const isTrivial = (s: Partial<LearnerState>) => (s.xp ?? 0) === 0 && lessonsOf(s) === 0 && Object.keys(s.srs ?? {}).length === 0;

function adopt(server: LearnerState) {
  useStore.getState().replaceState({ ...server, celebrations: [] });
}

async function push(force = false) {
  const state = snapshot();
  try {
    await api('/state', { method: 'PUT', body: JSON.stringify({ state, force }) });
    useCloud.setState({ status: 'synced' });
  } catch (e) {
    const err = e as Error & { status?: number; data?: any };
    if (err.status === 409 && err.data?.state) {
      // Another device saved newer progress — take it.
      adopt(err.data.state);
      useCloud.setState({ status: 'synced' });
    } else if (err.status === 401) {
      useCloud.setState({ account: null, status: 'signed-out' });
    } else {
      useCloud.setState({ status: navigator.onLine ? 'error' : 'offline' });
    }
  }
}

/**
 * Pull the server copy.
 *  - 'resume' (app start, already signed in): newest copy wins.
 *  - 'login' (just signed in on this device): if both copies hold real progress
 *    and differ, ask the learner which to keep instead of guessing.
 */
async function pull(mode: 'resume' | 'login') {
  useCloud.setState({ status: 'syncing' });
  const { state: server, updatedAt } = await api<{ state: LearnerState | null; updatedAt: number }>('/state');
  const local = snapshot();
  if (!server) return push();
  if (mode === 'login') {
    if (isTrivial(local)) return adopt(server), useCloud.setState({ status: 'synced' });
    if (isTrivial(server)) return push(true);
    if (local.updatedAt !== updatedAt) {
      useCloud.setState({
        status: 'synced',
        conflict: { localXp: local.xp, localLessons: lessonsOf(local), serverXp: server.xp, serverLessons: lessonsOf(server), server },
      });
      return;
    }
  }
  if (updatedAt > local.updatedAt) adopt(server);
  else if (updatedAt < local.updatedAt) return push();
  useCloud.setState({ status: 'synced' });
}

export async function resolveConflict(keep: 'server' | 'local') {
  const c = useCloud.getState().conflict;
  if (!c) return;
  useCloud.setState({ conflict: null });
  if (keep === 'server') adopt(c.server);
  else await push(true);
}

/** Registration step 1: emails a 6-digit code. */
export async function startSignup(email: string) {
  await api('/auth/signup/start', { method: 'POST', body: JSON.stringify({ email }) });
}

/** Registration step 2: verify the code and create the account. */
export async function signUp(email: string, password: string, name: string, code: string) {
  const { user } = await api<{ user: Account }>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name, code }) });
  useCloud.setState({ account: user });
  await pull('login');
  return user;
}

export async function startReset(email: string) {
  await api('/auth/reset/start', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword(email: string, code: string, password: string) {
  const { user } = await api<{ user: Account }>('/auth/reset', { method: 'POST', body: JSON.stringify({ email, code, password }) });
  useCloud.setState({ account: user });
  await pull('login');
  return user;
}

export async function logIn(email: string, password: string) {
  const { user } = await api<{ user: Account }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  useCloud.setState({ account: user });
  await pull('login');
  return user;
}

export async function logOut() {
  await api('/auth/logout', { method: 'POST' }).catch(() => {});
  useCloud.setState({ account: null, status: 'signed-out', conflict: null });
}

export async function deleteAccount() {
  await api('/auth/account', { method: 'DELETE' });
  useCloud.setState({ account: null, status: 'signed-out', conflict: null });
}

export async function askServer<T>(path: string, body: unknown): Promise<T> {
  return api<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

/** Starts sync for the lifetime of the app. Returns a cleanup function. */
export function startCloud(): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let cancelled = false;

  (async () => {
    try {
      const config = await api<ServerConfig>('/config');
      if (cancelled) return;
      useCloud.setState({ config });
      if (!config.accounts) return useCloud.setState({ status: 'unavailable' });
      try {
        const { user } = await api<{ user: Account }>('/auth/me');
        useCloud.setState({ account: user });
        await pull('resume');
      } catch {
        useCloud.setState({ status: 'signed-out' });
      }
    } catch {
      useCloud.setState({ status: 'unavailable' });
    }
  })();

  const unsub = useStore.subscribe((st, prev) => {
    if (st.updatedAt === prev.updatedAt) return;
    const { account, conflict } = useCloud.getState();
    if (!account || conflict) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      useCloud.setState({ status: 'syncing' });
      push();
    }, 2500);
  });

  const onOnline = () => useCloud.getState().account && push();
  window.addEventListener('online', onOnline);

  return () => {
    cancelled = true;
    unsub();
    clearTimeout(timer);
    window.removeEventListener('online', onOnline);
  };
}
