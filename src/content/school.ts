/**
 * School mode: Queensland QCE French (General senior syllabus).
 *
 * Structure follows the QCAA French 2025 General senior syllabus (v1.3):
 * Unit 1 Ma vie, Unit 2 L'exploration du monde, Unit 3 Notre société; culture
 * et identité, Unit 4 Mon présent; mon avenir. Topic and subtopic wording is
 * paraphrased from the syllabus. All stimulus texts and model answers are
 * original practice material written for this app (not QCAA material).
 *
 * Sources:
 * - https://www.qcaa.qld.edu.au/senior/senior-subjects/syllabuses/languages/french
 * - https://www.qcaa.qld.edu.au/downloads/senior-qce/syllabuses/snr_french_25_syll.pdf
 */
import type { SchoolTopic } from './types';

/** The four syllabus units, for headings/grouping in the UI. */
export const schoolUnits: { id: string; unit: string; titleFr: string; title: string; year: 11 | 12 }[] = [
  { id: 'qce-u1', unit: 'Unit 1', titleFr: 'Ma vie', title: 'My world', year: 11 },
  { id: 'qce-u2', unit: 'Unit 2', titleFr: "L'exploration du monde", title: 'Exploring our world', year: 11 },
  { id: 'qce-u3', unit: 'Unit 3', titleFr: 'Notre société; culture et identité', title: 'Our society; culture and identity', year: 12 },
  { id: 'qce-u4', unit: 'Unit 4', titleFr: 'Mon présent; mon avenir', title: 'My present; my future', year: 12 },
];

