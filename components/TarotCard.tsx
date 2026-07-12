'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import CardBack from './CardBack';

interface TarotCardProps {
  card?: TarotCardType; // Có thể undefined nếu chỉ hiển thị mặt sau (ví dụ: bộ bài chưa chọn)
  isFlipped?: boolean;  // true: hiện mặt trước, false: hiện mặt sau
  isReversed?: boolean; // true: quay ngược lá bài 180 độ
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  interactive?: boolean;
  className?: string;
  deckCardBack?: string;
}

const sizeClasses = {
  sm: 'w-[100px] h-[173px] sm:w-[120px] sm:h-[208px] rounded-lg',
  md: 'w-[130px] h-[225px] sm:w-[160px] sm:h-[277px] rounded-xl',
  lg: 'w-[170px] h-[295px] sm:w-[220px] sm:h-[381px] rounded-2xl',
  xl: 'w-[210px] h-[364px] sm:w-[280px] sm:h-[485px] rounded-2xl',
};

export default function TarotCard({
  card,
  isFlipped = false,
  isReversed = false,
  size = 'md',
  onClick,
  interactive = true,
  className = '',
  deckCardBack,
}: TarotCardProps) {
  const sizeClass = sizeClasses[size];

  // Cấu hình animation cho Framer Motion lật bài 3D
  const cardVariants = {
    back: { rotateY: 0 },
    front: { rotateY: 180 },
  };

  const handleCardClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative ${sizeClass} perspective-1000 select-none ${
        interactive && onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <motion.div
        className="w-full h-full transform-style-3d relative"
        initial={isFlipped ? 'front' : 'back'}
        animate={isFlipped ? 'front' : 'back'}
        variants={cardVariants}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* MẶT SAU LÁ BÀI (Hiện khi rotateY = 0) */}
        <div className="absolute inset-0 w-full h-full backface-hidden z-10">
          <CardBack deckCardBack={deckCardBack} />
        </div>

        {/* MẶT TRƯỚC LÁ BÀI (Hiện khi rotateY = 180, lật ngược trục Y) */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden flex flex-col justify-between overflow-hidden"
          style={{
            transform: 'rotateY(180deg)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            borderRadius: size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px',
          }}
        >
          {/* Ảnh thực tế của lá bài */}
          {card ? (
            <div
              className={`relative w-full h-full overflow-hidden transition-all duration-300 ${
                isReversed ? 'rotate-180' : ''
              }`}
            >
              <Image
                src={card.imagePath}
                alt={`${card.nameVi} (${card.nameEn}) ${isReversed ? '- Chiều Ngược' : '- Chiều Xuôi'}`}
                fill
                quality={95}
                sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 440px"
                className="object-fill"
                priority={size === 'lg' || size === 'xl'}
              />

              {/* Shimmer overlay when active hover */}
              {interactive && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              )}
            </div>
          ) : (
            // Fallback nếu không có data card
            <div className="w-full h-full flex items-center justify-center bg-bg-mid">
              <div className="w-8 h-8 rounded-full border-2 border-gold-light border-t-transparent animate-spin" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
