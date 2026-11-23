import { HEBREW_VOCAB_EXPANDED } from '../data/hebrewVocabData';

export interface OnlineHebrewDictEntry {
  id: string;
  char: string; // Vocalized Hebrew (with Nikud if available)
  charPlain: string; // Unvocalized Hebrew
  transliteration: string;
  vuk: string;
  english: string;
  englishList: string[];
  serbian?: string;
  root?: string;
  morphology?: string;
  lexicon: string; // e.g., "Klein Dictionary (Sefaria)", "BDB Augmented Strong", "Wiktionary", "WiseFit Lexicon"
  emoji: string;
  category: 'mudrost' | 'svakodnevno' | 'priroda' | 'glagoli' | 'misaoni' | 'zdravlje' | 'posao_tehnologija' | 'hrana' | 'vreme_brojevi' | 'emocije';
  etymologyNote?: string;
  sourceUrl?: string;
}

export interface HebrewApiSourceStatus {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'secondary' | 'ai_fallback';
  description: string;
  details: string;
  url: string;
}

const stripHtml = (raw: string): string =>
  raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

export const stripHebrewNikud = (text: string): string =>
  text.replace(/[\u0591-\u05C7]/g, '').trim();

/**
 * Rule-based Hebrew Nikud -> Latin Transliteration & Serbian Vuk Phonetics
 */
export function hebrewToTransliteration(hebrew: string): { transliteration: string; vuk: string } {
  const consonants: Record<string, string> = {
    'א': '', 'ב': 'v', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
    'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'ch', 'ך': 'ch', 'ל': 'l', 'מ': 'm',
    'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': '', 'פ': 'f', 'ף': 'f',
    'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
  };
  const dageshConsonants: Record<string, string> = {
    'ב': 'b', 'כ': 'k', 'פ': 'p'
  };
  const vowels: Record<string, string> = {
    '\u05B0': 'e', // sheva
    '\u05B1': 'e', // hataf segol
    '\u05B2': 'a', // hataf patach
    '\u05B3': 'o', // hataf kamatz
    '\u05B4': 'i', // hiriq
    '\u05B5': 'e', // tsere
    '\u05B6': 'e', // segol
    '\u05B7': 'a', // patach
    '\u05B8': 'a', // kamatz
    '\u05B9': 'o', // holam
    '\u05BA': 'o', // holam haser
    '\u05BB': 'u', // qubuts
  };

  let out = '';
  const chars = Array.from(hebrew);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (c === ' ' || c === '-' || c === '־') {
      out += ' ';
      continue;
    }
    if (consonants[c] !== undefined) {
      let hasDagesh = false;
      let isSin = false;
      let vowel = '';
      let j = i + 1;
      while (j < chars.length && /[\u0591-\u05C7]/.test(chars[j])) {
        const mark = chars[j];
        if (mark === '\u05BC') hasDagesh = true;
        else if (mark === '\u05C2') isSin = true;
        else if (vowels[mark] !== undefined) vowel = vowels[mark];
        j++;
      }

      if (c === 'ו' && hasDagesh) {
        out += 'u';
      } else if (c === 'ו' && vowel === 'o') {
        out += 'o';
      } else if (c === 'ש') {
        out += (isSin ? 's' : 'sh') + vowel;
      } else if (hasDagesh && dageshConsonants[c]) {
        out += dageshConsonants[c] + vowel;
      } else {
        // Silent final ה
        const isLast = j >= chars.length || chars[j] === ' ';
        if (c === 'ה' && isLast && !vowel) {
          // omit trailing silent h
        } else {
          out += consonants[c] + vowel;
        }
      }
      i = j - 1;
    }
  }

  const cleaned = out.replace(/ee+/g, 'e').replace(/\s+/g, ' ').trim();
  const transliteration = cleaned
    ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    : hebrew;
  const vuk = cleaned
    .replace(/sh/g, 'š')
    .replace(/ch/g, 'h')
    .replace(/tz/g, 'c')
    .replace(/y/g, 'j')
    .toLowerCase();

  return { transliteration, vuk: vuk || transliteration.toLowerCase() };
}

