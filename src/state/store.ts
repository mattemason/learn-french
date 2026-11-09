/**
 * Learner state. Persisted locally (localStorage) and, when signed in,
 * synced to the app server (see src/sync/cloud.ts). All rules are deterministic.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CEFR, Skill } from '@/content/types';
import { lessonById, unitById, unitOfLesson, units, vocabById, withArticle } from '@/content';
import { addDays, dayKey, daysBetween, weekDays, weekKey } from '@/lib/dates';
import { flagWeak, newCard, review, strength, type Grade, type SrsCard } from '@/lib/srs';
import {
  achievements, allQuests, dailyQuestsFor, emptyDay, levelFromXp, lessonRewards, MAX_FREEZES, reviewRewards,
  shopById, weeklyQuestsFor, type AchievementStats, type DayActivity, type QuestDef,
} from '@/lib/game';
import { addEvidence, CHECKPOINT_PASS, demonstratedLevel, levelStatuses, type Evidence } from '@/lib/proficiency';

export interface ExerciseResult {
  exerciseId: string;
  type: string;
  skill?: Skill;
  concept?: string;
  correct: boolean;
  scored: boolean;
}

export interface Celebration {
  id: string;
  kind: 'achievement' | 'level-up' | 'streak' | 'streak-saved' | 'cefr' | 'info';
  title: string;
  detail?: string;
  icon?: string;
}

export interface CustomCard {
  id: string;
  front: string;
  back: string;
  note?: string;
  deck: string;
  createdAt: string;
}

export interface PlanItem {
  id: string;
  date: string;
  title: string;
  kind: 'study' | 'assessment';
  done: boolean;
  notes?: string;
}

export interface PlacementResult {
  takenAt: string;
  estimate: CEFR | null;
  byLevel: Partial<Record<CEFR, { c: number; t: number }>>;
  recommendedUnit: string;
}

export interface Profile {
  name: string;
  onboarded: boolean;
  createdAt: string;
  dailyGoalXp: number;
  minutesPerDay: number;
  schoolMode: boolean;
  schoolYear: 11 | 12 | null;
  themeId: string;
  avatarId: string;
  frameId: string;
  englishHelp: 'on-request' | 'always';
  audioAutoplay: boolean;
  reminders: { enabled: boolean; time: string };
  aiEnabled: boolean;
  reducedMotion: boolean;
}

export interface Summary {
  kind: 'lesson' | 'checkpoint' | 'review' | 'practice';
  title: string;
  score: number;
  correct: number;
  total: number;
  xp: number;
  coins: number;
  perfect: boolean;
  passed?: boolean;
  newWords: number;
  weakConcepts: string[];
  levelUp?: number;
}

export interface LearnerState {
  version: number;
  updatedAt: number;
  profile: Profile;
  xp: number;
  coins: number;
  lessons: Record<string, { completedAt: string; bestScore: number; attempts: number; testedOut?: boolean }>;
  checkpoints: Record<string, { bestScore: number; attempts: number; passedAt?: string }>;
  evidence: Evidence;
  practice: Partial<Record<Skill, { c: number; t: number }>>;
  placement?: PlacementResult;
  srs: Record<string, SrsCard>;
  conceptStats: Record<string, { right: number; wrong: number; lastWrong?: string }>;
  saved: string[];
  customCards: Record<string, CustomCard>;
  activity: Record<string, DayActivity>;
  streak: { current: number; longest: number; lastActive: string | null; freezes: number; protectedDays: string[] };
  questClaims: Record<string, string>;
  achievements: Record<string, string>;
  owned: string[];
  libraryRead: string[];
  plans: PlanItem[];
  totals: { reviews: number; listening: number; conversations: number; purchases: number; perfect: number; seconds: number };
  celebrations: Celebration[];
}

export const defaultProfile: Profile = {
  name: '',
  onboarded: false,
  createdAt: dayKey(),
  dailyGoalXp: 30,
  minutesPerDay: 5,
  schoolMode: false,
  schoolYear: null,
  themeId: 'theme-macaron',
  avatarId: 'avatar-croissant',
  frameId: 'frame-none',
  englishHelp: 'on-request',
  audioAutoplay: true,
  reminders: { enabled: false, time: '18:00' },
  aiEnabled: false,
  reducedMotion: false,
};

export const initialState = (): LearnerState => ({
  version: 1,
  updatedAt: Date.now(),
  profile: { ...defaultProfile, createdAt: dayKey() },
  xp: 0,
  coins: 20,
  lessons: {},
  checkpoints: {},
  evidence: {},
  practice: {},
  srs: {},
  conceptStats: {},
  saved: [],
  customCards: {},
  activity: {},
  streak: { current: 0, longest: 0, lastActive: null, freezes: 1, protectedDays: [] },
  questClaims: {},
  achievements: {},
  owned: ['theme-macaron', 'theme-minuit', 'avatar-croissant', 'avatar-beret', 'frame-none'],
  libraryRead: [],
  plans: [],
  totals: { reviews: 0, listening: 0, conversations: 0, purchases: 0, perfect: 0, seconds: 0 },
  celebrations: [],
});

/* ---------------- pure helpers ---------------- */

