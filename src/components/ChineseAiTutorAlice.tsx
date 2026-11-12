import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, RotateCcw, Send, Sparkles, User, CheckCircle2,
  HelpCircle, MessageSquare, BookOpen, Globe2, Mic, ArrowRight,
  Info, ChevronDown, ChevronUp, RefreshCw, X, Play, Pause, Compass,
  Award, Shield, ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  ALICE_TUTOR_PROFILE,
  TUTOR_SCENARIOS,
  TutorScenario,
  TutorTurnMessage,
  TutorWordToken,
  PrebuiltReplyOption
} from '../data/chineseTutorAliceData';

interface ChineseAiTutorAliceProps {
  isDarkMode: boolean;
  isGirlyMode?: boolean;
  onOpenDictionary?: (term: string) => void;
}

export const ChineseAiTutorAlice: React.FC<ChineseAiTutorAliceProps> = ({
  isDarkMode,
  isGirlyMode = false,
  onOpenDictionary
}) => {
  // Scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('greeting-1');
  const currentScenario = TUTOR_SCENARIOS.find(s => s.id === selectedScenarioId) || TUTOR_SCENARIOS[0];

  // Conversation turns
  const [messages, setMessages] = useState<TutorTurnMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);

  // Inspector and selection state
  const [activeToken, setActiveToken] = useState<TutorWordToken | null>(null);
  const [inspectorPosition, setInspectorPosition] = useState<{ x: number; y: number } | null>(null);

  // Audio settings
  const [audioSpeed, setAudioSpeed] = useState<number>(0.85);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [autoPlayAlice, setAutoPlayAlice] = useState(false);

  // Display toggles
  const [showPinyinGlobal, setShowPinyinGlobal] = useState(true);
  const [showTranslationsGlobal, setShowTranslationsGlobal] = useState(true);
  const [showVukGlobal, setShowVukGlobal] = useState(true);
  const [showPrebuiltTray, setShowPrebuiltTray] = useState(true);
  const [showTutorProfileModal, setShowTutorProfileModal] = useState(false);
  const [showFeedbackDrawer, setShowFeedbackDrawer] = useState(true);

  // Selected feedback to inspect
  const [activeFeedback, setActiveFeedback] = useState<TutorTurnMessage['feedback'] | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize scenario turns
  useEffect(() => {
    if (currentScenario && currentScenario.turns.length > 0) {
      setMessages([currentScenario.turns[0]]);
      setActiveFeedback(currentScenario.turns[0].feedback || null);
    }
  }, [selectedScenarioId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiResponding]);

  // Audio speech playback helper
  const playSpeech = (text: string, rate: number = audioSpeed, id: string = text) => {
    if (!text) return;
    setIsPlayingAudio(id);

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Try web speech synthesis first (very fast & offline responsive)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = rate;
      utterance.pitch = 1.05; // Slightly pleasant female pitch

      // Try selecting a Chinese female voice if available
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      utterance.onend = () => {
        setIsPlayingAudio(null);
      };
      utterance.onerror = () => {
        // Fallback to proxy
        fallbackProxyAudio(text, rate, id);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      fallbackProxyAudio(text, rate, id);
    }
  };

  const fallbackProxyAudio = (text: string, rate: number, id: string) => {
    try {
      const audioUrl = `/api/tts-proxy?text=${encodeURIComponent(text)}&lang=zh-CN&speed=${rate}`;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingAudio(null);
      audio.onerror = () => setIsPlayingAudio(null);
      audio.play().catch(() => setIsPlayingAudio(null));
    } catch {
      setIsPlayingAudio(null);
    }
  };

  // Handle clicking on an individual word token
  const handleTokenClick = (e: React.MouseEvent, token: TutorWordToken) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setInspectorPosition({
      x: Math.min(window.innerWidth - 300, Math.max(16, rect.left)),
      y: rect.bottom + 8
    });
    setActiveToken(token);
    playSpeech(token.chinese, 0.8, `word-${token.chinese}`);
  };

  // Handle choosing a prebuilt reply option
  const handleSelectPrebuiltReply = (reply: PrebuiltReplyOption) => {
    const userMessage: TutorTurnMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      chinese: reply.chinese,
      pinyin: reply.pinyin,
      vuk: reply.vuk,
      english: reply.english,
      serbian: reply.serbian,
      words: reply.words
    };

    setMessages(prev => [...prev, userMessage]);
    proceedNextTutorTurn(userMessage.chinese);
  };

  // Send custom typed message
  const handleSendMessage = () => {
    if (!inputText.trim() || isAiResponding) return;

    const trimmed = inputText.trim();
    // Rough breakdown into token or single block
    const userMessage: TutorTurnMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      chinese: trimmed,
      pinyin: '...',
      vuk: '...',
      english: trimmed,
      serbian: trimmed,
      words: [
        {
          chinese: trimmed,
          pinyin: '',
          vuk: '',
          english: trimmed,
          serbian: trimmed,
          category: 'phrase'
        }
      ]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    proceedNextTutorTurn(trimmed);
  };

  // Progress conversational turn with Alice
  const proceedNextTutorTurn = async (userAnswer: string) => {
    setIsAiResponding(true);

    try {
      // 1. Check if scenario has a scripted next turn
      const currentAliceTurns = currentScenario.turns;
      const currentTurnIndex = messages.filter(m => m.sender === 'alice').length;

      if (currentTurnIndex < currentAliceTurns.length) {
        // Natural slight delay to simulate conversational pacing
        setTimeout(() => {
          const nextTurn = currentAliceTurns[currentTurnIndex];
          setMessages(prev => [...prev, nextTurn]);
          setActiveFeedback(nextTurn.feedback || null);
          setIsAiResponding(false);
          if (autoPlayAlice) {
            playSpeech(nextTurn.chinese, audioSpeed, nextTurn.id);
          }
        }, 800);
        return;
      }

      // 2. Otherwise invoke AI endpoint
      const response = await fetch('/api/ai/chinese-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userAnswer,
          scenarioId: selectedScenarioId,
          history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.chinese }))
        })
      });

      if (!response.ok) {
        throw new Error('AI tutor service unavailable');
      }

      const data = await response.json();
      if (data && data.reply) {
        const aliceTurn: TutorTurnMessage = data.reply;
        setMessages(prev => [...prev, aliceTurn]);
        setActiveFeedback(aliceTurn.feedback || null);
        if (autoPlayAlice) {
          playSpeech(aliceTurn.chinese, audioSpeed, aliceTurn.id);
        }
      }
    } catch (err) {
      console.warn('AI endpoint error, using contextual fallback turn', err);
      // Fallback encouraging turn
      const fallbackTurn: TutorTurnMessage = {
        id: `alice-${Date.now()}`,
        sender: 'alice',
        chinese: '你说得非常好！发音清晰，继续练习。',
        pinyin: 'Nǐ shuō de fēicháng hǎo! Fāyīn qīngxī, jìxù liànxí.',
        vuk: 'Ni šuo de fej-čhang hao! Fa-jin ćhing-sji, đi-sju lien-sji.',
        english: 'You said it very well! Clear pronunciation, keep practicing.',
        serbian: 'Rekao si to izuzetno dobro! Izgovor je jasan, samo nastavi da vežbaš.',
        words: [
          { chinese: '你', pinyin: 'nǐ', vuk: 'ni', english: 'you', serbian: 'ti', category: 'pronoun' },
          { chinese: '说', pinyin: 'shuō', vuk: 'šuo', english: 'speak', serbian: 'govoriti', category: 'verb' },
          { chinese: '得', pinyin: 'de', vuk: 'de', english: 'manner particle', serbian: 'partikula načina', category: 'particle' },
          { chinese: '非常', pinyin: 'fēicháng', vuk: 'fej-čhang', english: 'very', serbian: 'veoma', category: 'adjective' },
          { chinese: '好', pinyin: 'hǎo', vuk: 'hao', english: 'good', serbian: 'dobro', category: 'adjective' },
          { chinese: '发音', pinyin: 'fāyīn', vuk: 'fa-jin', english: 'pronunciation', serbian: 'izgovor', category: 'noun' },
          { chinese: '清晰', pinyin: 'qīngxī', vuk: 'ćhing-sji', english: 'clear', serbian: 'jasan', category: 'adjective' },
          { chinese: '继续', pinyin: 'jìxù', vuk: 'đi-sju', english: 'continue', serbian: 'nastavi', category: 'verb' },
          { chinese: '练习', pinyin: 'liànxí', vuk: 'lien-sji', english: 'practice', serbian: 'vežbanje', category: 'verb' }
        ],
        suggestedReplies: [
          {
            id: 'rep-fb-1',
            chinese: '谢谢老师，我会继续努力！',
            pinyin: 'Xièxiè lǎoshī, wǒ huì jìxù nǔlì!',
            vuk: 'Sje-sje lao-ši, vo huej đi-sju nu-li!',
            english: 'Thank you teacher, I will keep working hard!',
            serbian: 'Hvala profesorko, nastaviću vredno!',
            tag: 'polite',
            tagLabel: 'Učtivo',
            words: [
              { chinese: '谢谢', pinyin: 'xièxiè', vuk: 'sje-sje', english: 'thank you', serbian: 'hvala', category: 'phrase' },
              { chinese: '老师', pinyin: 'lǎoshī', vuk: 'lao-ši', english: 'teacher', serbian: 'profesorka', category: 'noun' },
              { chinese: '努力', pinyin: 'nǔlì', vuk: 'nu-li', english: 'work hard', serbian: 'vredno raditi', category: 'verb' }
            ]
          }
        ],
        feedback: {
          pronunciationTip: 'Pazi na četvrti ton (padajući) kod reči "Xièxie" i "Liànxí".',
          grammarAdvice: 'Struktura "Glagol + 得 + Pridev" (说得好) je standardan način za opisivanje kako se radnja obavlja.',
          culturalNote: 'Učtivost i poštovanje mentora (尊师重道) je temeljna vrlina u kineskoj kulturi.'
        }
      };
      setMessages(prev => [...prev, fallbackTurn]);
      setActiveFeedback(fallbackTurn.feedback || null);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Reset current scenario conversation
  const handleResetScenario = () => {
    if (currentScenario && currentScenario.turns.length > 0) {
      setMessages([currentScenario.turns[0]]);
      setActiveFeedback(currentScenario.turns[0].feedback || null);
    }
  };

  // Latest Alice turn that has prebuilt suggested replies
  const latestAliceMessage = [...messages].reverse().find(m => m.sender === 'alice');
  const availableSuggestions = latestAliceMessage?.suggestedReplies || [];

  return (
    <div className={cn(
      "w-full rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 flex flex-col min-h-[780px] max-w-6xl mx-auto my-4",
      isDarkMode ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
    )}>

      {/* TOP HEADER: TALKPAL STYLE WITH ALICE AVATAR & CONTROLS */}
      <div className={cn(
        "px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 backdrop-blur-md",
        isDarkMode ? "bg-zinc-900/90 border-zinc-800" : "bg-white/95 border-zinc-200"
      )}>
        {/* Tutor Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer" onClick={() => setShowTutorProfileModal(true)}>
            <div className={cn(
              "w-12 h-12 rounded-full p-0.5 border-2 overflow-hidden shadow-md transition-transform group-hover:scale-105",
              isGirlyMode ? "border-pink-500 shadow-pink-500/20" : "border-amber-500 shadow-amber-500/20"
            )}>
              <img
                src={ALICE_TUTOR_PROFILE.avatar}
                alt={ALICE_TUTOR_PROFILE.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {/* Green Online Status Dot */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-serif flex items-center gap-1.5">
                <span>{ALICE_TUTOR_PROFILE.name}</span>
                <span className="text-xs font-mono font-normal opacity-70">({ALICE_TUTOR_PROFILE.chineseName})</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Online • AI Mentor
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              {ALICE_TUTOR_PROFILE.subtitle} • Klikni reč za izgovor i prevod
            </p>
          </div>
        </div>

        {/* Global Controls & Preferences */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Audio Speed Toggle (0.75x vs 1.0x) */}
          <button
            type="button"
            onClick={() => setAudioSpeed(prev => (prev < 0.9 ? 1.0 : 0.75))}
            className={cn(
              "px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border flex items-center gap-1.5 transition-all",
              isDarkMode
                ? "bg-zinc-800 border-zinc-700 hover:border-zinc-600 text-zinc-300"
                : "bg-zinc-100 border-zinc-300 hover:border-zinc-400 text-zinc-700"
            )}
            title="Brzina čitanja (Slow / Normal)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{audioSpeed < 0.9 ? '0.75x Sporije' : '1.0x Normal'}</span>
          </button>

          {/* Pinyin Toggle */}
          <button
            type="button"
            onClick={() => setShowPinyinGlobal(prev => !prev)}
            className={cn(
              "px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all",
              showPinyinGlobal
                ? isGirlyMode ? "bg-pink-500 text-white border-pink-500" : "bg-amber-600 text-white border-amber-600"
                : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-400" : "bg-zinc-100 border-zinc-300 text-zinc-600"
            )}
            title="Uključi / Isključi Pinyin"
          >
            <span>Pīnyīn</span>
          </button>

          {/* Serbian/English Translation Toggle */}
          <button
            type="button"
            onClick={() => setShowTranslationsGlobal(prev => !prev)}
            className={cn(
              "px-2.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition-all",
              showTranslationsGlobal
                ? isGirlyMode ? "bg-pink-500 text-white border-pink-500" : "bg-red-700 text-white border-red-700"
                : isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-400" : "bg-zinc-100 border-zinc-300 text-zinc-600"
            )}
            title="Prikaži / Sakrij Prevod"
          >
            <Globe2 className="w-3 h-3" />
            <span className="hidden sm:inline">Prevod</span>
          </button>

          {/* Tutor Profile Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowTutorProfileModal(true)}
            className={cn(
              "p-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-1",
              isDarkMode ? "bg-zinc-800 border-zinc-700 hover:border-amber-500 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
            )}
            title="Pogledaj profil mentorke Alice"
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Profil mentorke</span>
          </button>

          {/* Restart Turn */}
          <button
            type="button"
            onClick={handleResetScenario}
            className={cn(
              "p-2 rounded-xl border transition-all text-zinc-400 hover:text-zinc-100",
              isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300"
            )}
            title="Resetuj dijalog"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SCENARIO SELECTION PILLS */}
      <div className={cn(
        "px-4 sm:px-6 py-2.5 border-b flex items-center gap-2 overflow-x-auto no-scrollbar text-xs",
        isDarkMode ? "bg-zinc-900/50 border-zinc-800/80" : "bg-zinc-50 border-zinc-200/80"
      )}>
        <span className="font-mono uppercase text-[10px] tracking-wider text-zinc-400 shrink-0 font-bold">
          Lekcije:
        </span>
        {TUTOR_SCENARIOS.map(scenario => {
          const isSelected = scenario.id === selectedScenarioId;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => setSelectedScenarioId(scenario.id)}
              className={cn(
                "px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border",
                isSelected
                  ? isGirlyMode
                    ? "bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                  : isDarkMode
                    ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              )}
            >
              <span>{scenario.emoji}</span>
              <span className="font-semibold">{scenario.title}</span>
              <span className="text-[10px] opacity-75 font-mono">({scenario.difficulty})</span>
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: CHAT STREAM + AI FEEDBACK SIDEBAR */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">

        {/* LEFT / CENTER: CHAT CONVERSATION */}
        <div className={cn(
          "flex flex-col justify-between overflow-y-auto p-4 sm:p-6 space-y-6 transition-all",
          showFeedbackDrawer ? "lg:col-span-8 xl:col-span-9" : "lg:col-span-12"
        )}>
          {/* Messages list */}
          <div className="space-y-6 flex-1">
            {messages.map((message) => {
              const isAlice = message.sender === 'alice';

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 max-w-3xl",
                    isAlice ? "mr-auto" : "ml-auto flex-row-reverse"
                  )}
                >
                  {/* Avatar */}
                  <div className="shrink-0 pt-1">
                    {isAlice ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 shadow">
                        <img
                          src={ALICE_TUTOR_PROFILE.avatar}
                          alt="Alice"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow",
                        isGirlyMode ? "bg-pink-600 text-white" : "bg-zinc-700 text-white"
                      )}>
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-2 max-w-2xl">
                    <div className={cn(
                      "p-4 rounded-3xl border shadow-sm transition-all",
                      isAlice
                        ? isDarkMode
                          ? "bg-zinc-900/90 border-zinc-800 text-zinc-100"
                          : "bg-white border-zinc-200 text-zinc-900 shadow-sm"
                        : isGirlyMode
                          ? "bg-pink-600 text-white border-pink-700 rounded-tr-sm"
                          : "bg-red-700 text-white border-red-800 rounded-tr-sm"
                    )}>

                      {/* Top Bar inside Alice's bubble: Listen full + Pinyin toggle */}
                      {isAlice && (
                        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-800/50 text-xs">
                          <span className="font-serif font-bold text-amber-500 text-[11px] flex items-center gap-1">
                            <span>爱丽丝老师</span>
                            <span className="font-mono opacity-60">• Alice</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Full sentence audio playback */}
                            <button
                              type="button"
                              onClick={() => playSpeech(message.chinese, audioSpeed, message.id)}
                              className={cn(
                                "p-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-mono px-2",
                                isPlayingAudio === message.id
                                  ? "bg-amber-500 text-zinc-950 font-bold"
                                  : isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-600"
                              )}
                              title="Poslušaj celu rečenicu"
                            >
                              <Volume2 className={cn("w-3.5 h-3.5", isPlayingAudio === message.id && "animate-pulse")} />
                              <span>{isPlayingAudio === message.id ? 'Čita...' : 'Slušaj'}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CHINESE TEXT WITH INTERACTIVE WORD CHIPS */}
                      <div className="flex flex-wrap items-center gap-1.5 py-1">
                        {message.words && message.words.length > 0 ? (
                          message.words.map((token, idx) => (
                            <button
                              key={`${message.id}-word-${idx}`}
                              type="button"
                              onClick={(e) => handleTokenClick(e, token)}
                              className={cn(
                                "group relative inline-flex flex-col items-center px-2 py-1 rounded-xl transition-all border text-left",
                                isAlice
                                  ? isDarkMode
                                    ? "bg-zinc-800/80 hover:bg-amber-950/40 border-zinc-700/60 hover:border-amber-500/70 text-zinc-100"
                                    : "bg-zinc-50 hover:bg-amber-50 border-zinc-200 hover:border-amber-400 text-zinc-900"
                                  : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                              )}
                            >
                              {/* Pinyin hint above */}
                              {showPinyinGlobal && (
                                <span className={cn(
                                  "text-[10px] font-mono tracking-tight transition-opacity",
                                  isAlice
                                    ? "text-amber-500 dark:text-amber-400 font-medium"
                                    : "text-white/80"
                                )}>
                                  {token.pinyin}
                                </span>
                              )}

                              {/* Hanzi Character */}
                              <span className="text-xl sm:text-2xl font-serif font-black tracking-wide">
                                {token.chinese}
                              </span>

                              {/* Tiny hover indicator */}
                              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))
                        ) : (
                          // Fallback if no words array
                          <p className="text-xl sm:text-2xl font-serif font-bold">
                            {message.chinese}
                          </p>
                        )}
                      </div>

                      {/* PINYIN ROW (If global token view is disabled or for full fluency reading) */}
                      {showPinyinGlobal && (
                        <div className={cn(
                          "mt-2 text-xs font-mono font-medium tracking-wide border-t pt-1.5",
                          isAlice
                            ? isDarkMode ? "text-amber-300/90 border-zinc-800" : "text-amber-800 border-zinc-100"
                            : "text-white/90 border-white/20"
                        )}>
                          <span className="opacity-60 text-[10px] mr-1.5 uppercase">Pinyin:</span>
                          {message.pinyin}
                        </div>
                      )}

                      {/* VUK PHONETIC TRANSLITERATION (Serbian Phonetics) */}
                      {showVukGlobal && message.vuk && (
                        <div className={cn(
                          "mt-1 text-xs font-serif italic tracking-wide",
                          isAlice
                            ? isDarkMode ? "text-zinc-400" : "text-zinc-600"
                            : "text-white/80"
                        )}>
                          <span className="opacity-60 text-[10px] font-mono not-italic mr-1.5 uppercase">Vuk:</span>
                          „{message.vuk}“
                        </div>
                      )}

                      {/* TRANSLATION (Serbian & English) */}
                      {showTranslationsGlobal && (
                        <div className={cn(
                          "mt-2 text-xs border-t pt-1.5 space-y-0.5",
                          isAlice
                            ? isDarkMode ? "text-zinc-300 border-zinc-800" : "text-zinc-700 border-zinc-100"
                            : "text-white/90 border-white/20"
                        )}>
                          <p className="font-medium">
                            <span className="opacity-60 text-[10px] font-mono mr-1.5">SR:</span>
                            {message.serbian}
                          </p>
                          <p className="text-[11px] opacity-75">
                            <span className="opacity-50 text-[10px] font-mono mr-1.5">EN:</span>
                            {message.english}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Pre-built suggested reply pills directly below the latest Alice question (Talkpal style) */}
                    {isAlice && message.id === latestAliceMessage?.id && message.suggestedReplies && message.suggestedReplies.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                          <span className="font-mono text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 text-amber-500">
                            <Sparkles className="w-3 h-3" /> Predloženi Odgovori (Klikni da izgovoriš):
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPrebuiltTray(prev => !prev)}
                            className="text-[11px] hover:text-zinc-200 flex items-center gap-1 font-mono"
                          >
                            <span>{showPrebuiltTray ? 'Sakrij detalje' : 'Prikaži detalje'}</span>
                            {showPrebuiltTray ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Quick Pills (Talkpal style) */}
                        <div className="flex flex-wrap items-center gap-2">
                          {message.suggestedReplies.map((reply) => (
                            <button
                              key={`pill-${reply.id}`}
                              type="button"
                              onClick={() => handleSelectPrebuiltReply(reply)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-serif font-bold transition-all border flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95",
                                isDarkMode
                                  ? "bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-100 hover:border-amber-500"
                                  : "bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800 hover:border-amber-500"
                              )}
                            >
                              <span className="text-sm">{reply.chinese}</span>
                              <span className="text-[10px] font-mono font-normal opacity-60">({reply.tagLabel})</span>
                            </button>
                          ))}
                        </div>

                        {/* Detailed Expandable Cards showing Word Tokens for each suggestion */}
                        {showPrebuiltTray && (
                          <div className="space-y-2 pt-2">
                            {message.suggestedReplies.map((reply) => (
                              <div
                                key={`card-${reply.id}`}
                                className={cn(
                                  "p-3 rounded-2xl border transition-all text-left space-y-2",
                                  isDarkMode
                                    ? "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700"
                                    : "bg-zinc-50/80 border-zinc-200 hover:border-zinc-300"
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                      {reply.tagLabel}
                                    </span>
                                    <span className="text-xs text-zinc-400 italic">
                                      „{reply.serbian}“
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {/* Audio listen for suggestion */}
                                    <button
                                      type="button"
                                      onClick={() => playSpeech(reply.chinese, audioSpeed, reply.id)}
                                      className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                                      title="Poslušaj ovaj odgovor"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Use this answer */}
                                    <button
                                      type="button"
                                      onClick={() => handleSelectPrebuiltReply(reply)}
                                      className={cn(
                                        "px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition-all",
                                        isGirlyMode ? "bg-pink-600 hover:bg-pink-500 text-white" : "bg-amber-600 hover:bg-amber-500 text-white"
                                      )}
                                    >
                                      <span>Pošalji</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Words inside this suggested sentence */}
                                <div className="flex flex-wrap items-center gap-1">
                                  {reply.words.map((w, wIdx) => (
                                    <button
                                      key={`${reply.id}-w-${wIdx}`}
                                      type="button"
                                      onClick={(e) => handleTokenClick(e, w)}
                                      className={cn(
                                        "px-1.5 py-0.5 rounded-lg border text-xs font-serif transition-colors flex items-center gap-1",
                                        isDarkMode ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-amber-400" : "bg-white border-zinc-300 text-zinc-800 hover:border-amber-500"
                                      )}
                                    >
                                      <span className="font-bold">{w.chinese}</span>
                                      <span className="text-[9px] font-mono text-amber-500">[{w.pinyin}]</span>
                                      <span className="text-[9px] text-zinc-400 opacity-80">({w.serbian})</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* AI Typing Indicator */}
            {isAiResponding && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 text-zinc-400"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/30">
                  <img src={ALICE_TUTOR_PROFILE.avatar} alt="Alice" className="w-full h-full object-cover" />
                </div>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl border text-xs font-serif flex items-center gap-2",
                  isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700"
                )}>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span>Alice razmišlja i priprema reči...</span>
                </div>
              </motion.div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* CHAT INPUT BAR AT BOTTOM */}
          <div className="pt-4 border-t border-zinc-800/40">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Odgovori Alice na kineskom ili srpskom, ili klikni predloženi odgovor gore..."
                className={cn(
                  "w-full px-4 py-3.5 pr-24 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2",
                  isDarkMode
                    ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:ring-amber-500/40 focus:border-amber-500"
                    : "bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:ring-amber-500/40 focus:border-amber-500"
                )}
              />

              <div className="absolute right-2 flex items-center gap-1">
                {/* Voice Input button */}
                <button
                  type="button"
                  onClick={() => {
                    if (latestAliceMessage?.chinese) {
                      playSpeech(latestAliceMessage.chinese, audioSpeed, 'latest-speech');
                    }
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                  title="Ponovo poslušaj Alice"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isAiResponding}
                  className={cn(
                    "p-2.5 rounded-xl font-bold transition-all shadow-md",
                    inputText.trim() && !isAiResponding
                      ? isGirlyMode
                        ? "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/20"
                        : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  )}
                  title="Pošalji poruku"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5 text-center font-mono">
              Savet: Kliknite na bilo koju reč u porukama mentorke da je čujete pojedinačno i istražite značenje.
            </p>
          </div>
        </div>

        {/* RIGHT: TALKPAL STYLE AI FEEDBACK & LEARNING PANEL */}
        <div className={cn(
          "border-t lg:border-t-0 lg:border-l p-4 sm:p-6 space-y-5 overflow-y-auto",
          isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50/60 border-zinc-200",
          showFeedbackDrawer ? "lg:col-span-4 xl:col-span-3 block" : "hidden"
        )}>
          {/* Panel Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
                  AI Feedback & Analiza
                </h3>
                <p className="text-[11px] text-zinc-500">Procena tvoje konverzacije</p>
              </div>
            </div>
          </div>

          {/* Assessment Badges (Talkpal Style) */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className={cn(
              "p-2.5 rounded-xl border",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            )}>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Gramatika</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Tačno SVO
              </span>
            </div>

            <div className={cn(
              "p-2.5 rounded-xl border",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            )}>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Tonovi</span>
              <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" /> 4 Tona Jasna
              </span>
            </div>

            <div className={cn(
              "p-2.5 rounded-xl border",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            )}>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Rečnik</span>
              <span className="text-xs font-bold text-sky-400 flex items-center justify-center gap-1 mt-0.5">
                <BookOpen className="w-3 h-3" /> HSK 1–3
              </span>
            </div>

            <div className={cn(
              "p-2.5 rounded-xl border",
              isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
            )}>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Prirodnost</span>
              <span className="text-xs font-bold text-purple-400 flex items-center justify-center gap-1 mt-0.5">
                <Award className="w-3 h-3" /> Odlično
              </span>
            </div>
          </div>

          {/* Active Turn Feedback */}
          {activeFeedback ? (
            <div className="space-y-3">
              {/* Pronunciation Tip */}
              <div className={cn(
                "p-3 rounded-2xl border text-xs space-y-1",
                isDarkMode ? "bg-zinc-900/90 border-amber-500/30" : "bg-amber-50/70 border-amber-200"
              )}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Savet za Izgovor (Pronunciation):
                </span>
                <p className="text-zinc-300 leading-relaxed font-serif">
                  {activeFeedback.pronunciationTip}
                </p>
              </div>

              {/* Grammar Advice */}
              <div className={cn(
                "p-3 rounded-2xl border text-xs space-y-1",
                isDarkMode ? "bg-zinc-900/90 border-sky-500/30" : "bg-sky-50/70 border-sky-200"
              )}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Gramatičko Pravilo:
                </span>
                <p className="text-zinc-300 leading-relaxed font-serif">
                  {activeFeedback.grammarAdvice}
                </p>
              </div>

              {/* Cultural Note */}
              <div className={cn(
                "p-3 rounded-2xl border text-xs space-y-1",
                isDarkMode ? "bg-zinc-900/90 border-purple-500/30" : "bg-purple-50/70 border-purple-200"
              )}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <Compass className="w-3 h-3" /> Kulturološki Kontekst:
                </span>
                <p className="text-zinc-300 leading-relaxed font-serif">
                  {activeFeedback.culturalNote}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
              Izaberi ili pošalji rečenicu kako bi Alice analizirala tvoju gramatiku i izgovor.
            </div>
          )}

          {/* Quick Word Inspector inside sidebar if selected */}
          {activeToken && (
            <div className={cn(
              "p-3.5 rounded-2xl border space-y-2",
              isDarkMode ? "bg-amber-950/20 border-amber-500/40" : "bg-amber-50 border-amber-300"
            )}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-500">
                  Inspekcija Reči
                </span>
                <button
                  type="button"
                  onClick={() => setActiveToken(null)}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-serif font-black text-amber-400">
                    {activeToken.chinese}
                  </span>
                  <div className="text-xs font-mono text-zinc-300">
                    {activeToken.pinyin} • <span className="italic">{activeToken.vuk}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playSpeech(activeToken.chinese, 0.8, `side-${activeToken.chinese}`)}
                  className="p-2 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-colors shadow"
                  title="Slušaj izgovor ove reči"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs border-t border-amber-500/20 pt-2 space-y-1">
                <div><span className="text-zinc-500">Srpski:</span> <strong className="text-zinc-200">{activeToken.serbian}</strong></div>
                <div><span className="text-zinc-500">English:</span> <span className="text-zinc-300">{activeToken.english}</span></div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {activeToken.category}
                  </span>
                  {activeToken.hskLevel && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      HSK {activeToken.hskLevel}
                    </span>
                  )}
                </div>
              </div>

              {onOpenDictionary && (
                <button
                  type="button"
                  onClick={() => onOpenDictionary(activeToken.chinese)}
                  className="w-full mt-2 py-1.5 rounded-xl border border-amber-500/40 text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Otvori u CC-CEDICT Rečniku</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* WORD INSPECTOR FLOATING POPOVER (Appears on click next to word token) */}
      <AnimatePresence>
        {activeToken && inspectorPosition && (
          <div
            className="fixed inset-0 z-50 pointer-events-none"
            onClick={() => setActiveToken(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                left: `${inspectorPosition.x}px`,
                top: `${inspectorPosition.y}px`
              }}
              className={cn(
                "pointer-events-auto w-72 rounded-2xl border shadow-2xl p-4 space-y-3 z-50 backdrop-blur-xl",
                isDarkMode ? "bg-zinc-900/95 border-amber-500/50 text-zinc-100" : "bg-white/95 border-amber-400 text-zinc-900"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-500">
                    Rečnik & Fonetika
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400">
                    {activeToken.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveToken(null)}
                  className="text-zinc-400 hover:text-zinc-100 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Character + Pinyin + Audio Play button */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-3xl font-serif font-black text-amber-400 tracking-wide">
                    {activeToken.chinese}
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-300">
                    {activeToken.pinyin}
                  </div>
                  <div className="text-[11px] font-serif italic text-zinc-400">
                    Vuk: „{activeToken.vuk}“
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playSpeech(activeToken.chinese, 0.75, `pop-${activeToken.chinese}`)}
                  className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
                  title="Preslušaj izgovor"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Translations */}
              <div className="text-xs space-y-1 bg-zinc-800/40 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Srpski:</span>
                  <strong className="text-zinc-100 font-serif">{activeToken.serbian}</strong>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">English:</span>
                  <span className="text-zinc-300">{activeToken.english}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                {onOpenDictionary && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDictionary(activeToken.chinese);
                      setActiveToken(null);
                    }}
                    className="flex-1 py-1.5 rounded-xl border border-amber-500/40 text-amber-400 text-[11px] font-mono font-bold hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Detaljna Analiza</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => playSpeech(activeToken.chinese, 0.65, `slow-${activeToken.chinese}`)}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-700 text-zinc-300 text-[11px] font-mono hover:bg-zinc-800 transition-colors"
                  title="Spori izgovor"
                >
                  0.65x
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TUTOR PROFILE MODAL (With full portrait image /assets/aistudio/image_804f49da.png) */}
      <AnimatePresence>
        {showTutorProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={cn(
                "w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden relative",
                isDarkMode ? "bg-zinc-900 border-amber-500/40 text-zinc-100" : "bg-white border-amber-200 text-zinc-900"
              )}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowTutorProfileModal(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left Portrait */}
                <div className="md:col-span-5 relative min-h-[300px] md:min-h-full bg-zinc-950">
                  <img
                    src={ALICE_TUTOR_PROFILE.portrait}
                    alt={ALICE_TUTOR_PROFILE.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
                  <div className="absolute bottom-3 left-3 right-3 md:hidden text-white">
                    <h3 className="text-xl font-bold font-serif">{ALICE_TUTOR_PROFILE.name}</h3>
                    <p className="text-xs text-amber-300">{ALICE_TUTOR_PROFILE.chineseName}</p>
                  </div>
                </div>

                {/* Right Details */}
                <div className="md:col-span-7 p-6 space-y-4">
                  <div className="hidden md:block">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Tvoj Glavni AI Mentor za Kineski
                    </span>
                    <h3 className="text-2xl font-bold font-serif text-amber-500 mt-1">
                      {ALICE_TUTOR_PROFILE.name} <span className="text-lg font-normal text-zinc-400 font-mono">({ALICE_TUTOR_PROFILE.chineseName})</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-serif">{ALICE_TUTOR_PROFILE.titleSerbian}</p>
                  </div>

                  <p className="text-xs leading-relaxed text-zinc-300 font-serif">
                    {ALICE_TUTOR_PROFILE.bio}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                      Metodologija Podučavanja:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 text-xs">
                      {ALICE_TUTOR_PROFILE.specialties.map((spec, i) => (
                        <div key={i} className="flex items-center gap-2 text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Voice Sample */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => playSpeech(ALICE_TUTOR_PROFILE.greetingChinese, audioSpeed, 'alice-intro')}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Čuj Uvodni Pozdrav Alice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowTutorProfileModal(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 text-xs font-bold transition-colors"
                    >
                      Zatvori
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ChineseAiTutorAlice;
