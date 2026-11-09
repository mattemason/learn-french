import { describe, expect, it } from 'vitest';
import { checkAnswer, checkOrder } from './answer';
import { newCard, review, strength } from './srs';
import { dailyQuestsFor, levelFromXp, weeklyQuestsFor } from './game';
import { addEvidence, skillLevel } from './proficiency';
import { addDays, weekKey } from './dates';
import { initialState, reconcileStreak, questProgress } from '@/state/store';

describe('answer checking', () => {
  it('ignores case, punctuation and spacing', () => {
    expect(checkAnswer('  je suis   australien !', ['Je suis australien.']).correct).toBe(true);
    expect(checkAnswer('Ça va?', ['Ça va ?']).correct).toBe(true);
  });
  it('accepts curly apostrophes and elision spacing', () => {
    expect(checkAnswer('je m’appelle Paul', ["Je m'appelle Paul"]).correct).toBe(true);
    expect(checkAnswer("j' ai", ["j'ai"]).correct).toBe(true);
  });
  it('accepts missing accents but flags them', () => {
    const r = checkAnswer('le frere', ['le frère']);
    expect(r.correct).toBe(true);
    expect(r.accentSlip).toBe(true);
  });
  it('never forgives article/gender mistakes', () => {
    expect(checkAnswer('un maison', ['une maison']).correct).toBe(false);
    expect(checkAnswer('le table', ['la table']).correct).toBe(false);
    expect(checkAnswer('je suis', ['tu es']).correct).toBe(false);
  });
  it('tolerates one typo in a long word', () => {
    const r = checkAnswer('le dejeuner', ['le déjeuner']);
    expect(r.correct).toBe(true);
    expect(checkAnswer('le dejeuher', ['le déjeuner']).typo).toBe(true);
  });
  it('checks word order including alternatives', () => {
    expect(checkOrder(['je', 'suis', 'là'], ['je', 'suis', 'là'])).toBe(true);
    expect(checkOrder(['suis', 'je', 'là'], ['je', 'suis', 'là'])).toBe(false);
    expect(checkOrder(['b', 'a'], ['a', 'b'], [['b', 'a']])).toBe(true);
  });
});

describe('spaced repetition', () => {
  const today = '2026-01-10';
  it('grows intervals with good answers and resets on lapses', () => {
    let c = newCard('v:x', today, 0);
    c = review(c, 2, today);
    expect(c.interval).toBe(1);
    c = review(c, 2, addDays(today, 1));
    expect(c.interval).toBe(4);
    c = review(c, 2, addDays(today, 5));
    expect(c.interval).toBeGreaterThanOrEqual(9);
    const lapsed = review(c, 0, addDays(today, 15));
    expect(lapsed.interval).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.ease).toBeLessThan(c.ease);
  });
  it('reports mastery at long intervals', () => {
    expect(strength({ ...newCard('v:y', today), reps: 5, interval: 30, lastReviewed: today })).toBe('mastered');
  });
});

describe('game rules', () => {
  it('levels from XP', () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(50).level).toBe(2);
    expect(levelFromXp(149).level).toBe(2);
    expect(levelFromXp(150).level).toBe(3);
  });
  it('daily quests are deterministic and always include a lesson', () => {
    expect(dailyQuestsFor('2026-03-01').map((q) => q.id)).toEqual(dailyQuestsFor('2026-03-01').map((q) => q.id));
    expect(dailyQuestsFor('2026-03-01')[0].id).toBe('d-lesson');
    expect(weeklyQuestsFor('2026-03-02')).toHaveLength(3);
  });
  it('counts weekly progress across the week', () => {
    const s = initialState();
    const wk = weekKey('2026-03-04');
    s.activity[wk] = { ...s.activity[wk], xp: 10, lessons: 2 } as any;
    s.activity[addDays(wk, 2)] = { xp: 5, lessons: 1 } as any;
    expect(questProgress(s, { id: 'w', title: '', metric: 'lessons', target: 5, xp: 0, coins: 0, icon: '' }, 'w' + wk)).toBe(3);
    expect(questProgress(s, { id: 'w', title: '', metric: 'activeDays', target: 5, xp: 0, coins: 0, icon: '' }, 'w' + wk)).toBe(2);
  });
});

describe('forgiving streaks', () => {
  it('uses a protector for a single missed day', () => {
    const s = initialState();
    s.streak = { current: 5, longest: 5, lastActive: '2026-02-01', freezes: 1, protectedDays: [] };
    const next = reconcileStreak(s, '2026-02-03');
    expect(next.streak.current).toBe(5);
    expect(next.streak.freezes).toBe(0);
    expect(next.streak.lastActive).toBe('2026-02-02');
  });
  it('resets gently without touching learning progress', () => {
    const s = initialState();
    s.xp = 500;
    s.streak = { current: 9, longest: 9, lastActive: '2026-02-01', freezes: 0, protectedDays: [] };
    const next = reconcileStreak(s, '2026-02-05');
    expect(next.streak.current).toBe(0);
    expect(next.streak.longest).toBe(9);
    expect(next.xp).toBe(500);
  });
});

describe('proficiency', () => {
  it('requires evidence at each level in order', () => {
    let ev = {};
    for (let i = 0; i < 4; i++) ev = addEvidence(ev, 'A1', 'reading', true);
    expect(skillLevel(ev, 'reading').level).toBe('A1');
    for (let i = 0; i < 4; i++) ev = addEvidence(ev, 'B1', 'reading', true);
    expect(skillLevel(ev, 'reading').level).toBe('A1'); // A2 not demonstrated
    expect(skillLevel(ev, 'listening').level).toBe(null);
  });
});
