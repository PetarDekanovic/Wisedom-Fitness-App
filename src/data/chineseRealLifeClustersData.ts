// ============================================================================
// CHINESE REAL LIFE CLUSTERS - HIGH-FREQUENCY VOCABULARY & IDIOMS (CHENGYU/YANYU)
// 840 Essential Native Words (~90% Everyday Spoken Coverage) & Classical Proverbs
// ============================================================================

export interface RealLifeWordItem {
  char: string;
  charTraditional?: string;
  pinyin: string;
  vuk: string;
  english: string;
  serbian: string;
  exampleUse: string;
  isCoreChar?: boolean; // true if one of the 10 root characters from the image chart
  category?: 'noun' | 'verb' | 'adjective' | 'phrase' | 'number' | 'direction';
  hskLevel?: number; // 1, 2, 3, 4
  frequencyRank?: string; // e.g. "Top 100", "Top 300", "Top 800"
}

export interface RealLifeSentenceToken {
  word: string;
  pinyin: string;
  english: string;
  serbian: string;
  isTarget?: boolean;
}

export interface RealLifeIdiomOrProverb {
  id: string;
  type: 'chengyu' | 'proverb' | 'wisdom_quote';
  typeLabel: string; // e.g. "成语 4-Character Idiom", "古训 / 谚语 Classical Proverb"
  chinese: string;
  chineseTraditional?: string;
  pinyin: string;
  vuk: string;
  literalEnglish: string;
  english: string;
  serbianEquivalent: string; // E.g., "Tiha voda breg roni", "Ko rano rani dve sreće grabi"
  serbian: string;
  philosophicalContext: string; // Stoic / Cultural insight
  targetWords: string[];
  context: string;
  tokens: RealLifeSentenceToken[];
}

// Backwards compatibility alias for components that consume RealLifeSentence
export type RealLifeSentence = RealLifeIdiomOrProverb;

export interface RealLifeCluster {
  id: string;
  chartId: 1 | 2;
  rowNumber: number;
  title: string;
  titleSerbian: string;
  emoji: string;
  chartImage: string;
  description: string;
  words: RealLifeWordItem[];
  sentences: RealLifeIdiomOrProverb[];
}

