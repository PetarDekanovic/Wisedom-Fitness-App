import React, { useState } from 'react';
import { CheckCircle2, Copy, Sparkles, Heart } from 'lucide-react';

interface DigestQuoteCardProps {
  quote: {
    id?: string;
    text: string;
    author: string;
    likes?: string[];
    likesCount?: number;
    source?: string;
    isZenQuote?: boolean;
    category?: string;
  };
  idx: number;
  isDarkMode: boolean;
  onExpand: (quote: any) => void;
  cn: (...inputs: any[]) => string;
  currentUserId?: string;
  onLike: (quote: any) => void;
}

export const DigestQuoteCard: React.FC<DigestQuoteCardProps> = ({
  quote,
  idx,
  isDarkMode,
  onExpand,
  cn,
  currentUserId,
  onLike
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [localLiked, setLocalLiked] = useState(() => {
    if (!quote.id) return false;
    if (currentUserId) {
      return (quote.likes || []).includes(currentUserId);
    }
    return localStorage.getItem(`liked_digest_q_${quote.id}`) === 'true';
  });

  const isZenQuote = Boolean(
    quote.isZenQuote ||
    (quote.source && quote.source.toLowerCase().includes('zen')) ||
    quote.category === 'ZenQuotes'
  );

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}\n\n✨ WiseFit Digital Sanctuary #WiseFit`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(quote);
    if (!currentUserId && quote.id) {
      const key = `liked_digest_q_${quote.id}`;
      const currentlyLiked = localStorage.getItem(key) === 'true';
      if (currentlyLiked) {
        localStorage.removeItem(key);
        setLocalLiked(false);
      } else {
        localStorage.setItem(key, 'true');
        setLocalLiked(true);
      }
    }
  };

  const isLiked = currentUserId ? (quote.likes || []).includes(currentUserId) : localLiked;
  const likesCount = quote.likesCount ?? (quote.likes || []).length;

  return (
    <div
      className={cn(
        "p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group cursor-pointer",
        isZenQuote
          ? (isDarkMode 
              ? "bg-gradient-to-br from-purple-950/40 via-purple-900/25 to-zinc-900/80 border-purple-500/50 hover:border-purple-400 hover:bg-purple-900/40 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30" 
              : "bg-gradient-to-br from-purple-50/90 via-purple-100/40 to-white border-purple-300 hover:border-purple-500 hover:shadow-md hover:shadow-purple-100/80 ring-1 ring-purple-300/40")
          : (isDarkMode 
              ? "bg-zinc-900/40 border-zinc-800/60 hover:border-emerald-500/30 hover:bg-zinc-900/70" 
              : "bg-white border-zinc-200 shadow-sm hover:border-emerald-500/30 hover:shadow-md")
      )}
    >
      <span className={cn(
        "absolute -top-6 -left-3 text-[140px] leading-none select-none font-serif font-black",
        isZenQuote ? "text-purple-500/[0.08]" : "text-emerald-500/[0.03]"
      )}>“</span>

      <div className="relative z-10 space-y-4">
        {isZenQuote && (
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm border",
              isDarkMode 
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40" 
                : "bg-purple-100 text-purple-700 border-purple-300"
            )}>
              <Sparkles className="w-2.5 h-2.5 text-purple-400 fill-purple-400" /> ZenQuotes Live
            </span>
            <span className={cn(
              "text-[9px] font-mono font-bold uppercase tracking-wider",
              isDarkMode ? "text-purple-400/90" : "text-purple-600"
            )}>
              API Feed
            </span>
          </div>
        )}

        <p className={cn(
          "text-sm md:text-base font-medium leading-relaxed italic pr-4",
          isDarkMode ? "text-zinc-100" : "text-zinc-800"
        )}>
          {quote.text}
        </p>
        <p className={cn(
          "text-xs font-mono font-bold uppercase tracking-wider text-right",
          isZenQuote
            ? (isDarkMode ? "text-purple-400 font-extrabold" : "text-purple-700 font-extrabold")
            : "text-emerald-400"
        )}>
          — {quote.author}
        </p>
      </div>

      {/* Micro Actions */}
      <div className={cn(
        "flex items-center justify-between gap-2 mt-6 pt-4 border-t z-10",
        isZenQuote
          ? (isDarkMode ? "border-purple-500/20" : "border-purple-200")
          : "border-zinc-800/10 dark:border-zinc-800/50"
      )}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all",
              isZenQuote
                ? (isDarkMode ? "bg-purple-900/50 hover:bg-purple-800/60 text-purple-200" : "bg-purple-100/80 hover:bg-purple-200 text-purple-800")
                : (isDarkMode ? "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700")
            )}
          >
            {isCopied ? <CheckCircle2 className={cn("w-3.5 h-3.5", isZenQuote ? "text-purple-400" : "text-emerald-400")} /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={handleLikeClick}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
              isLiked 
                ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" 
                : (isZenQuote
                    ? (isDarkMode ? "bg-purple-900/50 hover:bg-purple-800/60 text-purple-200" : "bg-purple-100/80 hover:bg-purple-200 text-purple-800")
                    : (isDarkMode ? "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"))
            )}
            title={isLiked ? "Unlike quote" : "Like quote"}
          >
            <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-rose-500 text-rose-500")} />
            <span>{likesCount}</span>
          </button>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand(quote);
          }}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 shadow-md",
            isZenQuote
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
              : "bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-emerald-500/10"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Stoic AI Mentor
        </button>
      </div>
    </div>
  );
};
