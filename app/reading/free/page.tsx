'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TarotCard as TarotCardType, tarotCards, getCardById } from '@/lib/cards-data';
import { useEntropyCollector } from '@/hooks/useEntropyCollector';
import {
  createNewDeck,
  prepareFaceDownCards,
  userPicksFromFaceDown,
  hyperShuffle,
  DeckState,
  FaceDownPosition
} from '@/lib/tarot-deck';
import CardDeck from '@/components/CardDeck';
import TarotCard from '@/components/TarotCard';
import CardInspector from '@/components/CardInspector';
import { motion, AnimatePresence } from 'framer-motion';

type FlowStep = 'SETUP' | 'SHUFFLING' | 'PICKING' | 'RESULT';

interface FreeDrawnCard {
  card: TarotCardType;
  isReversed: boolean;
  pickOrder: number;
}

export default function FreeReadingPage() {
  const { startCollecting, stopCollecting, onMouseMove, onTouchMove } = useEntropyCollector();

  // Page States
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [step, setStep] = useState<FlowStep>('SETUP');
  const [cardsToPickThisRound, setCardsToPickThisRound] = useState<number>(3);

  // Toggle state for Journal (default is hidden!)
  const [showJournal, setShowJournal] = useState<boolean>(false);

  // 3-Round Cards storage
  const [round1Cards, setRound1Cards] = useState<FreeDrawnCard[]>([]);
  const [round2Cards, setRound2Cards] = useState<FreeDrawnCard[]>([]);
  const [round3Cards, setRound3Cards] = useState<FreeDrawnCard[]>([]);

  // Picker states
  const [deckState, setDeckState] = useState<DeckState | null>(null);
  const [faceDownPositions, setFaceDownPositions] = useState<FaceDownPosition[]>([]);
  const [currentPickCount, setCurrentPickCount] = useState<number>(0);

  // Journal Notepad State (parchment)
  const [journalNotes, setJournalNotes] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Inspector State
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Load journal from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('tarot_free_journal');
      if (saved) setJournalNotes(saved);
    }
  }, []);

  // Save journal to sessionStorage on edit
  const handleJournalChange = (text: string) => {
    setJournalNotes(text);
    sessionStorage.setItem('tarot_free_journal', text);
  };

  // SHUFFLE PER ROUND
  const handleStartShuffle = async () => {
    setStep('SHUFFLING');
    setCurrentPickCount(0);
    startCollecting();

    // Shuffling animation: 1.5s
    setTimeout(async () => {
      const entropy = stopCollecting();
      const shuffledOrder = await hyperShuffle(entropy.events, entropy.timings);
      const newDeck = createNewDeck(shuffledOrder);
      const faceDowns = prepareFaceDownCards(newDeck, 78);

      setDeckState(newDeck);
      setFaceDownPositions(faceDowns);
      setStep('PICKING');
    }, 1500);
  };

  // SELECT CARD FOR ACTIVE ROUND
  const handleSelectCard = (displayIdx: number) => {
    if (step !== 'PICKING' || !deckState) return;

    try {
      const drawn = userPicksFromFaceDown(deckState, faceDownPositions, displayIdx);
      const cardType = getCardById(drawn.cardId);

      if (!cardType) return;

      const newPickCount = currentPickCount + 1;
      setCurrentPickCount(newPickCount);

      const drawnCard: FreeDrawnCard = {
        card: cardType,
        isReversed: drawn.isReversed,
        pickOrder: newPickCount
      };

      // Store in current round array
      if (currentRound === 1) {
        setRound1Cards((prev) => [...prev, drawnCard]);
      } else if (currentRound === 2) {
        setRound2Cards((prev) => [...prev, drawnCard]);
      } else if (currentRound === 3) {
        setRound3Cards((prev) => [...prev, drawnCard]);
      }

      if (newPickCount >= cardsToPickThisRound) {
        // Round Pick complete -> transition to results view
        setStep('RESULT');
      } else {
        // Next pick
        const faceDowns = prepareFaceDownCards(deckState, 78 - newPickCount);
        setFaceDownPositions(faceDowns);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PROGRESS TO NEXT ROUND
  const handleNextRound = () => {
    if (currentRound === 1) {
      setCurrentRound(2);
      setCardsToPickThisRound(3); // Reset default cards for next round
      setStep('SETUP');
    } else if (currentRound === 2) {
      setCurrentRound(3);
      setCardsToPickThisRound(3);
      setStep('SETUP');
    }
  };

  // CARD DETAILED INSPECTION
  const handleCardInspect = (card: TarotCardType) => {
    setSelectedCard(card);
    setIsInspectorOpen(true);
  };

  // CLIPBOARD EXPORT
  const handleCopyResults = () => {
    const dateText = new Date().toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const formatCardsList = (title: string, list: FreeDrawnCard[]) => {
      if (list.length === 0) return '';
      let text = `✨ ${title} (${list.length} lá bài):\n`;
      list.forEach((c) => {
        text += `  - Lá ${c.card.nameVi} (${c.card.nameEn}) • ${c.isReversed ? 'Ngược ↩' : 'Xuôi ✦'}\n`;
      });
      return text + '\n';
    };

    let clipboardText = `🎨 KHÔNG GIAN TỰ TRẢI BÀI TAROT — TỰ LUẬN GIẢI\n`;
    clipboardText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    clipboardText += `📅 Thời gian trải bài: ${dateText}\n\n`;
    clipboardText += formatCardsList('VÒNG 1', round1Cards);
    clipboardText += formatCardsList('VÒNG 2', round2Cards);
    clipboardText += formatCardsList('VÒNG 3', round3Cards);
    clipboardText += `📝 NHẬT KÝ TỰ LUẬN GIẢI CỦA QUÝ NHÂN:\n`;
    clipboardText += `${journalNotes.trim() || '(Không ghi chú)'}\n`;
    clipboardText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    navigator.clipboard.writeText(clipboardText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleResetAll = () => {
    if (confirm('Quý nhân có chắc chắn muốn dọn sạch bàn trải bài và bắt đầu phiên tự do mới từ Vòng 1 không?')) {
      setCurrentRound(1);
      setStep('SETUP');
      setRound1Cards([]);
      setRound2Cards([]);
      setRound3Cards([]);
      setJournalNotes('');
      sessionStorage.removeItem('tarot_free_journal');
    }
  };

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-6 px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col gap-5 items-stretch">
        
        {/* Header (Minimal, No Golden Cat reference) */}
        <div className="text-center border-b border-white/5 pb-4 flex flex-col items-center gap-1.5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <h1 className="font-cinzel text-xl md:text-2xl font-extrabold text-gold-primary tracking-wider drop-shadow-[0_0_8px_var(--color-gold-glow)]">
              Không Gian Tự Trải Bài
            </h1>
            <span className="px-2 py-0.5 text-[8px] font-sans font-bold tracking-widest rounded bg-white/5 border border-white/10 text-text-secondary uppercase select-none">
              Tự Luận Giải ✏️
            </span>
          </div>
          <p className="font-lora text-[11px] md:text-xs text-text-secondary italic">
            Nơi tập trung tâm trí tối đa — Trực tiếp kết nối các lá bài qua 3 vòng tự do, tự ghi nhật ký đúc kết.
          </p>
        </div>

        {/* PREMIUM CONTROLS BAR */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3 shadow-lg select-none">
          {/* Status Tracker */}
          <div className="flex items-center gap-2 font-lora">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-primary animate-pulse" />
            <span className="text-[10px] md:text-xs font-sans font-bold text-gold-light uppercase tracking-wider">
              {round1Cards.length === 0 && round2Cards.length === 0 && round3Cards.length === 0
                ? 'Đang chuẩn bị...'
                : step === 'RESULT' && currentRound === 3
                ? '✓ Đã hoàn tất 3 Vòng'
                : `Đang trải: Vòng ${currentRound} · Bước ${
                    step === 'SETUP' ? 'Thiết lập' : step === 'SHUFFLING' ? 'Đang xáo bài' : step === 'PICKING' ? 'Đang nhặt bài' : 'Xem kết quả'
                  }`}
            </span>
          </div>

          {/* Action Buttons Dashboard */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Clear Board button */}
            {(round1Cards.length > 0 || round2Cards.length > 0 || round3Cards.length > 0) && (
              <button
                onClick={handleResetAll}
                className="px-3.5 py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-xl bg-red-950/20 border border-red-500/20 hover:border-red-500/50 hover:bg-red-950/40 text-red-400 cursor-pointer transition-all active:scale-95"
                title="Dọn bàn trải bài"
              >
                🗑️ Dọn Bàn
              </button>
            )}

            {/* Quick Copy Result button */}
            {round1Cards.length > 0 && (
              <button
                onClick={handleCopyResults}
                className="px-3.5 py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary hover:bg-white/10 text-gold-light cursor-pointer transition-all active:scale-95 flex items-center gap-1 shadow-lg"
              >
                {copySuccess ? '✓ Đã Sao Chép' : '📋 Sao Chép Kết Quả'}
              </button>
            )}

            {/* Toggle Notepad button */}
            <button
              onClick={() => setShowJournal(!showJournal)}
              className={`px-3.5 py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-xl border cursor-pointer transition-all active:scale-95 shadow-lg flex items-center gap-1.5 ${
                showJournal
                  ? 'bg-gold-primary/20 border-gold-primary text-gold-light'
                  : 'bg-white/5 border-gold-primary/25 hover:border-gold-light text-gold-light'
              }`}
            >
              <span>{showJournal ? '🙈 Ẩn Nhật Ký' : '📝 Mở Nhật Ký'}</span>
            </button>
          </div>
        </div>

        {/* CORE SCREEN LAYOUT (Splits 12 columns dynamically based on showJournal toggle) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-1.5 relative">
          
          {/* LEFT: Free Tarot board lanes & Picker Area (Flexible width span) */}
          <div className={`flex flex-col gap-5 min-h-[500px] transition-all duration-500 ${showJournal ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
            
            {/* PICKER OR SETUP MODULE */}
            <AnimatePresence mode="wait">
              {/* Setup Pick Card Count */}
              {step === 'SETUP' && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-bg-surface/30 border border-gold-primary/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 w-full"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <span className="w-6 h-6 rounded-full bg-gold-primary/20 border border-gold-primary/30 flex items-center justify-center text-xs text-gold-light font-bold">
                      {currentRound}
                    </span>
                    <h3 className="font-cinzel text-xs font-bold text-gold-light uppercase tracking-wider">
                      Thiết lập nhặt bài Vòng {currentRound}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3 font-lora">
                    <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold font-sans">
                      Chọn số lượng lá bài quý nhân muốn nhặt (Giới hạn từ 1 đến 20 lá):
                    </label>
                    <div className="flex items-center gap-4">
                      {/* Range Slider */}
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={cardsToPickThisRound}
                        onChange={(e) => setCardsToPickThisRound(Number(e.target.value))}
                        className="flex-1 accent-gold-primary bg-white/10 h-1.5 rounded-lg cursor-pointer"
                      />
                      {/* Visual Badge Display */}
                      <span className="w-12 py-1.5 rounded-xl bg-gold-primary/15 border border-gold-primary/30 text-gold-light text-center font-sans font-bold text-sm shadow-[0_0_8px_rgba(244,162,97,0.1)]">
                        {cardsToPickThisRound}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartShuffle}
                    className="w-full mt-1.5 py-3 font-sans font-bold text-xs uppercase tracking-widest rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_12px_var(--color-gold-glow)] flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span>🃏 Bắt Đầu Xáo Bộ Bài Vòng {currentRound}</span>
                  </button>
                </motion.div>
              )}

              {/* Picking Deck (Deck interactive area) */}
              {(step === 'SHUFFLING' || step === 'PICKING') && (
                <motion.div
                  key="picking"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#12122b]/55 border border-gold-primary/15 rounded-3xl p-4 shadow-2xl flex flex-col items-center relative overflow-visible min-h-[380px] md:min-h-[440px] w-full"
                >
                  <div className="absolute w-[260px] h-[260px] rounded-full border border-gold-primary/5 -z-10 animate-[spin_55s_linear_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  
                  {step === 'PICKING' && (
                    <div className="text-center mt-2 flex flex-col gap-0.5 z-10 select-none">
                      <span className="text-[9px] font-sans text-text-secondary uppercase tracking-widest leading-none font-bold">
                        Đang nhặt Vòng {currentRound}:
                      </span>
                      <span className="text-xs font-cinzel text-gold-light font-bold uppercase tracking-wider animate-pulse">
                        Nhặt quân số {currentPickCount + 1} / {cardsToPickThisRound}
                      </span>
                    </div>
                  )}

                  <CardDeck
                    cardsCount={78 - currentPickCount}
                    onSelectCard={handleSelectCard}
                    isShuffling={step === 'SHUFFLING'}
                    isDeckSpread={step === 'PICKING'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* LANES DISPLAY (Free Tarot Board Container) */}
            <div className="flex-1 w-full bg-white/[0.01] border border-white/[0.05] rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col gap-6 overflow-y-auto max-h-[75vh] scrollbar-thin">
              
              {/* Lane: Round 1 */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5 select-none">
                  <span className="px-2 py-0.5 text-[8px] font-sans font-bold tracking-widest rounded bg-gold-primary/10 border border-gold-primary/20 text-gold-light uppercase">
                    Vòng 1 {round1Cards.length > 0 && `· ${round1Cards.length} Lá`}
                  </span>
                  {round1Cards.length === 0 && (
                    <span className="text-[9px] text-text-secondary/35 font-lora italic">Chưa trải bài...</span>
                  )}
                </div>
                {round1Cards.length > 0 ? (
                  <div className="flex flex-wrap gap-4 items-center justify-center py-2 w-full">
                    {round1Cards.map((c) => (
                      <div key={`r1-${c.card.id}-${c.pickOrder}`} className="flex flex-col items-center gap-1.5 group select-none">
                        <TarotCard
                          card={c.card}
                          isFlipped={true}
                          isReversed={c.isReversed}
                          size="sm"
                          onClick={() => handleCardInspect(c.card)}
                          className="shadow-[0_4px_16px_rgba(0,0,0,0.5)] group-hover:-translate-y-1 group-hover:shadow-[0_0_12px_rgba(244,162,97,0.2)] transition-all duration-300 rounded-lg overflow-hidden border border-white/5"
                        />
                        <span className="text-[9px] font-lora text-white font-medium truncate max-w-[95px] text-center drop-shadow">
                          {c.card.nameVi} {c.isReversed ? '↩' : '✦'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-12 rounded-xl bg-white/[0.01] border border-dashed border-white/5 flex items-center justify-center text-[10px] text-text-secondary/20 italic select-none">
                    Bài Vòng 1 sẽ hiển thị ở đây
                  </div>
                )}
              </div>

              {/* Lane: Round 2 */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5 select-none">
                  <span className="px-2 py-0.5 text-[8px] font-sans font-bold tracking-widest rounded bg-[#2a9d8f]/10 border border-[#2a9d8f]/30 text-[#48cae4] uppercase">
                    Vòng 2 {round2Cards.length > 0 && `· ${round2Cards.length} Lá`}
                  </span>
                  {round2Cards.length === 0 && (
                    <span className="text-[9px] text-text-secondary/35 font-lora italic">Chưa trải bài...</span>
                  )}
                </div>
                {round2Cards.length > 0 ? (
                  <div className="flex flex-wrap gap-4 items-center justify-center py-2 w-full">
                    {round2Cards.map((c) => (
                      <div key={`r2-${c.card.id}-${c.pickOrder}`} className="flex flex-col items-center gap-1.5 group select-none">
                        <TarotCard
                          card={c.card}
                          isFlipped={true}
                          isReversed={c.isReversed}
                          size="sm"
                          onClick={() => handleCardInspect(c.card)}
                          className="shadow-[0_4px_16px_rgba(0,0,0,0.5)] group-hover:-translate-y-1 group-hover:shadow-[0_0_12px_rgba(244,162,97,0.2)] transition-all duration-300 rounded-lg overflow-hidden border border-white/5"
                        />
                        <span className="text-[9px] font-lora text-white font-medium truncate max-w-[95px] text-center drop-shadow">
                          {c.card.nameVi} {c.isReversed ? '↩' : '✦'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-12 rounded-xl bg-white/[0.01] border border-dashed border-white/5 flex items-center justify-center text-[10px] text-text-secondary/20 italic select-none">
                    Bài Vòng 2 sẽ hiển thị ở đây
                  </div>
                )}
              </div>

              {/* Lane: Round 3 */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5 select-none">
                  <span className="px-2 py-0.5 text-[8px] font-sans font-bold tracking-widest rounded bg-[#e76f51]/10 border border-[#e76f51]/30 text-[#f4a261] uppercase">
                    Vòng 3 {round3Cards.length > 0 && `· ${round3Cards.length} Lá`}
                  </span>
                  {round3Cards.length === 0 && (
                    <span className="text-[9px] text-text-secondary/35 font-lora italic">Chưa trải bài...</span>
                  )}
                </div>
                {round3Cards.length > 0 ? (
                  <div className="flex flex-wrap gap-4 items-center justify-center py-2 w-full">
                    {round3Cards.map((c) => (
                      <div key={`r3-${c.card.id}-${c.pickOrder}`} className="flex flex-col items-center gap-1.5 group select-none">
                        <TarotCard
                          card={c.card}
                          isFlipped={true}
                          isReversed={c.isReversed}
                          size="sm"
                          onClick={() => handleCardInspect(c.card)}
                          className="shadow-[0_4px_16px_rgba(0,0,0,0.5)] group-hover:-translate-y-1 group-hover:shadow-[0_0_12px_rgba(244,162,97,0.2)] transition-all duration-300 rounded-lg overflow-hidden border border-white/5"
                        />
                        <span className="text-[9px] font-lora text-white font-medium truncate max-w-[95px] text-center drop-shadow">
                          {c.card.nameVi} {c.isReversed ? '↩' : '✦'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-12 rounded-xl bg-white/[0.01] border border-dashed border-white/5 flex items-center justify-center text-[10px] text-text-secondary/20 italic select-none">
                    Bài Vòng 3 sẽ hiển thị ở đây
                  </div>
                )}
              </div>

              {/* Blank initial board placeholder */}
              {round1Cards.length === 0 && round2Cards.length === 0 && round3Cards.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-3 pointer-events-none select-none">
                  <div className="text-3xl animate-pulse">🃏</div>
                  <h4 className="font-cinzel text-xs font-bold text-gold-light uppercase tracking-wider mt-1">
                    Bàn Trải Bài Tự Do Trống
                  </h4>
                  <p className="font-lora text-[11px] text-text-secondary/50 italic max-w-xs leading-relaxed">
                    Thiết lập quân số bài và bắt đầu nhặt bài để phơi bày dòng năng lượng 3 vòng độc lập của quý nhân.
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT: Tarot parchment self-interpretation journal notepad (5/12 cols) */}
          <AnimatePresence>
            {showJournal && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="lg:col-span-5 flex flex-col gap-4"
              >
                {/* Notepad parchment box */}
                <div className="flex-1 flex flex-col bg-[#16120e] border border-[#e76f51]/15 rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[480px]">
                  {/* Parchment background texture pattern */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-radial from-transparent to-[#f4a261]/20 z-0" />
                  
                  {/* Notepad header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#e76f51]/20 flex-shrink-0 z-10 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📝</span>
                      <div>
                        <h4 className="font-cinzel text-xs font-bold text-gold-light tracking-widest uppercase">
                          Nhật Ký Tự Luận Giải
                        </h4>
                        <p className="text-[9px] text-[#c9b89a]/55 font-lora italic leading-none mt-1">
                          Nơi ghi chú insights trực giác
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notepad textarea content */}
                  <div className="flex-1 py-4 flex flex-col relative z-10">
                    <textarea
                      value={journalNotes}
                      onChange={(e) => handleJournalChange(e.target.value)}
                      placeholder="Quý nhân ơi, sau khi rút bài hoặc nhặt các lá bài bổ trợ ở các vòng, hãy tập trung lắng nghe trực giác mách bảo gì. Hãy tự gõ lời giải nghĩa, cảm xúc, suy ngẫm hay lời đúc kết của riêng mình vào cuốn tập sớ này nhé... ✏️"
                      className="w-full flex-1 bg-transparent border-none focus:outline-none resize-none font-lora text-xs md:text-sm text-amber-100 placeholder:text-amber-100/25 leading-relaxed overflow-y-auto scrollbar-thin"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(231,111,81,0.06) 1px, transparent 1px)',
                        backgroundSize: '100% 28px',
                        lineHeight: '28px',
                      }}
                    />
                  </div>

                  {/* Action area inside notepad */}
                  <div className="border-t border-[#e76f51]/15 pt-3 flex-shrink-0 flex items-center justify-between z-10 select-none">
                    
                    {/* Dynamic Next Round Button or Finish details */}
                    {step === 'RESULT' && currentRound < 3 ? (
                      <button
                        onClick={handleNextRound}
                        className="px-4 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep font-sans font-bold text-xs uppercase tracking-widest cursor-pointer transition-all shadow-[0_0_10px_var(--color-gold-glow)] flex items-center gap-1 active:scale-95 animate-pulse"
                      >
                        <span>Tiếp Tục Nhặt Vòng {currentRound + 1}</span>
                        <span>➔</span>
                      </button>
                    ) : (
                      <div className="text-[10px] text-text-secondary/40 font-lora italic leading-tight">
                        {currentRound === 3 && step === 'RESULT'
                          ? '✓ Đã hoàn thành nhặt 3 vòng tối đa.'
                          : '✓ Hãy hoàn tất nhặt bài vòng này.'}
                      </div>
                    )}

                    {/* Export/Copy Results Button in notepad */}
                    <button
                      onClick={handleCopyResults}
                      disabled={round1Cards.length === 0}
                      className="px-4 py-2.5 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all shadow-xl cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95 flex items-center gap-1 bg-white/5 border border-white/10 hover:border-gold-primary hover:bg-white/10 text-gold-light"
                    >
                      {copySuccess ? '✓ Đã Sao Chép' : '📋 Sao Chép'}
                    </button>

                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* FLOATING ACTION BOTTOM ROW IF NOTEPAD IS HIDDEN */}
        {!showJournal && step === 'RESULT' && currentRound < 3 && (
          <div className="w-full flex justify-center py-4 select-none animate-[fadeIn_0.3s_ease-out]">
            <button
              onClick={handleNextRound}
              className="px-6 py-3.5 rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep font-sans font-bold text-sm uppercase tracking-widest cursor-pointer transition-all shadow-[0_0_15px_var(--color-gold-glow)] flex items-center gap-1.5 active:scale-95"
            >
              <span>Tiếp Tục Nhặt Bài Vòng {currentRound + 1}</span>
              <span>➔</span>
            </button>
          </div>
        )}

      </div>

      {/* inspector Modal */}
      {selectedCard && (
        <CardInspector
          card={selectedCard}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
        />
      )}
    </div>
  );
}
