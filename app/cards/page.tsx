'use client';

import React, { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDeck } from '@/lib/deck-registry';
import FilterBar from '@/components/FilterBar';
import CardGrid from '@/components/CardGrid';
import { useApiKey } from '@/components/ApiKeyProvider';

const VALID_DECK_IDS = ['rws', 'thoth', 'marseille', 'lenormand', 'lightseer', 'modernwitch', 'yolo', 'kittycorn', 'moonlightsenshi'];

export default function CardsGalleryPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full flex items-center justify-center py-20">
        <span className="text-gold-light text-sm font-lora italic animate-pulse">Đang tải thư viện bài... 🐱✨</span>
      </div>
    }>
      <CardsGallery />
    </Suspense>
  );
}

function CardsGallery() {
  const { setBackgroundTheme } = useApiKey();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial deck from URL query param ?deck=
  const initialDeck = searchParams.get('deck');
  const [selectedDeckId, setSelectedDeckId] = useState<string>(
    initialDeck && VALID_DECK_IDS.includes(initialDeck) ? initialDeck : 'rws'
  );
  const [activeArcana, setActiveArcana] = useState<'all' | 'major' | 'minor'>('all');
  const [activeSuit, setActiveSuit] = useState<'all' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync URL when deck changes via tab click
  const handleDeckChange = useCallback((deckId: string) => {
    setSelectedDeckId(deckId);
    // Update URL without full navigation so browser back button works
    const newUrl = deckId === 'rws' ? '/cards' : `/cards?deck=${deckId}`;
    router.replace(newUrl, { scroll: false });
  }, [router]);

  const deckProvider = useMemo(() => getDeck(selectedDeckId), [selectedDeckId]);

  useEffect(() => {
    setBackgroundTheme('mystic-night');
  }, [setBackgroundTheme]);

  // Handle Arcana change and reset suit if necessary
  const handleArcanaChange = (arcana: 'all' | 'major' | 'minor') => {
    setActiveArcana(arcana);
    if (arcana === 'major') {
      setActiveSuit('all');
    }
  };

  // Perform filtering based on state
  const filteredCards = useMemo(() => {
    return deckProvider.cards.filter((card) => {
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
  }, [deckProvider, activeArcana, activeSuit, searchQuery]);

  return (
    <div className="flex-1 w-full bg-transparent py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Gallery Title & Header */}
        <div className="text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gold-primary/10 pb-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-cinzel text-2xl md:text-3xl font-extrabold text-gold-primary tracking-wider drop-shadow-[0_0_8px_var(--color-gold-glow)]">
              Thư Viện Bài {deckProvider.info.nameVi}
            </h1>
            <p className="font-lora text-xs md:text-sm text-text-secondary italic">
              {selectedDeckId === 'rws' 
                ? 'Tra cứu thông tin, từ khóa và ý nghĩa hai chiều xuôi - ngược của 78 lá bài Tarot kinh điển RWS.' 
                : selectedDeckId === 'thoth'
                ? 'Tra cứu thông tin, ý nghĩa huyền học và từ khóa của 78 lá bài Thoth Tarot theo truyền thống Thelema.'
                : 'Tra cứu thông tin, ý nghĩa lịch sử khắc gỗ và từ khóa của 78 lá bài Tarot de Marseille cổ điển thế kỷ 18.'}
            </p>
          </div>
          
          {/* Card Counter Badge */}
          <div className="px-4 py-1.5 rounded-full bg-bg-surface border border-gold-primary/30 text-gold-light text-xs font-sans font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(244,162,97,0.1)]">
            Hiển thị: {filteredCards.length} / 78 Lá
          </div>
        </div>

        {/* Deck Switcher Tabs */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start font-sans select-none">
          <button
            onClick={() => handleDeckChange('rws')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'rws'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            🔮 Rider-Waite-Smith
          </button>
          <button
            onClick={() => handleDeckChange('thoth')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'thoth'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            🦅 Thoth Tarot
          </button>
           <button
            onClick={() => handleDeckChange('marseille')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'marseille'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            ⚜️ Marseille Tarot
          </button>
          <button
            onClick={() => handleDeckChange('lenormand')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'lenormand'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            🌿 Lenormand Oracle
          </button>
          <button
            onClick={() => handleDeckChange('lightseer')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'lightseer'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            ☀️ Light Seer's
          </button>
          <button
            onClick={() => handleDeckChange('modernwitch')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'modernwitch'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            🧹 Modern Witch
          </button>
          <button
            onClick={() => handleDeckChange('yolo')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'yolo'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            😎 YOLO
          </button>
          <button
            onClick={() => handleDeckChange('kittycorn')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'kittycorn'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            🦄 Kittycorn
          </button>
          <button
            onClick={() => handleDeckChange('moonlightsenshi')}
            className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedDeckId === 'moonlightsenshi'
                ? 'bg-gold-primary text-bg-deep border-gold-light shadow-[0_0_10px_rgba(244,162,97,0.2)] font-extrabold'
                : 'bg-bg-surface/60 text-text-secondary border-gold-primary/10 hover:border-gold-primary/30 hover:text-text-primary'
            }`}
          >
            🌙 Sailor Moon
          </button>
        </div>

        {/* Filters */}
        <FilterBar
          activeArcana={activeArcana}
          activeSuit={activeSuit}
          searchQuery={searchQuery}
          onArcanaChange={handleArcanaChange}
          onSuitChange={setActiveSuit}
          onSearchChange={setSearchQuery}
          deckId={selectedDeckId}
        />

        {/* Card Grid List */}
        <div className="mt-2 min-h-[40vh]">
          <CardGrid cards={filteredCards} deckId={selectedDeckId} />
        </div>
      </div>
    </div>
  );
}
