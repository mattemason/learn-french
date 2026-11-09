import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { BookOpen, Coins, Layers, Sparkles, Target, Zap } from 'lucide-react';
import { articleById } from '@/content';
import { useStore, type Summary } from '@/state/store';
import { Ring } from './ui';

export function fireConfetti(strong = false) {
  if (document.documentElement.classList.contains('reduce-motion')) return;
  const colors = ['#e93c70', '#26ba84', '#ffb03b', '#60a5fa', '#ffffff'];
  confetti({ particleCount: strong ? 160 : 90, spread: strong ? 100 : 70, origin: { y: 0.6 }, colors, disableForReducedMotion: true });
}

export function Results({ summary, lessonId, onContinue, continueLabel = 'Continue', secondary }: {
  summary: Summary; lessonId?: string; onContinue: () => void; continueLabel?: string; secondary?: React.ReactNode;
}) {
  const generate = useStore((s) => s.generateLessonCards);
  const [made, setMade] = useState<number | null>(null);
  const pct = Math.round(summary.score * 100);
  const good = summary.kind === 'checkpoint' ? summary.passed : summary.score >= 0.7;

  useEffect(() => {
    if (good) fireConfetti(summary.perfect || summary.kind === 'checkpoint');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const heading =
    summary.kind === 'checkpoint'
      ? summary.passed ? 'Checkpoint passed!' : 'Not quite yet'
      : summary.perfect ? 'Sans faute !' : summary.score >= 0.7 ? 'Leçon terminée !' : 'Bien essayé !';
  const sub =
    summary.kind === 'checkpoint'
      ? summary.passed ? 'This counts as evidence of your proficiency.' : 'You need 80% to pass. Review the weak spots below and try again whenever you like.'
      : summary.score >= 0.7 ? 'Progress over perfection — and you made progress.' : "Mistakes are how we learn. We'll bring these back in revision.";

  return (
    <div className="min-h-dvh bg-bg pattern-dots">
      <div className="mx-auto max-w-md px-5 pt-14 pb-12 text-center">
        <div className="animate-pop">
          <Ring value={summary.score} size={148} stroke={12} color={good ? 'rgb(var(--accent))' : 'rgb(var(--sun))'}>
            <div>
              <div className="text-4xl font-black">{pct}%</div>
              <div className="text-xs font-bold text-ink-soft">{summary.correct}/{summary.total} correct</div>
            </div>
          </Ring>
        </div>
        <h1 className="font-display text-4xl font-bold mt-6">{heading}</h1>
        <p className="text-ink-soft mt-2">{sub}</p>

        <div className="grid grid-cols-3 gap-2.5 mt-7">
          <Pill icon={<Zap className="text-sun" size={20} />} label="XP" value={`+${summary.xp}`} />
          <Pill icon={<Coins className="text-sun" size={20} />} label="Coins" value={`+${summary.coins}`} />
          <Pill icon={<Sparkles className="text-primary" size={20} />} label="New words" value={summary.newWords} />
        </div>

        {summary.weakConcepts.length > 0 && (
          <div className="card p-4 mt-5 text-left">
            <div className="flex items-center gap-2 font-extrabold mb-2"><Target size={18} className="text-primary" /> Worth another look</div>
            <p className="text-sm text-ink-soft mb-2">Added to your revision. Read a quick explanation:</p>
            <div className="flex flex-wrap gap-2">
              {summary.weakConcepts.map((c) => (
                <Link key={c} to={`/notebook/library/${c}`} className="chip bg-primary/10 text-primary text-sm py-1.5"><BookOpen size={14} /> {articleById.get(c)?.title ?? c}</Link>
              ))}
            </div>
          </div>
        )}

        {lessonId && (
          <div className="card p-4 mt-3 text-left">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-extrabold flex items-center gap-2"><Layers size={18} /> Flashcards</div>
                <div className="text-sm text-ink-soft">{made === null ? 'Turn this lesson\'s example sentences into a personal deck.' : made ? `${made} cards added to your notebook.` : 'You already have these cards.'}</div>
              </div>
              {made === null && <button className="btn-ghost btn-sm shrink-0" onClick={() => setMade(generate(lessonId))}>Create</button>}
            </div>
          </div>
        )}

        <div className="grid gap-2 mt-7">
          <button className="btn-primary" onClick={onContinue} autoFocus>{continueLabel}</button>
          {secondary}
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="card p-3 animate-rise">
      <div className="flex justify-center">{icon}</div>
      <div className="text-xl font-black mt-1">{value}</div>
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">{label}</div>
    </div>
  );
}
