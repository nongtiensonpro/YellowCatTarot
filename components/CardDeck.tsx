'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CardBack from './CardBack';

interface CardDeckProps {
  cardsCount?: number;
  onSelectCard: (index: number) => void;
  isShuffling: boolean;
  isDeckSpread: boolean;
}

export default function CardDeck({
  cardsCount = 9,
  onSelectCard,
  isShuffling,
  isDeckSpread,
}: CardDeckProps) {
  const [deck, setDeck] = useState<number[]>([]);

  // Initialize deck keys
  useEffect(() => {
    setDeck(Array.from({ length: cardsCount }, (_, i) => i));
  }, [cardsCount]);

  // Framer Motion variants for shuffling and spreading
  const getCardVariants = (index: number) => {
    // 1. Shuffling variant
    if (isShuffling) {
      return {
        x: [0, (index % 2 === 0 ? 50 : -50), 0, (index % 2 === 0 ? -40 : 40), 0],
        y: [0, -10, 0, -5, 0],
        rotate: [0, (index % 2 === 0 ? 15 : -15), 0, (index % 2 === 0 ? -8 : 8), 0],
        scale: [1, 1.05, 1, 1.02, 1],
        transition: {
          duration: 1.5,
          ease: 'easeInOut',
          delay: index * 0.05,
        },
      };
    }

    // 2. Spread out in a nice arc layout variant
    if (isDeckSpread) {
      const mid = (cardsCount - 1) / 2;
      const offset = index - mid; // Khoảng cách tới quân bài giữa
      
      // Tính toán vị trí hình cánh cung
      const radius = 300; // bán kính cung
      const angle = (offset * 12 * Math.PI) / 180; // góc quay cho mỗi quân (12 độ)
      
      const x = Math.sin(angle) * radius;
      const y = (1 - Math.cos(angle)) * radius + 10;
      const rotate = offset * 12; // xoay quân bài tương ứng

      return {
        x,
        y,
        rotate,
        scale: 1,
        z: index,
        transition: {
          type: 'spring',
          stiffness: 70,
          damping: 14,
          delay: index * 0.04,
        },
      };
    }

    // 3. Normal stacked deck variant
    return {
      x: 0,
      y: index * -1.5, // Chênh lệch nhẹ tạo độ dày cho bộ bài úp
      rotate: 0,
      scale: 1,
      z: index,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    };
  };

  return (
    <div className="relative w-full h-[360px] md:h-[420px] flex items-center justify-center select-none overflow-visible">
      {/* Deck center anchor */}
      <div className="absolute top-[20px] md:top-[40px] flex items-center justify-center overflow-visible">
        {deck.map((id, index) => {
          const variants = getCardVariants(index);

          return (
            <motion.div
              key={id}
              custom={index}
              animate={variants as any}
              whileHover={
                isDeckSpread && !isShuffling
                  ? {
                      y: (variants as any).y - 25, // Bay lên cao hơn khi hover
                      scale: 1.06,
                      z: 100, // Nổi lên trên cùng
                      transition: { duration: 0.2, ease: 'easeOut' as any },
                    }
                  : undefined
              }
              onClick={() => {
                if (isDeckSpread && !isShuffling) {
                  onSelectCard(index);
                }
              }}
              className={`absolute w-[110px] h-[190px] md:w-[130px] md:h-[225px] origin-bottom-center ${
                isDeckSpread && !isShuffling
                  ? 'cursor-pointer hover:drop-shadow-[0_0_15px_rgba(255,209,102,0.45)]'
                  : ''
              }`}
              style={{
                transformOrigin: 'bottom center',
              }}
            >
              <CardBack className="border-gold-light/40 group-hover:border-gold-light transition-colors" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
