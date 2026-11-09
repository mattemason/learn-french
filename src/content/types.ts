/**
 * Content schema for the French learning platform.
 *
 * All curriculum content (levels, units, lessons, exercises, vocabulary,
 * library articles, verbs, school topics) is plain typed data that lives in
 * src/content. UI components never hard-code learning content, so new
 * material can be added by adding data files only.
 */

export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const CEFR_LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type Skill = 'vocabulary' | 'grammar' | 'reading' | 'writing' | 'listening' | 'speaking';
export const SKILLS: Skill[] = ['vocabulary', 'grammar', 'reading', 'writing', 'listening', 'speaking'];

export type PartOfSpeech =
  | 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'prep' | 'pron' | 'num' | 'conj' | 'interj' | 'det';

/** A French example sentence with its English translation. */
export interface Example {
  fr: string;
  en: string;
}

export interface VocabItem {
  /** Globally unique, kebab-case, prefixed by unit, e.g. "u1-bonjour". */
  id: string;
  /** French form. Nouns WITHOUT article (article is derived from gender), e.g. "frère". */
  fr: string;
  en: string;
  pos: PartOfSpeech;
  /** Required for nouns. */
  gender?: 'm' | 'f';
  /** Only when irregular or noteworthy, e.g. "yeux" for "œil". */
  plural?: string;
  example?: Example;
  /** Topic slug, e.g. "greetings", "family". */
  topic: string;
  level: CEFR;
}

interface BaseExercise {
  /** Unique within its lesson, e.g. "e1". */
  id: string;
  /** Which skill this exercise trains/evidences. */
  skill: Skill;
  /** Optional Library concept id this exercise practises (used for revision of weak concepts). */
  concept?: string;
  /** Short, level-appropriate explanation shown after an incorrect answer. */
  explanation?: string;
}

/**
 * A short teaching card. Prefer "discover first": show examples, ask the learner
 * to notice the pattern, then state the rule briefly in `body`.
 * `body` supports **bold** and line breaks (\n). Keep under ~60 words.
 */
export interface IntroExercise extends Omit<BaseExercise, 'skill'> {
  type: 'intro';
  skill?: Skill;
  title: string;
  examples?: Example[];
  body: string;
  /** Optional question to prompt pattern discovery before the rule is revealed. */
  noticeQuestion?: string;
}

/** Presents vocabulary cards (with audio + save to notebook). */
export interface VocabIntroExercise extends Omit<BaseExercise, 'skill'> {
  type: 'vocab-intro';
  skill?: Skill;
  vocabIds: string[];
}

export interface McqExercise extends BaseExercise {
  type: 'mcq';
  prompt: string;
  /** English translation of the prompt, revealed only on request. */
  translation?: string;
  /** If set, the French text is read aloud with TTS (play button). */
  audio?: string;
  options: string[];
  /** Index into options. */
  answer: number;
}

/** Match French to English (4–6 pairs). */
export interface MatchExercise extends BaseExercise {
  type: 'match';
  pairs: [fr: string, en: string][];
}

/**
 * Typed fill-in-the-blank. Use exactly one "___" in `sentence`.
 * `answers` lists every acceptable answer (first = canonical).
 * Checking ignores case, surrounding punctuation and extra spaces; missing
 * accents are accepted but flagged.
 */
export interface FillExercise extends BaseExercise {
  type: 'fill';
  sentence: string;
  answers: string[];
  /** e.g. "(être)" or "verb: avoir". */
  hint?: string;
  translation?: string;
  /** Optional tappable word bank instead of free typing. */
  bank?: string[];
}

/** Tap words to build a sentence. `words` is the correct order. */
export interface OrderExercise extends BaseExercise {
  type: 'order';
  words: string[];
  /** Extra wrong tiles. */
  distractors?: string[];
  /** Other fully-correct orders, if any. */
  alternatives?: string[][];
  /** English meaning shown as the task. */
  translation: string;
}

/** Typed translation. */
export interface TranslateExercise extends BaseExercise {
  type: 'translate';
  direction: 'en-fr' | 'fr-en';
  source: string;
  /** All acceptable answers (first = canonical). Be generous with variants. */
  answers: string[];
}

/** Listen (TTS) then answer a multiple-choice question. */
export interface ListenExercise extends BaseExercise {
  type: 'listen';
  audio: string;
  question: string;
  options: string[];
  answer: number;
  /** Transcript is the audio text; translation revealed on request. */
  translation?: string;
}

/** Listen (TTS) and type exactly what you hear. */
export interface DictationExercise extends BaseExercise {
  type: 'dictation';
  audio: string;
  answers: string[];
  translation?: string;
}

export type Person = 'je' | 'tu' | 'il/elle/on' | 'nous' | 'vous' | 'ils/elles';

/** Fill in a conjugation table. `forms` parallel to `persons`. Forms exclude the pronoun. */
export interface ConjugateExercise extends BaseExercise {
  type: 'conjugate';
  verb: string;
  verbEn: string;
  tense: string;
  persons: Person[];
  forms: string[];
}

export interface ReadingQuestion {
  prompt: string;
  options: string[];
  answer: number;
}

export interface ReadingExercise extends BaseExercise {
  type: 'reading';
  title: string;
  /** 40–150 words at the lesson's level. Paragraphs separated by \n\n. */
  text: string;
  translation: string;
  questions: ReadingQuestion[];
}

