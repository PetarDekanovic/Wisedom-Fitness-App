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
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { VocabItem } from '../data/chineseVocabData';
import { getChineseQuoteForItem } from '../data/chineseVocabData';

export interface ChineseFlashcardsGameProps {
  vocabList: VocabItem[];
  masteredIds: string[];
  toggleMastered: (id: string, e?: React.MouseEvent) => void;
  speakChinese: (text: string, id?: string) => void;
  isPronouncing: string | null;
  isDarkMode: boolean;
  isGirlyMode: boolean;
  onSwitchToQuiz?: () => void;
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

export const ChineseFlashcardsGame: React.FC<ChineseFlashcardsGameProps> = ({
  vocabList,
  masteredIds,
  toggleMastered,
  speakChinese,
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
  const [flipDirection, setFlipDirection] = useState<'chinese-first' | 'meaning-first'>('chinese-first');

  // --- MODE 1: 3D FLASHCARDS DECK STATE ---
  const [deck, setDeck] = useState<VocabItem[]>([]);
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
    vocab: VocabItem;
    options: string[];
    correctAnswer: string;
  }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedComplete, setSpeedComplete] = useState(false);

  // --- GAME PACING CONTROLS (MAKE WORDS SERENE, SLOW & PLAYABLE) ---
  // 'manual': Never auto-advances, waits for player to click Next Word
  // 'relaxed': 8.0s countdown before advancing with Pause & Skip buttons
  // 'normal': 5.0s countdown before advancing
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
      { id: 'all', label: 'Svi Karakteri', count: vocabList.length },
      { id: 'svakodnevno', label: 'Svakodnevno & Pozdravi', count: counts['svakodnevno'] || 0 },
      { id: 'glagoli', label: 'Glagoli & Akcije', count: counts['glagoli'] || 0 },
      { id: 'filozofija', label: 'Tao & Mudrost', count: counts['filozofija'] || 0 },
      { id: 'strofa_1', label: 'Strofa 1 (Osnove)', count: counts['strofa_1'] || 0 },
      { id: 'refren', label: 'Refren & Poezija', count: counts['refren'] || 0 }
    ];
  }, [vocabList]);

  // Initialize or shuffle Deck (stable - only runs on category/filter change or explicit shuffle)
  const initDeck = useCallback(() => {
    let pool = [...vocabList];
    if (selectedCategory !== 'all') {
      pool = pool.filter(item => item.category === selectedCategory);
    }
    if (filterMode === 'unmastered') {
      pool = pool.filter(item => !masteredIds.includes(item.id));
    } else if (filterMode === 'mastered') {
      pool = pool.filter(item => masteredIds.includes(item.id));
    }
    const finalPool = pool.length > 0 ? pool : vocabList;
    const shuffled = [...finalPool].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsDeckFinished(false);
    setIsSlideshowActive(false);
  }, [vocabList, selectedCategory, filterMode, masteredIds]);

  useEffect(() => {
    initDeck();
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

  // Advance to next card
  const advanceToNextCard = useCallback(() => {
    setIsFlipped(false);
    
    // Reset loop countdown on manual or auto advance
    if (isSlideshowActive) {
      loopRemainingRef.current = loopDurationSecRef.current;
      setLoopSecondsLeft(loopDurationSecRef.current);
    }

    setDeck(prevDeck => {
      if (prevDeck.length === 0) return prevDeck;
      setCurrentIndex(prevIdx => {
        if (prevIdx + 1 < prevDeck.length) {
          const nextIdx = prevIdx + 1;
          if (autoSpeak && prevDeck[nextIdx]) {
            setTimeout(() => {
              speakChineseRef.current(prevDeck[nextIdx].char, `flash-${prevDeck[nextIdx].id}`);
            }, 400);
          }
          return nextIdx;
        } else {
          // If auto-loop is active, loop back to start seamlessly for continuous calm learning
          if (isSlideshowActive) {
            if (autoSpeak && prevDeck[0]) {
              setTimeout(() => {
                speakChineseRef.current(prevDeck[0].char, `flash-${prevDeck[0].id}`);
              }, 400);
            }
            return 0;
          } else {
            setIsDeckFinished(true);
            setIsSlideshowActive(false);
            return prevIdx;
          }
        }
      });
      return prevDeck;
    });
  }, [autoSpeak, isSlideshowActive]);

  // Previous card
  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);

    if (isSlideshowActive) {
      loopRemainingRef.current = loopDurationSecRef.current;
      setLoopSecondsLeft(loopDurationSecRef.current);
    }

    setDeck(prevDeck => {
      if (prevDeck.length === 0) return prevDeck;
      setCurrentIndex(prevIdx => {
        if (prevIdx > 0) {
          const nextIdx = prevIdx - 1;
          if (autoSpeak && prevDeck[nextIdx]) {
            setTimeout(() => {
              speakChineseRef.current(prevDeck[nextIdx].char, `flash-${prevDeck[nextIdx].id}`);
            }, 400);
          }
          return nextIdx;
        }
        return prevIdx;
      });
      return prevDeck;
    });
  }, [autoSpeak, isSlideshowActive]);

  // Mark as Mastered
  const handleMarkMastered = () => {
    if (!currentCard) return;

    if (!masteredIds.includes(currentCard.id)) {
      toggleMasteredRef.current(currentCard.id);
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
    const pool = [...filteredPool].sort(() => Math.random() - 0.5);
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
    setMatchCards(cards.sort(() => Math.random() - 0.5));
    setSelectedMatchIndices([]);
    setMatchedPairsCount(0);
    setMatchMoves(0);
    setMatchTimer(0);
    setIsMatchTimerRunning(true);
    setMatchGameFinished(false);
  }, [filteredPool, matchGridSize, clearAllTimers]);

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

  // --- MODE 3: SPEED CHALLENGE LOGIC ---
  const initSpeedChallenge = useCallback(() => {
    clearAllTimers();
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
        speakChinese(questionsList[0].vocab.char, `speed-${questionsList[0].vocab.id}`);
      }, 350);
    }
  }, [filteredPool, autoSpeak, speakChinese, clearAllTimers]);

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
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={() => handleModeChange('cards')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2",
              gameMode === 'cards'
                ? isGirlyMode ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" : "bg-red-600 text-white shadow-lg shadow-red-600/25"
                : isDarkMode ? "bg-zinc-900 text-zinc-400 hover:text-white" : "bg-zinc-100 text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Layers className="w-4 h-4" />
            <span>3D Vizuelne Kartice (Hanzi)</span>
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
            <span>Izazov Znanja (Kviz)</span>
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
                ? "bg-red-500/10 border-red-500/30 text-red-400" 
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

                    {/* Central Chinese Character with Emoji */}
                    <div className="my-auto space-y-4">
                      <div className="text-5xl animate-bounce mb-2">
                        {currentCard.emoji}
                      </div>

                      <h2 className="text-6xl sm:text-7xl font-black tracking-wide font-sans text-white drop-shadow-md select-text">
                        {currentCard.char}
                      </h2>

                      {/* Transliteration Hint */}
                      <p className="text-sm font-mono text-zinc-300">
                        Pinyin: <span className="text-red-400 font-bold">{currentCard.pinyin}</span> • Vuk: <span className="text-amber-300 font-bold">/{currentCard.vuk}/</span>
                      </p>

                      {/* TTS Play Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakChinese(currentCard.char, `flash-${currentCard.id}`);
                        }}
                        className={cn(
                          "mx-auto px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all border active:scale-95",
                          isPronouncing === `flash-${currentCard.id}`
                            ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30 scale-105"
                            : isDarkMode ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-red-500/50" : "bg-white border-zinc-200 text-zinc-700 hover:border-red-500"
                        )}
                      >
                        <Volume2 className={cn("w-4 h-4", isPronouncing === `flash-${currentCard.id}` && "animate-pulse")} />
                        <span>{isPronouncing === `flash-${currentCard.id}` ? "Pusta se izgovor..." : "Poslušaj Izgovor (Mandarin TTS)"}</span>
                      </button>
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
                    <div className="w-full flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-800/60">
                      <span>Karakter: <strong className="text-white text-base">{currentCard.char}</strong></span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakChinese(currentCard.char, `flash-${currentCard.id}`);
                        }}
                        className="text-red-400 font-bold flex items-center gap-1 hover:underline"
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
                      : "bg-red-600 border-red-400 text-white shadow-red-600/30 hover:bg-red-500"
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
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-zinc-800/50 transition-all text-red-400 font-bold"
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
              <div className="text-6xl animate-bounce">🏆</div>
              <h3 className="text-3xl font-black text-white">Špil je uspešno završen!</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Svi hanzi karakteri u ovoj sesiji su pregledani. Vaše znanje kineskog vokabulara je podignuto na novi nivo!
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
                    isGirlyMode ? "bg-pink-600 hover:bg-pink-500" : "bg-red-600 hover:bg-red-500"
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
                  className="px-6 py-3 rounded-2xl font-black text-sm bg-red-600 hover:bg-red-500 text-white shadow-xl transition-all active:scale-95 flex items-center gap-2"
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
                <h2 className="text-6xl sm:text-7xl font-black text-white tracking-wide">
                  {speedQuestions[speedQuestionIdx].vocab.char}
                </h2>
                <p className="text-xs font-mono text-zinc-300">
                  Pinyin: <span className="text-red-400 font-bold">{speedQuestions[speedQuestionIdx].vocab.pinyin}</span> • Vuk: <span className="text-amber-400 font-bold">/{speedQuestions[speedQuestionIdx].vocab.vuk}/</span>
                </p>

                <button
                  type="button"
                  onClick={() => speakChinese(speedQuestions[speedQuestionIdx].vocab.char, `speed-prompt-${speedQuestionIdx}`)}
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

                    <button
                      type="button"
                      onClick={() => speakChinese(speedQuestions[speedQuestionIdx].vocab.char, `speed-repeat-${speedQuestionIdx}`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Ponovi Zvuk</span>
                    </button>
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
