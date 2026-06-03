'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApiKey } from '../ApiKeyProvider';
import { playGhibliSFX } from '@/lib/ghibli-audio';

interface WheelOfFateShuffleProps {
  reduceMotion?: boolean;
}

export default function WheelOfFateShuffle({ reduceMotion = false }: WheelOfFateShuffleProps) {
  const { enableSound } = useApiKey();
  const [stage, setStage] = useState<'spin-in' | 'spiral' | 'burst' | 'done'>('spin-in');

  useEffect(() => {
    if (reduceMotion) {
      setStage('done');
      return;
    }

    // Play synthesized gear clicking rhythm and card burst swoosh
    playGhibliSFX('gear-click', enableSound);
    const clickTimer1 = setTimeout(() => playGhibliSFX('gear-click', enableSound), 300);
    const clickTimer2 = setTimeout(() => playGhibliSFX('gear-click', enableSound), 600);
    const clickTimer3 = setTimeout(() => playGhibliSFX('gear-click', enableSound), 900);
    const burstTimer = setTimeout(() => playGhibliSFX('card-flip', enableSound), 1150);

    const timer1 = setTimeout(() => setStage('spiral'), 400);
    const timer2 = setTimeout(() => setStage('burst'), 1100);
    const timer3 = setTimeout(() => setStage('done'), 1600);

    return () => {
      clearTimeout(clickTimer1);
      clearTimeout(clickTimer2);
      clearTimeout(clickTimer3);
      clearTimeout(burstTimer);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [reduceMotion, enableSound]);

  if (stage === 'done') return null;

  // 8 mini-cards coordinates for the spiral & burst animation
  const cards = Array.from({ length: 8 }, (_, i) => i);

  // Spiral variants
  const getCardVariants = (i: number) => {
    const angle = (i * 2 * Math.PI) / 8;
    const radius = 120;
    const startX = Math.cos(angle) * radius;
    const startY = Math.sin(angle) * radius;

    return {
      'spin-in': {
        x: startX,
        y: startY,
        scale: 0.8,
        rotate: i * 45,
        opacity: 0,
      },
      spiral: {
        x: 0,
        y: 0,
        scale: 0.1,
        rotate: i * 45 + 360,
        opacity: 0.8,
        transition: {
          duration: 0.7,
          ease: 'easeInOut',
        },
      },
      burst: {
        x: startX * 1.3,
        y: startY * 1.3,
        scale: 1,
        rotate: i * 45 + 720,
        opacity: 0,
        transition: {
          type: 'spring',
          stiffness: 120,
          damping: 14,
        },
      },
    };
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm rounded-3xl">
      {/* SVG Gears Container */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center pointer-events-none">
        
        {/* Outer Large Gear */}
        <svg
          viewBox="0 0 100 100"
          className={`absolute w-full h-full text-gold-primary/25 drop-shadow-[0_0_8px_rgba(244,162,97,0.2)] ${
            reduceMotion ? '' : 'animate-gear-cw'
          }`}
        >
          <path
            fill="currentColor"
            d="M50,5 C47,5 45,7 45,10 L45,13 C40.8,13.9 36.9,15.7 33.5,18.2 L31.4,16.1 C29.4,14.1 26.2,14.1 24.2,16.1 C22.2,18.1 22.2,21.3 24.2,23.3 L26.3,25.4 C23.8,28.8 22,32.7 21.1,36.9 L18.1,36.9 C15.1,36.9 13.1,38.9 13.1,41.9 C13.1,44.9 15.1,46.9 18.1,46.9 L21.1,46.9 C22,51.1 23.8,55 26.3,58.4 L24.2,60.5 C22.2,62.5 22.2,65.7 24.2,67.7 C26.2,69.7 29.4,69.7 31.4,67.7 L33.5,65.6 C36.9,68.1 40.8,69.9 45,70.8 L45,73.8 C45,76.8 47,78.8 50,78.8 C53,78.8 55,76.8 55,73.8 L55,70.8 C59.2,69.9 63.1,68.1 66.5,65.6 L68.6,67.7 C70.6,69.7 73.8,69.7 75.8,67.7 C77.8,65.7 77.8,62.5 75.8,60.5 L73.7,58.4 C76.2,55 78,51.1 78.9,46.9 L81.9,46.9 C84.9,46.9 86.9,44.9 86.9,41.9 C86.9,38.9 84.9,36.9 81.9,36.9 L78.9,36.9 C78,32.7 76.2,28.8 73.7,25.4 L75.8,23.3 C77.8,21.3 77.8,18.1 75.8,16.1 C73.8,14.1 70.6,14.1 68.6,16.1 L66.5,18.2 C63.1,15.7 59.2,13.9 55,13 L55,10 C55,7 53,5 50,5 Z M50,22.5 C62.4,22.5 72.5,32.6 72.5,45 C72.5,57.4 62.4,67.5 50,67.5 C37.6,67.5 27.5,57.4 27.5,45 C27.5,32.6 37.6,22.5 50,22.5 Z"
            transform="scale(0.8) translate(12, 12)"
          />
        </svg>

        {/* Inner Small Gear */}
        <svg
          viewBox="0 0 100 100"
          className={`absolute w-3/5 h-3/5 text-gold-light/20 drop-shadow-[0_0_6px_rgba(255,209,102,0.15)] ${
            reduceMotion ? '' : 'animate-gear-ccw'
          }`}
        >
          <path
            fill="currentColor"
            d="M50,5 C47,5 45,7 45,10 L45,13 C40.8,13.9 36.9,15.7 33.5,18.2 L31.4,16.1 C29.4,14.1 26.2,14.1 24.2,16.1 C22.2,18.1 22.2,21.3 24.2,23.3 L26.3,25.4 C23.8,28.8 22,32.7 21.1,36.9 L18.1,36.9 C15.1,36.9 13.1,38.9 13.1,41.9 C13.1,44.9 15.1,46.9 18.1,46.9 L21.1,46.9 C22,51.1 23.8,55 26.3,58.4 L24.2,60.5 C22.2,62.5 22.2,65.7 24.2,67.7 C26.2,69.7 29.4,69.7 31.4,67.7 L33.5,65.6 C36.9,68.1 40.8,69.9 45,70.8 L45,73.8 C45,76.8 47,78.8 50,78.8 C53,78.8 55,76.8 55,73.8 L55,70.8 C59.2,69.9 63.1,68.1 66.5,65.6 L68.6,67.7 C70.6,69.7 73.8,69.7 75.8,67.7 C77.8,65.7 77.8,62.5 75.8,60.5 L73.7,58.4 C76.2,55 78,51.1 78.9,46.9 L81.9,46.9 C84.9,46.9 86.9,44.9 86.9,41.9 C86.9,38.9 84.9,36.9 81.9,36.9 L78.9,36.9 C78,32.7 76.2,28.8 73.7,25.4 L75.8,23.3 C77.8,21.3 77.8,18.1 75.8,16.1 C73.8,14.1 70.6,14.1 68.6,16.1 L66.5,18.2 C63.1,15.7 59.2,13.9 55,13 L55,10 C55,7 53,5 50,5 Z M50,22.5 C62.4,22.5 72.5,32.6 72.5,45 C72.5,57.4 62.4,67.5 50,67.5 C37.6,67.5 27.5,57.4 27.5,45 C27.5,32.6 37.6,22.5 50,22.5 Z"
            transform="scale(0.8) translate(12, 12)"
          />
        </svg>

        {/* Center Glowing Heart/Crystal */}
        <div
          className={`absolute w-12 h-12 rounded-full bg-radial from-gold-light via-gold-primary to-transparent opacity-85 z-10 flex items-center justify-center border border-gold-light/40 shadow-[0_0_20px_var(--color-gold-glow)] ${
            reduceMotion ? '' : 'animate-pulse'
          }`}
        >
          <span className="text-xs">👁️</span>
        </div>

        {/* Orbiting Staggered Runes */}
        {!reduceMotion && (
          <div className="absolute inset-0 animate-[spin_40s_linear_infinite] opacity-60">
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-sans text-gold-light tracking-widest">ᛘ</span>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-sans text-gold-light tracking-widest">ᚠ</span>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-sans text-gold-light tracking-widest">ᚦ</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-sans text-gold-light tracking-widest">ᚱ</span>
          </div>
        )}

        {/* Cards Spiral Layer */}
        {cards.map((id) => (
          <motion.div
            key={id}
            variants={getCardVariants(id) as any}
            animate={stage}
            initial="spin-in"
            className="absolute w-8 h-14 bg-gradient-to-br from-[#1a1a3e] to-[#0d0d1a] border border-gold-primary/30 rounded-md shadow-md flex items-center justify-center"
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <div className="w-full h-full border border-gold-light/10 rounded-sm m-[1px] bg-[radial-gradient(rgba(244,162,97,0.1)_1px,transparent_8px)] bg-[size:10px_10px]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
