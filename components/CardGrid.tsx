'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TarotCard as TarotCardType } from '@/lib/cards-data';
import TarotCard from './TarotCard';

interface CardGridProps {
  cards: TarotCardType[];
}

export default function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-text-secondary text-lg font-lora italic">
          Mèo Vàng không tìm thấy lá bài nào khớp với bộ lọc... 🐱💤
        </p>
      </div>
    );
  }

  // Framer Motion container configuration for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  return (
    <motion.div
      variants={containerVariants as any}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8 px-2"
    >
      {cards.map((card) => (
        <motion.div
          key={card.id}
          variants={itemVariants as any}
          className="flex flex-col items-center group"
        >
          <Link href={`/cards/${card.slug}`} className="block relative focus:outline-none">
            {/* Card display wrapper with hover glow and float */}
            <div className="relative transform transition-all duration-300 group-hover:-translate-y-2 group-hover:drop-shadow-[0_0_15px_var(--color-gold-glow)]">
              <TarotCard
                card={card}
                isFlipped={true}
                interactive={false}
                size="md"
                className="pointer-events-none"
              />
            </div>
          </Link>

          {/* Card Label info */}
          <div className="mt-3 text-center flex flex-col items-center">
            <span className="text-[10px] text-gold-light/60 font-sans tracking-widest uppercase mb-0.5">
              {card.arcana === 'major' ? `Bí Ẩn Major #${card.number}` : `${card.suit}`}
            </span>
            <Link
              href={`/cards/${card.slug}`}
              className="text-text-primary group-hover:text-gold-light font-cinzel font-semibold text-sm transition-colors duration-200 tracking-wide"
            >
              {card.nameVi}
            </Link>
            <span className="text-[11px] text-text-secondary font-lora italic mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              {card.nameEn}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