const uid = () => Math.random().toString(36).slice(2, 10);

function bumpDay(s: LearnerState, patch: Partial<DayActivity>, today = dayKey()): LearnerState {
  const d = { ...(s.activity[today] ?? emptyDay()) };
  for (const [k, v] of Object.entries(patch)) (d as any)[k] += v as number;
  return { ...s, activity: { ...s.activity, [today]: d } };
}

function celebrate(s: LearnerState, c: Omit<Celebration, 'id'>): LearnerState {
  return { ...s, celebrations: [...s.celebrations, { ...c, id: uid() }] };
}

/** Register that the learner was active today; updates streak. */
function touchStreak(s: LearnerState, today = dayKey()): LearnerState {
  const st = { ...s.streak };
  if (st.lastActive === today) return s;
  if (st.lastActive && daysBetween(st.lastActive, today) === 1) st.current += 1;
  else st.current = 1;
  st.lastActive = today;
  st.longest = Math.max(st.longest, st.current);
  let next: LearnerState = { ...s, streak: st };
  if (st.current > 1 && st.current % 7 === 0 && st.freezes < MAX_FREEZES) {
    next = { ...next, streak: { ...st, freezes: st.freezes + 1 } };
    next = celebrate(next, { kind: 'streak', title: `${st.current}-day streak!`, detail: 'You earned a streak protector 🧊', icon: '🔥' });
  } else if ([3, 5, 10, 14, 21, 30, 50, 100].includes(st.current)) {
    next = celebrate(next, { kind: 'streak', title: `${st.current}-day streak!`, detail: 'Constance paie. Keep it going.', icon: '🔥' });
  }
  return next;
}

/** Called on app open: applies streak protectors for missed days, or gently resets. */
export function reconcileStreak(s: LearnerState, today = dayKey()): LearnerState {
  const st = s.streak;
  if (!st.lastActive || st.current === 0) return s;
  const gap = daysBetween(st.lastActive, today);
  if (gap <= 1) return s;
  const missed = gap - 1;
  if (missed <= st.freezes) {
    const days = Array.from({ length: missed }, (_, i) => addDays(st.lastActive!, i + 1));
    const next: LearnerState = {
      ...s,
      streak: { ...st, freezes: st.freezes - missed, lastActive: addDays(today, -1), protectedDays: [...st.protectedDays, ...days] },
    };
    return celebrate(next, {
      kind: 'streak-saved',
      title: 'Streak protected',
      detail: `You missed ${missed === 1 ? 'a day' : `${missed} days`}, so ${missed === 1 ? 'a protector was' : 'protectors were'} used. Your ${st.current}-day streak is safe.`,
      icon: '🧊',
    });
  }
  const next: LearnerState = { ...s, streak: { ...st, current: 0 } };
  return celebrate(next, {
    kind: 'info',
    title: 'Welcome back!',
    detail: `Your streak reset, but every word and lesson you learned is still here. Best streak: ${st.longest} days. Let's start a new one.`,
    icon: '🌱',
  });
}

