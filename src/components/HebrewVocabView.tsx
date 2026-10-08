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
  Sliders,
  Bot,
  Send,
  Loader2,
  BookmarkPlus,
  History,
  Languages,
  HeartHandshake,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { HEBREW_VOCAB_EXPANDED, HebrewVocabItem, getHebrewQuoteForItem } from '../data/hebrewVocabData';
import { HebrewFlashcardsGame } from './HebrewFlashcardsGame';

export type { HebrewVocabItem };

export interface HebrewAlphabetItem {
  id: string;
  char: string;
  name: string;
  vuk: string;
  english: string;
  gematria: number;
  exampleWord: string;
  exampleTranslationSr: string;
  exampleTranslationEn: string;
  isFinal?: boolean;
}

export interface AiConfigWordItem {
  hebrew: string;
  hebrewClean?: string;
  transliteration: string;
  vuk: string;
  english: string;
  serbian: string;
  emoji: string;
  category?: string;
}

export interface AiConfiguredHebrewResult {
  hebrewWithEmojis: string;
  hebrew: string;
  hebrewClean: string;
  transliteration: string;
  vukPhonetic: string;
  serbian: string;
  english: string;
  emojis: string[];
  words: AiConfigWordItem[];
  grammarNote?: string;
}

export interface HebrewSolidarityQuote {
  id: string;
  category: 'solidarity' | 'strength' | 'peace' | 'short';
  categoryLabel: string;
  categoryEmoji: string;
  english: string;
  hebrew: string;
  hebrewClean: string;
  hebrewWithEmojis: string;
  vukPhonetic: string;
  transliteration: string;
  serbian: string;
  emojis: string[];
  words: AiConfigWordItem[];
  grammarNote: string;
}

