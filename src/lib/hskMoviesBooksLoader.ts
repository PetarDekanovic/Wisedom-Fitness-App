import type { VocabItem } from '../data/chineseVocabData';

export type MoviesBooksTierId =
  | 'hsk_core_2500'
  | 'hsk_movies_tv'
  | 'hsk_books'
  | 'hsk_idioms'
  | 'hsk_chars_2500';

export interface MoviesBooksDataset {
  hsk_core_2500: VocabItem[];
  hsk_movies_tv: VocabItem[];
  hsk_books: VocabItem[];
  hsk_idioms: VocabItem[];
  hsk_chars_2500: VocabItem[];
}

export interface MoviesBooksTierMeta {
  id: MoviesBooksTierId;
  shortLabel: string;
  title: string;
  subtitle: string;
  emoji: string;
  defaultCount: number;
  accent: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
}

export const MOVIES_BOOKS_TIERS: MoviesBooksTierMeta[] = [
  {
    id: 'hsk_core_2500',
    shortLabel: '🎬 Core 2500',
    title: '1. Core 2500 (HSK 3.0)',
    subtitle: 'Najčešćih 2.500 reči — svakodnevni govor i serije',
    emoji: '🎬',
    defaultCount: 2500,
    accent: 'emerald',
  },
  {
    id: 'hsk_movies_tv',
    shortLabel: '🍿 Movies & TV',
    title: '2. Movies & TV (2501–6000)',
    subtitle: '3.500 reči za savremene filmove i kineske drame',
    emoji: '🍿',
    defaultCount: 3500,
    accent: 'blue',
  },
  {
    id: 'hsk_books',
    shortLabel: '📚 Books',
    title: '3. Books & Novels (6001–9000)',
    subtitle: '3.000 reči za čitanje savremenih romana i knjiga',
    emoji: '📚',
    defaultCount: 3000,
    accent: 'purple',
  },
  {
    id: 'hsk_idioms',
    shortLabel: '🐉 Idioms (483)',
    title: '4. Idioms & Set Phrases',
    subtitle: 'Svih 483 četvorokarakternih HSK 3.0 izraza (成语)',
    emoji: '🐉',
    defaultCount: 483,
    accent: 'amber',
  },
  {
    id: 'hsk_chars_2500',
    shortLabel: '✍️ Chars 2500',
    title: '5. Characters 2500',
    subtitle: '2.500 najčešćih hanzi karaktera (~99% teksta)',
    emoji: '✍️',
    defaultCount: 2500,
    accent: 'rose',
  },
];

// Strip tone diacritics from Pinyin and approximate Serbian Vuk phonetic transcription
const TONE_MAP: Record<string, string> = {
  ā: 'a', á: 'a', ǎ: 'a', à: 'a',
  ē: 'e', é: 'e', ě: 'e', è: 'e',
  ī: 'i', í: 'i', ǐ: 'i', ì: 'i',
  ō: 'o', ó: 'o', ǒ: 'o', ò: 'o',
  ū: 'u', ú: 'u', ǔ: 'u', ù: 'u',
  ǖ: 'ü', ǘ: 'ü', ǚ: 'ü', ǜ: 'ü',
  Ā: 'A', Á: 'A', Ǎ: 'A', À: 'A',
  Ē: 'E', É: 'E', Ě: 'E', È: 'E',
  Ī: 'I', Í: 'I', Ǐ: 'I', Ì: 'I',
  Ō: 'O', Ó: 'O', Ǒ: 'O', Ò: 'O',
  Ū: 'U', Ú: 'U', Ǔ: 'U', Ù: 'U',
};

