'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { readerAudio } from '@/lib/reader-audio';

interface ReaderFanDeckProps {
  remainingCount: number;
  onPickCard: (index: number) => void;
  disabled?: boolean;
  isMaxLimitReached?: boolean;
  onCreateNewDesk?: () => void;
}

function ReaderFanDeck({
  remainingCount,
  onPickCard,
  disabled = false,
  isMaxLimitReached = false,
  onCreateNewDesk,
}: ReaderFanDeckProps) {
  const shouldReduceMotion = useReducedMotion();

  // Render up to 26 visible fan cards for optimal visual density
  const visibleCardsCount = Math.min(26, remainingCount);

  // Dynamic fan angle spread calculation
  const fanStepAngle = visibleCardsCount > 18 ? 3.2 : visibleCardsCount > 10 ? 4.5 : 6;
  const totalFanAngle = (visibleCardsCount - 1) * fanStepAngle;
  const startAngle = -totalFanAngle / 2;

  if (remainingCount <= 0) {
    return null;
  }

  return (
    <div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-end justify-center select-none">
      {isMaxLimitReached && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#1c120a]/95 border border-[#d4af37] text-[#e6c594] text-xs font-sans font-bold shadow-2xl flex items-center gap-2 whitespace-nowrap animate-bounce z-50">
          <span>🔒 Đã đạt tối đa 13 lá bài cho bàn này</span>
          {onCreateNewDesk && (
            <button
              onClick={onCreateNewDesk}
              className="px-2.5 py-0.5 rounded-full bg-[#d4af37] text-[#1c120a] hover:bg-gold-light font-black text-[10px] uppercase transition-colors cursor-pointer"
            >
              ➕ Trải Bàn Mới
            </button>
          )}
        </div>
      )}

      <div className="relative w-[340px] sm:w-[540px] h-[160px] sm:h-[220px] flex items-end justify-center">
        {Array.from({ length: visibleCardsCount }).map((_, idx) => {
          const angle = startAngle + idx * fanStepAngle;
          const offsetFromCenter = Math.abs(idx - (visibleCardsCount - 1) / 2);
          const translateY = offsetFromCenter * offsetFromCenter * 0.8;

          return (
            <motion.button
              type="button"
              key={idx}
              initial={shouldReduceMotion ? false : { y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={shouldReduceMotion ? { duration: 0 } : { delay: idx * 0.012, duration: 0.3 }}
              style={{
                transformOrigin: '50% 320%',
                transform: `rotate(${angle}deg) translateY(${translateY}px)`,
              }}
              whileHover={shouldReduceMotion ? undefined : {
                y: -48,
                scale: 1.12,
                zIndex: 60,
                transition: { duration: 0.15 },
              }}
              onMouseEnter={() => readerAudio.playHover()}
              onClick={() => {
                if (disabled) return;
                readerAudio.playDeal();
                onPickCard(idx);
              }}
              aria-label={`Rút lá bài úp số ${idx + 1}`}
              className={`absolute bottom-0 w-[64px] sm:w-[92px] h-[110px] sm:h-[160px] rounded-lg shadow-[0_8px_20px_rgba(0,0,0,0.6)] cursor-pointer border border-[#d4af37]/40 bg-transparent p-0 transition-shadow ${
                disabled ? 'opacity-50 pointer-events-none' : 'hover:shadow-[0_0_25px_rgba(244,162,97,0.75)] hover:border-gold-light'
              }`}
            >
              {/* Card Back Design (Ghibli Aesthetic Pattern) */}
              <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#1b263b] via-[#0d1b2a] to-[#1b263b] p-1 flex flex-col items-center justify-between overflow-hidden">
                <div className="w-full h-full rounded border border-[#d4af37]/30 bg-radial from-[#1e3a5f]/40 to-transparent p-1.5 flex flex-col items-center justify-between">
                  <div className="w-full flex justify-between text-[8px] text-[#e6c594]/60">
                    <span>✦</span>
                    <span>✦</span>
                  </div>
                  
                  <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full border border-[#d4af37]/40 bg-[#0d1b2a] flex items-center justify-center text-[#e6c594] text-xs sm:text-base shadow-inner">
                    🏵️
                  </div>

                  <div className="w-full flex justify-between text-[8px] text-[#e6c594]/60">
                    <span>✦</span>
                    <span>✦</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(ReaderFanDeck);
