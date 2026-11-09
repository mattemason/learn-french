import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Lock, Play, Star, Target, Trophy } from 'lucide-react';
import { articleById, articles, levels, unitById, units, withArticle } from '@/content';
import { SKILLS, type Skill } from '@/content/types';
import { schoolTopics } from '@/content/school';
import { useStore, isUnitComplete, isUnitUnlocked, passedSet } from '@/state/store';
import { AudioButton, ProgressBar, SectionTitle } from '@/components/ui';

const SKILL_META: Record<Skill, { label: string; icon: string }> = {
  vocabulary: { label: 'Vocabulary', icon: '🔤' },
  grammar: { label: 'Grammar', icon: '🧩' },
  reading: { label: 'Reading', icon: '📖' },
  writing: { label: 'Writing', icon: '✍️' },
  listening: { label: 'Listening', icon: '🎧' },
  speaking: { label: 'Speaking', icon: '🗣️' },
};
export { SKILL_META };

export function LearnPage() {
  const [tab, setTab] = useState<'map' | 'skills' | 'grammar'>('map');
  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">Learn</h1>
      <p className="text-ink-soft">From first words to C2 mastery, one small step at a time.</p>
      <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
        {([['map', '🗺️ Course map'], ['skills', '🎯 Skill paths'], ['grammar', '🧩 Grammar path']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`chip text-sm py-2 px-4 shrink-0 ${tab === k ? 'bg-ink text-bg' : 'bg-surface border border-line'}`}>{l}</button>
        ))}
      </div>
      {tab === 'map' && <CourseMap />}
      {tab === 'skills' && <SkillPaths />}
      {tab === 'grammar' && <GrammarPath />}
    </div>
  );
}

