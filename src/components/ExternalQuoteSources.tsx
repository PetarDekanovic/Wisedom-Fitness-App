import React, { useEffect, useRef, useState } from 'react';
import { Trophy, ExternalLink, Copy, CheckCircle2, Volume2, VolumeX, Database, BookmarkCheck, RefreshCw, Sparkles, Zap, Globe, Layers, Plus, Loader2, Check, Activity } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

interface ExternalQuoteSourcesProps {
  isDarkMode: boolean;
  cn: (...inputs: any[]) => string;
  currentUserId?: string;
  onQuoteSaved?: (savedQuote: any) => void;
}

interface ExtractedQuote {
  text: string;
  author: string;
}

const extractQuoteFromIframe = (iframeEl: HTMLIFrameElement, siteName: string): ExtractedQuote | null => {
  try {
    const doc = iframeEl.contentWindow?.document;
    if (!doc || !doc.body) return null;

    const html = doc.body.innerHTML || '';
    if (!html) return null;

    // Convert breaks/paragraphs to newlines for clean line parsing
    const textWithBreaks = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n');

    const tempDiv = doc.createElement('div');
    tempDiv.innerHTML = textWithBreaks;
    const fullText = tempDiv.innerText || tempDiv.textContent || '';

    const lines = fullText
      .split('\n')
      .map(l => l.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);

    const headerFilter = [
      'quote of the day',
      "today's quote",
      'daily quote',
      'featured quote'
    ];

    let extractedText = '';
    let extractedAuthor = '';

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (headerFilter.some(h => lower.includes(h))) continue;
      if (lower.includes('more quotes') || lower.includes('http://') || lower.includes('https://')) continue;

      if (!extractedText && line.length > 3) {
        extractedText = line.replace(/^["“]|["”]$/g, '').trim();
      } else if (extractedText && !extractedAuthor) {
        extractedAuthor = line.replace(/^[-–—\s]+/, '').trim();
      }
    }

    // Fallback author check from <a> elements
    if (!extractedAuthor || extractedAuthor.toLowerCase() === siteName.toLowerCase()) {
      const links = Array.from(doc.querySelectorAll('a'));
      for (const link of links) {
        const linkText = (link.textContent || '').trim();
        const lowerLink = linkText.toLowerCase();
        if (
          linkText &&
          !lowerLink.includes('more quotes') &&
          !lowerLink.includes('azquotes') &&
          !lowerLink.includes('brainyquote')
        ) {
          extractedAuthor = linkText;
          break;
        }
      }
    }

    if (
      extractedText &&
      extractedText.toLowerCase() !== 'quote of the day' &&
      extractedText.toLowerCase() !== "today's quote"
    ) {
      return {
        text: extractedText,
        author: extractedAuthor || siteName
      };
    }
  } catch (e) {
    console.warn(`Extraction error for ${siteName}:`, e);
  }
  return null;
};

