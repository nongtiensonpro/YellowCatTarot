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

  // ═══════════════════════════════════════════════════════════════
  // CARD SLOT RENDERER — Modern glassmorphism style with labels
  // ═══════════════════════════════════════════════════════════════
  const renderCardSlot = (
    index: number,
    size: 'sm' | 'md' | 'lg' = 'sm',
    showLabel: boolean = true,
    extraClasses: string = ''
  ) => {
    const pos = spreadType.positions[index];
    const item = cards[index];
    const isFlipped = item ? item.isFlipped : false;
    const isReversed = item ? item.isReversed : false;

    const sizeClasses = {
      sm: 'w-[80px] h-[139px] sm:w-[100px] sm:h-[173px] md:w-[110px] md:h-[191px] rounded-lg',
      md: 'w-[90px] h-[156px] sm:w-[115px] sm:h-[199px] md:w-[130px] md:h-[225px] rounded-xl',
      lg: 'w-[110px] h-[191px] sm:w-[140px] sm:h-[242px] md:w-[160px] md:h-[277px] rounded-xl',
    };

    return (
      <div className={`flex flex-col items-center gap-1.5 select-none group ${extraClasses}`}>
        {/* Position label — minimal modern pill */}
        {showLabel && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:border-gold-primary/30 group-hover:bg-gold-primary/[0.08]">
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gold-primary/15 text-gold-light text-[8px] font-bold font-sans">
              {index + 1}
            </span>
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-sans font-semibold text-text-secondary/80 uppercase tracking-wider whitespace-nowrap">
              {pos.nameVi}
            </span>
          </div>
        )}

        {/* Card wrapper with modern hover glow */}
        <div className="relative transform transition-all duration-300 group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_16px_rgba(255,209,102,0.3)]">
          {item ? (
            <TarotCard
              card={item.card}
              isFlipped={isFlipped}
              isReversed={isReversed}
              size={size}
              interactive={interactive}
              onClick={() => onCardClick && onCardClick(index)}
            />
          ) : (
            <div
              onClick={() => onCardClick && onCardClick(index)}
              className={`${sizeClasses[size]} border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:border-gold-primary/30 hover:bg-gold-primary/[0.04] transition-all duration-300`}
            >
              <div className="w-5 h-5 rounded-full border border-dashed border-gold-primary/20 flex items-center justify-center text-gold-primary/30 text-xs font-bold">
                +
              </div>
            </div>
          )}
        </div>

        {/* Card name + inspect — appears on flip */}
        {item && isFlipped && (
          <div className="text-center flex flex-col gap-0.5 animate-[fadeIn_0.3s_ease-out] items-center max-w-[120px]">
            <span className="text-[8px] sm:text-[9px] font-sans font-bold text-gold-light/90 tracking-wide truncate w-full">
              {item.card.nameVi}
            </span>
            <span className="text-[7px] sm:text-[8px] font-sans font-medium text-text-secondary/70 uppercase tracking-widest">
              {isReversed ? '↩ Ngược' : '✦ Xuôi'}
            </span>
            {onInspectCard && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectCard(item.card);
                }}
                className="px-2 py-0.5 text-[7px] sm:text-[8px] font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-gold-primary/30 text-gold-light/80 hover:text-white rounded-full transition-all cursor-pointer flex items-center gap-0.5"
              >
                🔍 Chi tiết
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // CENTRAL CROSS — Cards 1 & 2 stacked with modern overlay
  // ═══════════════════════════════════════════════════════════════
  const renderCentralCross = () => {
    const card1 = cards[0];
    const card2 = cards[1];
    const isFlipped1 = card1 ? card1.isFlipped : false;
    const isReversed1 = card1 ? card1.isReversed : false;
    const isFlipped2 = card2 ? card2.isFlipped : false;
    const isReversed2 = card2 ? card2.isReversed : false;

    return (
      <div className="flex flex-col items-center gap-1.5 select-none">
        {/* Combined label */}
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-primary/[0.08] backdrop-blur-sm border border-gold-primary/20 shadow-[0_0_12px_rgba(244,162,97,0.1)]">
          <span className="text-[8px] sm:text-[9px] font-sans font-bold text-gold-light uppercase tracking-wider">
            ⚔️ Tâm Điểm
          </span>
        </div>

        {/* Overlapping Card Container — compact */}
        <div className="relative w-[160px] h-[170px] sm:w-[200px] sm:h-[210px] md:w-[240px] md:h-[240px] flex items-center justify-center">
          {/* Mystic glow behind center */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-gold-primary/[0.06] to-transparent pointer-events-none" />

          {/* Card 1: Present (Base Vertical) */}
          <div className="absolute inset-0 flex items-center justify-center z-[1]">
            {card1 ? (
              <TarotCard
                card={card1.card}
                isFlipped={isFlipped1}
                isReversed={isReversed1}
                size="sm"
                interactive={interactive}
                onClick={() => onCardClick && onCardClick(0)}
              />
            ) : (
              <div
                onClick={() => onCardClick && onCardClick(0)}
                className="w-[80px] h-[139px] sm:w-[100px] sm:h-[173px] md:w-[110px] md:h-[191px] rounded-lg border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:border-gold-primary/30 transition-all"
              >
                <span className="text-[7px] font-sans font-bold text-text-secondary/40 uppercase tracking-widest">Lá 1</span>
              </div>
            )}
          </div>

          {/* Card 2: Obstacle (Rotated 90° overlay) */}
          <div className="absolute z-[2] w-[80px] h-[139px] sm:w-[100px] sm:h-[173px] md:w-[110px] md:h-[191px] flex items-center justify-center origin-center rotate-90 transform drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-300">
            {card2 ? (
              <TarotCard
                card={card2.card}
                isFlipped={isFlipped2}
                isReversed={isReversed2}
                size="sm"
                interactive={interactive}
                onClick={() => onCardClick && onCardClick(1)}
              />
            ) : (
              <div
                onClick={() => onCardClick && onCardClick(1)}
                className="w-[80px] h-[139px] sm:w-[100px] sm:h-[173px] md:w-[110px] md:h-[191px] rounded-lg border border-dashed border-gold-primary/20 bg-bg-surface/15 flex flex-col items-center justify-center cursor-pointer hover:border-gold-primary/40 transition-all backdrop-blur-sm"
              >
                <span className="text-[7px] font-sans font-bold text-gold-light/40 uppercase tracking-widest -rotate-90">Lá 2</span>
              </div>
            )}
          </div>
        </div>

        {/* Compact quick inspect links */}
        <div className="flex gap-3 mt-0.5">
          {card1 && isFlipped1 && (
            <div className="flex flex-col items-center">
              <span className="text-[7px] sm:text-[8px] font-sans text-text-secondary/70 truncate max-w-[70px]">1. {card1.card.nameVi}</span>
              {onInspectCard && (
                <button
                  onClick={(e) => { e.stopPropagation(); onInspectCard(card1.card); }}
                  className="text-[7px] text-gold-light/70 hover:text-white cursor-pointer transition-colors"
                >
                  🔍
                </button>
              )}
            </div>
          )}
          {card2 && isFlipped2 && (
            <div className="flex flex-col items-center border-l border-white/[0.06] pl-3">
              <span className="text-[7px] sm:text-[8px] font-sans text-text-secondary/70 truncate max-w-[70px]">2. {card2.card.nameVi}</span>
              {onInspectCard && (
                <button
                  onClick={(e) => { e.stopPropagation(); onInspectCard(card2.card); }}
                  className="text-[7px] text-gold-light/70 hover:text-white cursor-pointer transition-colors"
                >
                  🔍
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // MAIN LAYOUT — Modern responsive Celtic Cross
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 xl:gap-10 justify-center items-center xl:items-stretch py-4 md:py-6 select-none">

      {/* ── CROSS SHAPE ── */}
      <div className="relative w-full max-w-[540px] xl:max-w-[600px]">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/[0.02] via-transparent to-mystic-purple/[0.02] rounded-3xl pointer-events-none" />
        <div className="relative bg-white/[0.01] border border-white/[0.04] rounded-3xl p-3 sm:p-5 md:p-6 backdrop-blur-sm">
          {/* Decorative cross lines */}
          <div className="absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-gold-primary/10 to-transparent -translate-y-1/2 pointer-events-none" />
          <div className="absolute left-1/2 top-[15%] bottom-[15%] w-px bg-gradient-to-b from-transparent via-gold-primary/10 to-transparent -translate-x-1/2 pointer-events-none" />

          {/* Cross grid — 3x3 with compact spacing */}
          <div className="grid grid-cols-3 gap-x-2 sm:gap-x-4 md:gap-x-6 gap-y-3 sm:gap-y-4 md:gap-y-5 items-center justify-items-center">
            {/* Row 1: [empty] [Card 3: Ý thức] [empty] */}
            <div />
            <div>{renderCardSlot(2, 'sm')}</div>
            <div />

            {/* Row 2: [Card 5: Quá khứ] [Cards 1&2: Central] [Card 6: Tương lai] */}
            <div>{renderCardSlot(4, 'sm')}</div>
            <div>{renderCentralCross()}</div>
            <div>{renderCardSlot(5, 'sm')}</div>

            {/* Row 3: [empty] [Card 4: Tiềm thức] [empty] */}
            <div />
            <div>{renderCardSlot(3, 'sm')}</div>
            <div />
          </div>
        </div>
      </div>

      {/* ── STAFF COLUMN (Cards 7-10) ── */}
      <div className="w-full max-w-[540px] xl:max-w-[180px]">
        <div className="relative bg-white/[0.01] border border-white/[0.04] rounded-3xl p-3 sm:p-4 backdrop-blur-sm overflow-hidden">
          {/* Decorative gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent" />

          {/* Title */}
          <div className="text-center mb-3">
            <span className="text-[8px] sm:text-[9px] font-sans font-bold text-gold-light/50 uppercase tracking-[0.2em]">
              Cây Gậy Phép Thuật
            </span>
          </div>

          {/* Staff cards: horizontal on mobile/tablet, vertical on desktop */}
          <div className="relative flex flex-row xl:flex-col items-center justify-center gap-3 sm:gap-4 xl:gap-3">
            {/* Connecting line (vertical on desktop, horizontal on mobile) */}
            <div className="hidden xl:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-gold-primary/8 to-transparent -translate-x-1/2 pointer-events-none" />
            <div className="xl:hidden absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold-primary/8 to-transparent -translate-y-1/2 pointer-events-none" />

            {/* Cards 10 → 9 → 8 → 7 (top to bottom on desktop = result first) */}
            <div className="order-4 xl:order-1 relative z-[1]">
              {renderCardSlot(9, 'sm')}
            </div>
            <div className="order-3 xl:order-2 relative z-[1]">
              {renderCardSlot(8, 'sm')}
            </div>
            <div className="order-2 xl:order-3 relative z-[1]">
              {renderCardSlot(7, 'sm')}
            </div>
            <div className="order-1 xl:order-4 relative z-[1]">
              {renderCardSlot(6, 'sm')}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
