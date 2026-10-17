/**
 * Comprehensive Chinese Translation & Linguistic Engine
 * Handles bilingual (English & Serbian/Croatian) input translation into Simplified Chinese
 * with Pinyin, Vuk Karadžić phonetic reading, sequential word-by-word breakdown,
 * and contextual emoji decoration.
 */

export interface ChineseWordMeta {
  chinese: string;
  chineseTraditional: string;
  pinyin: string;
  vuk: string;
  english: string;
  serbian: string;
  emoji: string;
  category: 'noun' | 'verb' | 'adjective' | 'pronoun' | 'particle' | 'measure_word' | 'expression' | 'chengyu' | 'adverb' | 'number';
}

export interface ConfiguredChineseResult {
  chineseWithEmojis: string;
  chinese: string;
  chineseTraditional: string;
  pinyin: string;
  vukPhonetic: string;
  serbian: string;
  english: string;
  emojis: string[];
  words: ChineseWordMeta[];
  grammarNote: string;
}

// Multi-word phrase presets (Solidarity, Greetings, Philosophy)
export const CHINESE_EXACT_PRESETS: Record<string, {
  chinese: string;
  chineseTraditional?: string;
  pinyin: string;
  vuk: string;
  serbian: string;
  emojis: string[];
  words: ChineseWordMeta[];
  grammarNote: string;
}> = {
  "peace and wisdom": {
    chinese: "和平与智慧是真正的力量。",
    chineseTraditional: "和平與智慧是真正的力量。",
    pinyin: "Hépíng yǔ zhìhuì shì zhēnzhèng de lìliàng.",
    vuk: "He-ping jü dži-huej ši džen-dženg de li-ljang.",
    serbian: "Mir i mudrost su istinska snaga.",
    emojis: ["🕊️", "🧠", "✨"],
    words: [
      { chinese: "和平", chineseTraditional: "和平", pinyin: "hépíng", vuk: "he-ping", english: "peace", serbian: "mir", emoji: "🕊️", category: "noun" },
      { chinese: "与", chineseTraditional: "與", pinyin: "yǔ", vuk: "jü", english: "and", serbian: "i", emoji: "🔗", category: "particle" },
      { chinese: "智慧", chineseTraditional: "智慧", pinyin: "zhìhuì", vuk: "dži-huej", english: "wisdom", serbian: "mudrost", emoji: "🧠", category: "noun" },
      { chinese: "是", chineseTraditional: "是", pinyin: "shì", vuk: "ši", english: "is / are", serbian: "su / jeste", emoji: "⚡", category: "verb" },
      { chinese: "真正", chineseTraditional: "真正", pinyin: "zhēnzhèng", vuk: "džen-dženg", english: "true / real", serbian: "istinski", emoji: "💎", category: "adjective" },
      { chinese: "力量", chineseTraditional: "力量", pinyin: "lìliàng", vuk: "li-ljang", english: "strength / power", serbian: "snaga", emoji: "💪", category: "noun" }
    ],
    grammarNote: "Reč 'yǔ' (与) je elegantni veznik 'i' koji prirodno povezuje apstraktne imenice i vrline."
  },
  "mir i mudrost": {
    chinese: "和平与智慧是真正的力量。",
    chineseTraditional: "和平與智慧是真正的力量。",
    pinyin: "Hépíng yǔ zhìhuì shì zhēnzhèng de lìliàng.",
    vuk: "He-ping jü dži-huej ši džen-dženg de li-ljang.",
    serbian: "Mir i mudrost su istinska snaga.",
    emojis: ["🕊️", "🧠", "✨"],
    words: [
      { chinese: "和平", chineseTraditional: "和平", pinyin: "hépíng", vuk: "he-ping", english: "peace", serbian: "mir", emoji: "🕊️", category: "noun" },
      { chinese: "与", chineseTraditional: "與", pinyin: "yǔ", vuk: "jü", english: "and", serbian: "i", emoji: "🔗", category: "particle" },
      { chinese: "智慧", chineseTraditional: "智慧", pinyin: "zhìhuì", vuk: "dži-huej", english: "wisdom", serbian: "mudrost", emoji: "🧠", category: "noun" },
      { chinese: "是", chineseTraditional: "是", pinyin: "shì", vuk: "ši", english: "is / are", serbian: "su / jeste", emoji: "⚡", category: "verb" },
      { chinese: "力量", chineseTraditional: "力量", pinyin: "lìliàng", vuk: "li-ljang", english: "strength", serbian: "snaga", emoji: "💪", category: "noun" }
    ],
    grammarNote: "Sintaksa SVO (Subjekat + Kopula 'shì' + Objekat) gradi osnovnu afirmaciju."
  },
  "good morning": {
    chinese: "早上好，愿你拥有美好充实的一天！",
    chineseTraditional: "早上好，願你擁有美好充實的一天！",
    pinyin: "Zǎoshang hǎo, yuàn nǐ yōngyǒu měihǎo chōngshí de yī tiān!",
    vuk: "Zao-šang hao, jüan ni jung-jou mej-hao čung-ši de ji tjen!",
    serbian: "Dobro jutro, želim ti predivan i ispunjen dan!",
    emojis: ["☀️", "🌅", "☕"],
    words: [
      { chinese: "早上好", chineseTraditional: "早上好", pinyin: "zǎoshang hǎo", vuk: "zao-šang hao", english: "good morning", serbian: "dobro jutro", emoji: "🌅", category: "expression" },
      { chinese: "愿", chineseTraditional: "願", pinyin: "yuàn", vuk: "jüan", english: "wish", serbian: "želeti", emoji: "🙏", category: "verb" },
      { chinese: "你", chineseTraditional: "你", pinyin: "nǐ", vuk: "ni", english: "you", serbian: "ti", emoji: "👉", category: "pronoun" },
      { chinese: "美好", chineseTraditional: "美好", pinyin: "měihǎo", vuk: "mej-hao", english: "beautiful", serbian: "predivan", emoji: "✨", category: "adjective" },
      { chinese: "一天", chineseTraditional: "一天", pinyin: "yī tiān", vuk: "ji tjen", english: "one day", serbian: "jedan dan", emoji: "📅", category: "noun" }
    ],
    grammarNote: "Pozdrav 'zǎoshang hǎo' (早上好) sastoji se od reči za jutro (早上) i prideva 'dobro' (好)."
  },
  "dobro jutro": {
    chinese: "早上好，愿你拥有美好的一天！",
    chineseTraditional: "早上好，願你擁有美好的一天！",
    pinyin: "Zǎoshang hǎo, yuàn nǐ yōngyǒu měihǎo de yī tiān!",
    vuk: "Zao-šang hao, jüan ni jung-jou mej-hao de ji tjen!",
    serbian: "Dobro jutro, želim ti predivan dan!",
    emojis: ["☀️", "🌅", "☕"],
    words: [
      { chinese: "早上好", chineseTraditional: "早上好", pinyin: "zǎoshang hǎo", vuk: "zao-šang hao", english: "good morning", serbian: "dobro jutro", emoji: "🌅", category: "expression" },
      { chinese: "一天", chineseTraditional: "一天", pinyin: "yī tiān", vuk: "ji tjen", english: "one day", serbian: "dan", emoji: "📅", category: "noun" }
    ],
    grammarNote: "Jutarnji pozdrav se koristi u prvoj polovini dana."
  },
  "friends all over the world": {
    chinese: "只愿提醒你，世界各地都有你的朋友。我们看见你，我们在乎你，你从来不是孤单一人。",
    chineseTraditional: "只願提醒你，世界各地都有你的朋友。我們看見你，我們在乎你，你從來不是孤單一人。",
    pinyin: "Zhǐ yuàn tíxǐng nǐ, shìjiè gèdì dōu yǒu nǐ de péngyǒu. Wǒmen kànjiàn nǐ, wǒmen zàihu nǐ, nǐ cónglái bùshì gūdān yīrén.",
    vuk: "Dži jüan tihing ni, ši-đie ge-di dou jou ni de peng-jou. Vo-men kan-đien ni, vo-men caj-hu ni, ni cong-laj bu-ši gu-dan ji-žen.",
    serbian: "Samo podsetnik da imaš prijatelje širom sveta. Vidimo te, brinemo o tebi, i nikada nisi sam.",
    emojis: ["🌍", "🤝", "❤️"],
    words: [
      { chinese: "世界各地", chineseTraditional: "世界各地", pinyin: "shìjiè gèdì", vuk: "ši-đie ge-di", english: "all over the world", serbian: "širom sveta", emoji: "🌍", category: "noun" },
      { chinese: "朋友", chineseTraditional: "朋友", pinyin: "péngyǒu", vuk: "peng-jou", english: "friends", serbian: "prijatelji", emoji: "🤝", category: "noun" },
      { chinese: "孤单", chineseTraditional: "孤單", pinyin: "gūdān", vuk: "gu-dan", english: "lonely / alone", serbian: "usamljen / sam", emoji: "❤️", category: "adjective" }
    ],
    grammarNote: "Fraza 'cónglái bùshì' (从来不是) znači 'nikada nisi bio' i naglašava trajnu podršku."
  }
};