export const HEBREW_SOLIDARITY_QUOTES: HebrewSolidarityQuote[] = [
  // 1. General Solidarity & Letting Them Know They Aren't Alone
  {
    id: 'sol-1',
    category: 'solidarity',
    categoryLabel: 'Solidarnost & Prijateljstvo',
    categoryEmoji: '🤝',
    english: "Just a reminder that you have friends all over the world. We see you, we care about you, and you are never alone.",
    hebrew: "רַק תִּזְכֹּרֶת שֶׁיֵּשׁ לָכֶם חֲבֵרִים בְּכָל הָעוֹלָם. אֲנַחְנוּ רוֹאִים אֶתְכֶם, אִכְפַּת לָנוּ מִכֶּם, וְאַתֶּם לְעוֹלָם לֹא לְבַד.",
    hebrewClean: "רק תזכורת שיש לכם חברים בכל העולם. אנחנו רואים אתכם, אכפת לנו מכם, ואתם לעולם לא לבד.",
    hebrewWithEmojis: "רַק תִּזְכֹּרֶת שֶׁיֵּשׁ לָכֶם חֲבֵרִים בְּכָל הָעוֹלָם. אֲנַחְנוּ רוֹאִים אֶתְכֶם, אִכְפַּת לָנוּ מִכֶּם, וְאַתֶּם לְעוֹלָם לֹא לְבַד. 🌍🤝❤️",
    vukPhonetic: "Rak tizkoret še-ješ lahem haverim be-hol ha-olam. Anahnu roim ethem, ihpat lanu mihem, ve-atem le-olam lo levad.",
    transliteration: "Rak tizkoret she-yesh lachem chaverim be-khol ha-olam. Anachnu ro'im etchem, ikhpat lanu mikhem, ve-atem le'olam lo levad.",
    serbian: "Samo podsetnik da imate prijatelje širom sveta. Vidimo vas, brinemo o vama, i nikada niste sami.",
    emojis: ["🌍", "🤝", "❤️"],
    words: [
      { hebrew: "תִּזְכֹּרֶת", hebrewClean: "תזכורת", transliteration: "tizkoret", vuk: "tizkoret", english: "reminder", serbian: "podsetnik", emoji: "📝", category: "noun" },
      { hebrew: "חֲבֵרִים", hebrewClean: "חברים", transliteration: "chaverim", vuk: "haverim", english: "friends", serbian: "prijatelji", emoji: "🤝", category: "noun" },
      { hebrew: "עוֹלָם", hebrewClean: "עולם", transliteration: "olam", vuk: "olam", english: "world", serbian: "svet", emoji: "🌍", category: "noun" },
      { hebrew: "רוֹאִים", hebrewClean: "רואים", transliteration: "ro'im", vuk: "roim", english: "see", serbian: "vidimo", emoji: "👀", category: "verb" },
      { hebrew: "לֹא לְבַד", hebrewClean: "לא לבד", transliteration: "lo levad", vuk: "lo levad", english: "not alone", serbian: "niste sami", emoji: "❤️", category: "expression" }
    ],
    grammarNote: "Reč 'chaverim' (חֲבֵרִים) potiče od drevnog korena ח-ב-ר koji označava spajanje, zajedništvo i pravo prijateljstvo."
  },
  {
    id: 'sol-2',
    category: 'solidarity',
    categoryLabel: 'Solidarnost & Prijateljstvo',
    categoryEmoji: '🤝',
    english: "No matter the distance, please know we stand with you in unwavering solidarity and love.",
    hebrew: "לֹא מְשַׁנֶּה הַמֶּרְחָק, דְּעוּ שֶׁאָנוּ עוֹמְדִים לְצִדְּכֶם בְּסוֹלִידָרִיּוּת לְלֹא עַרְעוּר וּבְאַהֲבָה.",
    hebrewClean: "לא משנה המרחק, דעו שאנו עומדים לצדכם בסולידריות ללא ערעור ובאהבה.",
    hebrewWithEmojis: "לֹא מְשַׁנֶּה הַמֶּרְחָק, דְּעוּ שֶׁאָנוּ עוֹמְדִים לְצִדְּכֶם בְּסוֹלִידָרִיּוּת לְלֹא עַרְעוּר וּבְאַהֲבָה. 🌐💪💖",
    vukPhonetic: "Lo mešane ha-merhak, deu še-anu omdim le-cidhem be-solidarijut lelo arur uve-ahava.",
    transliteration: "Lo mechangeh ha-merchak, de'u she-anu omdim le-tzidkhem be-solidariyut lelo ar'ur uve-ahavah.",
    serbian: "Bez obzira na udaljenost, molimo vas znajte da stojimo uz vas u nepokolebljivoj solidarnosti i ljubavi.",
    emojis: ["🌐", "💪", "💖"],
    words: [
      { hebrew: "מֶרְחָק", hebrewClean: "מרחק", transliteration: "merchak", vuk: "merhak", english: "distance", serbian: "udaljenost", emoji: "🌐", category: "noun" },
      { hebrew: "עוֹמְדִים", hebrewClean: "עומדים", transliteration: "omdim", vuk: "omdim", english: "standing (with you)", serbian: "stojimo uz vas", emoji: "🤝", category: "verb" },
      { hebrew: "סוֹלִידָרִיּוּת", hebrewClean: "סולידריות", transliteration: "solidariyut", vuk: "solidarijut", english: "solidarity", serbian: "solidarnost", emoji: "💪", category: "noun" },
      { hebrew: "אַהֲבָה", hebrewClean: "אהבה", transliteration: "ahavah", vuk: "ahava", english: "love", serbian: "ljubav", emoji: "💖", category: "noun" }
    ],
    grammarNote: "Fraza 'omdim le-tzidkhem' (עוֹמְדִים לְצִדְּכֶם) doslovno znači stajati uz vaš bok, rame uz rame u teškim vremenima."
  },
  {
    id: 'sol-3',
    category: 'solidarity',
    categoryLabel: 'Solidarnost & Prijateljstvo',
    categoryEmoji: '🤝',
    english: "Thinking of you and your family today. People around the globe are holding you in their hearts.",
    hebrew: "חוֹשְׁבִים עָלֶיךָ וְעַל מִשְׁפַּחְתְּךָ הַיּוֹם. אֲנָשִׁים בְּכָל רַחֲבֵי הָעוֹלָם מַחֲזִיקִים אֶתְכֶם בְּלִבָּם.",
    hebrewClean: "חושבים עליך ועל משפחתך היום. אנשים בכל רחבי העולם מחזיקים אתכם בלבם.",
    hebrewWithEmojis: "חוֹשְׁבִים עָלֶיךָ וְעַל מִשְׁפַּחְתְּךָ הַיּוֹם. אֲנָשִׁים בְּכָל רַחֲבֵי הָעוֹלָם מַחֲזִיקִים אֶתְכֶם בְּלִבָּם. 👨‍👩‍👧‍👦🌎🕊️",
    vukPhonetic: "Hošvim aleha ve-al mišpahteka ha-jom. Anašim be-hol rahavei ha-olam mahzikim ethem be-libam.",
    transliteration: "Choshvim alekha ve-al mishpachtekha ha-yom. Anashim be-khol rachavei ha-olam machzikim etchem be-libam.",
    serbian: "Mislimo na tebe i tvoju porodicu danas. Ljudi širom sveta vas nose u svojim srcima.",
    emojis: ["👨‍👩‍👧‍👦", "🌎", "🕊️"],
    words: [
      { hebrew: "מִשְׁפָּחָה", hebrewClean: "משפחה", transliteration: "mishpacha", vuk: "mišpaha", english: "family", serbian: "porodica", emoji: "👨‍👩‍👧‍👦", category: "noun" },
      { hebrew: "הַיּוֹם", hebrewClean: "היום", transliteration: "ha-yom", vuk: "ha-jom", english: "today", serbian: "danas", emoji: "☀️", category: "noun" },
      { hebrew: "מַחֲזִיקִים", hebrewClean: "מחזיקים", transliteration: "machzikim", vuk: "mahzikim", english: "holding / keeping", serbian: "čuvaju / drže", emoji: "🤲", category: "verb" },
      { hebrew: "לֵב", hebrewClean: "לב", transliteration: "lev", vuk: "lev", english: "heart", serbian: "srce", emoji: "❤️", category: "noun" }
    ],
    grammarNote: "Izraz 'machzikim be-libam' (מַחֲזִיקִים בְּלִבָּם) prenosi brižnost i toplinu ljudskog srca."
  },
  {
    id: 'sol-4',
    category: 'solidarity',
    categoryLabel: 'Solidarnost & Prijateljstvo',
    categoryEmoji: '🤝',
    english: "You don't have to carry the heavy days alone. We are sending you so much support and warmth from afar.",
    hebrew: "אַתֶּם לֹא צְרִיכִים לָשֵׂאת אֶת הַיָּמִים הַקָּשִׁים לְבַד. אָנוּ שׁוֹלְחִים לָכֶם תְּמִיכָה וְחֹם מֵרָחוֹק.",
    hebrewClean: "אתם לא צריכים לשאת את הימים הקשים לבד. אנו שולחים לכם תמיכה וחם מרחוק.",
    hebrewWithEmojis: "אַתֶּם לֹא צְרִיכִים לָשֵׂאת אֶת הַיָּמִים הַקָּשִׁים לְבַד. אָנוּ שׁוֹלְחִים לָכֶם תְּמִיכָה וְחֹם מֵרָחוֹק. 🫂☀️🛡️",
    vukPhonetic: "Atem lo crihim laset et ha-jamim ha-kašim levad. Anu šolhim lahem tmiha ve-hom me-rahok.",
    transliteration: "Atem lo tzrichim laset et ha-yamim ha-kashim levad. Anu sholchim lachem tmichah ve-chom me-rachok.",
    serbian: "Ne morate sami nositi teške dane. Šaljemo vam toliko podrške i topline iz daljine.",
    emojis: ["🫂", "☀️", "🛡️"],
    words: [
      { hebrew: "לָשֵׂאת", hebrewClean: "לשאת", transliteration: "laset", vuk: "laset", english: "to carry / bear", serbian: "nositi", emoji: "🎒", category: "verb" },
      { hebrew: "קָשִׁים", hebrewClean: "קשים", transliteration: "kashim", vuk: "kašim", english: "difficult / heavy", serbian: "teški", emoji: "⛰️", category: "adjective" },
      { hebrew: "תְּמִיכָה", hebrewClean: "תמיכה", transliteration: "tmichah", vuk: "tmiha", english: "support", serbian: "podrška", emoji: "🛡️", category: "noun" },
      { hebrew: "חֹם", hebrewClean: "חום", transliteration: "chom", vuk: "hom", english: "warmth", serbian: "toplina", emoji: "☀️", category: "noun" }
    ],
    grammarNote: "Reč 'tmichah' (תְּמִיכָה) znači oslonac, temelj i ruka podrške."
  },

  // 2. Acknowledging Their Strength & Resilience
  {
    id: 'sol-5',
    category: 'strength',
    categoryLabel: 'Snaga & Otpornost',
    categoryEmoji: '🦁',
    english: "The strength and resilience of the Israeli people never cease to inspire me. Sending you so much love and support.",
    hebrew: "הַכֹּחַ וְהַחֹסֶן שֶׁל עַם יִשְׂרָאֵל לְעוֹלָם אֵינָם מַפְסִיקִים לְהַשְׁרִיף בִּי הַשְׁרָאָה. שׁוֹלֵחַ לָכֶם כָּל כָּךְ הַרְבֵּה אַהֲבָה וּתְמִיכָה.",
    hebrewClean: "הכוח והחוסן של עם ישראל לעולם אינם מפסיקים להשריף בי השראה. שולח לכם כל כך הרבה אהבה ותמיכה.",
    hebrewWithEmojis: "הַכֹּחַ וְהַחֹסֶן שֶׁל עַם יִשְׂרָאֵל לְעוֹלָם אֵינָם מַפְסִיקִים לְהַשְׁרִיף בִּי הַשְׁרָאָה. שׁוֹלֵחַ לָכֶם כָּל כָּךְ הַרְבֵּה אַהֲבָה וּתְמִיכָה. 🦁🇮🇱💪",
    vukPhonetic: "Ha-koah ve-ha-hosen šel am Jisrael le-olam ejnam mafsikim lehašrif bi hašra'a. Šoleah lahem kol kah harbe ahava u-tmiha.",
    transliteration: "Ha-koach ve-ha-chosen shel am Yisrael le'olam einam mafsikim lehashrif bi hashra'ah. Shole'ach lachem kol kakh harbeh ahavah u-tmichah.",
    serbian: "Snaga i otpornost izraelskog naroda nikada ne prestaju da me inspirišu. Šaljem vam pregršt ljubavi i podrške.",
    emojis: ["🦁", "🇮🇱", "💪"],
    words: [
      { hebrew: "כֹּחַ", hebrewClean: "כוח", transliteration: "koach", vuk: "koah", english: "strength", serbian: "snaga", emoji: "💪", category: "noun" },
      { hebrew: "חֹסֶן", hebrewClean: "חוסן", transliteration: "chosen", vuk: "hosen", english: "resilience / fortitude", serbian: "otpornost", emoji: "🦁", category: "noun" },
      { hebrew: "עַם יִשְׂרָאֵל", hebrewClean: "עם ישראל", transliteration: "am Yisrael", vuk: "am Jisrael", english: "people of Israel", serbian: "narod Izraela", emoji: "🇮🇱", category: "noun" },
      { hebrew: "הַשְׁרָאָה", hebrewClean: "השראה", transliteration: "hashra'ah", vuk: "hašra'a", english: "inspiration", serbian: "inspiracija", emoji: "✨", category: "noun" }
    ],
    grammarNote: "Reč 'chosen' (חֹסֶן) u jevrejskoj filozofiji označava unutrašnju psihološku i duhovnu nesalomivost."
  },
  {
    id: 'sol-6',
    category: 'strength',
    categoryLabel: 'Snaga & Otpornost',
    categoryEmoji: '🦁',
    english: "Your courage in difficult times is incredible, but you shouldn't have to be strong all the time. We are standing right here with you.",
    hebrew: "הָאֹמֶץ שֶׁלָּכֶם בִּזְמַנִּים קָשִׁים הוּא מַדְהִים, אַךְ אֵינְכֶם חַיָּבִים לִהְיוֹת חֲזָקִים כָּל הַזְּמַן. אָנוּ עוֹמְדִים כָּאן לְצִדְּכֶם.",
    hebrewClean: "האומץ שלכם בזמנים קשים הוא מדהים, אך אינכם חייבים להיות חזקים כל הזמן. אנו עומדים כאן לצדכם.",
    hebrewWithEmojis: "הָאֹמֶץ שֶׁלָּכֶם בִּזְמַנִּים קָשִׁים הוּא מַדְהִים, אַךְ אֵינְכֶם חַיָּבִים לִהְיוֹת חֲזָקִים כָּל הַזְּמַן. אָנוּ עוֹמְדִים כָּאן לְצִדְּכֶם. 🛡️🤍🤝",
    vukPhonetic: "Ha-omec šelahem bizmanim kašim hu madhim, ah ejnhem hajavim lihjot hazakim kol ha-zman. Anu omdim kan le-cidhem.",
    transliteration: "Ha-ometz shelakhem bizmanim kashim hu madhim, akh einkhem chayavim lihyot chazakim kol ha-zman. Anu omdim kan le-tzidkhem.",
    serbian: "Vaša hrabrost u teškim trenucima je neverovatna, ali ne morate uvek biti jaki. Stojimo upravo ovde uz vas.",
    emojis: ["🛡️", "🤍", "🤝"],
    words: [
      { hebrew: "אֹמֶץ", hebrewClean: "אומץ", transliteration: "ometz", vuk: "omec", english: "courage", serbian: "hrabrost", emoji: "🦁", category: "noun" },
      { hebrew: "חֲזָקִים", hebrewClean: "חזקים", transliteration: "chazakim", vuk: "hazakim", english: "strong (plural)", serbian: "jaki", emoji: "💪", category: "adjective" },
      { hebrew: "כָּאן", hebrewClean: "כאן", transliteration: "kan", vuk: "kan", english: "here", serbian: "ovde", emoji: "📍", category: "adverb" }
    ],
    grammarNote: "Reč 'ometz' (אֹמֶץ) je drevna vrlina hrabrosti koja se pominje u blagoslovu 'Chazak ve'ematz' (Budi jak i odvažan)."
  },
  {
    id: 'sol-7',
    category: 'strength',
    categoryLabel: 'Snaga & Otpornost',
    categoryEmoji: '🦁',
    english: "Through every challenge, your spirit shines bright. Sending you strength and a reminder that the world is cheering you on.",
    hebrew: "בְּכָל אֶתְגָּר, רוּחֲכֶם זוֹהֶרֶת בְּבֵהִירוּת. שׁוֹלֵחַ לָכֶם כֹּחַ וְתִזְכֹּרֶת שֶׁהָעוֹלָם מְעוֹדֵד אֶתְכֶם.",
    hebrewClean: "בכל אתגר, רוחכם זוהרת בבהירות. שולח לכם כוח ותזכורת שהעולם מעודד אתכם.",
    hebrewWithEmojis: "בְּכָל אֶתְגָּר, רוּחֲכֶם זוֹהֶרֶת בְּבֵהִירוּת. שׁוֹלֵחַ לָכֶם כֹּחַ וְתִזְכֹּרֶת שֶׁהָעוֹלָם מְעוֹדֵד אֶתְכֶם. ✨🔥🌟",
    vukPhonetic: "Be-hol etgar, ruhakhem zoheret be-vehijrut. Šoleah lahem koah ve-tizkoret še-ha-olam me'oded ethem.",
    transliteration: "Be-khol etgar, ruchakhem zoheret be-vehirut. Shole'ach lachem koach ve-tizkoret she-ha-olam me'oded etchem.",
    serbian: "Kroz svaki izazov, vaš duh blista snažno. Šaljem vam snagu i podsetnik da vas ceo svet bodri.",
    emojis: ["✨", "🔥", "🌟"],
    words: [
      { hebrew: "אֶתְגָּר", hebrewClean: "אתגר", transliteration: "etgar", vuk: "etgar", english: "challenge", serbian: "izazov", emoji: "🧗", category: "noun" },
      { hebrew: "רוּחַ", hebrewClean: "רוח", transliteration: "ruach", vuk: "ruah", english: "spirit / breath", serbian: "duh", emoji: "✨", category: "noun" },
      { hebrew: "זוֹהֶרֶת", hebrewClean: "זוהרת", transliteration: "zoheret", vuk: "zoheret", english: "shines / radiant", serbian: "blista", emoji: "🌟", category: "verb" },
      { hebrew: "מְעוֹדֵד", hebrewClean: "מעודד", transliteration: "me'oded", vuk: "me'oded", english: "cheers on / encourages", serbian: "bodri", emoji: "📣", category: "verb" }
    ],
    grammarNote: "Koren זו-ה-ר (Z-H-R) znači sijati i blistati, i od njega potiče i naziv mistične knjige 'Zohar'."
  },

  // 3. Focusing on Peace, Safety, & Hope
  {
    id: 'sol-8',
    category: 'peace',
    categoryLabel: 'Mir, Bezbednost & Nada',
    categoryEmoji: '🕊️',
    english: "Praying for peace, safety, and brighter days ahead for you and all of Israel.",
    hebrew: "מִתְפַּלֵּל לְשָׁלוֹם, לְבִטָּחוֹן וּלְיָמִים בְּהִירִים יוֹתֵר עֲבוּרְךָ וַעֲבוּר כָּל יִשְׂרָאֵל.",
    hebrewClean: "מתפלל לשלום, לביטחון ולימים בהירים יותר עבורך ועבור כל ישראל.",
    hebrewWithEmojis: "מִתְפַּלֵּל לְשָׁלוֹם, לְבִטָּחוֹן וּלְיָמִים בְּהִירִים יוֹתֵר עֲבוּרְךָ וַעֲבוּר כָּל יִשְׂרָאֵל. 🕊️🙏🇮🇱",
    vukPhonetic: "Mitpalel le-šalom, le-vitahon u-lejamim behirim joter avurha ve-avur kol Jisrael.",
    transliteration: "Mitpalel le-shalom, le-vitachon u-leyamim behirim yoter avurkha ve-avur kol Yisrael.",
    serbian: "Molim se za mir, bezbednost i vedrije dane pred vama i celim Izraelom.",
    emojis: ["🕊️", "🙏", "🇮🇱"],
    words: [
      { hebrew: "מִתְפַּלֵּל", hebrewClean: "מתפלל", transliteration: "mitpalel", vuk: "mitpalel", english: "praying", serbian: "molim se", emoji: "🙏", category: "verb" },
      { hebrew: "שָׁלוֹם", hebrewClean: "שלום", transliteration: "shalom", vuk: "šalom", english: "peace", serbian: "mir", emoji: "🕊️", category: "noun" },
      { hebrew: "בִּטָּחוֹן", hebrewClean: "ביטחון", transliteration: "bitachon", vuk: "bitahon", english: "security / safety", serbian: "bezbednost", emoji: "🛡️", category: "noun" },
      { hebrew: "יִשְׂרָאֵל", hebrewClean: "ישראל", transliteration: "Yisrael", vuk: "Jisrael", english: "Israel", serbian: "Izrael", emoji: "🇮🇱", category: "noun" }
    ],
    grammarNote: "'Kol Yisrael' (כָּל יִשְׂרָאֵל) je drevni izraz zajedništva: 'Kol Yisrael arevim zeh bazeh' (Svi u Izraelu su odgovorni jedni za druge)."
  },
  {
    id: 'sol-9',
    category: 'peace',
    categoryLabel: 'Mir, Bezbednost & Nada',
    categoryEmoji: '🕊️',
    english: "Wishing you and your loved ones quiet, peaceful days. We are keeping you in our thoughts always.",
    hebrew: "מְאַחֵל לְךָ וְלִירֵיקֶיךָ יָמִים שְׁקֵטִים וּשְׁלֵוִים. אַתֶּם תָּמִיד בְּמַחְשְׁבוֹתֵינוּ.",
    hebrewClean: "מאחל לך וליקיריך ימים שקטים ושלוים. אתם תמיד במחשבותינו.",
    hebrewWithEmojis: "מְאַחֵל לְךָ וְלִירֵיקֶיךָ יָמִים שְׁקֵטִים וּשְׁלֵוִים. אַתֶּם תָּמִיד בְּמַחְשְׁבוֹתֵינוּ. 🌿🕯️🤍",
    vukPhonetic: "Me'ahel leha u-li-jarejheka jamim šketim u-šlevim. Atem tamid be-mahševotejnu.",
    transliteration: "Me'achel lekha u-li-yakeirekha yamim shketim u-shlevim. Atem tamid be-machshevoteinu.",
    serbian: "Želim tebi i tvojim najmilijima mirne i tihe dane. Uvek ste u našim mislima.",
    emojis: ["🌿", "🕯️", "🤍"],
    words: [
      { hebrew: "מְאַחֵל", hebrewClean: "מאחל", transliteration: "me'achel", vuk: "me'ahel", english: "wishing", serbian: "želim", emoji: "💌", category: "verb" },
      { hebrew: "שְׁקֵטִים", hebrewClean: "שקטים", transliteration: "shketim", vuk: "šketim", english: "quiet", serbian: "tihi", emoji: "🤫", category: "adjective" },
      { hebrew: "שְׁלֵוִים", hebrewClean: "שלוים", transliteration: "shlevim", vuk: "šlevim", english: "serene / tranquil", serbian: "spokojni", emoji: "🌿", category: "adjective" }
    ],
    grammarNote: "Pridev 'shalev' (שָׁלֵו) označava potpunu unutrašnju harmoniju i bezbrižnost."
  },
  {
    id: 'sol-10',
    category: 'peace',
    categoryLabel: 'Mir, Bezbednost & Nada',
    categoryEmoji: '🕊️',
    english: "May safety and peace surround you soon. Until then, know that there is a global community wishing you well.",
    hebrew: "שֶׁבִּטָּחוֹן וְשָׁלוֹם יַקִּיפוּ אֶתְכֶם בִּמְהֵרָה. עַד אָז, דְּעוּ שֶׁיֵּשׁ קְהִלָּה עוֹלָמִית שֶׁמְּאַחֶלֶת לָכֶם רַק טוֹב.",
    hebrewClean: "שביטחון ושלום יקיפו אתכם במהרה. עד אז, דעו שיש קהילה עולמית שמחלת לכם רק טוב.",
    hebrewWithEmojis: "שֶׁבִּטָּחוֹן וְשָׁלוֹם יַקִּיפוּ אֶתְכֶם בִּמְהֵרָה. עַד אָז, דְּעוּ שֶׁיֵּשׁ קְהִלָּה עוֹלָמִית שֶׁמְּאַחֶלֶת לָכֶם רַק טוֹב. 🕊️🛡️🌍",
    vukPhonetic: "Še-bitahon ve-šalom jakifu ethem bimhera. Ad az, deu še-ješ kehila olamit še-me'ahelet lahem rak tov.",
    transliteration: "She-bitachon ve-shalom yakifu etchem bimhera. Ad az, de'u she-yesh kehilah olamit she-me'achelet lachem rak tov.",
    serbian: "Neka vas bezbednost i mir uskoro obgrle. Do tada, znajte da postoji globalna zajednica koja vam želi samo dobro.",
    emojis: ["🕊️", "🛡️", "🌍"],
    words: [
      { hebrew: "יַקִּיפוּ", hebrewClean: "יקיפו", transliteration: "yakifu", vuk: "jakifu", english: "will surround / embrace", serbian: "obgrliti", emoji: "🫂", category: "verb" },
      { hebrew: "בִּמְהֵרָה", hebrewClean: "במהרה", transliteration: "bimhera", vuk: "bimhera", english: "soon / swiftly", serbian: "ubrzo", emoji: "⚡", category: "adverb" },
      { hebrew: "קְהִלָּה", hebrewClean: "קהילה", transliteration: "kehilah", vuk: "kehila", english: "community", serbian: "zajednica", emoji: "👥", category: "noun" }
    ],
    grammarNote: "Reč 'kehilah' (קְהִלָּה) je temelj jevrejskog koncepta bratstva, uzajamne pomoći i solidarnosti."
  },
  {
    id: 'sol-11',
    category: 'peace',
    categoryLabel: 'Mir, Bezbednost & Nada',
    categoryEmoji: '🕊️',
    english: "Holding on to hope for a peaceful future, and holding you in my heart until we get there.",
    hebrew: "נֶאֱחָז בַּתִּקְוָה לְעָתִיד שֶׁל שָׁלוֹם, וּמַחֲזִיק אֶתְכֶם בְּלִבִּי עַד שֶׁנַּגִּיעַ לְשָׁם.",
    hebrewClean: "נאחז בתקווה לעתיד של שלום, ומחזיק אתכם בלבי עד שנגיע לשם.",
    hebrewWithEmojis: "נֶאֱחָז בַּתִּקְוָה לְעָתִיד שֶׁל שָׁלוֹם, וּמַחֲזִיק אֶתְכֶם בְּלִבִּי עַד שֶׁנַּגִּיעַ לְשָׁם. 🌱💖🕊️",
    vukPhonetic: "Ne'ehaz ba-tikva le-atid šel šalom, u-mahzik ethem be-libi ad še-nagi'a le-šam.",
    transliteration: "Ne'echaz ba-tikvah le-atid shel shalom, u-machzik etchem be-libi ad she-nagi'a le-sham.",
    serbian: "Držim se nade u mirnu budućnost i nosim vas u srcu dok tamo ne stignemo.",
    emojis: ["🌱", "💖", "🕊️"],
    words: [
      { hebrew: "נֶאֱחָז", hebrewClean: "נאחז", transliteration: "ne'echaz", vuk: "ne'ehaz", english: "holding onto / clinging", serbian: "držim se", emoji: "⚓", category: "verb" },
      { hebrew: "תִּקְוָה", hebrewClean: "תקווה", transliteration: "tikvah", vuk: "tikva", english: "hope", serbian: "nada", emoji: "🌟", category: "noun" },
      { hebrew: "עָתִיד", hebrewClean: "עתיד", transliteration: "atid", vuk: "atid", english: "future", serbian: "budućnost", emoji: "🌱", category: "noun" }
    ],
    grammarNote: "Reč 'tikvah' (תִּקְוָה) je nacionalni simbol nade i himna Izraela ('Hatikvah')."
  },

  // 4. Short & Heartfelt
  {
    id: 'sol-12',
    category: 'short',
    categoryLabel: 'Kratke & Iskrene',
    categoryEmoji: '❤️',
    english: "Sending love, light, and unwavering support your way.",
    hebrew: "שׁוֹלֵחַ אַהֲבָה, אוֹר וּתְמִיכָה בִּלְתִּי מְעֻרְעֶרֶת לְכִוּוּנְכֶם.",
    hebrewClean: "שולח אהבה, אור ותמיכה בלתי מעורערת לכיוונכם.",
    hebrewWithEmojis: "שׁוֹלֵחַ אַהֲבָה, אוֹר וּתְמִיכָה בִּלְתִּי מְעֻרְעֶרֶת לְכִוּוּנְכֶם. ✨💖🕯️",
    vukPhonetic: "Šoleah ahava, or u-tmiha bilti me'ur'eret le-hivunhem.",
    transliteration: "Shole'ach ahavah, or u-tmichah bilti me'ur'eret le-khivunkhem.",
    serbian: "Šaljem vam ljubav, svetlost i nepokolebljivu podršku.",
    emojis: ["✨", "💖", "🕯️"],
    words: [
      { hebrew: "אַהֲבָה", hebrewClean: "אהבה", transliteration: "ahavah", vuk: "ahava", english: "love", serbian: "ljubav", emoji: "💖", category: "noun" },
      { hebrew: "אוֹר", hebrewClean: "אור", transliteration: "or", vuk: "or", english: "light", serbian: "svetlost", emoji: "✨", category: "noun" },
      { hebrew: "תְּמִיכָה", hebrewClean: "תמיכה", transliteration: "tmichah", vuk: "tmiha", english: "support", serbian: "podrška", emoji: "🤝", category: "noun" }
    ],
    grammarNote: "Reč 'or' (אוֹר) nosi metafizičko značenje unutrašnje vedrine i svetlosti koja pobeđuje svaku tamu."
  },
  {
    id: 'sol-13',
    category: 'short',
    categoryLabel: 'Kratke & Iskrene',
    categoryEmoji: '❤️',
    english: "You are always in our thoughts. We stand with you.",
    hebrew: "אַתֶּם תָּמִיד בְּמַחְשְׁבוֹתֵינוּ. אָנוּ עוֹמְדִים לְצִדְּכֶם.",
    hebrewClean: "אתם תמיד במחשבותינו. אנו עומדים לצדכם.",
    hebrewWithEmojis: "אַתֶּם תָּמִיד בְּמַחְשְׁבוֹתֵינוּ. אָנוּ עוֹמְדִים לְצִדְּכֶם. 🤝💭💙",
    vukPhonetic: "Atem tamid be-mahševotejnu. Anu omdim le-cidhem.",
    transliteration: "Atem tamid be-machshevoteinu. Anu omdim le-tzidkhem.",
    serbian: "Uvek ste u našim mislima. Stojimo uz vas.",
    emojis: ["🤝", "💭", "💙"],
    words: [
      { hebrew: "תָּמִיד", hebrewClean: "תמיד", transliteration: "tamid", vuk: "tamid", english: "always", serbian: "uvek", emoji: "⏳", category: "adverb" },
      { hebrew: "מַחְשָׁבוֹת", hebrewClean: "מחשבות", transliteration: "machshavot", vuk: "mahšavot", english: "thoughts", serbian: "misli", emoji: "💭", category: "noun" },
      { hebrew: "עוֹמְדִים", hebrewClean: "עומדים", transliteration: "omdim", vuk: "omdim", english: "stand (with you)", serbian: "stojimo", emoji: "🤝", category: "verb" }
    ],
    grammarNote: "Koren ש-ב-ה u 'machshavot' označava duboko promišljanje i čuvanje u svesti."
  },
  {
    id: 'sol-14',
    category: 'short',
    categoryLabel: 'Kratke & Iskrene',
    categoryEmoji: '❤️',
    english: "Holding you in my heart. Stay safe and know you are loved.",
    hebrew: "מַחֲזִיק אֶתְכֶם בְּלִבִּי. הִשָּׁמְרוּ וּדְעוּ שֶׁאַתֶּם אֲהוּבִים.",
    hebrewClean: "מחזיק אתכם בלבי. הישמרו ודעו שאתם אהובים.",
    hebrewWithEmojis: "מַחֲזִיק אֶתְכֶם בְּלִבִּי. הִשָּׁמְרוּ וּדְעוּ שֶׁאַתֶּם אֲהוּבִים. ❤️🛡️✨",
    vukPhonetic: "Mahzik ethem be-libi. Hišamru u-deu še-atem ahuvim.",
    transliteration: "Machzik etchem be-libi. Hishamru u-de'u she-atem ahuvim.",
    serbian: "Nosim vas u srcu. Čuvajte se i znajte da ste voljeni.",
    emojis: ["❤️", "🛡️", "✨"],
    words: [
      { hebrew: "הִשָּׁמְרוּ", hebrewClean: "הישמרו", transliteration: "hishamru", vuk: "hišamru", english: "take care / stay safe", serbian: "čuvajte se", emoji: "🛡️", category: "verb" },
      { hebrew: "אֲהוּבִים", hebrewClean: "אהובים", transliteration: "ahuvim", vuk: "ahuvim", english: "loved", serbian: "voljeni", emoji: "❤️", category: "adjective" }
    ],
    grammarNote: "'Hishamru' (הִשָּׁמְרוּ) je topao imperativ iz korena ש-מ-ר koji znači čuvati i paziti."
  },
  {
    id: 'sol-15',
    category: 'short',
    categoryLabel: 'Kratke & Iskrene',
    categoryEmoji: '❤️',
    english: "Sending a virtual hug across the miles. We are with you.",
    hebrew: "שׁוֹלֵחַ חִבּוּק חוֹצֶה גְּבוּלוֹת וּמֶרְחַקִּים. אֲנַחְנוּ אִתְּכֶם.",
    hebrewClean: "שולח חיבוק חוצה גבולות ומרחקים. אנחנו אתכם.",
    hebrewWithEmojis: "שׁוֹלֵחַ חִבּוּק חוֹצֶה גְּבוּלוֹת וּמֶרְחַקִּים. אֲנַחְנוּ אִתְּכֶם. 🫂💙🌍",
    vukPhonetic: "Šoleah hibuk hoce gvulot u-merhakim. Anahnu ithem.",
    transliteration: "Shole'ach chibuk chotzeh gvulot u-merchakim. Anachnu itkhem.",
    serbian: "Šaljem virtuelni zagrljaj preko svih daljina. Sa vama smo.",
    emojis: ["🫂", "💙", "🌍"],
    words: [
      { hebrew: "חִבּוּק", hebrewClean: "חיבוק", transliteration: "chibuk", vuk: "hibuk", english: "hug", serbian: "zagrljaj", emoji: "🫂", category: "noun" },
      { hebrew: "אִתְּכֶם", hebrewClean: "אתכם", transliteration: "itkhem", vuk: "ithem", english: "with you", serbian: "sa vama", emoji: "🤝", category: "preposition" }
    ],
    grammarNote: "Reč 'chibuk' (חִבּוּק) u svakodnevnom hebrejskom prenosi toplu ljudsku prisutnost i zagrljaj podrške."
  }
];

