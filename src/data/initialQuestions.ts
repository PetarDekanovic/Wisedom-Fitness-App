import { QuizQuestion } from '../types';

export const INITIAL_QUESTIONS: QuizQuestion[] = [
  // LATIN / STOICISM
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

  // JEWISH WISDOM
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

  // HISTORY
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

  // PSYCHOLOGY
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
    wisdom: 'It describes the stress we feel when our actions don\'t align with our values, forcing us to change one or the other.'
  }
];
