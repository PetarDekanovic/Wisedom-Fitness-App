import fs from 'fs';
import path from 'path';

const hPath = path.resolve('./src/data/hebrewVocabData.ts');
let hCode = fs.readFileSync(hPath, 'utf-8');

// Ensure unique Hebrew words when building HEBREW_VOCAB_EXPANDED
// Replace line:
// const existingHebrewChars = new Set(HEBREW_VOCAB_EXPANDED.map(v => v.char.trim()));
// with a check on normalized form as well.

hCode = hCode.replace(
  'const existingHebrewChars = new Set(HEBREW_VOCAB_EXPANDED.map(v => v.char.trim()));',
  'const existingHebrewChars = new Set(HEBREW_VOCAB_EXPANDED.map(v => v.char.replace(/[\\u0591-\\u05C7]/g, "").trim()));'
);

hCode = hCode.replace(
  'if (!existingHebrewChars.has(base.char.trim())) {',
  'const normBase = base.char.replace(/[\\u0591-\\u05C7]/g, "").trim();\n  if (!existingHebrewChars.has(normBase)) {'
);

hCode = hCode.replace(
  'existingHebrewChars.add(base.char.trim());',
  'existingHebrewChars.add(normBase);'
);

fs.writeFileSync(hPath, hCode, 'utf-8');

console.log('Updated Hebrew array deduplication logic');
