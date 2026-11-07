import cedict from 'cc-cedict';

export interface CcCedictWordEntry {
  id: string;
  char: string;
  charTraditional: string;
  pinyin: string;
  pinyinNumbered: string;
  vuk: string;
  english: string;
  englishList: string[];
  classifiers?: string[];
  emoji: string;
  category: 'noun' | 'verb' | 'adjective' | 'pronoun' | 'particle' | 'expression' | 'custom';
  source: 'cc-cedict' | 'ai-enriched';
  serbian?: string;
  quote?: {
    text: string;
    pinyin: string;
    translation: string;
    author: string;
  };
}

export interface ApiSourcesStatus {
  id: string;
  name: string;
  url: string;
  type: 'self-hosted' | 'rest-api' | 'client-script' | 'commercial-api';
  status: 'active' | 'offline_error' | 'not_suitable' | 'requires_key';
  description: string;
  details: string;
}

/**
 * Converts tone-numbered pinyin (e.g. "cha2", "zhi4 hui4", "lu:3")
 * into standard accented Pinyin ("chá", "zhì huì", "lǚ").
 */
export function pinyinNumberToAccented(str: string): string {
  if (!str) return '';
  const toneMap: Record<string, string[]> = {
    a: ['ā', 'á', 'ǎ', 'à', 'a'],
    e: ['ē', 'é', 'ě', 'è', 'e'],
    o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
    i: ['ī', 'í', 'ǐ', 'ì', 'i'],
    u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
    v: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü']
  };

  return str.split(' ').map(word => {
    // Normalise u: or v to ü
    const norm = word.replace(/u:|v/gi, (m) => m.toLowerCase() === 'v' ? 'ü' : 'ü');
    const m = norm.match(/^([a-zA-ZüÜ]+)([1-5])?$/);
    if (!m) return norm;

    let [_, chars, tone] = m;
    const toneNum = tone ? parseInt(tone, 10) : 5;
    if (toneNum === 5 || !tone) return chars;

    const low = chars.toLowerCase();
    let idx = -1;
    let vowel = '';

    if (low.includes('a')) {
      idx = low.indexOf('a');
      vowel = 'a';
    } else if (low.includes('e')) {
      idx = low.indexOf('e');
      vowel = 'e';
    } else if (low.includes('ou')) {
      idx = low.indexOf('o');
      vowel = 'o';
    } else {
      for (let i = low.length - 1; i >= 0; i--) {
        if ('aeiouvü'.includes(low[i])) {
          idx = i;
          vowel = low[i];
          break;
        }
      }
    }

    if (idx !== -1 && toneMap[vowel]) {
      const accented = toneMap[vowel][toneNum - 1];
      const isUpper = chars[idx] === chars[idx].toUpperCase() && chars[idx] !== chars[idx].toLowerCase();
      const finalVowel = isUpper ? accented.toUpperCase() : accented;
      chars = chars.slice(0, idx) + finalVowel + chars.slice(idx + 1);
    }

    return chars;
  }).join(' ');
}

/**
 * Converts Pinyin into Serbian / Croatian Vuk Karadžić phonetic reading.
 */
export function pinyinToVuk(pinyin: string): string {
  if (!pinyin) return '';
  // Strip tone diacritics for clean phonetic matching
  const clean = pinyin.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  return clean.split(' ').map(s => {
    let v = s.replace(/u:|v/g, 'ü');

    // Initials
    if (v.startsWith('zh')) v = 'dž' + v.slice(2);
    else if (v.startsWith('ch')) v = 'č' + v.slice(2);
    else if (v.startsWith('sh')) v = 'š' + v.slice(2);
    else if (v.startsWith('r')) v = 'ž' + v.slice(1);
    else if (v.startsWith('j')) v = 'đž' + v.slice(1);
    else if (v.startsWith('q')) v = 'ć' + v.slice(1);
    else if (v.startsWith('x')) v = 's' + v.slice(1);
    else if (v.startsWith('c')) v = 'c' + v.slice(1);
    else if (v.startsWith('z')) v = 'z' + v.slice(1);

    // Finals & diphthongs
    v = v.replace(/ian$/, 'jen')
         .replace(/iang$/, 'jang')
         .replace(/ong$/, 'ung')
         .replace(/iong$/, 'jung')
         .replace(/ui$/, 'uej')
         .replace(/iu$/, 'iou')
         .replace(/ao$/, 'ao')
         .replace(/ou$/, 'ou')
         .replace(/ai$/, 'aj')
         .replace(/ei$/, 'ej');

    return v;
  }).join(' ');
}

