import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { lessonById, unitById, unitOfLesson, isScored } from '@/content';
import { useStore, nextLesson, type Summary } from '@/state/store';
import { Player, type PlayerItem } from '@/components/Player';
import { Results } from '@/components/Results';

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const nav = useNavigate();
  const lesson = lessonById.get(lessonId);
  const unit = unitOfLesson.get(lessonId);
  const finish = useStore((s) => s.finishLesson);
  const [summary, setSummary] = useState<Summary | null>(null);
  const items = useMemo<PlayerItem[]>(() => (lesson ? lesson.exercises.map((ex) => ({ kind: 'ex', ex, key: ex.id })) : []), [lesson]);

  if (!lesson || !unit) return <NotFound />;
  if (summary) {
    const s = useStore.getState();
    const nl = nextLesson(s);
    const unitDone = unit.lessons.every((l) => s.lessons[l.id]);
    const cpPassed = !!s.checkpoints[unit.id]?.passedAt;
    return (
      <Results summary={summary} lessonId={lesson.id}
        continueLabel={unitDone && !cpPassed ? 'Take the unit checkpoint' : nl ? 'Next lesson' : 'Back to the map'}
        onContinue={() => nav(unitDone && !cpPassed ? `/checkpoint/${unit.id}` : nl ? `/lesson/${nl.lesson.id}` : '/learn', { replace: true })}
        secondary={<Link to="/" className="btn-ghost">Home</Link>} />
    );
  }
  return (
    <Player title={`${unit.title} · ${lesson.title}`} items={items} mode="lesson" exitTo={`/learn/${unit.id}`}
      onFinish={(r) => setSummary(finish(lesson.id, r.results, r.seconds))} />
  );
}

export function CheckpointPage() {
  const { unitId = '' } = useParams();
  const [params] = useSearchParams();
  const testOut = params.get('testout') === '1';
  const nav = useNavigate();
  const unit = unitById.get(unitId);
  const finish = useStore((s) => s.finishCheckpoint);
  const [started, setStarted] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const items = useMemo<PlayerItem[]>(() => (unit ? unit.checkpoint.filter(isScored).map((ex) => ({ kind: 'ex', ex, key: ex.id })) : []), [unit]);

  if (!unit) return <NotFound />;
  if (summary) {
    return (
      <Results summary={summary} onContinue={() => nav(`/learn/${unit.id}`, { replace: true })} continueLabel="Back to unit"
        secondary={!summary.passed ? <button className="btn-ghost" onClick={() => { setSummary(null); setStarted(false); }}>Try again</button> : <Link to="/progress" className="btn-ghost">See my proficiency</Link>} />
    );
  }
  if (!started) {
    return (
      <div className="min-h-dvh bg-bg pattern-dots grid place-items-center p-5">
        <div className="card max-w-md w-full p-7 text-center animate-pop">
          <div className="text-6xl">{unit.emoji}</div>
          <div className="label mt-3">{unit.level} · Unit checkpoint{testOut ? ' · test out' : ''}</div>
          <h1 className="font-display text-3xl font-bold mt-1">{unit.title}</h1>
          <p className="text-ink-soft mt-2">{items.length} questions across every skill in this unit. Score <b>80%</b> to pass.</p>
          <ul className="text-left text-sm mt-4 space-y-1.5 font-semibold">
            <li>🎯 Passing counts as evidence for your CEFR level and skill levels.</li>
            <li>🔁 No second tries within the checkpoint, but you can retake it anytime.</li>
            {testOut && <li>⏭️ Passing marks every lesson in this unit as complete.</li>}
          </ul>
          <div className="grid gap-2 mt-6">
            <button className="btn-primary" onClick={() => setStarted(true)}>Start checkpoint</button>
            <button className="btn-ghost" onClick={() => nav(-1)}>Not now</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Player title={`${unit.title} · checkpoint`} items={items} mode="test" exitTo={`/learn/${unit.id}`}
      onFinish={(r) => setSummary(finish(unit.id, r.results, r.seconds, testOut))} />
  );
}

export function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center p-6 text-center">
      <div><div className="text-5xl">🧭</div><h1 className="font-display text-2xl font-bold mt-2">Page introuvable</h1><Link to="/" className="btn-primary mt-4">Home</Link></div>
    </div>
  );
}