function inferEmojiAndCategory(
  english: string,
  morphology?: string
): { emoji: string; category: OnlineHebrewDictEntry['category'] } {
  const lower = english.toLowerCase();
  const morph = (morphology || '').toLowerCase();

  if (morph.startsWith('v') || lower.startsWith('to ')) {
    return { emoji: '⚡', category: 'glagoli' };
  }
  if (/peace|wisdom|truth|soul|spirit|god|holy|bless|faith|justice|moral|torah|sabbath|prayer|ethics/.test(lower)) {
    return { emoji: '📜', category: 'mudrost' };
  }
  if (/love|joy|happy|sad|fear|anger|hope|heart|smile|cry|envy|pride|emotion/.test(lower)) {
    return { emoji: '💖', category: 'emocije' };
  }
  if (/bread|water|food|fruit|apple|pineapple|honey|wine|coffee|tea|meat|fish|soup|milk|salt|sugar|eat|cook|meal/.test(lower)) {
    return { emoji: '🍽️', category: 'hrana' };
  }
  if (/sun|moon|star|sea|ocean|mountain|tree|flower|forest|river|rain|snow|wind|fire|earth|sky|bird|lion|dog|cat|animal/.test(lower)) {
    return { emoji: '🌿', category: 'priroda' };
  }
  if (/body|head|eye|hand|foot|doctor|health|heal|medicine|sleep|run|swim|breath|muscle|blood|pain/.test(lower)) {
    return { emoji: '🩺', category: 'zdravlje' };
  }
  if (/time|day|night|morning|evening|year|month|week|hour|minute|number|one|two|three|seven|ten|hundred|first|now|always/.test(lower)) {
    return { emoji: '⏳', category: 'vreme_brojevi' };
  }
  if (/work|business|money|computer|phone|tech|network|software|project|leader|strategy|bank|salary|contract/.test(lower)) {
    return { emoji: '💼', category: 'posao_tehnologija' };
  }
  if (/thought|mind|know|understand|idea|reason|dream|goal|vision|memory|question|answer/.test(lower)) {
    return { emoji: '🧠', category: 'misaoni' };
  }
  return { emoji: '📖', category: 'svakodnevno' };
}

function collectSefariaSenses(senses: any[], acc: string[] = []): string[] {
  if (!Array.isArray(senses)) return acc;
  for (const s of senses) {
    if (s && typeof s.definition === 'string') {
      const clean = stripHtml(s.definition).replace(/^[0-9a-z]+\.\s*/i, '').trim();
      if (clean && !acc.includes(clean)) {
        acc.push(clean);
      }
    }
    if (s && Array.isArray(s.senses) && acc.length < 6) {
      collectSefariaSenses(s.senses, acc);
    }
    if (acc.length >= 6) break;
  }
  return acc;
}

function extractRootFromSefaria(entry: any): string | undefined {
  if (typeof entry?.notes === 'string') {
    const m = entry.notes.match(/Klein Dictionary,\s*([\u0590-\u05FF]{2,4})/i);
    if (m && m[1]) {
      return stripHebrewNikud(m[1]).split('').join('-');
    }
  }
  if (Array.isArray(entry?.refs)) {
    for (const r of entry.refs) {
      const m = String(r).match(/Klein Dictionary,\s*([\u0590-\u05FF]{2,4})\s/);
      if (m && m[1]) {
        const plain = stripHebrewNikud(m[1]);
        if (plain.length === 3) return plain.split('').join('-');
      }
    }
  }
  return undefined;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 5500): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WiseFitSanctuary/1.0 (Hebrew Lexicon Integration)',
        'Accept': 'application/json'
      }
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch vocalized definitions for a Hebrew word directly from Sefaria Lexicon API
 * (Klein Dictionary, BDB Augmented Strong, Jastrow Dictionary)
 */
