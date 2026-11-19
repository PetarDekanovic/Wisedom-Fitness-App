import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Shuffle, 
  Sparkles, 
  Trophy, 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Gamepad2, 
  Timer, 
  Search,
  Filter,
  Check,
  Award,
  ArrowRight,
  BookOpen,
  VolumeX,
  Eye,
  HelpCircle,
  Play,
  Pause,
  Clock,
  Sliders,
  FastForward,
  Minus,
  Plus,
  Copy,
  Share2,
  BookmarkPlus,
  Upload,
  Loader2,
  Film,
  BookMarked
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { VocabItem } from '../data/chineseVocabData';
import { getChineseQuoteForItem } from '../data/chineseVocabData';
import {
  loadMoviesBooksDataset,
  MOVIES_BOOKS_TIERS,
  parseCustomVocabCsv,
  type MoviesBooksDataset,
  type MoviesBooksTierId
} from '../lib/hskMoviesBooksLoader';
import { 
  PandaScholarAvatar, 
  LittleDragonMascot, 
  PagodaTempleIllustration, 
  TeaBambooIllustration, 
  LotusIllustration, 
  CartoonCardBack, 
  CartoonVictoryIllustration 
} from './ChineseCartoonAssets';

export interface ChineseFlashcardsGameProps {
  vocabList: VocabItem[];
  masteredIds: string[];
  toggleMastered: (id: string, e?: React.MouseEvent) => void;
  speakChinese: (text: string, id?: string) => void;
  isPronouncing: string | null;
  isDarkMode: boolean;
  isGirlyMode: boolean;
  onSwitchToQuiz?: () => void;
  onSaveWordToDict?: (item: VocabItem) => void;
  existingChars?: Set<string>;
  dictionaryCount?: number;
}

export type PacingMode = 'manual' | 'relaxed' | 'normal';
export type LoopSpeed = 'zen' | 'ultra-slow' | 'slow' | 'moderate';

type GameMode = 'cards' | 'match' | 'speed';

interface MatchCard {
  uniqueId: string;
  vocabId: string;
  type: 'chinese' | 'meaning';
  content: string;
  subContent?: string;
  emoji: string;
  vocab: VocabItem;
  isFlipped: boolean;
  isMatched: boolean;
}

function fisherYatesShuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
 
const getCategoryCartoonIllustration = (category?: string, size = 46) => {
  switch (category) {
    case 'basic_70':
      return <PandaScholarAvatar size={size} />;
    case 'glagoli':
      return <LittleDragonMascot size={size} />;
    case 'filozofija':
      return <LotusIllustration size={size} />;
    case 'svakodnevno':
    case 'hrana':
      return <TeaBambooIllustration size={size} />;
    case 'strofa_1':
    case 'refren':
      return <PagodaTempleIllustration size={size} />;
    default:
      return <LittleDragonMascot size={size} />;
  }
};

