import { QuizQuestion } from '../types';

export const INITIAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 'l1',
    category: 'latin',
    question: 'What does the Stoic phrase "Amor Fati" mean?',
    options: [
      'Love of one\'s fate',
      'Death is coming',
      'Life is pain',
      'Master the mind'
    ],
    correctAnswer: 0,
    wisdom: 'Amor Fati is the practice of accepting and loving everything that happens in life, including suffering and loss.'
  },
  {
    id: 'j1',
    category: 'jewish',
    question: 'In Jewish wisdom, who is considered truly wise?',
    options: [
      'He who reads many books',
      'He who learns from every person',
      'He who predicts the future',
      'He who speaks with authority'
    ],
    correctAnswer: 1,
    wisdom: 'Pirkei Avot teaches: "Who is wise? One who learns from every person."'
  },
  {
    id: 'h1',
    category: 'history',
    question: 'Which Roman Emperor is known for his "Meditations" on Stoic philosophy?',
    options: [
      'Julius Caesar',
      'Nero',
      'Marcus Aurelius',
      'Augustus'
    ],
    correctAnswer: 2,
    wisdom: 'Marcus Aurelius wrote Meditations as a personal journal to remind himself of his Stoic principles while leading the Roman Empire.'
  },
  {
    id: 'p1',
    category: 'psychology',
    question: 'According to Carl Jung, what happens to the things we do not consciously acknowledge?',
    options: [
      'They disappear',
      'They turn into positive traits',
      'They manifest as fate in our lives',
      'They strengthen the ego'
    ],
    correctAnswer: 2,
    wisdom: 'Jung said: "Until you make the unconscious conscious, it will direct your life and you will call it fate."'
  },
  {
    id: 'l2',
    category: 'latin',
    question: 'What is the literal meaning of "Memento Mori"?',
    options: [
      'Remember to live',
      'Remember you must die',
      'Mind over matter',
      'The die is cast'
    ],
    correctAnswer: 1,
    wisdom: 'Memento Mori is a reminder of human mortality, used to focus on what truly matters in life.'
  }
];
