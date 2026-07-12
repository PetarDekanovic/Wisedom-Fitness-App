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
    text: "It is easy to love your friend, but sometimes the hardest lesson to learn is to love your enemy.",
    author: "Sun Tzu",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 1,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-2",
    text: "I must also have a dark side if I am to be whole.",
    author: "Carl Jung",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 2,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-3",
    text: "The secret of success lies not in doing your own work, but in recognizing the right man to do it.",
    author: "Andrew Carnegie",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 3,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-4",
    text: "The positive thinker sees the invisible, feels the intangible, and achieves the impossible.",
    author: "Winston Churchill",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 4,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-5",
    text: "When you get up in the morning, you have two choices - either to be happy or to be unhappy. Just choose to be happy.",
    author: "Norman Vincent Peale",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 5,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-6",
    text: "Don't set your own goals by what other people make important.",
    author: "Lolly Daskal",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 6,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-7",
    text: "Don´t hesitate or allow yourself to make excuses. Just get out and do it.",
    author: "Christopher McCandless",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 7,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-8",
    text: "If you want something new, you have to stop doing something old.",
    author: "Peter Drucker",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 8,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-9",
    text: "The person who never made a mistake never tried anything new.",
    author: "Albert Einstein",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 9,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-10",
    text: "It is not how much we have, but how much we enjoy, that makes happiness.",
    author: "Charles Spurgeon",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 10,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-11",
    text: "Keep your dreams, you never know when you might need them.",
    author: "Carlos Ruiz Zafon",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 11,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-12",
    text: "A vital part of the happiness formula is self-discipline. Whoever conquers himself knows deep happiness that fills the heart with joy.",
    author: "Norman Vincent Peale",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 12,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-13",
    text: "Don't give up on your dreams, or your dreams will give up on you.",
    author: "John Wooden",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 13,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-14",
    text: "What would life be if we had no courage to attempt anything?",
    author: "Vincent van Gogh",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 14,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-15",
    text: "I am always doing what I cannot do yet, in order to learn how to do it.",
    author: "Vincent van Gogh",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 15,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-16",
    text: "Success seems to be connected to action. Successful people keep moving. They make mistakes, but they don't quit.",
    author: "Conrad Hilton",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 16,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-17",
    text: "People will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
    author: "Maya Angelou",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 17,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-18",
    text: "When you've got nothing, you've got nothing to lose.",
    author: "Bob Dylan",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 18,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-19",
    text: "The people who are most successful are those who are doing what they love.",
    author: "Warren Buffett",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 19,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-20",
    text: "Life is a balance of holding on and letting go.",
    author: "Rumi",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 20,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-21",
    text: "Luck is what happens when preparation meets opportunity.",
    author: "Seneca",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 21,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-22",
    text: "Fears are nothing more than a state of mind.",
    author: "Napoleon Hill",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 22,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-23",
    text: "What's obvious to you isn't obvious to most people. Operate from this perspective and you'll help more people.",
    author: "Jack Butcher",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 23,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-24",
    text: "True wisdom comes to each of us when we realize how little we understand about life, ourselves, and the world around us.",
    author: "Socrates",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 24,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-25",
    text: "To be alive - is Power.",
    author: "Emily Dickinson",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 25,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-26",
    text: "Sometimes out of your biggest misery, comes your greatest gain.",
    author: "Steve Harvey",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 26,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-27",
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 27,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-28",
    text: "There are as many opinions as there are experts.",
    author: "Franklin D. Roosevelt",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 28,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-29",
    text: "If you can't feed a hundred people, then feed just one.",
    author: "Mother Teresa",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 29,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-30",
    text: "Whatever you do in life, surround yourself with smart people who'll argue with you.",
    author: "John Wooden",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 30,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-31",
    text: "The more we value things, the less we value ourselves.",
    author: "Bruce Lee",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 31,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-32",
    text: "Be - don't try to become",
    author: "Osho",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 32,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-33",
    text: "Turn the pain into power.",
    author: "Unknown",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 33,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-34",
    text: "It is dangerous to be right in matters on which the established authorities are wrong.",
    author: "Voltaire",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 34,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-35",
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 35,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-36",
    text: "Faithless is he that says farewell when the road darkens.",
    author: "J.R.R. Tolkien",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 36,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-37",
    text: "My mind seems to have become a kind of machine for grinding general laws out of large collections of facts.",
    author: "Charles Darwin",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 37,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-38",
    text: "A real friend is one who walks in when the rest of the world walks out.",
    author: "Unknown",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 38,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-39",
    text: "I dream my painting and I paint my dream.",
    author: "Vincent van Gogh",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 39,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-40",
    text: "What the mind can conceive, it can achieve.",
    author: "Napoleon Hill",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 40,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-41",
    text: "Absorb what is useful, discard what is not, add what is uniquely your own.",
    author: "Bruce Lee",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 41,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-42",
    text: "He who wishes to be obeyed must know how to command.",
    author: "Niccolo Machiavelli",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 42,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-43",
    text: "Don't try to be young. Just open your mind. Stay interested in stuff.",
    author: "Betty White",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 43,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-44",
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 44,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-45",
    text: "The only normal people are the ones you don't know very well.",
    author: "Alfred Adler",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 45,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-46",
    text: "When you believe in a thing, believe in it all the way, implicitly and unquestionable.",
    author: "Walt Disney",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 46,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-47",
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 47,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-48",
    text: "One small positive thought can change your whole day.",
    author: "Zig Ziglar",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 48,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-49",
    text: "Everyday you can take a tiny step in the right direction.",
    author: "Unknown",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 49,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-50",
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 50,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-51",
    text: "Nothing will work unless you do.",
    author: "Maya Angelou",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 51,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-52",
    text: "Go for it now. The future is promised to no one.",
    author: "Wayne Dyer",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 52,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-53",
    text: "Pain results from a judgment you have made about a thing. Remove the judgment and the pain disappears.",
    author: "Neale Donald Walsch",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 53,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-54",
    text: "The wise pursue wisdom, the dull follow in blind faith.",
    author: "Tibetan Proverb",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 54,
    createdAt: "2026-07-12T00:00:00Z"
  },
  {
    id: "fq-55",
    text: "A change is brought about because ordinary people do extraordinary things.",
    author: "Barack Obama",
    source: "Daily Digest",
    fetchDate: "2026-07-12",
    order: 55,
    createdAt: "2026-07-12T00:00:00Z"
  }
];

