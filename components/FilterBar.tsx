'use client';

import React from 'react';

interface FilterBarProps {
  activeArcana: 'all' | 'major' | 'minor';
  activeSuit: 'all' | 'wands' | 'cups' | 'swords' | 'pentacles';
  searchQuery: string;
  onArcanaChange: (arcana: 'all' | 'major' | 'minor') => void;
  onSuitChange: (suit: 'all' | 'wands' | 'cups' | 'swords' | 'pentacles') => void;
  onSearchChange: (query: string) => void;
  deckId?: string;
}

export default function FilterBar({
  activeArcana,
  activeSuit,
  searchQuery,
  onArcanaChange,
  onSuitChange,
  onSearchChange,
  deckId,
}: FilterBarProps) {
  if (deckId === 'lenormand') {
    return (
      <div className="w-full bg-bg-surface/50 backdrop-blur-md border border-gold-primary/20 rounded-2xl p-5 md:p-6 mb-8 flex flex-col gap-4 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] md:text-xs font-sans text-gold-light font-semibold uppercase tracking-widest">
              🌿 Lenormand Oracle
            </span>
            <span className="text-xs font-lora text-text-secondary italic">
              36 lá bài biểu tượng cổ điển truyền thống châu Âu
            </span>
          </div>
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary/70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.636z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm lá bài Lenormand..."
              className="w-full bg-bg-elevated/50 border border-gold-primary/20 focus:border-gold-light focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm font-lora text-text-primary placeholder:text-text-secondary/50 focus:shadow-[0_0_12px_var(--color-gold-glow)] transition-all duration-200"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-bg-surface/50 backdrop-blur-md border border-gold-primary/20 rounded-2xl p-5 md:p-6 mb-8 flex flex-col gap-4 shadow-xl">
      {/* Row 1: Arcana Filter & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Arcana Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onArcanaChange('all')}
            className={`px-4 py-2 text-xs md:text-sm font-sans font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
              activeArcana === 'all'
                ? 'bg-gold-primary text-bg-deep border border-gold-light shadow-[0_0_10px_var(--color-gold-glow)]'
                : 'bg-bg-elevated/60 text-text-secondary border border-transparent hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => onArcanaChange('major')}
            className={`px-4 py-2 text-xs md:text-sm font-sans font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
              activeArcana === 'major'
                ? 'bg-gold-primary text-bg-deep border border-gold-light shadow-[0_0_10px_var(--color-gold-glow)]'
                : 'bg-bg-elevated/60 text-text-secondary border border-transparent hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            Đại Bí Ẩn (Major)
          </button>
          <button
            onClick={() => onArcanaChange('minor')}
            className={`px-4 py-2 text-xs md:text-sm font-sans font-semibold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
              activeArcana === 'minor'
                ? 'bg-gold-primary text-bg-deep border border-gold-light shadow-[0_0_10px_var(--color-gold-glow)]'
                : 'bg-bg-elevated/60 text-text-secondary border border-transparent hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            Tiểu Bí Ẩn (Minor)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.636z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm tên lá bài tiếng Anh hoặc tiếng Việt..."
            className="w-full bg-bg-elevated/50 border border-gold-primary/20 focus:border-gold-light focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm font-lora text-text-primary placeholder:text-text-secondary/50 focus:shadow-[0_0_12px_var(--color-gold-glow)] transition-all duration-200"
          />
        </div>
      </div>

      {/* Row 2: Minor Arcana Suits Sub-filter (Chỉ hiện khi arcana === 'minor' hoặc 'all') */}
      {activeArcana !== 'major' && (
        <div className="border-t border-gold-primary/10 pt-4 flex flex-col gap-2 animate-[fadeIn_0.3s_ease-out]">
          <span className="text-[10px] md:text-xs font-sans text-text-secondary font-semibold uppercase tracking-widest">
            Lọc theo chất (Minor Suits):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSuitChange('all')}
              className={`px-3 py-1.5 text-xs font-sans tracking-wide rounded-lg transition-all duration-150 cursor-pointer ${
                activeSuit === 'all'
                  ? 'bg-gold-light/20 text-gold-light border border-gold-light/50'
                  : 'bg-bg-elevated/30 text-text-secondary border border-transparent hover:border-gold-primary/20 hover:text-text-primary'
              }`}
            >
              Tất Cả Chất
            </button>
            <button
              onClick={() => onSuitChange('wands')}
              className={`px-3 py-1.5 text-xs font-sans tracking-wide rounded-lg transition-all duration-150 cursor-pointer ${
                activeSuit === 'wands'
                  ? 'bg-gold-light/20 text-gold-light border border-gold-light/50'
                  : 'bg-bg-elevated/30 text-text-secondary border border-transparent hover:border-gold-primary/20 hover:text-text-primary'
              }`}
            >
              {deckId === 'marseille' ? '🔥 Gậy (Bâtons)' : '🔥 Quyền Trượng (Wands)'}
            </button>
            <button
              onClick={() => onSuitChange('cups')}
              className={`px-3 py-1.5 text-xs font-sans tracking-wide rounded-lg transition-all duration-150 cursor-pointer ${
                activeSuit === 'cups'
                  ? 'bg-gold-light/20 text-gold-light border border-gold-light/50'
                  : 'bg-bg-elevated/30 text-text-secondary border border-transparent hover:border-gold-primary/20 hover:text-text-primary'
              }`}
            >
              {deckId === 'marseille' ? '💧 Chén (Coupes)' : '💧 Thánh Bôi (Cups)'}
            </button>
            <button
              onClick={() => onSuitChange('swords')}
              className={`px-3 py-1.5 text-xs font-sans tracking-wide rounded-lg transition-all duration-150 cursor-pointer ${
                activeSuit === 'swords'
                  ? 'bg-gold-light/20 text-gold-light border border-gold-light/50'
                  : 'bg-bg-elevated/30 text-text-secondary border border-transparent hover:border-gold-primary/20 hover:text-text-primary'
              }`}
            >
              {deckId === 'marseille' ? '⚔️ Kiếm (Épées)' : '⚔️ Kiếm (Swords)'}
            </button>
            <button
              onClick={() => onSuitChange('pentacles')}
              className={`px-3 py-1.5 text-xs font-sans tracking-wide rounded-lg transition-all duration-150 cursor-pointer ${
                activeSuit === 'pentacles'
                  ? 'bg-gold-light/20 text-gold-light border border-gold-light/50'
                  : 'bg-bg-elevated/30 text-text-secondary border border-transparent hover:border-gold-primary/20 hover:text-text-primary'
              }`}
            >
              {deckId === 'thoth' ? '🪙 Đĩa Tròn (Disks)' : (deckId === 'marseille' ? '🪙 Đồng Tiền (Deniers)' : '🪙 Tiền Vàng (Pentacles)')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
