'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApiKey } from '../ApiKeyProvider';
import { playGhibliSFX } from '@/lib/ghibli-audio';

interface SootSpriteShuffleProps {
  onStop?: () => void;
  reduceMotion?: boolean;
}

export default function SootSpriteShuffle({ onStop, reduceMotion = false }: SootSpriteShuffleProps) {
  const { enableSound } = useApiKey();
  const [isStopping, setIsStopping] = useState(false);
  const [spritePositions, setSpritePositions] = useState<any[]>([]);

  // 6 Soot Sprites definitions
  const spriteCount = 6;

  useEffect(() => {
    // Generate random paths for the soot sprites
    const paths = Array.from({ length: spriteCount }, (_, i) => {
      // Random coordinates inside a bounding box
      const startX = -100 - Math.random() * 100;
      const startY = 50 + Math.random() * 250;
      const midX = 100 + Math.random() * 400;
      const midY = 50 + Math.random() * 250;
      const endX = 800 + Math.random() * 100;
      const endY = 50 + Math.random() * 250;

      return {
        id: i,
        // Paths for x and y
        xPath: [startX, midX, endX],
        yPath: [startY, midY, endY],
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 0.5,
        scale: 0.8 + Math.random() * 0.4,
      };
    });
    setSpritePositions(paths);

    // Play synthesized soot squeak sound on mount
    playGhibliSFX('soot-squeak', enableSound);
    const sqTimer = setTimeout(() => {
      playGhibliSFX('soot-squeak', enableSound);
    }, 450);

    return () => clearTimeout(sqTimer);
  }, [enableSound]);

  const handleStop = () => {
    if (isStopping) return;
    setIsStopping(true);

    // Play mechanical gear stop click
    playGhibliSFX('gear-click', enableSound);

    if (reduceMotion) {
      if (onStop) onStop();
      return;
    }

    // Cute stop animation: sprite jumps, drops card, and runs off screen
    setTimeout(() => {
      if (onStop) onStop();
    }, 1200);
  };

  // If reduceMotion is active, bypass interactive shuffle and stop immediately
  useEffect(() => {
    if (reduceMotion) {
      const timer = setTimeout(() => {
        if (onStop) onStop();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [reduceMotion, onStop]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-[#0d0d1a]/50 backdrop-blur-sm rounded-3xl">
      {/* Sprite Stage */}
      <div className="relative w-full h-full min-h-[300px] md:min-h-[400px]">
        {/* Ambient dust particles in background */}
        {!reduceMotion && (
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
        )}

        {/* Sprites rendering */}
        {spritePositions.map((sprite) => {
          // If we are stopping, sprites move to a neat row at the bottom
          const stopX = (sprite.id - (spriteCount - 1) / 2) * 80 + 350;
          const stopY = 280;

          return (
            <motion.div
              key={sprite.id}
              initial={{
                x: sprite.xPath[0],
                y: sprite.yPath[0],
                scale: sprite.scale,
              }}
              animate={
                isStopping
                  ? {
                      x: stopX,
                      y: stopY,
                      scale: 0.9,
                      transition: { type: 'spring', stiffness: 90, damping: 12 },
                    }
                  : {
                      x: sprite.xPath,
                      y: sprite.yPath,
                      transition: {
                        duration: sprite.duration,
                        delay: sprite.delay,
                        repeat: Infinity,
                        repeatType: 'loop',
                        ease: 'easeInOut',
                      },
                    }
              }
              className="absolute w-12 h-12 flex flex-col items-center justify-center select-none"
              style={{ originX: 0.5, originY: 0.5 }}
            >
              {/* Miniature Card back sitting on top of soot sprite head */}
              <motion.div
                animate={
                  isStopping
                    ? { y: -25, rotate: 0 }
                    : { y: [-15, -22, -15], rotate: [-2, 2, -2] }
                }
                transition={
                  isStopping
                    ? { type: 'spring', damping: 10 }
                    : { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
                }
                className="w-7 h-12 bg-gradient-to-b from-gold-primary to-gold-dark border border-gold-light/40 rounded-sm shadow-md flex items-center justify-center z-10"
              >
                <div className="w-[85%] h-[85%] border border-gold-light/10 rounded-sm bg-black/30" />
              </motion.div>

              {/* Soot Sprite Body */}
              <div
                className={`w-10 h-10 bg-black rounded-full shadow-[0_0_12px_rgba(0,0,0,0.85)] relative flex items-center justify-center z-20 ${
                  reduceMotion ? '' : 'animate-pulse'
                }`}
                style={{
                  boxShadow:
                    '0 0 0 1px #000, 0 0 10px rgba(0,0,0,0.9), 0 -4px 6px -2px #111, 4px 0 6px -2px #111, -4px 0 6px -2px #111, 0 4px 6px -2px #111',
                }}
              >
                {/* Sprites Fuzzy spikes using SVG overlay in 2D */}
                <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full text-black">
                  <path
                    fill="currentColor"
                    d="M 20 2 L 23 7 L 27 3 L 28 8 L 33 5 L 32 10 L 37 9 L 34 14 L 39 15 L 34 18 L 38 21 L 33 22 L 36 26 L 31 27 L 33 32 L 28 31 L 29 36 L 24 33 L 23 38 L 20 34 L 17 38 L 16 33 L 11 36 L 12 31 L 7 32 L 9 27 L 4 26 L 7 22 L 2 21 L 6 18 L 1 15 L 6 14 L 3 9 L 8 10 L 7 5 L 12 8 L 13 3 L 17 7 Z"
                  />
                </svg>

                {/* Big White Eyes */}
                <div className="absolute w-7 h-3 top-3.5 left-1.5 flex justify-between px-1 z-30">
                  {/* Eye Left */}
                  <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                    <motion.div
                      animate={isStopping ? { scaleY: 0.1 } : { x: [-0.5, 0.5, -0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1 h-1 bg-black rounded-full"
                    />
                  </div>
                  {/* Eye Right */}
                  <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                    <motion.div
                      animate={isStopping ? { scaleY: 0.1 } : { x: [-0.5, 0.5, -0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1 h-1 bg-black rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Manual Stop Button */}
      {onStop && !isStopping && (
        <button
          onClick={handleStop}
          className="absolute bottom-6 px-6 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep font-sans font-bold text-xs uppercase tracking-widest cursor-pointer shadow-[0_0_12px_rgba(244,162,97,0.4)] hover:shadow-[0_0_18px_rgba(255,209,102,0.6)] border border-gold-light/20 transition-all select-none active:scale-95"
        >
          <span>🛑 Dừng Xáo Bài</span>
        </button>
      )}
    </div>
  );
}
