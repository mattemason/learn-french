import { useState } from 'react';
import { Loader2, LogOut, Trash2 } from 'lucide-react';
import { useCloud, logIn, signUp, logOut, deleteAccount, resolveConflict } from '@/sync/cloud';
import { useStore } from '@/state/store';
import { Portal } from './ui';

export function AccountForm({ initialMode = 'signup', onDone }: { initialMode?: 'signup' | 'login'; onDone?: () => void }) {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const name = useStore((s) => s.profile.name);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mode === 'signup') await signUp(email, password, name);
      else await logIn(email, password);
      onDone?.();
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-2">
        {(['signup', 'login'] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setErr(null); }} className={`rounded-xl py-2 text-sm font-extrabold ${mode === m ? 'bg-surface shadow text-ink' : 'text-ink-soft'}`}>
            {m === 'signup' ? 'Create account' : 'Log in'}
          </button>
        ))}
      </div>
      <label><span className="label">Email</span><input className="input mt-1" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label><span className="label">Password</span>
        <input className="input mt-1" type="password" required minLength={mode === 'signup' ? 8 : 1} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === 'signup' && <span className="text-xs text-ink-soft">At least 8 characters.</span>}
      </label>
      {err && <p className="text-danger text-sm font-semibold">{err}</p>}
      <button className="btn-primary" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}{mode === 'signup' ? 'Create account' : 'Log in'}</button>
      <p className="text-xs text-ink-soft">{mode === 'signup' ? 'Your current progress on this device is saved to your new account.' : 'We\'ll bring your saved progress to this device.'}</p>
    </form>
  );
}

export function AccountPanel() {
  const { status, account } = useCloud();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (status === 'checking') return <div className="card p-4 text-sm text-ink-soft">Checking…</div>;
  if (status === 'unavailable') {
    return (
      <div className="card p-4 text-sm">
        <div className="font-bold">Saved on this device</div>
        <p className="text-ink-soft mt-1">Accounts aren't available right now, so progress stays in this browser. Use <b>Export</b> below to back it up.</p>
      </div>
    );
  }
  if (!account) {
    return (
      <div className="card p-4">
        <p className="text-sm text-ink-soft mb-3">Create a free account to keep your progress safe and continue on any device.</p>
        <AccountForm />
      </div>
    );
  }
  const label = { syncing: 'Syncing…', synced: 'All progress saved ✓', offline: 'Offline — will sync when you reconnect', error: 'Sync problem — will retry', 'signed-out': '', checking: '', unavailable: '' }[status];
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><div className="font-bold truncate">{account.email}</div><div className="text-sm text-ink-soft">{label}</div></div>
        <button className="btn-ghost btn-sm" onClick={() => logOut()}><LogOut size={16} /> Log out</button>
      </div>
      <p className="text-xs text-ink-soft mt-3">Logging out keeps a copy of your progress on this device.</p>
      {!confirmDelete ? (
        <button className="text-xs font-bold text-danger mt-3 flex items-center gap-1" onClick={() => setConfirmDelete(true)}><Trash2 size={13} /> Delete my account</button>
      ) : (
        <div className="mt-3 rounded-2xl bg-danger/10 p-3 text-sm">
          <p className="font-semibold">Permanently delete your account and cloud progress? This device keeps its local copy.</p>
          <div className="flex gap-2 mt-2">
            <button className="btn-danger btn-sm" onClick={() => deleteAccount()}>Delete</button>
            <button className="btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Shown when signing in on a device that has different progress from the cloud. */
export function ConflictDialog() {
  const conflict = useCloud((s) => s.conflict);
  if (!conflict) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[70] grid place-items-center p-6 bg-black/45">
        <div className="card p-6 max-w-sm w-full animate-pop">
          <h2 className="font-display text-2xl font-bold">Which progress should we keep?</h2>
          <p className="text-sm text-ink-soft mt-1">This device and your account have different progress.</p>
          <div className="grid gap-2 mt-4">
            <button className="tile" onClick={() => resolveConflict('server')}>
              <div className="font-extrabold">☁️ My account</div>
              <div className="text-sm text-ink-soft">{conflict.serverXp} XP · {conflict.serverLessons} lessons</div>
            </button>
            <button className="tile" onClick={() => resolveConflict('local')}>
              <div className="font-extrabold">📱 This device</div>
              <div className="text-sm text-ink-soft">{conflict.localXp} XP · {conflict.localLessons} lessons</div>
            </button>
          </div>
          <p className="text-xs text-ink-soft mt-3">The other copy will be replaced. Tip: export a backup in Settings first if unsure.</p>
        </div>
      </div>
    </Portal>
  );
}
