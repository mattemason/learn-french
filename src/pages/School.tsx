import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, ChevronRight, Eye } from 'lucide-react';
import { schoolAssessments, schoolTopics, schoolUnits } from '@/content/school';
import type { SchoolTask } from '@/content/types';
import { unitById } from '@/content';
import { useStore } from '@/state/store';
import { dayKey, addDays } from '@/lib/dates';
import { AudioButton, Empty, SectionTitle, Toggle } from '@/components/ui';
import { AiTutorButton } from '@/components/AiTutor';

export function SchoolPage() {
  const s = useStore();
  const update = useStore((st) => st.updateProfile);
  const addPlan = useStore((st) => st.addPlan);
  const [added, setAdded] = useState<string | null>(null);
  if (!s.profile.schoolMode) {
    return (
      <div className="animate-rise">
        <h1 className="font-display text-3xl font-bold">School French</h1>
        <div className="card p-4 mt-4">
          <p className="mb-2">Support for Queensland senior French (QCE General, Years 11–12): syllabus topics, exam-style practice and assessment tips, linked to the main course.</p>
          <Toggle label="Turn on school mode" checked={false} onChange={(v) => update({ schoolMode: v })} />
        </div>
      </div>
    );
  }
  const year = s.profile.schoolYear;
  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-bold">School French · QCE</h1>
      <p className="text-ink-soft">Queensland French General senior syllabus (2025). Topics link back to the main course so school and independent learning reinforce each other.</p>

      {schoolUnits.map((u) => (
        <section key={u.id}>
          <SectionTitle action={<span className={`chip ${year === u.year ? 'bg-primary/15 text-primary' : 'bg-surface-2'}`}>Year {u.year}</span>}>{u.unit} · {u.titleFr}</SectionTitle>
          <p className="text-sm text-ink-soft -mt-2 mb-2">{u.title}</p>
          <div className="grid gap-2">
            {schoolTopics.filter((t) => t.unit === u.unit).map((t) => (
              <Link key={t.id} to={`/school/${t.id}`} className="card p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold">{t.titleFr}</div>
                  <div className="text-sm text-ink-soft">{t.title} · {t.tasks.length} practice tasks</div>
                </div>
                <ChevronRight className="text-ink-soft" />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <SectionTitle>Assessment guide</SectionTitle>
      <div className="grid gap-3">
        {schoolAssessments.map((a) => (
          <details key={a.id} className="card p-4">
            <summary className="cursor-pointer font-extrabold flex items-center gap-2"><span className="chip bg-ink text-bg">{a.code}</span> {a.name}</summary>
            <p className="text-sm mt-2">{a.description}</p>
            <ul className="mt-2 space-y-1 text-sm list-disc pl-5">{a.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
            <button className="btn-ghost btn-sm mt-3" onClick={() => { addPlan({ date: addDays(dayKey(), 14), title: `${a.code} — ${a.name}`, kind: 'assessment' }); setAdded(a.id); }}>
              <CalendarPlus size={16} /> {added === a.id ? 'Added — set the date in Planner' : 'Add to planner'}
            </button>
          </details>
        ))}
      </div>
      <p className="text-xs text-ink-soft mt-4">Practice material is original and aligned to the syllabus topics; it isn't official QCAA content. Always check your school's assessment schedule and conditions.</p>
    </div>
  );
}

export function SchoolTopicPage() {
  const { topicId = '' } = useParams();
  const nav = useNavigate();
  const t = schoolTopics.find((x) => x.id === topicId);
  if (!t) return <Empty icon="🎓" title="Topic not found" />;
  return (
    <div className="animate-rise">
      <button onClick={() => nav('/school')} className="flex items-center gap-1 text-sm font-extrabold text-ink-soft mb-3"><ArrowLeft size={16} /> School</button>
      <div className="label">{t.unit}</div>
      <h1 className="font-display text-3xl font-bold">{t.titleFr}</h1>
      <p className="text-ink-soft font-semibold">{t.title}</p>
      <p className="mt-3">{t.description}</p>
      <div className="flex flex-wrap gap-2 mt-3">{t.subtopics.map((x) => <span key={x} className="chip bg-surface-2 py-1.5">{x}</span>)}</div>

      {t.linkedUnits.length > 0 && (
        <>
          <SectionTitle>Build the foundations</SectionTitle>
          <div className="grid gap-2">
            {t.linkedUnits.map((id) => unitById.get(id)).filter(Boolean).map((u) => (
              <Link key={u!.id} to={`/learn/${u!.id}`} className="card p-3 flex items-center gap-3"><span className="text-2xl">{u!.emoji}</span><span className="font-bold flex-1">{u!.level} · {u!.title}</span><ChevronRight className="text-ink-soft" /></Link>
            ))}
          </div>
        </>
      )}

      <SectionTitle>Key vocabulary</SectionTitle>
      <div className="card divide-y divide-line">
        {t.keyVocab.map((v) => (
          <div key={v.fr} className="flex items-center gap-3 px-3 py-2"><AudioButton text={v.fr} size="sm" /><span className="font-bold flex-1" lang="fr">{v.fr}</span><span className="text-sm text-ink-soft text-right">{v.en}</span></div>
        ))}
      </div>

      <SectionTitle>Useful phrases for responses</SectionTitle>
      <div className="card divide-y divide-line">
        {t.usefulPhrases.map((v) => (
          <div key={v.fr} className="px-4 py-2.5"><div className="font-bold" lang="fr">{v.fr}</div><div className="text-sm text-ink-soft">{v.en}</div></div>
        ))}
      </div>

      <SectionTitle>Exam-style practice</SectionTitle>
      <div className="grid gap-4">{t.tasks.map((task) => <TaskCard key={task.id} task={task} />)}</div>
    </div>
  );
}

function TaskCard({ task }: { task: SchoolTask }) {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [reveal, setReveal] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState(false);
  const [draft, setDraft] = useState('');
  const [showModel, setShowModel] = useState(false);
  const icon = { reading: '📖', listening: '🎧', writing: '✍️', speaking: '🗣️', 'short-response': '📝' }[task.kind];
  return (
    <div className="card p-5">
      <div className="label">{icon} {task.kind.replace('-', ' ')}</div>
      <h3 className="font-display text-xl font-bold mt-1">{task.title}</h3>
      <p className="text-sm mt-1">{task.instructions}</p>
      {task.stimulus && (task.kind === 'listening' ? (
        <div className="my-4 flex items-center gap-3"><AudioButton text={task.stimulus} /><span className="text-sm text-ink-soft">Listen up to three times, as in the exam.</span></div>
      ) : (
        <div className="rounded-2xl bg-surface-2 p-4 my-4 text-[16px] leading-relaxed whitespace-pre-line" lang="fr">{task.stimulus}</div>
      ))}
      {task.questions?.map((q, i) => (
        <div key={i} className="mt-4">
          <div className="font-bold">{i + 1}. {q.prompt}</div>
          {q.options ? (
            <div className="grid gap-2 mt-2">
              {q.options.map((o, j) => {
                const st = checked ? (j === q.answer ? 'tile-correct' : picks[i] === j ? 'tile-wrong' : 'opacity-60') : picks[i] === j ? 'tile-selected' : '';
                return <button key={j} disabled={checked} onClick={() => setPicks({ ...picks, [i]: j })} className={`tile py-2.5 text-[15px] ${st}`}>{o}</button>;
              })}
            </div>
          ) : (
            <>
              <textarea rows={2} className="input mt-2 text-[15px]" placeholder="Your answer…" />
              {q.model && <button className="text-sm font-bold text-primary mt-1 flex items-center gap-1" onClick={() => setReveal({ ...reveal, [i]: !reveal[i] })}><Eye size={14} /> {reveal[i] ? 'Hide' : 'Show'} model answer</button>}
              {reveal[i] && <p className="text-sm mt-1 rounded-xl bg-accent/10 p-3">{q.model}</p>}
            </>
          )}
        </div>
      ))}
      {task.questions?.some((q) => q.options) && !checked && <button className="btn-primary btn-sm mt-4" onClick={() => setChecked(true)}>Check answers</button>}
      {task.kind === 'listening' && checked && task.stimulus && <details className="mt-3 text-sm"><summary className="font-bold cursor-pointer">Transcript</summary><p className="mt-2 whitespace-pre-line" lang="fr">{task.stimulus}</p></details>}

      {(task.kind === 'writing' || task.kind === 'speaking') && (
        <>
          {task.criteria && <ul className="mt-3 text-sm list-disc pl-5 space-y-0.5">{task.criteria.map((c) => <li key={c}>{c}</li>)}</ul>}
          {task.kind === 'writing' && (
            <>
              <textarea rows={7} className="input mt-3" lang="fr" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Rédigez votre réponse…" />
              <div className="text-xs font-bold text-ink-soft mt-1">{draft.trim().split(/\s+/).filter(Boolean).length} words</div>
            </>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {task.model && <button className="btn-ghost btn-sm" onClick={() => setShowModel(!showModel)}><Eye size={16} /> {showModel ? 'Hide' : 'Show'} model response</button>}
            {task.kind === 'writing' && <AiTutorButton mode="correct" text={draft} disabled={draft.trim().length < 20} label="Get AI feedback" />}
          </div>
          {showModel && task.model && <div className="rounded-2xl bg-accent/10 p-4 mt-3 text-[15px] leading-relaxed whitespace-pre-line" lang="fr">{task.model}</div>}
        </>
      )}
    </div>
  );
}
