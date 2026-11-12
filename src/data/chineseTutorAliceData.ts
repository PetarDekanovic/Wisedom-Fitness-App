// ============================================================================
// AI TUTOR ALICE (爱丽丝老师) - DATA STRUCTURES & PRE-BUILT SCENARIOS
// Multi-turn conversational lessons with word-by-word tokenized sentences
// ============================================================================

export interface TutorWordToken {
  chinese: string;
  pinyin: string;
  vuk: string;
  english: string;
  serbian: string;
  category: 'noun' | 'verb' | 'adjective' | 'pronoun' | 'particle' | 'number' | 'direction' | 'phrase' | 'idiom';
  hskLevel?: number;
}

export interface PrebuiltReplyOption {
  id: string;
  chinese: string;
  pinyin: string;
  vuk: string;
  english: string;
  serbian: string;
  tag: 'positive' | 'detailed' | 'polite' | 'curious' | 'stoic';
  tagLabel: string;
  words: TutorWordToken[];
}

export interface TutorTurnMessage {
  id: string;
  sender: 'alice' | 'user';
  chinese: string;
  pinyin: string;
  vuk: string;
  english: string;
  serbian: string;
  words: TutorWordToken[];
  suggestedReplies?: PrebuiltReplyOption[];
  feedback?: {
    pronunciationTip: string;
    grammarAdvice: string;
    culturalNote: string;
    hskTier?: string;
  };
}

export interface TutorScenario {
  id: string;
  title: string;
  titleSerbian: string;
  subtitle: string;
  emoji: string;
  difficulty: 'Beginner' | 'Elementary' | 'Intermediate' | 'Philosophical';
  turns: TutorTurnMessage[];
}

export const ALICE_TUTOR_PROFILE = {
  name: 'Alice',
  chineseName: '爱丽丝 (Àilìsī)',
  title: 'Your Personal AI Mandarin Tutor',
  titleSerbian: 'Tvoj Lični AI Mentor za Kineski Jezik',
  subtitle: 'Tvoj Lični AI Mentor za Kineski Jezik',
  avatarImage: '/assets/aistudio/image_9f8b00ad.png',
  avatar: '/assets/aistudio/image_9f8b00ad.png',
  fullPortraitImage: '/assets/aistudio/image_804f49da.png',
  portrait: '/assets/aistudio/image_804f49da.png',
  status: 'Online • Standard Mandarin (普通话)',
  greeting: '你好！我是你的专属中文老师 Alice。很高兴陪你一起练习生动自然的中文对话！',
  greetingChinese: '你好！我是你的专属中文老师 Alice。很高兴陪你一起练习生动自然的中文对话！',
  greetingPinyin: 'Nǐ hǎo! Wǒ shì nǐ de zhuānshǔ Zhōngwén lǎoshī Alice. Hěn gāoxìng péi nǐ yīqǐ liànxí shēngdòng zìrán de Zhōngwén duìhuà!',
  greetingSerbian: 'Zdravo! Ja sam tvoja lična profesorka kineskog Alice. Veoma mi je drago što ćemo zajedno vežbati prirodan i tečan kineski razgovor!',
  bio: 'Alice is a gentle, articulate, and encouraging Mandarin educator specializing in spoken fluency, word-by-word comprehension, pronunciation refinement, and philosophical depth.',
  bioSerbian: 'Alice je strpljiva, stručna i podsticajna profesorka kineskog koja se fokusira na govornu tečnost, razumevanje reč po reč, pravilne tonove i mudrost klasičnog kineskog duha.',
  specialties: [
    'Rastavljanje rečenica reč po reč sa izgovorom',
    'Precizni tonovi (1–4) i fonetska Vuk transkripcija',
    'Prirodni govorni obrasci i predefinisani odgovori',
    'Stoicizam i klasične kineske izreke (成语)'
  ]
};

