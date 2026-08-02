import { CHINESE_VOCAB_EXPANDED } from '../src/data/chineseVocabData';
import { HEBREW_VOCAB_EXPANDED } from '../src/data/hebrewVocabData';

console.log('CHINESE_VOCAB_EXPANDED length:', CHINESE_VOCAB_EXPANDED.length);
console.log('HEBREW_VOCAB_EXPANDED length:', HEBREW_VOCAB_EXPANDED.length);

// Check internal duplicates in Chinese
const cSet = new Set();
let cDupes = 0;
for (const item of CHINESE_VOCAB_EXPANDED) {
  if (cSet.has(item.char)) {
    cDupes++;
  } else {
    cSet.add(item.char);
  }
}

// Check internal duplicates in Hebrew
const hSet = new Set();
let hDupes = 0;
for (const item of HEBREW_VOCAB_EXPANDED) {
  const norm = item.char.replace(/[\u0591-\u05C7]/g, '');
  if (hSet.has(norm)) {
    hDupes++;
  } else {
    hSet.add(norm);
  }
}

console.log('Chinese array duplicates:', cDupes);
console.log('Hebrew array duplicates:', hDupes);
