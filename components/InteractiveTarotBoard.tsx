'use client';

import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import TarotCard from './TarotCard';
import { motion } from 'framer-motion';

export interface InteractiveCard {
  id: string;
  card: TarotCardType;
  isReversed: boolean;
  role: 'core' | 'clarifier' | 'branch-a' | 'branch-b' | 'directional' | 'advice';
  parentSlug?: string;
  parentNameVi?: string;
  customPositionName?: string;
  x?: number;
  y?: number;
  rotation?: number;
  zIndex?: number;
  locked?: boolean;
}

interface PlacedCard extends InteractiveCard {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
}

interface InteractiveTarotBoardProps {
  cards: InteractiveCard[];
  selectedParentSlug?: string;
  onSelectParent?: (slug: string) => void;
  onUpdateCard?: (cardId: string, updates: Partial<InteractiveCard>) => void;
  onInspectCard?: (card: TarotCardType) => void;
}

export default function InteractiveTarotBoard({ cards, selectedParentSlug, onSelectParent, onUpdateCard, onInspectCard }: InteractiveTarotBoardProps) {
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // References for scroll and drag
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Card dimensions for size sm: 100px wide, 173px high
  const CARD_WIDTH = 100;
  const CARD_HEIGHT = 173;

  // Calculate coordinates dynamically for each card
  const placedCards = useMemo((): PlacedCard[] => {
    const results: PlacedCard[] = [];
    
    // Group children by parent slug to handle fanning/stacking
    const childrenMap: Record<string, string[]> = {};
    cards.forEach((c) => {
      if (c.parentSlug) {
        if (!childrenMap[c.parentSlug]) childrenMap[c.parentSlug] = [];
        childrenMap[c.parentSlug].push(c.id);
      }
    });

    const coreCards = cards.filter((c) => !c.parentSlug);
    const numCores = coreCards.length;

    cards.forEach((c) => {
      let x = c.x !== undefined ? c.x : 550;
      let y = c.y !== undefined ? c.y : 80;

      if (c.x === undefined || c.y === undefined) {
        if (!c.parentSlug) {
          // Initial cards positioning
          if (numCores === 1) {
            x = 550; // Centered on a 1200px wide canvas (1200 / 2 - 100 / 2 = 550)
          } else if (numCores === 2) {
            const coreIdx = coreCards.findIndex((core) => core.id === c.id);
            x = coreIdx === 0 ? 370 : 730; // spaced out nicely around center
          } else {
            // 3 or more core cards (Past, Present, Future)
            const coreIdx = coreCards.findIndex((core) => core.id === c.id);
            x = 220 + coreIdx * 330; // 220, 550, 880 (centered nicely on 1200px canvas)
          }
          y = 60;
        } else {
          // Find parent's calculated position
          const parentCard = results.find((p) => p.card.slug === c.parentSlug);
          if (parentCard) {
            const parentX = parentCard.x;
            const parentY = parentCard.y;

            const siblings = childrenMap[c.parentSlug] || [];
            const siblingIdx = siblings.indexOf(c.id);
            const totalSiblings = siblings.length;

            if (c.role === 'branch-a') {
              x = parentX - 180;
              y = parentY + 220;
            } else if (c.role === 'branch-b') {
              x = parentX + 180;
              y = parentY + 220;
            } else if (c.role === 'directional') {
              x = parentX + 130;
              y = parentY;
            } else {
              // Clarifier or advice: fan out horizontally
              const offsetWidth = 120;
              const fanOffset = (siblingIdx - (totalSiblings - 1) / 2) * offsetWidth;
              x = parentX + fanOffset;
              y = parentY + 220;
            }
          } else {
            // Fallback coordinate
            const fallbackIdx = cards.indexOf(c);
            x = 550 + fallbackIdx * 30;
            y = 60 + fallbackIdx * 100;
          }
        }
      }

      const rotation = c.rotation !== undefined ? c.rotation : 0;
      const zIndex = c.zIndex !== undefined ? c.zIndex : 10;
      const locked = c.locked !== undefined ? c.locked : false;

      results.push({ ...c, x, y, rotation, zIndex, locked });
    });

    return results;
  }, [cards]);

  // Determine dynamic canvas boundaries
  const boundaries = useMemo(() => {
    if (placedCards.length === 0) return { width: 1200, height: 600 };
    const xs = placedCards.map((c) => c.x);
    const ys = placedCards.map((c) => c.y);
    const maxX = Math.max(...xs, 1050);
    const minX = Math.min(...xs, 100);
    const maxY = Math.max(...ys, 400);

    return {
      width: Math.max(maxX + 150, 1200),
      height: Math.max(maxY + 260, 600),
    };
  }, [placedCards]);

  // Smooth scroll center automatically when cards count changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Auto-scroll to center horizontally smoothly on load (taking zoom into account)
    const targetLeft = (boundaries.width * zoom - container.clientWidth) / 2;
    setTimeout(() => {
      container.scrollTo({
        top: 0,
        left: targetLeft,
        behavior: 'smooth'
      });
    }, 300);
  }, [cards.length, boundaries.width]);

  // Programmatic D-Pad Scrolling
  const handleScroll = (direction: 'up' | 'down' | 'left' | 'right' | 'center') => {
    const container = containerRef.current;
    if (!container) return;
    
    const step = 150; // Scroll amount in pixels
    switch (direction) {
      case 'up':
        container.scrollBy({ top: -step, left: 0, behavior: 'smooth' });
        break;
      case 'down':
        container.scrollBy({ top: step, left: 0, behavior: 'smooth' });
        break;
      case 'left':
        container.scrollBy({ top: 0, left: -step, behavior: 'smooth' });
        break;
      case 'right':
        container.scrollBy({ top: 0, left: step, behavior: 'smooth' });
        break;
      case 'center':
        const targetLeft = (boundaries.width * zoom - container.clientWidth) / 2;
        container.scrollTo({ top: 0, left: targetLeft, behavior: 'smooth' });
        break;
    }
  };

  // Zoom, Panning, Dragging, Rotating implementations
  const boardRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.85);

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

  const rotateDragRef = useRef<{
    cardId: string;
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
  } | null>(null);

  const [isPanning, setIsPanning] = useState(false);
  const scrollTargetRef = useRef<{ left: number; top: number } | null>(null);

  const maxZ = useMemo(
    () => cards.reduce((highest, card) => Math.max(highest, card.zIndex || 0), 0),
    [cards]
  );

  const beginCardDrag = (event: React.PointerEvent<HTMLDivElement>, card: PlacedCard) => {
    event.preventDefault();
    event.stopPropagation();

    if (card.locked) {
      onSelectParent?.(card.card.slug);
      onUpdateCard?.(card.id, { zIndex: maxZ + 1 });
      return;
    }

    setDraggedCardId(card.id);
    onSelectParent?.(card.card.slug);
    onUpdateCard?.(card.id, { zIndex: maxZ + 1 });
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

    onUpdateCard?.(drag.cardId, {
      x: Math.max(12, drag.startX + dx),
      y: Math.max(12, drag.startY + dy),
    });
  };

  const endCardDrag = (event: React.PointerEvent<HTMLDivElement>, card: PlacedCard) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggedCardId(null);
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!drag) return;

    const now = event.timeStamp;
    const wasDoubleTap = tapRef.current.cardId === card.id && now - tapRef.current.time < 300;
    tapRef.current = { cardId: card.id, time: now };

    if (!drag.moved) {
      onSelectParent?.(card.card.slug);
      if (wasDoubleTap) {
        onUpdateCard?.(card.id, { isReversed: !card.isReversed });
      } else {
        onInspectCard?.(card.card);
      }
    }
  };

  const beginPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-workspace-card]') || target.closest('button') || target.closest('a')) {
      return;
    }

    const scroller = containerRef.current;
    if (!scroller) return;

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
    const scroller = containerRef.current;
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

  const beginRotateDrag = (event: React.PointerEvent<HTMLDivElement>, card: PlacedCard) => {
    event.preventDefault();
    event.stopPropagation();

    const cardEl = event.currentTarget.closest('[data-workspace-card]');
    if (!cardEl) return;

    const rect = cardEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
    const startRotation = card.rotation;

    rotateDragRef.current = {
      cardId: card.id,
      centerX,
      centerY,
      startAngle,
      startRotation,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveRotateDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = rotateDragRef.current;
    if (!drag) return;

    event.preventDefault();
    event.stopPropagation();

    const currentAngle = Math.atan2(event.clientY - drag.centerY, event.clientX - drag.centerX) * (180 / Math.PI);
    const deltaAngle = currentAngle - drag.startAngle;
    
    let newRotation = drag.startRotation + deltaAngle;
    onUpdateCard?.(drag.cardId, { rotation: newRotation });
  };

  const endRotateDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    rotateDragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    const scroller = containerRef.current;
    if (!scroller) return;

    const activePointers = new Map<number, { clientX: number; clientY: number }>();
    let initialPinchDistance: number | null = null;
    let initialZoom = 1;
    let pinchCenter: { xClient: number; yClient: number; xBoard: number; yBoard: number } | null = null;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        
        const rect = scroller.getBoundingClientRect();
        const xClient = e.clientX - rect.left;
        const yClient = e.clientY - rect.top;

        const scrollLeft = scroller.scrollLeft;
        const scrollTop = scroller.scrollTop;

        const xContent = scrollLeft + xClient;
        const yContent = scrollTop + yClient;

        const xBoard = xContent / zoom;
        const yBoard = yContent / zoom;

        const zoomFactor = 1 - e.deltaY * 0.0015;
        let newZoom = zoom * zoomFactor;
        newZoom = Math.max(0.55, Math.min(3.0, newZoom));

        const targetLeft = xBoard * newZoom - xClient;
        const targetTop = yBoard * newZoom - yClient;

        scrollTargetRef.current = { left: targetLeft, top: targetTop };
        setZoom(newZoom);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

      if (activePointers.size === 2) {
        dragRef.current = null;
        panRef.current = null;
        setIsPanning(false);

        const pointers = Array.from(activePointers.values());
        const dx = pointers[0].clientX - pointers[1].clientX;
        const dy = pointers[0].clientY - pointers[1].clientY;
        initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
        initialZoom = zoom;

        const rect = scroller.getBoundingClientRect();
        const clientX = (pointers[0].clientX + pointers[1].clientX) / 2;
        const clientY = (pointers[0].clientY + pointers[1].clientY) / 2;
        const xClient = clientX - rect.left;
        const yClient = clientY - rect.top;

        const scrollLeft = scroller.scrollLeft;
        const scrollTop = scroller.scrollTop;

        pinchCenter = {
          xClient,
          yClient,
          xBoard: (scrollLeft + xClient) / zoom,
          yBoard: (scrollTop + yClient) / zoom,
        };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (activePointers.has(e.pointerId)) {
        activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
      }

      if (activePointers.size === 2 && initialPinchDistance !== null && pinchCenter) {
        const pointers = Array.from(activePointers.values());
        const dx = pointers[0].clientX - pointers[1].clientX;
        const dy = pointers[0].clientY - pointers[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const scale = distance / initialPinchDistance;
        let newZoom = initialZoom * scale;
        newZoom = Math.max(0.55, Math.min(3.0, newZoom));

        const targetLeft = pinchCenter.xBoard * newZoom - pinchCenter.xClient;
        const targetTop = pinchCenter.yBoard * newZoom - pinchCenter.yClient;

        scrollTargetRef.current = { left: targetLeft, top: targetTop };
        setZoom(newZoom);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) {
        initialPinchDistance = null;
        pinchCenter = null;
      }
    };

    scroller.addEventListener('wheel', handleWheel, { passive: false });
    scroller.addEventListener('pointerdown', handlePointerDown);
    scroller.addEventListener('pointermove', handlePointerMove);
    scroller.addEventListener('pointerup', handlePointerUp);
    scroller.addEventListener('pointercancel', handlePointerUp);

    return () => {
      scroller.removeEventListener('wheel', handleWheel);
      scroller.removeEventListener('pointerdown', handlePointerDown);
      scroller.removeEventListener('pointermove', handlePointerMove);
      scroller.removeEventListener('pointerup', handlePointerUp);
      scroller.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [zoom]);

  useLayoutEffect(() => {
    if (scrollTargetRef.current && containerRef.current) {
      containerRef.current.scrollLeft = scrollTargetRef.current.left;
      containerRef.current.scrollTop = scrollTargetRef.current.top;
      scrollTargetRef.current = null;
    }
  }, [zoom]);

  const boardScaleStyle = {
    width: `${boundaries.width}px`,
    height: `${boundaries.height}px`,
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
  };

  const scrollContentStyle = {
    width: `${boundaries.width * zoom}px`,
    height: `${boundaries.height * zoom}px`,
  };

  const getRoleLabel = (role: string, customName?: string) => {
    if (customName) return customName;
    switch (role) {
      case 'core':
        return 'Lá Bài Cốt Lõi';
      case 'clarifier':
        return 'Lá Bài Làm Rõ';
      case 'branch-a':
        return 'Nhánh Lựa Chọn A';
      case 'branch-b':
        return 'Nhánh Lựa Chọn B';
      case 'directional':
        return 'Lá Theo Hướng Nhìn';
      case 'advice':
        return 'Lời Khuyên Của Mèo';
      default:
        return 'Lá Bài Bổ Trợ';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'core':
        return 'bg-gold-primary/20 text-gold-light border-gold-primary/30';
      case 'clarifier':
        return 'bg-[#4361ee]/20 text-[#4cc9f0] border-[#4361ee]/30';
      case 'branch-a':
        return 'bg-[#2a9d8f]/20 text-[#48cae4] border-[#2a9d8f]/30';
      case 'branch-b':
        return 'bg-[#e76f51]/20 text-[#f4a261] border-[#e76f51]/30';
      case 'directional':
        return 'bg-[#7209b7]/20 text-[#b5179e] border-[#7209b7]/30';
      case 'advice':
        return 'bg-[#2d6a4f]/20 text-[#52b788] border-[#2d6a4f]/30';
      default:
        return 'bg-white/10 text-white/80 border-white/10';
    }
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl border border-white/[0.05] bg-[#0c0c1b]/35 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col">
      
      {/* Mini-toolbar for layout controls */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 bg-[#090915]/60 border-b border-white/5 px-4 py-2.5 text-xs font-sans select-none z-30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-secondary/60 italic font-lora">Bàn đối thoại tự do kéo thả & thu phóng</span>
          {placedCards.some((c) => c.x !== undefined || c.rotation !== 0) && (
            <button
              onClick={() => {
                // Khôi phục lại sơ đồ bài cây ban đầu bằng cách xóa thuộc tính toạ độ tuỳ chỉnh
                cards.forEach((c) => {
                  onUpdateCard?.(c.id, { x: undefined, y: undefined, rotation: undefined, zIndex: undefined });
                });
              }}
              className="px-2 py-0.5 rounded bg-gold-primary/15 border border-gold-primary/30 hover:bg-gold-primary/30 hover:border-gold-light text-gold-light text-[9px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer"
              title="Khôi phục lại sơ đồ bài cây ban đầu"
            >
              🧩 Sắp Xếp Lại
            </button>
          )}
        </div>
        
        {/* Active Card Toolbar controls */}
        {(() => {
          const activeCard = placedCards.find((c) => c.card.slug === selectedParentSlug);
          if (!activeCard) return null;
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-gold-light/75 font-semibold">Lá đang chọn: {activeCard.card.nameVi}</span>
              <button
                onClick={() => onUpdateCard?.(activeCard.id, { locked: !activeCard.locked })}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 hover:border-gold-primary/45 text-text-secondary hover:text-gold-light flex items-center justify-center text-[10px] cursor-pointer"
                title={activeCard.locked ? "Mở khóa di chuyển" : "Khóa di chuyển"}
              >
                {activeCard.locked ? '🔒' : '🔓'}
              </button>
              <button
                onClick={() => onUpdateCard?.(activeCard.id, { rotation: (activeCard.rotation || 0) - 15 })}
                disabled={activeCard.locked}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 hover:border-gold-primary/45 text-text-secondary hover:text-gold-light flex items-center justify-center text-[10px] disabled:opacity-30 cursor-pointer"
                title="Xoay trái"
              >
                ↺
              </button>
              <button
                onClick={() => onUpdateCard?.(activeCard.id, { rotation: (activeCard.rotation || 0) + 15 })}
                disabled={activeCard.locked}
                className="w-5 h-5 rounded bg-white/5 border border-white/10 hover:border-gold-primary/45 text-text-secondary hover:text-gold-light flex items-center justify-center text-[10px] disabled:opacity-30 cursor-pointer"
                title="Xoay phải"
              >
                ↻
              </button>
            </div>
          );
        })()}

        {/* Zoom selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[9px] text-text-secondary/60">Zoom:</span>
          <input
            type="range"
            min="55"
            max="300"
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            className="w-16 accent-gold-primary"
          />
          <span className="text-[9px] text-gold-light font-mono min-w-[32px] text-right">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Floating Scroll Navigation pad (Bottom-Right D-PAD) */}
      {placedCards.length > 0 && (
        <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 bg-[#090915]/80 backdrop-blur-md border border-gold-primary/25 rounded-2xl p-2.5 shadow-2xl z-30 select-none">
          <div className="text-[8px] font-sans font-bold tracking-widest text-gold-light/65 uppercase pb-1 border-b border-white/5 w-full text-center">
            Mắt Điều Hướng
          </div>
          <div className="grid grid-cols-3 gap-1 mt-1.5 w-24 h-24 items-center justify-items-center">
            {/* Top row */}
            <div />
            <button
              onClick={() => handleScroll('up')}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-gold-primary/40 hover:bg-gold-primary/20 text-gold-light active:scale-90 flex items-center justify-center text-xs transition-all cursor-pointer font-bold"
              title="Cuộn Lên"
            >
              ▲
            </button>
            <div />

            {/* Middle row */}
            <button
              onClick={() => handleScroll('left')}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-gold-primary/40 hover:bg-gold-primary/20 text-gold-light active:scale-90 flex items-center justify-center text-xs transition-all cursor-pointer font-bold"
              title="Cuộn Trái"
            >
              ◀
            </button>
            <button
              onClick={() => handleScroll('center')}
              className="w-7 h-7 rounded-lg bg-gold-primary/20 border-2 border-gold-primary hover:bg-gold-primary hover:text-bg-deep text-gold-light active:scale-95 flex items-center justify-center text-[10px] transition-all cursor-pointer shadow-[0_0_8px_rgba(244,162,97,0.2)]"
              title="Căn Giữa"
            >
              🎯
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-gold-primary/40 hover:bg-gold-primary/20 text-gold-light active:scale-90 flex items-center justify-center text-xs transition-all cursor-pointer font-bold"
              title="Cuộn Phải"
            >
              ▶
            </button>

            {/* Bottom row */}
            <div />
            <button
              onClick={() => handleScroll('down')}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:border-gold-primary/40 hover:bg-gold-primary/20 text-gold-light active:scale-90 flex items-center justify-center text-xs transition-all cursor-pointer font-bold"
              title="Cuộn Xuống"
            >
              ▼
            </button>
            <div />
          </div>
          <span className="text-[7px] text-text-secondary/40 font-lora italic leading-none pt-1">
            Kéo bài hoặc bấm nút để cuộn
          </span>
        </div>
      )}

      {/* Main Scrollable Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full relative overflow-auto max-h-[75vh] md:max-h-[82vh] scrollbar-thin p-6 pt-14 z-10 select-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div style={scrollContentStyle}>
          <div
            ref={boardRef}
            onPointerDown={beginPan}
            onPointerMove={(event) => {
              movePan(event);
              moveCard(event);
              moveRotateDrag(event);
            }}
            onPointerUp={(event) => {
              endPan(event);
              endRotateDrag(event);
            }}
            onPointerCancel={(event) => {
              endPan(event);
              endRotateDrag(event);
              dragRef.current = null;
              setDraggedCardId(null);
            }}
            className="relative overflow-hidden touch-none"
            style={{
              ...boardScaleStyle,
              backgroundImage: 'radial-gradient(rgba(244, 162, 97, 0.03) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* SVG connection lines layer */}
            <svg
              className="absolute inset-0 pointer-events-none z-0 w-full h-full"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cca43b" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f4a261" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#cca43b" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {placedCards.map((c) => {
                if (!c.parentSlug) return null;
                // Find parent to draw line
                const parent = placedCards.find((p) => p.card.slug === c.parentSlug);
                if (!parent) return null;

                // Centers
                const px = parent.x + CARD_WIDTH / 2;
                const py = parent.y + CARD_HEIGHT / 2;
                const cx = c.x + CARD_WIDTH / 2;
                const cy = c.y + CARD_HEIGHT / 2;

                // Curve formula: Quadratic Bezier curve
                const mx = (px + cx) / 2;
                const my = (py + cy) / 2 - 20;

                return (
                  <g key={`line-${c.id}`}>
                    <path
                      d={`M ${px} ${py} Q ${mx} ${my} ${cx} ${cy}`}
                      fill="none"
                      stroke="rgba(0, 0, 0, 0.5)"
                      strokeWidth="4"
                    />
                    <path
                      d={`M ${px} ${py} Q ${mx} ${my} ${cx} ${cy}`}
                      fill="none"
                      stroke="url(#goldGradient)"
                      strokeWidth="2"
                      filter="url(#glow)"
                      className="stroke-dash-glow animate-[goldDash_4s_linear_infinite]"
                      style={{
                        strokeDasharray: '8, 8',
                      }}
                    />
                    <circle cx={px} cy={py} r="3" fill="#f4a261" />
                    <circle cx={cx} cy={cy} r="3" fill="#f4a261" />
                  </g>
                );
              })}
            </svg>

            {/* Tarot cards overlay */}
            {placedCards.map((c, idx) => {
              const isSelectedParent = selectedParentSlug === c.card.slug;
              const isCurrentlyDragged = draggedCardId === c.id;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  data-workspace-card="true"
                  onPointerDown={(event) => beginCardDrag(event, c)}
                  onPointerMove={moveCard}
                  onPointerUp={(event) => endCardDrag(event, c)}
                  onPointerCancel={(event) => {
                    dragRef.current = null;
                    setDraggedCardId(null);
                  }}
                  className={`absolute touch-none select-none flex flex-col items-center gap-2 ${
                    isCurrentlyDragged 
                      ? 'z-30 cursor-grabbing' 
                      : 'transition-all duration-300 ease-out'
                  } ${
                    c.locked ? 'cursor-default' : 'cursor-grab'
                  } ${isSelectedParent ? 'z-20' : ''}`}
                  style={{
                    left: `${c.x}px`,
                    top: `${c.y}px`,
                    zIndex: c.zIndex,
                    transform: `rotate(${c.rotation || 0}deg)`,
                    transformOrigin: 'center center',
                    width: `${CARD_WIDTH}px`,
                  }}
                >
                  {/* 3D Glassmorphic Card */}
                  <div className={`relative group hover:-translate-y-1.5 transition-transform duration-300 rounded-xl ${
                    isSelectedParent 
                      ? 'ring-2 ring-gold-primary shadow-[0_0_20px_var(--color-gold-glow)]' 
                      : ''
                  }`}>
                    {/* Rotation Handle */}
                    {!c.locked && isSelectedParent && (
                      <div
                        onPointerDown={(e) => beginRotateDrag(e, c)}
                        onPointerMove={moveRotateDrag}
                        onPointerUp={endRotateDrag}
                        onPointerCancel={endRotateDrag}
                        className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gold-primary hover:bg-gold-light border border-bg-deep flex items-center justify-center text-[10px] text-bg-deep font-bold cursor-alias select-none active:scale-90 transition-all shadow-[0_0_8px_rgba(244,162,97,0.4)] z-30 pointer-events-auto"
                        title="Kéo để xoay lá bài"
                      >
                        ↻
                      </div>
                    )}
                    <TarotCard
                      card={c.card}
                      isFlipped={true}
                      isReversed={c.isReversed}
                      size="sm"
                      interactive={false}
                      className={`shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:shadow-[0_0_15px_rgba(244,162,97,0.25)] transition-shadow duration-300 rounded-lg overflow-hidden border border-white/[0.05] ${
                        isSelectedParent ? 'border-gold-primary' : ''
                      }`}
                    />
                  </div>

                  {/* Label box */}
                  <div className="flex flex-col items-center gap-0.5 text-center pointer-events-none max-w-[130px] z-20">
                    <span
                      className={`px-1.5 py-0.5 text-[8px] font-sans font-bold uppercase tracking-wider rounded border ${getRoleBadgeColor(
                        c.role
                      )}`}
                    >
                      {getRoleLabel(c.role, c.customPositionName)}
                    </span>
                    <h5 className="font-lora text-[10px] text-white font-semibold truncate w-full px-0.5 drop-shadow-md">
                      {c.card.nameVi}
                    </h5>
                    <span className="text-[8px] text-text-secondary/50 italic leading-none block font-sans">
                      {c.isReversed ? 'Ngược' : 'Xuôi'}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {placedCards.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl animate-pulse">
                  🃏
                </div>
                <div>
                  <h3 className="font-cinzel text-gold-light font-bold text-sm tracking-wider">
                    Bàn Trải Bài Trống
                  </h3>
                  <p className="font-lora text-[11px] text-text-secondary italic max-w-xs mt-1">
                    Các lá bài rút ra trong quá trình đối thoại cùng Mèo Vàng sẽ tự động hiện lên tại đây với mạng lưới kết nối năng lượng.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
