import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Trophy, 
  BookOpen, 
  Gamepad2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Copy, 
  Check,
  Zap,
  LayoutGrid,
  Wand2,
  Pencil,
  X,
  Save,
  RotateCcw,
  Sparkles,
  GripVertical,
  Trash2,
  RefreshCw,
  MoveLeft,
  MoveRight,
  Plus,
  Layers,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { CHINESE_VOCAB_EXPANDED, VocabItem, getChineseQuoteForItem } from '../data/chineseVocabData';

export type { VocabItem };

interface ChineseVocabViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  user: User | null;
}

const VOCAB_DATA: VocabItem[] = (() => {
  const seen = new Set<string>();
  const list: VocabItem[] = [];
  for (const item of CHINESE_VOCAB_EXPANDED) {
    const key = item.char.trim();
    if (!seen.has(key)) {
      seen.add(key);
      list.push(item);
    }
  }
  return list;
})();

const CONFIGURATOR_SUBJECTS = [
  { char: '我', pinyin: 'Wǒ', vuk: 'Vo', translationSr: 'Ja', translationEn: 'I' },
  { char: '你', pinyin: 'Nǐ', vuk: 'Ni', translationSr: 'Ti', translationEn: 'You' },
  { char: '他', pinyin: 'Tā', vuk: 'Ta', translationSr: 'On', translationEn: 'He' },
  { char: '她', pinyin: 'Tā', vuk: 'Ta', translationSr: 'Ona', translationEn: 'She' },
  { char: '我们', pinyin: 'Wǒmen', vuk: 'Vo men', translationSr: 'Mi', translationEn: 'We' },
  { char: '他们', pinyin: 'Tāmen', vuk: 'Ta men', translationSr: 'Oni', translationEn: 'They' },
];

export interface DndWordItem {
  id: string;
  char: string;
  pinyin: string;
  vuk: string;
  sr: string;
  en: string;
  type: 'pronoun' | 'verb' | 'noun' | 'adjective' | 'connector';
}

export const DND_CHINESE_WORDS: DndWordItem[] = [
  // Pronouns / Subjects
  { id: 'cn-p1', char: '我', pinyin: 'Wǒ', vuk: 'Vo', sr: 'Ja', en: 'I', type: 'pronoun' },
  { id: 'cn-p2', char: '你', pinyin: 'Nǐ', vuk: 'Ni', sr: 'Ti', en: 'You', type: 'pronoun' },
  { id: 'cn-p3', char: '他', pinyin: 'Tā', vuk: 'Ta', sr: 'On', en: 'He', type: 'pronoun' },
  { id: 'cn-p4', char: '她', pinyin: 'Tā', vuk: 'Ta', sr: 'Ona', en: 'She', type: 'pronoun' },
  { id: 'cn-p5', char: '我们', pinyin: 'Wǒmen', vuk: 'Vo men', sr: 'Mi', en: 'We', type: 'pronoun' },
  { id: 'cn-p6', char: '他们', pinyin: 'Tāmen', vuk: 'Ta men', sr: 'Oni', en: 'They', type: 'pronoun' },

  // Verbs
  { id: 'cn-v1', char: '思考', pinyin: 'sīkǎo', vuk: 'si kao', sr: 'promišljam', en: 'ponder / think', type: 'verb' },
  { id: 'cn-v2', char: '学', pinyin: 'xué', vuk: 'sjue', sr: 'učim', en: 'study / learn', type: 'verb' },
  { id: 'cn-v3', char: '喜欢', pinyin: 'xǐhuan', vuk: 'si huan', sr: 'volim', en: 'like', type: 'verb' },
  { id: 'cn-v4', char: '爱', pinyin: 'ài', vuk: 'ai', sr: 'volim (ljubav)', en: 'love', type: 'verb' },
  { id: 'cn-v5', char: '创造', pinyin: 'chuàngzào', vuk: 'čuang dzao', sr: 'stvaram', en: 'create', type: 'verb' },
  { id: 'cn-v6', char: '寻找', pinyin: 'xúnzhǎo', vuk: 'sun džao', sr: 'tražim', en: 'seek', type: 'verb' },
  { id: 'cn-v7', char: '听', pinyin: 'tīng', vuk: 'ting', sr: 'slušam', en: 'listen', type: 'verb' },
  { id: 'cn-v8', char: '看', pinyin: 'kàn', vuk: 'kan', sr: 'gledam', en: 'watch / see', type: 'verb' },
  { id: 'cn-v9', char: '写', pinyin: 'xiě', vuk: 'sje', sr: 'pišem', en: 'write', type: 'verb' },

  // Nouns
  { id: 'cn-n1', char: '智慧', pinyin: 'zhìhuì', vuk: 'dži hui', sr: 'mudrost', en: 'wisdom', type: 'noun' },
  { id: 'cn-n2', char: '真理', pinyin: 'zhēnlǐ', vuk: 'džen li', sr: 'istinu', en: 'truth', type: 'noun' },
  { id: 'cn-n3', char: '和平', pinyin: 'hépíng', vuk: 'he ping', sr: 'mir', en: 'peace', type: 'noun' },
  { id: 'cn-n4', char: '光明', pinyin: 'guāngmíng', vuk: 'guang ming', sr: 'svetlost', en: 'light', type: 'noun' },
  { id: 'cn-n5', char: '道', pinyin: 'dào', vuk: 'dao', sr: 'Put / Dao', en: 'the Way', type: 'noun' },
  { id: 'cn-n6', char: '力量', pinyin: 'lìliàng', vuk: 'li ljang', sr: 'snagu', en: 'strength', type: 'noun' },
  { id: 'cn-n7', char: '心', pinyin: 'xīn', vuk: 'sin', sr: 'srce / um', en: 'heart / mind', type: 'noun' },
  { id: 'cn-n8', char: '书', pinyin: 'shū', vuk: 'šu', sr: 'knjigu', en: 'book', type: 'noun' },

  // Adjectives
  { id: 'cn-a1', char: '酷', pinyin: 'kù', vuk: 'ku', sr: 'kul / super', en: 'cool', type: 'adjective' },
  { id: 'cn-a2', char: '有趣', pinyin: 'yǒuqù', vuk: 'jo ćjü', sr: 'zabavno', en: 'fun / interesting', type: 'adjective' },
  { id: 'cn-a3', char: '美', pinyin: 'měi', vuk: 'mei', sr: 'prelepo', en: 'beautiful', type: 'adjective' },
  { id: 'cn-a4', char: '棒', pinyin: 'bàng', vuk: 'bang', sr: 'fantastično', en: 'awesome', type: 'adjective' },
  { id: 'cn-a5', char: '好', pinyin: 'hǎo', vuk: 'hao', sr: 'dobro', en: 'good', type: 'adjective' },
  { id: 'cn-a6', char: '平静', pinyin: 'píngjìng', vuk: 'ping đjing', sr: 'spokojno', en: 'calm', type: 'adjective' },

  // Connectors
  { id: 'cn-c1', char: '的', pinyin: 'de', vuk: 'de', sr: '(prisvojna rečca)', en: "of / 's", type: 'connector' },
  { id: 'cn-c2', char: '和', pinyin: 'hé', vuk: 'he', sr: 'i / sa', en: 'and / with', type: 'connector' },
  { id: 'cn-c3', char: '很', pinyin: 'hěn', vuk: 'hen', sr: 'veoma / jako', en: 'very', type: 'connector' },
  { id: 'cn-c4', char: '也', pinyin: 'yě', vuk: 'je', sr: 'takođe', en: 'also', type: 'connector' },
];

