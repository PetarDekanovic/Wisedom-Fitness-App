import React from 'react';

export type MascotMood = 'happy' | 'studying' | 'cheering' | 'zen' | 'victory';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

/**
 * Bao Bao the Panda Scholar (熊猫学者 🐼)
 * High-quality, delightful cartoon vector mascot for Chinese language learning.
 */
export const PandaScholarAvatar: React.FC<MascotProps> = ({
  mood = 'happy',
  size = 64,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-md select-none transition-transform hover:scale-105 ${className}`}
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="pandaFur" x1="60" y1="20" x2="60" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E2E8F0" />
        </linearGradient>
        <linearGradient id="pandaHat" x1="60" y1="5" x2="60" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DC2626" />
          <stop offset="1" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="goldTrim" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FBBF24" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="bambooGreen" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <filter id="softGaze" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Black Ears */}
      <circle cx="28" cy="35" r="16" fill="#18181B" />
      <circle cx="28" cy="35" r="9" fill="#27272A" />
      <circle cx="92" cy="35" r="16" fill="#18181B" />
      <circle cx="92" cy="35" r="9" fill="#27272A" />

      {/* Head Base */}
      <ellipse cx="60" cy="62" rx="42" ry="38" fill="url(#pandaFur)" filter="url(#softGaze)" />

      {/* Traditional Scholar Hat (Zhuangyuan Hat) */}
      <path
        d="M32 30 C32 18, 88 18, 88 30 C88 34, 32 34, 32 30 Z"
        fill="url(#pandaHat)"
        stroke="url(#goldTrim)"
        strokeWidth="2.5"
      />
      <rect x="52" y="10" width="16" height="15" rx="3" fill="url(#pandaHat)" stroke="url(#goldTrim)" strokeWidth="2" />
      {/* Hat Top Golden Bead */}
      <circle cx="60" cy="8" r="4.5" fill="url(#goldTrim)" />
      {/* Scholar Ribbons */}
      <path d="M36 28 Q20 32 16 48" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M84 28 Q100 32 104 48" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Characteristic Black Eye Patches */}
      <ellipse cx="42" cy="60" rx="13" ry="15" fill="#18181B" transform="rotate(-15 42 60)" />
      <ellipse cx="78" cy="60" rx="13" ry="15" fill="#18181B" transform="rotate(15 78 60)" />

      {/* Eyes depending on Mood */}
      {mood === 'zen' ? (
        <>
          {/* Peaceful closed curved eyes */}
          <path d="M36 60 Q42 65 48 60" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M72 60 Q78 65 84 60" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : mood === 'cheering' || mood === 'victory' ? (
        <>
          {/* Joyful arched ^ ^ eyes */}
          <path d="M35 63 Q42 54 49 63" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M71 63 Q78 54 85 63" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Sparkles near eyes */}
          <circle cx="28" cy="52" r="2" fill="#FBBF24" />
          <circle cx="92" cy="52" r="2" fill="#FBBF24" />
        </>
      ) : (
        <>
          {/* Big cute sparkling anime eyes */}
          <circle cx="43" cy="59" r="6.5" fill="#FFFFFF" />
          <circle cx="44" cy="59" r="4.5" fill="#09090B" />
          <circle cx="45" cy="57" r="2" fill="#FFFFFF" />
          <circle cx="42" cy="61" r="1" fill="#FFFFFF" />

          <circle cx="77" cy="59" r="6.5" fill="#FFFFFF" />
          <circle cx="76" cy="59" r="4.5" fill="#09090B" />
          <circle cx="75" cy="57" r="2" fill="#FFFFFF" />
          <circle cx="78" cy="61" r="1" fill="#FFFFFF" />
        </>
      )}

      {/* Rosy Cheeks */}
      <ellipse cx="30" cy="70" rx="7" ry="4.5" fill="#FDA4AF" opacity="0.6" />
      <ellipse cx="90" cy="70" rx="7" ry="4.5" fill="#FDA4AF" opacity="0.6" />

      {/* Cute Black Snout & Nose */}
      <ellipse cx="60" cy="68" rx="8" ry="5.5" fill="#FFFFFF" />
      <path d="M56 66 C56 64, 64 64, 64 66 C64 69, 56 69, 56 66 Z" fill="#18181B" />
      
      {/* Mouth */}
      {mood === 'cheering' || mood === 'victory' ? (
        // Open wide happy mouth
        <path d="M53 72 Q60 84 67 72 Z" fill="#E11D48" stroke="#18181B" strokeWidth="1.5" />
      ) : (
        // Gentle warm smile
        <path d="M55 71 Q60 76 65 71" stroke="#18181B" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}

      {/* Accessories depending on mood */}
      {mood === 'studying' && (
        // Cute Hanzi Scroll in hands
        <g transform="translate(35, 82)">
          <rect x="0" y="0" width="50" height="18" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
          <line x1="8" y1="6" x2="42" y2="6" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="12" x2="34" y2="12" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
          <text x="38" y="14" fontSize="8" fill="#DC2626" fontWeight="bold">文</text>
        </g>
      )}

      {mood === 'zen' && (
        // Bamboo Leaf in corner
        <g transform="translate(18, 78) rotate(-25)">
          <path d="M0 0 Q12 -6 24 0 Q12 6 0 0" fill="url(#bambooGreen)" />
        </g>
      )}

      {mood === 'victory' && (
        // Gold Star Badge
        <g transform="translate(50, 84)">
          <polygon points="10,0 13,7 20,7 15,12 17,19 10,15 3,19 5,12 0,7 7,7" fill="url(#goldTrim)" />
        </g>
      )}
    </svg>
  );
};

/**
 * Long Long the Little Auspicious Dragon (小金龙 🐲)
 * Vibrant Chinese cartoon dragon with cute eyes and glowing pearl.
 */
export const LittleDragonMascot: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-md select-none transition-transform hover:scale-105 ${className}`}
    >
      <defs>
        <linearGradient id="dragonRed" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id="dragonGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#EAB308" />
        </linearGradient>
        <linearGradient id="cloudWhite" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E0F2FE" />
        </linearGradient>
      </defs>

      {/* Auspicious Soft Clouds in Background */}
      <path
        d="M20 95 C14 95, 10 90, 14 85 C14 78, 24 75, 28 80 C32 75, 44 75, 46 82 C50 82, 54 88, 50 95 Z"
        fill="url(#cloudWhite)"
        opacity="0.8"
      />
      <path
        d="M75 100 C70 100, 68 95, 72 90 C72 84, 82 82, 85 86 C89 82, 99 82, 101 88 C105 88, 108 94, 103 100 Z"
        fill="url(#cloudWhite)"
        opacity="0.8"
      />

      {/* Dragon Antlers / Horns */}
      <path d="M42 32 C38 18, 30 14, 25 18 C28 24, 34 26, 38 36" fill="url(#dragonGold)" stroke="#CA8A04" strokeWidth="1.5" />
      <path d="M78 32 C82 18, 90 14, 95 18 C92 24, 86 26, 82 36" fill="url(#dragonGold)" stroke="#CA8A04" strokeWidth="1.5" />

      {/* Dragon Head */}
      <ellipse cx="60" cy="58" rx="36" ry="32" fill="url(#dragonRed)" />

      {/* Dragon Snout / Muzzle */}
      <ellipse cx="60" cy="72" rx="24" ry="16" fill="#F87171" />
      <circle cx="53" cy="68" r="3" fill="#991B1B" />
      <circle cx="67" cy="68" r="3" fill="#991B1B" />

      {/* Big Kawaii Eyes */}
      <circle cx="44" cy="52" r="9" fill="#FFFFFF" />
      <circle cx="44" cy="52" r="6" fill="#18181B" />
      <circle cx="42" cy="50" r="2.5" fill="#FFFFFF" />
      <circle cx="46" cy="54" r="1.5" fill="#FFFFFF" />

      <circle cx="76" cy="52" r="9" fill="#FFFFFF" />
      <circle cx="76" cy="52" r="6" fill="#18181B" />
      <circle cx="74" cy="50" r="2.5" fill="#FFFFFF" />
      <circle cx="78" cy="54" r="1.5" fill="#FFFFFF" />

      {/* Dragon Whiskers */}
      <path d="M40 70 Q20 72 15 85" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M80 70 Q100 72 105 85" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Cute Fang Smile */}
      <path d="M52 78 Q60 84 68 78" stroke="#7F1D1D" strokeWidth="2" strokeLinecap="round" fill="none" />
      <polygon points="56,78 58,82 60,78" fill="#FFFFFF" />
      <polygon points="60,78 62,82 64,78" fill="#FFFFFF" />

      {/* Glowing Pearl of Wisdom */}
      <circle cx="60" cy="100" r="12" fill="url(#dragonGold)" />
      <circle cx="57" cy="97" r="4" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
};

