import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./src/components/HebrewVocabView.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// 1. Update icon imports in HebrewVocabView
code = code.replace(
  "import { \n  Volume2, \n  Trophy, \n  BookOpen, \n  Award, \n  Gamepad2, \n  Sparkles, \n  CheckCircle, \n  XCircle, \n  Search, \n  Copy, \n  Check,\n  Zap,\n  LayoutGrid,\n  Wand2,\n  RefreshCw,\n  Layers,\n  ChevronDown,\n  Pencil,\n  X,\n  Save,\n  RotateCcw\n} from 'lucide-react';",
  `import { 
  Volume2, 
  Trophy, 
  BookOpen, 
  Award, 
  Gamepad2, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Search, 
  Copy, 
  Check,
  Zap,
  LayoutGrid,
  Wand2,
  RefreshCw,
  Layers,
  ChevronDown,
  Pencil,
  X,
  Save,
  RotateCcw,
  GripVertical,
  Trash2,
  MoveLeft,
  MoveRight,
  Plus,
  Sliders
} from 'lucide-react';`
);

// 2. Expand HEBREW_CONFIG_SUBJECTS & HEBREW_CONFIG_VERBS
const oldHebSubjects = `const HEBREW_CONFIG_SUBJECTS = [
  { char: 'אֲנִי', vuk: 'Ani', translationSr: 'Ja', translationEn: 'I' },
  { char: 'אַתָּה', vuk: 'Atah', translationSr: 'Ti', translationEn: 'You' },
  { char: 'הֵם', vuk: 'Hem', translationSr: 'Oni', translationEn: 'They' },
];`;

