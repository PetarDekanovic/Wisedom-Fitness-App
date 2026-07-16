import React, { useState } from 'react';
import { CheckCircle2, Copy, Sparkles, Heart } from 'lucide-react';

interface DigestQuoteCardProps {
  quote: {
    id?: string;
    text: string;
    author: string;
    likes?: string[];
    likesCount?: number;
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

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
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
        isDarkMode 
          ? "bg-zinc-900/40 border-zinc-800/60 hover:border-emerald-500/30 hover:bg-zinc-900/70" 
          : "bg-white border-zinc-200 shadow-sm hover:border-emerald-500/30 hover:shadow-md"
      )}
    >
      <span className="absolute -top-6 -left-3 text-[140px] leading-none text-emerald-500/[0.03] select-none font-serif font-black">“</span>
      <div className="relative z-10 space-y-4">
        <p className={cn(
          "text-sm md:text-base font-medium leading-relaxed italic pr-4",
          isDarkMode ? "text-zinc-100" : "text-zinc-800"
        )}>
          {quote.text}
        </p>
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-right text-emerald-400">
          — {quote.author}
        </p>
      </div>

      {/* Micro Actions */}
      <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-zinc-800/10 dark:border-zinc-800/50 z-10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all",
              isDarkMode ? "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
            )}
          >
            {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? "Copied" : "Copy"}
          </button>

          <button
            onClick={handleLikeClick}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95",
              isLiked 
                ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" 
                : (isDarkMode ? "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700")
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Stoic AI Mentor
        </button>
      </div>
    </div>
  );
};