export const REAL_LIFE_CLUSTERS: RealLifeCluster[] = [
  {
    "id": "c1-r1",
    "chartId": 1,
    "rowNumber": 1,
    "title": "Scale & Numbers",
    "titleSerbian": "Veličina i Brojevi",
    "emoji": "🔢",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Foundational scale, quantities, numbers, and core negations that form the basis of counting and comparison.",
    "words": [
      {
        "char": "大",
        "pinyin": "dà",
        "vuk": "da",
        "english": "big / great",
        "serbian": "veliko / sjajno",
        "exampleUse": "大人 (odrasla osoba)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 50"
      },
      {
        "char": "小",
        "pinyin": "xiǎo",
        "vuk": "sjao",
        "english": "small / little",
        "serbian": "malo",
        "exampleUse": "小心 (pažljivo)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 50"
      },
      {
        "char": "一",
        "pinyin": "yī",
        "vuk": "ji",
        "english": "one",
        "serbian": "jedan",
        "exampleUse": "一共 (ukupno)",
        "isCoreChar": true,
        "category": "number",
        "frequencyRank": "Top 10"
      },
      {
        "char": "二",
        "pinyin": "èr",
        "vuk": "er",
        "english": "two",
        "serbian": "dva",
        "exampleUse": "二十 (dvadeset)",
        "isCoreChar": true,
        "category": "number",
        "frequencyRank": "Top 30"
      },
      {
        "char": "三",
        "pinyin": "sān",
        "vuk": "san",
        "english": "three",
        "serbian": "tri",
        "exampleUse": "三个 (tri komada)",
        "isCoreChar": true,
        "category": "number",
        "frequencyRank": "Top 30"
      },
      {
        "char": "十",
        "pinyin": "shí",
        "vuk": "ši",
        "english": "ten",
        "serbian": "deset",
        "exampleUse": "十分 (veoma/deset delova)",
        "isCoreChar": true,
        "category": "number",
        "frequencyRank": "Top 40"
      },
      {
        "char": "百",
        "pinyin": "bǎi",
        "vuk": "baj",
        "english": "hundred",
        "serbian": "sto",
        "exampleUse": "一百 (sto)",
        "isCoreChar": true,
        "category": "number",
        "frequencyRank": "Top 100"
      },
      {
        "char": "千",
        "pinyin": "qiān",
        "vuk": "ćjen",
        "english": "thousand",
        "serbian": "hiljada",
        "exampleUse": "千万 (obavezno/milioni)",
        "isCoreChar": true,
        "category": "number",
        "frequencyRank": "Top 150"
      },
      {
        "char": "多",
        "pinyin": "duō",
        "vuk": "duo",
        "english": "much / many",
        "serbian": "mnogo",
        "exampleUse": "多少 (koliko)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 50"
      },
      {
        "char": "不",
        "pinyin": "bù",
        "vuk": "bu",
        "english": "not / no",
        "serbian": "ne",
        "exampleUse": "不是 (nije)",
        "isCoreChar": true,
        "category": "phrase",
        "frequencyRank": "Top 5"
      },
      {
        "char": "多少",
        "pinyin": "duōshao",
        "vuk": "duo-šao",
        "english": "how much / how many",
        "serbian": "koliko",
        "exampleUse": "多少钱？ (koliko košta?)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 80"
      },
      {
        "char": "一共",
        "pinyin": "yīgòng",
        "vuk": "ji-gung",
        "english": "altogether / in total",
        "serbian": "ukupno / sve zajedno",
        "exampleUse": "一共一百块 (ukupno 100 yuana)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 120"
      },
      {
        "char": "一起",
        "pinyin": "yīqǐ",
        "vuk": "ji-ći",
        "english": "together",
        "serbian": "zajedno",
        "exampleUse": "我们一起 (mi zajedno)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 60"
      },
      {
        "char": "非常",
        "pinyin": "fēicháng",
        "vuk": "fej-čang",
        "english": "very / exceptionally",
        "serbian": "veoma / izuzetno",
        "exampleUse": "非常大 (izuzetno veliko)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 100"
      },
      {
        "char": "许多",
        "pinyin": "xǔduō",
        "vuk": "sü-duo",
        "english": "many / a lot of",
        "serbian": "mnogo / brojni",
        "exampleUse": "许多人 (mnogo ljudi)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 140"
      },
      {
        "char": "第一",
        "pinyin": "dì-yī",
        "vuk": "di-ji",
        "english": "first / number one",
        "serbian": "prvi",
        "exampleUse": "第一步 (prvi korak)",
        "isCoreChar": false,
        "category": "number",
        "frequencyRank": "Top 90"
      },
      {
        "char": "一半",
        "pinyin": "yībàn",
        "vuk": "ji-ban",
        "english": "half",
        "serbian": "polovina",
        "exampleUse": "分一半 (podeliti na pola)",
        "isCoreChar": false,
        "category": "number",
        "frequencyRank": "Top 180"
      },
      {
        "char": "很大",
        "pinyin": "hěn dà",
        "vuk": "hen da",
        "english": "very big / large",
        "serbian": "veoma veliko",
        "exampleUse": "地方很大 (mesto je prostrano)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 50"
      },
      {
        "char": "不错",
        "pinyin": "bùcuò",
        "vuk": "bu-cuo",
        "english": "not bad / pretty good",
        "serbian": "nije loše / sasvim dobro",
        "exampleUse": "味道不错 (ukus je odličan)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 110"
      },
      {
        "char": "不仅",
        "pinyin": "bùjǐn",
        "vuk": "bu-đjin",
        "english": "not only",
        "serbian": "ne samo",
        "exampleUse": "不仅如此 (ne samo to)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 200"
      },
      {
        "char": "不会",
        "pinyin": "bù huì",
        "vuk": "bu huej",
        "english": "cannot / will not",
        "serbian": "neće / ne ume",
        "exampleUse": "我不会 (ja ne umem)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 60"
      },
      {
        "char": "大概",
        "pinyin": "dàgài",
        "vuk": "da-gaj",
        "english": "roughly / approximately",
        "serbian": "otprilike / verovatno",
        "exampleUse": "大概十个 (otprilike deset)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 160"
      },
      {
        "char": "全部",
        "pinyin": "quánbù",
        "vuk": "ćüan-bu",
        "english": "all / whole / entirely",
        "serbian": "sve / u celosti",
        "exampleUse": "全部完成 (sve završeno)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 180"
      },
      {
        "char": "少数",
        "pinyin": "shǎoshù",
        "vuk": "šao-šu",
        "english": "small number / minority",
        "serbian": "manjina / mali broj",
        "exampleUse": "少数人 (mali broj ljudi)",
        "isCoreChar": false,
        "category": "number",
        "frequencyRank": "Top 250"
      },
      {
        "char": "差不多",
        "pinyin": "chàbuduō",
        "vuk": "ča-bu-duo",
        "english": "almost / about the same",
        "serbian": "skoro / tu negde",
        "exampleUse": "差不多好了 (skoro gotovo)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 130"
      },
      {
        "char": "不多",
        "pinyin": "bù duō",
        "vuk": "bu duo",
        "english": "not much / few",
        "serbian": "malo / nije mnogo",
        "exampleUse": "时间不多 (malo je vremena)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 90"
      },
      {
        "char": "千万",
        "pinyin": "qiānwàn",
        "vuk": "ćjen-van",
        "english": "by all means / millions",
        "serbian": "obavezno / ni po koju cenu",
        "exampleUse": "千万小心 (obavezno pazi)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 210"
      },
      {
        "char": "百分之",
        "pinyin": "bǎifēnzhī",
        "vuk": "baj-fen-dž",
        "english": "percent",
        "serbian": "procenat",
        "exampleUse": "百分之百 (sto posto)",
        "isCoreChar": false,
        "category": "number",
        "frequencyRank": "Top 190"
      },
      {
        "char": "增加",
        "pinyin": "zēngjiā",
        "vuk": "ceng-đja",
        "english": "increase / add",
        "serbian": "povećati / uvećati",
        "exampleUse": "数量增加 (količina se uvećava)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 220"
      },
      {
        "char": "减少",
        "pinyin": "jiǎnshǎo",
        "vuk": "đjen-šao",
        "english": "decrease / reduce",
        "serbian": "smanjiti",
        "exampleUse": "减少压力 (smanjiti stres)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 240"
      },
      {
        "char": "另外",
        "pinyin": "lìngwài",
        "vuk": "ling-vaj",
        "english": "in addition / besides",
        "serbian": "pored toga / još i",
        "exampleUse": "另外一个 (još jedan)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 170"
      },
      {
        "char": "两个",
        "pinyin": "liǎng ge",
        "vuk": "ljang ge",
        "english": "two items / a couple",
        "serbian": "dva komada",
        "exampleUse": "两个人 (dvoje ljudi)",
        "isCoreChar": false,
        "category": "number",
        "frequencyRank": "Top 40"
      },
      {
        "char": "一下",
        "pinyin": "yīxià",
        "vuk": "ji-sja",
        "english": "a bit / once",
        "serbian": "na trenutak / malo",
        "exampleUse": "看一眼 (baci pogled)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 70"
      },
      {
        "char": "一定",
        "pinyin": "yīdìng",
        "vuk": "ji-ding",
        "english": "definitely / must",
        "serbian": "sigurno / bez sumnje",
        "exampleUse": "一定要来 (obavezno dođi)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 85"
      },
      {
        "char": "不大",
        "pinyin": "bù dà",
        "vuk": "bu da",
        "english": "not big",
        "serbian": "nije veliko",
        "exampleUse": "问题不大 (nije veliki problem)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 100"
      },
      {
        "char": "不用",
        "pinyin": "bùyòng",
        "vuk": "bu-jung",
        "english": "no need / not necessary",
        "serbian": "nema potrebe / ne treba",
        "exampleUse": "不用担心 (ne brini)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 95"
      },
      {
        "char": "稍微",
        "pinyin": "shāowēi",
        "vuk": "šao-vej",
        "english": "slightly / a little",
        "serbian": "malo / mrvicu",
        "exampleUse": "稍微休息 (kratko odmoriti)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 220"
      },
      {
        "char": "巨大",
        "pinyin": "jùdà",
        "vuk": "đjü-da",
        "english": "huge / gigantic",
        "serbian": "ogroman / kolosalan",
        "exampleUse": "巨大进步 (ogroman napredak)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 280"
      },
      {
        "char": "微小",
        "pinyin": "wēixiǎo",
        "vuk": "vej-sjao",
        "english": "tiny / minute",
        "serbian": "sićušan / mikroskopski",
        "exampleUse": "微小的变化 (sićušna promena)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 350"
      },
      {
        "char": "相当",
        "pinyin": "xiāngdāng",
        "vuk": "sjang-dang",
        "english": "quite / considerably",
        "serbian": "prilično / u znatnoj meri",
        "exampleUse": "相当好 (prilično dobro)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 210"
      },
      {
        "char": "多数",
        "pinyin": "duōshù",
        "vuk": "duo-šu",
        "english": "majority / most",
        "serbian": "većina",
        "exampleUse": "多数人 (većina ljudi)",
        "isCoreChar": false,
        "category": "number",
        "frequencyRank": "Top 230"
      },
      {
        "char": "万一",
        "pinyin": "wànyī",
        "vuk": "van-ji",
        "english": "just in case / if by chance",
        "serbian": "za svaki slučaj",
        "exampleUse": "以防万一 (radi predostrožnosti)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 310"
      }
    ],
    "sentences": [
      {
        "id": "idm-1-1",
        "type": "proverb",
        "typeLabel": "古训 / 哲理名言 (Daoist Classic)",
        "chinese": "千里之行，始于足下。",
        "pinyin": "Qiān lǐ zhī xíng, shǐ yú zú xià.",
        "vuk": "Ćjen li dž sing, ši ji cu sja.",
        "literalEnglish": "A journey of a thousand li begins right beneath your feet.",
        "english": "A journey of a thousand miles begins with a single step.",
        "serbianEquivalent": "Svaki veliki put počinje prvim korakom. / Zrno po zrno pogača.",
        "serbian": "Putovanje od hiljadu milja počinje jednim jedinim korakom ispod tvojih stopala.",
        "philosophicalContext": "Iz Lao Ceovog Tao Te Đinga. Podseća nas da se nijedan kolosalni uspeh ne postiže preko noći, već disciplinovanim, malim dnevnim radnjama.",
        "targetWords": [
          "千",
          "一",
          "行",
          "足",
          "下"
        ],
        "context": "Laozi Daoism • Discipline & Endurance",
        "tokens": [
          {
            "word": "千里",
            "pinyin": "qiān lǐ",
            "english": "thousand miles",
            "serbian": "hiljadu milja",
            "isTarget": true
          },
          {
            "word": "之",
            "pinyin": "zhī",
            "english": "of",
            "serbian": "od"
          },
          {
            "word": "行",
            "pinyin": "xíng",
            "english": "journey/walk",
            "serbian": "putovanje",
            "isTarget": true
          },
          {
            "word": "始于",
            "pinyin": "shǐ yú",
            "english": "begins at",
            "serbian": "počinje na"
          },
          {
            "word": "足下",
            "pinyin": "zú xià",
            "english": "beneath feet",
            "serbian": "ispod stopala",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-1-2",
        "type": "chengyu",
        "typeLabel": "成语 (Ancient Idiom)",
        "chinese": "百闻不如一见。",
        "pinyin": "Bǎi wén bù rú yī jiàn.",
        "vuk": "Baj ven bu ru ji đjen.",
        "literalEnglish": "Hearing a hundred times is not as good as seeing once.",
        "english": "Seeing is believing / One look is worth a hundred reports.",
        "serbianEquivalent": "Bolje jednom videti nego sto puta čuti.",
        "serbian": "Čuti stotinu puta ne vredi koliko videti sopstvenim očima.",
        "philosophicalContext": "Iz Knjige Hana (Han Shu). Empirijski uvid ima neuporedivo veću težinu od neproverenih priča i glasina.",
        "targetWords": [
          "百",
          "闻",
          "不",
          "一",
          "见"
        ],
        "context": "Empirical Truth • Stoic Clarity",
        "tokens": [
          {
            "word": "百闻",
            "pinyin": "bǎi wén",
            "english": "hear 100 times",
            "serbian": "stotinu puta čuti",
            "isTarget": true
          },
          {
            "word": "不如",
            "pinyin": "bù rú",
            "english": "not equal to",
            "serbian": "ne vredi kao",
            "isTarget": true
          },
          {
            "word": "一见",
            "pinyin": "yī jiàn",
            "english": "see once",
            "serbian": "jednom videti",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-1-3",
        "type": "chengyu",
        "typeLabel": "成语 (Laozi Philosophy)",
        "chinese": "大智若愚，大巧若拙。",
        "pinyin": "Dà zhì ruò yú, dà qiǎo ruò zhuō.",
        "vuk": "Da dži ruo ji, da ćjao ruo džuo.",
        "literalEnglish": "Great wisdom appears like foolishness, supreme skill looks clumsy.",
        "english": "Great wisdom often masks itself as simplicity.",
        "serbianEquivalent": "Ko mnogo zna, malo govori. / Mudra glava ne hvali se sama.",
        "serbian": "Najviša mudrost često izgleda kao jednostavnost ili naivnost, a vrhunsko majstorstvo kao skromnost.",
        "philosophicalContext": "Izvorni stoički stav: pravi majstor nema potrebu da se dokazuje galamom pred drugima. Suština prevazilazi formu.",
        "targetWords": [
          "大",
          "小"
        ],
        "context": "Humility & Mastery • Skromnost i Majstorstvo",
        "tokens": [
          {
            "word": "大智",
            "pinyin": "dà zhì",
            "english": "great wisdom",
            "serbian": "velika mudrost",
            "isTarget": true
          },
          {
            "word": "若愚",
            "pinyin": "ruò yú",
            "english": "like foolishness",
            "serbian": "kao naivnost"
          },
          {
            "word": "大巧",
            "pinyin": "dà qiǎo",
            "english": "supreme skill",
            "serbian": "vrhunsko majstorstvo",
            "isTarget": true
          },
          {
            "word": "若拙",
            "pinyin": "ruò zhuō",
            "english": "looks clumsy",
            "serbian": "izgleda skromno"
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r2",
    "chartId": 1,
    "rowNumber": 2,
    "title": "People & Society",
    "titleSerbian": "Ljudi, Uloge i Društvo",
    "emoji": "👥",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Human relationships, social roles, identity pronouns, and family titles that structure daily society.",
    "words": [
      {
        "char": "人",
        "pinyin": "rén",
        "vuk": "žen",
        "english": "person / human",
        "serbian": "čovek / osoba",
        "exampleUse": "人们 (ljudi)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 10"
      },
      {
        "char": "夫",
        "pinyin": "fū",
        "vuk": "fu",
        "english": "husband / man",
        "serbian": "muž / čovek",
        "exampleUse": "丈夫 (suprug)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "子",
        "pinyin": "zǐ",
        "vuk": "ce",
        "english": "child / son",
        "serbian": "dete / sin",
        "exampleUse": "孩子 (dete)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 30"
      },
      {
        "char": "男",
        "pinyin": "nán",
        "vuk": "nan",
        "english": "male / man",
        "serbian": "muškarac",
        "exampleUse": "男人 (muškarac)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "女",
        "pinyin": "nǚ",
        "vuk": "ni",
        "english": "female / woman",
        "serbian": "žena",
        "exampleUse": "女人 (žena)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "王",
        "pinyin": "wáng",
        "vuk": "vang",
        "english": "king / monarch",
        "serbian": "kralj / vladar",
        "exampleUse": "国王 (kralj)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "主",
        "pinyin": "zhǔ",
        "vuk": "džu",
        "english": "master / host",
        "serbian": "gospodar / vlasnik",
        "exampleUse": "主要 (glavni/osnovni)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 70"
      },
      {
        "char": "我",
        "pinyin": "wǒ",
        "vuk": "vo",
        "english": "I / me",
        "serbian": "ja / mene",
        "exampleUse": "我们 (mi)",
        "isCoreChar": true,
        "category": "phrase",
        "frequencyRank": "Top 5"
      },
      {
        "char": "你",
        "pinyin": "nǐ",
        "vuk": "ni",
        "english": "you",
        "serbian": "ti",
        "exampleUse": "你好 (zdravo)",
        "isCoreChar": true,
        "category": "phrase",
        "frequencyRank": "Top 8"
      },
      {
        "char": "他",
        "pinyin": "tā",
        "vuk": "ta",
        "english": "he / him",
        "serbian": "on / njega",
        "exampleUse": "他们 (oni)",
        "isCoreChar": true,
        "category": "phrase",
        "frequencyRank": "Top 10"
      },
      {
        "char": "我们",
        "pinyin": "wǒmen",
        "vuk": "vo-men",
        "english": "we / us",
        "serbian": "mi / nas",
        "exampleUse": "我们一起 (mi zajedno)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 15"
      },
      {
        "char": "他们",
        "pinyin": "tāmen",
        "vuk": "ta-men",
        "english": "they / them",
        "serbian": "oni / njih",
        "exampleUse": "他们来了 (oni su stigli)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 25"
      },
      {
        "char": "别人",
        "pinyin": "biéren",
        "vuk": "bje-žen",
        "english": "others / other people",
        "serbian": "drugi / ostali ljudi",
        "exampleUse": "尊重别人 (poštovati druge)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "大家",
        "pinyin": "dàjiā",
        "vuk": "da-đja",
        "english": "everyone / all",
        "serbian": "svi / svako",
        "exampleUse": "大家好 (zdravo svima)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 65"
      },
      {
        "char": "自己",
        "pinyin": "zìjǐ",
        "vuk": "ce-đji",
        "english": "oneself / self",
        "serbian": "sebe / sopstveni",
        "exampleUse": "相信自己 (veruj u sebe)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 45"
      },
      {
        "char": "男人",
        "pinyin": "nánrén",
        "vuk": "nan-žen",
        "english": "man / men",
        "serbian": "muškarac",
        "exampleUse": "成熟的男人 (zreo muškarac)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "女人",
        "pinyin": "nǚrén",
        "vuk": "ni-žen",
        "english": "woman / women",
        "serbian": "žena",
        "exampleUse": "聪明的女人 (pametna žena)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "孩子",
        "pinyin": "háizi",
        "vuk": "haj-ce",
        "english": "child / children",
        "serbian": "dete / deca",
        "exampleUse": "小孩子 (malo dete)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "朋友",
        "pinyin": "péngyou",
        "vuk": "peng-jou",
        "english": "friend",
        "serbian": "prijatelj",
        "exampleUse": "好朋友 (dobar prijatelj)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 55"
      },
      {
        "char": "主人",
        "pinyin": "zhǔrén",
        "vuk": "džu-žen",
        "english": "host / master / owner",
        "serbian": "domaćin / vlasnik",
        "exampleUse": "房子的主人 (vlasnik kuće)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "主要",
        "pinyin": "zhǔyào",
        "vuk": "džu-jao",
        "english": "main / primary",
        "serbian": "glavni / primarni",
        "exampleUse": "主要原因 (glavni razlog)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 85"
      },
      {
        "char": "丈夫",
        "pinyin": "zhàngfu",
        "vuk": "džang-fu",
        "english": "husband",
        "serbian": "suprug / muž",
        "exampleUse": "她的丈夫 (njen muž)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "妻子",
        "pinyin": "qīzi",
        "vuk": "ći-ce",
        "english": "wife",
        "serbian": "supruga / žena",
        "exampleUse": "我的妻子 (moja žena)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "儿子",
        "pinyin": "érzi",
        "vuk": "er-ce",
        "english": "son",
        "serbian": "sin",
        "exampleUse": "他的儿子 (njegov sin)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "女儿",
        "pinyin": "nǚ'ér",
        "vuk": "ni-er",
        "english": "daughter",
        "serbian": "ćerka",
        "exampleUse": "可爱的女儿 (slatka ćerka)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "父母",
        "pinyin": "fùmǔ",
        "vuk": "fu-mu",
        "english": "parents",
        "serbian": "roditelji",
        "exampleUse": "孝敬父母 (poštovati roditelje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "每个人",
        "pinyin": "měi gè rén",
        "vuk": "mej ge žen",
        "english": "everyone / each person",
        "serbian": "svaka osoba / svako",
        "exampleUse": "每个人都有梦想",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 95"
      },
      {
        "char": "主动",
        "pinyin": "zhǔdòng",
        "vuk": "džu-dung",
        "english": "proactive / initiative",
        "serbian": "proaktivan / inicijativa",
        "exampleUse": "主动学习 (učiti sa inicijativom)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 240"
      },
      {
        "char": "王国",
        "pinyin": "wángguó",
        "vuk": "vang-guo",
        "english": "kingdom / realm",
        "serbian": "kraljevstvo / domen",
        "exampleUse": "精神王国 (duhovno carstvo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 380"
      },
      {
        "char": "谁的",
        "pinyin": "shéi de",
        "vuk": "šej de",
        "english": "whose",
        "serbian": "čiji",
        "exampleUse": "这是谁的书？ (čija je knjiga?)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 150"
      },
      {
        "char": "互相",
        "pinyin": "hùxiāng",
        "vuk": "hu-sjang",
        "english": "mutually / each other",
        "serbian": "uzajamno / jedno drugo",
        "exampleUse": "互相帮助 (međusobno pomagati)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 190"
      },
      {
        "char": "关系",
        "pinyin": "guānxì",
        "vuk": "guan-si",
        "english": "relationship / connection",
        "serbian": "odnos / veza",
        "exampleUse": "人际关系 (međuljudski odnosi)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "责任",
        "pinyin": "zérèn",
        "vuk": "ce-žen",
        "english": "responsibility / duty",
        "serbian": "odgovornost / dužnost",
        "exampleUse": "承担责任 (preuzeti odgovornost)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "帮助",
        "pinyin": "bāngzhù",
        "vuk": "bang-džu",
        "english": "help / assist",
        "serbian": "pomoć / pomagati",
        "exampleUse": "需要帮助 (potrebna pomoć)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 95"
      },
      {
        "char": "信任",
        "pinyin": "xìnrèn",
        "vuk": "sin-žen",
        "english": "trust / confidence",
        "serbian": "poverenje / verovati",
        "exampleUse": "建立信任 (izgraditi poverenje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 260"
      },
      {
        "char": "青年",
        "pinyin": "qīngnián",
        "vuk": "ćing-njen",
        "english": "youth / young person",
        "serbian": "mladost / omladina",
        "exampleUse": "有为青年 (sposoban mladić)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 290"
      },
      {
        "char": "老人",
        "pinyin": "lǎorén",
        "vuk": "lao-žen",
        "english": "elderly person / elder",
        "serbian": "starija osoba / starac",
        "exampleUse": "关爱老人 (briga o starima)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "领导",
        "pinyin": "lǐngdǎo",
        "vuk": "ling-dao",
        "english": "leader / lead",
        "serbian": "vođa / lider / voditi",
        "exampleUse": "团队领导 (vođa tima)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "角色",
        "pinyin": "juésè",
        "vuk": "đjüe-se",
        "english": "role / character",
        "serbian": "uloga / funkcija",
        "exampleUse": "重要角色 (važna uloga)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 270"
      },
      {
        "char": "团结",
        "pinyin": "tuánjié",
        "vuk": "tuan-đje",
        "english": "unite / solidarity",
        "serbian": "ujediniti se / solidarnost",
        "exampleUse": "团结一致 (ujedinjeni kao jedan)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 310"
      },
      {
        "char": "独立",
        "pinyin": "dúlì",
        "vuk": "du-li",
        "english": "independent",
        "serbian": "nezavisan / samostalan",
        "exampleUse": "独立思考 (samostalno razmišljanje)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 280"
      },
      {
        "char": "尊重",
        "pinyin": "zūnzhòng",
        "vuk": "cun-džung",
        "english": "respect / esteem",
        "serbian": "poštovati / uvažavati",
        "exampleUse": "相互尊重 (međusobno poštovanje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 200"
      }
    ],
    "sentences": [
      {
        "id": "idm-2-1",
        "type": "proverb",
        "typeLabel": "孔子名言 (Analects of Confucius)",
        "chinese": "三人行，必有我师焉。",
        "pinyin": "Sān rén xíng, bì yǒu wǒ shī yān.",
        "vuk": "San žen sing, bi jou vo ši jen.",
        "literalEnglish": "When three people walk together, there must be one who is my teacher.",
        "english": "In a group of three walking, there is always someone I can learn from.",
        "serbianEquivalent": "Od svakog se ima šta naučiti. / Niko se nije naučen rodio.",
        "serbian": "Gde god trojica idu zajedno, uvek je među njima neko ko može biti moj učitelj.",
        "philosophicalContext": "Konfučijansko učenje o trajnoj skromnosti: posmatraj vrline drugih da ih usvojiš, a njihove mane da ih kod sebe ispraviš.",
        "targetWords": [
          "三",
          "人",
          "行",
          "我"
        ],
        "context": "Confucian Humility • Učenje od svakoga",
        "tokens": [
          {
            "word": "三人",
            "pinyin": "sān rén",
            "english": "three people",
            "serbian": "troje ljudi",
            "isTarget": true
          },
          {
            "word": "行",
            "pinyin": "xíng",
            "english": "walk/travel",
            "serbian": "hodati",
            "isTarget": true
          },
          {
            "word": "必有",
            "pinyin": "bì yǒu",
            "english": "must have",
            "serbian": "mora biti",
            "isTarget": true
          },
          {
            "word": "我师",
            "pinyin": "wǒ shī",
            "english": "my teacher",
            "serbian": "moj učitelj",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-2-2",
        "type": "proverb",
        "typeLabel": "兵法名言 (Sun Tzu Art of War)",
        "chinese": "知彼知己，百战不殆。",
        "pinyin": "Zhī bǐ zhī jǐ, bǎi zhàn bù dài.",
        "vuk": "Dži bi dži đji, baj džan bu daj.",
        "literalEnglish": "Know the other, know yourself; in a hundred battles never in peril.",
        "english": "Know yourself and know your enemy, and you will never be defeated.",
        "serbianEquivalent": "Ko sebe zna, celim svetom vlada. / Upoznaj sebe pre nego što kreneš u bitku.",
        "serbian": "Upoznaj neprijatelja i upoznaj sebe, i u stotinu bitaka nikada nećeš biti u opasnosti.",
        "philosophicalContext": "Sun Cuov temelj strategije. Pobeda počinje od samosvesti i trezvenog razumevanja okruženja, a ne od slepe agresije.",
        "targetWords": [
          "知",
          "己",
          "百",
          "不"
        ],
        "context": "Sun Tzu Strategy • Samopoznavanje",
        "tokens": [
          {
            "word": "知彼",
            "pinyin": "zhī bǐ",
            "english": "know the other",
            "serbian": "upoznaj drugog"
          },
          {
            "word": "知己",
            "pinyin": "zhī jǐ",
            "english": "know oneself",
            "serbian": "upoznaj sebe",
            "isTarget": true
          },
          {
            "word": "百战",
            "pinyin": "bǎi zhàn",
            "english": "100 battles",
            "serbian": "sto bitaka",
            "isTarget": true
          },
          {
            "word": "不殆",
            "pinyin": "bù dài",
            "english": "never in danger",
            "serbian": "bez opasnosti",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-2-3",
        "type": "chengyu",
        "typeLabel": "成语 (Historical Unity)",
        "chinese": "同舟共济。",
        "pinyin": "Tóng zhōu gòng jì.",
        "vuk": "Tung džou gung đji.",
        "literalEnglish": "Crossing the river together in the exact same boat.",
        "english": "In the same boat / Pull together through stormy seas.",
        "serbianEquivalent": "Složna braća kuću grade. / Svi smo u istom čamcu.",
        "serbian": "U istom čamcu zajedno preći uzburkanu reku; udružiti snage pred zajedničkom olujom.",
        "philosophicalContext": "Iz Sun Cuovog zapisa o tome kako vojnici u istoj nevolji zaboravljaju nesuglasice i rade složno kao desna i leva ruka.",
        "targetWords": [
          "共",
          "舟",
          "济"
        ],
        "context": "Solidarity & Comradeship • Zajedništvo",
        "tokens": [
          {
            "word": "同舟",
            "pinyin": "tóng zhōu",
            "english": "same boat",
            "serbian": "isti čamac"
          },
          {
            "word": "共济",
            "pinyin": "gòng jì",
            "english": "cross together",
            "serbian": "zajedno preći",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r3",
    "chartId": 1,
    "rowNumber": 3,
    "title": "Body & Senses",
    "titleSerbian": "Telo i Čulne Radnje",
    "emoji": "👁️",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Anatomy, sensory organs, speech, manual labor, locomotion, and observation faculties.",
    "words": [
      {
        "char": "口",
        "pinyin": "kǒu",
        "vuk": "kou",
        "english": "mouth / entrance",
        "serbian": "usta / ulaz",
        "exampleUse": "门口 (ulazna vrata)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "说",
        "pinyin": "shuō",
        "vuk": "šuo",
        "english": "speak / say",
        "serbian": "govoriti / reći",
        "exampleUse": "说话 (govoriti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 20"
      },
      {
        "char": "目",
        "pinyin": "mù",
        "vuk": "mu",
        "english": "eye / item / goal",
        "serbian": "oko / stavka / cilj",
        "exampleUse": "目标 (cilj)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "见",
        "pinyin": "jiàn",
        "vuk": "đjen",
        "english": "see / meet",
        "serbian": "videti / sresti",
        "exampleUse": "看见 (videti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 40"
      },
      {
        "char": "耳",
        "pinyin": "ěr",
        "vuk": "er",
        "english": "ear",
        "serbian": "uvo",
        "exampleUse": "耳朵 (uši)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "闻",
        "pinyin": "wén",
        "vuk": "ven",
        "english": "hear / smell / news",
        "serbian": "čuti / osetiti miris",
        "exampleUse": "新闻 (vesti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 150"
      },
      {
        "char": "手",
        "pinyin": "shǒu",
        "vuk": "šou",
        "english": "hand",
        "serbian": "ruka / šaka",
        "exampleUse": "手机 (mobilni telefon)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 45"
      },
      {
        "char": "工",
        "pinyin": "gōng",
        "vuk": "gung",
        "english": "work / labor",
        "serbian": "rad / posao",
        "exampleUse": "工作 (raditi / posao)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 50"
      },
      {
        "char": "脚",
        "pinyin": "jiǎo",
        "vuk": "đjao",
        "english": "foot",
        "serbian": "stopalo / noga",
        "exampleUse": "脚步 (korak)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "行",
        "pinyin": "xíng",
        "vuk": "sing",
        "english": "walk / go / okay",
        "serbian": "ići / može / delovati",
        "exampleUse": "行动 (delovanje)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 35"
      },
      {
        "char": "说话",
        "pinyin": "shuōhuà",
        "vuk": "šuo-hua",
        "english": "talk / speak",
        "serbian": "govoriti / pričati",
        "exampleUse": "请大声说话",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 60"
      },
      {
        "char": "看见",
        "pinyin": "kànjiàn",
        "vuk": "kan-đjen",
        "english": "see / catch sight of",
        "serbian": "videti / ugledati",
        "exampleUse": "我看见了 (video sam)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 70"
      },
      {
        "char": "听说",
        "pinyin": "tīngshuō",
        "vuk": "ting-šuo",
        "english": "hear of / rumor has it",
        "serbian": "čuti / kažu da",
        "exampleUse": "听说很不错",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 110"
      },
      {
        "char": "手机",
        "pinyin": "shǒujī",
        "vuk": "šou-đji",
        "english": "cell phone / mobile",
        "serbian": "mobilni telefon",
        "exampleUse": "看手机 (gledati telefon)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "工作",
        "pinyin": "gōngzuò",
        "vuk": "gung-zuo",
        "english": "work / job",
        "serbian": "raditi / posao",
        "exampleUse": "努力工作 (vredno raditi)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 40"
      },
      {
        "char": "行动",
        "pinyin": "xíngdòng",
        "vuk": "sing-dung",
        "english": "action / take action",
        "serbian": "delovanje / akcija",
        "exampleUse": "立即行动 (odmah delovati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 120"
      },
      {
        "char": "眼睛",
        "pinyin": "yǎnjīng",
        "vuk": "jen-đjing",
        "english": "eyes",
        "serbian": "oči",
        "exampleUse": "明亮的眼睛 (bistre oči)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 105"
      },
      {
        "char": "耳朵",
        "pinyin": "ěrduo",
        "vuk": "er-duo",
        "english": "ears",
        "serbian": "uši",
        "exampleUse": "竖起耳朵 (naćuliti uši)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "手表",
        "pinyin": "shǒubiǎo",
        "vuk": "šou-bjao",
        "english": "wristwatch / watch",
        "serbian": "ručni sat",
        "exampleUse": "智能手表 (pametni sat)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "走路",
        "pinyin": "zǒulù",
        "vuk": "zou-lu",
        "english": "walk / go on foot",
        "serbian": "hodati / ići peške",
        "exampleUse": "每天走路 (hodati svaki dan)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 95"
      },
      {
        "char": "目标",
        "pinyin": "mùbiāo",
        "vuk": "mu-bjao",
        "english": "goal / target",
        "serbian": "cilj / meta",
        "exampleUse": "实现目标 (ostvariti cilj)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "见面",
        "pinyin": "jiànmiàn",
        "vuk": "đjen-mjen",
        "english": "meet / see each other",
        "serbian": "videti se / sresti se",
        "exampleUse": "很高兴跟你见面",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "助手",
        "pinyin": "zhùshǒu",
        "vuk": "džu-šou",
        "english": "assistant / helper",
        "serbian": "pomoćnik / asistent",
        "exampleUse": "得力助手 (desna ruka)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 310"
      },
      {
        "char": "表达",
        "pinyin": "biǎodá",
        "vuk": "bjao-da",
        "english": "express / convey",
        "serbian": "izraziti / iskazati",
        "exampleUse": "表达想法 (izraziti ideju)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 180"
      },
      {
        "char": "口语",
        "pinyin": "kǒuyǔ",
        "vuk": "kou-ji",
        "english": "spoken language",
        "serbian": "govorni jezik",
        "exampleUse": "中文口语 (govorni kineski)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 230"
      },
      {
        "char": "意见",
        "pinyin": "yìjiàn",
        "vuk": "ji-đjen",
        "english": "opinion / view",
        "serbian": "mišljenje / stav",
        "exampleUse": "提出意见 (dati mišljenje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "态度",
        "pinyin": "tàidu",
        "vuk": "taj-du",
        "english": "attitude / stance",
        "serbian": "stav / držanje",
        "exampleUse": "积极的态度 (pozitivan stav)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "习惯",
        "pinyin": "xíguàn",
        "vuk": "si-guan",
        "english": "habit / accustomed to",
        "serbian": "navika / naviknut",
        "exampleUse": "养成好习惯 (steći dobru naviku)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "观察",
        "pinyin": "guānchá",
        "vuk": "guan-ča",
        "english": "observe / watch",
        "serbian": "posmatrati / uočiti",
        "exampleUse": "仔细观察 (pažljivo posmatrati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 200"
      },
      {
        "char": "经验",
        "pinyin": "jīngyàn",
        "vuk": "đjing-jen",
        "english": "experience",
        "serbian": "iskustvo",
        "exampleUse": "丰富经验 (bogato iskustvo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "练习",
        "pinyin": "liànxí",
        "vuk": "ljen-si",
        "english": "practice / exercise",
        "serbian": "vežbati / vežba",
        "exampleUse": "多加练习 (više vežbati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 130"
      },
      {
        "char": "掌握",
        "pinyin": "zhǎngwò",
        "vuk": "džang-vo",
        "english": "master / grasp",
        "serbian": "ovladati / držati u rukama",
        "exampleUse": "掌握技能 (ovladati veštinom)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 210"
      },
      {
        "char": "参与",
        "pinyin": "cānyù",
        "vuk": "can-ji",
        "english": "participate / take part",
        "serbian": "učestvovati",
        "exampleUse": "积极参与 (aktivno učestvovati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 220"
      },
      {
        "char": "注意",
        "pinyin": "zhùyì",
        "vuk": "džu-ji",
        "english": "pay attention / notice",
        "serbian": "obratiti pažnju",
        "exampleUse": "请注意安全 (pazite na bezbednost)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 90"
      },
      {
        "char": "解释",
        "pinyin": "jiěshì",
        "vuk": "đje-ši",
        "english": "explain / clarify",
        "serbian": "objasniti / razjasniti",
        "exampleUse": "详细解释 (detaljno objasniti)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 190"
      },
      {
        "char": "握手",
        "pinyin": "wòshǒu",
        "vuk": "vo-šou",
        "english": "shake hands",
        "serbian": "rukovati se",
        "exampleUse": "友好握手 (prijateljski stisak ruke)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 320"
      },
      {
        "char": "脚步",
        "pinyin": "jiǎobù",
        "vuk": "đjao-bu",
        "english": "footsteps / pace",
        "serbian": "koraci / tempo koračanja",
        "exampleUse": "加快脚步 (ubrzati korak)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 250"
      },
      {
        "char": "手段",
        "pinyin": "shǒuduàn",
        "vuk": "šou-duan",
        "english": "means / method",
        "serbian": "sredstvo / metod",
        "exampleUse": "达到目的的手段",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 280"
      },
      {
        "char": "动手",
        "pinyin": "dòngshǒu",
        "vuk": "dung-šou",
        "english": "get hands dirty / take action",
        "serbian": "zasukati rukave / preći na delo",
        "exampleUse": "自己动手 (uradi sam)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 270"
      },
      {
        "char": "功夫",
        "pinyin": "gōngfu",
        "vuk": "gung-fu",
        "english": "kung fu / skill / effort",
        "serbian": "kung fu / trud / umeće",
        "exampleUse": "下功夫 (uložiti ozbiljan trud)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "闻名",
        "pinyin": "wénmíng",
        "vuk": "ven-ming",
        "english": "famous / renowned",
        "serbian": "čuven / nadaleko poznat",
        "exampleUse": "举世闻名 (poznat u celom svetu)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 330"
      },
      {
        "char": "事实",
        "pinyin": "shìshí",
        "vuk": "ši-ši",
        "english": "fact / reality",
        "serbian": "činjenica / istina",
        "exampleUse": "尊重事实 (poštovati činjenice)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      }
    ],
    "sentences": [
      {
        "id": "idm-3-1",
        "type": "proverb",
        "typeLabel": "古训 / 谚语 (Folk Proverb)",
        "chinese": "耳听为虚，眼见为实。",
        "pinyin": "Ěr tīng wéi xū, yǎn jiàn wéi shí.",
        "vuk": "Er ting vej sü, jen đjen vej ši.",
        "literalEnglish": "Ear listening is empty illusion; eye seeing is true reality.",
        "english": "What you hear with ears may be false, what you see with eyes is true.",
        "serbianEquivalent": "Veruj svojim očima, a ne tuđim pričama.",
        "serbian": "Ono što uvo čuje može biti puka iluzija; samo ono što oko vidi je stvarnost.",
        "philosophicalContext": "Klasični kineski podsetnik protiv tračeva i manipulacije. Posmatraj činjenice neposredno pre donošenja suda.",
        "targetWords": [
          "耳",
          "闻",
          "目",
          "见"
        ],
        "context": "Empiricism & Discernment • Činjenice pre reči",
        "tokens": [
          {
            "word": "耳听",
            "pinyin": "ěr tīng",
            "english": "ear hear",
            "serbian": "čuti uhom",
            "isTarget": true
          },
          {
            "word": "为虚",
            "pinyin": "wéi xū",
            "english": "is empty/illusion",
            "serbian": "je iluzija"
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "眼见",
            "pinyin": "yǎn jiàn",
            "english": "eye see",
            "serbian": "videti okom",
            "isTarget": true
          },
          {
            "word": "为实",
            "pinyin": "wéi shí",
            "english": "is real/truth",
            "serbian": "je istina"
          }
        ]
      },
      {
        "id": "idm-3-2",
        "type": "chengyu",
        "typeLabel": "成语 (Stoic Integrity)",
        "chinese": "言行一致。",
        "pinyin": "Yán xíng yī zhì.",
        "vuk": "Jen sing ji dži.",
        "literalEnglish": "Words and actions in complete alignment.",
        "english": "Walk the talk / Practice what you preach.",
        "serbianEquivalent": "Čovek se drži za reč. / Neka ti dela prate reči.",
        "serbian": "Potpuni sklad između onoga što govoriš i onoga što činiš; besprekoran integritet.",
        "philosophicalContext": "Stoička vrlina: reči bez dela nemaju vrednost. Samo dosledna akcija definiše čovekov pravi karakter.",
        "targetWords": [
          "说",
          "行",
          "一"
        ],
        "context": "Integrity & Honor • Doslednost",
        "tokens": [
          {
            "word": "言",
            "pinyin": "yán",
            "english": "speech/words",
            "serbian": "reči"
          },
          {
            "word": "行",
            "pinyin": "xíng",
            "english": "action",
            "serbian": "dela",
            "isTarget": true
          },
          {
            "word": "一致",
            "pinyin": "yī zhì",
            "english": "consistent/united",
            "serbian": "usklađeni",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-3-3",
        "type": "chengyu",
        "typeLabel": "成语 (Mastery Through Repetition)",
        "chinese": "熟能生巧。",
        "pinyin": "Shú néng shēng qiǎo.",
        "vuk": "Šu neng šeng ćjao.",
        "literalEnglish": "Familiarity and practice give birth to supreme skill.",
        "english": "Practice makes perfect.",
        "serbianEquivalent": "Ponavljanje je majka mudrosti. / Praksa pravi majstora.",
        "serbian": "Kroz neumorno vežbanje i ponavljanje rađa se savršena veština i majstorstvo.",
        "philosophicalContext": "Priča o starom strelcu i prodavcu ulja koji kroz otvor novčića sipa ulje a da ga ne dotakne: \"Nema tu magije, samo vešta ruka od ponavljanja.\"",
        "targetWords": [
          "工",
          "手"
        ],
        "context": "Daily Practice • Snaga Ponavljanja",
        "tokens": [
          {
            "word": "熟",
            "pinyin": "shú",
            "english": "familiar/practiced",
            "serbian": "uvežban"
          },
          {
            "word": "能",
            "pinyin": "néng",
            "english": "can/able",
            "serbian": "može"
          },
          {
            "word": "生巧",
            "pinyin": "shēng qiǎo",
            "english": "produce skill",
            "serbian": "roditi veštinu",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r4",
    "chartId": 1,
    "rowNumber": 4,
    "title": "Movement & State",
    "titleSerbian": "Kretanje, Položaj i Postojanje",
    "emoji": "🧭",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Spatial orientations, transitions between spaces, states of being, and dynamic movements.",
    "words": [
      {
        "char": "来",
        "pinyin": "lái",
        "vuk": "laj",
        "english": "come / arrive",
        "serbian": "doći / stići",
        "exampleUse": "过来 (dođi ovamo)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 15"
      },
      {
        "char": "入",
        "pinyin": "rù",
        "vuk": "ru",
        "english": "enter / join",
        "serbian": "ući / stupiti",
        "exampleUse": "入口 (ulaz)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 120"
      },
      {
        "char": "出",
        "pinyin": "chū",
        "vuk": "ču",
        "english": "exit / go out",
        "serbian": "izaći / isplivati",
        "exampleUse": "出去 (izaći napolje)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 25"
      },
      {
        "char": "上",
        "pinyin": "shàng",
        "vuk": "šang",
        "english": "up / on / above",
        "serbian": "gore / na / ići gore",
        "exampleUse": "上车 (ući u vozilo)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 20"
      },
      {
        "char": "下",
        "pinyin": "xià",
        "vuk": "sja",
        "english": "down / under",
        "serbian": "dole / ispod / silaziti",
        "exampleUse": "下班 (kraj smene)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 20"
      },
      {
        "char": "中",
        "pinyin": "zhōng",
        "vuk": "džung",
        "english": "middle / center",
        "serbian": "sredina / centar",
        "exampleUse": "中间 (u sredini)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 15"
      },
      {
        "char": "在",
        "pinyin": "zài",
        "vuk": "zaj",
        "english": "at / located in",
        "serbian": "nalazi se u / na",
        "exampleUse": "在家 (kod kuće)",
        "isCoreChar": true,
        "category": "phrase",
        "frequencyRank": "Top 8"
      },
      {
        "char": "左",
        "pinyin": "zuǒ",
        "vuk": "cuo",
        "english": "left",
        "serbian": "levo / leva strana",
        "exampleUse": "向左 (prema levo)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 110"
      },
      {
        "char": "右",
        "pinyin": "yòu",
        "vuk": "jou",
        "english": "right",
        "serbian": "desno / desna strana",
        "exampleUse": "向右 (prema desno)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 110"
      },
      {
        "char": "有",
        "pinyin": "yǒu",
        "vuk": "jou",
        "english": "have / there is",
        "serbian": "imati / postoji",
        "exampleUse": "有人 (ima nekoga)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 6"
      },
      {
        "char": "出来",
        "pinyin": "chūlái",
        "vuk": "ču-laj",
        "english": "come out",
        "serbian": "izaći ovamo",
        "exampleUse": "走出来 (izaći peške)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 45"
      },
      {
        "char": "进去",
        "pinyin": "jìnqù",
        "vuk": "đjin-ćü",
        "english": "go in / enter",
        "serbian": "ući unutra",
        "exampleUse": "请进去 (molim uđite)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 50"
      },
      {
        "char": "中间",
        "pinyin": "zhōngjiān",
        "vuk": "džung-đjen",
        "english": "middle / between",
        "serbian": "u sredini / između",
        "exampleUse": "站在中间 (stajati u sredini)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 95"
      },
      {
        "char": "正在",
        "pinyin": "zhèngzài",
        "vuk": "dženg-zaj",
        "english": "in process of / right now",
        "serbian": "upravo u toku",
        "exampleUse": "正在学习 (upravo uči)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 80"
      },
      {
        "char": "左右",
        "pinyin": "zuǒyòu",
        "vuk": "cuo-jou",
        "english": "left and right / approximately",
        "serbian": "levo i desno / otprilike",
        "exampleUse": "五点左右 (oko pet sati)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 100"
      },
      {
        "char": "出现",
        "pinyin": "chūxiàn",
        "vuk": "ču-sjen",
        "english": "appear / arise",
        "serbian": "pojaviti se / nastati",
        "exampleUse": "出现问题 (javio se problem)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "上班",
        "pinyin": "shàngbān",
        "vuk": "šang-ban",
        "english": "go to work / on duty",
        "serbian": "ići na posao",
        "exampleUse": "准时上班 (doći tačno na posao)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 70"
      },
      {
        "char": "下班",
        "pinyin": "xiàbān",
        "vuk": "sja-ban",
        "english": "get off work",
        "serbian": "završiti smenu",
        "exampleUse": "已经下班了 (već je završio smenu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 75"
      },
      {
        "char": "出发",
        "pinyin": "chūfā",
        "vuk": "ču-fa",
        "english": "set out / depart",
        "serbian": "krenuti na put / polazak",
        "exampleUse": "现在出发 (krenuti sada)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 130"
      },
      {
        "char": "收入",
        "pinyin": "shōurù",
        "vuk": "šou-ru",
        "english": "income / revenue",
        "serbian": "prihod / plata",
        "exampleUse": "稳定收入 (stabilan prihod)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "到达",
        "pinyin": "dàodá",
        "vuk": "dao-da",
        "english": "arrive / reach",
        "serbian": "stići na odredište",
        "exampleUse": "安全到达 (bezbedno stići)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 140"
      },
      {
        "char": "存在",
        "pinyin": "cúnzài",
        "vuk": "cun-zaj",
        "english": "exist / existence",
        "serbian": "postojati / postojanje",
        "exampleUse": "普遍存在 (opšteprisutno)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 160"
      },
      {
        "char": "有名",
        "pinyin": "yǒumíng",
        "vuk": "jou-ming",
        "english": "famous / well-known",
        "serbian": "poznat / čuven",
        "exampleUse": "非常有名 (vrlo poznat)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 125"
      },
      {
        "char": "有效",
        "pinyin": "yǒuxiào",
        "vuk": "jou-sjao",
        "english": "effective / valid",
        "serbian": "delotvoran / važeći",
        "exampleUse": "有效方法 (efikasan metod)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 190"
      },
      {
        "char": "有趣",
        "pinyin": "yǒuqù",
        "vuk": "jou-ćü",
        "english": "interesting / fun",
        "serbian": "zanimljiv / zabavan",
        "exampleUse": "很有趣的故事 (zanimljiva priča)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 145"
      },
      {
        "char": "有用",
        "pinyin": "yǒuyòng",
        "vuk": "jou-jung",
        "english": "useful / helpful",
        "serbian": "koristan",
        "exampleUse": "非常有用 (veoma korisno)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 115"
      },
      {
        "char": "有力",
        "pinyin": "yǒulì",
        "vuk": "jou-li",
        "english": "powerful / strong",
        "serbian": "snažan / moćan",
        "exampleUse": "有力的支持 (snažna podrška)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 210"
      },
      {
        "char": "路上",
        "pinyin": "lùshang",
        "vuk": "lu-šang",
        "english": "on the road / en route",
        "serbian": "na putu",
        "exampleUse": "在路上 (na putu sam)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 90"
      },
      {
        "char": "出门",
        "pinyin": "chūmén",
        "vuk": "ču-men",
        "english": "leave home / go out",
        "serbian": "izaći iz kuće",
        "exampleUse": "准备出门 (spremati se za izlazak)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 105"
      },
      {
        "char": "上网",
        "pinyin": "shàngwǎng",
        "vuk": "šang-vang",
        "english": "surf internet / go online",
        "serbian": "ići na internet",
        "exampleUse": "用手机上网",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 85"
      },
      {
        "char": "下次",
        "pinyin": "xià cì",
        "vuk": "sja ci",
        "english": "next time",
        "serbian": "sledeći put",
        "exampleUse": "下次再见 (vidimo se sledeći put)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 90"
      },
      {
        "char": "上学",
        "pinyin": "shàngxué",
        "vuk": "šang-süe",
        "english": "go to school",
        "serbian": "ići u školu",
        "exampleUse": "孩子上学 (dete ide u školu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 95"
      },
      {
        "char": "准备",
        "pinyin": "zhǔnbèi",
        "vuk": "džun-bej",
        "english": "prepare / ready",
        "serbian": "spremiti se / priprema",
        "exampleUse": "做好准备 (dobro se pripremiti)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "经过",
        "pinyin": "jīngguò",
        "vuk": "đjing-guo",
        "english": "pass through / process",
        "serbian": "proći kroz / proces",
        "exampleUse": "经过努力 (kroz trud)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "后来",
        "pinyin": "hòulái",
        "vuk": "hou-laj",
        "english": "afterwards / later on",
        "serbian": "kasnije / nakon toga",
        "exampleUse": "后来明白了 (kasnije sam shvatio)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 85"
      },
      {
        "char": "发生",
        "pinyin": "fāshēng",
        "vuk": "fa-šeng",
        "english": "happen / occur",
        "serbian": "dogoditi se / desiti se",
        "exampleUse": "发生了什么？ (šta se desilo?)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 95"
      },
      {
        "char": "进出",
        "pinyin": "jìnchū",
        "vuk": "đjin-ču",
        "english": "enter and exit",
        "serbian": "ulaziti i izlaziti",
        "exampleUse": "自由进出 (slobodan ulaz i izlaz)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 250"
      },
      {
        "char": "上下",
        "pinyin": "shàngxià",
        "vuk": "šang-sja",
        "english": "up and down / around",
        "serbian": "gore i dole / gore-dole",
        "exampleUse": "上下楼梯 (stepenice)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 130"
      },
      {
        "char": "方向",
        "pinyin": "fāngxiàng",
        "vuk": "fang-sjang",
        "english": "direction / orientation",
        "serbian": "pravac / smer",
        "exampleUse": "正确的方向 (ispravan smer)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "位置",
        "pinyin": "wèizhì",
        "vuk": "vej-dž",
        "english": "position / location",
        "serbian": "položaj / lokacija",
        "exampleUse": "核心位置 (ključna pozicija)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "运动",
        "pinyin": "yùndòng",
        "vuk": "jin-dung",
        "english": "exercise / movement",
        "serbian": "vežbanje / kretanje",
        "exampleUse": "户外运动 (trening na otvorenom)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "改变",
        "pinyin": "gǎibiàn",
        "vuk": "gaj-bjen",
        "english": "change / transform",
        "serbian": "promeniti / transformacija",
        "exampleUse": "改变生活 (promeniti život)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      }
    ],
    "sentences": [
      {
        "id": "idm-4-1",
        "type": "chengyu",
        "typeLabel": "成语 (Folk Optimism)",
        "chinese": "苦尽甘来。",
        "pinyin": "Kǔ jìn gān lái.",
        "vuk": "Ku đjin gan laj.",
        "literalEnglish": "When the bitterness is completely exhausted, sweetness arrives.",
        "english": "Sweetness comes after bitterness / No pain, no gain.",
        "serbianEquivalent": "Posle kiše uvek sija sunce. / Posle muke dolazi slast.",
        "serbian": "Kada se gorka muka do kraja istrpi i prevaziđe, stiže plod i slatka nagrada.",
        "philosophicalContext": "Srž kineske filozofije izdržljivosti: nijedna patnja ne traje večno. Onaj ko disciplinovano izdrži gorčinu treninga i rada, ubira najslađe plodove.",
        "targetWords": [
          "来",
          "出"
        ],
        "context": "Endurance & Reward • Istrajnost donosi plod",
        "tokens": [
          {
            "word": "苦尽",
            "pinyin": "kǔ jìn",
            "english": "bitterness ends",
            "serbian": "gorčina prestaje"
          },
          {
            "word": "甘来",
            "pinyin": "gān lái",
            "english": "sweetness comes",
            "serbian": "slast stiže",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-4-2",
        "type": "chengyu",
        "typeLabel": "成语 (Proverbial Dilemma)",
        "chinese": "左右为难。",
        "pinyin": "Zuǒ yòu wéi nán.",
        "vuk": "Cuo jou vej nan.",
        "literalEnglish": "Difficult on the left, hard on the right.",
        "english": "Caught between two stools / In a tight dilemma.",
        "serbianEquivalent": "Između čekića i nakovnja. / Ni tamo ni vamo.",
        "serbian": "Naći se u teškom tesnacu gde svaka od dve opcije nosi težinu; unutrašnja dilema.",
        "philosophicalContext": "Stoičko prepoznavanje: kada se nađeš u škripcu spoljašnjih okolnosti, fokusiraj se na unutrašnje principe i vrlinu umesto da paničiš.",
        "targetWords": [
          "左",
          "右"
        ],
        "context": "Decisiveness & Balance • Donošenje odluka",
        "tokens": [
          {
            "word": "左右",
            "pinyin": "zuǒ yòu",
            "english": "left and right",
            "serbian": "levo i desno",
            "isTarget": true
          },
          {
            "word": "为难",
            "pinyin": "wéi nán",
            "english": "feeling dilemma",
            "serbian": "u dilemi"
          }
        ]
      },
      {
        "id": "idm-4-3",
        "type": "chengyu",
        "typeLabel": "成语 (Ancient Wisdom of Preparedness)",
        "chinese": "有备无患。",
        "pinyin": "Yǒu bèi wú huàn.",
        "vuk": "Jou bej vu huan.",
        "literalEnglish": "Where there is preparation, there is no disaster.",
        "english": "Preparedness averts calamity / Better safe than sorry.",
        "serbianEquivalent": "Bolje sprečiti nego lečiti. / Spremaj kola za zimu dok traje leto.",
        "serbian": "Kada si temeljno i unapred pripremljen, nijedna neočekivana nevolja ti ne može nauditi.",
        "philosophicalContext": "Iz Knjige dokumenata (Shang Shu). Mudrost se ogleda u anticipaciji i pripremi organizma i uma pre nego što kriza nastupi.",
        "targetWords": [
          "有",
          "中"
        ],
        "context": "Preparedness • Temeljna priprema",
        "tokens": [
          {
            "word": "有备",
            "pinyin": "yǒu bèi",
            "english": "have preparation",
            "serbian": "biti pripremljen",
            "isTarget": true
          },
          {
            "word": "无患",
            "pinyin": "wú huàn",
            "english": "no disaster",
            "serbian": "nema nesreće"
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r5",
    "chartId": 1,
    "rowNumber": 5,
    "title": "Food & Animals",
    "titleSerbian": "Hrana, Ishrana i Domaće Životinje",
    "emoji": "🥢",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Nourishment, culinary culture, domesticated animals, daily diet, and restorative tea rituals.",
    "words": [
      {
        "char": "吃",
        "pinyin": "chī",
        "vuk": "č",
        "english": "eat",
        "serbian": "jesti",
        "exampleUse": "吃饭 (jesti obrok)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 35"
      },
      {
        "char": "饭",
        "pinyin": "fàn",
        "vuk": "fan",
        "english": "cooked rice / meal",
        "serbian": "kuvani pirinač / obrok",
        "exampleUse": "米饭 (kuvani pirinač)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 50"
      },
      {
        "char": "菜",
        "pinyin": "cài",
        "vuk": "caj",
        "english": "vegetable / dish",
        "serbian": "povrće / jelo",
        "exampleUse": "蔬菜 (povrće)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "豆",
        "pinyin": "dòu",
        "vuk": "dou",
        "english": "bean / legume",
        "serbian": "pasulj / zrno / soja",
        "exampleUse": "豆腐 (tofu)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "肉",
        "pinyin": "ròu",
        "vuk": "žou",
        "english": "meat",
        "serbian": "meso",
        "exampleUse": "牛肉 (govedina)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "牛",
        "pinyin": "niú",
        "vuk": "nju",
        "english": "ox / cow / cattle",
        "serbian": "goveče / krava",
        "exampleUse": "牛奶 (mleko)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "猪",
        "pinyin": "zhū",
        "vuk": "džu",
        "english": "pig / swine",
        "serbian": "svinja",
        "exampleUse": "猪肉 (svinjetina)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "鸡",
        "pinyin": "jī",
        "vuk": "đji",
        "english": "chicken",
        "serbian": "piletina / kokoš",
        "exampleUse": "鸡蛋 (jaje)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "鱼",
        "pinyin": "yú",
        "vuk": "ji",
        "english": "fish",
        "serbian": "riba",
        "exampleUse": "吃鱼 (jesti ribu)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "茶",
        "pinyin": "chá",
        "vuk": "ča",
        "english": "tea",
        "serbian": "čaj",
        "exampleUse": "喝茶 (piti čaj)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "吃饭",
        "pinyin": "chīfàn",
        "vuk": "č-fan",
        "english": "eat a meal",
        "serbian": "jesti obrok / ručati",
        "exampleUse": "该吃饭了 (vreme je za jelo)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 45"
      },
      {
        "char": "米饭",
        "pinyin": "mǐfàn",
        "vuk": "mi-fan",
        "english": "cooked white rice",
        "serbian": "kuvani pirinač",
        "exampleUse": "一碗米饭 (činija pirinča)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "喝茶",
        "pinyin": "hēchá",
        "vuk": "he-ča",
        "english": "drink tea",
        "serbian": "piti čaj",
        "exampleUse": "坐下喝茶 (sesti i popiti čaj)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 80"
      },
      {
        "char": "牛肉",
        "pinyin": "niúròu",
        "vuk": "nju-žou",
        "english": "beef",
        "serbian": "govedina / junetina",
        "exampleUse": "牛肉面 (nudle sa govedinom)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "猪肉",
        "pinyin": "zhūròu",
        "vuk": "džu-žou",
        "english": "pork",
        "serbian": "svinjetina",
        "exampleUse": "新鲜猪肉 (sveža svinjetina)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "鸡肉",
        "pinyin": "jīròu",
        "vuk": "đji-žou",
        "english": "chicken meat",
        "serbian": "piletina",
        "exampleUse": "烤鸡肉 (pečena piletina)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "蔬菜",
        "pinyin": "shūcài",
        "vuk": "šu-caj",
        "english": "vegetables / greens",
        "serbian": "povrće",
        "exampleUse": "多吃新鲜蔬菜",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 105"
      },
      {
        "char": "豆腐",
        "pinyin": "dòufu",
        "vuk": "dou-fu",
        "english": "tofu / bean curd",
        "serbian": "tofu / sir od soje",
        "exampleUse": "麻婆豆腐 (mapo tofu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "鸡蛋",
        "pinyin": "jīdàn",
        "vuk": "đji-dan",
        "english": "chicken egg",
        "serbian": "jaje",
        "exampleUse": "吃个煮鸡蛋 (kuvano jaje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "鱼肉",
        "pinyin": "yúròu",
        "vuk": "ji-žou",
        "english": "fish meat",
        "serbian": "riblje meso",
        "exampleUse": "富含营养的鱼肉",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "绿茶",
        "pinyin": "lǜchá",
        "vuk": "li-ča",
        "english": "green tea",
        "serbian": "zeleni čaj",
        "exampleUse": "品尝龙井绿茶",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "红茶",
        "pinyin": "hóngchá",
        "vuk": "hung-ča",
        "english": "black tea (red tea)",
        "serbian": "crni čaj",
        "exampleUse": "温热的红茶 (topao crni čaj)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "菜单",
        "pinyin": "càidān",
        "vuk": "caj-dan",
        "english": "menu",
        "serbian": "jelovnik / meni",
        "exampleUse": "请给我菜单 (molim meni)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "点菜",
        "pinyin": "diǎncài",
        "vuk": "đjen-caj",
        "english": "order food dishes",
        "serbian": "poručiti jelo",
        "exampleUse": "我们点菜吧 (poručimo jelo)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 120"
      },
      {
        "char": "买单",
        "pinyin": "mǎidān",
        "vuk": "maj-dan",
        "english": "pay the bill / check please",
        "serbian": "platiti račun / račun molim",
        "exampleUse": "服务员，买单！ (račun molim!)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 90"
      },
      {
        "char": "早餐",
        "pinyin": "zǎocān",
        "vuk": "zao-can",
        "english": "breakfast",
        "serbian": "doručak",
        "exampleUse": "营养丰富的早餐",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "午餐",
        "pinyin": "wǔcān",
        "vuk": "vu-can",
        "english": "lunch",
        "serbian": "ručak",
        "exampleUse": "吃完午餐 (završiti ručak)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "晚餐",
        "pinyin": "wǎncān",
        "vuk": "van-can",
        "english": "dinner / supper",
        "serbian": "večera",
        "exampleUse": "家庭晚餐 (porodična večera)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "味道",
        "pinyin": "wèidao",
        "vuk": "vej-dao",
        "english": "flavor / taste / smell",
        "serbian": "ukus / miris",
        "exampleUse": "味道特别好 (ukus je fantastičan)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "营养",
        "pinyin": "yíngyǎng",
        "vuk": "jing-jang",
        "english": "nutrition / nourishment",
        "serbian": "ishrana / nutrijenti",
        "exampleUse": "均衡营养 (uravnotežena ishrana)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "饱了",
        "pinyin": "bǎole",
        "vuk": "bao-le",
        "english": "full / sated",
        "serbian": "sit sam / dovoljno mi je",
        "exampleUse": "我已经吃饱了 (već sam sit)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 95"
      },
      {
        "char": "饿了",
        "pinyin": "èle",
        "vuk": "e-le",
        "english": "hungry",
        "serbian": "gladan sam",
        "exampleUse": "肚子饿了 (stomak je gladan)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 95"
      },
      {
        "char": "饮料",
        "pinyin": "yǐnliào",
        "vuk": "jin-ljao",
        "english": "beverage / drink",
        "serbian": "piće / napitak",
        "exampleUse": "健康饮料 (zdrav napitak)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "餐厅",
        "pinyin": "cāntīng",
        "vuk": "can-ting",
        "english": "restaurant / dining hall",
        "serbian": "restoran / trpezarija",
        "exampleUse": "去餐厅吃饭 (ići u restoran)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "做菜",
        "pinyin": "zuòcài",
        "vuk": "zuo-caj",
        "english": "cook dishes / prepare food",
        "serbian": "kuvati / spremati hranu",
        "exampleUse": "在家做菜 (kuvati kod kuće)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 125"
      },
      {
        "char": "烹饪",
        "pinyin": "pēngrèn",
        "vuk": "peng-žen",
        "english": "culinary arts / cooking",
        "serbian": "kulinarstvo / priprema hrane",
        "exampleUse": "烹饪技巧 (kulinarske veštine)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 260"
      },
      {
        "char": "健康",
        "pinyin": "jiànkāng",
        "vuk": "đjen-kang",
        "english": "health / healthy",
        "serbian": "zdravlje / zdravo",
        "exampleUse": "身体健康 (telesno zdravlje)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 70"
      },
      {
        "char": "新鲜",
        "pinyin": "xīnxiān",
        "vuk": "sin-sjen",
        "english": "fresh",
        "serbian": "sveže",
        "exampleUse": "新鲜的水果 (sveže voće)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 130"
      },
      {
        "char": "水果",
        "pinyin": "shuǐguǒ",
        "vuk": "šuej-guo",
        "english": "fruit",
        "serbian": "voće",
        "exampleUse": "经常吃水果 (često jesti voće)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "美味",
        "pinyin": "měiwèi",
        "vuk": "mej-vej",
        "english": "delicious / delicacy",
        "serbian": "ukusno / poslastica",
        "exampleUse": "美味佳肴 (vrhunski specijalitet)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 170"
      },
      {
        "char": "消化",
        "pinyin": "xiāohuà",
        "vuk": "sjao-hua",
        "english": "digest / digestion",
        "serbian": "variti / probava",
        "exampleUse": "促进消化 (pospešiti probavu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 250"
      },
      {
        "char": "茶道",
        "pinyin": "chádào",
        "vuk": "ča-dao",
        "english": "tea ceremony / way of tea",
        "serbian": "put čaja / ceremonija čaja",
        "exampleUse": "中国传统茶道",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 320"
      }
    ],
    "sentences": [
      {
        "id": "idm-5-1",
        "type": "proverb",
        "typeLabel": "古训名言 (Historical Primacy of Food)",
        "chinese": "民以食为天。",
        "pinyin": "Mín yǐ shí wéi tiān.",
        "vuk": "Min ji ši vej tjen.",
        "literalEnglish": "To the people, food is as vital as the heavens above.",
        "english": "Food is the first necessity of the people / Bread is the staff of life.",
        "serbianEquivalent": "Bez hleba nema života. / Prazan stomak ne sluša savete.",
        "serbian": "Narodu je hrana sveta poput samog neba; ishrana i snaga tela su temelj opstanka i mira.",
        "philosophicalContext": "Iz Zapisa velikog istoričara (Shi Ji). Ishrana nije samo biološka potreba, već temelj stabilnosti, zdravlja i bistrine uma.",
        "targetWords": [
          "吃",
          "饭",
          "菜"
        ],
        "context": "Nourishment & Foundation • Ishrana je temelj",
        "tokens": [
          {
            "word": "民",
            "pinyin": "mín",
            "english": "people",
            "serbian": "narod"
          },
          {
            "word": "以食",
            "pinyin": "yǐ shí",
            "english": "take food as",
            "serbian": "uzimati hranu kao",
            "isTarget": true
          },
          {
            "word": "为天",
            "pinyin": "wéi tiān",
            "english": "as heaven",
            "serbian": "kao nebo"
          }
        ]
      },
      {
        "id": "idm-5-2",
        "type": "chengyu",
        "typeLabel": "成语 (Environmental Foresight)",
        "chinese": "竭泽而渔。",
        "pinyin": "Jié zé ér yú.",
        "vuk": "Đje ce er ji.",
        "literalEnglish": "Draining the entire marsh just to catch all the fish.",
        "english": "Drain the pond to catch all the fish / Kill the goose that lays the golden eggs.",
        "serbianEquivalent": "Ne seci granu na kojoj sediš. / Ko traži veće, izgubi i iz vreće.",
        "serbian": "Isušiti celo jezero da bi se odjednom ulovila sva riba; kratkovida pohlepa koja uništava sopstvene izvore hrane i budućnost.",
        "philosophicalContext": "Lüshi Chunqiu filozofska lekcija: održivo upravljanje energijom i resursima. Ne iscrpljuj sopstveno telo i snagu radi kratkoročnog hira.",
        "targetWords": [
          "鱼",
          "水"
        ],
        "context": "Sustainability & Balance • Održiva snaga",
        "tokens": [
          {
            "word": "竭泽",
            "pinyin": "jié zé",
            "english": "drain marsh",
            "serbian": "isušiti močvaru"
          },
          {
            "word": "而渔",
            "pinyin": "ér yú",
            "english": "to catch fish",
            "serbian": "da ulovi ribu",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-5-3",
        "type": "chengyu",
        "typeLabel": "成语 (Stoic Simplicity)",
        "chinese": "粗茶淡饭。",
        "pinyin": "Cū chá dàn fàn.",
        "vuk": "Cu ča dan fan.",
        "literalEnglish": "Coarse tea and plain meals.",
        "english": "Simple tea and plain food / Content with humble fare.",
        "serbianEquivalent": "Skromnost je najveća vrlina. / Bolje malo s mirom, nego mnogo s nemirom.",
        "serbian": "Jednostavan čaj i skroman obrok; smireno zadovoljstvo u umerenoj, čistoj hrani bez rasipništva.",
        "philosophicalContext": "Konfučije i stoički mudraci su isticali: uzvišen um se hrani jednostavnom hranom i nalazi mir u disciplini duha.",
        "targetWords": [
          "茶",
          "饭",
          "菜"
        ],
        "context": "Mindful Simplicity • Skromnost i umerenost",
        "tokens": [
          {
            "word": "粗茶",
            "pinyin": "cū chá",
            "english": "plain tea",
            "serbian": "skroman čaj",
            "isTarget": true
          },
          {
            "word": "淡饭",
            "pinyin": "dàn fàn",
            "english": "simple food",
            "serbian": "jednostavan obrok",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r6",
    "chartId": 1,
    "rowNumber": 6,
    "title": "Knowledge & Fauna",
    "titleSerbian": "Društvo, Obrazovanje i Životinje",
    "emoji": "🏛️",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Civic entities, family sanctuary, scholarly institutions, domestic pets, and symbolic fauna.",
    "words": [
      {
        "char": "国",
        "pinyin": "guó",
        "vuk": "guo",
        "english": "nation / country",
        "serbian": "država / zemlja",
        "exampleUse": "国家 (država)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 20"
      },
      {
        "char": "家",
        "pinyin": "jiā",
        "vuk": "đja",
        "english": "home / family",
        "serbian": "dom / porodica",
        "exampleUse": "回家 (ići kući)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 15"
      },
      {
        "char": "校",
        "pinyin": "xiào",
        "vuk": "sjao",
        "english": "school",
        "serbian": "škola",
        "exampleUse": "学校 (škola)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "文",
        "pinyin": "wén",
        "vuk": "ven",
        "english": "text / culture",
        "serbian": "tekst / kultura",
        "exampleUse": "文化 (kultura)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 45"
      },
      {
        "char": "学",
        "pinyin": "xué",
        "vuk": "süe",
        "english": "learn / study",
        "serbian": "učiti / nauka",
        "exampleUse": "学习 (učiti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 30"
      },
      {
        "char": "狗",
        "pinyin": "gǒu",
        "vuk": "gou",
        "english": "dog",
        "serbian": "pas",
        "exampleUse": "小狗 (štene / pas)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "猫",
        "pinyin": "māo",
        "vuk": "mao",
        "english": "cat",
        "serbian": "mačka",
        "exampleUse": "小猫 (mače / mačka)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "马",
        "pinyin": "mǎ",
        "vuk": "ma",
        "english": "horse",
        "serbian": "konj",
        "exampleUse": "马上 (odmah / na konju)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "鸟",
        "pinyin": "niǎo",
        "vuk": "njao",
        "english": "bird",
        "serbian": "ptica",
        "exampleUse": "飞鸟 (ptica u letu)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "虫",
        "pinyin": "chóng",
        "vuk": "čung",
        "english": "insect / worm",
        "serbian": "insekt / buba",
        "exampleUse": "昆虫 (insekt)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "国家",
        "pinyin": "guójiā",
        "vuk": "guo-đja",
        "english": "country / nation",
        "serbian": "država / zemlja",
        "exampleUse": "美丽的国家 (lepa zemlja)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 40"
      },
      {
        "char": "中国",
        "pinyin": "zhōngguó",
        "vuk": "džung-guo",
        "english": "China",
        "serbian": "Kina",
        "exampleUse": "去中国旅行 (putovati u Kinu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 35"
      },
      {
        "char": "学校",
        "pinyin": "xuéxiào",
        "vuk": "süe-sjao",
        "english": "school",
        "serbian": "škola",
        "exampleUse": "去学校 (ići u školu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 50"
      },
      {
        "char": "大学",
        "pinyin": "dàxué",
        "vuk": "da-süe",
        "english": "university / college",
        "serbian": "univerzitet / fakultet",
        "exampleUse": "大学毕业 (završiti fakultet)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 65"
      },
      {
        "char": "学生",
        "pinyin": "xuésheng",
        "vuk": "süe-šeng",
        "english": "student / pupil",
        "serbian": "učenik / student",
        "exampleUse": "勤奋的学生 (vredan student)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 55"
      },
      {
        "char": "学习",
        "pinyin": "xuéxí",
        "vuk": "süe-si",
        "english": "study / learn",
        "serbian": "učiti / usvajati znanje",
        "exampleUse": "学习中文 (učiti kineski)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 35"
      },
      {
        "char": "文化",
        "pinyin": "wénhuà",
        "vuk": "ven-hua",
        "english": "culture / civilization",
        "serbian": "kultura / civilizacija",
        "exampleUse": "中国传统文化",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "中文",
        "pinyin": "zhōngwén",
        "vuk": "džung-ven",
        "english": "Chinese language",
        "serbian": "kineski jezik",
        "exampleUse": "说中文 (govoriti kineski)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "小狗",
        "pinyin": "xiǎogǒu",
        "vuk": "sjao-gou",
        "english": "puppy / dog",
        "serbian": "pas / kuca",
        "exampleUse": "可爱的小狗 (sladak pas)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "小猫",
        "pinyin": "xiǎomāo",
        "vuk": "sjao-mao",
        "english": "kitten / cat",
        "serbian": "mačka / mače",
        "exampleUse": "养了一只小猫 (imati mačku)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "马上",
        "pinyin": "mǎshàng",
        "vuk": "ma-šang",
        "english": "immediately / right away",
        "serbian": "odmah / smesta",
        "exampleUse": "马上就来 (dolazim odmah)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 70"
      },
      {
        "char": "马路",
        "pinyin": "mǎlù",
        "vuk": "ma-lu",
        "english": "street / road",
        "serbian": "ulica / drum",
        "exampleUse": "过马路 (preći ulicu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "鸟类",
        "pinyin": "niǎolèi",
        "vuk": "njao-lej",
        "english": "birds / avian species",
        "serbian": "ptice / ptičiji svet",
        "exampleUse": "保护鸟类 (zaštita ptica)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 250"
      },
      {
        "char": "教室",
        "pinyin": "jiàoshì",
        "vuk": "đjao-ši",
        "english": "classroom",
        "serbian": "učionica",
        "exampleUse": "在教室里 (u učionici)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "教授",
        "pinyin": "jiàoshòu",
        "vuk": "đjao-šou",
        "english": "professor",
        "serbian": "profesor",
        "exampleUse": "大学教授 (univerzitetski profesor)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "知识",
        "pinyin": "zhīshi",
        "vuk": "dži-ši",
        "english": "knowledge",
        "serbian": "znanje",
        "exampleUse": "获取新知识 (steći novo znanje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "文学",
        "pinyin": "wénxué",
        "vuk": "ven-süe",
        "english": "literature",
        "serbian": "književnost / literatura",
        "exampleUse": "古典文学 (klasična književnost)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "家人",
        "pinyin": "jiārén",
        "vuk": "đja-žen",
        "english": "family members",
        "serbian": "članovi porodice",
        "exampleUse": "陪伴家人 (biti uz porodicu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "回家",
        "pinyin": "huíjiā",
        "vuk": "huej-đja",
        "english": "return home / go home",
        "serbian": "vratiti se kući",
        "exampleUse": "按时回家 (vratiti se na vreme)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "作业",
        "pinyin": "zuòyè",
        "vuk": "zuo-je",
        "english": "homework / assignment",
        "serbian": "domaći zadatak",
        "exampleUse": "写完作业 (završiti zadatak)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "考试",
        "pinyin": "kǎoshì",
        "vuk": "kao-ši",
        "english": "exam / test",
        "serbian": "ispit / test",
        "exampleUse": "通过考试 (položiti ispit)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "科学",
        "pinyin": "kēxué",
        "vuk": "ke-süe",
        "english": "science / scientific",
        "serbian": "nauka / naučno",
        "exampleUse": "科学发展 (naučni razvoj)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "历史",
        "pinyin": "lìshǐ",
        "vuk": "li-ši",
        "english": "history",
        "serbian": "istorija",
        "exampleUse": "悠久的历史 (duga istorija)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "语言",
        "pinyin": "yǔyán",
        "vuk": "ji-jen",
        "english": "language",
        "serbian": "jezik",
        "exampleUse": "外语语言 (strani jezik)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 105"
      },
      {
        "char": "提高",
        "pinyin": "tígāo",
        "vuk": "ti-gao",
        "english": "improve / enhance",
        "serbian": "unaprediti / poboljšati",
        "exampleUse": "提高水平 (podići nivo)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 90"
      },
      {
        "char": "进步",
        "pinyin": "jìnbù",
        "vuk": "đjin-bu",
        "english": "progress / make progress",
        "serbian": "napredak / napredovati",
        "exampleUse": "取得巨大进步",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 105"
      },
      {
        "char": "勤奋",
        "pinyin": "qínfèn",
        "vuk": "ćin-fen",
        "english": "diligent / industrious",
        "serbian": "marljiv / vredan",
        "exampleUse": "勤奋好学 (vredan u učenju)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 210"
      },
      {
        "char": "培养",
        "pinyin": "péiyǎng",
        "vuk": "pej-jang",
        "english": "cultivate / nurture",
        "serbian": "negovati / gajiti naviku",
        "exampleUse": "培养专注力 (negovati fokus)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 170"
      },
      {
        "char": "社会",
        "pinyin": "shèhuì",
        "vuk": "še-huej",
        "english": "society",
        "serbian": "društvo",
        "exampleUse": "和谐社会 (skladno društvo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "传统",
        "pinyin": "chuántǒng",
        "vuk": "čuan-tung",
        "english": "tradition / traditional",
        "serbian": "tradicija / tradicionalan",
        "exampleUse": "优良传统 (plemenita tradicija)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "思想",
        "pinyin": "sīxiǎng",
        "vuk": "s-sjang",
        "english": "thought / ideology",
        "serbian": "misao / filozofija",
        "exampleUse": "深刻的思想 (duboka misao)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "文章",
        "pinyin": "wénzhāng",
        "vuk": "ven-džang",
        "english": "article / essay",
        "serbian": "članak / esej",
        "exampleUse": "阅读文章 (čitati tekst)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      }
    ],
    "sentences": [
      {
        "id": "idm-6-1",
        "type": "proverb",
        "typeLabel": "民间俗语 / 古训 (Lifelong Learning)",
        "chinese": "活到老，学到老。",
        "pinyin": "Huó dào lǎo, xué dào lǎo.",
        "vuk": "Huo dao lao, süe dao lao.",
        "literalEnglish": "Live until old age, study until old age.",
        "english": "Never too old to learn / Lifelong learning.",
        "serbianEquivalent": "Čovek se uči dok je živ.",
        "serbian": "Koliko god da živiš, do same starosti čovek mora učiti i širiti vidike.",
        "philosophicalContext": "Konfučijanski ideal trajnog usavršavanja: um nikada ne sme da se ulenji. Život je neprekidna škola.",
        "targetWords": [
          "学",
          "文"
        ],
        "context": "Lifelong Growth • Trajno učenje",
        "tokens": [
          {
            "word": "活到老",
            "pinyin": "huó dào lǎo",
            "english": "live to old",
            "serbian": "živeti do starosti"
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "学到老",
            "pinyin": "xué dào lǎo",
            "english": "learn to old",
            "serbian": "učiti do starosti",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-6-2",
        "type": "proverb",
        "typeLabel": "家训名言 (Family Harmony Classic)",
        "chinese": "家和万事兴。",
        "pinyin": "Jiā hé wàn shì xīng.",
        "vuk": "Đja he van ši sing.",
        "literalEnglish": "When the family is in harmony, all ten thousand affairs prosper.",
        "english": "Harmony in the family brings success to everything.",
        "serbianEquivalent": "Sloga kuću gradi, nesloga je razgrađuje.",
        "serbian": "Kada u kući vlada sloga i međusobno poštovanje, svaki posao i cilj napreduje bez prepreka.",
        "philosophicalContext": "Iz tradicionalnih kineskih kućnih pravila. Mir u mikrokosmosu porodice stvara nepokolebljivu snagu za sve spoljašnje poduhvate.",
        "targetWords": [
          "家",
          "国"
        ],
        "context": "Harmony & Strength • Porodični mir",
        "tokens": [
          {
            "word": "家和",
            "pinyin": "jiā hé",
            "english": "family harmonious",
            "serbian": "porodični sklad",
            "isTarget": true
          },
          {
            "word": "万事",
            "pinyin": "wàn shì",
            "english": "all affairs",
            "serbian": "sve stvari"
          },
          {
            "word": "兴",
            "pinyin": "xīng",
            "english": "prosper",
            "serbian": "napreduje"
          }
        ]
      },
      {
        "id": "idm-6-3",
        "type": "chengyu",
        "typeLabel": "典故成语 (Daoist Equanimity Classic)",
        "chinese": "塞翁失马，焉知非福。",
        "pinyin": "Sài wēng shī mǎ, yān zhī fēi fú.",
        "vuk": "Saj veng ši ma, jen dži fej fu.",
        "literalEnglish": "The old man on the frontier lost his horse; who knows if it is not good fortune?",
        "english": "A blessing in disguise / Every cloud has a silver lining.",
        "serbianEquivalent": "Ko zna zašto je to dobro. / Svako zlo ima svoje dobro.",
        "serbian": "Starac s granice izgubio je konja; ko može znati da to zapravo nije prikrivena velika sreća?",
        "philosophicalContext": "Iz Huainanzi spisa: mudrac razume da se nesreća i sreća neprestano prelivaju jedna u drugu. Održavaj mir uma u svim ishodima.",
        "targetWords": [
          "马",
          "知",
          "不"
        ],
        "context": "Stoic Equanimity • Stoički mir",
        "tokens": [
          {
            "word": "塞翁",
            "pinyin": "sài wēng",
            "english": "frontier old man",
            "serbian": "starac s granice"
          },
          {
            "word": "失马",
            "pinyin": "shī mǎ",
            "english": "lost horse",
            "serbian": "izgubio konja",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "焉知",
            "pinyin": "yān zhī",
            "english": "who knows",
            "serbian": "ko zna"
          },
          {
            "word": "非福",
            "pinyin": "fēi fú",
            "english": "not a blessing",
            "serbian": "nije sreća"
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r7",
    "chartId": 1,
    "rowNumber": 7,
    "title": "Cosmos & Elements",
    "titleSerbian": "Kosmos, Priroda i Pet Elemenata",
    "emoji": "🌌",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Celestial bodies, five elements (Wuxing), terrestrial domains, and ocean depths.",
    "words": [
      {
        "char": "日",
        "pinyin": "rì",
        "vuk": "ž",
        "english": "sun / day",
        "serbian": "sunce / dan",
        "exampleUse": "每天 (svaki dan)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 25"
      },
      {
        "char": "月",
        "pinyin": "yuè",
        "vuk": "jüe",
        "english": "moon / month",
        "serbian": "mesec / mesec u godini",
        "exampleUse": "月亮 (mesec na nebu)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 30"
      },
      {
        "char": "天",
        "pinyin": "tiān",
        "vuk": "tjen",
        "english": "sky / day / heaven",
        "serbian": "nebo / dan",
        "exampleUse": "天空 (plavo nebo)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 15"
      },
      {
        "char": "地",
        "pinyin": "dì",
        "vuk": "di",
        "english": "earth / land / ground",
        "serbian": "zemlja / tlo",
        "exampleUse": "地方 (mesto)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 20"
      },
      {
        "char": "海",
        "pinyin": "hǎi",
        "vuk": "haj",
        "english": "sea / ocean",
        "serbian": "more / okean",
        "exampleUse": "大海 (otvoreno more)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "木",
        "pinyin": "mù",
        "vuk": "mu",
        "english": "wood / tree",
        "serbian": "drvo / građa",
        "exampleUse": "木头 (drvo)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "火",
        "pinyin": "huǒ",
        "vuk": "huo",
        "english": "fire",
        "serbian": "vatra / plamen",
        "exampleUse": "火山 (vulkan)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "土",
        "pinyin": "tǔ",
        "vuk": "tu",
        "english": "soil / earth",
        "serbian": "zemlja / glina",
        "exampleUse": "土地 (zemljište)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "金",
        "pinyin": "jīn",
        "vuk": "đjin",
        "english": "gold / metal",
        "serbian": "zlato / metal",
        "exampleUse": "金钱 (novac)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "水",
        "pinyin": "shuǐ",
        "vuk": "šuej",
        "english": "water",
        "serbian": "voda",
        "exampleUse": "喝水 (piti vodu)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 45"
      },
      {
        "char": "太阳",
        "pinyin": "tàiyáng",
        "vuk": "taj-jang",
        "english": "sun",
        "serbian": "sunce",
        "exampleUse": "晒太阳 (sunčati se)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "月亮",
        "pinyin": "yuèliang",
        "vuk": "jüe-ljang",
        "english": "moon",
        "serbian": "mesec",
        "exampleUse": "看月亮 (posmatrati mesec)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "天空",
        "pinyin": "tiānkōng",
        "vuk": "tjen-kung",
        "english": "sky / firmament",
        "serbian": "nebesko prostranstvo",
        "exampleUse": "蓝色的天空 (plavo nebo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 105"
      },
      {
        "char": "天气",
        "pinyin": "tiānqì",
        "vuk": "tjen-ći",
        "english": "weather",
        "serbian": "vremenske prilike",
        "exampleUse": "今天天气很好",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 50"
      },
      {
        "char": "地球",
        "pinyin": "dìqiú",
        "vuk": "di-ćju",
        "english": "Earth planet",
        "serbian": "planeta Zemlja",
        "exampleUse": "保护地球 (čuvati planetu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "地方",
        "pinyin": "dìfang",
        "vuk": "di-fang",
        "english": "place / location",
        "serbian": "mesto / lokacija",
        "exampleUse": "安静的地方 (mirno mesto)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 45"
      },
      {
        "char": "大海",
        "pinyin": "dàhǎi",
        "vuk": "da-haj",
        "english": "sea / ocean",
        "serbian": "more / prostrano more",
        "exampleUse": "面对大海 (licem ka moru)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "海水",
        "pinyin": "hǎishuǐ",
        "vuk": "haj-šuej",
        "english": "seawater",
        "serbian": "morska voda",
        "exampleUse": "清澈的海水 (bistra morska voda)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "森林",
        "pinyin": "sēnlín",
        "vuk": "sen-lin",
        "english": "forest / woods",
        "serbian": "šuma",
        "exampleUse": "走进森林 (ući u šumu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "喝水",
        "pinyin": "hēshuǐ",
        "vuk": "he-šuej",
        "english": "drink water / hydrate",
        "serbian": "piti vodu / hidratacija",
        "exampleUse": "多喝温水 (piti toplu vodu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "金钱",
        "pinyin": "jīnqián",
        "vuk": "đjin-ćjen",
        "english": "money / wealth",
        "serbian": "novac / bogatstvo",
        "exampleUse": "金钱不能买健康",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "自然",
        "pinyin": "zìrán",
        "vuk": "ce-žan",
        "english": "nature / natural",
        "serbian": "priroda / prirodan",
        "exampleUse": "回归自然 (povratak prirodi)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "环境",
        "pinyin": "huánjìng",
        "vuk": "huan-đjing",
        "english": "environment",
        "serbian": "životna sredina",
        "exampleUse": "优美环境 (lepo okruženje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "阳光",
        "pinyin": "yángguāng",
        "vuk": "jang-guang",
        "english": "sunlight / sunshine",
        "serbian": "sunčeva svetlost",
        "exampleUse": "温暖的阳光 (toplo sunce)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "每天",
        "pinyin": "měitiān",
        "vuk": "mej-tjen",
        "english": "every day / daily",
        "serbian": "svaki dan / dnevno",
        "exampleUse": "每天坚持 (svaki dan istrajati)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 50"
      },
      {
        "char": "明天",
        "pinyin": "míngtiān",
        "vuk": "ming-tjen",
        "english": "tomorrow",
        "serbian": "sutra",
        "exampleUse": "明天见 (vidimo se sutra)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 45"
      },
      {
        "char": "昨天",
        "pinyin": "zuótiān",
        "vuk": "zuo-tjen",
        "english": "yesterday",
        "serbian": "juče",
        "exampleUse": "昨天的事情 (jučerašnje stvari)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 55"
      },
      {
        "char": "气候",
        "pinyin": "qìhòu",
        "vuk": "ći-hou",
        "english": "climate",
        "serbian": "klima",
        "exampleUse": "温和的气候 (blaga klima)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "温暖",
        "pinyin": "wēnnuǎn",
        "vuk": "ven-nuan",
        "english": "warm / warmth",
        "serbian": "toplo / toplina",
        "exampleUse": "温暖的心 (toplo srce)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 145"
      },
      {
        "char": "寒冷",
        "pinyin": "hánlěng",
        "vuk": "han-leng",
        "english": "cold / frigid",
        "serbian": "hladno / studeno",
        "exampleUse": "寒冷的冬天 (hladna zima)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 160"
      },
      {
        "char": "土地",
        "pinyin": "tǔdì",
        "vuk": "tu-di",
        "english": "land / territory",
        "serbian": "zemljište / tlo",
        "exampleUse": "肥沃的土地 (plodna zemlja)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "火山",
        "pinyin": "huǒshān",
        "vuk": "huo-šan",
        "english": "volcano",
        "serbian": "vulkan",
        "exampleUse": "休眠火山 (uspavani vulkan)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 250"
      },
      {
        "char": "月光",
        "pinyin": "yuèguāng",
        "vuk": "jüe-guang",
        "english": "moonlight",
        "serbian": "mesečina",
        "exampleUse": "明亮的月光 (bistra mesečina)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "地理",
        "pinyin": "dìlǐ",
        "vuk": "di-li",
        "english": "geography",
        "serbian": "geografija",
        "exampleUse": "地理环境 (geografsko okruženje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "资源",
        "pinyin": "zīyuán",
        "vuk": "ce-jüan",
        "english": "resources",
        "serbian": "resursi / bogatstva",
        "exampleUse": "自然资源 (prirodni resursi)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "生态",
        "pinyin": "shēngtài",
        "vuk": "šeng-taj",
        "english": "ecology / ecosystem",
        "serbian": "ekologija / eko-sistem",
        "exampleUse": "生态平衡 (ekološka ravnoteža)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 165"
      },
      {
        "char": "天地",
        "pinyin": "tiāndì",
        "vuk": "tjen-di",
        "english": "heaven and earth / world",
        "serbian": "nebo i zemlja / univerzum",
        "exampleUse": "广阔天地 (širok svet)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "日月",
        "pinyin": "rìyuè",
        "vuk": "ž-jüe",
        "english": "sun and moon / time",
        "serbian": "sunce i mesec / vreme",
        "exampleUse": "日月如梭 (dani lete)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "清澈",
        "pinyin": "qīngchè",
        "vuk": "ćing-če",
        "english": "crystal clear",
        "serbian": "kristalno čisto",
        "exampleUse": "清澈见底 (bistro do dna)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 230"
      },
      {
        "char": "火热",
        "pinyin": "huǒrè",
        "vuk": "huo-že",
        "english": "fiery / fervent",
        "serbian": "vatren / plamen",
        "exampleUse": "火热的热情 (vatrena strast)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 240"
      },
      {
        "char": "原木",
        "pinyin": "yuánmù",
        "vuk": "jüan-mu",
        "english": "raw wood / timber",
        "serbian": "prirodno drvo / deblo",
        "exampleUse": "天然原木 (prirodno drvo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 330"
      },
      {
        "char": "宇宙",
        "pinyin": "yǔzhòu",
        "vuk": "ji-džou",
        "english": "universe / cosmos",
        "serbian": "univerzum / svemir",
        "exampleUse": "浩瀚宇宙 (beskrajni kosmos)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      }
    ],
    "sentences": [
      {
        "id": "idm-7-1",
        "type": "chengyu",
        "typeLabel": "成语 (Perseverance Classic)",
        "chinese": "水滴石穿。",
        "pinyin": "Shuǐ dī shí chuān.",
        "vuk": "Šuej di ši čuan.",
        "literalEnglish": "Water drops pierce through solid stone.",
        "english": "Constant dripping wears away the stone / Persistence conquers all.",
        "serbianEquivalent": "Tiha voda breg roni. / Upornost ruši sve prepreke.",
        "serbian": "Stalne kapi vode s vremenom probijaju i najtvrđi kamen; postojana disciplina pobeđuje svaku silu.",
        "philosophicalContext": "Iz Knjige Hana. Voda je meka, ali njena neprekidna, smirena postojanost savladava nesalomivi granit. Najvažnija stoička lekcija o navikama.",
        "targetWords": [
          "水",
          "石",
          "地"
        ],
        "context": "Persistence & Habit • Tiha voda breg roni",
        "tokens": [
          {
            "word": "水滴",
            "pinyin": "shuǐ dī",
            "english": "water drops",
            "serbian": "kapi vode",
            "isTarget": true
          },
          {
            "word": "石穿",
            "pinyin": "shí chuān",
            "english": "stone pierces",
            "serbian": "kamen probija",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-7-2",
        "type": "proverb",
        "typeLabel": "名言警句 (Lin Zexu Wisdom)",
        "chinese": "海纳百川，有容乃大。",
        "pinyin": "Hǎi nà bǎi chuān, yǒu róng nǎi dà.",
        "vuk": "Haj na baj čuan, jou žung naj da.",
        "literalEnglish": "The ocean accepts hundreds of rivers; it is great because it has immense capacity.",
        "english": "The sea welcomes all rivers / Greatness lies in vast tolerance.",
        "serbianEquivalent": "Širina duha čini velikog čoveka. / More prima sve reke.",
        "serbian": "Okean prima u sebe stotine reka; istinska veličina karaktera leži u sposobnosti da se sve prihvati sa širinom i mirom.",
        "philosophicalContext": "Stoičko držanje: ne dozvoli da te male nesuglasice uzdrmaju. Budi prostran poput okeana koji prima bujice a ostaje miran u dubini.",
        "targetWords": [
          "海",
          "百",
          "大",
          "有"
        ],
        "context": "Vast Mind & Equanimity • Širina duha",
        "tokens": [
          {
            "word": "海",
            "pinyin": "hǎi",
            "english": "sea/ocean",
            "serbian": "more",
            "isTarget": true
          },
          {
            "word": "纳",
            "pinyin": "nà",
            "english": "accepts/absorbs",
            "serbian": "prihvata"
          },
          {
            "word": "百川",
            "pinyin": "bǎi chuān",
            "english": "hundred rivers",
            "serbian": "stotinu reka",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "有容",
            "pinyin": "yǒu róng",
            "english": "has tolerance",
            "serbian": "ima širinu",
            "isTarget": true
          },
          {
            "word": "乃大",
            "pinyin": "nǎi dà",
            "english": "is truly great",
            "serbian": "jeste veliko",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-7-3",
        "type": "chengyu",
        "typeLabel": "成语 (Catalyst of Change)",
        "chinese": "星火燎原。",
        "pinyin": "Xīng huǒ liáo yuán.",
        "vuk": "Sing huo ljao jüan.",
        "literalEnglish": "A single spark spreads and sets the whole prairie ablaze.",
        "english": "A single spark can start a prairie fire.",
        "serbianEquivalent": "Od male iskre nastane veliki požar. / Mala ideja pokreće revoluciju.",
        "serbian": "Jedna sićušna iskra vatre može zapaliti celu beskrajnu ravnicu; mala iskra znanja transformiše čitav život.",
        "philosophicalContext": "Iz Knjige dokumenata. Nikada ne potcenjuj malu promenu ili jednu dobru naviku — ona ima snagu da preporodi celo tvoje postojanje.",
        "targetWords": [
          "火",
          "木",
          "地"
        ],
        "context": "Catalyst & Transformation • Moć male iskre",
        "tokens": [
          {
            "word": "星火",
            "pinyin": "xīng huǒ",
            "english": "tiny spark",
            "serbian": "mala iskra",
            "isTarget": true
          },
          {
            "word": "燎原",
            "pinyin": "liáo yuán",
            "english": "burns prairie",
            "serbian": "pali ravnicu"
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r8",
    "chartId": 1,
    "rowNumber": 8,
    "title": "Climate & Earth",
    "titleSerbian": "Vreme, Reljef i Zemljoradnja",
    "emoji": "⛰️",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Meteorological forces, mountain ranges, river networks, agriculture, and minerals.",
    "words": [
      {
        "char": "气",
        "pinyin": "qì",
        "vuk": "ći",
        "english": "air / energy / breath",
        "serbian": "vazduh / energija / dah",
        "exampleUse": "生气 (ljutiti se / energija)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 35"
      },
      {
        "char": "干",
        "pinyin": "gān",
        "vuk": "gan",
        "english": "dry / do / stem",
        "serbian": "suvo / raditi",
        "exampleUse": "干净 (čisto)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 45"
      },
      {
        "char": "雨",
        "pinyin": "yǔ",
        "vuk": "ji",
        "english": "rain",
        "serbian": "kiša",
        "exampleUse": "下雨 (pada kiša)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "山",
        "pinyin": "shān",
        "vuk": "šan",
        "english": "mountain / hill",
        "serbian": "planina / brdo",
        "exampleUse": "爬山 (planinariti)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "川",
        "pinyin": "chuān",
        "vuk": "čuan",
        "english": "river / plain",
        "serbian": "reka / vodotok",
        "exampleUse": "四川 (Sečuan)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "米",
        "pinyin": "mǐ",
        "vuk": "mi",
        "english": "rice grain / meter",
        "serbian": "pirinač u zrnu / metar",
        "exampleUse": "大米 (pirinač)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 70"
      },
      {
        "char": "田",
        "pinyin": "tián",
        "vuk": "tjen",
        "english": "field / farmland",
        "serbian": "polje / oranica",
        "exampleUse": "田地 (njiva)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "花",
        "pinyin": "huā",
        "vuk": "hua",
        "english": "flower / spend",
        "serbian": "cvet / trošiti",
        "exampleUse": "鲜花 (sveže cveće)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 55"
      },
      {
        "char": "石",
        "pinyin": "shí",
        "vuk": "ši",
        "english": "stone / rock",
        "serbian": "kamen / stena",
        "exampleUse": "石头 (kamen)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "玉",
        "pinyin": "yù",
        "vuk": "ji",
        "english": "jade / precious stone",
        "serbian": "žad / dragi kamen",
        "exampleUse": "玉石 (žad kamen)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "空气",
        "pinyin": "kōngqì",
        "vuk": "kung-ći",
        "english": "air / atmosphere",
        "serbian": "vazduh",
        "exampleUse": "新鲜空气 (svež vazduh)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "生气",
        "pinyin": "shēngqì",
        "vuk": "šeng-ći",
        "english": "angry / mad",
        "serbian": "ljut / besan",
        "exampleUse": "别生气 (nemoj da se ljutiš)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 80"
      },
      {
        "char": "干净",
        "pinyin": "gānjìng",
        "vuk": "gan-đjing",
        "english": "clean / neat",
        "serbian": "čisto / uredno",
        "exampleUse": "打扫干净 (počistiti)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 75"
      },
      {
        "char": "下雨",
        "pinyin": "xiàyǔ",
        "vuk": "sja-ji",
        "english": "rain / raining",
        "serbian": "pada kiša",
        "exampleUse": "外面下雨了 (napolju pada kiša)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 70"
      },
      {
        "char": "雨伞",
        "pinyin": "yǔsǎn",
        "vuk": "ji-san",
        "english": "umbrella",
        "serbian": "kišobran",
        "exampleUse": "带一把雨伞 (poneti kišobran)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "爬山",
        "pinyin": "páshān",
        "vuk": "pa-šan",
        "english": "climb mountain / hike",
        "serbian": "penjati se na planinu",
        "exampleUse": "周末去爬山 (za vikend na planinarenje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "高山",
        "pinyin": "gāoshān",
        "vuk": "gao-šan",
        "english": "high mountain",
        "serbian": "visoka planina",
        "exampleUse": "壮丽的高山 (veličanstvena planina)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "大米",
        "pinyin": "dàmǐ",
        "vuk": "da-mi",
        "english": "uncooked rice",
        "serbian": "pirinač",
        "exampleUse": "买一袋大米 (kupiti džak pirinča)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "田地",
        "pinyin": "tiándì",
        "vuk": "tjen-di",
        "english": "farmland / crops field",
        "serbian": "njiva / oranica",
        "exampleUse": "辛勤耕种田地",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "鲜花",
        "pinyin": "xiānhuā",
        "vuk": "sjen-hua",
        "english": "fresh flowers",
        "serbian": "sveže cveće",
        "exampleUse": "美丽的花朵 (lep cvet)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "石头",
        "pinyin": "shítou",
        "vuk": "ši-tou",
        "english": "stone / pebble",
        "serbian": "kamen",
        "exampleUse": "坚硬的石头 (tvrd kamen)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "玉石",
        "pinyin": "yùshí",
        "vuk": "ji-ši",
        "english": "jade stone",
        "serbian": "žad",
        "exampleUse": "天然玉石 (prirodni žad)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "气氛",
        "pinyin": "qìfēn",
        "vuk": "ći-fen",
        "english": "atmosphere / mood",
        "serbian": "atmosfera / raspoloženje",
        "exampleUse": "热烈的气氛 (topla atmosfera)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "客气",
        "pinyin": "kèqi",
        "vuk": "ke-ći",
        "english": "polite / courteous",
        "serbian": "ljubazan / nema na čemu",
        "exampleUse": "不客气 (nema na čemu)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 60"
      },
      {
        "char": "干燥",
        "pinyin": "gānzào",
        "vuk": "gan-zao",
        "english": "dry / arid",
        "serbian": "suvo / sparno",
        "exampleUse": "气候干燥 (suva klima)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 190"
      },
      {
        "char": "暴雨",
        "pinyin": "bàoyǔ",
        "vuk": "bao-ji",
        "english": "rainstorm / downpour",
        "serbian": "pljusak / oluja",
        "exampleUse": "突降暴雨 (iznenadni pljusak)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "山脉",
        "pinyin": "shānmài",
        "vuk": "šan-maj",
        "english": "mountain range",
        "serbian": "planinski venac",
        "exampleUse": "连绵的山脉 (beskrajni venac)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 230"
      },
      {
        "char": "田野",
        "pinyin": "tiányě",
        "vuk": "tjen-je",
        "english": "open fields / countryside",
        "serbian": "polja / seoski predeo",
        "exampleUse": "漫步在田野 (šetati poljima)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "粮食",
        "pinyin": "liángshi",
        "vuk": "ljang-ši",
        "english": "grain / food harvest",
        "serbian": "žitarice / hrana",
        "exampleUse": "节约粮食 (čuvati hranu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "丰收",
        "pinyin": "fēngshōu",
        "vuk": "feng-šou",
        "english": "bumper harvest",
        "serbian": "bogata žetva / rod",
        "exampleUse": "迎来大丰收 (obilna žetva)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "坚硬",
        "pinyin": "jiānyìng",
        "vuk": "đjen-jing",
        "english": "hard / solid",
        "serbian": "čvrst / otporan",
        "exampleUse": "质地坚硬 (tvrda struktura)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 240"
      },
      {
        "char": "纯洁",
        "pinyin": "chúnjié",
        "vuk": "čun-đje",
        "english": "pure / untainted",
        "serbian": "čist / neiskvaren",
        "exampleUse": "纯洁的心灵 (čisto srce)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 260"
      },
      {
        "char": "种植",
        "pinyin": "zhòngzhí",
        "vuk": "džung-dž",
        "english": "plant / cultivate",
        "serbian": "saditi / gajiti",
        "exampleUse": "种植花草 (gajiti cveće)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 200"
      },
      {
        "char": "滋养",
        "pinyin": "zīyǎng",
        "vuk": "ce-jang",
        "english": "nourish / hydrate",
        "serbian": "hraniti / osvežavati",
        "exampleUse": "雨水滋养大地 (kiša hrani zemlju)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 280"
      },
      {
        "char": "河流",
        "pinyin": "héliú",
        "vuk": "he-lju",
        "english": "river / waterway",
        "serbian": "reka / tok reke",
        "exampleUse": "清澈的河流 (bistra reka)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "干活",
        "pinyin": "gànhuó",
        "vuk": "gan-huo",
        "english": "work / manual labor",
        "serbian": "raditi posao",
        "exampleUse": "努力干活 (marljivo raditi)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 160"
      },
      {
        "char": "气候",
        "pinyin": "qìhòu",
        "vuk": "ći-hou",
        "english": "weather climate",
        "serbian": "klima",
        "exampleUse": "多变的气候 (promenljiva klima)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "力气",
        "pinyin": "lìqi",
        "vuk": "li-ći",
        "english": "physical strength",
        "serbian": "fizička snaga",
        "exampleUse": "花很大力气 (uložiti dosta snage)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "勇气",
        "pinyin": "yǒngqì",
        "vuk": "jung-ći",
        "english": "courage / bravery",
        "serbian": "hrabrost / odvažnost",
        "exampleUse": "充满勇气 (pun hrabrosti)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "风景",
        "pinyin": "fēngjǐng",
        "vuk": "feng-đjing",
        "english": "scenery / landscape",
        "serbian": "pejzaž / prizor",
        "exampleUse": "山顶风景 (pogled sa vrha planine)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "开花",
        "pinyin": "kāihuā",
        "vuk": "kaj-hua",
        "english": "bloom / blossom",
        "serbian": "cvetati / procvetati",
        "exampleUse": "春天开花 (prolećno cvetanje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 175"
      },
      {
        "char": "玉器",
        "pinyin": "yùqì",
        "vuk": "ji-ći",
        "english": "jade artifact",
        "serbian": "predmet od žada",
        "exampleUse": "珍贵玉器 (dragoceni žad)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 310"
      }
    ],
    "sentences": [
      {
        "id": "idm-8-1",
        "type": "chengyu",
        "typeLabel": "成语 (Adversity & Fellowship)",
        "chinese": "风雨同舟。",
        "pinyin": "Fēng yǔ tóng zhōu.",
        "vuk": "Feng ji tung džou.",
        "literalEnglish": "Wind and rain together in the same boat.",
        "english": "Stand together through storm and stress / In the same boat through rough waters.",
        "serbianEquivalent": "Zajedno i u dobru i u zlu. / Prijatelj se u nevolji poznaje.",
        "serbian": "Biti u istom čamcu kroz vetar i oluju; rame uz rame prebroditi svaku životnu buru.",
        "philosophicalContext": "Iz Sun Cuovog Umeća ratovanja. Istinsko prijateljstvo i savezništvo se ne kuju za vedrog dana, već usred pljuska i oluje.",
        "targetWords": [
          "雨",
          "气"
        ],
        "context": "Fellowship Through Storms • Vernost u buri",
        "tokens": [
          {
            "word": "风雨",
            "pinyin": "fēng yǔ",
            "english": "wind and rain",
            "serbian": "vetar i kiša",
            "isTarget": true
          },
          {
            "word": "同舟",
            "pinyin": "tóng zhōu",
            "english": "same boat",
            "serbian": "isti čamac"
          }
        ]
      },
      {
        "id": "idm-8-2",
        "type": "proverb",
        "typeLabel": "三字经名句 (Classic Discipline Proverb)",
        "chinese": "玉不琢，不成器。",
        "pinyin": "Yù bù zhuó, bù chéng qì.",
        "vuk": "Ji bu džuo, bu čeng ći.",
        "literalEnglish": "If jade is not carved and polished, it cannot become a noble vessel.",
        "english": "If jade is untooled, it becomes no utensil / Character requires discipline.",
        "serbianEquivalent": "Gvožđe se kuje dok je vruće. / Bez muke nema nauke.",
        "serbian": "Ako se sirovi žad pažljivo ne kleše i brusi, nikada ne može postati dragoceni sud; bez truda talenat ostaje neiskorišćen.",
        "philosophicalContext": "Iz San Zi Jinga (Klasik od tri znaka). Čovek se rađa sa potencijalom, ali tek kroz naporan trening, navike i samodisciplinu postaje izuzetan.",
        "targetWords": [
          "玉",
          "不",
          "石"
        ],
        "context": "Discipline & Crafting • Brušenje karaktera",
        "tokens": [
          {
            "word": "玉",
            "pinyin": "yù",
            "english": "jade",
            "serbian": "žad",
            "isTarget": true
          },
          {
            "word": "不琢",
            "pinyin": "bù zhuó",
            "english": "not carved",
            "serbian": "nije klesan",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "不成器",
            "pinyin": "bù chéng qì",
            "english": "not becoming vessel",
            "serbian": "ne postaje dragocen"
          }
        ]
      },
      {
        "id": "idm-8-3",
        "type": "chengyu",
        "typeLabel": "成语 (Direct Honesty)",
        "chinese": "开门见山。",
        "pinyin": "Kāi mén jiàn shān.",
        "vuk": "Kaj men đjen šan.",
        "literalEnglish": "Open the front door and see the mountain directly.",
        "english": "Come straight to the point / Get straight to business.",
        "serbianEquivalent": "Preći odmah na stvar. / Bez okolišanja.",
        "serbian": "Otvoriti vrata i odmah ugledati planinu; govoriti jasno, otvoreno i direktno bez uvijanja.",
        "philosophicalContext": "Potiče iz dinastije Tang. Stoički govor je čist i jasan: reci suštinu bez nepotrebnih maski.",
        "targetWords": [
          "山",
          "见"
        ],
        "context": "Direct Clarity • Direktna jasnoća",
        "tokens": [
          {
            "word": "开门",
            "pinyin": "kāi mén",
            "english": "open door",
            "serbian": "otvori vrata"
          },
          {
            "word": "见山",
            "pinyin": "jiàn shān",
            "english": "see mountain",
            "serbian": "vidi planinu",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r9",
    "chartId": 1,
    "rowNumber": 9,
    "title": "Colors & Commerce",
    "titleSerbian": "Zajednica, Trgovina i Spektar Boja",
    "emoji": "🎨",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Human settlements, commerce points, transportation, clothing, and primary visual chromatic spectrum.",
    "words": [
      {
        "char": "村",
        "pinyin": "cūn",
        "vuk": "cun",
        "english": "village / hamlet",
        "serbian": "selo / naselje",
        "exampleUse": "农村 (seosko područje)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "店",
        "pinyin": "diàn",
        "vuk": "đjen",
        "english": "shop / store",
        "serbian": "radnja / prodavnica",
        "exampleUse": "商店 (prodavnica)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 65"
      },
      {
        "char": "车",
        "pinyin": "chē",
        "vuk": "če",
        "english": "vehicle / car",
        "serbian": "vozilo / auto",
        "exampleUse": "开车 (voziti auto)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 40"
      },
      {
        "char": "衣",
        "pinyin": "yī",
        "vuk": "ji",
        "english": "clothes / garments",
        "serbian": "odeća / odevalo",
        "exampleUse": "衣服 (odeća)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 70"
      },
      {
        "char": "白",
        "pinyin": "bái",
        "vuk": "baj",
        "english": "white / pure / clear",
        "serbian": "belo / čisto / jasno",
        "exampleUse": "白色 (bela boja)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 50"
      },
      {
        "char": "黑",
        "pinyin": "hēi",
        "vuk": "hej",
        "english": "black / dark",
        "serbian": "crno / tamno",
        "exampleUse": "黑色 (crna boja)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 65"
      },
      {
        "char": "红",
        "pinyin": "hóng",
        "vuk": "hung",
        "english": "red / auspicious",
        "serbian": "crveno / srećno",
        "exampleUse": "红色 (crvena boja)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 60"
      },
      {
        "char": "蓝",
        "pinyin": "lán",
        "vuk": "lan",
        "english": "blue",
        "serbian": "plavo",
        "exampleUse": "蓝色 (plava boja)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 110"
      },
      {
        "char": "绿",
        "pinyin": "lǜ",
        "vuk": "li",
        "english": "green",
        "serbian": "zeleno",
        "exampleUse": "绿色 (zelena boja)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 100"
      },
      {
        "char": "黄",
        "pinyin": "huáng",
        "vuk": "huang",
        "english": "yellow / imperial",
        "serbian": "žuto",
        "exampleUse": "黄色 (žuta boja)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 95"
      },
      {
        "char": "农村",
        "pinyin": "nóngcūn",
        "vuk": "nung-cun",
        "english": "rural area / countryside",
        "serbian": "selo / seoski kraj",
        "exampleUse": "安静的农村 (mirno selo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "商店",
        "pinyin": "shāngdiàn",
        "vuk": "šang-đjen",
        "english": "shop / retail store",
        "serbian": "prodavnica / trgovina",
        "exampleUse": "去商店购物 (u kupovinu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "饭店",
        "pinyin": "fàndiàn",
        "vuk": "fan-đjen",
        "english": "restaurant / hotel",
        "serbian": "restoran / hotel",
        "exampleUse": "在饭店吃饭 (ručati u restoranu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "开车",
        "pinyin": "kāichē",
        "vuk": "kaj-če",
        "english": "drive a car",
        "serbian": "voziti automobil",
        "exampleUse": "学会开车 (naučiti da vozi)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 60"
      },
      {
        "char": "火车",
        "pinyin": "huǒchē",
        "vuk": "huo-če",
        "english": "train",
        "serbian": "voz",
        "exampleUse": "坐火车 (putovati vozom)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "衣服",
        "pinyin": "yīfu",
        "vuk": "ji-fu",
        "english": "clothes / garments",
        "serbian": "odeća / odeća",
        "exampleUse": "穿新衣服 (obući novu odeću)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "大衣",
        "pinyin": "dàyī",
        "vuk": "da-ji",
        "english": "overcoat / coat",
        "serbian": "kaput",
        "exampleUse": "厚厚的大衣 (topao kaput)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "黑色",
        "pinyin": "hēisè",
        "vuk": "hej-se",
        "english": "black color",
        "serbian": "crna boja",
        "exampleUse": "黑色的车 (crn auto)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 80"
      },
      {
        "char": "白色",
        "pinyin": "báisè",
        "vuk": "baj-se",
        "english": "white color",
        "serbian": "bela boja",
        "exampleUse": "白色的衣服 (bela odeća)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 75"
      },
      {
        "char": "红色",
        "pinyin": "hóngsè",
        "vuk": "hung-se",
        "english": "red color",
        "serbian": "crvena boja",
        "exampleUse": "红色的花 (crven cvet)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 85"
      },
      {
        "char": "蓝色",
        "pinyin": "lánsè",
        "vuk": "lan-se",
        "english": "blue color",
        "serbian": "plava boja",
        "exampleUse": "深蓝色 (tamnoplava)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 100"
      },
      {
        "char": "绿色",
        "pinyin": "lǜsè",
        "vuk": "li-se",
        "english": "green color",
        "serbian": "zelena boja",
        "exampleUse": "绿色的草地 (zeleni travnjak)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 95"
      },
      {
        "char": "黄色",
        "pinyin": "huángsè",
        "vuk": "huang-se",
        "english": "yellow color",
        "serbian": "žuta boja",
        "exampleUse": "亮黄色 (jarko žuto)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 105"
      },
      {
        "char": "车站",
        "pinyin": "chēzhàn",
        "vuk": "če-džan",
        "english": "bus / train station",
        "serbian": "stanica / kolodvor",
        "exampleUse": "到达车站 (stići na stanicu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "自行车",
        "pinyin": "zìxíngchē",
        "vuk": "ce-sing-če",
        "english": "bicycle / bike",
        "serbian": "bicikl",
        "exampleUse": "骑自行车 (voziti bicikl)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "穿衣服",
        "pinyin": "chuān yīfu",
        "vuk": "čuan ji-fu",
        "english": "get dressed / wear clothes",
        "serbian": "obući se",
        "exampleUse": "快穿衣服 (brzo se obuci)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 75"
      },
      {
        "char": "洗衣服",
        "pinyin": "xǐ yīfu",
        "vuk": "si ji-fu",
        "english": "wash clothes / laundry",
        "serbian": "prati veš",
        "exampleUse": "周末洗衣服 (prati veš vikendom)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 90"
      },
      {
        "char": "书店",
        "pinyin": "shūdiàn",
        "vuk": "šu-đjen",
        "english": "bookstore",
        "serbian": "knjižara",
        "exampleUse": "去书店买书 (u knjižaru)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "面包店",
        "pinyin": "miànbāodiàn",
        "vuk": "mjen-bao-đjen",
        "english": "bakery",
        "serbian": "pekara",
        "exampleUse": "新鲜面包店",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "街道",
        "pinyin": "jiēdào",
        "vuk": "đje-dao",
        "english": "street",
        "serbian": "ulica",
        "exampleUse": "干净的街道 (čista ulica)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "市场",
        "pinyin": "shìchǎng",
        "vuk": "ši-čang",
        "english": "market / marketplace",
        "serbian": "pijaca / tržište",
        "exampleUse": "去市场买菜 (na pijacu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "颜色",
        "pinyin": "yánsè",
        "vuk": "jen-se",
        "english": "color",
        "serbian": "boja",
        "exampleUse": "丰富的颜色 (bogate boje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "买卖",
        "pinyin": "mǎimai",
        "vuk": "maj-maj",
        "english": "buying and selling / trade",
        "serbian": "trgovina / kupoprodaja",
        "exampleUse": "做买卖 (baviti se trgovinom)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "方便",
        "pinyin": "fāngbiàn",
        "vuk": "fang-bjen",
        "english": "convenient / handy",
        "serbian": "zgodno / praktično",
        "exampleUse": "交通很方便 (prevoz je praktičan)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 65"
      },
      {
        "char": "繁华",
        "pinyin": "fánhuá",
        "vuk": "fan-hua",
        "english": "bustling / flourishing",
        "serbian": "živahan / prometan",
        "exampleUse": "繁华的都市 (prometna metropola)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 220"
      },
      {
        "char": "社区",
        "pinyin": "shèqū",
        "vuk": "še-ćü",
        "english": "community / neighborhood",
        "serbian": "zajednica / kvart",
        "exampleUse": "温馨的社区 (topao komšiluk)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "公共汽车",
        "pinyin": "gōnggòng qìchē",
        "vuk": "gung-gung ći-če",
        "english": "public bus",
        "serbian": "gradski autobus",
        "exampleUse": "乘坐公共汽车",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "停车",
        "pinyin": "tíngchē",
        "vuk": "ting-če",
        "english": "park a vehicle",
        "serbian": "parkirati se",
        "exampleUse": "免费停车 (besplatan parking)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "洁白",
        "pinyin": "jiébái",
        "vuk": "đje-baj",
        "english": "pure white / spotless",
        "serbian": "snežnobelo / besprekorno belo",
        "exampleUse": "洁白的雪 (čist beli sneg)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 230"
      },
      {
        "char": "黑暗",
        "pinyin": "hēi'àn",
        "vuk": "hej-an",
        "english": "darkness / dark",
        "serbian": "tama / mrak",
        "exampleUse": "冲破黑暗 (probiti tamu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "鲜艳",
        "pinyin": "xiānyàn",
        "vuk": "sjen-jen",
        "english": "vivid / colorful",
        "serbian": "jarkih boja / živopisno",
        "exampleUse": "鲜艳的色彩 (jarke boje)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 210"
      },
      {
        "char": "明亮",
        "pinyin": "míngliàng",
        "vuk": "ming-ljang",
        "english": "bright / luminous",
        "serbian": "sjajan / svetao",
        "exampleUse": "明亮的灯光 (sjajno svetlo)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 150"
      }
    ],
    "sentences": [
      {
        "id": "idm-9-1",
        "type": "chengyu",
        "typeLabel": "成语 (Moral Clarity)",
        "chinese": "黑白分明。",
        "pinyin": "Hēi bái fēn míng.",
        "vuk": "Hej baj fen ming.",
        "literalEnglish": "Black and white sharply demarcated.",
        "english": "Clear as black and white / Absolute moral clarity.",
        "serbianEquivalent": "Čist račun, duga ljubav. / Nema sivog, ili jeste ili nije.",
        "serbian": "Jasno razdvojeno crno od belog; besprekorna moralna i činjenična jasnoća gde nema laži.",
        "philosophicalContext": "Potiče iz dinastije Han. Stoička težnja ka istini: odbaci maglu izgovora i sagledaj stvari bez kompromisa.",
        "targetWords": [
          "黑",
          "白"
        ],
        "context": "Truth & Integrity • Apsolutna jasnoća",
        "tokens": [
          {
            "word": "黑白",
            "pinyin": "hēi bái",
            "english": "black and white",
            "serbian": "crno i belo",
            "isTarget": true
          },
          {
            "word": "分明",
            "pinyin": "fēn míng",
            "english": "sharply distinguished",
            "serbian": "jasno razdvojeno"
          }
        ]
      },
      {
        "id": "idm-9-2",
        "type": "proverb",
        "typeLabel": "荀子名句 (Xunzi Philosophy Classic)",
        "chinese": "青出于蓝而胜于蓝。",
        "pinyin": "Qīng chū yú lán ér shèng yú lán.",
        "vuk": "Ćing ču ji lan er šeng ji lan.",
        "literalEnglish": "Indigo blue comes from the indigo plant yet is bluer than the plant.",
        "english": "The student surpasses the master.",
        "serbianEquivalent": "Učenik je nadmašio svog učitelja.",
        "serbian": "Plava boja se dobija iz biljke indigo, a ipak je plavlja od nje same; marljiv učenik kroz trud nadmašuje svog mentora.",
        "philosophicalContext": "Iz Šuncovog učenja o obrazovanju (Quan Xue). Svaki pravi mentor želi da učenik pređe njegove domete.",
        "targetWords": [
          "蓝",
          "出"
        ],
        "context": "Growth & Succession • Učenik nadmašuje učitelja",
        "tokens": [
          {
            "word": "青",
            "pinyin": "qīng",
            "english": "cyan/blue",
            "serbian": "modra boja"
          },
          {
            "word": "出于蓝",
            "pinyin": "chū yú lán",
            "english": "comes from indigo",
            "serbian": "potiče od indiga",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "而胜于蓝",
            "pinyin": "ér shèng yú lán",
            "english": "yet surpasses it",
            "serbian": "a nadmašuje ga",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-9-3",
        "type": "chengyu",
        "typeLabel": "成语 (Auspicious Energy)",
        "chinese": "红红火火。",
        "pinyin": "Hóng hóng huǒ huǒ.",
        "vuk": "Hung hung huo huo.",
        "literalEnglish": "Red and fiery ablaze with life.",
        "english": "Flourishing and prosperous / Thriving with vitality.",
        "serbianEquivalent": "Ide kao po loju. / Cvetaju ruže.",
        "serbian": "Crveno i plamteće; život, posao i zdravlje puni blagostanja, radosti i pozitivne životne energije.",
        "philosophicalContext": "Klasični izraz kineske vitalnosti: unutrašnja vatra i energija pretvaraju se u vidljivi napredak u svakodnevnom životu.",
        "targetWords": [
          "红",
          "火"
        ],
        "context": "Vitality & Prosperity • Životna snaga",
        "tokens": [
          {
            "word": "红红",
            "pinyin": "hóng hóng",
            "english": "deep red",
            "serbian": "rumeno/crveno",
            "isTarget": true
          },
          {
            "word": "火火",
            "pinyin": "huǒ huǒ",
            "english": "fiery prosperous",
            "serbian": "plamteće",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c1-r10",
    "chartId": 1,
    "rowNumber": 10,
    "title": "Philosophy & Vitality",
    "titleSerbian": "Filozofija, Život i Unutrašnje Stanje",
    "emoji": "🧘",
    "chartImage": "/assets/aistudio/image_1536d14f.png",
    "description": "Foundational existential concepts, heart-mind essence, love, happiness, mortality, vitality, and health.",
    "words": [
      {
        "char": "是",
        "pinyin": "shì",
        "vuk": "ši",
        "english": "be / is / true",
        "serbian": "biti / jeste / tačno",
        "exampleUse": "是的 (jeste)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 3"
      },
      {
        "char": "心",
        "pinyin": "xīn",
        "vuk": "sin",
        "english": "heart / mind",
        "serbian": "srce / um / duša",
        "exampleUse": "心情 (raspoloženje)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 25"
      },
      {
        "char": "好",
        "pinyin": "hǎo",
        "vuk": "hao",
        "english": "good / well",
        "serbian": "dobro / sjajno",
        "exampleUse": "很好 (veoma dobro)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 10"
      },
      {
        "char": "爱",
        "pinyin": "ài",
        "vuk": "aj",
        "english": "love / affection",
        "serbian": "ljubav / voleti",
        "exampleUse": "爱心 (ljubav / saosećanje)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 45"
      },
      {
        "char": "喜",
        "pinyin": "xǐ",
        "vuk": "si",
        "english": "joy / delight",
        "serbian": "radost / veselje",
        "exampleUse": "喜欢 (voleti / sviđati se)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 50"
      },
      {
        "char": "幸",
        "pinyin": "xìng",
        "vuk": "sing",
        "english": "fortune / luck",
        "serbian": "sreća / blagoslov",
        "exampleUse": "幸福 (sreća / blagostanje)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "生",
        "pinyin": "shēng",
        "vuk": "šeng",
        "english": "birth / life / grow",
        "serbian": "rođenje / život / roditi se",
        "exampleUse": "生活 (život)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 15"
      },
      {
        "char": "死",
        "pinyin": "sǐ",
        "vuk": "se",
        "english": "death / die",
        "serbian": "smrt / umreti",
        "exampleUse": "生死 (život i smrt)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "力",
        "pinyin": "lì",
        "vuk": "li",
        "english": "strength / power",
        "serbian": "snaga / moć / sila",
        "exampleUse": "力量 (snaga)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 55"
      },
      {
        "char": "病",
        "pinyin": "bìng",
        "vuk": "bing",
        "english": "illness / disease",
        "serbian": "bolest / biti bolestan",
        "exampleUse": "生病 (razboleti se)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 70"
      },
      {
        "char": "但是",
        "pinyin": "dànshì",
        "vuk": "dan-ši",
        "english": "but / however",
        "serbian": "ali / međutim",
        "exampleUse": "但是很有用 (ali je korisno)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 20"
      },
      {
        "char": "还是",
        "pinyin": "háishi",
        "vuk": "haj-ši",
        "english": "still / or",
        "serbian": "ipak / ili",
        "exampleUse": "还是去吧 (ipak idi)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 35"
      },
      {
        "char": "心情",
        "pinyin": "xīnqíng",
        "vuk": "sin-ćing",
        "english": "mood / frame of mind",
        "serbian": "raspoloženje / stanje uma",
        "exampleUse": "心情很好 (odlično raspoloženje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "心理",
        "pinyin": "xīnlǐ",
        "vuk": "sin-li",
        "english": "psychology / mental",
        "serbian": "psiha / mentalno stanje",
        "exampleUse": "心理健康 (mentalno zdravlje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "好看",
        "pinyin": "hǎokàn",
        "vuk": "hao-kan",
        "english": "good-looking / attractive",
        "serbian": "lepo za gledanje",
        "exampleUse": "这件衣服很好看",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 65"
      },
      {
        "char": "好吃",
        "pinyin": "hǎochī",
        "vuk": "hao-č",
        "english": "delicious / tasty",
        "serbian": "ukusno",
        "exampleUse": "味道真好吃 (stvarno je ukusno)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 60"
      },
      {
        "char": "喜欢",
        "pinyin": "xǐhuan",
        "vuk": "si-huan",
        "english": "like / be fond of",
        "serbian": "sviđati se / voleti",
        "exampleUse": "我喜欢你 (sviđaš mi se)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 30"
      },
      {
        "char": "幸福",
        "pinyin": "xìngfú",
        "vuk": "sing-fu",
        "english": "happiness / well-being",
        "serbian": "sreća / blagostanje",
        "exampleUse": "幸福的生活 (srećan život)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "幸运",
        "pinyin": "xìngyùn",
        "vuk": "sing-jin",
        "english": "lucky / fortunate",
        "serbian": "srećan / srećna okolnost",
        "exampleUse": "非常幸运 (veoma srećan splet okolnosti)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 95"
      },
      {
        "char": "生活",
        "pinyin": "shēnghuó",
        "vuk": "šeng-huo",
        "english": "life / live",
        "serbian": "život / živeti",
        "exampleUse": "热爱生活 (voleti život)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 35"
      },
      {
        "char": "生命",
        "pinyin": "shēngmìng",
        "vuk": "šeng-ming",
        "english": "life existence",
        "serbian": "život / živo biće",
        "exampleUse": "珍惜生命 (ceniti život)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "力量",
        "pinyin": "lìliang",
        "vuk": "li-ljang",
        "english": "strength / power",
        "serbian": "snaga / moć",
        "exampleUse": "充满力量 (pun snage)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "努力",
        "pinyin": "nǔlì",
        "vuk": "nu-li",
        "english": "hardworking / strive",
        "serbian": "truditi se / marljivost",
        "exampleUse": "努力练习 (vredno vežbati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 45"
      },
      {
        "char": "生病",
        "pinyin": "shēngbìng",
        "vuk": "šeng-bing",
        "english": "fall ill / get sick",
        "serbian": "razboleti se",
        "exampleUse": "小心生病 (pazi da se ne razboliš)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 80"
      },
      {
        "char": "病人",
        "pinyin": "bìngrén",
        "vuk": "bing-žen",
        "english": "patient / sick person",
        "serbian": "pacijent / bolesnik",
        "exampleUse": "看望病人 (posetiti bolesnika)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "医院",
        "pinyin": "yīyuàn",
        "vuk": "ji-jüan",
        "english": "hospital",
        "serbian": "bolnica",
        "exampleUse": "去医院检查 (ići na pregled u bolnicu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "决心",
        "pinyin": "juéxīn",
        "vuk": "đjüe-sin",
        "english": "determination / resolve",
        "serbian": "odlučnost / rešenost",
        "exampleUse": "下定决心 (doneti čvrstu odluku)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "爱心",
        "pinyin": "àixīn",
        "vuk": "aj-sin",
        "english": "compassion / caring heart",
        "serbian": "saosećajno srce",
        "exampleUse": "奉献爱心 (pokloniti pažnju i ljubav)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 145"
      },
      {
        "char": "乐观",
        "pinyin": "lèguān",
        "vuk": "le-guan",
        "english": "optimistic / hopeful",
        "serbian": "optimističan",
        "exampleUse": "保持乐观态度 (ostati optimističan)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 160"
      },
      {
        "char": "勇敢",
        "pinyin": "yǒnggǎn",
        "vuk": "jung-gan",
        "english": "brave / courageous",
        "serbian": "hrabar / odvažan",
        "exampleUse": "勇敢面对 (hrabro se suočiti)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 130"
      },
      {
        "char": "克服",
        "pinyin": "kèfú",
        "vuk": "ke-fu",
        "english": "overcome / conquer",
        "serbian": "prevazići / savladati",
        "exampleUse": "克服困难 (savladati prepreku)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 140"
      },
      {
        "char": "平衡",
        "pinyin": "pínghéng",
        "vuk": "ping-heng",
        "english": "balance / equilibrium",
        "serbian": "ravnoteža / balans",
        "exampleUse": "保持身心平衡 (održati balans tela i uma)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "坚韧",
        "pinyin": "jiānrèn",
        "vuk": "đjen-žen",
        "english": "resilient / tenacious",
        "serbian": "žilav / nepokolebljiv",
        "exampleUse": "坚韧不拔 (nepokolebljiva istrajnost)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 210"
      },
      {
        "char": "专注",
        "pinyin": "zhuānzhù",
        "vuk": "džuan-džu",
        "english": "focused / absorbed",
        "serbian": "fokusiran / posvećen",
        "exampleUse": "保持高度专注 (ostati fokusiran)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 145"
      },
      {
        "char": "恢复",
        "pinyin": "huìfù",
        "vuk": "huej-fu",
        "english": "recover / regain",
        "serbian": "oporaviti se / povratiti snagu",
        "exampleUse": "身体快速恢复 (brz oporavak tela)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 135"
      },
      {
        "char": "治愈",
        "pinyin": "zhìyù",
        "vuk": "dž-ji",
        "english": "cure / heal",
        "serbian": "izlečiti / isceljenje",
        "exampleUse": "治愈身心 (isceliti telo i um)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 220"
      },
      {
        "char": "自信",
        "pinyin": "zìxìn",
        "vuk": "ce-sin",
        "english": "self-confidence",
        "serbian": "samopouzdanje",
        "exampleUse": "充满自信 (pun samopouzdanja)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "平静",
        "pinyin": "píngjìng",
        "vuk": "ping-đjing",
        "english": "calm / serene",
        "serbian": "smiren / spokojan",
        "exampleUse": "内心平静 (unutrašnji mir)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 130"
      },
      {
        "char": "活力",
        "pinyin": "huólì",
        "vuk": "huo-li",
        "english": "vitality / energy",
        "serbian": "vitalnost / životna snaga",
        "exampleUse": "充满青春活力 (pun vitalnosti)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 155"
      },
      {
        "char": "心态",
        "pinyin": "xīntài",
        "vuk": "sin-taj",
        "english": "mindset / mentality",
        "serbian": "mentalitet / stanje svesti",
        "exampleUse": "良好的心态 (zdrav sklop uma)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "生死",
        "pinyin": "shēngsǐ",
        "vuk": "šeng-se",
        "english": "life and death",
        "serbian": "život i smrt",
        "exampleUse": "看透生死 (sagledati život i smrt bez straha)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "感恩",
        "pinyin": "gǎn'ēn",
        "vuk": "gan-en",
        "english": "gratitude / thankful",
        "serbian": "zahvalnost / biti zahvalan",
        "exampleUse": "常怀感恩之心 (uvek gajiti zahvalnost)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 160"
      }
    ],
    "sentences": [
      {
        "id": "idm-10-1",
        "type": "proverb",
        "typeLabel": "易经名言 (I Ching Ancient Classic)",
        "chinese": "天行健，君子以自强不息。",
        "pinyin": "Tiān xíng jiàn, jūnzǐ yǐ zì qiáng bù xī.",
        "vuk": "Tjen sing đjen, đjün-ce ji ce ćjang bu si.",
        "literalEnglish": "As heavens move with vigorous constancy, the noble person tirelessly strengthens oneself.",
        "english": "As heaven maintains vigor through movement, a noble person ever strives for self-perfection.",
        "serbianEquivalent": "Pregalaštvo pobeđuje sve. / Čovek je kovač svoje sreće.",
        "serbian": "Kao što se nebo i kosmos večno i neumorno kreću u savršenom ritmu, tako i mudar čovek neprekidno jača svoje telo i duh bez posustajanja.",
        "philosophicalContext": "Vrhunski moto I Chinga i kineske stoičke filozofije. Prava snaga nije slučajnost, već svakodnevno i neumorno samounapređenje.",
        "targetWords": [
          "力",
          "生",
          "自"
        ],
        "context": "Relentless Self-Discipline • Neprekidno jačanje",
        "tokens": [
          {
            "word": "天行健",
            "pinyin": "tiān xíng jiàn",
            "english": "heavens move vigorous",
            "serbian": "nebo se kreće snažno"
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "君子",
            "pinyin": "jūnzǐ",
            "english": "noble person",
            "serbian": "plemenit čovek"
          },
          {
            "word": "以自强不息",
            "pinyin": "yǐ zì qiáng bù xī",
            "english": "strengthens oneself ceaselessly",
            "serbian": "neumorno jača sebe",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-10-2",
        "type": "chengyu",
        "typeLabel": "成语 (Total Devotion)",
        "chinese": "尽心尽力。",
        "pinyin": "Jìn xīn jìn lì.",
        "vuk": "Đjin sin đjin li.",
        "literalEnglish": "Exhausting the heart, exhausting all physical strength.",
        "english": "Put heart and soul into it / Give one's absolute best.",
        "serbianEquivalent": "Dati sve od sebe. / Izgarati svim srcem i svom snagom.",
        "serbian": "Uložiti celo svoje srce i svu svoju fizičku i mentalnu snagu; posvetiti se cilju bez ostatka.",
        "philosophicalContext": "Konfučijanski i stoički imperativ: niko ne kontroliše sve ishode, ali svako ima stopostotnu kontrolu nad nivoom truda koji ulaže.",
        "targetWords": [
          "心",
          "力"
        ],
        "context": "Wholehearted Effort • Davanje celog sebe",
        "tokens": [
          {
            "word": "尽心",
            "pinyin": "jìn xīn",
            "english": "with all heart",
            "serbian": "svim srcem",
            "isTarget": true
          },
          {
            "word": "尽力",
            "pinyin": "jìn lì",
            "english": "with all strength",
            "serbian": "svom snagom",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-10-3",
        "type": "chengyu",
        "typeLabel": "成语 (Cosmic Cycle & Hope)",
        "chinese": "否极泰来。",
        "pinyin": "Pǐ jí tài lái.",
        "vuk": "Pi đji taj laj.",
        "literalEnglish": "When misfortune reaches the extreme, peaceful fortune arrives.",
        "english": "Out of extreme adversity comes boundless blessing / Light at the end of the tunnel.",
        "serbianEquivalent": "Najgušći je mrak pred svitanje. / Svaka oluja ima svoj kraj.",
        "serbian": "Kada nevolja dosegne svoj vrhunac, po zakonima prirode nastupa preokret ka miru, zdravlju i svetlosti.",
        "philosophicalContext": "Iz heksagrama I Chinga (Pi i Tai). Podseća sportistu i mislioca u teškom trenutku: telo i život funkcionišu u ciklusima. Ne gubi nadu.",
        "targetWords": [
          "生",
          "来",
          "幸"
        ],
        "context": "Hope & Rebirth • Svetlost nakon tame",
        "tokens": [
          {
            "word": "否极",
            "pinyin": "pǐ jí",
            "english": "misfortune peaks",
            "serbian": "nevolja dostiže vrh"
          },
          {
            "word": "泰来",
            "pinyin": "tài lái",
            "english": "peace arrives",
            "serbian": "mir stiže",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r1",
    "chartId": 2,
    "rowNumber": 1,
    "title": "Flora & Waterways",
    "titleSerbian": "Vegetacija, Botanika i Vodotokovi",
    "emoji": "🌿",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "Forest canopies, botanical growth, roots, fresh foliage, secret caves, tranquil lakes, and babbling brooks.",
    "words": [
      {
        "char": "森",
        "pinyin": "sēn",
        "vuk": "sen",
        "english": "dense forest",
        "serbian": "gusta šuma",
        "exampleUse": "森林 (šuma)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "林",
        "pinyin": "lín",
        "vuk": "lin",
        "english": "woods / grove",
        "serbian": "šumarak / gaj",
        "exampleUse": "树林 (šumarak)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "草",
        "pinyin": "cǎo",
        "vuk": "cao",
        "english": "grass / herb",
        "serbian": "trava / lekovito bilje",
        "exampleUse": "草地 (travnjak)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "根",
        "pinyin": "gēn",
        "vuk": "gen",
        "english": "root / origin",
        "serbian": "koren / temelj",
        "exampleUse": "根本 (suština / koren)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "芽",
        "pinyin": "yá",
        "vuk": "ja",
        "english": "sprout / bud",
        "serbian": "klica / pupoljak",
        "exampleUse": "发芽 (proklijati)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "枝",
        "pinyin": "zhī",
        "vuk": "dž",
        "english": "branch / twig",
        "serbian": "grana / grančica",
        "exampleUse": "树枝 (grana drveta)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "叶",
        "pinyin": "yè",
        "vuk": "je",
        "english": "leaf / foliage",
        "serbian": "list / lišće",
        "exampleUse": "树叶 (lišće)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "洞",
        "pinyin": "dòng",
        "vuk": "dung",
        "english": "cave / hole",
        "serbian": "pećina / rupa",
        "exampleUse": "山洞 (pećina)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "湖",
        "pinyin": "hú",
        "vuk": "hu",
        "english": "lake",
        "serbian": "jezero",
        "exampleUse": "湖水 (jezerska voda)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "溪",
        "pinyin": "xī",
        "vuk": "si",
        "english": "stream / brook",
        "serbian": "potok / potočić",
        "exampleUse": "小溪 (potočić)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "森林",
        "pinyin": "sēnlín",
        "vuk": "sen-lin",
        "english": "forest / woodlands",
        "serbian": "šuma",
        "exampleUse": "漫步在森林里 (šetati šumom)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "草地",
        "pinyin": "cǎodì",
        "vuk": "cao-di",
        "english": "grassland / lawn",
        "serbian": "travnjak / poljana",
        "exampleUse": "坐在绿色的草地上",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "根本",
        "pinyin": "gēnběn",
        "vuk": "gen-ben",
        "english": "fundamental / essential",
        "serbian": "temelj / suštinski",
        "exampleUse": "根本原因 (suštinski uzrok)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 85"
      },
      {
        "char": "树枝",
        "pinyin": "shùzhī",
        "vuk": "šu-dž",
        "english": "tree branches",
        "serbian": "grane drveta",
        "exampleUse": "鸟儿站在树枝上",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "树叶",
        "pinyin": "shùyè",
        "vuk": "šu-je",
        "english": "leaves / foliage",
        "serbian": "lišće sa drveta",
        "exampleUse": "秋天的金色树叶",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 145"
      },
      {
        "char": "山洞",
        "pinyin": "shāndòng",
        "vuk": "šan-dung",
        "english": "mountain cave",
        "serbian": "planinska pećina",
        "exampleUse": "神秘的山洞 (tajanstvena pećina)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "湖泊",
        "pinyin": "húpō",
        "vuk": "hu-po",
        "english": "lakes",
        "serbian": "jezera",
        "exampleUse": "平静的湖泊 (mirna jezera)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "小溪",
        "pinyin": "xiǎoxī",
        "vuk": "sjao-si",
        "english": "babbling brook",
        "serbian": "žuborni potočić",
        "exampleUse": "清澈的小溪 (bistar potok)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 200"
      },
      {
        "char": "植物",
        "pinyin": "zhíwù",
        "vuk": "dž-vu",
        "english": "plant / flora",
        "serbian": "biljka / vegetacija",
        "exampleUse": "绿色植物 (zelene biljke)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "树木",
        "pinyin": "shùmù",
        "vuk": "šu-mu",
        "english": "trees / lumber",
        "serbian": "drveće",
        "exampleUse": "保护茂密的树木",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "绿化",
        "pinyin": "lǜhuà",
        "vuk": "li-hua",
        "english": "greenery / environmental planting",
        "serbian": "pošumljavanje / ozelenjavanje",
        "exampleUse": "城市绿化 (ozelenjavanje grada)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 240"
      },
      {
        "char": "根源",
        "pinyin": "gēnyuán",
        "vuk": "gen-jüan",
        "english": "root source / origin",
        "serbian": "korenski izvor / poreklo",
        "exampleUse": "找到问题根源",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "发芽",
        "pinyin": "fāyá",
        "vuk": "fa-ja",
        "english": "sprout / germinate",
        "serbian": "proklijati / ozeleneti",
        "exampleUse": "种子发芽 (seme klija)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 250"
      },
      {
        "char": "生长",
        "pinyin": "shēngzhǎng",
        "vuk": "šeng-džang",
        "english": "grow / develop",
        "serbian": "rasti / razvijati se",
        "exampleUse": "健康生长 (zdrav rast)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 120"
      },
      {
        "char": "清澈",
        "pinyin": "qīngchè",
        "vuk": "ćing-če",
        "english": "clear / limpid",
        "serbian": "bistro / prozirno",
        "exampleUse": "溪水清澈见底",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 210"
      },
      {
        "char": "湿润",
        "pinyin": "shīrùn",
        "vuk": "ši-žun",
        "english": "moist / humid",
        "serbian": "vlažno / sveže",
        "exampleUse": "湿润的空气 (vlažan vazduh)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 230"
      },
      {
        "char": "泥土",
        "pinyin": "nítǔ",
        "vuk": "ni-tu",
        "english": "soil / earth",
        "serbian": "blato / zemlja / glina",
        "exampleUse": "肥沃的泥土 (plodno tlo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "繁茂",
        "pinyin": "fánmào",
        "vuk": "fan-mao",
        "english": "lush / luxuriant",
        "serbian": "bujan / raskošan",
        "exampleUse": "枝叶繁茂 (bujno granje)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 280"
      },
      {
        "char": "花瓣",
        "pinyin": "huābàn",
        "vuk": "hua-ban",
        "english": "flower petals",
        "serbian": "latice cveta",
        "exampleUse": "飘落的花瓣 (lepršave latice)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 250"
      },
      {
        "char": "灌木",
        "pinyin": "guànmù",
        "vuk": "guan-mu",
        "english": "shrub / bush",
        "serbian": "žbun / grmlje",
        "exampleUse": "路边的灌木 (žbunje kraj puta)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 310"
      },
      {
        "char": "探索",
        "pinyin": "tànsuǒ",
        "vuk": "tan-suo",
        "english": "explore / search",
        "serbian": "istraživati / istraživanje",
        "exampleUse": "探索大自然 (istraživati prirodu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 150"
      },
      {
        "char": "荒野",
        "pinyin": "huāngyě",
        "vuk": "huang-je",
        "english": "wilderness / wild",
        "serbian": "divljina / netaknuta priroda",
        "exampleUse": "走进荒野 (ući u divljinu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 270"
      },
      {
        "char": "氧气",
        "pinyin": "yǎngqì",
        "vuk": "jang-ći",
        "english": "oxygen",
        "serbian": "kiseonik",
        "exampleUse": "吸入新鲜氧气",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 200"
      },
      {
        "char": "呼吸",
        "pinyin": "hūxī",
        "vuk": "hu-si",
        "english": "breathe / respiration",
        "serbian": "disati / disanje",
        "exampleUse": "深呼吸 (udahnuti duboko)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "宁静",
        "pinyin": "níngjìng",
        "vuk": "ning-đjing",
        "english": "tranquil / serene",
        "serbian": "spokoj / mirnoća",
        "exampleUse": "享受大自然的宁静",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 180"
      },
      {
        "char": "生机",
        "pinyin": "shēngjī",
        "vuk": "šeng-đji",
        "english": "vitality / vigor of life",
        "serbian": "životna energija prirode",
        "exampleUse": "充满生机 (puno života)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "壮丽",
        "pinyin": "zhuànglì",
        "vuk": "džuang-li",
        "english": "magnificent / majestic",
        "serbian": "veličanstven / grandiozan",
        "exampleUse": "壮丽的自然风光",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 240"
      },
      {
        "char": "树干",
        "pinyin": "shùgàn",
        "vuk": "šu-gan",
        "english": "tree trunk",
        "serbian": "stablo drveta",
        "exampleUse": "粗壮的树干 (debelo stablo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 260"
      },
      {
        "char": "常青",
        "pinyin": "chángqīng",
        "vuk": "čang-ćing",
        "english": "evergreen",
        "serbian": "zimzelen / večan",
        "exampleUse": "四季常青 (večno zeleno)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 320"
      },
      {
        "char": "露水",
        "pinyin": "lùshuǐ",
        "vuk": "lu-šuej",
        "english": "dew / morning dew",
        "serbian": "jutarnja rosa",
        "exampleUse": "晶莹的露水 (biserne kapi rose)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 290"
      },
      {
        "char": "芬芳",
        "pinyin": "fēnfāng",
        "vuk": "fen-fang",
        "english": "fragrant / aroma",
        "serbian": "mirisno / aromatično",
        "exampleUse": "泥土的芬芳 (miris sveže zemlje)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 330"
      },
      {
        "char": "源泉",
        "pinyin": "yuánquán",
        "vuk": "jüan-ćüan",
        "english": "spring / fountainhead",
        "serbian": "izvor / vrelo",
        "exampleUse": "力量的源泉 (izvor snage)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 270"
      }
    ],
    "sentences": [
      {
        "id": "idm-11-1",
        "type": "proverb",
        "typeLabel": "古训名言 (Educational Cultivation Classic)",
        "chinese": "十年树木，百年树人。",
        "pinyin": "Shí nián shù mù, bǎi nián shù rén.",
        "vuk": "Ši njen šu mu, baj njen šu žen.",
        "literalEnglish": "Ten years to cultivate a tree, a hundred years to cultivate a noble human.",
        "english": "It takes ten years to grow trees, but a hundred to rear noble people.",
        "serbianEquivalent": "Dobar odgoj je najveće nasleđe. / Za pravo stablo trebaju decenije, a za čoveka ceo vek.",
        "serbian": "Potrebno je deset godina da stablo poraste, a čitav vek da se obrazuje, vaspita i izgradi pravi čovek od integriteta.",
        "philosophicalContext": "Iz Guanzi spisa (7. vek pre n.e.). Podseća nas na strpljenje i dugoročnost: prave navike uma i tela zahtevaju decenije doslednog rada.",
        "targetWords": [
          "十",
          "百",
          "木",
          "人"
        ],
        "context": "Long-Term Cultivation • Strpljiva izgradnja",
        "tokens": [
          {
            "word": "十年",
            "pinyin": "shí nián",
            "english": "10 years",
            "serbian": "deset godina"
          },
          {
            "word": "树木",
            "pinyin": "shù mù",
            "english": "grow trees",
            "serbian": "gajiti drveće",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "百年",
            "pinyin": "bǎi nián",
            "english": "100 years",
            "serbian": "sto godina"
          },
          {
            "word": "树人",
            "pinyin": "shù rén",
            "english": "nurture people",
            "serbian": "vaspitati čoveka",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-11-2",
        "type": "chengyu",
        "typeLabel": "成语 (Returning to Roots)",
        "chinese": "落叶归根。",
        "pinyin": "Luò yè guī gēn.",
        "vuk": "Luo je guej gen.",
        "literalEnglish": "Falling leaves always return to their own root.",
        "english": "Falling leaves return to the roots / Everything comes full circle to its source.",
        "serbianEquivalent": "Svaka ptica svome jatu leti. / Krv nije voda.",
        "serbian": "Opadlo lišće uvek se vraća svom korenu; čovek se u zrelosti vraća svojim počecima, suštini i istini.",
        "philosophicalContext": "Drevni taoistički uvid o cikličnosti prirode. Bez obzira koliko daleko grane dosegnu, koren ostaje temelj opstanka i hranjenja.",
        "targetWords": [
          "叶",
          "根"
        ],
        "context": "Origin & Heritage • Povratak korenima",
        "tokens": [
          {
            "word": "落叶",
            "pinyin": "luò yè",
            "english": "falling leaves",
            "serbian": "opalo lišće",
            "isTarget": true
          },
          {
            "word": "归根",
            "pinyin": "guī gēn",
            "english": "return to root",
            "serbian": "vraća se korenu",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-11-3",
        "type": "chengyu",
        "typeLabel": "成语 (Gratitude for the Source)",
        "chinese": "饮水思源。",
        "pinyin": "Yǐn shuǐ sī yuán.",
        "vuk": "Jin šuej s jüan.",
        "literalEnglish": "When drinking water, always think of the source spring.",
        "english": "When you drink water, remember the source / Never forget who helped you.",
        "serbianEquivalent": "Ne zaboravi ko ti je pružio ruku kad je bilo teško. / Pamti pa vrati dobro.",
        "serbian": "Kada piješ bistru vodu, seti se izvora koji te napaja; nikada ne zaboravi one koji su ti pomogli na početku puta.",
        "philosophicalContext": "Iz stiha Yu Xina (dinastija Zhou). Ključna stoička vrlina zahvalnosti: skromnost se gradi sećanjem na koren svog uspeha.",
        "targetWords": [
          "水",
          "溪"
        ],
        "context": "Gratitude & Integrity • Zahvalnost izvoru",
        "tokens": [
          {
            "word": "饮水",
            "pinyin": "yǐn shuǐ",
            "english": "drink water",
            "serbian": "piti vodu",
            "isTarget": true
          },
          {
            "word": "思源",
            "pinyin": "sī yuán",
            "english": "think of source",
            "serbian": "misliti na izvor"
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r2",
    "chartId": 2,
    "rowNumber": 2,
    "title": "Time & Chronology",
    "titleSerbian": "Vreme, Hronologija i Godišnja Doba",
    "emoji": "⏳",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "The flow of temporal reality, days, months, solar cycles, morning dawn, dusk, and seasonal transitions.",
    "words": [
      {
        "char": "今",
        "pinyin": "jīn",
        "vuk": "đjin",
        "english": "now / today",
        "serbian": "sada / danas",
        "exampleUse": "今天 (danas)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 35"
      },
      {
        "char": "昨",
        "pinyin": "zuó",
        "vuk": "zuo",
        "english": "yesterday / past",
        "serbian": "juče / prošlo",
        "exampleUse": "昨天 (juče)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 65"
      },
      {
        "char": "明",
        "pinyin": "míng",
        "vuk": "ming",
        "english": "bright / tomorrow",
        "serbian": "svetlo / sutra",
        "exampleUse": "明天 (sutra)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 30"
      },
      {
        "char": "周",
        "pinyin": "zhōu",
        "vuk": "džou",
        "english": "week / cycle",
        "serbian": "nedelja / ciklus",
        "exampleUse": "周末 (vikend)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 50"
      },
      {
        "char": "月",
        "pinyin": "yuè",
        "vuk": "jüe",
        "english": "month / moon",
        "serbian": "mesec",
        "exampleUse": "下个月 (sledećeg meseca)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 25"
      },
      {
        "char": "年",
        "pinyin": "nián",
        "vuk": "njen",
        "english": "year",
        "serbian": "godina",
        "exampleUse": "今年 (ove godine)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 20"
      },
      {
        "char": "晨",
        "pinyin": "chén",
        "vuk": "čen",
        "english": "morning / dawn",
        "serbian": "jutro / praskozorje",
        "exampleUse": "早晨 (rano jutro)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "昏",
        "pinyin": "hūn",
        "vuk": "hun",
        "english": "dusk / twilight",
        "serbian": "sumrak / suton",
        "exampleUse": "黄昏 (sumrak)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "刻",
        "pinyin": "kè",
        "vuk": "ke",
        "english": "quarter hour / moment",
        "serbian": "petnaest minuta / trenutak",
        "exampleUse": "立刻 (odmah / ovog trena)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "季",
        "pinyin": "jì",
        "vuk": "đji",
        "english": "season / quarter",
        "serbian": "godišnje doba / kvartal",
        "exampleUse": "季节 (godišnje doba)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "今天",
        "pinyin": "jīntiān",
        "vuk": "đjin-tjen",
        "english": "today",
        "serbian": "danas",
        "exampleUse": "今天很充实 (danas je ispunjen dan)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 20"
      },
      {
        "char": "昨天",
        "pinyin": "zuótiān",
        "vuk": "zuo-tjen",
        "english": "yesterday",
        "serbian": "juče",
        "exampleUse": "昨天完成的工作",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 45"
      },
      {
        "char": "明天",
        "pinyin": "míngtiān",
        "vuk": "ming-tjen",
        "english": "tomorrow",
        "serbian": "sutra",
        "exampleUse": "期待明天 (radujem se sutrašnjem danu)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 35"
      },
      {
        "char": "星期",
        "pinyin": "xīngqī",
        "vuk": "sing-ći",
        "english": "week / day of week",
        "serbian": "sedmica / dan u sedmici",
        "exampleUse": "星期一 (ponedeljak)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "周末",
        "pinyin": "zhōumò",
        "vuk": "džou-mo",
        "english": "weekend",
        "serbian": "vikend",
        "exampleUse": "祝你周末愉快 (prijatan vikend)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "月份",
        "pinyin": "yuèfèn",
        "vuk": "jüe-fen",
        "english": "month of year",
        "serbian": "mesec u godini",
        "exampleUse": "每年的五月份",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "年龄",
        "pinyin": "niánlíng",
        "vuk": "njen-ling",
        "english": "age",
        "serbian": "starost / godine",
        "exampleUse": "不分年龄 (bez obzira na godine)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "今年",
        "pinyin": "jīnnián",
        "vuk": "đjin-njen",
        "english": "this year",
        "serbian": "ove godine",
        "exampleUse": "今年设定的目标",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 50"
      },
      {
        "char": "明年",
        "pinyin": "míngnián",
        "vuk": "ming-njen",
        "english": "next year",
        "serbian": "sledeće godine",
        "exampleUse": "明年计划 (plan za iduću godinu)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 65"
      },
      {
        "char": "去年",
        "pinyin": "qùnián",
        "vuk": "ćü-njen",
        "english": "last year",
        "serbian": "prošle godine",
        "exampleUse": "去年的经验 (prošlogodišnje iskustvo)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 60"
      },
      {
        "char": "早晨",
        "pinyin": "zǎochén",
        "vuk": "zao-čen",
        "english": "early morning",
        "serbian": "rano jutro",
        "exampleUse": "早晨起床 (ustati rano ujutru)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "黄昏",
        "pinyin": "huánghūn",
        "vuk": "huang-hun",
        "english": "dusk / twilight",
        "serbian": "sumrak / predvečerje",
        "exampleUse": "黄昏的晚霞 (zalazak sunca)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "立刻",
        "pinyin": "lìkè",
        "vuk": "li-ke",
        "english": "immediately / at once",
        "serbian": "smesta / ovog trena",
        "exampleUse": "立刻行动 (odmah delovati)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 85"
      },
      {
        "char": "季节",
        "pinyin": "jìjié",
        "vuk": "đji-đje",
        "english": "season",
        "serbian": "godišnje doba",
        "exampleUse": "美丽的季节 (lepo godišnje doba)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "春天",
        "pinyin": "chūntiān",
        "vuk": "čun-tjen",
        "english": "spring season",
        "serbian": "proleće",
        "exampleUse": "万物复苏的春天",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "夏天",
        "pinyin": "xiàtiān",
        "vuk": "sja-tjen",
        "english": "summer season",
        "serbian": "leto",
        "exampleUse": "热烈的夏天 (toplo leto)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "秋天",
        "pinyin": "qiūtiān",
        "vuk": "ćju-tjen",
        "english": "autumn / fall",
        "serbian": "jesen",
        "exampleUse": "金黄的秋天 (zlatna jesen)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "冬天",
        "pinyin": "dōngtiān",
        "vuk": "dung-tjen",
        "english": "winter season",
        "serbian": "zima",
        "exampleUse": "下雪的冬天 (snežna zima)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "时间",
        "pinyin": "shíjiān",
        "vuk": "ši-đjen",
        "english": "time",
        "serbian": "vreme / čas",
        "exampleUse": "宝贵的时间 (dragoceno vreme)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 30"
      },
      {
        "char": "过去",
        "pinyin": "guòqù",
        "vuk": "guo-ćü",
        "english": "past / pass by",
        "serbian": "prošlost / proći",
        "exampleUse": "放下过去 (pustiti prošlost)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "未来",
        "pinyin": "wèilái",
        "vuk": "vej-laj",
        "english": "future",
        "serbian": "budućnost",
        "exampleUse": "创造未来 (stvarati budućnost)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 70"
      },
      {
        "char": "现在",
        "pinyin": "xiànzài",
        "vuk": "sjen-zaj",
        "english": "now / present",
        "serbian": "sada / sadašnjost",
        "exampleUse": "专注现在 (fokus na sadašnji trenutak)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 25"
      },
      {
        "char": "迟到",
        "pinyin": "chídào",
        "vuk": "č-dao",
        "english": "be late / arrive late",
        "serbian": "zakasniti",
        "exampleUse": "上学别迟到 (nemoj kasniti u školu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "准时",
        "pinyin": "zhǔnshí",
        "vuk": "džun-ši",
        "english": "on time / punctual",
        "serbian": "tačan / na vreme",
        "exampleUse": "准时到达 (stići tačno na vreme)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 135"
      },
      {
        "char": "以前",
        "pinyin": "yǐqián",
        "vuk": "ji-ćjen",
        "english": "before / previously",
        "serbian": "pre / ranije",
        "exampleUse": "以前不知道 (ranije nisam znao)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 55"
      },
      {
        "char": "以后",
        "pinyin": "yǐhòu",
        "vuk": "ji-hou",
        "english": "afterwards / in future",
        "serbian": "nakon toga / u budućnosti",
        "exampleUse": "从今以后 (od sada pa nadalje)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 50"
      },
      {
        "char": "永远",
        "pinyin": "yǒngyuǎn",
        "vuk": "jung-jüan",
        "english": "forever / eternal",
        "serbian": "zauvek / večno",
        "exampleUse": "永远保持热情 (zauvek zadržati strast)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 85"
      },
      {
        "char": "瞬间",
        "pinyin": "shùnjiān",
        "vuk": "šun-đjen",
        "english": "moment / split second",
        "serbian": "trenutak / tren oka",
        "exampleUse": "美妙的瞬间 (divan trenutak)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "阶段",
        "pinyin": "jiēduàn",
        "vuk": "đje-duan",
        "english": "stage / phase",
        "serbian": "faza / etapa",
        "exampleUse": "新发展阶段 (nova etapa razvoja)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 145"
      },
      {
        "char": "节奏",
        "pinyin": "jiézòu",
        "vuk": "đje-zou",
        "english": "rhythm / tempo",
        "serbian": "ritam / tempo",
        "exampleUse": "掌握生活的节奏 (vladati ritmom života)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "珍惜",
        "pinyin": "zhēnxī",
        "vuk": "džen-si",
        "english": "cherish / treasure",
        "serbian": "ceniti / čuvati",
        "exampleUse": "珍惜每一分每一秒",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 130"
      },
      {
        "char": "时代",
        "pinyin": "shídài",
        "vuk": "ši-daj",
        "english": "era / epoch",
        "serbian": "era / doba",
        "exampleUse": "新时代 (novo doba)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 80"
      }
    ],
    "sentences": [
      {
        "id": "idm-12-1",
        "type": "chengyu",
        "typeLabel": "古诗成语 (Transience of Time Classic)",
        "chinese": "光阴似箭，日月如梭。",
        "pinyin": "Guāng yīn sì jiàn, rì yuè rú suō.",
        "vuk": "Guang jin s đjen, ž jüe ru suo.",
        "literalEnglish": "Time flies like a launched arrow, sun and moon glide like a weaver's shuttle.",
        "english": "Time flies like an arrow, days and months pass like a shuttle.",
        "serbianEquivalent": "Vreme leti, ne čeka nikoga.",
        "serbian": "Vreme neumoljivo leti poput odapete strele, a dani i meseci promiču munjevito poput čunka na tkačkom razboju.",
        "philosophicalContext": "Potiče iz dinastije Tang. Vreme je jedini nenadoknadivi resurs koji čovek ima; stoički fokus podrazumeva prisutnost u sadašnjem trenutku.",
        "targetWords": [
          "日",
          "月",
          "年",
          "明"
        ],
        "context": "Fleetness of Time • Vreme leti",
        "tokens": [
          {
            "word": "光阴",
            "pinyin": "guāng yīn",
            "english": "time",
            "serbian": "vreme",
            "isTarget": true
          },
          {
            "word": "似箭",
            "pinyin": "sì jiàn",
            "english": "like arrow",
            "serbian": "poput strele"
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "日月",
            "pinyin": "rì yuè",
            "english": "sun and moon",
            "serbian": "sunce i mesec",
            "isTarget": true
          },
          {
            "word": "如梭",
            "pinyin": "rú suō",
            "english": "like shuttle",
            "serbian": "poput čunka"
          }
        ]
      },
      {
        "id": "idm-12-2",
        "type": "proverb",
        "typeLabel": "增广贤文金句 (Time vs Gold Axiom)",
        "chinese": "一寸光阴一寸金，寸金难买寸光阴。",
        "pinyin": "Yí cùn guāng yīn yí cùn jīn, cùn jīn nán mǎi cùn guāng yīn.",
        "vuk": "Ji cun guang jin ji cun đjin, cun đjin nan maj cun guang jin.",
        "literalEnglish": "An inch of time is an inch of gold, yet an inch of gold cannot purchase an inch of time.",
        "english": "An inch of time is worth an inch of gold, but an inch of gold cannot buy that inch of time.",
        "serbianEquivalent": "Vreme je vrednije od svakog zlata.",
        "serbian": "Palac vremena vredi koliko i palac čistog zlata, ali ni sa svim zlatom ovog sveta ne možeš dokupiti nijedan minut proteklog vremena.",
        "philosophicalContext": "Iz klasične riznice Zeng Guang Xian Wen. Novac se može ponovo zaraditi, ali izgubljeno vreme i propušteni trenuci su zauvek prošli.",
        "targetWords": [
          "一",
          "金",
          "刻"
        ],
        "context": "Invaluable Time • Vrednost svakog trenutka",
        "tokens": [
          {
            "word": "一寸光阴",
            "pinyin": "yí cùn guāng yīn",
            "english": "inch of time",
            "serbian": "palac vremena",
            "isTarget": true
          },
          {
            "word": "一寸金",
            "pinyin": "yí cùn jīn",
            "english": "inch of gold",
            "serbian": "palac zlata",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "寸金",
            "pinyin": "cùn jīn",
            "english": "inch of gold",
            "serbian": "palac zlata",
            "isTarget": true
          },
          {
            "word": "难买",
            "pinyin": "nán mǎi",
            "english": "cannot buy",
            "serbian": "ne može kupiti"
          },
          {
            "word": "寸光阴",
            "pinyin": "cùn guāng yīn",
            "english": "inch of time",
            "serbian": "palac vremena",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-12-3",
        "type": "proverb",
        "typeLabel": "民间格言 (Relentless Flow of Aging)",
        "chinese": "岁月不饶人。",
        "pinyin": "Suì yuè bù ráo rén.",
        "vuk": "Suej jüe bu žao žen.",
        "literalEnglish": "Years and months spare no human being.",
        "english": "Time and tide wait for no man / Age spares no one.",
        "serbianEquivalent": "Godine nikoga ne štede. / Vreme ne prašta.",
        "serbian": "Godine i meseci nikoga ne štede; biologija teče neumitno, zato treniraj telo i brusi um dok imaš snage.",
        "philosophicalContext": "Srž WiseFit filozofije: svesnost o prolaznosti nije razlog za očajanje, već poziv na vrhunsku disciplinu, kretanje i zdravlje svakog dana.",
        "targetWords": [
          "月",
          "年",
          "不",
          "人"
        ],
        "context": "Aging & Urgency • Vreme ne prašta",
        "tokens": [
          {
            "word": "岁月",
            "pinyin": "suì yuè",
            "english": "years and months",
            "serbian": "godine i meseci",
            "isTarget": true
          },
          {
            "word": "不饶人",
            "pinyin": "bù ráo rén",
            "english": "spares no one",
            "serbian": "ne praštaju nikome",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r3",
    "chartId": 2,
    "rowNumber": 3,
    "title": "Fauna & Predators",
    "titleSerbian": "Divlji Svet, Grabljivice i Životinjske Moći",
    "emoji": "🐅",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "Kings of the wild, apex predators, gentle herbivores, reptiles of longevity, and symbolic totems.",
    "words": [
      {
        "char": "狮",
        "pinyin": "shī",
        "vuk": "ši",
        "english": "lion",
        "serbian": "lav",
        "exampleUse": "狮子 (lav)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "虎",
        "pinyin": "hǔ",
        "vuk": "hu",
        "english": "tiger",
        "serbian": "tigar",
        "exampleUse": "老虎 (tigar)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "熊",
        "pinyin": "xióng",
        "vuk": "sjung",
        "english": "bear",
        "serbian": "medved",
        "exampleUse": "熊猫 (panda)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "鹿",
        "pinyin": "lù",
        "vuk": "lu",
        "english": "deer",
        "serbian": "jelen / srna",
        "exampleUse": "长颈鹿 (žirafa / jelen)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "蛇",
        "pinyin": "shé",
        "vuk": "še",
        "english": "snake / serpent",
        "serbian": "zmija",
        "exampleUse": "蛇形 (vijugav poput zmije)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "龟",
        "pinyin": "guī",
        "vuk": "guej",
        "english": "turtle / tortoise",
        "serbian": "kornjača (simbol dugovečnosti)",
        "exampleUse": "乌龟 (kornjača)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 230"
      },
      {
        "char": "兔",
        "pinyin": "tù",
        "vuk": "tu",
        "english": "rabbit / hare",
        "serbian": "zec",
        "exampleUse": "兔子 (zec)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "鸭",
        "pinyin": "yā",
        "vuk": "ja",
        "english": "duck",
        "serbian": "patka",
        "exampleUse": "烤鸭 (pečena patka)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "鱼",
        "pinyin": "yú",
        "vuk": "ji",
        "english": "fish / abundance",
        "serbian": "riba / obilje",
        "exampleUse": "金鱼 (zlatna ribica)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "鼠",
        "pinyin": "shǔ",
        "vuk": "šu",
        "english": "rat / mouse",
        "serbian": "pacov / miš",
        "exampleUse": "老鼠 (miš)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "狮子",
        "pinyin": "shīzi",
        "vuk": "ši-ce",
        "english": "lion",
        "serbian": "lav (kralj životinja)",
        "exampleUse": "勇猛的狮子 (hrabri lav)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 175"
      },
      {
        "char": "老虎",
        "pinyin": "lǎohǔ",
        "vuk": "lao-hu",
        "english": "tiger",
        "serbian": "tigar",
        "exampleUse": "威武的老虎 (moćan tigar)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "熊猫",
        "pinyin": "xióngmāo",
        "vuk": "sjung-mao",
        "english": "giant panda",
        "serbian": "panda",
        "exampleUse": "可爱的国宝大熊猫",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "兔子",
        "pinyin": "tùzi",
        "vuk": "tu-ce",
        "english": "rabbit",
        "serbian": "zec",
        "exampleUse": "机敏的小兔子 (okretan zec)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 145"
      },
      {
        "char": "乌龟",
        "pinyin": "wūguī",
        "vuk": "vu-guej",
        "english": "tortoise / turtle",
        "serbian": "kornjača",
        "exampleUse": "沉稳的长寿乌龟",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "老鼠",
        "pinyin": "lǎoshǔ",
        "vuk": "lao-šu",
        "english": "mouse / rat",
        "serbian": "miš",
        "exampleUse": "灵敏的小老鼠",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "动物",
        "pinyin": "dòngwù",
        "vuk": "dung-vu",
        "english": "animal / creature",
        "serbian": "životinja",
        "exampleUse": "保护野生动物 (zaštita divljih životinja)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "宠物",
        "pinyin": "chǒngwù",
        "vuk": "čung-vu",
        "english": "pet",
        "serbian": "kućni ljubimac",
        "exampleUse": "陪伴宠物 (družiti se sa ljubimcem)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "敏捷",
        "pinyin": "mǐnjié",
        "vuk": "min-đje",
        "english": "agile / nimble",
        "serbian": "okretan / agilan",
        "exampleUse": "身手敏捷 (okretno telo)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 220"
      },
      {
        "char": "凶猛",
        "pinyin": "xiōngměng",
        "vuk": "sjung-meng",
        "english": "ferocious / fierce",
        "serbian": "svirep / žestok",
        "exampleUse": "凶猛的野兽 (divlja zver)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 240"
      },
      {
        "char": "温顺",
        "pinyin": "wēnshùn",
        "vuk": "ven-šun",
        "english": "gentle / docile",
        "serbian": "krotak / poslušan",
        "exampleUse": "性格温顺 (blage naravi)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 260"
      },
      {
        "char": "奔跑",
        "pinyin": "bēnpǎo",
        "vuk": "ben-pao",
        "english": "sprint / run freely",
        "serbian": "trčati punom brzinom",
        "exampleUse": "在草原上自由奔跑",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 130"
      },
      {
        "char": "捕食",
        "pinyin": "bǔshí",
        "vuk": "bu-ši",
        "english": "hunt for food / prey",
        "serbian": "loviti plen",
        "exampleUse": "野外捕食 (lov u divljini)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 250"
      },
      {
        "char": "生存",
        "pinyin": "shēngcún",
        "vuk": "šeng-cun",
        "english": "survive / survival",
        "serbian": "preživeti / opstanak",
        "exampleUse": "适者生存 (opstanak najsposobnijih)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 125"
      },
      {
        "char": "速度",
        "pinyin": "sùdù",
        "vuk": "su-du",
        "english": "speed / velocity",
        "serbian": "brzina",
        "exampleUse": "提升反应速度 (podignuti brzinu reakcije)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "爪子",
        "pinyin": "zhuǎzi",
        "vuk": "džua-ce",
        "english": "claw / paw",
        "serbian": "kandže / šapa",
        "exampleUse": "锋利的爪子 (oštre kandže)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 260"
      },
      {
        "char": "翅膀",
        "pinyin": "chìbǎng",
        "vuk": "č-bang",
        "english": "wings",
        "serbian": "krila",
        "exampleUse": "展开强健的翅膀",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "本能",
        "pinyin": "běnnéng",
        "vuk": "ben-neng",
        "english": "instinct",
        "serbian": "instinkt / nagon",
        "exampleUse": "敏锐的本能 (izoštren instinkt)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "伪装",
        "pinyin": "wěizhuāng",
        "vuk": "vej-džuang",
        "english": "camouflage / disguise",
        "serbian": "kamuflaža / prerušavanje",
        "exampleUse": "巧妙的伪装 (vešta kamuflaža)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 290"
      },
      {
        "char": "适应",
        "pinyin": "shìyìng",
        "vuk": "ši-jing",
        "english": "adapt / suit",
        "serbian": "prilagoditi se / adaptacija",
        "exampleUse": "适应新环境 (prilagoditi se novom okruženju)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "敬畏",
        "pinyin": "jìngwèi",
        "vuk": "đjing-vej",
        "english": "awe / revere",
        "serbian": "strahopoštovanje",
        "exampleUse": "敬畏大自然 (strahopoštovanje prema prirodi)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 270"
      },
      {
        "char": "野性",
        "pinyin": "yěxìng",
        "vuk": "je-sing",
        "english": "wildness / primal nature",
        "serbian": "divlja priroda / iskonska snaga",
        "exampleUse": "唤醒内在野性",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 310"
      },
      {
        "char": "潜行",
        "pinyin": "qiánxíng",
        "vuk": "ćjen-sing",
        "english": "stalk / creep silently",
        "serbian": "prikradati se / tihi hod",
        "exampleUse": "无声潜行 (kretati se nečujno)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 330"
      },
      {
        "char": "耐力",
        "pinyin": "nàilì",
        "vuk": "naj-li",
        "english": "endurance / stamina",
        "serbian": "izdržljivost / kondicija",
        "exampleUse": "持久的耐力 (trajna izdržljivost)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "反应",
        "pinyin": "fǎnyìng",
        "vuk": "fan-jing",
        "english": "reaction / reflex",
        "serbian": "reakcija / refleks",
        "exampleUse": "快速反应 (brza reakcija)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 105"
      },
      {
        "char": "平衡感",
        "pinyin": "pínghénggǎn",
        "vuk": "ping-heng-gan",
        "english": "sense of balance",
        "serbian": "osećaj za ravnotežu",
        "exampleUse": "极佳的平衡感",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 280"
      },
      {
        "char": "野兽",
        "pinyin": "yěshòu",
        "vuk": "je-šou",
        "english": "wild beast",
        "serbian": "divlja zver",
        "exampleUse": "山林中的野兽",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 230"
      },
      {
        "char": "潜伏",
        "pinyin": "qiánfú",
        "vuk": "ćjen-fu",
        "english": "lie in ambush / lurk",
        "serbian": "vrebati iz zasede",
        "exampleUse": "耐心潜伏 (strpljivo čekati pravi čas)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 270"
      },
      {
        "char": "领地",
        "pinyin": "lǐngdì",
        "vuk": "ling-di",
        "english": "territory / home turf",
        "serbian": "teritorija / domen",
        "exampleUse": "捍卫自己的领地",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 240"
      },
      {
        "char": "坚韧",
        "pinyin": "jiānrèn",
        "vuk": "đjen-žen",
        "english": "tenacity",
        "serbian": "žilavost",
        "exampleUse": "如同乌龟般坚韧",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 200"
      },
      {
        "char": "狩猎",
        "pinyin": "shòuliè",
        "vuk": "šou-lje",
        "english": "hunt / hunting",
        "serbian": "lov",
        "exampleUse": "追踪与狩猎",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 280"
      },
      {
        "char": "飞翔",
        "pinyin": "fēixiáng",
        "vuk": "fej-sjang",
        "english": "soar / fly high",
        "serbian": "lebdeti / leteti visoko",
        "exampleUse": "雄鹰在空中飞翔",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 190"
      }
    ],
    "sentences": [
      {
        "id": "idm-13-1",
        "type": "chengyu",
        "typeLabel": "成语 (Supreme Vitality Classic)",
        "chinese": "生龙活虎。",
        "pinyin": "Shēng lóng huó hǔ.",
        "vuk": "Šeng lung huo hu.",
        "literalEnglish": "Living dragon and vigorous tiger.",
        "english": "Full of vim and vigor / Alive with dynamic power.",
        "serbianEquivalent": "Pucati od zdravlja i snage. / Biti u punoj životnoj snazi.",
        "serbian": "Kao živi zmaj i neukroćeni tigar; stanje vrhunske telesne i mentalne energije, vitalnosti i budnosti.",
        "philosophicalContext": "Idealan opis vrhunske forme u borilačkim veštinama i ritualnom treningu: telo je elastično poput zmaja, a fokus nepokolebljiv poput tigra.",
        "targetWords": [
          "虎",
          "生"
        ],
        "context": "Vitality & Primal Power • Vrhunska snaga",
        "tokens": [
          {
            "word": "生龙",
            "pinyin": "shēng lóng",
            "english": "living dragon",
            "serbian": "živi zmaj"
          },
          {
            "word": "活虎",
            "pinyin": "huó hǔ",
            "english": "active tiger",
            "serbian": "živahan tigar",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-13-2",
        "type": "chengyu",
        "typeLabel": "寓言成语 (Han Feizi Strategic Parable)",
        "chinese": "守株待兔。",
        "pinyin": "Shǒu zhū dài tù.",
        "vuk": "Šou džu daj tu.",
        "literalEnglish": "Guarding a tree stump waiting for a rabbit to crash into it.",
        "english": "Waiting for a rabbit by a tree / Expecting success without proactive work.",
        "serbianEquivalent": "Čekati da pečene ševe padnu s neba. / Sedeti skrštenih ruku.",
        "serbian": "Čekati kraj panja da zec sam naleti; oslanjati se na slepu slučajnost umesto na svakodnevni naporan rad i inicijativu.",
        "philosophicalContext": "Iz Han Feizija (Legalistička filozofija). Pravi uspeh ne počiva na srećnom slučaju iz prošlosti, već na stalnom prilagođavanju i neumornoj akciji.",
        "targetWords": [
          "兔",
          "木"
        ],
        "context": "Action vs Passive Waiting • Aktivno delovanje",
        "tokens": [
          {
            "word": "守株",
            "pinyin": "shǒu zhū",
            "english": "guard stump",
            "serbian": "čuvati panj"
          },
          {
            "word": "待兔",
            "pinyin": "dài tù",
            "english": "wait for rabbit",
            "serbian": "čekati zeca",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-13-3",
        "type": "chengyu",
        "typeLabel": "成语 (Consistency to the Finish)",
        "chinese": "虎头蛇尾。",
        "pinyin": "Hǔ tóu shé wěi.",
        "vuk": "Hu tou še vej.",
        "literalEnglish": "Head of a tiger, tail of a snake.",
        "english": "A fine start but a poor finish / Fizzling out after a loud beginning.",
        "serbianEquivalent": "Tresla se gora, rodio se miš. / Po jutru se dan poznaje, a po kraju majstor.",
        "serbian": "Početi silno poput tigrove glave, a završiti slabašno kao tanak zmijski rep; nedostatak istrajnosti da se započeto privede kraju.",
        "philosophicalContext": "Stoičko upozorenje protiv entuzijazma bez discipline. Započeti projekat je lako; umetnost je završiti ga istom snagom kojom je počeo.",
        "targetWords": [
          "虎",
          "蛇"
        ],
        "context": "Follow-Through & Finishing • Istrajnost do kraja",
        "tokens": [
          {
            "word": "虎头",
            "pinyin": "hǔ tóu",
            "english": "tiger head",
            "serbian": "glava tigra",
            "isTarget": true
          },
          {
            "word": "蛇尾",
            "pinyin": "shé wěi",
            "english": "snake tail",
            "serbian": "rep zmije",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r4",
    "chartId": 2,
    "rowNumber": 4,
    "title": "Family & Kinship",
    "titleSerbian": "Porodica, Srodstvo i Generacije",
    "emoji": "👨‍👩‍👧‍👦",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "Generational hierarchy, bloodline bonds, ancestral reverence, and siblings companionship.",
    "words": [
      {
        "char": "父",
        "pinyin": "fù",
        "vuk": "fu",
        "english": "father",
        "serbian": "otac",
        "exampleUse": "父亲 (otac)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "母",
        "pinyin": "mǔ",
        "vuk": "mu",
        "english": "mother",
        "serbian": "majka",
        "exampleUse": "母亲 (majka)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "兄",
        "pinyin": "xiōng",
        "vuk": "sjung",
        "english": "elder brother",
        "serbian": "stariji brat",
        "exampleUse": "兄弟 (braća)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "弟",
        "pinyin": "dì",
        "vuk": "di",
        "english": "younger brother",
        "serbian": "mlađi brat",
        "exampleUse": "弟弟 (mlađi brat)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "姐",
        "pinyin": "jiě",
        "vuk": "đje",
        "english": "elder sister",
        "serbian": "starija sestra",
        "exampleUse": "姐姐 (starija sestra)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "妹",
        "pinyin": "mèi",
        "vuk": "mej",
        "english": "younger sister",
        "serbian": "mlađa sestra",
        "exampleUse": "妹妹 (mlađa sestra)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 100"
      },
      {
        "char": "夫",
        "pinyin": "fū",
        "vuk": "fu",
        "english": "husband / master",
        "serbian": "muž / suprug",
        "exampleUse": "夫妇 (bračni par)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "妻",
        "pinyin": "qī",
        "vuk": "ći",
        "english": "wife / spouse",
        "serbian": "supruga / žena",
        "exampleUse": "夫妻 (muž i žena)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "儿",
        "pinyin": "ér",
        "vuk": "er",
        "english": "son / child",
        "serbian": "sin / dete",
        "exampleUse": "儿子 (sin)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 40"
      },
      {
        "char": "爷",
        "pinyin": "yé",
        "vuk": "je",
        "english": "grandfather / elder",
        "serbian": "deda / glava porodice",
        "exampleUse": "爷爷 (deda po ocu)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 105"
      },
      {
        "char": "父亲",
        "pinyin": "fùqīn",
        "vuk": "fu-ćin",
        "english": "father (formal)",
        "serbian": "otac",
        "exampleUse": "尊敬的父亲 (poštovani otac)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "母亲",
        "pinyin": "mǔqīn",
        "vuk": "mu-ćin",
        "english": "mother (formal)",
        "serbian": "majka",
        "exampleUse": "慈爱的母亲 (brižna majka)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "兄弟",
        "pinyin": "xiōngdì",
        "vuk": "sjung-di",
        "english": "brothers / comrades",
        "serbian": "braća / braća po oružju",
        "exampleUse": "兄弟情深 (duboka bratska ljubav)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "姐妹",
        "pinyin": "jiěmèi",
        "vuk": "đje-mej",
        "english": "sisters",
        "serbian": "sestre",
        "exampleUse": "亲姐妹 (rođene sestre)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "姐姐",
        "pinyin": "jiějie",
        "vuk": "đje-đje",
        "english": "older sister",
        "serbian": "starija sestra",
        "exampleUse": "我有一个姐姐 (imam stariju sestru)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "妹妹",
        "pinyin": "mèimei",
        "vuk": "mej-mej",
        "english": "younger sister",
        "serbian": "mlađa sestra",
        "exampleUse": "照顾小妹妹 (čuvati mlađu sestru)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "哥哥",
        "pinyin": "gēge",
        "vuk": "ge-ge",
        "english": "older brother",
        "serbian": "stariji brat",
        "exampleUse": "亲切的哥哥 (dragi brat)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "弟弟",
        "pinyin": "dìdi",
        "vuk": "di-di",
        "english": "younger brother",
        "serbian": "mlađi brat",
        "exampleUse": "聪明的弟弟 (pametan mlađi brat)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "爷爷",
        "pinyin": "yéye",
        "vuk": "je-je",
        "english": "paternal grandfather",
        "serbian": "deda (po ocu)",
        "exampleUse": "听爷爷讲故事 (slušati dedu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "奶奶",
        "pinyin": "nǎinai",
        "vuk": "naj-naj",
        "english": "paternal grandmother",
        "serbian": "baba (po ocu)",
        "exampleUse": "慈祥的奶奶 (blaga baka)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "家庭",
        "pinyin": "jiātíng",
        "vuk": "đja-ting",
        "english": "family / household",
        "serbian": "porodica / dom",
        "exampleUse": "温暖的家庭 (topao dom)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 70"
      },
      {
        "char": "亲戚",
        "pinyin": "qīnqi",
        "vuk": "ćin-ći",
        "english": "relatives / kin",
        "serbian": "rođaci / rodbina",
        "exampleUse": "走访亲戚 (posetiti rodbinu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "祖先",
        "pinyin": "zǔxiān",
        "vuk": "cu-sjen",
        "english": "ancestors / forefathers",
        "serbian": "preci / rodonačelnici",
        "exampleUse": "传承祖先的智慧",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "孝顺",
        "pinyin": "xiàoshùn",
        "vuk": "sjao-šun",
        "english": "filial piety / respect parents",
        "serbian": "sinovska odanost roditeljima",
        "exampleUse": "百善孝为先 (poštovanje roditelja je koren)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 160"
      },
      {
        "char": "长辈",
        "pinyin": "zhǎngbèi",
        "vuk": "džang-bej",
        "english": "elders / senior generation",
        "serbian": "stariji u porodici / starešine",
        "exampleUse": "尊敬长辈 (poštovati starije)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "晚辈",
        "pinyin": "wǎnbèi",
        "vuk": "van-bej",
        "english": "younger generation",
        "serbian": "mlađi naraštaj",
        "exampleUse": "关爱晚辈 (brinuti o mlađima)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 230"
      },
      {
        "char": "关爱",
        "pinyin": "guān'ài",
        "vuk": "guan-aj",
        "english": "care and love",
        "serbian": "briga i pažnja",
        "exampleUse": "无微不至的关爱",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 170"
      },
      {
        "char": "团聚",
        "pinyin": "tuánjù",
        "vuk": "tuan-đji",
        "english": "reunite / gather together",
        "serbian": "okupiti se na okupu",
        "exampleUse": "全家团聚 (porodično okupljanje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 150"
      },
      {
        "char": "照顾",
        "pinyin": "zhàogu",
        "vuk": "džao-gu",
        "english": "take care of / look after",
        "serbian": "brinuti se o / paziti",
        "exampleUse": "好好照顾自己 (čuvaj se dobro)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 75"
      },
      {
        "char": "陪伴",
        "pinyin": "péibàn",
        "vuk": "pej-ban",
        "english": "accompany / be with",
        "serbian": "praviti društvo / biti uz nekog",
        "exampleUse": "长久的陪伴 (trajna privrženost)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 120"
      },
      {
        "char": "传承",
        "pinyin": "chuánchéng",
        "vuk": "čuan-čeng",
        "english": "pass down / inherit",
        "serbian": "prenositi s kolena na koleno",
        "exampleUse": "传承家族美德",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 170"
      },
      {
        "char": "宽容",
        "pinyin": "kuānróng",
        "vuk": "kuan-žung",
        "english": "tolerant / lenient",
        "serbian": "praštanje / širokogrudost",
        "exampleUse": "学会宽容 (naučiti da praštaš)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 195"
      },
      {
        "char": "榜样",
        "pinyin": "bǎngyàng",
        "vuk": "bang-jang",
        "english": "role model / example",
        "serbian": "uzor / primer",
        "exampleUse": "树立榜样 (biti dobar primer)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "抚养",
        "pinyin": "fǔyǎng",
        "vuk": "fu-jang",
        "english": "foster / bring up children",
        "serbian": "odgajati decu / izdržavati",
        "exampleUse": "抚养成人 (odgajiti u zrelog čoveka)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 250"
      },
      {
        "char": "亲情",
        "pinyin": "qīnqíng",
        "vuk": "ćin-ćing",
        "english": "family affection / blood ties",
        "serbian": "porodična ljubav / krvna veza",
        "exampleUse": "无价的亲情 (neprocenjiva ljubav)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 165"
      },
      {
        "char": "依靠",
        "pinyin": "yīkào",
        "vuk": "ji-kao",
        "english": "rely on / solid backing",
        "serbian": "osloniti se / uzdanica",
        "exampleUse": "互相依靠 (biti oslonac jedno drugom)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 155"
      },
      {
        "char": "夫妻",
        "pinyin": "fūqī",
        "vuk": "fu-ći",
        "english": "husband and wife / couple",
        "serbian": "bračni par / supružnici",
        "exampleUse": "恩爱夫妻 (složni supružnici)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "老小",
        "pinyin": "lǎoxiǎo",
        "vuk": "lao-sjao",
        "english": "old and young / whole family",
        "serbian": "i staro i mlado",
        "exampleUse": "一家老小 (cela kuća od najstarijeg do najmlađeg)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 280"
      },
      {
        "char": "孙子",
        "pinyin": "sūnzi",
        "vuk": "sun-ce",
        "english": "grandson",
        "serbian": "unuk",
        "exampleUse": "可爱的孙子 (sladak unuk)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "血脉",
        "pinyin": "xuèmài",
        "vuk": "süe-maj",
        "english": "bloodline / pedigree",
        "serbian": "krvno srodstvo / loza",
        "exampleUse": "血脉相连 (povezani istom krvlju)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 310"
      },
      {
        "char": "和睦",
        "pinyin": "hémù",
        "vuk": "he-mu",
        "english": "harmonious / amicable",
        "serbian": "skladan / harmoničan",
        "exampleUse": "家庭和睦 (porodična harmonija)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 210"
      },
      {
        "char": "家教",
        "pinyin": "jiājiào",
        "vuk": "đja-đjao",
        "english": "family upbringing / manners",
        "serbian": "kućno vaspitanje",
        "exampleUse": "良好的家教 (dobro kućno vaspitanje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 260"
      }
    ],
    "sentences": [
      {
        "id": "idm-14-1",
        "type": "chengyu",
        "typeLabel": "历史典故 (Mencius Environment Parable)",
        "chinese": "孟母三迁。",
        "pinyin": "Mèng mǔ sān qiān.",
        "vuk": "Meng mu san ćjen.",
        "literalEnglish": "Mencius' mother moved their home three times.",
        "english": "Mencius' mother relocates three times / Environment shapes destiny.",
        "serbianEquivalent": "S kim si, onakav si. / Okruženje oblikuje sudbinu čoveka.",
        "serbian": "Mencijeva majka selila se tri puta dok nije našla dom pored škole; okruženje i ljudi kojima se okružuješ ključno grade karakter.",
        "philosophicalContext": "Iz Zapisa o uzornim ženama (Lie Nü Zhuan). Stoička i WiseFit lekcija: ako želiš mir i vrhunsko zdravlje, uredi svoje okruženje.",
        "targetWords": [
          "母",
          "三",
          "子"
        ],
        "context": "Environment & Upbringing • Snaga okruženja",
        "tokens": [
          {
            "word": "孟母",
            "pinyin": "mèng mǔ",
            "english": "Mencius mother",
            "serbian": "Mencijeva majka",
            "isTarget": true
          },
          {
            "word": "三迁",
            "pinyin": "sān qiān",
            "english": "three moves",
            "serbian": "tri selidbe"
          }
        ]
      },
      {
        "id": "idm-14-2",
        "type": "proverb",
        "typeLabel": "民间俗语 (Fraternal Duty Proverb)",
        "chinese": "长兄如父，老嫂比母。",
        "pinyin": "Zhǎng xiōng rú fù, lǎo sǎo bǐ mǔ.",
        "vuk": "Džang sjung ru fu, lao sao bi mu.",
        "literalEnglish": "The eldest brother is like a father; the elder sister-in-law is like a mother.",
        "english": "An elder brother is like a father / Deep family stewardship.",
        "serbianEquivalent": "Brat bratu najveća uzdanica. / Najstariji nosi teret doma.",
        "serbian": "Najstariji brat preuzima očinsku odgovornost i zaštitu nad mlađima; čast i dužnost čuvaju porodično ognjište.",
        "philosophicalContext": "Tradicionalna etika bratske solidarnosti: snaga leži u spremnosti da podmetneš leđa za one koji dolaze iza tebe.",
        "targetWords": [
          "兄",
          "父",
          "母"
        ],
        "context": "Family Responsibility • Čast i zaštita",
        "tokens": [
          {
            "word": "长兄",
            "pinyin": "zhǎng xiōng",
            "english": "eldest brother",
            "serbian": "stariji brat",
            "isTarget": true
          },
          {
            "word": "如父",
            "pinyin": "rú fù",
            "english": "like a father",
            "serbian": "kao otac",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "老嫂比母",
            "pinyin": "lǎo sǎo bǐ mǔ",
            "english": "sister-in-law like mother",
            "serbian": "snaja kao majka",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-14-3",
        "type": "proverb",
        "typeLabel": "唐诗名句 (Poetic Filial Gratitude)",
        "chinese": "谁言寸草心，报得三春晖。",
        "pinyin": "Shuí yán cùn cǎo xīn, bào dé sān chūn huī.",
        "vuk": "Šuej jen cun cao sin, bao de san čun huej.",
        "literalEnglish": "Who says the heart of an inch-tall grass can repay the radiance of three spring months?",
        "english": "How can the gratitude of a tiny blade of grass repay the warmth of spring sun?",
        "serbianEquivalent": "Majčina ljubav nema mere i nikada se ne može do kraja odužiti.",
        "serbian": "Ko može reći da mala vlat trave svojim srcem može uzvratiti beskrajnu svetlost i toplinu prolećnog sunca?",
        "philosophicalContext": "Iz čuvene pesme Meng Jiaoa (Pesma putnika). Podseća nas na duboku zahvalnost korenima koji su nas nesebično hranili i podigli.",
        "targetWords": [
          "心",
          "三",
          "母"
        ],
        "context": "Boundless Parental Love • Bezmerna ljubav",
        "tokens": [
          {
            "word": "谁言",
            "pinyin": "shuí yán",
            "english": "who says",
            "serbian": "ko kaže"
          },
          {
            "word": "寸草心",
            "pinyin": "cùn cǎo xīn",
            "english": "grass blade heart",
            "serbian": "srce vlati trave",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "报得",
            "pinyin": "bào dé",
            "english": "can repay",
            "serbian": "može uzvratiti"
          },
          {
            "word": "三春晖",
            "pinyin": "sān chūn huī",
            "english": "spring sunlight",
            "serbian": "prolećno sunce"
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r5",
    "chartId": 2,
    "rowNumber": 5,
    "title": "Manual Actions",
    "titleSerbian": "Glagoli Ručnih Radnji i Rukovanja",
    "emoji": "🤲",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "Dynamic hand operations, physical craftsmanship, pushing, pulling, lifting, embracing, and tool utility.",
    "words": [
      {
        "char": "打",
        "pinyin": "dǎ",
        "vuk": "da",
        "english": "hit / strike / call",
        "serbian": "udariti / zvati telefonom / igrati loptom",
        "exampleUse": "打电话 (telefonirati)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 30"
      },
      {
        "char": "拿",
        "pinyin": "ná",
        "vuk": "na",
        "english": "take / hold in hand",
        "serbian": "uzeti / držati u ruci",
        "exampleUse": "拿来 (doneti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 55"
      },
      {
        "char": "推",
        "pinyin": "tuī",
        "vuk": "tuej",
        "english": "push / promote",
        "serbian": "gurati / unaprediti",
        "exampleUse": "推动 (pogurati napred)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 85"
      },
      {
        "char": "拉",
        "pinyin": "lā",
        "vuk": "la",
        "english": "pull / drag",
        "serbian": "vući / potezati",
        "exampleUse": "拉开 (otvoriti povlačenjem)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 90"
      },
      {
        "char": "拍",
        "pinyin": "pāi",
        "vuk": "paj",
        "english": "pat / clap / photograph",
        "serbian": "tapšati / fotografisati",
        "exampleUse": "拍照 (slikati)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 95"
      },
      {
        "char": "抱",
        "pinyin": "bào",
        "vuk": "bao",
        "english": "hug / embrace",
        "serbian": "zagrliti / nositi u naručju",
        "exampleUse": "拥抱 (zagrljaj)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "扔",
        "pinyin": "rēng",
        "vuk": "ženg",
        "english": "throw / toss",
        "serbian": "baciti / odbaciti",
        "exampleUse": "扔掉 (baciti u smeće)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 140"
      },
      {
        "char": "找",
        "pinyin": "zhǎo",
        "vuk": "džao",
        "english": "find / search for",
        "serbian": "tražiti / pronaći",
        "exampleUse": "找到 (pronaći)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 45"
      },
      {
        "char": "用",
        "pinyin": "yòng",
        "vuk": "jung",
        "english": "use / employ",
        "serbian": "koristiti / upotrebiti",
        "exampleUse": "使用 (upotrebljavati)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 25"
      },
      {
        "char": "做",
        "pinyin": "zuò",
        "vuk": "zuo",
        "english": "do / make / create",
        "serbian": "raditi / praviti",
        "exampleUse": "做饭 (kuvati)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 20"
      },
      {
        "char": "打电话",
        "pinyin": "dǎ diànhuà",
        "vuk": "da đjen-hua",
        "english": "make a phone call",
        "serbian": "telefonirati",
        "exampleUse": "给他打电话 (pozvati ga telefonom)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 50"
      },
      {
        "char": "打球",
        "pinyin": "dǎqiú",
        "vuk": "da-ćju",
        "english": "play ball games",
        "serbian": "igrati loptom / sport",
        "exampleUse": "去体育馆打球 (igrati basket)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 90"
      },
      {
        "char": "拿来",
        "pinyin": "nálái",
        "vuk": "na-laj",
        "english": "bring here",
        "serbian": "doneti ovamo",
        "exampleUse": "把书拿来 (donesi knjigu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 70"
      },
      {
        "char": "推动",
        "pinyin": "tuīdòng",
        "vuk": "tuej-dung",
        "english": "propel / promote",
        "serbian": "pogurati napred / pospešiti",
        "exampleUse": "推动事业发展 (pogurati posao)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 120"
      },
      {
        "char": "拍照",
        "pinyin": "pāizhào",
        "vuk": "paj-džao",
        "english": "take photos",
        "serbian": "fotografisati / slikati",
        "exampleUse": "用手机拍照 (slikati telefonom)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 80"
      },
      {
        "char": "拥抱",
        "pinyin": "yōngbào",
        "vuk": "jung-bao",
        "english": "warm embrace / hug",
        "serbian": "topao zagrljaj",
        "exampleUse": "热情的拥抱 (srdačan zagrljaj)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 135"
      },
      {
        "char": "找到",
        "pinyin": "zhǎodào",
        "vuk": "džao-dao",
        "english": "find successfully",
        "serbian": "pronaći uspešno",
        "exampleUse": "找到解决办法 (naći rešenje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 60"
      },
      {
        "char": "使用",
        "pinyin": "shǐyòng",
        "vuk": "ši-jung",
        "english": "use / apply",
        "serbian": "upotrebiti / koristiti",
        "exampleUse": "正确使用工具 (pravilno koristiti alat)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 70"
      },
      {
        "char": "做事",
        "pinyin": "zuòshì",
        "vuk": "zuo-ši",
        "english": "handle tasks / work",
        "serbian": "obavljati posao / raditi",
        "exampleUse": "认真做事 (savesno raditi)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "打开",
        "pinyin": "dǎkāi",
        "vuk": "da-kaj",
        "english": "open / turn on",
        "serbian": "otvoriti / uključiti",
        "exampleUse": "打开大门 (otvoriti kapiju)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 55"
      },
      {
        "char": "推荐",
        "pinyin": "tuījiàn",
        "vuk": "tuej-đjen",
        "english": "recommend",
        "serbian": "preporučiti",
        "exampleUse": "强烈推荐 (toplo preporučiti)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "拍手",
        "pinyin": "pāishǒu",
        "vuk": "paj-šou",
        "english": "clap hands / applaud",
        "serbian": "aplaudirati / pljeskati",
        "exampleUse": "大家一起拍手",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 160"
      },
      {
        "char": "扔掉",
        "pinyin": "rēngdiào",
        "vuk": "ženg-djao",
        "english": "throw away / discard",
        "serbian": "baciti u smeće / rešiti se",
        "exampleUse": "扔掉垃圾 (izbaciti đubre)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 125"
      },
      {
        "char": "寻找",
        "pinyin": "xúnzhǎo",
        "vuk": "sün-džao",
        "english": "seek / look for",
        "serbian": "tragati za / tražiti",
        "exampleUse": "寻找真理 (tragati za istinom)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "动手",
        "pinyin": "dòngshǒu",
        "vuk": "dung-šou",
        "english": "take practical action",
        "serbian": "preći na delo / uradi sam",
        "exampleUse": "亲自动手 (uraditi lično)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 140"
      },
      {
        "char": "操作",
        "pinyin": "cāozuò",
        "vuk": "cao-zuo",
        "english": "operate / maneuver",
        "serbian": "rukovati / operisati",
        "exampleUse": "规范操作 (propisno rukovanje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 130"
      },
      {
        "char": "制作",
        "pinyin": "zhìzuò",
        "vuk": "dž-zuo",
        "english": "make / manufacture",
        "serbian": "napraviti / proizvesti",
        "exampleUse": "精心制作 (pažljivo izrađeno)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 100"
      },
      {
        "char": "握紧",
        "pinyin": "wòjǐn",
        "vuk": "vo-đjin",
        "english": "grip firmly / hold tight",
        "serbian": "čvrsto stegnuti",
        "exampleUse": "握紧双拳 (stegnuti pesnice)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 210"
      },
      {
        "char": "搬运",
        "pinyin": "bānyùn",
        "vuk": "ban-jin",
        "english": "carry / transport",
        "serbian": "prenositi teret",
        "exampleUse": "搬运重物 (nositi težak teret)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 230"
      },
      {
        "char": "整理",
        "pinyin": "zhěnglǐ",
        "vuk": "dženg-li",
        "english": "organize / tidy up",
        "serbian": "srediti / posložiti",
        "exampleUse": "整理房间 (srediti sobu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "工具",
        "pinyin": "gōngjù",
        "vuk": "gung-đjü",
        "english": "tool / instrument",
        "serbian": "alat / oruđe",
        "exampleUse": "实用工具 (praktičan alat)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "方法",
        "pinyin": "fāngfǎ",
        "vuk": "fang-fa",
        "english": "method / technique",
        "serbian": "metod / način",
        "exampleUse": "科学的方法 (naučni metod)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 65"
      },
      {
        "char": "创造",
        "pinyin": "chuàngzào",
        "vuk": "čuang-zao",
        "english": "create / originate",
        "serbian": "stvoriti / kreirati",
        "exampleUse": "创造价值 (stvoriti novu vrednost)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "调整",
        "pinyin": "tiáozhěng",
        "vuk": "tjao-dženg",
        "english": "adjust / fine-tune",
        "serbian": "podesiti / prilagoditi",
        "exampleUse": "调整呼吸与状态 (podesiti dah)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "完成",
        "pinyin": "wánchéng",
        "vuk": "van-čeng",
        "english": "complete / finish",
        "serbian": "završiti do kraja",
        "exampleUse": "圆满完成 (besprekorno završeno)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 60"
      },
      {
        "char": "拉开",
        "pinyin": "lākāi",
        "vuk": "la-kaj",
        "english": "pull open / widen gap",
        "serbian": "razvući / otvoriti",
        "exampleUse": "拉开窗帘 (razgrnuti zavese)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 150"
      },
      {
        "char": "放手",
        "pinyin": "fàngshǒu",
        "vuk": "fang-šou",
        "english": "let go / release grip",
        "serbian": "pustiti iz ruku / prepustiti",
        "exampleUse": "学会适时放手 (naučiti pustiti)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 170"
      },
      {
        "char": "掌控",
        "pinyin": "zhǎngkòng",
        "vuk": "džang-kung",
        "english": "control / master",
        "serbian": "držati pod kontrolom",
        "exampleUse": "掌控节奏 (vladati ritmom)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 190"
      },
      {
        "char": "摸索",
        "pinyin": "mōsuǒ",
        "vuk": "mo-suo",
        "english": "feel way / grope forward",
        "serbian": "napipavati put / istraživati",
        "exampleUse": "不断摸索前行 (krčiti put)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 240"
      },
      {
        "char": "拿起",
        "pinyin": "náqǐ",
        "vuk": "na-ći",
        "english": "pick up / take up",
        "serbian": "podići u ruku",
        "exampleUse": "拿起书本 (uzeti knjigu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 100"
      },
      {
        "char": "推开",
        "pinyin": "tuīkāi",
        "vuk": "tuej-kaj",
        "english": "push open",
        "serbian": "odgurnuti / otvoriti guranjem",
        "exampleUse": "推开大门 (gurnuti vrata)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 135"
      },
      {
        "char": "拍打",
        "pinyin": "pāidǎ",
        "vuk": "paj-da",
        "english": "pat / beat lightly",
        "serbian": "potapšati / otresati prašinu",
        "exampleUse": "拍打身上的尘土",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 280"
      }
    ],
    "sentences": [
      {
        "id": "idm-15-1",
        "type": "chengyu",
        "typeLabel": "成语 (Innovation Classic)",
        "chinese": "推陈出新。",
        "pinyin": "Tuī chén chū xīn.",
        "vuk": "Tuej čen ču sin.",
        "literalEnglish": "Push away the outdated, weed through the old to bring forth the fresh.",
        "english": "Weed through the old to bring forth the new / Modernize without losing roots.",
        "serbianEquivalent": "Stvarati novo na temeljima starog. / Udahnuti nov život.",
        "serbian": "Odbaciti ono što je zastarelo i potrošeno, a iznedriti sveže, delotvorne ideje i veštine.",
        "philosophicalContext": "Potiče iz tradicije obnove žitarica: stare zalihe se troše da bi se oslobodio prostor za novu, svežu žetvu. Stalna mentalna obnova.",
        "targetWords": [
          "推",
          "出"
        ],
        "context": "Innovation & Renewal • Stalna obnova",
        "tokens": [
          {
            "word": "推陈",
            "pinyin": "tuī chén",
            "english": "push old away",
            "serbian": "odbaci staro",
            "isTarget": true
          },
          {
            "word": "出新",
            "pinyin": "chū xīn",
            "english": "bring forth new",
            "serbian": "stvori novo",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-15-2",
        "type": "chengyu",
        "typeLabel": "寓言成语 (Mencius Patience Parable)",
        "chinese": "揠苗助长。",
        "pinyin": "Yà miáo zhù zhǎng.",
        "vuk": "Ja mjao džu džang.",
        "literalEnglish": "Pulling up seedlings to help them grow faster.",
        "english": "Pulling up shoots to help them grow / Ruining by impatience.",
        "serbianEquivalent": "Preko preče, naokolo bliže. / Brzopletost kvari posao.",
        "serbian": "Čupati izdanke nagore misleći da im tako pomažeš da brže rastu, a zapravo im kidaš koren; nestrpljenje koje uništava prirodan razvoj.",
        "philosophicalContext": "Mencijeva čuvena alegorija: i u treningu i u učenju jezika, forsiranje prečica uništava bazu. Poštuj organski proces rasta.",
        "targetWords": [
          "拉",
          "做"
        ],
        "context": "Patience & Organic Growth • Strpljenje bez prečica",
        "tokens": [
          {
            "word": "揠苗",
            "pinyin": "yà miáo",
            "english": "pull seedlings",
            "serbian": "čupati izdanke"
          },
          {
            "word": "助长",
            "pinyin": "zhù zhǎng",
            "english": "help grow",
            "serbian": "pomoći da raste"
          }
        ]
      },
      {
        "id": "idm-15-3",
        "type": "chengyu",
        "typeLabel": "成语 (Step-by-Step Mastery)",
        "chinese": "循序渐进。",
        "pinyin": "Xún xù jiàn jìn.",
        "vuk": "Sün sü đjen đjin.",
        "literalEnglish": "Following the order, advancing gradually step by step.",
        "english": "Step by step / Proceed in orderly progression.",
        "serbianEquivalent": "Korak po korak do cilja. / Polako ali sigurno.",
        "serbian": "Pratiti pravilan redosled i napredovati postepeno, stabilno i sigurno bez preskakanja lekcija.",
        "philosophicalContext": "Konfučijanski metod usavršavanja: ne može se trčati maraton pre nego što se savlada stabilan hod. Temelji donose stabilnost.",
        "targetWords": [
          "用",
          "做"
        ],
        "context": "Systematic Progress • Postepen napredak",
        "tokens": [
          {
            "word": "循序",
            "pinyin": "xún xù",
            "english": "follow sequence",
            "serbian": "prati redosled"
          },
          {
            "word": "渐进",
            "pinyin": "jiàn jìn",
            "english": "advance gradually",
            "serbian": "napreduj postepeno"
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r6",
    "chartId": 2,
    "rowNumber": 6,
    "title": "Locomotion & Posture",
    "titleSerbian": "Glagoli Kretanja, Držanja i Putovanja",
    "emoji": "🏃",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "Dynamic human kinetics, running, leaping, flight, swimming, climbing, kneeling, falling, and returning.",
    "words": [
      {
        "char": "跑",
        "pinyin": "pǎo",
        "vuk": "pao",
        "english": "run / sprint",
        "serbian": "trčati",
        "exampleUse": "跑步 (trčanje)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 50"
      },
      {
        "char": "走",
        "pinyin": "zǒu",
        "vuk": "zou",
        "english": "walk / leave",
        "serbian": "hodati / otići",
        "exampleUse": "走路 (pešačiti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 35"
      },
      {
        "char": "跳",
        "pinyin": "tiào",
        "vuk": "tjao",
        "english": "jump / leap / dance",
        "serbian": "skočiti / plesati",
        "exampleUse": "跳舞 (plesati)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 75"
      },
      {
        "char": "飞",
        "pinyin": "fēi",
        "vuk": "fej",
        "english": "fly / soar",
        "serbian": "leteti",
        "exampleUse": "飞机 (avion)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 60"
      },
      {
        "char": "游",
        "pinyin": "yóu",
        "vuk": "jou",
        "english": "swim / travel / tour",
        "serbian": "plivati / putovati",
        "exampleUse": "游泳 (plivanje)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 85"
      },
      {
        "char": "跪",
        "pinyin": "guì",
        "vuk": "guej",
        "english": "kneel down",
        "serbian": "klečati (u znak poštovanja)",
        "exampleUse": "跪下 (kleknuti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 250"
      },
      {
        "char": "爬",
        "pinyin": "pá",
        "vuk": "pa",
        "english": "climb / crawl",
        "serbian": "penjati se / puzati",
        "exampleUse": "爬山 (planinariti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "跌",
        "pinyin": "diē",
        "vuk": "đje",
        "english": "fall / stumble / drop",
        "serbian": "pasti / posrnuti",
        "exampleUse": "跌倒 (pasti na zemlju)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 190"
      },
      {
        "char": "停",
        "pinyin": "tíng",
        "vuk": "ting",
        "english": "stop / pause",
        "serbian": "stati / zaustaviti se",
        "exampleUse": "停车 (parkirati se / zaustaviti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "回",
        "pinyin": "huí",
        "vuk": "huej",
        "english": "return / turn back",
        "serbian": "vratiti se / odgovoriti",
        "exampleUse": "回家 (ići kući)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 25"
      },
      {
        "char": "跑步",
        "pinyin": "pǎobù",
        "vuk": "pao-bu",
        "english": "run / jogging",
        "serbian": "trčanje / džoging",
        "exampleUse": "晨间跑步 (jutarnje trčanje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "跳舞",
        "pinyin": "tiàowǔ",
        "vuk": "tjao-vu",
        "english": "dance",
        "serbian": "plesati / igrati",
        "exampleUse": "跟着音乐跳舞 (plesati uz muziku)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 95"
      },
      {
        "char": "飞机",
        "pinyin": "fēijī",
        "vuk": "fej-đji",
        "english": "airplane / aircraft",
        "serbian": "avion",
        "exampleUse": "坐飞机旅行 (putovati avionom)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "游泳",
        "pinyin": "yóuyǒng",
        "vuk": "jou-jung",
        "english": "swimming",
        "serbian": "plivanje",
        "exampleUse": "去泳池游泳 (ići na bazen na plivanje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 85"
      },
      {
        "char": "跌倒",
        "pinyin": "diēdǎo",
        "vuk": "đje-dao",
        "english": "fall down / tumble",
        "serbian": "pasti / spotaknuti se",
        "exampleUse": "跌倒后重新站起 (posle pada ponovo ustati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 190"
      },
      {
        "char": "散步",
        "pinyin": "sànbù",
        "vuk": "san-bu",
        "english": "take a walk / stroll",
        "serbian": "šetati se / lagana šetnja",
        "exampleUse": "晚饭后散步 (šetnja posle večere)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "追赶",
        "pinyin": "zhuīgǎn",
        "vuk": "džuej-gan",
        "english": "chase / pursue",
        "serbian": "juriti / sustizati",
        "exampleUse": "追赶目标 (juriti za ciljem)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 210"
      },
      {
        "char": "越过",
        "pinyin": "yuèguò",
        "vuk": "jüe-guo",
        "english": "cross over / hurdle",
        "serbian": "preći preko / preskočiti prepreku",
        "exampleUse": "越过障碍 (savladati prepreku)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 180"
      },
      {
        "char": "跨步",
        "pinyin": "kuàbù",
        "vuk": "kua-bu",
        "english": "stride / step across",
        "serbian": "koračati krupnim koracima",
        "exampleUse": "大步跨步向前 (koračati napred)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 250"
      },
      {
        "char": "飞快",
        "pinyin": "fēikuài",
        "vuk": "fej-kuaj",
        "english": "flying fast / swiftly",
        "serbian": "munjevito / munjevito brzo",
        "exampleUse": "飞快地奔跑 (trčati munjevito)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 170"
      },
      {
        "char": "漫游",
        "pinyin": "mànyóu",
        "vuk": "man-jou",
        "english": "roam / wander freely",
        "serbian": "lutati / šetkarati u miru",
        "exampleUse": "漫游世界 (putovati svetom)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 260"
      },
      {
        "char": "攀爬",
        "pinyin": "pānpá",
        "vuk": "pan-pa",
        "english": "climb up / scale",
        "serbian": "pentrati se / penjati se",
        "exampleUse": "攀爬岩石 (penjati se uz stenu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 240"
      },
      {
        "char": "站立",
        "pinyin": "zhànlì",
        "vuk": "džan-li",
        "english": "stand upright",
        "serbian": "stajati uspravno",
        "exampleUse": "端正站立 (stajati uspravno i ponosno)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 150"
      },
      {
        "char": "暂停",
        "pinyin": "zàntíng",
        "vuk": "zan-ting",
        "english": "pause / suspend temporarily",
        "serbian": "pauzirati / kratak predah",
        "exampleUse": "暂停一下 (kratko pauzirati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 140"
      },
      {
        "char": "返回",
        "pinyin": "fǎnhuí",
        "vuk": "fan-huej",
        "english": "return / go back",
        "serbian": "vratiti se nazad",
        "exampleUse": "安全返回 (bezbedno se vratiti)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "前进",
        "pinyin": "qiánjìn",
        "vuk": "ćjen-đjin",
        "english": "advance / forge ahead",
        "serbian": "napredovati / ići napred",
        "exampleUse": "勇敢前进 (hrabro koračati napred)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 125"
      },
      {
        "char": "奔赴",
        "pinyin": "bēnfù",
        "vuk": "ben-fu",
        "english": "rush to / head towards",
        "serbian": "hitati ka / uputiti se",
        "exampleUse": "奔赴梦想 (hitati ka svom snu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 270"
      },
      {
        "char": "步伐",
        "pinyin": "bùfá",
        "vuk": "bu-fa",
        "english": "pace / stride / footstep",
        "serbian": "korak / tempo hoda",
        "exampleUse": "坚定的步伐 (čvrst korak)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "旅程",
        "pinyin": "lǚchéng",
        "vuk": "li-čeng",
        "english": "journey / expedition",
        "serbian": "putovanje / životno putovanje",
        "exampleUse": "开启全新旅程 (započeti novo putovanje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "抵达",
        "pinyin": "dǐdá",
        "vuk": "di-da",
        "english": "arrive at / reach destination",
        "serbian": "stići / prispeti",
        "exampleUse": "顺利抵达终点 (uspešno stići na cilj)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 165"
      },
      {
        "char": "跨越",
        "pinyin": "kuàyuè",
        "vuk": "kua-jüe",
        "english": "cross / leap over limits",
        "serbian": "premostiti / preskočiti granice",
        "exampleUse": "跨越极限 (prevazići sopstvene granice)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 175"
      },
      {
        "char": "坚持",
        "pinyin": "jiānchí",
        "vuk": "đjen-č",
        "english": "persist / persevere",
        "serbian": "istrajati / ne odustajati",
        "exampleUse": "坚持每天训练 (istrajati u svakodnevnom treningu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 60"
      },
      {
        "char": "停止",
        "pinyin": "tíngzhǐ",
        "vuk": "ting-dž",
        "english": "cease / halt",
        "serbian": "zaustaviti se / prekinuti",
        "exampleUse": "从不停止努力 (nikada ne prekidati trud)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 95"
      },
      {
        "char": "起步",
        "pinyin": "qǐbù",
        "vuk": "ći-bu",
        "english": "start walking / take initial step",
        "serbian": "krenuti / startovati",
        "exampleUse": "稳健起步 (stabilan start)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 190"
      },
      {
        "char": "转身",
        "pinyin": "zhuǎnshēn",
        "vuk": "džuan-šen",
        "english": "turn around",
        "serbian": "okrenuti se",
        "exampleUse": "华丽转身 (okrenuti se)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 145"
      },
      {
        "char": "追寻",
        "pinyin": "zhuīxún",
        "vuk": "džuej-sün",
        "english": "pursue / seek out",
        "serbian": "juriti za / slediti put",
        "exampleUse": "追寻内心的声音 (slediti glas srca)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 210"
      },
      {
        "char": "奔波",
        "pinyin": "bēnbō",
        "vuk": "ben-bo",
        "english": "rush about / toil on road",
        "serbian": "trčkarati / biti u pokretu",
        "exampleUse": "为生活奔波 (raditi i kretati se za život)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 240"
      },
      {
        "char": "跃起",
        "pinyin": "yuèqǐ",
        "vuk": "jüe-ći",
        "english": "leap up / spring up",
        "serbian": "poskočiti u vis",
        "exampleUse": "凌空跃起 (skočiti u vazduh)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 290"
      },
      {
        "char": "俯卧",
        "pinyin": "fǔwò",
        "vuk": "fu-vo",
        "english": "prone / push-up position",
        "serbian": "leći na stomak / položaj za sklek",
        "exampleUse": "俯卧撑 (sklekovi)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "跪拜",
        "pinyin": "guìbài",
        "vuk": "guej-baj",
        "english": "kneel in worship / bow",
        "serbian": "kleknuti i pokloniti se",
        "exampleUse": "虔诚跪拜 (dubok naklon sa poštovanjem)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 330"
      },
      {
        "char": "倒退",
        "pinyin": "dàotuì",
        "vuk": "dao-tuej",
        "english": "retreat / step backward",
        "serbian": "ići unazad / nazadovati",
        "exampleUse": "决不倒退 (nikada ne posustati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 260"
      },
      {
        "char": "返航",
        "pinyin": "fǎnháng",
        "vuk": "fan-hang",
        "english": "return to base / homeward journey",
        "serbian": "povratak u luku / povratak kući",
        "exampleUse": "安全返航 (bezbedan povratak)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 310"
      }
    ],
    "sentences": [
      {
        "id": "idm-16-1",
        "type": "proverb",
        "typeLabel": "励志名言 (Resilience & Getting Up)",
        "chinese": "跌倒了爬起来，失败是成功之母。",
        "pinyin": "Diē dǎo le pá qǐ lái, shī bài shì chéng gōng zhī mǔ.",
        "vuk": "Đje dao le pa ći laj, ši baj ši čeng gung dž mu.",
        "literalEnglish": "Fall down, climb back up; failure is the true mother of success.",
        "english": "Fall down seven times, stand up eight / Failure is the mother of success.",
        "serbianEquivalent": "Nije sramota pasti, sramota je ne ustati. / Na greškama se uči.",
        "serbian": "Kada posrneš i padneš, smesta ustani i nastavi; svaki pad i neuspeh su roditelji tvoje buduće pobede.",
        "philosophicalContext": "Temeljna stoička vrlina nesalomivosti: prepreke na putu nisu zid, već stepenice preko kojih gradiš snagu i karakter.",
        "targetWords": [
          "跌",
          "爬",
          "来",
          "走"
        ],
        "context": "Resilience & Rising • Ustajanje nakon pada",
        "tokens": [
          {
            "word": "跌倒了",
            "pinyin": "diē dǎo le",
            "english": "fell down",
            "serbian": "pao je",
            "isTarget": true
          },
          {
            "word": "爬起来",
            "pinyin": "pá qǐ lái",
            "english": "climb back up",
            "serbian": "ustani ponovo",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "失败",
            "pinyin": "shī bài",
            "english": "failure",
            "serbian": "poraz"
          },
          {
            "word": "是成功之母",
            "pinyin": "shì chéng gōng zhī mǔ",
            "english": "mother of success",
            "serbian": "majka uspeha"
          }
        ]
      },
      {
        "id": "idm-16-2",
        "type": "chengyu",
        "typeLabel": "励志成语 (Early Diligence Classic)",
        "chinese": "笨鸟先飞。",
        "pinyin": "Bèn niǎo xiān fēi.",
        "vuk": "Ben njao sjen fej.",
        "literalEnglish": "The clumsy bird must spread its wings and take flight first.",
        "english": "The slow bird takes an early start / Diligence overcomes lack of genius.",
        "serbianEquivalent": "Ko rano rani, dve sreće grabi. / Trud nadmašuje talenat.",
        "serbian": "Ptica koja je manje spretna mora ranije raširiti krila i poleteti pre drugih; rad i rana disciplina uvek pobeđuju čist talenat.",
        "philosophicalContext": "Iz dinastije Yuan. Nisi rođen kao genije? Nema problema: počni ranije od ostalih, treniraj marljivije i bićeš ispred.",
        "targetWords": [
          "飞",
          "鸟"
        ],
        "context": "Effort Over Talent • Trud pre talenta",
        "tokens": [
          {
            "word": "笨鸟",
            "pinyin": "bèn niǎo",
            "english": "clumsy bird",
            "serbian": "spora ptica"
          },
          {
            "word": "先飞",
            "pinyin": "xiān fēi",
            "english": "flies first",
            "serbian": "leti prva",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-16-3",
        "type": "chengyu",
        "typeLabel": "成语 (Superficiality Warning)",
        "chinese": "走马观花。",
        "pinyin": "Zǒu mǎ guān huā.",
        "vuk": "Zou ma guan hua.",
        "literalEnglish": "Looking at flowers from atop a galloping horse.",
        "english": "Gazing at flowers from horseback / Taking a cursory glance without depth.",
        "serbianEquivalent": "Letimičan pogled bez udubljivanja. / Protrčati kroz gradivo.",
        "serbian": "Posmatrati cveće dok jašeš u punom galopu; površno preleteti preko stvari umesto da zastaneš, udahneš i shvatiš suštinu.",
        "philosophicalContext": "Iz pesme Meng Jiaoa. Upozorenje protiv modernog skrolovanja i plitkog konzumiranja znanja. Mudrost traži sporost i dubinu.",
        "targetWords": [
          "走",
          "马",
          "花"
        ],
        "context": "Depth vs Haste • Dubina naspram površnosti",
        "tokens": [
          {
            "word": "走马",
            "pinyin": "zǒu mǎ",
            "english": "riding horse",
            "serbian": "jahati konja",
            "isTarget": true
          },
          {
            "word": "观花",
            "pinyin": "guān huā",
            "english": "view flowers",
            "serbian": "gledati cveće",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r7",
    "chartId": 2,
    "rowNumber": 7,
    "title": "Mind & Speech",
    "titleSerbian": "Komunikacija, Govor i Kognicija",
    "emoji": "🧠",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "Intellectual cognition, inquiry, answering, vocalization, listening, reflection, reading, and deep comprehension.",
    "words": [
      {
        "char": "问",
        "pinyin": "wèn",
        "vuk": "ven",
        "english": "ask / inquire",
        "serbian": "pitati / raspitati se",
        "exampleUse": "问题 (pitanje / problem)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 30"
      },
      {
        "char": "答",
        "pinyin": "dá",
        "vuk": "da",
        "english": "answer / reply",
        "serbian": "odgovoriti / rešenje",
        "exampleUse": "回答 (odgovoriti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 45"
      },
      {
        "char": "说",
        "pinyin": "shuō",
        "vuk": "šuo",
        "english": "speak / say",
        "serbian": "govoriti / kazati",
        "exampleUse": "说话 (govoriti)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 15"
      },
      {
        "char": "叫",
        "pinyin": "jiào",
        "vuk": "đjao",
        "english": "call / be named",
        "serbian": "zvati se / doviknuti",
        "exampleUse": "我叫... (zovem se...)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 25"
      },
      {
        "char": "听",
        "pinyin": "tīng",
        "vuk": "ting",
        "english": "listen / hear",
        "serbian": "slušati / čuti",
        "exampleUse": "听音乐 (slušati muziku)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 35"
      },
      {
        "char": "想",
        "pinyin": "xiǎng",
        "vuk": "sjang",
        "english": "think / miss / want",
        "serbian": "misliti / želeti / nedostajati",
        "exampleUse": "思考 (promišljati)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 20"
      },
      {
        "char": "念",
        "pinyin": "niàn",
        "vuk": "njen",
        "english": "read aloud / memorize",
        "serbian": "čitati naglas / sećati se",
        "exampleUse": "念书 (studirati / čitati)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 90"
      },
      {
        "char": "写",
        "pinyin": "xiě",
        "vuk": "sje",
        "english": "write / compose",
        "serbian": "pisati / sastavljati",
        "exampleUse": "写汉字 (pisati karaktere)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 40"
      },
      {
        "char": "读",
        "pinyin": "dú",
        "vuk": "du",
        "english": "read silently / study",
        "serbian": "čitati u sebi / učiti",
        "exampleUse": "读书 (čitati knjige)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 50"
      },
      {
        "char": "懂",
        "pinyin": "dǒng",
        "vuk": "dung",
        "english": "understand / comprehend",
        "serbian": "razumeti / shvatiti",
        "exampleUse": "懂了 (shvatio sam)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 40"
      },
      {
        "char": "问题",
        "pinyin": "wèntí",
        "vuk": "ven-ti",
        "english": "question / problem",
        "serbian": "pitanje / problem",
        "exampleUse": "没问题 (nema problema)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 30"
      },
      {
        "char": "回答",
        "pinyin": "huídá",
        "vuk": "huej-da",
        "english": "reply / response",
        "serbian": "odgovoriti / odgovor",
        "exampleUse": "认真回答 (pažljivo odgovoriti)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 55"
      },
      {
        "char": "想念",
        "pinyin": "xiǎngniàn",
        "vuk": "sjang-njen",
        "english": "miss / yearn for",
        "serbian": "nedostajati / misliti na",
        "exampleUse": "我很想念你 (veoma mi nedostaješ)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "写字",
        "pinyin": "xiězì",
        "vuk": "sje-ce",
        "english": "write characters",
        "serbian": "pisati karaktere",
        "exampleUse": "练习写汉字 (vežbati pisanje karaktera)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 85"
      },
      {
        "char": "读书",
        "pinyin": "dúshū",
        "vuk": "du-šu",
        "english": "read books / study",
        "serbian": "čitati knjige / studirati",
        "exampleUse": "静心读书 (čitati u miru)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "明白",
        "pinyin": "míngbai",
        "vuk": "ming-baj",
        "english": "understand clearly",
        "serbian": "razumeti jasno",
        "exampleUse": "我明白了 (jasno mi je)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 45"
      },
      {
        "char": "理解",
        "pinyin": "lǐjiě",
        "vuk": "li-đje",
        "english": "comprehend / empathy",
        "serbian": "razumevanje / saosećanje",
        "exampleUse": "互相理解 (međusobno razumevanje)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 70"
      },
      {
        "char": "思考",
        "pinyin": "sīkǎo",
        "vuk": "s-kao",
        "english": "ponder / reflect deeply",
        "serbian": "duboko promišljati / razmisliti",
        "exampleUse": "独立思考 (samostalno razmišljati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 80"
      },
      {
        "char": "记忆",
        "pinyin": "jìyì",
        "vuk": "đji-ji",
        "english": "memory / remember",
        "serbian": "pamćenje / memorija",
        "exampleUse": "增强记忆力 (ojačati pamćenje)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "讨论",
        "pinyin": "tǎolùn",
        "vuk": "tao-lun",
        "english": "discuss / debate",
        "serbian": "raspravljati / diskusija",
        "exampleUse": "共同讨论 (zajedno raspravljati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 85"
      },
      {
        "char": "交流",
        "pinyin": "jiāoliú",
        "vuk": "đjao-lju",
        "english": "communicate / exchange",
        "serbian": "komunicirati / razmena ideja",
        "exampleUse": "深度交流 (duboka komunikacija)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 75"
      },
      {
        "char": "倾听",
        "pinyin": "qīngtīng",
        "vuk": "ćing-ting",
        "english": "listen attentively",
        "serbian": "pažljivo slušati sagovornika",
        "exampleUse": "学会倾听别人 (naučiti da slušaš)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 145"
      },
      {
        "char": "领悟",
        "pinyin": "lǐngwù",
        "vuk": "ling-vu",
        "english": "comprehend / grasp wisdom",
        "serbian": "shvatiti suštinu / uvideti",
        "exampleUse": "领悟生命的真谛",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 190"
      },
      {
        "char": "阅读",
        "pinyin": "yuèdú",
        "vuk": "jüe-du",
        "english": "read / reading practice",
        "serbian": "čitanje / čitati literaturu",
        "exampleUse": "每天阅读三十分钟",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 80"
      },
      {
        "char": "写作",
        "pinyin": "xiězuò",
        "vuk": "sje-zuo",
        "english": "write / authorship",
        "serbian": "pisanje / autorstvo",
        "exampleUse": "坚持写作 (istrajati u pisanju)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "智慧",
        "pinyin": "zhìhuì",
        "vuk": "dži-huej",
        "english": "wisdom / intellect",
        "serbian": "mudrost / bistrina uma",
        "exampleUse": "古人的智慧 (mudrost starih)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "逻辑",
        "pinyin": "luójí",
        "vuk": "luo-đji",
        "english": "logic / logical",
        "serbian": "logika / logički",
        "exampleUse": "清晰的逻辑 (jasna logika)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "清楚",
        "pinyin": "qīngchu",
        "vuk": "ćing-ču",
        "english": "clear / distinct",
        "serbian": "jasno / razgovetno",
        "exampleUse": "看清楚 (jasno videti)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 50"
      },
      {
        "char": "沟通",
        "pinyin": "gōutōng",
        "vuk": "gou-tung",
        "english": "communicate / bridge gap",
        "serbian": "sporazumevanje / komunikacija",
        "exampleUse": "有效沟通 (efikasna komunikacija)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 85"
      },
      {
        "char": "概念",
        "pinyin": "gàiniàn",
        "vuk": "gaj-njen",
        "english": "concept / notion",
        "serbian": "pojam / koncept",
        "exampleUse": "核心概念 (ključni koncept)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "深入",
        "pinyin": "shēnrù",
        "vuk": "šen-ru",
        "english": "go deep / profound",
        "serbian": "ući duboko / temeljno",
        "exampleUse": "深入研究 (duboko istražiti)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 110"
      },
      {
        "char": "请问",
        "pinyin": "qǐngwèn",
        "vuk": "ćing-ven",
        "english": "excuse me, may I ask",
        "serbian": "izvinite, mogu li pitati",
        "exampleUse": "请问去车站怎么走？",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 45"
      },
      {
        "char": "提问",
        "pinyin": "tíwèn",
        "vuk": "ti-ven",
        "english": "pose question",
        "serbian": "postaviti pitanje",
        "exampleUse": "举手提问 (dići ruku i pitati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 130"
      },
      {
        "char": "懂事",
        "pinyin": "dǒngshì",
        "vuk": "dung-ši",
        "english": "sensible / mature",
        "serbian": "razuman / zreo",
        "exampleUse": "孩子很懂事 (dete je zrelo)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 170"
      },
      {
        "char": "思索",
        "pinyin": "sīsuǒ",
        "vuk": "s-suo",
        "english": "ponder / reflect deeply",
        "serbian": "duboko razmišljanje",
        "exampleUse": "静静思索 (tiho razmišljati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 210"
      },
      {
        "char": "默读",
        "pinyin": "mòdú",
        "vuk": "mo-du",
        "english": "read silently",
        "serbian": "čitati u sebi",
        "exampleUse": "安静默读 (čitati u tišini)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 280"
      },
      {
        "char": "朗读",
        "pinyin": "lǎngdú",
        "vuk": "lang-du",
        "english": "read aloud clearly",
        "serbian": "čitati naglas razgovetno",
        "exampleUse": "大声朗读课文",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 190"
      },
      {
        "char": "倾诉",
        "pinyin": "qīngsù",
        "vuk": "ćing-su",
        "english": "pour out heart / confide",
        "serbian": "izjadati se / poveriti se",
        "exampleUse": "向朋友倾诉 (poveriti se prijatelju)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 240"
      },
      {
        "char": "呼唤",
        "pinyin": "hūhuàn",
        "vuk": "hu-huan",
        "english": "call out / summon",
        "serbian": "dozivati / poziv",
        "exampleUse": "内心的呼唤 (unutrašnji poziv)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 220"
      },
      {
        "char": "笔迹",
        "pinyin": "bǐjì",
        "vuk": "bi-đji",
        "english": "handwriting",
        "serbian": "rukopis",
        "exampleUse": "优美的笔迹 (lep rukopis)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 290"
      },
      {
        "char": "博学",
        "pinyin": "bóxué",
        "vuk": "bo-süe",
        "english": "learned / erudite",
        "serbian": "erudita / širokog znanja",
        "exampleUse": "博学多才 (učen i talentovan)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 310"
      },
      {
        "char": "专心",
        "pinyin": "zhuānxīn",
        "vuk": "džuan-sin",
        "english": "concentrated / attentive",
        "serbian": "usredsređen / fokusiran",
        "exampleUse": "专心致志 (potpuno usredsređen)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 125"
      }
    ],
    "sentences": [
      {
        "id": "idm-17-1",
        "type": "proverb",
        "typeLabel": "论语名言 (Analects of Confucius)",
        "chinese": "温故而知新，可以为师矣。",
        "pinyin": "Wēn gù ér zhī xīn, kě yǐ wéi shī yǐ.",
        "vuk": "Ven gu er dži sin, ke ji vej ši ji.",
        "literalEnglish": "Reviewing the old to discover the new qualifies one to be a true teacher.",
        "english": "Review the old to understand the new / Practice deepens comprehension.",
        "serbianEquivalent": "Ponavljanje je majka mudrosti. / Ko obnavlja staro, otkriva novo.",
        "serbian": "Onaj ko neprestano obnavlja naučeno i kroz to otkriva dublje, sveže uvide, dostojan je da bude učitelj drugima.",
        "philosophicalContext": "Konfučijansko učenje o trajnoj reviziji: majstorstvo ne leži u jurnjavi za novotarijama, već u dubokom ponovnom razumevanju osnova.",
        "targetWords": [
          "知",
          "想",
          "学"
        ],
        "context": "Mastery Through Review • Ponavljanje i uvid",
        "tokens": [
          {
            "word": "温故",
            "pinyin": "wēn gù",
            "english": "review old",
            "serbian": "obnavljati staro"
          },
          {
            "word": "而知新",
            "pinyin": "ér zhī xīn",
            "english": "to know new",
            "serbian": "da bi spoznao novo",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "可以为师",
            "pinyin": "kě yǐ wéi shī",
            "english": "can be teacher",
            "serbian": "može biti učitelj"
          }
        ]
      },
      {
        "id": "idm-17-2",
        "type": "chengyu",
        "typeLabel": "成语 (Humility in Questioning)",
        "chinese": "不耻下问。",
        "pinyin": "Bù chǐ xià wèn.",
        "vuk": "Bu č sja ven.",
        "literalEnglish": "Not feeling ashamed to ask those below you.",
        "english": "Not ashamed to learn from anyone / Eager to ask questions without false pride.",
        "serbianEquivalent": "Ko pita ne skita. / Nije sramota pitati onoga ko zna više.",
        "serbian": "Ne stideti se da postaviš pitanje i učiš od bilo koga bez obzira na njegov status; odsustvo sujete pred istinom.",
        "philosophicalContext": "Iz Konfučijevih Razgovora. Sujeta i strah od toga kako izgledaš pred drugima su najveći neprijatelji učenja. Pitaj i shvatićeš.",
        "targetWords": [
          "问",
          "不",
          "下"
        ],
        "context": "Humility in Learning • Pitati bez sujete",
        "tokens": [
          {
            "word": "不耻",
            "pinyin": "bù chǐ",
            "english": "not ashamed",
            "serbian": "ne stideti se",
            "isTarget": true
          },
          {
            "word": "下问",
            "pinyin": "xià wèn",
            "english": "ask below",
            "serbian": "pitati i mlađe",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-17-3",
        "type": "chengyu",
        "typeLabel": "成语 (Stoic Prudence in Deliberation)",
        "chinese": "深思熟虑。",
        "pinyin": "Shēn sī shú lǜ.",
        "vuk": "Šen s šu li.",
        "literalEnglish": "Deep thinking and mature, thorough deliberation.",
        "english": "Think deeply and deliberate thoroughly / Look before you leap.",
        "serbianEquivalent": "Triput meri, jednom seci. / Dobro razmisli pre nego što doneseš odluku.",
        "serbian": "Temeljno promisliti, zrelo odmeriti sve okolnosti pre donošenja odluke i stupanja u akciju.",
        "philosophicalContext": "Iz Chu Ci zbirke. Suprotno impulsivnosti: daj sebi prostora da sagledaš širu sliku pre nego što reaguješ.",
        "targetWords": [
          "想",
          "懂"
        ],
        "context": "Prudence & Deliberation • Zrelo promišljanje",
        "tokens": [
          {
            "word": "深思",
            "pinyin": "shēn sī",
            "english": "deep thinking",
            "serbian": "duboko razmišljanje",
            "isTarget": true
          },
          {
            "word": "熟虑",
            "pinyin": "shú lǜ",
            "english": "mature consideration",
            "serbian": "zrela procena"
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r8",
    "chartId": 2,
    "rowNumber": 8,
    "title": "Emotions & Sensations",
    "titleSerbian": "Emocije, Bol i Unutrašnji Osećaji",
    "emoji": "🎭",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "The internal affective landscape, sorrow, laughter, fear, wrath, shock, physical ache, joy, and existential worry.",
    "words": [
      {
        "char": "哭",
        "pinyin": "kū",
        "vuk": "ku",
        "english": "cry / weep",
        "serbian": "plakati",
        "exampleUse": "痛哭 (gorko plakati)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 70"
      },
      {
        "char": "笑",
        "pinyin": "xiào",
        "vuk": "sjao",
        "english": "laugh / smile",
        "serbian": "smejati se / osmehivati se",
        "exampleUse": "微笑 (osmeh)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 45"
      },
      {
        "char": "怕",
        "pinyin": "pà",
        "vuk": "pa",
        "english": "fear / dread",
        "serbian": "bojati se / strahovati",
        "exampleUse": "害怕 (plašiti se)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 40"
      },
      {
        "char": "怒",
        "pinyin": "nù",
        "vuk": "nu",
        "english": "anger / rage",
        "serbian": "gnev / bes",
        "exampleUse": "愤怒 (bes / srdžba)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "恨",
        "pinyin": "hèn",
        "vuk": "hen",
        "english": "hate / regret",
        "serbian": "mržnja / žaljenje",
        "exampleUse": "遗憾 (žaljenje)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 130"
      },
      {
        "char": "惊",
        "pinyin": "jīng",
        "vuk": "đjing",
        "english": "shock / surprise / startle",
        "serbian": "šok / iznenađenje",
        "exampleUse": "吃惊 (iznenaditi se)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 95"
      },
      {
        "char": "疼",
        "pinyin": "téng",
        "vuk": "teng",
        "english": "ache / sore / hurt",
        "serbian": "boleti / bol",
        "exampleUse": "头疼 (glavobolja)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 75"
      },
      {
        "char": "痒",
        "pinyin": "yǎng",
        "vuk": "jang",
        "english": "itch / tickle",
        "serbian": "svrab / svrbeti",
        "exampleUse": "身上痒 (svrab na telu)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 240"
      },
      {
        "char": "乐",
        "pinyin": "lè",
        "vuk": "le",
        "english": "joy / music / happy",
        "serbian": "radost / sreća / muzika",
        "exampleUse": "快乐 (sreća)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 30"
      },
      {
        "char": "愁",
        "pinyin": "chóu",
        "vuk": "čou",
        "english": "worry / sorrow",
        "serbian": "briga / tuga",
        "exampleUse": "发愁 (brinuti se)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "开心",
        "pinyin": "kāixīn",
        "vuk": "kaj-sin",
        "english": "joyful / cheerful",
        "serbian": "srećan / veseo",
        "exampleUse": "今天很开心 (danas sam srećan)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 45"
      },
      {
        "char": "害怕",
        "pinyin": "hàipà",
        "vuk": "haj-pa",
        "english": "afraid / scared",
        "serbian": "uplašen / bojati se",
        "exampleUse": "不要害怕未知 (ne plaši se nepoznatog)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "发怒",
        "pinyin": "fānù",
        "vuk": "fa-nu",
        "english": "fly into rage / become furious",
        "serbian": "razbesneti se / planuti",
        "exampleUse": "不要轻易发怒 (nemoj lako planuti)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 160"
      },
      {
        "char": "痛苦",
        "pinyin": "tòngkǔ",
        "vuk": "tung-ku",
        "english": "pain / suffering",
        "serbian": "bol / patnja",
        "exampleUse": "战胜内心的痛苦 (pobediti bol)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 110"
      },
      {
        "char": "头疼",
        "pinyin": "tóuténg",
        "vuk": "tou-teng",
        "english": "headache / headache problem",
        "serbian": "glavobolja",
        "exampleUse": "工作令人头疼",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 115"
      },
      {
        "char": "快乐",
        "pinyin": "kuàilè",
        "vuk": "kuaj-le",
        "english": "happy / joyful",
        "serbian": "srećan / radostan",
        "exampleUse": "祝你健康快乐 (želim ti zdravlje i radost)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 50"
      },
      {
        "char": "吃惊",
        "pinyin": "chījīng",
        "vuk": "č-đjing",
        "english": "surprised / astonished",
        "serbian": "iznenađen / zaprepašćen",
        "exampleUse": "让人感到吃惊",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 100"
      },
      {
        "char": "愤怒",
        "pinyin": "fènnù",
        "vuk": "fen-nu",
        "english": "fury / rage",
        "serbian": "bes / gnev",
        "exampleUse": "平息心中的愤怒 (umiriti gnev)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "轻松",
        "pinyin": "qīngsōng",
        "vuk": "ćing-sung",
        "english": "relaxed / lighthearted",
        "serbian": "opušten / rasterećen",
        "exampleUse": "感觉非常轻松 (osećati se opušteno)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 80"
      },
      {
        "char": "焦虑",
        "pinyin": "jiāolǜ",
        "vuk": "đjao-li",
        "english": "anxiety / anxious",
        "serbian": "anksioznost / nemir",
        "exampleUse": "缓解焦虑情绪 (ublažiti anksioznost)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "微笑",
        "pinyin": "wēixiào",
        "vuk": "vej-sjao",
        "english": "smile gently",
        "serbian": "blag osmeh",
        "exampleUse": "带着微笑面对生活",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 90"
      },
      {
        "char": "惊喜",
        "pinyin": "jīngxǐ",
        "vuk": "đjing-si",
        "english": "pleasant surprise",
        "serbian": "prijatno iznenađenje",
        "exampleUse": "收到一份大惊喜",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 120"
      },
      {
        "char": "宽恕",
        "pinyin": "kuānshù",
        "vuk": "kuan-šu",
        "english": "forgive / pardon",
        "serbian": "oprostiti / oproštaj",
        "exampleUse": "宽恕过去的错误 (oprostiti prošle greške)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 210"
      },
      {
        "char": "情绪",
        "pinyin": "qíngxù",
        "vuk": "ćing-sü",
        "english": "emotion / sentiment",
        "serbian": "emocija / raspoloženje",
        "exampleUse": "管理好自己的情绪 (vladati emocijama)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 90"
      },
      {
        "char": "感受",
        "pinyin": "gǎnshòu",
        "vuk": "gan-šou",
        "english": "feel / perception",
        "serbian": "osetiti / unutrašnji doživljaj",
        "exampleUse": "深刻的身体感受 (dubok telesni osećaj)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "镇定",
        "pinyin": "zhèndìng",
        "vuk": "džen-ding",
        "english": "calm / composed under pressure",
        "serbian": "pribran / smiren pod pritiskom",
        "exampleUse": "保持头脑镇定 (zadržati bistru glavu)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 190"
      },
      {
        "char": "自控",
        "pinyin": "zìkòng",
        "vuk": "ce-kung",
        "english": "self-control",
        "serbian": "samokontrola / vladanje sobom",
        "exampleUse": "极强的自控力 (jaka samokontrola)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "释怀",
        "pinyin": "shìhuái",
        "vuk": "ši-huaj",
        "english": "release burden / let go of grudge",
        "serbian": "osloboditi se tereta / oprostiti sebi",
        "exampleUse": "终于彻底释怀 (napokon otpustiti teret)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 220"
      },
      {
        "char": "慰藉",
        "pinyin": "wèijiè",
        "vuk": "vej-đje",
        "english": "comfort / solace",
        "serbian": "uteha / duševni mir",
        "exampleUse": "心灵的温暖慰藉",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 280"
      },
      {
        "char": "大笑",
        "pinyin": "dàxiào",
        "vuk": "da-sjao",
        "english": "laugh out loud",
        "serbian": "grohotom se smejati",
        "exampleUse": "开怀大笑 (smejati se od srca)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 130"
      },
      {
        "char": "哭泣",
        "pinyin": "kūqì",
        "vuk": "ku-ći",
        "english": "weep silently / cry",
        "serbian": "jecati / plakati",
        "exampleUse": "无声地哭泣 (tiho plakati)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 160"
      },
      {
        "char": "忍耐",
        "pinyin": "rěnnài",
        "vuk": "žen-naj",
        "english": "endure / patience",
        "serbian": "trpeljivost / strpljenje",
        "exampleUse": "坚强的忍耐力 (čvrsta trpeljivost)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 145"
      },
      {
        "char": "心平气和",
        "pinyin": "xīnpíng qìhé",
        "vuk": "sin-ping ći-he",
        "english": "calm and peaceful state",
        "serbian": "mirno srce i staložen dah",
        "exampleUse": "心平气和地交谈",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 150"
      },
      {
        "char": "欢喜",
        "pinyin": "huānxǐ",
        "vuk": "huan-si",
        "english": "delight / rejoice",
        "serbian": "radost / veselje",
        "exampleUse": "充满由衷的欢喜",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "发愁",
        "pinyin": "fāchóu",
        "vuk": "fa-čou",
        "english": "worry / brood",
        "serbian": "mučiti muku / brinuti se",
        "exampleUse": "别为琐事发愁 (ne brini o sitnicama)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 160"
      },
      {
        "char": "悲伤",
        "pinyin": "bēishāng",
        "vuk": "bej-šang",
        "english": "sadness / sorrow",
        "serbian": "tuga / žalost",
        "exampleUse": "走出悲伤 (izaći iz tuge)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 130"
      },
      {
        "char": "压抑",
        "pinyin": "yāyì",
        "vuk": "ja-ji",
        "english": "suppress / feel oppressed",
        "serbian": "potiskivati / teskoba",
        "exampleUse": "释放压抑的情绪",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 185"
      },
      {
        "char": "惊慌",
        "pinyin": "jīnghuāng",
        "vuk": "đjing-huang",
        "english": "panic / alarmed",
        "serbian": "panika / uplašenost",
        "exampleUse": "遇到问题不惊慌",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 195"
      },
      {
        "char": "坚强",
        "pinyin": "jiānqiáng",
        "vuk": "đjen-ćjang",
        "english": "strong / mentally tough",
        "serbian": "jak / psihički nesalomiv",
        "exampleUse": "内心无比坚强 (mentalno nesalomiv)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 95"
      },
      {
        "char": "痛快",
        "pinyin": "tòngkuai",
        "vuk": "tung-kuaj",
        "english": "delighted / frank / straightforward",
        "serbian": "osvežavajuće / bez okolišanja",
        "exampleUse": "痛快地锻炼一场 (odraditi žestok trening)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 155"
      },
      {
        "char": "酸痛",
        "pinyin": "suāntòng",
        "vuk": "suan-tung",
        "english": "soreness / muscular ache",
        "serbian": "upala mišića / bolnost",
        "exampleUse": "训练后的肌肉酸痛",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "知足",
        "pinyin": "zhīzú",
        "vuk": "dži-cu",
        "english": "contented / satisfied with what one has",
        "serbian": "zahvalan na onome što ima",
        "exampleUse": "知足常乐 (zahvalnost donosi trajnu radost)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 140"
      }
    ],
    "sentences": [
      {
        "id": "idm-18-1",
        "type": "chengyu",
        "typeLabel": "成语 (Stoic Moderation Warning)",
        "chinese": "乐极生悲。",
        "pinyin": "Lè jí shēng bēi.",
        "vuk": "Le đji šeng bej.",
        "literalEnglish": "When extreme joy peaks, sorrow is born.",
        "english": "Extreme joy begets sorrow / Moderation in all emotions.",
        "serbianEquivalent": "Ko se suviše smeje, posle plače. / Umerenost u svemu.",
        "serbian": "Kada nekontrolisana euforija dosegne vrhunac, iz nje se rađa tuga; stoičko podsećanje na emocionalnu umerenost i trezvenost.",
        "philosophicalContext": "Iz Huainanzi spisa. Održavaj unutrašnji mir: ni u uspehu ne gubi tlo pod nogama, niti u padu gubi nadu.",
        "targetWords": [
          "乐",
          "生"
        ],
        "context": "Emotional Moderation • Umerenost emocija",
        "tokens": [
          {
            "word": "乐极",
            "pinyin": "lè jí",
            "english": "joy extreme",
            "serbian": "preterana radost",
            "isTarget": true
          },
          {
            "word": "生悲",
            "pinyin": "shēng bēi",
            "english": "births sorrow",
            "serbian": "rađa tugu",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-18-2",
        "type": "chengyu",
        "typeLabel": "成语 (Emotional Rebound)",
        "chinese": "破涕为笑。",
        "pinyin": "Pò tì wéi xiào.",
        "vuk": "Po ti vej sjao.",
        "literalEnglish": "Breaking through tears into a radiant smile.",
        "english": "Smile through tears / Turning tears into laughter.",
        "serbianEquivalent": "Nakon suza osmeh najlepše sija. / Obrisati suze i nasmešiti se.",
        "serbian": "Obrisati suze i odjednom se iskreno nasmešiti; prelazak iz tuge u olakšanje i snagu.",
        "philosophicalContext": "Iz dinastije Song. Tuga i bol nisu trajni zatvor. Jedan trenutak spoznaje dovoljan je da vrati svetlost na tvoje lice.",
        "targetWords": [
          "笑",
          "哭"
        ],
        "context": "Emotional Resilience • Osmeh kroz suze",
        "tokens": [
          {
            "word": "破涕",
            "pinyin": "pò tì",
            "english": "break tears",
            "serbian": "prekinuti suze"
          },
          {
            "word": "为笑",
            "pinyin": "wéi xiào",
            "english": "turn to smile",
            "serbian": "nasmešiti se",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-18-3",
        "type": "chengyu",
        "typeLabel": "成语 (Equanimous Breath & Heart)",
        "chinese": "心平气和。",
        "pinyin": "Xīn píng qì hé.",
        "vuk": "Sin ping ći he.",
        "literalEnglish": "Heart is peaceful, vital breath is completely harmonious.",
        "english": "Peace of mind and even breath / In a serene and tranquil frame of mind.",
        "serbianEquivalent": "Sačuvati hladnu glavu. / Mirne duše i mirnog daha.",
        "serbian": "Mirno srce i blag, uravnotežen dah; stanje savršenog unutrašnjeg mira u kome nijedna spoljašnja provokacija ne može poremetiti tvoj fokus.",
        "philosophicalContext": "Klasični WiseFit ideal disanja i meditacije: sinhronizacija pulsa (HRV) i daha stvara nepokolebljivo stanje duha.",
        "targetWords": [
          "心",
          "气"
        ],
        "context": "Inner Calm & Breathwork • Mirno srce i dah",
        "tokens": [
          {
            "word": "心平",
            "pinyin": "xīn píng",
            "english": "heart peaceful",
            "serbian": "mirno srce",
            "isTarget": true
          },
          {
            "word": "气和",
            "pinyin": "qì hé",
            "english": "breath harmonious",
            "serbian": "skladan dah",
            "isTarget": true
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r9",
    "chartId": 2,
    "rowNumber": 9,
    "title": "Destiny & Perception",
    "titleSerbian": "Metafizika, Sudbina i Opažanje",
    "emoji": "✨",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "Destiny, cyclical fortunes, ethereal spirits, dreams, light, shadow, acoustics, and sensory flavors.",
    "words": [
      {
        "char": "命",
        "pinyin": "mìng",
        "vuk": "ming",
        "english": "life / fate / destiny",
        "serbian": "život / sudbina",
        "exampleUse": "命运 (sudbina)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 70"
      },
      {
        "char": "运",
        "pinyin": "yùn",
        "vuk": "jin",
        "english": "fortune / move / transport",
        "serbian": "sreća / kretanje / transport",
        "exampleUse": "运气 (sreća / tok sudbine)",
        "isCoreChar": true,
        "category": "verb",
        "frequencyRank": "Top 65"
      },
      {
        "char": "气",
        "pinyin": "qì",
        "vuk": "ći",
        "english": "energy / breath / qi",
        "serbian": "vitalna energija / dah / či",
        "exampleUse": "元气 (izvorna životna snaga)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 35"
      },
      {
        "char": "魂",
        "pinyin": "hún",
        "vuk": "hun",
        "english": "soul / spirit",
        "serbian": "duša / duh",
        "exampleUse": "灵魂 (duša)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "梦",
        "pinyin": "mèng",
        "vuk": "meng",
        "english": "dream / vision",
        "serbian": "san / vizija",
        "exampleUse": "梦想 (san / težnja)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "影",
        "pinyin": "yǐng",
        "vuk": "jing",
        "english": "shadow / reflection / film",
        "serbian": "senka / odraz / film",
        "exampleUse": "影子 (senka)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "光",
        "pinyin": "guāng",
        "vuk": "guang",
        "english": "light / ray / honor",
        "serbian": "svetlost / sjaj / zrak",
        "exampleUse": "阳光 (sunčeva svetlost)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 50"
      },
      {
        "char": "暗",
        "pinyin": "àn",
        "vuk": "an",
        "english": "dark / hidden / dim",
        "serbian": "mračno / skriveno / tamno",
        "exampleUse": "黑暗 (tama)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 120"
      },
      {
        "char": "声",
        "pinyin": "shēng",
        "vuk": "šeng",
        "english": "sound / voice",
        "serbian": "zvuk / glas",
        "exampleUse": "声音 (zvuk / glas)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 45"
      },
      {
        "char": "味",
        "pinyin": "wèi",
        "vuk": "vej",
        "english": "taste / smell / meaning",
        "serbian": "ukus / miris / smisao",
        "exampleUse": "味道 (ukus)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "命运",
        "pinyin": "mìngyùn",
        "vuk": "ming-jin",
        "english": "destiny / fate",
        "serbian": "sudbina / udes",
        "exampleUse": "把握自己的命运 (uzeti sudbinu u svoje ruke)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "运气",
        "pinyin": "yùnqi",
        "vuk": "jin-ći",
        "english": "luck / fortune",
        "serbian": "sreća / povoljan sticaj okolnosti",
        "exampleUse": "祝你好运气 (želim ti dobru sreću)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "梦想",
        "pinyin": "mèngxiǎng",
        "vuk": "meng-sjang",
        "english": "dream / aspirational goal",
        "serbian": "san / životni ideal",
        "exampleUse": "坚持追求梦想 (pratiti svoj san)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 55"
      },
      {
        "char": "影子",
        "pinyin": "yǐngzi",
        "vuk": "jing-ce",
        "english": "shadow / reflection",
        "serbian": "senka",
        "exampleUse": "拉长的影子 (izdužena senka)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "光芒",
        "pinyin": "guāngmáng",
        "vuk": "guang-mang",
        "english": "rays of light / radiance",
        "serbian": "zraci svetlosti / sjaj",
        "exampleUse": "散发耀眼光芒 (isijavati sjaj)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "声音",
        "pinyin": "shēngyīn",
        "vuk": "šeng-jin",
        "english": "voice / acoustic sound",
        "serbian": "glas / zvuk",
        "exampleUse": "美妙的声音 (lep glas)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 60"
      },
      {
        "char": "灵魂",
        "pinyin": "línghún",
        "vuk": "ling-hun",
        "english": "soul / spirit / inner core",
        "serbian": "duša / unutrašnje biće",
        "exampleUse": "纯净的灵魂 (čista duša)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 125"
      },
      {
        "char": "觉醒",
        "pinyin": "juéxǐng",
        "vuk": "đjüe-sing",
        "english": "awaken / realization",
        "serbian": "probuđenje / osvešćenje",
        "exampleUse": "意识觉醒 (buđenje svesti)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 170"
      },
      {
        "char": "直觉",
        "pinyin": "zhíjué",
        "vuk": "dž-đjüe",
        "english": "intuition / gut feeling",
        "serbian": "intuicija / predosećaj",
        "exampleUse": "相信自己的直觉 (veruj svojoj intuiciji)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "感知",
        "pinyin": "gǎnzhī",
        "vuk": "gan-dži",
        "english": "perceive / awareness",
        "serbian": "opažati / percepcija",
        "exampleUse": "感知身体的变化 (osetiti promene u telu)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 190"
      },
      {
        "char": "幻象",
        "pinyin": "huànxiàng",
        "vuk": "huan-sjang",
        "english": "illusion / phantasm",
        "serbian": "iluzija / privid",
        "exampleUse": "看透虚幻的表象",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 260"
      },
      {
        "char": "现实",
        "pinyin": "xiànshí",
        "vuk": "sjen-ši",
        "english": "reality / real world",
        "serbian": "stvarnost / realnost",
        "exampleUse": "立足现实 (čvrsto stajati u realnosti)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "启示",
        "pinyin": "qǐshì",
        "vuk": "ći-ši",
        "english": "inspiration / revelation",
        "serbian": "prosvetljenje / otkrovenje",
        "exampleUse": "获得重要启示 (dobiti važan uvid)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      },
      {
        "char": "阴影",
        "pinyin": "yīnyǐng",
        "vuk": "jin-jing",
        "english": "shadow / psychological gloom",
        "serbian": "senka / senke prošlosti",
        "exampleUse": "走出内心的阴影 (izaći iz senke)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 195"
      },
      {
        "char": "沉静",
        "pinyin": "chénjìng",
        "vuk": "čen-đjing",
        "english": "deep calm / quiet poise",
        "serbian": "dubok mir / staloženost",
        "exampleUse": "保持沉静与专注",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 240"
      },
      {
        "char": "响亮",
        "pinyin": "xiǎngliàng",
        "vuk": "sjang-ljang",
        "english": "sonorous / loud and clear",
        "serbian": "zvonak / jasan i glasan",
        "exampleUse": "响亮的声音 (zvuk koji odzvanja)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 210"
      },
      {
        "char": "气魄",
        "pinyin": "qìpò",
        "vuk": "ći-po",
        "english": "boldness / grandeur of spirit",
        "serbian": "odvažnost duha / širina zamaha",
        "exampleUse": "非凡的气魄 (izuzetna smelost)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 230"
      },
      {
        "char": "气场",
        "pinyin": "qìchǎng",
        "vuk": "ći-čang",
        "english": "aura / energy field / presence",
        "serbian": "aura / harizma / prisustvo",
        "exampleUse": "强大的气场 (moćno prisustvo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 220"
      },
      {
        "char": "精神",
        "pinyin": "jīngshén",
        "vuk": "đjing-šen",
        "english": "spirit / mind / vitality",
        "serbian": "duh / energija / mentalna snaga",
        "exampleUse": "有精神 (pun elana i duha)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 65"
      },
      {
        "char": "意义",
        "pinyin": "yìyì",
        "vuk": "ji-ji",
        "english": "meaning / significance",
        "serbian": "smisao / značenje",
        "exampleUse": "寻找生活的意义 (tražiti smisao života)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 75"
      },
      {
        "char": "超越",
        "pinyin": "chāoyuè",
        "vuk": "čao-jüe",
        "english": "transcend / surpass",
        "serbian": "prevazići / transcendirati",
        "exampleUse": "超越自我 (prevazići sebe)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 115"
      },
      {
        "char": "洞察",
        "pinyin": "dòngchá",
        "vuk": "dung-ča",
        "english": "insight / discern deeply",
        "serbian": "pronicljivost / uvid",
        "exampleUse": "洞察事物本质 (uvideti suštinu stvari)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 230"
      },
      {
        "char": "奇迹",
        "pinyin": "qíjì",
        "vuk": "ći-đji",
        "english": "miracle / wonder",
        "serbian": "čudo / podvig",
        "exampleUse": "创造生命的奇迹",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 145"
      },
      {
        "char": "气息",
        "pinyin": "qìxī",
        "vuk": "ći-si",
        "english": "breath / aura",
        "serbian": "dah / strujanje vazduha",
        "exampleUse": "感受生命的自然气息",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "回响",
        "pinyin": "huíxiǎng",
        "vuk": "huej-sjang",
        "english": "echo / reverberation",
        "serbian": "odjek / eho",
        "exampleUse": "在山谷中回响",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 250"
      },
      {
        "char": "明暗",
        "pinyin": "míng'àn",
        "vuk": "ming-an",
        "english": "light and shade / chiaroscuro",
        "serbian": "svetlo i senka",
        "exampleUse": "明暗交织 (preplitanje svetla i senke)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 270"
      },
      {
        "char": "韵味",
        "pinyin": "yùnwèi",
        "vuk": "jin-vej",
        "english": "charm / lasting flavor",
        "serbian": "šarm / dubok prizvuk",
        "exampleUse": "独特的文化韵味",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 260"
      },
      {
        "char": "本源",
        "pinyin": "běnyuán",
        "vuk": "ben-jüan",
        "english": "primal source / origin",
        "serbian": "prvobitni izvor / koren",
        "exampleUse": "探寻万物的本源",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 280"
      },
      {
        "char": "命理",
        "pinyin": "mìnglǐ",
        "vuk": "ming-li",
        "english": "principles of fate / cosmic law",
        "serbian": "zakoni sudbine i kosmosa",
        "exampleUse": "研究自然命理",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 340"
      },
      {
        "char": "回甘",
        "pinyin": "huígān",
        "vuk": "huej-gan",
        "english": "sweet aftertaste (of fine tea)",
        "serbian": "slatki naknadni ukus (dobrog čaja)",
        "exampleUse": "好茶入口回甘 (vrhunski čaj ostavlja sladak trag)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 330"
      },
      {
        "char": "幻境",
        "pinyin": "huànjìng",
        "vuk": "huan-đjing",
        "english": "dreamland / fantasy realm",
        "serbian": "svet snova / carstvo mašte",
        "exampleUse": "如入神秘幻境",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 310"
      },
      {
        "char": "心声",
        "pinyin": "xīnshēng",
        "vuk": "sin-šeng",
        "english": "inner voice / heart's aspiration",
        "serbian": "glas srca / unutrašnja težnja",
        "exampleUse": "倾听自己真实的心声",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      }
    ],
    "sentences": [
      {
        "id": "idm-19-1",
        "type": "proverb",
        "typeLabel": "民间俗语 (Providence & Good Deeds)",
        "chinese": "吉人自有天相。",
        "pinyin": "Jí rén zì yǒu tiān xiàng.",
        "vuk": "Đji žen ce jou tjen sjang.",
        "literalEnglish": "The benevolent person will naturally receive heavenly assistance.",
        "english": "Heaven protects the worthy and benevolent / Good people prevail.",
        "serbianEquivalent": "Ko dobro čini, boljem se nada. / Pravda uvek pobeđuje.",
        "serbian": "Čovek čistog srca i ispravnih dela uvek ima podršku višeg poretka i prirode; vrlina nosi svoju zaštitu.",
        "philosophicalContext": "Potiče iz tradicije kineske metafizike. Stoička vrlina je sama sebi nagrada: kada živiš pravedno i disciplinovano, kosmos radi u tvoju korist.",
        "targetWords": [
          "天",
          "人",
          "有"
        ],
        "context": "Cosmic Justice & Virtue • Vrlina donosi zaštitu",
        "tokens": [
          {
            "word": "吉人",
            "pinyin": "jí rén",
            "english": "benevolent person",
            "serbian": "dobar čovek"
          },
          {
            "word": "自有",
            "pinyin": "zì yǒu",
            "english": "naturally has",
            "serbian": "prirodno ima",
            "isTarget": true
          },
          {
            "word": "天相",
            "pinyin": "tiān xiàng",
            "english": "heavenly aid",
            "serbian": "nebesku pomoć",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-19-2",
        "type": "chengyu",
        "typeLabel": "成语 (Sudden Awakening Classic)",
        "chinese": "如梦初醒。",
        "pinyin": "Rú mèng chū xǐng.",
        "vuk": "Ru meng ču sing.",
        "literalEnglish": "As if newly awakened from a deep dream.",
        "english": "As if awakening from a dream / Sudden epiphany and clarity.",
        "serbianEquivalent": "Kao da su mi spale naočare. / Otvorile su mi se oči.",
        "serbian": "Kao tek probuđen iz dugog sna; trenutak iznenadnog prosvetljenja u kome sve iluzije nestaju i istina postaje kristalno jasna.",
        "philosophicalContext": "Iz Zhuangzijeve filozofije o snu leptira. Većina ljudi živi u polu-snu automatizma; svesno prisustvo je pravo buđenje.",
        "targetWords": [
          "梦",
          "光"
        ],
        "context": "Awakening & Epiphany • Probuđenje iz sna",
        "tokens": [
          {
            "word": "如梦",
            "pinyin": "rú mèng",
            "english": "as in dream",
            "serbian": "kao u snu",
            "isTarget": true
          },
          {
            "word": "初醒",
            "pinyin": "chū xǐng",
            "english": "newly awake",
            "serbian": "tek probuđen"
          }
        ]
      },
      {
        "id": "idm-19-3",
        "type": "chengyu",
        "typeLabel": "兵法成语 (Sun Tzu Strategic Deception)",
        "chinese": "声东击西。",
        "pinyin": "Shēng dōng jī xī.",
        "vuk": "Šeng dung đji si.",
        "literalEnglish": "Make sound in the east, strike in the west.",
        "english": "Make noise in the east, strike in the west / Strategic feint.",
        "serbianEquivalent": "Baci prašinu u oči. / Pripremati udarac s neočekivane strane.",
        "serbian": "Napraviti buku na istoku, a zadati ključan udarac na zapadu; majstorsko usmeravanje pažnje protivnika na sporednu tačku.",
        "philosophicalContext": "Iz 36 kineskih strategija. U treningu i životu: nemoj rasipati energiju frontalno na prepreku — pronađi ugao gde otpor ne postoji.",
        "targetWords": [
          "声",
          "东"
        ],
        "context": "Sun Tzu Strategy • Strateško usmeravanje",
        "tokens": [
          {
            "word": "声东",
            "pinyin": "shēng dōng",
            "english": "sound east",
            "serbian": "buka na istoku",
            "isTarget": true
          },
          {
            "word": "击西",
            "pinyin": "jī xī",
            "english": "strike west",
            "serbian": "udar na zapadu"
          }
        ]
      }
    ]
  },
  {
    "id": "c2-r10",
    "chartId": 2,
    "rowNumber": 10,
    "title": "Space & Boundaries",
    "titleSerbian": "Prostorni Odnosi, Granice i Orijentacija",
    "emoji": "🌐",
    "chartImage": "/assets/aistudio/image_878c0d94.png",
    "description": "Spatial vectors, interior sanctum, external horizon, proximity, distance, anterior, posterior, and boundaries.",
    "words": [
      {
        "char": "旁",
        "pinyin": "páng",
        "vuk": "pang",
        "english": "side / beside",
        "serbian": "pored / sa strane",
        "exampleUse": "旁边 (pored)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 75"
      },
      {
        "char": "外",
        "pinyin": "wài",
        "vuk": "vaj",
        "english": "outside / exterior / foreign",
        "serbian": "spolja / spoljni / inostranstvo",
        "exampleUse": "外面 (napolju)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 35"
      },
      {
        "char": "内",
        "pinyin": "nèi",
        "vuk": "nej",
        "english": "inside / interior",
        "serbian": "unutra / unutrašnjost",
        "exampleUse": "内容 (sadržaj / unutrašnjost)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 60"
      },
      {
        "char": "远",
        "pinyin": "yuǎn",
        "vuk": "jüan",
        "english": "far / distant",
        "serbian": "daleko / dalek",
        "exampleUse": "很远 (veoma daleko)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 65"
      },
      {
        "char": "近",
        "pinyin": "jìn",
        "vuk": "đjin",
        "english": "near / close",
        "serbian": "blizu / blizak",
        "exampleUse": "附近 (u blizini)",
        "isCoreChar": true,
        "category": "adjective",
        "frequencyRank": "Top 70"
      },
      {
        "char": "前",
        "pinyin": "qián",
        "vuk": "ćjen",
        "english": "front / ahead / former",
        "serbian": "napred / ispred / pre",
        "exampleUse": "前面 (napred)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 30"
      },
      {
        "char": "后",
        "pinyin": "hòu",
        "vuk": "hou",
        "english": "back / behind / after",
        "serbian": "iza / pozadi / posle",
        "exampleUse": "后面 (pozadi)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 25"
      },
      {
        "char": "左",
        "pinyin": "zuǒ",
        "vuk": "cuo",
        "english": "left side",
        "serbian": "levo / leva strana",
        "exampleUse": "左边 (leva strana)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 85"
      },
      {
        "char": "右",
        "pinyin": "yòu",
        "vuk": "jou",
        "english": "right side",
        "serbian": "desno / desna strana",
        "exampleUse": "右边 (desna strana)",
        "isCoreChar": true,
        "category": "direction",
        "frequencyRank": "Top 85"
      },
      {
        "char": "端",
        "pinyin": "duān",
        "vuk": "duan",
        "english": "end / extremity / upright",
        "serbian": "kraj / ivica / uspravan",
        "exampleUse": "顶端 (sam vrh)",
        "isCoreChar": true,
        "category": "noun",
        "frequencyRank": "Top 140"
      },
      {
        "char": "旁边",
        "pinyin": "pángbiān",
        "vuk": "pang-bjen",
        "english": "next to / beside",
        "serbian": "pored / kraj mene",
        "exampleUse": "坐在我的旁边 (sedi pored mene)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 50"
      },
      {
        "char": "外面",
        "pinyin": "wàimiàn",
        "vuk": "vaj-mjen",
        "english": "outside / outdoors",
        "serbian": "napolju / spolja",
        "exampleUse": "去外面呼吸新鲜空气",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 45"
      },
      {
        "char": "内容",
        "pinyin": "nèiróng",
        "vuk": "nej-žung",
        "english": "content / substance",
        "serbian": "sadržaj / suština",
        "exampleUse": "丰富的内容 (bogat sadržaj)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "远处",
        "pinyin": "yuǎnchù",
        "vuk": "jüan-ču",
        "english": "in the distance / far away",
        "serbian": "u daljini",
        "exampleUse": "眺望远处的高山 (gledati planinu u daljini)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 120"
      },
      {
        "char": "附近",
        "pinyin": "fùjìn",
        "vuk": "fu-đjin",
        "english": "nearby / in the vicinity",
        "serbian": "u blizini / u susedstvu",
        "exampleUse": "我家附近有公园 (blizu kuće je park)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 70"
      },
      {
        "char": "前面",
        "pinyin": "qiánmiàn",
        "vuk": "ćjen-mjen",
        "english": "in front / ahead",
        "serbian": "ispred / spreda",
        "exampleUse": "向前看 (gledati napred)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 50"
      },
      {
        "char": "后面",
        "pinyin": "hòumiàn",
        "vuk": "hou-mjen",
        "english": "behind / in back",
        "serbian": "iza / pozadi",
        "exampleUse": "紧跟在后面 (pratiti u stopu)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 50"
      },
      {
        "char": "左边",
        "pinyin": "zuǒbiān",
        "vuk": "cuo-bjen",
        "english": "left side",
        "serbian": "leva strana",
        "exampleUse": "往左边拐 (skrenuti levo)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 95"
      },
      {
        "char": "右边",
        "pinyin": "yòubiān",
        "vuk": "jou-bjen",
        "english": "right side",
        "serbian": "desna strana",
        "exampleUse": "在你的右边 (sa tvoje desne strane)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 95"
      },
      {
        "char": "顶端",
        "pinyin": "dǐngduān",
        "vuk": "ding-duan",
        "english": "peak / very top",
        "serbian": "vrh / najviša tačka",
        "exampleUse": "攀登至顶端 (popeti se na sam vrh)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 190"
      },
      {
        "char": "国内",
        "pinyin": "guónèi",
        "vuk": "guo-nej",
        "english": "domestic / within country",
        "serbian": "domaći / unutar zemlje",
        "exampleUse": "国内市场 (domaće tržište)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 80"
      },
      {
        "char": "国外",
        "pinyin": "guówài",
        "vuk": "guo-vaj",
        "english": "abroad / overseas",
        "serbian": "inostranstvo / preko granice",
        "exampleUse": "去国外交流 (put u inostranstvo)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "身边",
        "pinyin": "shēnbiān",
        "vuk": "šen-bjen",
        "english": "by one's side",
        "serbian": "kraj sebe / u blizini",
        "exampleUse": "留在身边 (ostati uz mene)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 75"
      },
      {
        "char": "靠前",
        "pinyin": "kàoqián",
        "vuk": "kao-ćjen",
        "english": "near the front",
        "serbian": "bliže napred",
        "exampleUse": "位置靠前 (pozicija napred)",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 250"
      },
      {
        "char": "靠后",
        "pinyin": "kàohòu",
        "vuk": "kao-hou",
        "english": "near the back",
        "serbian": "bliže pozadi",
        "exampleUse": "排在靠后的位置",
        "isCoreChar": false,
        "category": "direction",
        "frequencyRank": "Top 260"
      },
      {
        "char": "极端",
        "pinyin": "jíduān",
        "vuk": "đji-duan",
        "english": "extreme / radical",
        "serbian": "krajnost / ekstreman",
        "exampleUse": "避免走极端 (izbegavati ekstreme)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "前途",
        "pinyin": "qiántú",
        "vuk": "ćjen-tu",
        "english": "future prospect / path ahead",
        "serbian": "budućnost / životni put pred tobom",
        "exampleUse": "前途光明 (svetla budućnost)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 150"
      },
      {
        "char": "后果",
        "pinyin": "hòuguǒ",
        "vuk": "hou-guo",
        "english": "consequence / aftermath",
        "serbian": "posledica / ishod",
        "exampleUse": "承担严重后果 (snositi posledice)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 135"
      },
      {
        "char": "距离",
        "pinyin": "jùlí",
        "vuk": "đjü-li",
        "english": "distance / gap",
        "serbian": "razdaljina / rastojanje",
        "exampleUse": "缩短彼此距离 (smanjiti razdaljinu)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 95"
      },
      {
        "char": "界限",
        "pinyin": "jièxiàn",
        "vuk": "đje-sjen",
        "english": "boundary / limit",
        "serbian": "granica / međa",
        "exampleUse": "明确分清界限 (jasno postaviti granice)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 170"
      },
      {
        "char": "深入",
        "pinyin": "shēnrù",
        "vuk": "šen-ru",
        "english": "penetrate deeply / in-depth",
        "serbian": "ući duboko unutra / dubinski",
        "exampleUse": "深入内心深处 (ući u dubinu bića)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 110"
      },
      {
        "char": "跨越",
        "pinyin": "kuàyuè",
        "vuk": "kua-jüe",
        "english": "stride across / bridge",
        "serbian": "premostiti prostor / preći",
        "exampleUse": "跨越千山万水 (preći preko hiljada planina)",
        "isCoreChar": false,
        "category": "verb",
        "frequencyRank": "Top 145"
      },
      {
        "char": "边缘",
        "pinyin": "biānyuán",
        "vuk": "bjen-jüan",
        "english": "edge / margin / fringe",
        "serbian": "ivica / obod",
        "exampleUse": "站在边缘 (stajati na ivici)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 160"
      },
      {
        "char": "宽广",
        "pinyin": "kuānguǎng",
        "vuk": "kuan-guang",
        "english": "broad / expansive",
        "serbian": "širok / prostran",
        "exampleUse": "宽广的心胸 (širokogrudo srce)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 190"
      },
      {
        "char": "狭窄",
        "pinyin": "xiázhǎi",
        "vuk": "sja-džaj",
        "english": "narrow / cramped",
        "serbian": "uzak / skučen",
        "exampleUse": "狭窄的小道 (uzana staza)",
        "isCoreChar": false,
        "category": "adjective",
        "frequencyRank": "Top 220"
      },
      {
        "char": "核心",
        "pinyin": "héxīn",
        "vuk": "he-sin",
        "english": "core / nucleus",
        "serbian": "jezgro / srž / centar",
        "exampleUse": "核心竞争力 (ključna snaga)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 85"
      },
      {
        "char": "始终",
        "pinyin": "shǐzhōng",
        "vuk": "ši-džung",
        "english": "from start to finish / all along",
        "serbian": "od početka do kraja / oduvek",
        "exampleUse": "始终如一 (dosledan od početka do kraja)",
        "isCoreChar": false,
        "category": "phrase",
        "frequencyRank": "Top 95"
      },
      {
        "char": "尺度",
        "pinyin": "chǐdù",
        "vuk": "č-du",
        "english": "scale / measure / standard",
        "serbian": "merilo / standard",
        "exampleUse": "把握好尺度 (pronaći pravu meru)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 210"
      },
      {
        "char": "前沿",
        "pinyin": "qiányán",
        "vuk": "ćjen-jen",
        "english": "frontier / cutting edge",
        "serbian": "prva linija / sam vrhunac",
        "exampleUse": "时代最前沿 (na samom vrhu epohe)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 230"
      },
      {
        "char": "后端",
        "pinyin": "hòuduān",
        "vuk": "hou-duan",
        "english": "back-end / rear",
        "serbian": "zadnji kraj / pozadina",
        "exampleUse": "系统后端 (serverska pozadina)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 250"
      },
      {
        "char": "前端",
        "pinyin": "qiánduān",
        "vuk": "ćjen-duan",
        "english": "front-end / forefront",
        "serbian": "prednji deo / front",
        "exampleUse": "技术前端 (front tehnologija)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 250"
      },
      {
        "char": "内外",
        "pinyin": "nèiwài",
        "vuk": "nej-vaj",
        "english": "inside and outside",
        "serbian": "i spolja i iznutra",
        "exampleUse": "内外兼修 (negovati i telo i um)",
        "isCoreChar": false,
        "category": "noun",
        "frequencyRank": "Top 180"
      }
    ],
    "sentences": [
      {
        "id": "idm-20-1",
        "type": "proverb",
        "typeLabel": "左传古训 (Ancient Strategic Vigilance)",
        "chinese": "居安思危，思则有备，有备无患。",
        "pinyin": "Jū ān sī wēi, sī zé yǒu bèi, yǒu bèi wú huàn.",
        "vuk": "Đjü an s vej, s ce jou bej, jou bej vu huan.",
        "literalEnglish": "Living in safety, think of danger; thinking breeds readiness; readiness eliminates calamity.",
        "english": "In peace prepare for war / Anticipate adversity while in tranquility.",
        "serbianEquivalent": "Ko se čuva, i Bog ga čuva. / Spremaj zimska drva dok sija letnje sunce.",
        "serbian": "Dok živiš u miru i blagostanju, razmišljaj o mogućim opasnostima; razmišljanje donosi pripremu, a dobra priprema sprečava svaku nesreću.",
        "philosophicalContext": "Iz Zuo Zhuan klasika. Vrhunska stoička disciplina i anticipacija: ne čekaj da se razboliš ili propadneš da bi počeo da treniraš i učiš.",
        "targetWords": [
          "内",
          "外",
          "有",
          "前"
        ],
        "context": "Anticipation & Preparedness • Budnost u miru",
        "tokens": [
          {
            "word": "居安",
            "pinyin": "jū ān",
            "english": "live in safety",
            "serbian": "živeti u miru"
          },
          {
            "word": "思危",
            "pinyin": "sī wēi",
            "english": "think of danger",
            "serbian": "misliti na opasnost",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "有备无患",
            "pinyin": "yǒu bèi wú huàn",
            "english": "preparedness prevents crisis",
            "serbian": "priprema sprečava krizu",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-20-2",
        "type": "proverb",
        "typeLabel": "民间古训 (Environmental Contagion Axiom)",
        "chinese": "近朱者赤，近墨者黑。",
        "pinyin": "Jìn zhū zhě chì, jìn mò zhě hēi.",
        "vuk": "Đjin džu dž č, đjin mo dž hej.",
        "literalEnglish": "Near cinnabar red you turn red; near black ink you turn black.",
        "english": "Near vermilion you turn red, near ink you turn black / You are the average of those around you.",
        "serbianEquivalent": "S kim si, onakav si. / Ko s vukom druguje, nauči da zavija.",
        "serbian": "Ko je blizu crvenog pigmenta sam pocrveni, ko je blizu crnog tuša sam pocrni; društvo i okolina neprimetno boje naš karakter.",
        "philosophicalContext": "Iz Fu Xuanovih spisa (dinastija Jin). Biraj svesno knjige, navike i ljude koji te okružuju, jer ćeš neizbežno postati poput njih.",
        "targetWords": [
          "近",
          "黑",
          "者"
        ],
        "context": "Social Influence & Character • Uticaj okruženja",
        "tokens": [
          {
            "word": "近朱者赤",
            "pinyin": "jìn zhū zhě chì",
            "english": "near red turns red",
            "serbian": "uz crveno pocrveniš",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "近墨者黑",
            "pinyin": "jìn mò zhě hēi",
            "english": "near ink turns black",
            "serbian": "uz crno pocrniš",
            "isTarget": true
          }
        ]
      },
      {
        "id": "idm-20-3",
        "type": "proverb",
        "typeLabel": "汉书名句 (Historical Foresight Proverb)",
        "chinese": "前车之鉴，后事之师。",
        "pinyin": "Qián chē zhī jiàn, hòu shì zhī shī.",
        "vuk": "Ćjen če dž đjen, hou ši dž ši.",
        "literalEnglish": "The cart that overturned in front is a mirror and teacher for the vehicles behind.",
        "english": "The overturned cart ahead is a lesson for the cart behind / Learn from others' mistakes.",
        "serbianEquivalent": "Pametan uči na tuđim greškama, a lud na svojim.",
        "serbian": "Kola koja su se prevrnula ispred tebe su ogledalo i učitelj za sve tvoje buduće korake; posmatraj tuđa posrnuća da bi ti prošao sigurno.",
        "philosophicalContext": "Iz Knjige Hana (Han Shu). Zašto plaćati punu cenu grešaka kada istorija i mudrost starih nude besplatne lekcije?",
        "targetWords": [
          "前",
          "车",
          "后",
          "见"
        ],
        "context": "Learning from Precedents • Učenje na primerima",
        "tokens": [
          {
            "word": "前车之鉴",
            "pinyin": "qián chē zhī jiàn",
            "english": "lesson of cart ahead",
            "serbian": "pouka prevrnutih kola",
            "isTarget": true
          },
          {
            "word": "，",
            "pinyin": ",",
            "english": ",",
            "serbian": ","
          },
          {
            "word": "后事之师",
            "pinyin": "hòu shì zhī shī",
            "english": "teacher for future steps",
            "serbian": "učitelj za budućnost",
            "isTarget": true
          }
        ]
      }
    ]
  }
];

export const TOTAL_REAL_LIFE_WORDS = REAL_LIFE_CLUSTERS.reduce((acc, c) => acc + c.words.length, 0);
