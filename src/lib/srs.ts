/**
 * Spaced repetition (SM-2 variant with four grades).
 *
 * Card ids are namespaced:
 *   v:<vocabId>    vocabulary from lessons
 *   c:<conceptId>  grammar/skill concept (Library article id)
 *   f:<cardId>     learner-created flashcard
 */
import { addDays, dayKey, daysBetween } from './dates';

export type Grade = 0 | 1 | 2 | 3; // again, hard, good, easy
export type CardKind = 'vocab' | 'concept' | 'custom';

export interface SrsCard {
  id: string;
  kind: CardKind;
  ease: number; // 1.3 – 3.0
  interval: number; // days
  reps: number;
  lapses: number;
  due: string; // day key
  added: string;
  lastReviewed?: string;
}

export const MASTERED_INTERVAL = 21;

export function kindOf(id: string): CardKind {
  return id.startsWith('v:') ? 'vocab' : id.startsWith('c:') ? 'concept' : 'custom';
}

export function newCard(id: string, today = dayKey(), dueInDays = 1): SrsCard {
  return { id, kind: kindOf(id), ease: 2.5, interval: 0, reps: 0, lapses: 0, due: addDays(today, dueInDays), added: today };
}

export function review(card: SrsCard, grade: Grade, today = dayKey()): SrsCard {
  let { ease, interval, reps, lapses } = card;
  if (grade === 0) {
    lapses += 1;
    reps = 0;
    interval = 0; // see again today/next session
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    if (reps === 1) interval = grade === 3 ? 3 : grade === 2 ? 1 : 1;
    else if (reps === 2) interval = grade === 3 ? 7 : grade === 2 ? 4 : 2;
    else interval = Math.round(Math.max(1, interval) * (grade === 1 ? 1.2 : grade === 2 ? ease : ease * 1.3));
    ease = Math.min(3, Math.max(1.3, ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0)));
  }
  return { ...card, ease, interval, reps, lapses, due: addDays(today, interval), lastReviewed: today };
}

export function isDue(card: SrsCard, today = dayKey()): boolean {
  return daysBetween(card.due, today) >= 0;
}

export type Strength = 'new' | 'learning' | 'familiar' | 'strong' | 'mastered';

export function strength(card: SrsCard): Strength {
  if (card.reps === 0 && !card.lastReviewed) return 'new';
  if (card.interval >= MASTERED_INTERVAL) return 'mastered';
  if (card.interval >= 7) return 'strong';
  if (card.interval >= 2) return 'familiar';
  return 'learning';
}

/** Concept missed in a lesson: create or pull forward so it is revised soon. */
export function flagWeak(card: SrsCard | undefined, id: string, today = dayKey()): SrsCard {
  const base = card ?? newCard(id, today, 0);
  return { ...base, due: today, interval: 0, reps: 0, ease: Math.max(1.3, base.ease - 0.1) };
}
