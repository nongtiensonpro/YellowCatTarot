'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import TarotCard from '@/components/TarotCard';
import { StudioDealtCard } from '@/components/ReaderGrimoire';
import { readerAudio } from '@/lib/reader-audio';

interface SlotPosition {
  id: string;
  positionName: string;
  x: number;
  y: number;
}

export interface DeskTabItem {
  id: string;
  deskName: string;
  cardCount: number;
}

interface ReaderStudioDeskProps {
  dealtCards: StudioDealtCard[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onFlipCard: (cardId: string) => void;
  slots: SlotPosition[];
  onOpenGrimoire: () => void;
  onUpdateCardPosition: (cardId: string, x: number, y: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  activePresetName: string;
  onClearDesk: () => void;
  onOpenLayoutMenu: () => void;

  // Multi-Desk Tabs Props
  desks: DeskTabItem[];
  activeDeskId: string;
  onSwitchDesk: (deskId: string) => void;
  onCreateNewDesk: () => void;
  onDeleteDesk?: (deskId: string) => void;
}

function ReaderStudioDesk({
  dealtCards,
  selectedCardId,
  onSelectCard,
  onFlipCard,
  slots,
  onOpenGrimoire,
  onUpdateCardPosition,
  isMuted,
  onToggleMute,
  activePresetName,
  onClearDesk,
  onOpenLayoutMenu,
  desks,
  activeDeskId,
  onSwitchDesk,
  onCreateNewDesk,
  onDeleteDesk,
}: ReaderStudioDeskProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between bg-[#150d08] select-none font-serif">
      {/* Ghibli Ambient Layer 1: Warm Wood Desk & Perspective Filter */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #3d2618 0%, #24140b 50%, #0d0704 100%)',
        }}
      >
        {/* Fine Wood Grain Lines */}
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, transparent 1px, transparent 12px)',
          }}
        />

        {/* Ambient Candle Glow (Left & Right top lights) */}
        <div className={`absolute top-4 left-12 w-64 h-64 rounded-full bg-[#f4a261]/15 blur-3xl ${shouldReduceMotion ? '' : 'animate-pulse'}`} />
        <div className={`absolute top-4 right-12 w-64 h-64 rounded-full bg-[#e76f51]/15 blur-3xl ${shouldReduceMotion ? '' : 'animate-pulse'}`} style={{ animationDelay: '1s' }} />

        {/* Center Velvet Tablecloth (Spread Mat) */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[92%] max-w-[1100px] h-[74%] rounded-3xl border-2 border-[#d4af37]/30 bg-[#281216]/80 shadow-[inset_0_0_80px_rgba(0,0,0,0.85),0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-sm" />
      </div>

      {/* Top Controls Bar */}
      <div className="relative z-40 p-3 sm:p-4 flex flex-wrap items-center justify-between pointer-events-auto gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Link
            href="/reading"
            className="px-3 py-1.5 rounded-xl bg-black/50 hover:bg-[#d4af37]/20 border border-[#d4af37]/35 text-[#e6c594] text-xs font-sans font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5 backdrop-blur-md"
            title="Quay lại danh sách chế độ trải bài"
          >
            <span>⬅️</span>
            <span>Thoát</span>
          </Link>

          {/* Desk Tabs Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-[460px] scrollbar-none py-1">
            {desks.map((desk) => {
              const isActive = desk.id === activeDeskId;
              return (
                <div
                  key={desk.id}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-sans font-bold transition-all border shadow-sm ${
                    isActive
                      ? 'bg-[#d4af37]/25 border-[#d4af37] text-[#e6c594]'
                      : 'bg-black/40 border-[#d4af37]/20 text-[#a38a6d] hover:border-[#d4af37]/45 hover:text-[#e6c594]'
                  }`}
                >
                  <button
                    onClick={() => {
                      readerAudio.playHover();
                      onSwitchDesk(desk.id);
                    }}
                    className="cursor-pointer flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>🎴</span>
                    <span>{desk.deskName}</span>
                    <span className="text-[10px] opacity-75">({desk.cardCount}/13)</span>
                  </button>

                  {desks.length > 1 && onDeleteDesk && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDesk(desk.id);
                      }}
                      className="ml-1 text-[10px] text-red-400/70 hover:text-red-400 px-1 cursor-pointer"
                      title="Xóa bàn này"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => {
                readerAudio.playPageTurn();
                onCreateNewDesk();
              }}
              className="px-2.5 py-1 rounded-xl bg-[#d4af37]/20 hover:bg-[#d4af37]/40 border border-[#d4af37]/50 text-[#e6c594] text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-md flex items-center gap-1"
              title="Tạo Bàn Trải Bài Mới (Tối đa 13 lá bài/bàn)"
            >
              <span>➕</span>
              <span>Bàn Mới</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#281b12]/80 border border-[#d4af37]/35 text-[#e6c594] text-xs font-sans font-bold shadow-lg backdrop-blur-md">
            <span>📜 Sơ Đồ:</span>
            <span className="text-[#fdf0d5]">{activePresetName}</span>
          </div>

          <button
            onClick={onOpenLayoutMenu}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#e6c594] text-xs font-sans font-bold transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
            title="Đổi sơ đồ bài"
          >
            📐 Đổi Sơ Đồ
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-[#281b12]/80 border border-[#d4af37]/35 text-[#e6c594] hover:border-[#d4af37] text-xs transition-all cursor-pointer shadow-lg backdrop-blur-md"
            title={isMuted ? 'Mở âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Clear Desk */}
          <button
            onClick={onClearDesk}
            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-red-900/40 border border-[#d4af37]/30 text-[#e6c594] hover:text-red-300 text-xs font-sans font-bold transition-all cursor-pointer shadow-md active:scale-95"
            title="Thu bài làm quẻ mới"
          >
            🧹 Thu Bài
          </button>

          {/* Grimoire Open Button */}
          <button
            onClick={onOpenGrimoire}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d4af37]/30 to-[#b89f80]/30 border border-[#d4af37] text-[#fdf0d5] text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span>📜</span>
            <span>Sổ Ghi Chép</span>
          </button>
        </div>
      </div>

      {/* Main Desk Spread Area */}
      <div className="relative z-20 flex-1 w-full flex items-center justify-center overflow-visible">
        <div className="relative w-[920px] h-[520px] overflow-visible origin-center scale-[0.42] sm:scale-[0.58] md:scale-[0.75] lg:scale-100">
          {/* Preset Placeholder Slots */}
          {slots.map((slot, sIdx) => {
            const isFilled = dealtCards.some((c) => c.pickOrder === sIdx + 1);
            return (
              <div
                key={slot.id}
                style={{
                  left: `${slot.x}px`,
                  top: `${slot.y}px`,
                }}
                className={`absolute w-[105px] h-[178px] -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
                  isFilled
                    ? 'border-[#d4af37]/15 bg-transparent'
                    : `border-[#d4af37]/45 bg-[#d4af37]/5 shadow-[0_0_15px_rgba(212,175,55,0.15)] ${shouldReduceMotion ? '' : 'animate-pulse'}`
                }`}
              >
                {!isFilled && (
                  <>
                    <span className="text-[10px] text-[#e6c594] font-sans font-bold uppercase tracking-wider">
                      #{sIdx + 1}
                    </span>
                    <span className="text-[9px] text-[#b89f80] font-sans mt-0.5 line-clamp-2">
                      {slot.positionName}
                    </span>
                  </>
                )}
              </div>
            );
          })}

          {/* Dealt Cards on Desk Surface */}
          <AnimatePresence>
            {dealtCards.map((card) => {
              const isSelected = selectedCardId === card.id;

              return (
                <motion.div
                  key={card.id}
                  drag
                  dragMomentum={false}
                  onDragEnd={(_, info) => {
                    onUpdateCardPosition(card.id, card.x + info.offset.x, card.y + info.offset.y);
                  }}
                  initial={shouldReduceMotion ? false : { scale: 0.2, opacity: 0, y: 150 }}
                  animate={{
                    x: card.x,
                    y: card.y,
                    scale: isSelected ? 1.08 : 1,
                    rotate: card.rotation,
                    opacity: 1,
                  }}
                  exit={{ scale: 0.1, opacity: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', damping: 20, stiffness: 200 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCard(card.id);
                  }}
                  className={`absolute w-[105px] h-[178px] -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-30 touch-none overflow-visible ${
                    isSelected ? 'z-50 shadow-[0_0_30px_rgba(244,162,97,0.9)]' : ''
                  }`}
                  style={{
                    left: 0,
                    top: 0,
                  }}
                >
                  <div className="relative w-full h-full overflow-visible group">
                    {/* Card 3D Flip Container */}
                    <div
                      className="w-full h-full cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFlipCard(card.id);
                      }}
                      title="Nhấp để lật 3D lá bài"
                    >
                      <TarotCard
                        card={card.card}
                        isFlipped={card.isFlipped}
                        isReversed={card.isReversed}
                        size="sm"
                        interactive={false}
                        imageQuality={78}
                        imageSizes="120px"
                      />
                    </div>

                    {/* Position Label Badge — positioned below card, never overlaps */}
                    <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none" style={{ top: 'calc(100% + 6px)' }}>
                      <span className="px-2 py-0.5 rounded bg-black/80 border border-[#d4af37]/40 text-[#e6c594] text-[9px] font-sans font-bold uppercase shadow-md">
                        #{card.pickOrder} · {card.positionName}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ReaderStudioDesk);
