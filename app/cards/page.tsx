'use client';

import React, { useState, useMemo } from 'react';
import { tarotCards } from '@/lib/cards-data';
import FilterBar from '@/components/FilterBar';
import CardGrid from '@/components/CardGrid';

export default function CardsGallery() {
  const [activeArcana, setActiveArcana] = useState<'all' | 'major' | 'minor'>('all');
  const [activeSuit, setActiveSuit] = useState<'all' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Arcana change and reset suit if necessary
  const handleArcanaChange = (arcana: 'all' | 'major' | 'minor') => {
    setActiveArcana(arcana);
    if (arcana === 'major') {
      setActiveSuit('all');
    }
  };

  // Perform filtering based on state
  const filteredCards = useMemo(() => {
    return tarotCards.filter((card) => {
      // 1. Filter by Arcana
      if (activeArcana !== 'all' && card.arcana !== activeArcana) {
        return false;
      }

      // 2. Filter by Suit
      if (activeSuit !== 'all' && card.suit !== activeSuit) {
        return false;
      }

      // 3. Search query matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchVi = card.nameVi.toLowerCase().includes(query);
        const matchEn = card.nameEn.toLowerCase().includes(query);
        const matchKeywords = card.keywordsVi.some((k) => k.toLowerCase().includes(query));
        const matchSuit = card.suit?.toLowerCase().includes(query) || false;
        
        return matchVi || matchEn || matchKeywords || matchSuit;
      }

      return true;
    });
  }, [activeArcana, activeSuit, searchQuery]);

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Gallery Title & Header */}
        <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gold-primary/10 pb-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-cinzel text-2xl md:text-3xl font-extrabold text-gold-primary tracking-wider drop-shadow-[0_0_8px_var(--color-gold-glow)]">
              Thư Viện Bài Rider-Waite-Smith
            </h1>
            <p className="font-lora text-xs md:text-sm text-text-secondary italic">
              Tra cứu thông tin, từ khóa và ý nghĩa hai chiều xuôi - ngược của 78 lá bài Tarot kinh điển.
            </p>
          </div>
          
          {/* Card Counter Badge */}
          <div className="px-4 py-1.5 rounded-full bg-bg-surface border border-gold-primary/30 text-gold-light text-xs font-sans font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(244,162,97,0.1)]">
            Hiển thị: {filteredCards.length} / 78 Lá
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          activeArcana={activeArcana}
          activeSuit={activeSuit}
          searchQuery={searchQuery}
          onArcanaChange={handleArcanaChange}
          onSuitChange={setActiveSuit}
          onSearchChange={setSearchQuery}
        />

        {/* Card Grid List */}
        <div className="mt-2 min-h-[40vh]">
          <CardGrid cards={filteredCards} />
        </div>
      </div>
    </div>
  );
}
