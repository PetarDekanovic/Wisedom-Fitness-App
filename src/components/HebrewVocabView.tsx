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
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { HEBREW_VOCAB_EXPANDED, HebrewVocabItem, getHebrewQuoteForItem } from '../data/hebrewVocabData';

export type { HebrewVocabItem };

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

const HEBREW_CONFIG_SUBJECTS = [
  { char: 'אֲנִי', vuk: 'Ani', translationSr: 'Ja', translationEn: 'I' },
  { char: 'אַתָּה', vuk: 'Atah', translationSr: 'Ti', translationEn: 'You' },
  { char: 'הֵם', vuk: 'Hem', translationSr: 'Oni', translationEn: 'They' },
];

const HEBREW_CONFIG_VERBS = [
  { char: { 'אֲנִי': 'לוֹמֵד', 'אַתָּה': 'לוֹמֵד', 'הֵם': 'לוֹמְדִים' }, vuk: { 'אֲנִי': 'lomed', 'אַתָּה': 'lomed', 'הֵם': 'lomdim' }, label: 'לוֹמֵד (Učiti)', sr: { 'אֲנִי': 'učim', 'אַתָּה': 'učiš', 'הֵם': 'uče' }, en: 'study' },
  { char: { 'אֲנִי': 'חוֹשֵׁב', 'אַתָּה': 'חוֹשֵׁב', 'הֵם': 'חוֹשְׁבִים' }, vuk: { 'אֲנִי': 'choshev', 'אַתָּה': 'choshev', 'הֵם': 'choshvim' }, label: 'חוֹשֵׁב (Misliti)', sr: { 'אֲנִי': 'promišljam o', 'אַתָּה': 'promišljaš o', 'הֵם': 'promišljaju o' }, en: 'ponder' },
  { char: { 'אֲנִי': 'אוֹהֵב', 'אַתָּה': 'אוֹהֵב', 'הֵם': 'אוֹהֲבִים' }, vuk: { 'אֲנִי': 'ohev', 'אַתָּה': 'ohev', 'הֵם': 'ohavim' }, label: 'אוֹהֵב (Voleti)', sr: { 'אֲנִי': 'volim', 'אַתָּה': 'voliš', 'הֵם': 'vole' }, en: 'love' },
  { char: { 'אֲנִי': 'מְחַפֵּשׂ', 'אַתָּה': 'מְחַפֵּשׂ', 'הֵם': 'מְחַפְּשִׂים' }, vuk: { 'אֲנִי': 'mechapes', 'אַתָּה': 'mechapes', 'הֵם': 'mechapsim' }, label: 'מְחַפֵּשׂ (Tražiti)', sr: { 'אֲנִי': 'tražim', 'אַתָּה': 'tražiš', 'הֵם': 'traže' }, en: 'seek' },
  { char: { 'אֲנִי': 'רוֹאֶה', 'אַתָּה': 'רוֹאֶה', 'הֵם': 'רוֹאִים' }, vuk: { 'אֲנִי': 'roeh', 'אַתָּה': 'roeh', 'הֵם': 'roim' }, label: 'רוֹאֶה (Videti)', sr: { 'אֲנִי': 'vidim', 'אַתָּה': 'vidiš', 'הֵם': 'vide' }, en: 'see' },
  { char: { 'אֲנִי': 'שׁוֹמֵעַ', 'אַתָּה': 'שׁוֹמֵעַ', 'הֵם': 'שׁוֹמְעִים' }, vuk: { 'אֲנִי': 'shomea', 'אַתָּה': 'shomea', 'הֵם': 'shomim' }, label: 'שׁוֹמֵעַ (Slušati)', sr: { 'אֲנִי': 'slušam', 'אַתָּה': 'slušaš', 'הֵם': 'slušaju' }, en: 'listen to' },
  { char: { 'אֲנִי': 'יוֹצֵר', 'אַתָּה': 'יוֹצֵר', 'הֵם': 'יוֹצְרִים' }, vuk: { 'אֲנִי': 'yotzer', 'אַתָּה': 'yotzer', 'הֵם': 'yotzrim' }, label: 'יוֹצֵר (Stvarati)', sr: { 'אֲנִי': 'stvaram', 'אַתָּה': 'stvaraš', 'הֵם': 'stvaraju' }, en: 'create' },
  { char: { 'אֲנִי': 'כּוֹתֵב', 'אַתָּה': 'כּוֹתֵב', 'הֵם': 'כּוֹתְבִים' }, vuk: { 'אֲנִי': 'kotev', 'אַתָּה': 'kotev', 'הֵם': 'kotvim' }, label: 'כּוֹתֵב (Pisati)', sr: { 'אֲנִי': 'pišem', 'אַתָּה': 'pišeš', 'הֵם': 'pišu' }, en: 'write' },
];

