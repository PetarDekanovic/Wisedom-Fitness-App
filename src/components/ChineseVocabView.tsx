import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Trophy, 
  BookOpen, 
  Award, 
  Gamepad2, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Flame, 
  RotateCcw, 
  Heart,
  ChevronRight,
  RefreshCw,
  Search,
  BookMarked,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface ChineseVocabViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  user: User | null;
}

interface VocabItem {
  id: string;
  char: string;
  pinyin: string;
  vuk: string;
  translation: string;
  emoji: string;
  category: 'strofa_1' | 'refren' | 'glagoli' | 'svakodnevno';
  categoryLabel: string;
}

const ENGLISH_TRANSLATIONS: Record<string, string> = {
  '深处': 'Deep place / Abyss',
  '在': 'At / In / On',
  '我的': 'My / Mine',
  '心': 'Heart',
  '火': 'Fire',
  '燃烧': 'Burn / Ignite',
  '燃烧的': 'Burning / Fiery',
  '你': 'You',
  '听': 'Listen / Hear',
  '声音': 'Voice / Sound',
  '风': 'Wind',
  '呼唤': 'Call / Summon',
  '爱': 'Love',
  '是': 'Is / To be',
  '光': 'Light',
  '永远': 'Forever / Always',
  '不': 'No / Not',
  '熄灭': 'Extinguish / Go out',
  '灵魂': 'Soul / Spirit',
  '飞翔': 'Fly / Soar',
  '天空': 'Sky',
  '星辰': 'Stars / Constellations',
  '照亮': 'Illuminate / Light up',
  '路': 'Road / Path',
  '看': 'Look / See / Watch',
  '吃': 'Eat',
  '喝': 'Drink',
  '走': 'Walk / Go',
  '跑': 'Run',
  '笑': 'Laugh / Smile',
  '哭': 'Cry / Weep',
  '说': 'Speak / Say / Talk',
  '想': 'Think / Want / Miss',
  '做': 'Do / Make',
  '有': 'Have / Exist',
  '去': 'Go / Leave',
  '买': 'Buy',
  '卖': 'Sell',
  '学': 'Learn / Study',
  '写': 'Write',
  '读': 'Read / Study',
  '坐': 'Sit',
  '站': 'Stand',
  '睡': 'Sleep',
  '懂': 'Understand / Comprehend',
  '问': 'Ask',
  '答': 'Answer / Reply',
  '开': 'Open / Start / Drive',
  '关': 'Close / Turn off',
  '喜欢': 'Like / Enjoy / Love',
  '家': 'Home / Family',
  '朋友': 'Friend',
  '水': 'Water',
  '山': 'Mountain',
  '日月': 'Sun and Moon / Day and Month',
  '书': 'Book',
  '今天': 'Today',
  '时间': 'Time',
  '力量': 'Power / Strength',
  '智慧': 'Wisdom',
  '健康': 'Health',
  '平息': 'Peace / Tranquility / Calm down',
  '谢谢': 'Thank you',
  '再见': 'Goodbye',
  '日': 'Day / Sun',
  '月': 'Month / Moon',
  '人': 'Person / Human / People',
  '茶': 'Tea',
  '咖啡': 'Coffee',
  '苹果': 'Apple',
  '米饭': 'Cooked Rice / Meal',
  '猫': 'Cat',
  '狗': 'Dog',
  '鱼': 'Fish',
  '钱': 'Money',
  '车': 'Car / Vehicle',
  '手': 'Hand',
  '头': 'Head',
  '眼睛': 'Eyes',
  '耳朵': 'Ears',
  '衣服': 'Clothes / Clothing',
  '学校': 'School',
  '老师': 'Teacher',
  '学生': 'Student'
};

