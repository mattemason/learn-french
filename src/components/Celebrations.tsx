import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '@/state/store';
import { fireConfetti } from './Results';

/** Shows queued celebrations (achievements, level-ups, streak events) one at a time, outside of sessions. */
export function Celebrations() {
  const items = useStore((s) => s.celebrations);
  const dismiss = useStore((s) => s.dismissCelebration);
  const loc = useLocation();
  const inSession = /^\/(lesson|checkpoint|review|practice\/session|placement|onboarding)/.test(loc.pathname);
  const c = items[0];

  useEffect(() => {
    if (c && !inSession && (c.kind === 'achievement' || c.kind === 'level-up' || c.kind === 'cefr')) fireConfetti(c.kind === 'cefr');
  }, [c?.id, inSession]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c || inSession) return null;
  const kicker = { achievement: 'Achievement unlocked', 'level-up': 'Level up', streak: 'Streak', 'streak-saved': 'Streak protector', cefr: 'Proficiency', info: 'Bon retour' }[c.kind];
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-6 bg-black/45" onClick={() => dismiss(c.id)}>
      <div className="card p-7 max-w-sm w-full text-center animate-pop relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 pattern-dots opacity-70" />
        <div className="relative">
          <div className="text-6xl mb-3 animate-floaty">{c.icon ?? '🎉'}</div>
          <div className="label">{kicker}</div>
          <h2 className="font-display text-3xl font-bold mt-1">{c.title}</h2>
          {c.detail && <p className="text-ink-soft mt-2">{c.detail}</p>}
          <button className="btn-primary w-full mt-5" onClick={() => dismiss(c.id)} autoFocus>{items.length > 1 ? 'Next' : 'Super !'}</button>
        </div>
      </div>
    </div>
  );
}
