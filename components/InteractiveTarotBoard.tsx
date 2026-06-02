'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import TarotCard from './TarotCard';
import CardInspector from './CardInspector';
import { motion } from 'framer-motion';

export interface InteractiveCard {
  id: string;
  card: TarotCardType;
  isReversed: boolean;
  role: 'core' | 'clarifier' | 'branch-a' | 'branch-b' | 'directional' | 'advice';
  parentSlug?: string;
  parentNameVi?: string;
  customPositionName?: string;
}

interface PlacedCard extends InteractiveCard {
  x: number;
  y: number;
}

interface InteractiveTarotBoardProps {
  cards: InteractiveCard[];
}

export default function InteractiveTarotBoard({ cards }: InteractiveTarotBoardProps) {
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

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
      let x = 475;
      let y = 80;

      if (!c.parentSlug) {
        // Initial cards positioning
        if (numCores === 1) {
          x = 475;
        } else if (numCores === 2) {
          const coreIdx = coreCards.findIndex((core) => core.id === c.id);
          x = coreIdx === 0 ? 325 : 625;
        } else {
          // 3 or more core cards (Past, Present, Future)
          const coreIdx = coreCards.findIndex((core) => core.id === c.id);
          x = 180 + coreIdx * 295;
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
            x = parentX - 150;
            y = parentY + 220;
          } else if (c.role === 'branch-b') {
            x = parentX + 150;
            y = parentY + 220;
          } else if (c.role === 'directional') {
            x = parentX + 120;
            y = parentY;
          } else {
            // Clarifier or advice: fan out horizontally
            const offsetWidth = 110;
            const fanOffset = (siblingIdx - (totalSiblings - 1) / 2) * offsetWidth;
            x = parentX + fanOffset;
            y = parentY + 220;
          }
        } else {
          // Fallback coordinate
          const fallbackIdx = cards.indexOf(c);
          x = 475 + fallbackIdx * 30;
          y = 60 + fallbackIdx * 100;
        }
      }

      results.push({ ...c, x, y });
    });

    return results;
  }, [cards]);

  // Determine dynamic canvas boundaries
  const boundaries = useMemo(() => {
    if (placedCards.length === 0) return { width: 950, height: 600 };
    const xs = placedCards.map((c) => c.x);
    const ys = placedCards.map((c) => c.y);
    const maxX = Math.max(...xs, 800);
    const minX = Math.min(...xs, 100);
    const maxY = Math.max(...ys, 400);

    return {
      width: Math.max(maxX + 150, 950),
      height: Math.max(maxY + 260, 600),
    };
  }, [placedCards]);

  // Smooth scroll center automatically when cards count changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Auto-scroll to center horizontally smoothly on load
    const targetLeft = (boundaries.width - container.clientWidth) / 2;
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
        const targetLeft = (boundaries.width - container.clientWidth) / 2;
        container.scrollTo({ top: 0, left: targetLeft, behavior: 'smooth' });
        break;
    }
  };

  // Figma-like Drag to Scroll (Pan)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click

    const target = e.target as HTMLElement;
    // Do not initiate pan if clicking interactive items (cards, buttons)
    if (target.closest('.cursor-pointer') || target.closest('button') || target.closest('a')) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    container.scrollLeft = dragStart.current.scrollLeft - dx;
    container.scrollTop = dragStart.current.scrollTop - dy;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleCardClick = (card: TarotCardType) => {
    setSelectedCard(card);
    setIsInspectorOpen(true);
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
    <div className="w-full relative overflow-hidden rounded-3xl border border-white/[0.05] bg-[#0c0c1b]/35 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Background stars */}
      <div className="absolute inset-0 bg-radial from-transparent to-black/30 pointer-events-none z-0" />

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

      {/* Main Scrollable Canvas Container with Figma-like Drag Panning */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`w-full relative overflow-x-auto overflow-y-auto max-h-[75vh] md:max-h-[82vh] scrollbar-thin p-6 z-10 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Scroll Tip indicator */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] text-text-secondary/40 font-lora italic pointer-events-none z-10">
          <span>🖐️ Giữ chuột trái & kéo trên bàn để cuộn tự do</span>
        </div>

        <div
          className="relative"
          style={{
            width: `${boundaries.width}px`,
            height: `${boundaries.height}px`,
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
          {placedCards.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.8, y: c.y + 40 }}
              animate={{ opacity: 1, scale: 1, y: c.y }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                delay: idx * 0.05,
              }}
              className="absolute z-10 flex flex-col items-center gap-2 select-none"
              style={{
                left: `${c.x}px`,
                top: `0px`,
                width: `${CARD_WIDTH}px`,
              }}
            >
              {/* 3D Glassmorphic Card */}
              <div className="relative group hover:-translate-y-1.5 transition-transform duration-300">
                <TarotCard
                  card={c.card}
                  isFlipped={true}
                  isReversed={c.isReversed}
                  size="sm"
                  onClick={() => handleCardClick(c.card)}
                  interactive={true}
                  className="shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:shadow-[0_0_15px_rgba(244,162,97,0.25)] transition-shadow duration-300 rounded-lg overflow-hidden border border-white/[0.05]"
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
          ))}

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

      {/* Dynamic Card Inspector modal */}
      {selectedCard && (
        <CardInspector
          card={selectedCard}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
        />
      )}
    </div>
  );
}
