import React, { useEffect, useRef } from 'react';
import { Trophy, ExternalLink, Sparkles } from 'lucide-react';

interface ExternalQuoteSourcesProps {
  isDarkMode: boolean;
  cn: (...inputs: any[]) => string;
}

interface ScriptWidgetProps {
  scriptUrl: string;
  moreUrl: string;
  siteName: string;
  isDarkMode: boolean;
}

const ScriptWidget: React.FC<ScriptWidgetProps> = ({ scriptUrl, moreUrl, siteName, isDarkMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '150px';
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
              padding: 12px;
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
              margin-top: 10px;
              font-size: 11px;
              opacity: 0.8;
            }
            .bq_quote_body, .az_quote_body {
              font-style: italic;
              margin-bottom: 6px;
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

    try {
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    } catch (e) {
      console.error(`Error loading ${siteName} widget:`, e);
    }
  }, [scriptUrl, moreUrl, siteName, isDarkMode]);

  return <div ref={containerRef} className="w-full min-h-[150px]" />;
};

export const ExternalQuoteSources: React.FC<ExternalQuoteSourcesProps> = ({ isDarkMode, cn }) => {
  return (
    <div className={cn(
      "mt-10 pt-8 border-t space-y-6 text-left transition-all",
      isDarkMode ? "border-zinc-800/80" : "border-zinc-200"
    )}>
      {/* Section Header with Trophy Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm shrink-0">
            <Trophy className="w-5 h-5 fill-amber-500/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "text-xs font-black uppercase tracking-[0.2em]",
                isDarkMode ? "text-zinc-200" : "text-zinc-800"
              )}>
                Featured Quote Sources & External Widgets
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Official
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Live daily wisdom powered by AZQuotes and BrainyQuote external feeds
            </p>
          </div>
        </div>
      </div>

      {/* Widget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AZQuotes Widget Box */}
        <div className={cn(
          "p-5 rounded-3xl border relative overflow-hidden transition-all duration-300 flex flex-col justify-between",
          isDarkMode
            ? "bg-zinc-900/40 border-zinc-800/70 hover:border-amber-500/30"
            : "bg-white border-zinc-200 shadow-sm hover:border-amber-500/30"
        )}>
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-zinc-800/10 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold tracking-wider uppercase text-amber-500">
                AZQuotes — Quote of the Day
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

          <ScriptWidget
            scriptUrl="https://www.azquotes.com/widgets/link/qu_c_t.js"
            moreUrl="https://www.azquotes.com/quote_of_the_day.html"
            siteName="AZQuotes"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* BrainyQuote Widget Box */}
        <div className={cn(
          "p-5 rounded-3xl border relative overflow-hidden transition-all duration-300 flex flex-col justify-between",
          isDarkMode
            ? "bg-zinc-900/40 border-zinc-800/70 hover:border-amber-500/30"
            : "bg-white border-zinc-200 shadow-sm hover:border-amber-500/30"
        )}>
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-zinc-800/10 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
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

          <ScriptWidget
            scriptUrl="https://www.brainyquote.com/link/quotebr.js"
            moreUrl="https://www.brainyquote.com/quote_of_the_day"
            siteName="BrainyQuote"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
};