export type DialogueLine =
  | { speaker: 'npc'; name: string; fr: string; en: string }
  | {
      speaker: 'you';
      /** English description of what the learner should say. */
      goal: string;
      /** Accepted typed responses (checked leniently). */
      answers: string[];
      /** Model answer shown after responding. */
      model: string;
      /** Optional word bank to support beginners. */
      bank?: string[];
    };

/** Scripted real-world conversation with typed responses. */
export interface DialogueExercise extends BaseExercise {
  type: 'dialogue';
  scenario: string;
  setting: string;
  lines: DialogueLine[];
}

/** Short open writing task; learner self-checks against a checklist and model. */
export interface WriteExercise extends BaseExercise {
  type: 'write';
  prompt: string;
  minWords: number;
  /** Checklist items, e.g. "Use « je m'appelle »". */
  checklist: string[];
  /** Words/phrases auto-detected to tick checklist items (parallel to checklist; empty string = manual). */
  detect?: string[];
  model: string;
  modelEn: string;
}

/** Say a phrase aloud. Uses speech recognition when available, otherwise self-rating. */
export interface SpeakExercise extends BaseExercise {
  type: 'speak';
  text: string;
  en: string;
}

export type Exercise =
  | IntroExercise
  | VocabIntroExercise
  | McqExercise
  | MatchExercise
  | FillExercise
  | OrderExercise
  | TranslateExercise
  | ListenExercise
  | DictationExercise
  | ConjugateExercise
  | ReadingExercise
  | DialogueExercise
  | WriteExercise
  | SpeakExercise;

export type ExerciseType = Exercise['type'];

export interface Lesson {
  /** Globally unique, e.g. "a1-u1-l1". */
  id: string;
  title: string;
  /** One-line goal, e.g. "Say hello and goodbye". */
  goal: string;
  minutes: number;
  skills: Skill[];
  /** Vocab ids introduced in this lesson (added to revision when completed). */
  vocab: string[];
  /** Library article ids relevant to this lesson. */
  library?: string[];
  /** 8–12 exercises, starting with intro/vocab-intro, mixing types. */
  exercises: Exercise[];
}

export interface Unit {
  /** e.g. "a1-u1" */
  id: string;
  level: CEFR;
  order: number;
  title: string;
  titleEn: string;
  /** Topic slug. */
  topic: string;
  /** Can-do statement, e.g. "I can introduce myself and greet people." */
  outcome: string;
  emoji: string;
  /** Vocabulary owned by this unit. */
  vocab: VocabItem[];
  lessons: Lesson[];
  /**
   * Unit checkpoint assessment: 10–14 scored exercises (no intro/vocab-intro/write),
   * covering every skill used in the unit. Passing (≥80%) is evidence of proficiency
   * and can also be used to "test out" of the unit.
   */
  checkpoint: Exercise[];
  /** Related QCE school topic ids. */
  schoolTopics?: string[];
}

/** Outline of a not-yet-authored unit, shown on the map as "coming soon". */
export interface PlannedUnit {
  title: string;
  titleEn: string;
  outcome: string;
  emoji: string;
}

export interface Level {
  id: CEFR;
  title: string;
  description: string;
  units: Unit[];
  planned: PlannedUnit[];
}

/* ---------- French Mastery Library ---------- */

export type LibraryCategory =
  | 'grammar' | 'verbs' | 'tenses' | 'pronunciation' | 'expressions' | 'sentence-structure' | 'vocabulary';

export type LibraryBlock =
  | { kind: 'p'; text: string }
  | { kind: 'examples'; items: Example[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'tip'; text: string }
  | { kind: 'warning'; text: string };

export interface LibraryArticle {
  /** e.g. "gender-articles". Also used as Exercise.concept. */
  id: string;
  title: string;
  category: LibraryCategory;
  level: CEFR;
  summary: string;
  tags: string[];
  blocks: LibraryBlock[];
  related?: string[];
}

/* ---------- Verbs ---------- */

export type TenseKey =
  | 'present' | 'passe-compose' | 'imparfait' | 'futur-simple' | 'conditionnel' | 'subjonctif' | 'imperatif';

export interface Verb {
  infinitive: string;
  en: string;
  group: 'er' | 'ir' | 're' | 'irregular';
  auxiliary: 'avoir' | 'être';
  participle: string;
  reflexive?: boolean;
  level: CEFR;
  /** Six forms (je, tu, il, nous, vous, ils) without pronoun; impératif has 3 (tu, nous, vous). */
  tenses: Partial<Record<TenseKey, string[]>>;
  notes?: string;
}

/* ---------- Placement ---------- */

export interface PlacementQuestion {
  id: string;
  level: CEFR;
  skill: Skill;
  prompt: string;
  audio?: string;
  options: string[];
  answer: number;
}

/* ---------- School mode (Queensland QCE French) ---------- */

export interface SchoolTask {
  id: string;
  title: string;
  kind: 'reading' | 'listening' | 'writing' | 'speaking' | 'short-response';
  instructions: string;
  /** Stimulus text (French) for reading/listening. Listening uses TTS. */
  stimulus?: string;
  questions?: { prompt: string; options?: string[]; answer?: number; model?: string }[];
  /** For writing/speaking. */
  model?: string;
  criteria?: string[];
}

export interface SchoolTopic {
  id: string;
  /** e.g. "Unit 1" */
  unit: string;
  title: string;
  titleFr: string;
  description: string;
  subtopics: string[];
  /** Linked general curriculum unit ids. */
  linkedUnits: string[];
  keyVocab: Example[];
  usefulPhrases: Example[];
  tasks: SchoolTask[];
}
