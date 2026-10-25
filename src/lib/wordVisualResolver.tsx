import React, { useState } from 'react';
import {
  Heart,
  Brain,
  Flame,
  Sun,
  Moon,
  Wind,
  Mountain,
  Waves,
  Compass,
  BookOpen,
  Sparkles,
  Coffee,
  Utensils,
  Feather,
  Shield,
  Swords,
  Eye,
  Ear,
  Music,
  Globe,
  Trees,
  Flower2,
  CloudRain,
  Sunrise,
  Sunset,
  Scroll,
  Landmark,
  Trophy,
  Smile,
  Star,
  Anchor,
  Zap,
  Key,
  Crown,
  MessageCircle,
  User,
  Users,
  Handshake,
  Bird,
  Scale,
  Target,
  Lightbulb,
  Dumbbell,
  Timer,
  Leaf,
  Image as ImageIcon,
  ExternalLink,
  X
} from 'lucide-react';
import { 
  PagodaTempleIllustration, 
  TeaBambooIllustration, 
  LotusIllustration, 
  LittleDragonMascot,
  PandaScholarAvatar 
} from '../components/ChineseCartoonAssets';

/**
 * Curated, high-resolution photography assets for Chinese/Hebrew vocabulary concepts.
 * Verified, fast-loading Unsplash CDN images with optimized query parameters.
 */
export const CONCEPT_PHOTOS: Record<string, { url: string; title: string; photographer: string }> = {
  'heart': {
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=700&q=80',
    title: 'Serene Nature Light',
    photographer: 'Unsplash'
  },
  'wisdom': {
    url: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4e0ee?auto=format&fit=crop&w=700&q=80',
    title: 'Ancient Chinese Architecture & Reflection',
    photographer: 'Unsplash'
  },
  'philosophy': {
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80',
    title: 'Zen Meditation & Equilibrium',
    photographer: 'Unsplash'
  },
  'mind': {
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80',
    title: 'Stillness and Mindfulness',
    photographer: 'Unsplash'
  },
  'mountain': {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80',
    title: 'Misty Mountain Peaks',
    photographer: 'Unsplash'
  },
  'water': {
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=80',
    title: 'Tranquil Water Ripples',
    photographer: 'Unsplash'
  },
  'fire': {
    url: 'https://images.unsplash.com/photo-1496545672447-f699b503d270?auto=format&fit=crop&w=700&q=80',
    title: 'Warm Illuminating Flame',
    photographer: 'Unsplash'
  },
  'wind': {
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=700&q=80',
    title: 'Wind Across Sky and Clouds',
    photographer: 'Unsplash'
  },
  'sun': {
    url: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=700&q=80',
    title: 'Golden Sunrise',
    photographer: 'Unsplash'
  },
  'moon': {
    url: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=700&q=80',
    title: 'Luminous Moon over Night Sky',
    photographer: 'Unsplash'
  },
  'bamboo': {
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=700&q=80',
    title: 'Emerald Bamboo Forest',
    photographer: 'Unsplash'
  },
  'tea': {
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80',
    title: 'Traditional Chinese Tea Ceremony',
    photographer: 'Unsplash'
  },
  'temple': {
    url: 'https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?auto=format&fit=crop&w=700&q=80',
    title: 'Ancient Pagoda Sanctuary',
    photographer: 'Unsplash'
  },
  'peace': {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=700&q=80',
    title: 'Serene Natural Harmony',
    photographer: 'Unsplash'
  },
  'strength': {
    url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=700&q=80',
    title: 'Summit Elevation & Fortitude',
    photographer: 'Unsplash'
  },
  'friend': {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80',
    title: 'Friendship and Connection',
    photographer: 'Unsplash'
  },
  'light': {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80',
    title: 'Pure Radiance & Dawn',
    photographer: 'Unsplash'
  },
  'night': {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=700&q=80',
    title: 'Quiet Cosmic Night',
    photographer: 'Unsplash'
  },
  'travel': {
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=700&q=80',
    title: 'Winding Road of Discovery',
    photographer: 'Unsplash'
  },
  'book': {
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=700&q=80',
    title: 'Literature and Timeless Knowledge',
    photographer: 'Unsplash'
  }
};

