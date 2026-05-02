import { VideoHistoryItem } from '../types';

export const INITIAL_HISTORY_VIDEOS: VideoHistoryItem[] = [
  {
    id: 'vd1',
    type: 'direct',
    videoId: 'https://compcharity.org/wp-content/uploads/2026/04/Midnight-Philosophy_7632736182807301398-no-watermark.mp4',
    title: 'Midnight Philosophy',
    category: 'Philosophy'
  },
  {
    id: 'v1',
    type: 'youtube',
    videoId: '8BfOov8D5S8',
    title: 'The Empire of Marcus Aurelius',
    category: 'Stoicism'
  },
  {
    id: 'vd2',
    type: 'direct',
    videoId: 'https://compcharity.org/wp-content/uploads/2026/04/Stoic-Wisdom-Scroll.mp4', // Example name, hoping it exists or using the other one
    title: 'Marcus Aurelius Meditations',
    category: 'Stoicism'
  },
  {
    id: 'v3',
    type: 'youtube',
    videoId: 'u6S7u0W0Wks',
    title: 'Stoic Mornings',
    category: 'Philosophy'
  },
];