function addXp(s: LearnerState, xp: number, coins: number): LearnerState {
  const before = levelFromXp(s.xp).level;
  let next = bumpDay({ ...s, xp: s.xp + xp, coins: s.coins + coins }, { xp });
  const after = levelFromXp(next.xp).level;
  if (after > before) next = celebrate(next, { kind: 'level-up', title: `Level ${after}!`, detail: 'Your player level went up. Bravo !', icon: '⭐' });
  return xp > 0 ? touchStreak(next) : next;
}

export function computeStats(s: LearnerState): AchievementStats {
  const vocabCards = Object.values(s.srs).filter((c) => c.kind === 'vocab');
  const passed = new Set(Object.entries(s.checkpoints).filter(([, v]) => v.passedAt).map(([k]) => k));
  const unitsComplete = units.filter((u) => u.lessons.every((l) => s.lessons[l.id]) || passed.has(u.id)).length;
  return {
    lessons: Object.values(s.lessons).filter((l) => !l.testedOut).length,
    perfectLessons: s.totals.perfect,
    longestStreak: s.streak.longest,
    wordsLearned: vocabCards.length,
    wordsMastered: vocabCards.filter((c) => strength(c) === 'mastered').length,
    reviews: s.totals.reviews,
    listening: s.totals.listening,
    checkpointsPassed: passed.size,
    unitsComplete,
    levelsAchieved: levelStatuses(unitsByLevel(), passed).filter((l) => l.demonstrated).length,
    placementDone: !!s.placement,
    customCards: Object.keys(s.customCards).length,
    libraryRead: s.libraryRead.length,
    purchases: s.totals.purchases,
    conversations: s.totals.conversations,
    playerLevel: levelFromXp(s.xp).level,
  };
}

export function unitsByLevel(): Record<CEFR, string[]> {
  const out = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] } as Record<CEFR, string[]>;
  for (const u of units) out[u.level].push(u.id);
  return out;
}

function checkAchievements(s: LearnerState): LearnerState {
  const stats = computeStats(s);
  let next = s;
  for (const a of achievements) {
    if (next.achievements[a.id] || !a.test(stats)) continue;
    next = { ...next, achievements: { ...next.achievements, [a.id]: dayKey() }, coins: next.coins + a.coins };
    next = celebrate(next, { kind: 'achievement', title: a.title, detail: `${a.description} · +${a.coins} coins`, icon: a.icon });
  }
  return next;
}

function applyResults(s: LearnerState, results: ExerciseResult[], today: string): { s: LearnerState; weak: string[] } {
  let next = s;
  const practice = { ...next.practice };
  const conceptStats = { ...next.conceptStats };
  const srs = { ...next.srs };
  const weak = new Set<string>();
  let listening = 0;
  let speaking = 0;
  for (const r of results) {
    if (r.skill && r.scored) {
      const t = practice[r.skill] ?? { c: 0, t: 0 };
      practice[r.skill] = { c: t.c + (r.correct ? 1 : 0), t: t.t + 1 };
    }
    if (r.skill === 'listening' && r.scored) listening++;
    if (r.type === 'speak') speaking++;
    if (r.concept && r.scored) {
      const cs = conceptStats[r.concept] ?? { right: 0, wrong: 0 };
      conceptStats[r.concept] = r.correct ? { ...cs, right: cs.right + 1 } : { ...cs, wrong: cs.wrong + 1, lastWrong: today };
      const key = 'c:' + r.concept;
      if (!r.correct) {
        srs[key] = flagWeak(srs[key], key, today);
        weak.add(r.concept);
      } else if (!srs[key]) {
        srs[key] = newCard(key, today, 2);
      }
    }
  }
  next = { ...next, practice, conceptStats, srs, totals: { ...next.totals, listening: next.totals.listening + listening } };
  next = bumpDay(next, { listening, speaking }, today);
  return { s: next, weak: [...weak] };
}

