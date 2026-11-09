import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { placementQuestions } from '@/content/placement';
import { CEFR_LEVELS, type CEFR, type PlacementQuestion } from '@/content/types';
import { units } from '@/content';
import { useStore, type PlacementResult } from '@/state/store';
import { dayKey } from '@/lib/dates';
import { AudioButton, ProgressBar, Sheet } from '@/components/ui';
import { AccountForm } from '@/components/Account';
import { useCloud } from '@/sync/cloud';
import { fireConfetti } from '@/components/Results';

export function OnboardingPage() {
  const nav = useNavigate();
  const complete = useStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(30);
  const [school, setSchool] = useState<null | 11 | 12>(null);
  const [showLogin, setShowLogin] = useState(false);
  const accounts = useCloud((s) => s.config.accounts);

  const finish = (placement: boolean) => {
    complete({ name: name.trim(), dailyGoalXp: goal, minutesPerDay: goal <= 10 ? 5 : goal <= 30 ? 10 : 20, schoolMode: school !== null, schoolYear: school });
    nav(placement ? '/placement' : '/', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-bg pattern-dots safe-top">
      <div className="mx-auto max-w-md px-5 py-10 min-h-dvh flex flex-col">
        <ProgressBar value={(step + 1) / 6} className="mb-8" color="bg-primary" />
        <div className="flex-1 animate-rise" key={step}>
          {step === 0 && (
            <div className="text-center pt-6">
              <img src="/icon.svg" alt="" className="h-24 w-24 mx-auto rounded-3xl shadow-[0_8px_0_rgb(0_0_0/0.12)] animate-floaty" />
              <h1 className="font-display text-5xl font-bold mt-8 italic">Allez&nbsp;!</h1>
              <p className="text-lg text-ink-soft mt-3">A game that happens to teach you French — from your first <i>bonjour</i> to C2.</p>
              <ul className="text-left mt-8 space-y-3 font-semibold">
                <li>🎯 5-minute lessons with real, practical French</li>
                <li>🧠 Smart revision so words actually stick</li>
                <li>🏆 Quests, streaks and rewards — no leaderboards</li>
                <li>🎓 A real CEFR level, earned through checkpoints</li>
              </ul>
              {accounts && (
                <button className="mt-8 text-sm font-bold underline underline-offset-4 text-ink-soft" onClick={() => setShowLogin(true)}>
                  Already have an account? Log in
                </button>
              )}
              <Sheet open={showLogin} onClose={() => setShowLogin(false)} title="Welcome back">
                <AccountForm initialMode="login" onDone={() => { setShowLogin(false); if (useStore.getState().profile.onboarded) nav('/', { replace: true }); }} />
              </Sheet>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="font-display text-3xl font-bold">Comment tu t'appelles&nbsp;?</h2>
              <p className="text-ink-soft mt-1">What should we call you? (optional)</p>
              <input className="input mt-6 text-xl" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" maxLength={30} />
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="font-display text-3xl font-bold">Your daily goal</h2>
              <p className="text-ink-soft mt-1">Little and often wins. You can change this anytime.</p>
              <div className="grid gap-2.5 mt-6">
                {[[10, '5 min', 'Casual'], [30, '10 min', 'Regular'], [50, '15 min', 'Serious'], [80, '20–30 min', 'Intense']].map(([xp, t, l]) => (
                  <button key={xp} onClick={() => setGoal(xp as number)} className={`tile flex items-center justify-between ${goal === xp ? 'tile-selected' : ''}`}>
                    <span><span className="font-extrabold">{l}</span> <span className="text-ink-soft">· {t} a day</span></span><span className="font-black">{xp} XP</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="font-display text-3xl font-bold">Studying French at school?</h2>
              <p className="text-ink-soft mt-1">We can add Queensland senior (QCE) topics, exam-style practice and assessment prep.</p>
              <div className="grid gap-2.5 mt-6">
                {([[null, 'No, I\'m learning independently'], [11, 'Yes — Year 11'], [12, 'Yes — Year 12']] as const).map(([v, l]) => (
                  <button key={String(v)} onClick={() => setSchool(v)} className={`tile ${school === v ? 'tile-selected' : ''}`}>{l}</button>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="font-display text-3xl font-bold">Create your account</h2>
              <p className="text-ink-soft mt-1">Keep your progress safe and continue on any device. We'll email you a 6-digit code to confirm your address.</p>
              <div className="mt-6">
                <AccountForm defaultName={name} onDone={() => { if (useStore.getState().profile.onboarded) nav('/', { replace: true }); else setStep(5); }} />
              </div>
              <button className="mt-6 w-full text-sm font-bold text-ink-soft underline underline-offset-4" onClick={() => setStep(5)}>Skip for now — keep progress on this device only</button>
            </div>
          )}
          {step === 5 && (
            <div>
              <h2 className="font-display text-3xl font-bold">How much French do you know?</h2>
              <div className="grid gap-3 mt-6">
                <button onClick={() => finish(false)} className="tile p-5">
                  <div className="text-3xl">🌱</div><div className="font-extrabold text-lg mt-1">I'm a complete beginner</div><div className="text-ink-soft text-sm">Start from Unit 1: Bonjour !</div>
                </button>
                <button onClick={() => finish(true)} className="tile p-5">
                  <div className="text-3xl">🧭</div><div className="font-extrabold text-lg mt-1">I know some French</div><div className="text-ink-soft text-sm">Take a 5-minute placement check and skip what you know.</div>
                </button>
              </div>
            </div>
          )}
        </div>
        {step < 4 && (
          <div className="grid gap-2 mt-8">
            <button className="btn-primary" onClick={() => setStep(step === 3 && !accounts ? 5 : step + 1)}>{step === 0 ? 'Commencer' : 'Continue'} <ArrowRight size={18} /></button>
            {step > 0 && <button className="btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Adaptive placement: 6 questions per level, A1 → B2. Stops after the first
 * level scoring below 4/6. Estimate = highest level scoring ≥ 4/6.
 */
export function PlacementPage() {
  const nav = useNavigate();
  const record = useStore((s) => s.recordPlacement);
  const onboarded = useStore((s) => s.profile.onboarded);
  const byLevel = useMemo(() => {
    const m: Partial<Record<CEFR, PlacementQuestion[]>> = {};
    for (const q of placementQuestions) (m[q.level] ??= []).push(q);
    return m;
  }, []);
  const levelsInTest = CEFR_LEVELS.filter((l) => byLevel[l]?.length);
  const [levelIdx, setLevelIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ q: PlacementQuestion; correct: boolean }[]>([]);
  const [result, setResult] = useState<{ estimate: CEFR | null; byLevel: PlacementResult['byLevel'] } | null>(null);

  const level = levelsInTest[levelIdx];
  const qs = byLevel[level] ?? [];
  const q = qs[qIdx];
  const totalPlanned = levelsInTest.reduce((n, l) => n + (byLevel[l]?.length ?? 0), 0);

  const submit = (choice: number | null) => {
    const a = [...answers, { q, correct: choice === q.answer }];
    setAnswers(a);
    setPicked(null);
    if (qIdx + 1 < qs.length) return setQIdx(qIdx + 1);
    const lvlAnswers = a.filter((x) => x.q.level === level);
    const ok = lvlAnswers.filter((x) => x.correct).length >= Math.ceil(lvlAnswers.length * 0.66);
    if (ok && levelIdx + 1 < levelsInTest.length) {
      setLevelIdx(levelIdx + 1);
      setQIdx(0);
      return;
    }
    const tallies: PlacementResult['byLevel'] = {};
    for (const x of a) {
      const t = tallies[x.q.level] ?? { c: 0, t: 0 };
      tallies[x.q.level] = { c: t.c + (x.correct ? 1 : 0), t: t.t + 1 };
    }
    let estimate: CEFR | null = null;
    for (const l of levelsInTest) {
      const t = tallies[l];
      if (t && t.c >= Math.ceil(t.t * 0.66)) estimate = l;
      else break;
    }
    setResult({ estimate, byLevel: tallies });
    if (estimate) fireConfetti();
  };

  const accept = (skip: 'none' | 'basics' | 'all-a1') => {
    const a1 = units.filter((u) => u.level === 'A1');
    const skipUnits = skip === 'all-a1' ? a1.map((u) => u.id) : skip === 'basics' ? a1.slice(0, 3).map((u) => u.id) : [];
    const recommended = units.find((u) => !skipUnits.includes(u.id))?.id ?? units[0].id;
    record(
      { takenAt: dayKey(), estimate: result!.estimate, byLevel: result!.byLevel, recommendedUnit: recommended },
      answers.map((x) => ({ level: x.q.level, skill: x.q.skill, correct: x.correct })),
      skipUnits,
    );
    nav(onboarded ? `/learn/${recommended}` : '/', { replace: true });
  };

  if (result) {
    const a1 = result.byLevel.A1;
    const strongA1 = a1 && a1.c >= a1.t - 1;
    return (
      <div className="min-h-dvh bg-bg pattern-dots grid place-items-center p-5">
        <div className="card max-w-md w-full p-7 text-center animate-pop">
          <div className="label">Your placement estimate</div>
          <div className="font-display text-6xl font-bold mt-2">{result.estimate ?? 'A1'}</div>
          <p className="text-ink-soft mt-2">{result.estimate ? 'Nice! This is an estimate — checkpoints confirm your real level.' : "You're at the start of the journey — the perfect place to begin."}</p>
          <div className="grid grid-cols-4 gap-2 mt-5">
            {levelsInTest.map((l) => {
              const t = result.byLevel[l];
              return <div key={l} className="rounded-2xl bg-surface-2 p-2"><div className="text-xs font-extrabold text-ink-soft">{l}</div><div className="font-black">{t ? `${t.c}/${t.t}` : '—'}</div></div>;
            })}
          </div>
          <div className="grid gap-2 mt-6 text-left">
            {(result.estimate && result.estimate !== 'A1') && (
              <button className="btn-primary" onClick={() => accept('all-a1')}>Skip the A1 lessons</button>
            )}
            {strongA1 && <button className={result.estimate && result.estimate !== 'A1' ? 'btn-ghost' : 'btn-primary'} onClick={() => accept('basics')}>Skip the basics (Units 1–3)</button>}
            <button className="btn-ghost" onClick={() => accept('none')}>Start from Unit 1</button>
          </div>
          <p className="text-xs text-ink-soft mt-4">Skipped lessons are marked as known. You can revisit them or take their checkpoints anytime.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg safe-top">
      <div className="mx-auto max-w-xl px-4 py-5">
        <div className="flex items-center gap-3">
          <ProgressBar value={answers.length / totalPlanned} className="flex-1" color="bg-sun" />
          <span className="chip bg-ink text-bg">{level}</span>
        </div>
        <div className="mt-8 animate-rise" key={q.id}>
          <div className="label mb-2">Placement check · {answers.length + 1}</div>
          {q.audio && <div className="mb-4"><AudioButton text={q.audio} autoPlay /></div>}
          <h2 className="font-display text-2xl font-bold leading-snug whitespace-pre-line">{q.prompt}</h2>
          <div className="grid gap-2.5 mt-6">
            {q.options.map((o, i) => <button key={i} onClick={() => setPicked(i)} className={`tile ${picked === i ? 'tile-selected' : ''}`}>{o}</button>)}
          </div>
          <div className="grid gap-2 mt-6">
            <button className="btn-primary" disabled={picked === null} onClick={() => submit(picked)}>Next</button>
            <button className="btn-ghost" onClick={() => submit(null)}>I don't know</button>
          </div>
        </div>
      </div>
    </div>
  );
}
