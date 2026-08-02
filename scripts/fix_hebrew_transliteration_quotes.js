import fs from 'fs';
import path from 'path';

const hPath = path.resolve('./src/data/hebrewVocabData.ts');
let hCode = fs.readFileSync(hPath, 'utf-8');

// Replace transliteration: '...' " with transliteration: '...'
hCode = hCode.replace(/transliteration:\s*'([^']*)'"/g, "transliteration: '$1'");
// Replace transliteration: "..." ' with transliteration: "$1"
hCode = hCode.replace(/transliteration:\s*"([^"]*)'/g, "transliteration: '$1'");

fs.writeFileSync(hPath, hCode, 'utf-8');

console.log('Fixed hebrew transliteration quotes');
