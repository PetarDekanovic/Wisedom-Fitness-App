import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Clock, 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  Flame,
  Ghost,
  Sparkles,
  RefreshCw,
  Database
} from 'lucide-react';
import { cn } from '../lib/utils';
import { QuizQuestion } from '../types';
import { INITIAL_QUESTIONS } from '../data/initialQuestions';
import { db } from '../firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

interface QuizViewProps {
  isDarkMode: boolean;
  onCorrectAnswer?: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ isDarkMode, onCorrectAnswer }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showWisdom, setShowWisdom] = useState(false);
  const [dataSource, setDataSource] = useState<'database' | 'local'>('local');

  // Load all questions (from DB or Local)
  const initializeQuestions = useCallback(async () => {
    setIsLoading(true);
    let loadedQuestions: QuizQuestion[] = [];
    
    try {
      // Try to fetch from Firestore
      const q = query(collection(db, 'questions'), limit(100));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        loadedQuestions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as QuizQuestion));
        setDataSource('database');
      }
    } catch (error) {
      console.error("Firestore quota or error, falling back to local wisdom:", error);
    }

    // Fallback or Merge
    if (loadedQuestions.length === 0) {
      loadedQuestions = [...INITIAL_QUESTIONS];
      setDataSource('local');
    }

    // Shuffle
    const shuffled = [...loadedQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeQuestions();
  }, [initializeQuestions]);

  const currentQuestion = useMemo(() => {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
      return questions[currentQuestionIndex];
    }
    return null;
  }, [questions, currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && currentQuestion) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered && currentQuestion) {
      handleAnswer(-1); // Timeout
    }
  }, [timeLeft, isAnswered, currentQuestion]);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(index);
    setIsAnswered(true);
    
    if (index === currentQuestion?.correctAnswer) {
      setStreak(prev => prev + 1);
      onCorrectAnswer?.();
    } else {
      setStreak(0);
    }
    
    setTimeout(() => setShowWisdom(true), 500);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowWisdom(false);
    } else {
      // Re-shuffle and start over if we hit the end
      const reshuffled = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(reshuffled);
      setCurrentQuestionIndex(0);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowWisdom(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Brain className="w-12 h-12 text-emerald-500 animate-pulse" />
        <p className={isDarkMode ? "text-zinc-400" : "text-zinc-500"}>Architecting your next trial...</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Ghost className="w-12 h-12 text-zinc-500" />
        <p className={isDarkMode ? "text-zinc-400" : "text-zinc-500"}>No wisdom found in the scrolls.</p>
        <button onClick={initializeQuestions} className="px-6 py-2 bg-emerald-500 text-white rounded-xl">Retry</button>
      </div>
    );
  }

  const categoryColors = {
    latin: 'text-amber-500 bg-amber-500/10',
    jewish: 'text-blue-500 bg-blue-500/10',
    history: 'text-rose-500 bg-rose-500/10',
    psychology: 'text-purple-500 bg-purple-500/10'
  } as const;

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-4 py-8">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <div className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
              categoryColors[currentQuestion.category as keyof typeof categoryColors] || 'text-zinc-500 bg-zinc-500/10'
            )}>
              {currentQuestion.category} Wisdom
            </div>
            <div className="flex items-center gap-2 text-orange-500">
              <Flame className="w-4 h-4 fill-current" />
              <span className="text-sm font-black italic">{streak}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-40">
            {dataSource === 'database' ? <Database className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
            <span className="text-[8px] font-bold uppercase tracking-tighter">
              {dataSource === 'database' ? 'Cloud Stream' : 'Archive Mode (Quota Fulfilled)'}
            </span>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 font-mono text-xl tabular-nums transition-colors",
          timeLeft < 10 ? "text-rose-500 animate-pulse" : isDarkMode ? "text-zinc-400" : "text-zinc-500"
        )}>
          <Clock className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "p-8 rounded-[40px] border relative overflow-hidden",
            isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"
          )}
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-20" />
          
          <h2 className={cn(
            "text-2xl font-bold leading-tight mb-8",
            isDarkMode ? "text-zinc-100" : "text-zinc-900"
          )}>
            {currentQuestion.question}
          </h2>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = idx === currentQuestion.correctAnswer;
              const isSelected = idx === selectedAnswer;
              
              let buttonStyle = isDarkMode 
                ? "bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800" 
                : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100";

              if (isAnswered) {
                if (isCorrect) buttonStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-500";
                else if (isSelected) buttonStyle = "bg-rose-500/20 border-rose-500 text-rose-500";
                else buttonStyle = "opacity-40 grayscale pointer-events-none";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full p-5 rounded-2xl border text-left font-medium transition-all duration-300 flex items-center justify-between group",
                    buttonStyle
                  )}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Wisdom Reveal */}
      <AnimatePresence>
        {showWisdom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={cn(
              "p-6 rounded-3xl border space-y-3",
              isDarkMode ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"
            )}
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">The Lesson</span>
            </div>
            <p className={cn(
              "text-sm leading-relaxed italic",
              isDarkMode ? "text-zinc-400" : "text-zinc-600"
            )}>
              "{currentQuestion.wisdom}"
            </p>
            
            <button
              onClick={nextQuestion}
              className="mt-4 w-full py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-tighter flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors"
            >
              Next Trial <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
