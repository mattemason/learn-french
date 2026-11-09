/**
 * Content registry. Units are discovered automatically from ./units/*.ts,
 * so adding a new unit file is all that is needed to publish it.
 */
import type { CEFR, Exercise, LibraryArticle, Lesson, Level, Unit, Verb, VocabItem } from './types';
import { levelMeta } from './levels';
import { articles } from './library/articles';
import { verbs } from './library/verbs';

const unitModules = import.meta.glob<{ default: Unit }>('./units/*.ts', { eager: true });

export const units: Unit[] = Object.values(unitModules)
  .map((m) => m.default)
  .sort((a, b) => (a.level === b.level ? a.order - b.order : a.level.localeCompare(b.level)));

export const levels: Level[] = levelMeta.map((meta) => ({
  ...meta,
  units: units.filter((u) => u.level === meta.id),
}));

export const unitById = new Map(units.map((u) => [u.id, u]));
export const lessonById = new Map<string, Lesson>();
export const unitOfLesson = new Map<string, Unit>();
export const vocabById = new Map<string, VocabItem>();

for (const u of units) {
  for (const l of u.lessons) {
    lessonById.set(l.id, l);
    unitOfLesson.set(l.id, u);
  }
  for (const v of u.vocab) vocabById.set(v.id, v);
}

export const allVocab: VocabItem[] = units.flatMap((u) => u.vocab);
export const articleById = new Map<string, LibraryArticle>(articles.map((a) => [a.id, a]));
export const verbByInfinitive = new Map<string, Verb>(verbs.map((v) => [v.infinitive, v]));
export { articles, verbs };

/** Ordered list of every lesson on the main path. */
export const pathLessons: Lesson[] = units.flatMap((u) => u.lessons);

/** All scored exercises in the course that practise a concept (for targeted revision). */
export function exercisesForConcept(concept: string): Exercise[] {
  const out: Exercise[] = [];
  for (const u of units) {
    for (const l of u.lessons) for (const e of l.exercises) if (e.concept === concept && isScored(e)) out.push(e);
  }
  return out;
}

export function isScored(e: Exercise): boolean {
  return e.type !== 'intro' && e.type !== 'vocab-intro' && e.type !== 'write' && e.type !== 'speak';
}

export function levelOfUnit(unitId: string): CEFR | undefined {
  return unitById.get(unitId)?.level;
}

/** French noun with article, e.g. "le frère", "l'école", "la mère". */
export function withArticle(v: VocabItem, kind: 'definite' | 'indefinite' = 'definite'): string {
  if (v.pos !== 'noun' || !v.gender) return v.fr;
  if (kind === 'indefinite') return `${v.gender === 'm' ? 'un' : 'une'} ${v.fr}`;
  if (/^[aeiouyhâàéèêëîïôûùœ]/i.test(v.fr) && !/^h(aric|ibou|amb|amster|and|ock|ors|aut|onte|uit|érisson|éros|asard|all|aie|ache)/i.test(v.fr)) {
    return `l'${v.fr}`;
  }
  return `${v.gender === 'm' ? 'le' : 'la'} ${v.fr}`;
}
