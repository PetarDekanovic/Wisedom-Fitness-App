import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { History, Play, ShieldAlert, BookOpen } from 'lucide-react';
import { VideoHistoryItem } from '../types';
import { cn } from '../lib/utils';

interface HistoryFeedProps {
  isDarkMode: boolean;
  items: VideoHistoryItem[];
}

export const HistoryFeed: React.FC<HistoryFeedProps> = ({ isDarkMode, items }) => {
  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-center gap-3 px-2">
        <History className="w-6 h-6 text-emerald-500" />
        <h2 className="text-2xl font-bold tracking-tight">Ancient Records</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <VideoCard key={item.id} item={item} isDarkMode={isDarkMode} index={index} />
        ))}
      </div>

      {items.length === 0 && (
        <div className={cn(
          "flex flex-col items-center justify-center p-12 rounded-[40px] border border-dashed",
          isDarkMode ? "border-zinc-800 text-zinc-500" : "border-zinc-200 text-zinc-400"
        )}>
          <BookOpen className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">No records found in the current era.</p>
        </div>
      )}
    </div>
  );
};

interface VideoCardProps {
  item: VideoHistoryItem;
  isDarkMode: boolean;
  index: number;
}

const VideoCard: React.FC<VideoCardProps> = ({ item, isDarkMode, index }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setHasStarted(true);
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getEmbedUrl = () => {
    if (item.type === 'youtube') {
      return `https://www.youtube.com/embed/${item.videoId}?autoplay=1&mute=1&loop=1&playlist=${item.videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1`;
    } else {
      // TikTok Embed URL
      return `https://www.tiktok.com/embed/v2/${item.videoId}?autoplay=1&loop=1&music_info=0&description=0&rel=0&native_controls=0`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      ref={containerRef}
      className={cn(
        "relative rounded-[32px] overflow-hidden aspect-[9/16] w-full border group",
        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200 shadow-lg shadow-zinc-200/50"
      )}
    >
      {/* Category Tag */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
          {item.category}
        </span>
      </div>

      {/* Info Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-30 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
        <h3 className="text-white font-bold text-xl leading-tight mb-1 drop-shadow-lg">
          {item.title}
        </h3>
        <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
          {item.type === 'youtube' ? 'YouTube Archive' : 'TikTok Scroll'}
        </p>
      </div>

      {/* Video Iframe */}
      {hasStarted && (
        <div className={cn(
          "w-full h-full transition-opacity duration-700",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <iframe
            className="w-full h-full scale-[1.02]"
            src={isVisible ? getEmbedUrl() : ''}
            allow="autoplay; encrypted-media"
            title={item.title}
            loading="lazy"
          />
        </div>
      )}

      {!isVisible && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center animate-pulse">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
        </div>
      )}

      {/* THE CLICK TRAP: Prevents redirect to TikTok/YouTube */}
      <div 
        className="absolute inset-0 z-20 cursor-default" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }} 
      />
    </motion.div>
  );
};