export function pinyinToVuk(pinyin: string): string {
  if (!pinyin) return '';
  const plain = pinyin
    .split('')
    .map((ch) => TONE_MAP[ch] || ch)
    .join('')
    .toLowerCase()
    .trim();

  return plain
    .split(/\s+/)
    .map((syl) => {
      if (!syl) return '';
      let s = syl;
      // Initials
      if (s.startsWith('zh')) s = 'dž' + s.slice(2);
      else if (s.startsWith('ch')) s = 'č' + s.slice(2);
      else if (s.startsWith('sh')) s = 'š' + s.slice(2);
      else if (s.startsWith('x')) s = 'sj' + s.slice(1);
      else if (s.startsWith('q')) s = 'ć' + s.slice(1);
      else if (s.startsWith('j')) s = 'đ' + s.slice(1);
      else if (s.startsWith('z')) s = 'dz' + s.slice(1);
      else if (s.startsWith('r')) s = 'ž' + s.slice(1);
      else if (s.startsWith('y')) s = 'j' + s.slice(1);
      else if (s.startsWith('w')) s = 'v' + s.slice(1);
      // Finals
      s = s
        .replace(/ü/g, 'ju')
        .replace(/iou/g, 'jou')
        .replace(/iu/g, 'jou')
        .replace(/ui/g, 'uej')
        .replace(/ai/g, 'aj')
        .replace(/ei/g, 'ej')
        .replace(/ao/g, 'ao')
        .replace(/ian/g, 'jen')
        .replace(/ie/g, 'je')
        .replace(/ng/g, 'ng');
      return s;
    })
    .filter(Boolean)
    .join('-');
}

function getEmojiForPosOrTier(pos: string, tier: MoviesBooksTierId): string {
  if (tier === 'hsk_idioms') return '🐉';
  if (tier === 'hsk_chars_2500') return '✍️';
  switch (pos) {
    case 'v':
    case 'vg':
    case 'vd':
    case 'vn':
      return '⚡';
    case 'a':
    case 'ad':
    case 'an':
      return '🎨';
    case 'n':
    case 'nr':
    case 'ns':
    case 'nt':
    case 'nz':
      return tier === 'hsk_movies_tv' ? '🎬' : tier === 'hsk_books' ? '📖' : '🧩';
    case 't':
      return '⏳';
    case 'i':
      return '🐉';
    case 'd':
      return '🧭';
    case 'm':
    case 'q':
      return '🔢';
    case 'r':
      return '👤';
    default:
      if (tier === 'hsk_movies_tv') return '🍿';
      if (tier === 'hsk_books') return '📚';
      return '🎬';
  }
}

const POS_LABELS: Record<string, string> = {
  n: 'Imenica (Noun)',
  v: 'Glagol (Verb)',
  a: 'Pridev (Adjective)',
  d: 'Prilog (Adverb)',
  i: 'Idiom (成语)',
  r: 'Zamenica (Pronoun)',
  t: 'Vreme (Time)',
  m: 'Broj (Number)',
  q: 'Klasifikator (Measure)',
  p: 'Predlog (Preposition)',
  c: 'Veznik (Conjunction)',
  u: 'Partikula (Particle)',
  e: 'Uzvik (Interjection)',
  f: 'Pravac (Locality)',
};

let cachedRawPayload: {
  words: Array<[string, string, string, string, number, string, string]>;
  characters: Array<[string, string, string, string, number, string]>;
} | null = null;

