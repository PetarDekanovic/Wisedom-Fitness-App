import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Play, 
  ChevronRight, 
  Clock, 
  Info,
  ArrowLeft,
  Sparkles,
  Volume2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { YogaFlow } from '../types';
import { YOGA_FLOWS } from '../data/yogaFlows';
import YogaSession from './YogaSession';

interface YogaViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  onMarkAsWise: (quote: any) => void;
  isSessionActive: boolean;
  setIsSessionActive: (active: boolean) => void;
}

export default function YogaView({ isDarkMode, isGirlyMode, onMarkAsWise, isSessionActive, setIsSessionActive }: YogaViewProps) {
  const [selectedFlow, setSelectedFlow] = useState<YogaFlow | null>(null);

  if (isSessionActive && selectedFlow) {
    return (
      <YogaSession 
        flow={selectedFlow} 
        isDarkMode={isDarkMode} 
        isGirlyMode={isGirlyMode}
        onClose={() => setIsSessionActive(false)}
        onMarkAsWise={onMarkAsWise}
      />
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Nature Background for Yoga Section */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src={isGirlyMode ? "https://images.unsplash.com/photo-1490750967868-8864d9519360?auto=format&fit=crop&q=80&w=1080" : "https://picsum.photos/seed/vibrant_nature/1920/1080?blur=1"} 
          alt="Nature Background" 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isGirlyMode ? "opacity-30 saturate-150 sepia-25 hue-rotate-15" :
            isDarkMode ? "opacity-20" : "opacity-15"
          )}
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute inset-0",
          isGirlyMode ? "bg-pink-50/20" : isDarkMode ? "bg-zinc-950/20" : "bg-white/20"
        )} />
      </div>

      <div className="relative z-10 space-y-8 pb-24">
        <header className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-xl",
            isGirlyMode ? "bg-pink-500/20" : "bg-emerald-500/20"
          )}>
            <Wind className={cn("w-5 h-5", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />
          </div>
          <h1 className={cn(
            "text-3xl font-bold tracking-tight",
            isGirlyMode ? "text-pink-950" : ""
          )}>Yoga Rituals</h1>
        </div>
        <p className={cn(
          "text-sm leading-relaxed",
          isGirlyMode ? "text-pink-600/80" : isDarkMode ? "text-zinc-400" : "text-zinc-500"
        )}>
          Integrate physical strength with mental stillness through curated Yin Yoga flows.
        </p>
      </header>

      <div className="grid gap-4">
        {YOGA_FLOWS.map((flow) => (
          <motion.div
            key={flow.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedFlow(flow)}
            className={cn(
              "p-6 rounded-3xl border cursor-pointer transition-all relative overflow-hidden group",
              isGirlyMode ? "bg-white/60 border-pink-100 shadow-sm hover:shadow-pink-500/10" :
              isDarkMode 
                ? "bg-zinc-900/60 border-zinc-800/50 hover:bg-zinc-800/60" 
                : "bg-white border-zinc-200 shadow-sm hover:shadow-md"
            )}
          >
            <div className="absolute top-[-20px] right-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
              <Wind className={cn("w-32 h-32", isGirlyMode ? "text-pink-500" : "text-emerald-500")} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className={cn("text-xl font-bold", isGirlyMode ? "text-pink-900" : "")}>{flow.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
                      isGirlyMode ? "text-pink-500" : "text-emerald-500"
                    )}>
                      <Clock className="w-3 h-3" />
                      {Math.round(flow.poses.reduce((acc, p) => acc + p.duration, 0) / 60)} min
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
                      isGirlyMode ? "text-pink-400" : "text-zinc-500"
                    )}>
                      <Sparkles className="w-3 h-3" />
                      {flow.poses.length} Poses
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "p-3 rounded-2xl transition-colors text-zinc-500",
                  isGirlyMode ? "bg-pink-50 group-hover:bg-pink-500 group-hover:text-white" :
                  isDarkMode ? "bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-zinc-950" : "bg-zinc-100 group-hover:bg-emerald-500 group-hover:text-white"
                )}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <p className={cn(
                "text-sm leading-relaxed line-clamp-2",
                isGirlyMode ? "text-pink-700/70" : isDarkMode ? "text-zinc-400" : "text-zinc-500"
              )}>
                {flow.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedFlow && !isSessionActive && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              className={cn(
                "w-full max-w-lg rounded-3xl p-8 space-y-6 relative overflow-hidden",
                isGirlyMode ? "bg-[#FFF5F7] border border-pink-100" :
                isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white"
              )}
            >
              <button 
                onClick={() => setSelectedFlow(null)}
                className={cn(
                  "absolute top-6 right-6 p-2 rounded-xl transition-colors",
                  isGirlyMode ? "hover:bg-pink-100/50 text-pink-400" : "hover:bg-zinc-800"
                )}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <h2 className={cn("text-2xl font-bold", isGirlyMode ? "text-pink-900" : "")}>{selectedFlow.name}</h2>
                <p className={cn("text-sm", isGirlyMode ? "text-pink-600/60" : "text-zinc-500")}>{selectedFlow.description}</p>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                <h4 className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.2em]",
                  isGirlyMode ? "text-pink-500" : "text-emerald-500"
                )}>Sequence</h4>
                {selectedFlow.poses.map((pose, idx) => (
                  <div 
                    key={pose.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all",
                      isGirlyMode ? "bg-white border-pink-50" : "bg-zinc-800/30 border-zinc-800/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-xs font-black",
                        isGirlyMode ? "text-pink-200" : "text-zinc-600"
                      )}>{(idx + 1).toString().padStart(2, '0')}</span>
                      <div>
                        <p className={cn("text-sm font-bold", isGirlyMode ? "text-pink-900" : "")}>{pose.name}</p>
                        {pose.counterPose && (
                          <p className={cn(
                            "text-[9px] uppercase tracking-tighter",
                            isGirlyMode ? "text-pink-400/60" : "text-zinc-500"
                          )}>Counter: {pose.counterPose}</p>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-mono",
                      isGirlyMode ? "text-pink-400" : "text-zinc-500"
                    )}>{Math.floor(pose.duration / 60)}:{(pose.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFlow(null)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-all",
                    isGirlyMode ? "bg-pink-100 text-pink-600 hover:bg-pink-200" :
                    isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  )}
                >
                  Back
                </button>
                <button
                  onClick={() => setIsSessionActive(true)}
                  className={cn(
                    "flex-[2] py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
                    isGirlyMode 
                      ? "bg-pink-500 text-white shadow-pink-500/20" 
                      : "bg-emerald-500 text-zinc-950 shadow-emerald-500/20"
                  )}
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Ritual
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
