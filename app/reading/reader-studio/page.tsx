'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeck } from '@/lib/deck-registry';
import { useEntropyCollector } from '@/hooks/useEntropyCollector';
import {
  createNewDeck,
  prepareFaceDownCards,
  userPicksFromFaceDown,
  hyperShuffle,
  DeckState,
  FaceDownPosition,
} from '@/lib/tarot-deck';
import { SPREAD_PRESETS, SpreadLayoutType, calculateRoundCardLayout } from '@/lib/tarot-layouts';
import ReaderStudioDesk from '@/components/ReaderStudioDesk';
import ReaderFanDeck from '@/components/ReaderFanDeck';
import ReaderGrimoire, { StudioDealtCard } from '@/components/ReaderGrimoire';
import { readerAudio } from '@/lib/reader-audio';

type StudioStep = 'SETUP' | 'SHUFFLING' | 'READING';

const SESSION_KEY = 'tarot_reader_studio_session';
const readerStudioDeck = getDeck('standard-78');

export interface StudioDeskSession {
  id: string;
  deskName: string;
  selectedPresetId: SpreadLayoutType;
  questionText: string;
  dealtCards: StudioDealtCard[];
  generalNotes: string;
}

export default function ReaderStudioPage() {
  const deckProvider = readerStudioDeck;
  const { startCollecting, stopCollecting, onMouseMove } = useEntropyCollector();

  const [step, setStep] = useState<StudioStep>('SETUP');
  const [desks, setDesks] = useState<StudioDeskSession[]>([
    {
      id: 'desk-1',
      deskName: 'Bàn 1',
      selectedPresetId: 'three-card',
      questionText: '',
      dealtCards: [],
      generalNotes: '',
    },
  ]);
  const [activeDeskId, setActiveDeskId] = useState<string>('desk-1');

  const [deckState, setDeckState] = useState<DeckState | null>(null);
  const [faceDownPositions, setFaceDownPositions] = useState<FaceDownPosition[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [setupQuestion, setSetupQuestion] = useState('');
  const [setupPresetId, setSetupPresetId] = useState<SpreadLayoutType>('three-card');

  const idCounterRef = useRef(0);
  const firstSaveEffectRef = useRef(true);
  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  const activeDesk = useMemo(
    () => desks.find((d) => d.id === activeDeskId) || desks[0],
    [desks, activeDeskId]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (shuffleTimerRef.current) {
        clearTimeout(shuffleTimerRef.current);
      }
    };
  }, []);

  // Load session state on mount
  useEffect(() => {
    let hydrateTimer: ReturnType<typeof setTimeout> | null = null;
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          desks?: StudioDeskSession[];
          activeDeskId?: string;
        };
        if (Array.isArray(parsed.desks) && parsed.desks.length > 0) {
          const savedDesks = parsed.desks;
          const savedActiveDeskId = parsed.activeDeskId || savedDesks[0].id;
          idCounterRef.current = parsed.desks.reduce((max, desk) => {
            const match = desk.id.match(/(\d+)$/);
            return Math.max(max, match ? Number(match[1]) : 0);
          }, 0);
          hydrateTimer = setTimeout(() => {
            setDesks(savedDesks);
            setActiveDeskId(savedActiveDeskId);
            setStep('READING');
          }, 0);
        }
      }
    } catch {
      // Fallback
    }

    return () => {
      if (hydrateTimer) clearTimeout(hydrateTimer);
    };
  }, []);

  // Debounce persistence so typing and frequent interactions never block the desk.
  useEffect(() => {
    if (firstSaveEffectRef.current) {
      firstSaveEffectRef.current = false;
      return;
    }

    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            desks,
            activeDeskId,
          })
        );
      } catch {
        // Fallback
      }
    }, 280);

    return () => clearTimeout(saveTimer);
  }, [desks, activeDeskId, step]);

  // Filter out spreads with > 13 cards for Reader Studio mode
  const studioPresets = React.useMemo(() => {
    return SPREAD_PRESETS.filter((p) => p.recommendedCards <= 13);
  }, []);

  // Compute desk target slots based on active preset layout - centered
  const presetInfo = useMemo(
    () => SPREAD_PRESETS.find((p) => p.id === activeDesk.selectedPresetId) || SPREAD_PRESETS[0],
    [activeDesk.selectedPresetId]
  );
  const targetCount = presetInfo.recommendedCards > 0 ? presetInfo.recommendedCards : Math.min(13, activeDesk.dealtCards.length + 1);

  // Check if active desk has drawn all required cards for active preset layout (or reached 13 limit)
  const maxRequiredForPreset = presetInfo.recommendedCards > 0 ? presetInfo.recommendedCards : 13;
  const isTargetSpreadComplete = activeDesk.dealtCards.length >= maxRequiredForPreset;

  const slots = React.useMemo(() => {
    const layout = calculateRoundCardLayout(targetCount, 1, activeDesk.selectedPresetId);
    if (layout.length === 0) return [];

    const CARD_W = 105;
    const CARD_H = 178;
    const BADGE_H = 26; // space for badge below card
    const AREA_W = 920;
    const AREA_H = 520;
    const PAD = 24; // safe padding from visible boundaries

    // Compute bounding box of raw layout (top-left coordinates)
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layout.forEach((item) => {
      minX = Math.min(minX, item.x);
      maxX = Math.max(maxX, item.x + CARD_W);
      minY = Math.min(minY, item.y);
      maxY = Math.max(maxY, item.y + CARD_H + BADGE_H);
    });

    const layoutW = maxX - minX;
    const layoutH = maxY - minY;

    // Determine scale to fit bounded area perfectly
    const availW = AREA_W - PAD * 2;
    const availH = AREA_H - PAD * 2;
    const scaleX = layoutW > availW ? availW / layoutW : 1;
    const scaleY = layoutH > availH ? availH / layoutH : 1;
    const scale = Math.min(scaleX, scaleY, 1);

    const scaledW = layoutW * scale;
    const scaledH = layoutH * scale;

    // Bounding top-left in area
    const startX = (AREA_W - scaledW) / 2;
    const startY = (AREA_H - scaledH) / 2;

    return layout.map((item, idx) => {
      // Scaled top-left for this card
      const cardLeft = startX + (item.x - minX) * scale;
      const cardTop = startY + (item.y - minY) * scale;

      // Card center position (ReaderStudioDesk uses -translate-x-1/2 -translate-y-1/2)
      const centerX = cardLeft + CARD_W / 2;
      const centerY = cardTop + CARD_H / 2;

      return {
        id: `slot-${idx + 1}`,
        positionName: item.label || `Vị trí #${idx + 1}`,
        x: Math.round(centerX),
        y: Math.round(centerY),
      };
    });
  }, [targetCount, activeDesk.selectedPresetId]);

  // Handle Shuffle & Start Ritual
  const handleStartShuffle = async () => {
    if (step !== 'SETUP') return;

    setDesks((prev) =>
      prev.map((desk) =>
        desk.id === activeDeskId
          ? { ...desk, questionText: setupQuestion, selectedPresetId: setupPresetId }
          : desk
      )
    );
    readerAudio.playFanSpread();
    setStep('SHUFFLING');
    startCollecting();
    const { events, timings } = stopCollecting();
    const shuffledOrder = await hyperShuffle(
      events,
      timings,
      deckProvider.info.totalCards
    );
    if (!isMountedRef.current) return;

    const newDeck = createNewDeck(shuffledOrder);
    setDeckState(newDeck);
    setFaceDownPositions(prepareFaceDownCards(newDeck, deckProvider.info.totalCards));
    shuffleTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setStep('READING');
      }
    }, 1200);
  };

  // Create new desk session
  const handleCreateNewDesk = useCallback((presetId?: SpreadLayoutType) => {
    const newDeskId = `desk-${Date.now()}-${++idCounterRef.current}`;
    const newDeskName = `Bàn ${desks.length + 1}`;
    const newDesk: StudioDeskSession = {
      id: newDeskId,
      deskName: newDeskName,
      selectedPresetId: presetId || activeDesk.selectedPresetId || 'three-card',
      questionText: activeDesk.questionText || '',
      dealtCards: [],
      generalNotes: '',
    };
    setDesks((prev) => [...prev, newDesk]);
    setActiveDeskId(newDeskId);
    setSelectedCardId(null);
  }, [activeDesk, desks.length]);

  // Delete a desk session
  const handleDeleteDesk = useCallback((deskId: string) => {
    if (desks.length <= 1) return;
    const remaining = desks.filter((d) => d.id !== deskId);
    setDesks(remaining);
    if (activeDeskId === deskId) {
      setActiveDeskId(remaining[remaining.length - 1].id);
    }
  }, [desks, activeDeskId]);

  // Pick card from fan deck to active desk (PREVENT DUPLICATE CARDS & SLOT ERRORS)
  const handlePickFromFan = useCallback((displayIdx: number) => {
    if (isTargetSpreadComplete) {
      return; // Stop drawing when required cards for preset are completed
    }

    // Collect all drawn card IDs across ALL desks to guarantee 100% NO DUPLICATES!
    const allDrawnCardIds = new Set<number>();
    desks.forEach((d) => d.dealtCards.forEach((c) => allDrawnCardIds.add(c.card.id)));

    let activeDeck = deckState;
    if (!activeDeck) {
      const order = Array.from({ length: 78 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      activeDeck = createNewDeck(order);
      setDeckState(activeDeck);
    }

    // Ensure faceDownPositions is valid and matched with undrawn cards
    let currentFaceDowns = faceDownPositions;
    if (!currentFaceDowns || currentFaceDowns.length === 0 || !currentFaceDowns.some(p => p.positionIndex === displayIdx)) {
      const remainingCount = Math.max(1, 78 - allDrawnCardIds.size);
      currentFaceDowns = prepareFaceDownCards(activeDeck, remainingCount);
      setFaceDownPositions(currentFaceDowns);
    }

    let drawnCardId: number | null = null;
    let isReversed = Math.random() < 0.25;

    // Try picking from faceDownPositions safely
    try {
      const pickedSlot = currentFaceDowns.find(p => p.positionIndex === displayIdx) || currentFaceDowns[0];
      if (pickedSlot && !allDrawnCardIds.has(pickedSlot.preAssignedCardId)) {
        const drawn = userPicksFromFaceDown(activeDeck, currentFaceDowns, pickedSlot.positionIndex);
        drawnCardId = drawn.cardId;
        isReversed = drawn.isReversed;
      }
    } catch {
      // Fallback if faceDownPositions had an out-of-sync index
    }

    // Fallback: pick the first available undrawn card from shuffledOrder
    if (!drawnCardId || allDrawnCardIds.has(drawnCardId)) {
      for (const candidateId of activeDeck.shuffledOrder) {
        if (!allDrawnCardIds.has(candidateId)) {
          drawnCardId = candidateId;
          activeDeck.drawnCardIds.add(candidateId);
          break;
        }
      }
    }

    if (!drawnCardId) return; // All 78 cards drawn across desks

    const cardType = deckProvider.getById(drawnCardId);
    if (!cardType) return;

    // Refresh deckState and prepare updated faceDownPositions for next pick
    setDeckState({ ...activeDeck });
    const nextRemaining = 78 - (allDrawnCardIds.size + 1);
    if (nextRemaining > 0) {
      setFaceDownPositions(prepareFaceDownCards(activeDeck, nextRemaining));
    } else {
      setFaceDownPositions([]);
    }

    const pickOrder = activeDesk.dealtCards.length + 1;
    const targetSlot = slots[activeDesk.dealtCards.length] || {
      id: `slot-${pickOrder}`,
      positionName: `Lá thứ #${pickOrder}`,
      x: 100 + ((pickOrder - 1) % 5) * 150,
      y: 120 + Math.floor((pickOrder - 1) / 5) * 200,
    };

    const newDealt: StudioDealtCard = {
      id: `studio-card-${drawnCardId}-${pickOrder}-${++idCounterRef.current}`,
      card: cardType,
      isReversed,
      pickOrder,
      positionName: targetSlot.positionName,
      x: targetSlot.x,
      y: targetSlot.y,
      rotation: (Math.random() - 0.5) * 6,
      isFlipped: false,
      notes: '',
    };

    setDesks((prev) =>
      prev.map((d) =>
        d.id === activeDeskId
          ? { ...d, dealtCards: [...d.dealtCards, newDealt] }
          : d
      )
    );
    setSelectedCardId(newDealt.id);
  }, [activeDesk, activeDeskId, deckProvider, deckState, desks, faceDownPositions, isTargetSpreadComplete, slots]);

  // Card Flip Handler
  const handleFlipCard = useCallback((cardId: string) => {
    readerAudio.playFlip();
    setDesks((prev) =>
      prev.map((d) =>
        d.id === activeDeskId
          ? {
              ...d,
              dealtCards: d.dealtCards.map((c) =>
                c.id === cardId ? { ...c, isFlipped: !c.isFlipped } : c
              ),
            }
          : d
      )
    );
  }, [activeDeskId]);

  // Card Notes Handler
  const handleUpdateNotes = useCallback((cardId: string, notes: string) => {
    setDesks((prev) =>
      prev.map((d) =>
        d.id === activeDeskId
          ? {
              ...d,
              dealtCards: d.dealtCards.map((c) =>
                c.id === cardId ? { ...c, notes } : c
              ),
            }
          : d
      )
    );
  }, [activeDeskId]);

  // General Notes Handler
  const handleUpdateGeneralNotes = useCallback((notes: string) => {
    setDesks((prev) =>
      prev.map((d) => (d.id === activeDeskId ? { ...d, generalNotes: notes } : d))
    );
  }, [activeDeskId]);

  // Card Position Drag Handler
  const handleUpdateCardPosition = useCallback((cardId: string, x: number, y: number) => {
    setDesks((prev) =>
      prev.map((d) =>
        d.id === activeDeskId
          ? {
              ...d,
              dealtCards: d.dealtCards.map((c) =>
                c.id === cardId ? { ...c, x, y } : c
              ),
            }
          : d
      )
    );
  }, [activeDeskId]);

  // Clear Desk
  const handleClearDesk = useCallback(() => {
    readerAudio.playPageTurn();
    setDesks((prev) =>
      prev.map((d) => (d.id === activeDeskId ? { ...d, dealtCards: [] } : d))
    );
    setSelectedCardId(null);
  }, [activeDeskId]);

  const selectedCard = useMemo(
    () => activeDesk.dealtCards.find((c) => c.id === selectedCardId) || null,
    [activeDesk.dealtCards, selectedCardId]
  );

  const handleUpdatePresetId = useCallback((presetId: SpreadLayoutType) => {
    setDesks((prev) =>
      prev.map((d) => (d.id === activeDeskId ? { ...d, selectedPresetId: presetId } : d))
    );
  }, [activeDeskId]);

  const deskTabs = useMemo(
    () => desks.map((desk) => ({
      id: desk.id,
      deskName: desk.deskName,
      cardCount: desk.dealtCards.length,
    })),
    [desks]
  );
  const remainingCardCount = useMemo(
    () => 78 - desks.reduce((sum, desk) => sum + desk.dealtCards.length, 0),
    [desks]
  );
  const handleSelectCard = useCallback((id: string) => {
    readerAudio.playHover();
    setSelectedCardId(id);
  }, []);
  const handleOpenGrimoire = useCallback(() => {
    readerAudio.playPageTurn();
    setIsGrimoireOpen(true);
  }, []);
  const handleCloseGrimoire = useCallback(() => setIsGrimoireOpen(false), []);
  const handleToggleMute = useCallback(() => setIsMuted(readerAudio.toggleMute()), []);
  const handleOpenLayoutMenu = useCallback(() => setShowPresetMenu(true), []);
  const handleCloseLayoutMenu = useCallback(() => setShowPresetMenu(false), []);
  const handleSwitchDesk = useCallback((deskId: string) => {
    setActiveDeskId(deskId);
    setSelectedCardId(null);
  }, []);

  return (
    <div
      onMouseMove={onMouseMove}
      className="fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#0e0805] text-[#fdf0d5] select-none"
    >
      {/* STEP 1: SETUP MODAL */}
      {step === 'SETUP' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-serif">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain p-6 rounded-3xl bg-[#1c120a] border-2 border-[#d4af37]/40 shadow-[0_0_60px_rgba(212,175,55,0.25)] space-y-6 text-center"
          >
            <div className="space-y-2">
              <span className="text-4xl">🌿</span>
              <h2 className="text-2xl font-bold text-[#e6c594] tracking-wider font-cinzel">
                Tarot Reader Studio
              </h2>
              <p className="text-xs text-[#b89f80] font-sans">
                Góc Nhìn Người Đọc Bài Tarot — Bàn Đọc Gỗ Ghibli & Sổ Diễn Giải Cổ Điển
              </p>
            </div>

            {/* Question Input */}
            <div className="space-y-2 text-left font-sans">
              <label className="text-xs font-bold text-[#e6c594] uppercase tracking-wider flex items-center gap-1.5">
                <span>💭</span> Câu Hỏi / Chủ Đề Quẻ Bài (Querent Topic)
              </label>
              <input
                type="text"
                value={setupQuestion}
                onChange={(e) => setSetupQuestion(e.target.value)}
                placeholder="Nhập câu hỏi hoặc chủ đề chiêm nghiệm của Querent..."
                className="w-full p-3.5 rounded-xl bg-[#0f0905] border border-[#d4af37]/30 text-[#fdf0d5] text-xs focus:border-[#d4af37] focus:outline-none transition-colors"
              />
            </div>

            {/* Preset Selector */}
            <div className="space-y-2 text-left font-sans">
              <label className="text-xs font-bold text-[#e6c594] uppercase tracking-wider flex items-center gap-1.5">
                <span>📐</span> Chọn Sơ Đồ Trải Bài (Tối đa 13 lá/bàn)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {studioPresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      readerAudio.playHover();
                      setSetupPresetId(p.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      setupPresetId === p.id
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#e6c594] shadow-md'
                        : 'bg-[#120a05] border-[#d4af37]/20 text-[#a38a6d] hover:border-[#d4af37]/50 hover:text-[#e6c594]'
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{p.nameVi}</div>
                      <div className="text-[10px] opacity-75">{p.recommendedCards > 0 ? `${p.recommendedCards} lá` : 'Tự do (tối đa 13)'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartShuffle}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f4a261] text-[#1c120a] font-sans font-bold uppercase tracking-widest text-sm shadow-[0_0_25px_rgba(244,162,97,0.5)] hover:scale-[1.02] active:scale-98 transition-all cursor-pointer"
            >
              ✦ Trộn Bài & Mở Bàn Đọc ✦
            </button>
          </motion.div>
        </div>
      )}

      {/* STEP 2: SHUFFLING OVERLAY */}
      {step === 'SHUFFLING' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md space-y-4 font-serif">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            className="text-6xl"
          >
            🏵️
          </motion.div>
          <h3 className="text-xl font-bold text-[#e6c594] tracking-widest uppercase font-cinzel">
            Đang Trộn Bài Tâm Linh...
          </h3>
          <p className="text-xs text-[#b89f80] font-sans">
            Tích tụ năng lượng entropy & xòe bộ bài lên bàn
          </p>
        </div>
      )}

      {/* STEP 3: MAIN READER STUDIO DESK & FAN DECK */}
      <ReaderStudioDesk
        dealtCards={activeDesk.dealtCards}
        selectedCardId={selectedCardId}
        onSelectCard={handleSelectCard}
        onFlipCard={handleFlipCard}
        slots={slots}
        onOpenGrimoire={handleOpenGrimoire}
        onUpdateCardPosition={handleUpdateCardPosition}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        activePresetName={presetInfo.nameVi}
        onClearDesk={handleClearDesk}
        onOpenLayoutMenu={handleOpenLayoutMenu}
        desks={deskTabs}
        activeDeskId={activeDeskId}
        onSwitchDesk={handleSwitchDesk}
        onCreateNewDesk={handleCreateNewDesk}
        onDeleteDesk={handleDeleteDesk}
      />

      {/* Arc Fan Deck Spread at Screen Bottom (AUTO HIDE WHEN SPREAD OR 13 LIMIT IS REACHED) */}
      {!isTargetSpreadComplete && (
        <ReaderFanDeck
          remainingCount={remainingCardCount}
          onPickCard={handlePickFromFan}
          disabled={isTargetSpreadComplete}
          isMaxLimitReached={activeDesk.dealtCards.length >= 13}
          onCreateNewDesk={handleCreateNewDesk}
        />
      )}

      {/* Grimoire Side Panel */}
      <ReaderGrimoire
        isOpen={isGrimoireOpen}
        onClose={handleCloseGrimoire}
        selectedCard={selectedCard}
        dealtCards={activeDesk.dealtCards}
        onUpdateNotes={handleUpdateNotes}
        generalNotes={activeDesk.generalNotes}
        onUpdateGeneralNotes={handleUpdateGeneralNotes}
        journalKey={activeDeskId}
        onSelectCard={handleSelectCard}
      />

      {/* Change Layout Preset Modal */}
      <AnimatePresence>
        {showPresetMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-serif">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-5 rounded-2xl bg-[#1c120a] border border-[#d4af37]/40 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#d4af37]/20 pb-3">
                <h3 className="text-base font-bold text-[#e6c594] font-cinzel">
                  Đổi Sơ Đồ Trải Bài (Tối đa 13 lá/bàn)
                </h3>
                <button
                  onClick={handleCloseLayoutMenu}
                  className="text-[#a38a6d] hover:text-[#e6c594]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin font-sans">
                {studioPresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      readerAudio.playPageTurn();
                      handleUpdatePresetId(p.id);
                      setShowPresetMenu(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      activeDesk.selectedPresetId === p.id
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#e6c594]'
                        : 'bg-[#120a05] border-[#d4af37]/20 text-[#a38a6d] hover:border-[#d4af37]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      <span className="text-xs font-bold">{p.nameVi}</span>
                    </div>
                    <span className="text-[10px] text-[#b89f80]">{p.recommendedCards > 0 ? `${p.recommendedCards} lá` : 'Tự do (tối đa 13)'}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
