'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TarotCard as TarotCardType, getCardById } from '@/lib/cards-data';
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
import CardInspector from '@/components/CardInspector';
import FreeTarotWorkspace2D, { FreeWorkspaceCard } from '@/components/FreeTarotWorkspace2D';
import { motion, AnimatePresence } from 'framer-motion';

type FlowStep = 'SETUP' | 'SHUFFLING' | 'PICKING' | 'RESULT';

type FreeDrawnCard = FreeWorkspaceCard;

type ConversationSpeaker = 'reader' | 'client';

interface ConversationMessage {
  id: string;
  speaker: ConversationSpeaker;
  text: string;
  relatedCardId?: string;
  createdAt: string;
}

interface SavedWorkspaceCard extends Omit<FreeWorkspaceCard, 'card'> {
  cardId: number;
}

interface SavedFreeSession {
  currentRound: 1 | 2 | 3;
  cardsToPickThisRound: number;
  cards: SavedWorkspaceCard[];
  journalNotes: string;
  conversation: ConversationMessage[];
}

const FREE_SESSION_STORAGE_KEY = 'tarot_free_professional_session';

function getInitialCardPlacement(round: 1 | 2 | 3, pickOrder: number, zIndex: number) {
  const rowY = 82 + (round - 1) * 320;
  const column = (pickOrder - 1) % 10;
  const rowOffset = Math.floor((pickOrder - 1) / 10);

  return {
    x: 120 + column * 155 + rowOffset * 24,
    y: rowY + rowOffset * 68,
    rotation: ((pickOrder % 5) - 2) * 4,
    zIndex,
  };
}

