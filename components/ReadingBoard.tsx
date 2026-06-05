'use client';

import React from 'react';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import { SpreadType } from '@/lib/spreads';
import TarotCard from './TarotCard';

interface ReadingBoardProps {
  cards: {
    card: TarotCardType;
    isReversed: boolean;
    isFlipped: boolean;
  }[];
  spreadType: SpreadType;
  onCardClick?: (index: number) => void;
  onInspectCard?: (card: TarotCardType) => void;
  onCardHover?: (index: number | null) => void;
  interactive?: boolean;
}

export default function ReadingBoard({
  cards,
  spreadType,
  onCardClick,
  onInspectCard,
  onCardHover,
  interactive = true,
}: ReadingBoardProps) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center select-none py-6">
      {spreadType.positions.map((pos, index) => {
        const item = cards[index];
        const isFlipped = item ? item.isFlipped : false;
        const isReversed = item ? item.isReversed : false;

        return (
          <div
            key={pos.id}
            className="flex flex-col items-center gap-3 w-full max-w-[200px]"
          >
            {/* Position Pill Label */}
            <div className="flex flex-col items-center text-center">
              <span className="px-3 py-1 text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest bg-gold-primary/10 border border-gold-primary/30 text-gold-light rounded-full shadow-[0_0_8px_rgba(244,162,97,0.1)]">
                {pos.nameVi}
              </span>
              <span className="text-[10px] font-lora text-text-secondary mt-1 max-w-[150px] leading-tight opacity-75 hidden sm:inline-block">
                {pos.descriptionVi}
              </span>
            </div>

            {/* Card Slot */}
            <div
              onMouseEnter={() => onCardHover && onCardHover(index)}
              onMouseLeave={() => onCardHover && onCardHover(null)}
              className="relative transform transition-all duration-300 hover:drop-shadow-[0_0_12px_var(--color-gold-glow)]"
            >
              {item ? (
                <TarotCard
                  card={item.card}
                  isFlipped={isFlipped}
                  isReversed={isReversed}
                  size="md"
                  interactive={interactive}
                  onClick={() => onCardClick && onCardClick(index)}
                />
              ) : (
                // Empty placeholder slot when card is not drawn yet to match TarotCard dimensions perfectly
                <div
                  onClick={() => onCardClick && onCardClick(index)}
                  className={`w-[130px] h-[225px] sm:w-[160px] sm:h-[277px] rounded-xl border-2 border-dashed border-gold-primary/20 bg-bg-surface/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-gold-primary/40 hover:bg-bg-surface/20 transition-all duration-350`}
                >
                  <span className="text-[10px] font-sans font-semibold text-text-secondary/50 uppercase tracking-widest">
                    Chưa Rút
                  </span>
                  <div className="w-8 h-8 rounded-full border border-dashed border-gold-primary/30 mt-3 flex items-center justify-center text-gold-primary/40 text-lg font-bold">
                    +
                  </div>
                </div>
              )}
            </div>

            {/* Flipped Card Label Info */}
            {item && isFlipped && (
              <div className="text-center flex flex-col gap-0.5 mt-1 animate-[fadeIn_0.3s_ease-out] items-center">
                <span className="text-[11px] font-sans font-extrabold text-gold-light tracking-wide">
                  {item.card.nameVi}
                </span>
                <span className="text-[9px] font-sans font-semibold text-gold-dark/90 uppercase tracking-widest">
                  {isReversed ? '↩ Ngược' : '✦ Xuôi'}
                </span>
                {onInspectCard && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectCard(item.card);
                    }}
                    className="px-2 py-0.5 mt-1 text-[9px] font-semibold bg-white/5 hover:bg-white/10 border border-gold-primary/20 hover:border-gold-light text-gold-light hover:text-white rounded transition-all cursor-pointer shadow-[0_0_5px_rgba(244,162,97,0.1)] flex items-center gap-0.5"
                  >
                    🔍 Chi tiết
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
