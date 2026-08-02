import fs from 'fs';
import path from 'path';

const chineseContent = fs.readFileSync(path.resolve('./src/data/chineseVocabData.ts'), 'utf-8');
const hebrewContent = fs.readFileSync(path.resolve('./src/data/hebrewVocabData.ts'), 'utf-8');

const chineseChars = new Set();
for (const m of chineseContent.matchAll(/char:\s*['"]([^'"]+)['"]/g)) {
  chineseChars.add(m[1]);
}

const hebrewChars = new Set();
for (const m of hebrewContent.matchAll(/char:\s*['"]([^'"]+)['"]/g)) {
  hebrewChars.add(m[1]);
}

console.log('Unique Chinese words in file:', chineseChars.size);
console.log('Unique Hebrew words in file:', hebrewChars.size);