export default function FreeReadingPage() {
  const { startCollecting, stopCollecting } = useEntropyCollector();
  const hasLoadedSession = useRef(false);
  const idCounterRef = useRef(0);

  // Page States
  const [currentRound, setCurrentRound] = useState<1 | 2 | 3>(1);
  const [step, setStep] = useState<FlowStep>('SETUP');
  const [cardsToPickThisRound, setCardsToPickThisRound] = useState<number>(3);

  // Toggle state for professional session side panel
  const [showJournal, setShowJournal] = useState<boolean>(true);

  // 3-Round Cards storage
  const [round1Cards, setRound1Cards] = useState<FreeDrawnCard[]>([]);
  const [round2Cards, setRound2Cards] = useState<FreeDrawnCard[]>([]);
  const [round3Cards, setRound3Cards] = useState<FreeDrawnCard[]>([]);
  const allDrawnCards = useMemo(
    () => [...round1Cards, ...round2Cards, ...round3Cards],
    [round1Cards, round2Cards, round3Cards]
  );
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Picker states
  const [deckState, setDeckState] = useState<DeckState | null>(null);
  const [faceDownPositions, setFaceDownPositions] = useState<FaceDownPosition[]>([]);
  const [currentPickCount, setCurrentPickCount] = useState<number>(0);

  // Journal Notepad State (parchment)
  const [journalNotes, setJournalNotes] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationInput, setConversationInput] = useState('');
  const [conversationSpeaker, setConversationSpeaker] = useState<ConversationSpeaker>('reader');
  const [copySuccess, setCopySuccess] = useState(false);

  // Inspector State
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Load professional session from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const restoreTimer = window.setTimeout(() => {
        const saved = sessionStorage.getItem(FREE_SESSION_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as SavedFreeSession;
            const hydratedCards = parsed.cards
              .map((savedCard) => {
                const card = getCardById(savedCard.cardId);
                if (!card) return null;
                return {
                  id: savedCard.id,
                  card,
                  isReversed: savedCard.isReversed,
                  pickOrder: savedCard.pickOrder,
                  round: savedCard.round,
                  x: savedCard.x,
                  y: savedCard.y,
                  rotation: savedCard.rotation,
                  zIndex: savedCard.zIndex,
                  label: savedCard.label,
                  note: savedCard.note,
                  locked: savedCard.locked,
                };
              })
              .filter(Boolean) as FreeDrawnCard[];

            setRound1Cards(hydratedCards.filter((card) => card.round === 1));
            setRound2Cards(hydratedCards.filter((card) => card.round === 2));
            setRound3Cards(hydratedCards.filter((card) => card.round === 3));
            setCurrentRound(parsed.currentRound || 1);
            setCardsToPickThisRound(parsed.cardsToPickThisRound || 3);
            setJournalNotes(parsed.journalNotes || '');
            setConversation(parsed.conversation || []);
            setStep(hydratedCards.length > 0 ? 'RESULT' : 'SETUP');
            idCounterRef.current = hydratedCards.length + parsed.conversation.length;
          } catch (err) {
            console.error('Failed to restore free reading session', err);
          }
        } else {
          const legacyJournal = sessionStorage.getItem('tarot_free_journal');
          if (legacyJournal) setJournalNotes(legacyJournal);
        }
        hasLoadedSession.current = true;
      }, 0);

      return () => window.clearTimeout(restoreTimer);
    }
  }, []);

  // Persist the professional workspace after initial hydration
  useEffect(() => {
    if (!hasLoadedSession.current || typeof window === 'undefined') return;

    const cardsToSave: SavedWorkspaceCard[] = allDrawnCards.map((workspaceCard) => {
      const { card, ...rest } = workspaceCard;
      return {
        ...rest,
        cardId: card.id,
      };
    });

    const payload: SavedFreeSession = {
      currentRound,
      cardsToPickThisRound,
      cards: cardsToSave,
      journalNotes,
      conversation,
    };

    sessionStorage.setItem(FREE_SESSION_STORAGE_KEY, JSON.stringify(payload));
    sessionStorage.setItem('tarot_free_journal', journalNotes);
  }, [allDrawnCards, cardsToPickThisRound, conversation, currentRound, journalNotes]);

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
      const placement = getInitialCardPlacement(currentRound, newPickCount, allDrawnCards.length + 1);

      const drawnCard: FreeDrawnCard = {
        id: `free-${currentRound}-${drawn.cardId}-${newPickCount}-${++idCounterRef.current}`,
        card: cardType,
        isReversed: drawn.isReversed,
        pickOrder: newPickCount,
        round: currentRound,
        label: `Vòng ${currentRound} · Lá ${newPickCount}`,
        note: '',
        locked: false,
        ...placement,
      };
      setActiveCardId(drawnCard.id);

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

  const handleUpdateWorkspaceCard = (cardId: string, updates: Partial<FreeWorkspaceCard>) => {
    const update = (cards: FreeDrawnCard[]) =>
      cards.map((workspaceCard) =>
        workspaceCard.id === cardId ? { ...workspaceCard, ...updates } : workspaceCard
      );

    setRound1Cards(update);
    setRound2Cards(update);
    setRound3Cards(update);
  };

  const handleAutoArrangeWorkspace = () => {
    const arrangeRound = (cards: FreeDrawnCard[]) =>
      cards.map((workspaceCard, index) => ({
        ...workspaceCard,
        ...getInitialCardPlacement(workspaceCard.round, index + 1, index + 1),
        pickOrder: index + 1,
      }));

    setRound1Cards(arrangeRound);
    setRound2Cards(arrangeRound);
    setRound3Cards(arrangeRound);
  };

  const handleAddConversationMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const text = conversationInput.trim();
    if (!text) return;

    const newMessage: ConversationMessage = {
      id: `msg-${++idCounterRef.current}`,
      speaker: conversationSpeaker,
      text,
      relatedCardId: activeCardId || undefined,
      createdAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setConversation((prev) => [...prev, newMessage]);
    setConversationInput('');
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
        text += `  - ${c.label || `Lá ${c.pickOrder}`}: ${c.card.nameVi} (${c.card.nameEn}) • ${c.isReversed ? 'Ngược ↩' : 'Xuôi ✦'} • X:${Math.round(c.x)} Y:${Math.round(c.y)} R:${Math.round(c.rotation)}°\n`;
        if (c.note?.trim()) {
          text += `    Ghi chú: ${c.note.trim()}\n`;
        }
      });
      return text + '\n';
    };

    let clipboardText = `🎨 KHÔNG GIAN TƯ VẤN TAROT 2D — PHIÊN CHUYÊN NGHIỆP\n`;
    clipboardText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    clipboardText += `📅 Thời gian trải bài: ${dateText}\n\n`;
    clipboardText += formatCardsList('VÒNG 1', round1Cards);
    clipboardText += formatCardsList('VÒNG 2', round2Cards);
    clipboardText += formatCardsList('VÒNG 3', round3Cards);
    clipboardText += `📝 NHẬT KÝ PHÂN TÍCH CỦA READER:\n`;
    clipboardText += `${journalNotes.trim() || '(Không ghi chú)'}\n`;
    clipboardText += `\n💬 TRAO ĐỔI TRONG PHIÊN:\n`;
    clipboardText += conversation.length === 0
      ? '(Chưa có trao đổi được ghi lại)\n'
      : conversation
          .map((message) => {
            const relatedCard = allDrawnCards.find((card) => card.id === message.relatedCardId);
            const cardText = relatedCard ? ` [${relatedCard.card.nameVi}]` : '';
            return `  - ${message.createdAt} · ${message.speaker === 'reader' ? 'Reader' : 'Khách hàng'}${cardText}: ${message.text}`;
          })
          .join('\n') + '\n';
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
      setActiveCardId(null);
      setConversation([]);
      setConversationInput('');
      setJournalNotes('');
      sessionStorage.removeItem('tarot_free_journal');
      sessionStorage.removeItem(FREE_SESSION_STORAGE_KEY);
    }
  };

  const activeWorkspaceCard = allDrawnCards.find((card) => card.id === activeCardId) || null;

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-6 px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col gap-5 items-stretch">
        
        {/* Header (Minimal, No Golden Cat reference) */}
        <div className="text-center border-b border-white/5 pb-4 flex flex-col items-center gap-1.5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <h1 className="font-cinzel text-xl md:text-2xl font-extrabold text-gold-primary tracking-wider drop-shadow-[0_0_8px_var(--color-gold-glow)]">
              Không Gian Tư Vấn Tarot 2D
            </h1>
            <span className="px-2 py-0.5 text-[8px] font-sans font-bold tracking-widest rounded bg-white/5 border border-white/10 text-text-secondary uppercase select-none">
              Pro Workspace
            </span>
          </div>
          <p className="font-lora text-[11px] md:text-xs text-text-secondary italic">
            Bàn 2D tự do cho reader chuyên nghiệp: kéo thả, xoay, khóa, ghi chú từng lá và lưu lại trao đổi với khách hàng.
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
              <span>{showJournal ? 'Ẩn Phiên Đọc' : 'Mở Phiên Đọc'}</span>
            </button>
          </div>
        </div>

        {/* CORE SCREEN LAYOUT (Splits 12 columns dynamically based on showJournal toggle) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-1.5 relative">
          
          {/* LEFT: Free Tarot board lanes & Picker Area (Flexible width span) */}
          <div className={`flex flex-col gap-5 min-h-[500px] transition-all duration-500 ${showJournal ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            
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

            <FreeTarotWorkspace2D
              cards={allDrawnCards}
              activeCardId={activeCardId}
              onSelectCard={setActiveCardId}
              onUpdateCard={handleUpdateWorkspaceCard}
              onInspectCard={handleCardInspect}
              onAutoArrange={handleAutoArrangeWorkspace}
            />

          </div>

          {/* RIGHT: Professional session notes and conversation panel */}
          <AnimatePresence>
            {showJournal && (
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="lg:col-span-4 flex flex-col gap-4"
              >
                <div className="flex-1 flex flex-col gap-4 bg-bg-surface/28 border border-white/[0.06] rounded-3xl p-4 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[640px]">
                  <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-radial from-transparent to-[#f4a261]/20 z-0" />

                  <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0 z-10 select-none">
                    <div className="flex items-center gap-2">
                      <div>
                        <h4 className="font-cinzel text-xs font-bold text-gold-light tracking-widest uppercase">
                          Phiên Trao Đổi Tarot
                        </h4>
                        <p className="text-[9px] text-text-secondary/55 font-lora italic leading-none mt-1">
                          Ghi hội thoại, insight và kết luận với khách hàng
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="z-10 flex flex-col gap-2 min-h-[250px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider font-sans font-bold">
                        Trao đổi tự do
                      </span>
                      {activeWorkspaceCard && (
                        <span className="max-w-[150px] truncate text-[9px] text-gold-light/75 font-lora italic">
                          Gắn với: {activeWorkspaceCard.card.nameVi}
                        </span>
                      )}
                    </div>

                    <div className="h-56 overflow-y-auto rounded-2xl border border-white/[0.08] bg-black/20 p-3 flex flex-col gap-2 scrollbar-thin">
                      {conversation.length > 0 ? (
                        conversation.map((message) => {
                          const relatedCard = allDrawnCards.find((card) => card.id === message.relatedCardId);
                          const isReader = message.speaker === 'reader';
                          return (
                            <div
                              key={message.id}
                              className={`max-w-[92%] rounded-2xl px-3 py-2 border text-xs leading-relaxed ${
                                isReader
                                  ? 'self-start bg-gold-primary/10 border-gold-primary/18 text-text-primary rounded-tl-sm'
                                  : 'self-end bg-white/[0.055] border-white/10 text-text-primary rounded-tr-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 text-[8px] font-sans font-bold uppercase tracking-wider text-text-secondary/60 mb-1">
                                <span>{isReader ? 'Reader' : 'Khách hàng'}</span>
                                <span>{message.createdAt}</span>
                              </div>
                              <p className="font-lora whitespace-pre-line">{message.text}</p>
                              {relatedCard && (
                                <span className="mt-1 inline-block text-[8px] text-gold-light/70 font-sans uppercase tracking-wider">
                                  {relatedCard.card.nameVi}
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-center px-4">
                          <p className="text-xs text-text-secondary/45 font-lora italic leading-relaxed">
                            Ghi lại câu hỏi, phản hồi, giả thuyết và quyết định trong phiên. Nếu đang chọn một lá, tin nhắn sẽ được gắn với lá đó.
                          </p>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleAddConversationMessage} className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setConversationSpeaker('reader')}
                          className={`py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            conversationSpeaker === 'reader'
                              ? 'bg-gold-primary/18 border-gold-primary text-gold-light'
                              : 'bg-white/5 border-white/10 text-text-secondary hover:border-gold-primary/30'
                          }`}
                        >
                          Reader
                        </button>
                        <button
                          type="button"
                          onClick={() => setConversationSpeaker('client')}
                          className={`py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            conversationSpeaker === 'client'
                              ? 'bg-[#2a9d8f]/18 border-[#2a9d8f] text-[#48cae4]'
                              : 'bg-white/5 border-white/10 text-text-secondary hover:border-[#2a9d8f]/35'
                          }`}
                        >
                          Khách hàng
                        </button>
                      </div>
                      <textarea
                        value={conversationInput}
                        onChange={(event) => setConversationInput(event.target.value)}
                        placeholder="Nhập câu hỏi, phản hồi hoặc kết luận ngắn trong phiên..."
                        className="h-20 resize-none rounded-xl bg-bg-elevated/45 border border-white/10 focus:border-gold-primary/45 outline-none px-3 py-2 text-xs leading-relaxed text-text-primary placeholder:text-text-secondary/35 scrollbar-thin"
                      />
                      <button
                        type="submit"
                        disabled={!conversationInput.trim()}
                        className="w-full py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep font-sans font-bold text-xs uppercase tracking-widest cursor-pointer transition-all disabled:opacity-40 disabled:pointer-events-none"
                      >
                        Ghi Vào Phiên
                      </button>
                    </form>
                  </div>

                  <div className="flex-1 min-h-[260px] py-1 flex flex-col relative z-10">
                    <label className="text-[10px] text-text-secondary uppercase tracking-wider font-sans font-bold mb-2">
                      Nhật ký tổng hợp của reader
                    </label>
                    <textarea
                      value={journalNotes}
                      onChange={(e) => handleJournalChange(e.target.value)}
                      placeholder="Tóm tắt bối cảnh, các pattern chính, lời khuyên, hành động kế tiếp và điểm cần theo dõi sau phiên..."
                      className="w-full flex-1 bg-transparent border-none focus:outline-none resize-none font-lora text-xs md:text-sm text-amber-100 placeholder:text-amber-100/25 leading-relaxed overflow-y-auto scrollbar-thin"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(231,111,81,0.06) 1px, transparent 1px)',
                        backgroundSize: '100% 28px',
                        lineHeight: '28px',
                      }}
                    />
                  </div>

                  <div className="border-t border-[#e76f51]/15 pt-3 flex-shrink-0 flex items-center justify-between z-10 select-none">
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
