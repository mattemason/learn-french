import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/state/store';
import { addDays, dayKey, daysBetween, formatDay, parseDay, weekKey } from '@/lib/dates';
import { Empty, SectionTitle } from '@/components/ui';

export function PlannerPage() {
  const s = useStore();
  const addPlan = useStore((st) => st.addPlan);
  const toggle = useStore((st) => st.togglePlan);
  const del = useStore((st) => st.deletePlan);
  const today = dayKey();
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(today);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'study' | 'assessment'>('study');

  const first = weekKey(dayKey(month));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  const plansOn = (d: string) => s.plans.filter((p) => p.date === d);
  const upcoming = s.plans.filter((p) => daysBetween(today, p.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const assessments = upcoming.filter((p) => p.kind === 'assessment');

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">Study planner</h1>
      <p className="text-ink-soft">Plan short sessions and keep track of upcoming assessments.</p>

      {assessments[0] && (
        <div className="rounded-3xl bg-danger/10 border-2 border-danger/30 p-4 mt-4">
          <div className="label">Next assessment</div>
          <div className="font-display text-xl font-bold">{assessments[0].title}</div>
          <div className="text-sm font-bold">{formatDay(assessments[0].date)} · {daysBetween(today, assessments[0].date) === 0 ? 'today' : `in ${daysBetween(today, assessments[0].date)} days`}</div>
        </div>
      )}

      <div className="card p-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <button aria-label="Previous month" className="h-10 w-10 grid place-items-center rounded-xl bg-surface-2" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></button>
          <div className="font-display text-lg font-bold">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
          <button aria-label="Next month" className="h-10 w-10 grid place-items-center rounded-xl bg-surface-2" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></button>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-extrabold text-ink-soft mb-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i}>{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const inMonth = parseDay(d).getMonth() === month.getMonth();
            const ps = plansOn(d);
            const active = (s.activity[d]?.xp ?? 0) > 0;
            return (
              <button key={d} onClick={() => setSelected(d)} className={`aspect-square rounded-xl text-sm font-bold flex flex-col items-center justify-center relative
                ${d === selected ? 'bg-primary text-primary-ink' : d === today ? 'bg-primary/10 text-primary' : inMonth ? '' : 'text-ink-soft/40'}`}>
                {parseDay(d).getDate()}
                <span className="flex gap-0.5 absolute bottom-1">
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  {ps.some((p) => p.kind === 'assessment') && <span className="h-1.5 w-1.5 rounded-full bg-danger" />}
                  {ps.some((p) => p.kind === 'study') && <span className="h-1.5 w-1.5 rounded-full bg-sky" />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 text-[11px] font-bold text-ink-soft mt-2">
          <span><span className="inline-block h-2 w-2 rounded-full bg-accent" /> practised</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-sky" /> planned</span>
          <span><span className="inline-block h-2 w-2 rounded-full bg-danger" /> assessment</span>
        </div>
      </div>

      <SectionTitle>{formatDay(selected, { weekday: 'long', day: 'numeric', month: 'long' })}</SectionTitle>
      <div className="card p-4">
        <div className="flex gap-2">
          <input className="input py-2.5" placeholder={kind === 'study' ? 'e.g. Revise unit 3 vocab' : 'e.g. IA1 short response exam'} value={title} onChange={(e) => setTitle(e.target.value)} />
          <button className="btn-primary btn-sm" disabled={!title.trim()} onClick={() => { addPlan({ date: selected, title: title.trim(), kind }); setTitle(''); }} aria-label="Add"><Plus size={18} /></button>
        </div>
        <div className="flex gap-2 mt-2">
          {(['study', 'assessment'] as const).map((k) => <button key={k} onClick={() => setKind(k)} className={`chip py-1.5 px-3 text-sm ${kind === k ? 'bg-ink text-bg' : 'bg-surface-2'}`}>{k === 'study' ? '📘 Study session' : '📝 Assessment'}</button>)}
        </div>
        <div className="mt-3 divide-y divide-line">
          {plansOn(selected).map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-2">
              <input type="checkbox" checked={p.done} onChange={() => toggle(p.id)} className="h-5 w-5 accent-[rgb(var(--accent))]" aria-label="Done" />
              <span className={`flex-1 font-semibold ${p.done ? 'line-through text-ink-soft' : ''}`}>{p.kind === 'assessment' ? '📝' : '📘'} {p.title}</span>
              <button onClick={() => del(p.id)} aria-label="Delete" className="text-ink-soft"><Trash2 size={16} /></button>
            </div>
          ))}
          {!plansOn(selected).length && <p className="text-sm text-ink-soft py-2">Nothing planned for this day.</p>}
        </div>
      </div>

      <SectionTitle>Coming up</SectionTitle>
      {upcoming.length ? (
        <div className="card divide-y divide-line">
          {upcoming.slice(0, 10).map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
              <span className="font-semibold">{p.kind === 'assessment' ? '📝' : '📘'} {p.title}</span>
              <span className="text-sm text-ink-soft font-bold">{formatDay(p.date)}</span>
            </div>
          ))}
        </div>
      ) : <Empty icon="🗓️" title="Nothing planned yet">Short, regular sessions beat cramming. Try planning three 5-minute sessions this week.</Empty>}
    </div>
  );
}