export interface FallbackNews {
  id: string;
  date: string;
  category: string;
  title: string;
  url: string;
}

export const FALLBACK_NEWS: FallbackNews[] = [
  {
    id: "news-0",
    date: "Jun 25, 2026",
    category: "Research",
    title: "Collectibles ‘The Late Show With Stephen Colbert’ Signs Off With an eBay for Charity Auction “The Late Show with Stephen Colbert” partnered with eBay for Charity to auction iconic memorabilia from the Ed Sullivan Theater, raising more than $2 million for World Central Kitchen. eBay News Team",
    url: "https://www.ebayinc.com/stories/news/stories/news/the-late-show-with-stephen-colbert-signs-off-with-an-ebay-for-charity-auction/"
  },
  {
    id: "news-1",
    date: "Jun 23, 2026",
    category: "Research",
    title: "eBay Live eBay Live Turns Soccer’s Enduring #7 v #10 Rivalry Into a Fan Showdown with Landon Donovan and Jack Wilshere eBay Live’s 'Showdown: 7s v 10s' pairs era-defining athletes with curated collectibles, giving fans a front-row seat to the stories shaping soccer culture today. Press Release",
    url: "https://www.ebayinc.com/stories/news/stories/news/ebay-live-turns-soccers-enduring-7-v-10-rivalry-into-a-fan-showdown-with-landon-donovan-and-jack-wilshere/"
  },
  {
    id: "news-2",
    date: "May 29, 2026",
    category: "Announcements",
    title: "eBay names Trosort as Global Winner of the Circular Fashion Fund 2026 Trosort will have the opportunity to receive a US$300,000 investment from eBay Ventures Press Release",
    url: "https://www.ebayinc.com/stories/news/stories/news/ebay-names-trosort-as-global-winner-of-the-circular-fashion-fund-2026/"
  },
  {
    id: "news-3",
    date: "May 28, 2026",
    category: "Announcements",
    title: "eBay Invests in the Future of Live Commerce with 2026 Up & Running Grants $100,000 commitment will empower 10 sellers to become eBay Live success stories —applications open May 28 through June 25. Press Release",
    url: "https://www.ebayinc.com/stories/news/stories/news/ebay-invests-in-the-future-of-live-commerce-with-2026-up-and-running-grants/"
  }
];