// Comprehensive Bilingual Vocabulary Dictionary (English + Serbian/Croatian)
export const CHINESE_DICT: Record<string, {
  zh: string;
  trad: string;
  pin: string;
  vuk: string;
  srb: string;
  en: string;
  emoji: string;
  cat: ChineseWordMeta['category'];
}> = {
  // --- PRONOUNS & DETERMINERS ---
  i: { zh: "我", trad: "我", pin: "wǒ", vuk: "vo", srb: "ja", en: "I", emoji: "👤", cat: "pronoun" },
  me: { zh: "我", trad: "我", pin: "wǒ", vuk: "vo", srb: "mene / mi", en: "me", emoji: "👤", cat: "pronoun" },
  my: { zh: "我的", trad: "我的", pin: "wǒ de", vuk: "vo de", srb: "moj / moja / moje", en: "my", emoji: "👤", cat: "pronoun" },
  mine: { zh: "我的", trad: "我的", pin: "wǒ de", vuk: "vo de", srb: "moje", en: "mine", emoji: "👤", cat: "pronoun" },
  you: { zh: "你", trad: "你", pin: "nǐ", vuk: "ni", srb: "ti", en: "you", emoji: "👉", cat: "pronoun" },
  your: { zh: "你的", trad: "你的", pin: "nǐ de", vuk: "ni de", srb: "tvoj / vaša", en: "your", emoji: "👉", cat: "pronoun" },
  yours: { zh: "你的", trad: "你的", pin: "nǐ de", vuk: "ni de", srb: "tvoje", en: "yours", emoji: "👉", cat: "pronoun" },
  he: { zh: "他", trad: "他", pin: "tā", vuk: "ta", srb: "on", en: "he", emoji: "👨", cat: "pronoun" },
  him: { zh: "他", trad: "他", pin: "tā", vuk: "ta", srb: "njega", en: "him", emoji: "👨", cat: "pronoun" },
  his: { zh: "他的", trad: "他的", pin: "tā de", vuk: "ta de", srb: "njegov", en: "his", emoji: "👨", cat: "pronoun" },
  she: { zh: "她", trad: "她", pin: "tā", vuk: "ta", srb: "ona", en: "she", emoji: "👩", cat: "pronoun" },
  her: { zh: "她的", trad: "她的", pin: "tā de", vuk: "ta de", srb: "njen", en: "her", emoji: "👩", cat: "pronoun" },
  hers: { zh: "她的", trad: "她的", pin: "tā de", vuk: "ta de", srb: "njeno", en: "hers", emoji: "👩", cat: "pronoun" },
  it: { zh: "它", trad: "它", pin: "tā", vuk: "ta", srb: "to / ono", en: "it", emoji: "📦", cat: "pronoun" },
  its: { zh: "它的", trad: "它的", pin: "tā de", vuk: "ta de", srb: "njegovo", en: "its", emoji: "📦", cat: "pronoun" },
  we: { zh: "我们", trad: "我們", pin: "wǒmen", vuk: "vo-men", srb: "mi", en: "we", emoji: "👥", cat: "pronoun" },
  us: { zh: "我们", trad: "我們", pin: "wǒmen", vuk: "vo-men", srb: "nas", en: "us", emoji: "👥", cat: "pronoun" },
  our: { zh: "我们的", trad: "我們的", pin: "wǒmen de", vuk: "vo-men de", srb: "naš / naša", en: "our", emoji: "👥", cat: "pronoun" },
  ours: { zh: "我们的", trad: "我們的", pin: "wǒmen de", vuk: "vo-men de", srb: "naše", en: "ours", emoji: "👥", cat: "pronoun" },
  they: { zh: "他们", trad: "他們", pin: "tāmen", vuk: "ta-men", srb: "oni", en: "they", emoji: "👥", cat: "pronoun" },
  them: { zh: "他们", trad: "他們", pin: "tāmen", vuk: "ta-men", srb: "njih", en: "them", emoji: "👥", cat: "pronoun" },
  their: { zh: "他们的", trad: "他們的", pin: "tāmen de", vuk: "ta-men de", srb: "njihov", en: "their", emoji: "👥", cat: "pronoun" },
  this: { zh: "这", trad: "這", pin: "zhè", vuk: "dže", srb: "ovo / ovaj", en: "this", emoji: "👇", cat: "pronoun" },
  that: { zh: "那", trad: "那", pin: "nà", vuk: "na", srb: "ono / onaj", en: "that", emoji: "👉", cat: "pronoun" },
  these: { zh: "这些", trad: "這些", pin: "zhèxiē", vuk: "dže-sje", srb: "ovi / ove", en: "these", emoji: "👇", cat: "pronoun" },
  those: { zh: "那些", trad: "那些", pin: "nàxiē", vuk: "na-sje", srb: "oni / one", en: "those", emoji: "👉", cat: "pronoun" },
  here: { zh: "这里", trad: "這裡", pin: "zhèlǐ", vuk: "dže-li", srb: "ovde", en: "here", emoji: "📍", cat: "expression" },
  there: { zh: "那里", trad: "那裡", pin: "nàlǐ", vuk: "na-li", srb: "tamo", en: "there", emoji: "📍", cat: "expression" },
  who: { zh: "谁", trad: "誰", pin: "shéi", vuk: "šej", srb: "ko", en: "who", emoji: "❓", cat: "pronoun" },
  what: { zh: "什么", trad: "什麼", pin: "shénme", vuk: "šen-me", srb: "šta", en: "what", emoji: "❓", cat: "pronoun" },
  where: { zh: "哪里", trad: "哪裡", pin: "nǎlǐ", vuk: "na-li", srb: "gde", en: "where", emoji: "📍", cat: "pronoun" },
  when: { zh: "什么时候", trad: "什麼時候", pin: "shénme shíhou", vuk: "šen-me ši-hou", srb: "kada", en: "when", emoji: "⏰", cat: "pronoun" },
  why: { zh: "为什么", trad: "為什麼", pin: "wèishénme", vuk: "vej-šen-me", srb: "zašto", en: "why", emoji: "🤔", cat: "pronoun" },
  how: { zh: "怎么", trad: "怎麼", pin: "zěnme", vuk: "dzen-me", srb: "kako", en: "how", emoji: "❓", cat: "pronoun" },
  all: { zh: "全部", trad: "全部", pin: "quánbù", vuk: "ćüan-bu", srb: "sve / svi", en: "all", emoji: "🌐", cat: "adverb" },
  everyone: { zh: "大家", trad: "大家", pin: "dàjiā", vuk: "da-đja", srb: "svi / svako", en: "everyone", emoji: "👨‍👩‍👧‍👦", cat: "pronoun" },
  everything: { zh: "一切", trad: "一切", pin: "yīqiè", vuk: "ji-ćie", srb: "sve", en: "everything", emoji: "🌐", cat: "pronoun" },
  someone: { zh: "有人", trad: "有人", pin: "yǒurén", vuk: "jou-žen", srb: "neko", en: "someone", emoji: "👤", cat: "pronoun" },

  // --- SERBIAN/CROATIAN PRONOUNS ---
  ja: { zh: "我", trad: "我", pin: "wǒ", vuk: "vo", srb: "ja", en: "I", emoji: "👤", cat: "pronoun" },
  ti: { zh: "你", trad: "你", pin: "nǐ", vuk: "ni", srb: "ti", en: "you", emoji: "👉", cat: "pronoun" },
  on: { zh: "他", trad: "他", pin: "tā", vuk: "ta", srb: "on", en: "he", emoji: "👨", cat: "pronoun" },
  ona: { zh: "她", trad: "她", pin: "tā", vuk: "ta", srb: "ona", en: "she", emoji: "👩", cat: "pronoun" },
  ono: { zh: "它", trad: "它", pin: "tā", vuk: "ta", srb: "ono", en: "it", emoji: "📦", cat: "pronoun" },
  mi: { zh: "我们", trad: "我們", pin: "wǒmen", vuk: "vo-men", srb: "mi", en: "we", emoji: "👥", cat: "pronoun" },
  vi: { zh: "你们", trad: "你們", pin: "nǐmen", vuk: "ni-men", srb: "vi", en: "you (plural)", emoji: "👥", cat: "pronoun" },
  oni: { zh: "他们", trad: "他們", pin: "tāmen", vuk: "ta-men", srb: "oni", en: "they", emoji: "👥", cat: "pronoun" },
  one_zene: { zh: "她们", trad: "她們", pin: "tāmen", vuk: "ta-men", srb: "one", en: "they (f)", emoji: "👥", cat: "pronoun" },
  mene: { zh: "我", trad: "我", pin: "wǒ", vuk: "vo", srb: "mene", en: "me", emoji: "👤", cat: "pronoun" },
  tebe: { zh: "你", trad: "你", pin: "nǐ", vuk: "ni", srb: "tebe", en: "you", emoji: "👉", cat: "pronoun" },
  njega: { zh: "他", trad: "他", pin: "tā", vuk: "ta", srb: "njega", en: "him", emoji: "👨", cat: "pronoun" },
  nju: { zh: "她", trad: "她", pin: "tā", vuk: "ta", srb: "nju", en: "her", emoji: "👩", cat: "pronoun" },
  nas: { zh: "我们", trad: "我們", pin: "wǒmen", vuk: "vo-men", srb: "nas", en: "us", emoji: "👥", cat: "pronoun" },
  vas: { zh: "你们", trad: "你們", pin: "nǐmen", vuk: "ni-men", srb: "vas", en: "you", emoji: "👥", cat: "pronoun" },
  njih: { zh: "他们", trad: "他們", pin: "tāmen", vuk: "ta-men", srb: "njih", en: "them", emoji: "👥", cat: "pronoun" },
  moj: { zh: "我的", trad: "我的", pin: "wǒ de", vuk: "vo de", srb: "moj", en: "my", emoji: "👤", cat: "pronoun" },
  moja: { zh: "我的", trad: "我的", pin: "wǒ de", vuk: "vo de", srb: "moja", en: "my", emoji: "👤", cat: "pronoun" },
  moje: { zh: "我的", trad: "我的", pin: "wǒ de", vuk: "vo de", srb: "moje", en: "my", emoji: "👤", cat: "pronoun" },
  tvoj: { zh: "你的", trad: "你的", pin: "nǐ de", vuk: "ni de", srb: "tvoj", en: "your", emoji: "👉", cat: "pronoun" },
  tvoja: { zh: "你的", trad: "你的", pin: "nǐ de", vuk: "ni de", srb: "tvoja", en: "your", emoji: "👉", cat: "pronoun" },
  tvoje: { zh: "你的", trad: "你的", pin: "nǐ de", vuk: "ni de", srb: "tvoje", en: "your", emoji: "👉", cat: "pronoun" },
  nasem: { zh: "我们的", trad: "我們的", pin: "wǒmen de", vuk: "vo-men de", srb: "našem", en: "our", emoji: "👥", cat: "pronoun" },
  nasa: { zh: "我们的", trad: "我們的", pin: "wǒmen de", vuk: "vo-men de", srb: "naša", en: "our", emoji: "👥", cat: "pronoun" },
  nase: { zh: "我们的", trad: "我們的", pin: "wǒmen de", vuk: "vo-men de", srb: "naše", en: "our", emoji: "👥", cat: "pronoun" },
  ovo: { zh: "这", trad: "這", pin: "zhè", vuk: "dže", srb: "ovo", en: "this", emoji: "👇", cat: "pronoun" },
  ovaj: { zh: "这", trad: "這", pin: "zhè", vuk: "dže", srb: "ovaj", en: "this", emoji: "👇", cat: "pronoun" },
  ova: { zh: "这", trad: "這", pin: "zhè", vuk: "dže", srb: "ova", en: "this", emoji: "👇", cat: "pronoun" },
  to: { zh: "那", trad: "那", pin: "nà", vuk: "na", srb: "to", en: "that", emoji: "👉", cat: "pronoun" },
  onaj: { zh: "那", trad: "那", pin: "nà", vuk: "na", srb: "onaj", en: "that", emoji: "👉", cat: "pronoun" },
  onaa: { zh: "那", trad: "那", pin: "nà", vuk: "na", srb: "ona", en: "that", emoji: "👉", cat: "pronoun" },
  ovde: { zh: "这里", trad: "這裡", pin: "zhèlǐ", vuk: "dže-li", srb: "ovde", en: "here", emoji: "📍", cat: "expression" },
  tamo: { zh: "那里", trad: "那裡", pin: "nàlǐ", vuk: "na-li", srb: "tamo", en: "there", emoji: "📍", cat: "expression" },
  ko: { zh: "谁", trad: "誰", pin: "shéi", vuk: "šej", srb: "ko", en: "who", emoji: "❓", cat: "pronoun" },
  sta: { zh: "什么", trad: "什麼", pin: "shénme", vuk: "šen-me", srb: "šta", en: "what", emoji: "❓", cat: "pronoun" },
  sto: { zh: "什么", trad: "什麼", pin: "shénme", vuk: "šen-me", srb: "što / šta", en: "what", emoji: "❓", cat: "pronoun" },
  gde: { zh: "哪里", trad: "哪裡", pin: "nǎlǐ", vuk: "na-li", srb: "gde", en: "where", emoji: "📍", cat: "pronoun" },
  kad: { zh: "什么时候", trad: "什麼時候", pin: "shénme shíhou", vuk: "šen-me ši-hou", srb: "kad", en: "when", emoji: "⏰", cat: "pronoun" },
  kada: { zh: "什么时候", trad: "什麼時候", pin: "shénme shíhou", vuk: "šen-me ši-hou", srb: "kada", en: "when", emoji: "⏰", cat: "pronoun" },
  zasto: { zh: "为什么", trad: "為什麼", pin: "wèishénme", vuk: "vej-šen-me", srb: "zašto", en: "why", emoji: "🤔", cat: "pronoun" },
  kako: { zh: "怎么", trad: "怎麼", pin: "zěnme", vuk: "dzen-me", srb: "kako", en: "how", emoji: "❓", cat: "pronoun" },
  svi: { zh: "大家", trad: "大家", pin: "dàjiā", vuk: "da-đja", srb: "svi", en: "all / everyone", emoji: "👨‍👩‍👧‍👦", cat: "pronoun" },
  sve: { zh: "一切", trad: "一切", pin: "yīqiè", vuk: "ji-ćie", srb: "sve", en: "everything", emoji: "🌐", cat: "pronoun" },

  // --- MODAL & AUXILIARY VERBS (WANT, NEED, CAN, BE, HAVE) ---
  want: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želeti", en: "want", emoji: "💭", cat: "verb" },
  wants: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želi", en: "wants", emoji: "💭", cat: "verb" },
  wanted: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želeo", en: "wanted", emoji: "💭", cat: "verb" },
  zelim: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želim", en: "I want", emoji: "💭", cat: "verb" },
  zelis: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želiš", en: "you want", emoji: "💭", cat: "verb" },
  zeli: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želi", en: "wants", emoji: "💭", cat: "verb" },
  zelimo: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želimo", en: "we want", emoji: "💭", cat: "verb" },
  zelite: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želite", en: "you want", emoji: "💭", cat: "verb" },
  zeleti: { zh: "想", trad: "想", pin: "xiǎng", vuk: "sjang", srb: "želeti", en: "to want", emoji: "💭", cat: "verb" },
  hocu: { zh: "要", trad: "要", pin: "yào", vuk: "jao", srb: "hoću", en: "I will / want", emoji: "⚡", cat: "verb" },
  hoces: { zh: "要", trad: "要", pin: "yào", vuk: "jao", srb: "hoćeš", en: "you will / want", emoji: "⚡", cat: "verb" },
  hoce: { zh: "要", trad: "要", pin: "yào", vuk: "jao", srb: "hoće", en: "wants / will", emoji: "⚡", cat: "verb" },
  hocemo: { zh: "要", trad: "要", pin: "yào", vuk: "jao", srb: "hoćemo", en: "we will", emoji: "⚡", cat: "verb" },
  hteti: { zh: "要", trad: "要", pin: "yào", vuk: "jao", srb: "hteti", en: "to want / will", emoji: "⚡", cat: "verb" },

  need: { zh: "需要", trad: "需要", pin: "xūyào", vuk: "sji-jao", srb: "trebati", en: "need", emoji: "⚡", cat: "verb" },
  needs: { zh: "需要", trad: "需要", pin: "xūyào", vuk: "sji-jao", srb: "treba", en: "needs", emoji: "⚡", cat: "verb" },
  treba: { zh: "需要", trad: "需要", pin: "xūyào", vuk: "sji-jao", srb: "treba", en: "needed / should", emoji: "⚡", cat: "verb" },
  trebam: { zh: "需要", trad: "需要", pin: "xūyào", vuk: "sji-jao", srb: "trebam", en: "I need", emoji: "⚡", cat: "verb" },

  can: { zh: "能", trad: "能", pin: "néng", vuk: "neng", srb: "moći", en: "can", emoji: "💪", cat: "verb" },
  could: { zh: "可以", trad: "可以", pin: "kěyǐ", vuk: "ke-ji", srb: "mogao bih", en: "could", emoji: "✨", cat: "verb" },
  mogu: { zh: "能", trad: "能", pin: "néng", vuk: "neng", srb: "mogu", en: "I can", emoji: "💪", cat: "verb" },
  mozes: { zh: "能", trad: "能", pin: "néng", vuk: "neng", srb: "možeš", en: "you can", emoji: "💪", cat: "verb" },
  moze: { zh: "可以", trad: "可以", pin: "kěyǐ", vuk: "ke-ji", srb: "može", en: "can / possible", emoji: "✨", cat: "verb" },
  mozemo: { zh: "能", trad: "能", pin: "néng", vuk: "neng", srb: "možemo", en: "we can", emoji: "💪", cat: "verb" },

  must: { zh: "必须", trad: "必須", pin: "bìxū", vuk: "bi-sji", srb: "morati", en: "must", emoji: "❗", cat: "verb" },
  should: { zh: "应该", trad: "應該", pin: "yīnggāi", vuk: "jing-gaj", srb: "trebalo bi", en: "should", emoji: "🧭", cat: "verb" },
  moram: { zh: "必须", trad: "必須", pin: "bìxū", vuk: "bi-sji", srb: "moram", en: "I must", emoji: "❗", cat: "verb" },
  moras: { zh: "必须", trad: "必須", pin: "bìxū", vuk: "bi-sji", srb: "moraš", en: "you must", emoji: "❗", cat: "verb" },
  mora: { zh: "必须", trad: "必須", pin: "bìxū", vuk: "bi-sji", srb: "mora", en: "must", emoji: "❗", cat: "verb" },

  like: { zh: "喜欢", trad: "喜歡", pin: "xǐhuan", vuk: "si-huan", srb: "voleti / sviđati se", en: "like", emoji: "👍", cat: "verb" },
  likes: { zh: "喜欢", trad: "喜歡", pin: "xǐhuan", vuk: "si-huan", srb: "voli", en: "likes", emoji: "👍", cat: "verb" },
  svidja: { zh: "喜欢", trad: "喜歡", pin: "xǐhuan", vuk: "si-huan", srb: "sviđa mi se", en: "I like", emoji: "👍", cat: "verb" },
  love: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "voleti / ljubav", en: "love", emoji: "❤️", cat: "verb" },
  loves: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "voli", en: "loves", emoji: "❤️", cat: "verb" },
  loving: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "voleći", en: "loving", emoji: "❤️", cat: "verb" },
  volim: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "volim", en: "I love", emoji: "❤️", cat: "verb" },
  volis: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "voliš", en: "you love", emoji: "❤️", cat: "verb" },
  voli: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "voli", en: "loves", emoji: "❤️", cat: "verb" },
  volimo: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "volimo", en: "we love", emoji: "❤️", cat: "verb" },
  voleti: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "voleti", en: "to love", emoji: "❤️", cat: "verb" },
  ljubav: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "ljubav", en: "love", emoji: "💖", cat: "noun" },
  ljubavi: { zh: "爱", trad: "愛", pin: "ài", vuk: "aj", srb: "ljubavi", en: "love", emoji: "💖", cat: "noun" },

  have: { zh: "有", trad: "有", pin: "yǒu", vuk: "jou", srb: "imati", en: "have", emoji: "🤲", cat: "verb" },
  has: { zh: "有", trad: "有", pin: "yǒu", vuk: "jou", srb: "ima", en: "has", emoji: "🤲", cat: "verb" },
  had: { zh: "曾经有", trad: "曾經有", pin: "céngjīng yǒu", vuk: "ceng-đing jou", srb: "imao", en: "had", emoji: "🤲", cat: "verb" },
  imam: { zh: "有", trad: "有", pin: "yǒu", vuk: "jou", srb: "imam", en: "I have", emoji: "🤲", cat: "verb" },
  imas: { zh: "有", trad: "有", pin: "yǒu", vuk: "jou", srb: "imaš", en: "you have", emoji: "🤲", cat: "verb" },
  ima: { zh: "有", trad: "有", pin: "yǒu", vuk: "jou", srb: "ima", en: "has / there is", emoji: "🤲", cat: "verb" },
  imamo: { zh: "有", trad: "有", pin: "yǒu", vuk: "jou", srb: "imamo", en: "we have", emoji: "🤲", cat: "verb" },
  imati: { zh: "有", trad: "有", pin: "yǒu", vuk: "jou", srb: "imati", en: "to have", emoji: "🤲", cat: "verb" },
  nemam: { zh: "没有", trad: "沒有", pin: "méiyǒu", vuk: "mej-jou", srb: "nemam", en: "I don't have", emoji: "🚫", cat: "verb" },
  nema: { zh: "没有", trad: "沒有", pin: "méiyǒu", vuk: "mej-jou", srb: "nema", en: "there is no", emoji: "🚫", cat: "verb" },

  is: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "jeste / je", en: "is", emoji: "⚡", cat: "verb" },
  are: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "su", en: "are", emoji: "⚡", cat: "verb" },
  am: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "sam", en: "am", emoji: "⚡", cat: "verb" },
  be: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "biti", en: "be", emoji: "⚡", cat: "verb" },
  was: { zh: "曾是", trad: "曾是", pin: "céng shì", vuk: "ceng ši", srb: "bio je", en: "was", emoji: "⏳", cat: "verb" },
  were: { zh: "曾是", trad: "曾是", pin: "céng shì", vuk: "ceng ši", srb: "bili su", en: "were", emoji: "⏳", cat: "verb" },
  sam: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "sam", en: "am", emoji: "⚡", cat: "verb" },
  si: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "si", en: "are", emoji: "⚡", cat: "verb" },
  je: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "je", en: "is", emoji: "⚡", cat: "verb" },
  smo: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "smo", en: "are", emoji: "⚡", cat: "verb" },
  ste: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "ste", en: "are", emoji: "⚡", cat: "verb" },
  su: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "su", en: "are", emoji: "⚡", cat: "verb" },
  biti: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "biti", en: "to be", emoji: "⚡", cat: "verb" },

  // --- ACTIONS & VERBS ---
  drink: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "piti", en: "drink", emoji: "🍵", cat: "verb" },
  drinks: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "pije", en: "drinks", emoji: "🍵", cat: "verb" },
  drinking: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "pije", en: "drinking", emoji: "🍵", cat: "verb" },
  drank: { zh: "喝了", trad: "喝了", pin: "hē le", vuk: "he le", srb: "popio", en: "drank", emoji: "🍵", cat: "verb" },
  pijem: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "pijem", en: "I drink", emoji: "🍵", cat: "verb" },
  pijes: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "piješ", en: "you drink", emoji: "🍵", cat: "verb" },
  pije: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "pije", en: "drinks", emoji: "🍵", cat: "verb" },
  pijemo: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "pijemo", en: "we drink", emoji: "🍵", cat: "verb" },
  piju: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "piju", en: "they drink", emoji: "🍵", cat: "verb" },
  piti: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "piti", en: "to drink", emoji: "🍵", cat: "verb" },
  popiti: { zh: "喝", trad: "喝", pin: "hē", vuk: "he", srb: "popiti", en: "to drink up", emoji: "🍵", cat: "verb" },

  eat: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "jesti", en: "eat", emoji: "🥢", cat: "verb" },
  eats: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "jede", en: "eats", emoji: "🥢", cat: "verb" },
  eating: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "jede", en: "eating", emoji: "🥢", cat: "verb" },
  ate: { zh: "吃了", trad: "吃了", pin: "chī le", vuk: "či le", srb: "pojeo", en: "ate", emoji: "🥢", cat: "verb" },
  jedem: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "jedem", en: "I eat", emoji: "🥢", cat: "verb" },
  jedes: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "jedeš", en: "you eat", emoji: "🥢", cat: "verb" },
  jede: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "jede", en: "eats", emoji: "🥢", cat: "verb" },
  jedemo: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "jedemo", en: "we eat", emoji: "🥢", cat: "verb" },
  jesti: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "jesti", en: "to eat", emoji: "🥢", cat: "verb" },
  pojesti: { zh: "吃", trad: "吃", pin: "chī", vuk: "či", srb: "pojesti", en: "to eat up", emoji: "🥢", cat: "verb" },

  learn: { zh: "学习", trad: "學習", pin: "xuéxí", vuk: "sjüe-si", srb: "učiti", en: "learn", emoji: "📚", cat: "verb" },
  learns: { zh: "学习", trad: "學習", pin: "xuéxí", vuk: "sjüe-si", srb: "uči", en: "learns", emoji: "📚", cat: "verb" },
  learning: { zh: "学", trad: "學", pin: "xué", vuk: "sjüe", srb: "učenje / uči", en: "learning", emoji: "📚", cat: "verb" },
  study: { zh: "学习", trad: "學習", pin: "xuéxí", vuk: "sjüe-si", srb: "studirati / učiti", en: "study", emoji: "📖", cat: "verb" },
  ucim: { zh: "学习", trad: "學習", pin: "xuéxí", vuk: "sjüe-si", srb: "učim", en: "I learn", emoji: "📚", cat: "verb" },
  ucis: { zh: "学习", trad: "學習", pin: "xuéxí", vuk: "sjüe-si", srb: "učiš", en: "you learn", emoji: "📚", cat: "verb" },
  uci: { zh: "学习", trad: "學習", pin: "xuéxí", vuk: "sjüe-si", srb: "uči", en: "learns", emoji: "📚", cat: "verb" },
  ucimo: { zh: "学习", trad: "學習", pin: "xuéxí", vuk: "sjüe-si", srb: "učimo", en: "we learn", emoji: "📚", cat: "verb" },
  uciti: { zh: "学习", trad: "學習", pin: "xuéxí", vuk: "sjüe-si", srb: "učiti", en: "to learn", emoji: "📚", cat: "verb" },
  nauciti: { zh: "学会", trad: "學會", pin: "xuéhuì", vuk: "sjüe-huej", srb: "naučiti", en: "to master / learn", emoji: "🎓", cat: "verb" },

  speak: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "govoriti", en: "speak", emoji: "🗣️", cat: "verb" },
  speaks: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "govori", en: "speaks", emoji: "🗣️", cat: "verb" },
  say: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "reći", en: "say", emoji: "💬", cat: "verb" },
  says: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "kaže", en: "says", emoji: "💬", cat: "verb" },
  talk: { zh: "谈", trad: "談", pin: "tán", vuk: "tan", srb: "razgovarati", en: "talk", emoji: "💬", cat: "verb" },
  govorim: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "govorim", en: "I speak", emoji: "🗣️", cat: "verb" },
  govori: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "govori", en: "speaks", emoji: "🗣️", cat: "verb" },
  govoriti: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "govoriti", en: "to speak", emoji: "🗣️", cat: "verb" },
  kazem: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "kažem", en: "I say", emoji: "💬", cat: "verb" },
  kaze: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "kaže", en: "says", emoji: "💬", cat: "verb" },
  reciti: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "reći", en: "to say", emoji: "💬", cat: "verb" },
  pricam: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "pričam", en: "I talk", emoji: "💬", cat: "verb" },
  prica: { zh: "说", trad: "說", pin: "shuō", vuk: "šuo", srb: "priča", en: "talks", emoji: "💬", cat: "verb" },

  read: { zh: "读", trad: "讀", pin: "dú", vuk: "du", srb: "čitati", en: "read", emoji: "📖", cat: "verb" },
  reads: { zh: "读", trad: "讀", pin: "dú", vuk: "du", srb: "čita", en: "reads", emoji: "📖", cat: "verb" },
  reading: { zh: "在读", trad: "在讀", pin: "zài dú", vuk: "caj du", srb: "čita", en: "reading", emoji: "📖", cat: "verb" },
  citam: { zh: "读", trad: "讀", pin: "dú", vuk: "du", srb: "čitam", en: "I read", emoji: "📖", cat: "verb" },
  cita: { zh: "读", trad: "讀", pin: "dú", vuk: "du", srb: "čita", en: "reads", emoji: "📖", cat: "verb" },
  citati: { zh: "读", trad: "讀", pin: "dú", vuk: "du", srb: "čitati", en: "to read", emoji: "📖", cat: "verb" },

  write: { zh: "写", trad: "寫", pin: "xiě", vuk: "sje", srb: "pisati", en: "write", emoji: "✍️", cat: "verb" },
  writes: { zh: "写", trad: "寫", pin: "xiě", vuk: "sje", srb: "piše", en: "writes", emoji: "✍️", cat: "verb" },
  pisem: { zh: "写", trad: "寫", pin: "xiě", vuk: "sje", srb: "pišem", en: "I write", emoji: "✍️", cat: "verb" },
  pise: { zh: "写", trad: "寫", pin: "xiě", vuk: "sje", srb: "piše", en: "writes", emoji: "✍️", cat: "verb" },
  pisati: { zh: "写", trad: "寫", pin: "xiě", vuk: "sje", srb: "pisati", en: "to write", emoji: "✍️", cat: "verb" },

  see: { zh: "看", trad: "看", pin: "kàn", vuk: "kan", srb: "videti", en: "see", emoji: "👀", cat: "verb" },
  sees: { zh: "看", trad: "看", pin: "kàn", vuk: "kan", srb: "vidi", en: "sees", emoji: "👀", cat: "verb" },
  saw: { zh: "看见", trad: "看見", pin: "kànjiàn", vuk: "kan-đjen", srb: "video", en: "saw", emoji: "👀", cat: "verb" },
  look: { zh: "看", trad: "看", pin: "kàn", vuk: "kan", srb: "gledati", en: "look", emoji: "👀", cat: "verb" },
  watch: { zh: "观看", trad: "觀看", pin: "guānkàn", vuk: "guan-kan", srb: "gledati", en: "watch", emoji: "📺", cat: "verb" },
  vidim: { zh: "看", trad: "看", pin: "kàn", vuk: "kan", srb: "vidim", en: "I see", emoji: "👀", cat: "verb" },
  vidi: { zh: "看", trad: "看", pin: "kàn", vuk: "kan", srb: "vidi", en: "sees", emoji: "👀", cat: "verb" },
  videti: { zh: "看见", trad: "看見", pin: "kànjiàn", vuk: "kan-đjen", srb: "videti", en: "to see", emoji: "👀", cat: "verb" },
  gledam: { zh: "看", trad: "看", pin: "kàn", vuk: "kan", srb: "gledam", en: "I look", emoji: "👀", cat: "verb" },
  gleda: { zh: "看", trad: "看", pin: "kàn", vuk: "kan", srb: "gleda", en: "looks", emoji: "👀", cat: "verb" },
  gledati: { zh: "看", trad: "看", pin: "kàn", vuk: "kan", srb: "gledati", en: "to look", emoji: "👀", cat: "verb" },

  listen: { zh: "听", trad: "聽", pin: "tīng", vuk: "ting", srb: "slušati", en: "listen", emoji: "👂", cat: "verb" },
  hears: { zh: "听到", trad: "聽到", pin: "tīngdào", vuk: "ting-dao", srb: "čuje", en: "hears", emoji: "👂", cat: "verb" },
  slusam: { zh: "听", trad: "聽", pin: "tīng", vuk: "ting", srb: "slušam", en: "I listen", emoji: "👂", cat: "verb" },
  slusa: { zh: "听", trad: "聽", pin: "tīng", vuk: "ting", srb: "sluša", en: "listens", emoji: "👂", cat: "verb" },
  slusati: { zh: "听", trad: "聽", pin: "tīng", vuk: "ting", srb: "slušati", en: "to listen", emoji: "👂", cat: "verb" },
  cujem: { zh: "听到", trad: "聽到", pin: "tīngdào", vuk: "ting-dao", srb: "čujem", en: "I hear", emoji: "👂", cat: "verb" },
  cuje: { zh: "听到", trad: "聽到", pin: "tīngdào", vuk: "ting-dao", srb: "čuje", en: "hears", emoji: "👂", cat: "verb" },
  cuti: { zh: "听到", trad: "聽到", pin: "tīngdào", vuk: "ting-dao", srb: "čuti", en: "to hear", emoji: "👂", cat: "verb" },

  go: { zh: "去", trad: "去", pin: "qù", vuk: "ćü", srb: "ići", en: "go", emoji: "🚶", cat: "verb" },
  goes: { zh: "去", trad: "去", pin: "qù", vuk: "ćü", srb: "ide", en: "goes", emoji: "🚶", cat: "verb" },
  going: { zh: "去", trad: "去", pin: "qù", vuk: "ćü", srb: "ide", en: "going", emoji: "🚶", cat: "verb" },
  went: { zh: "去了", trad: "去了", pin: "qù le", vuk: "ćü le", srb: "otišao", en: "went", emoji: "🚶", cat: "verb" },
  idem: { zh: "去", trad: "去", pin: "qù", vuk: "ćü", srb: "idem", en: "I go", emoji: "🚶", cat: "verb" },
  ides: { zh: "去", trad: "去", pin: "qù", vuk: "ćü", srb: "ideš", en: "you go", emoji: "🚶", cat: "verb" },
  ide: { zh: "去", trad: "去", pin: "qù", vuk: "ćü", srb: "ide", en: "goes", emoji: "🚶", cat: "verb" },
  idemo: { zh: "去", trad: "去", pin: "qù", vuk: "ćü", srb: "idemo", en: "we go", emoji: "🚶", cat: "verb" },
  ici: { zh: "去", trad: "去", pin: "qù", vuk: "ćü", srb: "ići", en: "to go", emoji: "🚶", cat: "verb" },

  come: { zh: "来", trad: "來", pin: "lái", vuk: "laj", srb: "doći", en: "come", emoji: "👋", cat: "verb" },
  comes: { zh: "来", trad: "來", pin: "lái", vuk: "laj", srb: "dolazi", en: "comes", emoji: "👋", cat: "verb" },
  coming: { zh: "来", trad: "來", pin: "lái", vuk: "laj", srb: "dolazi", en: "coming", emoji: "👋", cat: "verb" },
  came: { zh: "来了", trad: "來了", pin: "lái le", vuk: "laj le", srb: "došao", en: "came", emoji: "👋", cat: "verb" },
  dolazim: { zh: "来", trad: "來", pin: "lái", vuk: "laj", srb: "dolazim", en: "I come", emoji: "👋", cat: "verb" },
  dolazi: { zh: "来", trad: "來", pin: "lái", vuk: "laj", srb: "dolazi", en: "comes", emoji: "👋", cat: "verb" },
  doci: { zh: "来", trad: "來", pin: "lái", vuk: "laj", srb: "doći", en: "to come", emoji: "👋", cat: "verb" },

  do: { zh: "做", trad: "做", pin: "zuò", vuk: "cuo", srb: "raditi", en: "do", emoji: "⚙️", cat: "verb" },
  does: { zh: "做", trad: "做", pin: "zuò", vuk: "cuo", srb: "radi", en: "does", emoji: "⚙️", cat: "verb" },
  did: { zh: "做了", trad: "做了", pin: "zuò le", vuk: "cuo le", srb: "uradio", en: "did", emoji: "⚙️", cat: "verb" },
  make: { zh: "做", trad: "做", pin: "zuò", vuk: "cuo", srb: "napraviti", en: "make", emoji: "🔨", cat: "verb" },
  makes: { zh: "做", trad: "做", pin: "zuò", vuk: "cuo", srb: "pravi", en: "makes", emoji: "🔨", cat: "verb" },
  work: { zh: "工作", trad: "工作", pin: "gōngzuò", vuk: "gung-cuo", srb: "raditi / posao", en: "work", emoji: "💼", cat: "verb" },
  works: { zh: "工作", trad: "工作", pin: "gōngzuò", vuk: "gung-cuo", srb: "radi", en: "works", emoji: "💼", cat: "verb" },
  radim: { zh: "做", trad: "做", pin: "zuò", vuk: "cuo", srb: "radim", en: "I do / work", emoji: "⚙️", cat: "verb" },
  radis: { zh: "做", trad: "做", pin: "zuò", vuk: "cuo", srb: "radiš", en: "you do", emoji: "⚙️", cat: "verb" },
  radi: { zh: "做", trad: "做", pin: "zuò", vuk: "cuo", srb: "radi", en: "does / works", emoji: "⚙️", cat: "verb" },
  radimo: { zh: "做", trad: "做", pin: "zuò", vuk: "cuo", srb: "radimo", en: "we do", emoji: "⚙️", cat: "verb" },
  raditi: { zh: "工作", trad: "工作", pin: "gōngzuò", vuk: "gung-cuo", srb: "raditi", en: "to work", emoji: "💼", cat: "verb" },

  think: { zh: "思考", trad: "思考", pin: "sīkǎo", vuk: "si-kao", srb: "misliti / razmišljati", en: "think", emoji: "🤔", cat: "verb" },
  thinks: { zh: "思考", trad: "思考", pin: "sīkǎo", vuk: "si-kao", srb: "misli", en: "thinks", emoji: "🤔", cat: "verb" },
  mislim: { zh: "思考", trad: "思考", pin: "sīkǎo", vuk: "si-kao", srb: "mislim", en: "I think", emoji: "🤔", cat: "verb" },
  misli: { zh: "思考", trad: "思考", pin: "sīkǎo", vuk: "si-kao", srb: "misli", en: "thinks", emoji: "🤔", cat: "verb" },
  misliti: { zh: "思考", trad: "思考", pin: "sīkǎo", vuk: "si-kao", srb: "misliti", en: "to think", emoji: "🤔", cat: "verb" },

  know: { zh: "知道", trad: "知道", pin: "zhīdào", vuk: "dži-dao", srb: "znati", en: "know", emoji: "💡", cat: "verb" },
  knows: { zh: "知道", trad: "知道", pin: "zhīdào", vuk: "dži-dao", srb: "zna", en: "knows", emoji: "💡", cat: "verb" },
  knew: { zh: "知道", trad: "知道", pin: "zhīdào", vuk: "dži-dao", srb: "znao", en: "knew", emoji: "💡", cat: "verb" },
  znam: { zh: "知道", trad: "知道", pin: "zhīdào", vuk: "dži-dao", srb: "znam", en: "I know", emoji: "💡", cat: "verb" },
  znas: { zh: "知道", trad: "知道", pin: "zhīdào", vuk: "dži-dao", srb: "znaš", en: "you know", emoji: "💡", cat: "verb" },
  zna: { zh: "知道", trad: "知道", pin: "zhīdào", vuk: "dži-dao", srb: "zna", en: "knows", emoji: "💡", cat: "verb" },
  znamo: { zh: "知道", trad: "知道", pin: "zhīdào", vuk: "dži-dao", srb: "znamo", en: "we know", emoji: "💡", cat: "verb" },
  znati: { zh: "知道", trad: "知道", pin: "zhīdào", vuk: "dži-dao", srb: "znati", en: "to know", emoji: "💡", cat: "verb" },

  understand: { zh: "懂", trad: "懂", pin: "dǒng", vuk: "dung", srb: "razumeti", en: "understand", emoji: "💡", cat: "verb" },
  razumem: { zh: "懂", trad: "懂", pin: "dǒng", vuk: "dung", srb: "razumem", en: "I understand", emoji: "💡", cat: "verb" },
  razume: { zh: "懂", trad: "懂", pin: "dǒng", vuk: "dung", srb: "razume", en: "understands", emoji: "💡", cat: "verb" },
  razumeti: { zh: "懂", trad: "懂", pin: "dǒng", vuk: "dung", srb: "razumeti", en: "to understand", emoji: "💡", cat: "verb" },

  live: { zh: "生活", trad: "生活", pin: "shēnghuó", vuk: "šeng-huo", srb: "živeti", en: "live", emoji: "🌱", cat: "verb" },
  lives: { zh: "生活", trad: "生活", pin: "shēnghuó", vuk: "šeng-huo", srb: "živi", en: "lives", emoji: "🌱", cat: "verb" },
  zivim: { zh: "生活", trad: "生活", pin: "shēnghuó", vuk: "šeng-huo", srb: "živim", en: "I live", emoji: "🌱", cat: "verb" },
  zivi: { zh: "生活", trad: "生活", pin: "shēnghuó", vuk: "šeng-huo", srb: "živi", en: "lives", emoji: "🌱", cat: "verb" },
  ziveti: { zh: "生活", trad: "生活", pin: "shēnghuó", vuk: "šeng-huo", srb: "živeti", en: "to live", emoji: "🌱", cat: "verb" },
  zivot: { zh: "生命", trad: "生命", pin: "shēngmìng", vuk: "šeng-ming", srb: "život", en: "life", emoji: "🌱", cat: "noun" },
  zivota: { zh: "生命", trad: "生命", pin: "shēngmìng", vuk: "šeng-ming", srb: "života", en: "of life", emoji: "🌱", cat: "noun" },

  breathe: { zh: "呼吸", trad: "呼吸", pin: "hūxī", vuk: "hu-si", srb: "disati", en: "breathe", emoji: "🌬️", cat: "verb" },
  disem: { zh: "呼吸", trad: "呼吸", pin: "hūxī", vuk: "hu-si", srb: "dišem", en: "I breathe", emoji: "🌬️", cat: "verb" },
  dise: { zh: "呼吸", trad: "呼吸", pin: "hūxī", vuk: "hu-si", srb: "diše", en: "breathes", emoji: "🌬️", cat: "verb" },
  disati: { zh: "呼吸", trad: "呼吸", pin: "hūxī", vuk: "hu-si", srb: "disati", en: "to breathe", emoji: "🌬️", cat: "verb" },

  sleep: { zh: "睡觉", trad: "睡覺", pin: "shuìjiào", vuk: "šuej-đjao", srb: "spavati", en: "sleep", emoji: "🌙", cat: "verb" },
  spavam: { zh: "睡觉", trad: "睡覺", pin: "shuìjiào", vuk: "šuej-đjao", srb: "spavam", en: "I sleep", emoji: "🌙", cat: "verb" },
  spava: { zh: "睡觉", trad: "睡覺", pin: "shuìjiào", vuk: "šuej-đjao", srb: "spava", en: "sleeps", emoji: "🌙", cat: "verb" },
  spavati: { zh: "睡觉", trad: "睡覺", pin: "shuìjiào", vuk: "šuej-đjao", srb: "spavati", en: "to sleep", emoji: "🌙", cat: "verb" },

  run: { zh: "跑", trad: "跑", pin: "pǎo", vuk: "pao", srb: "trčati", en: "run", emoji: "🏃", cat: "verb" },
  runs: { zh: "跑", trad: "跑", pin: "pǎo", vuk: "pao", srb: "trči", en: "runs", emoji: "🏃", cat: "verb" },
  running: { zh: "在跑", trad: "在跑", pin: "zài pǎo", vuk: "caj pao", srb: "trči", en: "running", emoji: "🏃", cat: "verb" },
  trcim: { zh: "跑", trad: "跑", pin: "pǎo", vuk: "pao", srb: "trčim", en: "I run", emoji: "🏃", cat: "verb" },
  trci: { zh: "跑", trad: "跑", pin: "pǎo", vuk: "pao", srb: "trči", en: "runs", emoji: "🏃", cat: "verb" },
  trcati: { zh: "跑", trad: "跑", pin: "pǎo", vuk: "pao", srb: "trčati", en: "to run", emoji: "🏃", cat: "verb" },

  walk: { zh: "走", trad: "走", pin: "zǒu", vuk: "cou", srb: "hodati", en: "walk", emoji: "🚶", cat: "verb" },
  hodam: { zh: "走", trad: "走", pin: "zǒu", vuk: "cou", srb: "hodam", en: "I walk", emoji: "🚶", cat: "verb" },
  hoda: { zh: "走", trad: "走", pin: "zǒu", vuk: "cou", srb: "hoda", en: "walks", emoji: "🚶", cat: "verb" },
  hodati: { zh: "走", trad: "走", pin: "zǒu", vuk: "cou", srb: "hodati", en: "to walk", emoji: "🚶", cat: "verb" },

  help: { zh: "帮助", trad: "幫助", pin: "bāngzhù", vuk: "bang-džu", srb: "pomoći / pomoć", en: "help", emoji: "🤝", cat: "verb" },
  pomazem: { zh: "帮助", trad: "幫助", pin: "bāngzhù", vuk: "bang-džu", srb: "pomažem", en: "I help", emoji: "🤝", cat: "verb" },
  pomaze: { zh: "帮助", trad: "幫助", pin: "bāngzhù", vuk: "bang-džu", srb: "pomaže", en: "helps", emoji: "🤝", cat: "verb" },
  pomoci: { zh: "帮助", trad: "幫助", pin: "bāngzhù", vuk: "bang-džu", srb: "pomoći", en: "to help", emoji: "🤝", cat: "verb" },

  smile: { zh: "笑", trad: "笑", pin: "xiào", vuk: "sjao", srb: "smešiti se", en: "smile", emoji: "😊", cat: "verb" },
  smejem: { zh: "笑", trad: "笑", pin: "xiào", vuk: "sjao", srb: "smejem se", en: "I smile", emoji: "😊", cat: "verb" },
  smeje: { zh: "笑", trad: "笑", pin: "xiào", vuk: "sjao", srb: "smeje se", en: "smiles", emoji: "😊", cat: "verb" },

  stand: { zh: "站", trad: "站", pin: "zhàn", vuk: "džan", srb: "stajati", en: "stand", emoji: "🧍", cat: "verb" },
  stojim: { zh: "站", trad: "站", pin: "zhàn", vuk: "džan", srb: "stojim", en: "I stand", emoji: "🧍", cat: "verb" },
  stoji: { zh: "站", trad: "站", pin: "zhàn", vuk: "džan", srb: "stoji", en: "stands", emoji: "🧍", cat: "verb" },

  // --- KEY NOUNS: FOOD, DRINK & OBJECTS ---
  water: { zh: "水", trad: "水", pin: "shuǐ", vuk: "šuej", srb: "voda", en: "water", emoji: "💧", cat: "noun" },
  voda: { zh: "水", trad: "水", pin: "shuǐ", vuk: "šuej", srb: "voda", en: "water", emoji: "💧", cat: "noun" },
  vodu: { zh: "水", trad: "水", pin: "shuǐ", vuk: "šuej", srb: "vodu", en: "water (acc)", emoji: "💧", cat: "noun" },
  vode: { zh: "水", trad: "水", pin: "shuǐ", vuk: "šuej", srb: "vode", en: "water (gen)", emoji: "💧", cat: "noun" },

  tea: { zh: "茶", trad: "茶", pin: "chá", vuk: "ča", srb: "čaj", en: "tea", emoji: "🍵", cat: "noun" },
  caj: { zh: "茶", trad: "茶", pin: "chá", vuk: "ča", srb: "čaj", en: "tea", emoji: "🍵", cat: "noun" },
  caja: { zh: "茶", trad: "茶", pin: "chá", vuk: "ča", srb: "čaja", en: "tea (gen)", emoji: "🍵", cat: "noun" },
  cajem: { zh: "茶", trad: "茶", pin: "chá", vuk: "ča", srb: "čajem", en: "with tea", emoji: "🍵", cat: "noun" },

  coffee: { zh: "咖啡", trad: "咖啡", pin: "kāfēi", vuk: "ka-fej", srb: "kafa", en: "coffee", emoji: "☕", cat: "noun" },
  kafa: { zh: "咖啡", trad: "咖啡", pin: "kāfēi", vuk: "ka-fej", srb: "kafa", en: "coffee", emoji: "☕", cat: "noun" },
  kafu: { zh: "咖啡", trad: "咖啡", pin: "kāfēi", vuk: "ka-fej", srb: "kafu", en: "coffee (acc)", emoji: "☕", cat: "noun" },
  kafe: { zh: "咖啡", trad: "咖啡", pin: "kāfēi", vuk: "ka-fej", srb: "kafe", en: "coffee (gen)", emoji: "☕", cat: "noun" },

  bread: { zh: "面包", trad: "麵包", pin: "miànbāo", vuk: "mjen-bao", srb: "hleb / kruh", en: "bread", emoji: "🍞", cat: "noun" },
  hleb: { zh: "面包", trad: "麵包", pin: "miànbāo", vuk: "mjen-bao", srb: "hleb", en: "bread", emoji: "🍞", cat: "noun" },
  hleba: { zh: "面包", trad: "麵包", pin: "miànbāo", vuk: "mjen-bao", srb: "hleba", en: "bread (gen)", emoji: "🍞", cat: "noun" },
  kruh: { zh: "面包", trad: "麵包", pin: "miànbāo", vuk: "mjen-bao", srb: "kruh", en: "bread", emoji: "🍞", cat: "noun" },
  kruha: { zh: "面包", trad: "麵包", pin: "miànbāo", vuk: "mjen-bao", srb: "kruha", en: "bread (gen)", emoji: "🍞", cat: "noun" },

  milk: { zh: "牛奶", trad: "牛奶", pin: "niúnǎi", vuk: "nju-naj", srb: "mleko", en: "milk", emoji: "🥛", cat: "noun" },
  mleko: { zh: "牛奶", trad: "牛奶", pin: "niúnǎi", vuk: "nju-naj", srb: "mleko", en: "milk", emoji: "🥛", cat: "noun" },
  mlijeko: { zh: "牛奶", trad: "牛奶", pin: "niúnǎi", vuk: "nju-naj", srb: "mlijeko", en: "milk", emoji: "🥛", cat: "noun" },

  rice: { zh: "米饭", trad: "米飯", pin: "mǐfàn", vuk: "mi-fan", srb: "pirinač / riža", en: "rice", emoji: "🍚", cat: "noun" },
  pirinac: { zh: "米饭", trad: "米飯", pin: "mǐfàn", vuk: "mi-fan", srb: "pirinač", en: "rice", emoji: "🍚", cat: "noun" },
  riza: { zh: "米饭", trad: "米飯", pin: "mǐfàn", vuk: "mi-fan", srb: "riža", en: "rice", emoji: "🍚", cat: "noun" },

  apple: { zh: "苹果", trad: "蘋果", pin: "píngguǒ", vuk: "ping-guo", srb: "jabuka", en: "apple", emoji: "🍎", cat: "noun" },
  apples: { zh: "苹果", trad: "蘋果", pin: "píngguǒ", vuk: "ping-guo", srb: "jabuke", en: "apples", emoji: "🍎", cat: "noun" },
  jabuka: { zh: "苹果", trad: "蘋果", pin: "píngguǒ", vuk: "ping-guo", srb: "jabuka", en: "apple", emoji: "🍎", cat: "noun" },
  jabuku: { zh: "苹果", trad: "蘋果", pin: "píngguǒ", vuk: "ping-guo", srb: "jabuku", en: "apple (acc)", emoji: "🍎", cat: "noun" },
  jabuke: { zh: "苹果", trad: "蘋果", pin: "píngguǒ", vuk: "ping-guo", srb: "jabuke", en: "apples", emoji: "🍎", cat: "noun" },

  fruit: { zh: "水果", trad: "水果", pin: "shuǐguǒ", vuk: "šuej-guo", srb: "voće", en: "fruit", emoji: "🍊", cat: "noun" },
  voce: { zh: "水果", trad: "水果", pin: "shuǐguǒ", vuk: "šuej-guo", srb: "voće", en: "fruit", emoji: "🍊", cat: "noun" },
  banana: { zh: "香蕉", trad: "香蕉", pin: "xiāngjiāo", vuk: "sjang-đjao", srb: "banana", en: "banana", emoji: "🍌", cat: "noun" },
  bananu: { zh: "香蕉", trad: "香蕉", pin: "xiāngjiāo", vuk: "sjang-đjao", srb: "bananu", en: "banana", emoji: "🍌", cat: "noun" },
  food: { zh: "食物", trad: "食物", pin: "shíwù", vuk: "ši-vu", srb: "hrana", en: "food", emoji: "🍲", cat: "noun" },
  hrana: { zh: "食物", trad: "食物", pin: "shíwù", vuk: "ši-vu", srb: "hrana", en: "food", emoji: "🍲", cat: "noun" },
  hranu: { zh: "食物", trad: "食物", pin: "shíwù", vuk: "ši-vu", srb: "hranu", en: "food (acc)", emoji: "🍲", cat: "noun" },

  book: { zh: "书", trad: "書", pin: "shū", vuk: "šu", srb: "knjiga", en: "book", emoji: "📖", cat: "noun" },
  books: { zh: "书", trad: "書", pin: "shū", vuk: "šu", srb: "knjige", en: "books", emoji: "📖", cat: "noun" },
  knjiga: { zh: "书", trad: "書", pin: "shū", vuk: "šu", srb: "knjiga", en: "book", emoji: "📖", cat: "noun" },
  knjigu: { zh: "书", trad: "書", pin: "shū", vuk: "šu", srb: "knjigu", en: "book (acc)", emoji: "📖", cat: "noun" },
  knjige: { zh: "书", trad: "書", pin: "shū", vuk: "šu", srb: "knjige", en: "books", emoji: "📖", cat: "noun" },

  word: { zh: "词", trad: "詞", pin: "cí", vuk: "ci", srb: "reč", en: "word", emoji: "📝", cat: "noun" },
  words: { zh: "词汇", trad: "詞彙", pin: "cíhuì", vuk: "ci-huej", srb: "reči / vokabular", en: "words", emoji: "📝", cat: "noun" },
  rec: { zh: "词", trad: "詞", pin: "cí", vuk: "ci", srb: "reč", en: "word", emoji: "📝", cat: "noun" },
  reci: { zh: "词汇", trad: "詞彙", pin: "cíhuì", vuk: "ci-huej", srb: "reči", en: "words", emoji: "📝", cat: "noun" },
  rijec: { zh: "词", trad: "詞", pin: "cí", vuk: "ci", srb: "riječ", en: "word", emoji: "📝", cat: "noun" },
  rijeci: { zh: "词汇", trad: "詞彙", pin: "cíhuì", vuk: "ci-huej", srb: "riječi", en: "words", emoji: "📝", cat: "noun" },
  sentence: { zh: "句子", trad: "句子", pin: "jùzi", vuk: "đji-ci", srb: "rečenica", en: "sentence", emoji: "📄", cat: "noun" },
  recenica: { zh: "句子", trad: "句子", pin: "jùzi", vuk: "đji-ci", srb: "rečenica", en: "sentence", emoji: "📄", cat: "noun" },
  recenicu: { zh: "句子", trad: "句子", pin: "jùzi", vuk: "đji-ci", srb: "rečenicu", en: "sentence (acc)", emoji: "📄", cat: "noun" },

  language: { zh: "语言", trad: "語言", pin: "yǔyán", vuk: "jü-jan", srb: "jezik", en: "language", emoji: "🗣️", cat: "noun" },
  jezik: { zh: "语言", trad: "語言", pin: "yǔyán", vuk: "jü-jan", srb: "jezik", en: "language", emoji: "🗣️", cat: "noun" },
  chinese: { zh: "中文", trad: "中文", pin: "zhōngwén", vuk: "džung-ven", srb: "kineski jezik", en: "Chinese", emoji: "🇨🇳", cat: "noun" },
  kineski: { zh: "中文", trad: "中文", pin: "zhōngwén", vuk: "džung-ven", srb: "kineski", en: "Chinese", emoji: "🇨🇳", cat: "noun" },
  mandarin: { zh: "普通话", trad: "普通話", pin: "pǔtōnghuà", vuk: "pu-tung-hua", srb: "mandarinski", en: "Mandarin", emoji: "🇨🇳", cat: "noun" },
  english: { zh: "英语", trad: "英語", pin: "yīngyǔ", vuk: "jing-jü", srb: "engleski jezik", en: "English", emoji: "🇬🇧", cat: "noun" },
  engleski: { zh: "英语", trad: "英語", pin: "yīngyǔ", vuk: "jing-jü", srb: "engleski", en: "English", emoji: "🇬🇧", cat: "noun" },

  house: { zh: "房子", trad: "房子", pin: "fángzi", vuk: "fang-ci", srb: "kuća", en: "house", emoji: "🏠", cat: "noun" },
  kuca: { zh: "家", trad: "家", pin: "jiā", vuk: "đja", srb: "kuća / dom", en: "house / home", emoji: "🏠", cat: "noun" },
  kucu: { zh: "家", trad: "家", pin: "jiā", vuk: "đja", srb: "kuću", en: "house (acc)", emoji: "🏠", cat: "noun" },
  dom: { zh: "家", trad: "家", pin: "jiā", vuk: "đja", srb: "dom", en: "home", emoji: "🏡", cat: "noun" },
  school: { zh: "学校", trad: "學校", pin: "xuéxiào", vuk: "sjüe-sjao", srb: "škola", en: "school", emoji: "🏫", cat: "noun" },
  skola: { zh: "学校", trad: "學校", pin: "xuéxiào", vuk: "sjüe-sjao", srb: "škola", en: "school", emoji: "🏫", cat: "noun" },
  skolu: { zh: "学校", trad: "學校", pin: "xuéxiào", vuk: "sjüe-sjao", srb: "školu", en: "school (acc)", emoji: "🏫", cat: "noun" },

  // --- PHILOSOPHY, STOICISM, WELLNESS & VIRTUES ---
  peace: { zh: "和平", trad: "和平", pin: "hépíng", vuk: "he-ping", srb: "mir", en: "peace", emoji: "🕊️", cat: "noun" },
  mir: { zh: "和平", trad: "和平", pin: "hépíng", vuk: "he-ping", srb: "mir", en: "peace", emoji: "🕊️", cat: "noun" },
  mira: { zh: "和平", trad: "和平", pin: "hépíng", vuk: "he-ping", srb: "mira", en: "of peace", emoji: "🕊️", cat: "noun" },
  mirom: { zh: "和平", trad: "和平", pin: "hépíng", vuk: "he-ping", srb: "mirom", en: "with peace", emoji: "🕊️", cat: "noun" },

  wisdom: { zh: "智慧", trad: "智慧", pin: "zhìhuì", vuk: "dži-huej", srb: "mudrost", en: "wisdom", emoji: "🧠", cat: "noun" },
  mudrost: { zh: "智慧", trad: "智慧", pin: "zhìhuì", vuk: "dži-huej", srb: "mudrost", en: "wisdom", emoji: "🧠", cat: "noun" },
  mudrosti: { zh: "智慧", trad: "智慧", pin: "zhìhuì", vuk: "dži-huej", srb: "mudrosti", en: "of wisdom", emoji: "🧠", cat: "noun" },

  strength: { zh: "力量", trad: "力量", pin: "lìliàng", vuk: "li-ljang", srb: "snaga", en: "strength", emoji: "💪", cat: "noun" },
  snaga: { zh: "力量", trad: "力量", pin: "lìliàng", vuk: "li-ljang", srb: "snaga", en: "strength", emoji: "💪", cat: "noun" },
  snagu: { zh: "力量", trad: "力量", pin: "lìliàng", vuk: "li-ljang", srb: "snagu", en: "strength (acc)", emoji: "💪", cat: "noun" },
  snage: { zh: "力量", trad: "力量", pin: "lìliàng", vuk: "li-ljang", srb: "snage", en: "of strength", emoji: "💪", cat: "noun" },

  courage: { zh: "勇气", trad: "勇氣", pin: "yǒngqì", vuk: "jung-ći", srb: "hrabrost", en: "courage", emoji: "🦁", cat: "noun" },
  hrabrost: { zh: "勇气", trad: "勇氣", pin: "yǒngqì", vuk: "jung-ći", srb: "hrabrost", en: "courage", emoji: "🦁", cat: "noun" },
  hrabrosti: { zh: "勇气", trad: "勇氣", pin: "yǒngqì", vuk: "jung-ći", srb: "hrabrosti", en: "of courage", emoji: "🦁", cat: "noun" },

  discipline: { zh: "自律", trad: "自律", pin: "zìlǜ", vuk: "ci-lji", srb: "disciplina", en: "discipline", emoji: "⚔️", cat: "noun" },
  disciplina: { zh: "自律", trad: "自律", pin: "zìlǜ", vuk: "ci-lji", srb: "disciplina", en: "discipline", emoji: "⚔️", cat: "noun" },

  focus: { zh: "专注", trad: "專注", pin: "zhuānzhù", vuk: "džuan-džu", srb: "fokus / koncentracija", en: "focus", emoji: "🎯", cat: "noun" },
  fokus: { zh: "专注", trad: "專注", pin: "zhuānzhù", vuk: "džuan-džu", srb: "fokus", en: "focus", emoji: "🎯", cat: "noun" },

  patience: { zh: "耐心", trad: "耐心", pin: "nàixīn", vuk: "naj-sin", srb: "strpljenje", en: "patience", emoji: "⏳", cat: "noun" },
  strpljenje: { zh: "耐心", trad: "耐心", pin: "nàixīn", vuk: "naj-sin", srb: "strpljenje", en: "patience", emoji: "⏳", cat: "noun" },

  truth: { zh: "真理", trad: "真理", pin: "zhēnlǐ", vuk: "džen-li", srb: "istina", en: "truth", emoji: "⚖️", cat: "noun" },
  istina: { zh: "真理", trad: "真理", pin: "zhēnlǐ", vuk: "džen-li", srb: "istina", en: "truth", emoji: "⚖️", cat: "noun" },
  istinu: { zh: "真理", trad: "真理", pin: "zhēnlǐ", vuk: "džen-li", srb: "istinu", en: "truth (acc)", emoji: "⚖️", cat: "noun" },

  serenity: { zh: "宁静", trad: "寧靜", pin: "níngjìng", vuk: "ning-đing", srb: "spokoj", en: "serenity", emoji: "🌸", cat: "noun" },
  spokoj: { zh: "宁静", trad: "寧靜", pin: "níngjìng", vuk: "ning-đing", srb: "spokoj", en: "serenity", emoji: "🌸", cat: "noun" },

  joy: { zh: "喜悦", trad: "喜悅", pin: "xǐyuè", vuk: "si-jüe", srb: "radost", en: "joy", emoji: "✨", cat: "noun" },
  radost: { zh: "喜悦", trad: "喜悅", pin: "xǐyuè", vuk: "si-jüe", srb: "radost", en: "joy", emoji: "✨", cat: "noun" },
  happiness: { zh: "幸福", trad: "幸福", pin: "xìngfú", vuk: "sing-fu", srb: "sreća", en: "happiness", emoji: "🍀", cat: "noun" },
  sreca: { zh: "幸福", trad: "幸福", pin: "xìngfú", vuk: "sing-fu", srb: "sreća", en: "happiness", emoji: "🍀", cat: "noun" },

  heart: { zh: "心", trad: "心", pin: "xīn", vuk: "sin", srb: "srce", en: "heart", emoji: "💖", cat: "noun" },
  srce: { zh: "心", trad: "心", pin: "xīn", vuk: "sin", srb: "srce", en: "heart", emoji: "💖", cat: "noun" },
  srca: { zh: "心", trad: "心", pin: "xīn", vuk: "sin", srb: "srca", en: "of heart", emoji: "💖", cat: "noun" },
  srcu: { zh: "心", trad: "心", pin: "xīn", vuk: "sin", srb: "srcu", en: "in heart", emoji: "💖", cat: "noun" },

  soul: { zh: "灵魂", trad: "靈魂", pin: "línghún", vuk: "ling-hun", srb: "duša", en: "soul", emoji: "✨", cat: "noun" },
  dusa: { zh: "灵魂", trad: "靈魂", pin: "línghún", vuk: "ling-hun", srb: "duša", en: "soul", emoji: "✨", cat: "noun" },
  duse: { zh: "灵魂", trad: "靈魂", pin: "línghún", vuk: "ling-hun", srb: "duše", en: "of soul", emoji: "✨", cat: "noun" },

  mind: { zh: "心灵", trad: "心靈", pin: "xīnlíng", vuk: "sin-ling", srb: "um / duh", en: "mind", emoji: "🧠", cat: "noun" },
  um: { zh: "心灵", trad: "心靈", pin: "xīnlíng", vuk: "sin-ling", srb: "um", en: "mind", emoji: "🧠", cat: "noun" },

  body: { zh: "身体", trad: "身體", pin: "shēntǐ", vuk: "šen-ti", srb: "telo", en: "body", emoji: "🧘", cat: "noun" },
  telo: { zh: "身体", trad: "身體", pin: "shēntǐ", vuk: "šen-ti", srb: "telo", en: "body", emoji: "🧘", cat: "noun" },
  tela: { zh: "身体", trad: "身體", pin: "shēntǐ", vuk: "šen-ti", srb: "tela", en: "of body", emoji: "🧘", cat: "noun" },

  health: { zh: "健康", trad: "健康", pin: "jiànkāng", vuk: "đjen-kang", srb: "zdravlje", en: "health", emoji: "🌿", cat: "noun" },
  zdravlje: { zh: "健康", trad: "健康", pin: "jiànkāng", vuk: "đjen-kang", srb: "zdravlje", en: "health", emoji: "🌿", cat: "noun" },

  way: { zh: "道", trad: "道", pin: "dào", vuk: "dao", srb: "put / tao", en: "way / path", emoji: "☯️", cat: "noun" },
  path: { zh: "道路", trad: "道路", pin: "dàolù", vuk: "dao-lu", srb: "staza / put", en: "path", emoji: "🛤️", cat: "noun" },
  put: { zh: "道", trad: "道", pin: "dào", vuk: "dao", srb: "put", en: "path / way", emoji: "☯️", cat: "noun" },
  puta: { zh: "道", trad: "道", pin: "dào", vuk: "dao", srb: "puta", en: "of path", emoji: "☯️", cat: "noun" },

  nature: { zh: "自然", trad: "自然", pin: "zìrán", vuk: "ci-žan", srb: "priroda", en: "nature", emoji: "🍃", cat: "noun" },
  priroda: { zh: "自然", trad: "自然", pin: "zìrán", vuk: "ci-žan", srb: "priroda", en: "nature", emoji: "🍃", cat: "noun" },

  world: { zh: "世界", trad: "世界", pin: "shìjiè", vuk: "ši-đie", srb: "svet", en: "world", emoji: "🌍", cat: "noun" },
  svet: { zh: "世界", trad: "世界", pin: "shìjiè", vuk: "ši-đie", srb: "svet", en: "world", emoji: "🌍", cat: "noun" },
  sveta: { zh: "世界", trad: "世界", pin: "shìjiè", vuk: "ši-đie", srb: "sveta", en: "of world", emoji: "🌍", cat: "noun" },
  svetu: { zh: "世界", trad: "世界", pin: "shìjiè", vuk: "ši-đie", srb: "u svetu", en: "in world", emoji: "🌍", cat: "noun" },

  // --- PEOPLE, RELATIONS & SOCIAL ---
  friend: { zh: "朋友", trad: "朋友", pin: "péngyǒu", vuk: "peng-jou", srb: "prijatelj", en: "friend", emoji: "🤝", cat: "noun" },
  friends: { zh: "朋友", trad: "朋友", pin: "péngyǒu", vuk: "peng-jou", srb: "prijatelji", en: "friends", emoji: "🤝", cat: "noun" },
  prijatelj: { zh: "朋友", trad: "朋友", pin: "péngyǒu", vuk: "peng-jou", srb: "prijatelj", en: "friend", emoji: "🤝", cat: "noun" },
  prijatelja: { zh: "朋友", trad: "朋友", pin: "péngyǒu", vuk: "peng-jou", srb: "prijatelja", en: "friend (gen)", emoji: "🤝", cat: "noun" },
  prijatelji: { zh: "朋友", trad: "朋友", pin: "péngyǒu", vuk: "peng-jou", srb: "prijatelji", en: "friends", emoji: "🤝", cat: "noun" },

  brother: { zh: "兄弟", trad: "兄弟", pin: "xiōngdì", vuk: "sjung-di", srb: "brat", en: "brother", emoji: "👦", cat: "noun" },
  brat: { zh: "兄弟", trad: "兄弟", pin: "xiōngdì", vuk: "sjung-di", srb: "brat", en: "brother", emoji: "👦", cat: "noun" },
  brate: { zh: "兄弟", trad: "兄弟", pin: "xiōngdì", vuk: "sjung-di", srb: "brate", en: "brother (voc)", emoji: "👦", cat: "noun" },

  sister: { zh: "姐妹", trad: "姐妹", pin: "jiěmèi", vuk: "đjie-mej", srb: "sestra", en: "sister", emoji: "👧", cat: "noun" },
  sestra: { zh: "姐妹", trad: "姐妹", pin: "jiěmèi", vuk: "đjie-mej", srb: "sestra", en: "sister", emoji: "👧", cat: "noun" },
  sestro: { zh: "姐妹", trad: "姐妹", pin: "jiěmèi", vuk: "đjie-mej", srb: "sestro", en: "sister (voc)", emoji: "👧", cat: "noun" },

  family: { zh: "家人", trad: "家人", pin: "jiārén", vuk: "đja-žen", srb: "porodica", en: "family", emoji: "👨‍👩‍👧‍👦", cat: "noun" },
  porodica: { zh: "家人", trad: "家人", pin: "jiārén", vuk: "đja-žen", srb: "porodica", en: "family", emoji: "👨‍👩‍👧‍👦", cat: "noun" },
  porodicu: { zh: "家人", trad: "家人", pin: "jiārén", vuk: "đja-žen", srb: "porodicu", en: "family (acc)", emoji: "👨‍👩‍👧‍👦", cat: "noun" },

  person: { zh: "人", trad: "人", pin: "rén", vuk: "žen", srb: "čovek / osoba", en: "person", emoji: "👤", cat: "noun" },
  people: { zh: "人", trad: "人", pin: "rén", vuk: "žen", srb: "ljudi", en: "people", emoji: "👥", cat: "noun" },
  covek: { zh: "人", trad: "人", pin: "rén", vuk: "žen", srb: "čovek", en: "person", emoji: "👤", cat: "noun" },
  ljudi: { zh: "人", trad: "人", pin: "rén", vuk: "žen", srb: "ljudi", en: "people", emoji: "👥", cat: "noun" },

  teacher: { zh: "老师", trad: "老師", pin: "lǎoshī", vuk: "lao-ši", srb: "učitelj", en: "teacher", emoji: "👨‍🏫", cat: "noun" },
  student: { zh: "学生", trad: "學生", pin: "xuéshēng", vuk: "sjüe-šeng", srb: "učenik", en: "student", emoji: "🧑‍🎓", cat: "noun" },
  ucitelj: { zh: "老师", trad: "老師", pin: "lǎoshī", vuk: "lao-ši", srb: "učitelj", en: "teacher", emoji: "👨‍🏫", cat: "noun" },
  ucenik: { zh: "学生", trad: "學生", pin: "xuéshēng", vuk: "sjüe-šeng", srb: "učenik", en: "student", emoji: "🧑‍🎓", cat: "noun" },

  // --- NATURE, TIME & COSMOS ---
  sun: { zh: "太阳", trad: "太陽", pin: "tàiyáng", vuk: "taj-jang", srb: "sunce", en: "sun", emoji: "☀️", cat: "noun" },
  sunce: { zh: "太阳", trad: "太陽", pin: "tàiyáng", vuk: "taj-jang", srb: "sunce", en: "sun", emoji: "☀️", cat: "noun" },
  moon: { zh: "月亮", trad: "月亮", pin: "yuèliang", vuk: "jüe-ljang", srb: "mesec", en: "moon", emoji: "🌙", cat: "noun" },
  mesec: { zh: "月亮", trad: "月亮", pin: "yuèliang", vuk: "jüe-ljang", srb: "mesec", en: "moon", emoji: "🌙", cat: "noun" },
  star: { zh: "星", trad: "星", pin: "xīng", vuk: "sing", srb: "zvezda", en: "star", emoji: "⭐", cat: "noun" },
  zvezda: { zh: "星", trad: "星", pin: "xīng", vuk: "sing", srb: "zvezda", en: "star", emoji: "⭐", cat: "noun" },
  mountain: { zh: "山", trad: "山", pin: "shān", vuk: "šan", srb: "planina", en: "mountain", emoji: "⛰️", cat: "noun" },
  planina: { zh: "山", trad: "山", pin: "shān", vuk: "šan", srb: "planina", en: "mountain", emoji: "⛰️", cat: "noun" },
  river: { zh: "河", trad: "河", pin: "hé", vuk: "he", srb: "reka", en: "river", emoji: "🌊", cat: "noun" },
  reka: { zh: "河", trad: "河", pin: "hé", vuk: "he", srb: "reka", en: "river", emoji: "🌊", cat: "noun" },
  sea: { zh: "海", trad: "海", pin: "hǎi", vuk: "haj", srb: "more", en: "sea", emoji: "🌊", cat: "noun" },
  more: { zh: "海", trad: "海", pin: "hǎi", vuk: "haj", srb: "more", en: "sea", emoji: "🌊", cat: "noun" },
  tree: { zh: "树", trad: "樹", pin: "shù", vuk: "šu", srb: "drvo", en: "tree", emoji: "🌳", cat: "noun" },
  drvo: { zh: "树", trad: "樹", pin: "shù", vuk: "šu", srb: "drvo", en: "tree", emoji: "🌳", cat: "noun" },
  bamboo: { zh: "竹", trad: "竹", pin: "zhú", vuk: "džu", srb: "bambus", en: "bamboo", emoji: "🎋", cat: "noun" },
  bambus: { zh: "竹", trad: "竹", pin: "zhú", vuk: "džu", srb: "bambus", en: "bamboo", emoji: "🎋", cat: "noun" },
  flower: { zh: "花", trad: "花", pin: "huā", vuk: "hua", srb: "cvet", en: "flower", emoji: "🌸", cat: "noun" },
  cvet: { zh: "花", trad: "花", pin: "huā", vuk: "hua", srb: "cvet", en: "flower", emoji: "🌸", cat: "noun" },
  lotus: { zh: "莲花", trad: "蓮花", pin: "liánhuā", vuk: "ljen-hua", srb: "lotos", en: "lotus", emoji: "🪷", cat: "noun" },
  lotos: { zh: "莲花", trad: "蓮花", pin: "liánhuā", vuk: "ljen-hua", srb: "lotos", en: "lotus", emoji: "🪷", cat: "noun" },
  dragon: { zh: "龙", trad: "龍", pin: "lóng", vuk: "lung", srb: "zmaj", en: "dragon", emoji: "🐉", cat: "noun" },
  zmaj: { zh: "龙", trad: "龍", pin: "lóng", vuk: "lung", srb: "zmaj", en: "dragon", emoji: "🐉", cat: "noun" },
  panda: { zh: "熊猫", trad: "熊貓", pin: "xióngmāo", vuk: "sjung-mao", srb: "panda", en: "panda", emoji: "🐼", cat: "noun" },

  day: { zh: "天", trad: "天", pin: "tiān", vuk: "tjen", srb: "dan", en: "day", emoji: "📅", cat: "noun" },
  days: { zh: "日子", trad: "日子", pin: "rìzi", vuk: "ži-ci", srb: "dani", en: "days", emoji: "📅", cat: "noun" },
  dan: { zh: "天", trad: "天", pin: "tiān", vuk: "tjen", srb: "dan", en: "day", emoji: "📅", cat: "noun" },
  dana: { zh: "天", trad: "天", pin: "tiān", vuk: "tjen", srb: "dana", en: "days", emoji: "📅", cat: "noun" },
  dani: { zh: "日子", trad: "日子", pin: "rìzi", vuk: "ži-ci", srb: "dani", en: "days", emoji: "📅", cat: "noun" },
  today: { zh: "今天", trad: "今天", pin: "jīntiān", vuk: "đjin-tjen", srb: "danas", en: "today", emoji: "📅", cat: "noun" },
  danas: { zh: "今天", trad: "今天", pin: "jīntiān", vuk: "đjin-tjen", srb: "danas", en: "today", emoji: "📅", cat: "noun" },
  tomorrow: { zh: "明天", trad: "明天", pin: "míngtiān", vuk: "ming-tjen", srb: "sutra", en: "tomorrow", emoji: "🌅", cat: "noun" },
  sutra: { zh: "明天", trad: "明天", pin: "míngtiān", vuk: "ming-tjen", srb: "sutra", en: "tomorrow", emoji: "🌅", cat: "noun" },
  night: { zh: "夜", trad: "夜", pin: "yè", vuk: "je", srb: "noć", en: "night", emoji: "🌃", cat: "noun" },
  noc: { zh: "夜", trad: "夜", pin: "yè", vuk: "je", srb: "noć", en: "night", emoji: "🌃", cat: "noun" },
  morning: { zh: "早晨", trad: "早晨", pin: "zǎochén", vuk: "zao-čen", srb: "jutro", en: "morning", emoji: "🌅", cat: "noun" },
  jutro: { zh: "早晨", trad: "早晨", pin: "zǎochén", vuk: "zao-čen", srb: "jutro", en: "morning", emoji: "🌅", cat: "noun" },
  now: { zh: "现在", trad: "現在", pin: "xiànzài", vuk: "sjen-caj", srb: "sada", en: "now", emoji: "⏰", cat: "adverb" },
  sada: { zh: "现在", trad: "現在", pin: "xiànzài", vuk: "sjen-caj", srb: "sada", en: "now", emoji: "⏰", cat: "adverb" },
  always: { zh: "永远", trad: "永遠", pin: "yǒngyuǎn", vuk: "jung-jüan", srb: "uvek / zauvek", en: "always", emoji: "⏳", cat: "adverb" },
  uvek: { zh: "永远", trad: "永遠", pin: "yǒngyuǎn", vuk: "jung-jüan", srb: "uvek", en: "always", emoji: "⏳", cat: "adverb" },
  nikad: { zh: "从不", trad: "從不", pin: "cóngbù", vuk: "cung-bu", srb: "nikad", en: "never", emoji: "⏳", cat: "adverb" },
  never: { zh: "从不", trad: "從不", pin: "cóngbù", vuk: "cung-bu", srb: "nikad", en: "never", emoji: "⏳", cat: "adverb" },

  // --- ADJECTIVES ---
  good: { zh: "好", trad: "好", pin: "hǎo", vuk: "hao", srb: "dobro / dobar", en: "good", emoji: "✨", cat: "adjective" },
  dobro: { zh: "好", trad: "好", pin: "hǎo", vuk: "hao", srb: "dobro", en: "good", emoji: "✨", cat: "adjective" },
  dobar: { zh: "好", trad: "好", pin: "hǎo", vuk: "hao", srb: "dobar", en: "good", emoji: "✨", cat: "adjective" },
  dobra: { zh: "好", trad: "好", pin: "hǎo", vuk: "hao", srb: "dobra", en: "good", emoji: "✨", cat: "adjective" },

  beautiful: { zh: "美", trad: "美", pin: "měi", vuk: "mej", srb: "lepo / lepa", en: "beautiful", emoji: "🌸", cat: "adjective" },
  lepo: { zh: "美", trad: "美", pin: "měi", vuk: "mej", srb: "lepo", en: "beautiful", emoji: "🌸", cat: "adjective" },
  lep: { zh: "美", trad: "美", pin: "měi", vuk: "mej", srb: "lep", en: "beautiful", emoji: "🌸", cat: "adjective" },
  lepa: { zh: "美", trad: "美", pin: "měi", vuk: "mej", srb: "lepa", en: "beautiful", emoji: "🌸", cat: "adjective" },
  lijepo: { zh: "美", trad: "美", pin: "měi", vuk: "mej", srb: "lijepo", en: "beautiful", emoji: "🌸", cat: "adjective" },

  great: { zh: "伟大", trad: "偉大", pin: "wěidà", vuk: "vej-da", srb: "veličanstven / sjajan", en: "great", emoji: "🌟", cat: "adjective" },
  sjajno: { zh: "棒", trad: "棒", pin: "bàng", vuk: "bang", srb: "sjajno", en: "awesome / great", emoji: "🌟", cat: "adjective" },

  big: { zh: "大", trad: "大", pin: "dà", vuk: "da", srb: "velik / veliko", en: "big", emoji: "🐘", cat: "adjective" },
  velik: { zh: "大", trad: "大", pin: "dà", vuk: "da", srb: "velik", en: "big", emoji: "🐘", cat: "adjective" },
  veliko: { zh: "大", trad: "大", pin: "dà", vuk: "da", srb: "veliko", en: "big", emoji: "🐘", cat: "adjective" },
  velika: { zh: "大", trad: "大", pin: "dà", vuk: "da", srb: "velika", en: "big", emoji: "🐘", cat: "adjective" },

  small: { zh: "小", trad: "小", pin: "xiǎo", vuk: "sjao", srb: "mali / malo", en: "small", emoji: "🐜", cat: "adjective" },
  malo: { zh: "小", trad: "小", pin: "xiǎo", vuk: "sjao", srb: "malo", en: "small / a little", emoji: "🐜", cat: "adjective" },
  mali: { zh: "小", trad: "小", pin: "xiǎo", vuk: "sjao", srb: "mali", en: "small", emoji: "🐜", cat: "adjective" },
  mala: { zh: "小", trad: "小", pin: "xiǎo", vuk: "sjao", srb: "mala", en: "small", emoji: "🐜", cat: "adjective" },

  strong: { zh: "坚强", trad: "堅強", pin: "jiānqiáng", vuk: "đjen-ćjang", srb: "snažan / jak", en: "strong", emoji: "💪", cat: "adjective" },
  jak: { zh: "坚强", trad: "堅強", pin: "jiānqiáng", vuk: "đjen-ćjang", srb: "jak", en: "strong", emoji: "💪", cat: "adjective" },
  jako: { zh: "很", trad: "很", pin: "hěn", vuk: "hen", srb: "jako / veoma", en: "very / strong", emoji: "🔥", cat: "adverb" },
  snazan: { zh: "坚强", trad: "堅強", pin: "jiānqiáng", vuk: "đjen-ćjang", srb: "snažan", en: "strong", emoji: "💪", cat: "adjective" },

  calm: { zh: "平静", trad: "平靜", pin: "píngjìng", vuk: "ping-đing", srb: "miran / staložen", en: "calm", emoji: "🌊", cat: "adjective" },
  miran: { zh: "平静", trad: "平靜", pin: "píngjìng", vuk: "ping-đing", srb: "miran", en: "calm", emoji: "🌊", cat: "adjective" },
  mirno: { zh: "平静", trad: "平靜", pin: "píngjìng", vuk: "ping-đing", srb: "mirno", en: "calm", emoji: "🌊", cat: "adjective" },

  quiet: { zh: "安静", trad: "安靜", pin: "ānjìng", vuk: "an-đing", srb: "tih / tiho", en: "quiet", emoji: "🤫", cat: "adjective" },
  tih: { zh: "安静", trad: "安靜", pin: "ānjìng", vuk: "an-đing", srb: "tih", en: "quiet", emoji: "🤫", cat: "adjective" },
  tiho: { zh: "安静", trad: "安靜", pin: "ānjìng", vuk: "an-đing", srb: "tiho", en: "quiet", emoji: "🤫", cat: "adjective" },

  happy: { zh: "快乐", trad: "快樂", pin: "kuàilè", vuk: "kuaj-le", srb: "srećan", en: "happy", emoji: "😊", cat: "adjective" },
  srecan: { zh: "快乐", trad: "快樂", pin: "kuàilè", vuk: "kuaj-le", srb: "srećan", en: "happy", emoji: "😊", cat: "adjective" },
  sretan: { zh: "快乐", trad: "快樂", pin: "kuàilè", vuk: "kuaj-le", srb: "sretan", en: "happy", emoji: "😊", cat: "adjective" },

  true: { zh: "真实", trad: "真實", pin: "zhēnshí", vuk: "džen-ši", srb: "istinit / pravi", en: "true", emoji: "💎", cat: "adjective" },
  pravi: { zh: "真正", trad: "真正", pin: "zhēnzhèng", vuk: "džen-dženg", srb: "pravi", en: "real / true", emoji: "💎", cat: "adjective" },
  prava: { zh: "真正", trad: "真正", pin: "zhēnzhèng", vuk: "džen-dženg", srb: "prava", en: "real / true", emoji: "💎", cat: "adjective" },

  wise: { zh: "智", trad: "智", pin: "zhì", vuk: "dži", srb: "mudar", en: "wise", emoji: "🧙", cat: "adjective" },
  mudar: { zh: "智", trad: "智", pin: "zhì", vuk: "dži", srb: "mudar", en: "wise", emoji: "🧙", cat: "adjective" },
  mudra: { zh: "智", trad: "智", pin: "zhì", vuk: "dži", srb: "mudra", en: "wise", emoji: "🧙", cat: "adjective" },

  new: { zh: "新", trad: "新", pin: "xīn", vuk: "sin", srb: "nov / novo", en: "new", emoji: "🆕", cat: "adjective" },
  nov: { zh: "新", trad: "新", pin: "xīn", vuk: "sin", srb: "nov", en: "new", emoji: "🆕", cat: "adjective" },
  novo: { zh: "新", trad: "新", pin: "xīn", vuk: "sin", srb: "novo", en: "new", emoji: "🆕", cat: "adjective" },
  nova: { zh: "新", trad: "新", pin: "xīn", vuk: "sin", srb: "nova", en: "new", emoji: "🆕", cat: "adjective" },

  old: { zh: "老", trad: "老", pin: "lǎo", vuk: "lao", srb: "star / staro", en: "old", emoji: "📜", cat: "adjective" },
  stari: { zh: "老", trad: "老", pin: "lǎo", vuk: "lao", srb: "star / stari", en: "old", emoji: "📜", cat: "adjective" },
  staro: { zh: "老", trad: "老", pin: "lǎo", vuk: "lao", srb: "staro", en: "old", emoji: "📜", cat: "adjective" },

  safe: { zh: "平安", trad: "平安", pin: "píng'ān", vuk: "ping-an", srb: "bezbedan / siguran", en: "safe", emoji: "🛡️", cat: "adjective" },
  siguran: { zh: "平安", trad: "平安", pin: "píng'ān", vuk: "ping-an", srb: "siguran", en: "safe / secure", emoji: "🛡️", cat: "adjective" },
  bezbedan: { zh: "平安", trad: "平安", pin: "píng'ān", vuk: "ping-an", srb: "bezbedan", en: "safe", emoji: "🛡️", cat: "adjective" },

  warm: { zh: "暖", trad: "暖", pin: "nuǎn", vuk: "nuan", srb: "topao / toplo", en: "warm", emoji: "☀️", cat: "adjective" },
  topao: { zh: "暖", trad: "暖", pin: "nuǎn", vuk: "nuan", srb: "topao", en: "warm", emoji: "☀️", cat: "adjective" },
  toplo: { zh: "暖", trad: "暖", pin: "nuǎn", vuk: "nuan", srb: "toplo", en: "warm", emoji: "☀️", cat: "adjective" },

  fast: { zh: "快", trad: "快", pin: "kuài", vuk: "kuaj", srb: "brz / brzo", en: "fast", emoji: "⚡", cat: "adjective" },
  brz: { zh: "快", trad: "快", pin: "kuài", vuk: "kuaj", srb: "brz", en: "fast", emoji: "⚡", cat: "adjective" },
  brzo: { zh: "快", trad: "快", pin: "kuài", vuk: "kuaj", srb: "brzo", en: "fast / quickly", emoji: "⚡", cat: "adjective" },

  slow: { zh: "慢", trad: "慢", pin: "màn", vuk: "man", srb: "spor / sporo", en: "slow", emoji: "🐢", cat: "adjective" },
  spor: { zh: "慢", trad: "慢", pin: "màn", vuk: "man", srb: "spor", en: "slow", emoji: "🐢", cat: "adjective" },
  sporo: { zh: "慢", trad: "慢", pin: "màn", vuk: "man", srb: "sporo", en: "slowly", emoji: "🐢", cat: "adjective" },

  // --- PREPOSITIONS, CONNECTORS & PARTICLES ---
  and: { zh: "与", trad: "與", pin: "yǔ", vuk: "jü", srb: "i", en: "and", emoji: "🔗", cat: "particle" },
  te: { zh: "与", trad: "與", pin: "yǔ", vuk: "jü", srb: "i / te", en: "and", emoji: "🔗", cat: "particle" },
  with: { zh: "同", trad: "同", pin: "tóng", vuk: "tung", srb: "sa", en: "with", emoji: "🤝", cat: "particle" },
  sa: { zh: "同", trad: "同", pin: "tóng", vuk: "tung", srb: "sa", en: "with", emoji: "🤝", cat: "particle" },
  s: { zh: "同", trad: "同", pin: "tóng", vuk: "tung", srb: "s", en: "with", emoji: "🤝", cat: "particle" },
  bez: { zh: "无", trad: "無", pin: "wú", vuk: "vu", srb: "bez", en: "without", emoji: "🚫", cat: "particle" },
  without: { zh: "无", trad: "無", pin: "wú", vuk: "vu", srb: "bez", en: "without", emoji: "🚫", cat: "particle" },

  in: { zh: "在", trad: "在", pin: "zài", vuk: "caj", srb: "u", en: "in", emoji: "📍", cat: "particle" },
  u: { zh: "在", trad: "在", pin: "zài", vuk: "caj", srb: "u", en: "in", emoji: "📍", cat: "particle" },
  upon: { zh: "上", trad: "上", pin: "shàng", vuk: "šang", srb: "na", en: "upon / on", emoji: "📍", cat: "particle" },
  na: { zh: "在", trad: "在", pin: "zài", vuk: "caj", srb: "na", en: "on / at", emoji: "📍", cat: "particle" },
  at: { zh: "在", trad: "在", pin: "zài", vuk: "caj", srb: "kod / na", en: "at", emoji: "📍", cat: "particle" },
  towards: { zh: "向", trad: "向", pin: "xiàng", vuk: "sjang", srb: "ka / prema", en: "towards / to", emoji: "➡️", cat: "particle" },
  ka: { zh: "向", trad: "向", pin: "xiàng", vuk: "sjang", srb: "ka", en: "to", emoji: "➡️", cat: "particle" },
  prema: { zh: "向", trad: "向", pin: "xiàng", vuk: "sjang", srb: "prema", en: "towards", emoji: "➡️", cat: "particle" },
  for: { zh: "为", trad: "為", pin: "wèi", vuk: "vej", srb: "za", en: "for", emoji: "🎁", cat: "particle" },
  za: { zh: "为", trad: "為", pin: "wèi", vuk: "vej", srb: "za", en: "for", emoji: "🎁", cat: "particle" },
  from: { zh: "从", trad: "從", pin: "cóng", vuk: "cung", srb: "od / iz", en: "from", emoji: "🛫", cat: "particle" },
  od: { zh: "从", trad: "從", pin: "cóng", vuk: "cung", srb: "od", en: "from", emoji: "🛫", cat: "particle" },
  iz: { zh: "从", trad: "從", pin: "cóng", vuk: "cung", srb: "iz", en: "from / out of", emoji: "🛫", cat: "particle" },

  very: { zh: "很", trad: "很", pin: "hěn", vuk: "hen", srb: "veoma / jako", en: "very", emoji: "🔥", cat: "adverb" },
  veoma: { zh: "很", trad: "很", pin: "hěn", vuk: "hen", srb: "veoma", en: "very", emoji: "🔥", cat: "adverb" },
  puno: { zh: "很多", trad: "很多", pin: "hěn duō", vuk: "hen duo", srb: "puno", en: "a lot", emoji: "➕", cat: "adverb" },
  mnogo: { zh: "很多", trad: "很多", pin: "hěn duō", vuk: "hen duo", srb: "mnogo", en: "much / many", emoji: "➕", cat: "adverb" },

  really: { zh: "真", trad: "真", pin: "zhēn", vuk: "džen", srb: "zaista / stvarno", en: "really", emoji: "💎", cat: "adverb" },
  stvarno: { zh: "真", trad: "真", pin: "zhēn", vuk: "džen", srb: "stvarno", en: "really", emoji: "💎", cat: "adverb" },
  zaista: { zh: "真", trad: "真", pin: "zhēn", vuk: "džen", srb: "zaista", en: "truly", emoji: "💎", cat: "adverb" },

  not: { zh: "不", trad: "不", pin: "bù", vuk: "bu", srb: "ne", en: "not", emoji: "🚫", cat: "adverb" },
  ne: { zh: "不", trad: "不", pin: "bù", vuk: "bu", srb: "ne", en: "no / not", emoji: "🚫", cat: "adverb" },
  no: { zh: "不", trad: "不", pin: "bù", vuk: "bu", srb: "ne", en: "no", emoji: "🚫", cat: "adverb" },
  yes: { zh: "是", trad: "是", pin: "shì", vuk: "ši", srb: "da", en: "yes", emoji: "✅", cat: "expression" },
  da: { zh: "是的", trad: "是的", pin: "shì de", vuk: "ši de", srb: "da", en: "yes", emoji: "✅", cat: "expression" },

  also: { zh: "也", trad: "也", pin: "yě", vuk: "je", srb: "takođe", en: "also", emoji: "➕", cat: "adverb" },
  too: { zh: "也", trad: "也", pin: "yě", vuk: "je", srb: "takođe", en: "too", emoji: "➕", cat: "adverb" },
  takodje: { zh: "也", trad: "也", pin: "yě", vuk: "je", srb: "takođe", en: "also", emoji: "➕", cat: "adverb" },

  together: { zh: "一起", trad: "一起", pin: "yīqǐ", vuk: "ji-ći", srb: "zajedno", en: "together", emoji: "🤝", cat: "adverb" },
  zajedno: { zh: "一起", trad: "一起", pin: "yīqǐ", vuk: "ji-ći", srb: "zajedno", en: "together", emoji: "🤝", cat: "adverb" },
  alone: { zh: "独自", trad: "獨自", pin: "dúzì", vuk: "du-ci", srb: "sam / usamljeno", en: "alone", emoji: "👤", cat: "adverb" },
  usamljen: { zh: "独自", trad: "獨自", pin: "dúzì", vuk: "du-ci", srb: "usamljen", en: "lonely", emoji: "👤", cat: "adverb" },

  // --- GREETINGS & MANNERS ---
  hello: { zh: "你好", trad: "你好", pin: "nǐ hǎo", vuk: "ni hao", srb: "zdravo", en: "hello", emoji: "👋", cat: "expression" },
  hi: { zh: "你好", trad: "你好", pin: "nǐ hǎo", vuk: "ni hao", srb: "zdravo", en: "hi", emoji: "👋", cat: "expression" },
  zdravo: { zh: "你好", trad: "你好", pin: "nǐ hǎo", vuk: "ni hao", srb: "zdravo", en: "hello", emoji: "👋", cat: "expression" },
  cao: { zh: "你好", trad: "你好", pin: "nǐ hǎo", vuk: "ni hao", srb: "ćao", en: "hi / bye", emoji: "👋", cat: "expression" },
  goodbye: { zh: "再见", trad: "再見", pin: "zàijiàn", vuk: "caj-đjen", srb: "doviđenja", en: "goodbye", emoji: "👋", cat: "expression" },
  dovidjenja: { zh: "再见", trad: "再見", pin: "zàijiàn", vuk: "caj-đjen", srb: "doviđenja", en: "goodbye", emoji: "👋", cat: "expression" },

  thanks: { zh: "谢谢", trad: "謝謝", pin: "xièxie", vuk: "sje-sje", srb: "hvala", en: "thanks", emoji: "🙏", cat: "expression" },
  thank: { zh: "谢谢", trad: "謝謝", pin: "xièxie", vuk: "sje-sje", srb: "hvala", en: "thank", emoji: "🙏", cat: "expression" },
  hvala: { zh: "谢谢", trad: "謝謝", pin: "xièxie", vuk: "sje-sje", srb: "hvala", en: "thank you", emoji: "🙏", cat: "expression" },

  please: { zh: "请", trad: "請", pin: "qǐng", vuk: "ćing", srb: "molim", en: "please", emoji: "🙏", cat: "expression" },
  molim: { zh: "请", trad: "請", pin: "qǐng", vuk: "ćing", srb: "molim", en: "please", emoji: "🙏", cat: "expression" },

  // --- NUMBERS ---
  one: { zh: "一", trad: "一", pin: "yī", vuk: "ji", srb: "jedan", en: "one", emoji: "1️⃣", cat: "expression" },
  jedan: { zh: "一", trad: "一", pin: "yī", vuk: "ji", srb: "jedan", en: "one", emoji: "1️⃣", cat: "expression" },
  two: { zh: "二", trad: "二", pin: "èr", vuk: "er", srb: "dva", en: "two", emoji: "2️⃣", cat: "expression" },
  dva: { zh: "二", trad: "二", pin: "èr", vuk: "er", srb: "dva", en: "two", emoji: "2️⃣", cat: "expression" },
  three: { zh: "三", trad: "三", pin: "sān", vuk: "san", srb: "tri", en: "three", emoji: "3️⃣", cat: "expression" },
  tri: { zh: "三", trad: "三", pin: "sān", vuk: "san", srb: "tri", en: "three", emoji: "3️⃣", cat: "expression" },
  four: { zh: "四", trad: "四", pin: "sì", vuk: "si", srb: "četiri", en: "four", emoji: "4️⃣", cat: "expression" },
  cetiri: { zh: "四", trad: "四", pin: "sì", vuk: "si", srb: "četiri", en: "four", emoji: "4️⃣", cat: "expression" },
  five: { zh: "五", trad: "五", pin: "wǔ", vuk: "vu", srb: "pet", en: "five", emoji: "5️⃣", cat: "expression" },
  pet: { zh: "五", trad: "五", pin: "wǔ", vuk: "vu", srb: "pet", en: "five", emoji: "5️⃣", cat: "expression" },
  ten: { zh: "十", trad: "十", pin: "shí", vuk: "ši", srb: "deset", en: "ten", emoji: "🔟", cat: "expression" },
  deset: { zh: "十", trad: "十", pin: "shí", vuk: "ši", srb: "deset", en: "ten", emoji: "🔟", cat: "expression" }
};