export const schoolTopics: SchoolTopic[] = [
  /* ===================== UNIT 1 — MA VIE ===================== */
  {
    id: 'qce-u1-t1',
    unit: 'Unit 1',
    title: 'Family/carers',
    titleFr: 'La famille',
    description:
      'Compare family life in Australia and French-speaking communities, examine family structures and traditional roles in the 21st century, and discuss how young people connect with their extended family.',
    subtopics: [
      "Similarities and differences in family/carers' daily life in your own and French-speaking communities",
      'Family structures and stereotypical roles in the 21st century',
      'How young people engage with their extended families',
    ],
    linkedUnits: ['a1-u2', 'a1-u5'],
    keyVocab: [
      { fr: 'la famille recomposée', en: 'blended family' },
      { fr: 'la famille monoparentale', en: 'single-parent family' },
      { fr: 'le beau-père', en: 'stepfather / father-in-law' },
      { fr: 'la belle-mère', en: 'stepmother / mother-in-law' },
      { fr: 'le demi-frère / la demi-sœur', en: 'half-brother / half-sister' },
      { fr: 'les grands-parents', en: 'grandparents' },
      { fr: 'les proches', en: 'close family / loved ones' },
      { fr: 'les tâches ménagères', en: 'household chores' },
      { fr: "s'entendre bien avec", en: 'to get on well with' },
      { fr: 'se disputer', en: 'to argue' },
      { fr: 'élever des enfants', en: 'to raise children' },
      { fr: 'les rôles traditionnels', en: 'traditional roles' },
      { fr: 'partager', en: 'to share' },
      { fr: 'le soutien', en: 'support' },
      { fr: 'le congé parental', en: 'parental leave' },
    ],
    usefulPhrases: [
      { fr: 'À mon avis, ...', en: 'In my opinion, ...' },
      { fr: 'Il me semble que ...', en: 'It seems to me that ...' },
      { fr: "D'un côté ..., d'un autre côté ...", en: 'On the one hand ..., on the other hand ...' },
      { fr: 'Quand mes grands-parents étaient jeunes, ...', en: 'When my grandparents were young, ...' },
      { fr: 'Il faut que chacun participe aux tâches ménagères.', en: 'Everyone has to help with the chores.' },
      { fr: 'Bien que nous nous disputions parfois, nous sommes très proches.', en: 'Although we sometimes argue, we are very close.' },
      { fr: "Ce qui compte le plus pour moi, c'est ...", en: 'What matters most to me is ...' },
      { fr: "Je ne pense pas que la famille idéale existe.", en: "I don't think the ideal family exists." },
    ],
    tasks: [
      {
        id: 'qce-u1-t1-read',
        title: 'Reading: Le blog de Camille',
        kind: 'reading',
        instructions:
          'Read the blog post by Camille, a French teenager, then answer the questions in English (exam style). Read the whole text once for gist before looking at the questions.',
        stimulus:
          "Je m'appelle Camille, j'ai dix-sept ans et j'habite à Lyon avec ma mère, mon beau-père et ma demi-sœur, Inès, qui a six ans. Mes parents ont divorcé quand j'avais dix ans. Au début, c'était difficile parce que je devais changer de maison chaque week-end. Maintenant, je passe un week-end sur deux chez mon père, qui habite à Villeurbanne.\n\nChez nous, tout le monde participe aux tâches ménagères. Mon beau-père fait la cuisine presque tous les soirs et ma mère s'occupe des courses. Moi, je mets la table et je promène le chien. Je trouve que c'est juste, car nous travaillons tous et personne ne devrait tout faire seul.\n\nLe dimanche, nous déjeunons souvent chez mes grands-parents. Le repas dure parfois trois heures ! Ma grand-mère prépare un gratin dauphinois délicieux et mon grand-père raconte toujours les mêmes histoires de sa jeunesse. Bien que ce soit un peu long, j'adore ces moments en famille.\n\nL'année prochaine, j'irai à l'université à Paris. Mes grands-parents me manqueront, mais je les appellerai en visio chaque semaine.",
        questions: [
          {
            prompt: "When did Camille's parents divorce?",
            options: ['When she was six', 'When she was ten', 'Last year', 'Before she was born'],
            answer: 1,
          },
          {
            prompt: 'Who usually cooks the evening meal?',
            options: ['Her mother', 'Her stepfather', 'Camille', 'Her grandmother'],
            answer: 1,
          },
          {
            prompt: 'Why does Camille think the way chores are shared in her house is fair?',
            model: 'Because everyone in the household works, so nobody should have to do everything on their own.',
          },
          {
            prompt: "Describe Sunday lunch at her grandparents' house and Camille's attitude to it.",
            model:
              'Lunch can last up to three hours; her grandmother makes a delicious gratin dauphinois and her grandfather always tells the same stories from his youth. Although she finds it a bit long, she loves these family moments.',
          },
          {
            prompt: 'How will Camille stay in touch with her grandparents next year?',
            options: ['By writing letters', 'By visiting every weekend', 'By video call every week', 'By text message every day'],
            answer: 2,
          },
        ],
      },
      {
        id: 'qce-u1-t1-write',
        title: 'Writing: Les rôles familiaux',
        kind: 'writing',
        instructions:
          "Vous écrivez un article pour le blog d'un lycée francophone partenaire. Sujet : « Les rôles dans la famille ont-ils changé ? » Comparez la vie de famille d'autrefois et d'aujourd'hui, dans votre famille et dans une famille francophone, et donnez votre opinion justifiée. Écrivez 150 à 250 mots.",
        criteria: [
          'Compare past and present family roles (imparfait for the past, présent for now)',
          'Refer to a French-speaking community as well as your own',
          'Give and justify opinions (à mon avis, je trouve que ... car ...)',
          'Use at least one subjunctive (il faut que / bien que)',
          'Look to the future (futur simple or si + présent → futur)',
          'Blog conventions: title, engaging tone, clear paragraphs',
        ],
        model:
          "Les rôles familiaux : hier et aujourd'hui\n\nQuand mes grands-parents étaient jeunes, à Toowoomba, mon grand-père travaillait à la ferme et ma grand-mère restait à la maison pour élever leurs cinq enfants. À l'époque, presque personne ne remettait en question ces rôles traditionnels. Aujourd'hui, ma famille est très différente.\n\nMes deux parents travaillent à plein temps : ma mère est infirmière et mon père est comptable. Par conséquent, ils partagent les tâches ménagères. Mon père fait la cuisine pendant la semaine et ma mère s'occupe du jardin. Mon frère et moi, nous devons ranger nos chambres et sortir les poubelles. À mon avis, c'est beaucoup plus juste qu'avant.\n\nJ'ai lu un article sur une famille de Montréal où le père a pris un long congé parental après la naissance de son fils. Je trouve cela génial, car les enfants ont besoin de leurs deux parents. Cependant, il me semble qu'en France comme en Australie, les femmes font encore la majorité des tâches à la maison.\n\nIl faut que chaque membre de la famille participe, bien que ce ne soit pas toujours facile avec le sport, les études et le travail. Si j'ai des enfants un jour, je partagerai tout avec mon ou ma partenaire. Selon moi, une famille qui travaille en équipe est une famille plus heureuse.",
      },
      {
        id: 'qce-u1-t1-speak',
        title: 'Speaking: Parle-moi de ta famille',
        kind: 'speaking',
        instructions:
          'Practise answering these conversation questions aloud. Aim for 3–5 sentences each: answer, give a detail or example, then justify an opinion. Compare your answer with the model.',
        questions: [
          {
            prompt: 'Peux-tu me décrire ta famille ?',
            model:
              "Bien sûr ! Nous sommes cinq à la maison : mes parents, mes deux petits frères et moi. Mon père est électricien et ma mère travaille dans une banque. Nous avons aussi un chien qui s'appelle Max. Mes grands-parents maternels habitent à Ipswich, à quarante minutes de chez nous.",
          },
          {
            prompt: "Est-ce que tu t'entends bien avec tes parents ? Pourquoi ?",
            model:
              "En général, oui, je m'entends bien avec eux, surtout avec ma mère, parce qu'elle est très compréhensive. Par contre, nous nous disputons parfois à cause de mon téléphone ! Mes parents veulent que je l'éteigne pendant les repas et, franchement, ils ont peut-être raison.",
          },
          {
            prompt: 'Quel rôle jouent tes grands-parents dans ta vie ?',
            model:
              "Ils sont très importants pour moi. Quand j'étais à l'école primaire, ils venaient me chercher tous les après-midi. Aujourd'hui, nous déjeunons chez eux un dimanche sur deux et mon grand-père m'apprend à jouer aux échecs.",
          },
          {
            prompt: "À ton avis, est-ce que la famille idéale existe ?",
            model:
              "Je ne pense pas que la famille idéale existe. Chaque famille est différente : il y a des familles monoparentales, recomposées, homoparentales... Ce qui compte, à mon avis, c'est que les membres de la famille se respectent et se soutiennent.",
          },
        ],
      },
    ],
  },
  {
    id: 'qce-u1-t2',
    unit: 'Unit 1',
    title: 'Peers',
    titleFr: 'Les amis et les relations',
    description:
      'Explore how young people socialise and connect, the opportunities and challenges of making and keeping friends, and how relationships are represented in texts.',
    subtopics: [
      'How you and your French-speaking peers socialise and connect',
      'Opportunities and challenges in making and maintaining friendships',
      'Relationships in a range of texts and personal opinions about them',
    ],
    linkedUnits: ['a1-u1', 'a1-u7'],
    keyVocab: [
      { fr: "l'amitié (f)", en: 'friendship' },
      { fr: 'le meilleur ami / la meilleure amie', en: 'best friend' },
      { fr: 'un copain / une copine', en: 'a friend (informal); boyfriend/girlfriend' },
      { fr: 'la confiance', en: 'trust' },
      { fr: 'les réseaux sociaux', en: 'social media' },
      { fr: 'rester en contact', en: 'to stay in touch' },
      { fr: 'se faire des amis', en: 'to make friends' },
      { fr: 'avoir des points communs', en: 'to have things in common' },
      { fr: 'le harcèlement (en ligne)', en: '(online) bullying, harassment' },
      { fr: 'la pression des pairs', en: 'peer pressure' },
      { fr: 'sortir avec quelqu\'un', en: 'to go out with someone' },
      { fr: 'compter sur quelqu\'un', en: 'to rely on someone' },
      { fr: 'face à face', en: 'face to face' },
      { fr: 'déménager', en: 'to move house' },
    ],
    usefulPhrases: [
      { fr: "Pour moi, un bon ami, c'est quelqu'un sur qui on peut compter.", en: 'For me, a good friend is someone you can count on.' },
      { fr: "Il faut qu'un ami soit honnête.", en: 'A friend has to be honest.' },
      { fr: 'Les réseaux sociaux nous permettent de ...', en: 'Social media allows us to ...' },
      { fr: "Je reconnais que ..., mais ...", en: 'I admit that ..., but ...' },
      { fr: 'Depuis, nous sommes inséparables.', en: 'Since then, we have been inseparable.' },
      { fr: "J'espère que nous resterons en contact.", en: 'I hope we will stay in touch.' },
      { fr: 'Il faut trouver un équilibre.', en: 'You have to find a balance.' },
      { fr: 'Ce qui me dérange, c\'est que ...', en: 'What bothers me is that ...' },
    ],
    tasks: [
      {
        id: 'qce-u1-t2-listen',
        title: 'Listening: Le podcast « Entre potes »',
        kind: 'listening',
        instructions:
          'Listen to the podcast extract (you may play it up to three times, as in the exam). Answer the questions in English.',
        stimulus:
          "Salut à tous, c'est Hugo et bienvenue dans notre podcast « Entre potes ». Aujourd'hui, on parle de l'amitié à l'ère des réseaux sociaux. Moi, j'ai rencontré mon meilleur ami, Yanis, au collège, il y a cinq ans. On jouait au foot ensemble tous les midis. Maintenant, il habite à Marseille, mais on se parle presque tous les jours sur WhatsApp et on joue en ligne le samedi soir.\n\nPourtant, je pense que les réseaux sociaux peuvent aussi créer des problèmes. L'année dernière, une fille de ma classe a été victime de harcèlement en ligne. C'était horrible pour elle. Selon moi, il faut que les écoles en parlent davantage.\n\nPour garder un ami, il faut de la confiance et du temps. Un « like », ce n'est pas une vraie conversation ! Et vous, comment restez-vous en contact avec vos amis ? Écrivez-nous !",
        questions: [
          {
            prompt: 'Where and when did Hugo meet Yanis?',
            options: [
              'At primary school, two years ago',
              'At secondary school (collège), five years ago',
              'At a football club, last year',
              'Online, five years ago',
            ],
            answer: 1,
          },
          {
            prompt: 'How do Hugo and Yanis stay in touch now?',
            options: [
              'By letter and phone calls',
              'They see each other every weekend',
              'WhatsApp almost every day and online games on Saturday nights',
              'Only through Instagram',
            ],
            answer: 2,
          },
          {
            prompt: 'What happened to a girl in his class last year?',
            model: 'She was a victim of online bullying (cyberbullying), which was horrible for her.',
          },
          {
            prompt: 'What does Hugo think schools should do?',
            options: ['Ban phones completely', 'Talk about it (online bullying) more', 'Organise more sport', 'Nothing at all'],
            answer: 1,
          },
          {
            prompt: "What two things does Hugo say you need to keep a friend, and what point does he make about 'likes'?",
            model: "Trust and time. He says a 'like' is not a real conversation.",
          },
        ],
      },
      {
        id: 'qce-u1-t2-speak',
        title: "Speaking: L'amitié",
        kind: 'speaking',
        instructions:
          'Answer each question aloud in French. Use a past tense to tell a short story, then give an opinion with a justification.',
        questions: [
          {
            prompt: 'Comment as-tu rencontré ton meilleur ami ou ta meilleure amie ?',
            model:
              "J'ai rencontré ma meilleure amie, Chloé, en Year 7, quand nous étions dans la même équipe de netball. Au début, nous étions un peu timides, mais nous avons vite découvert que nous avions beaucoup de points communs. Depuis, nous sommes inséparables.",
          },
          {
            prompt: "Qu'est-ce qu'un bon ami, selon toi ?",
            model:
              "Pour moi, un bon ami, c'est quelqu'un sur qui on peut compter. Il faut qu'il soit honnête et qu'il m'écoute quand j'ai des problèmes. Ce qui compte le plus, c'est la confiance.",
          },
          {
            prompt: "Est-ce que les réseaux sociaux aident l'amitié ou est-ce qu'ils lui nuisent ?",
            model:
              "D'un côté, ils nous permettent de rester en contact avec des amis qui habitent loin. Par exemple, mon ami qui a déménagé à Perth m'envoie des messages tous les jours. D'un autre côté, on passe parfois trop de temps sur son téléphone au lieu de parler face à face. Je pense qu'il faut trouver un équilibre.",
          },
          {
            prompt: 'Que feras-tu avec tes amis après le lycée ?',
            model:
              "Après les examens, nous irons à la plage pendant une semaine pour fêter la fin de l'école. Ensuite, nous irons sans doute dans des universités différentes, mais j'espère que nous resterons en contact.",
          },
        ],
      },
    ],
  },
  {
    id: 'qce-u1-t3',
    unit: 'Unit 1',
    title: 'Education',
    titleFr: "L'éducation",
    description:
      'Compare school life in French-speaking communities and Australia, and evaluate the benefits and challenges of school life and study.',
    subtopics: [
      'School life in French-speaking communities compared with Australia',
      'Benefits and challenges of school life and study',
    ],
    linkedUnits: ['a1-u3', 'a1-u4'],
    keyVocab: [
      { fr: 'le lycée', en: 'senior high school (in France, ages ~15–18)' },
      { fr: 'le collège', en: 'junior high school (in France, ages ~11–15)' },
      { fr: 'la seconde / la première / la terminale', en: 'Years 10–12 equivalents at a French lycée' },
      { fr: 'le baccalauréat (le bac)', en: 'French end-of-school qualification' },
      { fr: 'une matière', en: 'a subject' },
      { fr: 'une spécialité', en: 'a specialist subject (bac)' },
      { fr: "l'emploi du temps (m)", en: 'timetable' },
      { fr: 'la cantine', en: 'school canteen' },
      { fr: "l'uniforme scolaire (m)", en: 'school uniform' },
      { fr: 'les devoirs (m)', en: 'homework' },
      { fr: 'une évaluation', en: 'an assessment' },
      { fr: 'réussir un examen', en: 'to pass an exam' },
      { fr: 'le stress', en: 'stress' },
      { fr: 'un petit boulot', en: 'a part-time/casual job' },
    ],
    usefulPhrases: [
      { fr: "Contrairement à l'Australie, ...", en: 'Unlike Australia, ...' },
      { fr: "Par rapport à la France, ...", en: 'Compared with France, ...' },
      { fr: "Ce qui me plaît, c'est que ...", en: 'What I like is that ...' },
      { fr: "L'inconvénient, c'est que ...", en: 'The downside is that ...' },
      { fr: 'En revanche, ...', en: 'On the other hand, ...' },
      { fr: "Il faut que je m'organise mieux.", en: 'I need to get more organised.' },
      { fr: "Si je pouvais changer une chose, ce serait ...", en: 'If I could change one thing, it would be ...' },
      { fr: 'Ma matière préférée, c\'est ... car ...', en: 'My favourite subject is ... because ...' },
    ],
    tasks: [
      {
        id: 'qce-u1-t3-read',
        title: 'Reading: Au lycée en France',
        kind: 'reading',
        instructions:
          'Read the article about French senior school. Answer questions 1–3 in English and question 4 in French (exam style).',
        stimulus:
          "En France, les élèves entrent au lycée vers quinze ans, en classe de seconde. Ensuite, ils passent en première, puis en terminale, l'année du baccalauréat. Les journées sont longues : les cours commencent souvent à huit heures et peuvent finir à dix-huit heures. Le mercredi après-midi, en revanche, certains lycéens n'ont pas cours.\n\nContrairement à l'Australie, la plupart des lycées publics n'imposent pas d'uniforme. Les élèves portent ce qu'ils veulent, mais certains établissements privés ont un code vestimentaire. À midi, on mange à la cantine, où le repas comprend généralement une entrée, un plat principal, un fromage ou un yaourt et un dessert.\n\nDepuis la réforme du bac, les élèves choisissent trois spécialités en première, puis en gardent deux en terminale. Léa, élève à Bordeaux, explique : « J'ai choisi les maths et la physique parce que je voudrais devenir ingénieure. C'est beaucoup de travail, mais je suis motivée. »\n\nCependant, beaucoup de lycéens se plaignent du stress. Ils disent qu'ils ne dorment pas assez pendant la période des examens et qu'ils ont peu de temps pour leurs loisirs.",
        questions: [
          {
            prompt: 'In which year of lycée do French students sit the baccalauréat?',
            options: ['Seconde', 'Première', 'Terminale', 'Troisième'],
            answer: 2,
          },
          {
            prompt: 'What does the text say about uniforms?',
            options: [
              'All lycées require a uniform',
              'Most public lycées do not require a uniform',
              'Uniforms are only worn on Wednesdays',
              'Uniforms were banned by the bac reform',
            ],
            answer: 1,
          },
          {
            prompt: 'Why did Léa choose maths and physics, and how does she feel about it?',
            model: 'She wants to become an engineer. It is a lot of work, but she is motivated.',
          },
          {
            prompt:
              "(En français) Selon vous, quels sont les avantages et les inconvénients de la journée scolaire française par rapport à celle de l'Australie ? (environ 60 mots)",
            model:
              "À mon avis, la journée scolaire française est trop longue : finir à dix-huit heures doit être fatigant. En revanche, j'aime l'idée de ne pas porter d'uniforme et de manger un vrai repas à la cantine. En Australie, nous finissons plus tôt, ce qui nous laisse du temps pour le sport et un petit boulot, mais nous devons porter un uniforme.",
          },
        ],
      },
      {
        id: 'qce-u1-t3-write',
        title: 'Writing: Courriel à ton correspondant',
        kind: 'writing',
        instructions:
          "Votre correspondant français, Théo, vous demande comment se passe l'école en Australie. Écrivez-lui un courriel (150 à 250 mots) : décrivez votre vie scolaire, comparez-la avec la sienne, évaluez les avantages et les difficultés, et posez-lui des questions.",
        criteria: [
          'Email conventions: greeting, informal register (tu), sign-off',
          'Describe your school day, subjects and uniform',
          'Recount a past school event (passé composé + imparfait)',
          'Evaluate benefits and challenges with justified opinions',
          'Use a subjunctive (il faut que ...) and a conditional (ce serait ...)',
          'Ask your penfriend at least one question',
        ],
        model:
          "Salut Théo,\n\nMerci pour ton dernier courriel ! Tu m'as demandé de te parler de ma vie scolaire ici, à Brisbane, alors voilà.\n\nJe suis en Year 11 dans un lycée public. Les cours commencent à huit heures et demie et finissent à trois heures, ce qui est beaucoup plus court qu'en France ! Par contre, nous devons porter un uniforme : une chemise bleue, un short gris et, bien sûr, un chapeau, parce que le soleil est très fort. Je trouve que l'uniforme est pratique, même si ce n'est pas très élégant.\n\nCette année, j'étudie six matières, dont le français, la biologie et les maths. Ma matière préférée, c'est la biologie, car notre prof nous emmène souvent faire des expériences sur le terrain. L'année dernière, nous sommes allés sur la Grande Barrière de corail pour étudier les coraux. C'était inoubliable !\n\nBien sûr, il y a aussi des inconvénients. Nous avons beaucoup de devoirs et les évaluations internes sont stressantes. Il faut que je m'organise mieux, sinon je n'aurai pas assez de temps pour mon petit boulot au supermarché.\n\nEt toi, comment se passe ta terminale ? Est-ce que tu aimerais venir en Australie pour un échange ? Ce serait génial !\n\nÀ bientôt,\nJordan",
      },
    ],
  },

  /* ===================== UNIT 2 — L'EXPLORATION DU MONDE ===================== */
  {
    id: 'qce-u2-t1',
    unit: 'Unit 2',
    title: 'Travel and exploration',
    titleFr: 'Les voyages et la découverte',
    description:
      'Discuss travel options and experiences in French-speaking communities, evaluate destinations and the benefits of travel, and investigate a famous French-speaking destination.',
    subtopics: [
      'Travel options and experiences, e.g. booking accommodation, seeking advice about tourist activities',
      'Evaluating tourist destinations and the benefits of travel',
      'Significant features of a famous destination in a French-speaking community',
    ],
    linkedUnits: ['a1-u8', 'a1-u4'],
    keyVocab: [
      { fr: 'un séjour', en: 'a stay, a trip' },
      { fr: "l'hébergement (m)", en: 'accommodation' },
      { fr: 'réserver', en: 'to book' },
      { fr: "l'office de tourisme (m)", en: 'tourist information office' },
      { fr: 'complet / complète', en: 'full, booked out' },
      { fr: 'un billet aller-retour', en: 'a return ticket' },
      { fr: 'le dépaysement', en: 'the feeling of being somewhere totally different' },
      { fr: 'le patrimoine mondial', en: 'world heritage' },
      { fr: 'le lagon', en: 'the lagoon' },
      { fr: 'louer un vélo', en: 'to hire a bike' },
      { fr: "ouvrir l'esprit", en: 'to broaden the mind' },
      { fr: 'sortir de sa zone de confort', en: 'to step out of your comfort zone' },
      { fr: 'une destination', en: 'a destination' },
      { fr: 'le tourisme durable', en: 'sustainable tourism' },
    ],
    usefulPhrases: [
      { fr: "Je voudrais réserver une chambre pour deux nuits.", en: "I'd like to book a room for two nights." },
      { fr: "Qu'est-ce que vous me conseillez de visiter ?", en: 'What do you recommend I visit?' },
      { fr: "Ce qui m'a le plus marqué, c'est ...", en: 'What struck me most was ...' },
      { fr: "C'était inoubliable !", en: 'It was unforgettable!' },
      { fr: 'Je recommande vivement cette destination.', en: 'I highly recommend this destination.' },
      { fr: "Selon moi, voyager est essentiel car ...", en: 'In my view, travelling is essential because ...' },
      { fr: "Si j'avais assez d'argent, j'y retournerais.", en: "If I had enough money, I'd go back there." },
      { fr: "Le meilleur voyage que j'aie jamais fait, c'est ...", en: "The best trip I've ever taken is ..." },
    ],
    tasks: [
      {
        id: 'qce-u2-t1-listen',
        title: "Listening: Message de l'office de tourisme",
        kind: 'listening',
        instructions:
          'You emailed the Annecy tourist office for advice. Listen to their phone message and answer in English.',
        stimulus:
          "Bonjour, ici l'office de tourisme d'Annecy. Merci pour votre courriel. Vous nous avez demandé des conseils pour votre séjour du 12 au 15 juillet. En été, nous vous recommandons une promenade en bateau sur le lac, qui dure une heure et coûte dix-huit euros par adulte. Si vous aimez le sport, vous pouvez louer un vélo et suivre la piste cyclable au bord du lac. Le mardi et le vendredi matin, il y a un grand marché dans la vieille ville, où vous pourrez goûter les fromages de la région, comme le reblochon. Attention : en juillet, les hôtels sont souvent complets, donc il vaut mieux réserver le plus tôt possible. N'hésitez pas à nous rappeler si vous avez d'autres questions. Bonne journée !",
        questions: [
          {
            prompt: 'What are the dates of your stay?',
            options: ['12–15 June', '12–15 July', '2–5 July', '15–20 July'],
            answer: 1,
          },
          {
            prompt: 'How long is the boat trip and how much does it cost?',
            options: ['30 minutes, €8', 'One hour, €18', 'Two hours, €18', 'One hour, €80'],
            answer: 1,
          },
          {
            prompt: 'When is the big market held?',
            options: ['Monday and Thursday mornings', 'Tuesday and Friday mornings', 'Every afternoon', 'Saturdays only'],
            answer: 1,
          },
          {
            prompt: 'What advice is given about hotels, and why?',
            model: 'Book as early as possible, because in July hotels are often full.',
          },
        ],
      },
      {
        id: 'qce-u2-t1-write',
        title: 'Writing: Blog de voyage',
        kind: 'writing',
        instructions:
          "Écrivez un article de blog (150 à 250 mots) sur un voyage, réel ou imaginaire, dans une région francophone. Décrivez la destination et ce que vous avez fait, évaluez l'expérience et expliquez pourquoi les voyages sont importants pour les jeunes.",
        criteria: [
          'Describe the destination and its significant features',
          'Narrate the trip: passé composé for events, imparfait for description/habits',
          'Evaluate the experience with justified opinions',
          'Discuss the benefits of travel for young people',
          'Include a hypothetical (si + imparfait → conditionnel)',
          'Blog conventions: title, personal and engaging voice',
        ],
        model:
          "Mon séjour inoubliable en Nouvelle-Calédonie\n\nL'été dernier, ma famille et moi avons passé dix jours à Nouméa, en Nouvelle-Calédonie. C'est à moins de trois heures d'avion de Brisbane, mais on a l'impression d'être dans un autre monde : on y parle français, on mange des croissants le matin et on paie en francs CFP !\n\nNous avons logé dans un petit hôtel près de la plage de l'Anse Vata. Chaque matin, je faisais du snorkeling dans le lagon, qui est inscrit au patrimoine mondial de l'UNESCO. Un jour, nous avons pris le bateau jusqu'à l'îlot Amédée, où j'ai vu des tortues de mer. C'était magnifique !\n\nCe qui m'a le plus marqué, c'est la culture kanak. Au centre culturel Tjibaou, nous avons découvert l'histoire et les traditions du peuple autochtone. Cela m'a fait réfléchir aux points communs avec les cultures aborigènes et insulaires du détroit de Torres.\n\nSelon moi, voyager est essentiel pour les jeunes, car cela nous ouvre l'esprit et nous oblige à sortir de notre zone de confort. Grâce à ce voyage, j'ai pu pratiquer mon français dans des situations réelles, par exemple quand j'ai commandé au restaurant. Si j'avais assez d'argent, j'y retournerais demain ! Je recommande vivement cette destination à tous les élèves qui apprennent le français.",
      },
      {
        id: 'qce-u2-t1-speak',
        title: 'Speaking: Les voyages',
        kind: 'speaking',
        instructions: 'Answer aloud. Try to use a past tense, an opinion and a conditional in each answer.',
        questions: [
          {
            prompt: "Quel est le meilleur voyage que tu aies jamais fait ?",
            model:
              "Le meilleur voyage que j'aie jamais fait, c'est un road trip en Tasmanie avec ma famille. Nous avons fait de la randonnée à Cradle Mountain et nous avons vu des wombats. Il faisait froid, mais les paysages étaient incroyables.",
          },
          {
            prompt: 'Préfères-tu voyager avec ta famille ou avec tes amis ? Pourquoi ?',
            model:
              "Pour l'instant, je préfère voyager avec ma famille, parce que mes parents paient tout ! Mais plus tard, j'aimerais voyager avec mes amis, car on serait plus libres de choisir nos activités.",
          },
          {
            prompt: 'Quels sont les avantages des voyages pour les jeunes ?',
            model:
              "À mon avis, voyager nous rend plus indépendants et plus tolérants. On découvre d'autres façons de vivre et on apprend à se débrouiller dans une autre langue. C'est aussi une excellente façon de se faire de nouveaux amis.",
          },
          {
            prompt: "Si tu pouvais visiter n'importe quel pays francophone, lequel choisirais-tu ?",
            model:
              "Je choisirais le Québec, parce que je voudrais voir la neige et faire du ski. J'aimerais aussi visiter le vieux Montréal et goûter la poutine. En plus, ce serait intéressant d'entendre l'accent québécois !",
          },
        ],
      },
    ],
  },
  {
    id: 'qce-u2-t2',
    unit: 'Unit 2',
    title: 'Social customs',
    titleFr: 'Les coutumes sociales',
    description:
      'Examine social customs and cultural conventions in French-speaking communities, how food and festivals create a sense of belonging, and rites of passage that reveal cultural values.',
    subtopics: [
      'Social customs and cultural conventions in French-speaking communities',
      'Food and festivals and how they develop a sense of belonging',
      'Rites of passage in French-speaking communities and what they reveal about cultural values',
    ],
    linkedUnits: ['a1-u6'],
    keyVocab: [
      { fr: 'une coutume', en: 'a custom' },
      { fr: 'une fête', en: 'a celebration, festival, party' },
      { fr: 'la fête nationale', en: 'national day' },
      { fr: 'faire la bise', en: 'to greet with kisses on the cheek' },
      { fr: 'se serrer la main', en: 'to shake hands' },
      { fr: 'la galette des rois', en: "kings' cake (eaten at Epiphany)" },
      { fr: 'la fève', en: 'small charm hidden in the galette' },
      { fr: "le feu d'artifice", en: 'fireworks' },
      { fr: 'le défilé', en: 'the parade' },
      { fr: 'un rite de passage', en: 'a rite of passage' },
      { fr: "le sentiment d'appartenance", en: 'sense of belonging' },
      { fr: 'transmettre', en: 'to pass on (a tradition)' },
      { fr: 'un repas de famille', en: 'a family meal' },
      { fr: 'se rassembler', en: 'to gather together' },
    ],
    usefulPhrases: [
      { fr: 'Cette tradition révèle que ...', en: 'This tradition shows that ...' },
      { fr: "Ces fêtes nous relient les uns aux autres.", en: 'These celebrations connect us to one another.' },
      { fr: "Je me sens vraiment chez moi quand ...", en: 'I really feel at home when ...' },
      { fr: "Il est important de garder nos traditions pour que les jeunes les connaissent.", en: 'It is important to keep our traditions so that young people know them.' },
      { fr: "Ce qui m'étonne, c'est que ...", en: 'What surprises me is that ...' },
      { fr: "En France, on a l'habitude de ...", en: 'In France, people usually ...' },
      { fr: "Chez nous, en Australie, on ...", en: 'Here in Australia, we ...' },
    ],
    tasks: [
      {
        id: 'qce-u2-t2-read',
        title: 'Reading: Des fêtes qui rassemblent',
        kind: 'reading',
        instructions: 'Read the article. Answer questions 1–4 in English and question 5 in French.',
        stimulus:
          "En France, l'année est rythmée par de nombreuses fêtes. En janvier, pour l'Épiphanie, les familles et les amis partagent la galette des rois, une pâtisserie à la frangipane. À l'intérieur, on cache une petite figurine, la fève. La personne qui la trouve devient le roi ou la reine et porte une couronne en papier. Traditionnellement, le plus jeune se met sous la table et désigne qui reçoit chaque part, pour que personne ne triche !\n\nLe 21 juin, c'est la Fête de la musique. Créée en 1982, elle permet à tout le monde, amateurs comme professionnels, de jouer gratuitement dans les rues, les parcs et les cafés. Aujourd'hui, elle est célébrée dans plus de cent pays.\n\nEnfin, le 14 juillet, jour de la fête nationale, beaucoup de Français regardent le défilé militaire sur les Champs-Élysées, puis admirent les feux d'artifice le soir. Dans les villages, on organise souvent un bal populaire.\n\nPour Mathis, 17 ans, ces fêtes sont importantes : « Quand je mange la galette avec mes cousins ou quand je danse au bal du 14 juillet, je me sens vraiment chez moi. Ces traditions nous relient les uns aux autres. »",
        questions: [
          {
            prompt: 'What happens to the person who finds the fève?',
            options: [
              'They must bake the next galette',
              'They become king or queen and wear a paper crown',
              'They have to hide under the table',
              'They pay for the meal',
            ],
            answer: 1,
          },
          {
            prompt: 'Why does the youngest person traditionally sit under the table?',
            model: 'To decide who receives each slice, so that nobody can cheat.',
          },
          {
            prompt: 'Which statement about the Fête de la musique is correct?',
            options: [
              'Only professional musicians may perform',
              'It began in 1982 and anyone can play for free in public places',
              'It takes place on 14 July',
              'It is only celebrated in Paris',
            ],
            answer: 1,
          },
          {
            prompt: 'How do these celebrations make Mathis feel, and why?',
            model: 'He feels truly at home, because the traditions connect people to one another (a sense of belonging).',
          },
          {
            prompt:
              "(En français) Décrivez une fête ou une tradition australienne qui crée un sentiment d'appartenance. (environ 60 mots)",
            model:
              "En Australie, le jour d'Anzac, le 25 avril, est très important. Le matin, beaucoup de gens assistent à la cérémonie de l'aube pour se souvenir des soldats. L'année dernière, j'ai participé au défilé avec mon école. C'était émouvant et j'ai eu l'impression de faire partie de ma communauté, même si c'était très tôt !",
          },
        ],
      },
      {
        id: 'qce-u2-t2-speak',
        title: 'Speaking: Coutumes et traditions',
        kind: 'speaking',
        instructions: 'Answer aloud, comparing French-speaking and Australian customs where you can.',
        questions: [
          {
            prompt: 'Comment est-ce qu\'on salue les gens en France ? Et en Australie ?',
            model:
              "En France, on fait souvent la bise à ses amis et à sa famille, c'est-à-dire qu'on s'embrasse sur les joues. Le nombre de bises dépend de la région ! En Australie, on dit simplement « Hi » ou on se serre la main. La première fois qu'une amie française m'a fait la bise, j'ai trouvé ça un peu bizarre, mais maintenant je trouve ça sympa.",
          },
          {
            prompt: 'Quelle est l\'importance des repas en famille en France ?',
            model:
              "En France, le repas est un moment très important. On prend son temps, on discute et on mange plusieurs plats. Je trouve que c'est une belle tradition, car chez nous, on mange souvent vite devant la télé.",
          },
          {
            prompt: 'Quelle fête préfères-tu et pourquoi ?',
            model:
              "Ma fête préférée, c'est Noël. En Australie, c'est l'été, alors nous faisons un barbecue et nous allons à la plage. L'année dernière, toute ma famille s'est réunie chez mon oncle à Noosa. C'était génial de voir mes cousins.",
          },
          {
            prompt: 'Est-ce important de garder les traditions ?',
            model:
              "Oui, à mon avis, c'est essentiel. Les traditions nous rappellent d'où nous venons et elles créent un sentiment d'appartenance. Il faut que les jeunes les connaissent, même si elles évoluent avec le temps.",
          },
        ],
      },
    ],
  },
  {
    id: 'qce-u2-t3',
    unit: 'Unit 2',
    title: 'French influences around the world',
    titleFr: 'Les influences françaises dans le monde',
    description:
      'Identify how French culture is maintained in the modern world and analyse how French-speaking cultures have influenced the world, including links with Australia and the Pacific.',
    subtopics: [
      'How French culture is maintained in the modern world',
      'How aspects of French-speaking cultures have influenced the world',
    ],
    linkedUnits: [],
    keyVocab: [
      { fr: 'la francophonie', en: 'the French-speaking world' },
      { fr: 'un/une francophone', en: 'a French speaker' },
      { fr: 'une langue officielle', en: 'an official language' },
      { fr: "l'influence (f)", en: 'influence' },
      { fr: 'le patrimoine culturel immatériel', en: 'intangible cultural heritage' },
      { fr: 'la gastronomie', en: 'fine food / culinary culture' },
      { fr: 'la mode', en: 'fashion' },
      { fr: "un explorateur / une exploratrice", en: 'an explorer' },
      { fr: 'un territoire', en: 'a territory' },
      { fr: 'se répandre', en: 'to spread' },
      { fr: 'maintenir', en: 'to maintain' },
      { fr: 'emprunter un mot', en: 'to borrow a word' },
      { fr: 'le rayonnement', en: 'reach, influence (of a culture)' },
    ],
    usefulPhrases: [
      { fr: "L'influence française se voit partout.", en: 'French influence can be seen everywhere.' },
      { fr: "Premièrement, ... Deuxièmement, ... Enfin, ...", en: 'Firstly, ... Secondly, ... Finally, ...' },
      { fr: 'souvent sans que nous le remarquions', en: 'often without us noticing it' },
      { fr: "Bien que l'anglais soit très répandu, ...", en: 'Although English is very widespread, ...' },
      { fr: "Non seulement ..., mais aussi ...", en: 'Not only ..., but also ...' },
      { fr: 'Vous ne le regretterez pas !', en: "You won't regret it!" },
      { fr: 'Merci de votre attention.', en: 'Thank you for your attention.' },
    ],
    tasks: [
      {
        id: 'qce-u2-t3-read',
        title: 'Reading: Le français, une langue mondiale',
        kind: 'reading',
        instructions: 'Read the article and answer in English.',
        stimulus:
          "Le français n'est pas seulement la langue de la France. Aujourd'hui, plus de 300 millions de personnes parlent français sur les cinq continents, et c'est en Afrique que le nombre de francophones augmente le plus vite. Le français est aussi une langue officielle de nombreuses organisations internationales, comme l'ONU, l'Union européenne et le Comité international olympique.\n\nL'influence française se voit partout. En anglais, des mots comme « café », « ballet », « menu » ou « déjà vu » viennent directement du français. La cuisine française est appréciée dans le monde entier, et le « repas gastronomique des Français » figure sur la liste du patrimoine culturel immatériel de l'UNESCO depuis 2010.\n\nL'Australie a aussi des liens avec la France. En 1788, l'explorateur Jean-François de La Pérouse est arrivé à Botany Bay quelques jours après la Première Flotte ; un quartier de Sydney porte encore son nom. Aujourd'hui, la Nouvelle-Calédonie, territoire français du Pacifique, n'est qu'à quelques heures d'avion de Brisbane, et des milliers d'Australiens étudient le français chaque année.",
        questions: [
          {
            prompt: 'Where is the number of French speakers growing fastest?',
            options: ['Europe', 'North America', 'Africa', 'Oceania'],
            answer: 2,
          },
          {
            prompt: 'What has been on the UNESCO intangible cultural heritage list since 2010?',
            options: ['French cafés', 'The gastronomic meal of the French', 'The Tour de France', 'French fashion'],
            answer: 1,
          },
          {
            prompt: 'List three English words of French origin mentioned in the text.',
            model: 'Any three of: café, ballet, menu, déjà vu.',
          },
          {
            prompt: 'Identify two links between Australia and France or the French-speaking world mentioned in the text.',
            model:
              'Any two of: La Pérouse arrived at Botany Bay in 1788 and a Sydney suburb is named after him; New Caledonia (a French territory) is only a few hours from Brisbane; thousands of Australians study French each year.',
          },
        ],
      },
      {
        id: 'qce-u2-t3-write',
        title: 'Writing: Discours pour la Journée de la Francophonie',
        kind: 'writing',
        instructions:
          "Le 20 mars, c'est la Journée internationale de la Francophonie. Vous faites un discours à l'assemblée de votre école pour expliquer pourquoi la langue et la culture francophones restent importantes dans le monde moderne et encourager les élèves à étudier le français. Écrivez la transcription de votre discours (150 à 250 mots).",
        criteria: [
          'Speech conventions: address the audience, clear structure, concluding call to action',
          'Explain how French-speaking cultures influence the world, with examples',
          'Refer to French in the Pacific/Australian context',
          'Include a personal anecdote using past tenses',
          'Use connectives (premièrement, deuxièmement, enfin) and at least one subjunctive',
        ],
        model:
          "Bonjour à tous,\n\nAujourd'hui, c'est la Journée internationale de la Francophonie, et je voudrais vous expliquer pourquoi le français est encore si important dans le monde moderne.\n\nPremièrement, le français est une langue vraiment internationale. On le parle non seulement en France, mais aussi au Québec, au Sénégal, en Belgique, en Suisse et même tout près d'ici, en Nouvelle-Calédonie. Si vous apprenez le français, vous pourrez communiquer avec des millions de personnes sur cinq continents.\n\nDeuxièmement, la culture francophone nous influence tous les jours, souvent sans que nous le remarquions. Pensez aux mots « café », « restaurant » ou « ballet » ! Pensez aussi à la mode, au cinéma et à la cuisine. Le mois dernier, ma classe a assisté à un festival du film français à Brisbane, et nous avons vu une comédie québécoise hilarante.\n\nEnfin, apprendre une langue, c'est découvrir une autre façon de penser. Quand j'ai commencé le français en Year 7, je trouvais la grammaire difficile. Maintenant, je comprends des chansons, des séries et des articles que je ne pouvais pas lire avant.\n\nBien que l'anglais soit très répandu, il faut que nous restions ouverts aux autres langues. Alors, la prochaine fois que vous choisirez vos matières, pensez au français. Vous ne le regretterez pas !\n\nMerci de votre attention.",
      },
    ],
  },

  /* ===================== UNIT 3 — NOTRE SOCIÉTÉ ; CULTURE ET IDENTITÉ ===================== */
  {
    id: 'qce-u3-t1',
    unit: 'Unit 3',
    title: 'Lifestyles and leisure',
    titleFr: 'Les modes de vie et les loisirs',
    description:
      'Discuss how language and culture shape lifestyles and leisure in French-speaking communities, and explore how science and technology affect lifestyles in Australia and French-speaking communities. (IA1 is based on this topic.)',
    subtopics: [
      'How language and culture shape lifestyles and leisure in French-speaking communities',
      'How science and technology affect lifestyles and leisure in Australian and French-speaking communities',
    ],
    linkedUnits: ['a1-u7', 'a1-u5'],
    keyVocab: [
      { fr: 'le mode de vie', en: 'lifestyle' },
      { fr: 'les loisirs (m)', en: 'leisure activities' },
      { fr: "le temps d'écran", en: 'screen time' },
      { fr: 'une appli(cation)', en: 'an app' },
      { fr: 'se déconnecter', en: 'to disconnect, switch off' },
      { fr: 'interdire', en: 'to ban' },
      { fr: 'le sommeil', en: 'sleep' },
      { fr: 'perturber', en: 'to disrupt' },
      { fr: 'un jeu de société', en: 'a board game' },
      { fr: 'la randonnée', en: 'hiking, a hike' },
      { fr: 'la patinoire', en: 'ice rink' },
      { fr: 'le ski de fond', en: 'cross-country skiing' },
      { fr: 'un usage excessif', en: 'excessive use' },
      { fr: 'grâce à', en: 'thanks to' },
      { fr: 'à cause de', en: 'because of (negative)' },
    ],
    usefulPhrases: [
      { fr: "Je suis plutôt d'accord avec ... parce que ...", en: 'I mostly agree with ... because ...' },
      { fr: "Je ne suis pas tout à fait d'accord.", en: "I don't completely agree." },
      { fr: 'La technologie fait partie de notre vie.', en: 'Technology is part of our lives.' },
      { fr: 'Il faudrait plutôt apprendre aux jeunes à ...', en: 'We should rather teach young people to ...' },
      { fr: "Le climat influence beaucoup notre mode de vie.", en: 'The climate strongly influences our lifestyle.' },
      { fr: "Il vaut mieux ... que ...", en: 'It is better to ... than ...' },
      { fr: "Si j'habitais en France, je ...", en: 'If I lived in France, I would ...' },
      { fr: 'Pour conclure, ...', en: 'To conclude, ...' },
    ],
    tasks: [
      {
        id: 'qce-u3-t1-read',
        title: 'Reading (IA1 style): Vivre sans écran ?',
        kind: 'reading',
        instructions:
          'Exam-style short response. Read the article, then answer questions 1–4 in English. Respond in complete sentences and include specific details from the text.',
        stimulus:
          "Depuis 2018, l'utilisation du téléphone portable est interdite dans les écoles et les collèges en France. Au Queensland, les élèves des écoles publiques doivent aussi ranger leur téléphone pendant toute la journée depuis 2024. Mais qu'en pensent les jeunes ?\n\nPour Manon, 16 ans, qui habite à Toulouse, c'est une bonne idée : « Avant, à la récré, tout le monde regardait son écran. Maintenant, on discute, on rigole, on joue aux cartes. Je me sens moins stressée. »\n\nSon frère Lucas, 18 ans, n'est pas tout à fait d'accord : « La technologie fait partie de notre vie. Grâce à mon téléphone, je fais du sport avec une appli de course, j'écoute des podcasts en anglais et je reste en contact avec ma copine, qui fait ses études au Canada. Il faudrait plutôt apprendre aux jeunes à bien l'utiliser. »\n\nLes spécialistes rappellent qu'un usage excessif des écrans, surtout le soir, peut perturber le sommeil. Ils conseillent d'éteindre son téléphone au moins une heure avant de se coucher et de passer du temps dehors. Le week-end dernier, Manon et Lucas ont essayé une « journée sans écran » en famille : randonnée, pique-nique et jeux de société. Résultat ? « C'était plus amusant que prévu ! » avoue Lucas.",
        questions: [
          {
            prompt: 'Since when have Queensland state school students had to put their phones away for the whole day?',
            options: ['2018', '2020', '2024', '2026'],
            answer: 2,
          },
          {
            prompt: 'How has recess changed for Manon, and how does she feel?',
            model:
              'Before, everyone looked at their screens; now students chat, laugh and play cards. She feels less stressed.',
          },
          {
            prompt: 'Identify three positive ways Lucas uses his phone.',
            model:
              'He exercises with a running app, he listens to podcasts in English, and he stays in touch with his girlfriend who is studying in Canada.',
          },
          {
            prompt: 'What do experts advise?',
            options: [
              'Banning phones at home',
              'Switching phones off at least an hour before bed and spending time outdoors',
              'Using only educational apps',
              'Using phones only on weekends',
            ],
            answer: 1,
          },
        ],
      },
      {
        id: 'qce-u3-t1-listen',
        title: "Listening: L'hiver à Montréal",
        kind: 'listening',
        instructions: 'Listen to Félix describe leisure in Montréal (up to three plays). Answer in English.',
        stimulus:
          "Salut, je m'appelle Félix et j'habite à Montréal. Ici, l'hiver est très long et il fait souvent moins vingt degrés ! Pourtant, on ne reste pas enfermés à la maison. Le samedi matin, je joue au hockey sur une patinoire extérieure près de chez moi. L'après-midi, je fais souvent du ski de fond sur le mont Royal avec mes parents. Quand il fait vraiment trop froid, je retrouve mes amis dans la ville souterraine, où il y a des boutiques, des restaurants et même un cinéma. En été, c'est complètement différent : il y a des festivals presque chaque semaine, comme le Festival international de jazz. Franchement, je pense que le climat influence beaucoup notre mode de vie. Si j'habitais en Australie, je ferais sûrement du surf tous les week-ends !",
        questions: [
          {
            prompt: 'What does Félix do on Saturday mornings?',
            options: ['Cross-country skiing', 'Ice hockey on an outdoor rink', 'Shopping', 'Surfing'],
            answer: 1,
          },
          {
            prompt: 'Where does he meet his friends when it is too cold?',
            options: ['At school', 'In the underground city', 'At a suburban cinema', 'At his home'],
            answer: 1,
          },
          {
            prompt: 'What is summer like in Montréal, according to Félix?',
            options: [
              'Quiet, with nothing to do',
              'There are festivals almost every week, such as the jazz festival',
              'Too hot to go outside',
              'The best season for hockey',
            ],
            answer: 1,
          },
          {
            prompt: 'What would Félix do if he lived in Australia?',
            options: ['Go skiing', 'Play hockey', 'Surf every weekend', 'Go to jazz festivals'],
            answer: 2,
          },
          {
            prompt: 'What general conclusion does Félix draw about lifestyle?',
            model: "He thinks the climate strongly influences people's way of life.",
          },
        ],
      },
      {
        id: 'qce-u3-t1-short',
        title: 'Short response in French (IA1 Q4–5 style)',
        kind: 'short-response',
        instructions:
          'In IA1, the final questions are answered in French. Using the ideas from "Vivre sans écran ?" and "L\'hiver à Montréal", answer each question in French in about 80 words.',
        questions: [
          {
            prompt: "Êtes-vous plutôt d'accord avec Manon ou avec Lucas ? Justifiez votre réponse.",
            model:
              "Je suis plutôt d'accord avec Lucas. Bien sûr, Manon a raison de dire que les écrans peuvent nous isoler à la récré. Cependant, la technologie fait partie de notre vie : moi, j'utilise mon téléphone pour réviser mon vocabulaire de français et pour parler avec mes grands-parents en Angleterre. Au lieu d'interdire les téléphones, il faudrait que les écoles nous apprennent à les utiliser de façon responsable, par exemple en limitant les réseaux sociaux le soir.",
          },
          {
            prompt: 'Comparez les loisirs de Félix avec les loisirs des jeunes en Australie. Comment le climat influence-t-il les modes de vie ?',
            model:
              "Félix pratique des sports d'hiver comme le hockey et le ski de fond, alors qu'en Australie, beaucoup de jeunes font du surf, de la natation ou du cricket. Chez nous, il fait beau presque toute l'année, donc on passe beaucoup de temps dehors, à la plage ou au parc. À Montréal, quand il fait moins vingt, les gens se retrouvent dans la ville souterraine. Je pense donc que le climat détermine en grande partie nos loisirs, mais que les jeunes s'adaptent partout.",
          },
        ],
      },
    ],
  },
  {
    id: 'qce-u3-t2',
    unit: 'Unit 3',
    title: 'The arts, entertainment and sports',
    titleFr: 'Les arts, le divertissement et le sport',
    description:
      'Investigate a prominent French speaker and their contribution to the arts, entertainment or sport, and discuss youth culture (series, comedies, music) and what it reveals about culture. (IA2 may draw on this topic.)',
    subtopics: [
      'A significant/prominent French speaker and their contribution to the arts, entertainment or sport',
      'Youth culture (e.g. comedies, TV series, music) and how it entertains, influences and reveals culture',
    ],
    linkedUnits: ['a1-u7'],
    keyVocab: [
      { fr: 'un chanteur / une chanteuse', en: 'a singer' },
      { fr: 'un tube', en: 'a hit (song)' },
      { fr: 'les paroles (f)', en: 'lyrics' },
      { fr: 'un album', en: 'an album' },
      { fr: 'une tournée', en: 'a tour' },
      { fr: 'une série', en: 'a TV series' },
      { fr: 'un épisode', en: 'an episode' },
      { fr: 'un rebondissement', en: 'a plot twist' },
      { fr: 'en version originale (VO)', en: 'in the original language' },
      { fr: 'un sportif / une sportive de haut niveau', en: 'an elite athlete' },
      { fr: 'remporter une médaille', en: 'to win a medal' },
      { fr: 'un modèle', en: 'a role model' },
      { fr: 'la santé mentale', en: 'mental health' },
      { fr: 'influencer', en: 'to influence' },
    ],
    usefulPhrases: [
      { fr: "Ce qui rend ... unique, c'est ...", en: 'What makes ... unique is ...' },
      { fr: 'Il/Elle est bien plus qu\'un(e) ...', en: 'He/She is much more than a ...' },
      { fr: 'Cette série révèle beaucoup de choses sur ...', en: 'This series reveals a lot about ...' },
      { fr: "Bien que ce soit une fiction, elle fait réfléchir.", en: 'Although it is fiction, it makes you think.' },
      { fr: 'Il faut absolument que vous la regardiez !', en: 'You absolutely must watch it!' },
      { fr: "Ce que j'aime surtout, ce sont ...", en: 'What I like most are ...' },
      { fr: "Il/Elle m'inspire parce que ...", en: 'He/She inspires me because ...' },
      { fr: 'Je vous conseille de ...', en: 'I advise you to ...' },
    ],
    tasks: [
      {
        id: 'qce-u3-t2-read',
        title: 'Reading: Stromae, un artiste hors du commun',
        kind: 'reading',
        instructions: 'Read the profile of a prominent French speaker and answer in English.',
        stimulus:
          "Paul Van Haver, plus connu sous le nom de Stromae, est né à Bruxelles en 1985. Son père était rwandais et sa mère est belge. Il n'a presque pas connu son père, qui a été tué pendant le génocide des Tutsi au Rwanda en 1994. Cette absence a inspiré l'une de ses chansons les plus célèbres, « Papaoutai ».\n\nEn 2009, son tube « Alors on danse » a connu un succès international. Ensuite, son album Racine carrée, sorti en 2013, s'est vendu à des millions d'exemplaires. Ce qui rend Stromae unique, c'est qu'il mélange des rythmes électroniques très dansants avec des paroles souvent graves, qui parlent de la solitude, de la maladie ou des relations familiales.\n\nAprès une tournée mondiale épuisante, l'artiste a fait une longue pause pour des raisons de santé. Il est revenu en 2022 avec l'album Multitude, mais il a dû annuler une partie de sa tournée en 2023. Il a parlé ouvertement de sa santé mentale, notamment dans la chanson « L'enfer ».\n\nPour beaucoup de jeunes francophones, Stromae est bien plus qu'un chanteur : il montre qu'on peut être sensible, créatif et parler de ses difficultés sans honte.",
        questions: [
          {
            prompt: 'What inspired the song « Papaoutai »?',
            options: ["His mother's illness", 'The absence of his father', 'His world tour', 'A break-up'],
            answer: 1,
          },
          {
            prompt: 'When was the album Racine carrée released?',
            options: ['2009', '2013', '2022', '2023'],
            answer: 1,
          },
          {
            prompt: "What makes Stromae's music unique, according to the article?",
            model:
              'He mixes very danceable electronic rhythms with often serious lyrics about loneliness, illness or family relationships.',
          },
          {
            prompt: 'Why is Stromae a role model for many young French speakers?',
            model:
              'He has spoken openly about his mental health, showing that you can be sensitive and creative and talk about your difficulties without shame.',
          },
        ],
      },
      {
        id: 'qce-u3-t2-write',
        title: 'Writing (IA2 style): Une série qui influence les jeunes',
        kind: 'writing',
        instructions:
          "Vous écrivez un article de blog pour un site destiné aux jeunes qui apprennent le français. Présentez une série, un film ou un artiste francophone que vous aimez. Expliquez comment cette œuvre divertit et influence les jeunes, et ce qu'elle révèle sur la culture francophone. Écrivez 150 à 250 mots.",
        criteria: [
          'Present the work/artist with relevant background information',
          'Explain how it entertains and influences young people',
          'Analyse what it reveals about French-speaking culture or society',
          'Justify opinions; use relative pronouns (qui, que, où, ce que)',
          'Range of tenses including a subjunctive (bien que / il faut que)',
          'Blog conventions: title, direct address to readers, recommendation',
        ],
        model:
          "Pourquoi je suis accro à « Lupin »\n\nSi vous cherchez une série pour améliorer votre français, je vous conseille « Lupin », sur Netflix. Je l'ai découverte l'année dernière, quand notre prof de français nous en a montré un épisode en classe, et depuis, j'ai regardé toutes les saisons !\n\nLa série raconte l'histoire d'Assane Diop, joué par Omar Sy, un homme qui s'inspire du célèbre gentleman cambrioleur Arsène Lupin, le héros des romans de Maurice Leblanc. Assane veut venger son père, qui a été accusé d'un vol qu'il n'avait pas commis. Ce que j'aime surtout, ce sont les rebondissements : on ne sait jamais ce qui va se passer.\n\nÀ mon avis, cette série révèle beaucoup de choses sur la société française. Elle montre les beaux quartiers de Paris, bien sûr, mais elle parle aussi des inégalités et du racisme. Bien que ce soit une fiction, elle fait réfléchir.\n\nLes séries comme « Lupin » influencent énormément les jeunes. Grâce à elles, des millions de personnes dans le monde s'intéressent à la culture française. Moi, par exemple, je voudrais visiter le Louvre, où se passe le premier épisode.\n\nSi vous ne l'avez pas encore vue, il faut absolument que vous la regardiez, en version originale, évidemment !",
      },
      {
        id: 'qce-u3-t2-speak',
        title: 'Speaking (IA2 conversation style): Le sport et les modèles',
        kind: 'speaking',
        instructions:
          'In the IA2 conversation you get a short unseen stimulus (visual, or a short written text) and planning time. Read this text, take a few minutes to note ideas, then answer the questions aloud.',
        stimulus:
          "Aux Jeux olympiques de Paris 2024, le nageur toulousain Léon Marchand a remporté quatre médailles d'or individuelles. Pendant ses courses, toute la France retenait son souffle. Ses parents étaient eux aussi des nageurs de haut niveau. Aujourd'hui, de nombreux enfants s'inscrivent dans des clubs de natation en espérant devenir le prochain Léon.",
        questions: [
          {
            prompt: 'De quoi parle ce texte ?',
            model:
              "Ce texte parle de Léon Marchand, un nageur français qui a gagné quatre médailles d'or aux Jeux olympiques de Paris. Il explique que sa réussite a inspiré beaucoup d'enfants à faire de la natation.",
          },
          {
            prompt: 'Quel sportif ou quelle sportive t\'inspire ? Pourquoi ?',
            model:
              "La nageuse australienne Ariarne Titmus m'inspire beaucoup. Elle s'entraîne très dur depuis qu'elle est petite et elle reste humble malgré ses médailles. Quand je l'ai vue gagner aux Jeux olympiques, j'ai eu envie de me remettre au sport.",
          },
          {
            prompt: 'Est-ce que les sportifs célèbres ont une influence positive sur les jeunes ?',
            model:
              "En général, oui, parce qu'ils montrent que le travail et la persévérance paient. Cependant, il faut qu'ils fassent attention à leur comportement, car les jeunes les imitent. Certains sportifs font aussi de la publicité pour des produits qui ne sont pas bons pour la santé.",
          },
          {
            prompt: 'Le sport est-il important dans la culture australienne ?',
            model:
              "Absolument ! En Australie, le sport fait partie de notre identité. On regarde le State of Origin en famille, on joue au cricket l'été et on va à la plage tous les week-ends. Je pense que c'est encore plus vrai maintenant que Brisbane va accueillir les Jeux olympiques en 2032.",
          },
        ],
      },
    ],
  },
  {
    id: 'qce-u3-t3',
    unit: 'Unit 3',
    title: 'Groups in society',
    titleFr: 'Les groupes dans la société',
    description:
      'Evaluate how young people establish group identity, how they relate to and express opinions about other groups, and the influence of French culture, society and places on groups. (IA2 may draw on this topic.)',
    subtopics: [
      'How young people establish group identity through socialising and connecting with peers',
      'How young people relate to, and express opinions about, other groups',
      'French culture/society/places and their influence on groups',
    ],
    linkedUnits: [],
    keyVocab: [
      { fr: "l'identité (f)", en: 'identity' },
      { fr: 'appartenir à', en: 'to belong to' },
      { fr: 'un groupe', en: 'a group' },
      { fr: 'les préjugés (m)', en: 'prejudices' },
      { fr: 'un stéréotype', en: 'a stereotype' },
      { fr: 'exclure', en: 'to exclude' },
      { fr: 'se moquer de', en: 'to make fun of' },
      { fr: "l'isolement (m)", en: 'isolation' },
      { fr: 'les personnes âgées / les seniors', en: 'elderly people / seniors' },
      { fr: 'intergénérationnel(le)', en: 'intergenerational' },
      { fr: 'la colocation', en: 'house/flat sharing' },
      { fr: 'le bénévolat', en: 'volunteering' },
      { fr: 'militer pour', en: 'to campaign for' },
      { fr: 'lutter contre', en: 'to fight against' },
    ],
    usefulPhrases: [
      { fr: 'Appartenir à un groupe nous donne une identité.', en: 'Belonging to a group gives us an identity.' },
      { fr: 'Les adultes ont souvent des préjugés sur les jeunes.', en: 'Adults often have prejudices about young people.' },
      { fr: "Il faut que chacun puisse trouver sa place.", en: 'Everyone must be able to find their place.' },
      { fr: "C'est en apprenant à connaître les autres qu'on détruit les stéréotypes.", en: 'It is by getting to know others that we break down stereotypes.' },
      { fr: "J'avais peur qu'on n'ait rien en commun.", en: 'I was afraid we would have nothing in common.' },
      { fr: 'En fait, ...', en: 'Actually, ...' },
      { fr: "Par ailleurs, ...", en: 'Furthermore, ...' },
      { fr: "Si je pouvais changer une chose, j'organiserais ...", en: 'If I could change one thing, I would organise ...' },
    ],
    tasks: [
      {
        id: 'qce-u3-t3-read',
        title: 'Reading: Étudiants et seniors sous le même toit',
        kind: 'reading',
        instructions: 'Read the article about intergenerational house sharing and answer in English.',
        stimulus:
          "À Lyon, Inès, 19 ans, étudiante en droit, partage l'appartement de Madeleine, 82 ans. Ce type de logement, appelé « colocation intergénérationnelle », devient de plus en plus populaire en France. Le principe est simple : l'étudiant paie un loyer très bas, ou ne paie rien du tout, et en échange, il tient compagnie à la personne âgée, l'aide à faire les courses ou passe la soirée avec elle.\n\n« Au début, j'avais peur qu'on n'ait rien en commun, avoue Inès. Je pensais que les personnes âgées étaient un peu ennuyeuses et qu'elles critiquaient toujours les jeunes. En fait, Madeleine est passionnante ! Elle m'a raconté comment elle avait manifesté en mai 68. »\n\nDe son côté, Madeleine apprécie la présence de la jeune femme : « Depuis la mort de mon mari, je me sentais très seule. Maintenant, Inès m'apprend à envoyer des photos à mes petits-enfants avec mon portable, et moi, je lui apprends à cuisiner. »\n\nSelon les associations, ces échanges aident à lutter contre l'isolement des seniors et contre les préjugés entre les générations.",
        questions: [
          {
            prompt: 'What does the student offer in exchange for very low (or no) rent?',
            options: [
              'Cleaning the whole house',
              'Company and help, e.g. with shopping or spending evenings together',
              'Paying all the bills',
              'Cooking every meal',
            ],
            answer: 1,
          },
          {
            prompt: 'What preconceptions did Inès have about older people at first?',
            model: 'She thought they were a bit boring and that they always criticised young people (and feared they would have nothing in common).',
          },
          {
            prompt: 'Give two ways Madeleine has benefited from the arrangement.',
            model:
              "Any two of: she feels less lonely since her husband died; Inès teaches her to send photos to her grandchildren on her phone; she enjoys the young woman's company (and in turn teaches Inès to cook).",
          },
          {
            prompt: 'According to associations, what do these exchanges help to fight?',
            options: [
              'Unemployment',
              'The isolation of seniors and prejudice between generations',
              'Only the housing shortage',
              'Student debt',
            ],
            answer: 1,
          },
        ],
      },
      {
        id: 'qce-u3-t3-write',
        title: "Writing (IA2 style): Appartenir sans exclure",
        kind: 'writing',
        instructions:
          "Le magazine francophone de votre école vous demande un article d'opinion : « Les groupes chez les jeunes : une force ou un problème ? » Évaluez comment les jeunes construisent leur identité de groupe et comment ils perçoivent les autres groupes (et comment les autres les perçoivent). Écrivez 150 à 250 mots.",
        criteria: [
          'Evaluate both benefits and drawbacks of group identity',
          'Discuss stereotypes/opinions between groups (e.g. teens and adults)',
          'Support ideas with personal examples (past tenses)',
          'Use a subjunctive and a si-clause with the conditional',
          'Article conventions: title, logical paragraphs, clear conclusion',
        ],
        model:
          "Les jeunes et les groupes : appartenir sans exclure\n\nAu lycée, presque tout le monde appartient à un groupe. Il y a les sportifs, les musiciens, les gamers et ceux qui passent leur temps au club de théâtre. Moi, je fais partie de l'équipe de football de mon école depuis le Year 8, et mes coéquipiers sont devenus mes meilleurs amis.\n\nÀ mon avis, appartenir à un groupe est essentiel quand on est adolescent. Cela nous donne une identité et un sentiment de sécurité. Quand ma famille a déménagé à Cairns il y a trois ans, je ne connaissais personne. C'est grâce au foot que j'ai pu me faire des amis rapidement.\n\nCependant, les groupes peuvent aussi exclure les autres. Certains élèves se moquent de ceux qui ne s'habillent pas comme eux ou qui n'écoutent pas la même musique. C'est dommage, car on rate l'occasion de rencontrer des gens intéressants.\n\nPar ailleurs, les adultes ont souvent des préjugés sur les jeunes. Ils pensent que nous sommes toujours sur nos téléphones et que nous ne nous intéressons à rien. Pourtant, beaucoup de mes amis font du bénévolat ou militent pour l'environnement.\n\nIl faut que chacun puisse trouver sa place sans rejeter les autres. Si je pouvais changer une chose dans mon école, j'organiserais plus d'activités qui mélangent les élèves de tous les groupes. Selon moi, c'est en apprenant à connaître les autres qu'on détruit les stéréotypes.",
      },
    ],
  },

  /* ===================== UNIT 4 — MON PRÉSENT ; MON AVENIR ===================== */
  {
    id: 'qce-u4-t1',
    unit: 'Unit 4',
    title: 'The present',
    titleFr: 'Le présent',
    description:
      'Reflect on the end of school life and its celebrations, the role of young people in shaping the future (technology, sustainability, innovation), social and global events that interest young people, and volunteering. (IA3 and the external exam draw on Unit 4.)',
    subtopics: [
      'The end of school life, graduation ceremonies and end-of-school celebrations in Australia and French-speaking communities',
      'The role of young people in shaping the future, e.g. through technology, sustainability and/or innovation',
      'Social and global events that interest young people',
      'The challenges and benefits of volunteering for young adults and communities',
    ],
    linkedUnits: ['a1-u3'],
    keyVocab: [
      { fr: 'la remise des diplômes', en: 'graduation ceremony' },
      { fr: 'le bal de promo', en: 'prom / school formal' },
      { fr: 'les résultats (m) du bac', en: 'bac results' },
      { fr: 'fêter', en: 'to celebrate' },
      { fr: 'devenir adulte', en: 'to become an adult' },
      { fr: 'un/une bénévole', en: 'a volunteer' },
      { fr: 'une association', en: 'a non-profit organisation, charity' },
      { fr: 'les personnes en difficulté', en: 'people in need' },
      { fr: "l'environnement (m)", en: 'the environment' },
      { fr: 'le développement durable', en: 'sustainability, sustainable development' },
      { fr: 'le changement climatique', en: 'climate change' },
      { fr: 'les inondations (f)', en: 'floods' },
      { fr: 'se soucier de', en: 'to care about' },
      { fr: 'une compétence', en: 'a skill' },
      { fr: "s'engager", en: 'to get involved, commit' },
    ],
    usefulPhrases: [
      { fr: "Quand j'aurai mon diplôme, ...", en: 'When I have my qualification, ...' },
      { fr: "à condition que + subjonctif", en: 'provided that ...' },
      { fr: 'Le bénévolat présente de nombreux avantages.', en: 'Volunteering has many advantages.' },
      { fr: "Cela a montré que notre génération se soucie des autres.", en: 'It showed that our generation cares about others.' },
      { fr: 'Malgré tout, je pense que ...', en: 'Despite everything, I think that ...' },
      { fr: "Les jeunes ont un rôle essentiel à jouer dans ...", en: 'Young people have an essential role to play in ...' },
      { fr: "Je ne pourrais plus m'en passer.", en: "I couldn't do without it now." },
      { fr: 'Il est temps que nous agissions.', en: 'It is time for us to act.' },
    ],
    tasks: [
      {
        id: 'qce-u4-t1-read',
        title: 'Reading: La fin du lycée, deux façons de célébrer',
        kind: 'reading',
        instructions: 'Read the article comparing end-of-school traditions and answer in English.',
        stimulus:
          "En Australie, la fin du Year 12 est marquée par plusieurs événements : la cérémonie de remise des diplômes, le « formal », une sorte de bal de fin d'année, et, pour beaucoup de jeunes du Queensland, la semaine de « Schoolies » sur la Gold Coast. Pendant cette semaine, des milliers d'élèves fêtent la fin de leurs études à la plage.\n\nEn France, les traditions sont un peu différentes. Une cérémonie de remise des diplômes existe dans certains lycées, mais elle a souvent lieu à l'automne, quand les élèves sont déjà partis, et elle est beaucoup moins importante qu'en Australie. Le moment le plus attendu, c'est le jour des résultats du bac, début juillet. Les élèves se retrouvent devant leur lycée ou consultent leurs résultats en ligne. Ceux qui ont réussi crient de joie, s'embrassent et appellent leur famille. Certains lycées organisent aussi un « bal de promo », une tradition inspirée des États-Unis qui devient de plus en plus populaire.\n\nPour Clara, élève de terminale à Nantes, « le bac, c'est comme un rite de passage. Quand j'aurai mon diplôme, j'aurai l'impression de devenir adulte. » Cet été, elle partira en vacances en Bretagne avec ses amis pour fêter ses résultats, à condition qu'elle réussisse, bien sûr !",
        questions: [
          {
            prompt: 'When are the bac results published?',
            options: ['Late November', 'Early July', 'At Christmas', 'In September'],
            answer: 1,
          },
          {
            prompt: 'Name the three end-of-school events mentioned for Queensland students.',
            model: 'The graduation ceremony, the formal (end-of-year ball) and Schoolies week on the Gold Coast.',
          },
          {
            prompt: 'What is a « bal de promo »?',
            options: ['A diploma ceremony', 'A prom, a tradition inspired by the United States', 'A school sports day', 'A school trip to Brittany'],
            answer: 1,
          },
          {
            prompt: 'Why does Clara see the bac as a rite of passage, and what condition is attached to her holiday plans?',
            model:
              'Getting her diploma will make her feel she is becoming an adult. She will go on holiday to Brittany with friends only if she passes.',
          },
        ],
      },
      {
        id: 'qce-u4-t1-write',
        title: 'Writing: Le bénévolat chez les jeunes',
        kind: 'writing',
        instructions:
          "Vous écrivez un article pour la lettre d'information de votre école. Sujet : « Le bénévolat : une perte de temps ou une chance pour les jeunes ? » Discutez des avantages et des difficultés du bénévolat pour les jeunes et pour la communauté. Écrivez 150 à 250 mots.",
        criteria: [
          'Discuss benefits and challenges for both young people and communities',
          'Support points with personal experience and a real Australian example',
          'Use connectives to structure the argument (premièrement, de plus, malgré tout)',
          'Include past, present, future and conditional verbs and a subjunctive',
          'Article conventions: title, clear position, conclusion',
        ],
        model:
          "Le bénévolat : donner de son temps, c'est aussi recevoir\n\nDepuis un an, je suis bénévole tous les samedis matin dans une association qui distribue des repas aux personnes en difficulté à Brisbane. Au début, c'était l'idée de ma mère, qui pensait que ce serait bon pour mon CV. Maintenant, je ne pourrais plus m'en passer !\n\nLe bénévolat présente de nombreux avantages pour les jeunes. Premièrement, on développe des compétences utiles, comme le travail en équipe et la communication. Deuxièmement, on rencontre des gens qu'on n'aurait jamais rencontrés autrement. Par exemple, j'ai fait la connaissance d'un ancien chef cuisinier qui m'a appris à préparer des plats pour cent personnes !\n\nPour la communauté, les bénévoles sont indispensables. Après les inondations de 2022, des milliers de jeunes Queenslandais ont aidé à nettoyer les maisons et les rues. Cela a montré que notre génération se soucie des autres.\n\nBien sûr, il y a aussi des difficultés. Avec les devoirs, le sport et un petit boulot, il est parfois difficile de trouver du temps. De plus, certaines situations sont émouvantes et pas toujours faciles à vivre.\n\nMalgré tout, je pense qu'il faut que chaque jeune essaie au moins une fois. L'année prochaine, quand je serai à l'université, je continuerai à faire du bénévolat, car cette expérience a changé ma vision du monde.",
      },
      {
        id: 'qce-u4-t1-speak',
        title: 'Speaking (IA3 interview style): Ma vie maintenant',
        kind: 'speaking',
        instructions:
          'IA3 interviews use unseen, open-ended, reflective questions. Practise answering these aloud for 30–60 seconds each, giving reasons and examples.',
        questions: [
          {
            prompt: 'Comment vas-tu fêter la fin du lycée ?',
            model:
              "Après les examens, j'irai à Schoolies avec mes amis, mais pas sur la Gold Coast : nous avons loué une maison à Byron Bay. Avant ça, il y aura notre formal. J'ai hâte, même si je suis un peu triste de quitter l'école.",
          },
          {
            prompt: "Quel rôle les jeunes peuvent-ils jouer pour protéger l'environnement ?",
            model:
              "Je pense que les jeunes ont un rôle essentiel à jouer. Nous pouvons changer nos habitudes, par exemple prendre les transports en commun ou acheter des vêtements d'occasion. Mais il est aussi important que nous votions et que nous fassions entendre notre voix auprès des politiques.",
          },
          {
            prompt: "Quel événement mondial t'intéresse en ce moment, et pourquoi ?",
            model:
              "Les Jeux olympiques de Brisbane en 2032 m'intéressent beaucoup. Ce sera une occasion unique pour le Queensland, et j'aimerais y travailler comme bénévole. Cependant, il faudra que les organisateurs pensent à l'impact sur l'environnement et sur le prix des logements.",
          },
          {
            prompt: 'As-tu déjà fait du bénévolat ? Qu\'est-ce que tu en as appris ?',
            model:
              "Oui, l'année dernière, j'ai aidé à entraîner une équipe de netball de jeunes enfants. J'ai appris la patience et j'ai appris à communiquer clairement. Ce qui m'a le plus plu, c'était de voir les enfants progresser chaque semaine.",
          },
        ],
      },
    ],
  },
  {
    id: 'qce-u4-t2',
    unit: 'Unit 4',
    title: 'Future choices',
    titleFr: "Les choix d'avenir",
    description:
      'Compare employment prospects and the benefits of speaking a second language, investigate post-school options and independence, consider the role of French in your future, and explore being a global citizen. (IA3 and the external exam draw on Unit 4.)',
    subtopics: [
      'Employment prospects and the benefits and opportunities of speaking a second language',
      'Post-school options in your own and French-speaking communities, and independence',
      "The role of French in your future: further study, travel and careers",
      'Being a global citizen in a changing world: who you aspire to be and how you will stay connected with friends',
    ],
    linkedUnits: [],
    keyVocab: [
      { fr: "l'avenir (m)", en: 'the future' },
      { fr: "une année de césure", en: 'a gap year' },
      { fr: 'un visa vacances-travail', en: 'a working holiday visa' },
      { fr: 'les études supérieures', en: 'tertiary studies' },
      { fr: 'une licence', en: "a bachelor's degree (France)" },
      { fr: 'un apprentissage', en: 'an apprenticeship' },
      { fr: 'le marché du travail', en: 'the job market' },
      { fr: 'un atout', en: 'an asset, advantage' },
      { fr: 'bilingue', en: 'bilingual' },
      { fr: "l'indépendance (f)", en: 'independence' },
      { fr: 'gérer son budget', en: 'to manage your budget' },
      { fr: 'un citoyen / une citoyenne du monde', en: 'a global citizen' },
      { fr: "un échange", en: 'an exchange' },
      { fr: 'se débrouiller', en: 'to manage, get by' },
      { fr: 'une carrière', en: 'a career' },
    ],
    usefulPhrases: [
      { fr: "L'année prochaine, je compte ...", en: 'Next year, I intend to ...' },
      { fr: 'Si tout se passe bien, je ferai ...', en: 'If all goes well, I will do ...' },
      { fr: "Parler une deuxième langue est un atout énorme.", en: 'Speaking a second language is a huge asset.' },
      { fr: "Mes parents auraient préféré que je reste à la maison.", en: 'My parents would have preferred me to stay at home.' },
      { fr: "J'ai toujours rêvé de ...", en: 'I have always dreamed of ...' },
      { fr: 'Bien que nous allions suivre des chemins différents, ...', en: 'Although we are going to follow different paths, ...' },
      { fr: "Être citoyen du monde, pour moi, c'est ...", en: 'Being a global citizen, for me, means ...' },
      { fr: "Je voudrais devenir quelqu'un qui ...", en: 'I would like to become someone who ...' },
    ],
    tasks: [
      {
        id: 'qce-u4-t2-listen',
        title: "Listening: L'année de césure de Juliette",
        kind: 'listening',
        instructions: 'Listen to Juliette, a young French woman, talk about her gap year (up to three plays). Answer in English.',
        stimulus:
          "Bonjour ! Je m'appelle Juliette, j'ai vingt et un ans et je viens de Rennes. Après ma licence d'anglais, j'ai décidé de prendre une année de césure pour partir en Australie avec un visa vacances-travail. D'abord, j'ai travaillé six mois dans un café à Melbourne. Ensuite, j'ai fait la cueillette des fruits dans le Queensland, près de Bundaberg. C'était épuisant, mais j'ai rencontré des gens du monde entier. Cette expérience m'a rendue beaucoup plus indépendante : je devais gérer mon budget, trouver un logement et parler anglais toute la journée. Quand je rentrerai en France, je voudrais devenir professeure d'anglais. Mon conseil ? Si vous en avez l'occasion, partez ! Il faut que les jeunes sortent de leur zone de confort avant de commencer leur carrière.",
        questions: [
          {
            prompt: 'What did Juliette study before her gap year?',
            options: ['Law', "English (a bachelor's degree)", 'Agriculture', 'Tourism'],
            answer: 1,
          },
          {
            prompt: 'Where did she work first?',
            options: ['On a farm near Bundaberg', 'In a café in Melbourne', 'In a school in Rennes', 'In a hotel in Sydney'],
            answer: 1,
          },
          {
            prompt: 'How did the experience change her?',
            options: [
              'She became much more independent',
              'She decided to stay in Australia forever',
              'She stopped wanting to speak English',
              'She decided to become a farmer',
            ],
            answer: 0,
          },
          {
            prompt: 'Name three things Juliette had to manage for herself.',
            model: 'Managing her budget, finding accommodation, and speaking English all day.',
          },
          {
            prompt: 'What does she want to do when she returns to France?',
            options: ['Open a café', 'Become an English teacher', 'Work as a travel agent', 'Keep picking fruit'],
            answer: 1,
          },
        ],
      },
      {
        id: 'qce-u4-t2-write',
        title: 'Writing (external exam style): Le français et mon avenir',
        kind: 'writing',
        instructions:
          "Un site francophone pour les jeunes lance un concours d'écriture : « Mon avenir dans un monde qui change ». Écrivez un article dans lequel vous parlez de vos projets après le lycée, du rôle des langues (et du français) dans votre avenir et de ce que signifie pour vous être citoyen(ne) du monde. Écrivez 150 à 250 mots (l'examen externe peut demander jusqu'à 400 mots).",
        criteria: [
          'Discuss post-school plans and independence',
          'Evaluate the benefits of a second language for work, study and travel',
          'Reflect on global citizenship and staying connected with friends',
          'Wide range of tenses: futur, conditionnel, conditionnel passé, subjonctif',
          'Cohesive structure with linking words and a clear conclusion',
          'Accurate grammar, agreement and spelling',
        ],
        model:
          "Mon avenir dans un monde qui change\n\nDans quelques mois, je terminerai le Year 12 et je devrai prendre des décisions importantes pour mon avenir. C'est à la fois excitant et un peu effrayant !\n\nL'année prochaine, je compte étudier le commerce international à l'université, à Brisbane, et continuer le français en option. Mes parents auraient préféré que je reste à la maison, mais j'ai envie de vivre en colocation avec des amis pour gagner en indépendance. Je sais que je devrai apprendre à gérer mon budget, mais je pense que c'est une étape essentielle pour devenir adulte.\n\nÀ mon avis, parler une deuxième langue est un atout énorme. Beaucoup d'entreprises recherchent des employés capables de communiquer avec des clients étrangers, et le français est parlé sur cinq continents. De plus, apprendre une langue nous aide à comprendre d'autres cultures, ce qui est indispensable dans un monde de plus en plus connecté.\n\nSi tout se passe bien, je ferai un semestre d'échange à Montréal pendant ma deuxième année. J'ai toujours rêvé de vivre un hiver québécois ! Après mes études, j'aimerais travailler pour une organisation internationale, peut-être dans le Pacifique.\n\nÊtre citoyen du monde, pour moi, c'est être curieux, respecter les autres et agir pour la planète. Bien que mes amis et moi allions suivre des chemins différents, nous resterons en contact grâce à notre groupe de discussion et nous nous retrouverons chaque été à la plage, comme d'habitude.",
      },
      {
        id: 'qce-u4-t2-speak',
        title: 'Speaking (IA3 interview style): Mes projets',
        kind: 'speaking',
        instructions:
          'Answer these reflective interview questions aloud. Show a range of future and conditional forms and justify your choices.',
        questions: [
          {
            prompt: 'Que feras-tu après le lycée ?',
            model:
              "Je voudrais faire une licence en sciences de l'environnement à l'université. Si mes résultats sont suffisants, j'irai à l'université à Townsville, parce que je pourrai étudier la Grande Barrière de corail.",
          },
          {
            prompt: "Penses-tu qu'une année de césure soit une bonne idée ?",
            model:
              "Oui, à condition qu'on ait un projet précis. Une année de césure permet de gagner de l'argent, de voyager et de mieux se connaître. Par contre, si on ne fait rien, on risque de perdre sa motivation pour les études.",
          },
          {
            prompt: "Comment le français pourrait-il t'aider dans ton avenir ?",
            model:
              "Le français pourrait m'ouvrir beaucoup de portes. Par exemple, je pourrais faire un stage en Nouvelle-Calédonie ou travailler pour une organisation internationale. En plus, si je voyage en Europe, je pourrai communiquer avec les gens dans leur langue.",
          },
          {
            prompt: "Quel genre de personne aimerais-tu devenir ?",
            model:
              "J'aimerais devenir quelqu'un d'ouvert et de généreux, qui s'engage pour sa communauté. Je voudrais aussi garder ma curiosité et continuer à apprendre toute ma vie.",
          },
          {
            prompt: 'Comment resteras-tu en contact avec tes amis ?',
            model:
              "Nous avons déjà un groupe de discussion où nous nous envoyons des messages tous les jours. Même si nous habitons dans des villes différentes, nous nous retrouverons pendant les vacances. Je pense que les vraies amitiés résistent à la distance.",
          },
        ],
      },
    ],
  },
];