export async function loadMoviesBooksDataset(
  existingVocabList: VocabItem[] = []
): Promise<MoviesBooksDataset> {
  if (!cachedRawPayload) {
    const resp = await fetch('/data/hsk-movies-books.json');
    if (!resp.ok) {
      throw new Error(`Neuspešno učitavanje Movies & Books baze (${resp.status})`);
    }
    cachedRawPayload = await resp.json();
  }

  // Lookup existing Serbian translations from WiseFit's curated 640+ dictionary
  const srMap = new Map<string, VocabItem>();
  for (const item of existingVocabList) {
    if (item.char && !srMap.has(item.char)) {
      srMap.set(item.char, item);
    }
  }

  const hsk_core_2500: VocabItem[] = [];
  const hsk_movies_tv: VocabItem[] = [];
  const hsk_books: VocabItem[] = [];
  const hsk_idioms: VocabItem[] = [];
  const hsk_chars_2500: VocabItem[] = [];

  for (const [char, pinyin, english, levelStr, rank, radical, pos] of cachedRawPayload!.words) {
    const existing = srMap.get(char);
    const isFourChar = [...char].length === 4;
    const posLabel = POS_LABELS[pos] || '';

    const buildItem = (tier: MoviesBooksTierId, categoryLabel: string): VocabItem => ({
      id: `${tier}_${rank}_${char}`,
      char,
      pinyin: existing?.pinyin || pinyin,
      vuk: existing?.vuk || pinyinToVuk(pinyin),
      translation: existing?.translation || english,
      english: english || existing?.english || '',
      emoji: existing?.emoji || getEmojiForPosOrTier(pos, tier),
      category: 'custom',
      categoryLabel,
      radical: existing?.radical || (radical ? `${radical}` : undefined),
      visualTip:
        existing?.visualTip ||
        `${levelStr} · Rang #${rank}${posLabel ? ` · ${posLabel}` : ''} — iz Movies & Books HSK 3.0 liste`,
      tags: ['movies-books', tier, levelStr, ...(pos ? [pos] : [])],
      level: parseInt(levelStr.replace(/\D/g, ''), 10) || 1,
    });

    if (rank <= 2500) {
      hsk_core_2500.push(buildItem('hsk_core_2500', `Core 2500 · ${levelStr}`));
    } else if (rank <= 6000) {
      hsk_movies_tv.push(buildItem('hsk_movies_tv', `Movies & TV · ${levelStr}`));
    } else if (rank <= 9000) {
      hsk_books.push(buildItem('hsk_books', `Books · ${levelStr}`));
    }

    if (isFourChar) {
      hsk_idioms.push(buildItem('hsk_idioms', `Idioms & Phrases · ${levelStr}`));
    }
  }

  for (const [char, pinyin, english, levelStr, rank, radical] of cachedRawPayload!.characters) {
    const existing = srMap.get(char);
    hsk_chars_2500.push({
      id: `hsk_chars_2500_${rank}_${char}`,
      char,
      pinyin: existing?.pinyin || pinyin,
      vuk: existing?.vuk || pinyinToVuk(pinyin),
      translation: existing?.translation || english,
      english: english || existing?.english || '',
      emoji: existing?.emoji || '✍️',
      category: 'custom',
      categoryLabel: `Characters 2500 · #${rank}`,
      radical: existing?.radical || (radical ? `${radical}` : undefined),
      visualTip:
        existing?.visualTip ||
        `Karakter #${rank} od 2.500 najčešćih (${levelStr}) — pokriva ~99% kineskog teksta`,
      tags: ['movies-books', 'hsk_chars_2500', levelStr],
      level: parseInt(levelStr.replace(/\D/g, ''), 10) || 1,
    });
  }

  return {
    hsk_core_2500,
    hsk_movies_tv,
    hsk_books,
    hsk_idioms,
    hsk_chars_2500,
  };
}