const CONFIGURATOR_VERBS = [
  { char: '看', pinyin: 'kàn', vuk: 'kan', sr: { '我': 'gledam', '你': 'gledaš', '他们': 'gledaju' }, en: 'look at' },
  { char: '学', pinyin: 'xué', vuk: 'sjue', sr: { '我': 'učim', '你': 'učiš', '他们': 'uče' }, en: 'study' },
  { char: '喜欢', pinyin: 'xǐhuan', vuk: 'si huan', sr: { '我': 'volim', '你': 'voliš', '他们': 'vole' }, en: 'like' },
  { char: '思考', pinyin: 'sīkǎo', vuk: 'si kao', sr: { '我': 'promišljam o', '你': 'promišljaš o', '他们': 'promišljaju o' }, en: 'ponder' },
  { char: '听', pinyin: 'tīng', vuk: 'ting', sr: { '我': 'slušam', '你': 'slušaš', '他们': 'slušaju' }, en: 'listen to' },
  { char: '创造', pinyin: 'chuàngzào', vuk: 'čuang dzao', sr: { '我': 'stvaram', '你': 'stvaraš', '他们': 'stvaraju' }, en: 'create' },
  { char: '坚持', pinyin: 'jiānchí', vuk: 'đjien či', sr: { '我': 'istrajavam u', '你': 'istrajavaš u', '他们': 'istrajavaju u' }, en: 'persist in' },
  { char: '爱', pinyin: 'ài', vuk: 'ai', sr: { '我': 'volim', '你': 'voliš', '他们': 'vole' }, en: 'love' },
  { char: '寻找', pinyin: 'xúnzhǎo', vuk: 'sun džao', sr: { '我': 'tražim', '你': 'tražiš', '他们': 'traže' }, en: 'seek' },
  { char: '写', pinyin: 'xiě', vuk: 'sje', sr: { '我': 'pišem', '你': 'pišeš', '他们': 'pišu' }, en: 'write' },
];

const CONFIGURATOR_NOUNS = [
  { char: '智慧', pinyin: 'zhìhuì', vuk: 'dži hui', sr: 'mudrost', en: 'wisdom' },
  { char: '真理', pinyin: 'zhēnlǐ', vuk: 'džen li', sr: 'istinu', en: 'truth' },
  { char: '和平', pinyin: 'hépíng', vuk: 'he ping', sr: 'mir', en: 'peace' },
  { char: '光明', pinyin: 'guāngmíng', vuk: 'guang ming', sr: 'svetlost', en: 'light' },
  { char: '书', pinyin: 'shū', vuk: 'šu', sr: 'knjigu', en: 'book' },
  { char: '道', pinyin: 'dào', vuk: 'dao', sr: 'Put / Dao', en: 'the Way' },
  { char: '力量', pinyin: 'lìliàng', vuk: 'li ljang', sr: 'snagu', en: 'strength' },
  { char: '心', pinyin: 'xīn', vuk: 'sin', sr: 'srce / um', en: 'heart / mind' },
  { char: '希望', pinyin: 'xīwàng', vuk: 'si vang', sr: 'nadu', en: 'hope' },
  { char: '健康', pinyin: 'jiànkāng', vuk: 'đjen kang', sr: 'zdravlje', en: 'health' },
];

const CONFIGURATOR_ADJECTIVES = [
  { char: '酷', pinyin: 'kù', vuk: 'ku', sr: 'kul / super', en: 'cool' },
  { char: '有趣', pinyin: 'yǒuqù', vuk: 'jo ćjü', sr: 'zabavno', en: 'fun / interesting' },
  { char: '美', pinyin: 'měi', vuk: 'mei', sr: 'prelepo', en: 'beautiful' },
  { char: '棒', pinyin: 'bàng', vuk: 'bang', sr: 'sjajno / fantastično', en: 'awesome' },
  { char: '好', pinyin: 'hǎo', vuk: 'hao', sr: 'dobro / divno', en: 'good / wonderful' },
  { char: '智', pinyin: 'zhì', vuk: 'dži', sr: 'mudro', en: 'wise' },
  { char: '强', pinyin: 'qiáng', vuk: 'ćjiang', sr: 'snažno', en: 'strong' },
  { char: '平静', pinyin: 'píngjìng', vuk: 'ping đjing', sr: 'spokojno', en: 'calm' },
];

const SOCIAL_MEDIA_PRESETS = [
  {
    char: '我喜欢这个！',
    pinyin: 'Wǒ xǐhuan zhège!',
    vuk: 'Vo si huan dže ge!',
    sr: 'Ovo mi se sviđa!',
    en: 'I like this!',
    badge: '❤️ Popularno'
  },
  {
    char: '这个很酷！',
    pinyin: 'Zhège hěn kù!',
    vuk: 'Dže ge hen ku!',
    sr: 'Ovo je super kul!',
    en: 'This is cool!',
    tag: 'Trending',
    badge: '🔥 Kul'
  },
  {
    char: '这个很有趣！',
    pinyin: 'Zhège hěn yǒuqù!',
    vuk: 'Dže ge hen jo ćjü!',
    sr: 'Ovo je veoma zabavno!',
    en: 'This is fun!',
    badge: '🎉 Zabavno'
  },
  {
    char: '太棒了！',
    pinyin: 'Tài bàng le!',
    vuk: 'Tai bang le!',
    sr: 'Fantastično! / Prelepo!',
    en: 'This is awesome!',
    badge: '🌟 Top'
  },
  {
    char: '追求智慧与和平。',
    pinyin: 'Zhuīqiú zhìhuì yǔ hépíng.',
    vuk: 'Džui ćjiu dži hui ju he ping.',
    sr: 'Težim mudrosti i miru.',
    en: 'Seeking wisdom and peace.',
    badge: '📜 Stoički'
  },
  {
    char: '加油！',
    pinyin: 'Jiāyóu!',
    vuk: 'Đjia jou!',
    sr: 'Idemo napred! / Snaga!',
    en: 'Keep going! / Let\'s go!',
    badge: '⚡ Motivacija'
  }
];