export const schoolAssessments: { id: string; code: string; name: string; description: string; tips: string[] }[] = [
  {
    id: 'qce-ia1',
    code: 'IA1',
    name: 'Examination — short response (20%)',
    description:
      'Unit 3 (Topic 1: Lifestyles and leisure). Supervised exam with three unseen French stimulus texts (at least one written and at least one audio/audiovisual; combined up to 1000 words) and five short response questions. Questions 1–3 are answered in English, questions 4–5 in French. 5 minutes perusal, 90 minutes working time. Audio is recorded slower than native pace and played up to three times. Handwritten; no dictionaries.',
    tips: [
      'Use perusal time to read every question and underline the key verb (identify, explain, compare, evaluate) so you know what kind of answer is needed.',
      'For English answers, quote specific details from the texts (who, what, when, why) rather than general summaries, but translate them; do not copy French into an English answer.',
      'Take notes during each play of the audio: on the first listen get the gist, then fill in numbers, names and reasons on the second and third.',
      'In the French responses, give a clear opinion, justify it with ideas from the stimulus texts and add a personal example.',
      'Revise Unit 3 Topic 1 vocabulary (technology, screens, leisure, lifestyle) as well as linking words, since you cannot use a dictionary.',
      'Leave time to check verb endings, agreements and accents in your French answers.',
    ],
  },
  {
    id: 'qce-ia2',
    code: 'IA2',
    name: 'Examination — extended response (25%)',
    description:
      'Unit 3 (Topic 2: The arts, entertainment and sports and/or Topic 3: Groups in society). Two parts, both in French and with no dictionaries: (1) a handwritten extended response in a set text type such as a blog, email, letter, text message or speech transcript (10 minutes planning, 80 minutes working); (2) a spoken conversation based on an unseen stimulus (a visual of up to 60 words or a short written text of up to 80 words in French), with 10 minutes planning and 7 minutes of conversation. Notes made during planning may be used. The conversation may be held at a separate time.',
    tips: [
      'Learn the conventions of each text type (greeting and sign-off for emails and letters, title and direct address for blogs, audience address for speeches) and use them every time.',
      'Plan in your 10 minutes: one idea per paragraph, an opinion plus justification plus example, then a conclusion.',
      'Show a range of structures naturally: passé composé/imparfait for anecdotes, futur and conditionnel for plans and hypotheses, a subjunctive after il faut que or bien que, and relative pronouns (qui, que, où, dont).',
      'Learn a bank of flexible phrases for opinion and evaluation (à mon avis, ce qui me plaît, c\'est..., d\'un côté... d\'un autre côté...) so you can adapt them to any prompt.',
      'In the conversation, expand every answer (answer, reason, example) and keep the exchange going: ask for clarification (Pouvez-vous répéter, s\'il vous plaît ?) if you need to.',
      'During planning, write key words and connectives only, not full sentences, so you speak naturally instead of reading.',
    ],
  },
  {
    id: 'qce-ia3',
    code: 'IA3',
    name: 'Multimodal presentation and interview (30%)',
    description:
      'Unit 4 (Topic 1: The present and/or Topic 2: Future choices). You synthesise ideas from three teacher-provided French stimulus texts, identify different perspectives (including your own) and present a multimodal response in French of up to 7 minutes, using at least a written and a spoken mode at the same time. This is followed by an interview of up to 7 minutes with unseen, open-ended, reflective questions about your presentation and Unit 4. You get 5 weeks notice and the stimulus in advance and can prepare in class and at home; no dictionary in the interview.',
    tips: [
      'Do not just summarise each stimulus text one after the other: synthesise. Group the ideas by theme and show where the texts agree and disagree.',
      'State perspectives explicitly (selon le premier texte..., en revanche, le deuxième texte suggère..., quant à moi...).',
      'Keep slides or visual text brief (key words, images, short quotes) and speak to the audience rather than reading the screen.',
      'Rehearse with a timer and record yourself; aim to finish comfortably within 7 minutes.',
      'Prepare for the interview by brainstorming likely Unit 4 questions (end of school, volunteering, the future, global citizenship, the role of French) and practising answers with an opinion, a reason and an example.',
      'Use the speaking tasks in this app as interview practice: answer aloud before looking at the model.',
    ],
  },
  {
    id: 'qce-ea',
    code: 'EA',
    name: 'External assessment — Examination: combination response (25%)',
    description:
      'Set and marked by the QCAA and based on Unit 4 subject matter. A written exam: 5 minutes perusal, 120 minutes working time. Unseen French stimulus texts (combined up to 1000 words, including audio) with responses in English (sentences or paragraphs, up to about 100 words per question) and in French (sentences or paragraphs up to about 100 words, and extended responses of up to 400 words). No notes, dictionaries or reference materials.',
    tips: [
      'Work through QCAA past papers and the published audio stimulus for French on the QCAA French syllabus page under exam conditions.',
      'Read the QCAA subject reports for the exam to see what high-scoring responses did and the common mistakes to avoid.',
      'Manage your time: allocate minutes to each section based on the marks, and leave enough time for the extended French response.',
      'For extended French responses, address every part of the question, structure clearly (introduction, developed paragraphs, conclusion) and show a range of tenses and complex structures accurately.',
      'In English answers, be precise and complete: identify who holds which view and support it with evidence from the text.',
      'Build vocabulary for all of Unit 4 (school life ending, volunteering, the environment, post-school options, careers, languages) since there is no dictionary.',
    ],
  },
];
