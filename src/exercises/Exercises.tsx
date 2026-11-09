import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Lightbulb, Mic, Sparkles, X } from 'lucide-react';
import type {
  ConjugateExercise, DialogueExercise, DictationExercise, Exercise, FillExercise, IntroExercise, ListenExercise, MatchExercise,
  McqExercise, OrderExercise, ReadingExercise, SpeakExercise, TranslateExercise, VocabIntroExercise, WriteExercise,
} from '@/content/types';
import { vocabById, withArticle } from '@/content';
import { checkAnswer, checkOrder, containsPhrase, normalize, stripAccents, wordCount } from '@/lib/answer';
import { shuffle } from '@/lib/rng';
import { listenOnce, recognitionSupported } from '@/lib/speech';
import { useStore } from '@/state/store';
import { AudioButton, Portal, RichText } from '@/components/ui';
import { AiTutorButton } from '@/components/AiTutor';
import { AccentBar, CheckBar, EnglishToggle, Prompt, type ExProps } from './common';

/* ---------------- Intro (discovery card) ---------------- */

function Intro({ ex, onDone, locked, englishAlways }: ExProps<IntroExercise>) {
  const [revealed, setRevealed] = useState(!ex.noticeQuestion);
  return (
    <div className="animate-rise">
      <div className="label mb-2">New idea</div>
      <h2 className="font-display text-3xl font-bold mb-4">{ex.title}</h2>
      {ex.examples && (
        <div className="space-y-2 mb-5">
          {ex.examples.map((e, i) => (
            <div key={i} className="card p-3 flex items-start gap-3">
              <AudioButton text={e.fr} size="sm" />
              <div>
                <div className="font-bold text-lg leading-snug">{e.fr}</div>
                <EnglishToggle text={e.en} always={englishAlways} />
              </div>
            </div>
          ))}
        </div>
      )}
      {ex.noticeQuestion && (
        <div className="rounded-3xl bg-sun/15 border-2 border-sun/40 p-4 mb-4">
          <div className="flex items-center gap-2 font-extrabold mb-1"><Lightbulb size={18} /> Spot the pattern</div>
          <p>{ex.noticeQuestion}</p>
          {!revealed && <button className="btn-ghost btn-sm mt-3" onClick={() => setRevealed(true)}>Reveal the rule</button>}
        </div>
      )}
      {revealed && (
        <div className="card p-4 animate-rise">
          <RichText text={ex.body} className="text-[16px] leading-relaxed" />
          {ex.concept && <div className="mt-3"><AiTutorButton mode="explain" text={`Explain: ${ex.title}. ${ex.body}`} label="Explain differently (AI)" /></div>}
        </div>
      )}
      <CheckBar locked={locked} disabled={!revealed} label="Continue" onCheck={() => onDone({ correct: true, scored: false })} />
    </div>
  );
}

/* ---------------- Vocabulary cards ---------------- */

