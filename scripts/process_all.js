import fs from 'fs';
import path from 'path';

import { pinyinToVuk, hebrewToVuk } from './importer.js';
import { translateEnglishToSerbian } from './dictionary.js';

// Read Chinese CSV input
const chineseCsv = fs.readFileSync(path.resolve('./scripts/data/chinese_csv.txt'), 'utf-8');
const hebrewCsv = fs.readFileSync(path.resolve('./scripts/data/hebrew_csv.txt'), 'utf-8');

// Read existing Chinese code
const chineseFilePath = path.resolve('./src/data/chineseVocabData.ts');
let chineseCode = fs.readFileSync(chineseFilePath, 'utf-8');

// Read existing Hebrew code
const hebrewFilePath = path.resolve('./src/data/hebrewVocabData.ts');
let hebrewCode = fs.readFileSync(hebrewFilePath, 'utf-8');

// Collect all existing Chinese chars
const existingChinese = new Set();
for (const m of chineseCode.matchAll(/char:\s*['"]([^'"]+)['"]/g)) {
  existingChinese.add(m[1].trim());
}

// Collect all existing Hebrew chars
const existingHebrew = new Set();
for (const m of hebrewCode.matchAll(/char:\s*['"]([^'"]+)['"]/g)) {
  const charStr = m[1].trim();
  const norm = charStr.replace(/[\u0591-\u05C7]/g, '');
  existingHebrew.add(charStr);
  existingHebrew.add(norm);
}

// Process Chinese CSV
const chineseLines = chineseCsv.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('POS,'));
const newChineseItems = [];
const seenChineseInCsv = new Set();

for (const line of chineseLines) {
  const parts = line.split(',');
  if (parts.length < 6) continue;
  
  const pos = parts[0].trim();
  const simplified = parts[2].trim();
  const pinyin = parts[4].trim();
  const english = parts[5].trim();

  if (!simplified || existingChinese.has(simplified) || seenChineseInCsv.has(simplified)) {
    continue;
  }
  seenChineseInCsv.add(simplified);

  const vuk = pinyinToVuk(pinyin);
  const translation = translateEnglishToSerbian(english);
  const emoji = pos === 'noun' ? '📦' : (pos === 'verb' ? '⚡' : '✨');

  newChineseItems.push({
    char: simplified,
    pinyin,
    vuk,
    translation,
    english,
    emoji,
    radical: '字 Radical'
  });
}

// Process Hebrew CSV
const hebrewLines = hebrewCsv.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('POS,'));
const newHebrewItems = [];
const seenHebrewInCsv = new Set();

for (const line of hebrewLines) {
  const parts = line.split(',');
  if (parts.length < 5) continue;

  const pos = parts[0].trim();
  const heb = parts[2].trim();
  const trans = parts[3].trim();
  const english = parts[4].trim();
  const root = parts[6] ? parts[6].trim() : '';

  const norm = heb.replace(/[\u0591-\u05C7]/g, '');

  if (!heb || existingHebrew.has(heb) || existingHebrew.has(norm) || seenHebrewInCsv.has(heb) || seenHebrewInCsv.has(norm)) {
    continue;
  }
  seenHebrewInCsv.add(heb);
  seenHebrewInCsv.add(norm);

  const vuk = hebrewToVuk(trans);
  const translation = translateEnglishToSerbian(english);
  const emoji = pos === 'noun' ? '📖' : (pos === 'verb' ? '🌱' : '⭐');

  newHebrewItems.push({
    char: heb,
    transliteration: trans,
    vuk,
    translation,
    english,
    emoji,
    root: root || 'ש-ר-ש'
  });
}

console.log(`New non-duplicate Chinese items to add: ${newChineseItems.length}`);
console.log(`New non-duplicate Hebrew items to add: ${newHebrewItems.length}`);

// Append to highUtilityBase in hebrewVocabData.ts
if (newHebrewItems.length > 0) {
  const formattedItems = newHebrewItems.map(item => 
    `  { char: '${item.char}', transliteration: '${item.transliteration.replace(/'/g, "\\'")}', vuk: '${item.vuk}', translation: '${item.translation.replace(/'/g, "\\'")}', english: '${item.english.replace(/'/g, "\\'")}', emoji: '${item.emoji}', root: '${item.root}' }`
  ).join(',\n');

  const hebrewMarker = 'const highUtilityBase: Array<{ char: string; transliteration: string; vuk: string; translation: string; english: string; emoji: string; root: string }> = [';
  if (hebrewCode.includes(hebrewMarker)) {
    hebrewCode = hebrewCode.replace(hebrewMarker, `${hebrewMarker}\n${formattedItems},`);
    fs.writeFileSync(hebrewFilePath, hebrewCode, 'utf-8');
    console.log('Successfully updated hebrewVocabData.ts!');
  } else {
    console.error('Marker not found in hebrewVocabData.ts');
  }
}