/* ---------------- store ---------------- */

interface Actions {
  touch: () => void;
  completeOnboarding: (p: Partial<Profile>) => void;
  updateProfile: (p: Partial<Profile>) => void;
  recordPlacement: (r: PlacementResult, items: { level: CEFR; skill: Skill; correct: boolean }[], skipUnits: string[]) => void;
  finishLesson: (lessonId: string, results: ExerciseResult[], seconds: number) => Summary;
  finishCheckpoint: (unitId: string, results: ExerciseResult[], seconds: number, testOut: boolean) => Summary;
  finishReview: (graded: { cardId: string; grade: Grade }[], results: ExerciseResult[], seconds: number) => Summary;
  finishPractice: (title: string, results: ExerciseResult[], seconds: number, opts?: { conversation?: boolean }) => Summary;
  toggleSaved: (vocabId: string) => void;
  addCustomCard: (c: Omit<CustomCard, 'id' | 'createdAt'>) => string;
  updateCustomCard: (id: string, c: Partial<CustomCard>) => void;
  deleteCustomCard: (id: string) => void;
  generateLessonCards: (lessonId: string) => number;
  addToRevision: (cardIds: string[]) => void;
  claimQuest: (questId: string, period: string) => void;
  buy: (itemId: string) => boolean;
  equip: (itemId: string) => void;
  markLibraryRead: (id: string) => void;
  addPlan: (p: Omit<PlanItem, 'id' | 'done'>) => void;
  togglePlan: (id: string) => void;
  deletePlan: (id: string) => void;
  dismissCelebration: (id: string) => void;
  replaceState: (s: LearnerState) => void;
  resetAll: () => void;
}

export type Store = LearnerState & Actions;

