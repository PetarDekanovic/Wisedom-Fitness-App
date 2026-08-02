import fs from 'fs';
import path from 'path';

const cPath = path.resolve('./src/data/chineseVocabData.ts');
let cCode = fs.readFileSync(cPath, 'utf-8');

cCode = cCode.replace(/pinyin:\s*"nǚ'"ér'/g, 'pinyin: "nǚ\'ér"');
// Clean up any trailing single quotes at end of pinyin strings like pinyin: "tā'"
cCode = cCode.replace(/pinyin:\s*"([^"]*)'"/g, 'pinyin: "$1"');
cCode = cCode.replace(/pinyin:\s*'([^']*)''/g, "pinyin: '$1'");

fs.writeFileSync(cPath, cCode, 'utf-8');

console.log('Fixed line 130 and trailing quotes');
