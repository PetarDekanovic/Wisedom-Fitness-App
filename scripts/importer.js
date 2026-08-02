import fs from 'fs';
import path from 'path';

// Load existing files
const chinesePath = path.resolve('./src/data/chineseVocabData.ts');
const hebrewPath = path.resolve('./src/data/hebrewVocabData.ts');

let chineseContent = fs.readFileSync(chinesePath, 'utf-8');
let hebrewContent = fs.readFileSync(hebrewPath, 'utf-8');

// Existing Sets
const existingChinese = new Set();
for (const m of chineseContent.matchAll(/char:\s*['"]([^'"]+)['"]/g)) {
  existingChinese.add(m[1].trim());
}

const existingHebrew = new Set();
for (const m of hebrewContent.matchAll(/char:\s*['"]([^'"]+)['"]/g)) {
  // normalize Hebrew (remove niqqud for comparison, or direct match)
  const norm = m[1].trim().replace(/[\u0591-\u05C7]/g, '');
  existingHebrew.add(m[1].trim());
  existingHebrew.add(norm);
}

console.log(`Existing Chinese count: ${existingChinese.size}`);
console.log(`Existing Hebrew count: ${existingHebrew.size}`);

export function pinyinToVuk(pinyin) {
  if (!pinyin) return '';
  let str = pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  str = str.replace(/zh/g, 'dž')
           .replace(/ch/g, 'č')
           .replace(/sh/g, 'š')
           .replace(/ji/g, 'đji')
           .replace(/j/g, 'đj')
           .replace(/qi/g, 'ći')
           .replace(/q/g, 'ć')
           .replace(/x/g, 'sj')
           .replace(/yu/g, 'ju')
           .replace(/ian/g, 'jien')
           .replace(/ao/g, 'ao')
           .replace(/ou/g, 'ou');
  return str;
}

export function hebrewToVuk(trans) {
  if (!trans) return '';
  let str = trans.toLowerCase();
  str = str.replace(/sh/g, 'š')
           .replace(/ch/g, 'h')
           .replace(/kh/g, 'h')
           .replace(/tz/g, 'c')
           .replace(/ts/g, 'c')
           .replace(/y/g, 'j');
  return str;
}