export const ChineseVocabView: React.FC<ChineseVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'canvas' | 'weaver' | 'quiz'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Admin authorization for editing wise quotes and pronunciations (Petar)
  const isAdmin = user ? (user.email === 'petar.dekanovic@gmail.com' || user.email?.toLowerCase().includes('petar')) : true;

  // Custom quote & pronunciation overrides state
  const [customQuotes, setCustomQuotes] = useState<Record<string, { quote: string; translation: string }>>(() => {
    try {
      const saved = localStorage.getItem('wisefit_chinese_custom_quotes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [customPronunciations, setCustomPronunciations] = useState<Record<string, { pinyin?: string; vuk?: string; translation?: string; english?: string }>>(() => {
    try {
      const saved = localStorage.getItem('wisefit_chinese_custom_pronunciations');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<VocabItem | null>(null);
  const [editQuoteText, setEditQuoteText] = useState('');
  const [editQuoteTranslation, setEditQuoteTranslation] = useState('');
  const [editPinyin, setEditPinyin] = useState('');
  const [editVuk, setEditVuk] = useState('');
  const [editTranslation, setEditTranslation] = useState('');
  const [editEnglish, setEditEnglish] = useState('');

  const getItemQuote = (item: VocabItem) => {
    if (customQuotes[item.id]) return customQuotes[item.id];
    if (customQuotes[item.char]) return customQuotes[item.char];
    return getChineseQuoteForItem(item);
  };

  const getItemPinyin = (item: VocabItem) => {
    return customPronunciations[item.id]?.pinyin || item.pinyin;
  };

  const getItemVuk = (item: VocabItem) => {
    return customPronunciations[item.id]?.vuk || item.vuk;
  };

  const getItemTranslation = (item: VocabItem) => {
    return customPronunciations[item.id]?.translation || item.translation;
  };

  const getItemEnglish = (item: VocabItem) => {
    return customPronunciations[item.id]?.english || item.english;
  };

  const openEditModal = (item: VocabItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const qInfo = getItemQuote(item);
    setEditingItem(item);
    setEditQuoteText(qInfo.quote);
    setEditQuoteTranslation(qInfo.translation);
    setEditPinyin(getItemPinyin(item));
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
    localStorage.setItem('wisefit_chinese_custom_quotes', JSON.stringify(newQuotes));

    const newPronunciations = {
      ...customPronunciations,
      [editingItem.id]: {
        pinyin: editPinyin,
        vuk: editVuk,
        translation: editTranslation,
        english: editEnglish,
      }
    };
    setCustomPronunciations(newPronunciations);
    localStorage.setItem('wisefit_chinese_custom_pronunciations', JSON.stringify(newPronunciations));

    setEditingItem(null);
  };

  const handleResetEdit = () => {
    if (!editingItem) return;
    const newQuotes = { ...customQuotes };
    delete newQuotes[editingItem.id];
    delete newQuotes[editingItem.char];
    setCustomQuotes(newQuotes);
    localStorage.setItem('wisefit_chinese_custom_quotes', JSON.stringify(newQuotes));

    const newPronunciations = { ...customPronunciations };
    delete newPronunciations[editingItem.id];
    setCustomPronunciations(newPronunciations);
    localStorage.setItem('wisefit_chinese_custom_pronunciations', JSON.stringify(newPronunciations));

    setEditingItem(null);
  };

  // 3-Step Word Configurator State (I / You / They -> Verb -> Noun/Adjective OR Social Presets)
  const [cfgSubIdx, setCfgSubIdx] = useState(0);
  const [dndStageWords, setDndStageWords] = useState<DndWordItem[]>([]);
  const [dndFilter, setDndFilter] = useState<'all' | 'pronoun' | 'verb' | 'noun' | 'adjective' | 'connector'>('all');
  const [configTabMode, setConfigTabMode] = useState<'dnd' | 'dropdown'>('dnd');

  const handleDndAddWord = (item: DndWordItem) => {
    setDndStageWords(prev => [...prev, item]);
  };

  const handleDndRemoveWord = (index: number) => {
    setDndStageWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleDndMoveWord = (index: number, direction: 'left' | 'right') => {
    setDndStageWords(prev => {
      const next = [...prev];
      const targetIdx = direction === 'left' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleDndRandomize = () => {
    const pronouns = DND_CHINESE_WORDS.filter(w => w.type === 'pronoun');
    const verbs = DND_CHINESE_WORDS.filter(w => w.type === 'verb');
    const nouns = DND_CHINESE_WORDS.filter(w => w.type === 'noun');
    const adjs = DND_CHINESE_WORDS.filter(w => w.type === 'adjective');

    const randSub = pronouns[Math.floor(Math.random() * pronouns.length)];
    const randVerb = verbs[Math.floor(Math.random() * verbs.length)];
    const isNoun = Math.random() > 0.5;
    const randEnd = isNoun 
      ? nouns[Math.floor(Math.random() * nouns.length)] 
      : adjs[Math.floor(Math.random() * adjs.length)];

    setDndStageWords([randSub, randVerb, randEnd]);
  }; // '我'
  const [cfgVerbIdx, setCfgVerbIdx] = useState(3); // '思考'
  const [cfgEndingType, setCfgEndingType] = useState<'noun' | 'adjective'>('noun');
  const [cfgNounIdx, setCfgNounIdx] = useState(0); // '智慧'
  const [cfgAdjIdx, setCfgAdjIdx] = useState(0); // '酷'
  const [selectedSocialPresetIdx, setSelectedSocialPresetIdx] = useState<number | null>(null);
  const [copiedConfigSentence, setCopiedConfigSentence] = useState(false);

  const handleCopyConfigText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConfigSentence(true);
    setTimeout(() => setCopiedConfigSentence(false), 2000);
  };

  // Weaver
  const [selectedWeaverItems, setSelectedWeaverItems] = useState<VocabItem[]>([]);
  const [wovenSentence, setWovenSentence] = useState<{ chinese: string; pinyin: string; vuk: string; serbian: string } | null>(null);

  // Quiz
  const [quizStarted, setQuizStarted] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState<{
    vocab: VocabItem;
    options: string[];
    correctIndex: number;
    questionType: 'meaning' | 'vuk' | 'pinyin' | 'listen';
  }[]>([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Persistence
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [isPronouncing, setIsPronouncing] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const speakChineseAudioFallback = (text: string, id?: string) => {
    if (id) setIsPronouncing(id);
    const proxyUrl = `/api/tts-proxy?text=${encodeURIComponent(text)}&lang=zh-CN`;
    const fallbackDirectUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(text)}`;

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

  const speakChinese = (text: string, id?: string) => {
    if (id) setIsPronouncing(id);
    if (!('speechSynthesis' in window)) {
      speakChineseAudioFallback(text, id);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('zh') || 
        v.name.toLowerCase().includes('chinese') ||
        v.name.toLowerCase().includes('huihui') ||
        v.name.toLowerCase().includes('mandarin')
      );

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.85;

      if (zhVoice) {
        utterance.voice = zhVoice;
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
          speakChineseAudioFallback(text, id);
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
      speakChineseAudioFallback(text, id);
    }
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'progress', 'chinese');
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
        const localMastered = localStorage.getItem('wf_chinese_mastered');
        const localHighScore = localStorage.getItem('wf_chinese_highscore');
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
        const docRef = doc(db, 'users', user.uid, 'progress', 'chinese');
        await setDoc(docRef, {
          masteredIds: newMastered,
          highScore: Math.max(highScore, newHighScore),
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('wf_chinese_mastered', JSON.stringify(newMastered));
      localStorage.setItem('wf_chinese_highscore', Math.max(highScore, newHighScore).toString());
    }
  };

  const filteredVocab = useMemo(() => {
    return VOCAB_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        item.char.toLowerCase().includes(q) ||
        item.pinyin.toLowerCase().includes(q) ||
        item.vuk.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        (item.radical && item.radical.toLowerCase().includes(q));
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

  const handleCopy = (item: VocabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const quoteInfo = getItemQuote(item);
    const pinyinText = getItemPinyin(item);
    const vukText = getItemVuk(item);
    const translationText = getItemTranslation(item);
    const englishText = getItemEnglish(item);

    const quoteSection = quoteInfo 
      ? `\n\n📜 Izreka / Mudrost:\n${quoteInfo.quote}\n"${quoteInfo.translation}"` 
      : '';
    const textToCopy = `${item.emoji} ${item.char} [Pinyin: ${pinyinText}] (Vuk: "${vukText}")\n🇭🇷 Značenje: ${translationText}\n🇬🇧 English: ${englishText}${item.radical ? `\n🏮 Radikal: ${item.radical}` : ''}${quoteSection}\n\n✨ WiseFit Sanctuary Chinese #WiseFit #Hanzi`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      playSound('correct');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const generateQuizRound = () => {
    const shuffled = [...VOCAB_DATA].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
    const questionsList = selected.map(vocab => {
      const types: ('meaning' | 'vuk' | 'pinyin' | 'listen')[] = ['meaning', 'vuk', 'pinyin', 'listen'];
      const questionType = types[Math.floor(Math.random() * types.length)];
      
      const otherVocabs = VOCAB_DATA.filter(v => v.id !== vocab.id);
      const wrongShuffled = otherVocabs.sort(() => Math.random() - 0.5).slice(0, 3);
      
      let correctAnswer = '';
      let wrongAnswers: string[] = [];

      if (questionType === 'meaning') {
        correctAnswer = `${vocab.emoji} ${vocab.translation} (${vocab.english})`;
        wrongAnswers = wrongShuffled.map(w => `${w.emoji} ${w.translation} (${w.english})`);
      } else if (questionType === 'vuk') {
        correctAnswer = `Vuk: "${vocab.vuk}" [Pinyin: ${vocab.pinyin}]`;
        wrongAnswers = wrongShuffled.map(w => `Vuk: "${w.vuk}" [Pinyin: ${w.pinyin}]`);
      } else if (questionType === 'pinyin') {
        correctAnswer = `${vocab.char} — ${vocab.pinyin}`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} — ${w.pinyin}`);
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
      setTimeout(() => speakChinese(questionsList[0].vocab.char), 600);
    }
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    
    const currentQ = roundQuestions[questionIdx];
    const isCorrect = optionIndex === currentQ.correctIndex;
    
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
        setTimeout(() => speakChinese(roundQuestions[nextIdx].vocab.char), 400);
      }
    } else {
      setQuizComplete(true);
      playSound('complete');
    }
  };

  const handleToggleWeaverSelect = (item: VocabItem) => {
    if (selectedWeaverItems.find(i => i.id === item.id)) {
      setSelectedWeaverItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      if (selectedWeaverItems.length >= 3) return;
      setSelectedWeaverItems(prev => [...prev, item]);
    }
  };

  const weaveSentence = () => {
    if (selectedWeaverItems.length === 0) return;
    const wordsZh = selectedWeaverItems.map(i => i.char).join('');
    const wordsPy = selectedWeaverItems.map(i => i.pinyin).join(' ');
    const wordsVuk = selectedWeaverItems.map(i => i.vuk).join(' ');
    const wordsSer = selectedWeaverItems.map(i => i.translation.split('/')[0].trim()).join(', ');

    setWovenSentence({
      chinese: `在我的心中，我思考${wordsZh}`,
      pinyin: `Zài wǒ de xīn zhōng, wǒ sī kǎo ${wordsPy}`,
      vuk: `dzai vo de sin džong, vo si kao ${wordsVuk}`,
      serbian: `U mom srcu, promišljam o ${wordsSer} — putu do unutrašnjeg mira.`
    });
    speakChinese(`在我的心中，我思考${wordsZh}`);
  };

  const getRankInfo = (count: number) => {
    if (count >= 110) return { name: 'Kineski Mudrac (Shengren 圣人)', desc: 'Potpuno majstorstvo nad 135 visokonaponskih hanzi karaktera', icon: '👑' };
    if (count >= 70) return { name: 'Učenik Dao-a (Dashi 大师)', desc: 'Preko 70 usvojenih reči i stoik filozofskih pojmova', icon: '☯️' };
    if (count >= 35) return { name: 'Istraživač Hanzi-ja (Xuezhe 学者)', desc: 'Solidna baza svakodnevnog i poetičnog kineskog', icon: '🏮' };
    return { name: 'Početnik (Xinren 新人)', desc: 'Krenuli ste stazom usvajanja drevnih karaktera', icon: '🌱' };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
              🇨🇳 135 Odabranih Hanzi Karaktera
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Pinyin & Vuk Transliteracija
            </span>
          </div>
          <h2 className={cn(
            "text-2xl md:text-3xl font-black tracking-tight mt-2 flex items-center gap-2",
            isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-50" : "text-zinc-900"
          )}>
            Kineski Hanzi Rečnik & Stoic Filosofija (中文)
          </h2>
          <p className="text-xs md:text-sm font-medium text-zinc-400 mt-1">
            Naučite ključne reči, glagole i mudrosti uz Vuk Karadžić izgovor, pinyin i vizuelne radikale.
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-red-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-red-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-amber-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-red-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Duo Kviz
            </button>
          </div>

          <div className={cn(
            "px-3 py-1.5 rounded-xl flex items-center gap-2 border font-mono text-xs font-black",
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-red-400" : "bg-red-50 border-red-100 text-red-700"
          )}>
            <Trophy className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>{masteredIds.length}/{VOCAB_DATA.length}</span>
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
              isDarkMode ? "bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border-red-500/20" : "bg-gradient-to-r from-red-50 via-white to-red-50/50 border-red-100"
            )}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getRankInfo(masteredIds.length).icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-red-500 font-mono">Čin Hanzi Akademije:</span>
                    <span className="text-sm font-black tracking-tight">{getRankInfo(masteredIds.length).name}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{getRankInfo(masteredIds.length).desc}</p>
                </div>
              </div>
              <div className="text-right font-mono text-xs font-bold text-red-500">
                Savladano {Math.round((masteredIds.length / VOCAB_DATA.length) * 100)}% hanzi karaktera
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Pretraži karaktere, pinyin, radikal ili prevod..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all",
                    isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-red-500" : "bg-white border-zinc-200 text-zinc-900 focus:border-red-500"
                  )}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
                {[
                  { id: 'all', label: `Sve (${VOCAB_DATA.length})` },
                  { id: 'strofa_1', label: ' Strofa 1' },
                  { id: 'refren', label: ' Refren' },
                  { id: 'glagoli', label: ' Glagoli' },
                  { id: 'svakodnevno', label: ' Svakodnevno' },
                  { id: 'zdravlje', label: ' Zdravlje' },
                  { id: 'posao_tehnologija', label: ' Posao & Tehnologija' },
                  { id: 'hrana', label: ' Hrana' },
                  { id: 'vreme_brojevi', label: ' Vreme & Brojevi' },
                  { id: 'emocije', label: ' Emocije' },
                  { id: 'filozofija', label: ' Filozofija Stoik' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                      selectedCategory === cat.id
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
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
                        : (isDarkMode ? "bg-zinc-900/90 border-zinc-800/90 hover:border-red-500/50 shadow-md" : "bg-white border-zinc-200/90 hover:border-red-300 hover:shadow-md")
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
                            {item.radical && (
                              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                                Radikal: {item.radical}
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
                          <h3 className="text-4xl font-serif font-black text-red-600 dark:text-red-400 tracking-wide">
                            {item.char}
                          </h3>
                          <span className="text-xs font-mono font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            Pinyin: {getItemPinyin(item)}
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
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1 border border-amber-500/20"
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
                            <div className="text-[11px] leading-snug bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 p-2.5 rounded-xl flex items-start justify-between gap-2 mt-2">
                              <div className="flex items-start gap-2">
                                <span className="text-sm shrink-0">💡</span>
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-amber-900 dark:text-amber-200 tracking-wide font-serif">
                                    {quoteInfo.quote}
                                  </p>
                                  <p className="text-[10px] italic text-amber-700/90 dark:text-amber-300/80 font-sans">
                                    "{quoteInfo.translation}"
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {isAdmin && (
                                  <button
                                    onClick={(e) => openEditModal(item, e)}
                                    className="p-1.5 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 transition-all shrink-0 flex items-center gap-1"
                                    title="Uredi izreku i izgovor"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const qText = `📜 Izreka: ${quoteInfo.quote}\n"${quoteInfo.translation}"\n\n✨ WiseFit Sanctuary #WiseFit #ChineseQuote`;
                                    handleCopyConfigText(qText);
                                  }}
                                  className="p-1.5 rounded-lg text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 transition-all shrink-0 flex items-center gap-1"
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
                        onClick={() => speakChinese(item.char, item.id)}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
                          isSpeaking 
                            ? "bg-red-600 text-white border-red-600 animate-pulse" 
                            : isDarkMode ? "bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border-zinc-700" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200"
                        )}
                      >
                        <Volume2 className="w-4 h-4 text-red-500 dark:text-red-400" />
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
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
              🎨 <strong>Vizuelni Emodži Canvas:</strong> Brzo pamćenje karaktera uz visoko uočljive emodžije i radikale!
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredVocab.map(item => (
                <div
                  key={`canvas-${item.id}`}
                  onClick={() => speakChinese(item.char, item.id)}
                  className={cn(
                    "p-4 rounded-2xl border text-center flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-all",
                    isDarkMode ? "bg-zinc-900/60 border-zinc-800 hover:border-red-500/50" : "bg-white border-zinc-200 shadow-sm hover:border-red-300"
                  )}
                >
                  <span className="text-4xl my-2 filter drop-shadow-sm">{item.emoji}</span>
                  <div className="space-y-0.5 w-full">
                    <p className="text-2xl font-serif font-black text-red-500">{item.char}</p>
                    <p className="text-[10px] font-mono font-bold text-amber-500">{item.pinyin}</p>
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
            <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-amber-600/20 via-orange-500/20 to-amber-700/20 border border-amber-500/40 text-center space-y-1.5 shadow-lg">
              <p className="text-xl md:text-2xl font-black font-serif text-amber-400 tracking-wide flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                Learn language by creativity, that's the idea.
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </p>
              <p className="text-xs md:text-sm text-amber-200/90 font-medium italic">
                "Uči jezik kroz kreativnost, to je ideja." — Izaberite reči, prevucite ih i sklopite sopstvene rečenice!
              </p>
            </div>

            {/* CONFIGURATOR MODE SWITCHER TABS */}
            <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-zinc-900/80 border border-amber-500/30 max-w-md mx-auto">
              <button
                onClick={() => setConfigTabMode('dnd')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  configTabMode === 'dnd'
                    ? "bg-amber-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <GripVertical className="w-4 h-4" />
                <span>🎨 Drag & Drop Studio</span>
              </button>

              <button
                onClick={() => setConfigTabMode('dropdown')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                  configTabMode === 'dropdown'
                    ? "bg-amber-600 text-white shadow-md font-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <Sliders className="w-4 h-4" />
                <span>⚡ Izbor sa Menijem</span>
              </button>
            </div>

            {/* MODE 1: DRAG & DROP CREATIVE STUDIO */}
            {configTabMode === 'dnd' && (
              <div className="space-y-6">
                {/* WORD BANK PALETTE */}
                <div className={cn(
                  "p-5 rounded-3xl border space-y-4",
                  isDarkMode ? "bg-zinc-900/90 border-amber-500/40 shadow-xl" : "bg-white border-amber-300 shadow-md"
                )}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono">
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
                          key={`cat-${cat.id}`}
                          onClick={() => setDndFilter(cat.id as any)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg border font-bold transition-all",
                            dndFilter === cat.id
                              ? "bg-amber-600 text-white border-amber-500"
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
                    {DND_CHINESE_WORDS
                      .filter(w => dndFilter === 'all' || w.type === dndFilter)
                      .map(item => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', JSON.stringify(item));
                          }}
                          onClick={() => handleDndAddWord(item)}
                          className={cn(
                            "p-2.5 rounded-2xl border cursor-grab active:cursor-grabbing hover:scale-105 transition-all text-left group relative",
                            isDarkMode ? "bg-zinc-800/90 border-zinc-700 hover:border-amber-500/60 text-zinc-200" : "bg-amber-50/80 border-amber-200 hover:border-amber-400 text-zinc-800"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                              {item.type}
                            </span>
                            <GripVertical className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                          </div>
                          <p className="text-xl font-serif font-black text-amber-400 mt-1">{item.char}</p>
                          <p className="text-[10px] font-mono font-bold text-amber-200/80">{item.pinyin} ({item.vuk})</p>
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
                        const parsed = JSON.parse(data) as DndWordItem;
                        handleDndAddWord(parsed);
                      }
                    } catch (err) {
                      console.error('Drop parse error', err);
                    }
                  }}
                  className={cn(
                    "p-6 rounded-3xl border-2 border-dashed space-y-5 transition-all min-h-[160px] flex flex-col justify-center",
                    dndStageWords.length > 0
                      ? isDarkMode ? "bg-zinc-900/90 border-amber-500/60" : "bg-amber-500/10 border-amber-400"
                      : isDarkMode ? "bg-zinc-900/40 border-zinc-700 hover:border-amber-500/40" : "bg-zinc-50 border-zinc-300 hover:border-amber-300"
                  )}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono font-black uppercase text-amber-500 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Polje za Sklapanje (Prevucite ili Kliknite reči):</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDndRandomize}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>🎲 Nasumična Kreativna Rečenica</span>
                      </button>

                      {dndStageWords.length > 0 && (
                        <button
                          onClick={() => setDndStageWords([])}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Očisti</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stage Draggable Word Pills */}
                  {dndStageWords.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-sm font-medium text-zinc-400 italic">
                        "Learn language by creativity, that's the idea."
                      </p>
                      <p className="text-xs text-zinc-500">
                        Prevucite kartice iz banke iznad ili kliknite na njih da biste napravili svoju prvu rečenicu!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 p-2">
                      {dndStageWords.map((word, idx) => (
                        <motion.div
                          key={`stage-${word.id}-${idx}`}
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="px-3.5 py-2.5 rounded-2xl bg-amber-600 text-white shadow-md flex items-center gap-2 border border-amber-400 group"
                        >
                          <div className="text-left">
                            <p className="text-lg font-serif font-black leading-none">{word.char}</p>
                            <p className="text-[9px] font-mono opacity-90">{word.pinyin} ({word.vuk})</p>
                          </div>

                          <div className="flex items-center gap-0.5 ml-1 opacity-80 group-hover:opacity-100">
                            {idx > 0 && (
                              <button
                                onClick={() => handleDndMoveWord(idx, 'left')}
                                className="p-1 hover:bg-amber-700 rounded text-amber-200"
                                title="Pomeri levo"
                              >
                                <MoveLeft className="w-3 h-3" />
                              </button>
                            )}
                            {idx < dndStageWords.length - 1 && (
                              <button
                                onClick={() => handleDndMoveWord(idx, 'right')}
                                className="p-1 hover:bg-amber-700 rounded text-amber-200"
                                title="Pomeri desno"
                              >
                                <MoveRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDndRemoveWord(idx)}
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
                  {dndStageWords.length > 0 && (() => {
                    const fullChar = dndStageWords.map(w => w.char).join(' ');
                    const fullPinyin = dndStageWords.map(w => w.pinyin).join(' ');
                    const fullVuk = dndStageWords.map(w => w.vuk).join(' ');
                    const fullSr = dndStageWords.map(w => w.sr).join(' ') + '.';
                    const fullEn = dndStageWords.map(w => w.en).join(' ') + '.';
                    const shareText = `${fullChar} (${fullPinyin}) - "${fullSr}" #WiseFit #Chinese #LanguageByCreativity`;

                    return (
                      <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 space-y-3 mt-2 text-left">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                            <span>✨ Rezultat Vaše Stvorene Rečenice</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyConfigText(shareText)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border",
                                copiedConfigSentence
                                  ? "bg-emerald-600 text-white border-emerald-500"
                                  : "bg-amber-600/30 text-amber-200 border-amber-500/40 hover:bg-amber-600 hover:text-white"
                              )}
                            >
                              {copiedConfigSentence ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedConfigSentence ? "Kopirano!" : "Kopiraj za Social Media"}</span>
                            </button>

                            <button
                              onClick={() => speakChinese(fullChar)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Izgovori Rečenicu
                            </button>
                          </div>
                        </div>

                        <p className="text-3xl font-serif font-black text-amber-300 tracking-wide">
                          {fullChar}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                          <p className="text-amber-400 font-bold">
                            Pinyin: <span className="text-white">{fullPinyin}</span>
                          </p>
                          <p className="text-emerald-400 font-bold">
                            Vuk Transliteracija: <span className="text-white">"{fullVuk}"</span>
                          </p>
                        </div>

                        <div className="border-t pt-2 border-amber-500/20 text-xs space-y-0.5 font-sans">
                          <p className="text-amber-200 font-semibold">🇭🇷 Značenje: {fullSr}</p>
                          <p className="text-amber-300/80 text-[11px] italic">🇬🇧 English: {fullEn}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* MODE 2: GUIDED DROPDOWN & SELECTOR MODE */}
            {configTabMode === 'dropdown' && (
              <div className={cn(
                "p-6 rounded-3xl border space-y-6",
                isDarkMode ? "bg-zinc-900/90 border-amber-500/40 shadow-xl" : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-md"
              )}>
                <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3 border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-amber-500 animate-pulse" />
                    <h3 className="text-base font-black tracking-tight">Vodeći Konfigurator Rečenica (Padajući Meniji)</h3>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                    Sve Zamenice (I, You, They, We...)
                  </span>
                </div>

                {/* SOCIAL MEDIA QUICK PRESETS BAR */}
                <div className="space-y-2.5 bg-amber-500/10 dark:bg-amber-950/50 p-3.5 rounded-2xl border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono flex items-center gap-1.5">
                      <span>📲 Popularni Social Media Izrazi (Jedan klik za Facebook):</span>
                    </span>
                    {selectedSocialPresetIdx !== null && (
                      <button
                        onClick={() => setSelectedSocialPresetIdx(null)}
                        className="text-[10px] font-bold text-amber-500 hover:underline"
                      >
                        Poništi Preset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SOCIAL_MEDIA_PRESETS.map((preset, idx) => (
                      <button
                        key={`sm-${idx}`}
                        onClick={() => setSelectedSocialPresetIdx(idx)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                          selectedSocialPresetIdx === idx
                            ? "bg-amber-600 text-white border-amber-400 shadow-md scale-[1.02]"
                            : isDarkMode ? "bg-zinc-800/90 border-zinc-700 text-zinc-300 hover:border-amber-500/50" : "bg-white border-amber-200 text-zinc-800 hover:bg-amber-100/60"
                        )}
                      >
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-black">{preset.badge}</span>
                        <span className="font-serif font-black">{preset.char}</span>
                        <span className="text-[10px] opacity-75 font-normal">({preset.sr})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 1: SUBJECT WITH DROPDOWN OR BUTTONS */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-mono">
                      <span>1. Subjekat / Zamenica:</span>
                      <span className="text-[10px] font-normal opacity-80">(Ja, Ti, On, Ona, Mi, Oni)</span>
                    </label>

                    {/* Dropdown Selector for Subjects */}
                    <select
                      value={cfgSubIdx}
                      onChange={(e) => {
                        setCfgSubIdx(Number(e.target.value));
                        setSelectedSocialPresetIdx(null);
                      }}
                      className="text-xs font-bold bg-zinc-800 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl"
                    >
                      {CONFIGURATOR_SUBJECTS.map((sub, idx) => (
                        <option key={`sub-opt-${idx}`} value={idx}>
                          {sub.char} [{sub.pinyin}] - {sub.translationSr} / {sub.translationEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {CONFIGURATOR_SUBJECTS.map((sub, idx) => (
                      <button
                        key={`sub-${idx}`}
                        onClick={() => { setCfgSubIdx(idx); setSelectedSocialPresetIdx(null); }}
                        className={cn(
                          "p-2.5 rounded-2xl border transition-all text-center",
                          selectedSocialPresetIdx === null && cfgSubIdx === idx
                            ? "bg-amber-600 text-white border-amber-500 shadow-md scale-[1.02]"
                            : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-amber-500/50" : "bg-white border-amber-200 text-zinc-800 hover:bg-amber-100/50"
                        )}
                      >
                        <p className="text-lg font-serif font-black">{sub.char}</p>
                        <p className="text-[9px] font-mono opacity-90">{sub.pinyin}</p>
                        <p className="text-[10px] font-bold mt-0.5">{sub.translationSr}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 2: VERB WITH DROPDOWN */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-mono">
                      <span>2. Glagol:</span>
                    </label>

                    <select
                      value={cfgVerbIdx}
                      onChange={(e) => {
                        setCfgVerbIdx(Number(e.target.value));
                        setSelectedSocialPresetIdx(null);
                      }}
                      className="text-xs font-bold bg-zinc-800 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl"
                    >
                      {CONFIGURATOR_VERBS.map((v, idx) => (
                        <option key={`v-opt-${idx}`} value={idx}>
                          {v.char} [{v.pinyin}] - {v.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CONFIGURATOR_VERBS.map((v, idx) => (
                      <button
                        key={`verb-${idx}`}
                        onClick={() => { setCfgVerbIdx(idx); setSelectedSocialPresetIdx(null); }}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                          selectedSocialPresetIdx === null && cfgVerbIdx === idx
                            ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                            : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-amber-500/40" : "bg-white border-amber-200 text-zinc-700 hover:bg-amber-100/50"
                        )}
                      >
                        <span className="font-serif text-sm font-black">{v.char}</span>
                        <span className="text-[10px] opacity-80 font-mono">[{v.pinyin}]</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 3: NOUN OR ADJECTIVE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-mono">
                      <span>3. Kraj Rečenice (Imenica ili Pridev):</span>
                    </label>

                    <div className="flex bg-amber-500/20 p-0.5 rounded-lg border border-amber-500/30 font-mono text-[10px]">
                      <button
                        onClick={() => setCfgEndingType('noun')}
                        className={cn("px-2.5 py-1 rounded-md font-bold transition-all", cfgEndingType === 'noun' ? "bg-amber-600 text-white shadow" : "text-amber-400 hover:text-white")}
                      >
                        Imenice
                      </button>
                      <button
                        onClick={() => setCfgEndingType('adjective')}
                        className={cn("px-2.5 py-1 rounded-md font-bold transition-all", cfgEndingType === 'adjective' ? "bg-amber-600 text-white shadow" : "text-amber-400 hover:text-white")}
                      >
                        Pridevi ✨
                      </button>
                    </div>
                  </div>

                  {cfgEndingType === 'noun' ? (
                    <div className="flex flex-wrap gap-2">
                      {CONFIGURATOR_NOUNS.map((n, idx) => (
                        <button
                          key={`noun-${idx}`}
                          onClick={() => { setCfgNounIdx(idx); setSelectedSocialPresetIdx(null); }}
                          className={cn(
                            "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                            selectedSocialPresetIdx === null && cfgNounIdx === idx
                              ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                              : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-amber-500/40" : "bg-white border-amber-200 text-zinc-700 hover:bg-amber-100/50"
                          )}
                        >
                          <span className="font-serif text-sm font-black">{n.char}</span>
                          <span className="text-[10px] opacity-80 font-mono">({n.sr})</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {CONFIGURATOR_ADJECTIVES.map((adj, idx) => (
                        <button
                          key={`adj-${idx}`}
                          onClick={() => { setCfgAdjIdx(idx); setSelectedSocialPresetIdx(null); }}
                          className={cn(
                            "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                            selectedSocialPresetIdx === null && cfgAdjIdx === idx
                              ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                              : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-amber-500/40" : "bg-white border-amber-200 text-amber-800 hover:bg-amber-100/50"
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
                  let sentencePinyin = '';
                  let sentenceVuk = '';
                  let sentenceSr = '';
                  let sentenceEn = '';

                  if (selectedSocialPresetIdx !== null) {
                    const preset = SOCIAL_MEDIA_PRESETS[selectedSocialPresetIdx];
                    sentenceChar = preset.char;
                    sentencePinyin = preset.pinyin;
                    sentenceVuk = preset.vuk;
                    sentenceSr = preset.sr;
                    sentenceEn = preset.en;
                  } else {
                    const sub = CONFIGURATOR_SUBJECTS[cfgSubIdx];
                    const verb = CONFIGURATOR_VERBS[cfgVerbIdx];
                    const verbSr = (verb.sr as any)[sub.char] || verb.sr['我'] || 'radi';

                    if (cfgEndingType === 'noun') {
                      const noun = CONFIGURATOR_NOUNS[cfgNounIdx];
                      sentenceChar = `${sub.char} ${verb.char} ${noun.char}`;
                      sentencePinyin = `${sub.pinyin} ${verb.pinyin} ${noun.pinyin}`;
                      sentenceVuk = `${sub.vuk} ${verb.vuk} ${noun.vuk}`;
                      sentenceSr = `${sub.translationSr} ${verbSr} ${noun.sr}.`;
                      sentenceEn = `${sub.translationEn} ${verb.en} ${noun.en}.`;
                    } else {
                      const adj = CONFIGURATOR_ADJECTIVES[cfgAdjIdx];
                      sentenceChar = `${sub.char} ${verb.char} ${adj.char}`;
                      sentencePinyin = `${sub.pinyin} ${verb.pinyin} ${adj.pinyin}`;
                      sentenceVuk = `${sub.vuk} ${verb.vuk} ${adj.vuk}`;
                      sentenceSr = `${sub.translationSr} ${verbSr} ${adj.sr}.`;
                      sentenceEn = `${sub.translationEn} ${verb.en} ${adj.en}.`;
                    }
                  }

                  const socialShareText = `${sentenceChar} (${sentencePinyin}) - "${sentenceSr}" #WiseFit #Chinese #Stoic`;

                  return (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-3 mt-4 text-left">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                          <span>✨ Sklopljena Kineska Rečenica</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyConfigText(socialShareText)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border",
                              copiedConfigSentence
                                ? "bg-emerald-600 text-white border-emerald-500"
                                : "bg-amber-600/30 text-amber-200 border-amber-500/40 hover:bg-amber-600 hover:text-white"
                            )}
                          >
                            {copiedConfigSentence ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedConfigSentence ? "Kopirano!" : "Kopiraj za Social Media"}</span>
                          </button>

                          <button
                            onClick={() => speakChinese(sentenceChar)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Volume2 className="w-3.5 h-3.5" /> Izgovori
                          </button>
                        </div>
                      </div>

                      <p className="text-3xl font-serif font-black text-amber-300 tracking-wide">
                        {sentenceChar}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                        <p className="text-amber-400 font-bold">
                          Pinyin: <span className="text-white">{sentencePinyin}</span>
                        </p>
                        <p className="text-emerald-400 font-bold">
                          Vuk: <span className="text-white">"{sentenceVuk}"</span>
                        </p>
                      </div>

                      <div className="border-t pt-2 border-amber-500/20 text-xs space-y-0.5 font-sans">
                        <p className="text-amber-200 font-semibold">🇭🇷 {sentenceSr}</p>
                        <p className="text-amber-300/80 text-[11px] italic">🇬🇧 {sentenceEn}</p>
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
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  🏮
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-black tracking-tight">Kineski Hanzi Duo Kviz Arena</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Testirajte svoje znanje drevnih hanzi karaktera, pinyina i Vuk Karadžić transliteracije kroz 5 brzih i izazovnih pitanja.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto font-mono text-xs">
                  <div className={cn("p-3 rounded-2xl border", isDarkMode ? "bg-zinc-800/40 border-zinc-700/50" : "bg-zinc-50 border-zinc-200")}>
                    <p className="text-[10px] text-zinc-400">Najbolji Skor</p>
                    <p className="text-base font-black text-amber-400">{highScore} pts</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl border", isDarkMode ? "bg-zinc-800/40 border-zinc-700/50" : "bg-zinc-50 border-zinc-200")}>
                    <p className="text-[10px] text-zinc-400">Savladano</p>
                    <p className="text-base font-black text-emerald-400">{masteredIds.length}/{VOCAB_DATA.length}</p>
                  </div>
                  <div className={cn("p-3 rounded-2xl border", isDarkMode ? "bg-zinc-800/40 border-zinc-700/50" : "bg-zinc-50 border-zinc-200")}>
                    <p className="text-[10px] text-zinc-400">Životi</p>
                    <p className="text-base font-black text-red-400">3 ❤️</p>
                  </div>
                </div>
                <button
                  onClick={generateQuizRound}
                  className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
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
                  <div className="text-red-500">
                    Pitanje {questionIdx + 1} / {roundQuestions.length}
                  </div>
                  <div className="text-emerald-500">
                    Poeni: {score}
                  </div>
                </div>

                {/* Question */}
                <div className="text-center space-y-3 my-4">
                  <span className="text-5xl">{roundQuestions[questionIdx].vocab.emoji}</span>
                  <h3 className="text-4xl font-serif font-black text-red-500">
                    {roundQuestions[questionIdx].vocab.char}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-3 text-xs font-mono">
                    <span className="text-amber-500 font-bold">Pinyin: {getItemPinyin(roundQuestions[questionIdx].vocab)}</span>
                    <span className="text-emerald-500 font-bold">Vuk: "{getItemVuk(roundQuestions[questionIdx].vocab)}"</span>
                  </div>

                  {/* Wise Quote Box in Quiz */}
                  {(() => {
                    const qItem = roundQuestions[questionIdx].vocab;
                    const quoteInfo = getItemQuote(qItem);
                    return (
                      <div className="text-[11px] leading-snug bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 p-3 rounded-2xl flex items-start justify-between gap-2 max-w-lg mx-auto text-left mt-2">
                        <div className="flex items-start gap-2">
                          <span className="text-sm shrink-0">📜</span>
                          <div className="space-y-0.5">
                            <p className="font-semibold text-amber-900 dark:text-amber-200 tracking-wide font-serif">
                              {quoteInfo.quote}
                            </p>
                            <p className="text-[10px] italic text-amber-700/90 dark:text-amber-300/80 font-sans">
                              "{quoteInfo.translation}"
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={(e) => openEditModal(qItem, e)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 transition-all shrink-0 flex items-center gap-1 border border-amber-500/30 shadow-xs"
                            title="Uredi izreku i izgovor (Petar / Admin)"
                          >
                            <Pencil className="w-3 h-3 text-amber-500" /> Uredi
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => speakChinese(roundQuestions[questionIdx].vocab.char)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 inline-flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Pusti Zvuk
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => openEditModal(roundQuestions[questionIdx].vocab, e)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 inline-flex items-center gap-1.5 border border-amber-500/20"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Uredi Kviz Izreku & Izgovor
                      </button>
                    )}
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
                          !isAnswered && (isDarkMode ? "bg-zinc-800/60 border-zinc-700 hover:border-red-500" : "bg-zinc-50 border-zinc-200 hover:border-red-400"),
                          isAnswered && isCorrect && "bg-emerald-500 text-white border-emerald-500",
                          isAnswered && isSelected && !isCorrect && "bg-red-500 text-white border-red-500"
                        )}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500 transition-all"
                    >
                      Sledeće Pitanje →
                    </button>
                  </div>
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
                  <p className="text-xs text-zinc-400">Uspešno ste testirali vaše kinesko hanzi znanje.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 inline-block font-mono text-sm font-black text-emerald-400">
                  Ostvaren Rezultat: {score} Poena
                </div>
                <div>
                  <button
                    onClick={generateQuizRound}
                    className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20"
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
                isDarkMode ? "bg-zinc-900 border-amber-500/40 text-zinc-100" : "bg-white border-amber-200 text-zinc-900"
              )}
            >
              <div className="flex items-center justify-between border-b pb-3 border-amber-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{editingItem.emoji}</span>
                  <div>
                    <h3 className="text-lg font-serif font-black text-amber-500 flex items-center gap-2">
                      <span>Uredi Izreku & Izgovor</span>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Petar / Admin</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-serif">Karakter: {editingItem.char}</p>
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
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                  <h4 className="font-mono font-bold uppercase tracking-wider text-amber-500 text-[11px] flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Revision Izgovora (Pinyin & Vuk Transliteracija)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-600 dark:text-amber-300 font-mono">Pinyin Izgovor:</label>
                      <input
                        type="text"
                        value={editPinyin}
                        onChange={(e) => setEditPinyin(e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500",
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
                          "w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500",
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
                          "w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500",
                          isDarkMode ? "bg-zinc-800 border-zinc-700 text-white" : "bg-white border-zinc-300 text-zinc-900"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* WISE QUOTE REVISION */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <h4 className="font-mono font-bold uppercase tracking-wider text-amber-500 text-[11px] flex items-center gap-1.5">
                    📜 Wise Quote / Mudra Izreka u Kvizu
                  </h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-600 dark:text-amber-300 font-mono">Mudra Izreka (Kineski / Citati):</label>
                    <textarea
                      rows={2}
                      value={editQuoteText}
                      onChange={(e) => setEditQuoteText(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl border text-xs font-serif font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-amber-200" : "bg-white border-zinc-300 text-zinc-900"
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-600 dark:text-amber-300 font-mono">Prevod i Značenje Izreke:</label>
                    <textarea
                      rows={2}
                      value={editQuoteTranslation}
                      onChange={(e) => setEditQuoteTranslation(e.target.value)}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl border text-xs italic focus:outline-none focus:ring-2 focus:ring-amber-500",
                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-amber-100" : "bg-white border-zinc-300 text-zinc-900"
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
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
                    className="px-5 py-2 rounded-xl text-xs font-black bg-amber-600 text-white hover:bg-amber-500 transition-all shadow-md flex items-center gap-1.5"
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