const newHebSubjects = `const HEBREW_CONFIG_SUBJECTS = [
  { char: 'אֲנִי', vuk: 'Ani', translationSr: 'Ja', translationEn: 'I' },
  { char: 'אַתָּה', vuk: 'Atah', translationSr: 'Ti (m)', translationEn: 'You (m)' },
  { char: 'אַתְּ', vuk: 'At', translationSr: 'Ti (f)', translationEn: 'You (f)' },
  { char: 'הוּא', vuk: 'Hu', translationSr: 'On', translationEn: 'He' },
  { char: 'הִיא', vuk: 'Hi', translationSr: 'Ona', translationEn: 'She' },
  { char: 'אֲנַחְנוּ', vuk: 'Anachnu', translationSr: 'Mi', translationEn: 'We' },
  { char: 'הֵם', vuk: 'Hem', translationSr: 'Oni', translationEn: 'They' },
];

export interface HebDndWordItem {
  id: string;
  char: string;
  vuk: string;
  sr: string;
  en: string;
  type: 'pronoun' | 'verb' | 'noun' | 'adjective' | 'connector';
}

export const DND_HEBREW_WORDS: HebDndWordItem[] = [
  // Pronouns
  { id: 'he-p1', char: 'אֲנִי', vuk: 'Ani', sr: 'Ja', en: 'I', type: 'pronoun' },
  { id: 'he-p2', char: 'אַתָּה', vuk: 'Atah', sr: 'Ti (m)', en: 'You (m)', type: 'pronoun' },
  { id: 'he-p3', char: 'אַתְּ', vuk: 'At', sr: 'Ti (f)', en: 'You (f)', type: 'pronoun' },
  { id: 'he-p4', char: 'הוּא', vuk: 'Hu', sr: 'On', en: 'He', type: 'pronoun' },
  { id: 'he-p5', char: 'הִיא', vuk: 'Hi', sr: 'Ona', en: 'She', type: 'pronoun' },
  { id: 'he-p6', char: 'אֲנַחְנוּ', vuk: 'Anachnu', sr: 'Mi', en: 'We', type: 'pronoun' },
  { id: 'he-p7', char: 'הֵם', vuk: 'Hem', sr: 'Oni', en: 'They', type: 'pronoun' },

  // Verbs
  { id: 'he-v1', char: 'לוֹמֵד', vuk: 'lomed', sr: 'učim / uči', en: 'study / learn', type: 'verb' },
  { id: 'he-v2', char: 'חוֹשֵׁב', vuk: 'choshev', sr: 'razmišljam', en: 'ponder / think', type: 'verb' },
  { id: 'he-v3', char: 'אוֹהֵב', vuk: 'ohev', sr: 'volim', en: 'love', type: 'verb' },
  { id: 'he-v4', char: 'מְחַפֵּשׂ', vuk: 'mechapes', sr: 'tražim', en: 'seek', type: 'verb' },
  { id: 'he-v5', char: 'רוֹאֶה', vuk: 'roeh', sr: 'vidim', en: 'see', type: 'verb' },
  { id: 'he-v6', char: 'שׁוֹמֵעַ', vuk: 'shomea', sr: 'slušam', en: 'listen', type: 'verb' },
  { id: 'he-v7', char: 'יוֹצֵר', vuk: 'yotzer', sr: 'stvaram', en: 'create', type: 'verb' },
  { id: 'he-v8', char: 'כּוֹתֵב', vuk: 'kotev', sr: 'pišem', en: 'write', type: 'verb' },

  // Nouns
  { id: 'he-n1', char: 'חָכְמָה', vuk: 'chokhmah', sr: 'mudrost', en: 'wisdom', type: 'noun' },
  { id: 'he-n2', char: 'אֱמֶת', vuk: 'emet', sr: 'istinu', en: 'truth', type: 'noun' },
  { id: 'he-n3', char: 'שָׁלוֹם', vuk: 'shalom', sr: 'mir', en: 'peace', type: 'noun' },
  { id: 'he-n4', char: 'אוֹר', vuk: 'or', sr: 'svetlost', en: 'light', type: 'noun' },
  { id: 'he-n5', char: 'סֵפֶר', vuk: 'sefer', sr: 'knjigu', en: 'book', type: 'noun' },
  { id: 'he-n6', char: 'דֶּרֶךְ', vuk: 'derekh', sr: 'put', en: 'path', type: 'noun' },
  { id: 'he-n7', char: 'כֹּחַ', vuk: 'koach', sr: 'snagu', en: 'strength', type: 'noun' },
  { id: 'he-n8', char: 'לֵב', vuk: 'lev', sr: 'srce', en: 'heart / mind', type: 'noun' },

  // Adjectives
  { id: 'he-a1', char: 'מגְנִיב', vuk: 'megniv', sr: 'super / kul', en: 'cool', type: 'adjective' },
  { id: 'he-a2', char: 'כֵּיף', vuk: 'kef', sr: 'zabavno', en: 'fun', type: 'adjective' },
  { id: 'he-a3', char: 'יָפֶה', vuk: 'yafeh', sr: 'lepo', en: 'beautiful', type: 'adjective' },
  { id: 'he-a4', char: 'טוֹב', vuk: 'tov', sr: 'dobro', en: 'good', type: 'adjective' },
  { id: 'he-a5', char: 'חָכָם', vuk: 'chakham', sr: 'mudro', en: 'wise', type: 'adjective' },
  { id: 'he-a6', char: 'חָזָק', vuk: 'chazak', sr: 'snažno', en: 'strong', type: 'adjective' },

  // Connectors
  { id: 'he-c1', char: 'וְ', vuk: 've-', sr: 'i / a', en: 'and', type: 'connector' },
  { id: 'he-c2', char: 'אֶת', vuk: 'et', sr: '(akuzativ)', en: 'direct object marker', type: 'connector' },
  { id: 'he-c3', char: 'עִם', vuk: 'im', sr: 'sa', en: 'with', type: 'connector' },
  { id: 'he-c4', char: 'מְאֹד', vuk: 'meod', sr: 'veoma', en: 'very', type: 'connector' },
];`;

code = code.replace(oldHebSubjects, newHebSubjects);