const stamp = (s: LearnerState): LearnerState => ({ ...s, updatedAt: Date.now() });

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const data = (): LearnerState => {
        const { touch, completeOnboarding, updateProfile, recordPlacement, finishLesson, finishCheckpoint, finishReview, finishPractice, toggleSaved, addCustomCard, updateCustomCard, deleteCustomCard, generateLessonCards, addToRevision, claimQuest, buy, equip, markLibraryRead, addPlan, togglePlan, deletePlan, dismissCelebration, replaceState, resetAll, ...rest } = get();
        return rest;
      };
      const commit = (s: LearnerState) => set(stamp(s));

      return {
        ...initialState(),

        touch: () => commit(reconcileStreak(data())),

        completeOnboarding: (p) => commit(checkAchievements({ ...data(), profile: { ...data().profile, ...p, onboarded: true } })),

        updateProfile: (p) => commit({ ...data(), profile: { ...data().profile, ...p } }),

        recordPlacement: (r, items, skipUnits) => {
          let s = data();
          let ev = s.evidence;
          for (const it of items) ev = addEvidence(ev, it.level, it.skill, it.correct);
          const lessons = { ...s.lessons };
          for (const uidv of skipUnits) {
            const u = unitById.get(uidv);
            u?.lessons.forEach((l) => {
              if (!lessons[l.id]) lessons[l.id] = { completedAt: dayKey(), bestScore: 0, attempts: 0, testedOut: true };
            });
          }
          s = { ...s, evidence: ev, placement: r, lessons };
          commit(checkAchievements(s));
        },

        finishLesson: (lessonId, results, seconds) => {
          const today = dayKey();
          const lesson = lessonById.get(lessonId)!;
          const scored = results.filter((r) => r.scored);
          const correct = scored.filter((r) => r.correct).length;
          const score = scored.length ? correct / scored.length : 1;
          let s = data();
          const prev = s.lessons[lessonId];
          const first = !prev || !!prev.testedOut;
          const rw = lessonRewards(score, first);
          const applied = applyResults(s, results, today);
          s = applied.s;
          // vocabulary enters spaced repetition
          const srs = { ...s.srs };
          let newWords = 0;
          for (const v of lesson.vocab) {
            const key = 'v:' + v;
            if (!srs[key]) {
              srs[key] = newCard(key, today, 1);
              newWords++;
            }
          }
          s = {
            ...s,
            srs,
            lessons: {
              ...s.lessons,
              [lessonId]: { completedAt: today, bestScore: Math.max(score, prev?.testedOut ? 0 : prev?.bestScore ?? 0), attempts: (prev?.attempts ?? 0) + 1 },
            },
            totals: { ...s.totals, perfect: s.totals.perfect + (rw.perfect ? 1 : 0), seconds: s.totals.seconds + seconds },
          };
          s = bumpDay(s, { lessons: 1, newWords, perfect: rw.perfect ? 1 : 0, seconds }, today);
          const lvlBefore = levelFromXp(s.xp).level;
          s = addXp(s, rw.xp, rw.coins);
          s = checkAchievements(s);
          commit(s);
          const lvlAfter = levelFromXp(s.xp).level;
          return {
            kind: 'lesson', title: lesson.title, score, correct, total: scored.length, xp: rw.xp, coins: rw.coins, perfect: rw.perfect,
            newWords, weakConcepts: applied.weak, levelUp: lvlAfter > lvlBefore ? lvlAfter : undefined,
          };
        },

        finishCheckpoint: (unitId, results, seconds, testOut) => {
          const today = dayKey();
          const unit = unitById.get(unitId)!;
          const scored = results.filter((r) => r.scored);
          const correct = scored.filter((r) => r.correct).length;
          const score = scored.length ? correct / scored.length : 0;
          const passed = score >= CHECKPOINT_PASS;
          let s = data();
          const levelBefore = demonstratedLevel(levelStatuses(unitsByLevel(), passedSet(s)));
          const applied = applyResults(s, results, today);
          s = applied.s;
          let ev = s.evidence;
          for (const r of scored) if (r.skill) ev = addEvidence(ev, unit.level, r.skill, r.correct);
          const prev = s.checkpoints[unitId];
          const firstPass = passed && !prev?.passedAt;
          s = {
            ...s,
            evidence: ev,
            checkpoints: {
              ...s.checkpoints,
              [unitId]: { bestScore: Math.max(score, prev?.bestScore ?? 0), attempts: (prev?.attempts ?? 0) + 1, passedAt: prev?.passedAt ?? (passed ? today : undefined) },
            },
            totals: { ...s.totals, seconds: s.totals.seconds + seconds },
          };
          if (passed && testOut) {
            const lessons = { ...s.lessons };
            unit.lessons.forEach((l) => {
              if (!lessons[l.id]) lessons[l.id] = { completedAt: today, bestScore: 0, attempts: 0, testedOut: true };
            });
            s = { ...s, lessons };
          }
          s = bumpDay(s, { checkpoints: firstPass ? 1 : 0, seconds }, today);
          const xp = passed ? 30 : 10;
          const coins = firstPass ? 25 : passed ? 5 : 2;
          s = addXp(s, xp, coins);
          const levelAfter = demonstratedLevel(levelStatuses(unitsByLevel(), passedSet(s)));
          if (levelAfter && levelAfter !== levelBefore) {
            s = celebrate(s, { kind: 'cefr', title: `${levelAfter} demonstrated!`, detail: 'You passed every checkpoint at this level. That\'s real proficiency, not just XP.', icon: '🎓' });
          }
          s = checkAchievements(s);
          commit(s);
          return { kind: 'checkpoint', title: `${unit.title} — checkpoint`, score, correct, total: scored.length, xp, coins, perfect: score === 1, passed, newWords: 0, weakConcepts: applied.weak };
        },

        finishReview: (graded, results, seconds) => {
          const today = dayKey();
          let s = data();
          const srs = { ...s.srs };
          for (const g of graded) {
            const card = srs[g.cardId] ?? newCard(g.cardId, today, 0);
            srs[g.cardId] = review(card, g.grade, today);
          }
          s = { ...s, srs, totals: { ...s.totals, reviews: s.totals.reviews + graded.length, seconds: s.totals.seconds + seconds } };
          const applied = applyResults(s, results, today);
          s = applied.s;
          const correct = graded.filter((g) => g.grade >= 2).length;
          const rw = reviewRewards(graded.length, correct);
          s = bumpDay(s, { reviews: graded.length, seconds }, today);
          s = addXp(s, rw.xp, rw.coins);
          s = checkAchievements(s);
          commit(s);
          return { kind: 'review', title: 'Revision', score: graded.length ? correct / graded.length : 1, correct, total: graded.length, xp: rw.xp, coins: rw.coins, perfect: correct === graded.length, newWords: 0, weakConcepts: applied.weak };
        },

        finishPractice: (title, results, seconds, opts) => {
          const today = dayKey();
          let s = data();
          const applied = applyResults(s, results, today);
          s = applied.s;
          const scored = results.filter((r) => r.scored);
          const correct = scored.filter((r) => r.correct).length;
          const score = scored.length ? correct / scored.length : 1;
          const xp = Math.max(3, Math.round(correct * 1.5));
          const coins = scored.length >= 5 ? 3 : 1;
          if (opts?.conversation) s = { ...s, totals: { ...s.totals, conversations: s.totals.conversations + 1 } };
          s = { ...s, totals: { ...s.totals, seconds: s.totals.seconds + seconds } };
          s = bumpDay(s, { seconds, conversation: opts?.conversation ? 1 : 0 }, today);
          s = addXp(s, xp, coins);
          s = checkAchievements(s);
          commit(s);
          return { kind: 'practice', title, score, correct, total: scored.length, xp, coins, perfect: score === 1, newWords: 0, weakConcepts: applied.weak };
        },

        toggleSaved: (vocabId) => {
          let s = data();
          const has = s.saved.includes(vocabId);
          s = { ...s, saved: has ? s.saved.filter((x) => x !== vocabId) : [...s.saved, vocabId] };
          if (!has) {
            const key = 'v:' + vocabId;
            if (!s.srs[key]) s = { ...s, srs: { ...s.srs, [key]: newCard(key, dayKey(), 0) } };
            s = bumpDay(s, { saved: 1 });
          }
          commit(checkAchievements(s));
        },

        addCustomCard: (c) => {
          const id = uid();
          let s = data();
          const today = dayKey();
          s = {
            ...s,
            customCards: { ...s.customCards, [id]: { ...c, id, createdAt: today } },
            srs: { ...s.srs, ['f:' + id]: newCard('f:' + id, today, 0) },
          };
          commit(checkAchievements(s));
          return id;
        },

        updateCustomCard: (id, c) => {
          const s = data();
          if (!s.customCards[id]) return;
          commit({ ...s, customCards: { ...s.customCards, [id]: { ...s.customCards[id], ...c } } });
        },

        deleteCustomCard: (id) => {
          const s = data();
          const customCards = { ...s.customCards };
          const srs = { ...s.srs };
          delete customCards[id];
          delete srs['f:' + id];
          commit({ ...s, customCards, srs });
        },

        generateLessonCards: (lessonId) => {
          const lesson = lessonById.get(lessonId);
          if (!lesson) return 0;
          const deck = `${unitOfLesson.get(lessonId)?.title ?? ''} · ${lesson.title}`;
          let s = data();
          const existing = new Set(Object.values(s.customCards).map((c) => c.front));
          const today = dayKey();
          let n = 0;
          const customCards = { ...s.customCards };
          const srs = { ...s.srs };
          for (const vid of lesson.vocab) {
            const v = vocabById.get(vid);
            if (!v?.example || existing.has(v.example.fr)) continue;
            const id = uid();
            customCards[id] = { id, front: v.example.fr, back: v.example.en, note: `${withArticle(v)} — ${v.en}`, deck, createdAt: today };
            srs['f:' + id] = newCard('f:' + id, today, 0);
            n++;
          }
          s = { ...s, customCards, srs };
          commit(checkAchievements(s));
          return n;
        },

        addToRevision: (cardIds) => {
          const s = data();
          const srs = { ...s.srs };
          const today = dayKey();
          for (const id of cardIds) srs[id] = srs[id] ? { ...srs[id], due: today } : newCard(id, today, 0);
          commit({ ...s, srs });
        },

        claimQuest: (questId, period) => {
          const s = data();
          const key = `${period}:${questId}`;
          const q = allQuests.get(questId);
          if (!q || s.questClaims[key]) return;
          const prog = questProgress(s, q, period);
          if (prog < q.target) return;
          let next: LearnerState = { ...s, questClaims: { ...s.questClaims, [key]: dayKey() } };
          next = addXp(next, q.xp, q.coins);
          commit(checkAchievements(next));
        },

        buy: (itemId) => {
          const s = data();
          const item = shopById.get(itemId);
          if (!item || s.coins < item.price) return false;
          if (item.kind === 'freeze') {
            if (s.streak.freezes >= MAX_FREEZES) return false;
            commit(checkAchievements({ ...s, coins: s.coins - item.price, streak: { ...s.streak, freezes: s.streak.freezes + 1 }, totals: { ...s.totals, purchases: s.totals.purchases + 1 } }));
            return true;
          }
          if (s.owned.includes(itemId)) return false;
          commit(checkAchievements({ ...s, coins: s.coins - item.price, owned: [...s.owned, itemId], totals: { ...s.totals, purchases: s.totals.purchases + 1 } }));
          return true;
        },

        equip: (itemId) => {
          const s = data();
          const item = shopById.get(itemId);
          if (!item || !s.owned.includes(itemId)) return;
          const key = item.kind === 'theme' ? 'themeId' : item.kind === 'avatar' ? 'avatarId' : item.kind === 'frame' ? 'frameId' : null;
          if (!key) return;
          commit({ ...s, profile: { ...s.profile, [key]: itemId } });
        },

        markLibraryRead: (id) => {
          const s = data();
          if (s.libraryRead.includes(id)) return;
          commit(checkAchievements(bumpDay({ ...s, libraryRead: [...s.libraryRead, id] }, { library: 1 })));
        },

        addPlan: (p) => commit({ ...data(), plans: [...data().plans, { ...p, id: uid(), done: false }] }),
        togglePlan: (id) => commit({ ...data(), plans: data().plans.map((p) => (p.id === id ? { ...p, done: !p.done } : p)) }),
        deletePlan: (id) => commit({ ...data(), plans: data().plans.filter((p) => p.id !== id) }),

        dismissCelebration: (id) => set({ celebrations: get().celebrations.filter((c) => c.id !== id) }),

        replaceState: (s) => set({ ...s }),
        resetAll: () => set({ ...initialState() }),
      };
    },
    {
      name: 'allez-learner-v1',
      version: 1,
      partialize: (s) => {
        const { celebrations, ...rest } = s as any;
        void celebrations;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')) as any;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<LearnerState>;
        return { ...current, ...p, profile: { ...defaultProfile, ...(p.profile ?? {}) }, totals: { ...initialState().totals, ...(p.totals ?? {}) }, celebrations: [] };
      },
    },
  ),
);