interface ScriptWidgetProps {
  scriptUrl: string;
  moreUrl: string;
  siteName: string;
  isDarkMode: boolean;
  onQuoteExtracted: (quote: ExtractedQuote) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

const ScriptWidget: React.FC<ScriptWidgetProps> = ({
  scriptUrl,
  moreUrl,
  siteName,
  isDarkMode,
  onQuoteExtracted,
  iframeRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '140px';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.background = 'transparent';
    iframe.title = `${siteName} Quote of the Day`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <base target="_blank" />
          <style>
            body {
              margin: 0;
              padding: 10px 12px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: ${isDarkMode ? '#f4f4f5' : '#18181b'};
              background-color: transparent;
              font-size: 14px;
              line-height: 1.5;
            }
            a {
              color: ${isDarkMode ? '#34d399' : '#059669'};
              text-decoration: none;
              font-weight: 600;
            }
            a:hover {
              text-decoration: underline;
            }
            small {
              display: block;
              margin-top: 8px;
              font-size: 11px;
              opacity: 0.8;
            }
          </style>
        </head>
        <body>
          <script type="text/javascript" src="${scriptUrl}"></script>
          <small><i><a href="${moreUrl}" target="_blank" rel="noopener noreferrer">More quotes on ${siteName} &rarr;</a></i></small>
        </body>
      </html>
    `;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(iframe);

    // Save iframe reference
    if (iframeRef) {
      (iframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = iframe;
    }

    try {
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        const doExtract = () => {
          const res = extractQuoteFromIframe(iframe, siteName);
          if (res) {
            onQuoteExtracted(res);
          }
        };

        // Poll multiple times as external scripts load asynchronously
        setTimeout(doExtract, 400);
        setTimeout(doExtract, 1000);
        setTimeout(doExtract, 2500);
      }
    } catch (e) {
      console.error(`Error loading ${siteName} widget:`, e);
    }
  }, [scriptUrl, moreUrl, siteName, isDarkMode, onQuoteExtracted, iframeRef]);

  return <div ref={containerRef} className="w-full min-h-[130px]" />;
};

interface SourceBoxState {
  quoteText: string;
  author: string;
  isCopied: boolean;
  isSpeaking: boolean;
  isSaved: boolean;
  isSaving: boolean;
}

export const ExternalQuoteSources: React.FC<ExternalQuoteSourcesProps> = ({
  isDarkMode,
  cn,
  onQuoteSaved
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const azIframeRef = useRef<HTMLIFrameElement | null>(null);
  const bqIframeRef = useRef<HTMLIFrameElement | null>(null);

  const [azState, setAzState] = useState<SourceBoxState>({
    quoteText: '',
    author: 'AZQuotes',
    isCopied: false,
    isSpeaking: false,
    isSaved: false,
    isSaving: false
  });

  const [bqState, setBqState] = useState<SourceBoxState>({
    quoteText: '',
    author: 'BrainyQuote',
    isCopied: false,
    isSpeaking: false,
    isSaved: false,
    isSaving: false
  });

  // Check Firestore database to see if today's quote from AZQuotes / BrainyQuote was already saved
  const [labLoadingMethod, setLabLoadingMethod] = useState<number | 'benchmark' | null>(null);
  const [labQuotes, setLabQuotes] = useState<any[]>([]);
  const [benchmarkSummary, setBenchmarkSummary] = useState<any | null>(null);
  const [savedLabQuoteIds, setSavedLabQuoteIds] = useState<Record<string, boolean>>({});
  const [labError, setLabError] = useState<string | null>(null);

  const runLabMethod = async (method: 1 | 2 | 3 | 'benchmark') => {
    setLabLoadingMethod(method);
    setLabError(null);
    try {
      if (method === 'benchmark') {
        const res = await fetch('/api/digest-lab/benchmark');
        if (!res.ok) throw new Error('Benchmark request failed');
        const data = await res.json();
        setBenchmarkSummary(data.benchmark);
        const combined = [
          ...(data.results?.method1?.quotes || []),
          ...(data.results?.method2?.quotes || []),
          ...(data.results?.method3?.quotes || [])
        ];
        setLabQuotes(combined);
      } else {
        const endpoint = method === 1 ? 'method1-ai' : method === 2 ? 'method2-scrape' : 'method3-vault';
        const res = await fetch(`/api/digest-lab/${endpoint}`);
        if (!res.ok) throw new Error(`Method ${method} execution failed`);
        const data = await res.json();
        setLabQuotes(data.quotes || []);
      }
    } catch (e: any) {
      console.error('Lab execution error:', e);
      setLabError(e.message || 'Failed to execute method');
    } finally {
      setLabLoadingMethod(null);
    }
  };

  const handleSaveLabQuote = async (quote: any) => {
    try {
      setSavedLabQuoteIds(prev => ({ ...prev, [quote.id]: true }));
      const res = await fetch('/api/digest-lab/save-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quote.text,
          author: quote.author,
          category: quote.category,
          source: quote.source
        })
      });
      const data = await res.json();
      if (data.success && data.quote && onQuoteSaved) {
        onQuoteSaved(data.quote);
      }
    } catch (err) {
      console.error('Save lab quote error:', err);
    }
  };

  useEffect(() => {
    const checkSavedQuotes = async () => {
      try {
        const quotesRef = collection(db, 'daily_digest_quotes');
        const q = query(quotesRef, where('fetchDate', '==', todayStr));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.source?.includes('AZQuotes')) {
              setAzState(prev => ({
                ...prev,
                isSaved: true,
                quoteText: (data.text && data.text !== 'Quote of the Day') ? data.text : prev.quoteText,
                author: (data.author && data.author !== 'AZQuotes') ? data.author : prev.author
              }));
            }
            if (data.source?.includes('BrainyQuote')) {
              setBqState(prev => ({
                ...prev,
                isSaved: true,
                quoteText: (data.text && data.text !== "Today's Quote") ? data.text : prev.quoteText,
                author: (data.author && data.author !== 'BrainyQuote') ? data.author : prev.author
              }));
            }
          });
        }
      } catch (err) {
        console.error('Error checking saved external quotes:', err);
      }
    };

    checkSavedQuotes();
  }, [todayStr]);

  // Helper to ensure quote text is fresh from iframe before taking an action
  const getLatestQuote = (
    state: SourceBoxState,
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    siteName: string
  ): ExtractedQuote => {
    if (state.quoteText && state.quoteText !== 'Quote of the Day' && state.quoteText !== "Today's Quote") {
      return { text: state.quoteText, author: state.author };
    }
    if (iframeRef.current) {
      const fresh = extractQuoteFromIframe(iframeRef.current, siteName);
      if (fresh) return fresh;
    }
    return { text: state.quoteText, author: state.author };
  };

  // Handle Copy
  const handleCopy = (
    state: SourceBoxState,
    setState: React.Dispatch<React.SetStateAction<SourceBoxState>>,
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    siteName: string
  ) => {
    const q = getLatestQuote(state, iframeRef, siteName);
    const textToCopy = q.text
      ? `"${q.text}" — ${q.author} (${siteName})`
      : `Check out today's Quote of the Day on ${siteName}: ${siteName === 'AZQuotes' ? 'https://www.azquotes.com/quote_of_the_day.html' : 'https://www.brainyquote.com/quote_of_the_day'}`;

    navigator.clipboard.writeText(textToCopy);
    setState(prev => ({ ...prev, isCopied: true, quoteText: q.text || prev.quoteText, author: q.author || prev.author }));
    setTimeout(() => {
      setState(prev => ({ ...prev, isCopied: false }));
    }, 2000);
  };

  // Handle Text to Speech (TTS)
  const handleSpeak = (
    state: SourceBoxState,
    setState: React.Dispatch<React.SetStateAction<SourceBoxState>>,
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    siteName: string
  ) => {
    if (!('speechSynthesis' in window)) return;

    if (state.isSpeaking) {
      window.speechSynthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
      return;
    }

    window.speechSynthesis.cancel();

    const q = getLatestQuote(state, iframeRef, siteName);
    if (q.text && q.text !== state.quoteText) {
      setState(prev => ({ ...prev, quoteText: q.text, author: q.author }));
    }

    const textToRead = q.text
      ? `"${q.text}". By ${q.author}.`
      : `Daily quote from ${siteName}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };
    utterance.onerror = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    setState(prev => ({ ...prev, isSpeaking: true }));
    window.speechSynthesis.speak(utterance);
  };

  // Handle Save to Firestore Database
  const handleSaveToDatabase = async (
    state: SourceBoxState,
    setState: React.Dispatch<React.SetStateAction<SourceBoxState>>,
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    siteName: string
  ) => {
    const q = getLatestQuote(state, iframeRef, siteName);
    const textToSave = q.text || `${siteName} Quote of the Day (${todayStr})`;
    const authorToSave = q.author || siteName;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      const docId = `${siteName.toLowerCase()}_quote_${todayStr.replace(/-/g, '')}`;
      const quoteRef = doc(db, 'daily_digest_quotes', docId);

      const newQuoteObj = {
        id: docId,
        text: textToSave,
        author: authorToSave,
        source: `${siteName} — Quote of the Day`,
        fetchDate: todayStr,
        order: Date.now(),
        createdAt: new Date().toISOString(),
        likes: [],
        likesCount: 0
      };

      await setDoc(quoteRef, newQuoteObj, { merge: true });

      setState(prev => ({
        ...prev,
        isSaved: true,
        isSaving: false,
        quoteText: textToSave,
        author: authorToSave
      }));

      if (onQuoteSaved) {
        onQuoteSaved(newQuoteObj);
      }
    } catch (err) {
      console.error(`Error saving ${siteName} quote to database:`, err);
      setState(prev => ({ ...prev, isSaving: false }));
    }
  };

  return (
    <div className={cn(
      "mt-10 pt-8 border-t space-y-6 text-left transition-all",
      isDarkMode ? "border-zinc-800/80" : "border-zinc-200"
    )}>
      {/* FRESH QUOTE ENGINE LABS (MANUS ALTERNATIVE TEST SUITE) */}
      <div className={cn(
        "p-6 rounded-3xl border transition-all space-y-5 relative overflow-hidden",
        isDarkMode ? "bg-zinc-900/60 border-emerald-500/30" : "bg-white border-emerald-200 shadow-md"
      )}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 border-zinc-800/20 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn("text-sm font-black uppercase tracking-wider", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                  Fresh Quote Engine Labs (Manus AI Alternatives)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Automation Suite
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Compare 3 distinct automated quote methods to eliminate reliance on external Manus AI.
              </p>
            </div>
          </div>

          <button
            onClick={() => runLabMethod('benchmark')}
            disabled={labLoadingMethod !== null}
            className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {labLoadingMethod === 'benchmark' ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
            ) : (
              <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
            )}
            <span>Run 3-Way Method Benchmark</span>
          </button>
        </div>

        {/* Method Trigger Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => runLabMethod(1)}
            disabled={labLoadingMethod !== null}
            className={cn(
              "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group",
              isDarkMode ? "bg-zinc-800/40 border-zinc-700/60 hover:border-emerald-500/50" : "bg-zinc-50 border-zinc-200 hover:border-emerald-500"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Method 1
              </span>
              {labLoadingMethod === 1 && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
            </div>
            <p className={cn("text-xs font-bold", isDarkMode ? "text-zinc-200" : "text-zinc-800")}>AI Generation Engine</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Claude & Gemini Fallback Prompts</p>
          </button>

          <button
            onClick={() => runLabMethod(2)}
            disabled={labLoadingMethod !== null}
            className={cn(
              "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group",
              isDarkMode ? "bg-zinc-800/40 border-zinc-700/60 hover:border-blue-500/50" : "bg-zinc-50 border-zinc-200 hover:border-blue-500"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Method 2
              </span>
              {labLoadingMethod === 2 && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
            </div>
            <p className={cn("text-xs font-bold", isDarkMode ? "text-zinc-200" : "text-zinc-800")}>Live Web Scraping & APIs</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">ZenQuotes / Quotable REST Feeds</p>
          </button>

          <button
            onClick={() => runLabMethod(3)}
            disabled={labLoadingMethod !== null}
            className={cn(
              "p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group",
              isDarkMode ? "bg-zinc-800/40 border-zinc-700/60 hover:border-purple-500/50" : "bg-zinc-50 border-zinc-200 hover:border-purple-500"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Method 3
              </span>
              {labLoadingMethod === 3 && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />}
            </div>
            <p className={cn("text-xs font-bold", isDarkMode ? "text-zinc-200" : "text-zinc-800")}>Multi-Source Vault</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Historical Wisdom Dumps & Feeds</p>
          </button>
        </div>

        {/* Benchmark Results Metrics */}
        {benchmarkSummary && (
          <div className={cn(
            "p-4 rounded-2xl border space-y-2 animate-fadeIn",
            isDarkMode ? "bg-zinc-950/80 border-emerald-500/30" : "bg-emerald-50/50 border-emerald-200"
          )}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Benchmark Latency & Status
              </p>
              <span className="text-[10px] text-zinc-500 font-mono">Parallel Execution Completed</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {Object.entries(benchmarkSummary).map(([key, item]: [string, any]) => (
                <div key={key} className={cn("p-2.5 rounded-xl border text-xs", isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200")}>
                  <p className="font-bold text-[11px] text-zinc-400 uppercase">{item.method?.split(':')[0] || key}</p>
                  <p className="text-sm font-black text-emerald-400 mt-0.5">{item.executionMs} ms</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{item.count} quotes • {item.success ? "Status: OK" : "Failed"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {labError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            Error: {labError}
          </div>
        )}

        {/* Generated Quotes List */}
        {labQuotes.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Generated / Scraped Quotes ({labQuotes.length})
              </p>
              <button onClick={() => setLabQuotes([])} className="text-[10px] text-zinc-500 hover:text-zinc-300">
                Clear Test List
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {labQuotes.map((q, idx) => {
                const isSaved = !!savedLabQuoteIds[q.id];
                return (
                  <div
                    key={q.id || idx}
                    className={cn(
                      "p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all",
                      isDarkMode ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700" : "bg-zinc-50 border-zinc-200 shadow-sm"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {q.source || "Lab Output"}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {q.category}
                        </span>
                      </div>
                      <p className={cn("text-xs font-serif italic leading-relaxed", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>
                        "{q.text}"
                      </p>
                      <p className="text-[10px] font-bold text-emerald-400 mt-2">— {q.author}</p>
                    </div>

                    <button
                      onClick={() => handleSaveLabQuote(q)}
                      disabled={isSaved}
                      className={cn(
                        "w-full py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95",
                        isSaved
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm"
                      )}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Saved to Daily Digest DB</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 stroke-[3]" />
                          <span>Save to Daily Digest DB</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Section Header with Trophy Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm shrink-0">
            <Trophy className="w-5 h-5 fill-amber-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "text-xs font-black uppercase tracking-[0.2em]",
                isDarkMode ? "text-zinc-200" : "text-zinc-800"
              )}>
                Featured Daily Sources (AZQuotes & BrainyQuote)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5 fill-amber-500" />
                Featured
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Live daily quotes with copy, speech synthesizer & 1-click database sync
            </p>
          </div>
        </div>
      </div>

      {/* Widget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* 1. AZQuotes Widget Box */}
        <div className={cn(
          "p-5 rounded-3xl border relative overflow-hidden transition-all duration-300 flex flex-col justify-between group",
          isDarkMode
            ? "bg-zinc-900/40 border-zinc-800/70 hover:border-amber-500/30 hover:bg-zinc-900/60"
            : "bg-white border-zinc-200 shadow-sm hover:border-amber-500/30 hover:shadow-md"
        )}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-zinc-800/10 dark:border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Trophy className="w-3.5 h-3.5 fill-amber-500/30" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-amber-500">
                  AZQuotes — Daily Quote
                </span>
              </div>
              <a
                href="https://www.azquotes.com/quote_of_the_day.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-zinc-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
              >
                AZQuotes.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Widget Container */}
            <ScriptWidget
              scriptUrl="https://www.azquotes.com/widgets/link/qu_c_t.js"
              moreUrl="https://www.azquotes.com/quote_of_the_day.html"
              siteName="AZQuotes"
              isDarkMode={isDarkMode}
              iframeRef={azIframeRef}
              onQuoteExtracted={(q) => {
                setAzState(prev => ({
                  ...prev,
                  quoteText: q.text,
                  author: q.author
                }));
              }}
            />
          </div>

          {/* Micro Action Icons Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-zinc-800/10 dark:border-zinc-800/50">
            <div className="flex items-center gap-1.5">
              {/* Copy Icon Button */}
              <button
                onClick={() => handleCopy(azState, setAzState, azIframeRef, 'AZQuotes')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                  isDarkMode ? "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                )}
                title="Copy quote text to clipboard"
              >
                {azState.isCopied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{azState.isCopied ? "Copied" : "Copy"}</span>
              </button>

              {/* Text to Speech (TTS) Icon Button */}
              <button
                onClick={() => handleSpeak(azState, setAzState, azIframeRef, 'AZQuotes')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                  azState.isSpeaking
                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                    : (isDarkMode ? "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700")
                )}
                title="Listen to quote audio"
              >
                {azState.isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>{azState.isSpeaking ? "Stop" : "Listen"}</span>
              </button>
            </div>

            {/* Save to Database Icon Button */}
            <button
              onClick={() => handleSaveToDatabase(azState, setAzState, azIframeRef, 'AZQuotes')}
              disabled={azState.isSaving}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                azState.isSaved
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-500/10"
              )}
              title="Save this quote to WiseFit Daily Digest Database"
            >
              {azState.isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : azState.isSaved ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>{azState.isSaved ? "Saved to DB" : "Save to DB"}</span>
            </button>
          </div>
        </div>

        {/* 2. BrainyQuote Widget Box */}
        <div className={cn(
          "p-5 rounded-3xl border relative overflow-hidden transition-all duration-300 flex flex-col justify-between group",
          isDarkMode
            ? "bg-zinc-900/40 border-zinc-800/70 hover:border-amber-500/30 hover:bg-zinc-900/60"
            : "bg-white border-zinc-200 shadow-sm hover:border-amber-500/30 hover:shadow-md"
        )}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-zinc-800/10 dark:border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Trophy className="w-3.5 h-3.5 fill-amber-500/30" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase text-amber-500">
                  BrainyQuote — Daily Quote
                </span>
              </div>
              <a
                href="https://www.brainyquote.com/quote_of_the_day"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-zinc-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
              >
                BrainyQuote.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Widget Container */}
            <ScriptWidget
              scriptUrl="https://www.brainyquote.com/link/quotebr.js"
              moreUrl="https://www.brainyquote.com/quote_of_the_day"
              siteName="BrainyQuote"
              isDarkMode={isDarkMode}
              iframeRef={bqIframeRef}
              onQuoteExtracted={(q) => {
                setBqState(prev => ({
                  ...prev,
                  quoteText: q.text,
                  author: q.author
                }));
              }}
            />
          </div>

          {/* Micro Action Icons Toolbar */}
          <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-zinc-800/10 dark:border-zinc-800/50">
            <div className="flex items-center gap-1.5">
              {/* Copy Icon Button */}
              <button
                onClick={() => handleCopy(bqState, setBqState, bqIframeRef, 'BrainyQuote')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                  isDarkMode ? "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                )}
                title="Copy quote text to clipboard"
              >
                {bqState.isCopied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{bqState.isCopied ? "Copied" : "Copy"}</span>
              </button>

              {/* Text to Speech (TTS) Icon Button */}
              <button
                onClick={() => handleSpeak(bqState, setBqState, bqIframeRef, 'BrainyQuote')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                  bqState.isSpeaking
                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                    : (isDarkMode ? "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700")
                )}
                title="Listen to quote audio"
              >
                {bqState.isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                <span>{bqState.isSpeaking ? "Stop" : "Listen"}</span>
              </button>
            </div>

            {/* Save to Database Icon Button */}
            <button
              onClick={() => handleSaveToDatabase(bqState, setBqState, bqIframeRef, 'BrainyQuote')}
              disabled={bqState.isSaving}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
                bqState.isSaved
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-md shadow-emerald-500/10"
              )}
              title="Save this quote to WiseFit Daily Digest Database"
            >
              {bqState.isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : bqState.isSaved ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>{bqState.isSaved ? "Saved to DB" : "Save to DB"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