export const AI_PRESET_SENTENCES = [
  { en: "Just a reminder that you have friends all over the world. We see you, we care about you, and you are never alone.", emojis: "🌍🤝❤️", sr: "Samo podsetnik da imate prijatelje širom sveta..." },
  { en: "No matter the distance, please know we stand with you in unwavering solidarity and love.", emojis: "🌐💪💖", sr: "Stojimo uz vas u nepokolebljivoj solidarnosti i ljubavi" },
  { en: "The strength and resilience of the Israeli people never cease to inspire me.", emojis: "🦁🇮🇱💪", sr: "Snaga i otpornost naroda Izraela nikada ne prestaju da me inspirišu" },
  { en: "Praying for peace, safety, and brighter days ahead for you and all of Israel.", emojis: "🕊️🙏🇮🇱", sr: "Molitva za mir, bezbednost i vedrije dane za vas i ceo Izrael" },
  { en: "Sending love, light, and unwavering support your way.", emojis: "✨💖🕯️", sr: "Šaljem ljubav, svetlost i nepokolebljivu podršku" },
  { en: "Holding you in my heart. Stay safe and know you are loved.", emojis: "❤️🛡️✨", sr: "Nosim vas u srcu. Čuvajte se i znajte da ste voljeni" },
  { en: "Peace and wisdom are true strength", emojis: "🕊️🧠✨", sr: "Mir i mudrost su istinska snaga" },
  { en: "Good morning, my dear friend!", emojis: "☀️☕🤝", sr: "Dobro jutro, dragi moj prijatelju!" }
];