/**
 * Returns a matching photograph URL for a vocabulary item using semantic matching.
 */
export function getVisualPhotoForWord(item: {
  char?: string;
  english?: string;
  translation?: string;
  category?: string;
}): { url: string; title: string; photographer: string } {
  const text = `${item.char || ''} ${item.english || ''} ${item.translation || ''} ${item.category || ''}`.toLowerCase();

  if (text.includes('srce') || text.includes('heart') || text.includes('ljubav') || text.includes('love') || text.includes('心')) {
    return CONCEPT_PHOTOS['heart'];
  }
  if (text.includes('mudrost') || text.includes('wisdom') || text.includes('智') || text.includes('filozof') || text.includes('sage')) {
    return CONCEPT_PHOTOS['wisdom'];
  }
  if (text.includes('planin') || text.includes('mountain') || text.includes('gora') || text.includes('peak') || text.includes('山')) {
    return CONCEPT_PHOTOS['mountain'];
  }
  if (text.includes('voda') || text.includes('water') || text.includes('reka') || text.includes('river') || text.includes('lake') || text.includes('水') || text.includes('氵')) {
    return CONCEPT_PHOTOS['water'];
  }
  if (text.includes('vatra') || text.includes('fire') || text.includes('flame') || text.includes('goreti') || text.includes('burn') || text.includes('火')) {
    return CONCEPT_PHOTOS['fire'];
  }
  if (text.includes('vetar') || text.includes('wind') || text.includes('breeze') || text.includes('feng') || text.includes('风')) {
    return CONCEPT_PHOTOS['wind'];
  }
  if (text.includes('sunce') || text.includes('sun') || text.includes('svetlost') || text.includes('light') || text.includes('dawn') || text.includes('日') || text.includes('光')) {
    return CONCEPT_PHOTOS['sun'];
  }
  if (text.includes('mesec') || text.includes('moon') || text.includes('noć') || text.includes('night') || text.includes('tam') || text.includes('dark') || text.includes('月') || text.includes('夜')) {
    return CONCEPT_PHOTOS['moon'];
  }
  if (text.includes('čaj') || text.includes('tea') || text.includes('bambus') || text.includes('bamboo') || text.includes('hrana') || text.includes('food') || text.includes('茶') || text.includes('竹')) {
    return CONCEPT_PHOTOS['tea'];
  }
  if (text.includes('hram') || text.includes('temple') || text.includes('pagoda') || text.includes('sanctuary') || text.includes('寺')) {
    return CONCEPT_PHOTOS['temple'];
  }
  if (text.includes('mir') || text.includes('peace') || text.includes('spokoj') || text.includes('calm') || text.includes('tranquil') || text.includes('安') || text.includes('平')) {
    return CONCEPT_PHOTOS['peace'];
  }
  if (text.includes('snaga') || text.includes('strength') || text.includes('power') || text.includes('sila') || text.includes('hrabrost') || text.includes('courage') || text.includes('力') || text.includes('勇')) {
    return CONCEPT_PHOTOS['strength'];
  }
  if (text.includes('prijatelj') || text.includes('friend') || text.includes('brat') || text.includes('brother') || text.includes('zajedno') || text.includes('together') || text.includes('友') || text.includes('朋')) {
    return CONCEPT_PHOTOS['friend'];
  }
  if (text.includes('knjig') || text.includes('book') || text.includes('uciti') || text.includes('learn') || text.includes('stud') || text.includes('pismo') || text.includes('文') || text.includes('书')) {
    return CONCEPT_PHOTOS['book'];
  }
  if (text.includes('put') || text.includes('journey') || text.includes('travel') || text.includes('dao') || text.includes('staza') || text.includes('道')) {
    return CONCEPT_PHOTOS['travel'];
  }

  return CONCEPT_PHOTOS['wisdom'];
}

/**
 * Maps word concepts to a fallback Vector SVG icon when NO emoji is available
 * or when an emoji is unsupported/broken (□).
 */
