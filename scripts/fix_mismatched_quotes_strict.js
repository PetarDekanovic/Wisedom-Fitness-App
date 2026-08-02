import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Fix key: 'value" -> key: 'value'
  code = code.replace(/([a-zA-Z0-9_]+):\s*'([^'\n"]*)"/g, "$1: '$2'");
  // Fix key: "value' -> key: 'value'
  code = code.replace(/([a-zA-Z0-9_]+):\s*"([^'\n"]*)'/g, "$1: '$2'");

  fs.writeFileSync(filePath, code, 'utf-8');
}

fixFile(path.resolve('./src/data/chineseVocabData.ts'));
fixFile(path.resolve('./src/data/hebrewVocabData.ts'));

console.log('Strictly fixed mismatched quotes');
