const fs = require('fs');
const path = require('path');

const part1 = require('./clusters_part1.cjs');
const part2 = require('./clusters_part2.cjs');
const part3 = require('./clusters_part3.cjs');
const part4 = require('./clusters_part4.cjs');

const allClusters = [...part1, ...part2, ...part3, ...part4];

const totalWords = allClusters.reduce((acc, c) => acc + c.words.length, 0);
const totalSentences = allClusters.reduce((acc, c) => acc + c.sentences.length, 0);

console.log(`Assembling ${allClusters.length} clusters with ${totalWords} total words and ${totalSentences} idioms/proverbs.`);

const targetPath = path.resolve(__dirname, '../src/data/chineseRealLifeClustersData.ts');

const content = `// ============================================================================
// CHINESE REAL LIFE CLUSTERS - HIGH-FREQUENCY VOCABULARY & IDIOMS (CHENGYU/YANYU)
// 840 Essential Native Words (~90% Everyday Spoken Coverage) & Classical Proverbs
// ============================================================================

export interface RealLifeWordItem {
  char: string;
  charTraditional?: string;
  pinyin: string;
  vuk: string;
  english: string;
  serbian: string;
  exampleUse: string;
  isCoreChar?: boolean; // true if one of the 10 root characters from the image chart
  category?: 'noun' | 'verb' | 'adjective' | 'phrase' | 'number' | 'direction';
  hskLevel?: number; // 1, 2, 3, 4
  frequencyRank?: string; // e.g. "Top 100", "Top 300", "Top 800"
}

export interface RealLifeSentenceToken {
  word: string;
  pinyin: string;
  english: string;
  serbian: string;
  isTarget?: boolean;
}

export interface RealLifeIdiomOrProverb {
  id: string;
  type: 'chengyu' | 'proverb' | 'wisdom_quote';
  typeLabel: string; // e.g. "成语 4-Character Idiom", "古训 / 谚语 Classical Proverb"
  chinese: string;
  chineseTraditional?: string;
  pinyin: string;
  vuk: string;
  literalEnglish: string;
  english: string;
  serbianEquivalent: string; // E.g., "Tiha voda breg roni", "Ko rano rani dve sreće grabi"
  serbian: string;
  philosophicalContext: string; // Stoic / Cultural insight
  targetWords: string[];
  context: string;
  tokens: RealLifeSentenceToken[];
}

// Backwards compatibility alias for components that consume RealLifeSentence
export type RealLifeSentence = RealLifeIdiomOrProverb;

export interface RealLifeCluster {
  id: string;
  chartId: 1 | 2;
  rowNumber: number;
  title: string;
  titleSerbian: string;
  emoji: string;
  chartImage: string;
  description: string;
  words: RealLifeWordItem[];
  sentences: RealLifeIdiomOrProverb[];
}

export const REAL_LIFE_CLUSTERS: RealLifeCluster[] = ${JSON.stringify(allClusters, null, 2)};

export const TOTAL_REAL_LIFE_WORDS = REAL_LIFE_CLUSTERS.reduce((acc, c) => acc + c.words.length, 0);
`;

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully written to', targetPath);