/**
 * Cartoon Red & Gold Pagoda Temple (古寺 🏯)
 */
export const PagodaTempleIllustration: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = ''
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="pagRoof" x1="50" y1="10" x2="50" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DC2626" />
          <stop offset="1" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="pagGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Pagoda Finial */}
      <path d="M50 5 L50 18" stroke="url(#pagGold)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="8" r="3" fill="url(#pagGold)" />

      {/* Top Roof Level */}
      <path d="M35 28 C42 22, 58 22, 65 28 C74 30, 72 26, 68 22 C55 18, 45 18, 32 22 C28 26, 26 30, 35 28 Z" fill="url(#pagRoof)" />
      <rect x="42" y="28" width="16" height="12" rx="2" fill="#FEF3C7" stroke="#D97706" />
      <rect x="47" y="32" width="6" height="8" rx="1" fill="#DC2626" />

      {/* Middle Roof Level */}
      <path d="M25 46 C35 38, 65 38, 75 46 C86 49, 83 43, 78 37 C60 30, 40 30, 22 37 C17 43, 14 49, 25 46 Z" fill="url(#pagRoof)" />
      <rect x="36" y="46" width="28" height="16" rx="2" fill="#FEF3C7" stroke="#D97706" />
      <rect x="44" y="52" width="12" height="10" rx="1" fill="#DC2626" />

      {/* Bottom Main Roof Level */}
      <path d="M12 68 C28 58, 72 58, 88 68 C98 71, 95 64, 88 56 C68 46, 32 46, 12 56 C5 64, 2 71, 12 68 Z" fill="url(#pagRoof)" />
      {/* Red Pillars Base */}
      <rect x="28" y="68" width="44" height="24" rx="3" fill="#DC2626" />
      <rect x="42" y="72" width="16" height="20" rx="2" fill="#FEF3C7" />
      {/* Stone Foundation */}
      <rect x="20" y="90" width="60" height="8" rx="2" fill="#64748B" />
      {/* Hanging Gold Lanterns */}
      <circle cx="16" cy="74" r="3" fill="url(#pagGold)" />
      <circle cx="84" cy="74" r="3" fill="url(#pagGold)" />
    </svg>
  );
};

