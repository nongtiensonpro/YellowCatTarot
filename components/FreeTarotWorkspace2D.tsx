'use client';

import React, { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import TarotCard from '@/components/TarotCard';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import { SOUL_MARKS } from '@/lib/soul-marks';

export interface FreeWorkspaceCard {
  id: string;
  card: TarotCardType;
  isReversed: boolean;
  pickOrder: number;
  round: number;
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
  showCardControlPanel: boolean;
  onSelectCard: (cardId: string | null) => void;
  onUpdateCard: (cardId: string, updates: Partial<FreeWorkspaceCard>) => void;
  onInspectCard: (card: TarotCardType) => void;
  onAutoArrange: () => void;
  soulMarkIndexes?: Record<number, number>; // Maps round number (1, 2, 3) to soulMarkIndex
  roundNames?: Record<number, string>; // Maps round number to custom name
  fullScreen?: boolean;
  onToggleFullScreen?: () => void;
  showRoundSettings?: boolean;
  onToggleRoundSettings?: () => void;
  onClearBoard?: () => void;
  onCopyResults?: () => void;
  showJournal?: boolean;
  onToggleJournal?: () => void;
  onToggleCardControlPanel?: () => void;
  hasCards?: boolean;
}

const BOARD_WIDTH = 1800;
const BOARD_HEIGHT = 1180;
const CARD_WIDTH = 120;
const CARD_HEIGHT = 208;
const MOBILE_CARD_WIDTH = 100;
const MOBILE_CARD_HEIGHT = 173;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function FreeTarotWorkspace2D({
  cards,
  activeCardId,
  showCardControlPanel,
  onSelectCard,
  onUpdateCard,
  onInspectCard,
  onAutoArrange,
  soulMarkIndexes,
  roundNames,
  fullScreen = false,
  onToggleFullScreen,
  showRoundSettings = false,
  onToggleRoundSettings,
  onClearBoard,
  onCopyResults,
  showJournal = false,
  onToggleJournal,
  onToggleCardControlPanel,
  hasCards = false,
}: FreeTarotWorkspace2DProps) {
  // Helper to dynamically look up round styles and names using Ghibli Soul Marks
  const getRoundStyle = (roundNumber: number) => {
    const soulMarkIdx = soulMarkIndexes ? soulMarkIndexes[roundNumber] : (roundNumber - 1) % 8;
    const mark = SOUL_MARKS[soulMarkIdx] || SOUL_MARKS[0];
    const customName = roundNames ? roundNames[roundNumber] : `Vòng ${roundNumber}`;
    return {
      label: `${customName} · ${mark.icon} ${mark.name}`,
      badge: `${mark.bgClass} ${mark.borderClass} ${mark.textClass}`,
      glow: `shadow-[0_0_18px_rgba(${parseInt(mark.color.slice(1, 3), 16)},${parseInt(mark.color.slice(3, 5), 16)},${parseInt(mark.color.slice(5, 7), 16)},0.28)]`,
      textColor: mark.color,
    };
  };

  const roundNumbers = useMemo(() => {
    const keys = Object.keys(soulMarkIndexes || {}).map(Number);
    if (keys.length === 0) return [1, 2, 3];
    return keys.sort((a, b) => a - b);
  }, [soulMarkIndexes]);

  const maxRound = useMemo(() => {
    return Math.max(3, ...roundNumbers, ...cards.map(c => c.round));
  }, [roundNumbers, cards]);

  const boardHeight = maxRound * 320 + 220;

  const [showCardLabels, setShowCardLabels] = useState(false);
  const [showLaneLabels, setShowLaneLabels] = useState(false);
  const [showButtonLabels, setShowButtonLabels] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);

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
  const rotateDragRef = useRef<{
    cardId: string;
    centerX: number;
    centerY: number;
    startAngle: number;
    startRotation: number;
  } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(0.88);

  const scrollTargetRef = useRef<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (scrollTargetRef.current && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollTargetRef.current.left;
      scrollRef.current.scrollTop = scrollTargetRef.current.top;
      scrollTargetRef.current = null;
    }
  }, [zoom]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const activePointers = new Map<number, { clientX: number; clientY: number }>();
    let initialPinchDistance: number | null = null;
    let initialZoom = 1;
    let pinchCenter: { xClient: number; yClient: number; xBoard: number; yBoard: number } | null = null;

    // WHEEL ZOOM (Ctrl + Mouse Wheel)
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
        newZoom = clamp(newZoom, 0.55, 3.0);

        const targetLeft = xBoard * newZoom - xClient;
        const targetTop = yBoard * newZoom - yClient;

        scrollTargetRef.current = { left: targetLeft, top: targetTop };
        setZoom(newZoom);
      }
    };

    // PINCH ZOOM (Pointer Events)
    const handlePointerDown = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

      if (activePointers.size === 2) {
        // Cancel single-finger pan or card drag
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
        newZoom = clamp(newZoom, 0.55, 3.0);

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

    // Bind event listeners natively
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
    height: `${boardHeight}px`,
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
  };

  const scrollContentStyle = {
    width: `${BOARD_WIDTH * zoom}px`,
    height: `${boardHeight * zoom}px`,
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
      y: clamp(drag.startY + dy, 12, boardHeight - cardHeight - 48),
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

  const beginRotateDrag = (event: React.PointerEvent<HTMLDivElement>, card: FreeWorkspaceCard) => {
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
    
    onUpdateCard(drag.cardId, { rotation: newRotation });
  };

  const endRotateDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    rotateDragRef.current = null;
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
    <div className="flex-1 w-full flex flex-col h-full overflow-hidden bg-[#070711]">
      {showToolbar && (
        <div className="flex-shrink-0 flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between bg-[#0d0d1a]/60 border-b border-white/10 p-3 select-none">
          <div className="flex flex-wrap items-center gap-2">
            {/* Back button */}
            <button
              type="button"
              onClick={() => window.location.href = '/reading'}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/40 text-text-secondary hover:text-red-400 text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              title="Quay lại danh mục trải bài (Thoát)"
            >
              <span>🚪</span>
              {showButtonLabels && <span className="ml-1 text-[9px]">Thoát</span>}
            </button>

            {hasCards && onClearBoard && (
              <button
                type="button"
                onClick={onClearBoard}
                className="px-3 py-2 rounded-xl bg-red-950/20 border border-red-500/20 hover:border-red-500/50 hover:bg-red-950/40 text-red-400 text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                title="Dọn sạch toàn bộ bàn trải bài"
              >
                <span>🗑️</span>
                {showButtonLabels && <span className="ml-1 text-[9px]">Dọn Bàn</span>}
              </button>
            )}

            {hasCards && onCopyResults && (
              <button
                type="button"
                onClick={onCopyResults}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary hover:bg-white/10 text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                title="Sao chép toàn bộ kết quả phiên trải bài vào Clipboard"
              >
                <span>📋</span>
                {showButtonLabels && <span className="ml-1 text-[9px]">Sao Chép</span>}
              </button>
            )}

            {onToggleCardControlPanel && (
              <button
                type="button"
                onClick={onToggleCardControlPanel}
                className={`px-3 py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                  showCardControlPanel
                    ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                    : 'bg-white/5 border-white/10 hover:border-gold-primary/45 text-text-secondary hover:text-gold-light'
                }`}
                title={showCardControlPanel ? 'Ẩn bảng điều khiển lá bài đang chọn' : 'Hiện bảng điều khiển lá bài đang chọn'}
              >
                <span>🎴</span>
                {showButtonLabels && <span className="ml-1 text-[9px]">Bảng Lá</span>}
              </button>
            )}

            {onToggleJournal && (
              <button
                type="button"
                onClick={onToggleJournal}
                className={`px-3 py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                  showJournal
                    ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                    : 'bg-white/5 border-white/10 hover:border-gold-primary/45 text-text-secondary hover:text-gold-light'
                }`}
                title={showJournal ? 'Ẩn thanh Nhật Ký & Hội Thoại bên phải' : 'Hiện thanh Nhật Ký & Hội Thoại bên phải'}
              >
                <span>📝</span>
                {showButtonLabels && <span className="ml-1 text-[9px]">Nhật Ký</span>}
              </button>
            )}

            {onToggleRoundSettings && (
              <button
                type="button"
                onClick={onToggleRoundSettings}
                className={`px-3 py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1 shadow-lg ${
                  showRoundSettings
                    ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                    : 'bg-white/5 border-white/10 hover:border-gold-primary/45 text-text-secondary hover:text-gold-light'
                }`}
                title="Thiết lập các vòng và chế độ rút bài"
              >
                <span>⚙️</span>
                {showButtonLabels && <span className="ml-1 text-[9px]">Thiết Lập Vòng</span>}
              </button>
            )}

            {/* Separator line */}
            <span className="w-px h-5 bg-white/10 mx-1 hidden sm:inline" />

            {/* Canvas layout controls */}
            <button
              onClick={onAutoArrange}
              className="px-3 py-2 rounded-xl bg-gold-primary/15 border border-gold-primary/30 hover:border-gold-light text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1"
              title="Sắp xếp tự động các lá bài về vị trí ban đầu của từng vòng"
            >
              <span>🧩</span>
              {showButtonLabels && <span className="ml-1 text-[9px]">Sắp Xếp Lại</span>}
            </button>
            
            <button
              onClick={() => activeCard && onUpdateCard(activeCard.id, { locked: !activeCard.locked })}
              disabled={!activeCard}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-text-secondary hover:text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-35 disabled:pointer-events-none flex items-center gap-1"
              title={activeCard?.locked ? "Mở khóa vị trí lá bài đang chọn để tự do di chuyển" : "Khóa vị trí lá bài đang chọn chống di chuyển nhầm"}
            >
              <span>{activeCard?.locked ? '🔓' : '🔒'}</span>
              {showButtonLabels && <span className="ml-1 text-[9px]">{activeCard?.locked ? 'Mở Khóa' : 'Khóa Lá'}</span>}
            </button>
            
            <button
              onClick={() => activeCard && onUpdateCard(activeCard.id, { isReversed: !activeCard.isReversed })}
              disabled={!activeCard}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-text-secondary hover:text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all disabled:opacity-35 disabled:pointer-events-none flex items-center gap-1"
              title="Đảo chiều lá bài đang chọn (Xuôi ✦ / Ngược ↩)"
            >
              <span>🔄</span>
              {showButtonLabels && <span className="ml-1 text-[9px]">Đảo Chiều</span>}
            </button>
            
            {activeCard && (
              <button
                onClick={() => onInspectCard(activeCard.card)}
                className="px-3 py-2 rounded-xl bg-gold-primary/18 border border-gold-primary/45 hover:bg-gold-primary hover:text-bg-deep text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_10px_rgba(244,162,97,0.12)] flex items-center gap-1"
                title="Xem chi tiết ý nghĩa và luận giải của lá bài đang chọn"
              >
                <span>🔍</span>
                {showButtonLabels && <span className="ml-1 text-[9px]">Chi Tiết Lá</span>}
              </button>
            )}

            <button
              onClick={() => rotateActive(-15)}
              disabled={!activeCard || activeCard.locked}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-gold-light text-sm cursor-pointer transition-all disabled:opacity-35 disabled:pointer-events-none"
              title="Xoay trái lá bài"
            >
              ↺
            </button>
            
            <button
              onClick={() => rotateActive(15)}
              disabled={!activeCard || activeCard.locked}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-gold-light text-sm cursor-pointer transition-all disabled:opacity-35 disabled:pointer-events-none"
              title="Xoay phải lá bài"
            >
              ↻
            </button>

            {/* Separator line */}
            <span className="w-px h-5 bg-white/10 mx-1 hidden sm:inline" />

            {/* Toggle Button Labels Button */}
            <button
              type="button"
              onClick={() => setShowButtonLabels(!showButtonLabels)}
              className={`px-3 py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                showButtonLabels
                  ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                  : 'bg-white/5 border-white/10 text-text-secondary hover:border-gold-primary/45'
              }`}
              title={showButtonLabels ? 'Ẩn chữ của các nút trên menu (Chỉ hiện Icon)' : 'Hiện chữ đầy đủ của các nút trên menu'}
            >
              <span>🏷️</span>
              <span className="ml-1 text-[9px]">{showButtonLabels ? 'Ẩn Chữ' : 'Hiện Chữ'}</span>
            </button>

            {/* Hide Toolbar Button */}
            <button
              type="button"
              onClick={() => setShowToolbar(false)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/40 text-text-secondary hover:text-red-400 text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1"
              title="Ẩn hoàn toàn thanh công cụ (Menu)"
            >
              <span>🔼</span>
              {showButtonLabels && <span className="ml-1 text-[9px]">Ẩn Menu</span>}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10px] font-sans font-bold text-text-secondary select-none">
            <label 
              className="flex items-center gap-1.5 cursor-pointer hover:text-gold-light transition-colors"
              title="Ẩn/Hiện nhãn tên và số vòng trực tiếp dưới mỗi lá bài trên bàn"
            >
              <input
                type="checkbox"
                checked={showCardLabels}
                onChange={(e) => setShowCardLabels(e.target.checked)}
                className="accent-gold-primary w-3.5 h-3.5 cursor-pointer rounded"
              />
              <span>🔤</span>
              {showButtonLabels && <span className="ml-1 text-[9px]">HIỆN TÊN & VÒNG LÁ BÀI</span>}
            </label>
            <label 
              className="flex items-center gap-1.5 cursor-pointer hover:text-gold-light transition-colors"
              title="Ẩn/Hiện tên của các vòng trải bài ở mép trái các đường phân làn"
            >
              <input
                type="checkbox"
                checked={showLaneLabels}
                onChange={(e) => setShowLaneLabels(e.target.checked)}
                className="accent-gold-primary w-3.5 h-3.5 cursor-pointer rounded"
              />
              <span>🗺️</span>
              {showButtonLabels && <span className="ml-1 text-[9px]">HIỆN TÊN VÒNG TRẢI</span>}
            </label>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <span 
              className="text-[10px] font-sans font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap cursor-help"
              title="Điều chỉnh tỷ lệ hiển thị bàn bài (Zoom)"
            >
              {showButtonLabels ? 'Zoom' : '🔎'}
            </span>
            <input
              type="range"
              min="55"
              max="300"
              value={Math.round(zoom * 100)}
              onChange={(event) => setZoom(Number(event.target.value) / 100)}
              className="w-full xl:w-48 accent-gold-primary"
            />
            <span className="w-12 text-right text-[10px] font-sans font-bold text-gold-light">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 w-full flex items-stretch overflow-hidden relative">
        {!showToolbar && (
          <button
            type="button"
            onClick={() => setShowToolbar(true)}
            className="absolute top-4 left-4 z-50 p-1 rounded-full bg-[#0d0d1a]/85 border border-gold-primary/30 hover:border-gold-light hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(244,162,97,0.3)] backdrop-blur-md cursor-pointer group animate-[fadeIn_0.2s_ease-out]"
            title="Hiện thanh công cụ (Menu)"
          >
            <img
              src="/meo-vang-logo.png"
              alt="Mèo Vàng Logo"
              className="w-10 h-10 object-contain rounded-full border border-gold-primary/10 group-hover:border-gold-light transition-all"
            />
          </button>
        )}
        <div className="flex-1 min-w-0 relative h-full">
          <div
            ref={scrollRef}
            className={`relative w-full h-full overflow-auto scrollbar-thin ${
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

                {roundNumbers.map((round) => {
                  const style = getRoundStyle(round);
                  return (
                    <div
                      key={round}
                      className="absolute left-10 right-10 border-t border-dashed border-white/10"
                      style={{ top: `${210 + (round - 1) * 320}px` }}
                    >
                      {showLaneLabels && (
                        <span className={`absolute -top-3 left-0 px-2 py-1 rounded-lg border text-[10px] font-sans font-bold uppercase tracking-widest ${style.badge}`}>
                          {style.label}
                        </span>
                      )}
                    </div>
                  );
                })}

                {cards.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-3 pointer-events-none">
                    <div className="text-4xl opacity-70">🃏</div>
                    <h4 className="font-cinzel text-sm font-bold text-gold-light uppercase tracking-wider">
                      Không gian trải nghiệm đang trống
                    </h4>
                    <p className="max-w-sm text-xs text-text-secondary/55 font-lora italic leading-relaxed">
                      Sau khi rút bài, mỗi lá sẽ xuất hiện trên mặt bàn này để bạn tự do sắp đặt, xoay, kết nối và ghi lại cảm nhận theo cách riêng.
                    </p>
                  </div>
                )}

                {sortedCards.map((workspaceCard) => {
                  const isActive = workspaceCard.id === activeCardId;
                  const style = getRoundStyle(workspaceCard.round);
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
                        <div>
                          <TarotCard
                            card={workspaceCard.card}
                            isFlipped={true}
                            isReversed={workspaceCard.isReversed}
                            size="sm"
                            interactive={false}
                          />
                        </div>

                        {showCardLabels && (
                          <div className="w-[128px] flex flex-col items-center gap-0.5 pointer-events-none">
                            <span className={`max-w-full px-1.5 py-0.5 rounded border text-[8px] font-sans font-bold uppercase tracking-wider truncate ${style.badge}`}>
                              {workspaceCard.label || `${style.label} · #${workspaceCard.pickOrder}`}
                            </span>
                            <span className="max-w-full truncate text-[10px] text-white font-lora drop-shadow">
                              {workspaceCard.card.nameVi} {workspaceCard.isReversed ? '↩' : '✦'}
                            </span>
                          </div>
                        )}

                        {workspaceCard.locked && (
                          <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-[#0d0d1a] border border-gold-primary/40 text-gold-light text-[10px] flex items-center justify-center shadow-lg z-40 select-none">
                            🔒
                          </span>
                        )}

                        {isActive && !workspaceCard.locked && (
                          <div
                            onPointerDown={(event) => beginRotateDrag(event, workspaceCard)}
                            onPointerMove={moveRotateDrag}
                            onPointerUp={endRotateDrag}
                            onPointerCancel={endRotateDrag}
                            className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gold-primary hover:bg-gold-light border border-bg-deep flex items-center justify-center text-[10px] text-bg-deep font-bold cursor-alias select-none active:scale-90 transition-all shadow-[0_0_8px_rgba(244,162,97,0.4)] z-40 pointer-events-auto touch-none"
                            title="Kéo để xoay lá bài"
                          >
                            ↻
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {showCardControlPanel && (
          <aside className="w-full sm:w-[320px] flex-shrink-0 border-l border-white/10 bg-[#0d0d1a]/95 p-4 flex flex-col gap-4 shadow-2xl overflow-y-auto scrollbar-thin h-full z-20">
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
                    <span className={`px-2 py-0.5 rounded border text-[8px] font-sans font-bold uppercase tracking-wider ${getRoundStyle(activeCard.round).badge}`}>
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
                    placeholder="Ví dụ: Gốc vấn đề, Hiện tại, Hướng đi..."
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
                    placeholder="Ghi nhận trực giác, cảm nhận nổi bật, liên kết với câu hỏi hoặc vị trí trên bàn..."
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
        )}
      </div>
    </div>
  );
}
