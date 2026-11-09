import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bot, Brain, ChevronRight, Headphones, Layers, MessageCircle, Send, Shuffle, Sparkles, Timer, BookOpen } from 'lucide-react';
import { units, vocabById, withArticle, articleById } from '@/content';
import { useStore, dueCards, weakConcepts, strongConcepts, isUnitUnlocked, type Summary } from '@/state/store';
import { strength, type Strength } from '@/lib/srs';
import { dayKey, daysBetween } from '@/lib/dates';
import { allDialogues, buildPractice, buildReview } from '@/lib/sessions';
import { askTutor, useAiStatus } from '@/ai/tutor';
import { Player } from '@/components/Player';
import { Results } from '@/components/Results';
import { Empty, ProgressBar, RichText, SectionTitle } from '@/components/ui';
import { AccentBar } from '@/exercises/common';

const STRENGTH_META: Record<Strength, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-line' },
  learning: { label: 'Learning', color: 'bg-danger' },
  familiar: { label: 'Familiar', color: 'bg-sun' },
  strong: { label: 'Strong', color: 'bg-sky' },
  mastered: { label: 'Mastered', color: 'bg-accent' },
};

export function PracticePage() {
  const s = useStore();
  const nav = useNavigate();
  const due = dueCards(s);
  const all = Object.values(s.srs);
  const today = dayKey();
  const recent = all.filter((c) => c.kind === 'vocab' && daysBetween(c.added, today) <= 3).slice(-8);
  const dist = (['new', 'learning', 'familiar', 'strong', 'mastered'] as Strength[]).map((k) => ({ k, n: all.filter((c) => strength(c) === k).length }));
  const totalTracked = Math.max(1, dist.reduce((a, b) => a + b.n, 0));
  const weak = weakConcepts(s);
  const strong = strongConcepts(s);
  const aiStatus = useAiStatus();
  const decks = [...new Set(Object.values(s.customCards).map((c) => c.deck))];
  const [unitPick, setUnitPick] = useState('');

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">Practice</h1>
      <p className="text-ink-soft">Revision keeps what you've learned. Challenges sharpen it.</p>

      {/* Revision dashboard */}
      <div className="card p-5 mt-4 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="h-16 w-16 rounded-3xl bg-sky text-white grid place-items-center shrink-0"><Brain size={32} /></div>
          <div className="flex-1">
            <div className="font-display text-2xl font-bold">{due.length} due today</div>
            <div className="text-sm text-ink-soft font-semibold">
              {due.filter((c) => c.kind === 'vocab').length} words · {due.filter((c) => c.kind === 'concept').length} concepts · {due.filter((c) => c.kind === 'custom').length} flashcards
            </div>
          </div>
        </div>
        <div className="relative mt-4">
          <div className="flex h-3 rounded-full overflow-hidden bg-surface-2">
            {dist.map((d) => <div key={d.k} className={STRENGTH_META[d.k].color} style={{ width: `${(d.n / totalTracked) * 100}%` }} />)}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-bold text-ink-soft">
            {dist.map((d) => <span key={d.k} className="flex items-center gap-1"><span className={`h-2.5 w-2.5 rounded-full ${STRENGTH_META[d.k].color}`} />{STRENGTH_META[d.k].label} {d.n}</span>)}
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-2 mt-4">
          <button className="btn-primary col-span-2" disabled={!due.length} onClick={() => nav('/review')}>{due.length ? `Recommended revision · ${Math.min(20, due.length)} item${Math.min(20, due.length) === 1 ? '' : 's'}` : 'All caught up ✨'}</button>
          <button className="btn-ghost btn-sm" disabled={!due.some((c) => c.kind === 'vocab')} onClick={() => nav('/review?focus=vocab')}>Words only</button>
          <button className="btn-ghost btn-sm" disabled={!weak.length && !due.some((c) => c.kind === 'concept')} onClick={() => nav('/review?focus=concepts')}>Weak concepts</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div className="card p-4">
          <div className="font-extrabold mb-2">💪 Strong areas</div>
          {strong.length ? strong.map((c) => <div key={c.id} className="text-sm font-semibold py-0.5">{articleById.get(c.id)?.title ?? c.id} <span className="text-accent">{Math.round(c.ratio * 100)}%</span></div>) : <div className="text-sm text-ink-soft">Keep practising — strengths appear here.</div>}
        </div>
        <div className="card p-4">
          <div className="font-extrabold mb-2">🎯 Needs practice</div>
          {weak.length ? weak.map((c) => <Link to={`/notebook/library/${c.id}`} key={c.id} className="block text-sm font-semibold py-0.5">{articleById.get(c.id)?.title ?? c.id} <span className="text-danger">{Math.round(c.ratio * 100)}%</span></Link>) : <div className="text-sm text-ink-soft">No weak spots detected yet.</div>}
        </div>
      </div>

      {recent.length > 0 && (
        <>
          <SectionTitle>Recently learned</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {recent.map((c) => { const v = vocabById.get(c.id.slice(2)); return v ? <span key={c.id} className="chip bg-surface border border-line text-sm py-1.5">{withArticle(v)}</span> : null; })}
          </div>
        </>
      )}

      <SectionTitle>Choose what to revise</SectionTitle>
      <div className="card p-4 flex gap-2">
        <select value={unitPick} onChange={(e) => setUnitPick(e.target.value)} className="input py-2.5 flex-1" aria-label="Unit to revise">
          <option value="">Pick a unit…</option>
          {units.filter((u) => isUnitUnlocked(s, u.id)).map((u) => <option key={u.id} value={u.id}>{u.level} · {u.title}</option>)}
        </select>
        <button className="btn-primary btn-sm" disabled={!unitPick} onClick={() => nav(`/review?unit=${unitPick}`)}>Revise</button>
      </div>
      {decks.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {decks.map((d) => <Link key={d} to={`/review?deck=${encodeURIComponent(d)}`} className="chip bg-surface border border-line py-1.5 text-sm"><Layers size={14} /> {d}</Link>)}
        </div>
      )}

      <SectionTitle>Challenges</SectionTitle>
      <div className="grid sm:grid-cols-2 gap-3">
        <ChallengeCard to="/practice/session/listening" icon={<Headphones />} tone="bg-sky" title="Listening sprint" sub="10 audio questions from your lessons" />
        <ChallengeCard to="/practice/session/mixed" icon={<Shuffle />} tone="bg-primary" title="Mixed quiz" sub="12 questions from everything unlocked" />
        <ChallengeCard to="/practice/session/verbs:present" icon={<Timer />} tone="bg-sun" title="Verb drill · présent" sub="Conjugation tables, generated fresh" />
        <ChallengeCard to="/practice/session/reading" icon={<BookOpen />} tone="bg-accent" title="Reading corner" sub="Short texts with questions" />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {['passe-compose', 'imparfait', 'futur-simple', 'conditionnel', 'subjonctif'].map((t) => (
          <Link key={t} to={`/practice/session/verbs:${t}`} className="chip bg-surface border border-line py-1.5 text-sm">🧩 {t.replace('-', ' ')}</Link>
        ))}
      </div>

      <SectionTitle>Conversation</SectionTitle>
      <Link to="/practice/conversations" className="card p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-accent text-accent-ink grid place-items-center"><MessageCircle /></div>
        <div className="flex-1"><div className="font-extrabold">Real-world scenarios</div><div className="text-sm text-ink-soft">Order at a café, meet a host family, ask for directions…{aiStatus === 'ready' ? ' Plus free AI conversation.' : ''}</div></div>
        <ChevronRight className="text-ink-soft" />
      </Link>
      <Link to="/notebook?tab=cards" className="card p-4 flex items-center gap-4 mt-3">
        <div className="h-12 w-12 rounded-2xl bg-sun text-ink grid place-items-center"><Layers /></div>
        <div className="flex-1"><div className="font-extrabold">My flashcards</div><div className="text-sm text-ink-soft">{Object.keys(s.customCards).length} custom cards</div></div>
        <ChevronRight className="text-ink-soft" />
      </Link>
    </div>
  );
}

