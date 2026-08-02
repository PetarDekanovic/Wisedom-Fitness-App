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
  Wand2
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
  { char: '他们', pinyin: 'Tāmen', vuk: 'Ta men', translationSr: 'Oni', translationEn: 'They' },
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

export const ChineseVocabView: React.FC<ChineseVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'canvas' | 'weaver' | 'quiz'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3-Step Word Configurator State (I / You / They -> Verb -> Noun)
  const [cfgSubIdx, setCfgSubIdx] = useState(0); // '我'
  const [cfgVerbIdx, setCfgVerbIdx] = useState(3); // '思考'
  const [cfgNounIdx, setCfgNounIdx] = useState(0); // '智慧'

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
    const textToCopy = `${item.emoji} ${item.char} [${item.pinyin}] (${item.vuk})\n🇭🇷 ${item.translation}\n🇬🇧 ${item.english}\n${item.radical ? `🏮 Radikal: ${item.radical}\n` : ''}✨ WiseFit Sanctuary Chinese`;

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
                            Pinyin: {item.pinyin}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-xs pt-0.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Vuk:</span>
                          <span className={cn("font-black text-sm", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                            "{item.vuk}"
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-3 border-zinc-200 dark:border-zinc-800 space-y-1.5">
                        <p className={cn("text-sm font-bold leading-snug", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                          🇭🇷 {item.translation}
                        </p>
                        <p className={cn("text-xs font-medium", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                          🇬🇧 {item.english}
                        </p>
                        {(() => {
                          const quoteInfo = getChineseQuoteForItem(item);
                          return (
                            <div className="text-[11px] leading-snug bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 p-2.5 rounded-xl flex items-start gap-2 mt-2">
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

        {/* AI SENTENCE WEAVER */}
        {activeTab === 'weaver' && (
          <motion.div key="weaver-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* 3-STEP SENTENCE CONFIGURATOR */}
            <div className={cn(
              "p-6 rounded-3xl border space-y-5",
              isDarkMode ? "bg-zinc-900/90 border-amber-500/40 shadow-xl" : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-md"
            )}>
              <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3 border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 className="text-base font-black tracking-tight">Konfigurator Kineskih Rečenica (Brzi Sklop)</h3>
                </div>
                <span className="text-[10px] font-mono font-extrabold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                  Subjekat → Glagol → Imenica
                </span>
              </div>

              {/* STEP 1: SUBJECT */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-mono">
                  <span>1. Subjekat:</span>
                  <span className="text-[10px] font-normal opacity-80">(Izaberite subjekat)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CONFIGURATOR_SUBJECTS.map((sub, idx) => (
                    <button
                      key={`sub-${idx}`}
                      onClick={() => setCfgSubIdx(idx)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all text-center",
                        cfgSubIdx === idx
                          ? "bg-amber-600 text-white border-amber-500 shadow-md scale-[1.02]"
                          : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-amber-500/50" : "bg-white border-amber-200 text-zinc-800 hover:bg-amber-100/50"
                      )}
                    >
                      <p className="text-xl font-serif font-black">{sub.char}</p>
                      <p className="text-[10px] font-mono opacity-90">{sub.pinyin} ({sub.vuk})</p>
                      <p className="text-[10px] font-bold mt-0.5">{sub.translationSr}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: VERB */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-mono">
                  <span>2. Glagol:</span>
                  <span className="text-[10px] font-normal opacity-80">(Izaberite radnju)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONFIGURATOR_VERBS.map((v, idx) => (
                    <button
                      key={`verb-${idx}`}
                      onClick={() => setCfgVerbIdx(idx)}
                      className={cn(
                        "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                        cfgVerbIdx === idx
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

              {/* STEP 3: NOUN */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-mono">
                  <span>3. Imenica / Objekat:</span>
                  <span className="text-[10px] font-normal opacity-80">(Izaberite pojam)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONFIGURATOR_NOUNS.map((n, idx) => (
                    <button
                      key={`noun-${idx}`}
                      onClick={() => setCfgNounIdx(idx)}
                      className={cn(
                        "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                        cfgNounIdx === idx
                          ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                          : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-amber-500/40" : "bg-white border-amber-200 text-zinc-700 hover:bg-amber-100/50"
                      )}
                    >
                      <span className="font-serif text-sm font-black">{n.char}</span>
                      <span className="text-[10px] opacity-80 font-mono">({n.sr})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* GENERATED CONFIGURATOR PREVIEW CARD */}
              {(() => {
                const sub = CONFIGURATOR_SUBJECTS[cfgSubIdx];
                const verb = CONFIGURATOR_VERBS[cfgVerbIdx];
                const noun = CONFIGURATOR_NOUNS[cfgNounIdx];
                const sentenceChar = `${sub.char} ${verb.char} ${noun.char}`;
                const sentencePinyin = `${sub.pinyin} ${verb.pinyin} ${noun.pinyin}`;
                const sentenceVuk = `${sub.vuk} ${verb.vuk} ${noun.vuk}`;
                const verbSr = verb.sr[sub.char as '我' | '你' | '他们'];
                const sentenceSr = `${sub.translationSr} ${verbSr} ${noun.sr}.`;
                const sentenceEn = `${sub.translationEn} ${verb.en} ${noun.en}.`;

                return (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-2.5 mt-4 text-left">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                        Sklopljena Kineska Rečenica
                      </span>
                      <button
                        onClick={() => speakChinese(sentenceChar)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Volume2 className="w-4 h-4" /> Izgovori Rečenicu
                      </button>
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

            {/* CUSTOM WORD PICKER GRID */}
            <div className={cn(
              "p-6 rounded-3xl border space-y-4",
              isDarkMode ? "bg-zinc-900/80 border-amber-500/30" : "bg-amber-50/50 border-amber-200"
            )}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono">
                  Slobodni Sklop iz Rečnika (Izaberi reči)
                </h4>
                {selectedWeaverItems.length > 0 && (
                  <button
                    onClick={() => { setSelectedWeaverItems([]); setWovenSentence(null); }}
                    className="text-xs font-bold text-red-400 hover:text-red-300"
                  >
                    Očisti selekciju
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedWeaverItems.map(item => (
                  <span key={item.id} className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1.5">
                    {item.emoji} {item.char} [{item.pinyin}] ({item.vuk})
                    <button onClick={() => handleToggleWeaverSelect(item)} className="hover:text-red-300">×</button>
                  </span>
                ))}
                {selectedWeaverItems.length === 0 && (
                  <span className="text-xs italic text-zinc-500">Kliknite na karaktere iz rečnika ispod da ih spojite...</span>
                )}
              </div>

              {selectedWeaverItems.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={weaveSentence}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" /> Ispleti Slobodnu Rečenicu
                  </button>
                </div>
              )}

              {wovenSentence && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                  <p className="text-2xl font-serif font-black text-amber-300">{wovenSentence.chinese}</p>
                  <p className="text-xs font-mono font-bold text-amber-400">Pinyin: {wovenSentence.pinyin}</p>
                  <p className="text-xs font-mono font-bold text-emerald-400">Vuk: "{wovenSentence.vuk}"</p>
                  <p className="text-xs font-medium text-zinc-200">Prevod: {wovenSentence.serbian}</p>
                  <button
                    onClick={() => speakChinese(wovenSentence.chinese)}
                    className="mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Pusti Zvuk Rečenice
                  </button>
                </div>
              )}
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {VOCAB_DATA.slice(0, 36).map(item => {
                const isSelected = selectedWeaverItems.some(i => i.id === item.id);
                return (
                  <button
                    key={`weaver-pick-${item.id}`}
                    onClick={() => handleToggleWeaverSelect(item)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all",
                      isSelected 
                        ? "bg-amber-600 border-amber-500 text-white" 
                        : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/40" : "bg-white border-zinc-200 text-zinc-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-[10px] font-mono font-bold opacity-80">{item.pinyin}</span>
                    </div>
                    <p className="text-xl font-serif font-bold mt-1">{item.char}</p>
                  </button>
                );
              })}
            </div>
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
                  <p className="text-xs font-mono text-zinc-400">
                    Izaberite tačan prevod ili izgovor:
                  </p>
                  <button
                    onClick={() => speakChinese(roundQuestions[questionIdx].vocab.char)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 inline-flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Pusti Zvuk
                  </button>
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
    </div>
  );
};
