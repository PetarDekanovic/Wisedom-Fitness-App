import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Replace "text' or 'text" with 'text'
  code = code.replace(/"([^"\n']+)'/g, "'$1'");
  code = code.replace(/'([^"\n']+)"/g, "'$1'");

  // Fix category type definition line
  code = code.replace(/category:\s*"strofa_1' \| "refren'/g, "category: 'strofa_1' | 'refren'");

  fs.writeFileSync(filePath, code, 'utf-8');
}

fixFile(path.resolve('./src/data/chineseVocabData.ts'));
fixFile(path.resolve('./src/data/hebrewVocabData.ts'));

console.log('Fixed mismatched quotes');