// 84 premium words/verbs with Emojis & Vuk Karadžić phonetic spelling
const VOCAB_DATA: VocabItem[] = [
  // Strofa 1
  { id: '1', char: '深处', pinyin: 'shēn chù', vuk: 'šen ču', translation: 'Duboko u', emoji: '🌌', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '2', char: '在', pinyin: 'zài', vuk: 'dzai', translation: 'U / Na', emoji: '📍', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '3', char: '我的', pinyin: 'wǒ de', vuk: 'vo de', translation: 'Moj', emoji: '👤', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '4', char: '心', pinyin: 'xīn', vuk: 'sin', translation: 'Srce', emoji: '❤️', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '5', char: '火', pinyin: 'huǒ', vuk: 'huo', translation: 'Vatra', emoji: '🔥', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '6', char: '燃烧', pinyin: 'rán shāo', vuk: 'ran šao', translation: 'Sagorevati / Goreti', emoji: '☄️', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '7', char: '燃烧的', pinyin: 'rán shāo de', vuk: 'ran šao de', translation: 'Goruće / Što gori', emoji: '⚡', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '8', char: '你', pinyin: 'nǐ', vuk: 'ni', translation: 'Ti', emoji: '🫵', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '9', char: '听', pinyin: 'tīng', vuk: 'ting', translation: 'Slušaj', emoji: '👂', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '10', char: '声音', pinyin: 'shēng yīn', vuk: 'šeng in', translation: 'Glas / Zvuk', emoji: '🔊', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '11', char: '风', pinyin: 'fēng', vuk: 'feng', translation: 'Vetar', emoji: '💨', category: 'strofa_1', categoryLabel: 'Strofa 1' },
  { id: '12', char: '呼唤', pinyin: 'hū huàn', vuk: 'hu huan', translation: 'Doziva / Zove', emoji: '🗣️', category: 'strofa_1', categoryLabel: 'Strofa 1' },

  // Refren
  { id: '13', char: '爱', pinyin: 'ài', vuk: 'ai', translation: 'Ljubav', emoji: '💖', category: 'refren', categoryLabel: 'Refren' },
  { id: '14', char: '是', pinyin: 'shì', vuk: 'ši', translation: 'Jeste / Biti', emoji: '🧬', category: 'refren', categoryLabel: 'Refren' },
  { id: '15', char: '光', pinyin: 'guāng', vuk: 'guang', translation: 'Svetlost', emoji: '✨', category: 'refren', categoryLabel: 'Refren' },
  { id: '16', char: '永远', pinyin: 'yǒng yuǎn', vuk: 'jong jien', translation: 'Zauvek', emoji: '♾️', category: 'refren', categoryLabel: 'Refren' },
  { id: '17', char: '不', pinyin: 'bù', vuk: 'bu', translation: 'Ne', emoji: '❌', category: 'refren', categoryLabel: 'Refren' },
  { id: '18', char: '熄灭', pinyin: 'xī miè', vuk: 'sju mje', translation: 'Ugasiti se / Gasiti', emoji: '🧯', category: 'refren', categoryLabel: 'Refren' },
  { id: '19', char: '灵魂', pinyin: 'líng hún', vuk: 'ling hun', translation: 'Duša', emoji: '👼', category: 'refren', categoryLabel: 'Refren' },
  { id: '20', char: '飞翔', pinyin: 'fēi xiáng', vuk: 'fej sjang', translation: 'Leteti', emoji: '🦅', category: 'refren', categoryLabel: 'Refren' },
  { id: '21', char: '天空', pinyin: 'tiān kōng', vuk: 'tjen kong', translation: 'Nebo', emoji: '☁️', category: 'refren', categoryLabel: 'Refren' },
  { id: '22', char: '星辰', pinyin: 'xīng chén', vuk: 'sing čen', translation: 'Zvezde', emoji: '🌟', category: 'refren', categoryLabel: 'Refren' },
  { id: '23', char: '照亮', pinyin: 'zhào liàng', vuk: 'džao ljang', translation: 'Obasjati / Svetliti', emoji: '💡', category: 'refren', categoryLabel: 'Refren' },
  { id: '24', char: '路', pinyin: 'lù', vuk: 'lu', translation: 'Put / Staza', emoji: '🛣️', category: 'refren', categoryLabel: 'Refren' },

  // Glagoli
  { id: '25', char: '看', pinyin: 'kàn', vuk: 'kan', translation: 'Gledati / Videti', emoji: '👁️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '26', char: '吃', pinyin: 'chī', vuk: 'či', translation: 'Jesti', emoji: '🍎', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '27', char: '喝', pinyin: 'hē', vuk: 'he', translation: 'Piti', emoji: '🥤', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '28', char: '走', pinyin: 'zǒu', vuk: 'dzou', translation: 'Hodati / Ići', emoji: '🚶', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '29', char: '跑', pinyin: 'pǎo', vuk: 'pao', translation: 'Trčati', emoji: '🏃', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '30', char: '笑', pinyin: 'xiào', vuk: 'sjao', translation: 'Smejati se', emoji: '😄', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '31', char: '哭', pinyin: 'kū', vuk: 'ku', translation: 'Plakati', emoji: '😢', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '32', char: '说', pinyin: 'shuō', vuk: 'šuo', translation: 'Govoriti / Reći', emoji: '💬', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '33', char: '想', pinyin: 'xiǎng', vuk: 'sjang', translation: 'Misliti / Želeti', emoji: '💭', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '34', char: '做', pinyin: 'zuò', vuk: 'dzuo', translation: 'Raditi / Praviti', emoji: '🛠️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '35', char: '有', pinyin: 'yǒu', vuk: 'jou', translation: 'Imati', emoji: '🎒', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '36', char: '去', pinyin: 'qù', vuk: 'ću', translation: 'Ići / Otići', emoji: '➡️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '51', char: '买', pinyin: 'mǎi', vuk: 'mai', translation: 'Kupiti', emoji: '🛍️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '52', char: '卖', pinyin: 'mài', vuk: 'mai', translation: 'Prodati', emoji: '🪙', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '53', char: '学', pinyin: 'xué', vuk: 'sjue', translation: 'Učiti / Proučavati', emoji: '🎓', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '54', char: '写', pinyin: 'xiě', vuk: 'sje', translation: 'Pisati', emoji: '✍️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '55', char: '读', pinyin: 'dú', vuk: 'du', translation: 'Čitati', emoji: '📖', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '56', char: '坐', pinyin: 'zuò', vuk: 'dzuo', translation: 'Sedeti', emoji: '🪑', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '57', char: '站', pinyin: 'zhàn', vuk: 'džan', translation: 'Stajati / Ustati', emoji: '🧍', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '58', char: '睡', pinyin: 'shuì', vuk: 'šui', translation: 'Spavati', emoji: '😴', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '59', char: '懂', pinyin: 'dǒng', vuk: 'dong', translation: 'Razumeti / Shvatiti', emoji: '💡', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '60', char: '问', pinyin: 'wèn', vuk: 'ven', translation: 'Pitati / Pitanje', emoji: '❓', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '61', char: '答', pinyin: 'dá', vuk: 'da', translation: 'Odgovoriti', emoji: '🗣️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '62', char: '开', pinyin: 'kāi', vuk: 'kai', translation: 'Otvoriti / Voziti', emoji: '🔑', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '63', char: '关', pinyin: 'guān', vuk: 'guan', translation: 'Zatvoriti / Ugasiti', emoji: '🔒', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: '64', char: '喜欢', pinyin: 'xǐ huan', vuk: 'si huan', translation: 'Sviđati se / Voleti', emoji: '🥰', category: 'glagoli', categoryLabel: 'Glagoli' },

  // Svakodnevno
  { id: '37', char: '家', pinyin: 'jiā', vuk: 'đia', translation: 'Kuća / Dom / Porodica', emoji: '🏠', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '38', char: '朋友', pinyin: 'péng yǒu', vuk: 'peng jou', translation: 'Prijatelj', emoji: '🤝', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '39', char: '水', pinyin: 'shuǐ', vuk: 'šui', translation: 'Voda', emoji: '💧', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '40', char: '山', pinyin: 'shān', vuk: 'šan', translation: 'Planina', emoji: '🏔️', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '41', char: '日月', pinyin: 'rì yuè', vuk: 'ži jue', translation: 'Sunce i Mesec', emoji: '☯️', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '42', char: '书', pinyin: 'shū', vuk: 'šu', translation: 'Knjiga', emoji: '📖', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '43', char: '今天', pinyin: 'jīn tiān', vuk: 'đin tjen', translation: 'Danas', emoji: '📅', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '44', char: '时间', pinyin: 'shí jiān', vuk: 'ši đjen', translation: 'Vreme', emoji: '⏳', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '45', char: '力量', pinyin: 'lì liàng', vuk: 'li ljang', translation: 'Snaga / Sila', emoji: '💪', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '46', char: '智慧', pinyin: 'zhì huì', vuk: 'dži hui', translation: 'Mudrost', emoji: '🦉', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '47', char: '健康', pinyin: 'jiàn kāng', vuk: 'đjen kang', translation: 'Zdravlje', emoji: '🍏', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '48', char: '平息', pinyin: 'píng xī', vuk: 'ping si', translation: 'Mir / Spokoj', emoji: '🕊️', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '49', char: '谢谢', pinyin: 'xiè xiè', vuk: 'sje sje', translation: 'Hvala', emoji: '🙏', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '50', char: '再见', pinyin: 'zài jiàn', vuk: 'dzai đjen', translation: 'Doviđenja', emoji: '👋', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '65', char: '日', pinyin: 'rì', vuk: 'ži', translation: 'Dan / Sunce', emoji: '☀️', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '66', char: '月', pinyin: 'yuè', vuk: 'jue', translation: 'Mesec', emoji: '🌙', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '67', char: '人', pinyin: 'rén', vuk: 'žen', translation: 'Čovek / Osoba', emoji: '👤', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '68', char: '茶', pinyin: 'chá', vuk: 'ča', translation: 'Čaj', emoji: '🍵', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '69', char: '咖啡', pinyin: 'kā fēi', vuk: 'ka fej', translation: 'Kafa', emoji: '☕', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '70', char: '苹果', pinyin: 'píng guǒ', vuk: 'ping guo', translation: 'Jabuka', emoji: '🍎', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '71', char: '米饭', pinyin: 'mǐ fàn', vuk: 'mi fan', translation: 'Kuvani pirinač / Obrok', emoji: '🍚', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '72', char: '猫', pinyin: 'māo', vuk: 'mao', translation: 'Mačka', emoji: '🐱', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '73', char: '狗', pinyin: 'gǒu', vuk: 'gou', translation: 'Pas', emoji: '🐶', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '74', char: '鱼', pinyin: 'yú', vuk: 'ju', translation: 'Riba', emoji: '🐟', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '75', char: '钱', pinyin: 'qián', vuk: 'ćien', translation: 'Novac', emoji: '💵', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '76', char: '车', pinyin: 'chē', vuk: 'če', translation: 'Auto / Vozilo', emoji: '🚗', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '77', char: '手', pinyin: 'shǒu', vuk: 'šou', translation: 'Ruka', emoji: '✋', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '78', char: '头', pinyin: 'tóu', vuk: 'tou', translation: 'Glava', emoji: '👤', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '79', char: '眼睛', pinyin: 'yǎn jing', vuk: 'jen đing', translation: 'Oči', emoji: '👀', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '80', char: '耳朵', pinyin: 'ěr duo', vuk: 'er duo', translation: 'Uši / Slušalice', emoji: '🎧', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '81', char: '衣服', pinyin: 'yī fu', vuk: 'i fu', translation: 'Odeća', emoji: '👕', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '82', char: '学校', pinyin: 'xué xiào', vuk: 'sjue sjao', translation: 'Škola', emoji: '🏫', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '83', char: '老师', pinyin: 'lǎo shī', vuk: 'lao ši', translation: 'Učitelj', emoji: '👨‍🏫', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: '84', char: '学生', pinyin: 'xué sheng', vuk: 'sjue šeng', translation: 'Učenik / Student', emoji: '🧑‍🎓', category: 'svakodnevno', categoryLabel: 'Svakodnevno' }
];

