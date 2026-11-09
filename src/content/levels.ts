import type { CEFR, PlannedUnit } from './types';

export interface LevelMeta {
  id: CEFR;
  title: string;
  description: string;
  planned: PlannedUnit[];
}

/**
 * CEFR level metadata. Authored units are loaded from ./units; `planned`
 * outlines show learners the road ahead and are replaced by real units as
 * content is written.
 */
export const levelMeta: LevelMeta[] = [
  {
    id: 'A1',
    title: 'Découverte',
    description: 'Breakthrough: handle simple everyday situations — introduce yourself, ask and answer simple questions.',
    planned: [],
  },
  {
    id: 'A2',
    title: 'Survie',
    description: 'Waystage: talk about your past, routines and immediate needs; manage simple exchanges.',
    planned: [
      { title: 'Le week-end dernier', titleEn: 'Last weekend', outcome: 'I can talk about what I did using the passé composé.', emoji: '📸' },
      { title: 'Chez moi', titleEn: 'At home', outcome: 'I can describe my home and household chores.', emoji: '🏡' },
      { title: 'Les vacances', titleEn: 'Holidays', outcome: 'I can describe a past holiday and where I went.', emoji: '🏖️' },
      { title: 'Faire les courses', titleEn: 'Shopping', outcome: 'I can buy food and clothes, compare items and ask for sizes.', emoji: '🛍️' },
      { title: 'La santé', titleEn: 'Health', outcome: 'I can explain what is wrong at the doctor\'s or pharmacy.', emoji: '🩺' },
      { title: 'Quand j\'étais petit', titleEn: 'When I was little', outcome: 'I can describe how things used to be with the imparfait.', emoji: '🧸' },
      { title: 'Mes projets', titleEn: 'My plans', outcome: 'I can talk about future plans with the futur simple.', emoji: '🗺️' },
      { title: 'Le monde du travail', titleEn: 'The world of work', outcome: 'I can talk about jobs and part-time work.', emoji: '💼' },
    ],
  },
  {
    id: 'B1',
    title: 'Seuil',
    description: 'Threshold: deal with most travel situations, describe experiences, give reasons and opinions.',
    planned: [
      { title: 'Raconter une histoire', titleEn: 'Telling a story', outcome: 'I can narrate events using imparfait and passé composé together.', emoji: '📖' },
      { title: 'Les médias et moi', titleEn: 'Media and me', outcome: 'I can discuss social media and technology habits.', emoji: '📱' },
      { title: 'L\'environnement', titleEn: 'The environment', outcome: 'I can give my opinion on environmental issues and justify it.', emoji: '🌿' },
      { title: 'Relations et amitiés', titleEn: 'Relationships', outcome: 'I can talk about friendships and conflicts with object pronouns.', emoji: '🤝' },
      { title: 'Il faut que…', titleEn: 'Necessity and advice', outcome: 'I can give advice using the subjunctive.', emoji: '💡' },
      { title: 'Si j\'étais…', titleEn: 'Hypotheticals', outcome: 'I can imagine situations with si + imparfait + conditionnel.', emoji: '✨' },
    ],
  },
  {
    id: 'B2',
    title: 'Avancé',
    description: 'Vantage: interact fluently with native speakers, argue a point of view, understand complex texts.',
    planned: [
      { title: 'Débattre', titleEn: 'Debating', outcome: 'I can structure an argument with nuanced connectors.', emoji: '⚖️' },
      { title: 'La francophonie', titleEn: 'The French-speaking world', outcome: 'I can discuss cultures across the francophone world.', emoji: '🌍' },
      { title: 'Société et identité', titleEn: 'Society and identity', outcome: 'I can discuss social issues and identity.', emoji: '🪞' },
      { title: 'Le monde de demain', titleEn: 'Tomorrow\'s world', outcome: 'I can speculate about the future and express doubt.', emoji: '🚀' },
      { title: 'Arts et culture', titleEn: 'Arts and culture', outcome: 'I can review a film, book or exhibition.', emoji: '🎭' },
    ],
  },
  {
    id: 'C1',
    title: 'Autonome',
    description: 'Effective operational proficiency: express ideas fluently and spontaneously, with precise, flexible language.',
    planned: [
      { title: 'Nuances et registres', titleEn: 'Nuance and register', outcome: 'I can shift between formal, neutral and familiar French.', emoji: '🎚️' },
      { title: 'L\'essai argumentatif', titleEn: 'The argumentative essay', outcome: 'I can write a well-structured argumentative essay.', emoji: '🖋️' },
      { title: 'Actualités', titleEn: 'Current affairs', outcome: 'I can follow and discuss news and podcasts in detail.', emoji: '📰' },
      { title: 'Le monde professionnel', titleEn: 'Professional French', outcome: 'I can take part in meetings and write professional emails.', emoji: '🏛️' },
    ],
  },
  {
    id: 'C2',
    title: 'Maîtrise',
    description: 'Mastery: understand virtually everything, express yourself with precision and subtlety.',
    planned: [
      { title: 'Littérature', titleEn: 'Literature', outcome: 'I can analyse literary texts and style.', emoji: '📚' },
      { title: 'Jeux de mots', titleEn: 'Wordplay and idiom', outcome: 'I can understand humour, idioms and cultural allusions.', emoji: '🎩' },
      { title: 'La rhétorique', titleEn: 'Rhetoric', outcome: 'I can persuade with sophisticated rhetorical devices.', emoji: '🎙️' },
    ],
  },
];