export const HEBREW_ALPHABET_DATA: HebrewAlphabetItem[] = [
  { id: 'he-a-1', char: 'א', name: 'Alef', vuk: 'A / Tišina (Grleni nosilac samoglasnika)', english: 'Silent / Vowel Carrier', gematria: 1, exampleWord: 'אָב (Av)', exampleTranslationSr: 'Otac', exampleTranslationEn: 'Father' },
  { id: 'he-a-2', char: 'ב', name: 'Bet / Vet', vuk: 'B (sa Dagesh tačkom) / V (bez Dagesh tačke)', english: 'B (as in Boy) / V (as in Vine)', gematria: 2, exampleWord: 'בַּיִת (Bayit)', exampleTranslationSr: 'Kuća / Dom', exampleTranslationEn: 'House' },
  { id: 'he-a-3', char: 'ג', name: 'Gimel', vuk: 'G (tvrdo G kao u GRAD)', english: 'G (as in Good)', gematria: 3, exampleWord: 'גָּמָל (Gamal)', exampleTranslationSr: 'Kamila', exampleTranslationEn: 'Camel' },
  { id: 'he-a-4', char: 'ד', name: 'Dalet', vuk: 'D (tvrdo D kao u DEDA)', english: 'D (as in Door)', gematria: 4, exampleWord: 'דֶּלֶת (Delet)', exampleTranslationSr: 'Vrata', exampleTranslationEn: 'Door' },
  { id: 'he-a-5', char: 'ה', name: 'Hei', vuk: 'H (blago H kao u HLEB)', english: 'H (as in House)', gematria: 5, exampleWord: 'הֵיכָל (Heichal)', exampleTranslationSr: 'Hram / Palata', exampleTranslationEn: 'Temple' },
  { id: 'he-a-6', char: 'ו', name: 'Vav', vuk: 'V / O / U (suglasnik V ili samoglasnici O/U)', english: 'V / O / U', gematria: 6, exampleWord: 'וֶרֶ德 (Vered)', exampleTranslationSr: 'Ruža', exampleTranslationEn: 'Rose' },
  { id: 'he-a-7', char: 'ז', name: 'Zayin', vuk: 'Z (zujavo Z kao u ZEBRA)', english: 'Z (as in Zebra)', gematria: 7, exampleWord: 'זֵיתִים (Zeitim)', exampleTranslationSr: 'Masline', exampleTranslationEn: 'Olives' },
  { id: 'he-a-8', char: 'ח', name: 'Chet', vuk: 'H (duboko grleno H kao u BACH)', english: 'Ch (as in Bach)', gematria: 8, exampleWord: 'חָבֵר (Chaver)', exampleTranslationSr: 'Prijatelj', exampleTranslationEn: 'Friend' },
  { id: 'he-a-9', char: 'ט', name: 'Tet', vuk: 'T (tvrdo T ako u TRAVA)', english: 'T (as in Top)', gematria: 9, exampleWord: 'טוֹב (Tov)', exampleTranslationSr: 'Dobro / Lepo', exampleTranslationEn: 'Good' },
  { id: 'he-a-10', char: 'י', name: 'Yod', vuk: 'J / I (kratko J kao u JELEN)', english: 'Y (as in Yes)', gematria: 10, exampleWord: 'יָד (Yad)', exampleTranslationSr: 'Ruka', exampleTranslationEn: 'Hand' },
  { id: 'he-a-11', char: 'כ', name: 'Kaf / Chaf', vuk: 'K (sa Dagesh) / H (bez Dagesh)', english: 'K / Ch', gematria: 20, exampleWord: 'כֶּלֶב (Kelev)', exampleTranslationSr: 'Pas', exampleTranslationEn: 'Dog' },
  { id: 'he-a-12', char: 'ך', name: 'Kaf Sofit (Krajnje)', vuk: 'H / K (samo na kraju reči)', english: 'Final K/Ch', gematria: 20, isFinal: true, exampleWord: 'מֶלֶךְ (Melech)', exampleTranslationSr: 'Kralj', exampleTranslationEn: 'King' },
  { id: 'he-a-13', char: 'ל', name: 'Lamed', vuk: 'L (jasno L kao u LALA)', english: 'L (as in Lamp)', gematria: 30, exampleWord: 'לֶחֶם (Lechem)', exampleTranslationSr: 'Hleb', exampleTranslationEn: 'Bread' },
  { id: 'he-a-14', char: 'מ', name: 'Mem', vuk: 'M (nosno M kao u MAMA)', english: 'M (as in Moon)', gematria: 40, exampleWord: 'מַמְלָכָה (Mamlacha)', exampleTranslationSr: 'Kraljevstvo', exampleTranslationEn: 'Kingdom' },
  { id: 'he-a-15', char: 'ם', name: 'Mem Sofit (Krajnje)', vuk: 'M (samo na kraju reči)', english: 'Final M', gematria: 40, isFinal: true, exampleWord: 'שָׁלוֹם (Shalom)', exampleTranslationSr: 'Mir', exampleTranslationEn: 'Peace' },
  { id: 'he-a-16', char: 'נ', name: 'Nun', vuk: 'N (nosno N kao u NOS)', english: 'N (as in Night)', gematria: 50, exampleWord: 'נֵר (Ner)', exampleTranslationSr: 'Sveća / Svetlo', exampleTranslationEn: 'Candle' },
  { id: 'he-a-17', char: 'ן', name: 'Nun Sofit (Krajnje)', vuk: 'N (samo na kraju reči)', english: 'Final N', gematria: 50, isFinal: true, exampleWord: 'גַּן (Gan)', exampleTranslationSr: 'Bašta / Vrt', exampleTranslationEn: 'Garden' },
  { id: 'he-a-18', char: 'ס', name: 'Samech', vuk: 'S (tvrdo S kao u SUNCE)', english: 'S (as in Sun)', gematria: 60, exampleWord: 'סֵפֶר (Sefer)', exampleTranslationSr: 'Knjiga', exampleTranslationEn: 'Book' },
  { id: 'he-a-19', char: 'ע', name: 'Ayin', vuk: 'Duboki grleni fonem / Tišina', english: 'Silent / Deep Guttural', gematria: 70, exampleWord: 'עַיִן (Ayin)', exampleTranslationSr: 'Oko / Izvor', exampleTranslationEn: 'Eye' },
  { id: 'he-a-20', char: 'פ', name: 'Pei / Fei', vuk: 'P (sa Dagesh) / F (bez Dagesh)', english: 'P / F', gematria: 80, exampleWord: 'פַּרְפַּר (Parpar)', exampleTranslationSr: 'Leptir', exampleTranslationEn: 'Butterfly' },
  { id: 'he-a-21', char: 'ף', name: 'Pei Sofit (Krajnje)', vuk: 'F / P (samo na kraju reči)', english: 'Final F/P', gematria: 80, isFinal: true, exampleWord: 'כַּף (Kaf)', exampleTranslationSr: 'Dlan / Kašika', exampleTranslationEn: 'Palm' },
  { id: 'he-a-22', char: 'צ', name: 'Tzadi', vuk: 'C (sliveno TZ kao u CAR)', english: 'Ts (as in Cats)', gematria: 90, exampleWord: 'צֶדֶק (Tzedek)', exampleTranslationSr: 'Pravda / Istina', exampleTranslationEn: 'Justice' },
  { id: 'he-a-23', char: 'ץ', name: 'Tzadi Sofit (Krajnje)', vuk: 'C (samo na kraju reči)', english: 'Final Ts', gematria: 90, isFinal: true, exampleWord: 'עֵץ (Etz)', exampleTranslationSr: 'Drvo', exampleTranslationEn: 'Tree' },
  { id: 'he-a-24', char: 'ק', name: 'Kof', vuk: 'K (duboko K)', english: 'K (as in Key)', gematria: 100, exampleWord: 'קוֹל (Kol)', exampleTranslationSr: 'Glas / Zvuk', exampleTranslationEn: 'Voice' },
  { id: 'he-a-25', char: 'ר', name: 'Resh', vuk: 'R (grleno ili vršno R)', english: 'R (as in Run)', gematria: 200, exampleWord: 'רוּחַ (Ruach)', exampleTranslationSr: 'Duh / Vetar', exampleTranslationEn: 'Spirit / Wind' },
  { id: 'he-a-26', char: 'ש', name: 'Shin / Sin', vuk: 'Š (desna tačka) / S (leva tačka)', english: 'Sh / S', gematria: 300, exampleWord: 'שָׁלוֹם (Shalom)', exampleTranslationSr: 'Mir / Pozdrav', exampleTranslationEn: 'Peace' },
  { id: 'he-a-27', char: 'ת', name: 'Tav', vuk: 'T (tvrdo T)', english: 'T (as in Tree)', gematria: 400, exampleWord: 'תּוֹרָה (Torah)', exampleTranslationSr: 'Učenje / Tora', exampleTranslationEn: 'Law / Teaching' }
];

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
  },
  {
    char: 'רַק תִּזְכֹּרֶת שֶׁיֵּשׁ לָכֶם חֲבֵרִים בְּכָל הָעוֹלָם 🌍🤝❤️',
    vuk: 'Rak tizkoret še-ješ lahem haverim be-hol ha-olam...',
    sr: 'Samo podsetnik da imate prijatelje širom sveta. Nikada niste sami.',
    en: 'Just a reminder that you have friends all over the world. You are never alone.',
    badge: '🌍 Solidarnost'
  },
  {
    char: 'לֹא מְשַׁנֶּה הַמֶּרְחָק, אָנוּ עוֹמְדִים לְצִדְּכֶם 🌐💪💖',
    vuk: 'Lo mešane ha-merhak, anu omdim le-cidhem be-solidarijut...',
    sr: 'Bez obzira na udaljenost, stojimo uz vas u nepokolebljivoj solidarnosti.',
    en: 'No matter the distance, we stand with you in unwavering solidarity and love.',
    badge: '💖 Zajedništvo'
  },
  {
    char: 'הַכֹּחַ וְהַחֹסֶן שֶׁל עַם יִשְׂרָאֵל מַשְׁרִיר בִּי הַשְׁרָאָה 🦁🇮🇱💪',
    vuk: 'Ha-koah ve-ha-hosen šel am Jisrael...',
    sr: 'Snaga i otpornost naroda Izraela nikada ne prestaju da me inspirišu.',
    en: 'The strength and resilience of the Israeli people never cease to inspire me.',
    badge: '🦁 Otpornost'
  },
  {
    char: 'מִתְפַּלֵּל לְשָׁלוֹם, לְבִטָּחוֹן וּלְיָמִים בְּהִירִים 🕊️🙏🇮🇱',
    vuk: 'Mitpalel le-šalom, le-vitahon u-lejamim behirim...',
    sr: 'Molim se za mir, bezbednost i vedrije dane za vas i ceo Izrael.',
    en: 'Praying for peace, safety, and brighter days ahead for you and all of Israel.',
    badge: '🕊️ Mir'
  },
  {
    char: 'אַתֶּם תָּמִיד בְּמַחְשְׁבוֹתֵינוּ. אָנוּ עוֹמְדִים לְצִדְּכֶם 🤝💭💙',
    vuk: 'Atem tamid be-mahševotejnu. Anu omdim le-cidhem...',
    sr: 'Uvek ste u našim mislima. Stojimo uz vas.',
    en: 'You are always in our thoughts. We stand with you.',
    badge: '💙 Podrška'
  },
  {
    char: 'מַחֲזִיק אֶתְכֶם בְּלִבִּי. הִשָּׁמְרוּ וּדְעוּ שֶׁאַתֶּם אֲהוּבִים ❤️🛡️✨',
    vuk: 'Mahzik ethem be-libi. Hišamru u-deu še-atem ahuvim...',
    sr: 'Nosim vas u srcu. Čuvajte se i znajte da ste voljeni.',
    en: 'Holding you in my heart. Stay safe and know you are loved.',
    badge: '❤️ Ljubav'
  },
  {
    char: 'שׁוֹלֵחַ חִבּוּק חוֹצֶה גְּבוּלוֹת וּמֶרְחַקִּים. אֲנַחְנוּ אִתְּכֶם 🫂💙🌍',
    vuk: 'Šoleah hibuk hoce gvulot u-merhakim. Anahnu ithem...',
    sr: 'Šaljem virtuelni zagrljaj preko svih daljina. Sa vama smo.',
    en: 'Sending a virtual hug across the miles. We are with you.',
    badge: '🫂 Zagrljaj'
  }
];

