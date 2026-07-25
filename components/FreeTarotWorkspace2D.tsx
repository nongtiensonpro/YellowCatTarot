'use client';

import React, { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TarotCard from '@/components/TarotCard';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import { SOUL_MARKS } from '@/lib/soul-marks';
import { SPREAD_PRESETS, SpreadLayoutType, calculateRoundCardLayout, calculateRoundLaneTop, getPresetLaneHeight } from '@/lib/tarot-layouts';

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
  deckId?: string;
}

interface FreeTarotWorkspace2DProps {
  cards: FreeWorkspaceCard[];
  activeCardId: string | null;
  showCardControlPanel: boolean;
  onSelectCard: (cardId: string | null) => void;
  onUpdateCard: (cardId: string, updates: Partial<FreeWorkspaceCard>) => void;
  onInspectCard: (card: TarotCardType) => void;
  onAutoArrange: (presetId?: SpreadLayoutType) => void;
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
  
  // Seamless Inline Deck & Controls Props
  onQuickDrawSingle?: () => void;
  showInlineDeckRibbon?: boolean;
  onToggleInlineDeckRibbon?: () => void;
  currentRoundNumber?: number;
  onSelectRoundNumber?: (roundNum: number) => void;
  onCreateRound?: () => void;
  selectedDeckId?: string;
  onDeckChange?: (deckId: string) => void;
  inlineDeckComponent?: React.ReactNode;
  onApplyLayoutPreset?: (presetId: SpreadLayoutType, roundNum?: number) => void;
  activeLayoutPresets?: Record<number, SpreadLayoutType>;
  onQuickDrawSingleSlot?: (roundNum: number, slotIndex: number) => void;
}

