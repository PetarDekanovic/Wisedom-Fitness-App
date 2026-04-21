import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Pause, 
  Play, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Wind,
  Quote as QuoteIcon,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { YogaFlow, YogaPose, Quote } from '../types';
import { INITIAL_QUOTES } from '../data/initialQuotes';

interface YogaSessionProps {
  flow: YogaFlow;
  isDarkMode: boolean;
  onClose: () => void;
  onMarkAsWise: (quote: any) => void;
}

export default function YogaSession({ flow, isDarkMode, onClose, onMarkAsWise }: YogaSessionProps) {
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(flow.poses[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentPose = flow.poses[currentPoseIndex];

  // Initialize AudioContext on first interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Warm up TTS for mobile devices
    if ('speechSynthesis' in window) {
      const silent = new SpeechSynthesisUtterance("");
      silent.volume = 0;
      window.speechSynthesis.speak(silent);
    }
  };

  const playBeep = useCallback((frequency = 440, duration = 0.5) => {
    if (isMuted || !audioContextRef.current) return;
    
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    
    gain.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);
    
    osc.start();
    osc.stop(audioContextRef.current.currentTime + duration);
  }, [isMuted]);

  const speak = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };
    
    speechRef.current = utterance;
    
    // Some mobile browsers require a short delay or specific context
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  }, [isMuted]);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * INITIAL_QUOTES.length);
    return INITIAL_QUOTES[randomIndex] as Quote;
  };

  const startPose = useCallback((index: number) => {
    const pose = flow.poses[index];
    const quote = getRandomQuote();
    setCurrentQuote(quote);
    setTimeLeft(pose.duration);
    
    // TTS Sequence
    speak(`Starting ${pose.name}. ${quote.text} by ${quote.author}.`);
  }, [flow.poses, speak]);

  const nextPose = useCallback(() => {
    if (currentPoseIndex < flow.poses.length - 1) {
      const nextIdx = currentPoseIndex + 1;
      setCurrentPoseIndex(nextIdx);
      startPose(nextIdx);
    } else {
      setIsFinished(true);
      setIsActive(false);
      speak("Ritual complete. Well done.");
    }
  }, [currentPoseIndex, flow.poses.length, startPose, speak]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      playBeep(880, 0.8);
      const quote = getRandomQuote();
      speak(`${currentPose.name} finished. ${quote.text} by ${quote.author}.`);
      
      // Auto-advance after a short delay to allow TTS to start
      setTimeout(() => {
        nextPose();
      }, 2000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, nextPose, playBeep, currentPose.name, speak]);

  const toggleActive = () => {
    initAudio();
    if (!isActive && timeLeft === currentPose.duration) {
      startPose(currentPoseIndex);
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 z-[70] bg-zinc-950 flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md space-y-8"
        >
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Ritual Complete</h1>
            <p className="text-zinc-400">You have successfully integrated strength and stillness.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-emerald-500 text-zinc-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Return to Sanctuary
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col transition-colors duration-700 overflow-hidden",
      isDarkMode ? "bg-zinc-950 text-white" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Immersive Nature Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://picsum.photos/seed/sacred_forest/1920/1080?blur=2" 
          alt="Yoga Background" 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isDarkMode ? "opacity-30" : "opacity-25"
          )}
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute inset-0",
          isDarkMode ? "bg-zinc-950/40" : "bg-white/40"
        )} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="p-3 rounded-xl hover:bg-zinc-800/20 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">Yoga Ritual</p>
          <h2 className="text-sm font-bold truncate max-w-[150px] md:max-w-[200px]">{flow.name}</h2>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-xl hover:bg-zinc-800/20 transition-colors"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8 space-y-6 md:space-y-12 overflow-y-auto">
        {/* Progress Ring */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-10"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="283%"
              animate={{ strokeDashoffset: `${283 * (1 - timeLeft / currentPose.duration)}%` }}
              transition={{ duration: 1, ease: "linear" }}
              className="text-emerald-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1 md:mt-2">
              Time Remaining
            </span>
          </div>
        </div>

        {/* Current Pose Info */}
        <div className="text-center space-y-4 max-w-sm w-full">
          <motion.div
            key={currentPose.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1 md:space-y-2"
          >
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{currentPose.name}</h3>
            {currentPose.counterPose && (
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-500/70">
                Counter: {currentPose.counterPose}
              </p>
            )}
          </motion.div>

          {/* Quote Display */}
          <AnimatePresence mode="wait">
            {currentQuote && (
              <motion.div
                key={currentQuote.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "p-4 md:p-6 rounded-3xl border relative overflow-hidden",
                  isDarkMode ? "bg-zinc-900/40 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm"
                )}
              >
                <QuoteIcon className="absolute top-2 left-2 w-6 h-6 md:w-8 md:h-8 text-emerald-500/10" />
                <p className="text-xs md:text-sm font-serif italic leading-relaxed relative z-10">
                  "{currentQuote.text}"
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[9px] md:text-[10px] font-bold text-zinc-500">— {currentQuote.author}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => speak(`${currentQuote.text} by ${currentQuote.author}`)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        isSpeaking ? "bg-emerald-500 text-zinc-950 animate-pulse" : "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500 hover:text-white"
                      )}
                      title="Read Quote"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => onMarkAsWise(currentQuote)}
                      className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-zinc-950 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Controls */}
      <footer className="relative z-10 p-6 md:p-12 flex items-center justify-center gap-6 md:gap-8 pb-12 md:pb-12">
        <button 
          onClick={() => setTimeLeft(currentPose.duration)}
          className="p-4 rounded-2xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors"
        >
          <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        
        <button 
          onClick={toggleActive}
          className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500 text-zinc-950 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 active:scale-90 transition-all"
        >
          {isActive ? <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" /> : <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />}
        </button>

        <button 
          onClick={nextPose}
          className="p-4 rounded-2xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors"
        >
          <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </footer>

      {/* Next Pose Preview */}
      {currentPoseIndex < flow.poses.length - 1 && (
        <div className="px-8 pb-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Up Next</p>
          <p className="text-sm font-bold">{flow.poses[currentPoseIndex + 1].name}</p>
        </div>
      )}
    </div>
  );
}
