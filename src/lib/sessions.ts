/**
 * Builds revision and practice sessions deterministically from structured
 * content: vocabulary cards become recognition/listening/recall exercises,
 * weak concepts pull real exercises from the course, custom cards become
 * flashcards, and verb drills are generated from the verb tables.
 */
import type { ConjugateExercise, Exercise, Person, Skill, TenseKey, VocabItem } from '@/content/types';
import { exercisesForConcept, isScored, units, unitById, verbs, vocabById, withArticle } from '@/content';
import type { PlayerItem } from '@/components/Player';
import type { LearnerState } from '@/state/store';
import { isUnitUnlocked } from '@/state/store';
import { sample, shuffle } from './rng';

const PERSONS: Person[] = ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'];

function distractors(v: VocabItem, n: number): VocabItem[] {
  const unit = units.find((u) => u.vocab.some((x) => x.id === v.id));
  const pool = (unit?.vocab ?? []).filter((x) => x.id !== v.id && x.en !== v.en && x.pos === v.pos);
  const extra = pool.length >= n ? pool : [...pool, ...units.flatMap((u) => u.vocab).filter((x) => x.id !== v.id && x.en !== v.en)];
  return sample(extra, n);
}

export function vocabExercise(v: VocabItem, reps: number): Exercise {
  const fr = withArticle(v);
  const variant = reps % 4;
  if (variant === 0) {
    const opts = shuffle([v, ...distractors(v, 3)]);
    return { type: 'mcq', id: 'v-' + v.id, skill: 'vocabulary', prompt: `What does « ${fr} » mean?`, audio: fr, options: opts.map((o) => o.en), answer: opts.indexOf(v) };
  }
  if (variant === 1) {
    const opts = shuffle([v, ...distractors(v, 3)]);
    return { type: 'listen', id: 'v-' + v.id, skill: 'listening', audio: v.example?.fr ?? fr, question: v.example ? `Which word did you hear in this sentence?` : 'What did you hear?', options: opts.map((o) => withArticle(o)), answer: opts.indexOf(v), translation: v.example?.en ?? v.en };
  }
  if (variant === 2) {
    const opts = shuffle([v, ...distractors(v, 3)]);
    return { type: 'mcq', id: 'v-' + v.id, skill: 'vocabulary', prompt: `How do you say “${v.en}”?`, options: opts.map((o) => withArticle(o)), answer: opts.indexOf(v) };
  }
  const answers = [fr, v.fr, ...(v.pos === 'noun' && v.gender ? [withArticle(v, 'indefinite')] : [])];
  return { type: 'translate', id: 'v-' + v.id, skill: 'vocabulary', direction: 'en-fr', source: v.en, answers, explanation: v.example ? `Example: ${v.example.fr} — ${v.example.en}` : undefined };
}

export interface ReviewOptions {
  focus?: 'concepts' | 'vocab' | 'custom' | null;
  unitId?: string | null;
  deck?: string | null;
  limit?: number;
}

export function buildReview(s: LearnerState, due: string[], opts: ReviewOptions = {}): PlayerItem[] {
  const limit = opts.limit ?? 20;
  let ids = due;
  if (opts.unitId) {
    const u = unitById.get(opts.unitId);
    ids = (u?.vocab ?? []).map((v) => 'v:' + v.id);
    const concepts = [...new Set(u?.lessons.flatMap((l) => l.library ?? []) ?? [])].map((c) => 'c:' + c);
    ids = [...shuffle(ids).slice(0, 14), ...concepts.slice(0, 4)];
  } else if (opts.deck) {
    ids = Object.values(s.customCards).filter((c) => c.deck === opts.deck).map((c) => 'f:' + c.id);
  } else if (opts.focus === 'concepts') {
    const weak = Object.entries(s.conceptStats).filter(([, v]) => v.wrong > 0).sort((a, b) => a[1].right / (a[1].right + a[1].wrong) - b[1].right / (b[1].right + b[1].wrong)).map(([k]) => 'c:' + k);
    ids = [...new Set([...due.filter((d) => d.startsWith('c:')), ...weak])];
  } else if (opts.focus === 'vocab') ids = due.filter((d) => d.startsWith('v:'));
  else if (opts.focus === 'custom') ids = due.filter((d) => d.startsWith('f:'));

  const items: PlayerItem[] = [];
  for (const id of ids) {
    if (items.length >= limit) break;
    const card = s.srs[id];
    if (id.startsWith('v:')) {
      const v = vocabById.get(id.slice(2));
      if (!v) continue;
      items.push({ kind: 'ex', ex: vocabExercise(v, card?.reps ?? 0), cardId: id, key: id });
    } else if (id.startsWith('c:')) {
      const pool = exercisesForConcept(id.slice(2)).filter((e) => e.type !== 'dialogue' && e.type !== 'reading');
      const picks = sample(pool, 2);
      picks.forEach((ex, i) => items.push({ kind: 'ex', ex, cardId: i === 0 ? id : undefined, key: `${id}#${i}` }));
    } else if (id.startsWith('f:')) {
      const c = s.customCards[id.slice(2)];
      if (!c) continue;
      items.push({ kind: 'card', cardId: id, front: c.front, back: c.back, note: c.note, audio: c.front, key: id });
    }
  }
  return items;
}

