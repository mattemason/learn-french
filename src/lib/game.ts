/**
 * Gamification rules: player levels, rewards, daily/weekly quests,
 * achievements and the cosmetic shop. Everything here is deterministic.
 *
 * XP = activity. Coins = cosmetics. Neither ever affects CEFR proficiency,
 * which only comes from assessment evidence (see proficiency.ts).
 */
import { hashString, mulberry32, shuffle } from './rng';

/* ---------- Player levels ---------- */

/** Cumulative XP needed to reach level n (level 1 = 0 XP). */
export function xpForLevel(n: number): number {
  return 25 * (n - 1) * n;
}

export function levelFromXp(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, intoLevel: xp - base, levelSize: next - base, progress: (xp - base) / (next - base) };
}

/* ---------- Rewards ---------- */

export function lessonRewards(score: number, firstCompletion: boolean) {
  const perfect = score >= 0.999;
  const xp = 10 + Math.round(score * 10) + (perfect ? 5 : 0);
  const coins = (firstCompletion ? 5 : 2) + (perfect ? 3 : 0);
  return { xp, coins, perfect };
}

export function reviewRewards(cards: number, correct: number) {
  return { xp: Math.min(30, Math.round(correct * 1.5) + 2), coins: cards >= 10 ? 3 : 1 };
}

/* ---------- Daily activity metrics ---------- */

export interface DayActivity {
  xp: number;
  lessons: number;
  reviews: number;
  listening: number;
  speaking: number;
  newWords: number;
  saved: number;
  perfect: number;
  checkpoints: number;
  library: number;
  conversation: number;
  seconds: number;
}

export const emptyDay = (): DayActivity => ({
  xp: 0, lessons: 0, reviews: 0, listening: 0, speaking: 0, newWords: 0, saved: 0, perfect: 0, checkpoints: 0, library: 0, conversation: 0, seconds: 0,
});

export type Metric = keyof DayActivity | 'activeDays';

/* ---------- Quests ---------- */

export interface QuestDef {
  id: string;
  title: string;
  metric: Metric;
  target: number;
  xp: number;
  coins: number;
  icon: string;
}

/** Always-present anchor quest keeps the routine predictable. */
const DAILY_ANCHOR: QuestDef = { id: 'd-lesson', title: 'Complete a lesson', metric: 'lessons', target: 1, xp: 10, coins: 5, icon: '📘' };

const DAILY_POOL: QuestDef[] = [
  { id: 'd-review10', title: 'Review 10 cards', metric: 'reviews', target: 10, xp: 10, coins: 5, icon: '🔁' },
  { id: 'd-xp30', title: 'Earn 30 XP', metric: 'xp', target: 30, xp: 5, coins: 5, icon: '⚡' },
  { id: 'd-listen5', title: 'Answer 5 listening questions', metric: 'listening', target: 5, xp: 10, coins: 5, icon: '🎧' },
  { id: 'd-words5', title: 'Learn 5 new words', metric: 'newWords', target: 5, xp: 10, coins: 5, icon: '🆕' },
  { id: 'd-perfect', title: 'Finish a lesson with no mistakes', metric: 'perfect', target: 1, xp: 15, coins: 8, icon: '💎' },
  { id: 'd-speak3', title: 'Say 3 phrases out loud', metric: 'speaking', target: 3, xp: 10, coins: 5, icon: '🗣️' },
  { id: 'd-save2', title: 'Save 2 words to your notebook', metric: 'saved', target: 2, xp: 5, coins: 5, icon: '🔖' },
  { id: 'd-library', title: 'Read a Library article', metric: 'library', target: 1, xp: 5, coins: 5, icon: '📚' },
];

const WEEKLY_POOL: QuestDef[] = [
  { id: 'w-lessons5', title: 'Complete 5 lessons', metric: 'lessons', target: 5, xp: 40, coins: 25, icon: '🏅' },
  { id: 'w-active5', title: 'Practise on 5 different days', metric: 'activeDays', target: 5, xp: 50, coins: 30, icon: '📅' },
  { id: 'w-review50', title: 'Review 50 cards', metric: 'reviews', target: 50, xp: 40, coins: 25, icon: '🧠' },
  { id: 'w-xp200', title: 'Earn 200 XP', metric: 'xp', target: 200, xp: 30, coins: 25, icon: '🔥' },
  { id: 'w-checkpoint', title: 'Pass a unit checkpoint', metric: 'checkpoints', target: 1, xp: 40, coins: 30, icon: '🎯' },
  { id: 'w-listen25', title: 'Answer 25 listening questions', metric: 'listening', target: 25, xp: 30, coins: 20, icon: '🎶' },
  { id: 'w-convo2', title: 'Complete 2 conversations', metric: 'conversation', target: 2, xp: 30, coins: 20, icon: '💬' },
];

