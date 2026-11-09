import { Check } from 'lucide-react';
import { useStore, currentQuests } from '@/state/store';
import { ProgressBar } from './ui';
import { fireConfetti } from './Results';

type Q = ReturnType<typeof currentQuests>['daily'][number];

export function QuestRow({ q }: { q: Q }) {
  const claim = useStore((s) => s.claimQuest);
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="h-11 w-11 shrink-0 rounded-2xl bg-surface-2 grid place-items-center text-xl">{q.quest.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <span className="font-extrabold truncate">{q.quest.title}</span>
          <span className="text-xs font-bold text-ink-soft shrink-0">{q.progress}/{q.quest.target}</span>
        </div>
        <ProgressBar value={q.progress / q.quest.target} height="h-2.5" className="mt-1.5" color={q.done ? 'bg-accent' : 'bg-sun'} />
      </div>
      {q.claimed ? (
        <span className="h-10 w-16 grid place-items-center rounded-xl bg-accent/15 text-accent" aria-label="Claimed"><Check size={20} /></span>
      ) : q.done ? (
        <button className="btn-accent btn-sm w-16 px-0 animate-pop" onClick={() => { claim(q.quest.id, q.period); fireConfetti(); }}>Claim</button>
      ) : (
        <span className="w-16 text-center text-xs font-extrabold text-ink-soft leading-tight">+{q.quest.xp} XP<br />🪙{q.quest.coins}</span>
      )}
    </div>
  );
}

export function QuestList({ kind }: { kind: 'daily' | 'weekly' }) {
  const s = useStore();
  const qs = currentQuests(s)[kind];
  return <div className="divide-y divide-line">{qs.map((q) => <QuestRow key={q.quest.id} q={q} />)}</div>;
}
