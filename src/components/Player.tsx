import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Heart, RotateCcw, X, XCircle } from 'lucide-react';
import type { Exercise } from '@/content/types';
import { isScored } from '@/content';
import type { Grade } from '@/lib/srs';
import { useStore, type ExerciseResult } from '@/state/store';
import { ExerciseView } from '@/exercises/Exercises';
import type { Outcome } from '@/exercises/common';
import { AudioButton, Portal, ProgressBar } from './ui';
import { AiTutorButton } from './AiTutor';

export type PlayerItem =
  | { kind: 'ex'; ex: Exercise; cardId?: string; key: string }
  | { kind: 'card'; cardId: string; front: string; back: string; note?: string; audio?: string; key: string };

export interface PlayerResult {
  results: ExerciseResult[];
  grades: { cardId: string; grade: Grade }[];
  seconds: number;
}

interface Props {
  title: string;
  items: PlayerItem[];
  mode: 'lesson' | 'test' | 'review';
  onFinish: (r: PlayerResult) => void;
  exitTo?: string;
}

const baseKey = (key: string) => key.replace(/(:retry)+$/, '');

const PRAISE =['Très bien !', 'Parfait !', 'Bravo !', 'Excellent !', 'Super !', 'Génial !', 'Exactement !'];

export function Player({ title, items, mode, onFinish, exitTo = '/learn' }: Props) {
  const nav = useNavigate();
  const profile = useStore((s) => s.profile);
  const [queue, setQueue] = useState<PlayerItem[]>(items);
  const [idx, setIdx] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const results = useRef<Map<string, ExerciseResult[]>>(new Map());
  const grades = useRef<Map<string, Grade>>(new Map());
  const retried = useRef<Set<string>>(new Set());
  const started = useRef(Date.now());
  const firstCount = items.length;

  const item = queue[idx];
  const done = idx >= queue.length;
  const progress = Math.min(1, results.current.size / Math.max(1, firstCount));

  useEffect(() => {
    if (!done) return;
    const flat = [...results.current.values()].flat();
    onFinish({ results: flat, grades: [...grades.current.entries()].map(([cardId, grade]) => ({ cardId, grade })), seconds: Math.round((Date.now() - started.current) / 1000) });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const record = (o: Outcome) => {
    if (!item || item.kind !== 'ex') return;
    const ex = item.ex;
    const base = baseKey(item.key);
    const firstTry = !results.current.has(base);
    if (firstTry) {
      const skill = ex.skill;
      const scored = o.scored && isScored(ex) || (ex.type === 'speak' && o.scored);
      const parts = o.parts && o.parts.length ? o.parts : [o.correct];
      results.current.set(
        base,
        parts.map((c) => ({ exerciseId: ex.id, type: ex.type, skill, concept: ex.concept, correct: c, scored })),
      );
      if (item.cardId) grades.current.set(item.cardId, o.correct ? 2 : 0);
      // Lessons and reviews bring a missed exercise back once at the end.
      if (!o.correct && o.scored && mode !== 'test' && !retried.current.has(base)) {
        retried.current.add(base);
        setQueue((q) => [...q, { ...item, key: base + ':retry' }]);
      }
    }
    setOutcome(o);
  };

  const next = () => {
    setOutcome(null);
    setCardFlipped(false);
    setIdx((i) => i + 1);
    window.scrollTo({ top: 0 });
  };

  const gradeCard = (g: Grade) => {
    if (!item || item.kind !== 'card') return;
    const base = baseKey(item.key);
    if (!grades.current.has(item.cardId)) {
      grades.current.set(item.cardId, g);
      results.current.set(base, []);
    }
    if (g === 0 && !retried.current.has(base)) {
      retried.current.add(base);
      setQueue((q) => [...q, { ...item, key: base + ':retry' }]);
    }
    next();
  };

  useEffect(() => {
    if (!outcome) return;
    const h = (e: KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), next());
    const t = setTimeout(() => window.addEventListener('keydown', h), 150);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', h);
    };
  }, [outcome]); // eslint-disable-line react-hooks/exhaustive-deps

  // Unscored teaching cards (intro, vocabulary) advance straight away.
  useEffect(() => {
    if (outcome && item?.kind === 'ex' && !outcome.scored && !outcome.note) next();
  }, [outcome]); // eslint-disable-line react-hooks/exhaustive-deps

  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) return <div className="min-h-dvh grid place-items-center text-ink-soft">…</div>;

  const isRetry = item.key.endsWith(':retry');
  const showFeedback = outcome && item.kind === 'ex' && (outcome.scored || outcome.note);

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur safe-top">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button aria-label="Exit" onClick={() => setConfirmExit(true)} className="h-10 w-10 grid place-items-center rounded-xl text-ink-soft hover:bg-surface-2"><X /></button>
          <ProgressBar value={progress} className="flex-1" color={mode === 'test' ? 'bg-sun' : 'bg-accent'} />
          <span className="text-xs font-extrabold text-ink-soft w-12 text-right">{Math.min(results.current.size + (outcome ? 0 : 1), firstCount)}/{firstCount}</span>
        </div>
        <div className="mx-auto max-w-2xl px-4 -mt-1 pb-1 text-xs font-bold text-ink-soft truncate">
          {title}{isRetry && <span className="chip bg-sun/20 text-ink ml-2"><RotateCcw size={12} /> Second try</span>}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4 pb-56">
        {item.kind === 'ex' ? (
          <ExerciseView key={item.key} ex={item.ex} onDone={record} locked={!!outcome} englishAlways={profile.englishHelp === 'always'} autoplay={profile.audioAutoplay} testMode={mode === 'test'} />
        ) : (
          <Flashcard key={item.key} item={item} flipped={cardFlipped} onFlip={() => setCardFlipped(true)} onGrade={gradeCard} />
        )}
      </main>

      {showFeedback && (
        <div className={`fixed inset-x-0 bottom-0 z-40 safe-bottom animate-rise border-t-2 ${outcome.correct ? 'bg-success/15 border-success/40' : 'bg-danger/10 border-danger/40'} backdrop-blur-md`} style={{ backgroundColor: undefined }}>
          <div className="absolute inset-0 bg-bg/85 -z-10" />
          <div className="mx-auto max-w-2xl px-4 py-4">
            <div className="flex items-start gap-3">
              {outcome.correct ? <CheckCircle2 className="text-success shrink-0 mt-0.5" size={28} /> : <XCircle className="text-danger shrink-0 mt-0.5" size={28} />}
              <div className="flex-1 min-w-0">
                <div className={`font-display text-xl font-bold ${outcome.correct ? 'text-success' : 'text-danger'}`}>
                  {outcome.correct ? (outcome.scored ? praise : 'Noted') : 'Pas tout à fait…'}
                </div>
                {!outcome.correct && outcome.expected && (
                  <div className="mt-1 flex items-center gap-2"><span className="text-sm font-bold text-ink-soft">Answer:</span> <span className="font-extrabold">{outcome.expected}</span></div>
                )}
                {outcome.note && <div className="text-sm mt-1 font-semibold">{outcome.note}</div>}
                {!outcome.correct && item.ex.explanation && <div className="text-[15px] mt-2 leading-snug">{item.ex.explanation}</div>}
                {outcome.correct && outcome.scored && item.ex.explanation && mode !== 'test' && (
                  <details className="text-sm mt-1 text-ink-soft"><summary className="cursor-pointer font-bold">Why?</summary>{item.ex.explanation}</details>
                )}
                {!outcome.correct && mode !== 'test' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AiTutorButton mode="explain" label="Explain this (AI)" text={`Exercise: ${JSON.stringify(item.ex).slice(0, 1200)}\nThe correct answer is: ${outcome.expected ?? ''}. Explain why, simply.`} />
                  </div>
                )}
              </div>
            </div>
            <button onClick={next} className={`${outcome.correct ? 'btn-accent' : 'btn-danger'} w-full mt-3`}>Continue</button>
          </div>
        </div>
      )}

      {confirmExit && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-black/40">
          <div className="card p-6 max-w-sm w-full text-center animate-pop">
            <Heart className="mx-auto text-primary mb-2" />
            <h3 className="font-display text-xl font-bold">Leave this session?</h3>
            <p className="text-ink-soft mt-1 text-sm">Progress in this session won't be saved. Even a few more minutes count!</p>
            <div className="grid gap-2 mt-4">
              <button className="btn-primary" onClick={() => setConfirmExit(false)}>Keep going</button>
              <button className="btn-ghost" onClick={() => nav(exitTo)}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Flashcard({ item, flipped, onFlip, onGrade }: { item: Extract<PlayerItem, { kind: 'card' }>; flipped: boolean; onFlip: () => void; onGrade: (g: Grade) => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); onFlip(); }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) onGrade((Number(e.key) - 1) as Grade);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [flipped, onFlip, onGrade]);
  return (
    <div className="animate-rise">
      <div className="label mb-3">Flashcard · recall, then flip</div>
      <button onClick={onFlip} disabled={flipped} className="card w-full min-h-[260px] p-6 grid place-items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-60" />
        <div className="relative">
          <div className="font-display text-3xl font-bold" lang="fr">{item.front}</div>
          {item.audio && <div className="mt-3 flex justify-center" onClick={(e) => e.stopPropagation()}><AudioButton text={item.audio} size="sm" /></div>}
          {flipped ? (
            <div className="mt-5 animate-pop">
              <div className="h-px bg-line w-24 mx-auto mb-4" />
              <div className="text-xl font-extrabold text-primary">{item.back}</div>
              {item.note && <div className="text-sm text-ink-soft mt-2">{item.note}</div>}
            </div>
          ) : (
            <div className="mt-6 text-sm font-bold text-ink-soft">Tap to reveal</div>
          )}
        </div>
      </button>
      {flipped && (
        <Portal>
        <div className="fixed inset-x-0 bottom-0 z-30 bg-bg/95 backdrop-blur border-t border-line safe-bottom">
          <div className="mx-auto max-w-2xl px-4 py-3 grid grid-cols-4 gap-2">
            {([['Again', 'bg-danger text-white'], ['Hard', 'bg-sun text-ink'], ['Good', 'bg-accent text-accent-ink'], ['Easy', 'bg-sky text-white']] as const).map(([l, c], g) => (
              <button key={l} onClick={() => onGrade(g as Grade)} className={`btn ${c} px-2 shadow-[0_4px_0_rgb(0_0_0/0.2)]`}>{l}</button>
            ))}
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
