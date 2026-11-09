import { Link } from 'react-router-dom';
import { Award, Info } from 'lucide-react';
import { SKILLS, CEFR_LEVELS } from '@/content/types';
import { useStore, computeStats, passedSet, unitsByLevel } from '@/state/store';
import { achievements, levelFromXp } from '@/lib/game';
import { demonstratedLevel, levelStatuses, skillLevel } from '@/lib/proficiency';
import { addDays, dayKey, formatDay, parseDay } from '@/lib/dates';
import { ProgressBar, Ring, SectionTitle, Stat } from '@/components/ui';
import { SKILL_META } from './Learn';

export function ProgressPage() {
  const s = useStore();
  const statuses = levelStatuses(unitsByLevel(), passedSet(s));
  const demo = demonstratedLevel(statuses);
  const working = statuses.find((x) => !x.demonstrated);
  const lvl = levelFromXp(s.xp);
  const stats = computeStats(s);
  const today = dayKey();
  const days = Array.from({ length: 84 }, (_, i) => addDays(today, i - 83));
  const maxXp = Math.max(30, ...days.map((d) => s.activity[d]?.xp ?? 0));
  const last7 = days.slice(-7);
  const minutes = Math.round(s.totals.seconds / 60);

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">Progress</h1>

      {/* Proficiency (evidence-based) */}
      <div className="card p-5 mt-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-3xl bg-ink text-bg grid place-items-center font-display text-3xl font-bold shrink-0">{demo ?? 'Pre‑A1'}</div>
          <div className="flex-1">
            <div className="label">CEFR proficiency (demonstrated)</div>
            <div className="font-display text-2xl font-bold">{demo ? `${demo} achieved` : 'Working towards A1'}</div>
            {working && <div className="text-sm text-ink-soft font-semibold">{working.level}: {working.passedUnits}/{working.authoredUnits || '—'} checkpoints passed</div>}
            {s.placement?.estimate && <div className="text-sm text-ink-soft">Placement estimate: <b>{s.placement.estimate}</b></div>}
          </div>
        </div>
        <div className="grid grid-cols-6 gap-1.5 mt-4">
          {statuses.map((st) => (
            <div key={st.level} className="text-center">
              <div className={`h-2.5 rounded-full ${st.demonstrated ? 'bg-accent' : st.passedUnits ? 'bg-sun' : 'bg-surface-2'}`} />
              <div className="text-xs font-extrabold mt-1 text-ink-soft">{st.level}</div>
            </div>
          ))}
        </div>
        <p className="flex gap-2 text-xs text-ink-soft font-semibold mt-4"><Info size={14} className="shrink-0" /> Proficiency only comes from checkpoints and the placement check. XP and coins never change it.</p>
      </div>

      <SectionTitle>Skills</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {SKILLS.map((k) => {
          const sl = skillLevel(s.evidence, k);
          const pr = s.practice[k];
          return (
            <div key={k} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="font-extrabold">{SKILL_META[k].icon} {SKILL_META[k].label}</div>
                <span className={`chip ${sl.level ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-ink-soft'}`}>{sl.level ?? 'Pre‑A1'}</span>
              </div>
              {sl.next && (
                <>
                  <div className="text-xs text-ink-soft font-bold mt-2">Towards {sl.next}: {sl.nextItems ? `${Math.round((sl.nextAccuracy ?? 0) * 100)}% on ${sl.nextItems} assessed answers` : 'no assessed answers yet'}</div>
                  <ProgressBar value={Math.min(1, sl.nextItems / 4) * (sl.nextAccuracy ?? 0) / 0.7} height="h-2" className="mt-1.5" color="bg-accent" />
                </>
              )}
              <div className="text-xs text-ink-soft mt-2">Practice accuracy: {pr?.t ? `${Math.round((pr.c / pr.t) * 100)}% (${pr.t})` : '—'}</div>
            </div>
          );
        })}
      </div>

      <SectionTitle>Activity</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Stat icon="🔥" value={`${s.streak.current}`} label={`Streak · best ${s.streak.longest}`} />
        <Stat icon="⏱️" value={`${minutes} min`} label="Time learning" />
        <Stat icon="📘" value={stats.lessons} label="Lessons" />
        <Stat icon="🧠" value={stats.wordsLearned} label={`Words · ${stats.wordsMastered} mastered`} />
      </div>
      <div className="card p-4 mt-3">
        <div className="flex items-end justify-between gap-1 h-28">
          {last7.map((d) => {
            const xp = s.activity[d]?.xp ?? 0;
            const prot = s.streak.protectedDays.includes(d);
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-bold text-ink-soft">{xp || (prot ? '🧊' : '')}</div>
                <div className={`w-full max-w-9 rounded-t-xl ${d === today ? 'bg-primary' : 'bg-sun'}`} style={{ height: `${Math.max(4, (xp / maxXp) * 80)}px`, opacity: xp ? 1 : 0.25 }} />
                <div className="text-[10px] font-extrabold text-ink-soft">{parseDay(d).toLocaleDateString(undefined, { weekday: 'narrow' })}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-flow-col grid-rows-7 gap-[3px] justify-start overflow-x-auto" aria-label="Last 12 weeks">
          {days.map((d) => {
            const xp = s.activity[d]?.xp ?? 0;
            const o = xp ? 0.25 + Math.min(0.75, xp / maxXp) : 0;
            return <div key={d} title={`${formatDay(d)}: ${xp} XP`} className="h-3.5 w-3.5 rounded-[4px]" style={{ background: xp ? `rgb(var(--accent) / ${o})` : 'rgb(var(--surface-2))' }} />;
          })}
        </div>
      </div>

      <SectionTitle>Game progress</SectionTitle>
      <div className="card p-4 flex items-center gap-4">
        <Ring value={lvl.progress} size={70} stroke={7} color="rgb(var(--sun))"><span className="font-black text-lg">{lvl.level}</span></Ring>
        <div className="flex-1">
          <div className="font-extrabold">Player level {lvl.level}</div>
          <div className="text-sm text-ink-soft">{s.xp} XP total · {lvl.levelSize - lvl.intoLevel} XP to level {lvl.level + 1}</div>
          <div className="text-sm text-ink-soft">🪙 {s.coins} coins · <Link to="/shop" className="underline font-bold">Boutique</Link></div>
        </div>
      </div>

      <SectionTitle action={<span className="text-sm font-bold text-ink-soft">{Object.keys(s.achievements).length}/{achievements.length}</span>}>Achievements</SectionTitle>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {achievements.map((a) => {
          const got = s.achievements[a.id];
          const ring = a.tier === 'gold' ? 'from-sun to-primary' : a.tier === 'silver' ? 'from-sky to-accent' : 'from-accent to-sun';
          return (
            <div key={a.id} className={`card p-3 text-center ${got ? '' : 'opacity-50'}`} title={a.description}>
              <div className={`mx-auto h-14 w-14 rounded-full p-[3px] ${got ? `bg-gradient-to-br ${ring}` : 'bg-line'}`}>
                <div className={`h-full w-full rounded-full bg-surface grid place-items-center text-2xl ${got ? '' : 'grayscale'}`}>{a.icon}</div>
              </div>
              <div className="text-xs font-extrabold mt-2 leading-tight">{a.title}</div>
              <div className="text-[10px] text-ink-soft mt-0.5 leading-tight">{got ? `Earned ${formatDay(got, { day: 'numeric', month: 'short' })}` : a.description}</div>
            </div>
          );
        })}
      </div>

      <SectionTitle>Checkpoint history</SectionTitle>
      <div className="card divide-y divide-line">
        {CEFR_LEVELS.flatMap((l) => unitsByLevel()[l]).filter((id) => s.checkpoints[id]).map((id) => (
          <div key={id} className="flex items-center justify-between px-4 py-2.5 text-sm font-bold">
            <span>{id.toUpperCase()}</span>
            <span className={s.checkpoints[id].passedAt ? 'text-accent' : 'text-ink-soft'}><Award size={14} className="inline" /> {Math.round(s.checkpoints[id].bestScore * 100)}% {s.checkpoints[id].passedAt ? 'passed' : ''}</span>
          </div>
        ))}
        {!Object.keys(s.checkpoints).length && <div className="p-4 text-sm text-ink-soft">No checkpoints yet. Finish a unit, then take its checkpoint to demonstrate your level.</div>}
      </div>
    </div>
  );
}
