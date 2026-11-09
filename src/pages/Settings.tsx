import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Bot, CalendarPlus, Cloud, Download, Palette, Upload, User, AlertTriangle } from 'lucide-react';
import { useStore, type LearnerState } from '@/state/store';
import { useAiStatus } from '@/ai/tutor';
import { AccountPanel } from '@/components/Account';
import { downloadFile, downloadReminderIcs, notificationsSupported, requestNotificationPermission } from '@/lib/reminders';
import { Avatar, SectionTitle, Toggle } from '@/components/ui';

export function SettingsPage() {
  const s = useStore();
  const update = useStore((st) => st.updateProfile);
  const p = s.profile;
  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <SectionTitle><span className="flex items-center gap-2"><User size={20} /> Profile</span></SectionTitle>
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <Avatar avatarId={p.avatarId} frameId={p.frameId} size={64} />
          <label className="flex-1"><span className="label">Name</span><input className="input mt-1" value={p.name} onChange={(e) => update({ name: e.target.value })} /></label>
        </div>
        <Link to="/shop" className="btn-ghost btn-sm mt-3"><Palette size={16} /> Change theme & avatar</Link>
      </div>

      <SectionTitle>Learning</SectionTitle>
      <div className="card p-4 divide-y divide-line">
        <div className="pb-3">
          <div className="font-bold">Daily goal</div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[[10, 'Casual'], [30, 'Regular'], [50, 'Serious'], [80, 'Intense']].map(([xp, l]) => (
              <button key={xp} onClick={() => update({ dailyGoalXp: xp as number })} className={`tile text-center py-2 ${p.dailyGoalXp === xp ? 'tile-selected' : ''}`}>
                <div className="font-black">{xp} XP</div><div className="text-[11px] text-ink-soft">{l}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="py-3">
          <div className="font-bold">English translations</div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => update({ englishHelp: 'on-request' })} className={`tile py-2 text-sm ${p.englishHelp === 'on-request' ? 'tile-selected' : ''}`}>Only when I tap</button>
            <button onClick={() => update({ englishHelp: 'always' })} className={`tile py-2 text-sm ${p.englishHelp === 'always' ? 'tile-selected' : ''}`}>Always show</button>
          </div>
        </div>
        <Toggle label="Play audio automatically" checked={p.audioAutoplay} onChange={(v) => update({ audioAutoplay: v })} />
        <Toggle label="Reduce motion" description="Fewer animations and no confetti" checked={p.reducedMotion} onChange={(v) => update({ reducedMotion: v })} />
        <Toggle label="School mode (Queensland QCE)" description="Year 11–12 topics, exam-style tasks and assessment prep" checked={p.schoolMode} onChange={(v) => update({ schoolMode: v })} />
        {p.schoolMode && (
          <div className="py-3 flex gap-2">
            {[11, 12].map((y) => <button key={y} onClick={() => update({ schoolYear: y as 11 | 12 })} className={`tile py-2 flex-1 text-center ${p.schoolYear === y ? 'tile-selected' : ''}`}>Year {y}</button>)}
          </div>
        )}
      </div>

      <SectionTitle><span className="flex items-center gap-2"><Bell size={20} /> Reminders</span></SectionTitle>
      <Reminders />

      <SectionTitle><span className="flex items-center gap-2"><Bot size={20} /> AI features (optional)</span></SectionTitle>
      <div className="card p-4">
        <AiSettings />
      </div>

      <SectionTitle><span className="flex items-center gap-2"><Cloud size={20} /> Account & sync</span></SectionTitle>
      <AccountPanel />

      <SectionTitle>Your data</SectionTitle>
      <DataPanel />
    </div>
  );
}

function Reminders() {
  const r = useStore((s) => s.profile.reminders);
  const update = useStore((s) => s.updateProfile);
  const [perm, setPerm] = useState(notificationsSupported() ? Notification.permission : 'unsupported');
  return (
    <div className="card p-4">
      <Toggle label="Daily reminder" description="A gentle nudge if you haven't practised yet" checked={r.enabled} onChange={async (v) => {
        update({ reminders: { ...r, enabled: v } });
        if (v && notificationsSupported() && Notification.permission === 'default') setPerm(await requestNotificationPermission());
      }} />
      <label className="flex items-center justify-between py-2"><span className="font-bold">Time</span><input type="time" className="input w-36 py-2" value={r.time} onChange={(e) => update({ reminders: { ...r, time: e.target.value } })} /></label>
      {r.enabled && perm !== 'granted' && <p className="text-xs text-ink-soft">{perm === 'denied' ? 'Notifications are blocked in your browser settings.' : perm === 'unsupported' ? 'This browser does not support notifications here — use the calendar reminder instead.' : 'Allow notifications when prompted.'}</p>}
      <p className="text-xs text-ink-soft mt-2">In-app reminders show while the app is open or installed. For a reminder that always works (including on iPhone), add a repeating event to your calendar:</p>
      <button className="btn-ghost btn-sm mt-2" onClick={() => downloadReminderIcs(r.time)}><CalendarPlus size={16} /> Add to my calendar</button>
    </div>
  );
}

function AiSettings() {
  const status = useAiStatus();
  const p = useStore((s) => s.profile);
  const update = useStore((s) => s.updateProfile);
  if (status === 'none') return <p className="text-sm text-ink-soft">The AI tutor isn't switched on for this server. Everything else — lessons, checking, revision and rewards — works fully without it.</p>;
  if (status === 'login') return <p className="text-sm text-ink-soft">Create a free account below to use the optional AI tutor (explanations, writing feedback and conversation practice).</p>;
  return <Toggle label="Enable AI tutor" description="Explanations, writing correction and free conversation — only when you ask." checked={p.aiEnabled} onChange={(v) => update({ aiEnabled: v })} />;
}

function DataPanel() {
  const replace = useStore((s) => s.replaceState);
  const reset = useStore((s) => s.resetAll);
  const file = useRef<HTMLInputElement>(null);
  const exportData = () => {
    const st = useStore.getState() as any;
    const data = Object.fromEntries(Object.entries(st).filter(([k, v]) => typeof v !== 'function' && k !== 'celebrations'));
    downloadFile(`allez-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
  };
  const importData = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as LearnerState;
      if (!data.profile || typeof data.xp !== 'number') throw new Error('Not an Allez backup file');
      if (confirm('Replace your current progress with this backup?')) replace({ ...data, celebrations: [], updatedAt: Date.now() });
    } catch (e) {
      alert((e as Error).message);
    }
  };
  return (
    <div className="card p-4 grid gap-2">
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-ghost btn-sm" onClick={exportData}><Download size={16} /> Export</button>
        <button className="btn-ghost btn-sm" onClick={() => file.current?.click()}><Upload size={16} /> Import</button>
        <input ref={file} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
      </div>
      <button className="btn-ghost btn-sm text-danger" onClick={() => confirm('Erase ALL progress on this device? This cannot be undone.') && (reset(), (window.location.href = '/onboarding'))}>
        <AlertTriangle size={16} /> Reset all progress
      </button>
    </div>
  );
}
