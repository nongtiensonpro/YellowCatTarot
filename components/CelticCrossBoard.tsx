'use client';

import React from 'react';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import { spreadTypes } from '@/lib/spreads';
import TarotCard from './TarotCard';

interface CelticCrossBoardProps {
  cards: {
    card: TarotCardType;
    isReversed: boolean;
    isFlipped: boolean;
  }[];
  onCardClick?: (index: number) => void;
  onInspectCard?: (card: TarotCardType) => void;
  interactive?: boolean;
}

export default function CelticCrossBoard({
  cards,
  onCardClick,
  onInspectCard,
  interactive = true,
}: CelticCrossBoardProps) {
  const spreadType = spreadTypes['celtic-cross'];

  // Helper to render card slot
  const renderCardSlot = (index: number, size: 'sm' | 'md' | 'lg' = 'md', extraClasses: string = '') => {
    const pos = spreadType.positions[index];
    const item = cards[index];
    const isFlipped = item ? item.isFlipped : false;
    const isReversed = item ? item.isReversed : false;

    // Card sizes mapped to widths/heights for placeholders to match TarotCard dimensions perfectly
    const sizeClasses = {
      sm: 'w-[100px] h-[173px] sm:w-[120px] sm:h-[208px] rounded-lg',
      md: 'w-[130px] h-[225px] sm:w-[160px] sm:h-[277px] rounded-xl',
      lg: 'w-[170px] h-[295px] sm:w-[220px] sm:h-[381px] rounded-2xl',
    };

    return (
      <div className={`flex flex-col items-center gap-2 w-full max-w-[190px] select-none ${extraClasses}`}>
        {/* Position label */}
        <div className="text-center flex flex-col items-center">
          <span className="px-2.5 py-0.5 text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-wider bg-gold-primary/10 border border-gold-primary/30 text-gold-light rounded-full shadow-[0_0_8px_rgba(244,162,97,0.1)]">
            Lá {index + 1}: {pos.nameVi}
          </span>
        </div>

        {/* Card wrapper */}
        <div className="relative transform transition-all duration-300 hover:drop-shadow-[0_0_12px_var(--color-gold-glow)]">
          {item ? (
            <TarotCard
              card={item.card}
              isFlipped={isFlipped}
              isReversed={isReversed}
              size={size} // 1-to-1 mapping to avoid size discrepancies and layout shifting
              interactive={interactive}
              onClick={() => onCardClick && onCardClick(index)}
            />
          ) : (
            // Placeholder slot
            <div
              onClick={() => onCardClick && onCardClick(index)}
              className={`${sizeClasses[size]} border-2 border-dashed border-gold-primary/20 bg-bg-surface/10 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-gold-primary/40 hover:bg-bg-surface/20 transition-all duration-300`}
            >
              <div className="w-6 h-6 rounded-full border border-dashed border-gold-primary/30 flex items-center justify-center text-gold-primary/40 text-sm font-bold">
                +
              </div>
            </div>
          )}
        </div>

        {/* Detailed inspect trigger */}
        {item && isFlipped && (
          <div className="text-center flex flex-col gap-0.5 mt-0.5 animate-[fadeIn_0.3s_ease-out] items-center">
            <span className="text-[10px] font-sans font-extrabold text-gold-light tracking-wide truncate max-w-[130px]">
              {item.card.nameVi}
            </span>
            <span className="text-[8px] font-sans font-semibold text-gold-dark/95 uppercase tracking-widest">
              {isReversed ? '↩ Ngược' : '✦ Xuôi'}
            </span>
            {onInspectCard && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectCard(item.card);
                }}
                className="px-1.5 py-0.5 mt-0.5 text-[8px] font-semibold bg-white/5 hover:bg-white/10 border border-gold-primary/20 hover:border-gold-light text-gold-light hover:text-white rounded transition-all cursor-pointer shadow-[0_0_5px_rgba(244,162,97,0.1)] flex items-center gap-0.5"
              >
                🔍 Xem nét
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Dedicated rendering for the central cross intersection (Card 1 and Card 2 stacked)
  const renderCentralCross = () => {
    const card1 = cards[0];
    const card2 = cards[1];
    const isFlipped1 = card1 ? card1.isFlipped : false;
    const isReversed1 = card1 ? card1.isReversed : false;
    const isFlipped2 = card2 ? card2.isFlipped : false;
    const isReversed2 = card2 ? card2.isReversed : false;

    return (
      <div className="flex flex-col items-center gap-2 w-full max-w-[220px] select-none">
        {/* Combined Position Label */}
        <div className="text-center flex flex-col items-center z-20">
          <span className="px-2.5 py-0.5 text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-wider bg-gold-primary/25 border border-gold-primary/45 text-gold-light rounded-full shadow-[0_0_10px_rgba(244,162,97,0.2)]">
            Tâm Điểm (Lá 1 & 2)
          </span>
        </div>

        {/* Overlapping Card Container */}
        <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] flex items-center justify-center">
          {/* Card 1: Present (Base Vertical Card) */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            {card1 ? (
              <TarotCard
                card={card1.card}
                isFlipped={isFlipped1}
                isReversed={isReversed1}
                size="md"
                interactive={interactive}
                onClick={() => onCardClick && onCardClick(0)}
              />
            ) : (
              <div
                onClick={() => onCardClick && onCardClick(0)}
                className="w-[130px] h-[225px] sm:w-[160px] sm:h-[277px] rounded-xl border-2 border-dashed border-gold-primary/20 bg-bg-surface/10 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-gold-primary/40 hover:bg-bg-surface/20 transition-all duration-300"
              >
                <span className="text-[8px] font-sans font-bold text-text-secondary/50 uppercase tracking-widest leading-none">Lá 1: Hiện tại</span>
                <div className="w-5 h-5 rounded-full border border-dashed border-gold-primary/30 mt-2 flex items-center justify-center text-gold-primary/40 text-xs font-bold">+</div>
              </div>
            )}
          </div>

          {/* Card 2: Obstacle (Overlapping Horizontal Card rotated 90 degrees) */}
          <div className="absolute z-10 w-[130px] h-[225px] sm:w-[160px] sm:h-[277px] flex items-center justify-center origin-center rotate-90 transform drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] hover:scale-105 transition-transform">
            {card2 ? (
              <TarotCard
                card={card2.card}
                isFlipped={isFlipped2}
                isReversed={isReversed2}
                size="md"
                interactive={interactive}
                onClick={() => onCardClick && onCardClick(1)}
              />
            ) : (
              <div
                onClick={() => onCardClick && onCardClick(1)}
                className="w-[130px] h-[225px] sm:w-[160px] sm:h-[277px] rounded-xl border-2 border-dashed border-gold-primary/35 bg-bg-surface/20 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-gold-primary/60 hover:bg-bg-surface/30 transition-all duration-300 backdrop-blur-2xs"
              >
                <span className="text-[8px] font-sans font-bold text-gold-light/60 uppercase tracking-widest leading-none -rotate-90">Lá 2: Cản trở</span>
                <div className="w-5 h-5 rounded-full border border-dashed border-gold-primary/40 mt-2 flex items-center justify-center text-gold-light/40 text-xs font-bold -rotate-90">+</div>
              </div>
            )}
          </div>
        </div>

        {/* Small quick inspect links */}
        <div className="flex gap-2.5 z-20 mt-1">
          {card1 && isFlipped1 && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-sans text-text-secondary">Lá 1: {card1.card.nameVi}</span>
              {onInspectCard && (
                <button
                  onClick={(e) => { e.stopPropagation(); onInspectCard(card1.card); }}
                  className="text-[8px] text-gold-light hover:text-white underline cursor-pointer mt-0.5"
                >
                  Ngắm 1
                </button>
              )}
            </div>
          )}
          {card2 && isFlipped2 && (
            <div className="flex flex-col items-center border-l border-white/10 pl-2.5">
              <span className="text-[9px] font-sans text-text-secondary">Lá 2: {card2.card.nameVi}</span>
              {onInspectCard && (
                <button
                  onClick={(e) => { e.stopPropagation(); onInspectCard(card2.card); }}
                  className="text-[8px] text-gold-light hover:text-white underline cursor-pointer mt-0.5"
                >
                  Ngắm 2
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-10 lg:gap-14 justify-center items-center lg:items-stretch py-8 select-none overflow-x-auto">
      
      {/* 1. MAGIC CROSS SHAPE (Left/Center grid) */}
      <div className="grid grid-cols-3 grid-rows-3 gap-y-4 sm:gap-y-8 gap-x-2 sm:gap-x-12 items-center justify-items-center w-full max-w-[620px] bg-bg-surface/5 border border-white/5 rounded-3xl p-3 sm:p-8 relative">
        {/* Glowing cross outline in Ghibli style */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[35%] border border-gold-primary/5 rounded-full blur-[10px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[90%] border border-gold-primary/5 rounded-full blur-[10px] pointer-events-none" />

        {/* Row 1 */}
        <div className="col-start-1 row-start-1" />
        <div className="col-start-2 row-start-1">
          {/* Lá 3: Ý thức */}
          {renderCardSlot(2, 'md')}
        </div>
        <div className="col-start-3 row-start-1" />

        {/* Row 2 */}
        <div className="col-start-1 row-start-2">
          {/* Lá 5: Quá khứ gần */}
          {renderCardSlot(4, 'md')}
        </div>
        <div className="col-start-2 row-start-2">
          {/* Lá 1 & 2: Central Cross */}
          {renderCentralCross()}
        </div>
        <div className="col-start-3 row-start-2">
          {/* Lá 6: Tương lai gần */}
          {renderCardSlot(5, 'md')}
        </div>

        {/* Row 3 */}
        <div className="col-start-1 row-start-3" />
        <div className="col-start-2 row-start-3">
          {/* Lá 4: Tiềm thức */}
          {renderCardSlot(3, 'md')}
        </div>
        <div className="col-start-3 row-start-3" />
      </div>

      {/* 2. THE VERTICAL STAFF COLUMN (Right sidebar column) */}
      {/* Sắp xếp thông minh: Lật ngược cột đứng trên Mobile/Desktop (Lá 10 trên đỉnh, Lá 7 dưới đáy) và hiển thị xuôi dòng thời gian trái-qua-phải trên Tablet (Lá 7 bên trái, Lá 10 bên phải) */}
      <div className="flex flex-col-reverse md:flex-row lg:flex-col-reverse justify-between items-center gap-4 sm:gap-6 lg:gap-5 w-full max-w-[620px] lg:w-48 bg-bg-surface/10 border border-gold-primary/10 rounded-3xl p-4 sm:p-8 lg:p-4 shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-primary/5 to-transparent rounded-[inherit] pointer-events-none" />
        
        {/* Lá 7: Bản thân (Dưới đáy / Bên trái ngoài cùng) */}
        {renderCardSlot(6, 'sm')}

        {/* Lá 8: Môi trường (Giữa dưới / Ở giữa trái) */}
        {renderCardSlot(7, 'sm')}

        {/* Lá 9: Hy vọng / Nỗi sợ (Giữa trên / Ở giữa phải) */}
        {renderCardSlot(8, 'sm')}

        {/* Lá 10: Kết quả cuối cùng (Trên đỉnh / Bên phải ngoài cùng) */}
        {renderCardSlot(9, 'sm')}
      </div>

    </div>
  );
}
