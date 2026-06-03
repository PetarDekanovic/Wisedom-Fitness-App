import React, { useState } from 'react';
import { CheckCircle2, Copy, Sparkles } from 'lucide-react';

interface DigestQuoteCardProps {
  quote: {
    id?: string;
    text: string;
    author: string;
  };
  idx: number;
  isDarkMode: boolean;
  onExpand: (quote: any) => void;
  cn: (...inputs: any[]) => string;
}

export const DigestQuoteCard: React.FC<DigestQuoteCardProps> = ({
  quote,
  idx,
  isDarkMode,
  onExpand,
  cn
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group",
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
          onClick={() => onExpand(quote)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-zinc-950 transition-all shadow-md shadow-emerald-500/10 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Stoic AI Mentor
        </button>
      </div>
    </div>
  );
};