// Also expand HEBREW_CONFIG_VERBS object mappings to handle all 7 subjects gracefully:
const oldHebVerbs = `const HEBREW_CONFIG_VERBS = [
  { char: { 'אֲנִי': 'לוֹמֵד', 'אַתָּה': 'לוֹמֵד', 'הֵם': 'לוֹמְדִים' }, vuk: { 'אֲנִי': 'lomed', 'אַתָּה': 'lomed', 'הֵם': 'lomdim' }, label: 'לוֹמֵד (Učiti)', sr: { 'אֲנִי': 'učim', 'אַתָּה': 'učiš', 'הֵם': 'uče' }, en: 'study' },
  { char: { 'אֲנִי': 'חוֹשֵׁב', 'אַתָּה': 'חוֹשֵׁב', 'הֵם': 'חוֹשְׁבִים' }, vuk: { 'אֲנִי': 'choshev', 'אַתָּה': 'choshev', 'הֵם': 'choshvim' }, label: 'חוֹשֵׁב (Misliti)', sr: { 'אֲנִי': 'promišljam o', 'אַתָּה': 'promišljaš o', 'הֵם': 'promišljaju o' }, en: 'ponder' },
  { char: { 'אֲנִי': 'אוֹהֵב', 'אַתָּה': 'אוֹהֵב', 'הֵם': 'אוֹהֲבִים' }, vuk: { 'אֲנִי': 'ohev', 'אַתָּה': 'ohev', 'הֵם': 'ohavim' }, label: 'אוֹהֵב (Voleti)', sr: { 'אֲנִי': 'volim', 'אַתָּה': 'voliš', 'הֵם': 'vole' }, en: 'love' },
  { char: { 'אֲנִי': 'מְחַפֵּשׂ', 'אַתָּה': 'מְחַפֵּשׂ', 'הֵם': 'מְחַפְּשִׂים' }, vuk: { 'אֲנִי': 'mechapes', 'אַתָּה': 'mechapes', 'הֵם': 'mechapsim' }, label: 'מְחַפֵּשׂ (Tražiti)', sr: { 'אֲנִי': 'tražim', 'אַתָּה': 'tražiš', 'הֵם': 'traže' }, en: 'seek' },
  { char: { 'אֲנִי': 'רוֹאֶה', 'אַתָּה': 'רוֹאֶה', 'הֵם': 'רוֹאִים' }, vuk: { 'אֲנִי': 'roeh', 'אַתָּה': 'roeh', 'הֵם': 'roim' }, label: 'רוֹאֶה (Videti)', sr: { 'אֲנִי': 'vidim', 'אַתָּה': 'vidiš', 'הֵם': 'vide' }, en: 'see' },
  { char: { 'אֲנִי': 'שׁוֹמֵעַ', 'אַתָּה': 'שׁוֹמֵעַ', 'הֵם': 'שׁוֹמְעִים' }, vuk: { 'אֲנִי': 'shomea', 'אַתָּה': 'shomea', 'הֵם': 'shomim' }, label: 'שׁוֹמֵעַ (Slušati)', sr: { 'אֲנִי': 'slušam', 'אַתָּה': 'slušaš', 'הֵם': 'slušaju' }, en: 'listen to' },
  { char: { 'אֲנִי': 'יוֹצֵר', 'אַתָּה': 'יוֹצֵר', 'הֵם': 'יוֹצְרִים' }, vuk: { 'אֲנִי': 'yotzer', 'אַתָּה': 'yotzer', 'הֵם': 'yotzrim' }, label: 'יוֹצֵר (Stvarati)', sr: { 'אֲנִי': 'stvaram', 'אַתָּה': 'stvaraš', 'הֵם': 'stvaraju' }, en: 'create' },
  { char: { 'אֲנִי': 'כּוֹתֵב', 'אַתָּה': 'כּוֹתֵב', 'הֵם': 'כּוֹתְבִים' }, vuk: { 'אֲנִי': 'kotev', 'אַתָּה': 'kotev', 'הֵם': 'kotvim' }, label: 'כּוֹתֵב (Pisati)', sr: { 'אֲנִי': 'pišem', 'אַתָּה': 'pišeš', 'הֵם': 'pišu' }, en: 'write' },
];`;

