import fs from 'fs';
import path from 'path';

const hPath = path.resolve('./src/data/hebrewVocabData.ts');
let hCode = fs.readFileSync(hPath, 'utf-8');

// Replace quote: '...' with single quote inside with quote: "..."
hCode = hCode.replace(/quote:\s*'([^'\n]*?ה'[^'\n]*?)'/g, 'quote: "$1"');
hCode = hCode.replace(/quote:\s*'([^'\n]*?'[^'\n]*?)'/g, 'quote: "$1"');

fs.writeFileSync(hPath, hCode, 'utf-8');

console.log('Fixed HEBREW_WISE_QUOTES single quotes');
