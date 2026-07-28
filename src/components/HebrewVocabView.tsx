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
  Heart,
  ChevronRight,
  RefreshCw,
  Search,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface HebrewVocabViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  user: User | null;
}

export interface HebrewVocabItem {
  id: string;
  char: string;
  transliteration: string;
  vuk: string;
  translation: string;
  english: string;
  emoji: string;
  category: 'mudrost' | 'svakodnevno' | 'priroda' | 'glagoli';
  categoryLabel: string;
}

const HEBREW_VOCAB_DATA: HebrewVocabItem[] = [
  // Mudrost & Filozofija
  { id: 'h1', char: 'שָׁלוֹם', transliteration: 'Shalom', vuk: 'šalom', translation: 'Mir / Spokoj', english: 'Peace / Harmony / Hello', emoji: '🕊️', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h2', char: 'אַהֲבָה', transliteration: 'Ahava', vuk: 'ahava', translation: 'Ljubav', english: 'Love', emoji: '💖', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h3', char: 'אוֹר', transliteration: 'Or', vuk: 'or', translation: 'Svetlost', english: 'Light', emoji: '✨', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h4', char: 'חַיִּים', transliteration: 'Chaim', vuk: 'chajim', translation: 'Život', english: 'Life', emoji: '🌱', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h5', char: 'לֵב', transliteration: 'Lev', vuk: 'lev', translation: 'Srce', english: 'Heart', emoji: '❤️', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h6', char: 'נְשָׁמָה', transliteration: 'Neshama', vuk: 'nešama', translation: 'Duša', english: 'Soul / Spirit', emoji: '👼', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h7', char: 'אֱמֶת', transliteration: 'Emet', vuk: 'emet', translation: 'Istina', english: 'Truth', emoji: '⚖️', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h8', char: 'חָכְמָה', transliteration: 'Chokhmah', vuk: 'hohma', translation: 'Mudrost', english: 'Wisdom', emoji: '🦉', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h9', char: 'בְּרָכָה', transliteration: 'Brakha', vuk: 'braha', translation: 'Blagoslov', english: 'Blessing', emoji: '🕯️', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h10', char: 'תִּקְוָה', transliteration: 'Tikvah', vuk: 'tikva', translation: 'Nada', english: 'Hope', emoji: '🌟', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h11', char: 'שִׂמְחָה', transliteration: 'Simcha', vuk: 'simha', translation: 'Radost / Sreća', english: 'Joy / Happiness', emoji: '😄', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h12', char: 'כֹּחַ', transliteration: 'Koach', vuk: 'koah', translation: 'Snaga / Moć', english: 'Strength / Power', emoji: '💪', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h13', char: 'תּוֹרָה', transliteration: 'Torah', vuk: 'tora', translation: 'Učenje / Zakon', english: 'Torah / Teaching', emoji: '📜', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h14', char: 'שַׁבָּת', transliteration: 'Shabbat', vuk: 'šabat', translation: 'Subota / Odmor', english: 'Sabbath / Day of Rest', emoji: '🍷', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h15', char: 'תְּפִלָּה', transliteration: 'Tefillah', vuk: 'tefila', translation: 'Molitva', english: 'Prayer', emoji: '🙏', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h16', char: 'אֱלֹהִים', transliteration: 'Elohim', vuk: 'elohim', translation: 'Bog / Tvorac', english: 'God / Creator', emoji: '👑', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h17', char: 'מֶלֶךְ', transliteration: 'Melekh', vuk: 'meleh', translation: 'Kralj / Vladar', english: 'King / Ruler', emoji: '🏰', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h18', char: 'כָּבוֹד', transliteration: 'Kavod', vuk: 'kavod', translation: 'Čast / Slava', english: 'Honor / Glory', emoji: '🎖️', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h19', char: 'קֹדֶשׁ', transliteration: 'Kodesh', vuk: 'kodeš', translation: 'Svetost', english: 'Holiness / Sacredness', emoji: '⛪', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h20', char: 'רוּחַ', transliteration: 'Ruach', vuk: 'ruah', translation: 'Duh / Vetar / Dah', english: 'Spirit / Wind / Breath', emoji: '💨', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h21', char: 'חֶסֶד', transliteration: 'Chesed', vuk: 'hesed', translation: 'Dobrota / Milost', english: 'Kindness / Loving-kindness', emoji: '🤝', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h22', char: 'צֶדֶק', transliteration: 'Tzedek', vuk: 'cedek', translation: 'Pravda', english: 'Justice / Righteousness', emoji: '⚖️', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h23', char: 'תְּשׁוּבָה', transliteration: 'Teshuva', vuk: 'tešuva', translation: 'Povratak / Obnova', english: 'Return / Repentance', emoji: '🔄', category: 'mudrost', categoryLabel: 'Mudrost' },
  { id: 'h24', char: 'עוֹלָם', transliteration: 'Olam', vuk: 'olam', translation: 'Svet / Večnost', english: 'World / Eternity', emoji: '🌍', category: 'mudrost', categoryLabel: 'Mudrost' },

  // Svakodnevno
  { id: 'h25', char: 'תּוֹדָה', transliteration: 'Todah', vuk: 'toda', translation: 'Hvala', english: 'Thank you', emoji: '🙏', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h26', char: 'בְּבַקָּשָׁה', transliteration: 'Bevakasha', vuk: 'bevakaša', translation: 'Molim / Nema na čemu', english: 'Please / You are welcome', emoji: '😊', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h27', char: 'לְהִתְרָאוֹת', transliteration: 'Lehitraot', vuk: 'lehitraot', translation: 'Doviđenja', english: 'Goodbye / See you later', emoji: '👋', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h28', char: 'בֹּקֶר טוֹב', transliteration: 'Boker Tov', vuk: 'boker tov', translation: 'Dobro jutro', english: 'Good morning', emoji: '🌅', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h29', char: 'לַיְלָה טוֹב', transliteration: 'Layla Tov', vuk: 'lajla tov', translation: 'Laku noć', english: 'Good night', emoji: '🌙', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h30', char: 'כֵּן', transliteration: 'Ken', vuk: 'ken', translation: 'Da', english: 'Yes', emoji: '✅', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h31', char: 'לֹא', transliteration: 'Lo', vuk: 'lo', translation: 'Ne', english: 'No', emoji: '❌', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h32', char: 'סְלִיחָה', transliteration: 'Slicha', vuk: 'sliha', translation: 'Izvini / Oprostite', english: 'Sorry / Excuse me', emoji: '🙇', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h33', char: 'בַּיִת', transliteration: 'Bayit', vuk: 'bajit', translation: 'Kuća / Dom', english: 'House / Home', emoji: '🏠', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h34', char: 'מַפְתֵּחַ', transliteration: 'Mafteach', vuk: 'nafteah', translation: 'Ključ', english: 'Key', emoji: '🔑', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h35', char: 'סֵפֶר', transliteration: 'Sefer', vuk: 'sefer', translation: 'Knjiga', english: 'Book', emoji: '📖', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h36', char: 'מַיִם', transliteration: 'Mayim', vuk: 'majim', translation: 'Voda', english: 'Water', emoji: '💧', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h37', char: 'לֶחֶם', transliteration: 'Lechem', vuk: 'lehem', translation: 'Hleb', english: 'Bread', emoji: '🍞', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h38', char: 'יַיִן', transliteration: 'Yayin', vuk: 'jajin', translation: 'Vino', english: 'Wine', emoji: '🍷', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h39', char: 'כֶּסֶף', transliteration: 'Kesef', vuk: 'kesef', translation: 'Novac / Srebro', english: 'Money / Silver', emoji: '💵', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h40', char: 'חָבֵר', transliteration: 'Chaver', vuk: 'haver', translation: 'Prijatelj', english: 'Friend', emoji: '🤝', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h41', char: 'מִשְׁפָּחָה', transliteration: 'Mishpacha', vuk: 'mišpaha', translation: 'Porodica', english: 'Family', emoji: '👨‍👩‍👧‍👦', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h42', char: 'אִישׁ', transliteration: 'Ish', vuk: 'iš', translation: 'Čovek / Muškarac', english: 'Man / Person', emoji: '🧔', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h43', char: 'אִשָּׁה', transliteration: 'Isha', vuk: 'iša', translation: 'Žena', english: 'Woman', emoji: '👩', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h44', char: 'יֶלֶד', transliteration: 'Yeled', vuk: 'jeled', translation: 'Dete / Dečak', english: 'Child / Boy', emoji: '👦', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h45', char: 'יוֹם', transliteration: 'Yom', vuk: 'jom', translation: 'Dan', english: 'Day', emoji: '☀️', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h46', char: 'זְמַן', transliteration: 'Zman', vuk: 'zman', translation: 'Vreme', english: 'Time', emoji: '⏳', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h47', char: 'יְרוּשָׁלַיִם', transliteration: 'Yerushalayim', vuk: 'jerusalim', translation: 'Jerusalim', english: 'Jerusalem', emoji: '🕌', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h48', char: 'תֵּה', transliteration: 'Te', vuk: 'te', translation: 'Čaj', english: 'Tea', emoji: '🍵', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },

  // Priroda & Stvaranje
  { id: 'h49', char: 'אֶרֶץ', transliteration: 'Eretz', vuk: 'erec', translation: 'Zemlja', english: 'Land / Earth', emoji: '🌍', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h50', char: 'שָׁמַיִם', transliteration: 'Shamayim', vuk: 'šamajim', translation: 'Nebo', english: 'Sky / Heavens', emoji: '☁️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h51', char: 'שֶׁמֶשׁ', transliteration: 'Shemesh', vuk: 'šemeš', translation: 'Sunce', english: 'Sun', emoji: '☀️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h52', char: 'יָרֵחַ', transliteration: 'Yareach', vuk: 'jareah', translation: 'Mesec', english: 'Moon', emoji: '🌙', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h53', char: 'כּוֹכָבִים', transliteration: 'Kokhavim', vuk: 'kohavim', translation: 'Zvezde', english: 'Stars', emoji: '🌟', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h54', char: 'אֵשׁ', transliteration: 'Esh', vuk: 'eš', translation: 'Vatra', english: 'Fire', emoji: '🔥', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h55', char: 'יָם', transliteration: 'Yam', vuk: 'jam', translation: 'More', english: 'Sea / Ocean', emoji: '🌊', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h56', char: 'הַר', transliteration: 'Har', vuk: 'har', translation: 'Planina', english: 'Mountain', emoji: '🏔️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h57', char: 'עֵץ', transliteration: 'Etz', vuk: 'ec', translation: 'Drvo', english: 'Tree', emoji: '🌳', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h58', char: 'פֶּרַח', transliteration: 'Perach', vuk: 'perah', translation: 'Cvet', english: 'Flower', emoji: '🌸', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h59', char: 'דֶּרֶךְ', transliteration: 'Derekh', vuk: 'derek', translation: 'Put / Staza', english: 'Way / Path / Road', emoji: '🛣️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h60', char: 'גַּן', transliteration: 'Gan', vuk: 'gan', translation: 'Bašta / Vrt', english: 'Garden', emoji: '🏡', category: 'priroda', categoryLabel: 'Priroda' },

  // Glagoli & Radnja
  { id: 'h61', char: 'לִלְמֹד', transliteration: 'Lilmod', vuk: 'lilmod', translation: 'Učiti', english: 'To learn / study', emoji: '🎓', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h62', char: 'לֶאֱכֹל', transliteration: 'Leekhol', vuk: 'lehol', translation: 'Jesti', english: 'To eat', emoji: '🍎', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h63', char: 'לִשְׁתּוֹת', transliteration: 'Lishtot', vuk: 'lištot', translation: 'Piti', english: 'To drink', emoji: '🥤', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h64', char: 'לָלֶכֶת', transliteration: 'Lalekhet', vuk: 'lalehet', translation: 'Ići / Hodati', english: 'To walk / go', emoji: '🚶', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h65', char: 'לִרְצוֹת', transliteration: 'Lirtzot', vuk: 'lircot', translation: 'Želeti', english: 'To want / desire', emoji: '💭', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h66', char: 'לָדַעַת', transliteration: 'Ladaat', vuk: 'ladaat', translation: 'Znati / Razumeti', english: 'To know / understand', emoji: '💡', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h67', char: 'לִרְאוֹת', transliteration: 'Lirot', vuk: 'lirot', translation: 'Videti / Gledati', english: 'To see / look', emoji: '👁️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h68', char: 'לִשְׁמֹעַ', transliteration: 'Lishmoa', vuk: 'lišmoa', translation: 'Slušati / Čuti', english: 'To hear / listen', emoji: '👂', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h69', char: 'לְדַבֵּר', transliteration: 'Ledaber', vuk: 'ledaber', translation: 'Govoriti', english: 'To speak / talk', emoji: '💬', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h70', char: 'לִכְתֹּב', transliteration: 'Likhtov', vuk: 'lihtov', translation: 'Pisati', english: 'To write', emoji: '✍️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h71', char: 'לִקְרֹא', transliteration: 'Likro', vuk: 'likro', translation: 'Čitati', english: 'To read', emoji: '📖', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h72', char: 'לֶאֱהֹב', transliteration: 'Leehov', vuk: 'lehov', translation: 'Voleti', english: 'To love', emoji: '🥰', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h73', char: 'לַעֲשׂוֹת', transliteration: 'Laasot', vuk: 'laasot', translation: 'Raditi / Činiti', english: 'To do / make', emoji: '🛠️', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h74', char: 'לָשִׁיר', transliteration: 'Lashir', vuk: 'lašir', translation: 'Pevati', english: 'To sing', emoji: '🎵', category: 'glagoli', categoryLabel: 'Glagoli' },
  { id: 'h75', char: 'לַחֲשֹׁב', transliteration: 'Lachshov', vuk: 'lahšov', translation: 'Misliti', english: 'To think', emoji: '🧠', category: 'glagoli', categoryLabel: 'Glagoli' }
];

export const HebrewVocabView: React.FC<HebrewVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  // Navigation: Dictionary or Game mode
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mudrost' | 'svakodnevno' | 'priroda' | 'glagoli'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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
    const textToCopy = `${item.emoji} ${item.char} [${item.transliteration}] (${item.vuk})\n🇭🇷 ${item.translation}\n🇬🇧 ${item.english}\n\n✨ Shared via WiseFit Sanctuary`;

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

  // Play synthesized tone for Duolingo sound effects
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
      console.warn("AudioContext blocked or not supported:", e);
    }
  };

  // Pre-load voices for WebSpeech API
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Speak Hebrew word using Native WebSpeech API (he-IL)
  const speakHebrew = (text: string, id?: string) => {
    if (!('speechSynthesis' in window)) return;
    
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("speechSynthesis cancel warning:", e);
    }
    
    if (id) setIsPronouncing(id);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.85; // Slightly slower pace for optimal learning
    
    const voices = window.speechSynthesis.getVoices();
    const heVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith('he') || 
      v.lang.toLowerCase().includes('he-il') || 
      v.name.toLowerCase().includes('hebrew') ||
      v.name.toLowerCase().includes('carmit')
    );
    
    if (heVoice) {
      utterance.voice = heVoice;
    }
    
    utterance.onend = () => {
      if (id) setIsPronouncing(null);
    };
    utterance.onerror = (e) => {
      console.warn("Speech synthesis error or interrupted:", e);
      if (id) setIsPronouncing(null);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Load Saved Progress from Firestore or LocalStorage
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
          console.error("Error fetching Hebrew progress:", e);
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

  // Save Progress
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
        console.error("Error saving Hebrew progress to Firestore:", e);
      }
    } else {
      localStorage.setItem('wf_hebrew_mastered', JSON.stringify(newMastered));
      localStorage.setItem('wf_hebrew_highscore', Math.max(highScore, newHighScore).toString());
    }
  };

  // Filtered Vocab
  const filteredVocab = useMemo(() => {
    return HEBREW_VOCAB_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        item.char.toLowerCase().includes(q) ||
        item.transliteration.toLowerCase().includes(q) ||
        item.vuk.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Toggle mastered status manually
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

  // Generate a round of 5 questions
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
      } else { // listen
        correctAnswer = `${vocab.char} — ${vocab.emoji} ${vocab.translation} (${vocab.english})`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} — ${w.emoji} ${w.translation} (${w.english})`);
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
      if (score > highScore) {
        saveProgress(masteredIds, score);
      }
    }
  };

  const getRankInfo = (count: number) => {
    if (count >= 60) return { name: "Gospodar Reči (Master) 👑", icon: "👑", desc: "Znaš preko 60 hebrejskih reči! Pravi izrailski mudrac.", nextMilestone: null };
    if (count >= 40) return { name: "Izrailski Mudrac (Sage) 🕎", icon: "🕎", desc: "Savladano preko 40 reči. Tvoj um spaja drevno i moderno.", nextMilestone: 60 };
    if (count >= 25) return { name: "Učeni Rabin (Scholar) 🕯️", icon: "🕯️", desc: "Savladano preko 25 reči. Tvoje znanje osvetljava stazu.", nextMilestone: 40 };
    if (count >= 10) return { name: "Učenik Tore (Student) 📜", icon: "📜", desc: "Savladano preko 10 reči. Uspešno usvajaš drevne znakove.", nextMilestone: 25 };
    return { name: "Tragač Mudrosti (Seeker) 🧭", icon: "🧭", desc: "Započinješ hebrejsku stazu. Označi prve reči kao naučene!", nextMilestone: 10 };
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-zinc-500/10">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl relative select-none shadow-md",
            isGirlyMode 
              ? "bg-pink-100 text-pink-500 border border-pink-200" 
              : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
          )}>
            עִבְרִית
          </div>
          <div>
            <h3 className={cn(
              "text-lg font-black tracking-tight flex items-center gap-2",
              isGirlyMode ? "text-pink-900" : isDarkMode ? "text-zinc-100" : "text-zinc-900"
            )}>
              Hebrew Vocab <span className="text-xs px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-500 font-mono">{HEBREW_VOCAB_DATA.length} Reči</span>
            </h3>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              Reči za učenje sa engleskim i srpskim prevodom
            </p>
          </div>
        </div>

        {/* Mode & Progress Switcher */}
        <div className="flex items-center gap-2">
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
                    : "bg-blue-600 text-white shadow-sm"
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
                    : "bg-blue-600 text-white shadow-sm"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Duo Kviz
            </button>
          </div>

          <div className={cn(
            "px-3.5 py-2 rounded-xl flex items-center gap-2 border font-mono text-xs font-black",
            isGirlyMode 
              ? "bg-pink-50 border-pink-100 text-pink-600" 
              : isDarkMode 
                ? "bg-zinc-900 border-zinc-800 text-blue-400" 
                : "bg-blue-50 border-blue-100 text-blue-700"
          )}>
            <Trophy className="w-4 h-4 text-blue-500 fill-blue-500 animate-pulse" />
            <span>{masteredIds.length}/{HEBREW_VOCAB_DATA.length}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* DICTIONARY VIEW */}
        {activeTab === 'learn' && (
          <motion.div
            key="learn-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Rank Dashboard */}
            <div className={cn(
              "p-6 rounded-[32px] border relative overflow-hidden transition-all duration-300 shadow-md",
              isGirlyMode 
                ? "bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border-pink-500/20 shadow-pink-500/5" 
                : isDarkMode 
                  ? "bg-gradient-to-br from-blue-500/10 via-zinc-900/50 to-zinc-950 border-blue-500/20 shadow-blue-500/5"
                  : "bg-gradient-to-br from-blue-50 to-white border-zinc-200/80 shadow-zinc-200/50"
            )}>
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
                      isGirlyMode ? "text-pink-600" : "text-blue-500"
                    )}>
                      ČIN:
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide",
                      isGirlyMode 
                        ? "bg-pink-100 text-pink-700" 
                        : isDarkMode 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "bg-blue-100 text-blue-800"
                    )}>
                      {getRankInfo(masteredIds.length).name}
                    </span>
                  </div>

                  <h4 className={cn(
                    "text-sm font-black tracking-tight",
                    isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-50" : "text-zinc-900"
                  )}>
                    Hebrejska Akademija Mudrosti
                  </h4>
                  <p className="text-[11px] font-bold text-zinc-400 leading-relaxed">
                    {getRankInfo(masteredIds.length).desc}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono text-right w-full md:w-auto">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn(
                      "text-3xl font-black leading-none",
                      isGirlyMode ? "text-pink-600" : "text-blue-500"
                    )}>
                      {masteredIds.length}
                    </span>
                    <span className="text-zinc-400 font-bold text-xs">/ {HEBREW_VOCAB_DATA.length}</span>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Savladane Reči
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5 space-y-2 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-mono font-black text-zinc-400">
                  <span>Progres do potpunog Gospodstva</span>
                  <span>{Math.round((masteredIds.length / HEBREW_VOCAB_DATA.length) * 100)}%</span>
                </div>

                <div className="h-3 rounded-full bg-zinc-500/10 overflow-hidden border border-zinc-500/5 relative flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(masteredIds.length / HEBREW_VOCAB_DATA.length) * 100}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-500 relative",
                      isGirlyMode 
                        ? "bg-gradient-to-r from-pink-400 to-pink-500" 
                        : "bg-gradient-to-r from-blue-400 to-cyan-500"
                    )}
                  />
                </div>

                {getRankInfo(masteredIds.length).nextMilestone !== null ? (
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                    <p className="flex items-center gap-1">
                      <span>Sledeći nivo na:</span>
                      <strong className={isGirlyMode ? "text-pink-500" : "text-blue-500"}>
                        {getRankInfo(masteredIds.length).nextMilestone} reči
                      </strong>
                    </p>
                    <p>
                      Preostalo još{" "}
                      <strong className={isGirlyMode ? "text-pink-500" : "text-blue-500"}>
                        {getRankInfo(masteredIds.length).nextMilestone! - masteredIds.length}
                      </strong>{" "}
                      reči!
                    </p>
                  </div>
                ) : (
                  <div className="text-[10px] font-black text-amber-500 text-center uppercase tracking-widest mt-1">
                    👑 Čestitamo! Otključao si drevnu mudrost hebrejskog jezika! 👑
                  </div>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search Hebrew words, English, Serbian, or transliteration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium border transition-all focus:outline-none focus:ring-2",
                    isDarkMode 
                      ? "bg-zinc-900/40 border-zinc-800 text-zinc-200 focus:ring-blue-500/20 focus:border-blue-500" 
                      : "bg-white border-zinc-200 text-zinc-950 focus:ring-blue-500/10 focus:border-blue-500"
                  )}
                />
              </div>

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
                  onClick={() => setSelectedCategory('mudrost')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'mudrost'
                      ? isGirlyMode ? "bg-pink-500 text-white shadow-sm" : "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Mudrost 🕎
                </button>
                <button
                  onClick={() => setSelectedCategory('svakodnevno')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'svakodnevno'
                      ? isGirlyMode ? "bg-pink-500 text-white shadow-sm" : "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Svakodnevno 💬
                </button>
                <button
                  onClick={() => setSelectedCategory('priroda')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'priroda'
                      ? isGirlyMode ? "bg-pink-500 text-white shadow-sm" : "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Priroda 🌿
                </button>
                <button
                  onClick={() => setSelectedCategory('glagoli')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap",
                    selectedCategory === 'glagoli'
                      ? isGirlyMode ? "bg-pink-500 text-white shadow-sm" : "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  )}
                >
                  Glagoli ⚙️
                </button>
              </div>
            </div>

            {/* Vocabulary Cards Grid */}
            {filteredVocab.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-500/10 rounded-[30px] p-6">
                <p className="text-sm font-bold text-zinc-400">Nismo pronašli nijednu reč za tu pretragu.</p>
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
                      onClick={() => speakHebrew(item.char, item.id)}
                      className={cn(
                        "p-5 rounded-[32px] border relative overflow-hidden transition-all duration-300 group cursor-pointer flex flex-col justify-between min-h-[185px] hover:shadow-lg active:scale-95",
                        isMastered
                          ? isGirlyMode 
                            ? "bg-pink-500/5 border-pink-500/20 shadow-md shadow-pink-500/5"
                            : "bg-blue-500/5 border-blue-500/30 shadow-md shadow-blue-500/5"
                          : isDarkMode 
                            ? "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900" 
                            : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm shadow-zinc-200/50"
                      )}
                    >
                      {/* Top Header Actions */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          {/* Audio Speaker */}
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                            isTalking 
                              ? isGirlyMode ? "bg-pink-500 text-white scale-110" : "bg-blue-600 text-white scale-110 animate-pulse"
                              : "bg-zinc-500/10 text-zinc-400 group-hover:bg-zinc-500/20 group-hover:text-zinc-600 dark:group-hover:text-zinc-200"
                          )}>
                            <Volume2 className={cn("w-3.5 h-3.5", isTalking && "animate-bounce")} />
                          </div>

                          {/* Copy Action */}
                          <button
                            onClick={(e) => handleCopy(item, e)}
                            title="Kopiraj za deljenje"
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center transition-all border border-transparent",
                              copiedId === item.id
                                ? isGirlyMode ? "bg-pink-500 text-white scale-110" : "bg-blue-600 text-white scale-110"
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

                        {/* Emoji */}
                        <span className="text-xl select-none filter drop-shadow-sm transition-transform duration-300 group-hover:scale-125">
                          {item.emoji}
                        </span>

                        {/* Mastery Checkbox */}
                        <button
                          onClick={(e) => toggleMastered(item.id, e)}
                          title={isMastered ? "Označi kao naučeno (Klikni da ukloniš)" : "Označi kao naučeno"}
                          className={cn(
                            "w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300",
                            isMastered 
                              ? isGirlyMode 
                                ? "bg-pink-500 border-pink-500 text-white shadow-sm shadow-pink-500/20"
                                : "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20"
                              : isGirlyMode
                                ? "bg-zinc-500/5 border-zinc-200 dark:border-zinc-800 text-zinc-300 hover:border-pink-300 hover:text-pink-500"
                                : "bg-zinc-500/5 border-zinc-200 dark:border-zinc-800 text-zinc-300 hover:border-blue-300 hover:text-blue-500"
                          )}
                        >
                          <Check className={cn(
                            "w-3.5 h-3.5 transition-all",
                            isMastered ? "scale-110 stroke-[3px]" : "scale-90 stroke-[2px]"
                          )} />
                        </button>
                      </div>

                      {/* Display Hebrew Word */}
                      <div className="my-1.5">
                        <div className={cn(
                          "text-2xl font-black tracking-wide leading-tight font-serif dir-rtl",
                          isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-50" : "text-zinc-900"
                        )}>
                          {item.char}
                        </div>
                      </div>

                      {/* Pronunciation & Translations */}
                      <div className="space-y-1 border-t border-zinc-500/10 pt-2 mt-auto">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-mono tracking-wide font-bold">
                          <span className={isGirlyMode ? "text-pink-500" : "text-blue-500"}>
                            {item.transliteration}
                          </span>
                          <span className="text-zinc-400">|</span>
                          <span className={cn(
                            "px-1 py-0.2 rounded text-[9.5px]",
                            isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-700"
                          )}>
                            vuk: {item.vuk}
                          </span>
                        </div>

                        {/* Croatian & English Translations */}
                        <div className="space-y-0.5">
                          <div className={cn(
                            "text-xs font-black tracking-tight line-clamp-1",
                            isGirlyMode ? "text-pink-900" : isDarkMode ? "text-zinc-200" : "text-zinc-800"
                          )}>
                            🇭🇷 {item.translation}
                          </div>
                          <div className="text-[10.5px] font-bold text-cyan-500 dark:text-cyan-400 line-clamp-1">
                            🇬🇧 {item.english}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* DUOLINGO QUIZ VIEW */}
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
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500" />
                <div className="mx-auto w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-3xl shadow-sm animate-bounce">
                  🕎
                </div>
                
                <div className="space-y-2">
                  <h3 className={cn("text-2xl font-black leading-tight", isGirlyMode && "text-pink-950")}>
                    Hebrejski Duolingo Trening Suđenja
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
                    Testiraj svoje znanje hebrejskog pisma, izgovora i englesko-srpskih prevoda kroz brzi kviz od 5 pitanja. Sačuvaj svoja srce!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  <div className="p-3 rounded-2xl bg-zinc-500/5 border border-zinc-500/10 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Rekord</span>
                    <span className="text-xl font-black font-mono text-amber-500">{highScore} XP</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-zinc-500/5 border border-zinc-500/10 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Naučeno</span>
                    <span className="text-xl font-black font-mono text-blue-500">{masteredIds.length}/{HEBREW_VOCAB_DATA.length}</span>
                  </div>
                </div>

                <button
                  onClick={generateQuizRound}
                  className={cn(
                    "w-full py-4 rounded-2xl text-white font-black uppercase tracking-tighter flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md",
                    isGirlyMode ? "bg-pink-500 hover:bg-pink-600 shadow-pink-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  )}
                >
                  Započni Trening <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Active Quiz Question */}
            {quizStarted && !quizComplete && roundQuestions[questionIdx] && (
              <div className="space-y-6">
                {/* Duo Style HUD */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 h-3 rounded-full bg-zinc-500/10 overflow-hidden border border-zinc-500/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((questionIdx + 1) / roundQuestions.length) * 100}%` }}
                      className={cn(
                        "h-full transition-all duration-300",
                        isGirlyMode ? "bg-pink-500" : "bg-blue-600"
                      )}
                    />
                  </div>

                  <span className="text-xs font-mono font-black text-zinc-400 whitespace-nowrap">
                    {questionIdx + 1} / {roundQuestions.length}
                  </span>

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

                {/* Card */}
                <div className={cn(
                  "p-8 rounded-[40px] border relative overflow-hidden space-y-6",
                  isGirlyMode ? "bg-white/60 border-pink-100 shadow-xl shadow-pink-500/5" :
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"
                )}>
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/40" />

                  {/* Question Prompt */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-500/5 px-2.5 py-1 rounded-md inline-block">
                      {roundQuestions[questionIdx].questionType === 'meaning' && "Prevod Reči"}
                      {roundQuestions[questionIdx].questionType === 'vuk' && "Izgovor & Vuk"}
                      {roundQuestions[questionIdx].questionType === 'character' && "Hebrejsko Pismo"}
                      {roundQuestions[questionIdx].questionType === 'listen' && "Slušni Test 🔊"}
                    </span>

                    {roundQuestions[questionIdx].questionType === 'listen' ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                        <button
                          onClick={() => speakHebrew(roundQuestions[questionIdx].vocab.char)}
                          className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center transition-all scale-105 active:scale-95 shadow-md",
                            isGirlyMode 
                              ? "bg-pink-100 text-pink-500 hover:bg-pink-200" 
                              : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
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
                          <span>Prevod za reč <span className="font-mono text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-lg border border-blue-500/10">{roundQuestions[questionIdx].vocab.char}</span> ?</span>
                        )}
                        {roundQuestions[questionIdx].questionType === 'vuk' && (
                          <span>Izgovor za reč <span className="text-amber-500 underline underline-offset-4">{roundQuestions[questionIdx].vocab.translation} ({roundQuestions[questionIdx].vocab.english})</span> ?</span>
                        )}
                        {roundQuestions[questionIdx].questionType === 'character' && (
                          <span>Hebrejski zapis za <span className="text-blue-500">"{roundQuestions[questionIdx].vocab.transliteration}"</span>?</span>
                        )}
                      </h4>
                    )}
                  </div>

                  {/* Options */}
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
                            : "bg-blue-500/10 border-blue-500 text-blue-500 shadow-md";
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
                          {isAnswered && isCorrect && <CheckCircle className={cn("w-5 h-5", isGirlyMode ? "text-pink-500" : "text-blue-500")} />}
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
                            ? isGirlyMode ? "text-pink-600" : "text-blue-600 dark:text-blue-400" 
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
                          Reč: <strong className="text-zinc-200">{roundQuestions[questionIdx].vocab.char}</strong> [{roundQuestions[questionIdx].vocab.transliteration}] | Vuk: <strong className="text-zinc-200">"{roundQuestions[questionIdx].vocab.vuk}"</strong> | 🇭🇷 <strong className="text-zinc-200">{roundQuestions[questionIdx].vocab.translation}</strong> | 🇬🇧 <strong className="text-cyan-400">{roundQuestions[questionIdx].vocab.english}</strong>.
                        </p>

                        <button
                          onClick={handleNextQuestion}
                          className={cn(
                            "w-full py-4 rounded-2xl text-white font-black uppercase tracking-tighter flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-sm mt-2",
                            isGirlyMode ? "bg-pink-500 hover:bg-pink-600" : "bg-blue-600 hover:bg-blue-700"
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

            {/* Results View */}
            {quizComplete && (
              <div className={cn(
                "p-8 rounded-[40px] border text-center space-y-6 relative overflow-hidden",
                isGirlyMode ? "bg-white/60 border-pink-100 shadow-xl shadow-pink-500/5" :
                isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"
              )}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <Award className="w-16 h-16 mx-auto text-amber-500 fill-amber-500/10 animate-bounce" />

                <div className="space-y-2">
                  <h3 className={cn("text-2xl font-black leading-tight", isGirlyMode && "text-pink-950")}>
                    {lives > 0 ? "Čestitamo Seeker!" : "Suđenje je završeno"}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-sm mx-auto">
                    {lives > 0 
                      ? "Uspješno si prebrodio jezičko suđenje hebrejske reči. Tvoje znanje spaja svetove!"
                      : "Ostao si bez života ovog puta, ali tvoje pamćenje raste sa svakom greškom!"
                    }
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Osvojeno</span>
                    <span className="text-lg font-black font-mono text-blue-500">+{score} XP</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Preživjelo</span>
                    <span className="text-lg font-black font-mono text-rose-500">{lives} Srca</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-zinc-500/5 border border-zinc-500/10">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Naučeno</span>
                    <span className="text-lg font-black font-mono text-cyan-500">{masteredIds.length}/{HEBREW_VOCAB_DATA.length}</span>
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
                      isGirlyMode ? "bg-pink-500 hover:bg-pink-600" : "bg-blue-600 hover:bg-blue-700"
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
