'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard, tarotCards } from '@/lib/cards-data';

interface CardInspectorProps {
  card: TarotCard;
  isOpen: boolean;
  onClose: () => void;
}

export default function CardInspector({ card, isOpen, onClose }: CardInspectorProps) {
  const [currentCard, setCurrentCard] = useState<TarotCard>(card);
  const [zoomScale, setZoomScale] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect screen size on mount & when isOpen changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-hide info panel on mobile to focus on card image, show by default on desktop
      setShowInfo(!mobile);
    }
  }, [isOpen]);

  // Reset state when card changes
  useEffect(() => {
    setCurrentCard(card);
    setZoomScale(1);
  }, [card]);

  // Handle keyboard shortcuts (Escape, Left, Right Arrow)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentCard]);

  // Navigate to previous card
  const handlePrev = () => {
    setZoomScale(1);
    const currentIndex = tarotCards.findIndex((c) => c.id === currentCard.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tarotCards.length - 1;
    setCurrentCard(tarotCards[prevIndex]);
  };

  // Navigate to next card
  const handleNext = () => {
    setZoomScale(1);
    const currentIndex = tarotCards.findIndex((c) => c.id === currentCard.id);
    const nextIndex = currentIndex < tarotCards.length - 1 ? currentIndex + 1 : 0;
    setCurrentCard(tarotCards[nextIndex]);
  };

  // Zoom In / Zoom Out controls
  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  // Double click to zoom toggle
  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
    } else {
      setZoomScale(2);
    }
  };

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(prev + 0.25, 3));
    } else {
      setZoomScale(prev => Math.max(prev - 0.25, 1));
    }
  };

  // Touch handlers for swipe actions on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoomScale > 1) return; // Prevent swiping while zoomed in
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;
    
    // Swipe distance threshold: 60px
    if (Math.abs(diff) > 60) {
      if (diff > 0) {
        handlePrev(); // Swipe Right -> Prev card
      } else {
        handleNext(); // Swipe Left -> Next card
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-md select-none font-sans overflow-hidden"
          onWheel={handleWheel}
        >
          {/* Subtle Ghibli-themed background particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gold-primary rounded-full blur-[1px] animate-[sparkleFloat_8s_infinite]"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          {/* TOP CONTROLS BAR */}
          <div className="w-full h-16 px-4 md:px-6 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent z-30">
            {/* Title / Info */}
            <div className="text-white flex-1 min-w-0 pr-4">
              <h3 className="font-cinzel text-sm md:text-lg font-bold text-gold-light truncate tracking-wide leading-tight">
                {currentCard.nameVi}
              </h3>
              <p className="text-4xs md:text-xs text-text-secondary/70 italic font-lora truncate">
                {currentCard.nameEn} • {currentCard.arcana === 'major' ? 'Đại Bí Ẩn' : 'Tiểu Bí Ẩn'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
              {/* Zoom Out Button */}
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="p-1.5 md:p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gold-primary/30 transition-all text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs"
                title="Thu nhỏ"
              >
                ➖
              </button>

              {/* Zoom Scale Indicator */}
              <span className="text-4xs md:text-xs text-gold-light font-bold w-10 md:w-12 text-center bg-black/40 py-1 rounded-md border border-white/5">
                {Math.round(zoomScale * 100)}%
              </span>

              {/* Zoom In Button */}
              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 3}
                className="p-1.5 md:p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gold-primary/30 transition-all text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs"
                title="Phóng to"
              >
                ➕
              </button>

              {/* Reset Zoom Button */}
              {zoomScale > 1 && (
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 md:p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-4xs md:text-xs font-semibold text-gold-light cursor-pointer transition-all"
                >
                  Reset
                </button>
              )}

              {/* Toggle Info Panel */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-1.5 md:p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-gold-primary/30 transition-all text-white cursor-pointer text-xs ${
                  showInfo ? 'text-gold-light border-gold-primary/40 bg-white/10' : ''
                }`}
                title={showInfo ? "Ẩn thông tin" : "Hiện thông tin"}
              >
                {showInfo ? '🙈' : '📖'}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 md:p-2 rounded-lg bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_10px_var(--color-gold-glow)] font-bold text-4xs md:text-xs px-3 md:px-4"
              >
                Đóng
              </button>
            </div>
          </div>

          {/* MAIN CONTAINER */}
          <div className="flex-1 w-full flex flex-col md:flex-row items-center justify-center p-4 md:p-6 overflow-hidden relative">
            
            {/* LEFT NAVIGATION ARROW (Translucent Floating) */}
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-4 z-20 p-2.5 md:p-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/80 hover:border-gold-primary/40 text-white font-bold cursor-pointer transition-all shadow-xl active:scale-95"
              title="Lá bài trước"
            >
              ◀
            </button>

            {/* ART WORK VIEWPORT */}
            <div
              ref={containerRef}
              className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative"
              style={{ cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <motion.div
                key={currentCard.id}
                drag={zoomScale > 1}
                dragConstraints={containerRef}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                animate={{ scale: zoomScale }}
                transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                onDoubleClick={handleDoubleClick}
                className="relative max-h-[70vh] md:max-h-[82vh] aspect-[1501/2553] h-[65vh] md:h-[80vh] rounded-2xl md:rounded-3xl overflow-hidden border-2 border-gold-primary/30 shadow-[0_0_40px_rgba(0,0,0,0.85)]"
              >
                <div className="absolute inset-1.5 border border-white/10 rounded-[inherit] z-10 pointer-events-none" />
                <Image
                  src={currentCard.imagePath}
                  alt={currentCard.nameVi}
                  fill
                  sizes="(max-width: 768px) 90vw, 50vw"
                  className="object-cover"
                  priority
                />
              </motion.div>
            </div>

            {/* RIGHT NAVIGATION ARROW (Translucent Floating) */}
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 z-20 p-2.5 md:p-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/80 hover:border-gold-primary/40 text-white font-bold cursor-pointer transition-all shadow-xl active:scale-95"
              title="Lá bài kế tiếp"
            >
              ▶
            </button>

            {/* SIDE PANEL: INFO OVERLAY (Optimized for both Desktop & Mobile Drawers) */}
            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={isMobile ? { y: 300, opacity: 0 } : { x: 300, opacity: 0 }}
                  animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                  exit={isMobile ? { y: 300, opacity: 0 } : { x: 300, opacity: 0 }}
                  className="w-full md:w-80 max-h-[40vh] md:max-h-[80vh] md:h-[80vh] bg-bg-surface/90 backdrop-blur-xl border border-white/10 rounded-t-2xl md:rounded-3xl p-4 md:p-5 md:ml-6 flex flex-col gap-3 overflow-y-auto text-sm text-text-primary z-20 shadow-2xl absolute bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto"
                >
                  {/* Close panel button for Mobile */}
                  {isMobile && (
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-1 flex-shrink-0" onClick={() => setShowInfo(false)} />
                  )}

                  <div className="border-b border-gold-primary/10 pb-2.5 flex justify-between items-start">
                    <div>
                      <h4 className="font-cinzel text-sm md:text-lg font-bold text-gold-light">
                        {currentCard.nameVi}
                      </h4>
                      <p className="text-4xs md:text-xs text-text-secondary italic">
                        {currentCard.nameEn}
                      </p>
                    </div>
                    <span className="text-4xs font-semibold px-2 py-0.5 rounded bg-gold-primary/10 text-gold-light border border-gold-primary/20 uppercase tracking-widest font-sans">
                      #{currentCard.id}
                    </span>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1">
                    {currentCard.keywordsVi.map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-4xs font-semibold px-2 py-0.5 rounded bg-white/5 text-text-secondary border border-white/5 uppercase"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Meaning Upright */}
                  <div className="bg-[#2d6a4f]/5 border border-[#2d6a4f]/20 rounded-xl p-2.5 md:p-3 flex flex-col gap-0.5 font-lora">
                    <h5 className="font-sans font-bold text-4xs uppercase tracking-widest text-green-400 flex items-center gap-1">
                      ✦ Ý Nghĩa Chiều Xuôi
                    </h5>
                    <p className="text-3xs md:text-xs leading-relaxed text-text-primary/90">
                      {currentCard.meaningUpright}
                    </p>
                  </div>

                  {/* Meaning Reversed */}
                  <div className="bg-[#e76f51]/5 border border-[#e76f51]/20 rounded-xl p-2.5 md:p-3 flex flex-col gap-0.5 font-lora">
                    <h5 className="font-sans font-bold text-4xs uppercase tracking-widest text-gold-dark flex items-center gap-1">
                      ↩ Ý Nghĩa Chiều Ngược
                    </h5>
                    <p className="text-3xs md:text-xs leading-relaxed text-text-primary/90">
                      {currentCard.meaningReversed}
                    </p>
                  </div>

                  {/* Quick Usage Tip */}
                  <div className="mt-auto border-t border-white/5 pt-2 text-4xs text-text-secondary/40 font-lora italic text-center hidden md:block">
                    Cuộn chuột hoặc nhấp đúp để phóng to. Nhấp kéo để di chuyển. Vuốt màn hình để chuyển bài.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MOBILE TOGGLE OVERLAY */}
          {isMobile && !showInfo && (
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={() => setShowInfo(true)}
              className="mb-4 z-30 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-gold-primary/30 text-gold-light text-2xs font-sans font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg active:scale-95"
            >
              📖 Xem chi tiết ý nghĩa
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