const HEBREW_CONFIG_NOUNS = [
  { char: 'חָכְמָה', vuk: 'chokhmah', sr: 'mudrost', en: 'wisdom' },
  { char: 'אֱמֶת', vuk: 'emet', sr: 'istinu', en: 'truth' },
  { char: 'שָׁלוֹם', vuk: 'shalom', sr: 'mir', en: 'peace' },
  { char: 'אוֹר', vuk: 'or', sr: 'svetlost', en: 'light' },
  { char: 'סֵפֶר', vuk: 'sefer', sr: 'knjigu', en: 'book' },
  { char: 'דֶּרֶךְ', vuk: 'derekh', sr: 'put', en: 'path' },
  { char: 'כֹּחַ', vuk: 'koach', sr: 'snagu', en: 'strength' },
  { char: 'לֵב', vuk: 'lev', sr: 'srce', en: 'heart' },
  { char: 'תִּקְוָה', vuk: 'tikvah', sr: 'nadu', en: 'hope' },
  { char: 'בְּרִיאוּת', vuk: 'briut', sr: 'zdravlje', en: 'health' },
];

const HEBREW_CONFIG_ADJECTIVES = [
  { char: 'מגְנִיב', vuk: 'megniv', sr: 'kul / super', en: 'cool' },
  { char: 'כֵּיף', vuk: 'kef', sr: 'zabavno', en: 'fun' },
  { char: 'יָפֶה', vuk: 'yafeh', sr: 'lepo / predivno', en: 'beautiful' },
  { char: 'מְעוּלֶה', vuk: 'meuleh', sr: 'sjajno / fantastično', en: 'awesome' },
  { char: 'טוֹב', vuk: 'tov', sr: 'dobro / divno', en: 'good / wonderful' },
  { char: 'חָכָם', vuk: 'chakham', sr: 'mudro', en: 'wise' },
  { char: 'חָזָק', vuk: 'chazak', sr: 'snažno', en: 'strong' },
  { char: 'רָגוּעַ', vuk: 'ragua', sr: 'spokojno / mirno', en: 'calm' },
];

const HEBREW_SOCIAL_PRESETS = [
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
  }
];

export interface HebrewVocabViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  user: User | null;
}