function ChallengeCard({ to, icon, tone, title, sub }: { to: string; icon: React.ReactNode; tone: string; title: string; sub: string }) {
  return (
    <Link to={to} className="card p-4 flex items-center gap-3 active:translate-y-[2px]">
      <div className={`h-12 w-12 rounded-2xl ${tone} text-white grid place-items-center shrink-0`}>{icon}</div>
      <div className="min-w-0"><div className="font-extrabold">{title}</div><div className="text-sm text-ink-soft">{sub}</div></div>
    </Link>
  );
}

export function ReviewPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const finish = useStore((s) => s.finishReview);
  const [summary, setSummary] = useState<Summary | null>(null);
  const items = useMemo(() => {
    const s = useStore.getState();
    return buildReview(s, dueCards(s).map((c) => c.id), {
      focus: params.get('focus') as 'concepts' | 'vocab' | 'custom' | null,
      unitId: params.get('unit'),
      deck: params.get('deck'),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (summary) return <Results summary={summary} onContinue={() => nav('/practice', { replace: true })} continueLabel="Back to practice" secondary={<Link to="/" className="btn-ghost">Home</Link>} />;
  if (!items.length) {
    return (
      <div className="min-h-dvh grid place-items-center p-6">
        <div className="max-w-sm w-full"><Empty icon="✨" title="Nothing to revise right now">Complete a lesson or save some words, and they'll appear here when it's time to review.</Empty>
          <Link to="/practice" className="btn-primary w-full mt-4">Back</Link></div>
      </div>
    );
  }
  return <Player title="Revision" items={items} mode="review" exitTo="/practice" onFinish={(r) => setSummary(finish(r.grades, r.results, r.seconds))} />;
}

export function PracticeSessionPage() {
  const { kind = '' } = useParams();
  const nav = useNavigate();
  const finish = useStore((s) => s.finishPractice);
  const [summary, setSummary] = useState<Summary | null>(null);
  const session = useMemo(() => buildPractice(useStore.getState(), kind), [kind]);

  if (summary) return <Results summary={summary} onContinue={() => nav(-1)} continueLabel="Done" secondary={<button className="btn-ghost" onClick={() => window.location.reload()}>Go again</button>} />;
  if (!session.items.length) {
    return (
      <div className="min-h-dvh grid place-items-center p-6">
        <div className="max-w-sm w-full"><Empty icon="🌱" title="Not enough material yet">Complete a few lessons first — challenges draw on what you've unlocked.</Empty>
          <Link to="/learn" className="btn-primary w-full mt-4">Go to lessons</Link></div>
      </div>
    );
  }
  return <Player title={session.title} items={session.items} mode="lesson" exitTo="/practice" onFinish={(r) => setSummary(finish(session.title, r.results, r.seconds, { conversation: session.conversation }))} />;
}

/* ---------------- Conversations ---------------- */

const AI_SCENARIOS = [
  'Ordering lunch at a café in Lyon',
  'Meeting your exchange host family in Bordeaux',
  'Asking for directions near the Gare du Nord in Paris',
  'Chatting with a new classmate about hobbies',
  'Checking into a youth hostel in Nice',
  'Buying a train ticket to Marseille',
];

export function ConversationsPage() {
  const s = useStore();
  const dialogues = allDialogues();
  const ai = useAiStatus();
  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">Conversations</h1>
      <p className="text-ink-soft">Scripted scenarios with typed replies — checked instantly, no AI needed.</p>
      <SectionTitle>Scenarios</SectionTitle>
      <div className="grid gap-2.5">
        {dialogues.map(({ unit, lesson, ex }) => {
          const open = isUnitUnlocked(s, unit.id);
          return (
            <Link key={lesson.id + ex.id} to={open ? `/practice/session/dialogue:${lesson.id}:${ex.id}` : `/learn/${unit.id}`} className={`card p-4 flex items-center gap-3 ${open ? '' : 'opacity-60'}`}>
              <span className="text-3xl">{unit.emoji}</span>
              <div className="flex-1 min-w-0"><div className="font-extrabold">{ex.scenario}</div><div className="text-sm text-ink-soft">{ex.setting} · {unit.level}</div></div>
              <ChevronRight className="text-ink-soft" />
            </Link>
          );
        })}
      </div>
      <SectionTitle>Free conversation (AI)</SectionTitle>
      {ai === 'ready' ? <AiChat /> : (
        <div className="card p-4 text-sm text-ink-soft">
          <div className="flex items-center gap-2 font-extrabold text-ink mb-1"><Bot size={18} /> Optional AI conversation partner</div>
          {ai === 'off' ? <>Turn on AI features in <Link className="underline font-bold" to="/settings">Settings</Link> to chat freely with adjustable difficulty.</> : ai === 'login' ? <>Create a free account in <Link className="underline font-bold" to="/settings">Settings</Link> to use the AI conversation partner.</> : <>Not set up on this server yet. Everything else works without it.</>}
        </div>
      )}
    </div>
  );
}

function AiChat() {
  const level = useStore((s) => s.placement?.estimate ?? 'A1');
  const finish = useStore((s) => s.finishPractice);
  const [scenario, setScenario] = useState(AI_SCENARIOS[0]);
  const [lvl, setLvl] = useState<string>(level);
  const [englishHelp, setEnglishHelp] = useState(true);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    const h = [...history, { role: 'user' as const, content: msg }];
    setHistory(h);
    setInput('');
    setBusy(true);
    setErr(null);
    try {
      const reply = await askTutor({ mode: 'chat', scenario, level: lvl, englishHelp, history: h });
      setHistory([...h, { role: 'assistant', content: reply }]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-4">
      <div className="grid sm:grid-cols-3 gap-2">
        <select className="input py-2 sm:col-span-2" value={scenario} onChange={(e) => { setScenario(e.target.value); setHistory([]); }} aria-label="Scenario">
          {AI_SCENARIOS.map((x) => <option key={x}>{x}</option>)}
        </select>
        <select className="input py-2" value={lvl} onChange={(e) => setLvl(e.target.value)} aria-label="Difficulty">
          {['A1', 'A2', 'B1', 'B2', 'C1'].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold mt-2"><input type="checkbox" checked={englishHelp} onChange={(e) => setEnglishHelp(e.target.checked)} /> English help after each reply</label>
      <div className="mt-3 space-y-2 max-h-[50dvh] overflow-y-auto">
        {!history.length && <button className="btn-ghost btn-sm" onClick={() => send('Bonjour !')}><Sparkles size={14} /> Start with « Bonjour ! »</button>}
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}>
            <div className={`max-w-[85%] rounded-3xl px-4 py-2.5 ${m.role === 'user' ? 'bg-primary text-primary-ink rounded-br-md' : 'bg-surface-2 rounded-bl-md'}`}><RichText text={m.content} /></div>
          </div>
        ))}
        {busy && <div className="text-sm text-ink-soft">…</div>}
        {err && <div className="text-sm text-danger font-semibold">{err}</div>}
      </div>
      <div className="flex gap-2 mt-3">
        <input ref={ref} className="input py-2.5" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Écrivez en français…" lang="fr" />
        <button className="btn-primary px-4" onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send"><Send size={18} /></button>
      </div>
      <AccentBar target={ref} value={input} onChange={setInput} />
      {history.length >= 6 && <button className="btn-ghost btn-sm mt-2" onClick={() => { finish('AI conversation', [], 0, { conversation: true }); setHistory([]); }}>Finish conversation (+XP)</button>}
      <ProgressBar value={Math.min(1, history.length / 6)} height="h-1.5" className="mt-3" color="bg-accent" />
    </div>
  );
}