function VocabIntro({ ex, onDone, locked, englishAlways }: ExProps<VocabIntroExercise>) {
  const saved = useStore((s) => s.saved);
  const toggle = useStore((s) => s.toggleSaved);
  const items = ex.vocabIds.map((id) => vocabById.get(id)).filter(Boolean);
  return (
    <div className="animate-rise">
      <Prompt kicker="New words">Tap to listen, save the ones you like.</Prompt>
      <div className="grid gap-2.5">
        {items.map((v) => (
          <div key={v!.id} className="card p-3.5 flex items-center gap-3">
            <AudioButton text={withArticle(v!)} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-lg">
                {withArticle(v!)}
                {v!.gender && <span className={`chip ml-2 align-middle ${v!.gender === 'm' ? 'bg-sky/15 text-sky' : 'bg-primary/15 text-primary'}`}>{v!.gender === 'm' ? 'masc.' : 'fém.'}</span>}
              </div>
              <div className="text-ink-soft font-semibold">{v!.en}</div>
              {v!.example && (
                <div className="text-sm mt-1"><span className="italic">{v!.example.fr}</span><EnglishToggle text={v!.example.en} always={englishAlways} /></div>
              )}
            </div>
            <button aria-label={saved.includes(v!.id) ? 'Remove from notebook' : 'Save to notebook'} onClick={() => toggle(v!.id)}
              className={`h-10 w-10 grid place-items-center rounded-xl ${saved.includes(v!.id) ? 'bg-primary text-primary-ink' : 'bg-surface-2 text-ink-soft'}`}>
              {saved.includes(v!.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>
        ))}
      </div>
      <CheckBar locked={locked} label="Got it" onCheck={() => onDone({ correct: true, scored: false })} />
    </div>
  );
}

/* ---------------- Multiple choice & listening ---------------- */

function Options({ options, picked, setPicked, locked, answer }: { options: string[]; picked: number | null; setPicked: (i: number) => void; locked: boolean; answer: number }) {
  return (
    <div className="grid gap-2.5">
      {options.map((o, i) => {
        const state = locked ? (i === answer ? 'tile-correct' : i === picked ? 'tile-wrong' : 'opacity-60') : picked === i ? 'tile-selected' : '';
        return (
          <button key={i} disabled={locked} onClick={() => setPicked(i)} className={`tile flex items-center gap-3 ${state}`}>
            <span className="h-7 w-7 shrink-0 rounded-lg border-2 border-line grid place-items-center text-xs font-black text-ink-soft">{i + 1}</span>
            <span className="text-[17px]">{o}</span>
          </button>
        );
      })}
    </div>
  );
}

function useNumberKeys(n: number, setPicked: (i: number) => void, locked: boolean) {
  useEffect(() => {
    if (locked) return;
    const h = (e: KeyboardEvent) => {
      const k = Number(e.key);
      if (k >= 1 && k <= n && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) setPicked(k - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [n, setPicked, locked]);
}

function Mcq({ ex, onDone, locked, englishAlways, autoplay }: ExProps<McqExercise>) {
  const [picked, setPicked] = useState<number | null>(null);
  useNumberKeys(ex.options.length, setPicked, locked);
  return (
    <div className="animate-rise">
      <div className="label mb-2">Choose the right answer</div>
      <div className="flex items-start gap-3 mb-1">
        {ex.audio && <AudioButton text={ex.audio} autoPlay={autoplay} />}
        <h2 className="font-display text-2xl font-bold leading-snug">{ex.prompt}</h2>
      </div>
      <div className="mb-5"><EnglishToggle text={ex.translation} always={englishAlways} /></div>
      <Options options={ex.options} picked={picked} setPicked={setPicked} locked={locked} answer={ex.answer} />
      <CheckBar locked={locked} disabled={picked === null} onCheck={() => onDone({ correct: picked === ex.answer, scored: true, expected: ex.options[ex.answer] })} />
    </div>
  );
}

function Listen({ ex, onDone, locked, englishAlways, autoplay }: ExProps<ListenExercise>) {
  const [picked, setPicked] = useState<number | null>(null);
  useNumberKeys(ex.options.length, setPicked, locked);
  return (
    <div className="animate-rise">
      <div className="label mb-3">Listen carefully</div>
      <div className="flex justify-center my-4"><AudioButton text={ex.audio} size="lg" autoPlay={autoplay} /></div>
      <h2 className="font-display text-2xl font-bold mb-5 text-center">{ex.question}</h2>
      <Options options={ex.options} picked={picked} setPicked={setPicked} locked={locked} answer={ex.answer} />
      {locked && (
        <div className="card p-3 mt-4">
          <div className="label mb-1">Transcript</div>
          <div className="font-semibold">{ex.audio}</div>
          <EnglishToggle text={ex.translation} always={englishAlways} />
        </div>
      )}
      <CheckBar locked={locked} disabled={picked === null} onCheck={() => onDone({ correct: picked === ex.answer, scored: true, expected: ex.options[ex.answer] })} />
    </div>
  );
}

/* ---------------- Matching ---------------- */

function Match({ ex, onDone, locked }: ExProps<MatchExercise>) {
  const left = useMemo(() => shuffle(ex.pairs.map((p) => p[0])), [ex]);
  const right = useMemo(() => shuffle(ex.pairs.map((p) => p[1])), [ex]);
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<[string, string] | null>(null);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (selL === null || selR === null) return;
    const ok = ex.pairs.some(([f, e]) => f === selL && e === selR);
    if (ok) {
      const next = [...matched, selL];
      setMatched(next);
      setSelL(null);
      setSelR(null);
      if (next.length === ex.pairs.length) setTimeout(() => onDone({ correct: mistakes === 0, scored: true, note: mistakes ? `${mistakes} mismatch${mistakes > 1 ? 'es' : ''} along the way.` : undefined }), 350);
    } else {
      setWrong([selL, selR]);
      setMistakes((m) => m + 1);
      setTimeout(() => {
        setWrong(null);
        setSelL(null);
        setSelR(null);
      }, 500);
    }
  }, [selL, selR]); // eslint-disable-line react-hooks/exhaustive-deps

  const enMatched = (e: string) => ex.pairs.some(([f, en]) => en === e && matched.includes(f));
  const cls = (sel: boolean, done: boolean, isWrong: boolean) =>
    `tile text-center min-h-[56px] ${done ? 'tile-correct opacity-50' : isWrong ? 'tile-wrong animate-shake' : sel ? 'tile-selected' : ''}`;

  return (
    <div className="animate-rise">
      <Prompt kicker="Match the pairs">Tap a French word, then its meaning.</Prompt>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="grid gap-2.5">
          {left.map((f) => (
            <button key={f} disabled={locked || matched.includes(f)} className={cls(selL === f, matched.includes(f), wrong?.[0] === f)} onClick={() => setSelL(f)}>{f}</button>
          ))}
        </div>
        <div className="grid gap-2.5">
          {right.map((e) => (
            <button key={e} disabled={locked || enMatched(e)} className={cls(selR === e, enMatched(e), wrong?.[1] === e)} onClick={() => setSelR(e)}>{e}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Typed answers ---------------- */

function useTyped() {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus({ preventScroll: true }), 300);
    return () => clearTimeout(t);
  }, []);
  return { value, setValue, ref };
}

function typedOutcome(input: string, answers: string[]) {
  const r = checkAnswer(input, answers);
  return {
    correct: r.correct,
    scored: true,
    expected: r.expected,
    note: r.accentSlip ? `Accepted — but watch the accents: ${r.expected}` : r.typo ? `Accepted — small typo. Correct spelling: ${r.expected}` : undefined,
  };
}

function Fill({ ex, onDone, locked, englishAlways }: ExProps<FillExercise>) {
  const { value, setValue, ref } = useTyped();
  const [before, after] = ex.sentence.split('___');
  const submit = () => value.trim() && onDone(typedOutcome(value, ex.answers));
  return (
    <div className="animate-rise">
      <div className="label mb-2">Fill in the gap {ex.hint && <span className="normal-case tracking-normal font-bold text-primary ml-1">{ex.hint}</span>}</div>
      <div className="font-display text-2xl font-bold leading-[2.4rem] mb-1">
        {before}
        {ex.bank ? (
          <span className={`inline-block min-w-24 border-b-4 px-2 mx-1 ${value ? 'border-primary text-primary' : 'border-line text-ink-soft'}`}>{value || ' '}</span>
        ) : (
          <input ref={ref} value={value} disabled={locked} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Your answer"
            className="inline-block w-40 max-w-full mx-1 px-2 py-0 rounded-xl border-2 border-primary/60 bg-primary/5 text-primary font-sans font-extrabold text-xl outline-none focus:border-primary" />
        )}
        {after}
      </div>
      <EnglishToggle text={ex.translation} always={englishAlways} />
      {ex.bank ? (
        <div className="flex flex-wrap gap-2 mt-6">
          {ex.bank.map((w) => (
            <button key={w} disabled={locked} onClick={() => setValue(w)} className={`tile py-2 ${value === w ? 'tile-selected' : ''}`}>{w}</button>
          ))}
        </div>
      ) : (
        !locked && <div className="mt-4"><AccentBar target={ref} value={value} onChange={setValue} /></div>
      )}
      <CheckBar locked={locked} disabled={!value.trim()} onCheck={submit} />
    </div>
  );
}

function Translate({ ex, onDone, locked }: ExProps<TranslateExercise>) {
  const { value, setValue, ref } = useTyped();
  const toFr = ex.direction === 'en-fr';
  const submit = () => value.trim() && onDone(typedOutcome(value, ex.answers));
  return (
    <div className="animate-rise">
      <div className="label mb-2">{toFr ? 'Write this in French' : 'What does this mean in English?'}</div>
      <div className="flex items-start gap-3 mb-5">
        {!toFr && <AudioButton text={ex.source} size="sm" />}
        <h2 className="font-display text-2xl font-bold leading-snug">{ex.source}</h2>
      </div>
      <textarea ref={ref} rows={3} value={value} disabled={locked} onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
        autoCapitalize="sentences" autoCorrect="off" spellCheck={false} lang={toFr ? 'fr' : 'en'}
        placeholder={toFr ? 'Type in French…' : 'Type in English…'} className="input resize-none" />
      {toFr && !locked && <AccentBar target={ref} value={value} onChange={setValue} />}
      <CheckBar locked={locked} disabled={!value.trim()} onCheck={submit} />
    </div>
  );
}

function Dictation({ ex, onDone, locked, englishAlways, autoplay }: ExProps<DictationExercise>) {
  const { value, setValue, ref } = useTyped();
  const submit = () => value.trim() && onDone(typedOutcome(value, ex.answers));
  return (
    <div className="animate-rise">
      <div className="label mb-3">Type what you hear</div>
      <div className="flex justify-center my-4"><AudioButton text={ex.audio} size="lg" autoPlay={autoplay} /></div>
      <input ref={ref} value={value} disabled={locked} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()}
        autoCapitalize="off" autoCorrect="off" spellCheck={false} lang="fr" placeholder="Écrivez ici…" className="input" />
      {!locked && <AccentBar target={ref} value={value} onChange={setValue} />}
      {locked && <EnglishToggle text={ex.translation} always={englishAlways} />}
      <CheckBar locked={locked} disabled={!value.trim()} onCheck={submit} />
    </div>
  );
}

/* ---------------- Word order ---------------- */

function Order({ ex, onDone, locked }: ExProps<OrderExercise>) {
  const tiles = useMemo(() => shuffle([...ex.words, ...(ex.distractors ?? [])].map((w, i) => ({ w, i }))), [ex]);
  const [built, setBuilt] = useState<number[]>([]);
  const words = built.map((i) => tiles.find((t) => t.i === i)!.w);
  return (
    <div className="animate-rise">
      <Prompt kicker="Build the sentence">{ex.translation}</Prompt>
      <div className="min-h-[72px] rounded-2xl border-2 border-dashed border-line p-2 flex flex-wrap gap-2 mb-5">
        {built.map((i) => (
          <button key={i} disabled={locked} onClick={() => setBuilt(built.filter((b) => b !== i))} className="tile py-2 px-3 animate-pop">{tiles.find((t) => t.i === i)!.w}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {tiles.map((t) => (
          <button key={t.i} disabled={locked || built.includes(t.i)} onClick={() => setBuilt([...built, t.i])}
            className={`tile py-2 px-3 ${built.includes(t.i) ? 'opacity-0 pointer-events-none' : ''}`}>{t.w}</button>
        ))}
      </div>
      <CheckBar locked={locked} disabled={!built.length} onCheck={() => onDone({ correct: checkOrder(words, ex.words, ex.alternatives), scored: true, expected: ex.words.join(' ') })} />
    </div>
  );
}

/* ---------------- Conjugation table ---------------- */

function pronounFor(p: string, form: string) {
  if (p === 'je' && /^[aeiouhéèêâîôûœy]/i.test(form)) return "j'";
  return p;
}

function Conjugate({ ex, onDone, locked }: ExProps<ConjugateExercise>) {
  const [vals, setVals] = useState<string[]>(ex.persons.map(() => ''));
  const [marks, setMarks] = useState<boolean[] | null>(null);
  const [focus, setFocus] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const activeRef = { get current() { return refs.current[focus]; } } as React.RefObject<HTMLInputElement>;
  const check = () => {
    const m = ex.forms.map((f, i) => checkAnswer(vals[i], [f]).correct);
    setMarks(m);
    onDone({ correct: m.every(Boolean), scored: true, parts: m, expected: ex.persons.map((p, i) => `${pronounFor(p, ex.forms[i])} ${ex.forms[i]}`).join(' · ') });
  };
  return (
    <div className="animate-rise">
      <Prompt kicker={`Conjugate · ${ex.tense}`}>
        {ex.verb} <span className="text-ink-soft text-lg font-sans font-semibold">({ex.verbEn})</span>
      </Prompt>
      <div className="card divide-y divide-line overflow-hidden">
        {ex.persons.map((p, i) => (
          <label key={p} className={`flex items-center gap-3 px-4 py-2.5 ${marks ? (marks[i] ? 'bg-success/10' : 'bg-danger/10') : ''}`}>
            <span className="w-24 shrink-0 font-bold text-ink-soft">{p === 'je' ? 'je / j\'' : p}</span>
            <input ref={(el) => { refs.current[i] = el; }} value={vals[i]} disabled={locked} onFocus={() => setFocus(i)}
              onChange={(e) => setVals(vals.map((v, j) => (j === i ? e.target.value : v)))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); i < ex.persons.length - 1 ? refs.current[i + 1]?.focus() : check(); } }}
              autoCapitalize="off" autoCorrect="off" spellCheck={false} lang="fr" aria-label={`${ex.verb}, ${p}`}
              className="flex-1 min-w-0 bg-transparent outline-none text-lg font-extrabold py-1" />
            {marks && (marks[i] ? <Check className="text-success" size={20} /> : <span className="text-danger font-bold text-sm">{ex.forms[i]}</span>)}
          </label>
        ))}
      </div>
      {!locked && <AccentBar target={activeRef} value={vals[focus]} onChange={(v) => setVals(vals.map((x, j) => (j === focus ? v : x)))} />}
      <CheckBar locked={locked} disabled={vals.some((v) => !v.trim())} onCheck={check} />
    </div>
  );
}

/* ---------------- Reading ---------------- */

function Reading({ ex, onDone, locked, englishAlways }: ExProps<ReadingExercise>) {
  const [picks, setPicks] = useState<(number | null)[]>(ex.questions.map(() => null));
  return (
    <div className="animate-rise">
      <div className="label mb-2">Read and answer</div>
      <article className="card p-5 mb-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-sun to-accent" />
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="font-display text-xl font-bold">{ex.title}</h3>
          <AudioButton text={ex.text.replace(/\n+/g, ' ')} size="sm" />
        </div>
        {ex.text.split(/\n\n+/).map((p, i) => <p key={i} className="text-[17px] leading-relaxed mb-2" lang="fr">{p}</p>)}
        <EnglishToggle text={ex.translation} always={englishAlways} />
      </article>
      <div className="space-y-5">
        {ex.questions.map((q, qi) => (
          <div key={qi}>
            <div className="font-bold mb-2">{qi + 1}. {q.prompt}</div>
            <Options options={q.options} picked={picks[qi]} setPicked={(i) => setPicks(picks.map((p, j) => (j === qi ? i : p)))} locked={locked} answer={q.answer} />
          </div>
        ))}
      </div>
      <CheckBar locked={locked} disabled={picks.some((p) => p === null)} onCheck={() => {
        const parts = ex.questions.map((q, i) => picks[i] === q.answer);
        onDone({ correct: parts.every(Boolean), scored: true, parts, note: `${parts.filter(Boolean).length}/${parts.length} questions correct.` });
      }} />
    </div>
  );
}

/* ---------------- Dialogue ---------------- */

function Dialogue({ ex, onDone, locked, englishAlways, autoplay }: ExProps<DialogueExercise>) {
  const [step, setStep] = useState(0);
  const [replies, setReplies] = useState<{ text: string; ok: boolean; note?: string }[]>([]);
  const { value, setValue, ref } = useTyped();
  const bottom = useRef<HTMLDivElement>(null);
  const youIdx = ex.lines.map((l, i) => (l.speaker === 'you' ? i : -1)).filter((i) => i >= 0);

  // Auto-advance through NPC lines.
  useEffect(() => {
    const line = ex.lines[step];
    if (!line) {
      const parts = replies.map((r) => r.ok);
      onDone({ correct: parts.every(Boolean), scored: true, parts, note: `${parts.filter(Boolean).length}/${parts.length} replies on target.` });
      return;
    }
    if (line.speaker === 'npc') {
      if (autoplay) import('@/lib/speech').then((m) => m.speak(line.fr));
      const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 500 : 1100);
      return () => clearTimeout(t);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), [step, replies.length]);

  const current = ex.lines[step];
  const send = () => {
    if (!current || current.speaker !== 'you' || !value.trim()) return;
    const r = checkAnswer(value, current.answers);
    setReplies([...replies, { text: value, ok: r.correct, note: r.correct ? (r.accentSlip ? 'Watch the accents.' : undefined) : `You could say: ${current.model}` }]);
    setValue('');
    setStep(step + 1);
  };

  let replyNo = 0;
  return (
    <div className="animate-rise pb-40">
      <div className="label mb-1">Conversation · {ex.setting}</div>
      <h2 className="font-display text-2xl font-bold mb-4">{ex.scenario}</h2>
      <div className="space-y-3">
        {ex.lines.slice(0, step + (current?.speaker === 'npc' ? 1 : 0)).map((l, i) => {
          if (l.speaker === 'npc') {
            return (
              <div key={i} className="flex gap-2 items-end animate-rise">
                <div className="h-9 w-9 shrink-0 rounded-full bg-accent/20 grid place-items-center font-black text-accent text-sm">{l.name[0]}</div>
                <div className="max-w-[80%] rounded-3xl rounded-bl-md bg-surface border border-line px-4 py-2.5">
                  <div className="text-xs font-extrabold text-ink-soft">{l.name}</div>
                  <div className="text-[17px] font-semibold" lang="fr">{l.fr}</div>
                  <EnglishToggle text={l.en} always={englishAlways} />
                </div>
                <AudioButton text={l.fr} size="sm" />
              </div>
            );
          }
          const r = replies[youIdx.indexOf(i)];
          replyNo++;
          if (!r) return null;
          return (
            <div key={i} className="flex flex-col items-end animate-rise">
              <div className={`max-w-[80%] rounded-3xl rounded-br-md px-4 py-2.5 text-[17px] font-semibold ${r.ok ? 'bg-primary text-primary-ink' : 'bg-danger/15 text-ink border border-danger/40'}`}>{r.text}</div>
              {r.note && <div className="text-sm text-ink-soft mt-1 max-w-[80%] text-right">{r.note}</div>}
            </div>
          );
        })}
        <div ref={bottom} />
      </div>
      {!locked && current?.speaker === 'you' && (
        <Portal>
        <div className="fixed inset-x-0 bottom-0 z-30 bg-bg/95 backdrop-blur border-t border-line safe-bottom">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <div className="text-sm font-bold mb-2"><span className="chip bg-sun/20 mr-1">Your turn {replyNo + 1}/{youIdx.length}</span> {current.goal}</div>
            {current.bank && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {current.bank.map((w) => <button key={w} onClick={() => setValue((v) => (v ? v + ' ' : '') + w)} className="chip bg-surface-2 text-sm py-1.5">{w}</button>)}
              </div>
            )}
            <div className="flex gap-2">
              <input ref={ref} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} lang="fr"
                autoCapitalize="sentences" autoCorrect="off" spellCheck={false} placeholder="Répondez en français…" className="input py-2.5" />
              <button className="btn-primary px-4" disabled={!value.trim()} onClick={send}>Send</button>
            </div>
            <AccentBar target={ref} value={value} onChange={setValue} />
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}

/* ---------------- Writing ---------------- */

function Write({ ex, onDone, locked, englishAlways }: ExProps<WriteExercise>) {
  const { value, setValue, ref } = useTyped();
  const [manual, setManual] = useState<boolean[]>(ex.checklist.map(() => false));
  const [showModel, setShowModel] = useState(false);
  const words = wordCount(value);
  const auto = ex.checklist.map((_, i) => !!ex.detect?.[i] && ex.detect[i].split('|').some((d) => containsPhrase(value, d)));
  const ticks = ex.checklist.map((_, i) => auto[i] || manual[i]);
  return (
    <div className="animate-rise">
      <div className="label mb-2">Writing task</div>
      <h2 className="font-display text-2xl font-bold leading-snug mb-4">{ex.prompt}</h2>
      <textarea ref={ref} rows={6} value={value} disabled={locked} onChange={(e) => setValue(e.target.value)} lang="fr"
        autoCapitalize="sentences" spellCheck={false} placeholder="Écrivez votre texte ici…" className="input resize-y" />
      <div className="flex justify-between items-center text-sm font-bold text-ink-soft mt-1">
        <span className={words >= ex.minWords ? 'text-success' : ''}>{words} / {ex.minWords}+ words</span>
      </div>
      {!locked && <AccentBar target={ref} value={value} onChange={setValue} />}
      <div className="card p-4 mt-4">
        <div className="label mb-2">Checklist</div>
        {ex.checklist.map((c, i) => (
          <button key={i} onClick={() => !auto[i] && setManual(manual.map((m, j) => (j === i ? !m : m)))} className="flex items-center gap-3 py-1.5 text-left w-full">
            <span className={`h-6 w-6 shrink-0 rounded-lg grid place-items-center border-2 ${ticks[i] ? 'bg-success border-success text-white' : 'border-line'}`}>{ticks[i] && <Check size={14} />}</span>
            <span className="font-semibold">{c}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <button className="btn-ghost btn-sm" onClick={() => setShowModel(!showModel)}><Sparkles size={16} /> {showModel ? 'Hide' : 'Show'} model answer</button>
        <AiTutorButton mode="correct" text={value} disabled={words < 3} label="Correct my French (AI)" />
      </div>
      {showModel && (
        <div className="card p-4 mt-3 animate-rise">
          <p className="font-semibold leading-relaxed" lang="fr">{ex.model}</p>
          <EnglishToggle text={ex.modelEn} always={englishAlways} />
        </div>
      )}
      <CheckBar locked={locked} disabled={words < Math.min(ex.minWords, 3)} label="I'm done" onCheck={() => onDone({ correct: true, scored: false, note: 'Writing is self-assessed — compare with the model answer.' })} />
    </div>
  );
}

/* ---------------- Speaking ---------------- */

function similarity(a: string, b: string) {
  const ta = stripAccents(normalize(a)).split(' ');
  const tb = new Set(stripAccents(normalize(b)).split(' '));
  if (!ta.length) return 0;
  return ta.filter((t) => tb.has(t)).length / Math.max(ta.length, tb.size);
}

function Speak({ ex, onDone, locked, englishAlways, autoplay }: ExProps<SpeakExercise>) {
  const [heard, setHeard] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const canRecognise = recognitionSupported();
  const start = () => {
    setErr(null);
    setListening(true);
    listenOnce(
      (alts) => {
        setListening(false);
        const best = alts.reduce((b, a) => (similarity(ex.text, a) > similarity(ex.text, b) ? a : b), alts[0] ?? '');
        setHeard(best);
        const score = similarity(ex.text, best);
        onDone({ correct: score >= 0.7, scored: true, expected: ex.text, note: score >= 0.7 ? `Heard: “${best}”` : `Heard: “${best}”. Listen again and focus on each sound.` });
      },
      (m) => { setListening(false); setErr(m); },
    );
  };
  return (
    <div className="animate-rise text-center">
      <div className="label mb-3">Say it out loud</div>
      <h2 className="font-display text-3xl font-bold leading-snug mb-1" lang="fr">{ex.text}</h2>
      <EnglishToggle text={ex.en} always={englishAlways} />
      <div className="flex justify-center my-6"><AudioButton text={ex.text} autoPlay={autoplay} /></div>
      {canRecognise && !locked && (
        <button onClick={start} className={`mx-auto h-24 w-24 rounded-full grid place-items-center text-white shadow-[0_6px_0_rgb(0_0_0/0.2)] active:translate-y-1 ${listening ? 'bg-danger animate-pulse' : 'bg-primary'}`} aria-label="Start speaking">
          <Mic size={40} />
        </button>
      )}
      {heard && <p className="mt-4 text-ink-soft">You said: <span className="font-bold text-ink">{heard}</span></p>}
      {err && <p className="mt-3 text-danger font-semibold">{err}</p>}
      {!locked && (
        <div className="mt-6">
          <p className="text-sm text-ink-soft mb-2">{canRecognise ? 'No microphone? Rate yourself instead:' : 'Repeat after the audio, then rate yourself:'}</p>
          <div className="flex gap-2 justify-center">
            <button className="btn-ghost btn-sm" onClick={() => onDone({ correct: true, scored: false, note: 'Self-rated. Keep practising aloud!' })}>😕 Tricky</button>
            <button className="btn-ghost btn-sm" onClick={() => onDone({ correct: true, scored: false, note: 'Self-rated. Très bien !' })}>🙂 I said it well</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Dispatcher ---------------- */

export function ExerciseView(props: ExProps<Exercise>) {
  const { ex } = props;
  switch (ex.type) {
    case 'intro': return <Intro {...props} ex={ex} />;
    case 'vocab-intro': return <VocabIntro {...props} ex={ex} />;
    case 'mcq': return <Mcq {...props} ex={ex} />;
    case 'listen': return <Listen {...props} ex={ex} />;
    case 'match': return <Match {...props} ex={ex} />;
    case 'fill': return <Fill {...props} ex={ex} />;
    case 'translate': return <Translate {...props} ex={ex} />;
    case 'dictation': return <Dictation {...props} ex={ex} />;
    case 'order': return <Order {...props} ex={ex} />;
    case 'conjugate': return <Conjugate {...props} ex={ex} />;
    case 'reading': return <Reading {...props} ex={ex} />;
    case 'dialogue': return <Dialogue {...props} ex={ex} />;
    case 'write': return <Write {...props} ex={ex} />;
    case 'speak': return <Speak {...props} ex={ex} />;
    default: return <div className="card p-4"><X /> Unsupported exercise</div>;
  }
}
