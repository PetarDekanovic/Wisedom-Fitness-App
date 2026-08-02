import fs from 'fs';
import path from 'path';

function fixEnglish(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Replace english: '... father's ...' with double quotes english: "..."
  code = code.replace(/english:\s*'([^'\n]*?)'s([^'\n]*?)'/g, 'english: "$1\'s$2"');
  code = code.replace(/english:\s*'([^'\n]*?)'s'/g, 'english: "$1\'s"');

  fs.writeFileSync(filePath, code, 'utf-8');
}

fixEnglish(path.resolve('./src/data/chineseVocabData.ts'));
fixEnglish(path.resolve('./src/data/hebrewVocabData.ts'));

console.log('Fixed apostrophes in english fields');