function CourseMap() {
  const s = useStore();
  const passed = passedSet(s);
  return (
    <div className="mt-4">
      {levels.map((lvl) => {
        const done = lvl.units.filter((u) => passed.has(u.id)).length;
        const total = lvl.units.length + lvl.planned.length;
        return (
          <section key={lvl.id} className="mb-10">
            <div className="card p-4 flex items-center gap-4 sticky top-16 z-10">
              <div className="h-14 w-14 rounded-2xl bg-ink text-bg grid place-items-center font-display text-xl font-bold shrink-0">{lvl.id}</div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-xl font-bold">{lvl.title}</div>
                <div className="text-xs text-ink-soft font-semibold line-clamp-2">{lvl.description}</div>
                {lvl.units.length > 0 && <ProgressBar value={done / lvl.units.length} height="h-2" className="mt-2" color="bg-accent" />}
              </div>
              <div className="text-xs font-extrabold text-ink-soft text-right shrink-0">{lvl.units.length ? `${done}/${lvl.units.length}` : `${total}`}<br />{lvl.units.length ? 'passed' : 'units'}</div>
            </div>

            <div className="relative mt-4">
              {lvl.units.map((u, i) => {
                const unlocked = isUnitUnlocked(s, u.id);
                const complete = isUnitComplete(s, u.id);
                const cp = s.checkpoints[u.id];
                const lessonsDone = u.lessons.filter((l) => s.lessons[l.id]).length;
                const offset = ['ml-0', 'ml-[18%]', 'ml-[32%]', 'ml-[18%]'][i % 4];
                return (
                  <div key={u.id} className={`flex items-center gap-4 my-5 ${offset}`}>
                    <Link to={`/learn/${u.id}`} aria-label={`${u.title}${unlocked ? '' : ' (locked)'}`}
                      className={`relative h-20 w-20 shrink-0 rounded-full grid place-items-center text-4xl transition active:translate-y-1
                        ${complete ? 'bg-accent shadow-[0_6px_0_rgb(var(--accent)/0.5)]' : unlocked ? 'bg-primary shadow-[0_6px_0_rgb(var(--primary)/0.5)] animate-floaty' : 'bg-surface-2 shadow-[0_6px_0_rgb(var(--line))] grayscale'}`}>
                      <span>{u.emoji}</span>
                      {cp?.passedAt && <span className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-sun grid place-items-center shadow"><Trophy size={14} className="text-ink" /></span>}
                      {!unlocked && <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-surface border border-line grid place-items-center"><Lock size={13} /></span>}
                    </Link>
                    <Link to={`/learn/${u.id}`} className="min-w-0">
                      <div className="text-xs font-extrabold text-ink-soft">Unit {u.order}</div>
                      <div className="font-display text-lg font-bold leading-tight">{u.title}</div>
                      <div className="text-sm text-ink-soft font-semibold">{u.titleEn} · {lessonsDone}/{u.lessons.length} lessons</div>
                    </Link>
                  </div>
                );
              })}
              {lvl.planned.map((p, i) => (
                <div key={p.title} className={`flex items-center gap-4 my-5 opacity-60 ${['ml-0', 'ml-[18%]', 'ml-[32%]', 'ml-[18%]'][(lvl.units.length + i) % 4]}`}>
                  <div className="h-16 w-16 shrink-0 rounded-full grid place-items-center text-3xl bg-surface-2 border-2 border-dashed border-line grayscale">{p.emoji}</div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-ink-soft">Coming soon</div>
                    <div className="font-display text-lg font-bold leading-tight">{p.title}</div>
                    <div className="text-sm text-ink-soft font-semibold">{p.outcome}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SkillPaths() {
  const s = useStore();
  const [skill, setSkill] = useState<Skill>('listening');
  const lessons = units.flatMap((u) => u.lessons.filter((l) => l.skills.includes(skill)).map((l) => ({ u, l })));
  const p = s.practice[skill];
  return (
    <div className="mt-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {SKILLS.map((k) => (
          <button key={k} onClick={() => setSkill(k)} className={`tile text-center py-3 ${skill === k ? 'tile-selected' : ''}`}>
            <div className="text-2xl">{SKILL_META[k].icon}</div>
            <div className="text-xs font-extrabold mt-1">{SKILL_META[k].label}</div>
          </button>
        ))}
      </div>
      <div className="card p-4 mt-4 flex items-center justify-between gap-3">
        <div>
          <div className="font-extrabold">{SKILL_META[skill].label} practice accuracy</div>
          <div className="text-sm text-ink-soft">{p?.t ? `${Math.round((p.c / p.t) * 100)}% across ${p.t} answers` : 'No answers yet'}</div>
        </div>
        <Link to={`/practice/session/skill-${skill}`} className="btn-primary btn-sm shrink-0">Quick drill</Link>
      </div>
      <SectionTitle>Lessons that train {SKILL_META[skill].label.toLowerCase()}</SectionTitle>
      <div className="grid gap-2">
        {lessons.map(({ u, l }) => (
          <Link key={l.id} to={isUnitUnlocked(s, u.id) ? `/lesson/${l.id}` : `/learn/${u.id}`} className="card p-3.5 flex items-center gap-3">
            <span className="text-2xl">{u.emoji}</span>
            <div className="flex-1 min-w-0"><div className="font-extrabold truncate">{l.title}</div><div className="text-xs text-ink-soft font-semibold">{u.level} · {u.title}</div></div>
            {s.lessons[l.id] ? <Check className="text-accent" /> : isUnitUnlocked(s, u.id) ? <Play size={18} className="text-primary" /> : <Lock size={16} className="text-ink-soft" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

function GrammarPath() {
  const s = useStore();
  const grammar = articles.filter((a) => ['grammar', 'verbs', 'tenses', 'sentence-structure'].includes(a.category));
  const byLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({ l, items: grammar.filter((a) => a.level === l) })).filter((g) => g.items.length);
  return (
    <div className="mt-4">
      <p className="text-sm text-ink-soft">The full progression of French grammar. Each topic links to its Library explanation; topics you've practised show your accuracy.</p>
      {byLevel.map((g) => (
        <div key={g.l}>
          <SectionTitle>{g.l}</SectionTitle>
          <div className="grid gap-2">
            {g.items.map((a) => {
              const st = s.conceptStats[a.id];
              const ratio = st ? st.right / Math.max(1, st.right + st.wrong) : null;
              return (
                <Link key={a.id} to={`/notebook/library/${a.id}`} className="card p-3.5 flex items-center gap-3">
                  <span className={`h-9 w-9 shrink-0 rounded-xl grid place-items-center text-sm font-black ${ratio === null ? 'bg-surface-2 text-ink-soft' : ratio >= 0.8 ? 'bg-accent/20 text-accent' : 'bg-sun/25 text-ink'}`}>
                    {ratio === null ? '·' : `${Math.round(ratio * 100)}`}
                  </span>
                  <div className="flex-1 min-w-0"><div className="font-extrabold truncate">{a.title}</div><div className="text-xs text-ink-soft truncate">{a.summary}</div></div>
                  <ChevronRight size={18} className="text-ink-soft" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function UnitPage() {
  const { unitId = '' } = useParams();
  const nav = useNavigate();
  const s = useStore();
  const u = unitById.get(unitId);
  if (!u) return <p>Unit not found.</p>;
  const unlocked = isUnitUnlocked(s, u.id);
  const complete = isUnitComplete(s, u.id);
  const cp = s.checkpoints[u.id];
  const concepts = [...new Set(u.lessons.flatMap((l) => l.library ?? []))].filter((id) => articleById.has(id));
  const school = schoolTopics.filter((t) => t.linkedUnits.includes(u.id));
  let firstOpen = true;

  return (
    <div className="animate-rise">
      <button onClick={() => nav('/learn')} className="flex items-center gap-1 text-sm font-extrabold text-ink-soft mb-3"><ArrowLeft size={16} /> Course map</button>
      <div className="rounded-4xl bg-gradient-to-br from-primary to-sun text-white p-6 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-6 text-[130px] opacity-25 select-none" aria-hidden>{u.emoji}</div>
        <div className="relative">
          <div className="text-xs font-extrabold uppercase tracking-widest opacity-90">{u.level} · Unit {u.order}</div>
          <h1 className="font-display text-4xl font-bold">{u.title}</h1>
          <div className="font-semibold opacity-95">{u.titleEn}</div>
          <div className="mt-4 bg-white/20 rounded-2xl p-3 flex gap-2 items-start max-w-md"><Target size={18} className="shrink-0 mt-0.5" /><span className="font-bold">{u.outcome}</span></div>
        </div>
      </div>

      {!unlocked && (
        <div className="card p-4 mt-4 border-sun">
          <div className="font-extrabold flex items-center gap-2"><Lock size={16} /> Locked — finish the previous unit</div>
          <p className="text-sm text-ink-soft mt-1">Already know this? Take the checkpoint to test out. Score 80% and the whole unit is marked complete.</p>
          <Link to={`/checkpoint/${u.id}?testout=1`} className="btn-ghost btn-sm mt-3">Test out</Link>
        </div>
      )}

      <SectionTitle>Lessons</SectionTitle>
      <div className="grid gap-2.5">
        {u.lessons.map((l, i) => {
          const rec = s.lessons[l.id];
          const isNext = unlocked && !rec && firstOpen;
          if (isNext) firstOpen = false;
          return (
            <Link key={l.id} to={unlocked ? `/lesson/${l.id}` : '#'} onClick={(e) => !unlocked && e.preventDefault()}
              className={`card p-4 flex items-center gap-4 ${isNext ? 'ring-2 ring-primary' : ''} ${unlocked ? '' : 'opacity-60'}`}>
              <div className={`h-12 w-12 shrink-0 rounded-2xl grid place-items-center font-black ${rec ? 'bg-accent text-accent-ink' : isNext ? 'bg-primary text-primary-ink' : 'bg-surface-2 text-ink-soft'}`}>
                {rec ? <Check /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold">{l.title}</div>
                <div className="text-sm text-ink-soft">{l.goal}</div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  <span className="chip bg-surface-2">⏱ {l.minutes} min</span>
                  {l.skills.slice(0, 4).map((k) => <span key={k} className="chip bg-surface-2">{SKILL_META[k].icon}</span>)}
                  {rec && !rec.testedOut && <span className="chip bg-accent/15 text-accent"><Star size={12} /> {Math.round(rec.bestScore * 100)}%</span>}
                  {rec?.testedOut && <span className="chip bg-sky/15 text-sky">Tested out</span>}
                </div>
              </div>
              {unlocked && <ChevronRight className="text-ink-soft" />}
            </Link>
          );
        })}
        <Link to={`/checkpoint/${u.id}`} className={`card p-4 flex items-center gap-4 border-2 ${cp?.passedAt ? 'border-sun' : 'border-dashed'}`}>
          <div className="h-12 w-12 shrink-0 rounded-2xl grid place-items-center bg-sun text-ink"><Trophy /></div>
          <div className="flex-1">
            <div className="font-extrabold">Unit checkpoint</div>
            <div className="text-sm text-ink-soft">{cp?.passedAt ? `Passed · best ${Math.round(cp.bestScore * 100)}%` : cp ? `Best ${Math.round(cp.bestScore * 100)}% · 80% to pass` : complete ? 'Ready when you are — 80% to pass' : 'Proves your proficiency · 80% to pass'}</div>
          </div>
          <ChevronRight className="text-ink-soft" />
        </Link>
      </div>

      <SectionTitle>Key words</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {u.vocab.slice(0, 24).map((v) => (
          <span key={v.id} className="chip bg-surface border border-line text-sm py-1.5 pl-1.5">
            <AudioButton text={withArticle(v)} size="sm" /> <span className="font-bold">{withArticle(v)}</span> <span className="text-ink-soft font-semibold">· {v.en}</span>
          </span>
        ))}
      </div>

      {concepts.length > 0 && (
        <>
          <SectionTitle>In the Library</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {concepts.map((c) => <Link key={c} to={`/notebook/library/${c}`} className="chip bg-primary/10 text-primary text-sm py-1.5">📚 {articleById.get(c)!.title}</Link>)}
          </div>
        </>
      )}

      {s.profile.schoolMode && school.length > 0 && (
        <>
          <SectionTitle>School links (QCE)</SectionTitle>
          <div className="grid gap-2">
            {school.map((t) => <Link key={t.id} to={`/school/${t.id}`} className="card p-3 font-bold">🎓 {t.unit} · {t.title}</Link>)}
          </div>
        </>
      )}
    </div>
  );
}
