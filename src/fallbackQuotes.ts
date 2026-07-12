// High-signal philosophical, stoic, and disciplinary quotes for instant client-side rendering
export interface FallbackQuote {
  id: string;
  text: string;
  author: string;
  source: string;
  fetchDate: string;
  order: number;
  createdAt: string;
}

export const FALLBACK_QUOTES: FallbackQuote[] = [
  {
    id: "fq-1",
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 1,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-2",
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    source: "Letters from a Stoic",
    fetchDate: "2026-07-12",
    order: 2,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-3",
    text: "It is not death that a man should fear, but he should fear never beginning to live.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 3,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-4",
    text: "No man is free who is not master of himself.",
    author: "Epictetus",
    source: "Discourses",
    fetchDate: "2026-07-12",
    order: 4,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-5",
    text: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 5,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-6",
    text: "Associate with people who are likely to improve you.",
    author: "Seneca",
    source: "Stoic Wisdom",
    fetchDate: "2026-07-12",
    order: 6,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-7",
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    source: "Twilight of the Idols",
    fetchDate: "2026-07-12",
    order: 7,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-8",
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    source: "Stanford Address",
    fetchDate: "2026-07-12",
    order: 8,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-9",
    text: "Difficulties strengthen the mind, as labor does the body.",
    author: "Seneca",
    source: "Of Providence",
    fetchDate: "2026-07-12",
    order: 9,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-10",
    text: "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.",
    author: "Nikola Tesla",
    source: "Cosmic Journal",
    fetchDate: "2026-07-12",
    order: 10,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-11",
    text: "Absorb what is useful, discard what is not, add what is uniquely your own.",
    author: "Bruce Lee",
    source: "Tao of Jeet Kune Do",
    fetchDate: "2026-07-12",
    order: 11,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-12",
    text: "The primary indication of a well-ordered mind is a man's ability to remain in one place and linger in his own company.",
    author: "Seneca",
    source: "Letters from a Stoic",
    fetchDate: "2026-07-12",
    order: 12,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-13",
    text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 13,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-14",
    text: "A gem cannot be polished without friction, nor a man perfected without trials.",
    author: "Seneca",
    source: "Stoic Maxims",
    fetchDate: "2026-07-12",
    order: 14,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-15",
    text: "Control your perceptions. Direct your actions properly. Willingly accept what's outside your control.",
    author: "Ryan Holiday",
    source: "The Daily Stoic",
    fetchDate: "2026-07-12",
    order: 15,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-16",
    text: "If you are pained by any external thing, it is not this thing that disturbs you, but your own judgment about it.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 16,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-17",
    text: "The progressive development of man is vitally dependent on invention. It is the most important product of his creative brain.",
    author: "Nikola Tesla",
    source: "My Inventions",
    fetchDate: "2026-07-12",
    order: 17,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-18",
    text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.",
    author: "Epictetus",
    source: "Enchiridion",
    fetchDate: "2026-07-12",
    order: 18,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-19",
    text: "Life is a balance of holding on and letting go.",
    author: "Rumi",
    source: "Wisdom Repository",
    fetchDate: "2026-07-12",
    order: 19,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-20",
    text: "Luck is what happens when preparation meets opportunity.",
    author: "Seneca",
    source: "Moral Essays",
    fetchDate: "2026-07-12",
    order: 20,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-21",
    text: "True wisdom comes to each of us when we realize how little we understand about life, ourselves, and the world around us.",
    author: "Socrates",
    source: "Dialogues",
    fetchDate: "2026-07-12",
    order: 21,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-22",
    text: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.",
    author: "Seneca",
    source: "Letters from a Stoic",
    fetchDate: "2026-07-12",
    order: 22,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-23",
    text: "Be silent for the most part, or, if you speak, say only what is necessary and in few words.",
    author: "Epictetus",
    source: "Enchiridion",
    fetchDate: "2026-07-12",
    order: 23,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-24",
    text: "Knowing others is intelligence; knowing yourself is true wisdom. Mastering others is strength; mastering yourself is true power.",
    author: "Lao Tzu",
    source: "Tao Te Ching",
    fetchDate: "2026-07-12",
    order: 24,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-25",
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    source: "Nicomachean Ethics",
    fetchDate: "2026-07-12",
    order: 25,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-26",
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus",
    source: "Discourses",
    fetchDate: "2026-07-12",
    order: 26,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-27",
    text: "He who is brave is free.",
    author: "Seneca",
    source: "Stoic Epistles",
    fetchDate: "2026-07-12",
    order: 27,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-28",
    text: "To live is to suffer, to survive is to find some meaning in the suffering.",
    author: "Friedrich Nietzsche",
    source: "Philosophical Fragments",
    fetchDate: "2026-07-12",
    order: 28,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-29",
    text: "The obstacle is the path.",
    author: "Zen Proverb",
    source: "Zen Sanctuary",
    fetchDate: "2026-07-12",
    order: 29,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-30",
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 30,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-31",
    text: "The man who moves a mountain begins by carrying away small stones.",
    author: "Confucius",
    source: "Analects",
    fetchDate: "2026-07-12",
    order: 31,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-32",
    text: "Quiet minds cannot be perplexed or frightened but go on in fortune or misfortune at their own private pace, like a clock during a thunderstorm.",
    author: "Robert Louis Stevenson",
    source: "Fables",
    fetchDate: "2026-07-12",
    order: 32,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-33",
    text: "The key is to keep company only with people who uplift you, whose presence calls forth your best.",
    author: "Epictetus",
    source: "Discourses",
    fetchDate: "2026-07-12",
    order: 33,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-34",
    text: "The desire for safety stands against every great and noble enterprise.",
    author: "Tacitus",
    source: "Annals",
    fetchDate: "2026-07-12",
    order: 34,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-35",
    text: "It does not matter what you bear, but how you bear it.",
    author: "Seneca",
    source: "On Providence",
    fetchDate: "2026-07-12",
    order: 35,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-36",
    text: "If you correct your mind, the rest of your life will fall into place.",
    author: "Lao Tzu",
    source: "Tao Te Ching",
    fetchDate: "2026-07-12",
    order: 36,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-37",
    text: "Quality means doing it right when no one is looking.",
    author: "Henry Ford",
    source: "Discipline",
    fetchDate: "2026-07-12",
    order: 37,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-38",
    text: "The search for truth is more precious than its possession.",
    author: "Albert Einstein",
    source: "Scientific Creed",
    fetchDate: "2026-07-12",
    order: 38,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-39",
    text: "Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 39,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-40",
    text: "If a man knows not to which port he sails, no wind is favorable.",
    author: "Seneca",
    source: "Letters to Lucilius",
    fetchDate: "2026-07-12",
    order: 40,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-41",
    text: "When you are offended at any man's fault, turn to yourself and study your own failings. Then you will forget your anger.",
    author: "Epictetus",
    source: "Discourses",
    fetchDate: "2026-07-12",
    order: 41,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-42",
    text: "The greatest weapon against stress is our ability to choose one thought over another.",
    author: "William James",
    source: "Principles of Psychology",
    fetchDate: "2026-07-12",
    order: 42,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-43",
    text: "Do not spoil what you have by desiring what you have not; remember that what you now have was once among the things you only hoped for.",
    author: "Epicurus",
    source: "Principal Doctrines",
    fetchDate: "2026-07-12",
    order: 43,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-44",
    text: "Self-control is strength. Right thought is mastery. Calmness is power.",
    author: "James Allen",
    source: "As a Man Thinketh",
    fetchDate: "2026-07-12",
    order: 44,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-45",
    text: "Be tolerant with others and strict with yourself.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 45,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-46",
    text: "Most people do not really want freedom, because freedom involves responsibility, and most people are frightened of responsibility.",
    author: "Sigmund Freud",
    source: "Civilization and Its Discontents",
    fetchDate: "2026-07-12",
    order: 46,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-47",
    text: "No physical activity can match the exercise of the human intellect.",
    author: "Nikola Tesla",
    source: "Lectures",
    fetchDate: "2026-07-12",
    order: 47,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-48",
    text: "Rule your mind or it will rule you.",
    author: "Horace",
    source: "Epistles",
    fetchDate: "2026-07-12",
    order: 48,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-49",
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    source: "Long Walk to Freedom",
    fetchDate: "2026-07-12",
    order: 49,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-50",
    text: "The perfect man uses his mind as a mirror. It grasps nothing; it regrets nothing. It receives but does not keep.",
    author: "Chuang Tzu",
    source: "Inner Chapters",
    fetchDate: "2026-07-12",
    order: 50,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-51",
    text: "You are the master of your destiny. You can influence, direct and control your own environment.",
    author: "Napoleon Hill",
    source: "Think and Grow Rich",
    fetchDate: "2026-07-12",
    order: 51,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-52",
    text: "A warrior is not about perfection or victory or invulnerability. He's about absolute vulnerability. That's the only true courage.",
    author: "Dan Millman",
    source: "Way of the Peaceful Warrior",
    fetchDate: "2026-07-12",
    order: 52,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-53",
    text: "Concentrate every minute like a Roman—like a man—on doing what's in front of you with precise and genuine seriousness, tenderly, willingly, with justice.",
    author: "Marcus Aurelius",
    source: "Meditations",
    fetchDate: "2026-07-12",
    order: 53,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-54",
    text: "Life is very short and anxious for those who forget the past, neglect the present, and fear the future.",
    author: "Seneca",
    source: "On the Shortness of Life",
    fetchDate: "2026-07-12",
    order: 54,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-55",
    text: "Do not say things about yourselves that you do not want to become reality.",
    author: "Epictetus",
    source: "Discourses",
    fetchDate: "2026-07-12",
    order: 55,
    createdAt: "2026-07-12T00:00:00Z"
  }
];

export const FALLBACK_NEWS = [
  {
    id: "fn-1",
    date: "Recent",
    category: "Announcements",
    title: "WiseFit Sanctuary Commons operational updates and performance patches.",
    url: "https://wisefitorg.com/digest"
  },
  {
    id: "fn-2",
    date: "Recent",
    category: "Research",
    title: "Biometric and intellectual alignment: The science of Daily Operating Modes.",
    url: "https://wisefitorg.com/digest"
  }
];