export const allQuests = new Map([DAILY_ANCHOR, ...DAILY_POOL, ...WEEKLY_POOL].map((q) => [q.id, q]));

export function dailyQuestsFor(day: string): QuestDef[] {
  const rand = mulberry32(hashString('daily:' + day));
  return [DAILY_ANCHOR, ...shuffle(DAILY_POOL, rand).slice(0, 2)];
}

export function weeklyQuestsFor(week: string): QuestDef[] {
  const rand = mulberry32(hashString('weekly:' + week));
  return shuffle(WEEKLY_POOL, rand).slice(0, 3);
}

/* ---------- Achievements ---------- */

export interface AchievementStats {
  lessons: number;
  perfectLessons: number;
  longestStreak: number;
  wordsLearned: number;
  wordsMastered: number;
  reviews: number;
  listening: number;
  checkpointsPassed: number;
  unitsComplete: number;
  levelsAchieved: number;
  placementDone: boolean;
  customCards: number;
  libraryRead: number;
  purchases: number;
  conversations: number;
  playerLevel: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
  test: (s: AchievementStats) => boolean;
  coins: number;
}

export const achievements: AchievementDef[] = [
  { id: 'first-steps', title: 'Premiers pas', description: 'Complete your first lesson', icon: '👣', tier: 'bronze', coins: 10, test: (s) => s.lessons >= 1 },
  { id: 'placement', title: 'Point de départ', description: 'Take the placement check', icon: '🧭', tier: 'bronze', coins: 10, test: (s) => s.placementDone },
  { id: 'lessons-10', title: 'Sur la bonne voie', description: 'Complete 10 lessons', icon: '🛤️', tier: 'silver', coins: 25, test: (s) => s.lessons >= 10 },
  { id: 'lessons-24', title: 'Marathonien', description: 'Complete 24 lessons', icon: '🏃', tier: 'gold', coins: 50, test: (s) => s.lessons >= 24 },
  { id: 'perfect-1', title: 'Sans faute', description: 'Finish a lesson with no mistakes', icon: '💎', tier: 'bronze', coins: 10, test: (s) => s.perfectLessons >= 1 },
  { id: 'perfect-10', title: 'Perfectionniste', description: 'Ten perfect lessons', icon: '👑', tier: 'gold', coins: 50, test: (s) => s.perfectLessons >= 10 },
  { id: 'streak-3', title: 'Ça chauffe', description: 'Reach a 3-day streak', icon: '🔥', tier: 'bronze', coins: 10, test: (s) => s.longestStreak >= 3 },
  { id: 'streak-7', title: 'Une semaine', description: 'Reach a 7-day streak', icon: '📆', tier: 'silver', coins: 30, test: (s) => s.longestStreak >= 7 },
  { id: 'streak-30', title: 'Inarrêtable', description: 'Reach a 30-day streak', icon: '🌋', tier: 'gold', coins: 100, test: (s) => s.longestStreak >= 30 },
  { id: 'words-50', title: 'Collectionneur', description: 'Learn 50 words', icon: '🧺', tier: 'bronze', coins: 15, test: (s) => s.wordsLearned >= 50 },
  { id: 'words-150', title: 'Dictionnaire vivant', description: 'Learn 150 words', icon: '📕', tier: 'silver', coins: 40, test: (s) => s.wordsLearned >= 150 },
  { id: 'mastered-25', title: 'Mémoire d\'éléphant', description: 'Master 25 words (21+ day interval)', icon: '🐘', tier: 'gold', coins: 60, test: (s) => s.wordsMastered >= 25 },
  { id: 'reviews-100', title: 'Révisions sérieuses', description: 'Do 100 reviews', icon: '🔁', tier: 'silver', coins: 30, test: (s) => s.reviews >= 100 },
  { id: 'listening-50', title: 'Toutes oreilles', description: 'Answer 50 listening questions', icon: '🎧', tier: 'silver', coins: 30, test: (s) => s.listening >= 50 },
  { id: 'checkpoint-1', title: 'Objectif atteint', description: 'Pass a unit checkpoint', icon: '🎯', tier: 'bronze', coins: 20, test: (s) => s.checkpointsPassed >= 1 },
  { id: 'units-4', title: 'Explorateur', description: 'Complete 4 units', icon: '🗺️', tier: 'silver', coins: 40, test: (s) => s.unitsComplete >= 4 },
  { id: 'level-a1', title: 'Niveau A1', description: 'Demonstrate A1 proficiency', icon: '🎓', tier: 'gold', coins: 100, test: (s) => s.levelsAchieved >= 1 },
  { id: 'cards-5', title: 'Fait maison', description: 'Create 5 custom flashcards', icon: '✍️', tier: 'bronze', coins: 10, test: (s) => s.customCards >= 5 },
  { id: 'library-5', title: 'Rat de bibliothèque', description: 'Read 5 Library articles', icon: '📚', tier: 'bronze', coins: 15, test: (s) => s.libraryRead >= 5 },
  { id: 'shopper', title: 'Petit plaisir', description: 'Buy something in the boutique', icon: '🛍️', tier: 'bronze', coins: 5, test: (s) => s.purchases >= 1 },
  { id: 'chatty', title: 'Bavard', description: 'Complete 5 conversations', icon: '💬', tier: 'silver', coins: 30, test: (s) => s.conversations >= 5 },
  { id: 'player-10', title: 'Niveau 10', description: 'Reach player level 10', icon: '⭐', tier: 'gold', coins: 50, test: (s) => s.playerLevel >= 10 },
];