export async function lookupSefariaHebrewWord(hebrewWord: string): Promise<OnlineHebrewDictEntry[]> {
  const cleanWord = stripHebrewNikud(hebrewWord);
  if (!cleanWord || !/[\u0590-\u05FF]/.test(cleanWord)) return [];

  const data = await fetchJsonWithTimeout(
    `https://www.sefaria.org/api/words/${encodeURIComponent(cleanWord)}`,
    5500
  );
  if (!Array.isArray(data) || data.length === 0) return [];

  const results: OnlineHebrewDictEntry[] = [];
  const seenKey = new Set<string>();

  for (const item of data.slice(0, 8)) {
    const hw = typeof item.headword === 'string' ? item.headword.trim() : '';
    if (!hw) continue;

    const lexicon = String(item.parent_lexicon || 'Sefaria Lexicon');
    const senses = collectSefariaSenses(item.content?.senses || []);
    if (senses.length === 0) continue;

    const dedupeKey = `${stripHebrewNikud(hw)}::${lexicon}`;
    if (seenKey.has(dedupeKey)) continue;
    seenKey.add(dedupeKey);

    const english = senses.slice(0, 3).join('; ');
    const morph = typeof item.content?.morphology === 'string' ? item.content.morphology : undefined;
    const root = extractRootFromSefaria(item);
    const { transliteration, vuk } = hebrewToTransliteration(hw);
    const { emoji, category } = inferEmojiAndCategory(english, morph);
    const etymologyNote = typeof item.notes === 'string' ? stripHtml(item.notes).slice(0, 180) : undefined;

    results.push({
      id: `sefaria-${stripHebrewNikud(hw)}-${results.length}`,
      char: hw,
      charPlain: stripHebrewNikud(hw),
      transliteration,
      vuk,
      english,
      englishList: senses,
      root,
      morphology: morph,
      lexicon: `${lexicon} (Sefaria Online)`,
      emoji,
      category,
      etymologyNote,
      sourceUrl: `https://www.sefaria.org/search?q=${encodeURIComponent(hw)}&tab=text`
    });
  }

  return results;
}

/**
 * Prefix completions from Sefaria (useful when user types partial Hebrew word)
 */
async function fetchSefariaCompletions(prefix: string): Promise<string[]> {
  const clean = stripHebrewNikud(prefix);
  if (!clean || clean.length < 2) return [];
  const data = await fetchJsonWithTimeout(
    `https://www.sefaria.org/api/words/completion/${encodeURIComponent(clean)}`,
    4000
  );
  if (!Array.isArray(data)) return [];
  return data
    .slice(0, 6)
    .map((pair: any) => (Array.isArray(pair) ? String(pair[0] || '') : ''))
    .filter(w => w && w !== clean && /[\u0590-\u05FF]/.test(w));
}

/**
 * Query English Wiktionary for Hebrew translations of an English word
 */