/**
 * Cartoon Bamboo & Green Teacup (竹林香茗 🎋🍵)
 */
export const TeaBambooIllustration: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = ''
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bambooGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#4ADE80" />
          <stop offset="1" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="teaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#86EFAC" />
          <stop offset="1" stopColor="#22C55E" />
        </linearGradient>
      </defs>
      {/* Bamboo Stalks */}
      <rect x="20" y="15" width="8" height="22" rx="3" fill="url(#bambooGrad)" />
      <rect x="20" y="40" width="8" height="22" rx="3" fill="url(#bambooGrad)" />
      <rect x="20" y="65" width="8" height="24" rx="3" fill="url(#bambooGrad)" />
      {/* Bamboo Node Rings */}
      <ellipse cx="24" cy="38" rx="5" ry="2" fill="#14532D" />
      <ellipse cx="24" cy="63" rx="5" ry="2" fill="#14532D" />
      {/* Bamboo Leaves */}
      <path d="M28 22 C38 18, 48 24, 52 20 C46 26, 38 28, 28 26 Z" fill="#22C55E" />
      <path d="M28 45 C40 40, 52 48, 56 42 C48 50, 38 52, 28 49 Z" fill="#22C55E" />

      {/* Cute Steaming Ceramic Teacup */}
      <ellipse cx="65" cy="85" rx="22" ry="5" fill="#0F172A" opacity="0.3" />
      <path d="M46 58 C46 78, 84 78, 84 58 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
      <ellipse cx="65" cy="58" rx="19" ry="6" fill="url(#teaGrad)" />
      {/* Teacup Face (Kawaii Eyes) */}
      <circle cx="60" cy="68" r="2" fill="#1E293B" />
      <circle cx="70" cy="68" r="2" fill="#1E293B" />
      <path d="M63 71 Q65 74 67 71" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Aromatic Steam Spirals */}
      <path d="M58 50 Q63 42 58 34" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
      <path d="M67 48 Q72 40 67 32" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
    </svg>
  );
};

/**
 * Cartoon Tai Chi Lotus Flower (太极莲花 🪷)
 */