export const ChineseVocabView: React.FC<ChineseVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  // Navigation: Dictionary or Game mode
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'strofa_1' | 'refren' | 'glagoli' | 'svakodnevno'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Game States
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState<{
    vocab: VocabItem;
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
  const [streak, setStreak] = useState(0);

  // Persistence States
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [isPronouncing, setIsPronouncing] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: VocabItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering speaker pronunciation
    const engTrans = ENGLISH_TRANSLATIONS[item.char] || '';
    const textToCopy = `${item.emoji} ${item.char} [${item.pinyin}] (${item.vuk})\n🇭🇷 ${item.translation}\n🇬🇧 ${engTrans}\n\n✨ Shared via WiseFit Sanctuary`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      playSound('correct');
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  // Play synthesized tone for Duolingo feels
  const playSound = (type: 'correct' | 'wrong' | 'complete' | 'level-up') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
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
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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
      console.warn("AudioContext blocked or not supported:", e);
    }
  };

  // Speak Chinese word using Native WebSpeech API
  const speakChinese = (text: string, id?: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    if (id) setIsPronouncing(id);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // Slightly slower for better learning
    
    // Attempt to locate a natural Chinese voice if available
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }
    
    utterance.onend = () => {
      if (id) setIsPronouncing(null);
    };
    utterance.onerror = () => {
      if (id) setIsPronouncing(null);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Load Saved Progress from Firestore or LocalStorage
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
          console.error("Error fetching Chinese progress:", e);
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

  // Save Progress
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
        console.error("Error saving Chinese progress to Firestore:", e);
      }
    } else {
      localStorage.setItem('wf_chinese_mastered', JSON.stringify(newMastered));
      localStorage.setItem('wf_chinese_highscore', Math.max(highScore, newHighScore).toString());
    }
  };

  // Filtered Vocab
  const filteredVocab = useMemo(() => {
    return VOCAB_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        item.char.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vuk.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Toggle mastered status manually
  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering pronunciation
    let updated: string[];
    if (masteredIds.includes(id)) {
      updated = masteredIds.filter(mid => mid !== id);
    } else {
      updated = [...masteredIds, id];
      playSound('correct');
    }
    saveProgress(updated, highScore);
  };

  // Generate a round of 5 questions
  const generateQuizRound = () => {
    // Pick 5 random items
    const shuffled = [...VOCAB_DATA].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
    const questionsList = selected.map(vocab => {
      // Pick question type
      const types: ('meaning' | 'vuk' | 'character' | 'listen')[] = ['meaning', 'vuk', 'character', 'listen'];
      const questionType = types[Math.floor(Math.random() * types.length)];
      
      // Get 3 random wrong options
      const otherVocabs = VOCAB_DATA.filter(v => v.id !== vocab.id);
      const wrongShuffled = otherVocabs.sort(() => Math.random() - 0.5).slice(0, 3);
      
      let correctAnswer = '';
      let wrongAnswers: string[] = [];

      if (questionType === 'meaning') {
        correctAnswer = `${vocab.emoji} ${vocab.translation}`;
        wrongAnswers = wrongShuffled.map(w => `${w.emoji} ${w.translation}`);
      } else if (questionType === 'vuk') {
        correctAnswer = `Kao po Vuku: "${vocab.vuk}"`;
        wrongAnswers = wrongShuffled.map(w => `Kao po Vuku: "${w.vuk}"`);
      } else if (questionType === 'character') {
        correctAnswer = `${vocab.char} (${vocab.pinyin})`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} (${w.pinyin})`);
      } else { // listen
        correctAnswer = `${vocab.char} — ${vocab.emoji} ${vocab.translation}`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} — ${w.emoji} ${w.translation}`);
      }

      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = allOptions.indexOf(correctAnswer);

      return {
        vocab,
        options: allOptions,
        correctIndex,
        questionType
      };
    });

    setRoundQuestions(questionsList);
    setQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setLives(3);
    setQuizComplete(false);
    setQuizStarted(true);
    
    // Auto-pronounce if it is a listening question
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
      setStreak(prev => prev + 1);
      
      // Automatically add to mastered if they answered correctly
      if (!masteredIds.includes(currentQ.vocab.id)) {
        saveProgress([...masteredIds, currentQ.vocab.id], Math.max(highScore, score + 10));
      }
    } else {
      playSound('wrong');
      setLives(prev => Math.max(0, prev - 1));
      setStreak(0);
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
      
      // Auto-speak if the next question is listening-based
      if (roundQuestions[nextIdx].questionType === 'listen') {
        setTimeout(() => speakChinese(roundQuestions[nextIdx].vocab.char), 400);
      }
    } else {
      setQuizComplete(true);
      playSound('complete');
      if (score > highScore) {
        saveProgress(masteredIds, score);
      }
    }
  };

  const getRankInfo = (count: number) => {
    if (count >= 65) return { name: "Gospodar Znakova (Master) 👑", icon: "👑", desc: "Znaš preko 65 kineskih riječi! Pravi kineski mudrac.", nextMilestone: null };
    if (count >= 45) return { name: "Kineski Mudrac (Sage) 🦉", icon: "🦉", desc: "Savladano preko 45 riječi. Tvoj um je oštar kao planinski vetar.", nextMilestone: 65 };
    if (count >= 25) return { name: "Učeni Filozof (Scholar) 🎓", icon: "🎓", desc: "Savladano preko 25 riječi. Tvoje znanje raste svakim danom.", nextMilestone: 45 };
    if (count >= 10) return { name: "Marljivi Učenik (Student) 📚", icon: "📚", desc: "Savladano preko 10 riječi. Na dobrom si putu discipline.", nextMilestone: 25 };
    return { name: "Radoznali Tragač (Seeker) 🧭", icon: "🧭", desc: "Tek započinješ svoj put. Označi prve riječi kao naučene!", nextMilestone: 10 };
  };

  return (
    <div className="w-full space-y-6">
      {/* Custom Sub-Header Layout mirroring screenshot */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-zinc-500/10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl relative select-none shadow-md",
            isGirlyMode 
              ? "bg-pink-100 text-pink-500 border border-pink-200" 
              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
          )}>
            学习
          </div>
          <div>
            <h3 className={cn(
              "text-lg font-black tracking-tight flex items-center gap-2",
              isGirlyMode ? "text-pink-900" : isDarkMode ? "text-zinc-100" : "text-zinc-900"
            )}>
              Chinese Vocab <span className="text-xs px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-500 font-mono">{VOCAB_DATA.length} Riječi</span>
            </h3>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              Riječi za učenje po vukovom pravopisu
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Subview Toggle Switcher */}
          <div className={cn(
            "flex p-1 rounded-xl border border-zinc-500/10",
            isDarkMode ? "bg-zinc-900/60" : "bg-zinc-100"
          )}>
            <button
              onClick={() => { setActiveTab('learn'); setQuizStarted(false); }}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'learn'
                  ? isGirlyMode 
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-emerald-500 text-white shadow-sm"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" /> Rečnik
            </button>
            <button
              onClick={() => { setActiveTab('quiz'); generateQuizRound(); }}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'quiz'
                  ? isGirlyMode 
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-emerald-500 text-white shadow-sm"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Duo Kviz
            </button>
          </div>

          {/* Mastered Trophy Tracker */}
          <div className={cn(
            "px-3.5 py-2 rounded-xl flex items-center gap-2 border font-mono text-xs font-black",
            isGirlyMode 
              ? "bg-pink-50 border-pink-100 text-pink-600" 
              : isDarkMode 
                ? "bg-zinc-900 border-zinc-800 text-amber-500" 
                : "bg-amber-50 border-amber-100 text-amber-600"
          )}>
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{masteredIds.length}/{VOCAB_DATA.length}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* --- DICTIONARY DIALOG / GRID VIEW --- */}
        {activeTab === 'learn' && (
          <motion.div
            key="learn-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Gamified Progress Sanctuary Dashboard */}
            <div className={cn(
              "p-6 rounded-[32px] border relative overflow-hidden transition-all duration-300 shadow-md",
              isGirlyMode 
                ? "bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border-pink-500/20 shadow-pink-500/5" 
                : isDarkMode 
                  ? "bg-gradient-to-br from-emerald-500/10 via-zinc-900/50 to-zinc-950 border-emerald-500/20 shadow-emerald-500/5"
                  : "bg-gradient-to-br from-emerald-50 to-white border-zinc-200/80 shadow-zinc-200/50"
            )}>
              {/* Abstract decorative graphic elements for duolingo/zen premium aesthetic */}
              <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 pointer-events-none select-none text-[120px] font-black font-sans leading-none">
                {getRankInfo(masteredIds.length).icon}
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5 max-w-md">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-2xl filter drop-shadow-sm">
                      {getRankInfo(masteredIds.length).icon}
                    </span>
                    <span className={cn(
                      "text-xs font-black uppercase tracking-widest font-mono",
                      isGirlyMode ? "text-pink-600" : "text-emerald-500"
                    )}>
                      ČIN:
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide",
                      isGirlyMode 
                        ? "bg-pink-100 text-pink-700" 
                        : isDarkMode 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-emerald-100 text-emerald-800"
                    )}>
                      {getRankInfo(masteredIds.length).name}
                    </span>
                  </div>

                  <h4 className={cn(
                    "text-sm font-black tracking-tight",
                    isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-50" : "text-zinc-900"
                  )}>
                    Kineska Akademija Napretka
                  </h4>
                  <p className="text-[11px] font-bold text-zinc-400 leading-relaxed">
                    {getRankInfo(masteredIds.length).desc}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono text-right w-full md:w-auto">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn(
                      "text-3xl font-black leading-none",
                      isGirlyMode ? "text-pink-600" : "text-emerald-500"
                    )}>
                      {masteredIds.length}
                    </span>
                    <span className="text-zinc-400 font-bold text-xs">/ {VOCAB_DATA.length}</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Savladane Riječi
                  </span>
                </div>
              </div>

              {/* Progress bar and requirements */}
              <div className="mt-5 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-mono font-black text-zinc-400">
                  <span>Progres do potpunog Gospodstva</span>
                  <span>{Math.round((masteredIds.length / VOCAB_DATA.length) * 100)}%</span>
                </div>

                <div className="h-3 rounded-full bg-zinc-500/10 overflow-hidden border border-zinc-500/5 relative flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(masteredIds.length / VOCAB_DATA.length) * 100}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-500 relative",
                      isGirlyMode 
                        ? "bg-gradient-to-r from-pink-400 to-pink-500" 
                        : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    )}
                  />
                </div>

                {getRankInfo(masteredIds.length).nextMilestone !== null ? (
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                    <p className="flex items-center gap-1">
                      <span>Sledeći nivo na:</span>
                      <strong className={isGirlyMode ? "text-pink-500" : "text-emerald-500"}>
                        {getRankInfo(masteredIds.length).nextMilestone} reči
                      </strong>
                    </p>
                    <p>
                      Preostalo još{" "}
                      <strong className={isGirlyMode ? "text-pink-500" : "text-emerald-500"}>
                        {getRankInfo(masteredIds.length).nextMilestone! - masteredIds.length}
                      </strong>{" "}
                      reči!
                    </p>
                  </div>
                ) : (
                  <div className="text-[10px] font-black text-amber-500 text-center uppercase tracking-widest mt-1">
                    👑 Čestitamo! Otključao si apsolutni vrhunac kineske mudrosti! 👑
                  </div>
                )}
              </div>
            </div>

            {/* Search & Category Filter Pills */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Pretraži kineske karaktere, prevod ili pismo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium border transition-all focus:outline-none focus:ring-2",
                    isDarkMode 
                      ? "bg-zinc-900/40 border-zinc-800 text-zinc-200 focus:ring-emerald-500/20 focus:border-emerald-500" 
                      : "bg-white border-zinc-200 text-zinc-950 focus:ring-emerald-500/10 focus:border-emerald-500"
                  )}
                />
              </div>

              {/* Pill Switcher mirroring screenshot: "Strofa 1" | "Refren" | "Sve" etc. */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-500/5 border border-zinc-500/5 overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'all'
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Sve
                </button>
                <button
                  onClick={() => setSelectedCategory('strofa_1')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'strofa_1'
                      ? isGirlyMode ? "bg-pink-500 text-white shadow-sm" : "bg-emerald-500 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Strofa 1
                </button>
                <button
                  onClick={() => setSelectedCategory('refren')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'refren'
                      ? isGirlyMode ? "bg-pink-500 text-white shadow-sm" : "bg-emerald-500 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Refren
                </button>
                <button
                  onClick={() => setSelectedCategory('glagoli')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'glagoli'
                      ? isGirlyMode ? "bg-pink-500 text-white shadow-sm" : "bg-emerald-500 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Glagoli ⚙️
                </button>
                <button
                  onClick={() => setSelectedCategory('svakodnevno')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'svakodnevno'
                      ? isGirlyMode ? "bg-pink-500 text-white shadow-sm" : "bg-emerald-500 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Svakodnevno 💬
                </button>
              </div>
            </div>

            {/* Vocabulary Grid Mirroring user's layout structure */}
            {filteredVocab.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-500/10 rounded-[30px] p-6">
                <p className="text-sm font-bold text-zinc-400">Nismo pronašli nijednu riječ za tu pretragu.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400"
                >
                  Resetuj Filtere
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredVocab.map((item) => {
                  const isMastered = masteredIds.includes(item.id);
                  const isTalking = isPronouncing === item.id;
                  
                  return (
                    <motion.div
                      layout
                      key={item.id}
                      onClick={() => speakChinese(item.char, item.id)}
                      className={cn(
                        "p-6 rounded-[32px] border relative overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[160px] hover:shadow-lg active:scale-95",
                        isMastered
                          ? isGirlyMode 
                            ? "bg-pink-500/5 border-pink-500/20 shadow-md shadow-pink-500/5"
                            : "bg-emerald-500/5 border-emerald-500/30 shadow-md shadow-emerald-500/5"
                          : isDarkMode 
                            ? "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900" 
                            : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm shadow-zinc-200/50"
                      )}
                    >
                      {/* Top Action Indicators (Speaker, Copy & Mastery status check icon) */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          {/* Audio Speaker Action */}
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                            isTalking 
                              ? isGirlyMode ? "bg-pink-500 text-white scale-110" : "bg-emerald-500 text-white scale-110 animate-pulse"
                              : "bg-zinc-500/10 text-zinc-400 group-hover:bg-zinc-500/20 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"
                          )}>
                            <Volume2 className={cn("w-3.5 h-3.5", isTalking && "animate-bounce")} />
                          </div>

                          {/* Copy Action */}
                          <button
                            onClick={(e) => handleCopy(item, e)}
                            title="Kopiraj za društvene mreže"
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center transition-all border border-transparent",
                              copiedId === item.id
                                ? isGirlyMode ? "bg-pink-500 text-white scale-110" : "bg-emerald-500 text-white scale-110"
                                : "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 hover:text-zinc-600 dark:hover:text-zinc-200"
                            )}
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Duolingo Emojis Highlight */}
                        <span className="text-xl select-none filter drop-shadow-sm transition-transform duration-300 group-hover:scale-125">
                          {item.emoji}
                        </span>

                        {/* Mastery Checkbox Icon */}
                        <button
                          onClick={(e) => toggleMastered(item.id, e)}
                          title={isMastered ? "Označi kao naučeno (Klikni da ukloniš)" : "Označi kao naučeno"}
                          className={cn(
                            "w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300",
                            isMastered 
                              ? isGirlyMode 
                                ? "bg-pink-500 border-pink-500 text-white shadow-sm shadow-pink-500/20"
                                : "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                              : isGirlyMode
                                ? "bg-zinc-500/5 border-zinc-200 dark:border-zinc-800 text-zinc-300 hover:border-pink-300 hover:text-pink-500 dark:hover:border-pink-500/50"
                                : "bg-zinc-500/5 border-zinc-200 dark:border-zinc-800 text-zinc-300 hover:border-emerald-300 hover:text-emerald-500 dark:hover:border-emerald-500/50"
                          )}
                        >
                          <Check className={cn(
                            "w-3.5 h-3.5 transition-all",
                            isMastered ? "scale-110 stroke-[3px]" : "scale-90 stroke-[2px]"
                          )} />
                        </button>
                      </div>

                      {/* Display Chinese Character */}
                      <div className="my-2">
                        <div className={cn(
                          "text-3xl font-black tracking-wide leading-tight",
                          isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-50" : "text-zinc-900"
                        )}>
                          {item.char}
                        </div>
                      </div>

                      {/* Pronunciation & Vuk Karadzic Phonetics */}
                      <div className="space-y-1 border-t border-zinc-500/5 pt-2 mt-auto">
                        {/* Pinyin with color styling representing tones */}
                        <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wide">
                          <span className={isGirlyMode ? "text-pink-400" : "text-emerald-500"}>
                            {item.pinyin.split(' ')[0]}
                          </span>
                          {item.pinyin.split(' ')[1] && (
                            <span className="text-cyan-500">
                              {item.pinyin.split(' ')[1]}
                            </span>
                          )}
                          {item.pinyin.split(' ')[2] && (
                            <span className="text-amber-500">
                              {item.pinyin.split(' ')[2]}
                            </span>
                          )}
                        </div>

                        {/* Vuk Karadžić phonetic spelling */}
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1",
                          isGirlyMode ? "text-pink-600/70" : "text-zinc-400 dark:text-zinc-500"
                        )}>
                          Vuk: <span className={cn(
                            "px-1.5 py-0.2 rounded border",
                            isDarkMode 
                              ? "bg-zinc-800/40 border-zinc-700/40 text-zinc-300" 
                              : "bg-zinc-100 border-zinc-200 text-zinc-700"
                          )}>{item.vuk}</span>
                        </p>

                        {/* Croatian Translation */}
                        <div className={cn(
                          "text-xs font-black tracking-tight mt-1 line-clamp-1",
                          isGirlyMode ? "text-pink-900/80" : isDarkMode ? "text-zinc-300" : "text-zinc-700"
                        )}>
                          {item.translation}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* --- DUOLINGO GAME MODE VIEW --- */}
        {activeTab === 'quiz' && (
          <motion.div
            key="quiz-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            {/* Start Panel */}
            {!quizStarted && !quizComplete && (
              <div className={cn(
                "p-8 rounded-[40px] border text-center space-y-6 relative overflow-hidden",
                isGirlyMode ? "bg-white/60 border-pink-100 shadow-xl shadow-pink-500/5" :
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"
              )}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
                <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-3xl shadow-sm animate-bounce">
                  🏮
                </div>
                
                <div className="space-y-2">
                  <h3 className={cn("text-2xl font-black leading-tight", isGirlyMode && "text-pink-950")}>
                    Kineska Duolingo Trening Suđenja
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
                    Testiraj svoje pamćenje kroz interaktivna pitanja sa vukovim izgovorom, emodžijima i znakovima. Svaka runda ima 5 brzih pitanja. Sačuvaj svoje srce!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  <div className="p-3 rounded-2xl bg-zinc-500/5 border border-zinc-500/10 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Rekord</span>
                    <span className="text-xl font-black font-mono text-amber-500">{highScore} XP</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-500/5 border border-zinc-500/10 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Naučeno</span>
                    <span className="text-xl font-black font-mono text-emerald-500">{masteredIds.length}/{VOCAB_DATA.length}</span>
                  </div>
                </div>

                <button
                  onClick={generateQuizRound}
                  className={cn(
                    "w-full py-4 rounded-2xl text-white font-black uppercase tracking-tighter flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md",
                    isGirlyMode ? "bg-pink-500 hover:bg-pink-600 shadow-pink-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                  )}
                >
                  Započni Trening <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Active Quiz Question Panel */}
            {quizStarted && !quizComplete && roundQuestions[questionIdx] && (
              <div className="space-y-6">
                {/* Duo Style Progress HUD */}
                <div className="flex items-center justify-between gap-4">
                  {/* Progress bar */}
                  <div className="flex-1 h-3 rounded-full bg-zinc-500/10 overflow-hidden border border-zinc-500/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((questionIdx + 1) / roundQuestions.length) * 100}%` }}
                      className={cn(
                        "h-full transition-all duration-300",
                        isGirlyMode ? "bg-pink-500" : "bg-emerald-500"
                      )}
                    />
                  </div>

                  {/* Question Number */}
                  <span className="text-xs font-mono font-black text-zinc-400 whitespace-nowrap">
                    {questionIdx + 1} / {roundQuestions.length}
                  </span>

                  {/* Health Lives Hearts */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((heartNum) => (
                      <Heart
                        key={heartNum}
                        className={cn(
                          "w-5 h-5 transition-transform duration-300",
                          heartNum <= lives 
                            ? "text-rose-500 fill-rose-500 scale-100" 
                            : "text-zinc-500/30 dark:text-zinc-800 scale-90"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Container */}
                <div className={cn(
                  "p-8 rounded-[40px] border relative overflow-hidden space-y-6",
                  isGirlyMode ? "bg-white/60 border-pink-100 shadow-xl shadow-pink-500/5" :
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"
                )}>
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/40" />

                  {/* Question Prompt */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-500/5 px-2.5 py-1 rounded-md inline-block">
                      {roundQuestions[questionIdx].questionType === 'meaning' && "Prevod Reči"}
                      {roundQuestions[questionIdx].questionType === 'vuk' && "Izgovor po Vuku"}
                      {roundQuestions[questionIdx].questionType === 'character' && "Kinesko Pismo"}
                      {roundQuestions[questionIdx].questionType === 'listen' && "Slušni Test 🔊"}
                    </span>

                    {/* Question Header */}
                    {roundQuestions[questionIdx].questionType === 'listen' ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                        <button
                          onClick={() => speakChinese(roundQuestions[questionIdx].vocab.char)}
                          className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all scale-105 active:scale-95 shadow-md",
                            isGirlyMode 
                              ? "bg-pink-100 text-pink-500 hover:bg-pink-200" 
                              : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          )}
                        >
                          <Volume2 className="w-7 h-7" />
                        </button>
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider animate-pulse">
                          Klikni da čuješ ponovo
                        </span>
                      </div>
                    ) : (
                      <h4 className={cn(
                        "text-2xl font-black leading-tight flex items-center gap-3",
                        isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-100" : "text-zinc-900"
                      )}>
                        <span className="text-4xl filter drop-shadow-sm select-none">
                          {roundQuestions[questionIdx].vocab.emoji}
                        </span>
                        {roundQuestions[questionIdx].questionType === 'meaning' && (
                          <span>Koji je prevod za znak <span className="font-mono text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">{roundQuestions[questionIdx].vocab.char}</span> ?</span>
                        )}
                        {roundQuestions[questionIdx].questionType === 'vuk' && (
                          <span>Kako po Vuku pišemo reč <span className="text-amber-500 underline underline-offset-4">{roundQuestions[questionIdx].vocab.translation}</span> ?</span>
                        )}
                        {roundQuestions[questionIdx].questionType === 'character' && (
                          <span>Koji znak predstavlja izgovor <span className="text-emerald-500">"{roundQuestions[questionIdx].vocab.vuk}"</span>?</span>
                        )}
                      </h4>
                    )}
                  </div>

                  {/* Question Options */}
                  <div className="grid gap-3">
                    {roundQuestions[questionIdx].options.map((option, idx) => {
                      const isCorrect = idx === roundQuestions[questionIdx].correctIndex;
                      const isSelected = idx === selectedAnswer;
                      
                      let btnStyle = isDarkMode
                        ? "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700"
                        : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100";

                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = isGirlyMode 
                            ? "bg-pink-500/10 border-pink-500 text-pink-600 shadow-md" 
                            : "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-md";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500/10 border-rose-500 text-rose-500 shadow-md";
                        } else {
                          btnStyle = "opacity-40 grayscale cursor-not-allowed pointer-events-none";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isAnswered}
                          onClick={() => handleAnswerSubmit(idx)}
                          className={cn(
                            "w-full p-4.5 rounded-2xl border text-left font-black transition-all duration-300 flex items-center justify-between group",
                            btnStyle
                          )}
                        >
                          <span className="text-sm">{option}</span>
                          {isAnswered && isCorrect && <CheckCircle className={cn("w-5 h-5", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />}
                          {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Panel */}
                  <AnimatePresence>
                    {isAnswered && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={cn(
                          "pt-4 border-t border-zinc-500/10 space-y-3",
                          selectedAnswer === roundQuestions[questionIdx].correctIndex 
                            ? isGirlyMode ? "text-pink-600" : "text-emerald-600 dark:text-emerald-400" 
                            : "text-rose-500"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {selectedAnswer === roundQuestions[questionIdx].correctIndex ? (
                            <Sparkles className="w-4 h-4 fill-current animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="text-xs font-black uppercase tracking-widest">
                            {selectedAnswer === roundQuestions[questionIdx].correctIndex ? "Sjajno odrađeno!" : "Netačno!"}
                          </span>
                        </div>
                        
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
                          Znak: <strong className="text-zinc-200">{roundQuestions[questionIdx].vocab.char}</strong> ({roundQuestions[questionIdx].vocab.pinyin}) | Vuk: <strong className="text-zinc-200">"{roundQuestions[questionIdx].vocab.vuk}"</strong> | Prevod: <strong className="text-zinc-200">{roundQuestions[questionIdx].vocab.translation}</strong>.
                        </p>

                        <button
                          onClick={handleNextQuestion}
                          className={cn(
                            "w-full py-4 rounded-2xl text-white font-black uppercase tracking-tighter flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-sm mt-2",
                            isGirlyMode ? "bg-pink-500 hover:bg-pink-600" : "bg-emerald-500 hover:bg-emerald-600"
                          )}
                        >
                          {questionIdx < roundQuestions.length - 1 ? "Sljedeće Pitanje" : "Završi Suđenje"} <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Quiz Complete / Results View */}
            {quizComplete && (
              <div className={cn(
                "p-8 rounded-[40px] border text-center space-y-6 relative overflow-hidden",
                isGirlyMode ? "bg-white/60 border-pink-100 shadow-xl shadow-pink-500/5" :
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"
              )}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <Award className="w-16 h-16 mx-auto text-amber-500 fill-amber-500/10 animate-bounce" />

                <div className="space-y-2">
                  <h3 className={cn("text-2xl font-black leading-tight", isGirlyMode && "text-pink-950")}>
                    {lives > 0 ? "Čestitamo Seeker!" : "Suđenje je završeno"}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-sm mx-auto">
                    {lives > 0 
                      ? "Uspješno si prebrodio sva jezička suđenja u ovoj rundi. Tvoja mudrost Kine raste!"
                      : "Ostao si bez života ovog puta, ali tvoje pamćenje raste sa svakom greškom!"
                    }
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Osvojeno</span>
                    <span className="text-lg font-black font-mono text-emerald-500">+{score} XP</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Preživjelo</span>
                    <span className="text-lg font-black font-mono text-rose-500">{lives} Srca</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Naučeno</span>
                    <span className="text-lg font-black font-mono text-blue-500">{masteredIds.length}/{VOCAB_DATA.length}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setQuizComplete(false); setQuizStarted(false); }}
                    className="flex-1 py-4 rounded-2xl bg-zinc-500/10 hover:bg-zinc-500/15 font-black uppercase tracking-tighter text-zinc-400 transition-all text-xs"
                  >
                    Nazad u Kviz
                  </button>
                  <button
                    onClick={generateQuizRound}
                    className={cn(
                      "flex-1 py-4 rounded-2xl text-white font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 text-xs",
                      isGirlyMode ? "bg-pink-500 hover:bg-pink-600" : "bg-emerald-500 hover:bg-emerald-600"
                    )}
                  >
                    Nova Runda <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
