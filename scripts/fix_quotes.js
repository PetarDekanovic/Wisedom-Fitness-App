import fs from 'fs';
import path from 'path';

const chineseFilePath = path.resolve('./src/data/chineseVocabData.ts');
let chineseCode = fs.readFileSync(chineseFilePath, 'utf-8');

// Fix unescaped single quotes inside single quotes like pinyin: 'nǚ'ér'
chineseCode = chineseCode.replace(/pinyin:\s*'([^'\\]*)'([^'\\]*)'/g, (match, p1, p2) => {
  return `pinyin: '${p1}\\''${p2}'`;
});

// Specifically fix nǚ'ér
chineseCode = chineseCode.replace(/pinyin:\s*'nǚ'ér'/g, "pinyin: 'nǚ\\'ér'");
chineseCode = chineseCode.replace(/vuk:\s*'nu'er'/g, "vuk: 'nu\\'er'");

fs.writeFileSync(chineseFilePath, chineseCode, 'utf-8');

const hebrewFilePath = path.resolve('./src/data/hebrewVocabData.ts');
let hebrewCode = fs.readFileSync(hebrewFilePath, 'utf-8');
hebrewCode = hebrewCode.replace(/transliteration:\s*'([^'\\]*)'([^'\\]*)'/g, (match, p1, p2) => {
  return `transliteration: '${p1}\\''${p2}'`;
});
fs.writeFileSync(hebrewFilePath, hebrewCode, 'utf-8');

console.log('Fixed quotes in data files');