// Parse a single CSV line respecting quoted fields and escaped double quotes
function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCustomVocabCsv(
  csvText: string,
  fileName: string,
  existingVocabList: VocabItem[] = []
): { items: VocabItem[]; warning?: string } {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { items: [], warning: 'CSV fajl je prazan ili nema dovoljno redova.' };
  }

  const srMap = new Map<string, VocabItem>();
  for (const item of existingVocabList) {
    if (item.char && !srMap.has(item.char)) srMap.set(item.char, item);
  }

  // Find header row containing Chinese/Word/Character + Meaning/Pinyin
  let headerIdx = -1;
  let charCol = -1;
  let pinyinCol = -1;
  let meaningCol = -1;
  let serbianCol = -1;
  let hskCol = -1;
  let rankCol = -1;
  let radicalCol = -1;

  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const cols = parseCsvRow(lines[i]).map((c) => c.toLowerCase());
    const cIdx = cols.findIndex((c) =>
      ['word', 'simplified', 'hanzi', 'character', 'char', 'chinese', 'reč', 'karakter'].some((k) =>
        c.includes(k)
      )
    );
    const mIdx = cols.findIndex((c) =>
      ['meaning', 'english', 'definition', 'gloss', 'translation', 'prevod', 'značenje'].some((k) =>
        c.includes(k)
      )
    );
    if (cIdx !== -1 && mIdx !== -1) {
      headerIdx = i;
      charCol = cIdx;
      meaningCol = mIdx;
      pinyinCol = cols.findIndex((c) => c.includes('pinyin') || c.includes('pronunciation'));
      serbianCol = cols.findIndex((c) => c.includes('serbian') || c.includes('srpski'));
      hskCol = cols.findIndex((c) => c.includes('hsk') || c.includes('level') || c.includes('tier'));
      rankCol = cols.findIndex((c) => c.includes('rank') || c.includes('freq') || c === '#');
      radicalCol = cols.findIndex((c) => c.includes('radical'));
      break;
    }
  }

  const items: VocabItem[] = [];
  const startRow = headerIdx !== -1 ? headerIdx + 1 : 0;
  const cleanFileName = fileName.replace(/\.csv$/i, '').slice(0, 28);

  for (let i = startRow; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (cols.length < 2) continue;

    let char = '';
    let pinyin = '';
    let english = '';
    let serbian = '';
    let level = '';
    let rank = '';
    let radical = '';

    if (headerIdx !== -1) {
      char = cols[charCol] || '';
      pinyin = pinyinCol !== -1 ? cols[pinyinCol] || '' : '';
      english = cols[meaningCol] || '';
      serbian = serbianCol !== -1 ? cols[serbianCol] || '' : '';
      level = hskCol !== -1 ? cols[hskCol] || '' : '';
      rank = rankCol !== -1 ? cols[rankCol] || '' : '';
      radical = radicalCol !== -1 ? cols[radicalCol] || '' : '';
    } else {
      // Heuristic fallback: find first column with CJK characters
      const cjkIdx = cols.findIndex((c) => /[\u4e00-\u9fff]/.test(c) && [...c].length <= 8);
      if (cjkIdx === -1) continue;
      char = cols[cjkIdx];
      pinyin = cols[cjkIdx + 1] || '';
      english = cols[cjkIdx + 2] || cols[cjkIdx + 1] || '';
    }

    // Must contain Chinese characters and not be a long prose sentence (like Read me text)
    if (!/[\u4e00-\u9fff]/.test(char) || [...char].length > 10 || !english) continue;

    const existing = srMap.get(char);
    items.push({
      id: `csv_${Date.now()}_${i}_${char}`,
      char,
      pinyin: pinyin || existing?.pinyin || '',
      vuk: existing?.vuk || pinyinToVuk(pinyin),
      translation: serbian || existing?.translation || english,
      english,
      emoji: existing?.emoji || '📄',
      category: 'custom',
      categoryLabel: cleanFileName || 'CSV Lista',
      radical: radical || existing?.radical,
      visualTip:
        existing?.visualTip ||
        `${level ? `${level} · ` : ''}${rank ? `Rang #${rank} · ` : ''}Učitano iz ${cleanFileName}`,
      tags: ['csv-import', ...(level ? [level] : [])],
      level: parseInt(level.replace(/\D/g, ''), 10) || 1,
    });
  }

  if (items.length === 0) {
    return {
      items: [],
      warning:
        'Ovaj CSV ne sadrži kolone sa kineskim rečima (npr. Read me list). Koristite ugrađene Movies & Books tabove ili izvezite list sa rečima (Core 2500 / Movies & TV / Books / Idioms).',
    };
  }

  return { items };
}