/* ---------------- selectors ---------------- */

export function passedSet(s: Pick<LearnerState, 'checkpoints'>): Set<string> {
  return new Set(Object.entries(s.checkpoints).filter(([, v]) => v.passedAt).map(([k]) => k));
}

export function questProgress(s: Pick<LearnerState, 'activity'>, q: QuestDef, period: string): number {
  if (period.startsWith('w')) {
    const days = weekDays(period.slice(1));
    if (q.metric === 'activeDays') return days.filter((d) => (s.activity[d]?.xp ?? 0) > 0).length;
    return days.reduce((sum, d) => sum + ((s.activity[d] as any)?.[q.metric] ?? 0), 0);
  }
  if (q.metric === 'activeDays') return (s.activity[period]?.xp ?? 0) > 0 ? 1 : 0;
  return (s.activity[period] as any)?.[q.metric] ?? 0;
}

export function currentQuests(s: Pick<LearnerState, 'activity' | 'questClaims'>, today = dayKey()) {
  const wk = 'w' + weekKey(today);
  const map = (q: QuestDef, period: string) => {
    const progress = Math.min(q.target, questProgress(s, q, period));
    return { quest: q, period, progress, done: progress >= q.target, claimed: !!s.questClaims[`${period}:${q.id}`] };
  };
  return {
    daily: dailyQuestsFor(today).map((q) => map(q, today)),
    weekly: weeklyQuestsFor(weekKey(today)).map((q) => map(q, wk)),
  };
}

