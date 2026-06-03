'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CardBack from './CardBack';
import WheelOfFateShuffle from './shuffle-themes/WheelOfFateShuffle';
import SootSpriteShuffle from './shuffle-themes/SootSpriteShuffle';
import WeatherOverlay from './shuffle-themes/WeatherOverlay';
import ReflectingPoolPicker from './picking-themes/ReflectingPoolPicker';
import FallingPetalsPicker from './picking-themes/FallingPetalsPicker';
import { useApiKey } from './ApiKeyProvider';
import { playGhibliSFX } from '@/lib/ghibli-audio';

interface CardDeckProps {
  cardsCount?: number;
  onSelectCard: (index: number) => void;
  isShuffling: boolean;
  isDeckSpread: boolean;
  shuffleTheme?: 'classic' | 'wheel-of-fate' | 'soot-sprite';
  pickingTheme?: 'classic' | 'reflecting-pool' | 'falling-petals';
  weatherEffect?: 'wind' | 'sun' | 'fog' | null;
  reduceMotion?: boolean;
  onStopShuffle?: () => void;
}

export default function CardDeck({
  cardsCount = 9,
  onSelectCard,
  isShuffling,
  isDeckSpread,
  shuffleTheme = 'classic',
  pickingTheme = 'classic',
  weatherEffect = null,
  reduceMotion = false,
  onStopShuffle,
}: CardDeckProps) {
  const { enableSound } = useApiKey();
  const [deck, setDeck] = useState<number[]>([]);
  const [screenWidth, setScreenWidth] = useState(768); // Giá trị mặc định an toàn cho SSR

  // Khởi tạo và theo dõi kích thước màn hình để responsive hoàn hảo
  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize deck keys
  useEffect(() => {
    setDeck(Array.from({ length: cardsCount }, (_, i) => i));
  }, [cardsCount]);

  // ═══════════════════════════════════════════════════════════════
  // LAYOUT ENGINE: Tính toán bố cục đa hàng thích ứng thông minh
  // ═══════════════════════════════════════════════════════════════
  const isMobile = screenWidth < 768;
  const baseCardW = isMobile ? 110 : 130;
  const baseCardH = isMobile ? 190 : 225;

  // Khoảng biên an toàn cho màn hình (24px mỗi bên)
  const maxSafeWidth = Math.min(screenWidth - 48, 1050);

  // Bộ bài lớn (>= 15 lá): thu nhỏ và chia nhiều hàng
  const isLargeDeck = cardsCount >= 15;
  const cardScale = isLargeDeck ? (isMobile ? 0.5 : 0.65) : 1;
  const scaledW = baseCardW * cardScale;
  const scaledH = baseCardH * cardScale;

  // Mục tiêu: 4 hàng trên Desktop, 6 hàng trên Mobile để mỗi hàng ~20 / ~13 lá
  const targetRows = isLargeDeck ? (isMobile ? 6 : 4) : 1;
  const cardsPerRow = isLargeDeck ? Math.ceil(cardsCount / targetRows) : cardsCount;
  const numRows = Math.ceil(cardsCount / cardsPerRow);

  // Khoảng cách ngang giữa các tâm lá bài trong mỗi hàng
  const maxHSpacing = isMobile ? 30 : 52;
  const hSpacing = cardsPerRow > 1
    ? Math.min(maxHSpacing, (maxSafeWidth - scaledW) / (cardsPerRow - 1))
    : 0;

  // Khoảng cách dọc giữa các hàng (cho phép chồng nhẹ ~40% để tiết kiệm chiều cao)
  const rowGap = scaledH * (isMobile ? 0.62 : 0.68);

  // Chiều cao container động dựa trên số hàng thực tế
  const dynamicHeight = isLargeDeck
    ? Math.round((numRows - 1) * rowGap + scaledH + 50)
    : (isMobile ? 360 : 420);

  // ═══════════════════════════════════════════════════════════════
  // FRAMER MOTION VARIANTS
  // ═══════════════════════════════════════════════════════════════
  const getCardVariants = (index: number) => {
    // 1. ── Shuffling: hoạt ảnh xáo trộn bài đồng bộ ──
    if (isShuffling) {
      const shuffleScale = isLargeDeck ? cardScale : 1;
      return {
        x: [0, (index % 2 === 0 ? 50 : -50), 0, (index % 2 === 0 ? -40 : 40), 0],
        y: [0, -10, 0, -5, 0],
        rotate: [0, (index % 2 === 0 ? 15 : -15), 0, (index % 2 === 0 ? -8 : 8), 0],
        scale: [shuffleScale, shuffleScale * 1.05, shuffleScale, shuffleScale * 1.02, shuffleScale],
        transition: {
          duration: 1.5,
          ease: 'easeInOut',
          delay: (index % 12) * 0.03,
        },
      };
    }

    // 2. ── Spread: trải bài phẳng nhiều hàng ──
    if (isDeckSpread) {
      let x = 0;
      let y = 0;

      if (isLargeDeck) {
        const rowIndex = Math.floor(index / cardsPerRow);
        const startIdx = rowIndex * cardsPerRow;
        const endIdx = Math.min(startIdx + cardsPerRow, cardsCount);
        const cardsInThisRow = endIdx - startIdx;
        const colIndex = index - startIdx;

        // Căn giữa ngang từng hàng độc lập
        const rowMid = (cardsInThisRow - 1) / 2;
        x = (colIndex - rowMid) * hSpacing;

        // Căn giữa dọc toàn bộ khối các hàng
        const totalRowsMid = (numRows - 1) / 2;
        y = (rowIndex - totalRowsMid) * rowGap;
      } else {
        const mid = (cardsCount - 1) / 2;
        x = (index - mid) * hSpacing;
        y = 0;
      }

      return {
        x,
        y,
        rotate: 0,
        scale: cardScale,
        z: index,
        transition: {
          type: 'spring',
          stiffness: 80,
          damping: 16,
          delay: index * 0.005,
        },
      };
    }

    // 3. ── Stacked: bộ bài úp chồng lên nhau ──
    return {
      x: 0,
      y: Math.min(index * -1.2, -30),
      rotate: 0,
      scale: isLargeDeck ? cardScale : 1,
      z: index,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
      },
    };
  };

  // Render custom shuffle themes when shuffling
  if (isShuffling && shuffleTheme !== 'classic') {
    if (shuffleTheme === 'wheel-of-fate') {
      return (
        <div style={{ height: `${dynamicHeight}px` }} className="relative w-full overflow-visible">
          <WheelOfFateShuffle reduceMotion={reduceMotion} />
        </div>
      );
    }
    if (shuffleTheme === 'soot-sprite') {
      return (
        <div style={{ height: `${dynamicHeight}px` }} className="relative w-full overflow-visible">
          <SootSpriteShuffle onStop={onStopShuffle} reduceMotion={reduceMotion} />
        </div>
      );
    }
  }

  // Render custom picking themes when spread
  if (isDeckSpread && pickingTheme !== 'classic') {
    if (pickingTheme === 'reflecting-pool') {
      return (
        <ReflectingPoolPicker
          cardsCount={cardsCount}
          onSelectCard={onSelectCard}
          reduceMotion={reduceMotion}
        />
      );
    }
    if (pickingTheme === 'falling-petals') {
      return (
        <FallingPetalsPicker
          cardsCount={cardsCount}
          onSelectCard={onSelectCard}
          reduceMotion={reduceMotion}
        />
      );
    }
  }

  return (
    <div
      className="relative w-full flex items-center justify-center select-none overflow-visible"
      style={{ height: `${dynamicHeight}px` }}
    >
      {weatherEffect && (
        <WeatherOverlay weather={weatherEffect} reduceMotion={reduceMotion} />
      )}

      {/* Neo ở chính giữa khung chứa theo cả chiều dọc và chiều ngang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center overflow-visible">
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
                      y: (variants as any).y - (isLargeDeck ? 20 : 30),
                      scale: isLargeDeck ? cardScale + 0.18 : 1.08,
                      z: 200,
                      transition: { duration: 0.2, ease: 'easeOut' as any },
                    }
                  : undefined
              }
              onClick={() => {
                if (isDeckSpread && !isShuffling) {
                  playGhibliSFX('card-flip', enableSound);
                  onSelectCard(index);
                }
              }}
              className={`absolute w-[110px] h-[190px] md:w-[130px] md:h-[225px] origin-center group ${
                isDeckSpread && !isShuffling
                  ? 'cursor-pointer hover:drop-shadow-[0_0_20px_rgba(255,209,102,0.55)]'
                  : ''
              }`}
              style={{
                transformOrigin: 'center center',
                top: isMobile ? '-95px' : '-112.5px',
                left: isMobile ? '-55px' : '-65px',
                zIndex: isDeckSpread ? index : undefined,
              }}
            >
              <CardBack className="border-gold-light/40 group-hover:border-gold-light transition-all duration-300" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