/**
 * Intelligent emoji picker based on English/Chinese definitions.
 */
function pickEmojiForDefinition(char: string, defs: string[]): string {
  const combined = (char + ' ' + defs.join(' ')).toLowerCase();
  
  const map: [RegExp, string][] = [
    [/\b(tea|cha|green tea|black tea)\b/, '🍵'],
    [/\b(coffee|kafei)\b/, '☕'],
    [/\b(water|river|liquid|swim)\b/, '💧'],
    [/\b(fire|burn|flame|hot)\b/, '🔥'],
    [/\b(sun|day|solar|light)\b/, '☀️'],
    [/\b(moon|month|lunar)\b/, '🌙'],
    [/\b(dragon|loong)\b/, '🐉'],
    [/\b(cat|kitten)\b/, '🐱'],
    [/\b(dog|puppy)\b/, '🐶'],
    [/\b(horse)\b/, '🐴'],
    [/\b(bird)\b/, '🐦'],
    [/\b(fish)\b/, '🐟'],
    [/\b(tree|wood|forest)\b/, '🌳'],
    [/\b(mountain|hill)\b/, '⛰️'],
    [/\b(heart|mind|soul|feeling)\b/, '❤️'],
    [/\b(book|read|study|scripture)\b/, '📖'],
    [/\b(wisdom|wise|intelligence|sage|philosophy)\b/, '🧠'],
    [/\b(peace|tranquil|calm|quiet)\b/, '🕊️'],
    [/\b(love|affection|cherish)\b/, '💖'],
    [/\b(strength|power|force|muscle)\b/, '💪'],
    [/\b(friend|friendship|companion)\b/, '🤝'],
    [/\b(eat|food|meal|rice|dish)\b/, '🥢'],
    [/\b(walk|run|go|travel|journey)\b/, '🚶'],
    [/\b(sleep|rest|dream)\b/, '😴'],
    [/\b(work|job|labor|craft)\b/, '🔨'],
    [/\b(money|gold|wealth|rich)\b/, '💰'],
    [/\b(car|vehicle|drive)\b/, '🚗'],
    [/\b(music|song|sing|melody)\b/, '🎵'],
    [/\b(flower|blossom|bloom)\b/, '🌸'],
    [/\b(star|sky|heaven)\b/, '⭐'],
    [/\b(rain|storm|weather)\b/, '🌧️'],
    [/\b(snow|ice|cold|winter)\b/, '❄️'],
    [/\b(earth|land|soil|world)\b/, '🌍'],
    [/\b(doctor|medicine|heal|health)\b/, '🩺'],
    [/\b(time|clock|hour|minute)\b/, '⏳']
  ];

  for (const [pattern, emoji] of map) {
    if (pattern.test(combined)) {
      return emoji;
    }
  }

  return '🎴';
}

/**
 * Guesses part of speech category based on definitions.
 */
function guessCategory(defs: string[]): CcCedictWordEntry['category'] {
  const text = defs.join(' ').toLowerCase();
  if (/\b(to |verb|action)\b/.test(text)) return 'verb';
  if (/\b(adjective|status|quality|good|bad|big|small)\b/.test(text)) return 'adjective';
  if (/\b(pronoun|he|she|it|they|you|me|we)\b/.test(text)) return 'pronoun';
  if (/\b(particle|measure word|classifier)\b/.test(text)) return 'particle';
  if (defs.length > 0 && defs[0].includes(';')) return 'expression';
  return 'noun';
}

/**
 * Core CC-CEDICT lookup & search function.
 * Supports:
 * - Hanzi exact lookup (Simplified & Traditional)
 * - Hanzi substring search
 * - English reverse search (with exact match priority)
 * - Pinyin search
 */
