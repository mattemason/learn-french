import { useEffect, useState } from 'react';
import { Loader2, LogOut, Trash2 } from 'lucide-react';
import { useCloud, logIn, signUp, startSignup, startReset, resetPassword, logOut, deleteAccount, resolveConflict } from '@/sync/cloud';
import { useStore } from '@/state/store';
import { Portal } from './ui';

type Mode = 'signup' | 'login' | 'reset';

export function AccountForm({ initialMode = 'signup', onDone, defaultName }: { initialMode?: 'signup' | 'login'; onDone?: () => void; defaultName?: string }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<'details' | 'code'>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const profileName = useStore((s) => s.profile.name);
  const [name, setName] = useState(defaultName ?? profileName);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const domains = useCloud((s) => s.config.allowedDomains ?? []);
  const domainHint = domains.length ? domains.map((d) => '@' + d).join(' or ') : null;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const switchMode = (m: Mode) => { setMode(m); setStep('details'); setErr(null); setCode(''); };

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr(null);
    try { await fn(); } catch (ex) { setErr((ex as Error).message); } finally { setBusy(false); }
  };

  const sendCode = () => run(async () => {
    if (mode === 'signup') await startSignup(email);
    else await startReset(email);
    setStep('code');
    setCode('');
    setCooldown(60);
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') return run(async () => { await logIn(email, password); onDone?.(); });
    if (step === 'details') return sendCode();
    return run(async () => {
      if (mode === 'signup') await signUp(email, password, name, code);
      else await resetPassword(email, code, password);
      if (name.trim() && !useStore.getState().profile.name) useStore.getState().updateProfile({ name: name.trim() });
      onDone?.();
    });
  };

  const emailField = (
    <label><span className="label">Email</span>
      <input className="input mt-1" type="email" autoComplete="email" required value={email} disabled={step === 'code'}
        onChange={(e) => setEmail(e.target.value)} placeholder={domainHint ? `you${domainHint.split(' or ')[0]}` : 'you@example.com'} />
      {domainHint && mode !== 'login' && step === 'details' && <span className="text-xs text-ink-soft">Accounts are limited to {domainHint} addresses.</span>}
    </label>
  );
  const passwordField = (label: string) => (
    <label><span className="label">{label}</span>
      <input className="input mt-1" type="password" required minLength={mode === 'login' ? 1 : 8}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
      {mode !== 'login' && <span className="text-xs text-ink-soft">At least 8 characters.</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="grid gap-3">
      {mode !== 'reset' && (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-2">
          {(['signup', 'login'] as const).map((m) => (
            <button key={m} type="button" onClick={() => switchMode(m)} className={`rounded-xl py-2 text-sm font-extrabold ${mode === m ? 'bg-surface shadow text-ink' : 'text-ink-soft'}`}>
              {m === 'signup' ? 'Create account' : 'Log in'}
            </button>
          ))}
        </div>
      )}
      {mode === 'reset' && <div className="font-display text-xl font-bold">Reset your password</div>}

      {step === 'details' && (
        <>
          {mode === 'signup' && (
            <label><span className="label">Your name</span>
              <input className="input mt-1" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            </label>
          )}
          {emailField}
          {mode === 'signup' && passwordField('Choose a password')}
          {mode === 'login' && passwordField('Password')}
        </>
      )}

      {step === 'code' && (
        <>
          <div className="rounded-2xl bg-accent/10 p-3 text-sm">
            We've emailed a 6-digit code to <b>{email}</b>. It expires in 10 minutes.
            <button type="button" className="block mt-1 font-bold underline" onClick={() => { setStep('details'); setErr(null); }}>Use a different email</button>
          </div>
          <label><span className="label">Verification code</span>
            <input className="input mt-1 text-center text-2xl font-black tracking-[0.5em]" inputMode="numeric" autoComplete="one-time-code"
              pattern="[0-9]{6}" maxLength={6} required autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/D/g, '').slice(0, 6))} />
          </label>
          {mode === 'reset' && passwordField('New password')}
        </>
      )}

      {err && <p className="text-danger text-sm font-semibold">{err}</p>}
      <button className="btn-primary" disabled={busy || (step === 'code' && code.length !== 6)}>
        {busy && <Loader2 size={16} className="animate-spin" />}
        {mode === 'login' ? 'Log in' : step === 'details' ? 'Email me a code' : mode === 'signup' ? 'Verify & create account' : 'Set new password'}
      </button>

      {step === 'code' && (
        <button type="button" className="text-sm font-bold text-ink-soft disabled:opacity-50" disabled={busy || cooldown > 0} onClick={sendCode}>
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      )}
      {mode === 'login' && <button type="button" className="text-sm font-bold text-ink-soft" onClick={() => switchMode('reset')}>Forgot password?</button>}
      {mode === 'reset' && <button type="button" className="text-sm font-bold text-ink-soft" onClick={() => switchMode('login')}>Back to log in</button>}
      {mode === 'signup' && step === 'details' && <p className="text-xs text-ink-soft">Your current progress on this device is saved to your new account.</p>}
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
