import fs from 'fs';
import path from 'path';

const hPath = path.resolve('./src/data/hebrewVocabData.ts');
let hCode = fs.readFileSync(hPath, 'utf-8');

// Standardize HEBREW_WISE_QUOTES block
const blockStart = hCode.indexOf('export const HEBREW_WISE_QUOTES');
if (blockStart !== -1) {
  let block = hCode.substring(blockStart);
  // Replace quote: ["'](.*?)["'], translation: ["'](.*?)["']
  block = block.replace(/quote:\s*["']([^"\n]*?)["'],\s*translation:\s*["']([^"\n]*?)["']/g, (m, q, t) => {
    // Clean any inner unescaped quotes if needed
    const cleanQ = q.replace(/["']/g, (c) => c === "'" ? "''" : '\\"');
    const cleanT = t.replace(/["']/g, (c) => c === "'" ? "''" : '\\"');
    return `quote: "${q.replace(/"/g, '\\"')}", translation: "${t.replace(/"/g, '\\"')}"`;
  });
  hCode = hCode.substring(0, blockStart) + block;
  fs.writeFileSync(hPath, hCode, 'utf-8');
}

console.log('Cleaned HEBREW_WISE_QUOTES block');
