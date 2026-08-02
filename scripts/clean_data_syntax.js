import fs from 'fs';
import path from 'path';

const cPath = path.resolve('./src/data/chineseVocabData.ts');
let cCode = fs.readFileSync(cPath, 'utf-8');

// Clean up pinyin: '...'\' -> pinyin: '...'
cCode = cCode.replace(/pinyin:\s*'([^']*)'\\''/g, "pinyin: '$1'");
cCode = cCode.replace(/pinyin:\s*'([^'\\]*)\\'([^'\\]*)'/g, "pinyin: \"$1'$2\"");
cCode = cCode.replace(/vuk:\s*'([^'\\]*)\\'([^'\\]*)'/g, "vuk: \"$1'$2\"");

// Remove any lingering trailing \' right before closing quote
cCode = cCode.replace(/\\''/g, "'");

fs.writeFileSync(cPath, cCode, 'utf-8');

const hPath = path.resolve('./src/data/hebrewVocabData.ts');
let hCode = fs.readFileSync(hPath, 'utf-8');

hCode = hCode.replace(/transliteration:\s*'([^']*)'\\''/g, "transliteration: '$1'");
hCode = hCode.replace(/transliteration:\s*'([^'\\]*)\\'([^'\\]*)'/g, "transliteration: \"$1'$2\"");
hCode = hCode.replace(/\\''/g, "'");

fs.writeFileSync(hPath, hCode, 'utf-8');

console.log('Cleaned up data syntax');