async function lookupHebrewViaWiktionary(englishQuery: string): Promise<string[]> {
  const q = englishQuery.trim().toLowerCase();
  if (!q || !/^[a-z\s'-]+$/i.test(q)) return [];

  // Fetch wikitext of the English word and extract {{t|he|...}} / {{t+|he|...}} Hebrew translation templates
  const url = `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(q)}&prop=wikitext&format=json`;
  const data = await fetchJsonWithTimeout(url, 5000);
  const wikitext: string = data?.parse?.wikitext?.['*'] || '';
  if (!wikitext) return [];

  const matches = new Set<string>();
  const regex = /\{\{t\+?\s*\|\s*he\s*\|\s*([^|}]+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(wikitext)) !== null) {
    const word = m[1].replace(/\[\[|\]\]/g, '').trim();
    if (word && /[\u0590-\u05FF]/.test(word) && word.length <= 28) {
      matches.add(word);
      if (matches.size >= 5) break;
    }
  }
  return Array.from(matches);
}

/**
 * Search local 600+ expanded Hebrew vocabulary index instantaneously
 */
function searchLocalHebrewIndex(query: string, limit: number): OnlineHebrewDictEntry[] {
  const q = query.trim().toLowerCase();
  const qNoNikud = stripHebrewNikud(query);
  if (!q) return [];

  const scored: Array<{ score: number; entry: OnlineHebrewDictEntry }> = [];

  for (const item of HEBREW_VOCAB_EXPANDED) {
    const plain = stripHebrewNikud(item.char);
    const trans = item.transliteration.toLowerCase();
    const vuk = item.vuk.toLowerCase();
    const sr = item.translation.toLowerCase();
    const en = item.english.toLowerCase();
    const root = (item.root || '').toLowerCase();

    let score = 0;
    if (plain === qNoNikud || item.char === query.trim()) score = 100;
    else if (en === q || sr === q || trans === q || vuk === q) score = 95;
    else if (en.split(/[\/,;]+/).some(p => p.trim() === q) || sr.split(/[\/,;]+/).some(p => p.trim() === q)) score = 90;
    else if (plain.startsWith(qNoNikud) && qNoNikud.length >= 2) score = 80;
    else if (trans.startsWith(q) || vuk.startsWith(q)) score = 75;
    else if (en.includes(q) || sr.includes(q) || root.includes(q)) score = 60;

    if (score > 0) {
      scored.push({
        score,
        entry: {
          id: `local-${item.id}`,
          char: item.char,
          charPlain: plain,
          transliteration: item.transliteration,
          vuk: item.vuk,
          english: item.english,
          englishList: item.english.split('/').map(s => s.trim()).filter(Boolean),
          serbian: item.translation,
          root: item.root,
          lexicon: 'WiseFit Hebrejski Leksikon',
          emoji: item.emoji || '📖',
          category: item.category === 'alphabet' ? 'svakodnevno' : item.category,
          etymologyNote: item.visualTip || undefined
        }
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry);
}

/**
 * Unified Hybrid Online Hebrew Dictionary Lookup
 * Combines:
 *  1. Live Sefaria Lexicon API (Klein Dictionary + BDB Augmented Strong + Jastrow)
 *  2. Live Wiktionary API (English -> Hebrew translation discovery)
 *  3. Built-in 600+ WiseFit Hebrew Lexicon (instant Serbian/English/Vuk matches)
 */
export async function queryOnlineHebrewDictionary(
  rawQuery: string,
  limit = 20
): Promise<{ results: OnlineHebrewDictEntry[]; usedSources: string[] }> {
  const query = rawQuery.trim();
  if (!query) return { results: [], usedSources: [] };

  const usedSources: string[] = [];
  const combined: OnlineHebrewDictEntry[] = [];
  const seenChars = new Set<string>();

  const pushUnique = (entry: OnlineHebrewDictEntry) => {
    const key = `${stripHebrewNikud(entry.char)}::${entry.lexicon.slice(0, 10)}`;
    if (!seenChars.has(key)) {
      seenChars.add(key);
      combined.push(entry);
    }
  };

  const isHebrewQuery = /[\u0590-\u05FF]/.test(query);

  // 1. Always search local high-frequency index first (0ms)
  const localMatches = searchLocalHebrewIndex(query, 8);

  if (isHebrewQuery) {
    // Live Sefaria exact lookup + prefix completions in parallel
    const [sefariaExact, completions] = await Promise.all([
      lookupSefariaHebrewWord(query),
      fetchSefariaCompletions(query)
    ]);

    if (sefariaExact.length > 0) {
      usedSources.push('Sefaria Klein & BDB Online');
      sefariaExact.forEach(pushUnique);
    }

    // Fetch up to 3 prefix completions from Sefaria if user typed a short stem
    if (completions.length > 0 && combined.length < limit) {
      const extraBatches = await Promise.all(
        completions.slice(0, 3).map(word => lookupSefariaHebrewWord(word))
      );
      for (const batch of extraBatches) {
        if (batch[0]) {
          if (!usedSources.includes('Sefaria Klein & BDB Online')) {
            usedSources.push('Sefaria Klein & BDB Online');
          }
          pushUnique(batch[0]);
        }
      }
    }

    // Add local matches that aren't already represented
    if (localMatches.length > 0) {
      usedSources.push('WiseFit Leksikon');
      localMatches.forEach(pushUnique);
    }
  } else {
    // English / Serbian / Transliteration query:
    // Start with Wiktionary live translation lookup + enrich local matches with Sefaria live data!
    const wiktionaryHebrewWords = await lookupHebrewViaWiktionary(query);

    const hebrewCandidatesToEnrich = new Set<string>();
    wiktionaryHebrewWords.forEach(w => hebrewCandidatesToEnrich.add(w));
    localMatches.slice(0, 2).forEach(m => hebrewCandidatesToEnrich.add(m.char));

    if (wiktionaryHebrewWords.length > 0) {
      usedSources.push('Wiktionary Online');
    }

    // Enrich top Hebrew candidates via live Sefaria Klein/BDB Lexicon API
    const sefariaBatches = await Promise.all(
      Array.from(hebrewCandidatesToEnrich)
        .slice(0, 4)
        .map(hw => lookupSefariaHebrewWord(hw))
    );

    // Push local exact matches first (they already have Serbian translations!)
    if (localMatches.length > 0) {
      usedSources.push('WiseFit Leksikon');
      localMatches.forEach(pushUnique);
    }

    // Push live Sefaria Klein/BDB entries
    for (const batch of sefariaBatches) {
      for (const entry of batch.slice(0, 2)) {
        if (!usedSources.includes('Sefaria Klein & BDB Online')) {
          usedSources.push('Sefaria Klein & BDB Online');
        }
        pushUnique(entry);
      }
    }

    // If Wiktionary found Hebrew words that Sefaria didn't have (e.g. modern loanwords like אננס), include them directly!
    for (const hw of wiktionaryHebrewWords) {
      const plain = stripHebrewNikud(hw);
      const alreadyPresent = combined.some(c => c.charPlain === plain);
      if (!alreadyPresent) {
        const { transliteration, vuk } = hebrewToTransliteration(hw);
        const { emoji, category } = inferEmojiAndCategory(query);
        pushUnique({
          id: `wikt-${plain}`,
          char: hw,
          charPlain: plain,
          transliteration,
          vuk,
          english: query,
          englishList: [query],
          lexicon: 'Wiktionary Hebrew Online',
          emoji,
          category,
          sourceUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(plain)}#Hebrew`
        });
      }
    }
  }

  return {
    results: combined.slice(0, limit),
    usedSources
  };
}

export function getHebrewDictionarySourcesEvaluation() {
  const sources: HebrewApiSourceStatus[] = [
    {
      id: 'sefaria-klein-bdb',
      name: 'Sefaria Lexicon API (Klein Dictionary + BDB + Jastrow)',
      type: 'Live REST API',
      status: 'active',
      description: 'Najbogatiji otvoreni hebrejski etimološki i biblijsko-savremeni rečnik na svetu sa punim Nikud vokalima i korenima (Šoreš).',
      details: 'Direktna live integracija: /api/words/{word} i /api/words/completion/{prefix}. Obuhvata 50,000+ vokalizovanih hebrejskih odrednica, troslovne korene (שורש), morfologiju i klasične definicije.',
      url: 'https://www.sefaria.org/texts/Reference/Dictionaries'
    },
    {
      id: 'wiktionary-hebrew',
      name: 'Wiktionary Hebrew & Multilingual API',
      type: 'Live MediaWiki API',
      status: 'active',
      description: 'Otvoreni višejezični leksikon za pretragu savremenih hebrejskih reči sa engleskog (npr. pineapple -> אֲנָנָס, freedom -> חֹפֶשׁ).',
      details: 'Automatski pronalazi hebrejske ekvivalente za engleske pojmove i prosleđuje ih Sefaria Klein rečniku radi dubljih definicija i korena.',
      url: 'https://en.wiktionary.org/wiki/Category:Hebrew_language'
    },
    {
      id: 'wisefit-hebrew-vault',
      name: 'WiseFit Hebrejska Riznica (600+ Frekventnih Reči)',
      type: 'Local 0ms Index',
      status: 'active',
      description: 'Ugrađeni brzi leksikon sa srpskim/hrvatskim prevodima, Vuk fonetskom transkripcijom, šoreš korenima i 130+ jevrejskih poslovica.',
      details: 'Trenutna pretraga (0ms) na srpskom, engleskom, transliteraciji ili hebrejskom pismu — radi i bez interneta.',
      url: 'https://www.pealim.com'
    },
    {
      id: 'gemini-hebrew-enricher',
      name: 'WiseFit AI Hebrejski Leksikograf (Nikud + Srpski + Poslovice)',
      type: 'AI Enrichment & Lookup',
      status: 'ai_fallback',
      description: 'Obogaćuje svaku reč iz online rečnika preciznim srpskim prevodom, Vuk čitanjem, mnemonikom i autentičnom jevrejskom poslovicom.',
      details: 'Automatski dopunjuje retke ili srpske upite kada ih spoljni engleski rečnici nemaju i jednim klikom priprema karticu za Flashcards i Izazov Znanja.',
      url: 'https://www.sefaria.org'
    }
  ];

  return {
    summary: 'WiseFit kombinuje live Sefaria Lexicon API (Klein Dictionary, BDB Augmented Strong, Jastrow), Wiktionary Hebrew API i lokalni fond od 600+ najčešćih reči sa AI obogaćivanjem na srpskom jeziku.',
    recommendation: 'Pretražite bilo koju hebrejsku reč (npr. שָׁלוֹם, חָכְמָה, אֲנָנָס), engleski pojam (freedom, lion, coffee) ili srpsku reč (sloboda, lav, kafa) i kliknite „Obogati sa AI & Dodaj“ za trajno čuvanje u Vaš rečnik i Izazov Znanja!',
    sources
  };
}