export function getVectorIconForWord(props: {
  char?: string;
  english?: string;
  translation?: string;
  category?: string;
  size?: number;
}): {
  iconNode: React.ReactNode;
  gradientClass: string;
  accentColor: string;
  label: string;
} {
  const { char = '', english = '', translation = '', category = '', size = 32 } = props;
  const text = `${char} ${english} ${translation} ${category}`.toLowerCase();

  // 1. Heart / Mind / Love / Emotions
  if (text.includes('heart') || text.includes('srce') || text.includes('love') || text.includes('ljubav') || text.includes('心') || text.includes('爱')) {
    return {
      iconNode: <Heart className="drop-shadow-md text-rose-400 fill-rose-500/20" size={size} />,
      gradientClass: 'from-rose-500/20 via-pink-500/10 to-red-500/20 border-rose-500/40 text-rose-400',
      accentColor: '#F43F5E',
      label: 'Srce & Osećanja'
    };
  }

  // 2. Wisdom / Mind / Intellect
  if (text.includes('wisdom') || text.includes('mudrost') || text.includes('mind') || text.includes('um') || text.includes('brain') || text.includes('智') || text.includes('慧')) {
    return {
      iconNode: <Brain className="drop-shadow-md text-amber-300" size={size} />,
      gradientClass: 'from-amber-500/20 via-yellow-500/10 to-amber-600/20 border-amber-500/40 text-amber-300',
      accentColor: '#F59E0B',
      label: 'Mudrost & Intelekt'
    };
  }

  // 3. Fire / Flame / Energy
  if (text.includes('fire') || text.includes('vatra') || text.includes('flame') || text.includes('burn') || text.includes('goret') || text.includes('huo') || text.includes('火') || text.includes('燃')) {
    return {
      iconNode: <Flame className="drop-shadow-md text-orange-400 fill-orange-500/30" size={size} />,
      gradientClass: 'from-orange-500/25 via-amber-500/15 to-red-600/25 border-orange-500/40 text-orange-400',
      accentColor: '#F97316',
      label: 'Vatra & Energija'
    };
  }

  // 4. Mountain / Earth / Stability
  if (text.includes('mountain') || text.includes('planin') || text.includes('peak') || text.includes('vis') || text.includes('shan') || text.includes('山') || text.includes('土')) {
    return {
      iconNode: <Mountain className="drop-shadow-md text-emerald-300" size={size} />,
      gradientClass: 'from-emerald-500/20 via-teal-500/10 to-slate-600/20 border-emerald-500/40 text-emerald-300',
      accentColor: '#10B981',
      label: 'Planina & Postojanost'
    };
  }

  // 5. Water / River / Rain / Fluidity
  if (text.includes('water') || text.includes('voda') || text.includes('river') || text.includes('reka') || text.includes('sea') || text.includes('more') || text.includes('shui') || text.includes('水') || text.includes('氵') || text.includes('海')) {
    return {
      iconNode: <Waves className="drop-shadow-md text-cyan-400" size={size} />,
      gradientClass: 'from-cyan-500/20 via-blue-500/10 to-teal-500/20 border-cyan-500/40 text-cyan-400',
      accentColor: '#06B6D4',
      label: 'Voda & Tok'
    };
  }

  // 6. Sun / Light / Dawn
  if (text.includes('sun') || text.includes('sunce') || text.includes('light') || text.includes('svetlost') || text.includes('dawn') || text.includes('jasn') || text.includes('ri') || text.includes('日') || text.includes('阳') || text.includes('光') || text.includes('明')) {
    return {
      iconNode: <Sunrise className="drop-shadow-md text-amber-400" size={size} />,
      gradientClass: 'from-amber-400/25 via-yellow-500/15 to-orange-500/20 border-amber-400/50 text-amber-300',
      accentColor: '#FBBF24',
      label: 'Sunce & Svetlost'
    };
  }

  // 7. Moon / Night / Stillness
  if (text.includes('moon') || text.includes('mesec') || text.includes('night') || text.includes('noć') || text.includes('tam') || text.includes('yue') || text.includes('月') || text.includes('夜') || text.includes('静')) {
    return {
      iconNode: <Moon className="drop-shadow-md text-indigo-300 fill-indigo-400/20" size={size} />,
      gradientClass: 'from-indigo-500/20 via-blue-600/10 to-purple-600/20 border-indigo-500/40 text-indigo-300',
      accentColor: '#818CF8',
      label: 'Mesec & Tišina'
    };
  }

  // 8. Wind / Sky / Freedom
  if (text.includes('wind') || text.includes('vetar') || text.includes('breeze') || text.includes('feng') || text.includes('风')) {
    return {
      iconNode: <Wind className="drop-shadow-md text-teal-300" size={size} />,
      gradientClass: 'from-teal-500/20 via-emerald-500/10 to-cyan-500/20 border-teal-500/40 text-teal-300',
      accentColor: '#2DD4BF',
      label: 'Vetar & Sloboda'
    };
  }

  // 9. Tea / Bamboo / Food / Nourishment
  if (text.includes('tea') || text.includes('čaj') || text.includes('bamboo') || text.includes('bambus') || text.includes('food') || text.includes('hrana') || text.includes('piti') || text.includes('drink') || text.includes('茶') || text.includes('竹')) {
    return {
      iconNode: <Coffee className="drop-shadow-md text-emerald-400" size={size} />,
      gradientClass: 'from-emerald-500/25 via-green-600/15 to-teal-600/25 border-emerald-500/40 text-emerald-300',
      accentColor: '#10B981',
      label: 'Čaj & Priroda'
    };
  }

  // 10. Peace / Dove / Serenity
  if (text.includes('peace') || text.includes('mir') || text.includes('spokoj') || text.includes('harmony') || text.includes('shalom') || text.includes('ping') || text.includes('平') || text.includes('安')) {
    return {
      iconNode: <Bird className="drop-shadow-md text-sky-300" size={size} />,
      gradientClass: 'from-sky-500/20 via-blue-500/10 to-indigo-500/20 border-sky-400/40 text-sky-300',
      accentColor: '#38BDF8',
      label: 'Mir & Spokoj'
    };
  }

  // 11. Strength / Power / Warrior / Shield
  if (text.includes('strength') || text.includes('snaga') || text.includes('power') || text.includes('courage') || text.includes('hrabrost') || text.includes('li') || text.includes('力') || text.includes('勇')) {
    return {
      iconNode: <Shield className="drop-shadow-md text-red-400" size={size} />,
      gradientClass: 'from-red-500/25 via-rose-600/15 to-amber-600/25 border-red-500/40 text-red-400',
      accentColor: '#EF4444',
      label: 'Snaga & Hrabrost'
    };
  }

  // 12. Friendship / Person / Solidarity
  if (text.includes('friend') || text.includes('prijatelj') || text.includes('brother') || text.includes('brat') || text.includes('you') || text.includes('ti') || text.includes('ren') || text.includes('人') || text.includes('亻') || text.includes('朋') || text.includes('友') || text.includes('你')) {
    return {
      iconNode: <Handshake className="drop-shadow-md text-blue-400" size={size} />,
      gradientClass: 'from-blue-500/20 via-indigo-500/10 to-cyan-500/20 border-blue-500/40 text-blue-400',
      accentColor: '#3B82F6',
      label: 'Prijateljstvo & Čovek'
    };
  }

  // 13. Temple / Pagoda / Cultural Landmark
  if (text.includes('temple') || text.includes('hram') || text.includes('pagoda') || text.includes('sanctuary') || text.includes('si') || text.includes('寺')) {
    return {
      iconNode: <Landmark className="drop-shadow-md text-amber-400" size={size} />,
      gradientClass: 'from-amber-600/20 via-red-600/10 to-yellow-600/20 border-amber-500/40 text-amber-300',
      accentColor: '#D97706',
      label: 'Hram & Nasleđe'
    };
  }

  // 14. Book / Scroll / Learning
  if (text.includes('book') || text.includes('knjig') || text.includes('learn') || text.includes('učit') || text.includes('scroll') || text.includes('pismo') || text.includes('文') || text.includes('书')) {
    return {
      iconNode: <Scroll className="drop-shadow-md text-amber-300" size={size} />,
      gradientClass: 'from-amber-500/20 via-orange-500/10 to-yellow-500/20 border-amber-500/40 text-amber-300',
      accentColor: '#F59E0B',
      label: 'Znanje & Spisi'
    };
  }

  // 15. Truth / Justice / Scales
  if (text.includes('truth') || text.includes('istina') || text.includes('justice') || text.includes('pravda') || text.includes('zhen') || text.includes('真') || text.includes('emet')) {
    return {
      iconNode: <Scale className="drop-shadow-md text-cyan-300" size={size} />,
      gradientClass: 'from-cyan-500/25 via-blue-500/15 to-indigo-500/25 border-cyan-400/50 text-cyan-300',
      accentColor: '#06B6D4',
      label: 'Istina & Pravda'
    };
  }

  // 16. Compass / Direction / Journey / Dao
  if (text.includes('road') || text.includes('put') || text.includes('direction') || text.includes('smer') || text.includes('dao') || text.includes('way') || text.includes('道')) {
    return {
      iconNode: <Compass className="drop-shadow-md text-emerald-400" size={size} />,
      gradientClass: 'from-emerald-500/20 via-teal-500/10 to-blue-500/20 border-emerald-500/40 text-emerald-400',
      accentColor: '#10B981',
      label: 'Put & Orijentacija'
    };
  }

  // 17. Time / Season / Cycles
  if (text.includes('time') || text.includes('vreme') || text.includes('season') || text.includes('sat') || text.includes('uvek') || text.includes('always') || text.includes('shi') || text.includes('时')) {
    return {
      iconNode: <Timer className="drop-shadow-md text-violet-300" size={size} />,
      gradientClass: 'from-violet-500/20 via-purple-500/10 to-indigo-500/20 border-violet-500/40 text-violet-300',
      accentColor: '#8B5CF6',
      label: 'Vreme & Ciklusi'
    };
  }

  // 18. Default Sparkles Icon
  return {
    iconNode: <Sparkles className="drop-shadow-md text-amber-400 animate-pulse" size={size} />,
    gradientClass: 'from-amber-500/20 via-red-500/10 to-yellow-500/20 border-amber-500/30 text-amber-300',
    accentColor: '#F59E0B',
    label: 'Znak & Značenje'
  };
}