export const LotusIllustration: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = ''
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="lotusPink" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      {/* Water Ripple Base */}
      <ellipse cx="50" cy="82" rx="36" ry="8" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      <ellipse cx="50" cy="82" rx="20" ry="4" stroke="#38BDF8" strokeWidth="1.5" fill="none" />

      {/* Lotus Outer Petals */}
      <path d="M22 72 C18 52, 38 42, 50 62 C38 68, 28 72, 22 72 Z" fill="#F472B6" opacity="0.85" />
      <path d="M78 72 C82 52, 62 42, 50 62 C62 68, 72 72, 78 72 Z" fill="#F472B6" opacity="0.85" />

      {/* Lotus Mid Petals */}
      <path d="M30 68 C28 42, 45 32, 50 54 C42 62, 34 66, 30 68 Z" fill="#EC4899" />
      <path d="M70 68 C72 42, 55 32, 50 54 C58 62, 66 66, 70 68 Z" fill="#EC4899" />

      {/* Lotus Center Crown Petal */}
      <path d="M50 25 C42 38, 44 65, 50 72 C56 65, 58 38, 50 25 Z" fill="url(#lotusPink)" />

      {/* Golden Seed Heart */}
      <circle cx="50" cy="62" r="5" fill="#FBBF24" />
      {/* Sparkles */}
      <circle cx="50" cy="20" r="2" fill="#FDE047" />
      <circle cx="34" cy="30" r="1.5" fill="#FDE047" />
      <circle cx="66" cy="30" r="1.5" fill="#FDE047" />
    </svg>
  );
};

/**
 * Authentic Cartoon Playing Card Back (Golden Dragon Crest 🎴)
 * Used in Memory Match and 3D card deck styling.
 */
export const CartoonCardBack: React.FC<{ size?: number; className?: string }> = ({
  size = 72,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none drop-shadow-md ${className}`}
    >
      <defs>
        <linearGradient id="cardRedBg" x1="0" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#991B1B" />
          <stop offset="0.5" stopColor="#7F1D1D" />
          <stop offset="1" stopColor="#450A0A" />
        </linearGradient>
        <linearGradient id="goldBorder" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FDE047" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Card Body */}
      <rect x="2" y="2" width="96" height="116" rx="14" fill="url(#cardRedBg)" stroke="url(#goldBorder)" strokeWidth="3" />
      
      {/* Inner Inset Gold Border */}
      <rect x="8" y="8" width="84" height="104" rx="10" stroke="url(#goldBorder)" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />

      {/* Traditional Auspicious Corners */}
      <circle cx="14" cy="14" r="3" fill="url(#goldBorder)" />
      <circle cx="86" cy="14" r="3" fill="url(#goldBorder)" />
      <circle cx="14" cy="106" r="3" fill="url(#goldBorder)" />
      <circle cx="86" cy="106" r="3" fill="url(#goldBorder)" />

      {/* Central Dragon Medallion */}
      <circle cx="50" cy="60" r="24" fill="#B91C1C" stroke="url(#goldBorder)" strokeWidth="2.5" />
      
      {/* Golden Hanzi Character "智" (Wisdom) or "福" (Fortune) */}
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontSize="22"
        fontFamily="sans-serif"
        fontWeight="900"
        fill="url(#goldBorder)"
      >
        智
      </text>

      {/* Auspicious Cloud Arches */}
      <path d="M30 30 Q50 20 70 30" stroke="url(#goldBorder)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M30 90 Q50 100 70 90" stroke="url(#goldBorder)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
};

/**
 * Cartoon Victory Celebration Banner (Panda Bao Bao + Trophy 🏆)
 */
export const CartoonVictoryIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}>
      <div className="relative">
        {/* Confetti & Golden Sparkles */}
        <div className="absolute -top-4 -left-6 text-2xl animate-spin" style={{ animationDuration: '6s' }}>✨</div>
        <div className="absolute -top-6 right-0 text-2xl animate-bounce">🎊</div>
        <div className="absolute bottom-2 -right-6 text-2xl animate-pulse">🏮</div>
        <div className="absolute bottom-2 -left-6 text-2xl animate-pulse">🎋</div>

        {/* Mascot Center with Big Gold Trophy */}
        <div className="flex items-center justify-center gap-2">
          <PandaScholarAvatar mood="victory" size={96} />
          
          <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg animate-bounce">
            <defs>
              <linearGradient id="trophyGold" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#FDE047" />
                <stop offset="0.6" stopColor="#EAB308" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
            </defs>
            {/* Cup Handles */}
            <path d="M22 25 C10 25, 10 50, 26 55" stroke="url(#trophyGold)" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M78 25 C90 25, 90 50, 74 55" stroke="url(#trophyGold)" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Cup Bowl */}
            <path d="M25 18 L75 18 L68 62 C65 72, 35 72, 32 62 Z" fill="url(#trophyGold)" />
            {/* Stem & Base */}
            <rect x="44" y="68" width="12" height="15" fill="url(#trophyGold)" />
            <rect x="30" y="83" width="40" height="10" rx="3" fill="#78350F" />
            {/* Red Star on Cup */}
            <polygon points="50,30 53,38 62,38 55,44 58,52 50,47 42,52 45,44 38,38 47,38" fill="#DC2626" />
          </svg>
        </div>
      </div>
    </div>
  );
};
