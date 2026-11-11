import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Volume1, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  Languages, 
  BookOpen, 
  Maximize2, 
  X, 
  Layers, 
  Compass,
  Lightbulb,
  Scroll,
  HelpCircle,
  Quote
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  REAL_LIFE_CLUSTERS, 
  RealLifeCluster, 
  RealLifeWordItem, 
  RealLifeIdiomOrProverb,
  TOTAL_REAL_LIFE_WORDS
} from '../data/chineseRealLifeClustersData';
import { ChineseDictExplorerModal } from './ChineseDictExplorerModal';

interface ChineseRealLifeExamplesProps {
  isDarkMode?: boolean;
  isGirlyMode?: boolean;
  onOpenDictionary?: (query?: string) => void;
}

export const ChineseRealLifeExamples: React.FC<ChineseRealLifeExamplesProps> = ({ 
  isDarkMode = true,
  isGirlyMode = false,
  onOpenDictionary
}) => {
  // State
  const [selectedClusterId, setSelectedClusterId] = useState<string>('c1-r1');
  const [chartFilter, setChartFilter] = useState<'all' | 'chart1' | 'chart2'>('all');
  const [wordFilterType, setWordFilterType] = useState<'all' | 'core' | 'compounds'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPronouncingId, setIsPronouncingId] = useState<string | null>(null);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVuk, setShowVuk] = useState(false);
  const [showSerbian, setShowSerbian] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showWordBreakdown, setShowWordBreakdown] = useState(false);
  const [isSlowAudio, setIsSlowAudio] = useState(false);
  const [testYourselfMode, setTestYourselfMode] = useState(false);
  const [revealedSentenceIds, setRevealedSentenceIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalChartImage, setModalChartImage] = useState<string | null>(null);
  const [activeWordFilter, setActiveWordFilter] = useState<string | null>(null);

  // Embedded dictionary modal state
  const [dictModalOpen, setDictModalOpen] = useState(false);
  const [dictModalQuery, setDictModalQuery] = useState('');

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

  // Active cluster words filtered by tab (All 42, 10 Roots, 32 Compounds)
  const displayedClusterWords = useMemo(() => {
    if (wordFilterType === 'core') {
      return activeCluster.words.filter(w => w.isCoreChar);
    }
    if (wordFilterType === 'compounds') {
      return activeCluster.words.filter(w => !w.isCoreChar);
    }
    return activeCluster.words;
  }, [activeCluster, wordFilterType]);

  // Global search filtering across all 840 words and 60+ idioms/proverbs
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.trim().toLowerCase();

    const matchedWords: { cluster: RealLifeCluster; word: RealLifeWordItem }[] = [];
    const matchedSentences: { cluster: RealLifeCluster; sentence: RealLifeIdiomOrProverb }[] = [];

    for (const cluster of REAL_LIFE_CLUSTERS) {
      for (const w of cluster.words) {
        if (
          w.char.includes(q) ||
          (w.charTraditional && w.charTraditional.includes(q)) ||
          w.pinyin.toLowerCase().includes(q) ||
          w.vuk.toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q) ||
          w.serbian.toLowerCase().includes(q) ||
          w.exampleUse.toLowerCase().includes(q)
        ) {
          matchedWords.push({ cluster, word: w });
        }
      }

      for (const s of cluster.sentences) {
        if (
          s.chinese.includes(q) ||
          (s.chineseTraditional && s.chineseTraditional.includes(q)) ||
          s.pinyin.toLowerCase().includes(q) ||
          s.vuk.toLowerCase().includes(q) ||
          s.english.toLowerCase().includes(q) ||
          s.serbian.toLowerCase().includes(q) ||
          s.serbianEquivalent.toLowerCase().includes(q) ||
          s.philosophicalContext.toLowerCase().includes(q) ||
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

  // Open dictionary lookup
  const handleOpenDict = (query: string) => {
    if (onOpenDictionary) {
      onOpenDictionary(query);
    } else {
      setDictModalQuery(query);
      setDictModalOpen(true);
    }
  };

  // Filter sentences by clicked word if active
  const filteredSentences = useMemo(() => {
    if (!activeWordFilter) return activeCluster.sentences;
    return activeCluster.sentences.filter(s => 
      s.targetWords.includes(activeWordFilter) || s.chinese.includes(activeWordFilter)
    );
  }, [activeCluster, activeWordFilter]);

  // Set of existing characters for dict modal
  const existingCharsSet = useMemo(() => {
    const set = new Set<string>();
    for (const c of REAL_LIFE_CLUSTERS) {
      for (const w of c.words) {
        set.add(w.char);
      }
    }
    return set;
  }, []);

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
              Real Life Examples • Životni Primeri & Mudrost
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex flex-wrap items-center gap-2.5">
              <span>840 Native Words & Proverbs in 20 Clusters</span>
              <span className="text-xs px-2.5 py-1 rounded-md font-bold border bg-amber-500/15 text-amber-400 border-amber-500/30">
                ~90% Everyday Coverage
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                成语 / 谚语 (Idioms & Proverbs)
              </span>
            </h1>
            <p className={cn("text-xs sm:text-sm max-w-3xl leading-relaxed", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
              Cover ~90% of everyday spoken Mandarin with <strong>840 high-frequency words</strong> (42 per cluster: 10 infographic chart roots + 32 daily conversational essentials). In place of mundane sentences, immerse yourself in <strong>authentic Chinese Idioms (成语 Chéngyǔ)</strong> and <strong>Classical Proverbs (谚语 Yànyǔ)</strong> with philosophical context, Serbian folk equivalents, and full audio pronunciation.
            </p>
          </div>

          {/* Quick Chart & Dict Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => handleOpenDict('')}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shadow-sm active:scale-95",
                isDarkMode 
                  ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300" 
                  : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
              )}
              title="Search CC-CEDICT 125,000+ words"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>CC-CEDICT Dict (125k)</span>
            </button>
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
              <span>Chart 2 (100 Verbs)</span>
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
              placeholder="Search all 840 words & proverbs (e.g., 千里之行, 水滴石穿, 多少, kupovina, Laozi)..."
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

            {/* Vuk Transliteration Toggle */}
            <button
              onClick={() => setShowVuk(!showVuk)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border transition-all active:scale-95",
                showVuk 
                  ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" 
                  : (isDarkMode ? "bg-zinc-800/60 border-zinc-700 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600")
              )}
              title="Show Serbian Vuk phonetic transliteration"
            >
              <span>Vuk</span> {showVuk ? 'On' : 'Off'}
            </button>

            {/* Word Breakdown Toggle */}
            <button
              onClick={() => setShowWordBreakdown(!showWordBreakdown)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border transition-all active:scale-95",
                showWordBreakdown 
                  ? "bg-purple-500/15 border-purple-500/30 text-purple-400" 
                  : (isDarkMode ? "bg-zinc-800/60 border-zinc-700 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-600")
              )}
              title="Show individual token analysis in idioms & proverbs"
            >
              <Layers className="w-3.5 h-3.5" />
              Breakdown {showWordBreakdown ? 'On' : 'Off'}
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
              {isSlowAudio ? '0.75x Slow' : '1.0x Normal'}
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
              Found {searchResults.matchedWords.length} Words & {searchResults.matchedSentences.length} Idioms/Proverbs matching "{searchQuery}"
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
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Matching Words & Compounds</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {searchResults.matchedWords.map(({ cluster, word }) => {
                  const pId = `search-word-${word.char}`;
                  const isPlaying = isPronouncingId === pId;
                  return (
                    <div
                      key={pId}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between group",
                        isDarkMode ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={cn(
                            "font-serif font-black",
                            word.char.length > 2 ? "text-xl text-rose-400" : "text-2xl sm:text-3xl text-rose-500"
                          )}>
                            {word.char}
                          </span>
                          {word.isCoreChar ? (
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Core Root
                            </span>
                          ) : (
                            <span className="ml-1.5 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Daily
                            </span>
                          )}
                          {word.frequencyRank && (
                            <span className="ml-1 text-[8px] px-1 py-0.2 rounded font-mono bg-zinc-800 text-zinc-400">
                              {word.frequencyRank}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenDict(word.char)}
                            className="p-1.5 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-amber-400 transition-colors"
                            title="Look up in CC-CEDICT"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
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
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs font-bold text-amber-400">{word.pinyin}</p>
                        {showVuk && <p className="text-[10px] text-cyan-400 font-mono">[{word.vuk}]</p>}
                        <p className="text-[11px] font-medium text-zinc-300 truncate">{word.english}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{word.serbian}</p>
                        <p className="text-[10px] text-zinc-500 italic truncate mt-1">Ex: {word.exampleUse}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-zinc-800/50 flex justify-between items-center text-[9px] text-zinc-500">
                        <span>{cluster.emoji} {cluster.title}</span>
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

          {/* Matched Sentences / Proverbs */}
          {searchResults.matchedSentences.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Matching Idioms & Proverbs</span>
              <div className="space-y-4">
                {searchResults.matchedSentences.map(({ cluster, sentence }) => (
                  <div
                    key={`search-s-${sentence.id}`}
                    className={cn(
                      "p-5 rounded-2xl border transition-all space-y-3",
                      isDarkMode ? "bg-zinc-900/70 border-zinc-800" : "bg-white border-zinc-200"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          {sentence.typeLabel}
                        </span>
                        <span className="text-[10px] text-zinc-500">{cluster.emoji} {cluster.title} • {sentence.context}</span>
                      </div>
                      <button
                        onClick={() => playAudio(sentence.chinese, `search-audio-${sentence.id}`)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>

                    <p className="text-xl sm:text-2xl font-black font-serif text-zinc-100">{sentence.chinese}</p>
                    <p className="text-xs text-amber-400 font-bold">{sentence.pinyin}</p>
                    {showVuk && <p className="text-xs text-cyan-400 font-mono">[{sentence.vuk}]</p>}
                    
                    {sentence.serbianEquivalent && (
                      <p className="text-xs text-amber-300 font-bold bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                        🇷🇸 Naš ekvivalent: "{sentence.serbianEquivalent}"
                      </p>
                    )}
                    <p className="text-xs text-zinc-300">🇬🇧 {sentence.english}</p>
                    <p className="text-xs text-zinc-400 italic">🇷🇸 {sentence.serbian}</p>

                    {sentence.philosophicalContext && (
                      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400">
                        <span className="font-bold text-amber-400">💡 Mudrost & Kontekst: </span>
                        {sentence.philosophicalContext}
                      </div>
                    )}
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
                { id: 'all', label: 'All 20 Clusters (840 Words)', count: 20 },
                { id: 'chart1', label: 'Chart 1: Foundation (Rows 1–10 • 420 Words)', count: 10 },
                { id: 'chart2', label: 'Chart 2: Verbs & Nature (Rows 11–20 • 420 Words)', count: 10 }
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
              {displayedClusters.length} clusters • 840 words • 60+ Idioms (成语)
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
                      <p className="text-[10px] text-zinc-500 truncate max-w-[130px]">
                        {cluster.titleSerbian} • 42 reči
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
                    <span className="text-[11px] text-zinc-500">
                      • {activeCluster.words.length} Vocabulary Items (10 Roots + 32 High-Frequency Everyday Words)
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-100 flex items-center gap-2">
                    <span>{activeCluster.title}</span>
                    <span className="text-sm font-normal text-zinc-400">({activeCluster.titleSerbian})</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{activeCluster.description}</p>
                </div>
              </div>

              {/* Action Buttons: Full Image & Dictionary */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleOpenDict(activeCluster.words[0]?.char || '')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95",
                    isDarkMode ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20" : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                  )}
                  title="Search CC-CEDICT for this cluster"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Explore in CC-CEDICT</span>
                </button>
                <button
                  onClick={() => setModalChartImage(activeCluster.chartImage)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95",
                    isDarkMode ? "bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200"
                  )}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-rose-500" />
                  <span>View Chart {activeCluster.chartId} Row</span>
                </button>
              </div>
            </div>

            {/* EXPANDED WORD FILTER TABS: All 42 vs 10 Roots vs 32 Compounds */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/40 p-2.5 rounded-2xl border border-zinc-800/60">
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: `All 42 Words (~90% Coverage)`, count: activeCluster.words.length },
                  { id: 'core', label: `10 Chart Roots 🖼️`, count: 10 },
                  { id: 'compounds', label: `32 Daily Essentials 💬`, count: 32 }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setWordFilterType(tab.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      wordFilterType === tab.id
                        ? "bg-rose-500 text-white border-rose-600 shadow-sm"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                {activeWordFilter && (
                  <button
                    onClick={() => setActiveWordFilter(null)}
                    className="text-rose-400 hover:underline flex items-center gap-1 text-[11px] font-bold"
                  >
                    <span>Clear Filter ({activeWordFilter})</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                <span className="text-[11px] text-zinc-500">
                  Click any card to pronounce & filter proverbs
                </span>
              </div>
            </div>

            {/* WORD GRID: Displaying words with badges, pinyin, Vuk, English, Serbian and example usage */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {displayedClusterWords.map((word, idx) => {
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
                    {/* Top Row: Type Badge & Dictionary Link */}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.2 rounded uppercase",
                        word.isCoreChar 
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" 
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      )}>
                        {word.isCoreChar ? 'Root 🖼️' : 'Daily 💬'}
                      </span>

                      {word.frequencyRank && (
                        <span className="text-[8px] font-mono text-zinc-500">
                          {word.frequencyRank}
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDict(word.char);
                        }}
                        className="p-1 rounded bg-zinc-800/80 text-zinc-400 hover:text-amber-400 hover:bg-zinc-700 transition-colors ml-auto"
                        title="Look up in CC-CEDICT"
                      >
                        <BookOpen className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    {/* Pinyin on top */}
                    {showPinyin && (
                      <span className={cn(
                        "text-[11px] font-bold tracking-tight",
                        isFiltered ? "text-rose-400" : "text-amber-400"
                      )}>
                        {word.pinyin}
                      </span>
                    )}

                    {/* Vuk Transliteration */}
                    {showVuk && (
                      <span className="text-[10px] text-cyan-400 font-mono tracking-tight">
                        [{word.vuk}]
                      </span>
                    )}

                    {/* Hanzi Big Character or Compound */}
                    <div className="my-1.5 flex items-center justify-center min-h-[44px]">
                      <span className={cn(
                        "font-black font-serif transition-transform group-hover:scale-105",
                        word.char.length > 2 
                          ? "text-xl leading-tight" 
                          : word.char.length === 2 
                            ? "text-2xl sm:text-3xl" 
                            : "text-3xl sm:text-4xl",
                        isFiltered ? "text-rose-400" : (isDarkMode ? "text-zinc-100" : "text-zinc-900")
                      )}>
                        {word.char}
                      </span>
                    </div>

                    {/* English & Serbian Meaning */}
                    <div className="space-y-0.5 pt-1.5 border-t border-zinc-800/40 text-left">
                      <p className="text-[11px] font-bold text-zinc-200 truncate" title={word.english}>
                        🇬🇧 {word.english}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate" title={word.serbian}>
                        🇷🇸 {word.serbian}
                      </p>
                      {word.exampleUse && (
                        <p className="text-[9px] text-zinc-500 italic truncate pt-0.5" title={word.exampleUse}>
                          Ex: {word.exampleUse}
                        </p>
                      )}
                    </div>

                    {/* Speaker Badge */}
                    <div className={cn(
                      "absolute top-1 right-8 p-1 rounded-full transition-opacity opacity-0 group-hover:opacity-100",
                      isPlaying ? "opacity-100 bg-rose-500 text-white animate-pulse" : "bg-zinc-800 text-zinc-400"
                    )}>
                      <Volume2 className="w-2.5 h-2.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CHINESE IDIOMS (CHENGYU) & CLASSICAL PROVERBS (YANYU) SECTION */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
                    <Scroll className="w-4 h-4 text-amber-400" />
                    <span>Classical Chinese Idioms & Proverbs (成语与古训 • Čengji i Izreke)</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Profound philosophical idioms, Daoist axioms, and ancient proverbs incorporating these cluster characters. Complete with Serbian folk equivalents and Stoic wisdom.
                  </p>
                </div>

                {testYourselfMode && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5" />
                    Practice Mode: Click "Reveal Wisdom" to check yourself!
                  </span>
                )}
              </div>

              {/* Proverbs List */}
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
                        "p-5 rounded-3xl border transition-all space-y-3 relative overflow-hidden",
                        isDarkMode ? "bg-zinc-950/70 border-zinc-800 hover:border-zinc-700/80 shadow-lg" : "bg-zinc-50/90 border-zinc-200 hover:border-zinc-300 shadow-md"
                      )}
                    >
                      {/* Top Header: Idiom Type, Context & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/40 pb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                            <Quote className="w-3 h-3 text-amber-400" />
                            {sentence.typeLabel}
                          </span>
                          
                          <span className="text-[10px] text-zinc-400 font-medium px-2 py-0.5 rounded-md bg-zinc-800/60 border border-zinc-700/50">
                            {sentence.context}
                          </span>
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

                          {/* Copy proverb button */}
                          <button
                            onClick={() => handleCopy(
                              `${sentence.chinese}\n${sentence.pinyin}\n${sentence.english}\n${sentence.serbianEquivalent}\n${sentence.philosophicalContext}`,
                              `copy-${sentence.id}`
                            )}
                            className={cn(
                              "p-1.5 rounded-xl border transition-all active:scale-95",
                              isDarkMode ? "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-700" : "bg-white text-zinc-500 hover:text-zinc-800 border-zinc-200"
                            )}
                            title="Copy full proverb with translation to clipboard"
                          >
                            {copiedId === `copy-${sentence.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Main Hanzi Idiom / Proverb Display */}
                      <div className="py-1">
                        <p className="text-2xl sm:text-3xl font-black font-serif leading-relaxed tracking-wide text-zinc-100">
                          {sentence.chinese}
                        </p>
                      </div>

                      {/* Accented Pinyin & Vuk */}
                      {showPinyin && (
                        <p className="text-xs sm:text-sm font-bold text-amber-400 tracking-wide font-mono">
                          {sentence.pinyin}
                        </p>
                      )}

                      {showVuk && (
                        <p className="text-xs text-cyan-400 font-mono tracking-wide">
                          [{sentence.vuk}]
                        </p>
                      )}

                      {/* Literal Breakdown if provided */}
                      {sentence.literalEnglish && (
                        <p className="text-[11px] text-zinc-400 italic">
                          <span className="font-semibold text-zinc-500">Bukvalno: </span>
                          "{sentence.literalEnglish}"
                        </p>
                      )}

                      {/* Word Breakdown Tokens (Optional Interactive Mode) */}
                      {showWordBreakdown && sentence.tokens && sentence.tokens.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap gap-1.5">
                          {sentence.tokens.map((tok, tIdx) => (
                            <div
                              key={tIdx}
                              onClick={() => playAudio(tok.word, `tok-${sentence.id}-${tIdx}`)}
                              className={cn(
                                "px-2 py-1 rounded-lg border text-left cursor-pointer transition-all hover:border-amber-400",
                                tok.isTarget 
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
                                  : "bg-zinc-800/50 border-zinc-700/60 text-zinc-300"
                              )}
                            >
                              <p className="text-xs font-black font-serif">{tok.word}</p>
                              <p className="text-[9px] text-amber-400 font-semibold">{tok.pinyin}</p>
                              <p className="text-[9px] text-zinc-400 truncate max-w-[90px]">{tok.english}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Serbian Folk Equivalent & Wisdom (With Practice Mode Blur/Reveal) */}
                      <div className="pt-2 border-t border-zinc-800/40 space-y-2">
                        {testYourselfMode && !isRevealed ? (
                          <div className="py-3 flex items-center justify-between bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
                            <span className="text-xs text-zinc-500 italic">
                              Idiom translations and philosophical context hidden for practice. Try to understand the characters first!
                            </span>
                            <button
                              onClick={() => toggleSentenceReveal(sentence.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Reveal Wisdom</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Highlighted Serbian Folk Proverb Equivalent */}
                            {sentence.serbianEquivalent && (
                              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent border border-amber-500/30 flex items-center gap-2">
                                <span className="text-base">🇷🇸</span>
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Naš narodni ekvivalent:</span>
                                  <p className="text-xs sm:text-sm font-black text-amber-200">
                                    "{sentence.serbianEquivalent}"
                                  </p>
                                </div>
                              </div>
                            )}

                            {showEnglish && (
                              <p className="text-xs sm:text-sm font-medium text-zinc-200">
                                🇬🇧 {sentence.english}
                              </p>
                            )}

                            {showSerbian && (
                              <p className="text-xs sm:text-sm text-zinc-300">
                                🇷🇸 {sentence.serbian}
                              </p>
                            )}

                            {/* Deep Philosophical / Stoic Insight Card */}
                            {sentence.philosophicalContext && (
                              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                                  <Lightbulb className="w-3.5 h-3.5" />
                                  <span>Mudrost & Stoički Kontekst:</span>
                                </div>
                                <p className="leading-relaxed text-zinc-300 text-[11px]">
                                  {sentence.philosophicalContext}
                                </p>
                              </div>
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

      {/* EMBEDDED CC-CEDICT DICTIONARY MODAL */}
      <ChineseDictExplorerModal
        isOpen={dictModalOpen}
        onClose={() => setDictModalOpen(false)}
        onWordAdded={() => {}}
        existingChars={existingCharsSet}
        isDarkMode={isDarkMode}
        isGirlyMode={isGirlyMode}
        speakChinese={(text) => playAudio(text, 'dict-speak')}
        initialQuery={dictModalQuery}
      />

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
                <span>Tip: Examine the chart row, then master the 42 words and authentic idioms below.</span>
                <button
                  onClick={() => setModalChartImage(null)}
                  className="px-3.5 py-1.5 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  Close & Explore
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
