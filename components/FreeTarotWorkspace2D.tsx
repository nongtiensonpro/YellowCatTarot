'use client';

import React, { useMemo, useRef, useState } from 'react';
import TarotCard from '@/components/TarotCard';
import { TarotCard as TarotCardType } from '@/lib/cards-data';

export interface FreeWorkspaceCard {
  id: string;
  card: TarotCardType;
  isReversed: boolean;
  pickOrder: number;
  round: 1 | 2 | 3;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  label?: string;
  note?: string;
  locked?: boolean;
}

interface FreeTarotWorkspace2DProps {
  cards: FreeWorkspaceCard[];
  activeCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
  onUpdateCard: (cardId: string, updates: Partial<FreeWorkspaceCard>) => void;
  onInspectCard: (card: TarotCardType) => void;
  onAutoArrange: () => void;
}

const BOARD_WIDTH = 1800;
const BOARD_HEIGHT = 1180;
const CARD_WIDTH = 120;
const CARD_HEIGHT = 208;
const MOBILE_CARD_WIDTH = 100;
const MOBILE_CARD_HEIGHT = 173;

const roundStyles: Record<1 | 2 | 3, { label: string; badge: string; glow: string }> = {
  1: {
    label: 'Vòng 1',
    badge: 'bg-gold-primary/15 border-gold-primary/35 text-gold-light',
    glow: 'shadow-[0_0_18px_rgba(244,162,97,0.20)]',
  },
  2: {
    label: 'Vòng 2',
    badge: 'bg-[#2a9d8f]/15 border-[#2a9d8f]/35 text-[#48cae4]',
    glow: 'shadow-[0_0_18px_rgba(72,202,228,0.16)]',
  },
  3: {
    label: 'Vòng 3',
    badge: 'bg-[#e76f51]/15 border-[#e76f51]/35 text-[#f4a261]',
    glow: 'shadow-[0_0_18px_rgba(231,111,81,0.16)]',
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function FreeTarotWorkspace2D({
  cards,
  activeCardId,
  onSelectCard,
  onUpdateCard,
  onInspectCard,
  onAutoArrange,
}: FreeTarotWorkspace2DProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    cardId: string;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const panRef = useRef<{
    startClientX: number;
    startClientY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const tapRef = useRef<{ cardId: string; time: number }>({ cardId: '', time: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(0.88);

  const activeCard = useMemo(
    () => cards.find((card) => card.id === activeCardId) || null,
    [cards, activeCardId]
  );

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => a.zIndex - b.zIndex),
    [cards]
  );

  const maxZ = useMemo(
    () => cards.reduce((highest, card) => Math.max(highest, card.zIndex), 0),
    [cards]
  );

  const boardScaleStyle = {
    width: `${BOARD_WIDTH}px`,
    height: `${BOARD_HEIGHT}px`,
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
  };

  const scrollContentStyle = {
    width: `${BOARD_WIDTH * zoom}px`,
    height: `${BOARD_HEIGHT * zoom}px`,
  };

  const beginCardDrag = (event: React.PointerEvent<HTMLDivElement>, card: FreeWorkspaceCard) => {
    event.preventDefault();
    event.stopPropagation();

    if (card.locked) {
      onSelectCard(card.id);
      onUpdateCard(card.id, { zIndex: maxZ + 1 });
      return;
    }

    onSelectCard(card.id);
    onUpdateCard(card.id, { zIndex: maxZ + 1 });
    dragRef.current = {
      cardId: card.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: card.x,
      startY: card.y,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveCard = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    event.preventDefault();
    const dx = (event.clientX - drag.startClientX) / zoom;
    const dy = (event.clientY - drag.startClientY) / zoom;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      drag.moved = true;
    }

    const cardWidth = window.innerWidth < 640 ? MOBILE_CARD_WIDTH : CARD_WIDTH;
    const cardHeight = window.innerWidth < 640 ? MOBILE_CARD_HEIGHT : CARD_HEIGHT;

    onUpdateCard(drag.cardId, {
      x: clamp(drag.startX + dx, 12, BOARD_WIDTH - cardWidth - 12),
      y: clamp(drag.startY + dy, 12, BOARD_HEIGHT - cardHeight - 48),
    });
  };

  const endCardDrag = (event: React.PointerEvent<HTMLDivElement>, card: FreeWorkspaceCard) => {
    const drag = dragRef.current;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!drag) return;

    const now = event.timeStamp;
    const wasDoubleTap = tapRef.current.cardId === card.id && now - tapRef.current.time < 300;
    tapRef.current = { cardId: card.id, time: now };

    if (!drag.moved) {
      onSelectCard(card.id);
      if (wasDoubleTap) {
        onUpdateCard(card.id, { isReversed: !card.isReversed });
      }
    }
  };

  const beginPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-workspace-card]') || target.closest('button') || target.closest('textarea') || target.closest('input')) {
      return;
    }

    const scroller = scrollRef.current;
    if (!scroller) return;

    onSelectCard(null);
    setIsPanning(true);
    panRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    const scroller = scrollRef.current;
    if (!pan || !scroller) return;

    scroller.scrollLeft = pan.scrollLeft - (event.clientX - pan.startClientX);
    scroller.scrollTop = pan.scrollTop - (event.clientY - pan.startClientY);
  };

  const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!panRef.current) return;
    panRef.current = null;
    setIsPanning(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const rotateActive = (delta: number) => {
    if (!activeCard || activeCard.locked) return;
    onUpdateCard(activeCard.id, { rotation: activeCard.rotation + delta });
  };

  const updateActiveNote = (note: string) => {
    if (!activeCard) return;
    onUpdateCard(activeCard.id, { note });
  };

  const updateActiveLabel = (label: string) => {
    if (!activeCard) return;
    onUpdateCard(activeCard.id, { label });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between bg-white/[0.025] border border-white/[0.06] rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAutoArrange}
            className="px-3 py-2 rounded-xl bg-gold-primary/15 border border-gold-primary/30 hover:border-gold-light text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all"
          >
            Sắp Xếp Lại
          </button>
          <button
            onClick={() => activeCard && onUpdateCard(activeCard.id, { locked: !activeCard.locked })}
            disabled={!activeCard}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-text-secondary hover:text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-35 disabled:pointer-events-none"
          >
            {activeCard?.locked ? 'Mở Khóa Lá' : 'Khóa Lá'}
          </button>
          <button
            onClick={() => activeCard && onUpdateCard(activeCard.id, { isReversed: !activeCard.isReversed })}
            disabled={!activeCard}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-text-secondary hover:text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-35 disabled:pointer-events-none"
          >
            Đảo Xuôi/Ngược
          </button>
          <button
            onClick={() => rotateActive(-15)}
            disabled={!activeCard || activeCard.locked}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-gold-light text-sm cursor-pointer transition-all disabled:opacity-35 disabled:pointer-events-none"
            title="Xoay trái"
          >
            ↺
          </button>
          <button
            onClick={() => rotateActive(15)}
            disabled={!activeCard || activeCard.locked}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-gold-light text-sm cursor-pointer transition-all disabled:opacity-35 disabled:pointer-events-none"
            title="Xoay phải"
          >
            ↻
          </button>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-sans font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">
            Zoom
          </span>
          <input
            type="range"
            min="55"
            max="125"
            value={Math.round(zoom * 100)}
            onChange={(event) => setZoom(Number(event.target.value) / 100)}
            className="w-full xl:w-48 accent-gold-primary"
          />
          <span className="w-12 text-right text-[10px] font-sans font-bold text-gold-light">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-9 min-h-[620px]">
          <div
            ref={scrollRef}
            className={`relative h-[68vh] min-h-[620px] overflow-auto rounded-2xl border border-white/[0.06] bg-[#070711] shadow-2xl scrollbar-thin ${
              isPanning ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <div style={scrollContentStyle}>
              <div
                ref={boardRef}
                style={boardScaleStyle}
                onPointerDown={beginPan}
                onPointerMove={(event) => {
                  movePan(event);
                  moveCard(event);
                }}
                onPointerUp={(event) => {
                  endPan(event);
                }}
                onPointerCancel={(event) => {
                  endPan(event);
                  dragRef.current = null;
                }}
                className="relative overflow-hidden touch-none"
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px), radial-gradient(circle at 50% 42%, rgba(244,162,97,0.08), transparent 36%)',
                    backgroundSize: '40px 40px, 40px 40px, 100% 100%',
                  }}
                />

                {([1, 2, 3] as const).map((round) => {
                  const style = roundStyles[round];
                  return (
                    <div
                      key={round}
                      className="absolute left-10 right-10 border-t border-dashed border-white/10"
                      style={{ top: `${210 + (round - 1) * 320}px` }}
                    >
                      <span className={`absolute -top-3 left-0 px-2 py-1 rounded-lg border text-[10px] font-sans font-bold uppercase tracking-widest ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                  );
                })}

                {cards.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 pointer-events-none">
                    <div className="text-4xl opacity-70">🃏</div>
                    <h4 className="font-cinzel text-sm font-bold text-gold-light uppercase tracking-wider">
                      Bàn tư vấn 2D đang trống
                    </h4>
                    <p className="max-w-sm text-xs text-text-secondary/55 font-lora italic leading-relaxed">
                      Sau khi rút bài, mỗi lá sẽ xuất hiện trên mặt bàn này để bạn kéo thả, xoay, khóa vị trí và ghi chú trực tiếp cho phiên đọc.
                    </p>
                  </div>
                )}

                {sortedCards.map((workspaceCard) => {
                  const isActive = workspaceCard.id === activeCardId;
                  const style = roundStyles[workspaceCard.round];
                  return (
                    <div
                      key={workspaceCard.id}
                      data-workspace-card="true"
                      onPointerDown={(event) => beginCardDrag(event, workspaceCard)}
                      onPointerMove={moveCard}
                      onPointerUp={(event) => endCardDrag(event, workspaceCard)}
                      onPointerCancel={() => {
                        dragRef.current = null;
                      }}
                      className={`absolute touch-none select-none ${workspaceCard.locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                      style={{
                        left: `${workspaceCard.x}px`,
                        top: `${workspaceCard.y}px`,
                        zIndex: workspaceCard.zIndex,
                        transform: `rotate(${workspaceCard.rotation}deg)`,
                        transformOrigin: 'center center',
                      }}
                    >
                      <div
                        className={`relative flex flex-col items-center gap-1.5 transition-transform duration-150 ${
                          isActive ? 'scale-[1.04]' : ''
                        }`}
                      >
                        <div className={`rounded-lg ${isActive ? style.glow : ''}`}>
                          <TarotCard
                            card={workspaceCard.card}
                            isFlipped={true}
                            isReversed={workspaceCard.isReversed}
                            size="sm"
                            interactive={false}
                            className={`rounded-lg overflow-hidden border ${
                              isActive ? 'border-gold-light' : 'border-white/10'
                            }`}
                          />
                        </div>

                        <div className="w-[128px] flex flex-col items-center gap-0.5 pointer-events-none">
                          <span className={`max-w-full px-1.5 py-0.5 rounded border text-[8px] font-sans font-bold uppercase tracking-wider truncate ${style.badge}`}>
                            {workspaceCard.label || `${style.label} · #${workspaceCard.pickOrder}`}
                          </span>
                          <span className="max-w-full truncate text-[10px] text-white font-lora drop-shadow">
                            {workspaceCard.card.nameVi} {workspaceCard.isReversed ? '↩' : '✦'}
                          </span>
                        </div>

                        {workspaceCard.locked && (
                          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bg-deep border border-gold-primary/40 text-gold-light text-[10px] flex items-center justify-center shadow-lg">
                            🔒
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="xl:col-span-3 min-h-[620px] rounded-2xl border border-white/[0.06] bg-bg-surface/25 p-4 flex flex-col gap-4 shadow-2xl">
          <div className="border-b border-white/10 pb-3">
            <h3 className="font-cinzel text-xs font-bold text-gold-light uppercase tracking-wider">
              Bảng Điều Khiển Lá
            </h3>
            <p className="text-[10px] text-text-secondary/55 font-lora italic mt-1">
              Chọn một lá trên bàn để ghi chú, đổi nhãn, xoay hoặc mở chi tiết ý nghĩa.
            </p>
          </div>

          {activeCard ? (
            <div className="flex flex-col gap-3 min-h-0">
              <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-cinzel text-sm text-text-primary font-bold truncate">
                      {activeCard.card.nameVi}
                    </h4>
                    <p className="text-[10px] text-text-secondary/60 font-lora italic truncate">
                      {activeCard.card.nameEn} · {activeCard.isReversed ? 'Chiều ngược' : 'Chiều xuôi'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[8px] font-sans font-bold uppercase tracking-wider ${roundStyles[activeCard.round].badge}`}>
                    V{activeCard.round}
                  </span>
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-text-secondary">
                  Nhãn vị trí
                </span>
                <input
                  value={activeCard.label || ''}
                  onChange={(event) => updateActiveLabel(event.target.value)}
                  placeholder="Ví dụ: Gốc vấn đề, Khách hàng, Hướng đi..."
                  className="w-full rounded-xl bg-bg-elevated/45 border border-white/10 focus:border-gold-primary/45 outline-none px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/35"
                />
              </label>

              <label className="flex flex-col gap-1.5 min-h-0">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-text-secondary">
                  Ghi chú riêng cho lá này
                </span>
                <textarea
                  value={activeCard.note || ''}
                  onChange={(event) => updateActiveNote(event.target.value)}
                  placeholder="Ghi nhận trực giác, phản ứng của khách hàng, liên kết với câu hỏi..."
                  className="min-h-[150px] resize-none rounded-xl bg-bg-elevated/45 border border-white/10 focus:border-gold-primary/45 outline-none px-3 py-2 text-xs leading-relaxed text-text-primary placeholder:text-text-secondary/35 scrollbar-thin"
                />
              </label>

              <button
                onClick={() => onInspectCard(activeCard.card)}
                className="w-full py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep text-xs font-sans font-bold uppercase tracking-widest cursor-pointer transition-all"
              >
                Mở Thư Viện Ý Nghĩa
              </button>
            </div>
          ) : (
            <div className="flex-1 rounded-xl border border-dashed border-white/10 bg-white/[0.015] flex items-center justify-center p-5 text-center">
              <p className="text-xs text-text-secondary/45 font-lora italic leading-relaxed">
                Chưa chọn lá nào. Chạm hoặc nhấp vào một lá trên bàn để mở bảng điều khiển.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