export interface HebrewVocabViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  user: User | null;
}

export const HebrewVocabView: React.FC<HebrewVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  // Navigation: Dictionary, Emoji Canvas, AI Weaver, Quiz, Flashcards or Alphabet
  const [activeTab, setActiveTab] = useState<'learn' | 'canvas' | 'weaver' | 'quiz' | 'flashcards' | 'alphabet'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hebrew Alphabet View State
  const [alphabetFilter, setAlphabetFilter] = useState<'all' | 'standard' | 'sofit'>('all');
  const [alphabetSearch, setAlphabetSearch] = useState('');

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
  const [heConfigTabMode, setHeConfigTabMode] = useState<'ai' | 'dnd' | 'dropdown'>('ai');

  // AI-Assisted Sentence & Word Configurator State
  const [aiInputSentence, setAiInputSentence] = useState('Peace and wisdom are true strength');
  const [aiSelectedStyle, setAiSelectedStyle] = useState('conversational & thoughtful');
  const [isAiTranslating, setIsAiTranslating] = useState(false);
  const [aiTranslationResult, setAiTranslationResult] = useState<AiConfiguredHebrewResult | null>(null);
  const [aiTranslationError, setAiTranslationError] = useState<string | null>(null);
  const [aiCopiedResult, setAiCopiedResult] = useState(false);
  const [aiSavedSuccessToast, setAiSavedSuccessToast] = useState<string | null>(null);
  const [savedCustomWords, setSavedCustomWords] = useState<HebrewVocabItem[]>(() => {
    try {
      const saved = localStorage.getItem('wisefit_hebrew_custom_words');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [aiConfigHistory, setAiConfigHistory] = useState<AiConfiguredHebrewResult[]>(() => {
    try {
      const saved = localStorage.getItem('wisefit_hebrew_ai_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [solidarityFilter, setSolidarityFilter] = useState<'all' | 'solidarity' | 'strength' | 'peace' | 'short'>('all');
  const [copiedSolidarityId, setCopiedSolidarityId] = useState<string | null>(null);

  const handleSelectSolidarityQuote = (quote: HebrewSolidarityQuote) => {
    setAiInputSentence(quote.english);
    setAiTranslationResult({
      hebrewWithEmojis: quote.hebrewWithEmojis,
      hebrew: quote.hebrew,
      hebrewClean: quote.hebrewClean,
      transliteration: quote.transliteration,
      vukPhonetic: quote.vukPhonetic,
      serbian: quote.serbian,
      english: quote.english,
      emojis: quote.emojis,
      words: quote.words,
      grammarNote: quote.grammarNote
    });
    setAiSavedSuccessToast(`Učitana poruka: "${quote.english.substring(0, 40)}..." ✨`);
    setTimeout(() => setAiSavedSuccessToast(null), 2500);
  };

  const handleCopySolidarity = (textToCopy: string, id: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedSolidarityId(id);
    setTimeout(() => setCopiedSolidarityId(null), 2000);
  };

  const handleTranslateWithAi = async (customSentence?: string) => {
    const sentenceToUse = (typeof customSentence === 'string' ? customSentence : aiInputSentence).trim();
    if (!sentenceToUse) return;
    setIsAiTranslating(true);
    setAiTranslationError(null);
    try {
      const res = await fetch('/api/ai/hebrew-configurator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentence: sentenceToUse,
          style: aiSelectedStyle
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Neuspešan prevod');
      if (json.data) {
        setAiTranslationResult(json.data);
        // Save into history
        setAiConfigHistory(prev => {
          const filtered = prev.filter(item => item.english?.toLowerCase() !== json.data.english?.toLowerCase());
          const next = [json.data, ...filtered].slice(0, 15);
          try {
            localStorage.setItem('wisefit_hebrew_ai_history', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
      }
    } catch (err: any) {
      setAiTranslationError(err.message || 'Greška pri prevodu sa AI.');
    } finally {
      setIsAiTranslating(false);
    }
  };

  const handleSaveAllAiWords = () => {
    if (!aiTranslationResult || !aiTranslationResult.words) return;
    const newItems: HebrewVocabItem[] = aiTranslationResult.words.map((w, idx) => ({
      id: `he-ai-${Date.now()}-${idx}`,
      char: w.hebrew,
      transliteration: w.transliteration,
      vuk: w.vuk,
      translation: w.serbian,
      english: w.english,
      category: 'mudrost',
      categoryLabel: 'AI Mudrost',
      emoji: w.emoji || '✨',
      root: w.hebrewClean || w.hebrew,
      visualTip: `Kreirano kroz AI Prevodilac za rečenicu: "${aiTranslationResult.english}"`
    }));

    setSavedCustomWords(prev => {
      const existingChars = new Set(prev.map(p => p.char));
      const toAdd = newItems.filter(item => !existingChars.has(item.char));
      const next = [...toAdd, ...prev];
      try {
        localStorage.setItem('wisefit_hebrew_custom_words', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setAiSavedSuccessToast(`Uspešno sačuvano ${newItems.length} reči u Vaš rečnik i Flashcards! 🎴✨`);
    setTimeout(() => setAiSavedSuccessToast(null), 3000);
  };

  const handleSaveSingleAiWord = (w: AiConfigWordItem) => {
    const newItem: HebrewVocabItem = {
      id: `he-ai-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      char: w.hebrew,
      transliteration: w.transliteration,
      vuk: w.vuk,
      translation: w.serbian,
      english: w.english,
      category: 'mudrost',
      categoryLabel: 'AI Mudrost',
      emoji: w.emoji || '✨',
      root: w.hebrewClean || w.hebrew,
      visualTip: `Kreirano putem AI Konfiguratora: "${w.english}"`
    };

    setSavedCustomWords(prev => {
      const filtered = prev.filter(p => p.char !== newItem.char);
      const next = [newItem, ...filtered];
      try {
        localStorage.setItem('wisefit_hebrew_custom_words', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setAiSavedSuccessToast(`Reč "${w.hebrew}" sačuvana u rečnik! ✨`);
    setTimeout(() => setAiSavedSuccessToast(null), 2500);
  };

  const handleCopyAiResult = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setAiCopiedResult(true);
    setTimeout(() => setAiCopiedResult(false), 2000);
  };

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

  const speakHebrewAudioFallback = React.useCallback((text: string, id?: string) => {
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
  }, []);

  const speakHebrew = React.useCallback((text: string, id?: string) => {
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
  }, [speakHebrewAudioFallback]);

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

  const fullVocabList = useMemo(() => {
    if (savedCustomWords.length === 0) return HEBREW_VOCAB_DATA;
    const seen = new Set<string>();
    const list: HebrewVocabItem[] = [];
    for (const item of [...savedCustomWords, ...HEBREW_VOCAB_DATA]) {
      const k = item.char.trim();
      if (!seen.has(k)) {
        seen.add(k);
        list.push(item);
      }
    }
    return list;
  }, [savedCustomWords]);

  const filteredVocab = useMemo(() => {
    return fullVocabList.filter(item => {
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
  }, [fullVocabList, selectedCategory, searchQuery]);

  const toggleMastered = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
    if (hQuizCategory === 'alphabet') {
      const alphabetAsVocab: HebrewVocabItem[] = HEBREW_ALPHABET_DATA.map(item => ({
        id: item.id,
        char: item.char,
        transliteration: item.name,
        vuk: item.vuk,
        translation: `Slovo ${item.name} (${item.vuk}) — Primer: ${item.exampleWord} (${item.exampleTranslationSr})`,
        english: `Letter ${item.name} (${item.english})`,
        category: 'alphabet',
        categoryLabel: item.isFinal ? 'Sofit' : 'Alef-Bet',
        emoji: '🔤',
        root: `Gematrija: ${item.gematria}`
      }));

      const shuffled = [...alphabetAsVocab].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(hQuizQuestionCount, shuffled.length));

      const questionsList = selected.map(vocab => {
        const item = HEBREW_ALPHABET_DATA.find(a => a.id === vocab.id) || HEBREW_ALPHABET_DATA[0];
        const types: ('meaning' | 'vuk' | 'character' | 'listen')[] = ['meaning', 'vuk', 'character', 'listen'];
        const questionType = types[Math.floor(Math.random() * types.length)];
        const wrongOthers = HEBREW_ALPHABET_DATA.filter(a => a.id !== item.id).sort(() => Math.random() - 0.5).slice(0, 3);

        let correctAnswer = '';
        let wrongAnswers: string[] = [];

        if (questionType === 'meaning') {
          correctAnswer = `${item.name} — Vuk: "${item.vuk}" [Gematrija: ${item.gematria}]`;
          wrongAnswers = wrongOthers.map(w => `${w.name} — Vuk: "${w.vuk}" [Gematrija: ${w.gematria}]`);
        } else if (questionType === 'vuk') {
          correctAnswer = `Vuk Izgovor: "${item.vuk}" (${item.english})`;
          wrongAnswers = wrongOthers.map(w => `Vuk Izgovor: "${w.vuk}" (${w.english})`);
        } else if (questionType === 'character') {
          correctAnswer = `Slovo ${item.char} (${item.name}) — Gematrija: ${item.gematria}`;
          wrongAnswers = wrongOthers.map(w => `Slovo ${w.char} (${w.name}) — Gematrija: ${w.gematria}`);
        } else {
          correctAnswer = `${item.char} (${item.name}) — Primer: ${item.exampleWord} (${item.exampleTranslationSr})`;
          wrongAnswers = wrongOthers.map(w => `${w.char} (${w.name}) — Primer: ${w.exampleWord} (${w.exampleTranslationSr})`);
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
      return;
    }

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
        <div className="flex items-center gap-2 flex-wrap max-w-full">
          <div className={cn(
            "p-1.5 rounded-2xl border flex flex-wrap items-center gap-1.5 w-full sm:w-auto",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
          )}>
            <button
              onClick={() => setActiveTab('learn')}
              className={cn(
                "px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 grow sm:grow-0 shrink-0",
                activeTab === 'learn'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" /> Rečnik
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={cn(
                "px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 grow sm:grow-0 shrink-0",
                activeTab === 'canvas'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" /> Canvas
            </button>
            <button
              onClick={() => { setActiveTab('weaver'); setHeConfigTabMode('ai'); }}
              className={cn(
                "px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 grow sm:grow-0 shrink-0",
                activeTab === 'weaver'
                  ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" /> 🤖 AI Prevod & Sklop
            </button>
            <button
              onClick={() => { setActiveTab('quiz'); generateQuizRound(); }}
              className={cn(
                "px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 grow sm:grow-0 shrink-0",
                activeTab === 'quiz'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" /> Kviz
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={cn(
                "px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 grow sm:grow-0 shrink-0",
                activeTab === 'flashcards'
                  ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20" : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" /> Flashcards 🎴
            </button>
            <button
              onClick={() => setActiveTab('alphabet')}
              className={cn(
                "px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 grow sm:grow-0 shrink-0",
                activeTab === 'alphabet'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <span>🔤</span> Alef-Bet
            </button>
          </div>

          <div className={cn(
            "px-3 py-2 sm:py-1.5 rounded-xl flex items-center gap-2 border font-mono text-xs font-black shrink-0",
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-700"
          )}>
            <Trophy className="w-4 h-4 text-blue-500 fill-blue-500 animate-pulse shrink-0" />
            <span>{masteredIds.length}/{HEBREW_VOCAB_DATA.length}</span>
          </div>
        </div>

        {/* QUICK AI TRANSLATOR FEATURE BANNER */}
        <div className={cn(
          "p-3.5 rounded-2xl border flex items-center justify-between gap-3 flex-wrap shadow-md",
          isDarkMode ? "bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-zinc-900 border-blue-500/40" : "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200"
        )}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖✨</span>
            <div className="text-xs">
              <span className="font-black text-blue-400 dark:text-blue-300">Novo: AI Konfigurator & Prevodilac sa Emodžijima!</span>
              <p className="text-[11px] text-zinc-400">
                Upišite englesku rečenicu i pritisnite prevod — dobijate hebrejski sa vokalima i prigodnim emodžijima.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setActiveTab('weaver'); setHeConfigTabMode('ai'); }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span>Otvori AI Prevodilac ⚡</span>
          </button>
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
              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-xs font-bold text-blue-500">
                  Savladano {Math.round((masteredIds.length / HEBREW_VOCAB_DATA.length) * 100)}% rečnika
                </div>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95 text-white",
                    isGirlyMode ? "bg-pink-500 hover:bg-pink-400" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" /> Flashcards Igra 🎴
                </button>
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
            <div className="grid grid-cols-3 gap-1 sm:gap-2 p-1.5 rounded-2xl bg-zinc-900/80 border border-blue-500/30 max-w-xl mx-auto w-full">
              <button
                onClick={() => setHeConfigTabMode('ai')}
                className={cn(
                  "min-w-0 py-2.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center",
                  heConfigTabMode === 'ai'
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 shrink-0" />
                <span className="truncate">🤖 AI Prevod<span className="hidden sm:inline"> sa Emodžijima</span></span>
              </button>

              <button
                onClick={() => setHeConfigTabMode('dnd')}
                className={cn(
                  "min-w-0 py-2.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center",
                  heConfigTabMode === 'dnd'
                    ? "bg-blue-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">🎨 Drag & Drop<span className="hidden sm:inline"> Studio</span></span>
              </button>

              <button
                onClick={() => setHeConfigTabMode('dropdown')}
                className={cn(
                  "min-w-0 py-2.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center",
                  heConfigTabMode === 'dropdown'
                    ? "bg-blue-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">⚡ Meni<span className="hidden sm:inline"> Izbor</span></span>
              </button>
            </div>

            {/* MODE 0: AI-ASSISTED WORD & SENTENCE CONFIGURATOR WITH EMOJIS */}
            {heConfigTabMode === 'ai' && (
              <div className={cn(
                "p-6 rounded-3xl border space-y-6",
                isDarkMode ? "bg-zinc-900/90 border-blue-500/40 shadow-xl" : "bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border-blue-300 shadow-md"
              )}>
                {/* Header banner */}
                <div className="flex items-center justify-between flex-wrap gap-3 border-b pb-4 border-blue-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                        <span>AI Konfigurator Reči & Prevodilac sa Emodžijima</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          ✨ Gemini 3.8 Flash
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Unesite englesku rečenicu — AI generiše pravilan hebrejski prevod sa vokalima (Nikud), fonetikom i dodaje prigodne emodžije!
                      </p>
                    </div>
                  </div>

                  {aiConfigHistory.length > 0 && (
                    <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-700/50">
                      <History className="w-3.5 h-3.5 text-blue-400" />
                      Istorija: {aiConfigHistory.length}
                    </span>
                  )}
                </div>

                {/* Toast notification */}
                <AnimatePresence>
                  {aiSavedSuccessToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{aiSavedSuccessToast}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Style Pills */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-blue-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Stil Prevoda & Tonalitet:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'conversational & thoughtful', label: '🧘 Filozofski & Miran' },
                      { id: 'casual & modern daily conversation', label: '💬 Svakodnevni & Govorni' },
                      { id: 'biblical & classical wisdom', label: '📜 Drevni & Klasični' },
                      { id: 'poetic & warm emotional', label: '🌸 Poetski & Topao' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setAiSelectedStyle(st.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                          aiSelectedStyle === st.id
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-blue-500/40" : "bg-white border-blue-200 text-blue-900"
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GLOBAL SOLIDARITY & SUPPORT QUOTES SECTION */}
                <div className={cn(
                  "p-5 rounded-3xl border space-y-4 shadow-lg",
                  isDarkMode ? "bg-gradient-to-br from-blue-950/40 via-zinc-900 to-indigo-950/30 border-blue-500/40" : "bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 border-blue-200"
                )}>
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3 border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-blue-400 animate-pulse" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-400 font-mono flex items-center gap-1.5">
                          <span>🌍 Poruke Podrške, Empatije i Solidarnosti</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                            15 Zvaničnih Poruka
                          </span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Izaberite poruku prijateljstva i solidarnosti — kliknite za trenutnu konfiguraciju na hebrejskom sa vokalima (Nikud) i emodžijima!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {[
                      { id: 'all', label: '🌐 Sve Poruke (15)' },
                      { id: 'solidarity', label: '🤝 Solidarnost & Prijateljstvo' },
                      { id: 'strength', label: '🦁 Snaga & Otpornost' },
                      { id: 'peace', label: '🕊️ Mir, Bezbednost & Nada' },
                      { id: 'short', label: '❤️ Kratke & Iskrene' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSolidarityFilter(tab.id as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl font-bold transition-all border text-[11px]",
                          solidarityFilter === tab.id
                            ? "bg-blue-600 text-white border-blue-500 shadow-md font-black"
                            : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-blue-500/50 hover:text-white" : "bg-white border-zinc-200 text-zinc-700 hover:bg-blue-50"
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {HEBREW_SOLIDARITY_QUOTES
                      .filter(q => solidarityFilter === 'all' || q.category === solidarityFilter)
                      .map(quote => (
                        <div
                          key={quote.id}
                          className={cn(
                            "p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 hover:shadow-md",
                            isDarkMode ? "bg-zinc-900/90 border-zinc-800 hover:border-blue-500/60" : "bg-white border-zinc-200 hover:border-blue-400"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                              <span>{quote.categoryEmoji}</span>
                              <span>{quote.categoryLabel}</span>
                            </span>
                            <span className="text-base">{quote.emojis.join(' ')}</span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-zinc-100 leading-snug">
                              "{quote.english}"
                            </p>
                            <div dir="rtl" className="text-sm font-bold font-serif text-blue-300 leading-relaxed pt-1">
                              {quote.hebrewWithEmojis}
                            </div>
                            <p className="text-[11px] font-mono text-amber-400">
                              🗣️ "{quote.vukPhonetic}"
                            </p>
                            <p className="text-[11px] text-emerald-400/90 font-medium">
                              🇷🇸 {quote.serbian}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => speakHebrew(quote.hebrew)}
                                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-blue-500/10 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/20 transition-all flex items-center gap-1"
                                title="Poslušaj izgovor na hebrejskom"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Slušaj</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopySolidarity(quote.hebrewWithEmojis, quote.id)}
                                className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all flex items-center gap-1"
                                title="Kopiraj hebrejski sa emodžijima"
                              >
                                {copiedSolidarityId === quote.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedSolidarityId === quote.id ? 'Kopirano' : 'Kopiraj'}</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectSolidarityQuote(quote)}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-sm transition-all flex items-center justify-center gap-1 shrink-0"
                              title="Učitaj u AI Konfigurator za detaljan pregled reči i gramatike"
                            >
                              <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
                              <span>Učitaj u AI</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase text-zinc-400 flex items-center gap-1">
                    <span>⚡ Dodatni Brzi Primeri (kliknite za trenutni prevod sa emodžijima):</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_PRESET_SENTENCES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiInputSentence(preset.en);
                          handleTranslateWithAi(preset.en);
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-xl text-xs transition-all border text-left flex items-center gap-1.5",
                          isDarkMode ? "bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-blue-950/40 hover:border-blue-500/50 hover:text-white" : "bg-white border-zinc-300 text-zinc-700 hover:bg-blue-50"
                        )}
                      >
                        <span>{preset.emojis}</span>
                        <span className="font-medium">{preset.en}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea Input & Translate Button */}
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={aiInputSentence}
                      onChange={(e) => setAiInputSentence(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleTranslateWithAi();
                        }
                      }}
                      placeholder="Unesite rečenicu na engleskom (npr. 'I love learning Hebrew words with wisdom and joy')..."
                      rows={3}
                      className={cn(
                        "w-full p-4 rounded-2xl border text-sm font-medium transition-all outline-none resize-none pr-10",
                        isDarkMode ? "bg-zinc-950/80 border-zinc-700 text-zinc-100 focus:border-blue-500" : "bg-white border-zinc-300 text-zinc-900 focus:border-blue-500 shadow-inner"
                      )}
                    />
                    {aiInputSentence && (
                      <button
                        type="button"
                        onClick={() => setAiInputSentence('')}
                        className="absolute top-3.5 right-3.5 p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
                        title="Obriši tekst"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Prečica: Ctrl/Cmd + Enter za brzi prevod
                    </span>

                    <button
                      type="button"
                      onClick={() => handleTranslateWithAi()}
                      disabled={isAiTranslating || !aiInputSentence.trim()}
                      className={cn(
                        "w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg",
                        isAiTranslating || !aiInputSentence.trim()
                          ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                          : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:brightness-110 shadow-blue-500/20 active:scale-95"
                      )}
                    >
                      {isAiTranslating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                          <span>AI Prevodi i Dodaje Emodžije...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          <span>✨ Prevedi sa AI (Translate)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error message if any */}
                {aiTranslationError && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{aiTranslationError}</span>
                  </div>
                )}

                {/* Translation Result Display Card */}
                {aiTranslationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-4 sm:p-6 rounded-3xl border space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden",
                      isDarkMode ? "bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950/30 border-blue-500/50" : "bg-white border-blue-300"
                    )}
                  >
                    {/* Subtle decorative glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Badges & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 border-zinc-800/80">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-mono font-bold uppercase bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/30 flex items-center gap-1">
                          <span>🇮🇱</span> Hebrejski Prevod sa Emodžijima
                        </span>
                      </div>

                      {/* Mobile-Friendly Grid: 3 Equal Buttons on Mobile, Flex on Desktop */}
                      <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => speakHebrew(aiTranslationResult.hebrew)}
                          className="min-w-0 px-2 sm:px-3 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center"
                          title="Poslušaj izgovor"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                          <span className="truncate">Slušaj</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyAiResult(aiTranslationResult.hebrewWithEmojis)}
                          className={cn(
                            "min-w-0 px-2 sm:px-3 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center",
                            aiCopiedResult
                              ? "bg-emerald-600 text-white border-emerald-500"
                              : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white" : "bg-zinc-100 border-zinc-300 text-zinc-700"
                          )}
                          title="Kopiraj kompletan odgovor sa emodžijima"
                        >
                          {aiCopiedResult ? <Check className="w-3.5 h-3.5 shrink-0 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                          <span className="truncate">{aiCopiedResult ? 'Kopirano' : 'Kopiraj'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveAllAiWords}
                          className="min-w-0 px-2 sm:px-3 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-center"
                          title="Dodaj sve reči iz ovog prevoda u svoj rečnik i flashcards igru"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Sačuvaj</span>
                        </button>
                      </div>
                    </div>

                    {/* BIG HEBREW DISPLAY WITH EMOJIS */}
                    <div className="text-center py-4 px-2 space-y-2">
                      <div 
                        dir="rtl"
                        className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-wide leading-relaxed text-blue-100 drop-shadow-sm select-all"
                      >
                        {aiTranslationResult.hebrewWithEmojis}
                      </div>

                      {/* Pronunciation & Translations */}
                      <div className="max-w-xl mx-auto space-y-1.5 pt-2">
                        <p className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                          🗣️ Izgovor (Vuk): <span className="text-white font-serif">{aiTranslationResult.vukPhonetic || aiTranslationResult.transliteration}</span>
                        </p>
                        {aiTranslationResult.transliteration !== aiTranslationResult.vukPhonetic && (
                          <p className="text-xs font-mono text-zinc-400">
                            Transliteracija: <span className="text-zinc-300 italic">{aiTranslationResult.transliteration}</span>
                          </p>
                        )}
                        <p className="text-xs sm:text-sm font-medium text-emerald-300">
                          🇷🇸 Značenje: <span className="text-white">{aiTranslationResult.serbian}</span>
                        </p>
                        <p className="text-xs text-zinc-400 italic">
                          🇬🇧 Izvorni engleski: "{aiTranslationResult.english}"
                        </p>
                      </div>
                    </div>

                    {/* WORD BREAKDOWN GRID (Configurator Cards) */}
                    {aiTranslationResult.words && aiTranslationResult.words.length > 0 && (
                      <div className="space-y-3 border-t pt-4 border-zinc-800">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-400" />
                            Konfiguracija Reč po Reč (Interaktivne Kartice):
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {aiTranslationResult.words.length} reči
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {aiTranslationResult.words.map((w, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2 relative group",
                                isDarkMode ? "bg-zinc-900/90 border-zinc-800 hover:border-blue-500/50" : "bg-zinc-50 border-zinc-200 hover:border-blue-400 shadow-sm"
                              )}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-2xl p-1 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                  {w.emoji || '✨'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => speakHebrew(w.hebrew)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-blue-600/30 transition-all"
                                    title="Izgovori reč"
                                  >
                                    <Volume2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveSingleAiWord(w)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-amber-500/20 transition-all"
                                    title="Dodaj u moj rečnik"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div dir="rtl" className="text-xl font-bold font-serif text-blue-200">
                                  {w.hebrew}
                                </div>
                                <div className="text-[11px] font-mono text-amber-400 font-bold">
                                  {w.vuk || w.transliteration}
                                </div>
                                <div className="text-xs text-white font-medium">
                                  {w.serbian}
                                </div>
                                <div className="text-[10px] text-zinc-400 italic">
                                  {w.english}
                                </div>
                              </div>

                              {w.category && (
                                <div className="pt-1 border-t border-zinc-800 text-[9px] uppercase font-mono text-zinc-500">
                                  {w.category}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* GRAMMAR NOTE */}
                    {aiTranslationResult.grammarNote && (
                      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold font-mono uppercase text-blue-400 text-[10px] block">💡 Lingvistička Beleška:</span>
                          <p className="mt-0.5 leading-relaxed">{aiTranslationResult.grammarNote}</p>
                        </div>
                      </div>
                    )}

                    {/* HISTORY DRAWER / PREVIOUS TRANSLATIONS */}
                    {aiConfigHistory.length > 1 && (
                      <div className="space-y-2 border-t pt-4 border-zinc-800">
                        <span className="text-[11px] font-mono font-bold uppercase text-zinc-400 flex items-center gap-1">
                          <History className="w-3.5 h-3.5 text-blue-400" />
                          Prethodno Konfigurisane Rečenice:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {aiConfigHistory.slice(1, 6).map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setAiInputSentence(item.english);
                                setAiTranslationResult(item);
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs border text-left transition-all flex items-center gap-1.5",
                                isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-blue-500/50 hover:text-white" : "bg-white border-zinc-200 text-zinc-700"
                              )}
                            >
                              <span>{item.emojis?.join('') || '✨'}</span>
                              <span className="font-medium max-w-xs truncate">{item.english}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

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
                        <option value="alphabet">🔤 Hebrejska Abeceda (Alef-Bet - 27 Slova & Gematrija)</option>
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

        {/* VISUAL FLASHCARDS GAME VIEW */}
        {activeTab === 'flashcards' && (
          <motion.div
            key="flashcards-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <HebrewFlashcardsGame
              vocabList={fullVocabList}
              masteredIds={masteredIds}
              toggleMastered={toggleMastered}
              speakHebrew={speakHebrew}
              isPronouncing={isPronouncing}
              isDarkMode={isDarkMode}
              isGirlyMode={isGirlyMode}
              onSwitchToQuiz={() => { setActiveTab('quiz'); generateQuizRound(); }}
            />
          </motion.div>
        )}

        {/* ALPHABET (ALEF-BET) VIEW */}
        {activeTab === 'alphabet' && (
          <motion.div
            key="alphabet"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Banner */}
            <div className={cn(
              "p-6 md:p-8 rounded-3xl border relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6",
              isDarkMode ? "bg-gradient-to-br from-blue-950/60 via-zinc-900 to-indigo-950/40 border-blue-500/30" : "bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200 shadow-md"
            )}>
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    📜 Hebrejski Alef-Bet
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    🔢 Gematrija Sistem
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-blue-400">
                  Hebrejska Abeceda & Fonetika (אָלֶף־בֵּית)
                </h3>
                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                  Naučite svih 27 slova (22 osnovnih + 5 krajnjih/Sofit oblika) uz zvučni izgovor, Vuk Karadžić fonetsku transliteraciju, engleska značenja i primere reči sa prevodom.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    setHQuizCategory('alphabet');
                    setActiveTab('quiz');
                    generateQuizRound();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4" /> Pokreni Abeceda Kviz 🚀
                </button>
              </div>
            </div>

            {/* Controls: Search & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setAlphabetFilter('all')}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    alphabetFilter === 'all'
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  🌐 Svih 27 Slova
                </button>
                <button
                  onClick={() => setAlphabetFilter('standard')}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    alphabetFilter === 'standard'
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  🔤 Osnovna (22)
                </button>
                <button
                  onClick={() => setAlphabetFilter('sofit')}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    alphabetFilter === 'sofit'
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600"
                  )}
                >
                  ✨ Sofit (Krajnja - 5)
                </button>
              </div>

              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Pretraži slovo, naziv ili Vuk zvuk..."
                  value={alphabetSearch}
                  onChange={(e) => setAlphabetSearch(e.target.value)}
                  className={cn(
                    "w-full pl-9 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
                  )}
                />
              </div>
            </div>

            {/* Alphabet Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {HEBREW_ALPHABET_DATA.filter(item => {
                const matchesFilter =
                  alphabetFilter === 'all' ||
                  (alphabetFilter === 'sofit' && item.isFinal) ||
                  (alphabetFilter === 'standard' && !item.isFinal);
                const q = alphabetSearch.toLowerCase();
                const matchesSearch =
                  !q ||
                  item.char.includes(q) ||
                  item.name.toLowerCase().includes(q) ||
                  item.vuk.toLowerCase().includes(q) ||
                  item.english.toLowerCase().includes(q) ||
                  item.exampleWord.toLowerCase().includes(q) ||
                  item.exampleTranslationSr.toLowerCase().includes(q);
                return matchesFilter && matchesSearch;
              }).map(item => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3 }}
                  className={cn(
                    "p-5 rounded-2xl border flex flex-col justify-between space-y-4 relative group transition-all",
                    isDarkMode ? "bg-zinc-900/90 border-zinc-800 hover:border-blue-500/50" : "bg-white border-zinc-200 hover:border-blue-300 shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-3xl font-serif font-black shadow-inner">
                        {item.char}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-blue-400 font-serif flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isFinal && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Sofit
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] font-mono font-semibold text-emerald-400">
                          Vuk: "{item.vuk}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => speakHebrew(item.char, `alphabet-${item.id}`)}
                      className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all border border-blue-500/20"
                      title="Slušaj izgovor slova"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs border-t pt-3 border-zinc-800/50">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400">Engleski Fonem:</span>
                      <span className="text-zinc-200 font-bold">{item.english}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-400">Gematrija (Broj):</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                        {item.gematria}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-[11px] space-y-1 mt-2">
                      <span className="text-[10px] font-mono font-bold text-blue-400 block uppercase">Primer Reči:</span>
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-blue-200 text-sm" dir="rtl">{item.exampleWord}</span>
                        <span className="text-zinc-300 font-semibold">{item.exampleTranslationSr} ({item.exampleTranslationEn})</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
