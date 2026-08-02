import fs from 'fs';
import path from 'path';

function cleanQuotes(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Fix single quotes inside single quotes like vuk: 'ša'a' or transliteration: 'sha'a'
  code = code.replace(/([a-zA-Z0-9_]+):\s*'([^'\n]*?)'([^'\n]*?)'/g, (m, key, p1, p2) => {
    // If key is e.g. vuk or transliteration
    return `${key}: "${p1}'${p2}"`;
  });

  // Remove trailing quotes in double-quoted strings like "sha'a'" -> "sha'a"
  code = code.replace(/"([^"]*?)'"/g, '"$1"');

  // Remove trailing quotes in single-quoted strings like 'sha\'' -> 'sha'
  code = code.replace(/'([^']*?)\\'/g, "'$1'");

  fs.writeFileSync(filePath, code, 'utf-8');
}

cleanQuotes(path.resolve('./src/data/hebrewVocabData.ts'));
cleanQuotes(path.resolve('./src/data/chineseVocabData.ts'));

console.log('Cleaned quotes');