export function queryCcCedict(queryStr: string, maxResults: number = 20): CcCedictWordEntry[] {
  if (!queryStr || !queryStr.trim()) return [];
  const cleanQ = queryStr.trim();
  const isChineseChar = /[\u4e00-\u9fa5]/.test(cleanQ);

  const results: CcCedictWordEntry[] = [];
  const seenChars = new Set<string>();

  // 1. Direct Simplified Lookup if Chinese characters provided
  if (isChineseChar) {
    try {
      const directSimp = (cedict as any).getBySimplified(cleanQ);
      if (directSimp) {
        for (const [pinyinKey, entries] of Object.entries(directSimp)) {
          for (const item of (entries as any[])) {
            if (item && item.simplified && !seenChars.has(item.simplified + item.pinyin)) {
              seenChars.add(item.simplified + item.pinyin);
              const pinyinAcc = pinyinNumberToAccented(item.pinyin);
              const vukPhon = pinyinToVuk(pinyinAcc);
              const engList = Array.isArray(item.english) ? item.english : [String(item.english)];
              const classifiers = (item.classifiers || []).map((c: any) => Array.isArray(c) ? c[1] || c[0] : String(c));

              results.push({
                id: `cedict-${Date.now()}-${results.length}`,
                char: item.simplified,
                charTraditional: item.traditional || item.simplified,
                pinyin: pinyinAcc,
                pinyinNumbered: item.pinyin,
                vuk: vukPhon,
                english: engList.join('; '),
                englishList: engList,
                classifiers,
                emoji: pickEmojiForDefinition(item.simplified, engList),
                category: guessCategory(engList),
                source: 'cc-cedict'
              });
            }
          }
        }
      }

      // Also check Traditional lookup
      const directTrad = (cedict as any).getByTraditional(cleanQ);
      if (directTrad) {
        for (const [pinyinKey, entries] of Object.entries(directTrad)) {
          for (const item of (entries as any[])) {
            if (item && item.simplified && !seenChars.has(item.simplified + item.pinyin)) {
              seenChars.add(item.simplified + item.pinyin);
              const pinyinAcc = pinyinNumberToAccented(item.pinyin);
              const vukPhon = pinyinToVuk(pinyinAcc);
              const engList = Array.isArray(item.english) ? item.english : [String(item.english)];
              const classifiers = (item.classifiers || []).map((c: any) => Array.isArray(c) ? c[1] || c[0] : String(c));

              results.push({
                id: `cedict-${Date.now()}-${results.length}`,
                char: item.simplified,
                charTraditional: item.traditional || item.simplified,
                pinyin: pinyinAcc,
                pinyinNumbered: item.pinyin,
                vuk: vukPhon,
                english: engList.join('; '),
                englishList: engList,
                classifiers,
                emoji: pickEmojiForDefinition(item.simplified, engList),
                category: guessCategory(engList),
                source: 'cc-cedict'
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('[CC-CEDICT Lookup Error]', e);
    }
  }

  // 2. Scan CC-CEDICT all array for English / Pinyin or Hanzi substring matches
  const allEntries: any[] = (cedict as any).data?.all || [];
  const lowerQ = cleanQ.toLowerCase();
  const wordRegex = new RegExp(`\\b${lowerQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

  const scoredMatches: { entry: any; score: number }[] = [];

  for (let i = 0; i < allEntries.length; i++) {
    const item = allEntries[i];
    // item structure: [traditional, simplified, pinyin, english, classifiers, variants]
    const trad = item[0] || '';
    const simp = item[1] || '';
    const pinyinRaw = item[2] || '';
    const eng = typeof item[3] === 'string' ? item[3] : Array.isArray(item[3]) ? item[3].join('; ') : '';

    if (seenChars.has(simp + pinyinRaw)) continue;

    let score = 0;

    if (isChineseChar) {
      if (simp === cleanQ || trad === cleanQ) {
        score = 100;
      } else if (simp.startsWith(cleanQ) || trad.startsWith(cleanQ)) {
        score = 80 - (simp.length - cleanQ.length) * 5;
      } else if (simp.includes(cleanQ) || trad.includes(cleanQ)) {
        score = 60 - simp.length * 2;
      }
    } else {
      // English or Pinyin search
      const engLower = eng.toLowerCase();
      const pinyinLower = pinyinRaw.toLowerCase();

      if (wordRegex.test(engLower)) {
        // Exact whole English word match (e.g. "dragon", "tea", "coffee")
        score = 90 - (simp.length - 1) * 8;
      } else if (pinyinLower === lowerQ || pinyinLower.replace(/\d/g, '') === lowerQ) {
        // Exact pinyin match
        score = 85;
      } else if (engLower.startsWith(lowerQ)) {
        score = 70;
      } else if (engLower.includes(lowerQ)) {
        score = 50;
      }
    }

    if (score > 0) {
      scoredMatches.push({ entry: item, score });
      if (scoredMatches.length > 300) {
        break; // Guard search cost
      }
    }
  }

  // Sort by score descending, then by shorter character length
  scoredMatches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.entry[1]?.length || 0) - (b.entry[1]?.length || 0);
  });

  for (const { entry } of scoredMatches) {
    if (results.length >= maxResults) break;
    const trad = entry[0] || '';
    const simp = entry[1] || '';
    const pinyinRaw = entry[2] || '';
    const engStr = typeof entry[3] === 'string' ? entry[3] : Array.isArray(entry[3]) ? entry[3].join('; ') : '';
    const engList = engStr.split('/').filter(Boolean);

    if (seenChars.has(simp + pinyinRaw)) continue;
    seenChars.add(simp + pinyinRaw);

    const pinyinAcc = pinyinNumberToAccented(pinyinRaw);
    const vukPhon = pinyinToVuk(pinyinAcc);

    results.push({
      id: `cedict-${Date.now()}-${results.length}`,
      char: simp,
      charTraditional: trad,
      pinyin: pinyinAcc,
      pinyinNumbered: pinyinRaw,
      vuk: vukPhon,
      english: engStr,
      englishList: engList,
      classifiers: (entry[4] || []).map((c: any) => Array.isArray(c) ? c[1] || c[0] : String(c)),
      emoji: pickEmojiForDefinition(simp, engList.length > 0 ? engList : [engStr]),
      category: guessCategory(engList.length > 0 ? engList : [engStr]),
      source: 'cc-cedict'
    });
  }

  return results;
}

/**
 * Returns diagnostic evaluation of all 4 API options mentioned by the user.
 */
export function getDictionarySourcesEvaluation(): {
  sources: ApiSourcesStatus[];
  summary: string;
  recommendation: string;
} {
  const sources: ApiSourcesStatus[] = [
    {
      id: 'cc-cedict',
      name: 'CC-CEDICT Project (Self-Hosted Node Engine)',
      url: 'https://cc-cedict.org/wiki/',
      type: 'self-hosted',
      status: 'active',
      description: 'Zvanična baza od 125,369+ unosa, ugrađena direktno u Node.js server (paket `cc-cedict`).',
      details: 'Pruža trenutnu pretragu po pojedinačnim karakterima, rečima, pinyinu i engleskim značenjima bez eksternih API poziva, bez rate limita i sa nultim kašnjenjem (0ms).'
    },
    {
      id: 'chinese-char-web-api',
      name: 'Chinese Character Web API',
      url: 'http://ccdb.hemiola.com/',
      type: 'rest-api',
      status: 'offline_error',
      description: 'Stariji Unihan REST API servis za karaktere i radikale.',
      details: 'Testiran na serveru: vraća HTTP 500 Internal Server Error (server više nije aktivan ili je trajno oboren).'
    },
    {
      id: 'mandarinspot',
      name: 'MandarinSpot API',
      url: 'https://mandarinspot.com/',
      type: 'client-script',
      status: 'not_suitable',
      description: 'Skripta za anotaciju HTML teksta i browser ekstenzija sa pop-up oblačićima.',
      details: 'Nije otvoren REST API za dodavanje i pretragu novih reči u bazi, već klijentski DOM parser (mandarinspot.js) koji dodaje ruby tagove preko postojećeg teksta na sajtu.'
    },
    {
      id: 'pons-dictionary',
      name: 'PONS Online Dictionary API',
      url: 'https://en.pons.com/p/online-dictionary/developers/api',
      type: 'commercial-api',
      status: 'requires_key',
      description: 'Komercijalni rečnik sa zvaničnim API ključevima.',
      details: 'Zahteva registraciju, odobrenje developerskog naloga i X-Secret zaglavlje, uz stroge limite poziva i komercijalne licence.'
    }
  ];

  return {
    sources,
    summary: 'Najbolje i najstabilnije rešenje je samostalno hostovani CC-CEDICT (125,369 unosa), koji u kombinaciji sa WiseFit AI jezičkim modelom omogućava neograničeno pretraživanje i dodavanje bilo koje kineske reči sa Vuk Karadžić fonetikom i srpskim prevodom.',
    recommendation: 'Koristimo CC-CEDICT kao primarni offline/instant leksikon, a Gemini 2.5 AI kao inteligentni generator za srpsku lokalizaciju, emodžije i mudre stoic izreke.'
  };
}
