import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  CheckCircle2,
  Loader2,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { HebrewVocabItem } from '../data/hebrewVocabData';
import type { OnlineHebrewDictEntry, HebrewApiSourceStatus } from '../lib/hebrewDictionaryService';

interface HebrewDictExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordAdded: (newWord: HebrewVocabItem) => void;
  existingChars: Set<string>;
  isDarkMode: boolean;
  isGirlyMode: boolean;
  speakHebrew: (text: string, id?: string) => void;
  initialQuery?: string;
}

const stripNikudLocal = (s: string) => s.replace(/[\u0591-\u05C7]/g, '').trim();

export const HebrewDictExplorerModal: React.FC<HebrewDictExplorerModalProps> = ({
  isOpen,
  onClose,
  onWordAdded,
  existingChars,
  isDarkMode,
  isGirlyMode,
  speakHebrew,
  initialQuery = ''
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'sources'>('search');
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<OnlineHebrewDictEntry[]>([]);
  const [usedSources, setUsedSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sourcesStatus, setSourcesStatus] = useState<HebrewApiSourceStatus[]>([]);
  const [sourcesSummary, setSourcesSummary] = useState<string>('');
  const [sourcesRecommendation, setSourcesRecommendation] = useState<string>('');

  // Normalized set so vocalized & unvocalized duplicates are detected accurately
  const normalizedExisting = React.useMemo(() => {
    const s = new Set<string>();
    existingChars.forEach(c => {
      s.add(c.trim());
      s.add(stripNikudLocal(c));
    });
    return s;
  }, [existingChars]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/dictionary/hebrew/sources')
        .then(r => r.json())
        .then(data => {
          if (data.sources) {
            setSourcesStatus(data.sources);
            setSourcesSummary(data.summary || '');
            setSourcesRecommendation(data.recommendation || '');
          }
        })
        .catch(err => console.warn('Could not fetch Hebrew dictionary sources:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const q = initialQuery || 'חכמה';
      setSearchTerm(q);
      performSearch(q);
    }
  }, [isOpen, initialQuery]);

  const performSearch = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setUsedSources([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/dictionary/hebrew/lookup?q=${encodeURIComponent(q)}&limit=24`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setResults(json.data);
        setUsedSources(Array.isArray(json.usedSources) ? json.usedSources : []);
      } else {
        setResults([]);
        setUsedSources([]);
      }
    } catch (e) {
      console.warn('Hebrew online dictionary lookup error:', e);
      setResults([]);
      setUsedSources([]);
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
    setTimeout(() => setToastMessage(null), 3200);
  };

  const isEntryInDictionary = (entry: OnlineHebrewDictEntry) =>
    normalizedExisting.has(entry.char.trim()) || normalizedExisting.has(stripNikudLocal(entry.char));

  const handleFastAdd = (entry: OnlineHebrewDictEntry) => {
    if (isEntryInDictionary(entry)) {
      showToast(`Reč "${entry.char}" se već nalazi u Vašem rečniku ✓`);
      return;
    }

    const firstDef = entry.serbian || entry.englishList?.[0] || entry.english || 'Hebrejski pojam';
    const newItem: HebrewVocabItem = {
      id: `he-online-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      char: entry.char,
      transliteration: entry.transliteration,
      vuk: entry.vuk,
      translation: firstDef,
      english: entry.english,
      emoji: entry.emoji || '📜',
      category: entry.category || 'svakodnevno',
      categoryLabel: 'Online Rečnik (Sefaria)',
      root: entry.root,
      visualTip: entry.etymologyNote || `Dodato iz ${entry.lexicon}`
    };

    onWordAdded(newItem);
    setJustAddedId(entry.id);
    setTimeout(() => setJustAddedId(prev => (prev === entry.id ? null : prev)), 2000);
    showToast(`Reč "${entry.char}" (${entry.vuk}) sačuvana u Rečnik i Izazov Znanja! 🎴✨`);
  };

  const handleEnrichAndAdd = async (entry: OnlineHebrewDictEntry) => {
    if (isEntryInDictionary(entry)) {
      showToast(`Reč "${entry.char}" se već nalazi u Vašem rečniku ✓`);
      return;
    }

    setEnrichingId(entry.id);
    try {
      const res = await fetch('/api/dictionary/hebrew/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          char: entry.char,
          transliteration: entry.transliteration,
          vuk: entry.vuk,
          english: entry.english,
          root: entry.root
        })
      });

      const json = await res.json();
      const enriched = json.data || {};

      const newItem: HebrewVocabItem = {
        id: `he-ai-online-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        char: enriched.charWithNikud || entry.char,
        transliteration: enriched.transliteration || entry.transliteration,
        vuk: enriched.vuk || entry.vuk,
        translation: enriched.serbian || entry.serbian || entry.englishList?.[0] || 'Hebrejska reč',
        english: entry.english,
        emoji: enriched.emoji || entry.emoji || '✨',
        category: enriched.category || entry.category || 'mudrost',
        categoryLabel: 'Sefaria Online + AI',
        root: enriched.root || entry.root,
        visualTip: enriched.visualTip || entry.etymologyNote || `Obogaćeno iz ${entry.lexicon}`
      };

      onWordAdded(newItem);
      setJustAddedId(entry.id);
      setTimeout(() => setJustAddedId(prev => (prev === entry.id ? null : prev)), 2000);
      showToast(`Reč "${newItem.char}" obogaćena prevodom "${newItem.translation}" i sačuvana! 🌟`);
    } catch (err) {
      console.warn('Hebrew enrich error, falling back to fast add:', err);
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
          isDarkMode ? "bg-zinc-950 border-blue-500/30 text-zinc-100" : "bg-white border-blue-200 text-zinc-900"
        )}
      >
        {/* Header */}
        <div className={cn(
          "p-5 sm:p-6 border-b flex items-center justify-between gap-4",
          isDarkMode ? "bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-zinc-900 border-zinc-800" : "bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-zinc-200"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-400/30 text-blue-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
              🇮🇱
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Online Hebrejski Rečnik (Sefaria · Klein · BDB · Wiktionary)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> 50,000+ Reči Live
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pretražite bilo koju reč na hebrejskom (sa ili bez Nikud-a), engleskom ili srpskom — i dodajte je jednim klikom u Rečnik, Flashcards i Izazov Znanja.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={cn(
          "px-5 sm:px-6 py-2.5 border-b flex items-center gap-3 text-xs font-bold flex-wrap",
          isDarkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-100/60 border-zinc-200"
        )}>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'search'
                ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white shadow-sm"
                : isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Pretraga Online Rečnika ({results.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'sources'
                ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white shadow-sm"
                : isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
            )}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Live API Izvori (Sefaria Klein, BDB, Wiktionary)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'search' && (
            <div className="space-y-5">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Unesite hebrejsku reč (npr. שלום, חכמה, אהבה), engleski (freedom, lion, coffee) ili srpski (sloboda, lav)..."
                    className={cn(
                      "w-full pl-10 pr-28 py-3 rounded-2xl text-xs sm:text-sm font-medium border outline-none transition-all",
                      isDarkMode ? "bg-zinc-900 border-zinc-800 text-white focus:border-blue-500" : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-blue-500"
                    )}
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5",
                      isGirlyMode ? "bg-pink-500 hover:bg-pink-400" : "bg-blue-600 hover:bg-blue-500 shadow-sm"
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
                    { label: '🦉 חכמה (Mudrost)', q: 'חכמה' },
                    { label: '🕊️ שלום (Mir)', q: 'שלום' },
                    { label: '💖 אהבה (Ljubav)', q: 'אהבה' },
                    { label: '🦅 freedom (Sloboda)', q: 'freedom' },
                    { label: '🦁 courage (Hrabrost)', q: 'courage' },
                    { label: '🍍 pineapple (Ananas)', q: 'pineapple' },
                    { label: '🌊 ocean (Okean)', q: 'ocean' },
                    { label: '⚖️ justice (Pravda)', q: 'justice' }
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
                        isDarkMode ? "bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:border-blue-500/50 hover:text-white" : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:border-blue-400"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {usedSources.length > 0 && !isLoading && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                    <span className="text-zinc-500">Aktivni izvori:</span>
                    {usedSources.map(src => (
                      <span
                        key={src}
                        className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 font-bold"
                      >
                        ● {src}
                      </span>
                    ))}
                  </div>
                )}
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
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                    <p className="text-xs text-cyan-300 font-mono">Pretražujem Sefaria Klein/BDB & Wiktionary online...</p>
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <div className="py-12 text-center space-y-2 border border-dashed rounded-3xl border-zinc-800">
                    <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-sm font-bold text-zinc-400">Nema pronađenih rezultata za "{searchTerm}"</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Pokušajte sa hebrejskom reči (npr. שלום, ברכה, ספר), engleskom (npr. wisdom, river, bread) ili srpskom (npr. mir, sloboda, kafa).
                    </p>
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {results.map((entry) => {
                      const isAlreadyAdded = isEntryInDictionary(entry);
                      const isEnriching = enrichingId === entry.id;
                      const isJustAdded = justAddedId === entry.id;

                      return (
                        <div
                          key={entry.id}
                          className={cn(
                            "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-sm",
                            isAlreadyAdded || isJustAdded
                              ? (isDarkMode ? "bg-emerald-950/20 border-emerald-500/35" : "bg-emerald-50/70 border-emerald-200")
                              : (isDarkMode ? "bg-zinc-900/70 border-zinc-800 hover:border-blue-500/40" : "bg-white border-zinc-200 hover:border-blue-300")
                          )}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl filter drop-shadow select-none">{entry.emoji}</span>
                                <div>
                                  <div className="flex items-baseline gap-2 flex-wrap">
                                    <h3 dir="rtl" className={cn("text-2xl font-serif font-black tracking-wide", isDarkMode ? "text-amber-300" : "text-blue-700")}>
                                      {entry.char}
                                    </h3>
                                    {entry.morphology && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                                        {entry.morphology}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
                                    <span className="text-cyan-400 font-bold">{entry.transliteration}</span>
                                    <span className="text-emerald-400 font-bold">/{entry.vuk}/</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => speakHebrew(entry.char, `he-dict-${entry.id}`)}
                                className="p-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 hover:text-white transition-all cursor-pointer shrink-0"
                                title="Poslušaj hebrejski izgovor"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {entry.serbian && (
                              <p className={cn("text-xs font-bold leading-snug", isDarkMode ? "text-emerald-200" : "text-emerald-800")}>
                                🇷🇸 {entry.serbian}
                              </p>
                            )}

                            <p className={cn("text-xs leading-relaxed font-sans line-clamp-3", isDarkMode ? "text-sky-200/90" : "text-zinc-700")}>
                              🇬🇧 {entry.english}
                            </p>

                            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 font-bold">
                                📚 {entry.lexicon}
                              </span>
                              {entry.root && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                                  שורש: {entry.root}
                                </span>
                              )}
                            </div>

                            {entry.etymologyNote && (
                              <p className="text-[11px] text-zinc-400 italic line-clamp-2 border-t border-zinc-800/60 pt-1.5">
                                💡 {entry.etymologyNote}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-zinc-800/40 flex items-center justify-between gap-2 flex-wrap">
                            {isAlreadyAdded || isJustAdded ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Sačuvano u Rečniku & Kvizu
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleFastAdd(entry)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95",
                                    isDarkMode
                                      ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:text-white hover:border-blue-500/60"
                                      : "bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200"
                                  )}
                                  title="Dodaj direktno u svoj hebrejski rečnik"
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
                                      : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                                  )}
                                  title="AI prevodi na srpski, dodaje Vuk izgovor, koren i jevrejsku poslovicu"
                                >
                                  {isEnriching ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Obogaćujem...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                      <span>✨ AI Prevod & Dodaj</span>
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

          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div className={cn(
                "p-5 rounded-3xl border space-y-2",
                isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              )}>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                    Integrisani Online Hebrejski Rečnici
                  </h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {sourcesSummary}
                </p>
                {sourcesRecommendation && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    💡 <strong>Savet:</strong> {sourcesRecommendation}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sourcesStatus.map((source) => (
                  <div
                    key={source.id}
                    className={cn(
                      "p-5 rounded-3xl border flex flex-col justify-between gap-4 shadow-sm",
                      source.status === 'active'
                        ? (isDarkMode ? "bg-emerald-950/20 border-emerald-500/35" : "bg-emerald-50/80 border-emerald-200")
                        : (isDarkMode ? "bg-blue-950/20 border-blue-500/35" : "bg-blue-50/80 border-blue-200")
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border",
                          source.status === 'active'
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        )}>
                          {source.status === 'active' ? '🟢 Live & Aktivno' : '✨ AI Dopuna'}
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
                        <span>Zvanični Izvor</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-emerald-400 font-bold text-[11px]">✓ Integrisano</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t flex items-center justify-between text-xs font-mono text-zinc-400",
          isDarkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-50 border-zinc-200"
        )}>
          <span>Sefaria Klein & BDB + Wiktionary + WiseFit AI</span>
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
