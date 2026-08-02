import fs from 'fs';
import path from 'path';

function fixGlottal(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Any key: 'something'a' or key: 'something'a" -> key: "something'a"
  code = code.replace(/([a-zA-Z0-9_]+):\s*['"]([^'"\n]*?'[a-zA-Z]*?)['"]/g, (m, key, val) => {
    // Clean trailing quote inside val if present
    const cleanVal = val.replace(/['"]$/, '');
    return `${key}: "${cleanVal}"`;
  });

  fs.writeFileSync(filePath, code, 'utf-8');
}

fixGlottal(path.resolve('./src/data/hebrewVocabData.ts'));
fixGlottal(path.resolve('./src/data/chineseVocabData.ts'));

console.log('Fixed glottal stop quotes in both files');