export const TUTOR_SCENARIOS: TutorScenario[] = [
  // ==========================================
  // SCENARIO 1: GREETINGS & FIRST MEETING
  // ==========================================
  {
    id: 'sc-greetings',
    title: 'First Meeting & Greetings',
    titleSerbian: 'Upoznavanje i Prvi Pozdrav',
    subtitle: 'Greetings, wellbeing, introducing yourself, and setting learning goals.',
    emoji: '👋',
    difficulty: 'Beginner',
    turns: [
      {
        id: 'greet-q1',
        sender: 'alice',
        chinese: '你好，Petar！我叫 Alice。你今天好吗？',
        pinyin: 'Nǐ hǎo, Petar! Wǒ jiào Alice. Nǐ jīntiān hǎo ma?',
        vuk: 'Ni hao, Petar! Vo đjao Alice. Ni đjin-tjen hao ma?',
        english: 'Hello, Petar! My name is Alice. How are you today?',
        serbian: 'Zdravo, Petre! Zovem se Alice. Kako si danas?',
        words: [
          { chinese: '你好', pinyin: 'nǐ hǎo', vuk: 'ni hao', english: 'hello', serbian: 'zdravo', category: 'phrase' },
          { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
          { chinese: 'Petar', pinyin: 'Petar', vuk: 'Petar', english: 'Petar', serbian: 'Petar', category: 'noun' },
          { chinese: '！', pinyin: '!', vuk: '!', english: '!', serbian: '!', category: 'phrase' },
          { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I / me', serbian: 'ja', category: 'pronoun' },
          { chinese: '叫', pinyin: 'jiào', vuk: 'đjao', english: 'be called / named', serbian: 'zvati se', category: 'verb' },
          { chinese: 'Alice', pinyin: 'Alice', vuk: 'Alice', english: 'Alice', serbian: 'Alice', category: 'noun' },
          { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' },
          { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'ti', category: 'pronoun' },
          { chinese: '今天', pinyin: 'jīntiān', vuk: 'đjin-tjen', english: 'today', serbian: 'danas', category: 'noun' },
          { chinese: '好', pinyin: 'hǎo', vuk: 'hao', english: 'good / well', serbian: 'dobro', category: 'adjective' },
          { chinese: '吗', pinyin: 'ma', vuk: 'ma', english: 'question particle', serbian: 'upitna rečca (da li)', category: 'particle' },
          { chinese: '？', pinyin: '?', vuk: '?', english: '?', serbian: '?', category: 'phrase' }
        ],
        feedback: {
          pronunciationTip: 'When "nǐ" and "hǎo" (both 3rd tones) meet, "nǐ" shifts smoothly to 2nd tone ("ní hǎo"). This is called 3rd-tone sandhi.',
          grammarAdvice: 'Adding the particle "吗 (ma)" at the very end of a statement turns it directly into a yes/no question without inverting word order.',
          culturalNote: 'In Chinese culture, smiling and establishing a warm tone with "你好" is the cornerstone of every respectful interaction.',
          hskTier: 'HSK 1 Foundation'
        },
        suggestedReplies: [
          {
            id: 'rep-g1-1',
            tag: 'positive',
            tagLabel: '🌟 Pozitivno & Srdačno',
            chinese: '我今天很好，谢谢你！你呢？',
            pinyin: 'Wǒ jīntiān hěn hǎo, xièxie nǐ! Nǐ ne?',
            vuk: 'Vo đjin-tjen hen hao, sje-sje ni! Ni ne?',
            english: 'I am doing great today, thank you! And you?',
            serbian: 'Danas sam odlično, hvala ti! A ti?',
            words: [
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '今天', pinyin: 'jīntiān', vuk: 'đjin-tjen', english: 'today', serbian: 'danas', category: 'noun' },
              { chinese: '很', pinyin: 'hěn', vuk: 'hen', english: 'very', serbian: 'veoma', category: 'adjective' },
              { chinese: '好', pinyin: 'hǎo', vuk: 'hao', english: 'good', serbian: 'dobro', category: 'adjective' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '谢谢', pinyin: 'xièxie', vuk: 'sje-sje', english: 'thank you', serbian: 'hvala', category: 'phrase' },
              { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'ti', category: 'pronoun' },
              { chinese: '！', pinyin: '!', vuk: '!', english: '!', serbian: '!', category: 'phrase' },
              { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'ti', category: 'pronoun' },
              { chinese: '呢', pinyin: 'ne', vuk: 'ne', english: 'and you? (bounce back)', serbian: 'a ti?', category: 'particle' },
              { chinese: '？', pinyin: '?', vuk: '?', english: '?', serbian: '?', category: 'phrase' }
            ]
          },
          {
            id: 'rep-g1-2',
            tag: 'polite',
            tagLabel: '🤝 Učtivo & Poštovano',
            chinese: '我也很好，很高兴认识你，Alice老师！',
            pinyin: 'Wǒ yě hěn hǎo, hěn gāoxìng rènshi nǐ, Alice lǎoshī!',
            vuk: 'Vo je hen hao, hen gao-sing žen-ši ni, Alice lao-ši!',
            english: 'I am also very well, pleased to meet you, Teacher Alice!',
            serbian: 'I ja sam dobro, veoma mi je drago što sam te upoznao, profesorka Alice!',
            words: [
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '也', pinyin: 'yě', vuk: 'je', english: 'also', serbian: 'takođe', category: 'phrase' },
              { chinese: '很', pinyin: 'hěn', vuk: 'hen', english: 'very', serbian: 'veoma', category: 'adjective' },
              { chinese: '好', pinyin: 'hǎo', vuk: 'hao', english: 'good', serbian: 'dobro', category: 'adjective' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '很', pinyin: 'hěn', vuk: 'hen', english: 'very', serbian: 'veoma', category: 'adjective' },
              { chinese: '高兴', pinyin: 'gāoxìng', vuk: 'gao-sing', english: 'happy / glad', serbian: 'drago mi je', category: 'adjective' },
              { chinese: '认识', pinyin: 'rènshi', vuk: 'žen-ši', english: 'to know / meet', serbian: 'upoznati', category: 'verb' },
              { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'tebe', category: 'pronoun' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: 'Alice', pinyin: 'Alice', vuk: 'Alice', english: 'Alice', serbian: 'Alice', category: 'noun' },
              { chinese: '老师', pinyin: 'lǎoshī', vuk: 'lao-ši', english: 'teacher', serbian: 'profesor / učitelj', category: 'noun' },
              { chinese: '！', pinyin: '!', vuk: '!', english: '!', serbian: '!', category: 'phrase' }
            ]
          },
          {
            id: 'rep-g1-3',
            tag: 'detailed',
            tagLabel: '💪 Spremno za Učenje',
            chinese: '我很好！我已经准备好跟你一起学中文了。',
            pinyin: 'Wǒ hěn hǎo! Wǒ yǐjīng zhǔnbèi hǎo gēn nǐ yīqǐ xué Zhōngwén le.',
            vuk: 'Vo hen hao! Vo ji-đjing džun-bej hao gen ni ji-ći süe Džung-ven le.',
            english: 'I am doing well! I am already prepared to study Chinese with you.',
            serbian: 'Dobro sam! Već sam se pripremio da učim kineski sa tobom.',
            words: [
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '很', pinyin: 'hěn', vuk: 'hen', english: 'very', serbian: 'veoma', category: 'adjective' },
              { chinese: '好', pinyin: 'hǎo', vuk: 'hao', english: 'good', serbian: 'dobro', category: 'adjective' },
              { chinese: '！', pinyin: '!', vuk: '!', english: '!', serbian: '!', category: 'phrase' },
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '已经', pinyin: 'yǐjīng', vuk: 'ji-đjing', english: 'already', serbian: 'već', category: 'phrase' },
              { chinese: '准备好', pinyin: 'zhǔnbèi hǎo', vuk: 'džun-bej hao', english: 'prepared / ready', serbian: 'spreman', category: 'verb' },
              { chinese: '跟', pinyin: 'gēn', vuk: 'gen', english: 'with', serbian: 'sa', category: 'phrase' },
              { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'tobom', category: 'pronoun' },
              { chinese: '一起', pinyin: 'yīqǐ', vuk: 'ji-ći', english: 'together', serbian: 'zajedno', category: 'phrase' },
              { chinese: '学', pinyin: 'xué', vuk: 'süe', english: 'learn / study', serbian: 'učiti', category: 'verb' },
              { chinese: '中文', pinyin: 'Zhōngwén', vuk: 'Džung-ven', english: 'Chinese', serbian: 'kineski jezik', category: 'noun' },
              { chinese: '了', pinyin: 'le', vuk: 'le', english: 'completed change particle', serbian: 'rečca promene stanja', category: 'particle' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          },
          {
            id: 'rep-g1-4',
            tag: 'stoic',
            tagLabel: '🧘 Smireno & Zrelo',
            chinese: '我今天有点忙，不过内心很平静。',
            pinyin: 'Wǒ jīntiān yǒudiǎn máng, bùguò nèixīn hěn píngjìng.',
            vuk: 'Vo đjin-tjen jou-đjen mang, bu-guo nej-sin hen ping-đjing.',
            english: 'I am a little busy today, but my heart is very peaceful.',
            serbian: 'Danas sam malo zauzet, ali u srcu mi vlada mir.',
            words: [
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '今天', pinyin: 'jīntiān', vuk: 'đjin-tjen', english: 'today', serbian: 'danas', category: 'noun' },
              { chinese: '有点', pinyin: 'yǒudiǎn', vuk: 'jou-đjen', english: 'a little bit', serbian: 'pomalo', category: 'adjective' },
              { chinese: '忙', pinyin: 'máng', vuk: 'mang', english: 'busy', serbian: 'zauzet', category: 'adjective' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '不过', pinyin: 'bùguò', vuk: 'bu-guo', english: 'however / but', serbian: 'ali / ipak', category: 'phrase' },
              { chinese: '内心', pinyin: 'nèixīn', vuk: 'nej-sin', english: 'inner heart', serbian: 'unutrašnje biće', category: 'noun' },
              { chinese: '很', pinyin: 'hěn', vuk: 'hen', english: 'very', serbian: 'veoma', category: 'adjective' },
              { chinese: '平静', pinyin: 'píngjìng', vuk: 'ping-đjing', english: 'peaceful / serene', serbian: 'mirno / spokojno', category: 'adjective' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          }
        ]
      },
      {
        id: 'greet-q2',
        sender: 'alice',
        chinese: '听到你状态这么好，我真高兴！你平时喜欢通过什么方式学习中文？',
        pinyin: 'Tīng dào nǐ zhuàngtài zhème hǎo, wǒ zhēn gāoxìng! Nǐ píngshí xǐhuan tōngguò shénme fāngshì xuéxí Zhōngwén?',
        vuk: 'Ting dao ni džuang-taj dže-me hao, vo džen gao-sing! Ni ping-ši si-huan tung-guo šen-me fang-ši süe-si Džung-ven?',
        english: 'Hearing that your state is so good makes me truly happy! How do you usually like to learn Chinese?',
        serbian: 'Drago mi je što čujem da si u tako dobrom stanju! Koji način učenja kineskog najviše voliš?',
        words: [
          { chinese: '听到', pinyin: 'tīng dào', vuk: 'ting dao', english: 'hear that', serbian: 'čuti da', category: 'verb' },
          { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'your', serbian: 'tvoje', category: 'pronoun' },
          { chinese: '状态', pinyin: 'zhuàngtài', vuk: 'džuang-taj', english: 'state / condition', serbian: 'stanje', category: 'noun' },
          { chinese: '这么', pinyin: 'zhème', vuk: 'dže-me', english: 'so / this much', serbian: 'tako', category: 'adjective' },
          { chinese: '好', pinyin: 'hǎo', vuk: 'hao', english: 'good', serbian: 'dobro', category: 'adjective' },
          { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
          { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
          { chinese: '真', pinyin: 'zhēn', vuk: 'džen', english: 'truly / really', serbian: 'zaista', category: 'adjective' },
          { chinese: '高兴', pinyin: 'gāoxìng', vuk: 'gao-sing', english: 'happy', serbian: 'srećna', category: 'adjective' },
          { chinese: '！', pinyin: '!', vuk: '!', english: '!', serbian: '!', category: 'phrase' },
          { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'ti', category: 'pronoun' },
          { chinese: '平时', pinyin: 'píngshí', vuk: 'ping-ši', english: 'usually / ordinarily', serbian: 'obično', category: 'noun' },
          { chinese: '喜欢', pinyin: 'xǐhuan', vuk: 'si-huan', english: 'like', serbian: 'voliš', category: 'verb' },
          { chinese: '通过', pinyin: 'tōngguò', vuk: 'tung-guo', english: 'via / through', serbian: 'kroz / preko', category: 'phrase' },
          { chinese: '什么', pinyin: 'shénme', vuk: 'šen-me', english: 'what', serbian: 'šta / koji', category: 'pronoun' },
          { chinese: '方式', pinyin: 'fāngshì', vuk: 'fang-ši', english: 'method / way', serbian: 'način', category: 'noun' },
          { chinese: '学习', pinyin: 'xuéxí', vuk: 'süe-si', english: 'study / learn', serbian: 'učiti', category: 'verb' },
          { chinese: '中文', pinyin: 'Zhōngwén', vuk: 'Džung-ven', english: 'Chinese', serbian: 'kineski', category: 'noun' },
          { chinese: '？', pinyin: '?', vuk: '?', english: '?', serbian: '?', category: 'phrase' }
        ],
        feedback: {
          pronunciationTip: '"平时 (píngshí)" has two 2nd tones (rising pitch like asking a question in English: "Really?").',
          grammarAdvice: '"通过...方式" means "by means of... / through the way of...". It sets the adverbial manner before the main verb.',
          culturalNote: 'Addressing teachers as "老师 (lǎoshī)" after their name (e.g. Alice老师) is deeply respected in China.',
          hskTier: 'HSK 2 Spoken'
        },
        suggestedReplies: [
          {
            id: 'rep-g2-1',
            tag: 'positive',
            tagLabel: '💬 Svakodnevni Dijalozi',
            chinese: '我喜欢通过日常对话练习听力和发音。',
            pinyin: 'Wǒ xǐhuan tōngguò rìcháng duìhuà liànxí tīnglì hé fāyīn.',
            vuk: 'Vo si-huan tung-guo ž-čang duej-hua ljen-si ting-li he fa-jin.',
            english: 'I like to practice listening and pronunciation through daily dialogue.',
            serbian: 'Volim da kroz svakodnevne razgovore vežbam slušanje i pravilan izgovor.',
            words: [
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '喜欢', pinyin: 'xǐhuan', vuk: 'si-huan', english: 'like', serbian: 'volim', category: 'verb' },
              { chinese: '通过', pinyin: 'tōngguò', vuk: 'tung-guo', english: 'via', serbian: 'kroz', category: 'phrase' },
              { chinese: '日常', pinyin: 'rìcháng', vuk: 'ž-čang', english: 'daily / everyday', serbian: 'svakodnevni', category: 'adjective' },
              { chinese: '对话', pinyin: 'duìhuà', vuk: 'duej-hua', english: 'dialogue / conversation', serbian: 'razgovor', category: 'noun' },
              { chinese: '练习', pinyin: 'liànxí', vuk: 'ljen-si', english: 'practice', serbian: 'vežbam', category: 'verb' },
              { chinese: '听力', pinyin: 'tīnglì', vuk: 'ting-li', english: 'listening comprehension', serbian: 'slušanje', category: 'noun' },
              { chinese: '和', pinyin: 'hé', vuk: 'he', english: 'and', serbian: 'i', category: 'phrase' },
              { chinese: '发音', pinyin: 'fāyīn', vuk: 'fa-jin', english: 'pronunciation', serbian: 'izgovor', category: 'noun' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          },
          {
            id: 'rep-g2-2',
            tag: 'detailed',
            tagLabel: '📜 Čengji & Filozofija',
            chinese: '我想多学中国成语和经典哲学思想。',
            pinyin: 'Wǒ xiǎng duō xué Zhōngguó chéngyǔ hé jīngdiǎn zhéxué sīxiǎng.',
            vuk: 'Vo sjang duo süe Džung-guo čeng-ji he đjing-đjen dže-süe s-sjang.',
            english: 'I want to study more Chinese idioms and classical philosophical thoughts.',
            serbian: 'Želim da naučim više kineskih idioma i klasične filozofske misli.',
            words: [
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '想', pinyin: 'xiǎng', vuk: 'sjang', english: 'want to', serbian: 'želim', category: 'verb' },
              { chinese: '多', pinyin: 'duō', vuk: 'duo', english: 'more', serbian: 'više', category: 'adjective' },
              { chinese: '学', pinyin: 'xué', vuk: 'süe', english: 'learn', serbian: 'učiti', category: 'verb' },
              { chinese: '中国', pinyin: 'Zhōngguó', vuk: 'Džung-guo', english: 'Chinese', serbian: 'kineske', category: 'noun' },
              { chinese: '成语', pinyin: 'chéngyǔ', vuk: 'čeng-ji', english: 'idioms', serbian: 'idiome (čengji)', category: 'idiom' },
              { chinese: '和', pinyin: 'hé', vuk: 'he', english: 'and', serbian: 'i', category: 'phrase' },
              { chinese: '经典', pinyin: 'jīngdiǎn', vuk: 'đjing-đjen', english: 'classical', serbian: 'klasične', category: 'adjective' },
              { chinese: '哲学', pinyin: 'zhéxué', vuk: 'dže-süe', english: 'philosophy', serbian: 'filozofske', category: 'noun' },
              { chinese: '思想', pinyin: 'sīxiǎng', vuk: 's-sjang', english: 'thought / ideas', serbian: 'misli', category: 'noun' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          },
          {
            id: 'rep-g2-3',
            tag: 'curious',
            tagLabel: '🔍 Reč po Reč',
            chinese: '把每个句子拆解成词语让我学得最快。',
            pinyin: 'Bǎ měi gè jùzi chāijiě chéng cíyǔ ràng wǒ xué de zuì kuài.',
            vuk: 'Ba mej ge đjü-ce čaj-đje čeng ci-ji rang vo süe de zuej kuaj.',
            english: 'Breaking every sentence into words helps me learn the fastest.',
            serbian: 'Rastavljanje svake rečenice na reči pomaže mi da učim najbrže.',
            words: [
              { chinese: '把', pinyin: 'bǎ', vuk: 'ba', english: 'disposition marker', serbian: 'rečca usmerenja radnje', category: 'particle' },
              { chinese: '每个', pinyin: 'měi gè', vuk: 'mej ge', english: 'each / every', serbian: 'svaku', category: 'pronoun' },
              { chinese: '句子', pinyin: 'jùzi', vuk: 'đjü-ce', english: 'sentence', serbian: 'rečenicu', category: 'noun' },
              { chinese: '拆解', pinyin: 'chāijiě', vuk: 'čaj-đje', english: 'break down / deconstruct', serbian: 'rastaviti', category: 'verb' },
              { chinese: '成', pinyin: 'chéng', vuk: 'čeng', english: 'into', serbian: 'na', category: 'verb' },
              { chinese: '词语', pinyin: 'cíyǔ', vuk: 'ci-ji', english: 'words / vocabulary', serbian: 'reči', category: 'noun' },
              { chinese: '让', pinyin: 'ràng', vuk: 'žang', english: 'let / make', serbian: 'čini da', category: 'verb' },
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'me', serbian: 'ja', category: 'pronoun' },
              { chinese: '学得', pinyin: 'xué de', vuk: 'süe de', english: 'learn (degree)', serbian: 'učim', category: 'verb' },
              { chinese: '最快', pinyin: 'zuì kuài', vuk: 'zuej kuaj', english: 'fastest', serbian: 'najbrže', category: 'adjective' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // SCENARIO 2: TEA HOUSE & ORDERING FOOD
  // ==========================================
  {
    id: 'sc-dining',
    title: 'Tea House & Restaurant',
    titleSerbian: 'Čajdžinica i Restoran',
    subtitle: 'Ordering Chinese tea, asking for favorites, and requesting the bill (买单).',
    emoji: '🍵',
    difficulty: 'Elementary',
    turns: [
      {
        id: 'dine-q1',
        sender: 'alice',
        chinese: '欢迎光临！请问您一共几位？想先品尝什么茶？',
        pinyin: 'Huānyíng guānglín! Qǐngwèn nín yīgòng jǐ wèi? Xiǎng xiān pǐncháng shénme chá?',
        vuk: 'Huan-jing guang-lin! Ćing-ven nin ji-gung đji vej? Sjang sjen pin-čang šen-me ča?',
        english: 'Welcome! May I ask how many of you in total? What tea would you like to savor first?',
        serbian: 'Dobrodošli! Koliko vas ima ukupno? Koji čaj biste želeli prvo da probate?',
        words: [
          { chinese: '欢迎光临', pinyin: 'huānyíng guānglín', vuk: 'huan-jing guang-lin', english: 'welcome!', serbian: 'dobrodošli!', category: 'phrase' },
          { chinese: '！', pinyin: '!', vuk: '!', english: '!', serbian: '!', category: 'phrase' },
          { chinese: '请问', pinyin: 'qǐngwèn', vuk: 'ćing-ven', english: 'may I ask', serbian: 'dozvolite da pitam', category: 'phrase' },
          { chinese: '您', pinyin: 'nín', vuk: 'nin', english: 'you (polite)', serbian: 'Vi (iz poštovanja)', category: 'pronoun' },
          { chinese: '一共', pinyin: 'yīgòng', vuk: 'ji-gung', english: 'altogether / in total', serbian: 'ukupno', category: 'adjective' },
          { chinese: '几位', pinyin: 'jǐ wèi', vuk: 'đji vej', english: 'how many people', serbian: 'koliko osoba', category: 'number' },
          { chinese: '？', pinyin: '?', vuk: '?', english: '?', serbian: '?', category: 'phrase' },
          { chinese: '想', pinyin: 'xiǎng', vuk: 'sjang', english: 'would like to', serbian: 'želite', category: 'verb' },
          { chinese: '先', pinyin: 'xiān', vuk: 'sjen', english: 'first', serbian: 'prvo', category: 'phrase' },
          { chinese: '品尝', pinyin: 'pǐncháng', vuk: 'pin-čang', english: 'taste / savor', serbian: 'probati / degustirati', category: 'verb' },
          { chinese: '什么', pinyin: 'shénme', vuk: 'šen-me', english: 'what', serbian: 'koji', category: 'pronoun' },
          { chinese: '茶', pinyin: 'chá', vuk: 'ča', english: 'tea', serbian: 'čaj', category: 'noun' },
          { chinese: '？', pinyin: '?', vuk: '?', english: '?', serbian: '?', category: 'phrase' }
        ],
        feedback: {
          pronunciationTip: '"品尝 (pǐncháng)" — savoring with presence. "pǐn" has 3rd tone, "cháng" has 2nd tone.',
          grammarAdvice: '"位 (wèi)" is the polite measure word for persons, replacing the colloquial "个 (gè)".',
          culturalNote: 'In traditional tea houses, hosts pour tea gently and guests tap two fingers on the table to express gratitude without interrupting speech.',
          hskTier: 'HSK 2 Spoken'
        },
        suggestedReplies: [
          {
            id: 'rep-d1-1',
            tag: 'positive',
            tagLabel: '🍃 Zeleni Čaj za Jednog',
            chinese: '你好，就我一个人。请给我来一壶西湖龙井绿茶。',
            pinyin: 'Nǐ hǎo, jiù wǒ yí gè rén. Qǐng gěi wǒ lái yì hú Xīhú Lóngjǐng lǜchá.',
            vuk: 'Ni hao, đju vo ji ge žen. Ćing gej vo laj ji hu Si-hu Lung-đjing li-ča.',
            english: 'Hello, just me alone. Please bring me a pot of West Lake Longjing green tea.',
            serbian: 'Zdravo, samo ja sam. Molim te donesi mi čajnik Longjing zelenog čaja sa Zapadnog jezera.',
            words: [
              { chinese: '你好', pinyin: 'nǐ hǎo', vuk: 'ni hao', english: 'hello', serbian: 'zdravo', category: 'phrase' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '就', pinyin: 'jiù', vuk: 'đju', english: 'just / only', serbian: 'samo', category: 'phrase' },
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '一个人', pinyin: 'yí gè rén', vuk: 'ji ge žen', english: 'one person', serbian: 'jedna osoba', category: 'noun' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' },
              { chinese: '请', pinyin: 'qǐng', vuk: 'ćing', english: 'please', serbian: 'molim', category: 'verb' },
              { chinese: '给', pinyin: 'gěi', vuk: 'gej', english: 'to / give', serbian: 'daj', category: 'verb' },
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'me', serbian: 'meni', category: 'pronoun' },
              { chinese: '来', pinyin: 'lái', vuk: 'laj', english: 'bring / serve', serbian: 'donesi', category: 'verb' },
              { chinese: '一壶', pinyin: 'yì hú', vuk: 'ji hu', english: 'one pot', serbian: 'jedan čajnik', category: 'number' },
              { chinese: '龙井', pinyin: 'Lóngjǐng', vuk: 'Lung-đjing', english: 'Longjing tea', serbian: 'Longjing (Zmajev izvor)', category: 'noun' },
              { chinese: '绿茶', pinyin: 'lǜchá', vuk: 'li-ča', english: 'green tea', serbian: 'zeleni čaj', category: 'noun' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          },
          {
            id: 'rep-d1-2',
            tag: 'curious',
            tagLabel: '🔍 Preporuka Kuće',
            chinese: '我们两位，请问您有什么招牌好茶推荐吗？',
            pinyin: 'Wǒmen liǎng wèi, qǐngwèn nín yǒu shénme zhāopái hǎo chá tuījiàn ma?',
            vuk: 'Vo-men ljang vej, ćing-ven nin jou šen-me džao-paj hao ča tuej-đjen ma?',
            english: 'Two of us, may I ask what signature fine tea you recommend?',
            serbian: 'Nas je dvoje, možete li nam preporučiti neki prepoznatljiv čaj kuće?',
            words: [
              { chinese: '我们', pinyin: 'wǒmen', vuk: 'vo-men', english: 'we', serbian: 'mi', category: 'pronoun' },
              { chinese: '两位', pinyin: 'liǎng wèi', vuk: 'ljang vej', english: 'two people (polite)', serbian: 'dvoje', category: 'number' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '请问', pinyin: 'qǐngwèn', vuk: 'ćing-ven', english: 'may I ask', serbian: 'dozvolite da pitam', category: 'phrase' },
              { chinese: '您', pinyin: 'nín', vuk: 'nin', english: 'you (polite)', serbian: 'Vi', category: 'pronoun' },
              { chinese: '有', pinyin: 'yǒu', vuk: 'jou', english: 'have', serbian: 'imate', category: 'verb' },
              { chinese: '什么', pinyin: 'shénme', vuk: 'šen-me', english: 'what', serbian: 'koji', category: 'pronoun' },
              { chinese: '招牌', pinyin: 'zhāopái', vuk: 'džao-paj', english: 'signature / flagship', serbian: 'specijalitet kuće', category: 'noun' },
              { chinese: '好茶', pinyin: 'hǎo chá', vuk: 'hao ča', english: 'good tea', serbian: 'dobar čaj', category: 'noun' },
              { chinese: '推荐', pinyin: 'tuījiàn', vuk: 'tuej-đjen', english: 'recommendation', serbian: 'preporučiti', category: 'verb' },
              { chinese: '吗', pinyin: 'ma', vuk: 'ma', english: 'question particle', serbian: 'li', category: 'particle' },
              { chinese: '？', pinyin: '?', vuk: '?', english: '?', serbian: '?', category: 'phrase' }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // SCENARIO 3: FITNESS & MINDFUL LIVING
  // ==========================================
  {
    id: 'sc-fitness',
    title: 'Fitness & Mindful Routine',
    titleSerbian: 'Sport, Trening i Oporavak',
    subtitle: 'Morning routines, running, yoga stretches, and heart rate balance.',
    emoji: '🏃',
    difficulty: 'Intermediate',
    turns: [
      {
        id: 'fit-q1',
        sender: 'alice',
        chinese: '早安！生命在于运动，身心在于平衡。你今天早晨锻炼了吗？',
        pinyin: 'Zǎo\'ān! Shēngmìng zàiyú yùndòng, shēnxīn zàiyú pínghéng. Nǐ jīntiān zǎochén duànliàn le ma?',
        vuk: 'Zao-an! Šeng-ming zaj-ji jin-dung, šen-sin zaj-ji ping-heng. Ni đjin-tjen zao-čen duan-ljen le ma?',
        english: 'Good morning! Life lies in motion, body and mind lie in balance. Did you exercise this morning?',
        serbian: 'Dobro jutro! Život je u kretanju, a telo i um u ravnoteži. Da li si vežbao jutros?',
        words: [
          { chinese: '早安', pinyin: 'zǎo\'ān', vuk: 'zao-an', english: 'good morning', serbian: 'dobro jutro', category: 'phrase' },
          { chinese: '！', pinyin: '!', vuk: '!', english: '!', serbian: '!', category: 'phrase' },
          { chinese: '生命', pinyin: 'shēngmìng', vuk: 'šeng-ming', english: 'life', serbian: 'život', category: 'noun' },
          { chinese: '在于', pinyin: 'zàiyú', vuk: 'zaj-ji', english: 'lies in', serbian: 'leži u', category: 'verb' },
          { chinese: '运动', pinyin: 'yùndòng', vuk: 'jin-dung', english: 'movement / sports', serbian: 'kretanju / sportu', category: 'noun' },
          { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
          { chinese: '身心', pinyin: 'shēnxīn', vuk: 'šen-sin', english: 'body and mind', serbian: 'telo i um', category: 'noun' },
          { chinese: '在于', pinyin: 'zàiyú', vuk: 'zaj-ji', english: 'lies in', serbian: 'leži u', category: 'verb' },
          { chinese: '平衡', pinyin: 'pínghéng', vuk: 'ping-heng', english: 'balance', serbian: 'ravnoteži', category: 'noun' },
          { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' },
          { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'ti', category: 'pronoun' },
          { chinese: '今天', pinyin: 'jīntiān', vuk: 'đjin-tjen', english: 'today', serbian: 'danas', category: 'noun' },
          { chinese: '早晨', pinyin: 'zǎochén', vuk: 'zao-čen', english: 'morning', serbian: 'jutros', category: 'noun' },
          { chinese: '锻炼', pinyin: 'duànliàn', vuk: 'duan-ljen', english: 'exercise / work out', serbian: 'vežbao', category: 'verb' },
          { chinese: '了', pinyin: 'le', vuk: 'le', english: 'completed action', serbian: 'rečca dovršenosti', category: 'particle' },
          { chinese: '吗', pinyin: 'ma', vuk: 'ma', english: 'question marker', serbian: 'li', category: 'particle' },
          { chinese: '？', pinyin: '?', vuk: '?', english: '?', serbian: '?', category: 'phrase' }
        ],
        feedback: {
          pronunciationTip: '"平衡 (pínghéng)" — both syllables are 2nd tone (rising). Feel the gentle upward lift of your voice.',
          grammarAdvice: '"生命在于运动" is a famous Chinese health maxim. "在于 (zàiyú)" means "to consist in / to lie in".',
          culturalNote: 'Traditional Chinese health theory (Yangsheng / 养生) balances vigorous activity (Yang) with quiet breathwork and meditation (Yin).',
          hskTier: 'HSK 3 Wellness'
        },
        suggestedReplies: [
          {
            id: 'rep-f1-1',
            tag: 'positive',
            tagLabel: '🏃 Trčanje od 5km',
            chinese: '我今天早晨跑步了五公里，感觉全身充满力量！',
            pinyin: 'Wǒ jīntiān zǎochén pǎobù le wǔ gōnglǐ, gǎnjué quánshēn chōngmǎn lìliang!',
            vuk: 'Vo đjin-tjen zao-čen pao-bu le vu gung-li, gan-đjüe ćüan-šen čung-man li-ljang!',
            english: 'I ran five kilometers this morning, feeling my whole body filled with power!',
            serbian: 'Jutros sam istrčao pet kilometara, osećam kako mi je celo telo puno snage!',
            words: [
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '今天', pinyin: 'jīntiān', vuk: 'đjin-tjen', english: 'today', serbian: 'danas', category: 'noun' },
              { chinese: '早晨', pinyin: 'zǎochén', vuk: 'zao-čen', english: 'morning', serbian: 'jutros', category: 'noun' },
              { chinese: '跑步', pinyin: 'pǎobù', vuk: 'pao-bu', english: 'ran', serbian: 'trčao', category: 'verb' },
              { chinese: '了', pinyin: 'le', vuk: 'le', english: 'completed action', serbian: 'dovršeno', category: 'particle' },
              { chinese: '五公里', pinyin: 'wǔ gōnglǐ', vuk: 'vu gung-li', english: 'five kilometers', serbian: 'pet kilometara', category: 'number' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '感觉', pinyin: 'gǎnjué', vuk: 'gan-đjüe', english: 'feel', serbian: 'osećam', category: 'verb' },
              { chinese: '全身', pinyin: 'quánshēn', vuk: 'ćüan-šen', english: 'whole body', serbian: 'celo telo', category: 'noun' },
              { chinese: '充满', pinyin: 'chōngmǎn', vuk: 'čung-man', english: 'full of', serbian: 'puno', category: 'verb' },
              { chinese: '力量', pinyin: 'lìliang', vuk: 'li-ljang', english: 'strength', serbian: 'snage', category: 'noun' },
              { chinese: '！', pinyin: '!', vuk: '!', english: '!', serbian: '!', category: 'phrase' }
            ]
          },
          {
            id: 'rep-f1-2',
            tag: 'stoic',
            tagLabel: '🧘 Joga & Dah',
            chinese: '我练习了三十分钟瑜伽和冥想呼吸，非常平静。',
            pinyin: 'Wǒ liànxí le sānshí fēnzhōng yújiā hé míngxiǎng hūxī, fēicháng píngjìng.',
            vuk: 'Vo ljen-si le san-ši fen-džung ji-đja he ming-sjang hu-si, fej-čang ping-đjing.',
            english: 'I practiced thirty minutes of yoga and meditation breathing, feeling very calm.',
            serbian: 'Vežbao sam trideset minuta jogu i meditativno disanje, osećam potpuni mir.',
            words: [
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'I', serbian: 'ja', category: 'pronoun' },
              { chinese: '练习', pinyin: 'liànxí', vuk: 'ljen-si', english: 'practiced', serbian: 'vežbao', category: 'verb' },
              { chinese: '了', pinyin: 'le', vuk: 'le', english: 'completed', serbian: 'dovršeno', category: 'particle' },
              { chinese: '三十分钟', pinyin: 'sānshí fēnzhōng', vuk: 'san-ši fen-džung', english: '30 minutes', serbian: 'trideset minuta', category: 'number' },
              { chinese: '瑜伽', pinyin: 'yújiā', vuk: 'ji-đja', english: 'yoga', serbian: 'jogu', category: 'noun' },
              { chinese: '和', pinyin: 'hé', vuk: 'he', english: 'and', serbian: 'i', category: 'phrase' },
              { chinese: '冥想', pinyin: 'míngxiǎng', vuk: 'ming-sjang', english: 'meditation', serbian: 'meditacija', category: 'noun' },
              { chinese: '呼吸', pinyin: 'hūxī', vuk: 'hu-si', english: 'breathing', serbian: 'disanje', category: 'noun' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '非常', pinyin: 'fēicháng', vuk: 'fej-čang', english: 'very', serbian: 'veoma', category: 'adjective' },
              { chinese: '平静', pinyin: 'píngjìng', vuk: 'ping-đjing', english: 'peaceful', serbian: 'miran', category: 'adjective' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // SCENARIO 4: CHINESE IDIOMS & ANCIENT WISDOM
  // ==========================================
  {
    id: 'sc-philosophy',
    title: 'Stoic Wisdom & Chengyu',
    titleSerbian: 'Mudrost, Čengji i Izreke',
    subtitle: 'Laozi, Confucius, and proverbs like 千里之行始于足下 (Journey of a thousand miles).',
    emoji: '📜',
    difficulty: 'Philosophical',
    turns: [
      {
        id: 'phil-q1',
        sender: 'alice',
        chinese: '老子说："千里之行，始于足下。" 你觉得在现代生活中，这句话对你有什么启发？',
        pinyin: 'Lǎozǐ shuō: "Qiān lǐ zhī xíng, shǐ yú zú xià." Nǐ juéde zài xiàndài shēnghuó zhōng, zhè jù huà duì nǐ yǒu shénme qǐfā?',
        vuk: 'Lao-ce šuo: "Ćjen li dž sing, ši ji cu sja." Ni đjüe-de zaj sjen-daj šeng-huo džung, dže đjü hua duej ni jou šen-me ći-fa?',
        english: 'Laozi said: "A journey of a thousand miles begins with a single step." In modern life, what inspiration does this quote bring you?',
        serbian: 'Lao Ce je rekao: "Put od hiljadu milja počinje jednim korakom." Šta ova rečenica tebi znači u modernom životu?',
        words: [
          { chinese: '老子', pinyin: 'Lǎozǐ', vuk: 'Lao-ce', english: 'Laozi (Daoist sage)', serbian: 'Lao Ce', category: 'noun' },
          { chinese: '说', pinyin: 'shuō', vuk: 'šuo', english: 'said', serbian: 'kaže', category: 'verb' },
          { chinese: '：', pinyin: ':', vuk: ':', english: ':', serbian: ':', category: 'phrase' },
          { chinese: '千里之行', pinyin: 'qiān lǐ zhī xíng', vuk: 'ćjen li dž sing', english: 'journey of 1000 li', serbian: 'put od hiljadu milja', category: 'idiom' },
          { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
          { chinese: '始于足下', pinyin: 'shǐ yú zú xià', vuk: 'ši ji cu sja', english: 'begins beneath feet', serbian: 'počinje ispod stopala', category: 'idiom' },
          { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' },
          { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'ti', category: 'pronoun' },
          { chinese: '觉得', pinyin: 'juéde', vuk: 'đjüe-de', english: 'feel / think', serbian: 'smatraš', category: 'verb' },
          { chinese: '在', pinyin: 'zài', vuk: 'zaj', english: 'in', serbian: 'u', category: 'phrase' },
          { chinese: '现代', pinyin: 'xiàndài', vuk: 'sjen-daj', english: 'modern', serbian: 'modernom', category: 'noun' },
          { chinese: '生活', pinyin: 'shēnghuó', vuk: 'šeng-huo', english: 'life', serbian: 'životu', category: 'noun' },
          { chinese: '中', pinyin: 'zhōng', vuk: 'džung', english: 'within', serbian: 'unutar', category: 'direction' },
          { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
          { chinese: '这', pinyin: 'zhè', vuk: 'dže', english: 'this', serbian: 'ova', category: 'pronoun' },
          { chinese: '句', pinyin: 'jù', vuk: 'đjü', english: 'measure word for sentences', serbian: 'rečca za rečenice', category: 'particle' },
          { chinese: '话', pinyin: 'huà', vuk: 'hua', english: 'words / saying', serbian: 'izreka', category: 'noun' },
          { chinese: '对', pinyin: 'duì', vuk: 'duej', english: 'towards', serbian: 'za', category: 'phrase' },
          { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'tebe', category: 'pronoun' },
          { chinese: '有', pinyin: 'yǒu', vuk: 'jou', english: 'has', serbian: 'ima', category: 'verb' },
          { chinese: '什么', pinyin: 'shénme', vuk: 'šen-me', english: 'what', serbian: 'kakvo', category: 'pronoun' },
          { chinese: '启发', pinyin: 'qǐfā', vuk: 'ći-fa', english: 'inspiration / enlightenment', serbian: 'nadahnuće', category: 'noun' },
          { chinese: '？', pinyin: '?', vuk: '?', english: '?', serbian: '?', category: 'phrase' }
        ],
        feedback: {
          pronunciationTip: '"始于 (shǐ yú)" — "shǐ" is retroflex (curl tongue back like English "sh" in "shoe") with 3rd tone.',
          grammarAdvice: '"对...有启发" is an elegant construction: "To bring inspiration towards someone".',
          culturalNote: 'Dao De Jing Chapter 64: the giant tree of nine arm-spans grows from a tiny sapling; the nine-story terrace starts from a basket of soil.',
          hskTier: 'HSK 4 Classical'
        },
        suggestedReplies: [
          {
            id: 'rep-p1-1',
            tag: 'stoic',
            tagLabel: '🏛️ Svakodnevna Disciplina',
            chinese: '它提醒我：任何伟大的目标都要靠每天脚踏实地的微小自律来完成。',
            pinyin: 'Tā tíxǐng wǒ: Rènhé wěidà de mùbiāo dōu yào kào měitiān jiǎotàshídì de wēixiǎo zìlǜ lái wánchéng.',
            vuk: 'Ta ti-sing vo: Žen-he vej-da de mu-bjao dou jao kao mej-tjen đjao-ta-ši-di de vej-sjao ce-li laj van-čeng.',
            english: 'It reminds me: any great goal relies on grounded, daily micro-discipline to be achieved.',
            serbian: 'To me podseća: svaki veliki cilj se postiže čvrstom, svakodnevnom mikro-disciplinom sa obe noge na zemlji.',
            words: [
              { chinese: '它', pinyin: 'tā', vuk: 'ta', english: 'it', serbian: 'to', category: 'pronoun' },
              { chinese: '提醒', pinyin: 'tíxǐng', vuk: 'ti-sing', english: 'reminds', serbian: 'podseća', category: 'verb' },
              { chinese: '我', pinyin: 'wǒ', vuk: 'vo', english: 'me', serbian: 'mene', category: 'pronoun' },
              { chinese: '：', pinyin: ':', vuk: ':', english: ':', serbian: ':', category: 'phrase' },
              { chinese: '任何', pinyin: 'rènhé', vuk: 'žen-he', english: 'any', serbian: 'svaki', category: 'adjective' },
              { chinese: '伟大', pinyin: 'wěidà', vuk: 'vej-da', english: 'great', serbian: 'veliki', category: 'adjective' },
              { chinese: '的', pinyin: 'de', vuk: 'de', english: 'possessive particle', serbian: 'od', category: 'particle' },
              { chinese: '目标', pinyin: 'mùbiāo', vuk: 'mu-bjao', english: 'goal', serbian: 'cilj', category: 'noun' },
              { chinese: '都', pinyin: 'dōu', vuk: 'dou', english: 'all', serbian: 'uvek', category: 'phrase' },
              { chinese: '要', pinyin: 'yào', vuk: 'jao', english: 'must', serbian: 'mora', category: 'verb' },
              { chinese: '靠', pinyin: 'kào', vuk: 'kao', english: 'rely on', serbian: 'osloniti se na', category: 'verb' },
              { chinese: '每天', pinyin: 'měitiān', vuk: 'mej-tjen', english: 'every day', serbian: 'svaki dan', category: 'noun' },
              { chinese: '脚踏实地', pinyin: 'jiǎotàshídì', vuk: 'đjao-ta-ši-di', english: 'grounded / down-to-earth', serbian: 'sa obe noge na zemlji', category: 'idiom' },
              { chinese: '的', pinyin: 'de', vuk: 'de', english: 'particle', serbian: 'rečca', category: 'particle' },
              { chinese: '微小', pinyin: 'wēixiǎo', vuk: 'vej-sjao', english: 'micro / small', serbian: 'male', category: 'adjective' },
              { chinese: '自律', pinyin: 'zìlǜ', vuk: 'ce-li', english: 'self-discipline', serbian: 'samodiscipline', category: 'noun' },
              { chinese: '来', pinyin: 'lái', vuk: 'laj', english: 'to', serbian: 'da bi', category: 'phrase' },
              { chinese: '完成', pinyin: 'wánchéng', vuk: 'van-čeng', english: 'complete', serbian: 'završio', category: 'verb' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          },
          {
            id: 'rep-p1-2',
            tag: 'positive',
            tagLabel: '💧 Tiha Voda Breg Roni',
            chinese: '就像"水滴石穿"一样，不要急于求成，耐心是最大的智慧。',
            pinyin: 'Jiù xiàng "shuǐ dī shí chuān" yíyàng, bú yào jí yú qiú chéng, nàixīn shì zuì dà de zhìhuì.',
            vuk: 'Đju sjang "šuej di ši čuan" ji-jang, bu jao đji ji ćju čeng, naj-sin ši zuej da de dži-huej.',
            english: 'Just like "water drops pierce stone", do not rush for quick success; patience is supreme wisdom.',
            serbian: 'Baš kao "tiha voda breg roni", ne treba srljati za brzim uspehom; strpljenje je najveća mudrost.',
            words: [
              { chinese: '就像', pinyin: 'jiù xiàng', vuk: 'đju sjang', english: 'just like', serbian: 'baš kao', category: 'phrase' },
              { chinese: '水滴石穿', pinyin: 'shuǐ dī shí chuān', vuk: 'šuej di ši čuan', english: 'water drops pierce stone', serbian: 'tiha voda breg roni', category: 'idiom' },
              { chinese: '一样', pinyin: 'yíyàng', vuk: 'ji-jang', english: 'the same', serbian: 'isto tako', category: 'adjective' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '不要', pinyin: 'bú yào', vuk: 'bu jao', english: 'do not', serbian: 'nemoj', category: 'phrase' },
              { chinese: '急于求成', pinyin: 'jí yú qiú chéng', vuk: 'đji ji ćju čeng', english: 'rush for quick results', serbian: 'srljati za brzim uspehom', category: 'idiom' },
              { chinese: '，', pinyin: ',', vuk: ',', english: ',', serbian: ',', category: 'phrase' },
              { chinese: '耐心', pinyin: 'nàixīn', vuk: 'naj-sin', english: 'patience', serbian: 'strpljenje', category: 'noun' },
              { chinese: '是', pinyin: 'shì', vuk: 'ši', english: 'is', serbian: 'je', category: 'verb' },
              { chinese: '最大', pinyin: 'zuì dà', vuk: 'zuej da', english: 'greatest', serbian: 'najveća', category: 'adjective' },
              { chinese: '的', pinyin: 'de', vuk: 'de', english: 'particle', serbian: 'od', category: 'particle' },
              { chinese: '智慧', pinyin: 'zhìhuì', vuk: 'dži-huej', english: 'wisdom', serbian: 'mudrost', category: 'noun' },
              { chinese: '。', pinyin: '.', vuk: '.', english: '.', serbian: '.', category: 'phrase' }
            ]
          }
        ]
      }
    ]
  }
];