export interface WordVisualBadgeProps {
  char: string;
  english?: string;
  translation?: string;
  category?: string;
  emoji?: string;
  size?: number;
  className?: string;
}

/**
 * WordVisualBadge:
 * Displays the word's emoji directly (as requested by user).
 * ONLY if there is NO emoji (or if emoji is empty or a broken tofu box '□')
 * does it fall back to an elegant, high-contrast SVG icon.
 * Ensures exactly ONE clean icon/visual per word with zero duplicates.
 */
export const WordVisualBadge: React.FC<WordVisualBadgeProps> = ({
  char,
  english,
  translation,
  category,
  emoji,
  size = 32,
  className = ''
}) => {
  // Check if emoji is valid, non-empty, and not a broken unicode tofu box
  const hasValidEmoji = Boolean(
    emoji && 
    typeof emoji === 'string' && 
    emoji.trim() !== '' && 
    emoji !== '□' && 
    emoji !== '' &&
    emoji !== 'undefined' &&
    emoji !== 'null'
  );

  // If emoji is present, display it directly (native, vibrant, and clean)
  if (hasValidEmoji) {
    return (
      <span
        className={`inline-flex items-center justify-center filter drop-shadow-sm select-none leading-none ${className}`}
        style={{ fontSize: size }}
        title={translation || english || char}
      >
        {emoji}
      </span>
    );
  }

  // Fallback: When there is NO emoji, render an SVG icon matching the word's concept
  const vector = getVectorIconForWord({ char, english, translation, category, size });
  return (
    <span
      className={`inline-flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-br ${vector.gradientClass} border shadow-sm select-none shrink-0 ${className}`}
      style={{ width: size + 10, height: size + 10 }}
      title={`${vector.label} (${char})`}
    >
      {vector.iconNode}
    </span>
  );
};
