import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Volume1, 
  Play, 
  Square, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  Languages, 
  Share2, 
  BookOpen, 
  ChevronRight, 
  Maximize2, 
  X, 
  RotateCcw,
  Sliders,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  REAL_LIFE_CLUSTERS, 
  RealLifeCluster, 
  RealLifeWordItem, 
  RealLifeSentence,
  TOTAL_REAL_LIFE_WORDS
} from '../data/chineseRealLifeClustersData';

interface ChineseRealLifeExamplesProps {
  isDarkMode?: boolean;
}

export const ChineseRealLifeExamples: React.FC<ChineseRealLifeExamplesProps> = ({ isDarkMode = true }) => {
  // State
  const [selectedClusterId, setSelectedClusterId] = useState<string>('c1-r1');
  const [chartFilter, setChartFilter] = useState<'all' | 'chart1' | 'chart2'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPronouncingId, setIsPronouncingId] = useState<string | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showSerbian, setShowSerbian] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [isSlowAudio, setIsSlowAudio] = useState(false);
  const [testYourselfMode, setTestYourselfMode] = useState(false);
  const [revealedSentenceIds, setRevealedSentenceIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalChartImage, setModalChartImage] = useState<string | null>(null);
  const [activeWordFilter, setActiveWordFilter] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter clusters by chart filter
  const displayedClusters = useMemo(() => {
    if (chartFilter === 'chart1') return REAL_LIFE_CLUSTERS.filter(c => c.chartId === 1);
    if (chartFilter === 'chart2') return REAL_LIFE_CLUSTERS.filter(c => c.chartId === 2);
    return REAL_LIFE_CLUSTERS;
  }, [chartFilter]);

  // Current active cluster
  const activeCluster = useMemo(() => {
    return REAL_LIFE_CLUSTERS.find(c => c.id === selectedClusterId) || REAL_LIFE_CLUSTERS[0];
  }, [selectedClusterId]);

  // Global search filtering across characters and sentences
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();

    const matchedWords: { cluster: RealLifeCluster; word: RealLifeWordItem }[] = [];
    const matchedSentences: { cluster: RealLifeCluster; sentence: RealLifeSentence }[] = [];

    for (const cluster of REAL_LIFE_CLUSTERS) {
      for (const w of cluster.words) {
        if (
          w.char.includes(q) ||
          (w.charTraditional && w.charTraditional.includes(q)) ||
          w.pinyin.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q) ||
          w.serbian.toLowerCase().includes(q)
        ) {
          matchedWords.push({ cluster, word: w });
        }
      }

      for (const s of cluster.sentences) {
        if (
          s.chinese.includes(q) ||
          s.pinyin.toLowerCase().includes(q) ||
          s.english.toLowerCase().includes(q) ||
          s.serbian.toLowerCase().includes(q) ||
          s.targetWords.some(tw => tw.includes(q))
        ) {
          matchedSentences.push({ cluster, sentence: s });
        }
      }
    }

    return { matchedWords, matchedSentences };
  }, [searchQuery]);

  // TTS Execution with fallback and rate support
  const playAudio = (text: string, id: string, rate: number = isSlowAudio ? 0.75 : 1.0) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsPronouncingId(id);

    const cleanup = () => {
      setIsPronouncingId(null);
    };

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('zh') || 
          v.name.toLowerCase().includes('chinese') ||
          v.name.toLowerCase().includes('mandarin') ||
          v.name.toLowerCase().includes('huihui')
        );

        const utterance = new SpeechSynthesisUtterance(text);
        if (zhVoice) utterance.voice = zhVoice;
        utterance.lang = 'zh-CN';
        utterance.rate = rate;
        utterance.pitch = 1.0;

        utterance.onend = cleanup;
        utterance.onerror = () => {
          console.warn('[WebSpeech Error] Trying audio proxy stream...');
          playAudioProxy(text, id, cleanup);
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn('[WebSpeech Exception]', err);
      }
    }

    playAudioProxy(text, id, cleanup);
  };

  const playAudioProxy = (text: string, id: string, onEnd: () => void) => {
    const proxyUrl = `/api/tts-proxy?text=${encodeURIComponent(text)}&lang=zh-CN`;
    const fallbackDirectUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(text)}`;

    const audio = new Audio(proxyUrl);
    audioRef.current = audio;
    audio.onended = onEnd;
    audio.onerror = () => {
      const backupAudio = new Audio(fallbackDirectUrl);
      audioRef.current = backupAudio;
      backupAudio.onended = onEnd;
      backupAudio.onerror = onEnd;
      backupAudio.play().catch(onEnd);
    };

    audio.play().catch(err => {
      console.warn('[Audio Play error]', err);
      const backupAudio = new Audio(fallbackDirectUrl);
      audioRef.current = backupAudio;
      backupAudio.onended = onEnd;
      backupAudio.onerror = onEnd;
      backupAudio.play().catch(onEnd);
    });
  };

  // Copy helper
  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const toggleSentenceReveal = (sentenceId: string) => {
    setRevealedSentenceIds(prev => {
      const next = new Set(prev);
      if (next.has(sentenceId)) {
        next.delete(sentenceId);
      } else {
        next.add(sentenceId);
      }
      return next;
    });
  };

  // Filter sentences by clicked word if active
  const filteredSentences = useMemo(() => {
    if (!activeWordFilter) return activeCluster.sentences;
    return activeCluster.sentences.filter(s => s.targetWords.includes(activeWordFilter));
  }, [activeCluster, activeWordFilter]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner / Hero Card */}
      <div className={cn(
        "p-6 rounded-3xl border transition-all relative overflow-hidden",
        isDarkMode 
          ? "bg-gradient-to-br from-zinc-900/90 via-zinc-950/80 to-zinc-900/50 border-zinc-800/80 shadow-2xl" 
          : "bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 border-rose-100 shadow-xl"
      )}>
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Real Life Examples • Životni Primeri
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>200 Core Characters in 20 Clusters</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
                100% TTS Audio
              </span>
            </h1>
            <p className={cn("text-xs sm:text-sm max-w-2xl leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
              Master all 200 essential characters arranged in intuitive 10-word thematic clusters. Examine the authentic infographic charts, learn character meanings, and absorb natural real-life sentences with interactive pronunciation.
            </p>
          </div>

          {/* Quick Chart View Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setModalChartImage('/assets/aistudio/image_1536d14f.png')}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-sm active:scale-95",
                isDarkMode 
                  ? "bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 text-zinc-100" 
                  : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800"
              )}
            >
              <ImageIcon className="w-4 h-4 text-rose-500" />
              <span>Chart 1 (100 Basics)</span>
              <Maximize2 className="w-3 h-3 opacity-60 ml-0.5" />
            </button>
            <button
              onClick={() => setModalChartImage('/assets/aistudio/image_878c0d94.png')}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-sm active:scale-95",
                isDarkMode 
                  ? "bg-zinc-800/80 hover:bg-zinc-700/80 border-zinc-700 text-zinc-100" 
                  : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800"
              )}
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              <span>Chart 2 (100 Actions)</span>
              <Maximize2 className="w-3 h-3 opacity-60 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="mt-6 pt-5 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Hanzi, Pinyin, English or Serbian (e.g., 茶, cha, tea, čaj, 森林)..."
              className={cn(
                "w-full pl-10 pr-9 py-2 rounded-xl text-xs font-medium transition-all outline-none border",
                isDarkMode 
                  ? "bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30" 
                  : "bg-white border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-200"
              )}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Pinyin Toggle */}
            <button
              onClick={() => setShowPinyin(!showPinyin)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border transition-all active:scale-95",
                showPinyin 
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400" 
                  : (isDarkMode ? "bg-zinc-800/60 border-zinc-700 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600")
              )}
            >
              <Languages className="w-3.5 h-3.5" />
              Pinyin {showPinyin ? 'On' : 'Off'}
            </button>

            {/* Slow Audio Toggle */}
            <button
              onClick={() => setIsSlowAudio(!isSlowAudio)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border transition-all active:scale-95",
                isSlowAudio 
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400" 
                  : (isDarkMode ? "bg-zinc-800/60 border-zinc-700 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600")
              )}
            >
              {isSlowAudio ? <Volume1 className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isSlowAudio ? '0.75x Slow Speed' : '1.0x Normal Speed'}
            </button>

            {/* Test Yourself Practice Mode */}
            <button
              onClick={() => {
                setTestYourselfMode(!testYourselfMode);
                setRevealedSentenceIds(new Set());
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border transition-all active:scale-95",
                testYourselfMode 
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm" 
                  : (isDarkMode ? "bg-zinc-800/60 border-zinc-700 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600")
              )}
            >
              {testYourselfMode ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5" />}
              Practice Mode {testYourselfMode ? 'Active' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS VIEW (if search query active) */}
      {searchResults ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Found {searchResults.matchedWords.length} Words & {searchResults.matchedSentences.length} Sentences matching "{searchQuery}"
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1"
            >
              Clear search
            </button>
          </div>

          {/* Matched Words */}
          {searchResults.matchedWords.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Matching Characters</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                {searchResults.matchedWords.map(({ cluster, word }) => {
                  const pId = `search-word-${word.char}`;
                  const isPlaying = isPronouncingId === pId;
                  return (
                    <div
                      key={pId}
                      className={cn(
                        "p-3 rounded-2xl border transition-all relative flex flex-col justify-between group",
                        isDarkMode ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl font-black text-rose-500">{word.char}</span>
                        <button
                          onClick={() => playAudio(word.char, pId)}
                          className={cn(
                            "p-1.5 rounded-full transition-all",
                            isPlaying ? "bg-rose-500 text-white animate-pulse" : "bg-zinc-800/80 text-zinc-300 hover:text-white"
                          )}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs font-bold text-amber-400">{word.pinyin}</p>
                        <p className="text-[11px] font-medium text-zinc-300 truncate">{word.english}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{word.serbian}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-zinc-800/50 flex justify-between items-center text-[9px] text-zinc-500">
                        <span>{cluster.title}</span>
                        <button
                          onClick={() => {
                            setSelectedClusterId(cluster.id);
                            setSearchQuery('');
                          }}
                          className="text-rose-400 hover:underline"
                        >
                          Open Cluster →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Sentences */}
          {searchResults.matchedSentences.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Matching Real-Life Sentences</span>
              <div className="space-y-3">
                {searchResults.matchedSentences.map(({ cluster, sentence }) => (
                  <div
                    key={`search-s-${sentence.id}`}
                    className={cn(
                      "p-4 rounded-2xl border transition-all space-y-2",
                      isDarkMode ? "bg-zinc-900/70 border-zinc-800" : "bg-white border-zinc-200"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                        {cluster.emoji} {cluster.title} • {sentence.context}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => playAudio(sentence.chinese, `search-audio-${sentence.id}`)}
                          className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all",
                            isPronouncingId === `search-audio-${sentence.id}`
                              ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                              : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700"
                          )}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                        <button
                          onClick={() => handleCopy(`${sentence.chinese}\n${sentence.pinyin}\n${sentence.english}\n${sentence.serbian}`, `search-copy-${sentence.id}`)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          title="Copy"
                        >
                          {copiedId === `search-copy-${sentence.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-base font-bold text-zinc-100">{sentence.chinese}</p>
                    <p className="text-xs text-amber-400 font-medium">{sentence.pinyin}</p>
                    <p className="text-xs text-zinc-300">{sentence.english}</p>
                    <p className="text-xs text-zinc-400 italic">{sentence.serbian}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD CLUSTER EXPLORATION VIEW */
        <div className="space-y-6">
          {/* Chart Filter Pills */}
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All 20 Clusters', count: 20 },
                { id: 'chart1', label: 'Chart 1: Foundation (Rows 1–10)', count: 10 },
                { id: 'chart2', label: 'Chart 2: Actions & Nature (Rows 11–20)', count: 10 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setChartFilter(tab.id as any)}
                  className={cn(
                    "whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border",
                    chartFilter === tab.id
                      ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                      : (isDarkMode ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50")
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-medium text-zinc-500 hidden sm:inline-block">
              {displayedClusters.length} of {REAL_LIFE_CLUSTERS.length} clusters available
            </span>
          </div>

          {/* Cluster Horizontal Scrollbar Selector */}
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {displayedClusters.map((cluster) => {
                const isSelected = cluster.id === selectedClusterId;
                return (
                  <button
                    key={cluster.id}
                    onClick={() => {
                      setSelectedClusterId(cluster.id);
                      setActiveWordFilter(null);
                    }}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-left transition-all active:scale-95",
                      isSelected
                        ? "bg-rose-500/15 border-rose-500/50 shadow-md ring-1 ring-rose-500/30"
                        : (isDarkMode 
                            ? "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850/80 text-zinc-400" 
                            : "bg-white border-zinc-200/90 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600")
                    )}
                  >
                    <span className="text-xl">{cluster.emoji}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase",
                          isSelected ? "bg-rose-500 text-white" : "bg-zinc-800 text-zinc-400"
                        )}>
                          #{cluster.chartId === 1 ? cluster.rowNumber : cluster.rowNumber + 10}
                        </span>
                        <h3 className={cn("text-xs font-black", isSelected ? "text-rose-400" : (isDarkMode ? "text-zinc-200" : "text-zinc-800"))}>
                          {cluster.title}
                        </h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate max-w-[120px]">
                        {cluster.titleSerbian}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE CLUSTER CARD & INFOGRAPHIC BAR */}
          <div className={cn(
            "p-5 sm:p-6 rounded-3xl border transition-all space-y-6 shadow-xl",
            isDarkMode ? "bg-zinc-900/70 border-zinc-800" : "bg-white border-zinc-200"
          )}>
            {/* Cluster Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                  {activeCluster.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-500">
                      Chart {activeCluster.chartId} • Row {activeCluster.rowNumber}
                    </span>
                    <span className="text-[11px] text-zinc-500">• 10 Target Characters</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-100 flex items-center gap-2">
                    <span>{activeCluster.title}</span>
                    <span className="text-sm font-normal text-zinc-400">({activeCluster.titleSerbian})</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{activeCluster.description}</p>
                </div>
              </div>

              {/* View Chart Row in Original Image button */}
              <button
                onClick={() => setModalChartImage(activeCluster.chartImage)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95",
                  isDarkMode ? "bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200"
                )}
              >
                <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                <span>View Full Chart {activeCluster.chartId} Image</span>
              </button>
            </div>

            {/* 10-WORD VISUAL STRIP (Mimicking the Infographic Rows!) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-rose-500" />
                  Cluster Word Grid (Click to pronounce & filter sentences)
                </span>
                {activeWordFilter && (
                  <button
                    onClick={() => setActiveWordFilter(null)}
                    className="text-rose-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Clear Filter ({activeWordFilter})</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Character Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                {activeCluster.words.map((word, idx) => {
                  const wordAudioId = `word-${activeCluster.id}-${idx}-${word.char}`;
                  const isPlaying = isPronouncingId === wordAudioId;
                  const isFiltered = activeWordFilter === word.char;

                  return (
                    <div
                      key={word.char}
                      onClick={() => {
                        playAudio(word.char, wordAudioId);
                        setActiveWordFilter(activeWordFilter === word.char ? null : word.char);
                      }}
                      className={cn(
                        "p-3 rounded-2xl border text-center cursor-pointer transition-all relative flex flex-col justify-between group active:scale-95 select-none",
                        isFiltered
                          ? "bg-rose-500/20 border-rose-500 shadow-lg ring-2 ring-rose-500/40"
                          : (isDarkMode 
                              ? "bg-zinc-950/70 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900" 
                              : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white")
                      )}
                    >
                      {/* Pinyin on top */}
                      <span className={cn(
                        "text-[11px] font-bold",
                        isFiltered ? "text-rose-400" : "text-amber-400"
                      )}>
                        {word.pinyin}
                      </span>

                      {/* Hanzi Big Character */}
                      <span className={cn(
                        "text-3xl my-1.5 font-black font-serif transition-transform group-hover:scale-110",
                        isFiltered ? "text-rose-400" : (isDarkMode ? "text-zinc-100" : "text-zinc-900")
                      )}>
                        {word.char}
                      </span>

                      {/* English & Serbian Meaning */}
                      <div className="space-y-0.5 pt-1 border-t border-zinc-800/40">
                        <p className="text-[10px] font-bold text-zinc-300 truncate" title={word.english}>
                          {word.english}
                        </p>
                        <p className="text-[9px] text-zinc-500 truncate" title={word.serbian}>
                          {word.serbian}
                        </p>
                      </div>

                      {/* Speaker Badge */}
                      <div className={cn(
                        "absolute top-1 right-1 p-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100",
                        isPlaying ? "opacity-100 bg-rose-500 text-white animate-pulse" : "bg-zinc-800 text-zinc-400"
                      )}>
                        <Volume2 className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REAL-LIFE SENTENCES SECTION */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>Real-Life Sentences with Cluster Words</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Natural everyday expressions constructed from these characters. Listen, shadow-read, and absorb the syntax.
                  </p>
                </div>

                {testYourselfMode && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5" />
                    Click "Reveal Meaning" to check yourself!
                  </span>
                )}
              </div>

              {/* Sentences List */}
              <div className="space-y-4">
                {filteredSentences.map((sentence, sIdx) => {
                  const sAudioId = `s-audio-${sentence.id}`;
                  const isPlayingSentence = isPronouncingId === sAudioId;
                  const isRevealed = revealedSentenceIds.has(sentence.id);

                  return (
                    <motion.div
                      key={sentence.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sIdx * 0.08 }}
                      className={cn(
                        "p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden",
                        isDarkMode ? "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700/80" : "bg-zinc-50/80 border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {/* Context & Target words chips */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {sentence.context}
                          </span>
                          
                          {/* Target words badges */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-500">Words used:</span>
                            {sentence.targetWords.map(tw => (
                              <button
                                key={tw}
                                onClick={() => playAudio(tw, `badge-${tw}`)}
                                className="px-1.5 py-0.5 rounded text-[10px] font-black bg-zinc-800/80 text-amber-400 hover:bg-rose-500 hover:text-white transition-colors"
                              >
                                {tw}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Top-right action controls */}
                        <div className="flex items-center gap-1.5">
                          {/* Play button */}
                          <button
                            onClick={() => playAudio(sentence.chinese, sAudioId, isSlowAudio ? 0.75 : 1.0)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border active:scale-95 shadow-sm",
                              isPlayingSentence
                                ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                                : (isDarkMode ? "bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700" : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100")
                            )}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{isPlayingSentence ? 'Speaking...' : 'Listen'}</span>
                          </button>

                          {/* Slow speech button */}
                          <button
                            onClick={() => playAudio(sentence.chinese, sAudioId, 0.75)}
                            className={cn(
                              "p-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95",
                              isDarkMode ? "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700" : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                            )}
                            title="Play at 0.75x slow speed"
                          >
                            <span className="text-[10px] font-bold">0.75x</span>
                          </button>

                          {/* Copy sentence button */}
                          <button
                            onClick={() => handleCopy(
                              `${sentence.chinese}\n${sentence.pinyin}\n${sentence.english}\n${sentence.serbian}`,
                              `copy-${sentence.id}`
                            )}
                            className={cn(
                              "p-1.5 rounded-xl border transition-all active:scale-95",
                              isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700" : "bg-white text-zinc-500 hover:text-zinc-800 border-zinc-200"
                            )}
                            title="Copy full sentence with translation to clipboard"
                          >
                            {copiedId === `copy-${sentence.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Main Hanzi Sentence */}
                      <div className="py-1">
                        <p className="text-xl sm:text-2xl font-black font-serif leading-relaxed tracking-wide text-zinc-100">
                          {sentence.chinese}
                        </p>
                      </div>

                      {/* Accented Pinyin */}
                      {showPinyin && (
                        <p className="text-xs sm:text-sm font-bold text-amber-400 tracking-wide">
                          {sentence.pinyin}
                        </p>
                      )}

                      {/* Serbian & English Translations (With Practice Mode Blur/Reveal) */}
                      <div className="pt-2 border-t border-zinc-800/40 space-y-1">
                        {testYourselfMode && !isRevealed ? (
                          <div className="py-2 flex items-center justify-between">
                            <span className="text-xs text-zinc-500 italic">
                              Translations hidden for practice. Try to understand the Chinese sentence first!
                            </span>
                            <button
                              onClick={() => toggleSentenceReveal(sentence.id)}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Reveal Meaning</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {showEnglish && (
                              <p className="text-xs sm:text-sm font-medium text-zinc-200">
                                🇬🇧 {sentence.english}
                              </p>
                            )}
                            {showSerbian && (
                              <p className="text-xs sm:text-sm text-zinc-400 italic">
                                🇷🇸 {sentence.serbian}
                              </p>
                            )}
                            {testYourselfMode && isRevealed && (
                              <div className="pt-1">
                                <button
                                  onClick={() => toggleSentenceReveal(sentence.id)}
                                  className="text-[10px] text-zinc-500 hover:text-zinc-300 underline"
                                >
                                  Hide again
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN / MODAL ORIGINAL CHART VIEWER */}
      <AnimatePresence>
        {modalChartImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-bold text-zinc-100">
                    {modalChartImage.includes('image_1536d14f') ? 'Chart 1: 100 Foundation Chinese Characters (10 Rows)' : 'Chart 2: 100 Verbs, Fauna & Nature Characters (10 Rows)'}
                  </span>
                </div>
                <button
                  onClick={() => setModalChartImage(null)}
                  className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Image Container with Scroll & Zoom */}
              <div className="flex-1 overflow-auto p-4 flex justify-center items-center bg-zinc-950">
                <img
                  src={modalChartImage}
                  alt="Original Chinese Character Chart"
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg border border-zinc-800/80"
                />
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <span>Tip: Look at each row, then explore the interactive clusters and real-life sentences below.</span>
                <button
                  onClick={() => setModalChartImage(null)}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  Close & Study Clusters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
