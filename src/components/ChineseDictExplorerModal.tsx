import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Check,
  Sparkles,
  ExternalLink,
  BookOpen,
  Volume2,
  X,
  Database,
  Server,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { VocabItem } from '../data/chineseVocabData';
import type { CcCedictWordEntry, ApiSourcesStatus } from '../lib/chineseDictionaryService';

interface ChineseDictExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordAdded: (newWord: VocabItem) => void;
  existingChars: Set<string>;
  isDarkMode: boolean;
  isGirlyMode: boolean;
  speakChinese: (text: string, id?: string) => void;
  initialQuery?: string;
}

export const ChineseDictExplorerModal: React.FC<ChineseDictExplorerModalProps> = ({
  isOpen,
  onClose,
  onWordAdded,
  existingChars,
  isDarkMode,
  isGirlyMode,
  speakChinese,
  initialQuery = ''
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'sources'>('search');
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<CcCedictWordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sourcesStatus, setSourcesStatus] = useState<ApiSourcesStatus[]>([]);
  const [sourcesSummary, setSourcesSummary] = useState<string>('');
  const [sourcesRecommendation, setSourcesRecommendation] = useState<string>('');

  // Fetch sources evaluation on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/dictionary/chinese/sources')
        .then(r => r.json())
        .then(data => {
          if (data.sources) {
            setSourcesStatus(data.sources);
            setSourcesSummary(data.summary || '');
            setSourcesRecommendation(data.recommendation || '');
          }
        })
        .catch(err => console.warn('Could not fetch sources evaluation:', err));
    }
  }, [isOpen]);

  // Initial search if query passed
  useEffect(() => {
    if (isOpen) {
      const q = initialQuery || '茶';
      setSearchTerm(q);
      performSearch(q);
    }
  }, [isOpen, initialQuery]);

  const performSearch = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/dictionary/chinese/lookup?q=${encodeURIComponent(q)}&limit=25`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setResults(json.data);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.warn('Search error:', e);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1-Click Fast Add directly from CC-CEDICT
  const handleFastAdd = (entry: CcCedictWordEntry) => {
    if (existingChars.has(entry.char)) {
      showToast(`Reč "${entry.char}" se već nalazi u Vašoj riznici!`);
      return;
    }

    const firstEnglish = entry.englishList[0] || entry.english || 'Kineski pojam';
    const newItem: VocabItem = {
      id: `zh-cedict-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      char: entry.char,
      pinyin: entry.pinyin,
      vuk: entry.vuk,
      english: entry.english,
      translation: firstEnglish, // default to clean English definition until customized
      emoji: entry.emoji || '🎴',
      category: 'custom',
      categoryLabel: 'CC-CEDICT (125k)',
      tags: ['cc-cedict', entry.category || 'noun', entry.charTraditional ? `trad:${entry.charTraditional}` : ''],
      level: 1,
      quote: {
        text: `${entry.char}，学而时习之。`,
        pinyin: 'Xué ér shí xí zhī.',
        translation: 'Učiti i u pravo vreme primenjivati stečeno znanje.',
        author: 'Konfucije (Analekti)'
      }
    };

    onWordAdded(newItem);
    showToast(`Dodata nova reč "${entry.char}" (${entry.pinyin}) u rečnik i kviz! 🎴✨`);
  };

  // AI Enrich + Add: Translates to Serbian, generates visual tip & stoic quote
  const handleEnrichAndAdd = async (entry: CcCedictWordEntry) => {
    if (existingChars.has(entry.char)) {
      showToast(`Reč "${entry.char}" se već nalazi u Vašoj riznici!`);
      return;
    }

    setEnrichingId(entry.id);
    try {
      const res = await fetch('/api/dictionary/chinese/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          char: entry.char,
          pinyin: entry.pinyin,
          english: entry.english,
          vuk: entry.vuk
        })
      });

      const json = await res.json();
      const enriched = json.data || {};

      const newItem: VocabItem = {
        id: `zh-ai-cedict-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        char: entry.char,
        pinyin: entry.pinyin,
        vuk: entry.vuk,
        english: entry.english,
        translation: enriched.serbian || entry.englishList[0] || 'Kineska reč',
        emoji: enriched.emoji || entry.emoji || '✨',
        category: 'custom',
        categoryLabel: 'CC-CEDICT + AI',
        tags: ['cc-cedict', enriched.category || entry.category || 'noun'],
        level: 1,
        quote: enriched.quote ? {
          text: enriched.quote.text || `${entry.char} 者，心存高远。`,
          pinyin: enriched.quote.pinyin || entry.pinyin,
          translation: enriched.quote.translation || 'Mudrost počinje razumevanjem suštine.',
          author: enriched.quote.author || 'WiseFit Sanctuary'
        } : {
          text: `${entry.char}，学而时习之。`,
          pinyin: 'Xué ér shí xí zhī.',
          translation: 'Učiti i u pravo vreme primenjivati stečeno znanje.',
          author: 'Konfucije'
        }
      };

      onWordAdded(newItem);
      showToast(`Reč "${entry.char}" obogaćena prevodom "${newItem.translation}" i sačuvana! 🌟`);
    } catch (err: any) {
      console.warn('Enrich error, falling back to direct add:', err);
      handleFastAdd(entry);
    } finally {
      setEnrichingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn(
          "w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden",
          isDarkMode ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-5 sm:p-6 border-b flex items-center justify-between gap-4",
          isDarkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center text-xl shadow-inner">
              🎴
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">CC-CEDICT Riznica & API Integracije</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  125,369 Reči Online
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pretražite i dodajte bilo koju kinesku reč u Vaš lični rečnik, Flashcards i Kviz arenu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={cn(
          "px-6 py-2.5 border-b flex items-center gap-3 text-xs font-bold",
          isDarkMode ? "bg-zinc-900/30 border-zinc-800" : "bg-zinc-100/50 border-zinc-200"
        )}>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'search'
                ? isGirlyMode ? "bg-pink-500 text-white" : "bg-red-600 text-white shadow-sm"
                : isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Pretraga Rečnika ({results.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'sources'
                ? isGirlyMode ? "bg-pink-500 text-white" : "bg-red-600 text-white shadow-sm"
                : isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Status 4 API Izvora (PONS, MandarinSpot, CC-CEDICT)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: SEARCH & ADD */}
          {activeTab === 'search' && (
            <div className="space-y-5">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Unesite kineske karaktere (npr. 茶, 智慧), pinyin (cha, long) ili engleski (tea, dragon, peace)..."
                    className={cn(
                      "w-full pl-10 pr-28 py-3 rounded-2xl text-xs sm:text-sm font-medium border outline-none transition-all",
                      isDarkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-red-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-red-500"
                    )}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5",
                      isGirlyMode ? "bg-pink-500 hover:bg-pink-400" : "bg-red-600 hover:bg-red-500 shadow-sm"
                    )}
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Traži</span>
                  </button>
                </div>

                {/* Quick Preset Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                  <span className="text-zinc-500 text-[11px] shrink-0">Popularno:</span>
                  {[
                    { label: '🍵 茶 (Čaj)', q: '茶' },
                    { label: '🐉 龙 (Zmaj)', q: '龙' },
                    { label: '🧠 智慧 (Mudrost)', q: '智慧' },
                    { label: '☕ 咖啡 (Kafa)', q: '咖啡' },
                    { label: '🤝 朋友 (Prijatelj)', q: '朋友' },
                    { label: '💧 水 (Voda)', q: '水' },
                    { label: '🌸 樱花 (Trešnja)', q: '樱花' },
                    { label: '💪 力量 (Snaga)', q: '力量' }
                  ].map(preset => (
                    <button
                      key={preset.q}
                      type="button"
                      onClick={() => {
                        setSearchTerm(preset.q);
                        performSearch(preset.q);
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer text-[11px]",
                        isDarkMode ? "bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-red-500/50 hover:text-white" : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:border-red-400"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </form>

              {/* Toast banner */}
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}

              {/* Results List */}
              <div className="space-y-3">
                {isLoading && (
                  <div className="py-12 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400 font-mono">Pretražujem 125,369 CC-CEDICT unosa...</p>
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <div className="py-12 text-center space-y-2 border border-dashed rounded-3xl border-zinc-800">
                    <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-sm font-bold text-zinc-400">Nema pronađenih unosa za "{searchTerm}"</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Pokušajte sa pojedinačnim hanzi karakterom, pinyinom (npr. 'cha', 'long') ili engleskom reči (npr. 'tea', 'dragon').
                    </p>
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {results.map((entry) => {
                      const isAlreadyAdded = existingChars.has(entry.char);
                      const isEnriching = enrichingId === entry.id;

                      return (
                        <div
                          key={entry.id}
                          className={cn(
                            "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-sm",
                            isAlreadyAdded
                              ? (isDarkMode ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50/70 border-emerald-200")
                              : (isDarkMode ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200")
                          )}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl filter drop-shadow select-none">{entry.emoji}</span>
                                <div>
                                  <div className="flex items-baseline gap-2">
                                    <h3 className="text-2xl font-black text-white tracking-wide">{entry.char}</h3>
                                    {entry.charTraditional && entry.charTraditional !== entry.char && (
                                      <span className="text-xs text-zinc-500 font-serif">
                                        (Trad: {entry.charTraditional})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-mono">
                                    <span className="text-red-400 font-bold">{entry.pinyin}</span>
                                    <span className="text-amber-400 font-bold">/{entry.vuk}/</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => speakChinese(entry.char, `dict-${entry.id}`)}
                                className="p-1.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                                title="Poslušaj izgovor"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* English definitions from CC-CEDICT */}
                            <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-2">
                              🇬🇧 {entry.english}
                            </p>

                            {/* Classifiers / Measure words if present */}
                            {entry.classifiers && entry.classifiers.length > 0 && (
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                                <span>Kvantifikator (量词):</span>
                                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700">
                                  {entry.classifiers.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between gap-2">
                            {isAlreadyAdded ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                                <Check className="w-3.5 h-3.5" /> Već u Riznici & Kvizu
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleFastAdd(entry)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95",
                                    isDarkMode
                                      ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200"
                                  )}
                                  title="Dodaj direktno u bazu rečnika"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Brzo Dodaj</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isEnriching}
                                  onClick={() => handleEnrichAndAdd(entry)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95",
                                    isGirlyMode
                                      ? "bg-pink-500 hover:bg-pink-400"
                                      : "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                                  )}
                                  title="AI prevodi na srpski, dodaje vizuelni mnemonički savet i stoic mudrost"
                                >
                                  {isEnriching ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Prevođenje...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                      <span>✨ Obogati sa AI & Dodaj</span>
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 4 API INTEGRATIONS STATUS & COMPARISON */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className={cn(
                "p-5 rounded-3xl border space-y-2",
                isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                    Strateška Analiza Integracija za WiseFit
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {sourcesSummary || 'WiseFit implementira samostalno hostovanu CC-CEDICT bazu reči (125,369 unosa) u Node.js okruženju, čime dobijamo maksimalnu brzinu bez oslanjanja na nestabilne spoljne REST servise.'}
                </p>
                {sourcesRecommendation && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    💡 <strong>Preporuka:</strong> {sourcesRecommendation}
                  </div>
                )}
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sourcesStatus.map((source) => {
                  const isSuccess = source.status === 'active';
                  const isError = source.status === 'offline_error';
                  const isWarning = source.status === 'not_suitable' || source.status === 'requires_key';

                  return (
                    <div
                      key={source.id}
                      className={cn(
                        "p-5 rounded-3xl border flex flex-col justify-between gap-4 shadow-sm",
                        isSuccess
                          ? (isDarkMode ? "bg-emerald-950/20 border-emerald-500/40" : "bg-emerald-50/80 border-emerald-200")
                          : isError
                            ? (isDarkMode ? "bg-rose-950/20 border-rose-500/40" : "bg-rose-50/80 border-rose-200")
                            : (isDarkMode ? "bg-amber-950/20 border-amber-500/40" : "bg-amber-50/80 border-amber-200")
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                            isSuccess
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : isError
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          )}>
                            {isSuccess ? "🟢 Aktivan & Ugrađen (0ms)" : isError ? "🔴 Server Oboren (HTTP 500)" : "🟡 Uslovno / Ograničeno"}
                          </span>

                          <span className="text-[10px] font-mono text-zinc-500 uppercase">{source.type}</span>
                        </div>

                        <h4 className="text-sm font-black text-white">{source.name}</h4>
                        <p className="text-xs text-zinc-400">{source.description}</p>
                        <p className="text-xs text-zinc-300 font-mono pt-1 leading-relaxed">{source.details}</p>
                      </div>

                      <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between text-xs">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>Zvanični URL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {isSuccess && (
                          <span className="text-emerald-400 font-bold text-[11px]">
                            ✓ Integrisano u WiseFit
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t flex items-center justify-between text-xs font-mono text-zinc-400",
          isDarkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        )}>
          <span>Baza: CC-CEDICT (125,369 reči) + Gemini AI 2.5 Leksikon</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all cursor-pointer"
          >
            Zatvori
          </button>
        </div>
      </motion.div>
    </div>
  );
};
