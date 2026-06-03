'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CardBack from '../CardBack';
import { useApiKey } from '../ApiKeyProvider';
import { playGhibliSFX } from '@/lib/ghibli-audio';

interface ReflectingPoolPickerProps {
  cardsCount: number;
  onSelectCard: (index: number) => void;
  reduceMotion?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export default function ReflectingPoolPicker({
  cardsCount,
  onSelectCard,
  reduceMotion = false,
}: ReflectingPoolPickerProps) {
  const { enableSound } = useApiKey();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Deck cards list
  const [cards, setCards] = useState<number[]>([]);
  useEffect(() => {
    setCards(Array.from({ length: cardsCount }, (_, i) => i));
  }, [cardsCount]);

  // Canvas Ripple Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on parent bounding box
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Ripple Drawing Animation Loop (Canvas Sleep Loop)
    const drawRipples = () => {
      if (ripplesRef.current.length === 0) {
        // Sleep loop
        animationFrameRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ripplesRef.current.forEach((ripple, idx) => {
        ripple.radius += ripple.speed;
        ripple.opacity -= 0.015;

        if (ripple.opacity <= 0) {
          ripplesRef.current.splice(idx, 1);
          return;
        }

        // Draw concentric ripple circles
        for (let i = 0; i < 3; i++) {
          const r = ripple.radius - i * 16;
          if (r > 0) {
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, r, 0, 2 * Math.PI);
            ctx.strokeStyle = `rgba(183, 212, 231, ${ripple.opacity * (1 - i * 0.25)})`;
            ctx.lineWidth = 1.5 - i * 0.3;
            ctx.stroke();
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(drawRipples);
    };

    const triggerRippleAt = (x: number, y: number) => {
      if (reduceMotion) return;

      const newRipple: Ripple = {
        x,
        y,
        radius: 5,
        maxRadius: 120,
        opacity: 0.8,
        speed: 2.2,
      };

      ripplesRef.current.push(newRipple);

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(drawRipples);
      }
    };

    // Expose trigger to parent container click handler
    (canvas as any).triggerRippleAt = triggerRippleAt;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [reduceMotion]);

  // Click card event
  const handleCardClick = (e: React.MouseEvent, index: number) => {
    const canvas = canvasRef.current;
    if (canvas && (canvas as any).triggerRippleAt && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;
      (canvas as any).triggerRippleAt(clickX, clickY);
    }

    // Play synthesized water drop sound
    playGhibliSFX('water-drop', enableSound);

    // Slightly delayed selection to allow ripple animation to begin
    setTimeout(() => {
      onSelectCard(index);
    }, 250);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[320px] md:h-[380px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#081c15]/85 via-[#0d0d1a]/95 to-[#12122a] border border-forest-green/20 flex flex-col justify-center select-none shadow-2xl"
    >
      {/* Lily pad decorations in background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <svg className="absolute top-8 left-[10%] w-8 h-8 text-forest-green" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12,2 L12,12 L22,12 A10,10 0 0,0 12,2 Z" fill="#081c15" />
        </svg>
        <svg className="absolute bottom-12 right-[15%] w-12 h-12 text-forest-green" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12,2 L12,12 L22,12 A10,10 0 0,0 12,2 Z" fill="#081c15" />
        </svg>
      </div>

      {/* Ripple Canvas overlay behind cards */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />

      {/* Horizontal river layout of floating cards */}
      <div className="relative z-20 w-full overflow-x-auto flex items-center gap-6 px-12 py-6 scrollbar-none snap-x pointer-events-auto">
        <div className="flex items-center gap-6 md:gap-8 mx-auto">
          {cards.map((id, index) => {
            const isEven = index % 2 === 0;
            const tilt = isEven ? 'rotate-1' : '-rotate-1';
            const bobbingClass = reduceMotion ? '' : 'animate-water-bobbing';

            return (
              <div
                key={id}
                className="flex-shrink-0 snap-center relative flex flex-col items-center"
                style={{
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                {/* Visual Reflection beneath card */}
                {!reduceMotion && (
                  <div
                    className="absolute top-[102%] w-[90px] h-[155px] md:w-[110px] md:h-[190px] opacity-15 filter blur-[2px] transition-all duration-300 pointer-events-none"
                    style={{
                      transform: 'scaleY(-1) skewX(2deg)',
                      transformOrigin: 'top center',
                      background: 'radial-gradient(ellipse at bottom, transparent, rgba(8,28,21,0.5))',
                    }}
                  >
                    <CardBack className="border-[#081c15] grayscale pointer-events-none" />
                  </div>
                )}

                {/* Floating Card Container */}
                <motion.div
                  whileHover={
                    reduceMotion
                      ? {}
                      : {
                          y: -12,
                          scale: 1.06,
                          filter: 'drop-shadow(0 8px 16px rgba(244,162,97,0.3))',
                        }
                  }
                  onClick={(e) => handleCardClick(e, index)}
                  className={`w-[90px] h-[155px] md:w-[110px] md:h-[190px] cursor-pointer rounded-xl group relative ${bobbingClass} ${tilt} transition-shadow duration-300`}
                >
                  <CardBack className="border-gold-primary/30 group-hover:border-gold-primary/70 transition-all duration-300" />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text at the bottom */}
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-30 select-none">
        <p className="text-[10px] md:text-xs text-text-secondary/50 font-lora italic leading-none">
          Cuộn ngang dòng nước trôi và chạm vào một lá bài để rút bài...
        </p>
      </div>

      <style jsx>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
