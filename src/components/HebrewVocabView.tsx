import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
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
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { HEBREW_VOCAB_EXPANDED, HebrewVocabItem, getHebrewQuoteForItem } from '../data/hebrewVocabData';

export type { HebrewVocabItem };

const HEBREW_VOCAB_DATA: HebrewVocabItem[] = (() => {
  const seen = new Set<string>();
  const list: HebrewVocabItem[] = [];
  for (const item of HEBREW_VOCAB_EXPANDED) {
    const key = item.char.trim();
    if (!seen.has(key)) {
      seen.add(key);
      list.push(item);
    }
  }
  return list;
})();

export const HEBREW_CONFIG_SUBJECTS = [
  // Personal Pronouns
  { char: 'אֲנִי', vuk: 'Ani', translationSr: 'Ja', translationEn: 'I' },
  { char: 'אַתָּה', vuk: 'Atah', translationSr: 'Ti (m)', translationEn: 'You (m)' },
  { char: 'אַתְּ', vuk: 'At', translationSr: 'Ti (f)', translationEn: 'You (f)' },
  { char: 'הוּא', vuk: 'Hu', translationSr: 'On', translationEn: 'He' },
  { char: 'הִיא', vuk: 'Hi', translationSr: 'Ona', translationEn: 'She' },
  { char: 'אֲנַחְנוּ', vuk: 'Anachnu', translationSr: 'Mi', translationEn: 'We' },
  { char: 'אַתֶּם', vuk: 'Atem', translationSr: 'Vi (m)', translationEn: 'You (m.pl)' },
  { char: 'אַתֵּן', vuk: 'Aten', translationSr: 'Vi (f)', translationEn: 'You (f.pl)' },
  { char: 'הֵם', vuk: 'Hem', translationSr: 'Oni (m)', translationEn: 'They (m.pl)' },
  { char: 'הֵן', vuk: 'Hen', translationSr: 'One (f)', translationEn: 'They (f.pl)' },
  { char: 'כֻּלָּם', vuk: 'Kulam', translationSr: 'Svi', translationEn: 'Everyone' },
  { char: 'עַצְמוֹ', vuk: 'Atzmo', translationSr: 'Sebe', translationEn: 'Self / Oneself' },

  // Demonstrative Pronouns (This, That, These, Those, It)
  { char: 'זֶה', vuk: 'Zeh', translationSr: 'Ovo / Ovaj / To', translationEn: 'This / It (m)' },
  { char: 'זֹאת', vuk: 'Zot', translationSr: 'Ova / To', translationEn: 'This (f)' },
  { char: 'אֵלֶּה', vuk: 'Eleh', translationSr: 'Ovi / Ove', translationEn: 'These' },
  { char: 'הַהוּא', vuk: 'Hahu', translationSr: 'Ono / Onaj', translationEn: 'That (m)' },
  { char: 'הַהִיא', vuk: 'Hahi', translationSr: 'Ona / Onaj', translationEn: 'That (f)' },
  { char: 'הָאֵלֶּה', vuk: 'Ha\'eleh', translationSr: 'Oni / Ovi', translationEn: 'Those / These' },

  // Interrogative & Indefinite Pronouns
  { char: 'מָה', vuk: 'Mah', translationSr: 'Šta', translationEn: 'What' },
  { char: 'מִי', vuk: 'Mi', translationSr: 'Ko', translationEn: 'Who' },
  { char: 'אֵיזֶה', vuk: 'Eizeh', translationSr: 'Koji', translationEn: 'Which (m)' },
  { char: 'אֵיזוֹ', vuk: 'Eizo', translationSr: 'Koja', translationEn: 'Which (f)' },
  { char: 'אֵיפֹה', vuk: 'Eifoh', translationSr: 'Gde', translationEn: 'Where' },
  { char: 'מִישֶׁהוּ', vuk: 'Mishehu', translationSr: 'Neko', translationEn: 'Someone' },
  { char: 'מַשֶּׁהוּ', vuk: 'Mashehu', translationSr: 'Nešto', translationEn: 'Something' },
  { char: 'הַכֹּל', vuk: 'Hakol', translationSr: 'Sve', translationEn: 'Everything' },
];

export interface HebDndWordItem {
  id: string;
  char: string;
  vuk: string;
  sr: string;
  en: string;
  type: 'pronoun' | 'verb' | 'noun' | 'adjective' | 'connector';
}

export const DND_HEBREW_WORDS: HebDndWordItem[] = (() => {
  const manual: HebDndWordItem[] = [
    // Pronouns / Subjects
    ...HEBREW_CONFIG_SUBJECTS.map((s, idx) => ({
      id: `he-p-${idx}`,
      char: s.char,
      vuk: s.vuk,
      sr: s.translationSr,
      en: s.translationEn,
      type: 'pronoun' as const
    })),

    // Connectors
    { id: 'he-c1', char: 'וְ', vuk: 've-', sr: 'i / a', en: 'and', type: 'connector' },
    { id: 'he-c2', char: 'אֶת', vuk: 'et', sr: '(akuzativ)', en: 'direct object marker', type: 'connector' },
    { id: 'he-c3', char: 'עִם', vuk: 'im', sr: 'sa', en: 'with', type: 'connector' },
    { id: 'he-c4', char: 'מְאֹד', vuk: 'meod', sr: 'veoma', en: 'very', type: 'connector' },
  ];

  const seen = new Set<string>(manual.map(m => m.char.trim()));
  const list: HebDndWordItem[] = [...manual];

  const pronChars = new Set([
    'אֲנִי', 'אַתָּה', 'אַתְּ', 'הוּא', 'הִיא', 'אֲנַחְנוּ', 'הֵם', 'הֵן', 'אַתֶּם', 'אַתֵּן', 'כֻּלָּם', 'עַצְמוֹ',
    'זֶה', 'זֹאת', 'אֵלֶּה', 'הַהוּא', 'הַהִיא', 'הָאֵלֶּה',
    'מָה', 'מִי', 'אֵיזֶה', 'אֵיזוֹ', 'אֵיפֹה', 'מִישֶׁהוּ', 'מַשֶּׁהוּ', 'הַכֹּל'
  ]);
  const connChars = new Set(['וְ', 'אֶת', 'עִם', 'מְאֹד', 'שֶׁ', 'כִּי', 'לְ', 'בְּ', 'מִ', 'עַל', 'אֶל']);

  const isVerb = (i: HebrewVocabItem) => {
    if (i.category === 'glagoli') return true;
    const v = i.vuk.toLowerCase();
    const en = i.english.toLowerCase();
    const sr = i.translation.toLowerCase();
    return v.startsWith('l') || en.includes('to ') || en.includes('study') || en.includes('think') || en.includes('love') || en.includes('seek') || en.includes('see') || en.includes('listen') || en.includes('create') || en.includes('write') || sr.includes('učim') || sr.includes('radim') || sr.includes('govorim');
  };

  const isAdj = (i: HebrewVocabItem) => {
    if ((i.category as string) === 'pridevi') return true;
    const en = i.english.toLowerCase();
    const sr = i.translation.toLowerCase();
    return en.includes('cool') || en.includes('fun') || en.includes('beautiful') || en.includes('good') || en.includes('wise') || en.includes('strong') || en.includes('calm') || en.includes('great') || en.includes('pure') || en.includes('holy') || en.includes('new') || sr.includes('lepo') || sr.includes('dobro') || sr.includes('mudro') || sr.includes('snazno') || sr.includes('spokojno') || sr.includes('sveto');
  };

  const add = (item: HebDndWordItem) => {
    const k = item.char.trim();
    if (!seen.has(k)) {
      seen.add(k);
      list.push(item);
    }
  };

  for (const item of HEBREW_VOCAB_DATA) {
    let t: HebDndWordItem['type'] = 'noun';
    if (pronChars.has(item.char)) t = 'pronoun';
    else if (connChars.has(item.char)) t = 'connector';
    else if (isVerb(item)) t = 'verb';
    else if (isAdj(item)) t = 'adjective';

    add({
      id: `he-db-${item.id}`,
      char: item.char,
      vuk: item.vuk,
      sr: item.translation,
      en: item.english,
      type: t
    });
  }

  return list;
})();

export const HEBREW_CONFIG_VERBS = (() => {
  const conjugated = [
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
  ];

  const seen = new Set<string>();
  const result: any[] = [...conjugated];

  for (const item of DND_HEBREW_WORDS) {
    if (item.type === 'verb') {
      const charStr = typeof item.char === 'string' ? item.char : item.char['אֲנִי'] || '';
      if (charStr && !seen.has(charStr)) {
        seen.add(charStr);
        result.push({
          char: item.char,
          vuk: item.vuk,
          label: `${charStr} (${item.en})`,
          sr: item.sr,
          en: item.en
        });
      }
    }
  }

  return result;
})();