// Common Collocation Patterns (Multi-word phrases)
const COLLOCATIONS: Array<{
  pattern: RegExp;
  words: ChineseWordMeta[];
}> = [
  {
    pattern: /\b(want to drink|wants to drink|zelim da pijem|zelim piti|hocu da pijem|hocu piti)\b/i,
    words: [
      { chinese: "想喝", chineseTraditional: "想喝", pinyin: "xiǎng hē", vuk: "sjang he", english: "want to drink", serbian: "želim da pijem", emoji: "🍵", category: "verb" }
    ]
  },
  {
    pattern: /\b(want to eat|wants to eat|zelim da jedem|zelim jesti|hocu da jedem|hocu jesti)\b/i,
    words: [
      { chinese: "想吃", chineseTraditional: "想吃", pinyin: "xiǎng chī", vuk: "sjang či", english: "want to eat", serbian: "želim da jedem", emoji: "🥢", category: "verb" }
    ]
  },
  {
    pattern: /\b(want to learn|wants to learn|zelim da ucim|zelim uciti|hocu da ucim|hocu uciti)\b/i,
    words: [
      { chinese: "想学", chineseTraditional: "想學", pinyin: "xiǎng xué", vuk: "sjang sjüe", english: "want to learn", serbian: "želim da učim", emoji: "📚", category: "verb" }
    ]
  },
  {
    pattern: /\b(good morning|dobro jutro)\b/i,
    words: [
      { chinese: "早上好", chineseTraditional: "早上好", pinyin: "zǎoshang hǎo", vuk: "zao-šang hao", english: "good morning", serbian: "dobro jutro", emoji: "🌅", category: "expression" }
    ]
  },
  {
    pattern: /\b(good night|laku noc)\b/i,
    words: [
      { chinese: "晚安", chineseTraditional: "晚安", pinyin: "wǎn'ān", vuk: "van-an", english: "good night", serbian: "laku noć", emoji: "🌙", category: "expression" }
    ]
  },
  {
    pattern: /\b(how are you|kako si)\b/i,
    words: [
      { chinese: "你好吗", chineseTraditional: "你好嗎", pinyin: "nǐ hǎo ma", vuk: "ni hao ma", english: "how are you", serbian: "kako si", emoji: "👋", category: "expression" }
    ]
  },
  {
    pattern: /\b(thank you|hvala ti|hvala vam)\b/i,
    words: [
      { chinese: "谢谢你", chineseTraditional: "謝謝你", pinyin: "xièxie nǐ", vuk: "sje-sje ni", english: "thank you", serbian: "hvala ti", emoji: "🙏", category: "expression" }
    ]
  },
  {
    pattern: /\b(you are welcome|you're welcome|nema na cemu)\b/i,
    words: [
      { chinese: "不客气", chineseTraditional: "不客氣", pinyin: "bù kèqi", vuk: "bu ke-ći", english: "you are welcome", serbian: "nema na čemu", emoji: "😊", category: "expression" }
    ]
  },
  {
    pattern: /\b(all over the world|sirom sveta)\b/i,
    words: [
      { chinese: "世界各地", chineseTraditional: "世界各地", pinyin: "shìjiè gèdì", vuk: "ši-đie ge-di", english: "all over the world", serbian: "širom sveta", emoji: "🌍", category: "noun" }
    ]
  },
  {
    pattern: /\b(peace and wisdom|mir i mudrost)\b/i,
    words: [
      { chinese: "和平与智慧", chineseTraditional: "和平與智慧", pinyin: "hépíng yǔ zhìhuì", vuk: "he-ping jü dži-huej", english: "peace and wisdom", serbian: "mir i mudrost", emoji: "🕊️", category: "noun" }
    ]
  }
];

/**
 * Intelligent Fallback Chinese Translator
 * Accurately parses sentences without dropping words or leaving brackets.
 */
export function buildLinguisticChineseTranslation(inputSentence: string): ConfiguredChineseResult {
  const cleanOriginal = inputSentence.trim();
  const lower = cleanOriginal.toLowerCase();

  // 1. Check exact presets
  for (const [key, preset] of Object.entries(CHINESE_EXACT_PRESETS)) {
    if (lower.includes(key)) {
      return {
        chineseWithEmojis: `${preset.chinese} ${preset.emojis.join(' ')}`,
        chinese: preset.chinese,
        chineseTraditional: preset.chineseTraditional || preset.chinese,
        pinyin: preset.pinyin,
        vukPhonetic: preset.vuk,
        serbian: preset.serbian,
        english: cleanOriginal,
        emojis: preset.emojis,
        words: preset.words,
        grammarNote: preset.grammarNote
      };
    }
  }

  const matchedWords: ChineseWordMeta[] = [];
  const emojisFound: string[] = [];

  // 2. Collocations
  let working = lower
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const col of COLLOCATIONS) {
    if (col.pattern.test(working)) {
      col.words.forEach(w => {
        matchedWords.push({ ...w });
        if (!emojisFound.includes(w.emoji)) emojisFound.push(w.emoji);
      });
      working = working.replace(col.pattern, ' ');
    }
  }

  // 3. Process individual words with lemmatization & fallback
  const rawTokens = working.split(/\s+/).filter(Boolean);

  for (const rawToken of rawTokens) {
    const token = rawToken.toLowerCase().trim();
    if (!token) continue;

    // Check direct dictionary
    if (CHINESE_DICT[token]) {
      const item = CHINESE_DICT[token];
      matchedWords.push({
        chinese: item.zh,
        chineseTraditional: item.trad,
        pinyin: item.pin,
        vuk: item.vuk,
        english: item.en,
        serbian: item.srb,
        emoji: item.emoji,
        category: item.cat
      });
      if (!emojisFound.includes(item.emoji)) emojisFound.push(item.emoji);
      continue;
    }

    // Lemmatization rules
    let candidate = token;
    if (candidate.endsWith('ing')) candidate = candidate.slice(0, -3);
    else if (candidate.endsWith('ed')) candidate = candidate.slice(0, -2);
    else if (candidate.endsWith('es')) candidate = candidate.slice(0, -2);
    else if (candidate.endsWith('s') && candidate.length > 2) candidate = candidate.slice(0, -1);
    // Serbian inflected endings
    else if (candidate.endsWith('om') || candidate.endsWith('em')) candidate = candidate.slice(0, -2);
    else if (candidate.endsWith('im') || candidate.endsWith('em') || candidate.endsWith('am')) candidate = candidate.slice(0, -2) + 'ti';
    else if (candidate.endsWith('u') && candidate.length > 2) candidate = candidate.slice(0, -1) + 'a';
    else if (candidate.endsWith('e') && candidate.length > 2) candidate = candidate.slice(0, -1) + 'a';
    else if (candidate.endsWith('i') && candidate.length > 2) candidate = candidate.slice(0, -1);

    if (CHINESE_DICT[candidate]) {
      const item = CHINESE_DICT[candidate];
      matchedWords.push({
        chinese: item.zh,
        chineseTraditional: item.trad,
        pinyin: item.pin,
        vuk: item.vuk,
        english: token,
        serbian: item.srb,
        emoji: item.emoji,
        category: item.cat
      });
      if (!emojisFound.includes(item.emoji)) emojisFound.push(item.emoji);
      continue;
    }

    // Number digits fallback
    if (/^\d+$/.test(token)) {
      matchedWords.push({
        chinese: token,
        chineseTraditional: token,
        pinyin: token,
        vuk: token,
        english: token,
        serbian: token,
        emoji: "🔢",
        category: "expression"
      });
      if (!emojisFound.includes("🔢")) emojisFound.push("🔢");
      continue;
    }

    // Clean word without brackets so UI never shows [token]
    const cleanWord = token.replace(/[\[\]]/g, '');
    matchedWords.push({
      chinese: cleanWord,
      chineseTraditional: cleanWord,
      pinyin: cleanWord,
      vuk: cleanWord,
      english: cleanWord,
      serbian: cleanWord,
      emoji: "✨",
      category: "expression"
    });
    if (!emojisFound.includes("✨")) emojisFound.push("✨");
  }

  // If nothing matched, provide default inspiring peace & wisdom
  if (matchedWords.length === 0) {
    matchedWords.push(
      { chinese: "和平", chineseTraditional: "和平", pinyin: "hépíng", vuk: "he-ping", english: "peace", serbian: "mir", emoji: "🕊️", category: "noun" },
      { chinese: "与", chineseTraditional: "與", pinyin: "yǔ", vuk: "jü", english: "and", serbian: "i", emoji: "🔗", category: "particle" },
      { chinese: "智慧", chineseTraditional: "智慧", pinyin: "zhìhuì", vuk: "dži-huej", english: "wisdom", serbian: "mudrost", emoji: "🧠", category: "noun" }
    );
    emojisFound.push("🕊️", "✨", "🧠");
  }

  if (emojisFound.length === 0) emojisFound.push("✨", "🌸");
  if (emojisFound.length < 2) emojisFound.push("🌟");

  // Construct readable Chinese sentence
  let fullZh = '';
  let fullTrad = '';
  for (let i = 0; i < matchedWords.length; i++) {
    const curZh = matchedWords[i].chinese;
    const curTrad = matchedWords[i].chineseTraditional || curZh;
    const isHanzi = /[\u4e00-\u9fa5]/.test(curZh);

    if (i > 0) {
      const prevZh = matchedWords[i - 1].chinese;
      const prevIsHanzi = /[\u4e00-\u9fa5]/.test(prevZh);
      if (!isHanzi || !prevIsHanzi) {
        fullZh += ' ';
        fullTrad += ' ';
      }
    }
    fullZh += curZh;
    fullTrad += curTrad;
  }

  const fullPin = matchedWords.map(m => m.pinyin).join(' ');
  const fullVuk = matchedWords.map(m => m.vuk).join(' ');
  const fullSrb = matchedWords.map(m => m.serbian).join(' ');
  const emojiStr = emojisFound.slice(0, 3).join(' ');

  return {
    chineseWithEmojis: `${fullZh} ${emojiStr}`,
    chinese: fullZh,
    chineseTraditional: fullTrad,
    pinyin: fullPin,
    vukPhonetic: fullVuk,
    serbian: fullSrb,
    english: cleanOriginal,
    emojis: emojisFound.slice(0, 3),
    words: matchedWords,
    grammarNote: "Kineski jezik koristi SVO redosled reči (Subjekat + Glagol + Objekat). Reči ne menjaju oblik za padeže, rod ili vremena."
  };
}
