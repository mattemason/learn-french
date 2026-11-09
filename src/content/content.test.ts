/**
 * Content validator — run with `npm run validate:content`.
 * Catches broken references and malformed exercises before they reach learners.
 */
import { describe, expect, it } from 'vitest';
import { articleById, articles, isScored, units, verbs, vocabById } from './index';
import { placementQuestions } from './placement';
import { schoolTopics } from './school';
import type { Exercise } from './types';

function checkExercise(e: Exercise, where: string, errors: string[]) {
  const err = (m: string) => errors.push(`${where} ${e.id} (${e.type}): ${m}`);
  if (e.concept && !articleById.has(e.concept)) err(`unknown concept "${e.concept}"`);
  switch (e.type) {
    case 'vocab-intro':
      e.vocabIds.forEach((id) => !vocabById.has(id) && err(`unknown vocab ${id}`));
      break;
    case 'mcq':
    case 'listen':
      if (e.answer < 0 || e.answer >= e.options.length) err('answer index out of range');
      if (new Set(e.options).size !== e.options.length) err('duplicate options');
      break;
    case 'fill':
      if (e.sentence.split('___').length !== 2) err('needs exactly one ___');
      if (!e.answers.length) err('no answers');
      if (e.bank && !e.bank.some((b) => e.answers.includes(b))) err('bank does not contain an answer');
      break;
    case 'translate':
    case 'dictation':
      if (!e.answers.length) err('no answers');
      break;
    case 'order':
      if (e.words.length < 2) err('too few words');
      break;
    case 'match':
      if (e.pairs.length < 3) err('too few pairs');
      if (new Set(e.pairs.map((p) => p[0])).size !== e.pairs.length || new Set(e.pairs.map((p) => p[1])).size !== e.pairs.length) err('duplicate pair side');
      break;
    case 'conjugate':
      if (e.persons.length !== e.forms.length) err('persons/forms mismatch');
      break;
    case 'reading':
      e.questions.forEach((q, i) => (q.answer < 0 || q.answer >= q.options.length) && err(`question ${i} answer out of range`));
      break;
    case 'dialogue':
      if (!e.lines.some((l) => l.speaker === 'you')) err('no learner turns');
      e.lines.forEach((l, i) => l.speaker === 'you' && !l.answers.length && err(`line ${i} has no answers`));
      break;
    case 'write':
      if (e.detect && e.detect.length !== e.checklist.length) err('detect/checklist length mismatch');
      break;
  }
}

describe('curriculum content', () => {
  it('has A1 units', () => {
    expect(units.filter((u) => u.level === 'A1').length).toBeGreaterThanOrEqual(8);
  });

  it('has unique ids', () => {
    const ids = [...units.map((u) => u.id), ...units.flatMap((u) => u.lessons.map((l) => l.id))];
    expect(new Set(ids).size).toBe(ids.length);
    const vocab = units.flatMap((u) => u.vocab.map((v) => v.id));
    expect(new Set(vocab).size).toBe(vocab.length);
    for (const u of units) for (const l of u.lessons) {
      const ex = l.exercises.map((e) => e.id);
      expect(new Set(ex).size, `${l.id} exercise ids`).toBe(ex.length);
    }
  });

  it('every exercise and reference is valid', () => {
    const errors: string[] = [];
    for (const u of units) {
      for (const v of u.vocab) if (v.pos === 'noun' && !v.gender) errors.push(`${v.id}: noun without gender`);
      for (const l of u.lessons) {
        l.vocab.forEach((id) => !vocabById.has(id) && errors.push(`${l.id}: unknown vocab ${id}`));
        (l.library ?? []).forEach((id) => !articleById.has(id) && errors.push(`${l.id}: unknown library ${id}`));
        l.exercises.forEach((e) => checkExercise(e, l.id, errors));
      }
      u.checkpoint.forEach((e) => checkExercise(e, `${u.id}/checkpoint`, errors));
      if (u.checkpoint.filter(isScored).length < 8) errors.push(`${u.id}: checkpoint too short`);
    }
    expect(errors).toEqual([]);
  });

  it('library cross-references resolve', () => {
    const missing = articles.flatMap((a) => (a.related ?? []).filter((r) => !articleById.has(r)).map((r) => `${a.id} → ${r}`));
    expect(missing).toEqual([]);
  });

  it('verb tables are complete', () => {
    for (const v of verbs) {
      for (const [t, forms] of Object.entries(v.tenses)) {
        expect(forms!.length, `${v.infinitive} ${t}`).toBe(t === 'imperatif' ? 3 : 6);
      }
    }
  });

  it('placement questions are valid', () => {
    for (const q of placementQuestions) expect(q.answer, q.id).toBeLessThan(q.options.length);
  });

  it('school topics link to real units', () => {
    for (const t of schoolTopics) {
      t.linkedUnits.forEach((id) => expect(units.some((u) => u.id === id), `${t.id} → ${id}`).toBe(true));
      for (const task of t.tasks) task.questions?.forEach((q) => q.options && expect(q.answer!, task.id).toBeLessThan(q.options.length));
    }
  });
});