export const HebrewVocabView: React.FC<HebrewVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  // Navigation: Dictionary, Emoji Canvas, AI Weaver or Quiz
  const [activeTab, setActiveTab] = useState<'learn' | 'canvas' | 'weaver' | 'quiz'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3-Step Word Configurator State (I / You / They -> Verb -> Noun/Adjective OR Social Presets)
  const [hCfgSubIdx, setHCfgSubIdx] = useState(0); // 'אֲנִי'
  const [hCfgVerbIdx, setHCfgVerbIdx] = useState(1); // 'חוֹשֵׁב'
  const [hCfgEndingType, setHCfgEndingType] = useState<'noun' | 'adjective'>('noun');
  const [hCfgNounIdx, setHCfgNounIdx] = useState(0); // 'חָכְמָה'
  const [hCfgAdjIdx, setHCfgAdjIdx] = useState(0); // 'מגְנִיב'
  const [hSelectedSocialPresetIdx, setHSelectedSocialPresetIdx] = useState<number | null>(null);
  const [hCopiedConfigSentence, setHCopiedConfigSentence] = useState(false);

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

  const speakHebrewAudioFallback = (text: string, id?: string) => {
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
  };

  const speakHebrew = (text: string, id?: string) => {
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
  };

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

  const filteredVocab = useMemo(() => {
    return HEBREW_VOCAB_DATA.filter(item => {
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

  const generateQuizRound = () => {
    const shuffled = [...HEBREW_VOCAB_DATA].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
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
      setTimeout(() => speakHebrew(questionsList[0].vocab.char), 600);
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-purple-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Duo Kviz
            </button>
          </div>

          <div className={cn(
            "px-3 py-1.5 rounded-xl flex items-center gap-2 border font-mono text-xs font-black",
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-700"
          )}>
            <Trophy className="w-4 h-4 text-blue-500 fill-blue-500 animate-pulse" />
            <span>{masteredIds.length}/{HEBREW_VOCAB_DATA.length}</span>
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
              <div className="text-right font-mono text-xs font-bold text-blue-500">
                Savladano {Math.round((masteredIds.length / HEBREW_VOCAB_DATA.length) * 100)}% rečnika
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
                            {item.transliteration}
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
                          const quoteInfo = getHebrewQuoteForItem(item);
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

        {/* AI SENTENCE WEAVER */}
        {activeTab === 'weaver' && (
          <motion.div key="weaver-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* 3-STEP SENTENCE CONFIGURATOR */}
            <div className={cn(
              "p-6 rounded-3xl border space-y-6",
              isDarkMode ? "bg-zinc-900/90 border-blue-500/40 shadow-xl" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-md"
            )}>
              <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3 border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-500 animate-pulse" />
                  <h3 className="text-base font-black tracking-tight">Konfigurator Hebrejskih Rečenica & Social Media Izrazi</h3>
                </div>
                <span className="text-[10px] font-mono font-extrabold uppercase bg-blue-500/20 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/30">
                  Subjekat → Glagol → Imenica / Pridev
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
                      <span className="font-serif font-black" dir="rtl">{preset.char}</span>
                      <span className="text-[10px] opacity-75 font-normal">({preset.sr})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 1: SUBJECT */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 font-mono">
                  <span>1. Subjekat:</span>
                  <span className="text-[10px] font-normal opacity-80">(Izaberite subjekat)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {HEBREW_CONFIG_SUBJECTS.map((sub, idx) => (
                    <button
                      key={`hsub-${idx}`}
                      onClick={() => { setHCfgSubIdx(idx); setHSelectedSocialPresetIdx(null); }}
                      className={cn(
                        "p-3 rounded-2xl border transition-all text-center",
                        hSelectedSocialPresetIdx === null && hCfgSubIdx === idx
                          ? "bg-blue-600 text-white border-blue-500 shadow-md scale-[1.02]"
                          : isDarkMode ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:border-blue-500/50" : "bg-white border-blue-200 text-zinc-800 hover:bg-blue-100/50"
                      )}
                    >
                      <p className="text-xl font-serif font-black" dir="rtl">{sub.char}</p>
                      <p className="text-[10px] font-mono opacity-90">{sub.vuk}</p>
                      <p className="text-[10px] font-bold mt-0.5">{sub.translationSr}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: VERB */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 font-mono">
                  <span>2. Glagol:</span>
                  <span className="text-[10px] font-normal opacity-80">(Izaberite radnju)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {HEBREW_CONFIG_VERBS.map((v, idx) => {
                    const subChar = HEBREW_CONFIG_SUBJECTS[hCfgSubIdx].char;
                    const vChar = v.char[subChar as 'אֲנִי' | 'אַתָּה' | 'הֵם'];
                    const vVuk = v.vuk[subChar as 'אֲנִי' | 'אַתָּה' | 'הֵם'];
                    return (
                      <button
                        key={`hverb-${idx}`}
                        onClick={() => { setHCfgVerbIdx(idx); setHSelectedSocialPresetIdx(null); }}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                          hSelectedSocialPresetIdx === null && hCfgVerbIdx === idx
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-blue-500/40" : "bg-white border-blue-200 text-zinc-700 hover:bg-blue-100/50"
                        )}
                      >
                        <span className="font-serif text-sm font-black" dir="rtl">{vChar}</span>
                        <span className="text-[10px] opacity-80 font-mono">({vVuk})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: NOUN OR ADJECTIVE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 font-mono">
                    <span>3. Kraj Rečenice (Imenica ili Pridev):</span>
                  </label>
                  <div className="flex bg-blue-500/20 p-0.5 rounded-lg border border-blue-500/30 font-mono text-[10px]">
                    <button
                      onClick={() => setHCfgEndingType('noun')}
                      className={cn("px-2.5 py-1 rounded-md font-bold transition-all", hCfgEndingType === 'noun' ? "bg-blue-600 text-white shadow" : "text-blue-400 hover:text-white")}
                    >
                      Imenice (Pojmovi)
                    </button>
                    <button
                      onClick={() => setHCfgEndingType('adjective')}
                      className={cn("px-2.5 py-1 rounded-md font-bold transition-all", hCfgEndingType === 'adjective' ? "bg-blue-600 text-white shadow" : "text-blue-400 hover:text-white")}
                    >
                      Pridevi (Opisi) ✨
                    </button>
                  </div>
                </div>

                {hCfgEndingType === 'noun' ? (
                  <div className="flex flex-wrap gap-2">
                    {HEBREW_CONFIG_NOUNS.map((n, idx) => (
                      <button
                        key={`hnoun-${idx}`}
                        onClick={() => { setHCfgNounIdx(idx); setHSelectedSocialPresetIdx(null); }}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                          hSelectedSocialPresetIdx === null && hCfgNounIdx === idx
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-blue-500/40" : "bg-white border-blue-200 text-zinc-700 hover:bg-blue-100/50"
                        )}
                      >
                        <span className="font-serif text-sm font-black" dir="rtl">{n.char}</span>
                        <span className="text-[10px] opacity-80 font-mono">({n.sr})</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {HEBREW_CONFIG_ADJECTIVES.map((adj, idx) => (
                      <button
                        key={`hadj-${idx}`}
                        onClick={() => { setHCfgAdjIdx(idx); setHSelectedSocialPresetIdx(null); }}
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5",
                          hSelectedSocialPresetIdx === null && hCfgAdjIdx === idx
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : isDarkMode ? "bg-zinc-800/70 border-zinc-700 text-zinc-300 hover:border-blue-500/40" : "bg-white border-blue-200 text-blue-800 hover:bg-blue-100/50"
                        )}
                      >
                        <span className="font-serif text-sm font-black" dir="rtl">{adj.char}</span>
                        <span className="text-[10px] opacity-80 font-mono">({adj.sr})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* GENERATED CONFIGURATOR PREVIEW CARD */}
              {(() => {
                let sentenceHebrew = '';
                let sentenceVuk = '';
                let sentenceSr = '';
                let sentenceEn = '';

                if (hSelectedSocialPresetIdx !== null) {
                  const preset = HEBREW_SOCIAL_PRESETS[hSelectedSocialPresetIdx];
                  sentenceHebrew = preset.char;
                  sentenceVuk = preset.vuk;
                  sentenceSr = preset.sr;
                  sentenceEn = preset.en;
                } else {
                  const sub = HEBREW_CONFIG_SUBJECTS[hCfgSubIdx];
                  const verbObj = HEBREW_CONFIG_VERBS[hCfgVerbIdx];
                  const subChar = sub.char as 'אֲנִי' | 'אַתָּה' | 'הֵם';
                  const verbChar = verbObj.char[subChar];
                  const verbVuk = verbObj.vuk[subChar];
                  const verbSr = verbObj.sr[subChar];

                  if (hCfgEndingType === 'noun') {
                    const noun = HEBREW_CONFIG_NOUNS[hCfgNounIdx];
                    sentenceHebrew = `${subChar} ${verbChar} ${noun.char}`;
                    sentenceVuk = `${sub.vuk} ${verbVuk} ${noun.vuk}`;
                    sentenceSr = `${sub.translationSr} ${verbSr} ${noun.sr}.`;
                    sentenceEn = `${sub.translationEn} ${verbObj.en} ${noun.en}.`;
                  } else {
                    const adj = HEBREW_CONFIG_ADJECTIVES[hCfgAdjIdx];
                    sentenceHebrew = `${subChar} ${verbChar} ${adj.char}`;
                    sentenceVuk = `${sub.vuk} ${verbVuk} ${adj.vuk}`;
                    sentenceSr = `${sub.translationSr} ${verbSr} ${adj.sr}.`;
                    sentenceEn = `${sub.translationEn} ${verbObj.en} ${adj.en}.`;
                  }
                }

                const socialShareText = `${sentenceHebrew} (${sentenceVuk}) - "${sentenceSr}" #WiseFit #Hebrew #Stoic`;

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
                          title="Kopiraj za Facebook / Instagram / Twitter"
                        >
                          {hCopiedConfigSentence ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{hCopiedConfigSentence ? "Kopirano!" : "Kopiraj za Social Media"}</span>
                        </button>

                        <button
                          onClick={() => speakHebrew(sentenceHebrew)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500 text-white hover:bg-blue-400 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Izgovori
                        </button>
                      </div>
                    </div>

                    <p className="text-3xl font-serif font-black text-blue-300 tracking-wide text-right" dir="rtl">
                      {sentenceHebrew}
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

            {/* CUSTOM WORD PICKER GRID */}
            <div className={cn(
              "p-6 rounded-3xl border space-y-4",
              isDarkMode ? "bg-zinc-900/80 border-purple-500/30" : "bg-purple-50/50 border-purple-200"
            )}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 font-mono">
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
                  <span key={item.id} className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-600 text-white flex items-center gap-1.5">
                    {item.emoji} {item.char} ({item.vuk})
                    <button onClick={() => handleToggleWeaverSelect(item)} className="hover:text-red-300">×</button>
                  </span>
                ))}
                {selectedWeaverItems.length === 0 && (
                  <span className="text-xs italic text-zinc-500">Kliknite na reči iz rečnika ispod da ih spojite...</span>
                )}
              </div>

              {selectedWeaverItems.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={weaveSentence}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-all flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" /> Ispleti Slobodnu Rečenicu
                  </button>
                </div>
              )}

              {wovenSentence && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                  <p className="text-xl font-serif font-bold text-purple-300" dir="rtl">{wovenSentence.hebrew}</p>
                  <p className="text-xs font-mono font-bold text-emerald-400">Vuk: "{wovenSentence.vuk}"</p>
                  <p className="text-xs font-medium text-zinc-200">Prevod: {wovenSentence.serbian}</p>
                  <button
                    onClick={() => speakHebrew(wovenSentence.hebrew)}
                    className="mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-purple-600 text-white flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Pusti Zvuk Rečenice
                  </button>
                </div>
              )}
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {HEBREW_VOCAB_DATA.slice(0, 36).map(item => {
                const isSelected = selectedWeaverItems.some(i => i.id === item.id);
                return (
                  <button
                    key={`weaver-pick-${item.id}`}
                    onClick={() => handleToggleWeaverSelect(item)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all",
                      isSelected 
                        ? "bg-purple-600 border-purple-500 text-white" 
                        : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-purple-500/40" : "bg-white border-zinc-200 text-zinc-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-[10px] font-mono font-bold opacity-80">{item.vuk}</span>
                    </div>
                    <p className="text-sm font-bold mt-1">{item.char}</p>
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
                <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
                  🕎
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-black tracking-tight">Hebrejski Duo Kviz Arena</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Testirajte svoje znanje hebrejskih reči, korena i Vuk Karadžić transliteracije kroz 5 brzih i izazovnih pitanja.
                  </p>
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
                  className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
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
                  <h3 className="text-3xl font-serif font-black text-blue-500" dir="rtl">
                    {roundQuestions[questionIdx].vocab.char}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Izaberite tačan prevod ili Vuk izgovor:
                  </p>
                  <button
                    onClick={() => speakHebrew(roundQuestions[questionIdx].vocab.char)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 inline-flex items-center gap-1.5"
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
                          !isAnswered && (isDarkMode ? "bg-zinc-800/60 border-zinc-700 hover:border-blue-500" : "bg-zinc-50 border-zinc-200 hover:border-blue-400"),
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
                      className="px-6 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-500 transition-all"
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
      </AnimatePresence>
    </div>
  );
};