/* ---------------- Practice sessions ---------------- */

function unlockedExercises(s: LearnerState, filter: (e: Exercise) => boolean): Exercise[] {
  return units.filter((u) => isUnitUnlocked(s, u.id)).flatMap((u) => u.lessons.filter((l) => s.lessons[l.id] || u.lessons[0].id === l.id).flatMap((l) => l.exercises)).filter((e) => isScored(e) && filter(e));
}

const TENSE_LABEL: Record<TenseKey, string> = {
  present: 'présent', 'passe-compose': 'passé composé', imparfait: 'imparfait', 'futur-simple': 'futur simple', conditionnel: 'conditionnel', subjonctif: 'subjonctif (que…)', imperatif: 'impératif',
};

export function verbDrill(tense: TenseKey = 'present', level: 'A1' | 'A2' | 'B1' | 'any' = 'any', n = 5): Exercise[] {
  const pool = verbs.filter((v) => v.tenses[tense]?.length === (tense === 'imperatif' ? 3 : 6) && (level === 'any' || v.level === level));
  return sample(pool, n).map((v, i): ConjugateExercise => {
    const forms = v.tenses[tense]!;
    const persons = tense === 'imperatif' ? (['tu', 'nous', 'vous'] as Person[]) : PERSONS;
    return { type: 'conjugate', id: `verb-${i}-${v.infinitive}`, skill: 'grammar', verb: v.infinitive, verbEn: v.en, tense: TENSE_LABEL[tense], persons, forms, explanation: v.notes };
  });
}

export function buildPractice(s: LearnerState, kind: string): { title: string; items: PlayerItem[]; conversation?: boolean } {
  const wrap = (exs: Exercise[]) => exs.map((ex, i) => ({ kind: 'ex' as const, ex, key: `${ex.id}-${i}` }));
  if (kind === 'listening') {
    return { title: 'Listening sprint', items: wrap(sample(unlockedExercises(s, (e) => e.type === 'listen' || e.type === 'dictation'), 10)) };
  }
  if (kind === 'mixed') {
    return { title: 'Mixed quiz', items: wrap(sample(unlockedExercises(s, (e) => e.type !== 'dialogue' && e.type !== 'reading'), 12)) };
  }
  if (kind === 'reading') {
    return { title: 'Reading practice', items: wrap(sample(unlockedExercises(s, (e) => e.type === 'reading'), 3)) };
  }
  if (kind.startsWith('verbs')) {
    const tense = (kind.split(':')[1] as TenseKey) || 'present';
    return { title: `Verb drill · ${TENSE_LABEL[tense]}`, items: wrap(verbDrill(tense, 'any', 5)) };
  }
  if (kind.startsWith('skill-')) {
    const skill = kind.slice(6) as Skill;
    return { title: `${skill[0].toUpperCase()}${skill.slice(1)} drill`, items: wrap(sample(unlockedExercises(s, (e) => e.skill === skill && e.type !== 'dialogue'), 10)) };
  }
  if (kind.startsWith('dialogue:')) {
    const [, lessonId, exId] = kind.split(':');
    for (const u of units) for (const l of u.lessons) if (l.id === lessonId) {
      const ex = [...l.exercises, ...u.checkpoint].find((e) => e.id === exId);
      if (ex) return { title: 'Conversation', items: wrap([ex]), conversation: true };
    }
  }
  return { title: 'Practice', items: [] };
}

export function allDialogues() {
  return units.flatMap((u) => u.lessons.flatMap((l) => l.exercises.filter((e) => e.type === 'dialogue').map((e) => ({ unit: u, lesson: l, ex: e as Extract<Exercise, { type: 'dialogue' }> }))));
}
