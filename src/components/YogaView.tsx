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
  onMarkAsWise: (quote: any) => void;
  isSessionActive: boolean;
  setIsSessionActive: (active: boolean) => void;
}

export default function YogaView({ isDarkMode, onMarkAsWise, isSessionActive, setIsSessionActive }: YogaViewProps) {
  const [selectedFlow, setSelectedFlow] = useState<YogaFlow | null>(null);

  if (isSessionActive && selectedFlow) {
    return (
      <YogaSession 
        flow={selectedFlow} 
        isDarkMode={isDarkMode} 
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
          src="https://picsum.photos/seed/forest/1920/1080?blur=2" 
          alt="Nature Background" 
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isDarkMode ? "opacity-10" : "opacity-5"
          )}
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute inset-0",
          isDarkMode ? "bg-zinc-950/40" : "bg-white/40"
        )} />
      </div>

      <div className="relative z-10 space-y-8 pb-24">
        <header className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <Wind className="w-5 h-5 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Yoga Rituals</h1>
        </div>
        <p className={cn(
          "text-sm leading-relaxed",
          isDarkMode ? "text-zinc-400" : "text-zinc-500"
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
              isDarkMode 
                ? "bg-zinc-900/60 border-zinc-800/50 hover:bg-zinc-800/60" 
                : "bg-white border-zinc-200 shadow-sm hover:shadow-md"
            )}
          >
            <div className="absolute top-[-20px] right-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
              <Wind className="w-32 h-32 text-emerald-500" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{flow.name}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                      <Clock className="w-3 h-3" />
                      {Math.round(flow.poses.reduce((acc, p) => acc + p.duration, 0) / 60)} min
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <Sparkles className="w-3 h-3" />
                      {flow.poses.length} Poses
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "p-3 rounded-2xl transition-colors",
                  isDarkMode ? "bg-zinc-800 group-hover:bg-emerald-500 group-hover:text-zinc-950" : "bg-zinc-100 group-hover:bg-emerald-500 group-hover:text-white"
                )}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <p className={cn(
                "text-sm leading-relaxed line-clamp-2",
                isDarkMode ? "text-zinc-400" : "text-zinc-500"
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
                isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white"
              )}
            >
              <button 
                onClick={() => setSelectedFlow(null)}
                className="absolute top-6 right-6 p-2 rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{selectedFlow.name}</h2>
                <p className="text-sm text-zinc-500">{selectedFlow.description}</p>
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Sequence</h4>
                {selectedFlow.poses.map((pose, idx) => (
                  <div key={pose.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800/30 border border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-zinc-600">{(idx + 1).toString().padStart(2, '0')}</span>
                      <div>
                        <p className="text-sm font-bold">{pose.name}</p>
                        {pose.counterPose && (
                          <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">Counter: {pose.counterPose}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">{Math.floor(pose.duration / 60)}:{(pose.duration % 60).toString().padStart(2, '0')}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedFlow(null)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-all",
                    isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                  )}
                >
                  Back
                </button>
                <button
                  onClick={() => setIsSessionActive(true)}
                  className="flex-[2] py-4 bg-emerald-500 text-zinc-950 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
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
