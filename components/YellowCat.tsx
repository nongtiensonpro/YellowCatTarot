'use client';

import React from 'react';

export type YellowCatState = 'idle' | 'reading' | 'sleeping' | 'surprised' | 'happy' | 'shuffle';

interface YellowCatProps {
  state: YellowCatState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  speechBubble?: string;
  className?: string;
}

const sizeMap = {
  sm: 'w-[48px] h-[48px]',
  md: 'w-[120px] h-[120px]',
  lg: 'w-[180px] h-[180px]',
  hero: 'w-[260px] h-[260px] md:w-[320px] md:h-[320px]',
};

export default function YellowCat({
  state,
  size = 'md',
  speechBubble,
  className = '',
}: YellowCatProps) {
  const sizeClass = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none relative ${className}`}>
      
      {/* SVG ANIMATED CHARACTER */}
      <div className={`relative ${sizeClass} z-10 flex items-center justify-center`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
        >
          {/* BACKROUND SHADOW */}
          <ellipse cx="100" cy="180" rx="60" ry="10" fill="black" fillOpacity="0.25" />

          {/* SLEEPING STATE ZZZs */}
          {state === 'sleeping' && (
            <>
              <text x="145" y="65" fill="#ffd166" className="text-sm font-sans font-bold animate-[zzzFloat_4s_infinite] origin-center select-none">Z</text>
              <text x="160" y="45" fill="#ffd166" className="text-[10px] font-sans font-bold animate-[zzzFloat_4s_infinite_1.3s] origin-center select-none">z</text>
              <text x="135" y="35" fill="#ffd166" className="text-xs font-sans font-bold animate-[zzzFloat_4s_infinite_2.6s] origin-center select-none">z</text>
            </>
          )}

          {/* SURPRISED STATE EXCITEMENT MARKS */}
          {state === 'surprised' && (
            <>
              {/* Left earmark */}
              <path d="M40 30L30 20" stroke="#e76f51" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              {/* Right earmark */}
              <path d="M160 30L170 20" stroke="#e76f51" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
              {/* Alert mark on top */}
              <g className="animate-bounce">
                <rect x="97" y="10" width="6" height="15" rx="3" fill="#ffd166" />
                <circle cx="100" cy="32" r="3.5" fill="#ffd166" />
              </g>
            </>
          )}

          {/* HAPPY STATE SPARKLES */}
          {state === 'happy' && (
            <g className="animate-pulse">
              {/* Left sparkle */}
              <path d="M30 60L33 63L30 66L27 63Z" fill="#ffd166" />
              {/* Right sparkle */}
              <path d="M170 60L173 63L170 66L167 63Z" fill="#ffd166" />
              {/* Sparkle top */}
              <path d="M60 25L62 27L60 29L58 27Z" fill="#ffd166" />
              <path d="M140 25L142 27L140 29L138 27Z" fill="#ffd166" />
            </g>
          )}

          {/* CAT TAIL */}
          <path
            d={
              state === 'sleeping'
                ? "M60 160C45 160 40 150 45 142C50 134 65 140 70 148C75 156 70 160 60 160Z" // Curled tail for sleeping
                : "M60 165C40 165 30 140 35 110C37 100 45 102 43 112C40 132 46 153 58 153C62 153 62 165 60 165Z" // Long standing tail
            }
            fill="#f4a261"
            className={state === 'sleeping' ? '' : state === 'happy' ? 'animate-[tailWag_1.5s_infinite]' : 'animate-tail'}
          />

          {/* BODY */}
          <path
            d={
              state === 'sleeping'
                ? "M100 80C50 80 40 120 40 150C40 175 70 180 100 180C130 180 160 175 160 150C160 120 150 80 100 80Z" // Sleepy ball body
                : "M100 90C65 90 55 125 55 165C55 178 70 180 100 180C130 180 145 178 145 165C145 125 135 90 100 90Z" // Sitting body
            }
            fill="#f4a261"
          />
          {/* Chest belly hair */}
          <path
            d={
              state === 'sleeping'
                ? "M100 105C80 105 70 120 70 140C70 160 85 165 100 165C115 165 130 160 130 140C130 120 120 105 100 105Z"
                : "M100 115C85 115 75 130 75 155C75 170 85 172 100 172C115 172 125 170 125 155C125 130 115 115 100 115Z"
            }
            fill="#ffd166"
            fillOpacity="0.4"
          />

          {/* HEAD */}
          <path
            d={
              state === 'sleeping'
                ? "M100 95C65 95 60 115 60 135C60 155 78 160 100 160C122 160 140 155 140 135C140 115 135 95 100 95Z" // Sleeping head sits lower and flatter
                : "M100 50C65 50 60 70 60 90C60 110 78 118 100 118C122 118 140 110 140 90C140 70 135 50 100 50Z" // Normal head
            }
            fill="#ffd166"
          />

          {/* EARS */}
          {/* Left ear */}
          <path
            d={
              state === 'sleeping'
                ? "M62 105L45 115L62 125Z" // Flattened ears for sleeping
                : "M62 60L42 25L70 52Z" // Standing ears
            }
            fill="#f4a261"
            className={state === 'sleeping' ? '' : 'animate-ear'}
          />
          <path
            d={
              state === 'sleeping'
                ? "M60 109L49 116L60 122Z"
                : "M60 56L47 30L66 50Z"
            }
            fill="#e76f51"
            fillOpacity="0.6"
            className={state === 'sleeping' ? '' : 'animate-ear'}
          />

          {/* Right ear */}
          <path
            d={
              state === 'sleeping'
                ? "M138 105L155 115L138 125Z"
                : "M138 60L158 25L130 52Z"
            }
            fill="#f4a261"
            className={state === 'sleeping' ? '' : 'animate-ear'}
          />
          <path
            d={
              state === 'sleeping'
                ? "M140 109L151 116L140 122Z"
                : "M140 56L153 30L134 50Z"
            }
            fill="#e76f51"
            fillOpacity="0.6"
            className={state === 'sleeping' ? '' : 'animate-ear'}
          />

          {/* FACE ELEMENTS */}
          {/* EYES */}
          {state === 'sleeping' ? (
            // Curved closed eyes (sleeping)
            <>
              <path d="M78 122C81 125 85 125 88 122" stroke="#090916" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M112 122C115 125 119 125 122 122" stroke="#090916" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : state === 'happy' ? (
            // Curved squint happy eyes
            <>
              <path d="M74 88C78 84 84 84 88 88" stroke="#090916" strokeWidth="3" strokeLinecap="round" />
              <path d="M112 88C116 84 122 84 126 88" stroke="#090916" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            // Big open eyes
            <>
              {/* Left Eye */}
              <ellipse cx="80" cy="86" rx="10" ry={state === 'surprised' ? "10" : "8"} fill="#090916" className="animate-eye" />
              <ellipse cx="78" cy="83" rx="4" ry="4" fill="white" className="animate-eye" />
              <ellipse cx="82" cy="88" rx="2" ry="2" fill="white" className="animate-eye" />
              {/* Right Eye */}
              <ellipse cx="120" cy="86" rx="10" ry={state === 'surprised' ? "10" : "8"} fill="#090916" className="animate-eye" />
              <ellipse cx="118" cy="83" rx="4" ry="4" fill="white" className="animate-eye" />
              <ellipse cx="122" cy="88" rx="2" ry="2" fill="white" className="animate-eye" />
            </>
          )}

          {/* NOSE */}
          <polygon
            points={state === 'sleeping' ? "98,129 102,129 100,131" : "97,95 103,95 100,98"}
            fill="#e76f51"
          />

          {/* MOUTH */}
          <path
            d={
              state === 'sleeping'
                ? "M96 134C98 135 100 135 100 135C100 135 102 135 104 134" // Small flat line
                : state === 'surprised'
                ? "M96 102Q100 110 104 102" // Round open surprise mouth
                : "M94 102C96 104 98 104 100 102C102 104 104 104 106 102" // W-shaped cute cat mouth
            }
            stroke="#090916"
            strokeWidth="2"
            strokeLinecap="round"
            fill={state === 'surprised' ? '#e76f51' : 'none'}
          />

          {/* WHISKERS */}
          {/* Left Whiskers */}
          <path d={state === 'sleeping' ? "M55 132L35 134M55 137L32 141" : "M55 93L35 91M55 97L30 98M55 101L33 105"} stroke="#090916" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          {/* Right Whiskers */}
          <path d={state === 'sleeping' ? "M145 132L165 134M145 137L168 141" : "M145 93L165 91M145 97L170 98M145 101L167 105"} stroke="#090916" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

          {/* NECKLACE & MEDALLION */}
          {state !== 'sleeping' && (
            <g>
              {/* Red band */}
              <path d="M72 113C72 113 90 120 100 120C110 120 128 113 128 113" stroke="#e76f51" strokeWidth="4" strokeLinecap="round" />
              {/* Golden Crescent Moon Medal */}
              <circle cx="100" cy="123" r="7" fill="#ffd166" stroke="#f4a261" strokeWidth="1" className="animate-pulse" />
              <path d="M99 120C97 120 95 122 95 124C95 126 97 127 99 127C96 128 94 126 94 124C94 122 96 121 99 120Z" fill="#090916" />
            </g>
          )}

          {/* SHUFFLE STATE - HANDS & CARDS */}
          {state === 'shuffle' && (
            <g className="animate-bounce">
              {/* Left paw shuffling card */}
              <rect x="40" y="145" width="24" height="15" rx="3" fill="#f4a261" stroke="#090916" strokeWidth="1.5" />
              <path d="M44 140L30 152H40L50 140Z" fill="#ffd166" stroke="#f4a261" strokeWidth="1" />
              
              {/* Right paw shuffling card */}
              <rect x="136" y="145" width="24" height="15" rx="3" fill="#f4a261" stroke="#090916" strokeWidth="1.5" />
              <path d="M156 140L170 152H160L150 140Z" fill="#ffd166" stroke="#f4a261" strokeWidth="1" />

              {/* Magical sparkles */}
              <circle cx="100" cy="148" r="2" fill="#ffd166" className="animate-ping" />
            </g>
          )}

          {/* READING STATE - MAGICAL CRYSTAL BALL */}
          {state === 'reading' && (
            <g className="animate-pulse">
              {/* Crystal Ball stand */}
              <path d="M85 180H115L110 167H90Z" fill="#ffd166" stroke="#f4a261" strokeWidth="1.5" />
              
              {/* Glowing magic ball */}
              <circle cx="100" cy="158" r="22" fill="url(#crystal-gradient)" stroke="#ffd166" strokeWidth="1.5" className="animate-crystal" />
              {/* Glow highlight */}
              <circle cx="92" cy="149" r="6" fill="white" fillOpacity="0.4" />
            </g>
          )}
        </svg>
      </div>

      {/* Gradients defs */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <radialGradient id="crystal-gradient" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#b7d4e7" />
            <stop offset="50%" stopColor="#9b5de5" />
            <stop offset="100%" stopColor="#0d0d2b" />
          </radialGradient>
        </defs>
      </svg>

      {/* Speech bubble - now below, consistent with 3D wrapper */}
      {speechBubble && (
        <div className="relative max-w-[240px] md:max-w-[280px] mt-2 animate-[fadeIn_0.3s_ease-out] z-20">
          {/* Mũi nhọn chỉ lên phía mèo */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-surface border-l border-t border-gold-primary/30 rotate-45 z-10" />
          
          {/* Nội dung bong bóng */}
          <div className="bg-bg-surface border border-gold-primary/30 rounded-2xl px-4 py-2.5 shadow-2xl">
            <p className="text-xs md:text-sm font-lora text-text-primary text-center leading-relaxed">{speechBubble}</p>
          </div>
        </div>
      )}

    </div>
  );
}
