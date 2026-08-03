import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./src/components/ChineseVocabView.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// 1. Update icon imports
code = code.replace(
  "import { \n  Volume2, \n  Trophy, \n  BookOpen, \n  Gamepad2, \n  CheckCircle, \n  XCircle, \n  Search, \n  Copy, \n  Check,\n  Zap,\n  LayoutGrid,\n  Wand2,\n  Pencil,\n  X,\n  Save,\n  RotateCcw\n} from 'lucide-react';",
  `import { 
  Volume2, 
  Trophy, 
  BookOpen, 
  Gamepad2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Copy, 
  Check,
  Zap,
  LayoutGrid,
  Wand2,
  Pencil,
  X,
  Save,
  RotateCcw,
  Sparkles,
  GripVertical,
  Trash2,
  RefreshCw,
  MoveLeft,
  MoveRight,
  Plus,
  Layers,
  Sliders,
  ChevronDown
} from 'lucide-react';`
);

// 2. Expand CONFIGURATOR_SUBJECTS
const oldSubjects = `const CONFIGURATOR_SUBJECTS = [
  { char: '我', pinyin: 'Wǒ', vuk: 'Vo', translationSr: 'Ja', translationEn: 'I' },
  { char: '你', pinyin: 'Nǐ', vuk: 'Ni', translationSr: 'Ti', translationEn: 'You' },
  { char: '他们', pinyin: 'Tāmen', vuk: 'Ta men', translationSr: 'Oni', translationEn: 'They' },
];`;

