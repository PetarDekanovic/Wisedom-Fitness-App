import { QuizQuestion } from '../types';

export const INITIAL_QUESTIONS: QuizQuestion[] = [
  // LATIN / STOICISM (1)
  {
    id: 'l1',
    category: 'latin',
    question: 'What does the Stoic phrase "Amor Fati" mean?',
    options: ['Love of one\'s fate', 'Death is coming', 'Life is pain', 'Master the mind'],
    correctAnswer: 0,
    wisdom: 'Amor Fati is the practice of accepting and loving everything that happens in life, including suffering and loss.'
  },
  {
    id: 'l2',
    category: 'latin',
    question: 'What is the literal meaning of "Memento Mori"?',
    options: ['Remember to live', 'Remember you must die', 'Mind over matter', 'The die is cast'],
    correctAnswer: 1,
    wisdom: 'Memento Mori is a reminder of human mortality, used to focus on what truly matters in life.'
  },
  {
    id: 'l3',
    category: 'latin',
    question: 'Which Stoic concept refers to "things that are up to us"?',
    options: ['Prohairesis', 'Ataraxia', 'Eudaimonia', 'Logos'],
    correctAnswer: 0,
    wisdom: 'Prohairesis is the faculty of choice; Stoics believe our only true possession is our ability to choose our response to events.'
  },
  {
    id: 'l4',
    category: 'latin',
    question: 'What does "Premeditatio Malorum" involve?',
    options: ['Celebrating success', 'Ignoring the future', 'Visualizing future hardships', 'Forgiving enemies'],
    correctAnswer: 2,
    wisdom: 'Premeditatio Malorum is the practice of imagining potential setbacks to prepare the mind for any outcome.'
  },
  {
    id: 'l5',
    category: 'latin',
    question: 'The phrase "Veni, Vidi, Vici" is attributed to whom?',
    options: ['Marcus Aurelius', 'Seneca', 'Julius Caesar', 'Cicero'],
    correctAnswer: 2,
    wisdom: 'Meaning "I came, I saw, I conquered," it exemplifies the decisive action valued in Roman history.'
  },
  {
    id: 'l6',
    category: 'latin',
    question: 'What is "Eudaimonia" often translated as in Stoicism?',
    options: ['Constant pleasure', 'Human flourishing or well-being', 'Physical strength', 'Social status'],
    correctAnswer: 1,
    wisdom: 'Eudaimonia is not a fleeting emotion, but a state of living in accordance with virtue.'
  },
  {
    id: 'l7',
    category: 'latin',
    question: '"Summum Bonum" refers to what concept?',
    options: ['The highest weight', 'The highest good', 'The end of days', 'The final battle'],
    correctAnswer: 1,
    wisdom: 'Summum Bonum is the "highest good," which for Stoics means living with virtue above all else.'
  },
  {
    id: 'l8',
    category: 'latin',
    question: 'Which Stoic philosopher was once a slave?',
    options: ['Marcus Aurelius', 'Epictetus', 'Seneca', 'Zeno'],
    correctAnswer: 1,
    wisdom: 'Epictetus demonstrated that even in slavery, one can remain mentally free and virtuous.'
  },
  {
    id: 'l9',
    category: 'latin',
    question: 'What is the "Dichotomy of Control"?',
    options: ['Controlling others with speech', 'Distinguishing what we can and cannot control', 'Two rulers sharing power', 'Managing two separate lives'],
    correctAnswer: 1,
    wisdom: 'It is the most fundamental Stoic practice: focus energy only on what is within your power.'
  },
  {
    id: 'l10',
    category: 'latin',
    question: 'Who is considered the founder of Stoicism?',
    options: ['Zeno of Citium', 'Aristotle', 'Socrates', 'Plato'],
    correctAnswer: 0,
    wisdom: 'Zeno began teaching in Athens on the "Stoa Poikile" (painted porch), giving the school its name.'
  },

  // JEWISH WISDOM (2)
  {
    id: 'j1',
    category: 'jewish',
    question: 'In Jewish wisdom, who is considered truly wise?',
    options: ['He who reads many books', 'He who learns from every person', 'He who predicts the future', 'He who speaks with authority'],
    correctAnswer: 1,
    wisdom: 'Pirkei Avot teaches: "Who is wise? One who learns from every person."'
  },
  {
    id: 'j2',
    category: 'jewish',
    question: 'What does the concept of "Tikkun Olam" refer to?',
    options: ['Personal success', 'Repairing the world', 'Deep meditation', 'Physical strength'],
    correctAnswer: 1,
    wisdom: 'Tikkun Olam suggests that humans have a responsibility to act to improve and heal the world.'
  },
  {
    id: 'j3',
    category: 'jewish',
    question: 'According to Jewish tradition, "If I am not for myself, who will be for me? But if I am only for myself..."',
    options: ['"...then I am strong."', '"...then I am free."', '"...what am I?"', '"...life is easier."'],
    correctAnswer: 2,
    wisdom: 'Hillel the Elder taught this to emphasize the balance between self-respect and social responsibility.'
  },
  {
    id: 'j4',
    category: 'jewish',
    question: 'What is "Lashon Hara" considered in Jewish law?',
    options: ['Gossip/Evil speech', 'A type of prayer', 'A festive meal', 'A physical workout'],
    correctAnswer: 0,
    wisdom: 'Evil speech is viewed as one of the most damaging actions one can take against another human being.'
  },
  {
    id: 'j5',
    category: 'jewish',
    question: 'The term "Mitzvah" literally means what?',
    options: ['Good deed', 'Commandment', 'Festival', 'Blessing'],
    correctAnswer: 1,
    wisdom: 'While often used for "good deeds," it technically means a commandment or divine duty.'
  },
  {
    id: 'j6',
    category: 'jewish',
    question: 'What is the "Shabbat" primarily used for?',
    options: ['Intense commerce', 'Rest and spiritual reconnection', 'Preparing for war', 'Public speaking'],
    correctAnswer: 1,
    wisdom: 'The Sabbath is a sanctuary in time, a dedicated day for rest and mindful reflection.'
  },
  {
    id: 'j7',
    category: 'jewish',
    question: '"Tzedakah" is often translated as charity, but its root means:',
    options: ['Kindness', 'Justice', 'Love', 'Wealth'],
    correctAnswer: 1,
    wisdom: 'Tzedakah is based on "Tzedek" (Justice); giving is seen as an act of restoring justice, not just mercy.'
  },
  {
    id: 'j8',
    category: 'jewish',
    question: 'What is the main theme of the book "Ecclesiastes" (Kohelet)?',
    options: ['Military triumph', 'The vanity/fleeting nature of life', 'Building architectural wonders', 'Finding gold'],
    correctAnswer: 1,
    wisdom: 'It explores the search for meaning in a world that often seems repetitive or meaningless.'
  },
  {
    id: 'j9',
    category: 'jewish',
    question: 'Who is known as the "Rambam"?',
    options: ['Maimonides', 'Rashi', 'Akiva', 'Josephus'],
    correctAnswer: 0,
    wisdom: 'Moses Maimonides was a philosopher and doctor who tried to reconcile faith with reason and logic.'
  },
  {
    id: 'j10',
    category: 'jewish',
    question: 'The phrase "Gam Zu L\'Tova" means:',
    options: ['Life is hard', 'This too is for the best', 'Never look back', 'The sun will rise'],
    correctAnswer: 1,
    wisdom: 'It is a perspective of radical optimism, seeing internal growth opportunities in every situation.'
  },

  // HISTORY (3)
  {
    id: 'h1',
    category: 'history',
    question: 'Which Roman Emperor is known for his "Meditations"?',
    options: ['Julius Caesar', 'Nero', 'Marcus Aurelius', 'Augustus'],
    correctAnswer: 2,
    wisdom: 'Marcus Aurelius wrote Meditations as a personal journal to remind himself of his Stoic principles.'
  },
  {
    id: 'h2',
    category: 'history',
    question: 'The "Homeric" virtues (Arete) primarily emphasized:',
    options: ['Humility', 'Excellence and Bravery', 'Patience', 'Silence'],
    correctAnswer: 1,
    wisdom: 'Arete represents the fulfillment of potential and excellence in purpose, especially in the face of struggle.'
  },
  {
    id: 'h3',
    category: 'history',
    question: 'Which ancient civilization developed the concept of the "Agoge" for training its youth?',
    options: ['Athenians', 'Persians', 'Spartans', 'Romans'],
    correctAnswer: 2,
    wisdom: 'The Spartan Agoge was a rigorous training system designed to produce physically and mentally resilient citizens.'
  },
  {
    id: 'h4',
    category: 'history',
    question: 'The "Silk Road" was primarily a series of networks for:',
    options: ['War only', 'Trade and Cultural exchange', 'Religious pilgrimage only', 'Hiding treasure'],
    correctAnswer: 1,
    wisdom: 'It proves that progress is achieved through the exchange of ideas and resources across boundaries.'
  },
  {
    id: 'h5',
    category: 'history',
    question: 'The "Magna Carta" (1215) is famous for:',
    options: ['Ending all taxes', 'Limiting the power of the absolute monarch', 'Declaring war on France', 'Naming a new Pope'],
    correctAnswer: 1,
    wisdom: 'It established the principle that everyone, including the king, is subject to the law.'
  },
  {
    id: 'h6',
    category: 'history',
    question: 'Which Chinese philosopher emphasized filial piety and social harmony?',
    options: ['Laozi', 'Confucius', 'Sun Tzu', 'Mencius'],
    correctAnswer: 1,
    wisdom: 'Confucius taught that social order begins with personal character and respect within the family.'
  },
  {
    id: 'h7',
    category: 'history',
    question: 'The "Library of Alexandria" was a symbol of:',
    options: ['Military dominance', 'Universal knowledge and gathering', 'Great wealth', 'Religious isolation'],
    correctAnswer: 1,
    wisdom: 'It represented the ancient world\'s greatest attempt to compile all human knowledge in one place.'
  },
  {
    id: 'h8',
    category: 'history',
    question: 'Who was the famous tutor of Alexander the Great?',
    options: ['Socrates', 'Plato', 'Aristotle', 'Herodotus'],
    correctAnswer: 2,
    wisdom: 'Aristotle\'s teachings helped shape the mind of one of history\'s most effective leaders.'
  },
  {
    id: 'h9',
    category: 'history',
    question: 'The "Code of Hammurabi" is one of the earliest examples of:',
    options: ['A cookbook', 'A written legal system', 'A map of the stars', 'A physical workout routine'],
    correctAnswer: 1,
    wisdom: 'It introduced the concept of "An eye for an eye," an early attempt at standardized justice.'
  },
  {
    id: 'h10',
    category: 'history',
    question: 'What was the "Renaissance" primarily a rebirth of?',
    options: ['Military weapons', 'Classical leaning, art, and humanism', 'Industrial manufacturing', 'Global exploration'],
    correctAnswer: 1,
    wisdom: 'It marked the transition from the Middle Ages to modernity through a rediscovery of Greek and Roman culture.'
  },

  // PSYCHOLOGY (4)
  {
    id: 'p1',
    category: 'psychology',
    question: 'According to Carl Jung, what happens to the things we do not consciously acknowledge?',
    options: ['They disappear', 'They turn into positive traits', 'They manifest as fate in our lives', 'They strengthen the ego'],
    correctAnswer: 2,
    wisdom: 'Jung said: "Until you make the unconscious conscious, it will direct your life and you will call it fate."'
  },
  {
    id: 'p2',
    category: 'psychology',
    question: 'Viktor Frankl, a psychiatrist and Holocaust survivor, emphasized what as the primary human drive?',
    options: ['Power', 'Pleasure', 'The search for Meaning', 'Wealth'],
    correctAnswer: 2,
    wisdom: 'In "Man\'s Search for Meaning," Frankl argues that finding meaning is the key to enduring any hardship.'
  },
  {
    id: 'p3',
    category: 'psychology',
    question: 'What is the "Flow" state, as described by Mihaly Csikszentmihalyi?',
    options: ['Sleeping deeply', 'Total immersion in an activity', 'Multitasking effectively', 'Anxiety about the future'],
    correctAnswer: 1,
    wisdom: 'Flow occurs when your skills perfectly match a high challenge, leading to peak performance and loss of time sense.'
  },
  {
    id: 'p4',
    category: 'psychology',
    question: 'The concept of "Self-Actualization" is at the top of whose hierarchy?',
    options: ['Freud', 'Skinner', 'Maslow', 'Pavlov'],
    correctAnswer: 2,
    wisdom: 'Maslow believed self-actualization is the realization of potential after basic needs are met.'
  },
  {
    id: 'p5',
    category: 'psychology',
    question: 'What is "Cognitive Dissonance"?',
    options: ['Hearing voices', 'Mental discomfort from conflicting beliefs', 'Being very smart', 'Forgetting simple words'],
    correctAnswer: 1,
    wisdom: 'It describes the stress we feel when our actions don\'t align with our values.'
  },
  {
    id: 'p6',
    category: 'psychology',
    question: 'What does "Growth Mindset" mean (Carol Dweck)?',
    options: ['Believing intelligence is fixed', 'Believing abilities can be developed', 'Wanting to grow taller', 'Expecting success without effort'],
    correctAnswer: 1,
    wisdom: 'A growth mindset views failures as opportunities to learn rather than evidence of incompetence.'
  },
  {
    id: 'p7',
    category: 'psychology',
    question: 'The "Stanford Prison Experiment" demonstrated the power of:',
    options: ['Good diet', 'Social roles and situational context', 'Physical exercise', 'Memory techniques'],
    correctAnswer: 1,
    wisdom: 'It showed how quickly humans can adopt extreme behaviors when placed in powerful social roles.'
  },
  {
    id: 'p8',
    category: 'psychology',
    question: 'Who is known for the "8 Stages of Psychosocial Development"?',
    options: ['Erik Erikson', 'Jean Piaget', 'B.F. Skinner', 'Carl Rogers'],
    correctAnswer: 0,
    wisdom: 'Erikson proposed that human life is a series of psychosocial crises that shape our identity.'
  },
  {
    id: 'p9',
    category: 'psychology',
    question: '"Neuroplasticity" is the brain\'s ability to:',
    options: ['Remain rigid', 'Repair itself and form new connections', 'Store infinite data', 'Stop working under stress'],
    correctAnswer: 1,
    wisdom: 'The brain is "plastic" and can rewire itself through new habits, learning, and physical training.'
  },
  {
    id: 'p10',
    category: 'psychology',
    question: 'What is "Emotional Intelligence" (EQ)?',
    options: ['Being very emotional', 'The ability to recognize and manage emotions', 'Crying easily', 'Ignoring feelings'],
    correctAnswer: 1,
    wisdom: 'EQ is often a better predictor of success and well-being than traditional IQ.'
  }
];
