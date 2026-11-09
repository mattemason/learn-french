/**
 * Proficiency model — intentionally independent of XP and coins.
 *
 * Evidence only comes from assessments (unit checkpoints, placement check).
 * A skill is considered demonstrated at a level when the learner has at least
 * MIN_ITEMS assessed answers at that level with ≥ PASS accuracy, and all lower
 * levels are demonstrated too. The overall CEFR level is demonstrated when
 * every authored unit checkpoint at that level has been passed.
 */
import { CEFR_LEVELS, type CEFR, type Skill } from '@/content/types';

export type Tally = { c: number; t: number };
export type Evidence = Partial<Record<CEFR, Partial<Record<Skill, Tally>>>>;

export const MIN_ITEMS = 4;
export const PASS = 0.7;
export const CHECKPOINT_PASS = 0.8;

export function addEvidence(ev: Evidence, level: CEFR, skill: Skill, correct: boolean): Evidence {
  const lvl = { ...(ev[level] ?? {}) };
  const t = lvl[skill] ?? { c: 0, t: 0 };
  lvl[skill] = { c: t.c + (correct ? 1 : 0), t: t.t + 1 };
  return { ...ev, [level]: lvl };
}

export interface SkillLevel {
  /** Highest demonstrated level, or null for pre-A1. */
  level: CEFR | null;
  /** Level currently being worked towards. */
  next: CEFR | null;
  /** Accuracy at the next level so far (0–1), if any evidence. */
  nextAccuracy: number | null;
  nextItems: number;
}

export function skillLevel(ev: Evidence, skill: Skill): SkillLevel {
  let level: CEFR | null = null;
  for (const l of CEFR_LEVELS) {
    const t = ev[l]?.[skill];
    if (t && t.t >= MIN_ITEMS && t.c / t.t >= PASS) level = l;
    else {
      return { level, next: l, nextAccuracy: t && t.t ? t.c / t.t : null, nextItems: t?.t ?? 0 };
    }
  }
  return { level, next: null, nextAccuracy: null, nextItems: 0 };
}

export interface LevelStatus {
  level: CEFR;
  authoredUnits: number;
  passedUnits: number;
  demonstrated: boolean;
}

export function levelStatuses(
  unitsByLevel: Record<CEFR, string[]>,
  passedCheckpoints: Set<string>,
): LevelStatus[] {
  let prevOk = true;
  return CEFR_LEVELS.map((level) => {
    const ids = unitsByLevel[level] ?? [];
    const passed = ids.filter((id) => passedCheckpoints.has(id)).length;
    const demonstrated = prevOk && ids.length > 0 && passed === ids.length;
    prevOk = demonstrated;
    return { level, authoredUnits: ids.length, passedUnits: passed, demonstrated };
  });
}

export function demonstratedLevel(statuses: LevelStatus[]): CEFR | null {
  let out: CEFR | null = null;
  for (const s of statuses) if (s.demonstrated) out = s.level;
  return out;
}
