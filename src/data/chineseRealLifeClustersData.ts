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
}

export interface RealLifeSentenceToken {
  word: string;
  pinyin: string;
  english: string;
  serbian: string;
  isTarget?: boolean;
}

export interface RealLifeSentence {
  id: string;
  chinese: string;
  chineseTraditional?: string;
  pinyin: string;
  vuk: string;
  english: string;
  serbian: string;
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
  sentences: RealLifeSentence[];
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
    description: 'Foundational scale, numbers, quantity comparisons, and essential negation words.',
    words: [
      // Core 10 Characters from Infographic
      { char: '大', pinyin: 'dà', vuk: 'da', english: 'big / great', serbian: 'veliko / sjajno', exampleUse: '大人 (odrasla osoba)', isCoreChar: true, category: 'adjective' },
      { char: '小', pinyin: 'xiǎo', vuk: 'sjao', english: 'small / little', serbian: 'malo', exampleUse: '小心 (pažljivo)', isCoreChar: true, category: 'adjective' },
      { char: '一', pinyin: 'yī', vuk: 'ji', english: 'one', serbian: 'jedan', exampleUse: '一共 (ukupno)', isCoreChar: true, category: 'number' },
      { char: '二', pinyin: 'èr', vuk: 'er', english: 'two', serbian: 'dva', exampleUse: '二十 (dvadeset)', isCoreChar: true, category: 'number' },
      { char: '三', pinyin: 'sān', vuk: 'san', english: 'three', serbian: 'tri', exampleUse: '三个 (tri komada)', isCoreChar: true, category: 'number' },
      { char: '十', pinyin: 'shí', vuk: 'ši', english: 'ten', serbian: 'deset', exampleUse: '十分 (veoma/deset delova)', isCoreChar: true, category: 'number' },
      { char: '百', pinyin: 'bǎi', vuk: 'baj', english: 'hundred', serbian: 'sto', exampleUse: '一百 (sto)', isCoreChar: true, category: 'number' },
      { char: '千', pinyin: 'qiān', vuk: 'ćjen', english: 'thousand', serbian: 'hiljada', exampleUse: '千万 (obavezno/milioni)', isCoreChar: true, category: 'number' },
      { char: '多', pinyin: 'duō', vuk: 'duo', english: 'much / many', serbian: 'mnogo', exampleUse: '多少 (koliko)', isCoreChar: true, category: 'adjective' },
      { char: '不', pinyin: 'bù', vuk: 'bu', english: 'not / no', serbian: 'ne', exampleUse: '不是 (nije)', isCoreChar: true, category: 'phrase' },
      // Expanded High-Frequency Native Vocabulary
      { char: '多少', pinyin: 'duōshao', vuk: 'duo-šao', english: 'how much / how many', serbian: 'koliko', exampleUse: '多少钱 (koliko košta)', isCoreChar: false, category: 'phrase' },
      { char: '一共', pinyin: 'yīgòng', vuk: 'ji-gung', english: 'altogether / in total', serbian: 'ukupno / sve zajedno', exampleUse: '一共多少 (koliko je ukupno)', isCoreChar: false, category: 'adjective' },
      { char: '一起', pinyin: 'yīqǐ', vuk: 'ji-ći', english: 'together', serbian: 'zajedno', exampleUse: '一起去 (ići zajedno)', isCoreChar: false, category: 'phrase' },
      { char: '非常', pinyin: 'fēicháng', vuk: 'fej-čang', english: 'very / exceptionally', serbian: 'veoma / izuzetno', exampleUse: '非常大 (izuzetno veliko)', isCoreChar: false, category: 'adjective' },
      { char: '许多', pinyin: 'xǔduō', vuk: 'sü-duo', english: 'many / a lot of', serbian: 'mnogo / veliki broj', exampleUse: '许多人 (mnogo ljudi)', isCoreChar: false, category: 'adjective' },
      { char: '第一', pinyin: 'dì-yī', vuk: 'di-ji', english: 'first / number one', serbian: 'prvi', exampleUse: '第一步 (prvi korak)', isCoreChar: false, category: 'number' },
      { char: '一半', pinyin: 'yībàn', vuk: 'ji-ban', english: 'half', serbian: 'polovina', exampleUse: '分一半 (podeliti na pola)', isCoreChar: false, category: 'number' },
      { char: '很大', pinyin: 'hěn dà', vuk: 'hen da', english: 'very big / large', serbian: 'veoma veliko', exampleUse: '地方很大 (mesto je veliko)', isCoreChar: false, category: 'adjective' },
      { char: '不错', pinyin: 'bùcuò', vuk: 'bu-cuo', english: 'not bad / pretty good', serbian: 'nije loše / sasvim dobro', exampleUse: '感觉不错 (osećaj je dobar)', isCoreChar: false, category: 'phrase' },
      { char: '不仅', pinyin: 'bùjǐn', vuk: 'bu-đjin', english: 'not only', serbian: 'ne samo', exampleUse: '不仅如此 (ne samo to)', isCoreChar: false, category: 'phrase' },
      { char: '不会', pinyin: 'bù huì', vuk: 'bu huej', english: 'will not / cannot', serbian: 'neće / ne ume', exampleUse: '不会太慢 (neće biti presporo)', isCoreChar: false, category: 'phrase' },
      { char: '大概', pinyin: 'dàgài', vuk: 'da-gaj', english: 'roughly / approximately', serbian: 'otprilike / verovatno', exampleUse: '大概一百 (otprilike sto)', isCoreChar: false, category: 'phrase' }
    ],
    sentences: [
      {
        id: 's-1-1',
        chinese: '这个很大，那个很小，我不喜欢太多的东西。',
        pinyin: 'Zhège hěn dà, nàge hěn xiǎo, wǒ bù xǐhuan tài duō de dōngxi.',
        vuk: 'Dže-ge hen da, na-ge hen sjao, vo bu si-huan taj duo de dung-si.',
        english: 'This one is very big, that one is very small, and I do not like having too many things.',
        serbian: 'Ovaj je veoma velik, onaj je veoma mali, a ja ne volim previše stvari.',
        targetWords: ['大', '小', '不', '多', '很大'],
        context: 'Daily Conversation • Shopping & Minimalism',
        tokens: [
          { word: '这个', pinyin: 'zhège', english: 'this', serbian: 'ovaj' },
          { word: '很大', pinyin: 'hěn dà', english: 'very big', serbian: 'veoma velik', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '那个', pinyin: 'nàge', english: 'that', serbian: 'onaj' },
          { word: '很小', pinyin: 'hěn xiǎo', english: 'very small', serbian: 'veoma mali', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '我不喜欢', pinyin: 'wǒ bù xǐhuan', english: 'I do not like', serbian: 'ja ne volim', isTarget: true },
          { word: '太多的', pinyin: 'tài duō de', english: 'too many', serbian: 'previše', isTarget: true },
          { word: '东西', pinyin: 'dōngxi', english: 'things', serbian: 'stvari' }
        ]
      },
      {
        id: 's-1-2',
        chinese: '请问这里一共多少钱？一共一百二十块，非常便宜。',
        pinyin: 'Qǐngwèn zhèlǐ yīgòng duōshao qián? Yīgòng yībǎi èrshí kuài, fēicháng piányi.',
        vuk: 'Ćing-ven dže-li ji-gung duo-šao ćjen? Ji-gung ji-baj er-ši kuaj, fej-čang pjen-ji.',
        english: 'Excuse me, how much is this in total? Altogether 120 yuan, exceptionally cheap.',
        serbian: 'Izvinite, koliko ovo košta ukupno? Sve zajedno 120 juana, izuzetno jeftino.',
        targetWords: ['一共', '多少', '百', '二', '十', '非常'],
        context: 'Market & Everyday Commerce',
        tokens: [
          { word: '请问', pinyin: 'qǐngwèn', english: 'excuse me', serbian: 'izvinite molim' },
          { word: '这里', pinyin: 'zhèlǐ', english: 'here', serbian: 'ovde' },
          { word: '一共', pinyin: 'yīgòng', english: 'in total', serbian: 'ukupno', isTarget: true },
          { word: '多少钱', pinyin: 'duōshao qián', english: 'how much money', serbian: 'koliko novca', isTarget: true },
          { word: '？', pinyin: '?', english: '?', serbian: '?' },
          { word: '一共', pinyin: 'yīgòng', english: 'in total', serbian: 'ukupno', isTarget: true },
          { word: '一百二十', pinyin: 'yībǎi èrshí', english: '120', serbian: 'sto dvadeset', isTarget: true },
          { word: '块', pinyin: 'kuài', english: 'yuan', serbian: 'juana' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '非常', pinyin: 'fēicháng', english: 'very', serbian: 'izuzetno', isTarget: true },
          { word: '便宜', pinyin: 'piányi', english: 'cheap', serbian: 'jeftino' }
        ]
      },
      {
        id: 's-1-3',
        chinese: '迈出第一步大概需要许多勇气，但坚持下去感觉很不错。',
        pinyin: 'Màichū dì-yī bù dàgài xūyào xǔduō yǒngqì, dàn jiānchí xiàqù gǎnjué hěn bùcuò.',
        vuk: 'Maj-ču di-ji bu da-gaj sü-jao sü-duo jung-ći, dan đjen-či sja-ću gan-đjue hen bu-cuo.',
        english: 'Taking the first step roughly requires a lot of courage, but persisting feels pretty good.',
        serbian: 'Pravljenje prvog koraka verovatno traži mnogo hrabrosti, ali istrajnost pruža odličan osećaj.',
        targetWords: ['第一', '大概', '许多', '不错'],
        context: 'Stoic Inspiration & Athletic Mindset',
        tokens: [
          { word: '迈出', pinyin: 'màichū', english: 'take out step', serbian: 'napraviti' },
          { word: '第一步', pinyin: 'dì-yī bù', english: 'first step', serbian: 'prvi korak', isTarget: true },
          { word: '大概', pinyin: 'dàgài', english: 'roughly/likely', serbian: 'verovatno', isTarget: true },
          { word: '需要', pinyin: 'xūyào', english: 'requires', serbian: 'zahteva' },
          { word: '许多', pinyin: 'xǔduō', english: 'much/a lot of', serbian: 'mnogo', isTarget: true },
          { word: '勇气', pinyin: 'yǒngqì', english: 'courage', serbian: 'hrabrosti' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '但', pinyin: 'dàn', english: 'but', serbian: 'ali' },
          { word: '坚持', pinyin: 'jiānchí', english: 'persist', serbian: 'istrajati' },
          { word: '下去', pinyin: 'xiàqù', english: 'continue on', serbian: 'dalje' },
          { word: '感觉', pinyin: 'gǎnjué', english: 'feels', serbian: 'osećaj je' },
          { word: '很不错', pinyin: 'hěn bùcuò', english: 'very good', serbian: 'veoma dobar', isTarget: true }
        ]
      }
    ]
  },
  {
    id: 'c1-r2',
    chartId: 1,
    rowNumber: 2,
    title: 'People & Pronouns',
    titleSerbian: 'Ljudi, Pol i Zamenice',
    emoji: '👥',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Human relationships, gender terms, social titles, and conversational pronouns.',
    words: [
      // Core 10 Characters
      { char: '人', pinyin: 'rén', vuk: 'žen', english: 'person / human', serbian: 'čovek / osoba', exampleUse: '人们 (ljudi)', isCoreChar: true, category: 'noun' },
      { char: '夫', pinyin: 'fū', vuk: 'fu', english: 'man / husband', serbian: 'muškarac / suprug', exampleUse: '丈夫 (muž)', isCoreChar: true, category: 'noun' },
      { char: '子', pinyin: 'zǐ', vuk: 'ci', english: 'child / son', serbian: 'dete / sin', exampleUse: '儿子 (sin)', isCoreChar: true, category: 'noun' },
      { char: '男', pinyin: 'nán', vuk: 'nan', english: 'male / man', serbian: 'muški / muškarac', exampleUse: '男人 (muškarac)', isCoreChar: true, category: 'noun' },
      { char: '女', pinyin: 'nǚ', vuk: 'nü', english: 'female / woman', serbian: 'ženski / žena', exampleUse: '女人 (žena)', isCoreChar: true, category: 'noun' },
      { char: '王', pinyin: 'wáng', vuk: 'vang', english: 'king / royal', serbian: 'kralj', exampleUse: '国王 (kralj)', isCoreChar: true, category: 'noun' },
      { char: '主', pinyin: 'zhǔ', vuk: 'džu', english: 'master / host', serbian: 'gospodar / domaćin', exampleUse: '主人 (domaćin)', isCoreChar: true, category: 'noun' },
      { char: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I / me', serbian: 'ja / mene', exampleUse: '我们 (mi)', isCoreChar: true, category: 'phrase' },
      { char: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'ti', exampleUse: '你们 (vi)', isCoreChar: true, category: 'phrase' },
      { char: '他', pinyin: 'tā', vuk: 'ta', english: 'he / him', serbian: 'on / njega', exampleUse: '他们 (oni)', isCoreChar: true, category: 'phrase' },
      // Expanded High-Frequency Native Vocabulary
      { char: '朋友', pinyin: 'péngyou', vuk: 'peng-jou', english: 'friend', serbian: 'prijatelj', exampleUse: '好朋友 (dobar prijatelj)', isCoreChar: false, category: 'noun' },
      { char: '大家', pinyin: 'dàjiā', vuk: 'da-đja', english: 'everyone / all of us', serbian: 'svi / svako', exampleUse: '大家好 (zdravo svima)', isCoreChar: false, category: 'phrase' },
      { char: '自己', pinyin: 'zìjǐ', vuk: 'ci-đji', english: 'oneself', serbian: 'sam / sebe', exampleUse: '靠自己 (osloni se na sebe)', isCoreChar: false, category: 'phrase' },
      { char: '别人', pinyin: 'biéren', vuk: 'bje-žen', english: 'other people / others', serbian: 'drugi ljudi', exampleUse: '尊重别人 (poštuj druge)', isCoreChar: false, category: 'noun' },
      { char: '男人', pinyin: 'nánrén', vuk: 'nan-žen', english: 'man / male adult', serbian: 'muškarac', exampleUse: '成熟的男人 (zreo muškarac)', isCoreChar: false, category: 'noun' },
      { char: '女人', pinyin: 'nǚrén', vuk: 'nü-žen', english: 'woman / female adult', serbian: 'žena', exampleUse: '善良的女人 (dobra žena)', isCoreChar: false, category: 'noun' },
      { char: '先生', pinyin: 'xiānsheng', vuk: 'sjen-šeng', english: 'Mr. / sir / gentleman', serbian: 'gospodin', exampleUse: '王先生 (gospodin Vang)', isCoreChar: false, category: 'noun' },
      { char: '女士', pinyin: 'nǚshì', vuk: 'nü-ši', english: 'Ms. / lady', serbian: 'gospođa', exampleUse: '女士们 (dame)', isCoreChar: false, category: 'noun' },
      { char: '孩子', pinyin: 'háizi', vuk: 'haj-ci', english: 'child / children', serbian: 'dete / deca', exampleUse: '教育孩子 (vaspitavati dete)', isCoreChar: false, category: 'noun' },
      { char: '主人', pinyin: 'zhǔrén', vuk: 'džu-žen', english: 'master / host / owner', serbian: 'domaćin / vlasnik', exampleUse: '房子的主人 (vlasnik kuće)', isCoreChar: false, category: 'noun' },
      { char: '认识', pinyin: 'rènshi', vuk: 'žen-ši', english: 'know / meet / recognize', serbian: 'upoznati / poznavati', exampleUse: '很高兴认识你 (drago mi je)', isCoreChar: false, category: 'verb' },
      { char: '他们', pinyin: 'tāmen', vuk: 'ta-men', english: 'they / them', serbian: 'oni / njih', exampleUse: '他们来了 (oni su stigli)', isCoreChar: false, category: 'phrase' }
    ],
    sentences: [
      {
        id: 's-2-1',
        chinese: '大家好，很高兴认识你们，我们大家都是好朋友。',
        pinyin: 'Dàjiā hǎo, hěn gāoxìng rènshi nǐmen, wǒmen dàjiā dōu shì hǎo péngyou.',
        vuk: 'Da-đja hao, hen gao-sing žen-ši ni-men, vo-men da-đja dou ši hao peng-jou.',
        english: 'Hello everyone, pleased to meet you all; we are all good friends.',
        serbian: 'Pozdrav svima, drago mi je što vas upoznajem; svi smo mi dobri prijatelji.',
        targetWords: ['大家', '认识', '你', '我', '朋友'],
        context: 'Social Greeting & Networking',
        tokens: [
          { word: '大家', pinyin: 'dàjiā', english: 'everyone', serbian: 'svi', isTarget: true },
          { word: '好', pinyin: 'hǎo', english: 'good/hello', serbian: 'dobro' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '很高兴', pinyin: 'hěn gāoxìng', english: 'very glad', serbian: 'veoma drago' },
          { word: '认识', pinyin: 'rènshi', english: 'to know', serbian: 'upoznati', isTarget: true },
          { word: '你们', pinyin: 'nǐmen', english: 'you all', serbian: 'vas', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '我们', pinyin: 'wǒmen', english: 'we', serbian: 'mi', isTarget: true },
          { word: '大家', pinyin: 'dàjiā', english: 'all of us', serbian: 'svi', isTarget: true },
          { word: '都是', pinyin: 'dōu shì', english: 'all are', serbian: 'smo svi' },
          { word: '好朋友', pinyin: 'hǎo péngyou', english: 'good friends', serbian: 'dobri prijatelji', isTarget: true }
        ]
      },
      {
        id: 's-2-2',
        chinese: '做好自己，尊重别人，那位王先生是这里的主人。',
        pinyin: 'Zuò hǎo zìjǐ, zūnzhòng biéren, nà wèi wáng xiānsheng shì zhèlǐ de zhǔrén.',
        vuk: 'Cuo hao ci-đji, cun-džung bje-žen, na vej vang sjen-šeng ši dže-li de džu-žen.',
        english: 'Be your best self and respect others; that Mr. Wang is the owner here.',
        serbian: 'Budi svoj najbolji ja i poštuj druge; onaj gospodin Vang je vlasnik ovog mesta.',
        targetWords: ['自己', '别人', '王', '先生', '主人'],
        context: 'Stoic Ethics & Courtesy',
        tokens: [
          { word: '做好', pinyin: 'zuò hǎo', english: 'do well', serbian: 'uradi dobro' },
          { word: '自己', pinyin: 'zìjǐ', english: 'oneself', serbian: 'sebe', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '尊重', pinyin: 'zūnzhòng', english: 'respect', serbian: 'poštuj' },
          { word: '别人', pinyin: 'biéren', english: 'other people', serbian: 'druge ljude', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '那位', pinyin: 'nà wèi', english: 'that (honorable)', serbian: 'onaj' },
          { word: '王先生', pinyin: 'wáng xiānsheng', english: 'Mr. Wang', serbian: 'gospodin Vang', isTarget: true },
          { word: '是', pinyin: 'shì', english: 'is', serbian: 'je' },
          { word: '这里的', pinyin: 'zhèlǐ de', english: 'here\'s', serbian: 'ovdašnji' },
          { word: '主人', pinyin: 'zhǔrén', english: 'master/host', serbian: 'domaćin', isTarget: true }
        ]
      }
    ]
  },
  {
    id: 'c1-r3',
    chartId: 1,
    rowNumber: 3,
    title: 'Body & Senses',
    titleSerbian: 'Telo, Čula i Delanje',
    emoji: '👄',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Organs of expression, sensory perception, manual tasks, and bodily mobility.',
    words: [
      // Core 10 Characters
      { char: '口', pinyin: 'kǒu', vuk: 'kou', english: 'mouth / entrance', serbian: 'usta / ulaz', exampleUse: '门口 (ulaz/vrata)', isCoreChar: true, category: 'noun' },
      { char: '说', pinyin: 'shuō', vuk: 'šuo', english: 'speak / say', serbian: 'govoriti', exampleUse: '说话 (govoriti reči)', isCoreChar: true, category: 'verb' },
      { char: '目', pinyin: 'mù', vuk: 'mu', english: 'eye / sight', serbian: 'oko / pogled', exampleUse: '目光 (pogled)', isCoreChar: true, category: 'noun' },
      { char: '见', pinyin: 'jiàn', vuk: 'đjen', english: 'look / see', serbian: 'videti', exampleUse: '看见 (videti)', isCoreChar: true, category: 'verb' },
      { char: '耳', pinyin: 'ěr', vuk: 'er', english: 'ear', serbian: 'uvo', exampleUse: '耳朵 (uši)', isCoreChar: true, category: 'noun' },
      { char: '闻', pinyin: 'wén', vuk: 'ven', english: 'hear / smell', serbian: 'čuti / namirisati', exampleUse: '新闻 (vesti)', isCoreChar: true, category: 'verb' },
      { char: '手', pinyin: 'shǒu', vuk: 'šou', english: 'hand', serbian: 'ruka / šaka', exampleUse: '手机 (mobilni telefon)', isCoreChar: true, category: 'noun' },
      { char: '工', pinyin: 'gōng', vuk: 'gung', english: 'work / labor', serbian: 'rad / posao', exampleUse: '工作 (posao)', isCoreChar: true, category: 'noun' },
      { char: '脚', pinyin: 'jiǎo', vuk: 'đjao', english: 'foot', serbian: 'stopalo / noga', exampleUse: '脚步 (korak)', isCoreChar: true, category: 'noun' },
      { char: '行', pinyin: 'xíng', vuk: 'sing', english: 'go / okay', serbian: 'ići / u redu', exampleUse: '行动 (akcija)', isCoreChar: true, category: 'verb' },
      // Expanded High-Frequency Native Vocabulary
      { char: '说话', pinyin: 'shuōhuà', vuk: 'šuo-hua', english: 'speak / talk', serbian: 'govoriti / razgovarati', exampleUse: '认真说话 (ozbiljno govoriti)', isCoreChar: false, category: 'verb' },
      { char: '工作', pinyin: 'gōngzuò', vuk: 'gung-cuo', english: 'work / profession', serbian: 'posao / raditi', exampleUse: '努力工作 (vredno raditi)', isCoreChar: false, category: 'noun' },
      { char: '看见', pinyin: 'kànjiàn', vuk: 'kan-đjen', english: 'see / catch sight of', serbian: 'videti / uočiti', exampleUse: '亲眼看见 (videti sopstvenim očima)', isCoreChar: false, category: 'verb' },
      { char: '手机', pinyin: 'shǒujī', vuk: 'šou-đji', english: 'mobile phone', serbian: 'mobilni telefon', exampleUse: '看手机 (gledati u telefon)', isCoreChar: false, category: 'noun' },
      { char: '听到', pinyin: 'tīngdào', vuk: 'ting-dao', english: 'hear / listen to', serbian: 'čuti', exampleUse: '听到声音 (čuti zvuk)', isCoreChar: false, category: 'verb' },
      { char: '眼睛', pinyin: 'yǎnjing', vuk: 'jan-đjing', english: 'eyes', serbian: 'oči', exampleUse: '闭上眼睛 (zatvori oči)', isCoreChar: false, category: 'noun' },
      { char: '耳朵', pinyin: 'ěrduo', vuk: 'er-duo', english: 'ears', serbian: 'uši', exampleUse: '竖起耳朵 (naćuliti uši)', isCoreChar: false, category: 'noun' },
      { char: '走路', pinyin: 'zǒulù', vuk: 'cou-lu', english: 'walk / go on foot', serbian: 'hodati / pešačiti', exampleUse: '散步走路 (šetati peške)', isCoreChar: false, category: 'verb' },
      { char: '行动', pinyin: 'xíngdòng', vuk: 'sing-dung', english: 'take action / move', serbian: 'delati / preduzeti akciju', exampleUse: '立即行动 (odmah delaj)', isCoreChar: false, category: 'verb' },
      { char: '门口', pinyin: 'ménkǒu', vuk: 'men-kou', english: 'doorway / entrance', serbian: 'ulaz / vrata', exampleUse: '站在门口 (stajati na vratima)', isCoreChar: false, category: 'noun' },
      { char: '亲手', pinyin: 'qīnshǒu', vuk: 'ćin-šou', english: 'with one\'s own hands', serbian: 'sopstvenim rukama', exampleUse: '亲手制作 (napraviti rukama)', isCoreChar: false, category: 'phrase' },
      { char: '新闻', pinyin: 'xīnwén', vuk: 'sin-ven', english: 'news / journalism', serbian: 'vesti', exampleUse: '看早间新闻 (gledati jutarnje vesti)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-3-1',
        chinese: '放下手机，用双手去工作，用双脚去走路行动。',
        pinyin: 'Fàngxià shǒujī, yòng shuāngshǒu qù gōngzuò, yòng shuāngjiǎo qù zǒulù xíngdòng.',
        vuk: 'Fang-sja šou-đji, jung šuang-šou ću gung-cuo, jung šuang-đjao ću cou-lu sing-dung.',
        english: 'Put down your phone; work with both hands, and walk into decisive action with both feet.',
        serbian: 'Odloži telefon; radi sa obe ruke i koračaj u odlučnu akciju sa obe noge.',
        targetWords: ['手机', '手', '工作', '脚', '走路', '行动'],
        context: 'Digital Detox & Stoic Action',
        tokens: [
          { word: '放下', pinyin: 'fàngxià', english: 'put down', serbian: 'odloži' },
          { word: '手机', pinyin: 'shǒujī', english: 'cellphone', serbian: 'telefon', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '用', pinyin: 'yòng', english: 'use', serbian: 'koristi' },
          { word: '双手', pinyin: 'shuāngshǒu', english: 'both hands', serbian: 'obe ruke', isTarget: true },
          { word: '去', pinyin: 'qù', english: 'to', serbian: 'da' },
          { word: '工作', pinyin: 'gōngzuò', english: 'work', serbian: 'radiš', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '用', pinyin: 'yòng', english: 'use', serbian: 'koristi' },
          { word: '双脚', pinyin: 'shuāngjiǎo', english: 'both feet', serbian: 'obe noge', isTarget: true },
          { word: '去', pinyin: 'qù', english: 'to', serbian: 'da' },
          { word: '走路', pinyin: 'zǒulù', english: 'walk', serbian: 'hodaš', isTarget: true },
          { word: '行动', pinyin: 'xíngdòng', english: 'act', serbian: 'deluješ', isTarget: true }
        ]
      },
      {
        id: 's-3-2',
        chinese: '我亲眼看见他在门口微笑着和大家说话。',
        pinyin: 'Wǒ qīnyǎn kànjiàn tā zài ménkǒu wēixiàozhe hé dàjiā shuōhuà.',
        vuk: 'Vo ćin-jan kan-đjen ta caj men-kou vej-sjao-dže he da-đja šuo-hua.',
        english: 'I saw him with my own eyes smiling and speaking with everyone at the entrance.',
        serbian: 'Video sam ga sopstvenim očima kako se na vratima sa osmehom obraća svima.',
        targetWords: ['看见', '门口', '说话'],
        context: 'Direct Observation & Interpersonal Grace',
        tokens: [
          { word: '我', pinyin: 'wǒ', english: 'I', serbian: 'ja' },
          { word: '亲眼', pinyin: 'qīnyǎn', english: 'with own eyes', serbian: 'sopstvenim očima' },
          { word: '看见', pinyin: 'kànjiàn', english: 'saw', serbian: 'video sam', isTarget: true },
          { word: '他', pinyin: 'tā', english: 'he', serbian: 'on' },
          { word: '在', pinyin: 'zài', english: 'at', serbian: 'na' },
          { word: '门口', pinyin: 'ménkǒu', english: 'entrance', serbian: 'vratima', isTarget: true },
          { word: '微笑着', pinyin: 'wēixiàozhe', english: 'smiling', serbian: 'smešeći se' },
          { word: '和', pinyin: 'hé', english: 'with', serbian: 'sa' },
          { word: '大家', pinyin: 'dàjiā', english: 'everyone', serbian: 'svima' },
          { word: '说话', pinyin: 'shuōhuà', english: 'speaking', serbian: 'razgovara', isTarget: true }
        ]
      }
    ]
  },
  {
    id: 'c1-r4',
    chartId: 1,
    rowNumber: 4,
    title: 'Directions & Spatial Existence',
    titleSerbian: 'Smerovi, Kretanje i Prisustvo',
    emoji: '🧭',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Orientations, spatial relations, arrival, departure, and ongoing positions.',
    words: [
      // Core 10 Characters
      { char: '来', pinyin: 'lái', vuk: 'laj', english: 'come', serbian: 'doći', exampleUse: '过来 (dođi ovamo)', isCoreChar: true, category: 'verb' },
      { char: '入', pinyin: 'rù', vuk: 'žu', english: 'enter', serbian: 'ući', exampleUse: '入口 (ulaz)', isCoreChar: true, category: 'verb' },
      { char: '出', pinyin: 'chū', vuk: 'ču', english: 'exit / out', serbian: 'izaći', exampleUse: '出口 (izlaz)', isCoreChar: true, category: 'verb' },
      { char: '上', pinyin: 'shàng', vuk: 'šang', english: 'up / on', serbian: 'gore / na', exampleUse: '上车 (ući u vozilo)', isCoreChar: true, category: 'direction' },
      { char: '下', pinyin: 'xià', vuk: 'sja', english: 'down / under', serbian: 'dole / ispod', exampleUse: '下午 (popodne)', isCoreChar: true, category: 'direction' },
      { char: '中', pinyin: 'zhōng', vuk: 'džung', english: 'center / middle', serbian: 'sredina / centar', exampleUse: '中文 (kineski jezik)', isCoreChar: true, category: 'direction' },
      { char: '在', pinyin: 'zài', vuk: 'caj', english: 'located at / in', serbian: 'nalazi se u/na', exampleUse: '在家 (kod kuće)', isCoreChar: true, category: 'direction' },
      { char: '左', pinyin: 'zuǒ', vuk: 'cuo', english: 'left', serbian: 'levo', exampleUse: '左边 (leva strana)', isCoreChar: true, category: 'direction' },
      { char: '右', pinyin: 'yòu', vuk: 'jou', english: 'right', serbian: 'desno', exampleUse: '右边 (desna strana)', isCoreChar: true, category: 'direction' },
      { char: '有', pinyin: 'yǒu', vuk: 'jou', english: 'have / there is', serbian: 'imati / postoji', exampleUse: '有人 (ima nekoga)', isCoreChar: true, category: 'verb' },
      // Expanded High-Frequency Native Vocabulary
      { char: '出来', pinyin: 'chūlai', vuk: 'ču-laj', english: 'come out / emerge', serbian: 'izaći napolje', exampleUse: '快出来 (brzo izađi)', isCoreChar: false, category: 'verb' },
      { char: '进去', pinyin: 'jìnqu', vuk: 'đjin-ću', english: 'go inside / enter', serbian: 'ući unutra', exampleUse: '请进去 (molim uđite)', isCoreChar: false, category: 'verb' },
      { char: '上面', pinyin: 'shàngmian', vuk: 'šang-mjen', english: 'above / on top', serbian: 'gore / na vrhu', exampleUse: '在上面 (na vrhu)', isCoreChar: false, category: 'direction' },
      { char: '下面', pinyin: 'xiàmian', vuk: 'sja-mjen', english: 'below / underneath', serbian: 'dole / ispod', exampleUse: '在下面 (ispod)', isCoreChar: false, category: 'direction' },
      { char: '中间', pinyin: 'zhōngjiān', vuk: 'džung-đjen', english: 'center / middle', serbian: 'sredina / centar', exampleUse: '站在中间 (stani u sredinu)', isCoreChar: false, category: 'direction' },
      { char: '左右', pinyin: 'zuǒyòu', vuk: 'cuo-jou', english: 'left and right / roughly', serbian: 'levo i desno / približno', exampleUse: '两米左右 (oko dva metra)', isCoreChar: false, category: 'direction' },
      { char: '旁边', pinyin: 'pángbiān', vuk: 'pang-bjen', english: 'beside / side', serbian: 'pored / sa strane', exampleUse: '在我旁边 (pored mene)', isCoreChar: false, category: 'direction' },
      { char: '正在', pinyin: 'zhèngzài', vuk: 'dženg-caj', english: 'currently doing', serbian: 'upravo radi', exampleUse: '正在学习 (upravo uči)', isCoreChar: false, category: 'phrase' },
      { char: '到处', pinyin: 'dàochù', vuk: 'dao-ču', english: 'everywhere', serbian: 'svuda', exampleUse: '到处都是 (svuda ima)', isCoreChar: false, category: 'direction' },
      { char: '地方', pinyin: 'dìfang', vuk: 'di-fang', english: 'place / location', serbian: 'mesto / lokacija', exampleUse: '好地方 (dobro mesto)', isCoreChar: false, category: 'noun' },
      { char: '上车', pinyin: 'shàngchē', vuk: 'šang-če', english: 'get in vehicle / board', serbian: 'ući u auto / prevoz', exampleUse: '准备上车 (pripremi se za ulazak)', isCoreChar: false, category: 'verb' },
      { char: '有用', pinyin: 'yǒuyòng', vuk: 'jou-jung', english: 'useful / helpful', serbian: 'korisno', exampleUse: '非常有用 (veoma korisno)', isCoreChar: false, category: 'adjective' }
    ],
    sentences: [
      {
        id: 's-4-1',
        chinese: '中间是大厅，出口在左边，入口在右边旁边。',
        pinyin: 'Zhōngjiān shì dàtīng, chūkǒu zài zuǒbiān, rùkǒu zài yòubiān pángbiān.',
        vuk: 'Džung-đjen ši da-ting, ču-kou caj cuo-bjen, žu-kou caj jou-bjen pang-bjen.',
        english: 'The middle is the main lobby; the exit is to the left, and the entrance is beside the right.',
        serbian: 'U sredini je glavni hol; izlaz je sa leve strane, a ulaz je odmah pored sa desne.',
        targetWords: ['中间', '出', '左', '入', '右', '旁边'],
        context: 'Wayfinding & Architecture',
        tokens: [
          { word: '中间', pinyin: 'zhōngjiān', english: 'middle', serbian: 'sredina', isTarget: true },
          { word: '是', pinyin: 'shì', english: 'is', serbian: 'je' },
          { word: '大厅', pinyin: 'dàtīng', english: 'lobby', serbian: 'hol' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '出口', pinyin: 'chūkǒu', english: 'exit', serbian: 'izlaz', isTarget: true },
          { word: '在', pinyin: 'zài', english: 'at', serbian: 'na', isTarget: true },
          { word: '左边', pinyin: 'zuǒbiān', english: 'left side', serbian: 'levoj strani', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '入口', pinyin: 'rùkǒu', english: 'entrance', serbian: 'ulaz', isTarget: true },
          { word: '在', pinyin: 'zài', english: 'at', serbian: 'na', isTarget: true },
          { word: '右边', pinyin: 'yòubiān', english: 'right side', serbian: 'desnoj strani', isTarget: true },
          { word: '旁边', pinyin: 'pángbiān', english: 'beside', serbian: 'pored', isTarget: true }
        ]
      },
      {
        id: 's-4-2',
        chinese: '他正在上面开会，大家准备上车去下一个地方。',
        pinyin: 'Tā zhèngzài shàngmian kāihuì, dàjiā zhǔnbèi shàngchē qù xià yī gè dìfang.',
        vuk: 'Ta dženg-caj šang-mjen kaj-huej, da-đja džun-bej šang-če ću sja ji ge di-fang.',
        english: 'He is currently upstairs in a meeting, and everyone is getting ready to board for the next location.',
        serbian: 'On trenutno gore ima sastanak, a svi se spremaju da uđu u prevoz za sledeće mesto.',
        targetWords: ['正在', '上面', '上车', '下', '地方'],
        context: 'Travel Logistics & Schedules',
        tokens: [
          { word: '他', pinyin: 'tā', english: 'he', serbian: 'on' },
          { word: '正在', pinyin: 'zhèngzài', english: 'currently', serbian: 'upravo', isTarget: true },
          { word: '上面', pinyin: 'shàngmian', english: 'upstairs/above', serbian: 'gore', isTarget: true },
          { word: '开会', pinyin: 'kāihuì', english: 'meeting', serbian: 'ima sastanak' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '大家', pinyin: 'dàjiā', english: 'everyone', serbian: 'svi' },
          { word: '准备', pinyin: 'zhǔnbèi', english: 'prepare', serbian: 'spremaju se' },
          { word: '上车', pinyin: 'shàngchē', english: 'board car', serbian: 'da uđu u vozilo', isTarget: true },
          { word: '去', pinyin: 'qù', english: 'go to', serbian: 'idu na' },
          { word: '下一个', pinyin: 'xià yī gè', english: 'next one', serbian: 'sledeće', isTarget: true },
          { word: '地方', pinyin: 'dìfang', english: 'place', serbian: 'mesto', isTarget: true }
        ]
      }
    ]
  },
  {
    id: 'c1-r5',
    chartId: 1,
    rowNumber: 5,
    title: 'Food, Feasts & Tea',
    titleSerbian: 'Hrana, Obroci i Čaj',
    emoji: '🍜',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Culinary staples: rice, beef, chicken, pork, fish, tofu, vegetables, and tea ritual.',
    words: [
      // Core 10 Characters
      { char: '吃', pinyin: 'chī', vuk: 'či', english: 'eat', serbian: 'jesti', exampleUse: '吃饭 (jesti obrok)', isCoreChar: true, category: 'verb' },
      { char: '饭', pinyin: 'fàn', vuk: 'fan', english: 'cooked rice / meal', serbian: 'kuvani pirinač / obrok', exampleUse: '白饭 (beli pirinač)', isCoreChar: true, category: 'noun' },
      { char: '菜', pinyin: 'cài', vuk: 'caj', english: 'vegetable / dish', serbian: 'povrće / jelo', exampleUse: '青菜 (zeleno povrće)', isCoreChar: true, category: 'noun' },
      { char: '豆', pinyin: 'dòu', vuk: 'dou', english: 'bean / pea', serbian: 'pasulj / soja', exampleUse: '豆腐 (tofu)', isCoreChar: true, category: 'noun' },
      { char: '肉', pinyin: 'ròu', vuk: 'žou', english: 'meat', serbian: 'meso', exampleUse: '牛肉 (govedina)', isCoreChar: true, category: 'noun' },
      { char: '牛', pinyin: 'niú', vuk: 'nju', english: 'cow / beef', serbian: 'krava / govedo', exampleUse: '牛奶 (mleko)', isCoreChar: true, category: 'noun' },
      { char: '猪', pinyin: 'zhū', vuk: 'džu', english: 'pig / pork', serbian: 'svinja / svinjetina', exampleUse: '猪肉 (svinjetina)', isCoreChar: true, category: 'noun' },
      { char: '鸡', pinyin: 'jī', vuk: 'đji', english: 'chicken', serbian: 'piletina / kokoška', exampleUse: '鸡蛋 (jaje)', isCoreChar: true, category: 'noun' },
      { char: '鱼', pinyin: 'yú', vuk: 'jü', english: 'fish', serbian: 'riba', exampleUse: '金鱼 (zlatna ribica)', isCoreChar: true, category: 'noun' },
      { char: '茶', pinyin: 'chá', vuk: 'ča', english: 'tea', serbian: 'čaj', exampleUse: '绿茶 (zeleni čaj)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '吃饭', pinyin: 'chīfàn', vuk: 'či-fan', english: 'have a meal / eat', serbian: 'jesti / obedovati', exampleUse: '去吃饭 (ići na ručak)', isCoreChar: false, category: 'verb' },
      { char: '牛肉', pinyin: 'niúròu', vuk: 'nju-žou', english: 'beef', serbian: 'govedina', exampleUse: '牛肉面 (nudle sa govedinom)', isCoreChar: false, category: 'noun' },
      { char: '鸡肉', pinyin: 'jīròu', vuk: 'đji-žou', english: 'chicken meat', serbian: 'piletina', exampleUse: '新鲜鸡肉 (sveža piletina)', isCoreChar: false, category: 'noun' },
      { char: '猪肉', pinyin: 'zhūròu', vuk: 'džu-žou', english: 'pork meat', serbian: 'svinjetina', exampleUse: '炒猪肉 (pržena svinjetina)', isCoreChar: false, category: 'noun' },
      { char: '喝茶', pinyin: 'hē chá', vuk: 'he ča', english: 'drink tea', serbian: 'piti čaj', exampleUse: '品茶喝茶 (uživati u čaju)', isCoreChar: false, category: 'verb' },
      { char: '绿茶', pinyin: 'lǜchá', vuk: 'lü-ča', english: 'green tea', serbian: 'zeleni čaj', exampleUse: '龙井绿茶 (Longjing zeleni čaj)', isCoreChar: false, category: 'noun' },
      { char: '豆腐', pinyin: 'dòufu', vuk: 'dou-fu', english: 'tofu / bean curd', serbian: 'tofu / sojin sir', exampleUse: '麻婆豆腐 (Mapo tofu)', isCoreChar: false, category: 'noun' },
      { char: '米饭', pinyin: 'mǐfàn', vuk: 'mi-fan', english: 'steamed rice', serbian: 'kuvani pirinač', exampleUse: '一碗米饭 (činija pirinča)', isCoreChar: false, category: 'noun' },
      { char: '好吃', pinyin: 'hǎochī', vuk: 'hao-či', english: 'delicious / tasty', serbian: 'ukusno', exampleUse: '特别好吃 (naročito ukusno)', isCoreChar: false, category: 'adjective' },
      { char: '味道', pinyin: 'wèidao', vuk: 'vej-dao', english: 'taste / flavor / aroma', serbian: 'ukus / miris / aroma', exampleUse: '味道鲜美 (svež i lep ukus)', isCoreChar: false, category: 'noun' },
      { char: '青菜', pinyin: 'qīngcài', vuk: 'ćing-caj', english: 'green vegetables', serbian: 'zeleno povrće', exampleUse: '多吃青菜 (jesti više povrća)', isCoreChar: false, category: 'noun' },
      { char: '点菜', pinyin: 'diǎncài', vuk: 'djen-caj', english: 'order dishes at table', serbian: 'naručiti jelo', exampleUse: '服务员点菜 (konobaru, narudžbina)', isCoreChar: false, category: 'verb' }
    ],
    sentences: [
      {
        id: 's-5-1',
        chinese: '服务员，我们要点菜：一份牛肉、一份豆腐青菜和一碗热米饭。',
        pinyin: 'Fúwùyuán, wǒmen yào diǎncài: yī fèn niúròu, yī fèn dòufu qīngcài hé yī wǎn rè mǐfàn.',
        vuk: 'Fu-vu-jüan, vo-men jao djen-caj: ji fen nju-žou, ji fen dou-fu ćing-caj he ji van že mi-fan.',
        english: 'Waiter, we would like to order: one portion of beef, one portion of tofu greens, and a bowl of hot rice.',
        serbian: 'Konobaru, želimo da naručimo: jednu porciju govedine, jednu porciju tofua sa povrćem i činiju toplog pirinča.',
        targetWords: ['点菜', '牛肉', '豆腐', '青菜', '米饭'],
        context: 'Restaurant Ordering & Clean Dining',
        tokens: [
          { word: '服务员', pinyin: 'fúwùyuán', english: 'waiter', serbian: 'konobaru' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '我们要', pinyin: 'wǒmen yào', english: 'we want', serbian: 'želimo' },
          { word: '点菜', pinyin: 'diǎncài', english: 'order food', serbian: 'da naručimo', isTarget: true },
          { word: '：', pinyin: ':', english: ':', serbian: ':' },
          { word: '一份', pinyin: 'yī fèn', english: 'one serving', serbian: 'jednu porciju' },
          { word: '牛肉', pinyin: 'niúròu', english: 'beef', serbian: 'govedine', isTarget: true },
          { word: '、', pinyin: '、', english: 'comma', serbian: 'zarez' },
          { word: '一份', pinyin: 'yī fèn', english: 'one serving', serbian: 'jednu porciju' },
          { word: '豆腐', pinyin: 'dòufu', english: 'tofu', serbian: 'tofua', isTarget: true },
          { word: '青菜', pinyin: 'qīngcài', english: 'greens', serbian: 'zeleniša', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '一碗', pinyin: 'yī wǎn', english: 'one bowl', serbian: 'jednu činiju' },
          { word: '热', pinyin: 'rè', english: 'hot', serbian: 'toplog' },
          { word: '米饭', pinyin: 'mǐfàn', english: 'cooked rice', serbian: 'pirinča', isTarget: true }
        ]
      },
      {
        id: 's-5-2',
        chinese: '这道鱼肉不仅新鲜好吃，配上一杯清香的绿茶更是绝妙味道。',
        pinyin: 'Zhè dào yúròu bùjǐn xīnxiān hǎochī, pèishang yī bēi qīngxiāng de lǜchá gèng shì juémiào wèidao.',
        vuk: 'Dže dao jü-žou bu-đjin sin-sjen hao-či, pej-šang ji bej ćing-sjang de lü-ča geng ši đjüe-mjao vej-dao.',
        english: 'This fish dish is not only fresh and delicious, but paired with fragrant green tea, its flavor is supreme.',
        serbian: 'Ovo riblje jelo je ne samo sveže i ukusno, već je uz šolju mirisnog zelenog čaja pravi božanstveni ukus.',
        targetWords: ['鱼', '好吃', '绿茶', '味道', '喝茶'],
        context: 'Gourmet Chinese Gastronomy',
        tokens: [
          { word: '这道', pinyin: 'zhè dào', english: 'this course', serbian: 'ovo' },
          { word: '鱼肉', pinyin: 'yúròu', english: 'fish meat', serbian: 'riblje jelo', isTarget: true },
          { word: '不仅', pinyin: 'bùjǐn', english: 'not only', serbian: 'ne samo' },
          { word: '新鲜', pinyin: 'xīnxiān', english: 'fresh', serbian: 'sveže' },
          { word: '好吃', pinyin: 'hǎochī', english: 'delicious', serbian: 'ukusno', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '配上', pinyin: 'pèishang', english: 'paired with', serbian: 'upareno sa' },
          { word: '一杯', pinyin: 'yī bēi', english: 'one cup', serbian: 'jednom šoljom' },
          { word: '清香的', pinyin: 'qīngxiāng de', english: 'fragrant', serbian: 'mirisnog' },
          { word: '绿茶', pinyin: 'lǜchá', english: 'green tea', serbian: 'zelenog čaja', isTarget: true },
          { word: '更是', pinyin: 'gèng shì', english: 'even more is', serbian: 'jeste još više' },
          { word: '绝妙', pinyin: 'juémiào', english: 'superb', serbian: 'savršen' },
          { word: '味道', pinyin: 'wèidao', english: 'flavor', serbian: 'ukus', isTarget: true }
        ]
      }
    ]
  },
  {
    id: 'c1-r6',
    chartId: 1,
    rowNumber: 6,
    title: 'School, Animals & Learning',
    titleSerbian: 'Škola, Životinje i Učenje',
    emoji: '🏫',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Education, family household, study of text and culture, plus companion pets.',
    words: [
      // Core 10 Characters
      { char: '国', pinyin: 'guó', vuk: 'guo', english: 'nation / country', serbian: 'država / zemlja', exampleUse: '中国 (Kina)', isCoreChar: true, category: 'noun' },
      { char: '家', pinyin: 'jiā', vuk: 'đja', english: 'home / family', serbian: 'dom / porodica', exampleUse: '回家 (ići kući)', isCoreChar: true, category: 'noun' },
      { char: '校', pinyin: 'xiào', vuk: 'sjao', english: 'school', serbian: 'škola', exampleUse: '学校 (škola)', isCoreChar: true, category: 'noun' },
      { char: '文', pinyin: 'wén', vuk: 'ven', english: 'text / culture', serbian: 'tekst / kultura', exampleUse: '文化 (kultura)', isCoreChar: true, category: 'noun' },
      { char: '学', pinyin: 'xué', vuk: 'sü-e', english: 'learn / study', serbian: 'učiti / proučavati', exampleUse: '学生 (učenik)', isCoreChar: true, category: 'verb' },
      { char: '狗', pinyin: 'gǒu', vuk: 'gou', english: 'dog', serbian: 'pas', exampleUse: '小狗 (kučence)', isCoreChar: true, category: 'noun' },
      { char: '猫', pinyin: 'māo', vuk: 'mao', english: 'cat', serbian: 'mačka', exampleUse: '小猫 (mače)', isCoreChar: true, category: 'noun' },
      { char: '马', pinyin: 'mǎ', vuk: 'ma', english: 'horse', serbian: 'konj', exampleUse: '白马 (beli konj)', isCoreChar: true, category: 'noun' },
      { char: '鸟', pinyin: 'niǎo', vuk: 'njao', english: 'bird', serbian: 'ptica', exampleUse: '小鸟 (ptičica)', isCoreChar: true, category: 'noun' },
      { char: '虫', pinyin: 'chóng', vuk: 'čung', english: 'insect / bug', serbian: 'insekt / buba', exampleUse: '飞虫 (leteći insekt)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '学校', pinyin: 'xuéxiào', vuk: 'sü-e-sjao', english: 'school / academy', serbian: 'škola', exampleUse: '去学校 (ići u školu)', isCoreChar: false, category: 'noun' },
      { char: '学习', pinyin: 'xuéxí', english: 'study / acquire skill', serbian: 'učiti / studirati', vuk: 'sü-e-si', exampleUse: '努力学习 (vredno učiti)', isCoreChar: false, category: 'verb' },
      { char: '学生', pinyin: 'xuésheng', vuk: 'sü-e-šeng', english: 'student / pupil', serbian: 'učenik / student', exampleUse: '大学生 (student fakulteta)', isCoreChar: false, category: 'noun' },
      { char: '老师', pinyin: 'lǎoshī', vuk: 'lao-ši', english: 'teacher / master', serbian: 'učitelj / profesor', exampleUse: '尊敬老师 (poštuj učitelja)', isCoreChar: false, category: 'noun' },
      { char: '国家', pinyin: 'guójiā', vuk: 'guo-đja', english: 'country / state', serbian: 'država', exampleUse: '文明国家 (civilizovana država)', isCoreChar: false, category: 'noun' },
      { char: '文化', pinyin: 'wénhuà', vuk: 'ven-hua', english: 'culture / civilisation', serbian: 'kultura', exampleUse: '中国文化 (kineska kultura)', isCoreChar: false, category: 'noun' },
      { char: '中文', pinyin: 'zhōngwén', vuk: 'džung-ven', english: 'Chinese language', serbian: 'kineski jezik', exampleUse: '学中文 (učiti kineski)', isCoreChar: false, category: 'noun' },
      { char: '小狗', pinyin: 'xiǎogǒu', vuk: 'sjao-gou', english: 'puppy / pet dog', serbian: 'kučence / pas', exampleUse: '喂小狗 (hraniti psa)', isCoreChar: false, category: 'noun' },
      { char: '小猫', pinyin: 'xiǎomāo', vuk: 'sjao-mao', english: 'kitten / pet cat', serbian: 'mače / mačka', exampleUse: '抱小猫 (držati mačku)', isCoreChar: false, category: 'noun' },
      { char: '动物', pinyin: 'dòngwù', vuk: 'dung-vu', english: 'animal / creature', serbian: 'životinja', exampleUse: '爱护动物 (čuvati životinje)', isCoreChar: false, category: 'noun' },
      { char: '回家', pinyin: 'huíjiā', vuk: 'huej-đja', english: 'return home', serbian: 'vratiti se kući', exampleUse: '准时回家 (vratiti se na vreme)', isCoreChar: false, category: 'verb' },
      { char: '知识', pinyin: 'zhīshi', vuk: 'dži-ši', english: 'knowledge / wisdom', serbian: 'znanje', exampleUse: '丰富知识 (obogatiti znanje)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-6-1',
        chinese: '学生们在学校跟着老师学习中文和中国悠久的历史文化。',
        pinyin: 'Xuéshengmen zài xuéxiào gēnzhe lǎoshī xuéxí zhōngwén hé zhōngguó yōujiǔ de lìshǐ wénhuà.',
        vuk: 'Süe-šeng-men caj süe-sjao gen-dže lao-ši süe-si džung-ven he džung-guo jou-đju de li-ši ven-hua.',
        english: 'Students are at school studying Chinese and China’s long-standing historical culture with the teacher.',
        serbian: 'Učenici u školi sa učiteljem uče kineski jezik i dugu kinesku istorijsku kulturu.',
        targetWords: ['学生', '学校', '老师', '学习', '中文', '文化'],
        context: 'Academic Mastery & Cultural Depth',
        tokens: [
          { word: '学生们', pinyin: 'xuéshengmen', english: 'students', serbian: 'učenici', isTarget: true },
          { word: '在', pinyin: 'zài', english: 'at', serbian: 'u' },
          { word: '学校', pinyin: 'xuéxiào', english: 'school', serbian: 'školi', isTarget: true },
          { word: '跟着', pinyin: 'gēnzhe', english: 'following with', serbian: 'zajedno sa' },
          { word: '老师', pinyin: 'lǎoshī', english: 'teacher', serbian: 'učiteljem', isTarget: true },
          { word: '学习', pinyin: 'xuéxí', english: 'study', serbian: 'uče', isTarget: true },
          { word: '中文', pinyin: 'zhōngwén', english: 'Chinese', serbian: 'kineski', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '中国', pinyin: 'zhōngguó', english: 'China', serbian: 'kinesku' },
          { word: '悠久的', pinyin: 'yōujiǔ de', english: 'long-standing', serbian: 'dugu' },
          { word: '历史', pinyin: 'lìshǐ', english: 'history', serbian: 'istorijsku' },
          { word: '文化', pinyin: 'wénhuà', english: 'culture', serbian: 'kulturu', isTarget: true }
        ]
      },
      {
        id: 's-6-2',
        chinese: '放学回家后，院子里的小狗和小猫开心地跑过来迎接我。',
        pinyin: 'Fàngxué huíjiā hòu, yuànzi lǐ de xiǎogǒu hé xiǎomāo kāixīn de pǎo guòlái yíngjiē wǒ.',
        vuk: 'Fang-süe huej-đja hou, jüan-ci li de sjao-gou he sjao-mao kaj-sin de pao guo-laj jing-đje vo.',
        english: 'After returning home from school, the little dog and kitten in the yard joyfully ran over to greet me.',
        serbian: 'Nakon povratka kući iz škole, kuče i mače u dvorištu su radosno dotrčali da me dočekaju.',
        targetWords: ['回家', '小狗', '小猫'],
        context: 'Warm Home Sanctuary & Companion Pets',
        tokens: [
          { word: '放学', pinyin: 'fàngxué', english: 'finish school', serbian: 'nakon škole' },
          { word: '回家后', pinyin: 'huíjiā hòu', english: 'after going home', serbian: 'posle povratka kući', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '院子里', pinyin: 'yuànzi lǐ', english: 'in the yard', serbian: 'u dvorištu' },
          { word: '的小狗', pinyin: 'de xiǎogǒu', english: 'little dog', serbian: 'kučence', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '小猫', pinyin: 'xiǎomāo', english: 'little cat', serbian: 'mače', isTarget: true },
          { word: '开心地', pinyin: 'kāixīn de', english: 'joyfully', serbian: 'radosno' },
          { word: '跑过来', pinyin: 'pǎo guòlái', english: 'ran over', serbian: 'dotrčali su' },
          { word: '迎接我', pinyin: 'yíngjiē wǒ', english: 'greet me', serbian: 'da me dočekaju' }
        ]
      }
    ]
  },
  {
    id: 'c1-r7',
    chartId: 1,
    rowNumber: 7,
    title: 'Cosmos & The Five Elements',
    titleSerbian: 'Kosmos i Pet Elemenata',
    emoji: '☀️',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Celestial astronomy and the 5 cosmological elements forming the natural universe.',
    words: [
      // Core 10 Characters
      { char: '日', pinyin: 'rì', vuk: 'ži', english: 'sun / day', serbian: 'sunce / dan', exampleUse: '日子 (dani)', isCoreChar: true, category: 'noun' },
      { char: '月', pinyin: 'yuè', vuk: 'jü-e', english: 'moon / month', serbian: 'mesec', exampleUse: '月亮 (mesec)', isCoreChar: true, category: 'noun' },
      { char: '天', pinyin: 'tiān', vuk: 'tjen', english: 'sky / heaven / day', serbian: 'nebo / dan', exampleUse: '天空 (nebo)', isCoreChar: true, category: 'noun' },
      { char: '地', pinyin: 'dì', vuk: 'di', english: 'land / earth', serbian: 'zemlja / tlo', exampleUse: '大地 (velika zemlja)', isCoreChar: true, category: 'noun' },
      { char: '海', pinyin: 'hǎi', vuk: 'haj', english: 'sea / ocean', serbian: 'more', exampleUse: '大海 (more)', isCoreChar: true, category: 'noun' },
      { char: '木', pinyin: 'mù', vuk: 'mu', english: 'wood / tree', serbian: 'drvo', exampleUse: '木头 (drvo građa)', isCoreChar: true, category: 'noun' },
      { char: '火', pinyin: 'huǒ', vuk: 'huo', english: 'fire', serbian: 'vatra', exampleUse: '火山 (vulkan)', isCoreChar: true, category: 'noun' },
      { char: '土', pinyin: 'tǔ', vuk: 'tu', english: 'soil / earth', serbian: 'zemlja / tlo', exampleUse: '土地 (zemljište)', isCoreChar: true, category: 'noun' },
      { char: '金', pinyin: 'jīn', vuk: 'đjin', english: 'metal / gold', serbian: 'metal / zlato', exampleUse: '金色 (zlatna boja)', isCoreChar: true, category: 'noun' },
      { char: '水', pinyin: 'shuǐ', vuk: 'šuej', english: 'water', serbian: 'voda', exampleUse: '喝水 (piti vodu)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '太阳', pinyin: 'tàiyáng', vuk: 'taj-jang', english: 'sun / sunshine', serbian: 'sunce', exampleUse: '晒太阳 (sunčati se)', isCoreChar: false, category: 'noun' },
      { char: '月亮', pinyin: 'yuèliang', vuk: 'jüe-ljang', english: 'moon', serbian: 'mesec', exampleUse: '明亮的月亮 (sjajni mesec)', isCoreChar: false, category: 'noun' },
      { char: '天空', pinyin: 'tiānkōng', vuk: 'tjen-kung', english: 'the open sky', serbian: 'nebo / prostranstvo', exampleUse: '蔚蓝天空 (plavo nebo)', isCoreChar: false, category: 'noun' },
      { char: '大地', pinyin: 'dàdì', vuk: 'da-di', english: 'vast earth / soil', serbian: 'zemlja / kopno', exampleUse: '回到大地 (povratak zemlji)', isCoreChar: false, category: 'noun' },
      { char: '大海', pinyin: 'dàhǎi', vuk: 'da-haj', english: 'vast ocean / sea', serbian: 'prostrano more', exampleUse: '面对大海 (okrenut ka moru)', isCoreChar: false, category: 'noun' },
      { char: '天气', pinyin: 'tiānqì', vuk: 'tjen-ći', english: 'weather / climate', serbian: 'vremenske prilike', exampleUse: '今天天气好 (danas je lepo vreme)', isCoreChar: false, category: 'noun' },
      { char: '喝水', pinyin: 'hē shuǐ', vuk: 'he šuej', english: 'drink water', serbian: 'piti vodu', exampleUse: '多喝水 (pijte više vode)', isCoreChar: false, category: 'verb' },
      { char: '阳光', pinyin: 'yángguāng', vuk: 'jang-guang', english: 'sunlight / beam', serbian: 'sunčeva svetlost', exampleUse: '温暖的阳光 (toplo sunce)', isCoreChar: false, category: 'noun' },
      { char: '自然', pinyin: 'zìrán', vuk: 'ci-žan', english: 'nature / natural', serbian: 'priroda', exampleUse: '热爱自然 (voleti prirodu)', isCoreChar: false, category: 'noun' },
      { char: '世界', pinyin: 'shìjiè', vuk: 'ši-đje', english: 'world / globe', serbian: 'svet', exampleUse: '美丽世界 (predivan svet)', isCoreChar: false, category: 'noun' },
      { char: '金色', pinyin: 'jīnsè', vuk: 'đjin-se', english: 'golden color', serbian: 'zlatna boja', exampleUse: '金色光芒 (zlatni sjaj)', isCoreChar: false, category: 'adjective' },
      { char: '空气', pinyin: 'kōngqì', vuk: 'kung-ći', english: 'air / atmosphere', serbian: 'vazduh', exampleUse: '清新空气 (svež vazduh)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-7-1',
        chinese: '今天天气晴朗，温暖的阳光照亮了天空、大地与浩瀚的大海。',
        pinyin: 'Jīntiān tiānqì qínglǎng, wēnnuǎn de yángguāng zhàoliàngle tiānkōng, dàdì yǔ hàohàn de dàhǎi.',
        vuk: 'Đjin-tjen tjen-ći ćing-lang, ven-nuan de jang-guang džao-ljang-le tjen-kung, da-di jü hao-han de da-haj.',
        english: 'Today the weather is sunny and clear; warm sunlight illuminates the sky, the earth, and the vast ocean.',
        serbian: 'Danas je vreme vedro; topla sunčeva svetlost obasjava nebo, zemlju i prostrano more.',
        targetWords: ['天气', '阳光', '天空', '大地', '大海'],
        context: 'Outdoor Serenity & Elements',
        tokens: [
          { word: '今天', pinyin: 'jīntiān', english: 'today', serbian: 'danas' },
          { word: '天气', pinyin: 'tiānqì', english: 'weather', serbian: 'vreme', isTarget: true },
          { word: '晴朗', pinyin: 'qínglǎng', english: 'clear/sunny', serbian: 'vedro' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '温暖的', pinyin: 'wēnnuǎn de', english: 'warm', serbian: 'topla' },
          { word: '阳光', pinyin: 'yángguāng', english: 'sunlight', serbian: 'sunčeva svetlost', isTarget: true },
          { word: '照亮了', pinyin: 'zhàoliàngle', english: 'illuminated', serbian: 'obasjala je' },
          { word: '天空', pinyin: 'tiānkōng', english: 'sky', serbian: 'nebo', isTarget: true },
          { word: '、', pinyin: '、', english: 'comma', serbian: 'zarez' },
          { word: '大地', pinyin: 'dàdì', english: 'earth', serbian: 'zemlju', isTarget: true },
          { word: '与', pinyin: 'yǔ', english: 'and', serbian: 'i' },
          { word: '浩瀚的', pinyin: 'hàohàn de', english: 'vast', serbian: 'prostrano' },
          { word: '大海', pinyin: 'dàhǎi', english: 'ocean', serbian: 'more', isTarget: true }
        ]
      },
      {
        id: 's-7-2',
        chinese: '金、木、水、火、土是中华五行思想的根基，顺应自然身心健康。',
        pinyin: 'Jīn, mù, shuǐ, huǒ, tǔ shì zhōnghuá wǔxíng sīxiǎng de gēnjī, shùnyìng zìrán shēnxīn jiànkāng.',
        vuk: 'Đjin, mu, šuej, huo, tu ši džung-hua vu-sing si-sjang de gen-đji, šun-jing ci-žan šen-sin đjen-kang.',
        english: 'Metal, Wood, Water, Fire, and Earth are the roots of Five Elements thought; harmonizing with nature yields health.',
        serbian: 'Metal, drvo, voda, vatra i zemlja su temelj učenja o Pet elemenata; život u skladu sa prirodom donosi zdravlje.',
        targetWords: ['金', '木', '水', '火', '土', '自然'],
        context: 'Daoist Philosophy & Body Harmony',
        tokens: [
          { word: '金木水火土', pinyin: 'jīn mù shuǐ huǒ tǔ', english: 'Five elements', serbian: 'Pet elemenata', isTarget: true },
          { word: '是', pinyin: 'shì', english: 'are', serbian: 'su' },
          { word: '中华', pinyin: 'zhōnghuá', english: 'Chinese', serbian: 'kineske' },
          { word: '五行思想', pinyin: 'wǔxíng sīxiǎng', english: 'Five Elements philosophy', serbian: 'filozofije Pet Elemenata' },
          { word: '的根基', pinyin: 'de gēnjī', english: 'foundation', serbian: 'osnova' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '顺应', pinyin: 'shùnyìng', english: 'harmonize with', serbian: 'uskladiti se sa' },
          { word: '自然', pinyin: 'zìrán', english: 'nature', serbian: 'prirodom', isTarget: true },
          { word: '身心健康', pinyin: 'shēnxīn jiànkāng', english: 'physical mental health', serbian: 'zdravlje tela i uma' }
        ]
      }
    ]
  },
  {
    id: 'c1-r8',
    chartId: 1,
    rowNumber: 8,
    title: 'Landscapes, Weather & Minerals',
    titleSerbian: 'Pejzaži, Vreme i Minerali',
    emoji: '⛰️',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Mountains, rivers, precipitation, grain, agricultural fields, blooms, and stones.',
    words: [
      // Core 10 Characters
      { char: '气', pinyin: 'qì', vuk: 'ći', english: 'air / energy / weather', serbian: 'vazduh / energija / vreme', exampleUse: '天气 (vremenske prilike)', isCoreChar: true, category: 'noun' },
      { char: '干', pinyin: 'gān', vuk: 'gan', english: 'dry', serbian: 'suvo', exampleUse: '干净 (čisto)', isCoreChar: true, category: 'adjective' },
      { char: '雨', pinyin: 'yǔ', vuk: 'jü', english: 'rain', serbian: 'kiša', exampleUse: '下雨 (pada kiša)', isCoreChar: true, category: 'noun' },
      { char: '山', pinyin: 'shān', vuk: 'šan', english: 'mountain', serbian: 'planina', exampleUse: '爬山 (planinarenje)', isCoreChar: true, category: 'noun' },
      { char: '川', pinyin: 'chuān', vuk: 'čuan', english: 'river / plains', serbian: 'reka / prostranstvo', exampleUse: '山川 (planine i reke)', isCoreChar: true, category: 'noun' },
      { char: '米', pinyin: 'mǐ', vuk: 'mi', english: 'rice grain / meter', serbian: 'pirinač / metar', exampleUse: '大米 (pirinač)', isCoreChar: true, category: 'noun' },
      { char: '田', pinyin: 'tián', vuk: 'tjen', english: 'field / farmland', serbian: 'polje / njiva', exampleUse: '农田 (poljoprivredno polje)', isCoreChar: true, category: 'noun' },
      { char: '花', pinyin: 'huā', vuk: 'hua', english: 'flower', serbian: 'cvet', exampleUse: '鲜花 (sveže cveće)', isCoreChar: true, category: 'noun' },
      { char: '石', pinyin: 'shí', vuk: 'ši', english: 'stone / rock', serbian: 'kamen / stena', exampleUse: '石头 (kamen)', isCoreChar: true, category: 'noun' },
      { char: '玉', pinyin: 'yù', vuk: 'jü', english: 'jade', serbian: 'žad', exampleUse: '白玉 (beli žad)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '下雨', pinyin: 'xiàyǔ', vuk: 'sja-jü', english: 'to rain / raining', serbian: 'pada kiša', exampleUse: '外面下雨 (napolju pada kiša)', isCoreChar: false, category: 'verb' },
      { char: '爬山', pinyin: 'páshān', vuk: 'pa-šan', english: 'hike / climb mountain', serbian: 'planinariti / penjati se', exampleUse: '周末爬山 (planinariti za vikend)', isCoreChar: false, category: 'verb' },
      { char: '鲜花', pinyin: 'xiānhuā', vuk: 'sjen-hua', english: 'fresh flower', serbian: 'sveže cveće', exampleUse: '一束鲜花 (buket cveća)', isCoreChar: false, category: 'noun' },
      { char: '干净', pinyin: 'gānjìng', vuk: 'gan-đjing', english: 'clean / neat', serbian: 'čisto / uredno', exampleUse: '打扫干净 (počistiti čisto)', isCoreChar: false, category: 'adjective' },
      { char: '雨伞', pinyin: 'yǔsǎn', vuk: 'jü-san', english: 'umbrella', serbian: 'kišobran', exampleUse: '带一把雨伞 (poneti kišobran)', isCoreChar: false, category: 'noun' },
      { char: '山川', pinyin: 'shānchuān', vuk: 'šan-čuan', english: 'mountains and rivers', serbian: 'planine i reke', exampleUse: '壮丽山川 (veličanstveni pejzaži)', isCoreChar: false, category: 'noun' },
      { char: '田野', pinyin: 'tiányě', vuk: 'tjen-je', english: 'open fields / countryside', serbian: 'polja / njive', exampleUse: '奔跑在田野 (trčati po poljima)', isCoreChar: false, category: 'noun' },
      { char: '石头', pinyin: 'shítou', vuk: 'ši-tou', english: 'stone / boulder', serbian: 'kamen', exampleUse: '坚硬的石头 (tvrd kamen)', isCoreChar: false, category: 'noun' },
      { char: '玉石', pinyin: 'yùshí', vuk: 'jü-ši', english: 'precious jade stone', serbian: 'dragoceni žad', exampleUse: '温润玉石 (topli žad)', isCoreChar: false, category: 'noun' },
      { char: '大米', pinyin: 'dàmǐ', vuk: 'da-mi', english: 'rice grain', serbian: 'pirinač', exampleUse: '袋装大米 (džak pirinča)', isCoreChar: false, category: 'noun' },
      { char: '干燥', pinyin: 'gānzào', vuk: 'gan-zao', english: 'dry / arid', serbian: 'suv vazduh / suvoća', exampleUse: '气候干燥 (suva klima)', isCoreChar: false, category: 'adjective' },
      { char: '空气', pinyin: 'kōngqì', vuk: 'kung-ći', english: 'fresh air', serbian: 'vazduh', exampleUse: '山里空气好 (odličan planinski vazduh)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-8-1',
        chinese: '外面正在下雨，出门记得带上雨伞，山川田野间的鲜花更美了。',
        pinyin: 'Wàimiàn zhèngzài xiàyǔ, chūmén jìde dàishang yǔsǎn, shānchuān tiányě jiān de xiānhuā gèng měi le.',
        vuk: 'Vaj-mjen dženg-caj sja-jü, ču-men đji-de daj-šang jü-san, šan-čuan tjen-je đjen de sjen-hua geng mej le.',
        english: 'It is raining outside; remember to take an umbrella; the fresh flowers among the mountains and fields are all the more beautiful.',
        serbian: 'Napolju pada kiša; ponesite kišobran; sveže cveće među planinama i poljima postalo je još lepše.',
        targetWords: ['下雨', '雨伞', '山川', '田野', '鲜花'],
        context: 'Spring Rainfall & Natural Serenity',
        tokens: [
          { word: '外面', pinyin: 'wàimiàn', english: 'outside', serbian: 'napolju' },
          { word: '正在', pinyin: 'zhèngzài', english: 'currently', serbian: 'upravo' },
          { word: '下雨', pinyin: 'xiàyǔ', english: 'raining', serbian: 'pada kiša', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '出门', pinyin: 'chūmén', english: 'leaving home', serbian: 'pri izlasku' },
          { word: '记得', pinyin: 'jìde', english: 'remember', serbian: 'zapamti' },
          { word: '带上', pinyin: 'dàishang', english: 'bring along', serbian: 'poneti' },
          { word: '雨伞', pinyin: 'yǔsǎn', english: 'umbrella', serbian: 'kišobran', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '山川', pinyin: 'shānchuān', english: 'mountains rivers', serbian: 'planine i reke', isTarget: true },
          { word: '田野', pinyin: 'tiányě', english: 'fields', serbian: 'polja', isTarget: true },
          { word: '间的', pinyin: 'jiān de', english: 'among', serbian: 'između' },
          { word: '鲜花', pinyin: 'xiānhuā', english: 'fresh flowers', serbian: 'sveže cveće', isTarget: true },
          { word: '更美了', pinyin: 'gèng měi le', english: 'more beautiful', serbian: 'još je lepše' }
        ]
      },
      {
        id: 's-8-2',
        chinese: '周末我们一起去爬山，山里的空气十分干净，溪水旁有好看的玉石。',
        pinyin: 'Zhōumò wǒmen yīqǐ qù páshān, shān lǐ de kōngqì shífēn gānjìng, xīshuǐ páng yǒu hǎokàn de yùshí.',
        vuk: 'Džou-mo vo-men ji-ći ću pa-šan, šan li de kung-ći ši-fen gan-đjing, si-šuej pang jou hao-kan de jü-ši.',
        english: 'This weekend we hike together in the mountains; the mountain air is thoroughly clean, and beside the stream are lovely jade stones.',
        serbian: 'Za vikend idemo zajedno na planinarenje; planinski vazduh je izuzetno čist, a pored potoka ima lepog kamenja od žada.',
        targetWords: ['爬山', '空气', '干净', '玉石'],
        context: 'Weekend Hiking & Mountain Retreat',
        tokens: [
          { word: '周末', pinyin: 'zhōumò', english: 'weekend', serbian: 'za vikend' },
          { word: '我们一起', pinyin: 'wǒmen yīqǐ', english: 'we together', serbian: 'mi zajedno' },
          { word: '去爬山', pinyin: 'qù páshān', english: 'go mountain hike', serbian: 'idemo na planinarenje', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '山里的', pinyin: 'shān lǐ de', english: 'in the mountain', serbian: 'u planini' },
          { word: '空气', pinyin: 'kōngqì', english: 'air', serbian: 'vazduh', isTarget: true },
          { word: '十分', pinyin: 'shífēn', english: 'extremely', serbian: 'veoma' },
          { word: '干净', pinyin: 'gānjìng', english: 'clean', serbian: 'čist', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '溪水旁', pinyin: 'xīshuǐ páng', english: 'beside creek', serbian: 'pored potoka' },
          { word: '有', pinyin: 'yǒu', english: 'there are', serbian: 'ima' },
          { word: '好看的', pinyin: 'hǎokàn de', english: 'fine looking', serbian: 'lepog' },
          { word: '玉石', pinyin: 'yùshí', english: 'jade stone', serbian: 'žada', isTarget: true }
        ]
      }
    ]
  },
  {
    id: 'c1-r9',
    chartId: 1,
    rowNumber: 9,
    title: 'Settlements, Clothes & Colors',
    titleSerbian: 'Naselja, Odeća i Boje',
    emoji: '🏘️',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Towns, stores, vehicles, daily wear, and the primary spectrum of vibrant colors.',
    words: [
      // Core 10 Characters
      { char: '村', pinyin: 'cūn', vuk: 'cun', english: 'village', serbian: 'selo', exampleUse: '农村 (seosko područje)', isCoreChar: true, category: 'noun' },
      { char: '店', pinyin: 'diàn', vuk: 'djen', english: 'shop / store', serbian: 'prodavnica / radnja', exampleUse: '书店 (knjižara)', isCoreChar: true, category: 'noun' },
      { char: '车', pinyin: 'chē', vuk: 'če', english: 'vehicle / car', serbian: 'vozilo / automobil', exampleUse: '开车 (voziti auto)', isCoreChar: true, category: 'noun' },
      { char: '衣', pinyin: 'yī', vuk: 'ji', english: 'clothes', serbian: 'odeća', exampleUse: '衣服 (odeća)', isCoreChar: true, category: 'noun' },
      { char: '白', pinyin: 'bái', vuk: 'baj', english: 'white', serbian: 'bela boja', exampleUse: '白天 (danju)', isCoreChar: true, category: 'adjective' },
      { char: '黑', pinyin: 'hēi', vuk: 'hej', english: 'black', serbian: 'crna boja', exampleUse: '黑夜 (crna noć)', isCoreChar: true, category: 'adjective' },
      { char: '红', pinyin: 'hóng', vuk: 'hung', english: 'red', serbian: 'crvena boja', exampleUse: '红茶 (crni/crveni čaj)', isCoreChar: true, category: 'adjective' },
      { char: '蓝', pinyin: 'lán', vuk: 'lan', english: 'blue', serbian: 'plava boja', exampleUse: '蓝天 (plavo nebo)', isCoreChar: true, category: 'adjective' },
      { char: '绿', pinyin: 'lǜ', vuk: 'lü', english: 'green', serbian: 'zelena boja', exampleUse: '绿茶 (zeleni čaj)', isCoreChar: true, category: 'adjective' },
      { char: '黄', pinyin: 'huáng', vuk: 'huang', english: 'yellow', serbian: 'žuta boja', exampleUse: '黄金 (zlato)', isCoreChar: true, category: 'adjective' },
      // Expanded High-Frequency Native Vocabulary
      { char: '衣服', pinyin: 'yīfu', vuk: 'ji-fu', english: 'clothes / apparel', serbian: 'odeća', exampleUse: '穿衣服 (obuci odeću)', isCoreChar: false, category: 'noun' },
      { char: '商店', pinyin: 'shāngdiàn', vuk: 'šang-djen', english: 'store / shopping outlet', serbian: 'prodavnica', exampleUse: '去商店 (ići u prodavnicu)', isCoreChar: false, category: 'noun' },
      { char: '开车', pinyin: 'kāichē', vuk: 'kaj-če', english: 'drive a car', serbian: 'voziti automobil', exampleUse: '小心开车 (vozi pažljivo)', isCoreChar: false, category: 'verb' },
      { char: '车站', pinyin: 'chēzhàn', vuk: 'če-džan', english: 'station / bus stop', serbian: 'stanica', exampleUse: '公交车站 (autobuska stanica)', isCoreChar: false, category: 'noun' },
      { char: '农村', pinyin: 'nóngcūn', vuk: 'nung-cun', english: 'rural village / countryside', serbian: 'seosko područje', exampleUse: '生活在农村 (živeti na selu)', isCoreChar: false, category: 'noun' },
      { char: '白色', pinyin: 'báisè', vuk: 'baj-se', english: 'white color', serbian: 'bela boja', exampleUse: '白色衬衫 (bela košulja)', isCoreChar: false, category: 'adjective' },
      { char: '黑色', pinyin: 'hēisè', vuk: 'hej-se', english: 'black color', serbian: 'crna boja', exampleUse: '黑色汽车 (crni auto)', isCoreChar: false, category: 'adjective' },
      { char: '红色', pinyin: 'hóngsè', vuk: 'hung-se', english: 'red color', serbian: 'crvena boja', exampleUse: '红色大衣 (crveni kaput)', isCoreChar: false, category: 'adjective' },
      { char: '蓝色', pinyin: 'lánsè', vuk: 'lan-se', english: 'blue color', serbian: 'plava boja', exampleUse: '蓝色牛仔裤 (plave farmerke)', isCoreChar: false, category: 'adjective' },
      { char: '绿色', pinyin: 'lǜsè', vuk: 'lü-se', english: 'green color', serbian: 'zelena boja', exampleUse: '绿色植物 (zeleno bilje)', isCoreChar: false, category: 'adjective' },
      { char: '黄色', pinyin: 'huángsè', vuk: 'huang-se', english: 'yellow color', serbian: 'žuta boja', exampleUse: '黄色枫叶 (žuto lišće javora)', isCoreChar: false, category: 'adjective' },
      { char: '颜色', pinyin: 'yánsè', vuk: 'jan-se', english: 'color', serbian: 'boja', exampleUse: '什么颜色 (koja boja)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-9-1',
        chinese: '村里的服装商店里有红色、蓝色和黄色的各种漂亮衣服。',
        pinyin: 'Cūn lǐ de fúzhuāng shāngdiàn lǐ yǒu hóngsè, lánsè hé huángsè de gè zhǒng piàoliang yīfu.',
        vuk: 'Cun li de fu-džuang šang-djen li jou hung-se, lan-se he huang-se de ge džung pjao-ljang ji-fu.',
        english: 'The clothing store in the village carries all kinds of beautiful clothes in red, blue, and yellow.',
        serbian: 'U prodavnici odeće u selu ima razne lepe odeće u crvenoj, plavoj i žutoj boji.',
        targetWords: ['村', '商店', '红色', '蓝色', '黄色', '衣服'],
        context: 'Shopping & Apparel Selection',
        tokens: [
          { word: '村里', pinyin: 'cūn lǐ', english: 'in village', serbian: 'u selu', isTarget: true },
          { word: '的', pinyin: 'de', english: 'of', serbian: 'od' },
          { word: '服装商店', pinyin: 'fúzhuāng shāngdiàn', english: 'clothing store', serbian: 'prodavnici odeće', isTarget: true },
          { word: '里', pinyin: 'lǐ', english: 'inside', serbian: 'u' },
          { word: '有', pinyin: 'yǒu', english: 'has', serbian: 'ima' },
          { word: '红色', pinyin: 'hóngsè', english: 'red', serbian: 'crvena', isTarget: true },
          { word: '、', pinyin: '、', english: 'comma', serbian: 'zarez' },
          { word: '蓝色', pinyin: 'lánsè', english: 'blue', serbian: 'plava', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '黄色', pinyin: 'huángsè', english: 'yellow', serbian: 'žuta', isTarget: true },
          { word: '的', pinyin: 'de', english: 'possessive', serbian: 'boja' },
          { word: '各种', pinyin: 'gè zhǒng', english: 'various', serbian: 'raznih' },
          { word: '漂亮', pinyin: 'piàoliang', english: 'pretty', serbian: 'lepe' },
          { word: '衣服', pinyin: 'yīfu', english: 'clothes', serbian: 'odeće', isTarget: true }
        ]
      },
      {
        id: 's-9-2',
        chinese: '他开着一辆黑色的车去车站，穿着一件干净的白色衬衫。',
        pinyin: 'Tā kāizhe yī liàng hēisè de chē qù chēzhàn, chuānzhe yī jiàn gānjìng de báisè chènshān.',
        vuk: 'Ta kaj-dže ji ljang hej-se de če ću če-džan, čuan-dže ji đjen gan-đjing de baj-se čen-šan.',
        english: 'He drives a black car to the station, wearing a clean white shirt.',
        serbian: 'Vozi crni automobil do stanice, noseći čistu belu košulju.',
        targetWords: ['开车', '黑色', '车站', '白色'],
        context: 'Urban Commute & Sartorial Style',
        tokens: [
          { word: '他', pinyin: 'tā', english: 'he', serbian: 'on' },
          { word: '开着', pinyin: 'kāizhe', english: 'driving', serbian: 'vozeći', isTarget: true },
          { word: '一辆', pinyin: 'yī liàng', english: 'one (vehicle)', serbian: 'jedan' },
          { word: '黑色', pinyin: 'hēisè', english: 'black', serbian: 'crni', isTarget: true },
          { word: '的车', pinyin: 'de chē', english: 'car', serbian: 'auto', isTarget: true },
          { word: '去', pinyin: 'qù', english: 'to', serbian: 'do' },
          { word: '车站', pinyin: 'chēzhàn', english: 'station', serbian: 'stanice', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '穿着', pinyin: 'chuānzhe', english: 'wearing', serbian: 'noseći' },
          { word: '一件', pinyin: 'yī jiàn', english: 'one piece', serbian: 'jednu' },
          { word: '干净的', pinyin: 'gānjìng de', english: 'clean', serbian: 'čistu' },
          { word: '白色', pinyin: 'báisè', english: 'white', serbian: 'belu', isTarget: true },
          { word: '衬衫', pinyin: 'chènshān', english: 'shirt', serbian: 'košulju' }
        ]
      }
    ]
  },
  {
    id: 'c1-r10',
    chartId: 1,
    rowNumber: 10,
    title: 'Heart, Mind & Vital Strength',
    titleSerbian: 'Srce, Duh, Sreća i Snaga',
    emoji: '❤️',
    chartImage: '/assets/aistudio/image_1536d14f.png',
    description: 'Human psychology, health, resilience, joy, recovery, and life\'s inner fortitude.',
    words: [
      // Core 10 Characters
      { char: '是', pinyin: 'shì', vuk: 'ši', english: 'be / is / yes', serbian: 'jeste / biti', exampleUse: '是的 (jeste)', isCoreChar: true, category: 'verb' },
      { char: '心', pinyin: 'xīn', vuk: 'sin', english: 'heart / mind', serbian: 'srce / um', exampleUse: '心情 (raspoloženje)', isCoreChar: true, category: 'noun' },
      { char: '好', pinyin: 'hǎo', vuk: 'hao', english: 'good / well', serbian: 'dobro', exampleUse: '你好 (zdravo)', isCoreChar: true, category: 'adjective' },
      { char: '爱', pinyin: 'ài', vuk: 'aj', english: 'love', serbian: 'ljubav', exampleUse: '关爱 (briga/ljubav)', isCoreChar: true, category: 'verb' },
      { char: '喜', pinyin: 'xǐ', vuk: 'si', english: 'happiness / joy', serbian: 'radost / veselje', exampleUse: '喜欢 (voleti/dopadati se)', isCoreChar: true, category: 'noun' },
      { char: '幸', pinyin: 'xìng', vuk: 'sing', english: 'luck / fortunate', serbian: 'sreća / blagoslov', exampleUse: '幸福 (sreća u životu)', isCoreChar: true, category: 'noun' },
      { char: '生', pinyin: 'shēng', vuk: 'šeng', english: 'life / birth / grow', serbian: 'život / rođenje', exampleUse: '生命 (život)', isCoreChar: true, category: 'verb' },
      { char: '死', pinyin: 'sǐ', vuk: 'si', english: 'death / die', serbian: 'smrt', exampleUse: '生死 (život i smrt)', isCoreChar: true, category: 'noun' },
      { char: '力', pinyin: 'lì', vuk: 'li', english: 'strength / power', serbian: 'snaga / moć', exampleUse: '力量 (fizička/duhovna snaga)', isCoreChar: true, category: 'noun' },
      { char: '病', pinyin: 'bìng', vuk: 'bing', english: 'sickness / disease', serbian: 'bolest', exampleUse: '生病 (razboleti se)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '心情', pinyin: 'xīnqíng', vuk: 'sin-ćing', english: 'mood / frame of mind', serbian: 'raspoloženje', exampleUse: '心情愉快 (odlično raspoloženje)', isCoreChar: false, category: 'noun' },
      { char: '喜欢', pinyin: 'xǐhuan', vuk: 'si-huan', english: 'like / enjoy', serbian: 'voleti / dopadati se', exampleUse: '我很喜欢 (veoma volim)', isCoreChar: false, category: 'verb' },
      { char: '力量', pinyin: 'lìliang', vuk: 'li-ljang', english: 'strength / inner power', serbian: 'snaga / sila', exampleUse: '强大的力量 (ogromna snaga)', isCoreChar: false, category: 'noun' },
      { char: '幸福', pinyin: 'xìngfú', vuk: 'sing-fu', english: 'happiness / wellbeing', serbian: 'sreća / blagostanje', exampleUse: '家庭幸福 (porodična sreća)', isCoreChar: false, category: 'noun' },
      { char: '生命', pinyin: 'shēngmìng', vuk: 'šeng-ming', english: 'life / vital existence', serbian: 'život', exampleUse: '珍爱生命 (ceniti život)', isCoreChar: false, category: 'noun' },
      { char: '生病', pinyin: 'shēngbìng', vuk: 'šeng-bing', english: 'fall ill / get sick', serbian: 'razboleti se', exampleUse: '生病看医生 (ići kod lekara)', isCoreChar: false, category: 'verb' },
      { char: '努力', pinyin: 'nǔlì', vuk: 'nu-li', english: 'work hard / strive', serbian: 'truditi se / napor', exampleUse: '继续努力 (nastavi da se trudiš)', isCoreChar: false, category: 'verb' },
      { char: '放心', pinyin: 'fàngxīn', vuk: 'fang-sin', english: 'feel relieved / rest assured', serbian: 'odahnuti / biti miran', exampleUse: '请放心 (budite bez brige)', isCoreChar: false, category: 'verb' },
      { char: '健康', pinyin: 'jiànkāng', vuk: 'đjen-kang', english: 'health / healthy', serbian: 'zdravlje / zdrav', exampleUse: '身体健康 (dobro telesno zdravlje)', isCoreChar: false, category: 'adjective' },
      { char: '医生', pinyin: 'yīshēng', vuk: 'ji-šeng', english: 'medical doctor', serbian: 'lekar', exampleUse: '去看医生 (ići kod doktora)', isCoreChar: false, category: 'noun' },
      { char: '真正', pinyin: 'zhēnzhèng', vuk: 'džen-dženg', english: 'genuine / truly', serbian: 'istinski / pravi', exampleUse: '真正的朋友 (pravi prijatelj)', isCoreChar: false, category: 'adjective' },
      { char: '爱情', pinyin: 'àiqíng', vuk: 'aj-ćing', english: 'romantic love', serbian: 'ljubav', exampleUse: '美好的爱情 (lepa ljubav)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-10-1',
        chinese: '保持好心情，每天努力锻炼，身体健康就是最大的幸福与力量。',
        pinyin: 'Bǎochí hǎo xīnqíng, měitiān nǔlì duànliàn, shēntǐ jiànkāng jiù shì zuì dà de xìngfú yǔ lìliang.',
        vuk: 'Bao-či hao sin-ćing, mej-tjen nu-li duan-ljen, šen-ti đjen-kang đju ši cuej da de sing-fu jü li-ljang.',
        english: 'Keep a good mood and train hard every day; physical health is the greatest happiness and power.',
        serbian: 'Zadrži dobro raspoloženje i vredno vežbaj svakog dana; telesno zdravlje je najveća sreća i snaga.',
        targetWords: ['心情', '努力', '健康', '幸福', '力量'],
        context: 'WiseFit Core Philosophy & Vitality',
        tokens: [
          { word: '保持', pinyin: 'bǎochí', english: 'maintain', serbian: 'zadrži' },
          { word: '好心情', pinyin: 'hǎo xīnqíng', english: 'good mood', serbian: 'dobro raspoloženje', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '每天', pinyin: 'měitiān', english: 'every day', serbian: 'svakog dana' },
          { word: '努力', pinyin: 'nǔlì', english: 'strive/hard', serbian: 'vredno', isTarget: true },
          { word: '锻炼', pinyin: 'duànliàn', english: 'exercise', serbian: 'vežbaj' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '身体健康', pinyin: 'shēntǐ jiànkāng', english: 'body health', serbian: 'telesno zdravlje', isTarget: true },
          { word: '就是', pinyin: 'jiù shì', english: 'is precisely', serbian: 'jeste' },
          { word: '最大', pinyin: 'zuì dà', english: 'greatest', serbian: 'najveća' },
          { word: '的', pinyin: 'de', english: 'of', serbian: 'od' },
          { word: '幸福', pinyin: 'xìngfú', english: 'happiness', serbian: 'sreća', isTarget: true },
          { word: '与', pinyin: 'yǔ', english: 'and', serbian: 'i' },
          { word: '力量', pinyin: 'lìliang', english: 'strength', serbian: 'snaga', isTarget: true }
        ]
      },
      {
        id: 's-10-2',
        chinese: '生病时请放心听医生的话，坚强的生命力能战胜一切困难。',
        pinyin: 'Shēngbìng shí qǐng fàngxīn tīng yīshēng de huà, jiānqiáng de shēngmìnglì néng zhànshèng yīqiè kùnnan.',
        vuk: 'Šeng-bing ši ćing fang-sin ting ji-šeng de hua, đjen-ćjang de šeng-ming-li neng džan-šeng ji-ćje kun-nan.',
        english: 'When ill, rest assured and heed the doctor’s advice; strong vitality can overcome any obstacle.',
        serbian: 'Kada se razboliš mirno slušaj savete lekara; jaka životna snaga pobeđuje sve prepreke.',
        targetWords: ['生病', '放心', '医生', '生命'],
        context: 'Healing & Stoic Endurance',
        tokens: [
          { word: '生病时', pinyin: 'shēngbìng shí', english: 'when ill', serbian: 'kada se razboliš', isTarget: true },
          { word: '请放心', pinyin: 'qǐng fàngxīn', english: 'please rest assured', serbian: 'budi miran', isTarget: true },
          { word: '听', pinyin: 'tīng', english: 'listen to', serbian: 'slušaj' },
          { word: '医生的话', pinyin: 'yīshēng de huà', english: 'doctor\'s words', serbian: 'reči lekara', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '坚强的', pinyin: 'jiānqiáng de', english: 'strong/resilient', serbian: 'jaka' },
          { word: '生命力', pinyin: 'shēngmìnglì', english: 'vitality', serbian: 'životna snaga', isTarget: true },
          { word: '能', pinyin: 'néng', english: 'can', serbian: 'može da' },
          { word: '战胜', pinyin: 'zhànshèng', english: 'conquer', serbian: 'pobedi' },
          { word: '一切困难', pinyin: 'yīqiè kùnnan', english: 'all difficulties', serbian: 'sve teškoće' }
        ]
      }
    ]
  },

  // ==========================================
  // CHART 2: 100 VERBS, NATURE & ACTIONS (Rows 11 - 20)
  // Image: /assets/aistudio/image_878c0d94.png
  // ==========================================
  {
    id: 'c2-r1',
    chartId: 2,
    rowNumber: 1,
    title: 'Forests, Roots & Waters',
    titleSerbian: 'Šume, Koreni i Vode',
    emoji: '🌿',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Deep woodland vegetation, tree leaves, subterranean roots, and pristine lakes and brooks.',
    words: [
      // Core 10 Characters
      { char: '森', pinyin: 'sēn', vuk: 'sen', english: 'dense forest', serbian: 'gusta šuma', exampleUse: '森林 (šuma)', isCoreChar: true, category: 'noun' },
      { char: '林', pinyin: 'lín', vuk: 'lin', english: 'woods / grove', serbian: 'šumarci / drveće', exampleUse: '树林 (šuma)', isCoreChar: true, category: 'noun' },
      { char: '草', pinyin: 'cǎo', vuk: 'cao', english: 'grass', serbian: 'trava', exampleUse: '青草 (zelena trava)', isCoreChar: true, category: 'noun' },
      { char: '根', pinyin: 'gēn', vuk: 'gen', english: 'root', serbian: 'koren', exampleUse: '根本 (osnova/koren)', isCoreChar: true, category: 'noun' },
      { char: '芽', pinyin: 'yá', vuk: 'ja', english: 'sprout / bud', serbian: 'izdanak / pupoljak', exampleUse: '发芽 (proklijati)', isCoreChar: true, category: 'noun' },
      { char: '枝', pinyin: 'zhī', vuk: 'dži', english: 'branch', serbian: 'grana', exampleUse: '树枝 (grana drveta)', isCoreChar: true, category: 'noun' },
      { char: '叶', charTraditional: '葉', pinyin: 'yè', vuk: 'je', english: 'leaf', serbian: 'list', exampleUse: '绿叶 (zeleni list)', isCoreChar: true, category: 'noun' },
      { char: '洞', pinyin: 'dòng', vuk: 'dung', english: 'cave / hole', serbian: 'pećina / rupa', exampleUse: '山洞 (pećina)', isCoreChar: true, category: 'noun' },
      { char: '湖', pinyin: 'hú', vuk: 'hu', english: 'lake', serbian: 'jezero', exampleUse: '西湖 (Zapadno jezero)', isCoreChar: true, category: 'noun' },
      { char: '溪', pinyin: 'xī', vuk: 'si', english: 'stream / brook', serbian: 'potok', exampleUse: '小溪 (mali potok)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '森林', pinyin: 'sēnlín', vuk: 'sen-lin', english: 'forest / jungle', serbian: 'gusta šuma', exampleUse: '森林公园 (šumski park)', isCoreChar: false, category: 'noun' },
      { char: '树木', pinyin: 'shùmù', vuk: 'šu-mu', english: 'trees / arbor', serbian: 'drveće', exampleUse: '茂盛的树木 (bujno drveće)', isCoreChar: false, category: 'noun' },
      { char: '草地', pinyin: 'cǎodì', vuk: 'cao-di', english: 'lawn / meadow', serbian: 'livada / trava', exampleUse: '躺在草地上 (ležati na travi)', isCoreChar: false, category: 'noun' },
      { char: '树枝', pinyin: 'shùzhī', vuk: 'šu-dži', english: 'tree branch', serbian: 'grana drveta', exampleUse: '鸟栖在树枝 (ptica na grani)', isCoreChar: false, category: 'noun' },
      { char: '树叶', pinyin: 'shùyè', vuk: 'šu-je', english: 'tree leaves', serbian: 'lišće', exampleUse: '秋天的树叶 (jesenje lišće)', isCoreChar: false, category: 'noun' },
      { char: '湖水', pinyin: 'húshuǐ', vuk: 'hu-šuej', english: 'lake water', serbian: 'jezerska voda', exampleUse: '清澈的湖水 (bistre vode jezera)', isCoreChar: false, category: 'noun' },
      { char: '小溪', pinyin: 'xiǎoxī', vuk: 'sjao-si', english: 'brook / mountain creek', serbian: 'mali potok', exampleUse: '溪流潺潺 (žubor potoka)', isCoreChar: false, category: 'noun' },
      { char: '湖泊', pinyin: 'húpō', vuk: 'hu-po', english: 'lakes', serbian: 'jezera', exampleUse: '美丽湖泊 (prelepo jezero)', isCoreChar: false, category: 'noun' },
      { char: '根本', pinyin: 'gēnběn', vuk: 'gen-ben', english: 'fundamental / essential', serbian: 'osnovni / korenit', exampleUse: '根本原因 (glavni koren razloga)', isCoreChar: false, category: 'adjective' },
      { char: '发芽', pinyin: 'fāyá', vuk: 'fa-ja', english: 'sprout / germinate', serbian: 'klijati / ozeleneti', exampleUse: '种子发芽 (seme klija)', isCoreChar: false, category: 'verb' },
      { char: '山洞', pinyin: 'shāndòng', vuk: 'šan-dung', english: 'mountain cave', serbian: 'planinska pećina', exampleUse: '走进山洞 (ući u pećinu)', isCoreChar: false, category: 'noun' },
      { char: '风景', pinyin: 'fēngjǐng', vuk: 'feng-đjing', english: 'landscape / scenery', serbian: 'pejzaž / prizor', exampleUse: '风景优美 (izuzetan pejzaž)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-11-1',
        chinese: '漫步在森林公园，小溪边的草地上长满了绿色的树木与嫩芽。',
        pinyin: 'Mànbù zài sēnlín gōngyuán, xiǎoxī biān de cǎodì shàng zhǎngmǎnle lǜsè de shùmù yǔ nènyá.',
        vuk: 'Man-bu caj sen-lin gung-jüan, sjao-si bjen de cao-di šang džang-man-le lü-se de šu-mu jü nen-ja.',
        english: 'Strolling through the forest park, the grass by the brook is laden with green trees and tender sprouts.',
        serbian: 'Šetajući šumskim parkom, travnata obala potoka puna je zelenog drveća i nežnih izdanaka.',
        targetWords: ['森林', '小溪', '草地', '树木', '芽'],
        context: 'Forest Bathing & Nature Strolls',
        tokens: [
          { word: '漫步在', pinyin: 'mànbù zài', english: 'strolling in', serbian: 'šetajući po' },
          { word: '森林公园', pinyin: 'sēnlín gōngyuán', english: 'forest park', serbian: 'šumskom parku', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '小溪边', pinyin: 'xiǎoxī biān', english: 'brookside', serbian: 'obali potoka', isTarget: true },
          { word: '的', pinyin: 'de', english: 'possessive', serbian: 'od' },
          { word: '草地上', pinyin: 'cǎodì shàng', english: 'on grass', serbian: 'na travi', isTarget: true },
          { word: '长满了', pinyin: 'zhǎngmǎnle', english: 'filled with growth', serbian: 'raste prepuno' },
          { word: '绿色的', pinyin: 'lǜsè de', english: 'green', serbian: 'zeleno' },
          { word: '树木', pinyin: 'shùmù', english: 'trees', serbian: 'drveće', isTarget: true },
          { word: '与', pinyin: 'yǔ', english: 'and', serbian: 'i' },
          { word: '嫩芽', pinyin: 'nènyá', english: 'tender sprouts', serbian: 'mladi izdanci', isTarget: true }
        ]
      },
      {
        id: 's-11-2',
        chinese: '平静的湖水倒映着树枝上的树叶，山洞前的风景格外迷人。',
        pinyin: 'Píngjìng de húshuǐ dàoyìngzhe shùzhī shàng de shùyè, shāndòng qián de fēngjǐng géwài mírén.',
        vuk: 'Ping-đjing de hu-šuej dao-jing-dže šu-dži šang de šu-je, šan-dung ćjen de feng-đjing ge-vaj mi-žen.',
        english: 'The serene lake water mirrors the leaves on the branches; the landscape before the cave is uniquely enchanting.',
        serbian: 'Mirna jezerska voda odražava lišće na granama; prizor ispred pećine je naročito očaravajući.',
        targetWords: ['湖水', '树枝', '树叶', '山洞', '风景'],
        context: 'Reflective Contemplation of Lakes & Scenery',
        tokens: [
          { word: '平静的', pinyin: 'píngjìng de', english: 'serene/peaceful', serbian: 'mirna' },
          { word: '湖水', pinyin: 'húshuǐ', english: 'lake water', serbian: 'jezerska voda', isTarget: true },
          { word: '倒映着', pinyin: 'dàoyìngzhe', english: 'reflecting', serbian: 'odražava' },
          { word: '树枝上', pinyin: 'shùzhī shàng', english: 'on tree branches', serbian: 'na granama drveta', isTarget: true },
          { word: '的', pinyin: 'de', english: 'possessive', serbian: 'od' },
          { word: '树叶', pinyin: 'shùyè', english: 'leaves', serbian: 'lišće', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '山洞前', pinyin: 'shāndòng qián', english: 'in front of cave', serbian: 'ispred pećine', isTarget: true },
          { word: '的', pinyin: 'de', english: 'modifier', serbian: 'od' },
          { word: '风景', pinyin: 'fēngjǐng', english: 'scenery', serbian: 'pejzaž', isTarget: true },
          { word: '格外', pinyin: 'géwài', english: 'extraordinarily', serbian: 'naročito' },
          { word: '迷人', pinyin: 'mírén', english: 'enchanting', serbian: 'očaravajući' }
        ]
      }
    ]
  },
  {
    id: 'c2-r2',
    chartId: 2,
    rowNumber: 2,
    title: 'Cycles of Time & Seasons',
    titleSerbian: 'Ciklusi Vremena i Godišnja Doba',
    emoji: '⏳',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Temporal progression: yesterday, today, tomorrow, weeks, years, morning dawn, dusk, and seasons.',
    words: [
      // Core 10 Characters
      { char: '今', pinyin: 'jīn', vuk: 'đjin', english: 'today / now', serbian: 'danas / sada', exampleUse: '今天 (danas)', isCoreChar: true, category: 'noun' },
      { char: '昨', pinyin: 'zuó', vuk: 'cuo', english: 'yesterday', serbian: 'juče', exampleUse: '昨天 (juče)', isCoreChar: true, category: 'noun' },
      { char: '明', pinyin: 'míng', vuk: 'ming', english: 'tomorrow / bright', serbian: 'sutra / sjajno', exampleUse: '明天 (sutra)', isCoreChar: true, category: 'noun' },
      { char: '周', charTraditional: '週', pinyin: 'zhōu', vuk: 'džou', english: 'week / cycle', serbian: 'nedelja / ciklus', exampleUse: '周末 (vikend)', isCoreChar: true, category: 'noun' },
      { char: '月', pinyin: 'yuè', vuk: 'jüe', english: 'month / moon', serbian: 'mesec', exampleUse: '上个月 (prošli mesec)', isCoreChar: true, category: 'noun' },
      { char: '年', pinyin: 'nián', vuk: 'njen', english: 'year', serbian: 'godina', exampleUse: '今年 (ove godine)', isCoreChar: true, category: 'noun' },
      { char: '晨', pinyin: 'chén', vuk: 'čen', english: 'morning / dawn', serbian: 'jutro / zora', exampleUse: '清晨 (rano jutro)', isCoreChar: true, category: 'noun' },
      { char: '昏', pinyin: 'hūn', vuk: 'hun', english: 'dusk / twilight', serbian: 'sumrak', exampleUse: '黄昏 (zlatni sumrak)', isCoreChar: true, category: 'noun' },
      { char: '刻', pinyin: 'kè', vuk: 'ke', english: 'quarter hour / moment', serbian: 'četvrt sata / tren', exampleUse: '此刻 (ovaj trenutak)', isCoreChar: true, category: 'noun' },
      { char: '季', pinyin: 'jì', vuk: 'đji', english: 'season', serbian: 'godišnje doba', exampleUse: '四季 (četiri godišnja doba)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '今天', pinyin: 'jīntiān', vuk: 'đjin-tjen', english: 'today', serbian: 'danas', exampleUse: '今天开始 (početi danas)', isCoreChar: false, category: 'noun' },
      { char: '昨天', pinyin: 'zuótiān', vuk: 'cuo-tjen', english: 'yesterday', serbian: 'juče', exampleUse: '昨天晚上 (sinoć)', isCoreChar: false, category: 'noun' },
      { char: '明天', pinyin: 'míngtiān', vuk: 'ming-tjen', english: 'tomorrow', serbian: 'sutra', exampleUse: '明天见 (vidimo se sutra)', isCoreChar: false, category: 'noun' },
      { char: '周末', pinyin: 'zhōumò', vuk: 'džou-mo', english: 'weekend', serbian: 'vikend', exampleUse: '周末愉快 (prijatan vikend)', isCoreChar: false, category: 'noun' },
      { char: '星期', pinyin: 'xīngqī', vuk: 'sing-ći', english: 'week / day of week', serbian: 'sedmica / dan u sedmici', exampleUse: '这个星期 (ove sedmice)', isCoreChar: false, category: 'noun' },
      { char: '今年', pinyin: 'jīnnián', vuk: 'đjin-njen', english: 'this year', serbian: 'ove godine', exampleUse: '今年目标 (ciljevi za ovu godinu)', isCoreChar: false, category: 'noun' },
      { char: '清晨', pinyin: 'qīngchén', vuk: 'ćing-čen', english: 'early morning / dawn', serbian: 'rano jutro / osvit', exampleUse: '清晨冥想 (jutarnja meditacija)', isCoreChar: false, category: 'noun' },
      { char: '黄昏', pinyin: 'huánghūn', vuk: 'huang-hun', english: 'golden dusk / twilight', serbian: 'sumrak / predvečerje', exampleUse: '黄昏散步 (šetnja u sumrak)', isCoreChar: false, category: 'noun' },
      { char: '季节', pinyin: 'jìjié', vuk: 'đji-đje', english: 'season / climate cycle', serbian: 'godišnje doba', exampleUse: '换季 (promena godišnjeg doba)', isCoreChar: false, category: 'noun' },
      { char: '立刻', pinyin: 'lìkè', vuk: 'li-ke', english: 'immediately / at once', serbian: 'odmah / smesta', exampleUse: '立刻行动 (delaj odmah)', isCoreChar: false, category: 'phrase' },
      { char: '时间', pinyin: 'shíjiān', vuk: 'ši-đjen', english: 'time / duration', serbian: 'vreme / trajanje', exampleUse: '宝贵的时间 (dragoceno vreme)', isCoreChar: false, category: 'noun' },
      { char: '春天', pinyin: 'chūntiān', vuk: 'čun-tjen', english: 'springtime', serbian: 'proleće', exampleUse: '温暖的春天 (toplo proleće)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-12-1',
        chinese: '昨天已经过去，今天清晨立刻开始行动，明天就会收获成果。',
        pinyin: 'Zuótiān yǐjīng guòqù, jīntiān qīngchén lìkè kāishǐ xíngdòng, míngtiān jiù huì shōuhuò chéngguǒ.',
        vuk: 'Cuo-tjen ji-đjing guo-ću, đjin-tjen ćing-čen li-ke kaj-ši sing-dung, ming-tjen đju huej šou-huo čeng-guo.',
        english: 'Yesterday has already passed; take action immediately this morning, and tomorrow you will reap the results.',
        serbian: 'Juče je već prošlo; preduzmi akciju odmah ovog jutra, i sutra ćeš ubirati plodove.',
        targetWords: ['昨天', '今天', '清晨', '立刻', '明天'],
        context: 'Daily Mindset & Decisive Action',
        tokens: [
          { word: '昨天', pinyin: 'zuótiān', english: 'yesterday', serbian: 'juče', isTarget: true },
          { word: '已经过去', pinyin: 'yǐjīng guòqù', english: 'already passed', serbian: 'je već prošlo' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '今天', pinyin: 'jīntiān', english: 'today', serbian: 'danas', isTarget: true },
          { word: '清晨', pinyin: 'qīngchén', english: 'morning dawn', serbian: 'rano jutro', isTarget: true },
          { word: '立刻', pinyin: 'lìkè', english: 'immediately', serbian: 'odmah', isTarget: true },
          { word: '开始', pinyin: 'kāishǐ', english: 'start', serbian: 'započni' },
          { word: '行动', pinyin: 'xíngdòng', english: 'action', serbian: 'delovanje' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '明天', pinyin: 'míngtiān', english: 'tomorrow', serbian: 'sutra', isTarget: true },
          { word: '就会', pinyin: 'jiù huì', english: 'then will', serbian: 'tada ćeš' },
          { word: '收获', pinyin: 'shōuhuò', english: 'harvest', serbian: 'ubrati' },
          { word: '成果', pinyin: 'chéngguǒ', english: 'results', serbian: 'rezultate' }
        ]
      },
      {
        id: 's-12-2',
        chinese: '今年这个季节的时间过得很快，每个周末的黄昏我都去散步。',
        pinyin: 'Jīnnián zhè gè jìjié de shíjiān guò de hěn kuài, měi gè zhōumò de huánghūn wǒ dōu qù sànbù.',
        vuk: 'Đjin-njen dže ge đji-đje de ši-đjen guo de hen kuaj, mej ge džou-mo de huang-hun vo dou ću san-bu.',
        english: 'Time passes very quickly this season; every weekend at dusk I go for a relaxing walk.',
        serbian: 'Vreme ovog godišnjeg doba prolazi veoma brzo; svakog vikenda u sumrak odlazim u šetnju.',
        targetWords: ['今年', '季节', '时间', '周末', '黄昏'],
        context: 'Rhythms of Time & Seasonal Walking',
        tokens: [
          { word: '今年', pinyin: 'jīnnián', english: 'this year', serbian: 'ove godine', isTarget: true },
          { word: '这个', pinyin: 'zhè gè', english: 'this', serbian: 'ovog' },
          { word: '季节', pinyin: 'jìjié', english: 'season', serbian: 'godišnjeg doba', isTarget: true },
          { word: '的', pinyin: 'de', english: 'possessive', serbian: 'od' },
          { word: '时间', pinyin: 'shíjiān', english: 'time', serbian: 'vreme', isTarget: true },
          { word: '过得很', pinyin: 'guò de hěn', english: 'passes very', serbian: 'prolazi veoma' },
          { word: '快', pinyin: 'kuài', english: 'fast', serbian: 'brzo' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '每个', pinyin: 'měi gè', english: 'every', serbian: 'svakog' },
          { word: '周末', pinyin: 'zhōumò', english: 'weekend', serbian: 'vikenda', isTarget: true },
          { word: '的', pinyin: 'de', english: 'of', serbian: 'u' },
          { word: '黄昏', pinyin: 'huánghūn', english: 'dusk', serbian: 'sumrak', isTarget: true },
          { word: '我都去', pinyin: 'wǒ dōu qù', english: 'I always go', serbian: 'uvek idem' },
          { word: '散步', pinyin: 'sànbù', english: 'take walk', serbian: 'u šetnju' }
        ]
      }
    ]
  },
  {
    id: 'c2-r3',
    chartId: 2,
    rowNumber: 3,
    title: 'Wild Fauna & Living Creatures',
    titleSerbian: 'Divlje Zveri i Živi Svet',
    emoji: '🦁',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Predators, forest grazers, agile runners, reptiles, waterfowl, and aquatic organisms.',
    words: [
      // Core 10 Characters
      { char: '狮', charTraditional: '獅', pinyin: 'shī', vuk: 'ši', english: 'lion', serbian: 'lav', exampleUse: '雄狮 (mužjak lav)', isCoreChar: true, category: 'noun' },
      { char: '虎', pinyin: 'hǔ', vuk: 'hu', english: 'tiger', serbian: 'tigar', exampleUse: '老虎 (tigar)', isCoreChar: true, category: 'noun' },
      { char: '熊', pinyin: 'xióng', vuk: 'sjung', english: 'bear', serbian: 'medved', exampleUse: '黑熊 (crni medved)', isCoreChar: true, category: 'noun' },
      { char: '鹿', pinyin: 'lù', vuk: 'lu', english: 'deer', serbian: 'srna / jelen', exampleUse: '小鹿 (lane)', isCoreChar: true, category: 'noun' },
      { char: '蛇', pinyin: 'shé', vuk: 'še', english: 'snake', serbian: 'zmija', exampleUse: '毒蛇 (otrovnica)', isCoreChar: true, category: 'noun' },
      { char: '龟', charTraditional: '龜', pinyin: 'guī', vuk: 'guej', english: 'turtle / tortoise', serbian: 'kornjača', exampleUse: '乌龟 (kornjača)', isCoreChar: true, category: 'noun' },
      { char: '兔', pinyin: 'tù', vuk: 'tu', english: 'rabbit', serbian: 'zec', exampleUse: '白兔 (beli zec)', isCoreChar: true, category: 'noun' },
      { char: '鸭', charTraditional: '鴨', pinyin: 'yā', vuk: 'ja', english: 'duck', serbian: 'patka', exampleUse: '野鸭 (divlja patka)', isCoreChar: true, category: 'noun' },
      { char: '鱼', charTraditional: '魚', pinyin: 'yú', vuk: 'jü', english: 'fish', serbian: 'riba', exampleUse: '金鱼 (zlatna ribica)', isCoreChar: true, category: 'noun' },
      { char: '鼠', pinyin: 'shǔ', vuk: 'šu', english: 'rat / rodent', serbian: 'miš / pacov', exampleUse: '松鼠 (veverica)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '狮子', pinyin: 'shīzi', vuk: 'ši-ci', english: 'lion', serbian: 'lav', exampleUse: '草原狮子 (lav iz savane)', isCoreChar: false, category: 'noun' },
      { char: '老虎', pinyin: 'lǎohǔ', vuk: 'lao-hu', english: 'tiger', serbian: 'tigar', exampleUse: '东北虎 (sibirski tigar)', isCoreChar: false, category: 'noun' },
      { char: '小鹿', pinyin: 'xiǎolù', vuk: 'sjao-lu', english: 'fawn / small deer', serbian: 'srna / lane', exampleUse: '林中小鹿 (lane u šumi)', isCoreChar: false, category: 'noun' },
      { char: '兔子', pinyin: 'tùzi', vuk: 'tu-ci', english: 'rabbit / bunny', serbian: 'zec', exampleUse: '小白兔 (mali beli zec)', isCoreChar: false, category: 'noun' },
      { char: '乌龟', pinyin: 'wūguī', vuk: 'vu-guej', english: 'tortoise / turtle', serbian: 'kornjača', exampleUse: '长寿乌龟 (dugovečna kornjača)', isCoreChar: false, category: 'noun' },
      { char: '烤鸭', pinyin: 'kǎoyā', vuk: 'kao-ja', english: 'roast duck', serbian: 'pečena patka', exampleUse: '北京烤鸭 (pekinška patka)', isCoreChar: false, category: 'noun' },
      { char: '鱼肉', pinyin: 'yúròu', vuk: 'jü-žou', english: 'fish meat', serbian: 'riblje meso', exampleUse: '鲜美鱼肉 (slasna riba)', isCoreChar: false, category: 'noun' },
      { char: '老鼠', pinyin: 'lǎoshǔ', vuk: 'lao-šu', english: 'mouse / rodent', serbian: 'miš / glodar', exampleUse: '捉老鼠 (hvatati miša)', isCoreChar: false, category: 'noun' },
      { char: '保护', pinyin: 'bǎohù', vuk: 'bao-hu', english: 'protect / safeguard', serbian: 'zaštititi', exampleUse: '保护野生动物 (zaštititi divlje životinje)', isCoreChar: false, category: 'verb' },
      { char: '毒蛇', pinyin: 'dúshé', vuk: 'du-še', english: 'venomous serpent', serbian: 'otrovna zmija', exampleUse: '避开毒蛇 (izbeći zmiju)', isCoreChar: false, category: 'noun' },
      { char: '大熊', pinyin: 'dàxióng', vuk: 'da-sjung', english: 'large bear', serbian: 'veliki medved', exampleUse: '北极熊 (polarni medved)', isCoreChar: false, category: 'noun' },
      { char: '野生', pinyin: 'yěshēng', vuk: 'je-šeng', english: 'wild / in habitat', serbian: 'divlji', exampleUse: '野生动物 (divlje životinje)', isCoreChar: false, category: 'adjective' }
    ],
    sentences: [
      {
        id: 's-13-1',
        chinese: '森林公园里有奔跑的小鹿与敏捷的兔子，我们必须保护野生动物。',
        pinyin: 'Sēnlín gōngyuán lǐ yǒu bēnpǎo de xiǎolù yǔ mǐnjié de tùzi, wǒmen bìxū bǎohù yěshēng dòngwù.',
        vuk: 'Sen-lin gung-jüan li jou ben-pao de sjao-lu jü min-đje de tu-ci, vo-men bi-sü bao-hu je-šeng dung-vu.',
        english: 'In the forest park are running deer and swift rabbits; we must protect wild animals.',
        serbian: 'U šumskom parku trče srne i brzi zečevi; mi moramo štititi divlje životinje.',
        targetWords: ['小鹿', '兔子', '保护', '野生'],
        context: 'Wildlife Preservation & Sanctuary',
        tokens: [
          { word: '森林公园里', pinyin: 'sēnlín gōngyuán lǐ', english: 'in forest park', serbian: 'u šumskom parku' },
          { word: '有', pinyin: 'yǒu', english: 'there are', serbian: 'ima' },
          { word: '奔跑的', pinyin: 'bēnpǎo de', english: 'running', serbian: 'koje trče' },
          { word: '小鹿', pinyin: 'xiǎolù', english: 'small deer', serbian: 'srne', isTarget: true },
          { word: '与', pinyin: 'yǔ', english: 'and', serbian: 'i' },
          { word: '敏捷的', pinyin: 'mǐnjié de', english: 'agile', serbian: 'brzi' },
          { word: '兔子', pinyin: 'tùzi', english: 'rabbits', serbian: 'zečevi', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '我们必须', pinyin: 'wǒmen bìxū', english: 'we must', serbian: 'mi moramo' },
          { word: '保护', pinyin: 'bǎohù', english: 'protect', serbian: 'štititi', isTarget: true },
          { word: '野生动物', pinyin: 'yěshēng dòngwù', english: 'wild animals', serbian: 'divlje životinje', isTarget: true }
        ]
      },
      {
        id: 's-13-2',
        chinese: '狮子和老虎是威猛的丛林之王，而乌龟则以悠然缓慢出名。',
        pinyin: 'Shīzi hé lǎohǔ shì wēiměng de cónglín zhī wáng, ér wūguī zé yǐ yōurán huǎnmàn chūmíng.',
        vuk: 'Ši-ci he lao-hu ši vej-meng de cung-lin dži vang, er vu-guej ce ji jou-žan huan-man ču-ming.',
        english: 'Lions and tigers are fierce kings of the wilderness, whereas the turtle is famous for serene slow pace.',
        serbian: 'Lavovi i tigrovi su moćni kraljevi divljine, dok je kornjača poznata po svojoj smirenoj sporosti.',
        targetWords: ['狮子', '老虎', '乌龟'],
        context: 'Animal Characteristics & Parables',
        tokens: [
          { word: '狮子', pinyin: 'shīzi', english: 'lion', serbian: 'lav', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '老虎', pinyin: 'lǎohǔ', english: 'tiger', serbian: 'tigar', isTarget: true },
          { word: '是', pinyin: 'shì', english: 'are', serbian: 'su' },
          { word: '威猛的', pinyin: 'wēiměng de', english: 'fierce/mighty', serbian: 'moćni' },
          { word: '丛林之王', pinyin: 'cónglín zhī wáng', english: 'kings of jungle', serbian: 'kraljevi šume' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '而', pinyin: 'ér', english: 'whereas', serbian: 'dok' },
          { word: '乌龟', pinyin: 'wūguī', english: 'turtle', serbian: 'kornjača', isTarget: true },
          { word: '则以', pinyin: 'zé yǐ', english: 'is by', serbian: 'je po' },
          { word: '悠然', pinyin: 'yōurán', english: 'leisurely', serbian: 'smirenoj' },
          { word: '缓慢', pinyin: 'huǎnmàn', english: 'slowness', serbian: 'sporosti' },
          { word: '出名', pinyin: 'chūmíng', english: 'famous', serbian: 'poznata' }
        ]
      }
    ]
  },
  {
    id: 'c2-r4',
    chartId: 2,
    rowNumber: 4,
    title: 'Kinship & Generations',
    titleSerbian: 'Porodične Veze i Generacije',
    emoji: '👨‍👩‍👧‍👦',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Ancestral roots, filial devotion, spousal partnerships, and caring for siblings.',
    words: [
      // Core 10 Characters
      { char: '父', pinyin: 'fù', vuk: 'fu', english: 'father', serbian: 'otac', exampleUse: '父亲 (otac)', isCoreChar: true, category: 'noun' },
      { char: '母', pinyin: 'mǔ', vuk: 'mu', english: 'mother', serbian: 'majka', exampleUse: '母亲 (majka)', isCoreChar: true, category: 'noun' },
      { char: '兄', pinyin: 'xiōng', vuk: 'sjung', english: 'elder brother', serbian: 'stariji brat', exampleUse: '兄弟 (braća)', isCoreChar: true, category: 'noun' },
      { char: '弟', pinyin: 'dì', vuk: 'di', english: 'younger brother', serbian: 'mlađi brat', exampleUse: '弟弟 (mlađi brat)', isCoreChar: true, category: 'noun' },
      { char: '姐', pinyin: 'jiě', vuk: 'đje', english: 'elder sister', serbian: 'starija sestra', exampleUse: '姐姐 (starija sestra)', isCoreChar: true, category: 'noun' },
      { char: '妹', pinyin: 'mèi', vuk: 'mej', english: 'younger sister', serbian: 'mlađa sestra', exampleUse: '妹妹 (mlađa sestra)', isCoreChar: true, category: 'noun' },
      { char: '夫', pinyin: 'fū', vuk: 'fu', english: 'husband', serbian: 'suprug', exampleUse: '夫妇 (bračni par)', isCoreChar: true, category: 'noun' },
      { char: '妻', pinyin: 'qī', vuk: 'ći', english: 'wife', serbian: 'supruga', exampleUse: '妻子 (supruga)', isCoreChar: true, category: 'noun' },
      { char: '儿', charTraditional: '兒', pinyin: 'ér', vuk: 'er', english: 'child / son', serbian: 'dete / sin', exampleUse: '儿子 (sin)', isCoreChar: true, category: 'noun' },
      { char: '爷', charTraditional: '爺', pinyin: 'yé', vuk: 'je', english: 'grandfather', serbian: 'deda', exampleUse: '爷爷 (deda)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '父亲', pinyin: 'fùqīn', vuk: 'fu-ćin', english: 'father (formal)', serbian: 'otac', exampleUse: '尊敬父亲 (poštovati oca)', isCoreChar: false, category: 'noun' },
      { char: '母亲', pinyin: 'mǔqīn', vuk: 'mu-ćin', english: 'mother (formal)', serbian: 'majka', exampleUse: '慈爱母亲 (brižna majka)', isCoreChar: false, category: 'noun' },
      { char: '爷爷', pinyin: 'yéye', vuk: 'je-je', english: 'paternal grandfather', serbian: 'deda', exampleUse: '看望爷爷 (posetiti dedu)', isCoreChar: false, category: 'noun' },
      { char: '奶奶', pinyin: 'nǎinai', vuk: 'naj-naj', english: 'paternal grandmother', serbian: 'baba', exampleUse: '陪奶奶 (biti sa bakom)', isCoreChar: false, category: 'noun' },
      { char: '哥哥', pinyin: 'gēge', vuk: 'ge-ge', english: 'elder brother', serbian: 'stariji brat', exampleUse: '听哥哥的话 (slušati starijeg brata)', isCoreChar: false, category: 'noun' },
      { char: '弟弟', pinyin: 'dìdi', vuk: 'di-di', english: 'younger brother', serbian: 'mlađi brat', exampleUse: '照顾弟弟 (čuvati mlađeg brata)', isCoreChar: false, category: 'noun' },
      { char: '姐姐', pinyin: 'jiějie', vuk: 'đje-đje', english: 'elder sister', serbian: 'starija sestra', exampleUse: '向姐姐请教 (tražiti savet od sestre)', isCoreChar: false, category: 'noun' },
      { char: '妹妹', pinyin: 'mèimei', vuk: 'mej-mej', english: 'younger sister', serbian: 'mlađa sestra', exampleUse: '小妹妹 (mlađa sestrica)', isCoreChar: false, category: 'noun' },
      { char: '儿子', pinyin: 'érzi', vuk: 'er-ci', english: 'son', serbian: 'sin', exampleUse: '大儿子 (najstariji sin)', isCoreChar: false, category: 'noun' },
      { char: '女儿', pinyin: 'nǚ\'ér', vuk: 'nü-er', english: 'daughter', serbian: 'ćerka', exampleUse: '可爱的女儿 (slatka ćerka)', isCoreChar: false, category: 'noun' },
      { char: '夫妻', pinyin: 'fūqī', vuk: 'fu-ći', english: 'husband and wife', serbian: 'supružnici', exampleUse: '恩爱夫妻 (složan bračni par)', isCoreChar: false, category: 'noun' },
      { char: '家庭', pinyin: 'jiātíng', vuk: 'đja-ting', english: 'family / household', serbian: 'porodica', exampleUse: '和睦家庭 (harmonična porodica)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-14-1',
        chinese: '周末我们全家人去看望爷爷和奶奶，大家坐在一起特别温馨。',
        pinyin: 'Zhōumò wǒmen quánjiā rén qù kànwàng yéye hé nǎinai, dàjiā zuò zài yīqǐ tèbié wēnxīn.',
        vuk: 'Džou-mo vo-men ćüan-đja žen ću kan-vang je-je he naj-naj, da-đja cuo caj ji-ći te-bje ven-sin.',
        english: 'This weekend our whole family visits grandfather and grandmother; sitting together is warmly heartwarming.',
        serbian: 'Za vikend cela naša porodica ide u posetu dedi i babi; sedenje zajedno je izuzetno toplo.',
        targetWords: ['爷爷', '奶奶', '大家', '一起'],
        context: 'Generational Gathering & Family Ties',
        tokens: [
          { word: '周末', pinyin: 'zhōumò', english: 'weekend', serbian: 'za vikend' },
          { word: '我们全家人', pinyin: 'wǒmen quánjiā rén', english: 'our whole family', serbian: 'cela naša porodica' },
          { word: '去', pinyin: 'qù', english: 'go', serbian: 'ide' },
          { word: '看望', pinyin: 'kànwàng', english: 'visit', serbian: 'u posetu' },
          { word: '爷爷', pinyin: 'yéye', english: 'grandpa', serbian: 'dedi', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '奶奶', pinyin: 'nǎinai', english: 'grandma', serbian: 'babi', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '大家', pinyin: 'dàjiā', english: 'everyone', serbian: 'svi' },
          { word: '坐在一起', pinyin: 'zuò zài yīqǐ', english: 'sit together', serbian: 'sedeći zajedno' },
          { word: '特别', pinyin: 'tèbié', english: 'especially', serbian: 'posebno' },
          { word: '温馨', pinyin: 'wēnxīn', english: 'heartwarming', serbian: 'toplo' }
        ]
      },
      {
        id: 's-14-2',
        chinese: '哥哥、弟弟、姐姐和妹妹互相帮助，这是美满家庭的基石。',
        pinyin: 'Gēge, dìdi, jiějie hé mèimei hùxiāng bāngzhù, zhè shì měimǎn jiātíng de jīshí.',
        vuk: 'Ge-ge, di-di, đje-đje he mej-mej hu-sjang bang-džu, dže ši mej-man đja-ting de đji-ši.',
        english: 'Elder brothers, younger brothers, elder sisters, and younger sisters support one another; this is the cornerstone of a happy family.',
        serbian: 'Braća i sestre uzajamno pomažu jedni drugima; to je temelj srećne i skladne porodice.',
        targetWords: ['哥哥', '弟弟', '姐姐', '妹妹', '家庭'],
        context: 'Sibling Harmony & Household Foundation',
        tokens: [
          { word: '哥哥', pinyin: 'gēge', english: 'elder brother', serbian: 'stariji brat', isTarget: true },
          { word: '、', pinyin: '、', english: 'comma', serbian: 'zarez' },
          { word: '弟弟', pinyin: 'dìdi', english: 'younger brother', serbian: 'mlađi brat', isTarget: true },
          { word: '、', pinyin: '、', english: 'comma', serbian: 'zarez' },
          { word: '姐姐', pinyin: 'jiějie', english: 'elder sister', serbian: 'starija sestra', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '妹妹', pinyin: 'mèimei', english: 'younger sister', serbian: 'mlađa sestra', isTarget: true },
          { word: '互相帮助', pinyin: 'hùxiāng bāngzhù', english: 'help each other', serbian: 'uzajamno pomažu' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '这是', pinyin: 'zhè shì', english: 'this is', serbian: 'to je' },
          { word: '美满', pinyin: 'měimǎn', english: 'happy/fulfilling', serbian: 'srećne' },
          { word: '家庭的', pinyin: 'jiātíng de', english: 'family\'s', serbian: 'porodice', isTarget: true },
          { word: '基石', pinyin: 'jīshí', english: 'cornerstone', serbian: 'temelj' }
        ]
      }
    ]
  },
  {
    id: 'c2-r5',
    chartId: 2,
    rowNumber: 5,
    title: 'Manual Actions & Daily Craft',
    titleSerbian: 'Radnje Rukama i Svakodnevna Dela',
    emoji: '🤲',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Manual maneuvers: holding, pushing, pulling, hugging, discarding, locating, and crafting.',
    words: [
      // Core 10 Characters
      { char: '打', pinyin: 'dǎ', vuk: 'da', english: 'hit / strike / dial', serbian: 'udariti / pozvati', exampleUse: '打包 (spakovati za poneti)', isCoreChar: true, category: 'verb' },
      { char: '拿', pinyin: 'ná', vuk: 'na', english: 'hold / take', serbian: 'uzeti / držati', exampleUse: '拿来 (donesi ovamo)', isCoreChar: true, category: 'verb' },
      { char: '推', pinyin: 'tuī', vuk: 'tuej', english: 'push', serbian: 'gurnuti', exampleUse: '推荐 (preporučiti)', isCoreChar: true, category: 'verb' },
      { char: '拉', pinyin: 'lā', vuk: 'la', english: 'pull', serbian: 'povući', exampleUse: '拉开 (otvoriti povlačenjem)', isCoreChar: true, category: 'verb' },
      { char: '拍', pinyin: 'pāi', vuk: 'paj', english: 'pat / clap / photograph', serbian: 'potapšati / uslikati', exampleUse: '拍照 (fotografisati)', isCoreChar: true, category: 'verb' },
      { char: '抱', pinyin: 'bào', vuk: 'bao', english: 'hug / embrace', serbian: 'zagrliti', exampleUse: '拥抱 (zagrljaj)', isCoreChar: true, category: 'verb' },
      { char: '扔', pinyin: 'rēng', vuk: 'ženg', english: 'throw / discard', serbian: 'baciti', exampleUse: '扔掉 (odbaciti)', isCoreChar: true, category: 'verb' },
      { char: '找', pinyin: 'zhǎo', vuk: 'džao', english: 'find / look for', serbian: 'tražiti / naći', exampleUse: '找到 (pronaći)', isCoreChar: true, category: 'verb' },
      { char: '用', pinyin: 'yòng', vuk: 'jung', english: 'use', serbian: 'koristiti', exampleUse: '用心 (uložiti srce)', isCoreChar: true, category: 'verb' },
      { char: '做', pinyin: 'zuò', vuk: 'cuo', english: 'do / make', serbian: 'napraviti / raditi', exampleUse: '做事 (raditi poslove)', isCoreChar: true, category: 'verb' },
      // Expanded High-Frequency Native Vocabulary
      { char: '拿起', pinyin: 'náqǐ', vuk: 'na-ći', english: 'pick up / take hold of', serbian: 'podići / uzeti', exampleUse: '拿起书本 (uzeti knjigu)', isCoreChar: false, category: 'verb' },
      { char: '推开', pinyin: 'tuīkāi', vuk: 'tuej-kaj', english: 'push open', serbian: 'gurnuti i otvoriti', exampleUse: '推开大门 (gurnuti kapiju)', isCoreChar: false, category: 'verb' },
      { char: '拉手', pinyin: 'lāshǒu', vuk: 'la-šou', english: 'hold hands', serbian: 'držati se za ruke', exampleUse: '拉手散步 (šetati držeći se za ruke)', isCoreChar: false, category: 'verb' },
      { char: '拍照', pinyin: 'pāizhào', vuk: 'paj-džao', english: 'take photograph / snapshot', serbian: 'fotografisati', exampleUse: '拍照留念 (fotografisati za uspomenu)', isCoreChar: false, category: 'verb' },
      { char: '拥抱', pinyin: 'yōngbào', vuk: 'jung-bao', english: 'hug / embrace warmth', serbian: 'zagrliti / zagrljaj', exampleUse: '热情拥抱 (topao zagrljaj)', isCoreChar: false, category: 'verb' },
      { char: '扔掉', pinyin: 'rēngdiào', vuk: 'ženg-djao', english: 'throw away / trash', serbian: 'baciti u smeće', exampleUse: '扔掉垃圾 (baciti otpatke)', isCoreChar: false, category: 'verb' },
      { char: '找到', pinyin: 'zhǎodào', vuk: 'džao-dao', english: 'find successfully', serbian: 'pronaći', exampleUse: '找到答案 (pronaći odgovor)', isCoreChar: false, category: 'verb' },
      { char: '使用', pinyin: 'shǐyòng', vuk: 'ši-jung', english: 'use / operate', serbian: 'koristiti / upotrebiti', exampleUse: '正确使用 (pravilno koristiti)', isCoreChar: false, category: 'verb' },
      { char: '做饭', pinyin: 'zuòfàn', vuk: 'cuo-fan', english: 'cook food / prepare meals', serbian: 'kuvati obrok', exampleUse: '在家做饭 (kuvati kod kuće)', isCoreChar: false, category: 'verb' },
      { char: '打电话', pinyin: 'dǎ diànhuà', vuk: 'da djen-hua', english: 'make telephone call', serbian: 'telefonirati', exampleUse: '给朋友打电话 (nazvati prijatelja)', isCoreChar: false, category: 'verb' },
      { char: '帮忙', pinyin: 'bāngmáng', vuk: 'bang-mang', english: 'help out / lend hand', serbian: 'pomoći', exampleUse: '请帮忙 (molim pomoć)', isCoreChar: false, category: 'verb' },
      { char: '打造', pinyin: 'dǎzào', vuk: 'da-zao', english: 'forge / build / craft', serbian: 'izgraditi / iskovati', exampleUse: '打造强健体魄 (izgraditi jako telo)', isCoreChar: false, category: 'verb' }
    ],
    sentences: [
      {
        id: 's-15-1',
        chinese: '遇到困难别着急，先给朋友打电话，大家一起帮忙想办法。',
        pinyin: 'Yù dào kùnnan bié zháojí, xiān gěi péngyou dǎ diànhuà, dàjiā yīqǐ bāngmáng xiǎng bànfǎ.',
        vuk: 'Jü dao kun-nan bje džao-đji, sjen gej peng-jou da djen-hua, da-đja ji-ći bang-mang sjang ban-fa.',
        english: 'When encountering difficulty do not fret; first call a friend, and everyone will help find a way.',
        serbian: 'Kada naiđeš na problem ne brini; prvo pozovi prijatelja telefonom, i svi će zajedno pomoći da nađete rešenje.',
        targetWords: ['打电话', '帮忙', '朋友', '一起'],
        context: 'Support Networks & Everyday Help',
        tokens: [
          { word: '遇到', pinyin: 'yù dào', english: 'encounter', serbian: 'kad naiđeš na' },
          { word: '困难', pinyin: 'kùnnan', english: 'hardship', serbian: 'teškoću' },
          { word: '别着急', pinyin: 'bié zháojí', english: 'don\'t worry', serbian: 'ne brini' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '先', pinyin: 'xiān', english: 'first', serbian: 'prvo' },
          { word: '给朋友', pinyin: 'gěi péngyou', english: 'to friend', serbian: 'prijatelju' },
          { word: '打电话', pinyin: 'dǎ diànhuà', english: 'call on phone', serbian: 'telefoniraj', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '大家一起', pinyin: 'dàjiā yīqǐ', english: 'everyone together', serbian: 'svi zajedno' },
          { word: '帮忙', pinyin: 'bāngmáng', english: 'help', serbian: 'pomoći', isTarget: true },
          { word: '想办法', pinyin: 'xiǎng bànfǎ', english: 'think of solution', serbian: 'da smislite rešenje' }
        ]
      },
      {
        id: 's-15-2',
        chinese: '母亲推开门走进来，放下钥匙并热烈地拥抱了我。',
        pinyin: 'Mǔqīn tuīkāi mén zǒu jìnlái, fàngxià yàoshi bìng rèliè de yōngbàole wǒ.',
        vuk: 'Mu-ćin tuej-kaj men cou đjin-laj, fang-sja jao-ši bing že-lje de jung-bao-le vo.',
        english: 'Mother pushed open the door and stepped inside, set down the keys, and warmly hugged me.',
        serbian: 'Majka je gurnula vrata i ušla unutra, odložila ključeve i toplo me zagrlila.',
        targetWords: ['推开', '拥抱', '拿'],
        context: 'Homecoming & Gentle Affection',
        tokens: [
          { word: '母亲', pinyin: 'mǔqīn', english: 'mother', serbian: 'majka' },
          { word: '推开门', pinyin: 'tuīkāi mén', english: 'pushed open door', serbian: 'gurnula vrata', isTarget: true },
          { word: '走进来', pinyin: 'zǒu jìnlái', english: 'walked inside', serbian: 'ušla unutra' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '放下', pinyin: 'fàngxià', english: 'put down', serbian: 'odložila' },
          { word: '钥匙', pinyin: 'yàoshi', english: 'keys', serbian: 'ključeve' },
          { word: '并', pinyin: 'bìng', english: 'and', serbian: 'i' },
          { word: '热烈地', pinyin: 'rèliè de', english: 'warmly', serbian: 'toplo' },
          { word: '拥抱了我', pinyin: 'yōngbàole wǒ', english: 'hugged me', serbian: 'zagrlila me', isTarget: true }
        ]
      }
    ]
  },
  {
    id: 'c2-r6',
    chartId: 2,
    rowNumber: 6,
    title: 'Movement, Locomotion & Return',
    titleSerbian: 'Kretanje, Letenje i Povratak',
    emoji: '🏃',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Dynamic movement: running, walking, jumping, aerial flight, aquatic swimming, and stopping.',
    words: [
      // Core 10 Characters
      { char: '跑', pinyin: 'pǎo', vuk: 'pao', english: 'run', serbian: 'trčati', exampleUse: '跑步 (trčanje)', isCoreChar: true, category: 'verb' },
      { char: '走', pinyin: 'zǒu', vuk: 'cou', english: 'walk / leave', serbian: 'hodati / otići', exampleUse: '走路 (hodati)', isCoreChar: true, category: 'verb' },
      { char: '跳', pinyin: 'tiào', vuk: 'tjao', english: 'jump / leap', serbian: 'skočiti', exampleUse: '跳跃 (skok)', isCoreChar: true, category: 'verb' },
      { char: '飞', charTraditional: '飛', pinyin: 'fēi', vuk: 'fej', english: 'fly', serbian: 'leteti', exampleUse: '飞机 (avion)', isCoreChar: true, category: 'verb' },
      { char: '游', pinyin: 'yóu', vuk: 'jou', english: 'swim / tour', serbian: 'plivati / putovati', exampleUse: '游泳 (plivanje)', isCoreChar: true, category: 'verb' },
      { char: '跪', pinyin: 'guì', vuk: 'guej', english: 'kneel', serbian: 'klečati', exampleUse: '跪拜 (kleknuti i pokloniti se)', isCoreChar: true, category: 'verb' },
      { char: '爬', pinyin: 'pá', vuk: 'pa', english: 'climb / crawl', serbian: 'penjati se / puzati', exampleUse: '爬山 (penjati se na planinu)', isCoreChar: true, category: 'verb' },
      { char: '跌', pinyin: 'diē', vuk: 'dje', english: 'fall / stumble', serbian: 'pasti / spotaknuti se', exampleUse: '跌倒 (pasti na pod)', isCoreChar: true, category: 'verb' },
      { char: '停', pinyin: 'tíng', vuk: 'ting', english: 'stop / halt', serbian: 'zaustaviti se', exampleUse: '停车 (parkirati)', isCoreChar: true, category: 'verb' },
      { char: '回', pinyin: 'huí', vuk: 'huej', english: 'return / go back', serbian: 'vratiti se', exampleUse: '回家 (vratiti se kući)', isCoreChar: true, category: 'verb' },
      // Expanded High-Frequency Native Vocabulary
      { char: '跑步', pinyin: 'pǎobù', vuk: 'pao-bu', english: 'running / jogging', serbian: 'trčanje', exampleUse: '晨跑 (jutarnje trčanje)', isCoreChar: false, category: 'verb' },
      { char: '走路', pinyin: 'zǒulù', vuk: 'cou-lu', english: 'walking on foot', serbian: 'hodanje peške', exampleUse: '步行走路 (pešačenje)', isCoreChar: false, category: 'verb' },
      { char: '散步', pinyin: 'sànbù', vuk: 'san-bu', english: 'stroll / leisurely walk', serbian: 'lagana šetnja', exampleUse: '饭后散步 (šetnja posle jela)', isCoreChar: false, category: 'verb' },
      { char: '飞机', pinyin: 'fēijī', vuk: 'fej-đji', english: 'aeroplane / flight', serbian: 'avion', exampleUse: '坐飞机 (leteti avionom)', isCoreChar: false, category: 'noun' },
      { char: '游泳', pinyin: 'yóuyǒng', vuk: 'jou-jung', english: 'swim / swimming', serbian: 'plivanje', exampleUse: '去游泳 (ići na plivanje)', isCoreChar: false, category: 'verb' },
      { char: '停下', pinyin: 'tíngxià', vuk: 'ting-sja', english: 'stop / pause', serbian: 'stati / pauzirati', exampleUse: '停下脚步 (zaustaviti korak)', isCoreChar: false, category: 'verb' },
      { char: '回来', pinyin: 'huílái', vuk: 'huej-laj', english: 'come back / return here', serbian: 'vratiti se ovamo', exampleUse: '欢迎回来 (dobrodošli nazad)', isCoreChar: false, category: 'verb' },
      { char: '跌倒', pinyin: 'diēdǎo', vuk: 'dje-dao', english: 'fall down / trip', serbian: 'pasti na zemlju', exampleUse: '勇敢站起 (hrabro ustati)', isCoreChar: false, category: 'verb' },
      { char: '离开', pinyin: 'líkāi', vuk: 'li-kaj', english: 'leave / depart', serbian: 'napustiti / otići', exampleUse: '离开城市 (napustiti grad)', isCoreChar: false, category: 'verb' },
      { char: '速度', pinyin: 'sùdù', vuk: 'su-du', english: 'speed / pace', serbian: 'brzina / tempo', exampleUse: '加快速度 (ubrzati tempo)', isCoreChar: false, category: 'noun' },
      { char: '回家', pinyin: 'huíjiā', vuk: 'huej-đja', english: 'return home', serbian: 'vratiti se kući', exampleUse: '平安回家 (siguran povratak kući)', isCoreChar: false, category: 'verb' },
      { char: '飞行', pinyin: 'fēixíng', vuk: 'fej-sing', english: 'flying / airborne', serbian: 'let / letenje', exampleUse: '自由飞行 (slobodan let)', isCoreChar: false, category: 'verb' }
    ],
    sentences: [
      {
        id: 's-16-1',
        chinese: '清晨去公园跑步和散步，锻炼身体的速度与耐力。',
        pinyin: 'Qīngchén qù gōngyuán pǎobù hé sànbù, duànliàn shēntǐ de sùdù yǔ nàilì.',
        vuk: 'Ćing-čen ću gung-jüan pao-bu he san-bu, duan-ljen šen-ti de su-du jü naj-li.',
        english: 'In the early morning go running and strolling in the park, training bodily speed and endurance.',
        serbian: 'Rano ujutru idi u park na trčanje i šetnju, trenirajući telesnu brzinu i izdržljivost.',
        targetWords: ['跑步', '散步', '速度'],
        context: 'Athletic Conditioning & Endurance',
        tokens: [
          { word: '清晨', pinyin: 'qīngchén', english: 'early morning', serbian: 'rano ujutru' },
          { word: '去公园', pinyin: 'qù gōngyuán', english: 'go to park', serbian: 'idi u park' },
          { word: '跑步', pinyin: 'pǎobù', english: 'running', serbian: 'na trčanje', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '散步', pinyin: 'sànbù', english: 'strolling', serbian: 'šetnju', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '锻炼', pinyin: 'duànliàn', english: 'train', serbian: 'trenirajući' },
          { word: '身体的', pinyin: 'shēntǐ de', english: 'body\'s', serbian: 'tela' },
          { word: '速度', pinyin: 'sùdù', english: 'speed', serbian: 'brzinu', isTarget: true },
          { word: '与', pinyin: 'yǔ', english: 'and', serbian: 'i' },
          { word: '耐力', pinyin: 'nàilì', english: 'endurance', serbian: 'izdržljivost' }
        ]
      },
      {
        id: 's-16-2',
        chinese: '即使跌倒了也别停下，站起来调整速度，天黑了就平安回家。',
        pinyin: 'Jíshǐ diēdǎo le yě bié tíngxià, zhàn qǐlái tiáozhěng sùdù, tiānhēi le jiù píng\'ān huíjiā.',
        vuk: 'Đji-ši dje-dao le je bje ting-sja, džan ći-laj tjao-dženg su-du, tjen-hej le đju ping-an huej-đja.',
        english: 'Even if you stumble, do not stop; rise and adjust your pace, and return safely home when darkness falls.',
        serbian: 'Čak i ako padneš ne zaustavljaj se; ustani i prilagodi tempo, a kad padne mrak bezbedno se vrati kući.',
        targetWords: ['跌倒', '停下', '回家', '速度'],
        context: 'Unshakable Stoic Resilience',
        tokens: [
          { word: '即使', pinyin: 'jíshǐ', english: 'even if', serbian: 'čak i ako' },
          { word: '跌倒了', pinyin: 'diēdǎo le', english: 'fell down', serbian: 'padneš', isTarget: true },
          { word: '也别', pinyin: 'yě bié', english: 'also don\'t', serbian: 'takođe nemoj' },
          { word: '停下', pinyin: 'tíngxià', english: 'stop', serbian: 'stati', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '站起来', pinyin: 'zhàn qǐlái', english: 'stand up', serbian: 'ustani' },
          { word: '调整', pinyin: 'tiáozhěng', english: 'adjust', serbian: 'prilagodi' },
          { word: '速度', pinyin: 'sùdù', english: 'speed/pace', serbian: 'brzinu', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '天黑了', pinyin: 'tiānhēi le', english: 'darkness falls', serbian: 'kad padne mrak' },
          { word: '就', pinyin: 'jiù', english: 'then', serbian: 'onda' },
          { word: '平安', pinyin: 'píng\'ān', english: 'safely', serbian: 'bezbedno' },
          { word: '回家', pinyin: 'huíjiā', english: 'return home', serbian: 'vrati se kući', isTarget: true }
        ]
      }
    ]
  },
  {
    id: 'c2-r7',
    chartId: 2,
    rowNumber: 7,
    title: 'Voice, Inquiry & Comprehension',
    titleSerbian: 'Glas, Pitanja i Razumevanje',
    emoji: '🗣️',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Cognitive faculties: asking, answering, listening, speech, silent reflection, and deep comprehension.',
    words: [
      // Core 10 Characters
      { char: '问', charTraditional: '問', pinyin: 'wèn', vuk: 'ven', english: 'ask', serbian: 'pitati', exampleUse: '问题 (pitanje)', isCoreChar: true, category: 'verb' },
      { char: '答', pinyin: 'dá', vuk: 'da', english: 'answer / reply', serbian: 'odgovoriti', exampleUse: '回答 (odgovoriti)', isCoreChar: true, category: 'verb' },
      { char: '说', charTraditional: '說', pinyin: 'shuō', vuk: 'šuo', english: 'speak / say', serbian: 'reći', exampleUse: '说明 (objasniti)', isCoreChar: true, category: 'verb' },
      { char: '叫', pinyin: 'jiào', vuk: 'đjao', english: 'call / shout', serbian: 'zvati se / vikati', exampleUse: '名字叫 (zove se)', isCoreChar: true, category: 'verb' },
      { char: '听', charTraditional: '聽', pinyin: 'tīng', vuk: 'ting', english: 'listen / hear', serbian: 'slušati', exampleUse: '听音乐 (slušati muziku)', isCoreChar: true, category: 'verb' },
      { char: '想', pinyin: 'xiǎng', vuk: 'sjang', english: 'think / miss / want', serbian: 'misliti / želeti', exampleUse: '思考 (razmišljati)', isCoreChar: true, category: 'verb' },
      { char: '念', pinyin: 'niàn', vuk: 'njen', english: 'read aloud / remember', serbian: 'čitati naglas / sećati se', exampleUse: '念书 (studirati/čitati naglas)', isCoreChar: true, category: 'verb' },
      { char: '写', charTraditional: '寫', pinyin: 'xiě', vuk: 'sje', english: 'write', serbian: 'pisati', exampleUse: '写汉字 (pisati karaktere)', isCoreChar: true, category: 'verb' },
      { char: '读', charTraditional: '讀', pinyin: 'dú', vuk: 'du', english: 'read silently / study', serbian: 'čitati u sebi / studirati', exampleUse: '读书 (čitati knjigu)', isCoreChar: true, category: 'verb' },
      { char: '懂', pinyin: 'dǒng', vuk: 'dung', english: 'understand', serbian: 'razumeti', exampleUse: '听懂 (razumeti slušajući)', isCoreChar: true, category: 'verb' },
      // Expanded High-Frequency Native Vocabulary
      { char: '问题', pinyin: 'wèntí', vuk: 'ven-ti', english: 'question / problem', serbian: 'pitanje / problem', exampleUse: '没问题 (nema problema)', isCoreChar: false, category: 'noun' },
      { char: '回答', pinyin: 'huídá', vuk: 'huej-da', english: 'answer / reply', serbian: 'odgovoriti / odgovor', exampleUse: '正确回答 (tačan odgovor)', isCoreChar: false, category: 'verb' },
      { char: '听懂', pinyin: 'tīngdǒng', vuk: 'ting-dung', english: 'understand by listening', serbian: 'razumeti slušajući', exampleUse: '我听懂了 (razumeo sam)', isCoreChar: false, category: 'verb' },
      { char: '思考', pinyin: 'sīkǎo', vuk: 'si-kao', english: 'think deeply / ponder', serbian: 'razmišljati / promišljati', exampleUse: '独立思考 (samostalno razmišljanje)', isCoreChar: false, category: 'verb' },
      { char: '写作', pinyin: 'xiězuò', vuk: 'sje-cuo', english: 'writing / authoring', serbian: 'pisanje', exampleUse: '练习写作 (vežbati pisanje)', isCoreChar: false, category: 'verb' },
      { char: '读书', pinyin: 'dúshū', vuk: 'du-šu', english: 'read books / study', serbian: 'čitati knjige / studirati', exampleUse: '认真读书 (pažljivo čitati)', isCoreChar: false, category: 'verb' },
      { char: '明白', pinyin: 'míngbai', vuk: 'ming-baj', english: 'understand clearly / clear', serbian: 'jasno razumeti / shvatiti', exampleUse: '你明白吗 (razumeš li)', isCoreChar: false, category: 'verb' },
      { char: '想念', pinyin: 'xiǎngniàn', vuk: 'sjang-njen', english: 'miss someone / long for', serbian: 'nedostajati / misliti na nekoga', exampleUse: '想念朋友 (nedostaje mi prijatelj)', isCoreChar: false, category: 'verb' },
      { char: '交流', pinyin: 'jiāoliú', vuk: 'đjao-lju', english: 'communicate / converse', serbian: 'razmeniti misli / komunicirati', exampleUse: '思想交流 (razmena ideja)', isCoreChar: false, category: 'verb' },
      { char: '解释', pinyin: 'jiěshì', vuk: 'đje-ši', english: 'explain / clarify', serbian: 'objasniti / razjasniti', exampleUse: '详细解释 (detaljno objasniti)', isCoreChar: false, category: 'verb' },
      { char: '大声', pinyin: 'dàshēng', vuk: 'da-šeng', english: 'loud voice / loudly', serbian: 'naglas / glasno', exampleUse: '大声朗读 (glasno čitati)', isCoreChar: false, category: 'phrase' },
      { char: '练习', pinyin: 'liànxí', vuk: 'ljen-si', english: 'practice / drill', serbian: 'vežbati', exampleUse: '反复练习 (vežbati iznova)', isCoreChar: false, category: 'verb' }
    ],
    sentences: [
      {
        id: 's-17-1',
        chinese: '多听多读，坚持思考与交流，遇到不懂的问题就及时提问。',
        pinyin: 'Duō tīng duō dú, jiānchí sīkǎo yǔ jiāoliú, yù dào bù dǒng de wèntí jiù jíshí tíwèn.',
        vuk: 'Duo ting duo du, đjen-či si-kao jü đjao-lju, jü dao bu dung de ven-ti đju đji-ši ti-ven.',
        english: 'Listen more and read more, persist in reflection and dialogue; when facing questions you do not understand, ask promptly.',
        serbian: 'Slušaj više i čitaj više, istraj u razmišljanju i razgovoru; kada naiđeš na nejasno pitanje, postavi ga bez oklevanja.',
        targetWords: ['思考', '交流', '问题', '听', '读', '懂'],
        context: 'Lifelong Learning & Intellectual Growth',
        tokens: [
          { word: '多听', pinyin: 'duō tīng', english: 'listen more', serbian: 'slušaj više', isTarget: true },
          { word: '多读', pinyin: 'duō dú', english: 'read more', serbian: 'čitaj više', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '坚持', pinyin: 'jiānchí', english: 'persist in', serbian: 'istraj u' },
          { word: '思考', pinyin: 'sīkǎo', english: 'reflection', serbian: 'razmišljanju', isTarget: true },
          { word: '与', pinyin: 'yǔ', english: 'and', serbian: 'i' },
          { word: '交流', pinyin: 'jiāoliú', english: 'communication', serbian: 'komunikaciji', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '遇到', pinyin: 'yù dào', english: 'encounter', serbian: 'kad naiđeš na' },
          { word: '不懂的', pinyin: 'bù dǒng de', english: 'not understood', serbian: 'nejasno', isTarget: true },
          { word: '问题', pinyin: 'wèntí', english: 'problem/question', serbian: 'pitanje', isTarget: true },
          { word: '就及时', pinyin: 'jiù jíshí', english: 'then in time', serbian: 'onda blagovremeno' },
          { word: '提问', pinyin: 'tíwèn', english: 'ask question', serbian: 'pitaj', isTarget: true }
        ]
      },
      {
        id: 's-17-2',
        chinese: '老师的解释非常明白，听懂之后我大声念出了这段优美的文章。',
        pinyin: 'Lǎoshī de jiěshì fēicháng míngbai, tīngdǒng zhīhòu wǒ dàshēng niànchūle zhè duàn yōuměi de wénzhāng.',
        vuk: 'Lao-ši de đje-ši fej-čang ming-baj, ting-dung dži-hou vo da-šeng njen-ču-le dže duan jou-mej de ven-džang.',
        english: 'The teacher’s explanation was very clear; after understanding, I read aloud this beautiful passage in a clear voice.',
        serbian: 'Učiteljevo objašnjenje bilo je izuzetno jasno; pošto sam razumeo, naglas sam pročitao ovaj divni odlomak.',
        targetWords: ['解释', '明白', '听懂', '大声', '念'],
        context: 'Classical Pedagogy & Masterful Oratory',
        tokens: [
          { word: '老师的', pinyin: 'lǎoshī de', english: 'teacher\'s', serbian: 'učiteljevo' },
          { word: '解释', pinyin: 'jiěshì', english: 'explanation', serbian: 'objašnjenje', isTarget: true },
          { word: '非常', pinyin: 'fēicháng', english: 'very', serbian: 'veoma' },
          { word: '明白', pinyin: 'míngbai', english: 'clear', serbian: 'jasno', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '听懂', pinyin: 'tīngdǒng', english: 'understood', serbian: 'shvatio sam', isTarget: true },
          { word: '之后', pinyin: 'zhīhòu', english: 'after', serbian: 'nakon toga' },
          { word: '我', pinyin: 'wǒ', english: 'I', serbian: 'ja' },
          { word: '大声', pinyin: 'dàshēng', english: 'loud voice', serbian: 'naglas', isTarget: true },
          { word: '念出了', pinyin: 'niànchūle', english: 'read aloud', serbian: 'pročitao sam', isTarget: true },
          { word: '这段', pinyin: 'zhè duàn', english: 'this passage', serbian: 'ovaj odlomak' },
          { word: '优美的', pinyin: 'yōuměi de', english: 'graceful', serbian: 'divan' },
          { word: '文章', pinyin: 'wénzhāng', english: 'essay', serbian: 'tekst' }
        ]
      }
    ]
  },
  {
    id: 'c2-r8',
    chartId: 2,
    rowNumber: 8,
    title: 'Emotions, Sensations & Somatics',
    titleSerbian: 'Osećanja, Somatski Osećaji i Reakcije',
    emoji: '😭',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Human affect: sorrow, mirth, dread, outrage, ache, tickle, and serene joy.',
    words: [
      // Core 10 Characters
      { char: '哭', pinyin: 'kū', vuk: 'ku', english: 'cry / weep', serbian: 'plakati', exampleUse: '哭泣 (plakati)', isCoreChar: true, category: 'verb' },
      { char: '笑', pinyin: 'xiào', vuk: 'sjao', english: 'laugh / smile', serbian: 'smejati se', exampleUse: '微笑 (osmeh)', isCoreChar: true, category: 'verb' },
      { char: '怕', pinyin: 'pà', vuk: 'pa', english: 'fear / be afraid', serbian: 'plašiti se', exampleUse: '害怕 (bojati se)', isCoreChar: true, category: 'verb' },
      { char: '怒', pinyin: 'nù', vuk: 'nu', english: 'anger / rage', serbian: 'gnev / bes', exampleUse: '发怒 (pobesneti)', isCoreChar: true, category: 'noun' },
      { char: '恨', pinyin: 'hèn', vuk: 'hen', english: 'hate / resentment', serbian: 'mrzeti', exampleUse: '痛恨 (ogorčeno mrzeti)', isCoreChar: true, category: 'verb' },
      { char: '惊', charTraditional: '驚', pinyin: 'jīng', vuk: 'đjing', english: 'surprise / startled', serbian: 'iznenaditi se / šok', exampleUse: '惊喜 (prijatno iznenađenje)', isCoreChar: true, category: 'verb' },
      { char: '疼', pinyin: 'téng', vuk: 'teng', english: 'ache / hurt', serbian: 'boleti', exampleUse: '头疼 (glavobolja)', isCoreChar: true, category: 'verb' },
      { char: '痒', charTraditional: '癢', pinyin: 'yǎng', vuk: 'jang', english: 'itch / tickle', serbian: 'svrbeti', exampleUse: '发痒 (svrab)', isCoreChar: true, category: 'verb' },
      { char: '乐', charTraditional: '樂', pinyin: 'lè', vuk: 'le', english: 'joyful / music', serbian: 'radost / muzika', exampleUse: '快乐 (srećan)', isCoreChar: true, category: 'noun' },
      { char: '愁', pinyin: 'chóu', vuk: 'čou', english: 'worry / sorrow', serbian: 'brinuti se / tuga', exampleUse: '发愁 (brinuti)', isCoreChar: true, category: 'verb' },
      // Expanded High-Frequency Native Vocabulary
      { char: '快乐', pinyin: 'kuàilè', vuk: 'kuaj-le', english: 'happiness / joy', serbian: 'radost / sreća', exampleUse: '天天快乐 (svakog dana srećan)', isCoreChar: false, category: 'adjective' },
      { char: '微笑', pinyin: 'wēixiào', vuk: 'vej-sjao', english: 'smile / gentle grin', serbian: 'osmeh', exampleUse: '露出微笑 (pokazati osmeh)', isCoreChar: false, category: 'verb' },
      { char: '害怕', pinyin: 'hàipà', vuk: 'haj-pa', english: 'be scared / fear', serbian: 'plašiti se', exampleUse: '不用害怕 (ne moraš da se plašiš)', isCoreChar: false, category: 'verb' },
      { char: '发愁', pinyin: 'fāchóu', vuk: 'fa-čou', english: 'worry / fret', serbian: 'brinuti se', exampleUse: '为未来发愁 (brinuti za budućnost)', isCoreChar: false, category: 'verb' },
      { char: '发怒', pinyin: 'fānù', vuk: 'fa-nu', english: 'get angry / lose temper', serbian: 'razbesneti se', exampleUse: '别轻易发怒 (ne ljuti se lako)', isCoreChar: false, category: 'verb' },
      { char: '疼痛', pinyin: 'téngtòng', vuk: 'teng-tung', english: 'physical ache / sore', serbian: 'bol', exampleUse: '减轻疼痛 (ublažiti bol)', isCoreChar: false, category: 'noun' },
      { char: '惊喜', pinyin: 'jīngxǐ', vuk: 'đjing-si', english: 'delightful surprise', serbian: 'prijatno iznenađenje', exampleUse: '充满惊喜 (puno lepih iznenađenja)', isCoreChar: false, category: 'noun' },
      { char: '舒服', pinyin: 'shūfu', vuk: 'šu-fu', english: 'comfortable / physically well', serbian: 'udobno / prijatno', exampleUse: '身体很舒服 (telo je opušteno)', isCoreChar: false, category: 'adjective' },
      { char: '难过', pinyin: 'nánguò', vuk: 'nan-guo', english: 'sad / heartbroken', serbian: 'tužan', exampleUse: '心里难过 (tuga u srcu)', isCoreChar: false, category: 'adjective' },
      { char: '开心', pinyin: 'kāixīn', vuk: 'kaj-sin', english: 'delighted / cheerful', serbian: 'veseo / radostan', exampleUse: '玩得很开心 (lepo se zabaviti)', isCoreChar: false, category: 'adjective' },
      { char: '情绪', pinyin: 'qíngxù', vuk: 'ćing-sü', english: 'emotions / emotional state', serbian: 'emocije', exampleUse: '调控情绪 (upravljati emocijama)', isCoreChar: false, category: 'noun' },
      { char: '放心', pinyin: 'fàngxīn', vuk: 'fang-sin', english: 'rest assured / relax', serbian: 'odahnuti / biti miran', exampleUse: '感到放心 (osećati mir)', isCoreChar: false, category: 'verb' }
    ],
    sentences: [
      {
        id: 's-18-1',
        chinese: '别为琐事发愁或害怕，保持开心的微笑，生活每天都充满快乐与惊喜。',
        pinyin: 'Bié wèi suǒshì fāchóu huò hàipà, bǎochí kāixīn de wēixiào, shēnghuó měitiān dōu chōngmǎn kuàilè yǔ jīngxǐ.',
        vuk: 'Bje vej suo-ši fa-čou huo haj-pa, bao-či kaj-sin de vej-sjao, šeng-huo mej-tjen dou čung-man kuaj-le jü đjing-si.',
        english: 'Do not fret over trivialities or succumb to fear; maintain a joyful smile, and each day will be rich with joy and pleasant surprises.',
        serbian: 'Ne brini zbog sitnica i ne plaši se; zadrži veseo osmeh i život će svakog dana biti pun radosti i lepih iznenađenja.',
        targetWords: ['发愁', '害怕', '微笑', '开心', '快乐', '惊喜'],
        context: 'Stoic Tranquility & Emotional Mastery',
        tokens: [
          { word: '别为', pinyin: 'bié wèi', english: 'don\'t for', serbian: 'nemoj zbog' },
          { word: '琐事', pinyin: 'suǒshì', english: 'trivialities', serbian: 'sitnica' },
          { word: '发愁', pinyin: 'fāchóu', english: 'worry', serbian: 'da brineš', isTarget: true },
          { word: '或', pinyin: 'huò', english: 'or', serbian: 'ili' },
          { word: '害怕', pinyin: 'hàipà', english: 'fear', serbian: 'se plašiš', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '保持', pinyin: 'bǎochí', english: 'maintain', serbian: 'zadrži' },
          { word: '开心的', pinyin: 'kāixīn de', english: 'cheerful', serbian: 'veseo', isTarget: true },
          { word: '微笑', pinyin: 'wēixiào', english: 'smile', serbian: 'osmeh', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '生活', pinyin: 'shēnghuó', english: 'life', serbian: 'život' },
          { word: '每天', pinyin: 'měitiān', english: 'every day', serbian: 'svakog dana' },
          { word: '都充满', pinyin: 'dōu chōngmǎn', english: 'all filled with', serbian: 'biće ispunjen' },
          { word: '快乐', pinyin: 'kuàilè', english: 'happiness', serbian: 'radošću', isTarget: true },
          { word: '与', pinyin: 'yǔ', english: 'and', serbian: 'i' },
          { word: '惊喜', pinyin: 'jīngxǐ', english: 'surprises', serbian: 'iznenađenjima', isTarget: true }
        ]
      },
      {
        id: 's-18-2',
        chinese: '锻炼后虽有短暂肌肉疼痛，但身体感觉十分舒服，心里非常放松。',
        pinyin: 'Duànliàn hòu suī yǒu duǎnzàn jīròu téngtòng, dàn shēntǐ gǎnjué shífēn shūfu, xīn lǐ fēicháng fàngsōng.',
        vuk: 'Duan-ljen hou suej jou duan-zan đji-žou teng-tung, dan šen-ti gan-đjue ši-fen šu-fu, sin li fej-čang fang-sung.',
        english: 'Although there is brief muscle soreness after training, the body feels exceedingly comfortable, and the mind is deeply relaxed.',
        serbian: 'Iako posle treninga ima prolaznog bola u mišićima, telo se oseća izuzetno prijatno, a um je potpuno opušten.',
        targetWords: ['疼痛', '舒服'],
        context: 'Workout Recovery & Somatic Ease',
        tokens: [
          { word: '锻炼后', pinyin: 'duànliàn hòu', english: 'after training', serbian: 'posle vežbanja' },
          { word: '虽有', pinyin: 'suī yǒu', english: 'though has', serbian: 'iako ima' },
          { word: '短暂', pinyin: 'duǎnzàn', english: 'brief', serbian: 'kratkog' },
          { word: '肌肉', pinyin: 'jīròu', english: 'muscle', serbian: 'mišićnog' },
          { word: '疼痛', pinyin: 'téngtòng', english: 'ache', serbian: 'bola', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '但', pinyin: 'dàn', english: 'yet', serbian: 'ali' },
          { word: '身体', pinyin: 'shēntǐ', english: 'body', serbian: 'telo' },
          { word: '感觉', pinyin: 'gǎnjué', english: 'feels', serbian: 'oseća se' },
          { word: '十分', pinyin: 'shífēn', english: 'very', serbian: 'izuzetno' },
          { word: '舒服', pinyin: 'shūfu', english: 'comfortable', serbian: 'prijatno', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '心里', pinyin: 'xīn lǐ', english: 'in heart', serbian: 'u umu' },
          { word: '非常', pinyin: 'fēicháng', english: 'very', serbian: 'veoma' },
          { word: '放松', pinyin: 'fàngsōng', english: 'relaxed', serbian: 'opušteno' }
        ]
      }
    ]
  },
  {
    id: 'c2-r9',
    chartId: 2,
    rowNumber: 9,
    title: 'Metaphysics, Dreams & Senses',
    titleSerbian: 'Sudbina, Duh, Snovi i Čula',
    emoji: '✨',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Destiny, vital energy (Qi), nocturnal dreams, spirit, illumination, and flavor.',
    words: [
      // Core 10 Characters
      { char: '命', pinyin: 'mìng', vuk: 'ming', english: 'life / fate / destiny', serbian: 'sudbina / život', exampleUse: '命运 (sudbina)', isCoreChar: true, category: 'noun' },
      { char: '运', charTraditional: '運', pinyin: 'yùn', vuk: 'jün', english: 'luck / transport / motion', serbian: 'sreća / kretanje', exampleUse: '运气 (sreća/fortuna)', isCoreChar: true, category: 'noun' },
      { char: '气', charTraditional: '氣', pinyin: 'qì', vuk: 'ći', english: 'air / vital energy / spirit', serbian: 'či energija / dah', exampleUse: '气场 (aura/energetsko polje)', isCoreChar: true, category: 'noun' },
      { char: '魂', pinyin: 'hún', vuk: 'hun', english: 'soul / spirit', serbian: 'duša / duh', exampleUse: '灵魂 (duša)', isCoreChar: true, category: 'noun' },
      { char: '梦', charTraditional: '夢', pinyin: 'mèng', vuk: 'meng', english: 'dream', serbian: 'san', exampleUse: '梦想 (snovi/ciljevi)', isCoreChar: true, category: 'noun' },
      { char: '影', pinyin: 'yǐng', vuk: 'jing', english: 'shadow / reflection', serbian: 'senka / odraz', exampleUse: '身影 (figura/silueta)', isCoreChar: true, category: 'noun' },
      { char: '光', pinyin: 'guāng', vuk: 'guang', english: 'light / ray', serbian: 'svetlost', exampleUse: '阳光 (sunčeva svetlost)', isCoreChar: true, category: 'noun' },
      { char: '暗', pinyin: 'àn', vuk: 'an', english: 'dark / hidden', serbian: 'tama / mračno', exampleUse: '暗处 (u senci/tami)', isCoreChar: true, category: 'adjective' },
      { char: '声', charTraditional: '聲', pinyin: 'shēng', vuk: 'šeng', english: 'sound / voice', serbian: 'zvuk / glas', exampleUse: '声音 (glas)', isCoreChar: true, category: 'noun' },
      { char: '味', pinyin: 'wèi', vuk: 'vej', english: 'taste / flavor / scent', serbian: 'ukus / miris', exampleUse: '味道 (ukus/aroma)', isCoreChar: true, category: 'noun' },
      // Expanded High-Frequency Native Vocabulary
      { char: '命运', pinyin: 'mìngyùn', vuk: 'ming-jün', english: 'destiny / fate', serbian: 'sudbina', exampleUse: '掌握命运 (vladati sudbinom)', isCoreChar: false, category: 'noun' },
      { char: '运气', pinyin: 'yùnqì', vuk: 'jün-ći', english: 'fortune / lucky break', serbian: 'sreća / dobra sreća', exampleUse: '运气很好 (odlična sreća)', isCoreChar: false, category: 'noun' },
      { char: '气场', pinyin: 'qìchǎng', vuk: 'ći-čang', english: 'aura / energy field', serbian: 'aura / harizma', exampleUse: '强大的气场 (moćna aura)', isCoreChar: false, category: 'noun' },
      { char: '梦想', pinyin: 'mèngxiǎng', vuk: 'meng-sjang', english: 'dream / high aspiration', serbian: 'san / cilj', exampleUse: '实现梦想 (ostvariti snove)', isCoreChar: false, category: 'noun' },
      { char: '灵魂', pinyin: 'línghún', vuk: 'ling-hun', english: 'soul / profound spirit', serbian: 'duša / duh', exampleUse: '纯净灵魂 (čista duša)', isCoreChar: false, category: 'noun' },
      { char: '光明', pinyin: 'guāngmíng', vuk: 'guang-ming', english: 'radiance / illumination', serbian: 'svetlost / sjaj', exampleUse: '走向光明 (ići ka svetlosti)', isCoreChar: false, category: 'noun' },
      { char: '黑暗', pinyin: 'hēi\'àn', vuk: 'hej-an', english: 'darkness / obscurity', serbian: 'tama / mrak', exampleUse: '驱散黑暗 (rasterati tamu)', isCoreChar: false, category: 'noun' },
      { char: '声音', pinyin: 'shēngyīn', vuk: 'šeng-jin', english: 'voice / acoustic sound', serbian: 'zvuk / glas', exampleUse: '动听的声音 (lep zvuk)', isCoreChar: false, category: 'noun' },
      { char: '味道', pinyin: 'wèidao', vuk: 'vej-dao', english: 'flavor / fragrance', serbian: 'ukus / miris', exampleUse: '大自然的味道 (miris prirode)', isCoreChar: false, category: 'noun' },
      { char: '感觉', pinyin: 'gǎnjué', vuk: 'gan-đjüe', english: 'feeling / perception', serbian: 'osećaj / percepcija', exampleUse: '感觉敏锐 (oštar osećaj)', isCoreChar: false, category: 'noun' },
      { char: '影子', pinyin: 'yǐngzi', vuk: 'jing-ci', english: 'shadow / silhouette', serbian: 'senka', exampleUse: '阳光下的影子 (senka na suncu)', isCoreChar: false, category: 'noun' },
      { char: '希望', pinyin: 'xīwàng', vuk: 'si-vang', english: 'hope / earnest wish', serbian: 'nada', exampleUse: '满怀希望 (pun nade)', isCoreChar: false, category: 'noun' }
    ],
    sentences: [
      {
        id: 's-19-1',
        chinese: '命运掌握在自己手中，以坚韧的灵魂追逐梦想，必能驱散黑暗迎来光明。',
        pinyin: 'Mìngyùn zhǎngwò zài zìjǐ shǒuzhōng, yǐ jiānrèn de línghún zhuīzhú mèngxiǎng, bì néng qūsàn hēi\'àn yínglái guāngmíng.',
        vuk: 'Ming-jün džang-vo caj ci-đji šou-džung, ji đjen-žen de ling-hun džuej-džu meng-sjang, bi neng ćü-san hej-an jing-laj guang-ming.',
        english: 'Destiny rests in your own hands; pursue your dreams with an indomitable soul, and you will dispel darkness and welcome the light.',
        serbian: 'Sudbina je u tvojim rukama; sledi svoje snove nepokolebljivom dušom i sigurno ćeš rasterati tamu i dočekati svetlost.',
        targetWords: ['命运', '灵魂', '梦想', '黑暗', '光明'],
        context: 'Transcendent Stoicism & Destiny',
        tokens: [
          { word: '命运', pinyin: 'mìngyùn', english: 'destiny', serbian: 'sudbina', isTarget: true },
          { word: '掌握在', pinyin: 'zhǎngwò zài', english: 'held in', serbian: 'drži se u' },
          { word: '自己手中', pinyin: 'zìjǐ shǒuzhōng', english: 'own hands', serbian: 'sopstvenim rukama' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '以', pinyin: 'yǐ', english: 'with', serbian: 'sa' },
          { word: '坚韧的', pinyin: 'jiānrèn de', english: 'resilient', serbian: 'nepokolebljivom' },
          { word: '灵魂', pinyin: 'línghún', english: 'soul', serbian: 'dušom', isTarget: true },
          { word: '追逐', pinyin: 'zhuīzhú', english: 'pursue', serbian: 'slediti' },
          { word: '梦想', pinyin: 'mèngxiǎng', english: 'dreams', serbian: 'snove', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '必能', pinyin: 'bì néng', english: 'surely can', serbian: 'sigurno možeš' },
          { word: '驱散', pinyin: 'qūsàn', english: 'dispel', serbian: 'rasterati' },
          { word: '黑暗', pinyin: 'hēi\'àn', english: 'darkness', serbian: 'tamu', isTarget: true },
          { word: '迎来', pinyin: 'yínglái', english: 'welcome', serbian: 'dočekati' },
          { word: '光明', pinyin: 'guāngmíng', english: 'light', serbian: 'svetlost', isTarget: true }
        ]
      },
      {
        id: 's-19-2',
        chinese: '微风中传来了自然的声音，茶香散发出安宁的味道，让人感觉心旷神怡。',
        pinyin: 'Wēifēng zhōng chuánláile zìrán de shēngyīn, cháxiāng sànfāchū ānníng de wèidao, ràng rén gǎnjué xīnkuàng-shényí.',
        vuk: 'Vej-feng džung čuan-laj-le ci-žan de šeng-jin, ča-sjang san-fa-ču an-ning de vej-dao, rang žen gan-đjue sin-kuang-šen-ji.',
        english: 'The sounds of nature carry upon the gentle breeze; tea fragrance wafts a tranquil aroma, leaving one’s mind serene and refreshed.',
        serbian: 'Blagi povetarac donosi zvuke prirode; miris čaja širi spokojnu aromu, pružajući osećaj potpunog spokoja.',
        targetWords: ['声音', '味道', '感觉'],
        context: 'Sensory Sanctuary Meditation',
        tokens: [
          { word: '微风中', pinyin: 'wēifēng zhōng', english: 'in breeze', serbian: 'u povetarcu' },
          { word: '传来了', pinyin: 'chuánláile', english: 'carried over', serbian: 'stigli su' },
          { word: '自然的', pinyin: 'zìrán de', english: 'nature\'s', serbian: 'prirode' },
          { word: '声音', pinyin: 'shēngyīn', english: 'sounds', serbian: 'zvukovi', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '茶香', pinyin: 'cháxiāng', english: 'tea aroma', serbian: 'miris čaja' },
          { word: '散发出', pinyin: 'sànfāchū', english: 'emits', serbian: 'širi' },
          { word: '安宁的', pinyin: 'ānníng de', english: 'peaceful', serbian: 'spokojnu' },
          { word: '味道', pinyin: 'wèidao', english: 'flavor/aroma', serbian: 'aromu', isTarget: true },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '让人', pinyin: 'ràng rén', english: 'causes one to', serbian: 'čineći da se' },
          { word: '感觉', pinyin: 'gǎnjué', english: 'feel', serbian: 'oseća', isTarget: true },
          { word: '心旷神怡', pinyin: 'xīnkuàng-shényí', english: 'refreshed and relaxed', serbian: 'potpuno spokojno' }
        ]
      }
    ]
  },
  {
    id: 'c2-r10',
    chartId: 2,
    rowNumber: 10,
    title: 'Space, Boundaries & Perspective',
    titleSerbian: 'Prostor, Granice i Orijentacija',
    emoji: '📐',
    chartImage: '/assets/aistudio/image_878c0d94.png',
    description: 'Orientations: interior, exterior, front and back, flanks, distance, and architectural terminals.',
    words: [
      // Core 10 Characters
      { char: '旁', pinyin: 'páng', vuk: 'pang', english: 'side / beside', serbian: 'pored / sa strane', exampleUse: '旁边 (pored)', isCoreChar: true, category: 'direction' },
      { char: '外', pinyin: 'wài', vuk: 'vaj', english: 'outside / foreign', serbian: 'napolju / spolja', exampleUse: '外边 (napolju)', isCoreChar: true, category: 'direction' },
      { char: '内', charTraditional: '內', pinyin: 'nèi', vuk: 'nej', english: 'inside / internal', serbian: 'unutra / unutrašnjost', exampleUse: '内在 (unutrašnji svet)', isCoreChar: true, category: 'direction' },
      { char: '远', charTraditional: '遠', pinyin: 'yuǎn', vuk: 'jüan', english: 'far / distant', serbian: 'daleko', exampleUse: '远方 (daljina)', isCoreChar: true, category: 'direction' },
      { char: '近', pinyin: 'jìn', vuk: 'đjin', english: 'near / close', serbian: 'blizu', exampleUse: '最近 (u poslednje vreme/najbliže)', isCoreChar: true, category: 'direction' },
      { char: '前', pinyin: 'qián', vuk: 'ćjen', english: 'front / before', serbian: 'napred / ispred', exampleUse: '前方 (napred)', isCoreChar: true, category: 'direction' },
      { char: '后', charTraditional: '後', pinyin: 'hòu', vuk: 'hou', english: 'back / behind', serbian: 'nazad / iza', exampleUse: '后面 (iza)', isCoreChar: true, category: 'direction' },
      { char: '左', pinyin: 'zuǒ', vuk: 'cuo', english: 'left', serbian: 'levo', exampleUse: '左侧 (leva strana)', isCoreChar: true, category: 'direction' },
      { char: '右', pinyin: 'yòu', vuk: 'jou', english: 'right', serbian: 'desno', exampleUse: '右手 (desna ruka)', isCoreChar: true, category: 'direction' },
      { char: '端', pinyin: 'duān', vuk: 'duan', english: 'edge / end / tip', serbian: 'kraj / ivica / vrh', exampleUse: '两端 (oba kraja)', isCoreChar: true, category: 'direction' },
      // Expanded High-Frequency Native Vocabulary
      { char: '前面', pinyin: 'qiánmiàn', vuk: 'ćjen-mjen', english: 'in front / ahead', serbian: 'napred / ispred', exampleUse: '走在前面 (hodati ispred)', isCoreChar: false, category: 'direction' },
      { char: '后面', pinyin: 'hòumiàn', vuk: 'hou-mjen', english: 'behind / in back', serbian: 'iza / pozadi', exampleUse: '紧随其后 (pratiti od pozadi)', isCoreChar: false, category: 'direction' },
      { char: '左边', pinyin: 'zuǒbiān', vuk: 'cuo-bjen', english: 'left side', serbian: 'leva strana', exampleUse: '靠左边走 (drži se leve strane)', isCoreChar: false, category: 'direction' },
      { char: '右边', pinyin: 'yòubiān', vuk: 'jou-bjen', english: 'right side', serbian: 'desna strana', exampleUse: '在右边等 (čekati sa desne strane)', isCoreChar: false, category: 'direction' },
      { char: '旁边', pinyin: 'pángbiān', vuk: 'pang-bjen', english: 'beside / adjacent', serbian: 'pored / uz bok', exampleUse: '坐在旁边 (sedeti pored)', isCoreChar: false, category: 'direction' },
      { char: '外面', pinyin: 'wàimiàn', vuk: 'vaj-mjen', english: 'outside / outdoors', serbian: 'napolju / van', exampleUse: '在外面等 (čekati napolju)', isCoreChar: false, category: 'direction' },
      { char: '里面', pinyin: 'lǐmiàn', vuk: 'li-mjen', english: 'inside / within', serbian: 'unutra / u sklopu', exampleUse: '房间里面 (unutar sobe)', isCoreChar: false, category: 'direction' },
      { char: '附近', pinyin: 'fùjìn', vuk: 'fu-đjin', english: 'nearby / vicinity', serbian: 'u blizini', exampleUse: '在附近散步 (šetati u blizini)', isCoreChar: false, category: 'direction' },
      { char: '远方', pinyin: 'yuǎnfāng', vuk: 'jüan-fang', english: 'distant horizon / far-off place', serbian: 'daljina / horizont', exampleUse: '奔赴远方 (krenuti u daljinu)', isCoreChar: false, category: 'direction' },
      { char: '中间', pinyin: 'zhōngjiān', vuk: 'džung-đjen', english: 'middle / center', serbian: 'sredina', exampleUse: '站在中间 (stani u sredinu)', isCoreChar: false, category: 'direction' },
      { char: '方向', pinyin: 'fāngxiàng', vuk: 'fang-sjang', english: 'direction / heading', serbian: 'pravac / smer', exampleUse: '指引方向 (pokazati smer)', isCoreChar: false, category: 'direction' },
      { char: '两端', pinyin: 'liǎngduān', vuk: 'ljang-duan', english: 'both terminals / ends', serbian: 'oba kraja', exampleUse: '桥梁两端 (oba kraja mosta)', isCoreChar: false, category: 'direction' }
    ],
    sentences: [
      {
        id: 's-20-1',
        chinese: '向着正确的方向前行，前面是远方的大路，后面和旁边都是支持你的朋友。',
        pinyin: 'Xiàngzhe zhèngquè de fāngxiàng qiánxíng, qiánmiàn shì yuǎnfāng de dàlù, hòumiàn hé pángbiān dōu shì zhīchí nǐ de péngyou.',
        vuk: 'Sjang-dže dženg-ćüe de fang-sjang ćjen-sing, ćjen-mjen ši jüan-fang de da-lu, hou-mjen he pang-bjen dou ši dži-či ni de peng-jou.',
        english: 'Heading toward the right direction, ahead lies the great road to the horizon, and behind and beside you are friends who support you.',
        serbian: 'Koračajući u pravom smeru, ispred tebe leži širok put ka daljini, a iza i pored tebe su prijatelji koji te podržavaju.',
        targetWords: ['方向', '前面', '远方', '后面', '旁边', '朋友'],
        context: 'Purpose, Navigation & Camaraderie',
        tokens: [
          { word: '向着', pinyin: 'xiàngzhe', english: 'heading toward', serbian: 'idući ka' },
          { word: '正确的', pinyin: 'zhèngquè de', english: 'correct', serbian: 'pravom' },
          { word: '方向', pinyin: 'fāngxiàng', english: 'direction', serbian: 'smeru', isTarget: true },
          { word: '前行', pinyin: 'qiánxíng', english: 'advance', serbian: 'napredovati' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '前面', pinyin: 'qiánmiàn', english: 'in front', serbian: 'ispred', isTarget: true },
          { word: '是', pinyin: 'shì', english: 'is', serbian: 'je' },
          { word: '远方的', pinyin: 'yuǎnfāng de', english: 'distant', serbian: 'daleki', isTarget: true },
          { word: '大路', pinyin: 'dàlù', english: 'great road', serbian: 'put' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '后面', pinyin: 'hòumiàn', english: 'behind', serbian: 'iza', isTarget: true },
          { word: '和', pinyin: 'hé', english: 'and', serbian: 'i' },
          { word: '旁边', pinyin: 'pángbiān', english: 'beside', serbian: 'pored', isTarget: true },
          { word: '都是', pinyin: 'dōu shì', english: 'all are', serbian: 'su svi' },
          { word: '支持你的', pinyin: 'zhīchí nǐ de', english: 'supporting you', serbian: 'koji te podržavaju' },
          { word: '朋友', pinyin: 'péngyou', english: 'friends', serbian: 'prijatelji' }
        ]
      },
      {
        id: 's-20-2',
        chinese: '房间里面格外安静，桌子两端放着书籍，外面附近的公园适宜漫步。',
        pinyin: 'Fángjiān lǐmiàn géwài ānjìng, zhuōzi liǎngduān fàngzhe shūjí, wàimiàn fùjìn de gōngyuán shìyí mànbù.',
        vuk: 'Fang-đjen li-mjen ge-vaj an-đjing, džuo-ci ljang-duan fang-dže šu-đji, vaj-mjen fu-đjin de gung-jüan ši-ji man-bu.',
        english: 'The interior of the room is extraordinarily quiet with books on both ends of the desk, while the nearby park outside is perfect for a stroll.',
        serbian: 'Unutar sobe vlada izuzetan mir sa knjigama na oba kraja stola, dok je obližnji park napolju savršen za šetnju.',
        targetWords: ['里面', '两端', '外面', '附近'],
        context: 'Sanctuary Interior & Surrounding Environment',
        tokens: [
          { word: '房间', pinyin: 'fángjiān', english: 'room', serbian: 'soba' },
          { word: '里面', pinyin: 'lǐmiàn', english: 'inside', serbian: 'unutra', isTarget: true },
          { word: '格外', pinyin: 'géwài', english: 'extraordinarily', serbian: 'izuzetno' },
          { word: '安静', pinyin: 'ānjìng', english: 'quiet', serbian: 'mirno' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '桌子', pinyin: 'zhuōzi', english: 'table/desk', serbian: 'stola' },
          { word: '两端', pinyin: 'liǎngduān', english: 'both ends', serbian: 'oba kraja', isTarget: true },
          { word: '放着', pinyin: 'fàngzhe', english: 'placed', serbian: 'stoje' },
          { word: '书籍', pinyin: 'shūjí', english: 'books', serbian: 'knjige' },
          { word: '，', pinyin: ',', english: ',', serbian: ',' },
          { word: '外面', pinyin: 'wàimiàn', english: 'outside', serbian: 'napolju', isTarget: true },
          { word: '附近的', pinyin: 'fùjìn de', english: 'nearby', serbian: 'obližnji', isTarget: true },
          { word: '公园', pinyin: 'gōngyuán', english: 'park', serbian: 'park' },
          { word: '适宜', pinyin: 'shìyí', english: 'suitable for', serbian: 'pogodan za' },
          { word: '漫步', pinyin: 'mànbù', english: 'stroll', serbian: 'šetnju' }
        ]
      }
    ]
  }
];

export const TOTAL_REAL_LIFE_CLUSTERS = REAL_LIFE_CLUSTERS.length;
export const TOTAL_REAL_LIFE_WORDS = REAL_LIFE_CLUSTERS.reduce((acc, c) => acc + c.words.length, 0);