const newHebVerbs = `const HEBREW_CONFIG_VERBS = [
  { 
    char: { 'אֲנִי': 'לוֹמֵד', 'אַתָּה': 'לוֹמֵד', 'אַתְּ': 'לוֹמֶדֶת', 'הוּא': 'לוֹמֵד', 'הִיא': 'לוֹמֶדֶת', 'אֲנַחְנוּ': 'לוֹמְדִים', 'הֵם': 'לוֹמְדִים' }, 
    vuk: { 'אֲנִי': 'lomed', 'אַתָּה': 'lomed', 'אַתְּ': 'lomedet', 'הוּא': 'lomed', 'הִיא': 'lomedet', 'אֲנַחְנוּ': 'lomdim', 'הֵם': 'lomdim' }, 
    label: 'לוֹמֵד (Učiti)', 
    sr: { 'אֲנִי': 'učim', 'אַתָּה': 'učiš', 'אַתְּ': 'učiš (ž)', 'הוּא': 'uči', 'הִיא': 'uči', 'אֲנַחְנוּ': 'učimo', 'הֵם': 'uče' }, 
    en: 'study' 
  },
  { 
    char: { 'אֲנִי': 'חוֹשֵׁב', 'אַתָּה': 'חוֹשֵׁב', 'אַתְּ': 'חוֹשֶׁבֶת', 'הוּא': 'חוֹשֵׁב', 'הִיא': 'חוֹשֶׁבֶת', 'אֲנַחְנוּ': 'חוֹשְׁבִים', 'הֵם': 'חוֹשְׁבִים' }, 
    vuk: { 'אֲנִי': 'choshev', 'אַתָּה': 'choshev', 'אַתְּ': 'choshevet', 'הוּא': 'choshev', 'הִיא': 'choshevet', 'אֲנַחְנוּ': 'choshvim', 'הֵם': 'choshvim' }, 
    label: 'חוֹשֵׁב (Misliti)', 
    sr: { 'אֲנִי': 'promišljam o', 'אַתָּה': 'promišljaš o', 'אַתְּ': 'promišljaš o', 'הוּא': 'promišlja o', 'הִיא': 'promišlja o', 'אֲנַחְנוּ': 'promišljamo o', 'הֵם': 'promišljaju o' }, 
    en: 'ponder' 
  },
  { 
    char: { 'אֲנִי': 'אוֹהֵב', 'אַתָּה': 'אוֹהֵב', 'אַתְּ': 'אוֹהֶבֶת', 'הוּא': 'אוֹהֵב', 'הִיא': 'אוֹהֶבֶת', 'אֲנַחְנוּ': 'אוֹהֲבִים', 'הֵם': 'אוֹהֲבִים' }, 
    vuk: { 'אֲנִי': 'ohev', 'אַתָּה': 'ohev', 'אַתְּ': 'ohevet', 'הוּא': 'ohev', 'הִיא': 'ohevet', 'אֲנַחְנוּ': 'ohavim', 'הֵם': 'ohavim' }, 
    label: 'אוֹהֵב (Voleti)', 
    sr: { 'אֲנִי': 'volim', 'אַתָּה': 'voliš', 'אַתְּ': 'voliš', 'הוּא': 'voli', 'הִיא': 'voli', 'אֲנַחְנוּ': 'volimo', 'הֵם': 'vole' }, 
    en: 'love' 
  },
  { 
    char: { 'אֲנִי': 'מְחַפֵּשׂ', 'אַתָּה': 'מְחַפֵּשׂ', 'אַתְּ': 'מְחַפֶּשֶׁת', 'הוּא': 'מְחַפֵּשׂ', 'הִיא': 'מְחַפֶּשֶׁת', 'אֲנַחְנוּ': 'מְחַפְּשִׂים', 'הֵם': 'מְחַפְּשִׂים' }, 
    vuk: { 'אֲנִי': 'mechapes', 'אַתָּה': 'mechapes', 'אַתְּ': 'mechapeset', 'הוּא': 'mechapes', 'הִיא': 'mechapeset', 'אֲנַחְנוּ': 'mechapsim', 'הֵם': 'mechapsim' }, 
    label: 'מְחַפֵּשׂ (Tražiti)', 
    sr: { 'אֲנִי': 'tražim', 'אַתָּה': 'tražiš', 'אַתְּ': 'tražiš', 'הוּא': 'traži', 'הִיא': 'traži', 'אֲנַחְנוּ': 'tražimo', 'הֵם': 'traže' }, 
    en: 'seek' 
  },
  { 
    char: { 'אֲנִי': 'רוֹאֶה', 'אַתָּה': 'רוֹאֶה', 'אַתְּ': 'רוֹאָה', 'הוּא': 'רוֹאֶה', 'הִיא': 'רוֹאָה', 'אֲנַחְנוּ': 'רוֹאִים', 'הֵם': 'רוֹאִים' }, 
    vuk: { 'אֲנִי': 'roeh', 'אַתָּה': 'roeh', 'אַתְּ': 'roah', 'הוּא': 'roeh', 'הִיא': 'roah', 'אֲנַחְנוּ': 'roim', 'הֵם': 'roim' }, 
    label: 'רוֹאֶה (Videti)', 
    sr: { 'אֲנִי': 'vidim', 'אַתָּה': 'vidiš', 'אַתְּ': 'vidiš', 'הוּא': 'vidi', 'הִיא': 'vidi', 'אֲנַחְנוּ': 'vidimo', 'הֵם': 'vide' }, 
    en: 'see' 
  },
  { 
    char: { 'אֲנִי': 'שׁוֹמֵעַ', 'אַתָּה': 'שׁוֹמֵעַ', 'אַתְּ': 'שׁוֹמַעַת', 'הוּא': 'שׁוֹמֵעַ', 'הִיא': 'שׁוֹמַעַת', 'אֲנַחְנוּ': 'שׁוֹמְעִים', 'הֵם': 'שׁוֹמְעִים' }, 
    vuk: { 'אֲנִי': 'shomea', 'אַתָּה': 'shomea', 'אַתְּ': 'shomaat', 'הוּא': 'shomea', 'הִיא': 'shomaat', 'אֲנַחְנוּ': 'shomim', 'הֵם': 'shomim' }, 
    label: 'שׁוֹמֵעַ (Slušati)', 
    sr: { 'אֲנִי': 'slušam', 'אַתָּה': 'slušaš', 'אַתְּ': 'slušaš', 'הוּא': 'sluša', 'הִיא': 'sluša', 'אֲנַחְנוּ': 'slušamo', 'הֵם': 'slušaju' }, 
    en: 'listen to' 
  },
  { 
    char: { 'אֲנִי': 'יוֹצֵר', 'אַתָּה': 'יוֹצֵר', 'אַתְּ': 'יוֹצֶרֶת', 'הוּא': 'יוֹצֵר', 'הִיא': 'יוֹצֶרֶת', 'אֲנַחְנוּ': 'יוֹצְרִים', 'הֵם': 'יוֹצְרִים' }, 
    vuk: { 'אֲנִי': 'yotzer', 'אַתָּה': 'yotzer', 'אַתְּ': 'yotzeret', 'הוּא': 'yotzer', 'הִיא': 'yotzeret', 'אֲנַחְנוּ': 'yotzrim', 'הֵם': 'yotzrim' }, 
    label: 'יוֹצֵר (Stvarati)', 
    sr: { 'אֲנִי': 'stvaram', 'אַתָּה': 'stvaraš', 'אַתְּ': 'stvaraš', 'הוּא': 'stvara', 'הִיא': 'stvara', 'אֲנַחְנוּ': 'stvaramo', 'הֵם': 'stvaraju' }, 
    en: 'create' 
  },
  { 
    char: { 'אֲנִי': 'כּוֹתֵב', 'אַתָּה': 'כּוֹתֵב', 'אַתְּ': 'כּוֹתֶבֶת', 'הוּא': 'כּוֹתֵב', 'הִיא': 'כּוֹתֶבֶת', 'אֲנַחְנוּ': 'כּוֹתְבִים', 'הֵם': 'כּוֹתְבִים' }, 
    vuk: { 'אֲנִי': 'kotev', 'אַתָּה': 'kotev', 'אַתְּ': 'kotevet', 'הוּא': 'kotev', 'הִיא': 'kotevet', 'אֲנַחְנוּ': 'kotvim', 'הֵם': 'kotvim' }, 
    label: 'כּוֹתֵב (Pisati)', 
    sr: { 'אֲנִי': 'pišem', 'אַתָּה': 'pišeš', 'אַתְּ': 'pišeš', 'הוּא': 'piše', 'הִיא': 'piše', 'אֲנַחְנוּ': 'pišemo', 'הֵם': 'pišu' }, 
    en: 'write' 
  },
];`;

code = code.replace(oldHebVerbs, newHebVerbs);

fs.writeFileSync(filePath, code, 'utf-8');
console.log('Patched HebrewVocabView top definitions');
