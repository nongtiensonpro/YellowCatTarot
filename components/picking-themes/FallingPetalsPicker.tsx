'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardBack from '../CardBack';
import { useApiKey } from '../ApiKeyProvider';
import { playGhibliSFX } from '@/lib/ghibli-audio';

interface FallingPetalsPickerProps {
  cardsCount: number;
  onSelectCard: (index: number) => void;
  reduceMotion?: boolean;
}

interface DriftingCard {
  id: string; // Unique id for React rendering key
  index: number; // Index in the cardsCount deck
  x: number; // Current starting X position
  y: number; // Current starting Y position
  delay: number;
  duration: number;
}

export default function FallingPetalsPicker({
  cardsCount,
  onSelectCard,
  reduceMotion = false,
}: FallingPetalsPickerProps) {
  const { enableSound } = useApiKey();
  const [activeDrifters, setActiveDrifters] = useState<DriftingCard[]>([]);
  const maxActiveDrifters = Math.min(10, cardsCount);

  // Static list for fallback when reduceMotion is active
  const staticCards = Array.from({ length: Math.min(12, cardsCount) }, (_, i) => i);

  // Initialize/refill drifting cards pool
  useEffect(() => {
    if (reduceMotion) return;

    // Build initial drifters
    const initialList: DriftingCard[] = [];
    const count = Math.min(maxActiveDrifters, cardsCount);

    for (let i = 0; i < count; i++) {
      initialList.push(createDrifter(i, i * 0.8));
    }
    setActiveDrifters(initialList);
  }, [cardsCount, reduceMotion]);

  // Create a single drifter with randomized wind/petal values
  const createDrifter = (index: number, delayOverride?: number): DriftingCard => {
    // Start slightly off-screen on the left/top
    const startX = -100 + Math.random() * 400; // Left-to-mid top edge
    const startY = -120; // Above screen

    return {
      id: `petal-card-${index}-${Date.now()}-${Math.random()}`,
      index,
      x: startX,
      y: startY,
      delay: delayOverride !== undefined ? delayOverride : 0,
      duration: 8 + Math.random() * 5, // 8-13 seconds flight time
    };
  };

  // Recycles a card when it flies off screen or is picked
  const handleRecycle = (id: string, completedIndex: number) => {
    setActiveDrifters((prev) => {
      // Find index in current active state
      const targetIdx = prev.findIndex((c) => c.id === id);
      if (targetIdx === -1) return prev;

      // Swap in a new card drifter using the same index or next available
      const newList = [...prev];
      // Pick a random available index from the remaining cards
      const nextCardIndex = Math.floor(Math.random() * cardsCount);
      newList[targetIdx] = createDrifter(nextCardIndex);
      return newList;
    });
  };

  const handleCardClick = (drifterId: string, index: number) => {
    // Play synthesized wind chime sound
    playGhibliSFX('wind-chime', enableSound);

    // Select the card
    onSelectCard(index);

    // Recycle immediately
    if (!reduceMotion) {
      handleRecycle(drifterId, index);
    }
  };

  // -------------------------------------------------------------
  // RENDER STATIC FALLBACK FOR REDUCE MOTION
  // -------------------------------------------------------------
  if (reduceMotion) {
    return (
      <div className="relative w-full h-[320px] md:h-[380px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#1a0e1c] via-[#0d0d1a] to-[#12122a] border border-[#ff6b9d]/15 flex flex-col items-center justify-center p-4">
        {/* Soft petals background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#ff6b9d_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <h4 className="font-cinzel text-xs text-[#ff6b9d]/80 uppercase tracking-widest mb-4">
          Cánh Hoa Lặng Trôi (Reduce Motion)
        </h4>

        {/* Elegant static grid grid of petals */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3 max-w-full justify-center">
          {staticCards.map((id) => (
            <motion.div
              key={id}
              whileHover={{ scale: 1.05, y: -4 }}
              onClick={() => {
                playGhibliSFX('wind-chime', enableSound);
                onSelectCard(id);
              }}
              className="w-[60px] h-[105px] md:w-[70px] md:h-[120px] cursor-pointer rounded-lg relative border border-[#ff6b9d]/30 hover:border-[#ff6b9d] transition-all shadow-md"
            >
              <CardBack className="border-[#ff6b9d]/20" />
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] text-text-secondary/50 font-lora italic mt-4 text-center">
          Chọn một lá bài hoa anh đào từ bảng để tiếp tục...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER DYNAMIC FLOWING PETALS (GPU ANIMATED)
  // -------------------------------------------------------------
  return (
    <div className="relative w-full h-[320px] md:h-[380px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#1a0d1a]/90 via-[#0d0d1a]/95 to-[#12122a] border border-[#ff6b9d]/20 flex flex-col justify-center select-none shadow-2xl">
      {/* Dynamic drifting background decorative petals */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
        <div className="absolute top-[10%] left-[20%] w-2 h-2 rounded-full bg-[#ff6b9d] animate-cherry-petal" style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <div className="absolute top-[20%] left-[40%] w-3 h-3 rounded-full bg-[#ffccd5] animate-cherry-petal" style={{ animationDelay: '1.5s', animationDuration: '9s' }} />
        <div className="absolute top-[5%] left-[70%] w-2.5 h-2.5 rounded-full bg-[#ff6b9d]/60 animate-cherry-petal" style={{ animationDelay: '3s', animationDuration: '8s' }} />
        <div className="absolute top-[15%] left-[85%] w-2 h-2 rounded-full bg-[#ffccd5]/85 animate-cherry-petal" style={{ animationDelay: '4.5s', animationDuration: '10s' }} />
      </div>

      {/* Wind Flow lines indicators */}
      <div className="absolute top-8 left-6 flex items-center gap-1.5 pointer-events-none opacity-40 z-10">
        <span className="text-[10px] font-sans font-bold text-[#ff6b9d] tracking-widest">🌬️ DÒNG GIÓ THỔI</span>
        <div className="w-16 h-[1px] bg-gradient-to-r from-[#ff6b9d] to-transparent" />
      </div>

      {/* Drifting Cards Stage */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        <AnimatePresence>
          {activeDrifters.map((card) => {
            // Bezier flight coordinates: Top-left/Mid-top to Bottom-right + swaying
            const targetX = card.x + 400 + Math.random() * 200;
            const targetY = 500; // Off-screen bottom

            return (
              <motion.div
                key={card.id}
                initial={{
                  x: card.x,
                  y: card.y,
                  rotate: -15 + Math.random() * 30,
                  opacity: 0,
                }}
                animate={{
                  x: [card.x, card.x + 150, card.x + 50, targetX],
                  y: [card.y, card.y + 150, card.y + 300, targetY],
                  rotate: [0, 45, 90, 180 + Math.random() * 180],
                  opacity: [0, 1, 1, 0],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: card.duration,
                  delay: card.delay,
                  ease: 'easeInOut',
                }}
                onAnimationComplete={() => handleRecycle(card.id, card.index)}
                whileHover={{
                  scale: 1.15,
                  filter: 'drop-shadow(0 0 12px rgba(255,107,157,0.7))',
                  transition: { duration: 0.15 },
                }}
                onClick={() => handleCardClick(card.id, card.index)}
                className="absolute w-[64px] h-[110px] md:w-[80px] md:h-[138px] cursor-pointer rounded-lg shadow-xl"
                style={{ originX: 0.5, originY: 0.5 }}
              >
                {/* Tiny cherry mark on card back for falling petal theme */}
                <CardBack className="border-[#ff6b9d]/30 group-hover:border-[#ff6b9d] transition-colors" />
                <div className="absolute bottom-1 right-1 text-[8px]">🌸</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating help text at the bottom */}
      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-30 select-none">
        <p className="text-[10px] md:text-xs text-text-secondary/50 font-lora italic leading-none">
          Chạm vào "cánh hoa lá bài" đang bay nhẹ để bắt lấy lá bài định mệnh...
        </p>
      </div>
    </div>
  );
}