export const HEBREW_CONFIG_NOUNS = (() => {
  const result: { char: string; vuk: string; sr: string; en: string }[] = [];
  const seen = new Set<string>();

  for (const item of DND_HEBREW_WORDS) {
    if (item.type === 'noun' && !seen.has(item.char)) {
      seen.add(item.char);
      result.push({
        char: item.char,
        vuk: item.vuk,
        sr: item.sr,
        en: item.en
      });
    }
  }

  return result;
})();

export const HEBREW_CONFIG_ADJECTIVES = (() => {
  const result: { char: string; vuk: string; sr: string; en: string }[] = [];
  const seen = new Set<string>();

  for (const item of DND_HEBREW_WORDS) {
    if (item.type === 'adjective' && !seen.has(item.char)) {
      seen.add(item.char);
      result.push({
        char: item.char,
        vuk: item.vuk,
        sr: item.sr,
        en: item.en
      });
    }
  }

  return result;
})();

const HEBREW_SOCIAL_PRESETS = [
  {
    char: 'כָּל הַכָּבוֹד אָחִי!',
    vuk: 'Kol hakavod achi!',
    sr: 'Bravo brate! / Svaka čast brate!',
    en: 'Bravo brother! / Well done brother!',
    badge: '👏 Bravo'
  },
  {
    char: 'כָּל הַכָּבוֹד אָחוֹתִי!',
    vuk: 'Kol hakavod achoti!',
    sr: 'Bravo sestro! / Svaka čast sestro!',
    en: 'Bravo sister! / Well done sister!',
    badge: '👑 Sestro'
  },
  {
    char: 'רַק קָדִימָה!',
    vuk: 'Rak kadimah!',
    sr: 'Samo naprijed! / Samo napred!',
    en: 'Forward always! / Keep going!',
    badge: '🚀 Naprijed'
  },
  {
    char: 'אֵין וִיתּוּר!',
    vuk: 'Ein vitur!',
    sr: 'Nema predaje! / Bez odustajanja!',
    en: 'No surrender! / Never give up!',
    badge: '💪 Nema predaje'
  },
  {
    char: 'אַגָּדָה!',
    vuk: 'Agadah!',
    sr: 'Legendo!',
    en: 'Legend!',
    badge: '🏆 Legendo'
  },
  {
    char: 'כָּבוֹד!',
    vuk: 'Kavod!',
    sr: 'Respekt! / Poštovanje!',
    en: 'Respect!',
    badge: '🫡 Respekt'
  },
  {
    char: 'אֲנִי אוֹהֵב אֶת זֶה!',
    vuk: 'Ani ohev et zeh!',
    sr: 'Ovo mi se sviđa! / Volim ovo!',
    en: 'I like this!',
    badge: '❤️ Popularno'
  },
  {
    char: 'זֶה מגְנִיב!',
    vuk: 'Zeh megniv!',
    sr: 'Ovo je super kul!',
    en: 'This is cool!',
    badge: '🔥 Kul'
  },
  {
    char: 'זֶה כֵּיף!',
    vuk: 'Zeh kef!',
    sr: 'Ovo je zabavno!',
    en: 'This is fun!',
    badge: '🎉 Zabavno'
  },
  {
    char: 'מְעוּלֶה!',
    vuk: 'Meuleh!',
    sr: 'Sjajno! / Izvanredno!',
    en: 'Awesome!',
    badge: '🌟 Top'
  },
  {
    char: 'חָכְמָה וְשָׁלוֹם.',
    vuk: 'Chokhmah ve-shalom.',
    sr: 'Mudrost i mir.',
    en: 'Wisdom and peace.',
    badge: '📜 Stoički'
  },
  {
    char: 'חָזָק וְאֶמָץ!',
    vuk: 'Chazak ve-amatz!',
    sr: 'Budi jak i hrabar!',
    en: 'Be strong and courageous!',
    badge: '⚡ Motivacija'
  }
];

export interface HebrewVocabViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  user: User | null;
}

