import { VideoHistoryItem } from '../types';

export const INITIAL_HISTORY_VIDEOS: VideoHistoryItem[] = [
  {
    id: 'v1',
    type: 'youtube',
    videoId: '8BfOov8D5S8',
    title: 'The Empire of Marcus Aurelius',
    category: 'Stoicism'
  },
  {
    id: 'v2',
    type: 'tiktok',
    videoId: '7345678901234567890', // Placeholder
    title: 'Spartan Discipline',
    category: 'History'
  },
  {
    id: 'v3',
    type: 'youtube',
    videoId: 'u6S7u0W0Wks',
    title: 'Stoic Mornings',
    category: 'Philosophy'
  },
  {
    id: 'v4',
    type: 'tiktok',
    videoId: '7234567890123456789', // Placeholder
    title: 'The Fall of Rome',
    category: 'History'
  },
  {
    id: 'v5',
    type: 'youtube',
    videoId: 'rO_M0h5D5SM',
    title: 'Seneca on Time',
    category: 'Philosophy'
  }
];