const newSubjects = `const CONFIGURATOR_SUBJECTS = [
  { char: '我', pinyin: 'Wǒ', vuk: 'Vo', translationSr: 'Ja', translationEn: 'I' },
  { char: '你', pinyin: 'Nǐ', vuk: 'Ni', translationSr: 'Ti', translationEn: 'You' },
  { char: '他', pinyin: 'Tā', vuk: 'Ta', translationSr: 'On', translationEn: 'He' },
  { char: '她', pinyin: 'Tā', vuk: 'Ta', translationSr: 'Ona', translationEn: 'She' },
  { char: '我们', pinyin: 'Wǒmen', vuk: 'Vo men', translationSr: 'Mi', translationEn: 'We' },
  { char: '他们', pinyin: 'Tāmen', vuk: 'Ta men', translationSr: 'Oni', translationEn: 'They' },
];

export interface DndWordItem {
  id: string;
  char: string;
  pinyin: string;
  vuk: string;
  sr: string;
  en: string;
  type: 'pronoun' | 'verb' | 'noun' | 'adjective' | 'connector';
}

export const DND_CHINESE_WORDS: DndWordItem[] = [
  // Pronouns / Subjects
  { id: 'cn-p1', char: '我', pinyin: 'Wǒ', vuk: 'Vo', sr: 'Ja', en: 'I', type: 'pronoun' },
  { id: 'cn-p2', char: '你', pinyin: 'Nǐ', vuk: 'Ni', sr: 'Ti', en: 'You', type: 'pronoun' },
  { id: 'cn-p3', char: '他', pinyin: 'Tā', vuk: 'Ta', sr: 'On', en: 'He', type: 'pronoun' },
  { id: 'cn-p4', char: '她', pinyin: 'Tā', vuk: 'Ta', sr: 'Ona', en: 'She', type: 'pronoun' },
  { id: 'cn-p5', char: '我们', pinyin: 'Wǒmen', vuk: 'Vo men', sr: 'Mi', en: 'We', type: 'pronoun' },
  { id: 'cn-p6', char: '他们', pinyin: 'Tāmen', vuk: 'Ta men', sr: 'Oni', en: 'They', type: 'pronoun' },

  // Verbs
  { id: 'cn-v1', char: '思考', pinyin: 'sīkǎo', vuk: 'si kao', sr: 'promišljam', en: 'ponder / think', type: 'verb' },
  { id: 'cn-v2', char: '学', pinyin: 'xué', vuk: 'sjue', sr: 'učim', en: 'study / learn', type: 'verb' },
  { id: 'cn-v3', char: '喜欢', pinyin: 'xǐhuan', vuk: 'si huan', sr: 'volim', en: 'like', type: 'verb' },
  { id: 'cn-v4', char: '爱', pinyin: 'ài', vuk: 'ai', sr: 'volim (ljubav)', en: 'love', type: 'verb' },
  { id: 'cn-v5', char: '创造', pinyin: 'chuàngzào', vuk: 'čuang dzao', sr: 'stvaram', en: 'create', type: 'verb' },
  { id: 'cn-v6', char: '寻找', pinyin: 'xúnzhǎo', vuk: 'sun džao', sr: 'tražim', en: 'seek', type: 'verb' },
  { id: 'cn-v7', char: '听', pinyin: 'tīng', vuk: 'ting', sr: 'slušam', en: 'listen', type: 'verb' },
  { id: 'cn-v8', char: '看', pinyin: 'kàn', vuk: 'kan', sr: 'gledam', en: 'watch / see', type: 'verb' },
  { id: 'cn-v9', char: '写', pinyin: 'xiě', vuk: 'sje', sr: 'pišem', en: 'write', type: 'verb' },

  // Nouns
  { id: 'cn-n1', char: '智慧', pinyin: 'zhìhuì', vuk: 'dži hui', sr: 'mudrost', en: 'wisdom', type: 'noun' },
  { id: 'cn-n2', char: '真理', pinyin: 'zhēnlǐ', vuk: 'džen li', sr: 'istinu', en: 'truth', type: 'noun' },
  { id: 'cn-n3', char: '和平', pinyin: 'hépíng', vuk: 'he ping', sr: 'mir', en: 'peace', type: 'noun' },
  { id: 'cn-n4', char: '光明', pinyin: 'guāngmíng', vuk: 'guang ming', sr: 'svetlost', en: 'light', type: 'noun' },
  { id: 'cn-n5', char: '道', pinyin: 'dào', vuk: 'dao', sr: 'Put / Dao', en: 'the Way', type: 'noun' },
  { id: 'cn-n6', char: '力量', pinyin: 'lìliàng', vuk: 'li ljang', sr: 'snagu', en: 'strength', type: 'noun' },
  { id: 'cn-n7', char: '心', pinyin: 'xīn', vuk: 'sin', sr: 'srce / um', en: 'heart / mind', type: 'noun' },
  { id: 'cn-n8', char: '书', pinyin: 'shū', vuk: 'šu', sr: 'knjigu', en: 'book', type: 'noun' },

  // Adjectives
  { id: 'cn-a1', char: '酷', pinyin: 'kù', vuk: 'ku', sr: 'kul / super', en: 'cool', type: 'adjective' },
  { id: 'cn-a2', char: '有趣', pinyin: 'yǒuqù', vuk: 'jo ćjü', sr: 'zabavno', en: 'fun / interesting', type: 'adjective' },
  { id: 'cn-a3', char: '美', pinyin: 'měi', vuk: 'mei', sr: 'prelepo', en: 'beautiful', type: 'adjective' },
  { id: 'cn-a4', char: '棒', pinyin: 'bàng', vuk: 'bang', sr: 'fantastično', en: 'awesome', type: 'adjective' },
  { id: 'cn-a5', char: '好', pinyin: 'hǎo', vuk: 'hao', sr: 'dobro', en: 'good', type: 'adjective' },
  { id: 'cn-a6', char: '平静', pinyin: 'píngjìng', vuk: 'ping đjing', sr: 'spokojno', en: 'calm', type: 'adjective' },

  // Connectors
  { id: 'cn-c1', char: '的', pinyin: 'de', vuk: 'de', sr: '(prisvojna rečca)', en: 'of / \'s', type: 'connector' },
  { id: 'cn-c2', char: '和', pinyin: 'hé', vuk: 'he', sr: 'i / sa', en: 'and / with', type: 'connector' },
  { id: 'cn-c3', char: '很', pinyin: 'hěn', vuk: 'hen', sr: 'veoma / jako', en: 'very', type: 'connector' },
  { id: 'cn-c4', char: '也', pinyin: 'yě', vuk: 'je', sr: 'takođe', en: 'also', type: 'connector' },
];`;

code = code.replace(oldSubjects, newSubjects);

fs.writeFileSync(filePath, code, 'utf-8');
console.log('Patched ChineseVocabView top definitions');