const MIN_BOARD_WIDTH = 1200;
const MIN_BOARD_HEIGHT = 900;
const BOARD_PADDING = 200; // padding around bounding box of cards
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
  onQuickDrawSingle,
  showInlineDeckRibbon = false,
  onToggleInlineDeckRibbon,
  currentRoundNumber = 1,
  onSelectRoundNumber,
  onCreateRound,
  selectedDeckId = 'rws',
  onDeckChange,
  inlineDeckComponent,
  onApplyLayoutPreset,
  activeLayoutPresets,
  onQuickDrawSingleSlot,
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

  // Compute actual bounding box of all placed cards
  const cardsBounds = useMemo(() => {
    if (cards.length === 0) {
      return { minX: 0, minY: 0, maxX: MIN_BOARD_WIDTH, maxY: MIN_BOARD_HEIGHT };
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of cards) {
      minX = Math.min(minX, c.x);
      minY = Math.min(minY, c.y);
      maxX = Math.max(maxX, c.x + CARD_WIDTH);
      maxY = Math.max(maxY, c.y + CARD_HEIGHT);
    }
    return { minX, minY, maxX, maxY };
  }, [cards]);

  // Dynamic board dimensions based on card bounding box + layout lane requirements
  const { boardWidth, boardHeight } = useMemo(() => {
    const maxR = Math.max(1, ...roundNumbers, ...cards.map(c => c.round));
    const lastLaneTop = calculateRoundLaneTop(maxR, activeLayoutPresets);
    const lastLaneHeight = getPresetLaneHeight(activeLayoutPresets?.[maxR] || 'auto');
    const layoutH = lastLaneTop + lastLaneHeight + BOARD_PADDING;

    const boundsW = cardsBounds.maxX + BOARD_PADDING;
    const boundsH = cardsBounds.maxY + BOARD_PADDING;

    return {
      boardWidth: Math.max(MIN_BOARD_WIDTH, boundsW, 2950),
      boardHeight: Math.max(MIN_BOARD_HEIGHT, boundsH, layoutH),
    };
  }, [roundNumbers, cards, activeLayoutPresets, cardsBounds]);

  // Viewport size detection
  const [viewportSize, setViewportSize] = useState({ w: 1200, h: 800 });
  useEffect(() => {
    const updateSize = () => {
      if (scrollRef.current) {
        setViewportSize({
          w: scrollRef.current.clientWidth,
          h: scrollRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const [showCardLabels, setShowCardLabels] = useState(false);
  const [showLaneLabels, setShowLaneLabels] = useState(false);
  const [showButtonLabels, setShowButtonLabels] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [zoomedCardId, setZoomedCardId] = useState<string | null>(null);

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
        newZoom = clamp(newZoom, 0.25, 3.0);

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
        newZoom = clamp(newZoom, 0.25, 3.0);

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
    width: `${boardWidth}px`,
    height: `${boardHeight}px`,
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
  };

  const scrollContentStyle = {
    width: `${boardWidth * zoom}px`,
    height: `${boardHeight * zoom}px`,
  };

  // Fit-to-View: auto-calculate optimal zoom and center scroll
  const fitToView = () => {
    if (cards.length === 0 || !scrollRef.current) return;
    const vw = scrollRef.current.clientWidth;
    const vh = scrollRef.current.clientHeight;

    const contentW = cardsBounds.maxX - cardsBounds.minX + CARD_WIDTH + BOARD_PADDING;
    const contentH = cardsBounds.maxY - cardsBounds.minY + CARD_HEIGHT + BOARD_PADDING;

    const fitZoom = clamp(
      Math.min(vw / contentW, vh / contentH) * 0.92,
      0.25, 2.5
    );

    const centerX = (cardsBounds.minX + cardsBounds.maxX) / 2;
    const centerY = (cardsBounds.minY + cardsBounds.maxY) / 2;

    const targetLeft = centerX * fitZoom - vw / 2;
    const targetTop = centerY * fitZoom - vh / 2;

    scrollTargetRef.current = {
      left: Math.max(0, targetLeft),
      top: Math.max(0, targetTop),
    };
    setZoom(fitZoom);
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
      x: clamp(drag.startX + dx, 12, boardWidth - cardWidth - 12),
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

            {/* SEAMLESS DRAWING BUTTONS */}
            {onQuickDrawSingle && (
              <button
                type="button"
                onClick={onQuickDrawSingle}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-gold-primary to-gold-light text-bg-deep text-[10px] font-sans font-extrabold uppercase tracking-wider cursor-pointer transition-all shadow-[0_0_12px_rgba(244,162,97,0.3)] hover:shadow-[0_0_18px_rgba(244,162,97,0.5)] active:scale-95 flex items-center gap-1"
                title="Rút nhanh 1 lá bài trực tiếp vào vòng đang chọn chỉ bằng 1 nhấp"
              >
                <span>🎲</span>
                <span>Rút Nhanh 1 Lá</span>
              </button>
            )}

            {onToggleInlineDeckRibbon && (
              <button
                type="button"
                onClick={onToggleInlineDeckRibbon}
                className={`px-3 py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                  showInlineDeckRibbon
                    ? 'bg-gold-primary/25 border-gold-light text-gold-light shadow-[0_0_12px_rgba(244,162,97,0.2)]'
                    : 'bg-gold-primary/10 border-gold-primary/30 hover:border-gold-light text-gold-light'
                }`}
                title="Mở/Ẩn thanh nhặt bài nổi ngay trên bàn trải bài 2D"
              >
                <span>🃏</span>
                <span>{showInlineDeckRibbon ? 'Ẩn Dải Bài' : 'Nhặt Bài Nổi'}</span>
              </button>
            )}

            {/* ROUND SELECTOR TABS IN TOP DOCK */}
            {roundNumbers && roundNumbers.length > 0 && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-0.5">
                {roundNumbers.map((rNum) => {
                  const isCur = rNum === currentRoundNumber;
                  const markStyle = getRoundStyle(rNum);
                  return (
                    <button
                      key={rNum}
                      type="button"
                      onClick={() => onSelectRoundNumber && onSelectRoundNumber(rNum)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-sans font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isCur
                          ? `${markStyle.badge} shadow-sm font-black`
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span>V{rNum}</span>
                    </button>
                  );
                })}
                {onCreateRound && (
                  <button
                    type="button"
                    onClick={onCreateRound}
                    className="px-2 py-1 text-[9px] text-gold-light font-bold hover:text-white transition-colors cursor-pointer"
                    title="Thêm Vòng bài mới"
                  >
                    +
                  </button>
                )}
              </div>
            )}

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
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className={`px-3 py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                  showLayoutMenu
                    ? 'bg-gold-primary/25 border-gold-light text-gold-light shadow-[0_0_12px_rgba(244,162,97,0.25)]'
                    : 'bg-gold-primary/15 border-gold-primary/30 hover:border-gold-light text-gold-light'
                }`}
                title="Chọn sơ đồ Tarot chuẩn thế giới (1 lá, 3 lá, 5 lá, Horseshoe, Relationship, Celtic Cross, Wheel of Year, Mandala)"
              >
                <span>📐</span>
                <span>Sơ Đồ Bài</span>
                <span className="text-[8px] opacity-70 ml-0.5">▼</span>
              </button>

              <AnimatePresence>
                {showLayoutMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-[#0d0d1a]/95 border border-gold-primary/30 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.85)] backdrop-blur-xl p-2 z-50 flex flex-col gap-1 overflow-hidden"
                  >
                    <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between">
                      <span className="text-[10px] font-cinzel font-bold text-gold-light uppercase tracking-wider">
                        Sơ Đồ Trải Bài Chuẩn Tarot
                      </span>
                      <span className="text-[9px] text-text-secondary italic">V{currentRoundNumber}</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto scrollbar-thin flex flex-col gap-1 pr-0.5">
                      {SPREAD_PRESETS.map((preset) => {
                        const cardsInCurRound = cards.filter(c => c.round === currentRoundNumber).length;
                        const isTooMany = preset.recommendedCards > 0 && preset.recommendedCards < cardsInCurRound;
                        const needsPlaceholders = preset.recommendedCards > cardsInCurRound;

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            disabled={isTooMany}
                            onClick={() => {
                              if (isTooMany) return;
                              setShowLayoutMenu(false);
                              if (onApplyLayoutPreset) {
                                onApplyLayoutPreset(preset.id, currentRoundNumber);
                              } else {
                                onAutoArrange(preset.id);
                              }
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2 group ${
                              isTooMany
                                ? 'opacity-40 border-white/5 bg-white/[0.02] cursor-not-allowed'
                                : 'bg-white/5 hover:bg-gold-primary/20 border-white/5 hover:border-gold-primary/40'
                            }`}
                            title={
                              isTooMany
                                ? `Vòng này hiện đã nhặt ${cardsInCurRound} lá, không thể đổi về sơ đồ ${preset.recommendedCards} lá.`
                                : preset.description
                            }
                          >
                            <span className="text-sm">{preset.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-sans font-bold text-text-primary group-hover:text-gold-light truncate">
                                  {preset.nameVi}
                                </span>
                                {preset.recommendedCards > 0 && (
                                  <span className={`px-1.5 py-0.2 rounded text-[8px] font-sans font-bold flex-shrink-0 ${
                                    isTooMany
                                      ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                                      : needsPlaceholders
                                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                        : 'bg-gold-primary/10 border border-gold-primary/25 text-gold-light'
                                  }`}>
                                    {preset.recommendedCards} lá
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-text-secondary/60 font-lora italic leading-tight truncate mt-0.5">
                                {isTooMany
                                  ? `⚠️ Đã có ${cardsInCurRound} lá bài trên bàn`
                                  : needsPlaceholders
                                    ? `✦ Sẽ tạo ${preset.recommendedCards - cardsInCurRound} thẻ bài úp chờ nhặt`
                                    : preset.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => onAutoArrange('auto')}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/40 text-text-secondary hover:text-gold-light text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1"
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

          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={fitToView}
              disabled={cards.length === 0}
              className="px-2.5 py-1.5 rounded-lg bg-gold-primary/15 border border-gold-primary/40 hover:border-gold-light text-gold-light text-[9px] font-sans font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 disabled:opacity-35 disabled:pointer-events-none flex items-center gap-1 shadow-sm whitespace-nowrap"
              title="Tự động thu phóng & cuộn để tất cả lá bài vừa khung hình (Fit to View)"
            >
              <span>📐</span>
              {showButtonLabels && <span>Tự Vừa Khung</span>}
            </button>
            <span 
              className="text-[10px] font-sans font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap cursor-help"
              title="Điều chỉnh tỷ lệ hiển thị bàn bài (Zoom)"
            >
              {showButtonLabels ? 'Zoom' : '🔎'}
            </span>
            <input
              type="range"
              min="25"
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
                  const presetId = activeLayoutPresets?.[round] || 'auto';
                  const presetInfo = SPREAD_PRESETS.find(p => p.id === presetId) || SPREAD_PRESETS[0];
                  const cardsInRound = cards.filter(c => c.round === round);
                  const targetCardsCount = presetInfo.recommendedCards > 0 ? presetInfo.recommendedCards : cardsInRound.length;

                  const laneTop = calculateRoundLaneTop(round, activeLayoutPresets);
                  const laneHeight = getPresetLaneHeight(presetId);

                  return (
                    <div
                      key={round}
                      className="absolute left-10 right-10 border-t border-dashed border-white/10"
                      style={{ top: `${laneTop + laneHeight + 40}px` }}
                    >
                      {showLaneLabels && (
                        <div className="absolute -top-3.5 left-0 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-sans font-bold uppercase tracking-widest ${style.badge}`}>
                            {style.label} · Đã rút {cardsInRound.length} lá
                          </span>
                          {presetInfo.id !== 'auto' && (
                            <span className="px-2 py-0.5 rounded-lg bg-gold-primary/18 border border-gold-primary/35 text-gold-light text-[9px] font-sans font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <span>{presetInfo.icon} Sơ Đồ: {presetInfo.nameVi}</span>
                              <span className="text-white/60">({cardsInRound.length}/{targetCardsCount} lá)</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* FACE-DOWN PLACEHOLDER CARD SLOTS FOR MISSING CARDS */}
                {roundNumbers.flatMap((round) => {
                  const cardsInRound = cards.filter(c => c.round === round);
                  const presetId = activeLayoutPresets?.[round] || 'auto';
                  const presetInfo = SPREAD_PRESETS.find(p => p.id === presetId) || SPREAD_PRESETS[0];
                  const targetCardsCount = presetInfo.recommendedCards;

                  if (targetCardsCount <= 0 || cardsInRound.length >= targetCardsCount) {
                    return [];
                  }

                  const layoutResults = calculateRoundCardLayout(targetCardsCount, round, presetId, activeLayoutPresets);
                  const missingSlots = layoutResults.slice(cardsInRound.length);

                  return missingSlots.map((slot, pIdx) => {
                    const slotIndex = cardsInRound.length + pIdx;
                    return (
                      <motion.div
                        key={`placeholder-${round}-${slotIndex}`}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 0.9, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => onQuickDrawSingleSlot ? onQuickDrawSingleSlot(round, slotIndex) : onQuickDrawSingle?.()}
                        className="absolute touch-none select-none cursor-pointer group z-10"
                        style={{
                          left: `${slot.x}px`,
                          top: `${slot.y}px`,
                          transform: `rotate(${slot.rotation}deg)`,
                          transformOrigin: 'center center',
                        }}
                        title={`Nhấp để rút lá bài cho vị trí: ${slot.label}`}
                      >
                        <div className="relative flex flex-col items-center gap-1.5 transition-transform duration-200 group-hover:scale-105">
                          <div className="relative w-[120px] h-[208px] rounded-xl border-2 border-dashed border-gold-primary/60 bg-gold-primary/10 flex flex-col items-center justify-center text-center p-2 shadow-[0_0_15px_rgba(244,162,97,0.2)] backdrop-blur-sm group-hover:border-gold-light group-hover:bg-gold-primary/20 transition-all">
                            <span className="text-2xl opacity-70 group-hover:scale-110 transition-transform animate-pulse">🎴</span>
                            <span className="text-[9px] font-sans font-bold text-gold-light uppercase tracking-wider mt-2 group-hover:text-white">
                              Chờ Nhặt Bài
                            </span>
                            <span className="text-[8px] font-lora italic text-text-secondary/70 mt-0.5">
                              Nhấp để rút lá này
                            </span>
                          </div>

                          <div className="w-[128px] flex flex-col items-center gap-0.5 pointer-events-none">
                            <span className="max-w-full px-1.5 py-0.5 rounded bg-black/60 border border-gold-primary/30 text-gold-light text-[8px] font-sans font-bold uppercase tracking-wider truncate">
                              {slot.label}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  });
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

                <AnimatePresence mode="popLayout">
                  {sortedCards.map((workspaceCard) => {
                    const isActive = workspaceCard.id === activeCardId;
                    const isZoomed = workspaceCard.id === zoomedCardId;
                    const style = getRoundStyle(workspaceCard.round);
                    return (
                      <motion.div
                        key={workspaceCard.id}
                        data-workspace-card="true"
                        initial={{ opacity: 0, scale: 0.25, y: -35, rotate: workspaceCard.rotation - 15 }}
                        animate={{ opacity: 1, scale: isZoomed ? 2.1 : 1, y: 0, rotate: workspaceCard.rotation }}
                        exit={{ opacity: 0, scale: 0.1, rotate: workspaceCard.rotation + 30, filter: 'blur(6px)' }}
                        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                        onPointerDown={(event) => beginCardDrag(event, workspaceCard)}
                        onPointerMove={moveCard}
                        onPointerUp={(event) => endCardDrag(event, workspaceCard)}
                        onPointerCancel={() => {
                          dragRef.current = null;
                        }}
                        className={`absolute touch-none select-none group ${
                          workspaceCard.locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                        }`}
                        style={{
                          left: `${workspaceCard.x}px`,
                          top: `${workspaceCard.y}px`,
                          zIndex: isZoomed ? 9999 : workspaceCard.zIndex,
                          transformOrigin: 'center center',
                        }}
                      >
                        <div
                          className={`relative flex flex-col items-center gap-1.5 transition-all duration-200 ${
                            isZoomed ? 'scale-100' : isActive ? 'scale-[1.05]' : 'group-hover:scale-[1.02]'
                          }`}
                        >
                          {/* Sparkle particle aura for active / zoomed card */}
                          {isActive && (
                            <div className={`absolute -inset-3 pointer-events-none z-30 rounded-2xl border transition-all ${
                              isZoomed
                                ? 'border-gold-light shadow-[0_0_40px_rgba(244,162,97,0.85)] bg-gold-primary/10'
                                : 'border-gold-primary/45 shadow-[0_0_20px_rgba(244,162,97,0.4)] animate-pulse'
                            }`} />
                          )}

                          <div className="relative">
                            <TarotCard
                              card={workspaceCard.card}
                              isFlipped={true}
                              isReversed={workspaceCard.isReversed}
                              size="sm"
                              interactive={false}
                            />
                          </div>

                          {showCardLabels && (
                            <div className="w-[135px] flex flex-col items-center gap-0.5 pointer-events-none z-40">
                              <div className={`max-w-full px-1.5 py-0.5 rounded border text-[8px] font-sans font-bold uppercase tracking-wider truncate flex items-center gap-1 shadow-md ${style.badge}`}>
                                <span className="px-1 py-0.2 rounded bg-black/60 text-gold-light font-black border border-gold-primary/30">
                                  #{workspaceCard.pickOrder}
                                </span>
                                <span className="truncate">
                                  {workspaceCard.label || `${style.label} · Lá ${workspaceCard.pickOrder}`}
                                </span>
                              </div>
                              <span className="max-w-full truncate text-[10px] text-white font-lora drop-shadow">
                                {workspaceCard.card.nameVi} {workspaceCard.isReversed ? '↩' : '✦'}
                              </span>
                            </div>
                          )}

                          {/* TOP-LEFT ZOOM TOGGLE BUTTON FOR ACTIVE CARD */}
                          {isActive && (
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedCardId((prev) => (prev === workspaceCard.id ? null : workspaceCard.id));
                              }}
                              className={`absolute -top-3 ${workspaceCard.locked ? 'left-4' : '-left-3'} w-6.5 h-6.5 rounded-full border border-bg-deep flex items-center justify-center text-[10px] font-bold select-none active:scale-90 transition-all shadow-[0_0_12px_rgba(244,162,97,0.6)] z-50 pointer-events-auto cursor-pointer ${
                                isZoomed
                                  ? 'bg-gold-light text-bg-deep ring-2 ring-gold-primary scale-110'
                                  : 'bg-gold-primary hover:bg-gold-light text-bg-deep'
                              }`}
                              title={isZoomed ? 'Thu nhỏ lá bài về kích thước chuẩn' : 'Phóng to riêng lá bài này (Chạm để phóng to/thu nhỏ)'}
                            >
                              {isZoomed ? '🔍⁻' : '🔍⁺'}
                            </button>
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
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* INLINE FLOATING DECK RIBBON DOCK */}
          <AnimatePresence>
            {showInlineDeckRibbon && inlineDeckComponent && (
              <motion.div
                initial={{ y: 220, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 220, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute bottom-3 left-4 right-4 z-40 max-w-5xl mx-auto bg-[#070711]/92 border border-gold-primary/30 rounded-3xl p-3 md:p-4 shadow-[0_0_35px_rgba(0,0,0,0.85)] backdrop-blur-xl flex flex-col items-center gap-2 select-none"
              >
                <div className="w-full flex items-center justify-between px-2 pb-1 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gold-light font-cinzel font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <span>🃏 Thanh Nhặt Bài Nổi Trực Tiếp</span>
                      <span className="text-text-secondary font-lora text-[10px] italic">
                        ({getRoundStyle(currentRoundNumber).label})
                      </span>
                    </span>
                  </div>
                  {onToggleInlineDeckRibbon && (
                    <button
                      type="button"
                      onClick={onToggleInlineDeckRibbon}
                      className="text-text-secondary hover:text-gold-light transition-colors text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
                    >
                      ✖ Ẩn Thanh Bài
                    </button>
                  )}
                </div>

                <div className="w-full overflow-x-auto scrollbar-thin py-1 flex items-center justify-center min-h-[220px]">
                  {inlineDeckComponent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