export function dueCards(s: Pick<LearnerState, 'srs'>, today = dayKey()): SrsCard[] {
  return Object.values(s.srs)
    .filter((c) => daysBetween(c.due, today) >= 0)
    .sort((a, b) => a.due.localeCompare(b.due) || a.interval - b.interval);
}

export function isLessonDone(s: Pick<LearnerState, 'lessons'>, id: string) {
  return !!s.lessons[id];
}

export function isUnitComplete(s: Pick<LearnerState, 'lessons' | 'checkpoints'>, unitId: string) {
  const u = unitById.get(unitId);
  if (!u) return false;
  return !!s.checkpoints[unitId]?.passedAt || u.lessons.every((l) => s.lessons[l.id]);
}

/**
 * A unit is unlocked when it is the first unit, or the previous unit is complete,
 * or the learner has started it already. Learners can always "test out" of a locked unit.
 */
export function isUnitUnlocked(s: Pick<LearnerState, 'lessons' | 'checkpoints'>, unitId: string) {
  const idx = units.findIndex((u) => u.id === unitId);
  if (idx <= 0) return true;
  const u = units[idx];
  if (u.lessons.some((l) => s.lessons[l.id])) return true;
  return isUnitComplete(s, units[idx - 1].id);
}

export function nextLesson(s: Pick<LearnerState, 'lessons' | 'checkpoints'>) {
  for (const u of units) {
    if (!isUnitUnlocked(s, u.id)) continue;
    for (const l of u.lessons) if (!s.lessons[l.id]) return { unit: u, lesson: l };
  }
  return null;
}

export function weakConcepts(s: Pick<LearnerState, 'conceptStats'>, limit = 5) {
  return Object.entries(s.conceptStats)
    .map(([id, v]) => ({ id, ...v, ratio: v.right / Math.max(1, v.right + v.wrong) }))
    .filter((c) => c.wrong > 0 && c.ratio < 0.8)
    .sort((a, b) => a.ratio - b.ratio)
    .slice(0, limit);
}

export function strongConcepts(s: Pick<LearnerState, 'conceptStats'>, limit = 5) {
  return Object.entries(s.conceptStats)
    .map(([id, v]) => ({ id, ...v, ratio: v.right / Math.max(1, v.right + v.wrong) }))
    .filter((c) => c.right >= 3 && c.ratio >= 0.85)
    .sort((a, b) => b.right - a.right)
    .slice(0, limit);
}