export const HebrewVocabView: React.FC<HebrewVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  // Navigation: Dictionary, Emoji Canvas, AI Weaver or Quiz
  const [activeTab, setActiveTab] = useState<'learn' | 'canvas' | 'weaver' | 'quiz'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin authorization for editing wise quotes and pronunciations (Petar)
  const isAdmin = user ? (user.email === 'petar.dekanovic@gmail.com' || user.email?.toLowerCase().includes('petar')) : true;

  // Custom quote & pronunciation overrides state
  const [customQuotes, setCustomQuotes] = useState<Record<string, { quote: string; translation: string }>>(() => {
    try {
      const saved = localStorage.getItem('wisefit_hebrew_custom_quotes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customPronunciations, setCustomPronunciations] = useState<Record<string, { transliteration?: string; vuk?: string; translation?: string; english?: string }>>(() => {
    try {
      const saved = localStorage.getItem('wisefit_hebrew_custom_pronunciations');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<HebrewVocabItem | null>(null);
  const [editQuoteText, setEditQuoteText] = useState('');
  const [editQuoteTranslation, setEditQuoteTranslation] = useState('');
  const [editTransliteration, setEditTransliteration] = useState('');
  const [editVuk, setEditVuk] = useState('');
  const [editTranslation, setEditTranslation] = useState('');
  const [editEnglish, setEditEnglish] = useState('');

  const getItemQuote = (item: HebrewVocabItem) => {
    if (customQuotes[item.id]) return customQuotes[item.id];
    if (customQuotes[item.char]) return customQuotes[item.char];
    return getHebrewQuoteForItem(item);
  };

  const getItemTransliteration = (item: HebrewVocabItem) => {
    return customPronunciations[item.id]?.transliteration || item.transliteration;
  };

  const getItemVuk = (item: HebrewVocabItem) => {
    return customPronunciations[item.id]?.vuk || item.vuk;
  };

  const getItemTranslation = (item: HebrewVocabItem) => {
    return customPronunciations[item.id]?.translation || item.translation;
  };

  const getItemEnglish = (item: HebrewVocabItem) => {
    return customPronunciations[item.id]?.english || item.english;
  };

  const openEditModal = (item: HebrewVocabItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const qInfo = getItemQuote(item);
    setEditingItem(item);
    setEditQuoteText(qInfo.quote);
    setEditQuoteTranslation(qInfo.translation);
    setEditTransliteration(getItemTransliteration(item));
    setEditVuk(getItemVuk(item));
    setEditTranslation(getItemTranslation(item));
    setEditEnglish(getItemEnglish(item));
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const newQuotes = {
      ...customQuotes,
      [editingItem.id]: { quote: editQuoteText, translation: editQuoteTranslation },
      [editingItem.char]: { quote: editQuoteText, translation: editQuoteTranslation },
    };
    setCustomQuotes(newQuotes);
    localStorage.setItem('wisefit_hebrew_custom_quotes', JSON.stringify(newQuotes));

    const newPronunciations = {
      ...customPronunciations,
      [editingItem.id]: {
        transliteration: editTransliteration,
        vuk: editVuk,
        translation: editTranslation,
        english: editEnglish,
      }
    };
    setCustomPronunciations(newPronunciations);
    localStorage.setItem('wisefit_hebrew_custom_pronunciations', JSON.stringify(newPronunciations));

    setEditingItem(null);
  };

  const handleResetEdit = () => {
    if (!editingItem) return;
    const newQuotes = { ...customQuotes };
    delete newQuotes[editingItem.id];
    delete newQuotes[editingItem.char];
    setCustomQuotes(newQuotes);
    localStorage.setItem('wisefit_hebrew_custom_quotes', JSON.stringify(newQuotes));

    const newPronunciations = { ...customPronunciations };
    delete newPronunciations[editingItem.id];
    setCustomPronunciations(newPronunciations);
    localStorage.setItem('wisefit_hebrew_custom_pronunciations', JSON.stringify(newPronunciations));

    setEditingItem(null);
  };

  // 3-Step Word Configurator State (I / You / They -> Verb -> Noun/Adjective OR Social Presets)
  const [hCfgSubIdx, setHCfgSubIdx] = useState(0); // 'אֲנִי'
  const [hCfgVerbIdx, setHCfgVerbIdx] = useState(1); // 'חוֹשֵׁב'
  const [hCfgEndingType, setHCfgEndingType] = useState<'noun' | 'adjective'>('noun');
  const [hCfgNounIdx, setHCfgNounIdx] = useState(0); // 'חָכְמָה'
  const [hCfgAdjIdx, setHCfgAdjIdx] = useState(0); // 'מגְנִיב'
  const [hSelectedSocialPresetIdx, setHSelectedSocialPresetIdx] = useState<number | null>(null);
  const [hCopiedConfigSentence, setHCopiedConfigSentence] = useState(false);
  const [heDndStageWords, setHeDndStageWords] = useState<HebDndWordItem[]>([]);
  const [heDndFilter, setHeDndFilter] = useState<'all' | 'pronoun' | 'verb' | 'noun' | 'adjective' | 'connector'>('all');
  const [heConfigTabMode, setHeConfigTabMode] = useState<'dnd' | 'dropdown'>('dnd');

  const handleHeDndAddWord = (item: HebDndWordItem) => {
    setHeDndStageWords(prev => [...prev, item]);
  };

  const handleHeDndRemoveWord = (index: number) => {
    setHeDndStageWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleHeDndMoveWord = (index: number, direction: 'left' | 'right') => {
    setHeDndStageWords(prev => {
      const next = [...prev];
      const targetIdx = direction === 'left' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleHeDndRandomize = () => {
    const pronouns = DND_HEBREW_WORDS.filter(w => w.type === 'pronoun');
    const verbs = DND_HEBREW_WORDS.filter(w => w.type === 'verb');
    const nouns = DND_HEBREW_WORDS.filter(w => w.type === 'noun');
    const adjs = DND_HEBREW_WORDS.filter(w => w.type === 'adjective');

    const randSub = pronouns[Math.floor(Math.random() * pronouns.length)];
    const randVerb = verbs[Math.floor(Math.random() * verbs.length)];
    const isNoun = Math.random() > 0.5;
    const randEnd = isNoun 
      ? nouns[Math.floor(Math.random() * nouns.length)] 
      : adjs[Math.floor(Math.random() * adjs.length)];

    setHeDndStageWords([randSub, randVerb, randEnd]);
  };

  const handleCopyConfigText = (text: string) => {
    navigator.clipboard.writeText(text);
    setHCopiedConfigSentence(true);
    setTimeout(() => setHCopiedConfigSentence(false), 2000);
  };

  
  // Weaver state
  const [selectedWeaverItems, setSelectedWeaverItems] = useState<HebrewVocabItem[]>([]);
  const [wovenSentence, setWovenSentence] = useState<{ hebrew: string; vuk: string; serbian: string } | null>(null);

  // Game States
  const [quizStarted, setQuizStarted] = useState(false);
  const [hQuizCategory, setHQuizCategory] = useState<string>('all');
  const [hQuizQuestionCount, setHQuizQuestionCount] = useState<number>(5);
  const [roundQuestions, setRoundQuestions] = useState<{
    vocab: HebrewVocabItem;
    options: string[];
    correctIndex: number;
    questionType: 'meaning' | 'vuk' | 'character' | 'listen';
  }[]>([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Persistence States
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [isPronouncing, setIsPronouncing] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: HebrewVocabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const quoteInfo = getHebrewQuoteForItem(item);
    const quoteSection = quoteInfo 
      ? `\n\n📜 Izreka / Mudrost:\n${quoteInfo.quote}\n"${quoteInfo.translation}"` 
      : '';
    const textToCopy = `${item.emoji} ${item.char} [${item.transliteration}] (${item.vuk})\n🇭🇷 Značenje: ${item.translation}\n🇬🇧 English: ${item.english}${item.root ? `\n🌱 Koren: ${item.root}` : ''}${quoteSection}\n\n✨ WiseFit Sanctuary Hebrew #WiseFit #Hebrew`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      playSound('correct');
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };

  const playSound = (type: 'correct' | 'wrong' | 'complete') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.setValueAtTime(110, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'complete') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Warm up voices on desktop browsers
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speakHebrewAudioFallback = (text: string, id?: string) => {
    if (id) setIsPronouncing(id);
    const proxyUrl = `/api/tts-proxy?text=${encodeURIComponent(text)}&lang=he`;
    const fallbackDirectUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=he&client=tw-ob&q=${encodeURIComponent(text)}`;

    let hasEnded = false;
    const cleanup = () => {
      if (!hasEnded) {
        hasEnded = true;
        if (id) setIsPronouncing(null);
      }
    };

    const audio = new Audio();
    audio.src = proxyUrl;
    audio.onended = cleanup;
    audio.onerror = () => {
      console.warn("Proxy audio error, attempting direct Google Translate stream fallback...");
      const backupAudio = new Audio(fallbackDirectUrl);
      backupAudio.onended = cleanup;
      backupAudio.onerror = cleanup;
      backupAudio.play().catch(() => cleanup());
    };

    audio.play().catch(err => {
      console.warn("Proxy audio play failed, trying direct fallback:", err);
      const backupAudio = new Audio(fallbackDirectUrl);
      backupAudio.onended = cleanup;
      backupAudio.onerror = cleanup;
      backupAudio.play().catch(() => cleanup());
    });

    setTimeout(cleanup, 3000);
  };

  const speakHebrew = (text: string, id?: string) => {
    if (id) setIsPronouncing(id);
    if (!('speechSynthesis' in window)) {
      speakHebrewAudioFallback(text, id);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const voices = window.speechSynthesis.getVoices();
      const heVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('he') || 
        v.lang.toLowerCase().startsWith('iw') || 
        v.name.toLowerCase().includes('hebrew') ||
        v.name.toLowerCase().includes('עברית')
      );

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.85;

      if (heVoice) {
        utterance.voice = heVoice;
      }

      let speakingFinished = false;
      const finishSpeaking = () => {
        if (!speakingFinished) {
          speakingFinished = true;
          if (id) setIsPronouncing(null);
        }
      };

      utterance.onend = finishSpeaking;
      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis error, falling back to audio:", e);
        if (!speakingFinished) {
          speakingFinished = true;
          speakHebrewAudioFallback(text, id);
        }
      };

      window.speechSynthesis.speak(utterance);

      setTimeout(() => {
        if (!speakingFinished) {
          finishSpeaking();
        }
      }, 3500);
    } catch (err) {
      console.warn("SpeechSynthesis failed:", err);
      speakHebrewAudioFallback(text, id);
    }
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'progress', 'hebrew');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMasteredIds(data.masteredIds || []);
            setHighScore(data.highScore || 0);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        const localMastered = localStorage.getItem('wf_hebrew_mastered');
        const localHighScore = localStorage.getItem('wf_hebrew_highscore');
        if (localMastered) setMasteredIds(JSON.parse(localMastered));
        if (localHighScore) setHighScore(parseInt(localHighScore, 10));
      }
    };
    loadProgress();
  }, [user]);

  const saveProgress = async (newMastered: string[], newHighScore: number) => {
    setMasteredIds(newMastered);
    if (newHighScore > highScore) setHighScore(newHighScore);

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'progress', 'hebrew');
        await setDoc(docRef, {
          masteredIds: newMastered,
          highScore: Math.max(highScore, newHighScore),
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('wf_hebrew_mastered', JSON.stringify(newMastered));
      localStorage.setItem('wf_hebrew_highscore', Math.max(highScore, newHighScore).toString());
    }
  };

  const filteredVocab = useMemo(() => {
    return HEBREW_VOCAB_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        item.char.toLowerCase().includes(q) ||
        item.transliteration.toLowerCase().includes(q) ||
        item.vuk.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        (item.root && item.root.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (masteredIds.includes(id)) {
      updated = masteredIds.filter(mid => mid !== id);
    } else {
      updated = [...masteredIds, id];
      playSound('correct');
    }
    saveProgress(updated, highScore);
  };

  const generateQuizRound = () => {
    let pool = [...HEBREW_VOCAB_DATA];
    if (hQuizCategory !== 'all') {
      pool = pool.filter(v => (v.category as string) === hQuizCategory || (hQuizCategory === 'noun' && ((v.category as string) === 'imenice' || !['glagoli', 'pridevi'].includes(v.category as string))));
      if (pool.length < 5) pool = [...HEBREW_VOCAB_DATA];
    }
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(hQuizQuestionCount, shuffled.length));
    
    const questionsList = selected.map(vocab => {
      const types: ('meaning' | 'vuk' | 'character' | 'listen')[] = ['meaning', 'vuk', 'character', 'listen'];
      const questionType = types[Math.floor(Math.random() * types.length)];
      
      const otherVocabs = HEBREW_VOCAB_DATA.filter(v => v.id !== vocab.id);
      const wrongShuffled = otherVocabs.sort(() => Math.random() - 0.5).slice(0, 3);
      
      let correctAnswer = '';
      let wrongAnswers: string[] = [];

      if (questionType === 'meaning') {
        correctAnswer = `${vocab.emoji} ${vocab.translation} (${vocab.english})`;
        wrongAnswers = wrongShuffled.map(w => `${w.emoji} ${w.translation} (${w.english})`);
      } else if (questionType === 'vuk') {
        correctAnswer = `Vuk: "${vocab.vuk}" [${vocab.transliteration}]`;
        wrongAnswers = wrongShuffled.map(w => `Vuk: "${w.vuk}" [${w.transliteration}]`);
      } else if (questionType === 'character') {
        correctAnswer = `${vocab.char} — ${vocab.transliteration}`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} — ${w.transliteration}`);
      } else {
        correctAnswer = `${vocab.char} — ${vocab.emoji} ${vocab.translation}`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} — ${w.emoji} ${w.translation}`);
      }

      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = allOptions.indexOf(correctAnswer);

      return { vocab, options: allOptions, correctIndex, questionType };
    });

    setRoundQuestions(questionsList);
    setQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setLives(3);
    setScore(0);
    setQuizComplete(false);
    setQuizStarted(true);
    
    if (questionsList[0].questionType === 'listen') {
      setTimeout(() => speakHebrew(questionsList[0].vocab.char, `quiz-${questionsList[0].vocab.id}`), 600);
    }
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    
    const currentQ = roundQuestions[questionIdx];
    const isCorrect = optionIndex === currentQ.correctIndex;

    // Auto-play Hebrew TTS audio on selection so user hears exact pronunciation!
    speakHebrew(currentQ.vocab.char, `quiz-${currentQ.vocab.id}`);
    
    if (isCorrect) {
      playSound('correct');
      setScore(prev => prev + 10);
      if (!masteredIds.includes(currentQ.vocab.id)) {
        saveProgress([...masteredIds, currentQ.vocab.id], Math.max(highScore, score + 10));
      }
    } else {
      playSound('wrong');
      setLives(prev => Math.max(0, prev - 1));
    }
  };

  const handleNextQuestion = () => {
    if (lives <= 0) {
      setQuizComplete(true);
      playSound('complete');
      return;
    }

    if (questionIdx < roundQuestions.length - 1) {
      const nextIdx = questionIdx + 1;
      setQuestionIdx(nextIdx);
      setSelectedAnswer(null);
      setIsAnswered(false);
      if (roundQuestions[nextIdx].questionType === 'listen') {
        setTimeout(() => speakHebrew(roundQuestions[nextIdx].vocab.char), 400);
      }
    } else {
      setQuizComplete(true);
      playSound('complete');
    }
  };

  const handleToggleWeaverSelect = (item: HebrewVocabItem) => {
    if (selectedWeaverItems.find(i => i.id === item.id)) {
      setSelectedWeaverItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      if (selectedWeaverItems.length >= 3) return;
      setSelectedWeaverItems(prev => [...prev, item]);
    }
  };

  const weaveSentence = () => {
    if (selectedWeaverItems.length === 0) return;
    const wordsHeb = selectedWeaverItems.map(i => i.char).join(' ');
    const wordsVuk = selectedWeaverItems.map(i => i.vuk).join(' ');
    const wordsSer = selectedWeaverItems.map(i => i.translation.split('/')[0].trim()).join(', ');

    setWovenSentence({
      hebrew: `בְּתוֹךְ הַלֵּב שֶׁלִּי יֵשׁ ${wordsHeb}`,
      vuk: `betoh halev šeli ješ ${wordsVuk}`,
      serbian: `U mom srcu nalazi se ${wordsSer} - put mudrosti.`
    });
    speakHebrew(`בְּתוֹךְ הַלֵּב שֶׁלִּי יֵשׁ ${wordsHeb}`);
  };

  const getRankInfo = (count: number) => {
    if (count >= 100) return { name: 'Hebrejski Mudrac (Chakham)', desc: 'Potpuno vladanje rečnikom mudrosti i svakodnevnog života', icon: '👑' };
    if (count >= 60) return { name: 'Učenik Tore (Talmid)', desc: 'Duboko razumevanje korena i rečeničnih sklopova', icon: '📜' };
    if (count >= 30) return { name: 'Mislilac (Hoshik)', desc: 'Preko 30 savladanih reči i izraza', icon: '🕯️' };
    return { name: 'Tragalac (Doresh)', desc: 'Započeta staza usvajanja drevnog jezika', icon: '🌱' };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
              🇮🇱 125 Odabranih Reči i Korena
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Vuk Transliteracija
            </span>
          </div>
          <h2 className={cn(
            "text-2xl md:text-3xl font-black tracking-tight mt-2 flex items-center gap-2",
            isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-50" : "text-zinc-900"
          )}>
            Hebrejska Riznica & Koreni (עִבְרִית)
          </h2>
          <p className="text-xs md:text-sm font-medium text-zinc-400 mt-1">
            Učite visokonaponske imenice, glagole i stoik mudrosti uz vizuelne emodžije i fonetsku Vuk Karadžić transliteraciju.
          </p>
        </div>

        {/* View Mode Nav */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            "p-1 rounded-xl border flex items-center gap-1",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
          )}>
            <button
              onClick={() => setActiveTab('learn')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'learn'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" /> Rečnik
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'canvas'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Visual Canvas
            </button>
            <button
              onClick={() => setActiveTab('weaver')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'weaver'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-purple-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Wand2 className="w-3.5 h-3.5" /> Sklop Rečenica
            </button>
            <button
              onClick={() => { setActiveTab('quiz'); generateQuizRound(); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'quiz'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Duo Kviz
            </button>
          </div>

          <div className={cn(
            "px-3 py-1.5 rounded-xl flex items-center gap-2 border font-mono text-xs font-black",
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-700"
          )}>
            <Trophy className="w-4 h-4 text-blue-500 fill-blue-500 animate-pulse" />
            <span>{masteredIds.length}/{HEBREW_VOCAB_DATA.length}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* REČNIK / DICTIONARY VIEW */}
        {activeTab === 'learn' && (
          <motion.div key="learn-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Rank Banner */}
            <div className={cn(
              "p-5 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4",
              isDarkMode ? "bg-gradient-to-r from-blue-950/40 via-zinc-900 to-zinc-950 border-blue-500/20" : "bg-gradient-to-r from-blue-50 via-white to-blue-50/50 border-blue-100"
            )}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getRankInfo(masteredIds.length).icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-blue-500 font-mono">Čin Akademije:</span>
                    <span className="text-sm font-black tracking-tight">{getRankInfo(masteredIds.length).name}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{getRankInfo(masteredIds.length).desc}</p>
                </div>
              </div>
              <div className="text-right font-mono text-xs font-bold text-blue-500">
                Savladano {Math.round((masteredIds.length / HEBREW_VOCAB_DATA.length) * 100)}% rečnika
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Pretraži reči, koren ili prevod..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all",
                    isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-blue-500" : "bg-white border-zinc-200 text-zinc-900 focus:border-blue-500"
                  )}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
                {[
                  { id: 'all', label: `Sve (${HEBREW_VOCAB_DATA.length})` },
                  { id: 'mudrost', label: ' Mudrost' },
                  { id: 'svakodnevno', label: ' Svakodnevno' },
                  { id: 'glagoli', label: ' Glagoli' },
                  { id: 'priroda', label: ' Priroda' },
                  { id: 'zdravlje', label: ' Zdravlje' },
                  { id: 'posao_tehnologija', label: ' Posao & Tehnologija' },
                  { id: 'hrana', label: ' Hrana' },
                  { id: 'vreme_brojevi', label: ' Vreme & Brojevi' },
                  { id: 'emocije', label: ' Emocije' },
                  { id: 'misaoni', label: ' Misaoni Stoik' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200" : "bg-white border-zinc-200 text-zinc-600"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filteredVocab.map(item => {
                const isMastered = masteredIds.includes(item.id);
                const isSpeaking = isPronouncing === item.id;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] shadow-sm",
                      isMastered 
                        ? (isDarkMode ? "bg-emerald-950/30 border-emerald-500/40" : "bg-emerald-50/90 border-emerald-200")
                        : (isDarkMode ? "bg-zinc-900/90 border-zinc-800/90 hover:border-blue-500/50 shadow-md" : "bg-white border-zinc-200/90 hover:border-blue-300 hover:shadow-md")
                    )}
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-3xl filter drop-shadow-sm">{item.emoji}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md font-mono border",
                              isDarkMode ? "bg-zinc-800/90 text-zinc-300 border-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-200"
                            )}>
                              {item.categoryLabel}
                            </span>
                            {item.root && (
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                Koren: {item.root}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => toggleMastered(item.id, e)}
                          className={cn(
                            "p-2 rounded-xl border transition-all flex-shrink-0",
                            isMastered 
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" 
                              : isDarkMode ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200" : "bg-zinc-100 text-zinc-500 border-zinc-200 hover:text-zinc-800"
                          )}
                          title={isMastered ? "Savladano" : "Označi kao savladano"}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <h3 className="text-3xl font-serif font-black text-blue-600 dark:text-blue-400 tracking-wide">
                            {item.char}
                          </h3>
                          <span className="text-xs font-mono font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                            {getItemTransliteration(item)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 font-mono text-xs pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Vuk:</span>
                            <span className={cn("font-black text-sm", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                              "{getItemVuk(item)}"
                            </span>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={(e) => openEditModal(item, e)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 transition-all flex items-center gap-1 border border-blue-500/20"
                              title="Uredi izgovor / izreku (Petar / Admin)"
                            >
                              <Pencil className="w-3 h-3" /> Uredi
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-3 border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <p className={cn("text-sm font-bold leading-snug", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                          🇭🇷 {getItemTranslation(item)}
                        </p>
                        <p className={cn("text-xs font-medium", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                          🇬🇧 {getItemEnglish(item)}
                        </p>
                        {(() => {
                          const quoteInfo = getItemQuote(item);
                          return (
                            <div className="text-[11px] leading-snug bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 p-2.5 rounded-xl flex items-start justify-between gap-2 mt-2">
                              <div className="flex items-start gap-2">
                                <span className="text-sm shrink-0">💡</span>
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-blue-900 dark:text-blue-200 tracking-wide font-serif" dir="rtl">
                                    {quoteInfo.quote}
                                  </p>
                                  <p className="text-[10px] italic text-blue-700/90 dark:text-blue-300/80 font-sans">
                                    "{quoteInfo.translation}"
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {isAdmin && (
                                  <button
                                    onClick={(e) => openEditModal(item, e)}
                                    className="p-1.5 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-500/30 transition-all shrink-0 flex items-center gap-1"
                                    title="Uredi izreku i izgovor"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const qText = `📜 Izreka: ${quoteInfo.quote}\n"${quoteInfo.translation}"\n\n✨ WiseFit Sanctuary #WiseFit #HebrewQuote`;
                                    handleCopyConfigText(qText);
                                  }}
                                  className="p-1.5 rounded-lg text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 transition-all shrink-0 flex items-center gap-1"
                                  title="Kopiraj ovu izreku/mudrost"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      <button
                        onClick={() => speakHebrew(item.char, item.id)}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
                          isSpeaking 
                            ? "bg-blue-600 text-white border-blue-600 animate-pulse" 
                            : isDarkMode ? "bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border-zinc-700" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200"
                        )}
                      >
                        <Volume2 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        <span>Izgovor</span>
                      </button>

                      <button
                        onClick={(e) => handleCopy(item, e)}
                        className={cn(
                          "p-2 rounded-xl text-xs transition-all border",
                          copiedId === item.id ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* EMOJI VISUAL CANVAS VIEW */}
        {activeTab === 'canvas' && (
          <motion.div key="canvas-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium">
              🎨 <strong>Vizuelni Emodži Sklop:</strong> Učite asocijacijom! Velike vizuelne kartice sa uočljivim emodžijima i korenom za brzo pamćenje.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredVocab.map(item => (
                <div
                  key={`canvas-${item.id}`}
                  onClick={() => speakHebrew(item.char, item.id)}
                  className={cn(
                    "p-4 rounded-2xl border text-center flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-all",
                    isDarkMode ? "bg-zinc-900/60 border-zinc-800 hover:border-blue-500/50" : "bg-white border-zinc-200 shadow-sm hover:border-blue-300"
                  )}
                >
                  <span className="text-4xl my-2 filter drop-shadow-sm">{item.emoji}</span>
                  <div className="space-y-0.5 w-full">
                    <p className="text-lg font-bold text-blue-500">{item.char}</p>
                    <p className="text-[10px] font-mono font-bold text-emerald-500">"{item.vuk}"</p>
                    <p className="text-[10px] font-medium text-zinc-400 truncate w-full">{item.translation}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI SENTENCE WEAVER / DRAG & DROP CREATIVE STUDIO */}
        {activeTab === 'weaver' && (
          <motion.div key="weaver-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* CREATIVITY TAGLINE BANNER */}
            <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-indigo-700/20 border border-blue-500/40 text-center space-y-1.5 shadow-lg">
              <p className="text-xl md:text-2xl font-black font-serif text-blue-400 tracking-wide flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                Learn language by creativity, that's the idea.
                <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              </p>
              <p className="text-xs md:text-sm text-blue-200/90 font-medium italic">
                "Uči jezik kroz kreativnost, to je ideja." — Izaberite reči, prevucite ih i sklopite sopstvene rečenice!
              </p>
            </div>

            {/* CONFIGURATOR MODE SWITCHER TABS */}
            <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-zinc-900/80 border border-blue-500/30 max-w-md mx-auto">
              <button
                onClick={() => setHeConfigTabMode('dnd')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  heConfigTabMode === 'dnd'
                    ? "bg-blue-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <GripVertical className="w-4 h-4" />
                <span>🎨 Drag & Drop Studio</span>
              </button>

              <button
                onClick={() => setHeConfigTabMode('dropdown')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  heConfigTabMode === 'dropdown'
                    ? "bg-blue-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <Sliders className="w-4 h-4" />
                <span>⚡ Izbor sa Menijem</span>
              </button>
            </div>

            {/* MODE 1: DRAG & DROP CREATIVE STUDIO */}
            {heConfigTabMode === 'dnd' && (
              <div className="space-y-6">
                {/* WORD BANK PALETTE */}
                <div className={cn(
                  "p-5 rounded-3xl border space-y-4",
                  isDarkMode ? "bg-zinc-900/90 border-blue-500/40 shadow-xl" : "bg-white border-blue-300 shadow-md"
                )}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-500 font-mono">
                        Banka Reči (Kliknite ili Prevucite u polje ispod)
                      </h4>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-1 text-[11px] font-mono">
                      {[
                        { id: 'all', label: 'Sve' },
                        { id: 'pronoun', label: '👤 Zamenice (I, You, They, We...)' },
                        { id: 'verb', label: '⚡ Glagoli' },
                        { id: 'noun', label: '📦 Imenice' },
                        { id: 'adjective', label: '✨ Pridevi' },
                        { id: 'connector', label: '🔗 Veznici' },
                      ].map(cat => (
                        <button
                          key={`he-cat-${cat.id}`}
                          onClick={() => setHeDndFilter(cat.id as any)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg border font-bold transition-all",
                            heDndFilter === cat.id
                              ? "bg-blue-600 text-white border-blue-500"
                              : "bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Word Cards Palette Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                    {DND_HEBREW_WORDS
                      .filter(w => heDndFilter === 'all' || w.type === heDndFilter)
                      .map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify(item));
                          }}
                          onClick={() => handleHeDndAddWord(item)}
                          className={cn(
                            "p-2.5 rounded-2xl border cursor-grab active:cursor-grabbing hover:scale-105 transition-all text-right group relative",
                            isDarkMode ? "bg-zinc-800/90 border-zinc-700 hover:border-blue-500/60 text-zinc-200" : "bg-blue-50/80 border-blue-200 hover:border-blue-400 text-zinc-800"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                              {item.type}
                            </span>
                            <GripVertical className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                          </div>
                          <p className="text-2xl font-serif font-black text-blue-400 mt-1" dir="rtl">{item.char}</p>
                          <p className="text-[10px] font-mono font-bold text-blue-200/80">({item.vuk})</p>
                          <p className="text-[10px] font-medium text-zinc-400 truncate">{item.sr}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* DROP ZONE CANVA / CONSTRUCTION STAGE */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    try {
                      const data = e.dataTransfer.getData('text/plain');
                      if (data) {
                        const parsed = JSON.parse(data) as HebDndWordItem;
                        handleHeDndAddWord(parsed);
                      }
                    } catch (err) {
                      console.error('Drop parse error', err);
                    }
                  }}
                  className={cn(
                    "p-6 rounded-3xl border-2 border-dashed space-y-5 transition-all min-h-[160px] flex flex-col justify-center",
                    heDndStageWords.length > 0
                      ? isDarkMode ? "bg-zinc-900/90 border-blue-500/60" : "bg-blue-500/10 border-blue-400"
                      : isDarkMode ? "bg-zinc-900/40 border-zinc-700 hover:border-blue-500/40" : "bg-zinc-50 border-zinc-300 hover:border-blue-300"
                  )}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-black uppercase text-blue-500 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Polje za Sklapanje Hebrejske Rečenice:</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleHeDndRandomize}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500 hover:text-zinc-950 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>🎲 Nasumična Kreativna Rečenica</span>
                      </button>

                      {heDndStageWords.length > 0 && (
                        <button
                          onClick={() => setHeDndStageWords([])}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Očisti</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stage Draggable Word Pills */}
                  {heDndStageWords.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-sm font-medium text-zinc-400 italic">
                        "Learn language by creativity, that's the idea."
                      </p>
                      <p className="text-xs text-zinc-500">
                        Prevucite hebrejske kartice iz banke iznad ili kliknite na njih da sklopite rečenicu!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 p-2" dir="rtl">
                      {heDndStageWords.map((word, idx) => (
                        <motion.div
                          key={`he-stage-${word.id}-${idx}`}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="px-3.5 py-2.5 rounded-2xl bg-blue-600 text-white shadow-md flex items-center gap-2 border border-blue-400 group"
                        >
                          <div className="text-right">
                            <p className="text-xl font-serif font-black leading-none" dir="rtl">{word.char}</p>
                            <p className="text-[9px] font-mono opacity-90">({word.vuk})</p>
                          </div>

                          <div className="flex items-center gap-0.5 mr-1 opacity-80 group-hover:opacity-100" dir="ltr">
                            {idx > 0 && (
                              <button
                                onClick={() => handleHeDndMoveWord(idx, 'left')}
                                className="p-1 hover:bg-blue-700 rounded text-blue-200"
                                title="Pomeri levo"
                              >
                                <MoveLeft className="w-3 h-3" />
                              </button>
                            )}
                            {idx < heDndStageWords.length - 1 && (
                              <button
                                onClick={() => handleHeDndMoveWord(idx, 'right')}
                                className="p-1 hover:bg-blue-700 rounded text-blue-200"
                                title="Pomeri desno"
                              >
                                <MoveRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleHeDndRemoveWord(idx)}
                              className="p-1 hover:bg-red-700 rounded text-red-200 ml-1"
                              title="Ukloni reč"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ASSEMBLED OUTPUT ANALYSIS CARD */}
                  {heDndStageWords.length > 0 && (() => {
                    const fullChar = heDndStageWords.map(w => w.char).join(' ');
                    const fullVuk = heDndStageWords.map(w => w.vuk).join(' ');
                    const fullSr = heDndStageWords.map(w => w.sr).join(' ') + '.';
                    const fullEn = heDndStageWords.map(w => w.en).join(' ') + '.';
                    const shareText = `${fullChar} - "${fullSr}" #WiseFit #Hebrew #LanguageByCreativity`;

                    return (
                      <div className="p-4 rounded-2xl bg-blue-950/60 border border-blue-500/50 space-y-3 mt-2 text-left">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                            <span>✨ Rezultat Vaše Stvorene Hebrejske Rečenice</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyConfigText(shareText)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border",
                                hCopiedConfigSentence
                                  ? "bg-emerald-600 text-white border-emerald-500"
                                  : "bg-blue-600/30 text-blue-200 border-blue-500/40 hover:bg-blue-600 hover:text-white"
                              )}
                            >
                              {hCopiedConfigSentence ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{hCopiedConfigSentence ? "Kopirano!" : "Kopiraj za Social Media"}</span>
                            </button>

                            <button
                              onClick={() => speakHebrew(fullChar)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500 text-zinc-950 hover:bg-blue-400 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Izgovori Rečenicu
                            </button>
                          </div>
                        </div>

                        <p className="text-3xl font-serif font-black text-blue-300 tracking-wide text-right" dir="rtl">
                          {fullChar}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <p className="text-emerald-400 font-bold">
                            Vuk Transliteracija: <span className="text-white">"{fullVuk}"</span>
                          </p>
                        </div>

                        <div className="border-t pt-2 border-blue-500/20 text-xs space-y-0.5 font-sans">
                          <p className="text-blue-200 font-semibold">🇭🇷 Značenje: {fullSr}</p>
                          <p className="text-blue-300/80 text-[11px] italic">🇬🇧 English: {fullEn}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* MODE 2: GUIDED DROPDOWN & SELECTOR MODE */}
            {heConfigTabMode === 'dropdown' && (
              <div className={cn(
                "p-6 rounded-3xl border space-y-6",
                isDarkMode ? "bg-zinc-900/90 border-blue-500/40 shadow-xl" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md"
              )}>
                <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3 border-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-blue-500 animate-pulse" />
                    <h3 className="text-base font-black tracking-tight">Vodeći Konfigurator Rečenica (Padajući Meniji)</h3>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold uppercase bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30">
                    Sve Zamenice (I, You, They, We...)
                  </span>
                </div>

                {/* SOCIAL MEDIA QUICK PRESETS BAR */}
                <div className="space-y-2.5 bg-blue-500/10 dark:bg-blue-950/50 p-3.5 rounded-2xl border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 font-mono flex items-center gap-1.5">
                      <span>📲 Popularni Social Media Izrazi (Jedan klik za Facebook):</span>
                    </span>
                    {hSelectedSocialPresetIdx !== null && (
                      <button
                        onClick={() => setHSelectedSocialPresetIdx(null)}
                        className="text-[10px] font-bold text-blue-500 hover:underline"
                      >
                        Poništi Preset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {HEBREW_SOCIAL_PRESETS.map((preset, idx) => (
                      <button
                        key={`hsm-${idx}`}
                        onClick={() => setHSelectedSocialPresetIdx(idx)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                          hSelectedSocialPresetIdx === idx
                            ? "bg-blue-600 text-white border-blue-400 shadow-md scale-[1.02]"
                            : isDarkMode ? "bg-zinc-800/90 border-zinc-700 text-zinc-300 hover:border-blue-500/50" : "bg-white border-blue-200 text-zinc-800 hover:bg-blue-100/60"
                        )}
                      >
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-black">{preset.badge}</span>
                        <span className="font-serif font-black">{preset.char}</span>
                        <span className="text-[10px] opacity-75 font-normal">({preset.sr})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 1: SUBJECT WITH DROPDOWN OR BUTTONS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 font-mono">
                      <span>1. Subjekat / Zamenica:</span>
                      <span className="text-[10px] font-normal opacity-80">(Ja, Ti, On, Ona, Mi, Oni)</span>
                    </label>

                    {/* Dropdown Selector for Subjects */}
                    <select
                      value={hCfgSubIdx}
                      onChange={(e) => {
                        setHCfgSubIdx(Number(e.target.value));
                        setHSelectedSocialPresetIdx(null);
                      }}
                      className="text-xs font-bold bg-zinc-800 border border-blue-500/40 text-blue-300 px-3 py-1 rounded-xl"
                    >
                      {HEBREW_CONFIG_SUBJECTS.map((sub, idx) => (
                        <option key={`he-sub-opt-${idx}`} value={idx}>
                          {sub.char} ({sub.vuk}) - {sub.translationSr} / {sub.translationEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {HEBREW_CONFIG_SUBJECTS.map((sub, idx) => (
                      <button
                        key={`he-sub-${idx}`}
                        onClick={() => { setHCfgSubIdx(idx); setHSelectedSocialPresetIdx(null); }}
                        className={cn(
                          "p-2 rounded-2xl border transition-all text-center",
                          hSelectedSocialPresetIdx === null && hCfgSubIdx === idx
                            ? "bg-blue-600 text-white border-blue-500 shadow-md scale-[1.02]"
                            : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-blue-500/50" : "bg-white border-blue-200 text-zinc-800 hover:bg-blue-100/50"
                        )}
                      >
                        <p className="text-lg font-serif font-black">{sub.char}</p>
                        <p className="text-[9px] font-mono opacity-90">{sub.vuk}</p>
                        <p className="text-[10px] font-bold mt-0.5">{sub.translationSr}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 2: VERB WITH DROPDOWN */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 font-mono">
                      <span>2. Glagol:</span>
                    </label>

                    <select
                      value={hCfgVerbIdx}
                      onChange={(e) => {
                        setHCfgVerbIdx(Number(e.target.value));
                        setHSelectedSocialPresetIdx(null);
                      }}
                      className="text-xs font-bold bg-zinc-800 border border-blue-500/40 text-blue-300 px-3 py-1 rounded-xl"
                    >
                      {HEBREW_CONFIG_VERBS.map((v, idx) => (
                        <option key={`he-v-opt-${idx}`} value={idx}>
                          {v.label} - {v.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {HEBREW_CONFIG_VERBS.map((v, idx) => (
                      <button
                        key={`he-verb-${idx}`}
                        onClick={() => { setHCfgVerbIdx(idx); setHSelectedSocialPresetIdx(null); }}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                          hSelectedSocialPresetIdx === null && hCfgVerbIdx === idx
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-blue-500/40" : "bg-white border-blue-200 text-zinc-700 hover:bg-blue-100/50"
                        )}
                      >
                        <span className="font-serif text-sm font-black">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 3: NOUN OR ADJECTIVE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 font-mono">
                      <span>3. Kraj Rečenice (Imenica ili Pridev):</span>
                    </label>

                    <div className="flex bg-blue-500/20 p-0.5 rounded-lg border border-blue-500/30 font-mono text-[10px]">
                      <button
                        onClick={() => setHCfgEndingType('noun')}
                        className={cn("px-2.5 py-1 rounded-md font-bold transition-all", hCfgEndingType === 'noun' ? "bg-blue-600 text-white shadow" : "text-blue-400 hover:text-white")}
                      >
                        Imenice
                      </button>
                      <button
                        onClick={() => setHCfgEndingType('adjective')}
                        className={cn("px-2.5 py-1 rounded-md font-bold transition-all", hCfgEndingType === 'adjective' ? "bg-blue-600 text-white shadow" : "text-blue-400 hover:text-white")}
                      >
                        Pridevi ✨
                      </button>
                    </div>
                  </div>

                  {hCfgEndingType === 'noun' ? (
                    <div className="flex flex-wrap gap-2">
                      {HEBREW_CONFIG_NOUNS.map((n, idx) => (
                        <button
                          key={`he-noun-${idx}`}
                          onClick={() => { setHCfgNounIdx(idx); setHSelectedSocialPresetIdx(null); }}
                          className={cn(
                            "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                            hSelectedSocialPresetIdx === null && hCfgNounIdx === idx
                              ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                              : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-blue-500/40" : "bg-white border-blue-200 text-zinc-700 hover:bg-blue-100/50"
                          )}
                        >
                          <span className="font-serif text-sm font-black">{n.char}</span>
                          <span className="text-[10px] opacity-80 font-mono">({n.sr})</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {HEBREW_CONFIG_ADJECTIVES.map((adj, idx) => (
                        <button
                          key={`he-adj-${idx}`}
                          onClick={() => { setHCfgAdjIdx(idx); setHSelectedSocialPresetIdx(null); }}
                          className={cn(
                            "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                            hSelectedSocialPresetIdx === null && hCfgAdjIdx === idx
                              ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                              : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-blue-500/40" : "bg-white border-blue-200 text-blue-800 hover:bg-blue-100/50"
                          )}
                        >
                          <span className="font-serif text-sm font-black">{adj.char}</span>
                          <span className="text-[10px] opacity-80 font-mono">({adj.sr})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* GENERATED CONFIGURATOR PREVIEW CARD */}
                {(() => {
                  let sentenceChar = '';
                  let sentenceVuk = '';
                  let sentenceSr = '';
                  let sentenceEn = '';

                  if (hSelectedSocialPresetIdx !== null) {
                    const preset = HEBREW_SOCIAL_PRESETS[hSelectedSocialPresetIdx];
                    sentenceChar = preset.char;
                    sentenceVuk = preset.vuk;
                    sentenceSr = preset.sr;
                    sentenceEn = preset.en;
                  } else {
                    const sub = HEBREW_CONFIG_SUBJECTS[hCfgSubIdx];
                    const verbObj = HEBREW_CONFIG_VERBS[hCfgVerbIdx];

                    const getVForm = (prop: any) => {
                      if (typeof prop === 'string') return prop;
                      if (!prop) return '';
                      if (prop[sub.char]) return prop[sub.char];
                      if (['זֹאת', 'הַהִיא', 'אֵיזוֹ'].includes(sub.char)) return prop['הִיא'] || prop['הוּא'] || prop['אֲנִי'];
                      if (['אֵלֶּה', 'הָאֵלֶּה'].includes(sub.char)) return prop['הֵם'] || prop['אֲנַחְנוּ'] || prop['אֲנִי'];
                      return prop['הוּא'] || prop['אֲנִי'] || Object.values(prop)[0] || '';
                    };

                    const verbChar = getVForm(verbObj.char);
                    const verbVuk = getVForm(verbObj.vuk);
                    const verbSr = getVForm(verbObj.sr);

                    if (hCfgEndingType === 'noun') {
                      const noun = HEBREW_CONFIG_NOUNS[hCfgNounIdx];
                      sentenceChar = `${sub.char} ${verbChar} ${noun.char}`;
                      sentenceVuk = `${sub.vuk} ${verbVuk} ${noun.vuk}`;
                      sentenceSr = `${sub.translationSr} ${verbSr} ${noun.sr}.`;
                      sentenceEn = `${sub.translationEn} ${verbObj.en} ${noun.en}.`;
                    } else {
                      const adj = HEBREW_CONFIG_ADJECTIVES[hCfgAdjIdx];
                      sentenceChar = `${sub.char} ${verbChar} ${adj.char}`;
                      sentenceVuk = `${sub.vuk} ${verbVuk} ${adj.vuk}`;
                      sentenceSr = `${sub.translationSr} ${verbSr} ${adj.sr}.`;
                      sentenceEn = `${sub.translationEn} ${verbObj.en} ${adj.en}.`;
                    }
                  }

                  const socialShareText = `${sentenceChar} (${sentenceVuk}) - "${sentenceSr}" #WiseFit #Hebrew #Stoic`;

                  return (
                    <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/50 space-y-3 mt-4 text-left">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                          <span>✨ Sklopljena Hebrejska Rečenica</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyConfigText(socialShareText)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border",
                              hCopiedConfigSentence
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-blue-600/30 text-blue-200 border-blue-500/40 hover:bg-blue-600 hover:text-white"
                            )}
                          >
                            {hCopiedConfigSentence ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{hCopiedConfigSentence ? "Kopirano!" : "Kopiraj za Social Media"}</span>
                          </button>

                          <button
                            onClick={() => speakHebrew(sentenceChar)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500 text-zinc-950 hover:bg-blue-400 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> Izgovori
                          </button>
                        </div>
                      </div>

                      <p className="text-3xl font-serif font-black text-blue-300 tracking-wide text-right" dir="rtl">
                        {sentenceChar}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                        <p className="text-emerald-400 font-bold">
                          Vuk: <span className="text-white">"{sentenceVuk}"</span>
                        </p>
                      </div>

                      <div className="border-t pt-2 border-blue-500/20 text-xs space-y-0.5 font-sans">
                        <p className="text-blue-200 font-semibold">🇭🇷 {sentenceSr}</p>
                        <p className="text-blue-300/80 text-[11px] italic">🇬🇧 {sentenceEn}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </motion.div>
        )}

        {/* DUOLINGO QUIZ VIEW */}
        {activeTab === 'quiz' && (
          <motion.div key="quiz-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-6">
            {!quizStarted && !quizComplete && (
              <div className={cn(
                "p-8 rounded-3xl border text-center space-y-6",
                isDarkMode ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200 shadow-lg"
              )}>
                <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  🕎
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-black tracking-tight">Hebrejski Duo Kviz Arena</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Testirajte svoje znanje hebrejskih reči, korena, Vuk Karadžić transliteracije i engleskih prevoda kroz interaktivni audio kviz.
                  </p>
                </div>

                {/* QUIZ SETTINGS FILTERS */}
                <div className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-700/50 space-y-3 text-left">
                  <p className="text-[11px] font-mono font-bold uppercase text-blue-400">⚙️ Opcije Kviz Runde:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[10px]">Kategorija Reči:</label>
                      <select
                        value={hQuizCategory}
                        onChange={(e) => setHQuizCategory(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-blue-300 font-bold"
                      >
                        <option value="all">🌐 Sve Reči & Imenice ({HEBREW_VOCAB_DATA.length})</option>
                        <option value="imenice">📦 Imenice & Objekti</option>
                        <option value="glagoli">⚡ Glagoli & Akcije</option>
                        <option value="pridevi">✨ Pridevi & Opisi</option>
                        <option value="zamenice">👤 Zamenice & Subjekti</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[10px]">Broj Pitanja:</label>
                      <select
                        value={hQuizQuestionCount}
                        onChange={(e) => setHQuizQuestionCount(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-blue-300 font-bold"
                      >
                        <option value={5}>⚡ 5 Pitanja (Brzi Test)</option>
                        <option value={10}>🔥 10 Pitanja (Standard)</option>
                        <option value={15}>🏆 15 Pitanja (Ekspert)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto font-mono text-xs">
                  <div className={cn("p-3 rounded-2xl border", isDarkMode ? "bg-zinc-800/40 border-zinc-700/50" : "bg-zinc-50 border-zinc-200")}>
                    <p className="text-[10px] text-zinc-400">Najbolji Skor</p>
                    <p className="text-base font-black text-amber-400">{highScore} pts</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl border", isDarkMode ? "bg-zinc-800/40 border-zinc-700/50" : "bg-zinc-50 border-zinc-200")}>
                    <p className="text-[10px] text-zinc-400">Savladano</p>
                    <p className="text-base font-black text-emerald-400">{masteredIds.length}/{HEBREW_VOCAB_DATA.length}</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl border", isDarkMode ? "bg-zinc-800/40 border-zinc-700/50" : "bg-zinc-50 border-zinc-200")}>
                    <p className="text-[10px] text-zinc-400">Životi</p>
                    <p className="text-base font-black text-red-400">3 ❤️</p>
                  </div>
                </div>

                <button
                  onClick={generateQuizRound}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                >
                  Započni Kviz Rundu 🚀
                </button>
              </div>
            )}

            {!quizComplete && quizStarted && roundQuestions.length > 0 && (
              <div className={cn(
                "p-6 md:p-8 rounded-3xl border space-y-6",
                isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-md"
              )}>
                {/* Status Bar */}
                <div className="flex items-center justify-between font-mono text-xs font-black border-b pb-4 border-zinc-800/30">
                  <div className="flex items-center gap-1 text-red-500">
                    {'❤️'.repeat(lives)}
                  </div>
                  <div className="text-blue-500">
                    Pitanje {questionIdx + 1} / {roundQuestions.length}
                  </div>
                  <div className="text-emerald-500">
                    Poeni: {score}
                  </div>
                </div>

                {/* Question */}
                <div className="text-center space-y-3 my-4">
                  <span className="text-5xl">{roundQuestions[questionIdx].vocab.emoji}</span>
                  <h3 className="text-4xl font-serif font-black text-blue-400" dir="rtl">
                    {roundQuestions[questionIdx].vocab.char}
                  </h3>

                  <div className="flex items-center justify-center gap-3 text-xs font-mono">
                    <span className="text-indigo-400 font-bold">{getItemTransliteration(roundQuestions[questionIdx].vocab)}</span>
                    <span className="text-emerald-500 font-bold">Vuk: "{getItemVuk(roundQuestions[questionIdx].vocab)}"</span>
                  </div>

                  {/* Audio TTS Button on Question */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => speakHebrew(roundQuestions[questionIdx].vocab.char, `quiz-${roundQuestions[questionIdx].vocab.id}`)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm border",
                        isPronouncing === `quiz-${roundQuestions[questionIdx].vocab.id}`
                          ? "bg-amber-500 text-zinc-950 border-amber-300 animate-pulse"
                          : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
                      )}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isPronouncing === `quiz-${roundQuestions[questionIdx].vocab.id}` ? "Pusta se..." : "Pusti Zvuk / Audio TTS"}</span>
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  {roundQuestions[questionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswer === oIdx;
                    const isCorrect = oIdx === roundQuestions[questionIdx].correctIndex;

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSubmit(oIdx)}
                        disabled={isAnswered}
                        className={cn(
                          "p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between",
                          !isAnswered && (isDarkMode ? "bg-zinc-800/60 border-zinc-700 hover:border-blue-500" : "bg-zinc-50 border-zinc-200 hover:border-blue-400"),
                          isAnswered && isCorrect && "bg-emerald-600 text-white border-emerald-500 shadow-md",
                          isAnswered && isSelected && !isCorrect && "bg-red-600 text-white border-red-500 shadow-md"
                        )}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {/* DETAILED POST-ANSWER EXPLANATION & TRANSLATION BOTTOM CARD */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-5 rounded-3xl border space-y-4 text-left shadow-lg mt-4",
                      selectedAnswer === roundQuestions[questionIdx].correctIndex
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-100"
                        : "bg-red-950/40 border-red-500/50 text-red-100"
                    )}
                  >
                    {/* Answer Result Banner */}
                    <div className="flex items-center justify-between border-b pb-3 border-white/10 flex-wrap gap-2">
                      <div className="flex items-center gap-2 font-mono text-sm font-black">
                        {selectedAnswer === roundQuestions[questionIdx].correctIndex ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-5 h-5" />
                            <span>TAČNO! / CORRECT! (+10 pts)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400">
                            <XCircle className="w-5 h-5" />
                            <span>NETAČNO! / INCORRECT</span>
                          </div>
                        )}
                      </div>

                      {/* Primary Functional Audio Button */}
                      <button
                        onClick={() => speakHebrew(roundQuestions[questionIdx].vocab.char, `quiz-${roundQuestions[questionIdx].vocab.id}`)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md border",
                          isPronouncing === `quiz-${roundQuestions[questionIdx].vocab.id}`
                            ? "bg-amber-500 text-zinc-950 border-amber-300 animate-pulse"
                            : "bg-blue-600 text-white border-blue-400 hover:bg-blue-500"
                        )}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{isPronouncing === `quiz-${roundQuestions[questionIdx].vocab.id}` ? "Slušate..." : "🔊 Izgovori Reč (TTS)"}</span>
                      </button>
                    </div>

                    {/* Notice if Answer was Wrong */}
                    {selectedAnswer !== roundQuestions[questionIdx].correctIndex && (
                      <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs font-mono text-red-200 font-bold">
                        🎯 Tačan odgovor: <span className="text-white underline">{roundQuestions[questionIdx].options[roundQuestions[questionIdx].correctIndex]}</span>
                      </div>
                    )}

                    {/* Full Word Breakdown & Dual Translations */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-serif font-black text-blue-300" dir="rtl">{roundQuestions[questionIdx].vocab.char}</span>
                          <div>
                            <p className="text-sm font-mono font-black text-indigo-200">
                              Transliteracija: {getItemTransliteration(roundQuestions[questionIdx].vocab)}
                            </p>
                            <p className="text-xs font-mono font-bold text-emerald-300">
                              Vuk Transliteracija: "{getItemVuk(roundQuestions[questionIdx].vocab)}"
                            </p>
                          </div>
                        </div>
                        <span className="text-3xl">{roundQuestions[questionIdx].vocab.emoji}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans pt-2 border-t border-white/10">
                        <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 space-y-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-amber-400">🇭🇷 Značenje (Srpski/Hrvatski):</span>
                          <p className="font-bold text-sm text-white">{getItemTranslation(roundQuestions[questionIdx].vocab)}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 space-y-0.5">
                          <span className="text-[10px] font-mono font-bold uppercase text-blue-400">🇬🇧 English Translation:</span>
                          <p className="font-bold text-sm text-white">{getItemEnglish(roundQuestions[questionIdx].vocab)}</p>
                        </div>
                      </div>

                      {/* Part of speech & Root */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                          📦 Vrsta reči: {roundQuestions[questionIdx].vocab.category || 'Reč'}
                        </span>
                        {roundQuestions[questionIdx].vocab.root && (
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                            🌱 Koren (Shoresh): {roundQuestions[questionIdx].vocab.root}
                          </span>
                        )}
                      </div>

                      {/* Stoic Quote / Wisdom Context */}
                      {(() => {
                        const qItem = roundQuestions[questionIdx].vocab;
                        const quoteInfo = getItemQuote(qItem);
                        return (
                          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-blue-300 font-mono font-bold text-[10px] uppercase">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Mudrost i primer upotrebe:
                            </div>
                            <p className="font-serif font-bold text-blue-200" dir="rtl">{quoteInfo.quote}</p>
                            <p className="text-[11px] italic text-blue-300/80">"{quoteInfo.translation}"</p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => speakHebrew(roundQuestions[questionIdx].vocab.char, `quiz-${roundQuestions[questionIdx].vocab.id}`)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5"
                      >
                        <Volume2 className="w-4 h-4" /> Ponovi Audio Izgovor
                      </button>

                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
                      >
                        <span>Sledeće Pitanje</span>
                        <span>→</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {quizComplete && (
              <div className={cn(
                "p-8 rounded-3xl border text-center space-y-5",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200 shadow-xl"
              )}>
                <Trophy className="w-14 h-14 text-yellow-500 mx-auto animate-bounce" />
                <div className="space-y-1">
                  <h3 className="text-2xl font-serif font-black">Runda Kvida Završena!</h3>
                  <p className="text-xs text-zinc-400">Uspešno ste testirali vaše hebrejsko znanje.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 inline-block font-mono text-sm font-black text-emerald-400">
                  Ostvaren Rezultat: {score} Poena
                </div>
                <div>
                  <button
                    onClick={generateQuizRound}
                    className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                  >
                    Igraj Ponovo 🔄
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN EDIT MODAL FOR QUOTES & PRONUNCIATIONS */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "w-full max-w-lg rounded-3xl border p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto",
                isDarkMode ? "bg-zinc-900 border-blue-500/40 text-zinc-100" : "bg-white border-blue-200 text-zinc-900"
              )}
            >
              <div className="flex items-center justify-between border-b pb-3 border-blue-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{editingItem.emoji}</span>
                  <div>
                    <h3 className="text-lg font-serif font-black text-blue-500 flex items-center gap-2">
                      <span>Uredi Izreku & Izgovor</span>
                      <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Petar / Admin</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-serif" dir="rtl">Reč: {editingItem.char}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* PRONUNCIATION REVISION */}
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                  <h4 className="font-mono font-bold uppercase tracking-wider text-blue-500 text-[11px] flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Revision Izgovora (Transliteracija & Vuk)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 font-mono">Transliteracija:</label>
                      <input
                        type="text"
                        value={editTransliteration}
                        onChange={(e) => setEditTransliteration(e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 font-mono">Vuk Transliteracija:</label>
                      <input
                        type="text"
                        value={editVuk}
                        onChange={(e) => setEditVuk(e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 font-mono">🇭🇷 Prevod (Srpski):</label>
                      <input
                        type="text"
                        value={editTranslation}
                        onChange={(e) => setEditTranslation(e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 font-mono">🇬🇧 Prevod (Engleski):</label>
                      <input
                        type="text"
                        value={editEnglish}
                        onChange={(e) => setEditEnglish(e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* WISE QUOTE REVISION */}
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3">
                  <h4 className="font-mono font-bold uppercase tracking-wider text-blue-500 text-[11px] flex items-center gap-1.5">
                    📜 Wise Quote / Mudra Izreka u Kvizu
                  </h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-600 dark:text-blue-300 font-mono">Mudra Izreka (Hebrejski):</label>
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={editQuoteText}
                      onChange={(e) => setEditQuoteText(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl border text-xs font-serif font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-blue-200" : "bg-white border-zinc-300 text-zinc-900"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-600 dark:text-blue-300 font-mono">Prevod i Značenje Izreke:</label>
                    <textarea
                      rows={2}
                      value={editQuoteTranslation}
                      onChange={(e) => setEditQuoteTranslation(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl border text-xs italic focus:outline-none focus:ring-2 focus:ring-blue-500",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-blue-100" : "bg-white border-zinc-300 text-zinc-900"
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-blue-500/20">
                <button
                  type="button"
                  onClick={handleResetEdit}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Resetuj na Fabričko
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800"
                  >
                    Odustani
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Sačuvaj Izmene
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
