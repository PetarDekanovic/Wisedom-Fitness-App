import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { HebrewVocabItem } from '../data/hebrewVocabData';
import { getHebrewQuoteForItem } from '../data/hebrewVocabData';

export interface HebrewFlashcardsGameProps {
  vocabList: HebrewVocabItem[];
  masteredIds: string[];
  toggleMastered: (id: string) => void;
  speakHebrew: (text: string, id?: string) => void;
  isPronouncing: string | null;
  isDarkMode: boolean;
  isGirlyMode: boolean;
  onSwitchToQuiz?: () => void;
}

type GameMode = 'cards' | 'match' | 'speed';

interface MatchCard {
  uniqueId: string;
  vocabId: string;
  type: 'hebrew' | 'meaning';
  content: string;
  subContent?: string;
  emoji: string;
  vocab: HebrewVocabItem;
  isFlipped: boolean;
  isMatched: boolean;
}

export const HebrewFlashcardsGame: React.FC<HebrewFlashcardsGameProps> = ({
  vocabList,
  masteredIds,
  toggleMastered,
  speakHebrew,
  isPronouncing,
  isDarkMode,
  isGirlyMode,
  onSwitchToQuiz
}) => {
  // Game Mode: 'cards' (3D flip deck), 'match' (Memory match pairs), 'speed' (Quick multiple choice)
  const [gameMode, setGameMode] = useState<GameMode>('cards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [flipDirection, setFlipDirection] = useState<'hebrew-first' | 'meaning-first'>('hebrew-first');

  // --- MODE 1: 3D FLASHCARDS DECK STATE ---
  const [deck, setDeck] = useState<HebrewVocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [isDeckFinished, setIsDeckFinished] = useState(false);

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
    vocab: HebrewVocabItem;
    options: string[];
    correctAnswer: string;
  }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedComplete, setSpeedComplete] = useState(false);

  // Filter vocabulary pool based on category and mastery
  const filteredPool = useMemo(() => {
    let pool = [...vocabList];

    if (selectedCategory !== 'all') {
      pool = pool.filter(item => item.category === selectedCategory);
    }

    if (filterMode === 'unmastered') {
      pool = pool.filter(item => !masteredIds.includes(item.id));
    } else if (filterMode === 'mastered') {
      pool = pool.filter(item => masteredIds.includes(item.id));
    }

    return pool.length > 0 ? pool : vocabList;
  }, [vocabList, selectedCategory, filterMode, masteredIds]);

  // Categories list with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of vocabList) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return [
      { id: 'all', label: 'Sve Reči', count: vocabList.length },
      { id: 'svakodnevno', label: 'Svakodnevno (Hvala & Dijalozi)', count: counts['svakodnevno'] || 0 },
      { id: 'mudrost', label: 'Mudrost & Filozofija', count: counts['mudrost'] || 0 },
      { id: 'glagoli', label: 'Glagoli', count: counts['glagoli'] || 0 },
      { id: 'priroda', label: 'Priroda & Svemir', count: counts['priroda'] || 0 },
      { id: 'emocije', label: 'Emocije & Ljubav', count: counts['emocije'] || 0 },
      { id: 'misaoni', label: 'Misaoni & Uspeh', count: counts['misaoni'] || 0 },
      { id: 'hrana', label: 'Hrana & Piće', count: counts['hrana'] || 0 },
      { id: 'vreme_brojevi', label: 'Vreme & Brojevi', count: counts['vreme_brojevi'] || 0 }
    ];
  }, [vocabList]);

  // Initialize or shuffle Deck
  const initDeck = useCallback(() => {
    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsDeckFinished(false);
    
    // Auto speak first card if enabled
    if (autoSpeak && shuffled.length > 0) {
      setTimeout(() => {
        speakHebrew(shuffled[0].char, `flash-${shuffled[0].id}`);
      }, 350);
    }
  }, [filteredPool, autoSpeak, speakHebrew]);

  useEffect(() => {
    initDeck();
  }, [initDeck]);

  // Current Card
  const currentCard = deck[currentIndex] || deck[0];

  // Flip Card Action
  const handleFlipCard = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    
    if (nextFlipped && autoSpeak && currentCard) {
      speakHebrew(currentCard.char, `flash-${currentCard.id}`);
    }
  };

  // Mark as Mastered
  const handleMarkMastered = () => {
    if (!currentCard) return;

    if (!masteredIds.includes(currentCard.id)) {
      toggleMastered(currentCard.id);
    }

    const nextStreak = streak + 1;
    setStreak(nextStreak);
    if (nextStreak > highestStreak) setHighestStreak(nextStreak);
    setSessionReviewed(prev => prev + 1);

    advanceToNextCard();
  };

  // Mark as Still Learning (re-queues card in current deck)
  const handleNeedReview = () => {
    if (!currentCard) return;

    setStreak(0);
    setSessionReviewed(prev => prev + 1);

    // Push this card to the end of deck so it appears again
    setDeck(prev => [...prev, currentCard]);

    advanceToNextCard();
  };

  const advanceToNextCard = () => {
    setIsFlipped(false);
    if (currentIndex + 1 < deck.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (autoSpeak && deck[nextIdx]) {
        setTimeout(() => {
          speakHebrew(deck[nextIdx].char, `flash-${deck[nextIdx].id}`);
        }, 300);
      }
    } else {
      setIsDeckFinished(true);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      if (autoSpeak && deck[prevIdx]) {
        setTimeout(() => {
          speakHebrew(deck[prevIdx].char, `flash-${deck[prevIdx].id}`);
        }, 300);
      }
    }
  };

  // Keyboard navigation for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode !== 'cards') return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, isFlipped, currentIndex, deck]);

  // --- MEMORY MATCH GAME LOGIC ---
  const initMatchGame = useCallback(() => {
    const pool = [...filteredPool].sort(() => Math.random() - 0.5);
    const selectedVocabs = pool.slice(0, matchGridSize);

    const cards: MatchCard[] = [];
    selectedVocabs.forEach((v) => {
      // Hebrew Card
      cards.push({
        uniqueId: `he-${v.id}`,
        vocabId: v.id,
        type: 'hebrew',
        content: v.char,
        subContent: v.vuk,
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
        subContent: v.transliteration,
        emoji: v.emoji,
        vocab: v,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle the match board
    setMatchCards(cards.sort(() => Math.random() - 0.5));
    setSelectedMatchIndices([]);
    setMatchedPairsCount(0);
    setMatchMoves(0);
    setMatchTimer(0);
    setIsMatchTimerRunning(true);
    setMatchGameFinished(false);
  }, [filteredPool, matchGridSize]);

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
    if (selectedMatchIndices.length >= 2) return;
    if (matchCards[index].isFlipped || matchCards[index].isMatched) return;

    // Flip card
    const newCards = [...matchCards];
    newCards[index].isFlipped = true;
    setMatchCards(newCards);

    const newSelected = [...selectedMatchIndices, index];
    setSelectedMatchIndices(newSelected);

    if (newCards[index].type === 'hebrew') {
      speakHebrew(newCards[index].vocab.char, `match-${newCards[index].vocab.id}`);
    }

    if (newSelected.length === 2) {
      setMatchMoves(prev => prev + 1);
      const [firstIdx, secondIdx] = newSelected;
      const card1 = newCards[firstIdx];
      const card2 = newCards[secondIdx];

      // Check if match
      if (card1.vocabId === card2.vocabId && card1.type !== card2.type) {
        // MATCH!
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
          speakHebrew(card1.vocab.char, `matched-success-${card1.vocab.id}`);
        }, 400);
      } else {
        // NO MATCH -> Flip back
        setTimeout(() => {
          setMatchCards(prev => prev.map((c, i) => 
            i === firstIdx || i === secondIdx 
              ? { ...c, isFlipped: false }
              : c
          ));
          setSelectedMatchIndices([]);
        }, 900);
      }
    }
  };

  // --- MODE 3: SPEED CHALLENGE LOGIC ---
  const initSpeedChallenge = useCallback(() => {
    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5);
    const questionsList = shuffled.slice(0, 10).map(v => {
      const distractors = filteredPool
        .filter(other => other.id !== v.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(other => other.translation);

      const options = [v.translation, ...distractors].sort(() => Math.random() - 0.5);

      return {
        vocab: v,
        options,
        correctAnswer: v.translation
      };
    });

    setSpeedQuestions(questionsList);
    setSpeedQuestionIdx(0);
    setSelectedAnswer(null);
    setSpeedScore(0);
    setSpeedComplete(false);

    if (questionsList.length > 0 && autoSpeak) {
      setTimeout(() => {
        speakHebrew(questionsList[0].vocab.char, `speed-${questionsList[0].vocab.id}`);
      }, 300);
    }
  }, [filteredPool, autoSpeak, speakHebrew]);

  const handleSpeedAnswer = (option: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(option);

    const currentQ = speedQuestions[speedQuestionIdx];
    const isCorrect = option === currentQ.correctAnswer;

    if (isCorrect) {
      setSpeedScore(prev => prev + 10);
      speakHebrew(currentQ.vocab.char, `speed-correct-${currentQ.vocab.id}`);
      if (!masteredIds.includes(currentQ.vocab.id)) {
        toggleMastered(currentQ.vocab.id);
      }
    }

    setTimeout(() => {
      if (speedQuestionIdx + 1 < speedQuestions.length) {
        const nextIdx = speedQuestionIdx + 1;
        setSpeedQuestionIdx(nextIdx);
        setSelectedAnswer(null);
        if (autoSpeak) {
          speakHebrew(speedQuestions[nextIdx].vocab.char, `speed-${speedQuestions[nextIdx].vocab.id}`);
        }
      } else {
        setSpeedComplete(true);
      }
    }, 1100);
  };

  // Switch between game modes
  const handleModeChange = (mode: GameMode) => {
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
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={() => handleModeChange('cards')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2",
              gameMode === 'cards'
                ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : isDarkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Layers className="w-4 h-4" />
            <span>3D Vizuelne Kartice</span>
          </button>

          <button
            onClick={() => handleModeChange('match')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2",
              gameMode === 'match'
                ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" : "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : isDarkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Spoji Parove (Memory)</span>
          </button>

          <button
            onClick={() => handleModeChange('speed')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2",
              gameMode === 'speed'
                ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" : "bg-amber-600 text-white shadow-lg shadow-amber-600/25"
                : isDarkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Brzi Izazov (Kviz)</span>
          </button>
        </div>

        {/* Global Game Status Badges */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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
            <span>{masteredIds.length}/{vocabList.length}</span>
          </div>

          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn(
              "p-2 rounded-xl border text-xs font-bold transition-all",
              autoSpeak 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-500" : "bg-zinc-100 border-zinc-200 text-zinc-400"
            )}
            title={autoSpeak ? "Auto-zvuk uključen" : "Auto-zvuk isključen"}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CATEGORY & FILTER TOOLBAR */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categoriesWithCounts.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                if (gameMode === 'cards') initDeck();
              }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap",
                selectedCategory === cat.id
                  ? isGirlyMode ? "bg-pink-500 text-white shadow-md shadow-pink-500/20" : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : isDarkMode ? "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200" : "bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900"
              )}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 text-[10px] opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Deck Filters */}
        {gameMode === 'cards' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFlipDirection(prev => prev === 'hebrew-first' ? 'meaning-first' : 'hebrew-first')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700" : "bg-white border-zinc-200 text-zinc-700"
              )}
              title="Promeni početnu stranu kartice"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{flipDirection === 'hebrew-first' ? 'Hebrejski → Srpski' : 'Srpski → Hebrejski'}</span>
            </button>

            <button
              onClick={initDeck}
              className={cn(
                "p-2 rounded-xl border text-xs font-bold transition-all",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-white border-zinc-200 text-zinc-600"
              )}
              title="Promešaj špil"
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
                  <span className="font-bold text-emerald-400">Kartica {currentIndex + 1}</span>
                  <span>/ {deck.length}</span>
                </div>
                <span>Preostalo za ponavljanje: {deck.length - currentIndex}</span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <motion.div 
                  className={cn("h-full", isGirlyMode ? "bg-pink-500" : "bg-emerald-500")}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

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
                    minHeight: '420px'
                  }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {/* ============================================ */}
                  {/* FRONT FACE (Default: Hebrew Script + Audio) */}
                  {/* ============================================ */}
                  <div
                    className={cn(
                      "absolute inset-0 w-full h-full p-8 rounded-3xl flex flex-col justify-between items-center text-center",
                      "border backdrop-blur-xl transition-all",
                      isDarkMode
                        ? "bg-gradient-to-br from-[#0c1017] via-[#090d14] to-[#06080c] border-emerald-500/20 shadow-emerald-950/20"
                        : "bg-gradient-to-br from-white via-emerald-50/20 to-white border-emerald-200/60 shadow-xl"
                    )}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Top Badges */}
                    <div className="w-full flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {currentCard.categoryLabel || currentCard.category.toUpperCase()}
                      </span>

                      {currentCard.root && (
                        <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-700/50">
                          Koren: {currentCard.root}
                        </span>
                      )}
                    </div>

                    {/* Central Hebrew Word with Emoji */}
                    <div className="my-auto space-y-4">
                      <div className="text-5xl animate-bounce mb-2">
                        {currentCard.emoji}
                      </div>

                      <h2 
                        dir="rtl" 
                        className="text-5xl sm:text-6xl font-black tracking-wide font-sans text-white drop-shadow-md select-text"
                      >
                        {currentCard.char}
                      </h2>

                      {/* Transliteration Hint */}
                      <p className="text-sm font-mono text-zinc-400">
                        Izgovor: <span className="text-emerald-400 font-bold">{currentCard.transliteration}</span> ({currentCard.vuk})
                      </p>

                      {/* TTS Play Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakHebrew(currentCard.char, `flash-${currentCard.id}`);
                        }}
                        className={cn(
                          "mx-auto px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all border active:scale-95",
                          isPronouncing === `flash-${currentCard.id}`
                            ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105"
                            : isDarkMode ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-emerald-500/50" : "bg-white border-zinc-200 text-zinc-700 hover:border-emerald-500"
                        )}
                      >
                        <Volume2 className={cn("w-4 h-4", isPronouncing === `flash-${currentCard.id}` && "animate-pulse")} />
                        <span>{isPronouncing === `flash-${currentCard.id}` ? "Pusta se izgovor..." : "Poslušaj Izgovor (TTS)"}</span>
                      </button>
                    </div>

                    {/* Bottom Prompt */}
                    <div className="w-full flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800/60">
                      <span>Savladano: {masteredIds.includes(currentCard.id) ? "Da ⭐" : "Ne"}</span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
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
                        ? "bg-gradient-to-br from-[#080d16] via-[#07090f] to-[#04060a] border-blue-500/30 shadow-blue-950/20"
                        : "bg-gradient-to-br from-white via-blue-50/30 to-white border-blue-200 shadow-xl"
                    )}
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Top Bar with Phonetics */}
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-400">
                        Vuk: /{currentCard.vuk}/
                      </span>
                      <span className="font-mono font-bold text-zinc-400">
                        Latin: {currentCard.transliteration}
                      </span>
                    </div>

                    {/* Meaning Content */}
                    <div className="my-auto space-y-3 w-full">
                      <div className="text-4xl mb-1">{currentCard.emoji}</div>
                      
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
                            <span className="font-bold text-amber-400 block mb-0.5">Mnemotehnika / Asocijacija:</span>
                            <span>{currentCard.visualTip}</span>
                          </div>
                        </div>
                      )}

                      {/* Wise Quote Snippet */}
                      {getHebrewQuoteForItem(currentCard) && (
                        <div className={cn(
                          "p-3 rounded-2xl border text-xs max-w-lg mx-auto",
                          isDarkMode ? "bg-blue-950/20 border-blue-800/30 text-blue-200" : "bg-blue-50 border-blue-100 text-blue-900"
                        )}>
                          <p dir="rtl" className="font-bold mb-1 text-sm">{getHebrewQuoteForItem(currentCard).quote}</p>
                          <p className="text-[11px] text-zinc-400 italic">"{getHebrewQuoteForItem(currentCard).translation}"</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status */}
                    <div className="w-full flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800/60">
                      <span>Reč: <strong className="text-white" dir="rtl">{currentCard.char}</strong></span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakHebrew(currentCard.char, `flash-${currentCard.id}`);
                        }}
                        className="text-blue-400 font-bold flex items-center gap-1 hover:underline"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Ponovi Zvuk
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ACTION BUTTONS (Still Learning vs Mastered) */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleNeedReview}
                  className={cn(
                    "py-3.5 px-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-sm transition-all active:scale-95 shadow-lg",
                    isDarkMode 
                      ? "bg-rose-950/30 border-rose-800/40 text-rose-300 hover:bg-rose-900/40 shadow-rose-950/20" 
                      : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                  )}
                >
                  <XCircle className="w-5 h-5 text-rose-500" />
                  <span>Još Učim ⏳ (Ponavljam)</span>
                </button>

                <button
                  type="button"
                  onClick={handleMarkMastered}
                  className={cn(
                    "py-3.5 px-4 rounded-2xl border flex items-center justify-center gap-2 font-black text-sm transition-all active:scale-95 shadow-lg",
                    isGirlyMode 
                      ? "bg-pink-600 border-pink-400 text-white shadow-pink-600/30" 
                      : "bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/30 hover:bg-emerald-500"
                  )}
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Znam! / Savladano ✨</span>
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
                <button
                  onClick={handlePrevCard}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-zinc-800/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prethodna
                </button>

                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span>[Razmak]: Okreni</span>
                  <span>[1]: Ponavljaj</span>
                  <span>[2]: Savladano</span>
                </div>

                <button
                  onClick={advanceToNextCard}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-zinc-800/50 transition-all text-emerald-400 font-bold"
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
                isDarkMode ? "bg-zinc-950 border-emerald-500/30" : "bg-white border-emerald-200"
              )}
            >
              <div className="text-6xl animate-bounce">🏆</div>
              <h3 className="text-3xl font-black text-white">Špil je uspešno završen!</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Sve kartice u ovoj sesiji su pregledane. Vaše znanje hebrejskog vokabulara je podignuto na novi nivo!
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto font-mono text-center">
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs text-zinc-500 block">Pregledano</span>
                  <span className="text-lg font-black text-white">{sessionReviewed}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs text-zinc-500 block">Najveći Niz</span>
                  <span className="text-lg font-black text-amber-400">🔥 {highestStreak}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs text-zinc-500 block">Savladano</span>
                  <span className="text-lg font-black text-emerald-400">⭐ {masteredIds.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={initDeck}
                  className={cn(
                    "px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 text-white shadow-xl transition-all active:scale-95",
                    isGirlyMode ? "bg-pink-600 hover:bg-pink-500" : "bg-emerald-600 hover:bg-emerald-500"
                  )}
                >
                  <RotateCw className="w-4 h-4" /> Igraj Ponovo (Promešaj Špil)
                </button>

                {onSwitchToQuiz && (
                  <button
                    onClick={onSwitchToQuiz}
                    className="px-6 py-3 rounded-2xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" /> Pokreni Duo Kviz
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
                        ? isDarkMode ? "bg-zinc-800 border-blue-500 text-white shadow-blue-500/10" : "bg-blue-50 border-blue-400 text-blue-950"
                        : isDarkMode ? "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 text-zinc-500" : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-400"
                  )}
                >
                  {card.isFlipped || card.isMatched ? (
                    <>
                      <span className="text-2xl">{card.emoji}</span>
                      
                      {card.type === 'hebrew' ? (
                        <div className="space-y-1">
                          <p dir="rtl" className="text-2xl sm:text-3xl font-black text-white font-sans">
                            {card.content}
                          </p>
                          <p className="text-[10px] font-mono text-emerald-400">/{card.subContent}/</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-base sm:text-lg font-black text-white leading-tight">
                            {card.content}
                          </p>
                          <p className="text-[10px] font-mono text-blue-400">({card.subContent})</p>
                        </div>
                      )}

                      <span className="text-[10px] uppercase font-mono font-bold text-zinc-400">
                        {card.type === 'hebrew' ? 'Hebrejski' : 'Prevod'}
                      </span>
                    </>
                  ) : (
                    <div className="m-auto flex flex-col items-center gap-2">
                      <HelpCircle className="w-8 h-8 text-zinc-600 animate-pulse" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                        Klikni Karticu
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
                "p-8 rounded-3xl border text-center space-y-5 shadow-2xl",
                isDarkMode ? "bg-zinc-950 border-blue-500/40" : "bg-white border-blue-200"
              )}
            >
              <div className="text-6xl animate-bounce">🎉</div>
              <h3 className="text-3xl font-black text-white">Sjajno vizuelno pamćenje!</h3>
              <p className="text-sm text-zinc-400">
                Pronašli ste svih {matchGridSize} parova za samo {matchMoves} poteza u {matchTimer} sekundi.
              </p>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={initMatchGame}
                  className="px-6 py-3 rounded-2xl font-black text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" /> Igraj Novo Kolo
                </button>
              </div>
            </motion.div>
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
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Pitanje {speedQuestionIdx + 1} / {speedQuestions.length}</span>
                <span className="font-bold text-amber-400">Bodovi: {speedScore}</span>
              </div>

              {/* Word Presentation */}
              <div className="space-y-3 py-4">
                <div className="text-5xl">{speedQuestions[speedQuestionIdx].vocab.emoji}</div>
                <h2 dir="rtl" className="text-5xl sm:text-6xl font-black text-white tracking-wide">
                  {speedQuestions[speedQuestionIdx].vocab.char}
                </h2>
                <p className="text-xs font-mono text-zinc-400">
                  /{speedQuestions[speedQuestionIdx].vocab.vuk}/ ({speedQuestions[speedQuestionIdx].vocab.transliteration})
                </p>

                <button
                  type="button"
                  onClick={() => speakHebrew(speedQuestions[speedQuestionIdx].vocab.char, `speed-prompt-${speedQuestionIdx}`)}
                  className="mx-auto text-xs text-amber-400 font-bold flex items-center gap-1 hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Poslušaj Zvuk
                </button>
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
            </div>
          )}

          {/* Speed Complete Banner */}
          {speedComplete && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "p-8 rounded-3xl border text-center space-y-5 shadow-2xl",
                isDarkMode ? "bg-zinc-950 border-amber-500/40" : "bg-white border-amber-200"
              )}
            >
              <div className="text-6xl animate-bounce">⚡</div>
              <h3 className="text-3xl font-black text-white">Izazov završen!</h3>
              <p className="text-sm text-zinc-400">
                Osvojili ste <strong className="text-amber-400">{speedScore}</strong> bodova od maksimalnih {speedQuestions.length * 10}!
              </p>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={initSpeedChallenge}
                  className="px-6 py-3 rounded-2xl font-black text-sm bg-amber-600 hover:bg-amber-500 text-white shadow-xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" /> Igraj Ponovo
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
