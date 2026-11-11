const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../src/data/chineseRealLifeClustersData.ts');

const code = `// ============================================================================
// CHINESE REAL LIFE CLUSTERS - HIGH-FREQUENCY VOCABULARY & IDIOMS (CHENGYU/YANYU)
// 840 Essential Native Words (~90% Everyday Coverage) & Classical Proverbs
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
  // ==========================================
  // CHART 1: 100 FOUNDATION WORDS (Rows 1 - 10)
  // Image: /assets/aistudio/image_1536d14f.png
  // ==========================================
  {
    id: 'c1-r1',
    chartId: 1,
    rowNumber: 1,
    title: 'Scale & Numbers',
    titleSerbian: 'Veličina i Brojevi',
    emoji: '🔢',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Foundational scale, quantities, numbers, and core negations that form the basis of counting and comparison.',
    words: [
      // 10 Core Roots from Infographic
      { char: '大', pinyin: 'dà', vuk: 'da', english: 'big / great', serbian: 'veliko / sjajno', exampleUse: '大人 (odrasla osoba)', isCoreChar: true, category: 'adjective', frequencyRank: 'Top 50' },
      { char: '小', pinyin: 'xiǎo', vuk: 'sjao', english: 'small / little', serbian: 'malo', exampleUse: '小心 (pažljivo)', isCoreChar: true, category: 'adjective', frequencyRank: 'Top 50' },
      { char: '一', pinyin: 'yī', vuk: 'ji', english: 'one', serbian: 'jedan', exampleUse: '一共 (ukupno)', isCoreChar: true, category: 'number', frequencyRank: 'Top 10' },
      { char: '二', pinyin: 'èr', vuk: 'er', english: 'two', serbian: 'dva', exampleUse: '二十 (dvadeset)', isCoreChar: true, category: 'number', frequencyRank: 'Top 30' },
      { char: '三', pinyin: 'sān', vuk: 'san', english: 'three', serbian: 'tri', exampleUse: '三个 (tri komada)', isCoreChar: true, category: 'number', frequencyRank: 'Top 30' },
      { char: '十', pinyin: 'shí', vuk: 'ši', english: 'ten', serbian: 'deset', exampleUse: '十分 (veoma/deset delova)', isCoreChar: true, category: 'number', frequencyRank: 'Top 40' },
      { char: '百', pinyin: 'bǎi', vuk: 'baj', english: 'hundred', serbian: 'sto', exampleUse: '一百 (sto)', isCoreChar: true, category: 'number', frequencyRank: 'Top 100' },
      { char: '千', pinyin: 'qiān', vuk: 'ćjen', english: 'thousand', serbian: 'hiljada', exampleUse: '千万 (obavezno/milioni)', isCoreChar: true, category: 'number', frequencyRank: 'Top 150' },
      { char: '多', pinyin: 'duō', vuk: 'duo', english: 'much / many', serbian: 'mnogo', exampleUse: '多少 (koliko)', isCoreChar: true, category: 'adjective', frequencyRank: 'Top 50' },
      { char: '不', pinyin: 'bù', vuk: 'bu', english: 'not / no', serbian: 'ne', exampleUse: '不是 (nije)', isCoreChar: true, category: 'phrase', frequencyRank: 'Top 5' },
      // 32 High-Frequency Everyday Conversational Words (90% Spoken Coverage)
      { char: '多少', pinyin: 'duōshao', vuk: 'duo-šao', english: 'how much / how many', serbian: 'koliko', exampleUse: '多少钱？ (koliko košta?)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 80' },
      { char: '一共', pinyin: 'yīgòng', vuk: 'ji-gung', english: 'altogether / in total', serbian: 'ukupno / sve zajedno', exampleUse: '一共一百块 (ukupno 100 yuana)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 120' },
      { char: '一起', pinyin: 'yīqǐ', vuk: 'ji-ći', english: 'together', serbian: 'zajedno', exampleUse: '我们一起 (mi zajedno)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 60' },
      { char: '非常', pinyin: 'fēicháng', vuk: 'fej-čang', english: 'very / exceptionally', serbian: 'veoma / izuzetno', exampleUse: '非常大 (izuzetno veliko)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 100' },
      { char: '许多', pinyin: 'xǔduō', vuk: 'sü-duo', english: 'many / a lot of', serbian: 'mnogo / brojni', exampleUse: '许多人 (mnogo ljudi)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 140' },
      { char: '第一', pinyin: 'dì-yī', vuk: 'di-ji', english: 'first / number one', serbian: 'prvi', exampleUse: '第一步 (prvi korak)', isCoreChar: false, category: 'number', frequencyRank: 'Top 90' },
      { char: '一半', pinyin: 'yībàn', vuk: 'ji-ban', english: 'half', serbian: 'polovina', exampleUse: '分一半 (podeliti na pola)', isCoreChar: false, category: 'number', frequencyRank: 'Top 180' },
      { char: '很大', pinyin: 'hěn dà', vuk: 'hen da', english: 'very big / large', serbian: 'veoma veliko', exampleUse: '地方很大 (mesto je prostrano)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 50' },
      { char: '不错', pinyin: 'bùcuò', vuk: 'bu-cuo', english: 'not bad / pretty good', serbian: 'nije loše / sasvim dobro', exampleUse: '味道不错 (ukus je odličan)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 110' },
      { char: '不仅', pinyin: 'bùjǐn', vuk: 'bu-đjin', english: 'not only', serbian: 'ne samo', exampleUse: '不仅如此 (ne samo to)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 200' },
      { char: '不会', pinyin: 'bù huì', vuk: 'bu huej', english: 'cannot / will not', serbian: 'neće / ne ume', exampleUse: '我不会 (ja ne umem)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 60' },
      { char: '大概', pinyin: 'dàgài', vuk: 'da-gaj', english: 'roughly / approximately', serbian: 'otprilike / verovatno', exampleUse: '大概十个 (otprilike deset)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 160' },
      { char: '全部', pinyin: 'quánbù', vuk: 'ćüan-bu', english: 'all / whole / entirely', serbian: 'sve / u celosti', exampleUse: '全部完成 (sve završeno)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 180' },
      { char: '少数', pinyin: 'shǎoshù', vuk: 'šao-šu', english: 'small number / minority', serbian: 'manjina / mali broj', exampleUse: '少数人 (mali broj ljudi)', isCoreChar: false, category: 'number', frequencyRank: 'Top 250' },
      { char: '差不多', pinyin: 'chàbuduō', vuk: 'ča-bu-duo', english: 'almost / about the same', serbian: 'skoro / tu negde', exampleUse: '差不多好了 (skoro gotovo)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 130' },
      { char: '不多', pinyin: 'bù duō', vuk: 'bu duo', english: 'not much / few', serbian: 'malo / nije mnogo', exampleUse: '时间不多 (malo je vremena)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 90' },
      { char: '不仅如此', pinyin: 'bùjǐn rúcǐ', vuk: 'bu-đjin ru-ci', english: 'not only that', serbian: 'i ne samo to', exampleUse: '不仅如此而且有效', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 300' },
      { char: '千万', pinyin: 'qiānwàn', vuk: 'ćjen-van', english: 'by all means / millions', serbian: 'obavezno / ni po koju cenu', exampleUse: '千万小心 (obavezno pazi)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 210' },
      { char: '百分之', pinyin: 'bǎifēnzhī', vuk: 'baj-fen-dž', english: 'percent', serbian: 'procenat', exampleUse: '百分之百 (sto posto)', isCoreChar: false, category: 'number', frequencyRank: 'Top 190' },
      { char: '增加', pinyin: 'zēngjiā', vuk: 'ceng-đja', english: 'increase / add', serbian: 'povećati / uvećati', exampleUse: '数量增加 (količina se uvećava)', isCoreChar: false, category: 'verb', frequencyRank: 'Top 220' },
      { char: '减少', pinyin: 'jiǎnshǎo', vuk: 'đjen-šao', english: 'decrease / reduce', serbian: 'smanjiti', exampleUse: '减少压力 (smanjiti stres)', isCoreChar: false, category: 'verb', frequencyRank: 'Top 240' },
      { char: '另外', pinyin: 'lìngwài', vuk: 'ling-vaj', english: 'in addition / besides', serbian: 'pored toga / još i', exampleUse: '另外一个 (još jedan)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 170' },
      { char: '两个', pinyin: 'liǎng ge', vuk: 'ljang ge', english: 'two items / a couple', serbian: 'dva komada', exampleUse: '两个人 (dvoje ljudi)', isCoreChar: false, category: 'number', frequencyRank: 'Top 40' },
      { char: '一下', pinyin: 'yīxià', vuk: 'ji-sja', english: 'a bit / once', serbian: 'na trenutak / malo', exampleUse: '看一眼 (baci pogled)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 70' },
      { char: '一定', pinyin: 'yīdìng', vuk: 'ji-ding', english: 'definitely / must', serbian: 'sigurno / bez sumnje', exampleUse: '一定要来 (obavezno dođi)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 85' },
      { char: '不大', pinyin: 'bù dà', vuk: 'bu da', english: 'not big', serbian: 'nije veliko', exampleUse: '问题不大 (nije veliki problem)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 100' },
      { char: '不用', pinyin: 'bùyòng', vuk: 'bu-jung', english: 'no need / not necessary', serbian: 'nema potrebe / ne treba', exampleUse: '不用担心 (ne brini)', isCoreChar: false, category: 'phrase', frequencyRank: 'Top 95' },
      { char: '稍微', pinyin: 'shāowēi', vuk: 'šao-vej', english: 'slightly / a little', serbian: 'malo / mrvicu', exampleUse: '稍微休息 (kratko odmoriti)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 220' },
      { char: '巨大', pinyin: 'jùdà', vuk: 'đjü-da', english: 'huge / gigantic', serbian: 'ogroman / kolosalan', exampleUse: '巨大进步 (ogroman napredak)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 280' },
      { char: '微小', pinyin: 'wēixiǎo', vuk: 'vej-sjao', english: 'tiny / minute', serbian: 'sićušan / mikroskopski', exampleUse: '微小的变化 (sićušna promena)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 350' },
      { char: '相当', pinyin: 'xiāngdāng', vuk: 'sjang-dang', english: 'quite / considerably', serbian: 'prilično / u znatnoj meri', exampleUse: '相当好 (prilično dobro)', isCoreChar: false, category: 'adjective', frequencyRank: 'Top 210' },
      { char: '多数', pinyin: 'duōshù', vuk: 'duo-šu', english: 'majority / most', serbian: 'većina', exampleUse: '多数人 (većina ljudi)', isCoreChar: false, category: 'number', frequencyRank: 'Top 230' }
    ],
    sentences: [
      {
        id: 'idm-1-1',
        type: 'proverb',
        typeLabel: '古训 / 哲理名言 (Daoist Classic)',
        chinese: '千里之行，始于足下。',
        pinyin: 'Qiān lǐ zhī xíng, shǐ yú zú xià.',
        vuk: 'Ćjen li dž sing, ši ji cu sja.',
        literalEnglish: 'A journey of a thousand li begins right beneath your feet.',
        english: 'A journey of a thousand miles begins with a single step.',
        serbianEquivalent: 'Svaki veliki put počinje prvim korakom. / Zrno po zrno pogača.',
        serbian: 'Putovanje od hiljadu milja počinje jednim jedinim korakom ispod tvojih stopala.',
        philosophicalContext: 'Iz Lao Ceovog Tao Te Đinga. Podseća nas da se nijedan kolosalni uspeh ne postiže preko noći, već disciplinovanim, malim dnevnim radnjama.',
        targetWords: ['千', '一', '行', '足', '下'],
        context: 'Laozi Daoism • Discipline & Endurance',
        tokens: [
          { word: '千里', pinyin: 'qiān lǐ', english: 'thousand miles', serbian: 'hiljadu milja', isTarget: true },
          { word: '之', pinyin: 'zhī', english: 'of', serbian: 'od' },
          { word: '行', pinyin: 'xíng', english: 'journey/walk', serbian: 'putovanje', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '始于', pinyin: 'shǐ yú', english: 'begins at', serbian: 'počinje na' },
          { word: '足下', pinyin: 'zú xià', english: 'beneath feet', serbian: 'ispod stopala', isTarget: true }
        ]
      },
      {
        id: 'idm-1-2',
        type: 'chengyu',
        typeLabel: '成语 (Ancient Idiom)',
        chinese: '百闻不如一见。',
        pinyin: 'Bǎi wén bù rú yī jiàn.',
        vuk: 'Baj ven bu ru ji đjen.',
        literalEnglish: 'Hearing a hundred times is not as good as seeing once.',
        english: 'Seeing is believing / One look is worth a hundred reports.',
        serbianEquivalent: 'Bolje jednom videti nego sto puta čuti.',
        serbian: 'Čuti stotinu puta ne vredi koliko videti sopstvenim očima.',
        philosophicalContext: 'Iz Knjige Hana (Han Shu). Empirijski uvid ima neuporedivo veću težinu od neproverenih priča i glasina.',
        targetWords: ['百', '闻', '不', '一', '见'],
        context: 'Empirical Truth • Stoic Clarity',
        tokens: [
          { word: '百闻', pinyin: 'bǎi wén', english: 'hear 100 times', serbian: 'stotinu puta čuti', isTarget: true },
          { word: '不如', pinyin: 'bù rú', english: 'not equal to', serbian: 'ne vredi kao', isTarget: true },
          { word: '一见', pinyin: 'yī jiàn', english: 'see once', serbian: 'jednom videti', isTarget: true }
        ]
      },
      {
        id: 'idm-1-3',
        type: 'chengyu',
        typeLabel: '成语 (Laozi Philosophy)',
        chinese: '大智若愚，大巧若拙。',
        pinyin: 'Dà zhì ruò yú, dà qiǎo ruò zhuō.',
        vuk: 'Da dži ruo ji, da ćjao ruo džuo.',
        literalEnglish: 'Great wisdom appears like foolishness, supreme skill looks clumsy.',
        english: 'Great wisdom often masks itself as simplicity.',
        serbianEquivalent: 'Ko mnogo zna, malo govori. / Mudra glava ne hvali se sama.',
        serbian: 'Najviša mudrost često izgleda kao jednostavnost ili naivnost, a vrhunsko majstorstvo kao skromnost.',
        philosophicalContext: 'Izvorni stoički stav: pravi majstor nema potrebu da se dokazuje galamom pred drugima. Suština prevazilazi formu.',
        targetWords: ['大', '小', '智'],
        context: 'Humility & Mastery • Skromnost i Majstorstvo',
        tokens: [
          { word: '大智', pinyin: 'dà zhì', english: 'great wisdom', serbian: 'velika mudrost', isTarget: true },
          { word: '若愚', pinyin: 'ruò yú', english: 'like foolishness', serbian: 'kao naivnost' },
          { word: '大巧', pinyin: 'dà qiǎo', english: 'supreme skill', serbian: 'vrhunsko majstorstvo', isTarget: true },
          { word: '若拙', pinyin: 'ruò zhuō', english: 'looks clumsy', serbian: 'izgleda skromno' }
        ]
      },
      {
        id: 'idm-1-4',
        type: 'chengyu',
        typeLabel: '成语 (Popular Proverb)',
        chinese: '一石二鸟。',
        pinyin: 'Yī shí èr niǎo.',
        vuk: 'Ji ši er njao.',
        literalEnglish: 'One stone, two birds.',
        english: 'Kill two birds with one stone.',
        serbianEquivalent: 'Ubiti dve muve jednim udarcem.',
        serbian: 'Jednim kamenom oboriti dve ptice; postići dva korisna cilja jednom jedinom akcijom.',
        philosophicalContext: 'Strateški princip efikasnosti: fokusirati energiju na tačku gde jedna akcija donosi višestruki napredak.',
        targetWords: ['一', '二', '鸟', '石'],
        context: 'Strategic Efficiency • Fokus i Efikasnost',
        tokens: [
          { word: '一石', pinyin: 'yī shí', english: 'one stone', serbian: 'jedan kamen', isTarget: true },
          { word: '二鸟', pinyin: 'èr niǎo', english: 'two birds', serbian: 'dve ptice', isTarget: true }
        ]
      }
    ]
  }
];

export const TOTAL_REAL_LIFE_WORDS = REAL_LIFE_CLUSTERS.reduce((acc, c) => acc + c.words.length, 0);
`;

console.log('Template ready.');