export const ChineseFlashcardsGame: React.FC<ChineseFlashcardsGameProps> = ({
  vocabList,
  masteredIds,
  toggleMastered,
  speakChinese,
  isPronouncing,
  isDarkMode,
  isGirlyMode,
  onSwitchToQuiz,
  onSaveWordToDict,
  existingChars,
  dictionaryCount
}) => {
  // Game Mode: 'cards' (3D flip deck), 'match' (Memory match pairs), 'speed' (Quick multiple choice)
  const [gameMode, setGameMode] = useState<GameMode>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('basic_70');
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [flipDirection, setFlipDirection] = useState<'chinese-first' | 'meaning-first'>('chinese-first');

  // --- MOVIES & BOOKS HSK 3.0 WORKBOOK & CUSTOM CSV STATE ---
  const [moviesBooksData, setMoviesBooksData] = useState<MoviesBooksDataset | null>(null);
  const [isLoadingMoviesBooks, setIsLoadingMoviesBooks] = useState(false);
  const [moviesBooksError, setMoviesBooksError] = useState<string | null>(null);
  const [customCsvDeck, setCustomCsvDeck] = useState<{ name: string; items: VocabItem[] } | null>(null);
  const [csvUploadMessage, setCsvUploadMessage] = useState<{ type: 'success' | 'warning'; text: string } | null>(null);
  const [savedFlashChar, setSavedFlashChar] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const savedFlashTimeoutRef = useRef<any>(null);
  const vocabListRef = useRef(vocabList);
  useEffect(() => {
    vocabListRef.current = vocabList;
  }, [vocabList]);

  // --- MODE 1: 3D FLASHCARDS DECK STATE ---
  const [deck, setDeck] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [isDeckFinished, setIsDeckFinished] = useState(false);

  // --- FLASHCARD SCORING, POINTS & REWARD ANIMATION STATE ---
  const [flashcardScore, setFlashcardScore] = useState(0);
  const [scoreAnimation, setScoreAnimation] = useState<{ id: number; text: string; points: number } | null>(null);
  const [isSuccessGlow, setIsSuccessGlow] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  // --- MODE 2: MEMORY MATCH GAME STATE ---
  const [matchCards, setMatchCards] = useState<MatchCard[]>([]);
  const [selectedMatchIndices, setSelectedMatchIndices] = useState<number[]>([]);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);
  const [matchMoves, setMatchMoves] = useState(0);
  const [matchTimer, setMatchTimer] = useState(0);
  const [isMatchTimerRunning, setIsMatchTimerRunning] = useState(false);
  const [matchGameFinished, setMatchGameFinished] = useState(false);
  const [matchGridSize, setMatchGridSize] = useState<6 | 8>(6); // 6 pairs (12 cards) or 8 pairs (16 cards)

  // --- MODE 3: SPEED RECALL CHALLENGE STATE ---
  const [speedQuestionIdx, setSpeedQuestionIdx] = useState(0);
  const [speedQuestions, setSpeedQuestions] = useState<Array<{
    vocab: VocabItem;
    options: string[];
    correctAnswer: string;
  }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedComplete, setSpeedComplete] = useState(false);
  const [speedShowHint, setSpeedShowHint] = useState(false);
  const [speedQuestionCount, setSpeedQuestionCount] = useState<number>(30);
  const [speedBatchNum, setSpeedBatchNum] = useState<number>(0);
  const usedSpeedIdsRef = useRef<Set<string>>(new Set());

  // --- GAME PACING CONTROLS (MAKE WORDS SERENE, SLOW & PLAYABLE) ---
  const [pacingMode, setPacingMode] = useState<PacingMode>('manual');
  const [speedCountdownRemaining, setSpeedCountdownRemaining] = useState<number | null>(null);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [isLoopPaused, setIsLoopPaused] = useState(false);
  const [loopSpeed, setLoopSpeed] = useState<LoopSpeed>('ultra-slow');
  const [loopDurationSec, setLoopDurationSec] = useState<number>(12); // Default 12s per face (24s total per card)
  const [loopSecondsLeft, setLoopSecondsLeft] = useState<number>(12);

  // Stable refs to prevent re-render cascades & infinite re-shuffling loops
  const speakChineseRef = useRef(speakChinese);
  useEffect(() => {
    speakChineseRef.current = speakChinese;
  }, [speakChinese]);

  const toggleMasteredRef = useRef(toggleMastered);
  useEffect(() => {
    toggleMasteredRef.current = toggleMastered;
  }, [toggleMastered]);

  const masteredIdsRef = useRef(masteredIds);
  useEffect(() => {
    masteredIdsRef.current = masteredIds;
  }, [masteredIds]);

  const loopDurationSecRef = useRef(loopDurationSec);
  useEffect(() => {
    loopDurationSecRef.current = loopDurationSec;
  }, [loopDurationSec]);

  const isLoopPausedRef = useRef(isLoopPaused);
  useEffect(() => {
    isLoopPausedRef.current = isLoopPaused;
  }, [isLoopPaused]);

  const deckRef = useRef(deck);
  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const isFlippedRef = useRef(isFlipped);
  useEffect(() => {
    isFlippedRef.current = isFlipped;
  }, [isFlipped]);

  const loopRemainingRef = useRef<number>(12);

  // Timer references for robust cleanup
  const speedTimerRef = useRef<any>(null);
  const speedCountdownIntervalRef = useRef<any>(null);
  const mismatchTimeoutRef = useRef<any>(null);
  const slideshowTimerRef = useRef<any>(null);

  // Social Media Share / Copy Word Handler
  const handleCopyCardSocial = useCallback((item: VocabItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const quote = getChineseQuoteForItem(item);
    const textToCopy = `🇨🇳 Kineski Karakter: 【 ${item.char} 】
• Pinyin: ${item.pinyin}
• Vuk Izgovor: /${item.vuk}/
• Značenje: ${item.translation} (${item.english})
${item.radical ? `• Radikal: ${item.radical}\n` : ''}${quote?.quote ? `• Mudrost: "${quote.quote}" — ${quote.translation}\n` : ''}
🧘 Naučeno na WiseFit Digital Sanctuary #WiseFit #Chinese #Hanzi #Mudrost`;

    const markSuccess = () => {
      setCopiedCardId(item.id);
      setTimeout(() => setCopiedCardId(null), 2500);
    };

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy).then(markSuccess).catch(() => {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          markSuccess();
        } catch {}
      });
    } else {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        markSuccess();
      } catch {}
    }
  }, []);

  // Lazy-load the 5-tier HSK 3.0 Movies & Books workbook dataset
  const handleSelectMoviesBooksTier = useCallback(async (tierId: MoviesBooksTierId) => {
    usedSpeedIdsRef.current.clear();
    setSelectedCategory(tierId);
    setMoviesBooksError(null);
    if (!moviesBooksData && !isLoadingMoviesBooks) {
      setIsLoadingMoviesBooks(true);
      try {
        const loaded = await loadMoviesBooksDataset(vocabListRef.current);
        setMoviesBooksData(loaded);
      } catch (err: any) {
        setMoviesBooksError(err?.message || 'Greška pri učitavanju Movies & Books baze.');
      } finally {
        setIsLoadingMoviesBooks(false);
      }
    }
  }, [moviesBooksData, isLoadingMoviesBooks]);

  // Upload any exported CSV vocabulary sheet directly into Flashcards & Izazov Znanja
  const handleCsvFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseCustomVocabCsv(text, file.name, vocabListRef.current);
      if (parsed.items.length > 0) {
        usedSpeedIdsRef.current.clear();
        setCustomCsvDeck({
          name: file.name.replace(/\.csv$/i, ''),
          items: parsed.items,
        });
        setSelectedCategory('custom_csv');
        setCsvUploadMessage({
          type: 'success',
          text: `Učitano ${parsed.items.length} reči iz fajla "${file.name}". Svaku reč možete sačuvati u glavni Rečnik!`,
        });
      } else {
        setCsvUploadMessage({
          type: 'warning',
          text:
            parsed.warning ||
            'Ovaj CSV ne sadrži listu reči. Koristite ugrađene Movies & Books tabove iznad.',
        });
      }
    } catch {
      setCsvUploadMessage({
        type: 'warning',
        text: 'Nije moguće pročitati CSV fajl. Proverite format fajla.',
      });
    } finally {
      e.target.value = '';
    }
  }, []);

  // Save a word directly to WiseFit's main 640+ Chinese Dictionary with animated feedback
  const isWordInDict = useCallback(
    (char: string) => {
      if (existingChars) return existingChars.has(char);
      return vocabList.some((v) => v.char === char);
    },
    [existingChars, vocabList]
  );

  const handleSaveWordToDict = useCallback(
    (item: VocabItem, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (!onSaveWordToDict) return;
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(25);
        }
      } catch {}
      setSavedFlashChar(item.char);
      if (savedFlashTimeoutRef.current) clearTimeout(savedFlashTimeoutRef.current);
      savedFlashTimeoutRef.current = setTimeout(() => {
        setSavedFlashChar((prev) => (prev === item.char ? null : prev));
      }, 1900);
      onSaveWordToDict(item);
    },
    [onSaveWordToDict]
  );

  // Reusable animated Save-to-Dictionary button for Flashcards, Memory Match, and Izazov Znanja
  const renderSaveWordButton = useCallback(
    (item: VocabItem, compact = false) => {
      if (!onSaveWordToDict) return null;
      const alreadySaved = isWordInDict(item.char);
      const isFlashing = savedFlashChar === item.char;

      return (
        <div className="relative inline-flex items-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            animate={isFlashing ? { scale: [1, 1.14, 1] } : { scale: 1 }}
            transition={{ duration: 0.32 }}
            onClick={(e) => handleSaveWordToDict(item, e)}
            className={cn(
              "relative inline-flex items-center justify-center gap-1.5 font-bold transition-all border cursor-pointer shadow-sm",
              compact
                ? "px-2.5 py-1.5 rounded-xl text-[11px] min-h-[32px]"
                : "px-3.5 py-2 rounded-2xl text-xs min-h-[36px]",
              alreadySaved
                ? isDarkMode
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                : isDarkMode
                  ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-400/70 text-white shadow-emerald-600/25"
                  : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-emerald-600/20"
            )}
            title={
              alreadySaved
                ? `Reč "${item.char}" je već sačuvana u vašem Rečniku`
                : `Sačuvaj "${item.char}" (${item.translation}) u glavni WiseFit Rečnik`
            }
          >
            {isFlashing && (
              <motion.span
                initial={{ opacity: 0.75, scale: 0.95 }}
                animate={{ opacity: 0, scale: 1.45 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-emerald-400"
              />
            )}
            {alreadySaved ? (
              <>
                <Check className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4", "shrink-0")} />
                <span>{compact ? 'U Rečniku' : 'Sačuvano u Rečnik'}</span>
              </>
            ) : (
              <>
                <BookmarkPlus className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4", "shrink-0")} />
                <span>{compact ? 'Sačuvaj' : 'Sačuvaj u Rečnik'}</span>
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {isFlashing && (
              <motion.span
                initial={{ opacity: 0, y: 6, scale: 0.85 }}
                animate={{ opacity: 1, y: -26, scale: 1 }}
                exit={{ opacity: 0, y: -38, scale: 0.9 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono font-black text-[10px] shadow-lg whitespace-nowrap z-40"
              >
                +1 U Rečnik ✓
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      );
    },
    [onSaveWordToDict, isWordInDict, savedFlashChar, handleSaveWordToDict, isDarkMode]
  );

  // Resolve the active vocabulary pool across built-in decks, HSK 3.0 Movies & Books tiers, and custom CSV imports
  // Uses vocabListRef so saving a word to the dictionary mid-quiz NEVER resets the active round!
  const getActivePool = useCallback((): VocabItem[] => {
    let basePool: VocabItem[] = [];

    if (selectedCategory === 'custom_csv' && customCsvDeck && customCsvDeck.items.length > 0) {
      basePool = [...customCsvDeck.items];
    } else if (selectedCategory.startsWith('hsk_')) {
      if (!moviesBooksData) return [];
      basePool = [...(moviesBooksData[selectedCategory as MoviesBooksTierId] || [])];
    } else {
      basePool = [...vocabListRef.current];
      if (selectedCategory !== 'all') {
        basePool = basePool.filter(item => item.category === selectedCategory);
      }
    }

    let pool = basePool;
    const currentMastered = masteredIdsRef.current;
    if (filterMode === 'unmastered') {
      pool = pool.filter(item => !currentMastered.includes(item.id));
    } else if (filterMode === 'mastered') {
      pool = pool.filter(item => currentMastered.includes(item.id));
    }

    if (pool.length > 0) return pool;
    return basePool.length > 0 ? basePool : vocabListRef.current;
  }, [selectedCategory, filterMode, moviesBooksData, customCsvDeck]);

  // Filter vocabulary pool based on category and mastery (for display counts & badges)
  const filteredPool = useMemo(() => {
    return getActivePool();
  }, [getActivePool, masteredIds, vocabList.length]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of vocabList) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [vocabList]);

  // Categories list with counts
  const categoriesWithCounts = useMemo(() => {
    return [
      { id: 'basic_70', label: '🌱 70 Osnovnih Karaktera', count: categoryCounts['basic_70'] || 70 },
      { id: 'glagoli', label: '⚡ 100 Najvažnijih Glagola', count: categoryCounts['glagoli'] || 0 },
      { id: 'all', label: '🎴 Svi Karakteri', count: vocabList.length },
      { id: 'svakodnevno', label: '💬 Svakodnevno & Pozdravi', count: categoryCounts['svakodnevno'] || 0 },
      { id: 'filozofija', label: '☯️ Tao & Mudrost', count: categoryCounts['filozofija'] || 0 },
      { id: 'strofa_1', label: '📜 Strofa 1 (Osnove)', count: categoryCounts['strofa_1'] || 0 },
      { id: 'refren', label: '🎋 Refren & Poezija', count: categoryCounts['refren'] || 0 }
    ];
  }, [vocabList, categoryCounts]);

  // Initialize or shuffle Deck (stable - does NOT reset when user saves a word or toggles mastered!)
  const initDeck = useCallback((shouldShuffle = false) => {
    const finalPool = getActivePool();
    const deckCards = shouldShuffle ? fisherYatesShuffle(finalPool) : [...finalPool];
    setDeck(deckCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsDeckFinished(false);
    setIsSlideshowActive(false);
  }, [getActivePool]);

  // Re-initialize deck only when category, filter mode, or loaded external deck changes
  useEffect(() => {
    initDeck(false);
  }, [initDeck]);

  // Current Card
  const currentCard = deck[currentIndex] || deck[0];

  // Flip Card Action
  const handleFlipCard = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    
    // Reset loop countdown on manual flip so player gets full study time
    if (isSlideshowActive) {
      loopRemainingRef.current = loopDurationSecRef.current;
      setLoopSecondsLeft(loopDurationSecRef.current);
    }

    if (nextFlipped && autoSpeak && currentCard) {
      speakChineseRef.current(currentCard.char, `flash-${currentCard.id}`);
    }
  };

  // Advance to next card smoothly (direct state increment, zero race conditions)
  const advanceToNextCard = useCallback(() => {
    setIsFlipped(false);
    
    // Reset loop countdown on manual or auto advance
    if (isSlideshowActive) {
      loopRemainingRef.current = loopDurationSecRef.current;
      setLoopSecondsLeft(loopDurationSecRef.current);
    }

    const currentDeck = deckRef.current;
    if (currentDeck.length === 0) return;

    setCurrentIndex(prevIdx => {
      if (prevIdx + 1 < currentDeck.length) {
        const nextIdx = prevIdx + 1;
        if (autoSpeak && currentDeck[nextIdx]) {
          setTimeout(() => {
            speakChineseRef.current(currentDeck[nextIdx].char, `flash-${currentDeck[nextIdx].id}`);
          }, 350);
        }
        return nextIdx;
      } else {
        if (isSlideshowActive) {
          if (autoSpeak && currentDeck[0]) {
            setTimeout(() => {
              speakChineseRef.current(currentDeck[0].char, `flash-${currentDeck[0].id}`);
            }, 350);
          }
          return 0;
        } else {
          setIsDeckFinished(true);
          setIsSlideshowActive(false);
          return prevIdx;
        }
      }
    });
  }, [autoSpeak, isSlideshowActive]);

  // Previous card
  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);

    if (isSlideshowActive) {
      loopRemainingRef.current = loopDurationSecRef.current;
      setLoopSecondsLeft(loopDurationSecRef.current);
    }

    const currentDeck = deckRef.current;
    if (currentDeck.length === 0) return;

    setCurrentIndex(prevIdx => {
      if (prevIdx > 0) {
        const nextIdx = prevIdx - 1;
        if (autoSpeak && currentDeck[nextIdx]) {
          setTimeout(() => {
            speakChineseRef.current(currentDeck[nextIdx].char, `flash-${currentDeck[nextIdx].id}`);
          }, 350);
        }
        return nextIdx;
      }
      return prevIdx;
    });
  }, [autoSpeak, isSlideshowActive]);

  // Mark as Mastered (Player knows the word -> Awards Points + Streak Bonus + Animation + Advances to next card)
  const handleMarkMastered = () => {
    const activeDeck = deckRef.current;
    const activeIdx = currentIndexRef.current;
    const card = activeDeck[activeIdx];
    if (!card) return;

    // Haptic feedback
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch {}

    // 1. Mark as mastered in global state
    if (!masteredIdsRef.current.includes(card.id)) {
      toggleMasteredRef.current(card.id);
    }

    // 2. Score & Streak System (+10 base XP + streak bonus)
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    if (nextStreak > highestStreak) setHighestStreak(nextStreak);
    setSessionReviewed(prev => prev + 1);

    const streakBonus = nextStreak > 1 ? Math.min(20, nextStreak * 2) : 0;
    const earnedPoints = 10 + streakBonus;
    setFlashcardScore(prev => prev + earnedPoints);

    // 3. Floating points celebration animation
    setScoreAnimation({
      id: Date.now(),
      text: streakBonus > 0 ? `+${earnedPoints} XP 🔥 (${nextStreak}x Niz!)` : `+${earnedPoints} XP ✨`,
      points: earnedPoints
    });
    setTimeout(() => {
      setScoreAnimation(null);
    }, 1500);

    // 4. Card glow animation
    setIsSuccessGlow(true);
    setTimeout(() => {
      setIsSuccessGlow(false);
    }, 450);

    // 5. Advance smoothly to the NEXT card without resetting!
    advanceToNextCard();
  };

  // Mark as Still Learning (Re-queues card to the end of deck so player reinforces it)
  const handleNeedReview = () => {
    const activeDeck = deckRef.current;
    const activeIdx = currentIndexRef.current;
    const card = activeDeck[activeIdx];
    if (!card) return;

    setStreak(0);
    setSessionReviewed(prev => prev + 1);

    // Push this card to the end of deck so it appears again for reinforcement
    setDeck(prev => [...prev, card]);

    // Advance to next card smoothly
    advanceToNextCard();
  };

  // Timer and Slideshow Cleanup
  const clearAllTimers = useCallback(() => {
    if (speedTimerRef.current) {
      clearTimeout(speedTimerRef.current);
      speedTimerRef.current = null;
    }
    if (speedCountdownIntervalRef.current) {
      clearInterval(speedCountdownIntervalRef.current);
      speedCountdownIntervalRef.current = null;
    }
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }
    setSpeedCountdownRemaining(null);
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Advance to next speed challenge question (manual or auto)
  const advanceToNextSpeedQuestion = useCallback(() => {
    clearAllTimers();

    if (speedQuestionIdx + 1 < speedQuestions.length) {
      const nextIdx = speedQuestionIdx + 1;
      setSpeedQuestionIdx(nextIdx);
      setSelectedAnswer(null);
      setSpeedShowHint(false);
      if (autoSpeak && speedQuestions[nextIdx]) {
        setTimeout(() => {
          speakChineseRef.current(speedQuestions[nextIdx].vocab.char, `speed-${speedQuestions[nextIdx].vocab.id}`);
        }, 350);
      }
    } else {
      setSpeedComplete(true);
    }
  }, [clearAllTimers, speedQuestionIdx, speedQuestions, autoSpeak]);

  // Pause speed countdown so player can study word in calm stillness
  const pauseSpeedTimer = () => {
    clearAllTimers();
    setPacingMode('manual');
  };

  // 3D Deck Auto-Loop Duration in Seconds per Face
  const getSideDurationSec = useCallback(() => {
    switch (loopSpeed) {
      case 'zen': return 16.0;        // 16s per face = 32s total per card (deep zen learning)
      case 'ultra-slow': return 12.0; // 12s per face = 24s total per card (slow & calm)
      case 'slow': return 8.0;        // 8s per face = 16s total per card
      case 'moderate': return 5.0;    // 5s per face = 10s total per card
      default: return 12.0;
    }
  }, [loopSpeed]);

  const handleSelectLoopSpeed = (speed: LoopSpeed) => {
    setLoopSpeed(speed);
    let sec = 12;
    if (speed === 'zen') sec = 16;
    else if (speed === 'ultra-slow') sec = 12;
    else if (speed === 'slow') sec = 8;
    else if (speed === 'moderate') sec = 5;
    setLoopDurationSec(sec);
    loopRemainingRef.current = sec;
    setLoopSecondsLeft(sec);
  };

  const handleAdjustLoopDuration = (delta: number) => {
    const next = Math.max(4, Math.min(30, loopDurationSec + delta));
    setLoopDurationSec(next);
    loopRemainingRef.current = next;
    setLoopSecondsLeft(next);
  };

  // 3D Deck Auto-Slideshow (Serene Hands-Free Learning Loop)
  const toggleSlideshow = () => {
    if (isSlideshowActive) {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
      setIsSlideshowActive(false);
      setIsLoopPaused(false);
    } else {
      setIsDeckFinished(false);
      setIsLoopPaused(false);
      loopRemainingRef.current = loopDurationSec;
      setLoopSecondsLeft(loopDurationSec);
      setIsSlideshowActive(true);
    }
  };

  const toggleLoopPause = () => {
    setIsLoopPaused(prev => !prev);
  };

  // Rock-solid, calm, slow auto-loop interval
  useEffect(() => {
    if (gameMode !== 'cards' || !isSlideshowActive) {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
      return;
    }

    loopRemainingRef.current = loopDurationSec;
    setLoopSecondsLeft(loopDurationSec);

    slideshowTimerRef.current = setInterval(() => {
      // If player paused to study, hold countdown still
      if (isLoopPausedRef.current) return;

      loopRemainingRef.current -= 0.5;
      const currentRemaining = Math.max(0, Math.ceil(loopRemainingRef.current));
      setLoopSecondsLeft(currentRemaining);

      if (loopRemainingRef.current <= 0) {
        const curDeck = deckRef.current;
        const curIdx = currentIndexRef.current;
        const curFlipped = isFlippedRef.current;

        if (!curFlipped) {
          // Front face -> Flip to Back face (show translations and roots)
          setIsFlipped(true);
          if (autoSpeak && curDeck[curIdx]) {
            speakChineseRef.current(curDeck[curIdx].char, `flash-${curDeck[curIdx].id}`);
          }
        } else {
          // Back face -> Advance to next card smoothly
          setIsFlipped(false);
          setCurrentIndex(prevIdx => {
            const nextIdx = (prevIdx + 1) % (curDeck.length || 1);
            if (autoSpeak && curDeck[nextIdx]) {
              setTimeout(() => {
                speakChineseRef.current(curDeck[nextIdx].char, `flash-${curDeck[nextIdx].id}`);
              }, 400);
            }
            return nextIdx;
          });
        }

        // Reset countdown for new face
        loopRemainingRef.current = loopDurationSecRef.current;
        setLoopSecondsLeft(loopDurationSecRef.current);
      }
    }, 500);

    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
    };
  }, [gameMode, isSlideshowActive, loopDurationSec, autoSpeak]);

  // Keyboard navigation for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (gameMode === 'cards') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleFlipCard();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          advanceToNextCard();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          handlePrevCard();
        } else if (e.key === '1') {
          e.preventDefault();
          handleNeedReview();
        } else if (e.key === '2') {
          e.preventDefault();
          handleMarkMastered();
        }
      } else if (gameMode === 'speed') {
        if (selectedAnswer !== null) {
          if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
            e.preventDefault();
            advanceToNextSpeedQuestion();
          }
        } else if (speedQuestions[speedQuestionIdx]) {
          const opts = speedQuestions[speedQuestionIdx].options;
          if (e.key === '1' && opts[0]) handleSpeedAnswer(opts[0]);
          else if (e.key === '2' && opts[1]) handleSpeedAnswer(opts[1]);
          else if (e.key === '3' && opts[2]) handleSpeedAnswer(opts[2]);
          else if (e.key === '4' && opts[3]) handleSpeedAnswer(opts[3]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, isFlipped, currentIndex, deck, selectedAnswer, speedQuestions, speedQuestionIdx, advanceToNextSpeedQuestion]);

  // --- MEMORY MATCH GAME LOGIC ---
  const initMatchGame = useCallback(() => {
    clearAllTimers();
    const activePool = getActivePool();
    if (activePool.length === 0) {
      setMatchCards([]);
      return;
    }
    const pool = fisherYatesShuffle(activePool);
    const selectedVocabs = pool.slice(0, matchGridSize);

    const cards: MatchCard[] = [];
    selectedVocabs.forEach((v) => {
      // Chinese Character Card
      cards.push({
        uniqueId: `zh-${v.id}`,
        vocabId: v.id,
        type: 'chinese',
        content: v.char,
        subContent: v.pinyin,
        emoji: v.emoji,
        vocab: v,
        isFlipped: false,
        isMatched: false
      });

      // Translation Card
      cards.push({
        uniqueId: `sr-${v.id}`,
        vocabId: v.id,
        type: 'meaning',
        content: v.translation,
        subContent: `/${v.vuk}/`,
        emoji: v.emoji,
        vocab: v,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle the match board
    setMatchCards(fisherYatesShuffle(cards));
    setSelectedMatchIndices([]);
    setMatchedPairsCount(0);
    setMatchMoves(0);
    setMatchTimer(0);
    setIsMatchTimerRunning(true);
    setMatchGameFinished(false);
  }, [getActivePool, matchGridSize, clearAllTimers]);

  // Match Game Timer
  useEffect(() => {
    let interval: any = null;
    if (isMatchTimerRunning && !matchGameFinished) {
      interval = setInterval(() => {
        setMatchTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMatchTimerRunning, matchGameFinished]);

  const handleMatchCardClick = (index: number) => {
    // If a mismatch is currently shown and player clicks any card, immediately clear previous mismatch and proceed!
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
      setMatchCards(prev => prev.map(c => !c.isMatched ? { ...c, isFlipped: false } : c));
      setSelectedMatchIndices([]);
    }

    if (selectedMatchIndices.length >= 2) return;
    if (matchCards[index].isFlipped || matchCards[index].isMatched) return;

    // Flip card
    const newCards = [...matchCards];
    newCards[index].isFlipped = true;
    setMatchCards(newCards);

    const newSelected = [...selectedMatchIndices, index];
    setSelectedMatchIndices(newSelected);

    if (newCards[index].type === 'chinese') {
      speakChinese(newCards[index].vocab.char, `match-${newCards[index].vocab.id}`);
    }

    if (newSelected.length === 2) {
      setMatchMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      const card1 = newCards[firstIdx];
      const card2 = newCards[secondIdx];

      // Check if match
      if (card1.vocabId === card2.vocabId && card1.type !== card2.type) {
        // MATCH! Give 600ms to celebrate and hear audio
        setTimeout(() => {
          setMatchCards(prev => prev.map((c, i) => 
            i === firstIdx || i === secondIdx 
              ? { ...c, isMatched: true, isFlipped: true }
              : c
          ));
          setSelectedMatchIndices([]);
          setMatchedPairsCount(prev => {
            const nextCount = prev + 1;
            if (nextCount === matchGridSize) {
              setIsMatchTimerRunning(false);
              setMatchGameFinished(true);
            }
            return nextCount;
          });
          speakChinese(card1.vocab.char, `matched-success-${card1.vocab.id}`);
        }, 600);
      } else {
        // NO MATCH -> Give generous 2200ms to calmly read both cards before flipping back
        mismatchTimeoutRef.current = setTimeout(() => {
          setMatchCards(prev => prev.map((c, i) => 
            i === firstIdx || i === secondIdx 
              ? { ...c, isFlipped: false }
              : c
          ));
          setSelectedMatchIndices([]);
          mismatchTimeoutRef.current = null;
        }, 2200);
      }
    }
  };

  // --- MODE 3: SPEED CHALLENGE LOGIC (with Fisher-Yates & unseen batch rotation) ---
  const initSpeedChallenge = useCallback(() => {
    clearAllTimers();
    const activePool = getActivePool();
    if (activePool.length === 0) {
      setSpeedQuestions([]);
      return;
    }
    const targetCount = Math.min(speedQuestionCount, activePool.length);

    // Prioritize unseen words so consecutive 30-word batches rotate through fresh words
    const unseen = fisherYatesShuffle(activePool.filter(item => !usedSpeedIdsRef.current.has(item.id)));
    const seen = fisherYatesShuffle(activePool.filter(item => usedSpeedIdsRef.current.has(item.id)));

    let selectedBatch: VocabItem[];
    if (unseen.length >= targetCount) {
      selectedBatch = unseen.slice(0, targetCount);
      selectedBatch.forEach(item => usedSpeedIdsRef.current.add(item.id));
    } else {
      const remainingNeeded = targetCount - unseen.length;
      const recycled = seen.slice(0, remainingNeeded);
      selectedBatch = fisherYatesShuffle([...unseen, ...recycled]);
      // Reset tracking for the pool and mark the recycled + remaining fresh ones for next round
      usedSpeedIdsRef.current.clear();
      selectedBatch.forEach(item => usedSpeedIdsRef.current.add(item.id));
    }

    const questionsList = selectedBatch.map(v => {
      const distractorPool = activePool.length >= 4 ? activePool : vocabListRef.current;
      // Fast random sampling for large 3000+ word decks (avoids full O(N) shuffle per question)
      const distractors: string[] = [];
      const usedTrans = new Set<string>([v.translation]);
      let attempts = 0;
      while (distractors.length < 3 && attempts < 80) {
        attempts++;
        const candidate = distractorPool[Math.floor(Math.random() * distractorPool.length)];
        if (candidate && candidate.id !== v.id && candidate.translation && !usedTrans.has(candidate.translation)) {
          usedTrans.add(candidate.translation);
          distractors.push(candidate.translation);
        }
      }
      if (distractors.length < 3) {
        const fallback = fisherYatesShuffle(
          distractorPool.filter(other => other.id !== v.id && !usedTrans.has(other.translation))
        ).slice(0, 3 - distractors.length);
        fallback.forEach(o => distractors.push(o.translation));
      }

      const options = fisherYatesShuffle([v.translation, ...distractors]);

      return {
        vocab: v,
        options,
        correctAnswer: v.translation
      };
    });

    setSpeedQuestions(questionsList);
    setSpeedBatchNum(prev => prev + 1);
    setSpeedQuestionIdx(0);
    setSelectedAnswer(null);
    setSpeedScore(0);
    setSpeedComplete(false);
    setSpeedShowHint(false);

    if (questionsList.length > 0 && autoSpeak) {
      setTimeout(() => {
        speakChineseRef.current(questionsList[0].vocab.char, `speed-${questionsList[0].vocab.id}`);
      }, 350);
    }
  }, [getActivePool, speedQuestionCount, autoSpeak, clearAllTimers]);

  // Refresh speed quiz / match board automatically when user switches category, filter, or loads Movies & Books dataset
  useEffect(() => {
    if (gameMode === 'speed') {
      initSpeedChallenge();
    } else if (gameMode === 'match') {
      initMatchGame();
    }
  }, [selectedCategory, filterMode, gameMode, moviesBooksData, customCsvDeck, initSpeedChallenge, initMatchGame]);

  const handleSpeedAnswer = (option: string) => {
    if (selectedAnswer !== null) return;
    clearAllTimers();
    setSelectedAnswer(option);

    const currentQ = speedQuestions[speedQuestionIdx];
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      setSpeedScore(prev => prev + 10);
      speakChinese(currentQ.vocab.char, `speed-correct-${currentQ.vocab.id}`);
      if (!masteredIds.includes(currentQ.vocab.id)) {
        toggleMastered(currentQ.vocab.id);
      }
    } else {
      // Speak term so player hears pronunciation
      speakChinese(currentQ.vocab.char, `speed-wrong-${currentQ.vocab.id}`);
    }

    // PACING CONTROL: If 'manual', NEVER auto-advance! The user reads at their own pace and clicks "Sledeća Reč →"
    if (pacingMode === 'manual') {
      return;
    }

    // Relaxed: 8000ms (8s) | Normal: 5000ms (5s)
    const delayMs = pacingMode === 'relaxed' ? 8000 : 5000;
    setSpeedCountdownRemaining(Math.ceil(delayMs / 1000));

    const startTime = Date.now();
    speedCountdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((delayMs - elapsed) / 1000));
      setSpeedCountdownRemaining(remaining);
    }, 200);

    speedTimerRef.current = setTimeout(() => {
      if (speedCountdownIntervalRef.current) {
        clearInterval(speedCountdownIntervalRef.current);
        speedCountdownIntervalRef.current = null;
      }
      advanceToNextSpeedQuestion();
    }, delayMs);
  };

  // Switch between game modes
  const handleModeChange = (mode: GameMode) => {
    clearAllTimers();
    setIsSlideshowActive(false);
    setGameMode(mode);
    if (mode === 'cards') initDeck();
    else if (mode === 'match') initMatchGame();
    else if (mode === 'speed') initSpeedChallenge();
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER CONTROLS & MODE SELECTOR */}
      <div className={cn(
        "p-5 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl transition-all",
        isDarkMode 
          ? "bg-zinc-950/80 border-zinc-800 backdrop-blur-xl" 
          : "bg-white border-zinc-200 shadow-zinc-100"
      )}>
        {/* Game Mode Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleModeChange('cards')}
            className={cn(
              "px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 text-center w-full",
              gameMode === 'cards'
                ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" : "bg-red-600 text-white shadow-lg shadow-red-600/25"
                : isDarkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="truncate">3D Kartice (Hanzi)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('match')}
            className={cn(
              "px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 text-center w-full",
              gameMode === 'match'
                ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" : "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : isDarkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Spoji Parove (Memory)</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange('speed')}
            className={cn(
              "px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 text-center w-full",
              gameMode === 'speed'
                ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" : "bg-amber-600 text-white shadow-lg shadow-amber-600/25"
                : isDarkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">Izazov Znanja (Kviz)</span>
          </button>
        </div>

        {/* Global Game Status & Tempo Badges */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          {/* Pacing / Speed Controls */}
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-2xl border text-xs shadow-inner",
            isDarkMode ? "bg-zinc-900/90 border-zinc-800" : "bg-zinc-100 border-zinc-200"
          )}>
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-bold text-zinc-400 hidden sm:inline mr-0.5">Tempo:</span>
            <button
              type="button"
              onClick={() => { setPacingMode('manual'); clearAllTimers(); }}
              className={cn(
                "px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all",
                pacingMode === 'manual'
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
              title="Ručni tempo (Preporučeno): Reči čekaju vaš klik na 'Sledeća Reč', 0 žurbe za mirnu igru"
            >
              ✋ Ručno
            </button>
            <button
              type="button"
              onClick={() => { setPacingMode('relaxed'); clearAllTimers(); }}
              className={cn(
                "px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all",
                pacingMode === 'relaxed'
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
              title="Sporo i opušteno: 8 sekundi pauza za analizu karaktera"
            >
              🐢 8s Sporo
            </button>
            <button
              type="button"
              onClick={() => { setPacingMode('normal'); clearAllTimers(); }}
              className={cn(
                "px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all",
                pacingMode === 'normal'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
              title="Umereno: 5 sekundi pauza"
            >
              🧘 5s
            </button>
          </div>

          {/* Points / XP Counter */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-black transition-all relative",
            flashcardScore > 0 
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10" 
              : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-500"
          )}>
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{flashcardScore} Bodova</span>
            <AnimatePresence>
              {scoreAnimation && (
                <motion.span
                  key={scoreAnimation.id}
                  initial={{ opacity: 0, y: 5, scale: 0.8 }}
                  animate={{ opacity: 1, y: -20, scale: 1.15 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="absolute -top-3 right-0 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono font-black text-[10px] shadow-lg pointer-events-none whitespace-nowrap z-30"
                >
                  {scoreAnimation.text}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold",
            streak > 0 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
              : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-500"
          )}>
            <Flame className={cn("w-3.5 h-3.5", streak > 0 && "text-amber-400 fill-amber-400 animate-bounce")} />
            <span>{streak} Niz</span>
          </div>

          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold",
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-700"
          )}>
            <Trophy className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>{masteredIds.length}/{dictionaryCount ?? vocabList.length}</span>
          </div>

          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn(
              "p-2 rounded-xl border text-xs font-bold transition-all",
              autoSpeak 
                ? "bg-red-500/10 border-red-500/30 text-red-400" 
                : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-400"
            )}
            title={autoSpeak ? "Auto-zvuk uključen" : "Auto-zvuk isključen"}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* BAO BAO THE PANDA SCHOLAR MASCOT COMPANION */}
      <div className={cn(
        "p-3.5 sm:p-4 rounded-3xl border flex items-center gap-3 sm:gap-4 transition-all shadow-lg relative overflow-hidden",
        isDarkMode 
          ? "bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 border-amber-500/30" 
          : "bg-gradient-to-r from-amber-50 via-orange-50/60 to-white border-amber-200"
      )}>
        <PandaScholarAvatar 
          mood={streak >= 5 ? 'cheering' : isDeckFinished ? 'victory' : pacingMode === 'relaxed' ? 'zen' : 'studying'} 
          size={56} 
          className="shrink-0 drop-shadow-md"
        />
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-amber-400 font-mono flex items-center gap-1">
              <span>🐼 Bao Bao (熊猫学者)</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              {streak >= 5 ? 'Vatreni Niz 🔥' : gameMode === 'cards' ? '3D Hanzi Trening' : gameMode === 'match' ? 'Memory Zmaj 🎴' : 'Brzi Izazov ⚡'}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-zinc-200">
            {streak >= 5 
              ? `🔥 Neverovatan niz od ${streak}! Tvoj um je fokusiran i bistar, nastavi tako!` 
              : gameMode === 'cards'
                ? "Klikni na karticu da je okreneš, ili poslušaj autentičan izgovor uz Vuk fonetiku."
                : gameMode === 'match'
                  ? "Pronađi parove: spoji kineski hanzi karakter sa odgovarajućim prevodom!"
                  : "Izaberi tačan prevod i sakupi maksimalan broj bodova u kvizu!"}
          </p>
        </div>
      </div>

      {/* FEATURED DECKS HERO SWITCHER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedCategory('basic_70')}
          className={cn(
            "p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-3 group",
            selectedCategory === 'basic_70'
              ? isGirlyMode
                ? "bg-pink-950/60 border-pink-500 ring-2 ring-pink-500/50 shadow-lg"
                : "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg"
              : isDarkMode ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border",
            selectedCategory === 'basic_70'
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-zinc-800/80 border-zinc-700 text-zinc-300"
          )}>
            🌱
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-[10px] text-emerald-400 font-mono uppercase tracking-wider">
                1. Početni Špil
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                {categoryCounts['basic_70'] || 70} reči
              </span>
            </div>
            <p className="font-serif font-black text-xs sm:text-sm text-zinc-100 group-hover:text-emerald-300 transition-colors">
              70 Osnovnih Karaktera
            </p>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
              Laki start: 大, 小, 人, 男, 女, 日, 月, 水...
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('glagoli')}
          className={cn(
            "p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-3 group",
            selectedCategory === 'glagoli'
              ? isGirlyMode
                ? "bg-pink-950/60 border-pink-500 ring-2 ring-pink-500/50 shadow-lg"
                : "bg-red-950/60 border-red-500 ring-2 ring-red-500/50 shadow-lg"
              : isDarkMode ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border",
            selectedCategory === 'glagoli'
              ? "bg-red-500/20 border-red-500/40 text-red-300"
              : "bg-zinc-800/80 border-zinc-700 text-zinc-300"
          )}>
            ⚡
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-[10px] text-red-400 font-mono uppercase tracking-wider">
                2. Glagoli & Akcije
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-300 font-mono font-bold">
                {categoryCounts['glagoli'] || 0} reči
              </span>
            </div>
            <p className="font-serif font-black text-xs sm:text-sm text-zinc-100 group-hover:text-red-300 transition-colors">
              100 Najvažnijih Glagola
            </p>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
              Kineske akcije: 是, 有, 听, 说, 读, 写, 看, 吃...
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={cn(
            "p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-3 group",
            selectedCategory === 'all'
              ? isGirlyMode
                ? "bg-pink-950/60 border-pink-500 ring-2 ring-pink-500/50 shadow-lg"
                : "bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/50 shadow-lg"
              : isDarkMode ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border",
            selectedCategory === 'all'
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "bg-zinc-800/80 border-zinc-700 text-zinc-300"
          )}>
            🎴
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-[10px] text-amber-400 font-mono uppercase tracking-wider">
                3. Celokupna Riznica
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
                {vocabList.length} reči
              </span>
            </div>
            <p className="font-serif font-black text-xs sm:text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
              Svi Karakteri Zajedno
            </p>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
              Osnove, glagoli, filozofija, strofe i fraze
            </p>
          </div>
        </button>
      </div>

      {/* HSK 3.0 MOVIES & BOOKS WORKBOOK DECKS + CUSTOM CSV IMPORT */}
      <div className={cn(
        "p-4 rounded-3xl border space-y-3 transition-all shadow-lg",
        isDarkMode
          ? "bg-zinc-950/85 border-zinc-800/90"
          : "bg-white border-zinc-200"
      )}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
              isDarkMode ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"
            )}>
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={cn("text-xs sm:text-sm font-black tracking-tight", isDarkMode ? "text-white" : "text-zinc-900")}>
                  Movies &amp; Books — HSK 3.0 Radna Sveska
                </h4>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border",
                  isDarkMode ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                )}>
                  <BookMarked className="w-3 h-3" />
                  Rečnik: {dictionaryCount ?? vocabList.length} reči
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                Izaberi nivo iz Movies &amp; Books tabele (11.500+ reči) i klikni „Sačuvaj u Rečnik“ za bitne reči
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleCsvFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95",
                isDarkMode
                  ? "bg-zinc-900 border-zinc-700 text-zinc-200 hover:border-amber-500/50 hover:text-amber-300"
                  : "bg-zinc-50 border-zinc-300 text-zinc-700 hover:border-amber-500"
              )}
              title="Učitaj sopstveni CSV list sa rečima (npr. iz Google Sheets / Excel tabele)"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Učitaj CSV</span>
            </button>
          </div>
        </div>

        {/* 5 Workbook Tiers + Optional Imported CSV Chip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MOVIES_BOOKS_TIERS.map((tier) => {
            const isActive = selectedCategory === tier.id;
            const liveCount = moviesBooksData?.[tier.id]?.length ?? tier.defaultCount;
            const activeRing =
              tier.accent === 'emerald'
                ? 'bg-emerald-950/60 border-emerald-500 ring-1 ring-emerald-500/50 text-emerald-200'
                : tier.accent === 'blue'
                  ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500/50 text-blue-200'
                  : tier.accent === 'purple'
                    ? 'bg-purple-950/60 border-purple-500 ring-1 ring-purple-500/50 text-purple-200'
                    : tier.accent === 'amber'
                      ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500/50 text-amber-200'
                      : 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500/50 text-rose-200';

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => handleSelectMoviesBooksTier(tier.id)}
                className={cn(
                  "p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 flex flex-col justify-between gap-1",
                  isActive
                    ? activeRing
                    : isDarkMode
                      ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-800"
                )}
                title={tier.subtitle}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-black truncate">{tier.shortLabel}</span>
                  <span className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0",
                    isActive ? "bg-black/30 text-white" : isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-600"
                  )}>
                    {liveCount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-1">{tier.subtitle}</p>
              </button>
            );
          })}
        </div>

        {customCsvDeck && (
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => {
                usedSpeedIdsRef.current.clear();
                setSelectedCategory('custom_csv');
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer",
                selectedCategory === 'custom_csv'
                  ? "bg-emerald-600 border-emerald-400 text-white shadow-md"
                  : isDarkMode
                    ? "bg-zinc-900 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
                    : "bg-emerald-50 border-emerald-300 text-emerald-800"
              )}
            >
              <span>📄 CSV: {customCsvDeck.name}</span>
              <span className="text-[10px] font-mono opacity-80">({customCsvDeck.items.length} reči)</span>
            </button>
          </div>
        )}

        {isLoadingMoviesBooks && (
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono py-1">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Učitavanje HSK 3.0 Movies &amp; Books baze (11.500+ reči)...</span>
          </div>
        )}

        {moviesBooksError && (
          <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
            {moviesBooksError}
          </div>
        )}

        {csvUploadMessage && (
          <div className={cn(
            "p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2",
            csvUploadMessage.type === 'success'
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-amber-950/40 border-amber-500/40 text-amber-300"
          )}>
            <span>{csvUploadMessage.text}</span>
            <button
              type="button"
              onClick={() => setCsvUploadMessage(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100 px-1.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* CATEGORY & FILTER TOOLBAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
          {categoriesWithCounts.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
              }}
              className={cn(
                "px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap min-w-fit",
                selectedCategory === cat.id
                  ? isGirlyMode ? "bg-pink-500 text-white shadow-md shadow-pink-500/20" : "bg-red-600 text-white shadow-md shadow-red-600/20"
                  : isDarkMode ? "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200" : "bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900"
              )}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 text-[10px] opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Deck Filters & Auto-Loop Controls */}
        {gameMode === 'cards' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Auto-Listanje Loop Toggle */}
            <button
              onClick={toggleSlideshow}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm",
                isSlideshowActive
                  ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-amber-500/20"
                  : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700" : "bg-white border-zinc-200 text-zinc-700"
              )}
              title={isSlideshowActive ? "Zaustavi automatsko listanje" : "Pokreni miran i usporen automatski loop karaktera"}
            >
              {isSlideshowActive ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-red-400" />}
              <span>{isSlideshowActive ? `Auto-Loop (${loopSecondsLeft}s)` : '▶️ Pokreni Auto-Loop'}</span>
            </button>

            {/* Loop Speed Controls */}
            {isSlideshowActive && (
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] shadow-inner flex-wrap",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600"
              )}>
                <span className="text-[10px] font-bold text-amber-400 mr-1">Brzina:</span>
                <button
                  type="button"
                  onClick={() => handleSelectLoopSpeed('zen')}
                  className={cn(
                    "px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all",
                    loopSpeed === 'zen' ? "bg-emerald-600 text-white shadow-sm" : "hover:text-white"
                  )}
                  title="Zen: 16 sekundi po strani (32s po kartici za duboko učenje)"
                >
                  🧘 16s (Zen)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLoopSpeed('ultra-slow')}
                  className={cn(
                    "px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all",
                    loopSpeed === 'ultra-slow' ? "bg-red-600 text-white shadow-sm" : "hover:text-white"
                  )}
                  title="Vrlo sporo: 12 sekundi po strani (24s po kartici - preporučeno)"
                >
                  🐢 12s (Vrlo sporo)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLoopSpeed('slow')}
                  className={cn(
                    "px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all",
                    loopSpeed === 'slow' ? "bg-amber-600 text-white shadow-sm" : "hover:text-white"
                  )}
                  title="Mirno i opušteno: 8 sekundi po strani (16s po kartici)"
                >
                  📖 8s (Mirno)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLoopSpeed('moderate')}
                  className={cn(
                    "px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all",
                    loopSpeed === 'moderate' ? "bg-blue-600 text-white shadow-sm" : "hover:text-white"
                  )}
                  title="Umereno: 5 sekundi po strani (10s po kartici)"
                >
                  ⚡ 5s
                </button>

                {/* Fine-grain Stepper */}
                <div className="flex items-center gap-1 ml-1.5 pl-1.5 border-l border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => handleAdjustLoopDuration(-1)}
                    className="p-1 rounded-md hover:bg-zinc-800 text-zinc-300"
                    title="Ubrzaj za 1s"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono text-[10px] font-bold text-white px-1">{loopDurationSec}s</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustLoopDuration(1)}
                    className="p-1 rounded-md hover:bg-zinc-800 text-zinc-300"
                    title="Uspori za 1s"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setFlipDirection(prev => prev === 'chinese-first' ? 'meaning-first' : 'chinese-first')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700" : "bg-white border-zinc-200 text-zinc-700"
              )}
              title="Promeni početnu stranu kartice"
            >
              <RotateCw className="w-3.5 h-3.5 text-red-400" />
              <span>{flipDirection === 'chinese-first' ? 'Hanzi → Srpski' : 'Srpski → Hanzi'}</span>
            </button>

            <button
              onClick={() => initDeck(true)}
              className={cn(
                "p-2 rounded-xl border text-xs font-bold transition-all",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-white border-zinc-200 text-zinc-600"
              )}
              title="Promešaj špil (Random redosled)"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODE 1: 3D INTERACTIVE FLASHCARDS DECK */}
      {/* ========================================================= */}
      {gameMode === 'cards' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {!isDeckFinished && currentCard && (
            <>
              {/* Progress Bar & Indicators */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-400">Kartica {currentIndex + 1}</span>
                  <span>/ {deck.length}</span>
                </div>
                <span>Preostalo za ponavljanje: {deck.length - currentIndex}</span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div 
                  className={cn("h-full", isGirlyMode ? "bg-pink-500" : "bg-red-500")}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* LIVE SLIDESHOW BANNER (WHEN LOOP IS RUNNING) */}
              {isSlideshowActive && (
                <div className={cn(
                  "p-4 rounded-3xl border text-xs shadow-xl transition-all space-y-3",
                  isLoopPaused 
                    ? "bg-zinc-900/90 border-amber-500/40 text-amber-200" 
                    : "bg-zinc-950/90 border-red-500/30 text-zinc-200"
                )}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
                        isLoopPaused 
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                          : "bg-red-500/20 border-red-500/50 text-red-400"
                      )}>
                        {isLoopPaused ? <Pause className="w-4 h-4" /> : <Timer className="w-4 h-4 animate-spin text-red-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          {isLoopPaused ? (
                            <span className="text-amber-300">⏸️ Auto-Loop Pauziran — učite karakter u miru</span>
                          ) : (
                            <span className="text-white">
                              Auto-Loop (Usporen): <strong className="text-red-400">{isFlipped ? 'Sledeći karakter' : 'Prevod i radikal'}</strong> za <strong className="text-amber-400">{loopSecondsLeft}s</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Tempo učenja: <strong>{loopDurationSec}s</strong> po strani ({loopDurationSec * 2}s po reči) • Mirno i bez žurbe
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={toggleLoopPause}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 border shadow-sm active:scale-95",
                          isLoopPaused 
                            ? "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-emerald-600/30" 
                            : "bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300 shadow-amber-500/20"
                        )}
                        title={isLoopPaused ? "Nastavi automatski loop" : "Pauziraj tajmer da detaljno proučite karakter"}
                      >
                        {isLoopPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                        <span>{isLoopPaused ? 'Nastavi Loop' : 'Pauziraj'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={toggleSlideshow}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold text-xs text-zinc-300 hover:text-white transition-all border border-zinc-700"
                        title="Isključi automatski loop i pređi na ručno listanje"
                      >
                        ✕ Isključi
                      </button>
                    </div>
                  </div>

                  {/* Countdown Progress Fill Bar */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        isLoopPaused ? "bg-amber-500" : isGirlyMode ? "bg-pink-500" : "bg-red-500"
                      )}
                      animate={{ 
                        width: `${Math.max(0, Math.min(100, (loopSecondsLeft / loopDurationSec) * 100))}%` 
                      }}
                      transition={{ duration: 0.5, ease: 'linear' }}
                    />
                  </div>
                </div>
              )}

              {/* 3D FLIP CARD CONTAINER */}
              <div 
                className="w-full cursor-pointer select-none"
                style={{ perspective: '1200px' }}
                onClick={handleFlipCard}
              >
                <motion.div
                  className="relative w-full rounded-3xl border shadow-2xl transition-all"
                  style={{
                    transformStyle: 'preserve-3d',
                    minHeight: '430px'
                  }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {/* ============================================ */}
                  {/* FRONT FACE (Default: Chinese Hanzi + Audio) */}
                  {/* ============================================ */}
                  <div
                    className={cn(
                      "absolute inset-0 w-full h-full p-8 rounded-3xl flex flex-col justify-between items-center text-center",
                      "border backdrop-blur-xl transition-all",
                      isDarkMode
                        ? "bg-gradient-to-br from-[#120a0a] via-[#0d0707] to-[#080404] border-red-500/25 shadow-red-950/30"
                        : "bg-gradient-to-br from-white via-red-50/20 to-white border-red-200/60 shadow-xl"
                    )}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Top Badges */}
                    <div className="w-full flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                          {currentCard.categoryLabel || currentCard.category.toUpperCase()}
                        </span>

                        {isSlideshowActive && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLoopPause();
                            }}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border transition-all",
                              isLoopPaused 
                                ? "bg-amber-500/20 border-amber-500 text-amber-300" 
                                : "bg-black/40 border-red-500/40 text-red-300"
                            )}
                            title={isLoopPaused ? "Nastavi Loop" : "Pauziraj Loop"}
                          >
                            {isLoopPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                            <span>{isLoopPaused ? "Pauzirano" : `${loopSecondsLeft}s`}</span>
                          </button>
                        )}
                      </div>

                      {currentCard.radical && (
                        <span className="text-xs font-mono font-bold text-amber-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-amber-500/30 shadow-inner">
                          部首 Radikal: {currentCard.radical}
                        </span>
                      )}
                    </div>

                    {/* Central Chinese Character with Single Unified Visual Icon */}
                    <div className="my-auto space-y-3">
                      <div className="flex items-center justify-center">
                        {currentCard.emoji ? (
                          <span className="text-5xl animate-bounce select-none filter drop-shadow-sm" role="img" aria-label={currentCard.translation}>
                            {currentCard.emoji}
                          </span>
                        ) : (
                          <PagodaTempleIllustration size={46} className="drop-shadow-md" />
                        )}
                      </div>

                      <h2 className="text-6xl sm:text-7xl font-black tracking-wide font-sans text-white drop-shadow-md select-text">
                        {currentCard.char}
                      </h2>

                      {/* Transliteration Hint */}
                      <p className="text-sm font-mono text-zinc-300">
                        Pinyin: <span className="text-red-400 font-bold">{currentCard.pinyin}</span> • Vuk: <span className="text-amber-300 font-bold">/{currentCard.vuk}/</span>
                      </p>

                      {/* TTS Play & Social Copy Row */}
                      <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakChinese(currentCard.char, `flash-${currentCard.id}`);
                          }}
                          className={cn(
                            "px-3.5 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all border active:scale-95 shadow-sm",
                            isPronouncing === `flash-${currentCard.id}`
                              ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30 scale-105"
                              : isDarkMode ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-red-500/50" : "bg-white border-zinc-200 text-zinc-700 hover:border-red-500"
                          )}
                        >
                          <Volume2 className={cn("w-4 h-4", isPronouncing === `flash-${currentCard.id}` && "animate-pulse")} />
                          <span>{isPronouncing === `flash-${currentCard.id}` ? "Pusta se..." : "Izgovor (TTS)"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleCopyCardSocial(currentCard, e)}
                          className={cn(
                            "px-3.5 py-2 rounded-2xl flex items-center gap-1.5 text-xs font-bold transition-all border active:scale-95 shadow-sm",
                            copiedCardId === currentCard.id
                              ? "bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/30"
                              : isDarkMode 
                                ? "bg-zinc-900/90 border-zinc-700 text-amber-300 hover:border-amber-500/60 hover:text-white" 
                                : "bg-white border-zinc-200 text-amber-800 hover:border-amber-500"
                          )}
                          title="Kopiraj karakter sa pinyinom i značenjem za objavu na mrežama"
                        >
                          {copiedCardId === currentCard.id ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-200" />
                              <span className="font-bold">Kopirano! ✨</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-amber-400" />
                              <span>Kopiraj za Social Media 📋</span>
                            </>
                          )}
                        </button>

                        {renderSaveWordButton(currentCard)}
                      </div>
                    </div>

                    {/* Bottom Prompt */}
                    <div className="w-full flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800/60">
                      <span>Savladano: {masteredIds.includes(currentCard.id) ? "Da ⭐" : "Ne"}</span>
                      <span className="flex items-center gap-1.5 text-red-400 font-bold">
                        <RotateCw className="w-3.5 h-3.5" /> Dodirni za prevod i mudrost
                      </span>
                    </div>
                  </div>

                  {/* ============================================ */}
                  {/* BACK FACE (Translation + Mnemonic + Quote) */}
                  {/* ============================================ */}
                  <div
                    className={cn(
                      "absolute inset-0 w-full h-full p-8 rounded-3xl flex flex-col justify-between items-center text-center",
                      "border backdrop-blur-xl transition-all",
                      isDarkMode
                        ? "bg-gradient-to-br from-[#0c0d16] via-[#090a10] to-[#05060a] border-blue-500/30 shadow-blue-950/20"
                        : "bg-gradient-to-br from-white via-blue-50/30 to-white border-blue-200 shadow-xl"
                    )}
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Top Bar with Phonetics & Loop Pause */}
                    <div className="w-full flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="font-mono font-bold text-amber-400">
                        Vuk: /{currentCard.vuk}/
                      </span>

                      {isSlideshowActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLoopPause();
                          }}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border transition-all",
                            isLoopPaused 
                              ? "bg-amber-500/20 border-amber-500 text-amber-300" 
                              : "bg-black/40 border-blue-500/40 text-blue-300"
                          )}
                          title={isLoopPaused ? "Nastavi Loop" : "Pauziraj Loop"}
                        >
                          {isLoopPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
                          <span>{isLoopPaused ? "Pauzirano" : `${loopSecondsLeft}s`}</span>
                        </button>
                      )}

                      <span className="font-mono font-bold text-blue-300">
                        Pinyin: {currentCard.pinyin}
                      </span>
                    </div>

                    {/* Meaning Content */}
                    <div className="my-auto space-y-3 w-full">
                      <div className="flex items-center justify-center mb-1">
                        {currentCard.emoji ? (
                          <span className="text-4xl select-none filter drop-shadow-sm" role="img" aria-label={currentCard.translation}>
                            {currentCard.emoji}
                          </span>
                        ) : (
                          <LittleDragonMascot size={42} className="drop-shadow-md" />
                        )}
                      </div>
                      
                      <h3 className="text-2xl sm:text-3xl font-black text-white">
                        {currentCard.translation}
                      </h3>

                      <p className="text-sm font-semibold text-zinc-400">
                        Engleski: <span className="text-blue-300">{currentCard.english}</span>
                      </p>

                      {/* Visual Tip Mnemonic */}
                      {currentCard.visualTip && (
                        <div className={cn(
                          "p-3 rounded-2xl border text-xs text-left flex items-start gap-2.5 max-w-lg mx-auto",
                          isDarkMode ? "bg-zinc-900/80 border-zinc-800 text-zinc-300" : "bg-blue-50/60 border-blue-100 text-zinc-700"
                        )}>
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-400 block mb-0.5">Mnemotehnika / Asocijacija za Hanzi:</span>
                            <span>{currentCard.visualTip}</span>
                          </div>
                        </div>
                      )}

                      {/* Wise Quote Snippet */}
                      {getChineseQuoteForItem(currentCard) && (
                        <div className={cn(
                          "p-3 rounded-2xl border text-xs max-w-lg mx-auto",
                          isDarkMode ? "bg-blue-950/20 border-blue-800/30 text-blue-200" : "bg-blue-50 border-blue-100 text-blue-900"
                        )}>
                          <p className="font-serif font-bold mb-1 text-sm text-amber-300">{getChineseQuoteForItem(currentCard).quote}</p>
                          <p className="text-[11px] text-zinc-400 italic">"{getChineseQuoteForItem(currentCard).translation}"</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status */}
                    <div className="w-full flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800/60 flex-wrap gap-2">
                      <span>Karakter: <strong className="text-white text-base">{currentCard.char}</strong></span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleCopyCardSocial(currentCard, e)}
                          className={cn(
                            "font-bold flex items-center gap-1.5 transition-colors text-xs",
                            copiedCardId === currentCard.id ? "text-emerald-400" : "text-amber-400 hover:text-amber-300"
                          )}
                          title="Kopiraj reč sa detaljima za društvene mreže"
                        >
                          {copiedCardId === currentCard.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Kopirano!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-400" />
                              <span>Kopiraj Reč 📋</span>
                            </>
                          )}
                        </button>

                        {renderSaveWordButton(currentCard, true)}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakChinese(currentCard.char, `flash-${currentCard.id}`);
                          }}
                          className="text-red-400 font-bold flex items-center gap-1 hover:underline text-xs"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Ponovi Zvuk
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ACTION BUTTONS (Still Learning vs Mastered) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-2 relative">
                {/* Floating Score Badge on Mastered Click */}
                <AnimatePresence>
                  {scoreAnimation && (
                    <motion.div
                      key={scoreAnimation.id}
                      initial={{ opacity: 0, y: 15, scale: 0.8 }}
                      animate={{ opacity: 1, y: -20, scale: 1.15 }}
                      exit={{ opacity: 0, y: -40, scale: 0.9 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute -top-7 right-4 sm:right-8 pointer-events-none z-30 px-3.5 py-1.5 rounded-full bg-emerald-500 text-white font-mono font-black text-xs shadow-2xl shadow-emerald-500/50 border border-emerald-300 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200 animate-spin" />
                      <span>{scoreAnimation.text}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={handleNeedReview}
                  className={cn(
                    "py-3.5 sm:py-4 px-3 sm:px-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-xs sm:text-sm transition-all active:scale-95 shadow-lg min-w-0 text-center group",
                    isDarkMode 
                      ? "bg-rose-950/30 border-rose-800/40 text-rose-300 hover:bg-rose-900/40 shadow-rose-950/20" 
                      : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                  )}
                  title="Označi da još učiš ovu reč - ponavljamo na kraju špila"
                >
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span className="truncate">Još Učim ⏳ <span className="hidden sm:inline">(Ponavljam)</span></span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkMastered}
                  className={cn(
                    "py-3.5 sm:py-4 px-3 sm:px-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-xs sm:text-sm transition-all active:scale-95 shadow-xl min-w-0 text-center relative overflow-hidden group",
                    isGirlyMode 
                      ? "bg-gradient-to-r from-pink-600 to-rose-600 border-pink-400 text-white shadow-pink-600/40 hover:shadow-pink-600/60" 
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400 text-white shadow-emerald-600/40 hover:shadow-emerald-600/60"
                  )}
                  title="Znam ovu reč! Osvoji poene i pređi na sledeću karticu"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0 group-hover:scale-125 transition-transform" />
                  <span className="truncate font-black tracking-wide">Znam! (+10 XP) ✨</span>
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
                <button
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-3 py-2 sm:py-1.5 rounded-xl hover:bg-zinc-800/50 disabled:opacity-30 disabled:pointer-events-none transition-all shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" /> Prethodna
                </button>

                <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono">
                  <span>[Razmak]: Okreni</span>
                  <span>[1]: Ponavljaj</span>
                  <span>[2]: Savladano</span>
                </div>

                <button
                  onClick={advanceToNextCard}
                  className="flex items-center gap-1 px-3 py-2 sm:py-1.5 rounded-xl hover:bg-zinc-800/50 transition-all text-red-400 font-bold shrink-0"
                >
                  Sledeća <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* DECK FINISHED CELEBRATION */}
          {isDeckFinished && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "p-8 rounded-3xl border text-center space-y-6 shadow-2xl",
                isDarkMode ? "bg-zinc-950 border-red-500/30" : "bg-white border-red-200"
              )}
            >
              <CartoonVictoryIllustration className="my-2" />
              <h3 className="text-2xl sm:text-3xl font-black text-white">Špil je uspešno završen!</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Svi hanzi karakteri u ovoj sesiji su pregledani. Vaše znanje kineskog vokabulara je podignuto na novi nivo!
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-lg mx-auto font-mono text-center">
                <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-amber-500/30">
                  <span className="text-[10px] sm:text-xs text-zinc-400 block">Osvojeno XP</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">⭐ {flashcardScore}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] sm:text-xs text-zinc-500 block">Pregledano</span>
                  <span className="text-base sm:text-lg font-black text-white">{sessionReviewed}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] sm:text-xs text-zinc-500 block">Najveći Niz</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">🔥 {highestStreak}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] sm:text-xs text-zinc-500 block">Savladano</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">⭐ {masteredIds.length}</span>
                </div>
              </div>

              {/* Mobile-Friendly Buttons: flex-col on mobile, flex-row on desktop */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-4 w-full max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => initDeck(false)}
                  className={cn(
                    "w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 text-white shadow-xl transition-all active:scale-95 text-center",
                    isGirlyMode ? "bg-pink-600 hover:bg-pink-500" : "bg-red-600 hover:bg-red-500"
                  )}
                >
                  <RotateCw className="w-4 h-4 shrink-0" />
                  <span>Igraj Ponovo (Promešaj Špil)</span>
                </button>

                {onSwitchToQuiz && (
                  <button
                    type="button"
                    onClick={onSwitchToQuiz}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-center"
                  >
                    <Gamepad2 className="w-4 h-4 shrink-0" />
                    <span>Pokreni Duo Kviz</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: VISUAL MEMORY MATCH GAME (SPOJI PAROVE) */}
      {/* ========================================================= */}
      {gameMode === 'match' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Match Game Header Stats */}
          <div className={cn(
            "p-4 rounded-2xl border flex items-center justify-between text-xs font-mono font-bold",
            isDarkMode ? "bg-zinc-900/60 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
          )}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Timer className="w-4 h-4" /> Vreme: {Math.floor(matchTimer / 60)}:{(matchTimer % 60).toString().padStart(2, '0')}
              </span>
              <span>Potezi: {matchMoves}</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Spojeno: <strong className="text-emerald-400">{matchedPairsCount}</strong> / {matchGridSize}</span>
              
              <button
                onClick={initMatchGame}
                className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-all flex items-center gap-1 text-[11px]"
              >
                <Shuffle className="w-3 h-3" /> Nova Igra
              </button>
            </div>
          </div>

          {/* CARDS GRID */}
          {!matchGameFinished ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {matchCards.map((card, idx) => (
                <motion.div
                  key={card.uniqueId}
                  whileHover={{ scale: card.isMatched ? 1 : 1.02 }}
                  whileTap={{ scale: card.isMatched ? 1 : 0.98 }}
                  onClick={() => handleMatchCardClick(idx)}
                  className={cn(
                    "h-32 sm:h-36 rounded-2xl p-4 border flex flex-col justify-between items-center text-center cursor-pointer select-none transition-all shadow-md",
                    card.isMatched
                      ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 opacity-60 scale-95 pointer-events-none"
                      : card.isFlipped
                        ? isDarkMode ? "bg-zinc-800 border-red-500 text-white shadow-red-500/10" : "bg-red-50 border-red-400 text-red-950"
                        : isDarkMode ? "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 text-zinc-500" : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-400"
                  )}
                >
                  {card.isFlipped || card.isMatched ? (
                    <>
                      <span className="text-2xl">{card.emoji}</span>
                      
                      {card.type === 'chinese' ? (
                        <div className="space-y-1">
                          <p className="text-3xl font-black text-white font-sans">
                            {card.content}
                          </p>
                          <p className="text-[10px] font-mono text-red-400">{card.subContent}</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-base sm:text-lg font-black text-white leading-tight">
                            {card.content}
                          </p>
                          <p className="text-[10px] font-mono text-amber-400">{card.subContent}</p>
                        </div>
                      )}

                      <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">
                        {card.type === 'chinese' ? 'Hanzi Karakter' : 'Srpski Prevod'}
                      </span>
                    </>
                  ) : (
                    <div className="m-auto flex flex-col items-center justify-center gap-1.5 p-1">
                      <CartoonCardBack size={60} className="hover:rotate-1 transition-transform" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400/80">
                        Otkrij 🎴
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            /* Match Game Completed Banner */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "p-6 sm:p-8 rounded-3xl border text-center space-y-5 shadow-2xl",
                isDarkMode ? "bg-zinc-950 border-blue-500/40" : "bg-white border-blue-200"
              )}
            >
              <CartoonVictoryIllustration className="my-2" />
              <h3 className="text-2xl sm:text-3xl font-black text-white">Sjajno vizuelno pamćenje!</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Pronašli ste svih {matchGridSize} parova za samo {matchMoves} poteza u {matchTimer} sekundi.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={initMatchGame}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs sm:text-sm bg-red-600 hover:bg-red-500 text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-center"
                >
                  <RotateCw className="w-4 h-4 shrink-0" />
                  <span>Igraj Novo Kolo</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Save-to-Dictionary Strip for Words in This Memory Match Round */}
          {onSaveWordToDict && matchCards.length > 0 && (
            <div className={cn(
              "p-4 rounded-2xl border space-y-2.5",
              isDarkMode ? "bg-zinc-950/70 border-zinc-800" : "bg-white border-zinc-200"
            )}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400" />
                  Sačuvaj reči iz ove partije u glavni Rečnik
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Rečnik: {dictionaryCount ?? vocabList.length} reči
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchCards
                  .filter((c) => c.type === 'chinese' && (c.isMatched || matchGameFinished))
                  .map((c) => (
                    <div
                      key={c.vocabId}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs",
                        isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-200" : "bg-zinc-50 border-zinc-200 text-zinc-800"
                      )}
                    >
                      <span className="font-black text-base text-white">{c.vocab.char}</span>
                      <span className="text-[11px] text-zinc-400 max-w-[140px] truncate">{c.vocab.translation}</span>
                      {renderSaveWordButton(c.vocab, true)}
                    </div>
                  ))}
                {!matchGameFinished && matchCards.filter((c) => c.type === 'chinese' && c.isMatched).length === 0 && (
                  <p className="text-[11px] text-zinc-500">
                    Spoji prvi par da otključaš dugme za čuvanje reči u Rečnik.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: SPEED CHALLENGE (BRZI IZAZOV) */}
      {/* ========================================================= */}
      {gameMode === 'speed' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {!speedComplete && speedQuestions.length > 0 && (
            <div className={cn(
              "p-8 rounded-3xl border shadow-2xl space-y-6 text-center",
              isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"
            )}>
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Pitanje {speedQuestionIdx + 1} / {speedQuestions.length}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
                    {speedQuestions.length} Pokušaja · Serija #{speedBatchNum || 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={initSpeedChallenge}
                    className={cn(
                      "px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer",
                      isDarkMode
                        ? "bg-zinc-900 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                        : "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                    )}
                    title="Izvuci novu nasumičnu seriju od 30 reči"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Promešaj</span>
                  </button>
                  <span className="font-bold text-amber-400">Bodovi: {speedScore}</span>
                </div>
              </div>

              {/* Word Presentation */}
              <div className="space-y-3 py-3">
                {/* Emoji Slot: Hidden by default so players cannot guess; Revealed via 'Hint' button or after answering */}
                <div className="min-h-[3.25rem] flex items-center justify-center">
                  {(speedShowHint || selectedAnswer !== null) ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="text-5xl filter drop-shadow select-none"
                    >
                      {speedQuestions[speedQuestionIdx].vocab.emoji}
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSpeedShowHint(true)}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 group hover:border-amber-400 cursor-pointer"
                      title="Kliknite na 'Hint' ako ne možete prepoznati karakter da prikažete ikonicu kao pomoć"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                      <span>Hint 💡</span>
                    </button>
                  )}
                </div>

                <h2 className="text-6xl sm:text-7xl font-black text-white tracking-wide">
                  {speedQuestions[speedQuestionIdx].vocab.char}
                </h2>
                <p className="text-xs font-mono text-zinc-300">
                  Pinyin: <span className="text-red-400 font-bold">{speedQuestions[speedQuestionIdx].vocab.pinyin}</span> • Vuk: <span className="text-amber-400 font-bold">/{speedQuestions[speedQuestionIdx].vocab.vuk}/</span>
                </p>

                {speedQuestions[speedQuestionIdx].vocab.categoryLabel && (
                  <div className="flex items-center justify-center">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400">
                      {speedQuestions[speedQuestionIdx].vocab.categoryLabel}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => speakChinese(speedQuestions[speedQuestionIdx].vocab.char, `speed-prompt-${speedQuestionIdx}`)}
                    className={cn(
                      "px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95",
                      isDarkMode
                        ? "bg-zinc-900 border-zinc-700 text-amber-400 hover:border-amber-500/60"
                        : "bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-400"
                    )}
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Poslušaj Zvuk
                  </button>

                  {renderSaveWordButton(speedQuestions[speedQuestionIdx].vocab)}
                </div>
              </div>

              {/* 4 Answer Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {speedQuestions[speedQuestionIdx].options.map((option, oIdx) => {
                  const isChosen = selectedAnswer === option;
                  const isCorrectAnswer = option === speedQuestions[speedQuestionIdx].correctAnswer;
                  
                  return (
                    <button
                      key={oIdx}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleSpeedAnswer(option)}
                      className={cn(
                        "p-4 rounded-2xl border text-sm font-bold text-left transition-all active:scale-95 flex items-center justify-between",
                        selectedAnswer !== null
                          ? isCorrectAnswer
                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-black scale-102"
                            : isChosen
                              ? "bg-rose-950/60 border-rose-500 text-rose-300"
                              : "bg-zinc-900/40 border-zinc-800 text-zinc-600 opacity-40"
                          : isDarkMode
                            ? "bg-zinc-900 border-zinc-800 hover:border-amber-500/50 text-white"
                            : "bg-zinc-50 border-zinc-200 hover:border-amber-500 text-zinc-900"
                      )}
                    >
                      <span>{option}</span>
                      {selectedAnswer !== null && isCorrectAnswer && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* POST-ANSWER INSIGHT & CALM PACING CONTROLS */}
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-5 rounded-3xl border text-left space-y-4 shadow-xl transition-all",
                    selectedAnswer === speedQuestions[speedQuestionIdx].correctAnswer
                      ? isDarkMode ? "bg-emerald-950/40 border-emerald-500/50" : "bg-emerald-50 border-emerald-300"
                      : isDarkMode ? "bg-rose-950/40 border-rose-500/50" : "bg-rose-50 border-rose-300"
                  )}
                >
                  {/* Status Headline */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {selectedAnswer === speedQuestions[speedQuestionIdx].correctAnswer ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <span className="font-black text-emerald-400 text-sm">
                            Tačno! Odlično poznavanje karaktera! ⭐
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          <div>
                            <span className="font-black text-rose-400 text-sm block">Netačno</span>
                            <span className="text-xs text-zinc-300">
                              Tačan odgovor: <strong className="text-emerald-400 underline">{speedQuestions[speedQuestionIdx].correctAnswer}</strong>
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {renderSaveWordButton(speedQuestions[speedQuestionIdx].vocab, true)}
                      <button
                        type="button"
                        onClick={() => speakChinese(speedQuestions[speedQuestionIdx].vocab.char, `speed-repeat-${speedQuestionIdx}`)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Ponovi Zvuk</span>
                      </button>
                    </div>
                  </div>

                  {/* Word Breakdown & Linguistic Details */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-sans font-black text-white">
                          {speedQuestions[speedQuestionIdx].vocab.char}
                        </span>
                        <div>
                          <p className="text-xs font-mono font-bold text-amber-400">
                            Pinyin: {speedQuestions[speedQuestionIdx].vocab.pinyin} • Vuk: /{speedQuestions[speedQuestionIdx].vocab.vuk}/
                          </p>
                          <p className="text-xs font-semibold text-zinc-200">
                            {speedQuestions[speedQuestionIdx].vocab.translation} — <span className="text-zinc-400">{speedQuestions[speedQuestionIdx].vocab.english}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-3xl">{speedQuestions[speedQuestionIdx].vocab.emoji}</span>
                    </div>

                    {speedQuestions[speedQuestionIdx].vocab.radical && (
                      <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                        <span className="text-amber-400 font-bold">Radikal (部首):</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">{speedQuestions[speedQuestionIdx].vocab.radical}</span>
                      </div>
                    )}

                    {speedQuestions[speedQuestionIdx].vocab.visualTip && (
                      <div className="text-[11px] text-zinc-300 flex items-start gap-1.5 pt-1.5 border-t border-white/5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{speedQuestions[speedQuestionIdx].vocab.visualTip}</span>
                      </div>
                    )}
                  </div>

                  {/* Pacing Info & Action Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                    {pacingMode !== 'manual' && speedCountdownRemaining !== null ? (
                      <div className="flex items-center gap-2.5 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                          <Timer className="w-4 h-4 animate-spin text-amber-400" />
                          <span>Sledeći karakter za {speedCountdownRemaining}s...</span>
                        </div>
                        <button
                          type="button"
                          onClick={pauseSpeedTimer}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all flex items-center gap-1.5 border border-zinc-700 shadow-sm"
                        >
                          <Pause className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pauziraj (Prouči na miru)</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
                        ✋ Proučite karakter u svom ritmu bez žurbe
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={advanceToNextSpeedQuestion}
                      className={cn(
                        "px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-lg",
                        isGirlyMode 
                          ? "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/30" 
                          : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                      )}
                    >
                      <span>Sledeći Karakter</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Speed Complete Banner */}
          {speedComplete && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "p-6 sm:p-8 rounded-3xl border text-center space-y-5 shadow-2xl",
                isDarkMode ? "bg-zinc-950 border-amber-500/40" : "bg-white border-amber-200"
              )}
            >
              <CartoonVictoryIllustration className="my-2" />
              <h3 className="text-2xl sm:text-3xl font-black text-white">Izazov završen!</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Osvojili ste <strong className="text-amber-400 font-bold">{speedScore}</strong> bodova od maksimalnih {speedQuestions.length * 10}!
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full max-w-md mx-auto">
                <button
                  type="button"
                  onClick={initSpeedChallenge}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs sm:text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <Shuffle className="w-4 h-4 shrink-0" />
                  <span>Nova Serija ({Math.min(speedQuestionCount, filteredPool.length)} Reči)</span>
                </button>
              </div>

              {/* Round Review & Quick Save Strip */}
              {onSaveWordToDict && speedQuestions.length > 0 && (
                <div className="pt-4 border-t border-zinc-800/80 text-left space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">
                      Pregled reči iz serije — Sačuvaj bitne u Rečnik ({dictionaryCount ?? vocabList.length} ukupno):
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {speedQuestions.map((q) => (
                      <div
                        key={q.vocab.id}
                        className={cn(
                          "flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs",
                          isDarkMode ? "bg-zinc-900/90 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                        )}
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="text-lg font-black text-white shrink-0">{q.vocab.char}</span>
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] text-red-400 truncate">{q.vocab.pinyin}</p>
                            <p className="text-[11px] text-zinc-300 truncate">{q.vocab.translation}</p>
                          </div>
                        </div>
                        {renderSaveWordButton(q.vocab, true)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