/* ---------- Boutique ---------- */

export type ShopKind = 'theme' | 'avatar' | 'frame' | 'freeze';

export interface ShopItem {
  id: string;
  kind: ShopKind;
  name: string;
  price: number;
  preview: string;
  description?: string;
}

export const shopItems: ShopItem[] = [
  { id: 'theme-macaron', kind: 'theme', name: 'Macaron', price: 0, preview: '🩷', description: 'Raspberry & pistachio' },
  { id: 'theme-minuit', kind: 'theme', name: 'Minuit', price: 0, preview: '🌙', description: 'Midnight ink & gold' },
  { id: 'theme-lavande', kind: 'theme', name: 'Lavande', price: 150, preview: '💜', description: 'Provençal lavender fields' },
  { id: 'theme-riviera', kind: 'theme', name: 'Riviera', price: 200, preview: '🌊', description: 'Mediterranean teal & coral' },
  { id: 'theme-bordeaux', kind: 'theme', name: 'Bordeaux', price: 250, preview: '🍷', description: 'Deep wine & candlelight' },
  { id: 'avatar-croissant', kind: 'avatar', name: 'Croissant', price: 0, preview: '🥐' },
  { id: 'avatar-beret', kind: 'avatar', name: 'Artiste', price: 0, preview: '🎨' },
  { id: 'avatar-velo', kind: 'avatar', name: 'Vélo', price: 40, preview: '🚲' },
  { id: 'avatar-fromage', kind: 'avatar', name: 'Fromage', price: 40, preview: '🧀' },
  { id: 'avatar-tour', kind: 'avatar', name: 'La Tour', price: 60, preview: '🗼' },
  { id: 'avatar-renard', kind: 'avatar', name: 'Renard', price: 60, preview: '🦊' },
  { id: 'avatar-escargot', kind: 'avatar', name: 'Escargot', price: 80, preview: '🐌' },
  { id: 'avatar-coq', kind: 'avatar', name: 'Coq', price: 100, preview: '🐓' },
  { id: 'frame-none', kind: 'frame', name: 'Simple', price: 0, preview: 'none' },
  { id: 'frame-gold', kind: 'frame', name: 'Doré', price: 120, preview: 'gold' },
  { id: 'frame-tricolore', kind: 'frame', name: 'Tricolore', price: 150, preview: 'tricolore' },
  { id: 'frame-arcenciel', kind: 'frame', name: 'Arc-en-ciel', price: 200, preview: 'rainbow' },
  { id: 'freeze', kind: 'freeze', name: 'Streak protector', price: 50, preview: '🧊', description: 'Protects your streak for one missed day. Hold up to 2.' },
];

export const MAX_FREEZES = 2;
export const shopById = new Map(shopItems.map((i) => [i.id, i]));
