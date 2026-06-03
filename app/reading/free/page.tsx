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
import { SOUL_MARKS } from '@/lib/soul-marks';
import { TierRound, createInitialRound } from '@/lib/multi-tier-deck';
import { useApiKey } from '@/components/ApiKeyProvider';

type FlowStep = 'SETUP' | 'SHUFFLING' | 'PICKING' | 'RESULT';

type FreeDrawnCard = FreeWorkspaceCard;

type ConversationSpeaker = 'guide' | 'seeker';

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

const FREE_SESSION_STORAGE_KEY = 'tarot_free_unlimited_session';

function getInitialCardPlacement(round: number, pickOrder: number, zIndex: number) {
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

function findNonOverlappingPlacement(
  round: number,
  pickOrder: number,
  zIndex: number,
  existingCards: FreeWorkspaceCard[]
) {
  const placement = getInitialCardPlacement(round, pickOrder, zIndex);
  
  const thresholdX = 140; // horizontal separation
  const thresholdY = 245; // vertical separation
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    let hasOverlap = false;
    for (const card of existingCards) {
      const dx = Math.abs(card.x - placement.x);
      const dy = Math.abs(card.y - placement.y);
      if (dx < thresholdX && dy < thresholdY) {
        hasOverlap = true;
        break;
      }
    }
    
    if (!hasOverlap) {
      break;
    }
    
    // Shift position: try shifting horizontally to the right
    placement.x += 155;
    
    // If it goes beyond the BOARD_WIDTH boundary, wrap it back and shift down
    if (placement.x > 1800 - 150) {
      placement.x = 120;
      placement.y += 100; // shift down
    }
    
    attempts++;
  }
  
  return placement;
}

export default function FreeReadingPage() {
  const { startCollecting, stopCollecting } = useEntropyCollector();
  const { shuffleTheme, pickingTheme, reduceMotion } = useApiKey();
  const hasLoadedSession = useRef(false);
  const idCounterRef = useRef(0);

  // Page States
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [hideTopControls, setHideTopControls] = useState<boolean>(true);
  const [step, setStep] = useState<FlowStep>('SETUP');
  const [cardsToPickThisRound, setCardsToPickThisRound] = useState<number>(3);
  const [weatherEffect, setWeatherEffect] = useState<'wind' | 'sun' | 'fog' | null>(null);

  // Toggle state for session side panel
  const [showJournal, setShowJournal] = useState<boolean>(false);
  const [showCardControlPanel, setShowCardControlPanel] = useState<boolean>(false);
  const [showRoundSettings, setShowRoundSettings] = useState<boolean>(false);

  // Dynamic Ghibli roundsData storage
  const [roundsData, setRoundsData] = useState<TierRound[]>([
    createInitialRound(1, 0), // Round 1: Rừng Xanh
    createInitialRound(2, 1), // Round 2: Nắng Ấm
    createInitialRound(3, 2), // Round 3: Bầu Trời
  ]);

  const allDrawnCards = useMemo(
    () => roundsData.flatMap((r) => r.cards),
    [roundsData]
  );

  const handleCreateNewRound = () => {
    const nextRoundNumber = roundsData.length > 0
      ? Math.max(...roundsData.map(r => r.roundNumber)) + 1
      : 1;
    const newRound: TierRound = {
      roundNumber: nextRoundNumber,
      roundName: `Vòng ${nextRoundNumber}`,
      soulMarkIndex: (nextRoundNumber - 1) % 8,
      cards: [],
      deckMode: 'fresh',
      maxCards: 3,
    };
    setRoundsData((prev) => [...prev, newRound]);
    setCurrentRound(nextRoundNumber);
    setCardsToPickThisRound(3);
  };

  const handleDeleteRound = (roundNum: number) => {
    if (confirm(`Quý nhân có chắc chắn muốn xóa Vòng ${roundNum} và toàn bộ lá bài trong vòng này không?`)) {
      const remaining = roundsData.filter((r) => r.roundNumber !== roundNum);
      if (remaining.length > 0) {
        setRoundsData(remaining);
        setCurrentRound(remaining[0].roundNumber);
        setCardsToPickThisRound(remaining[0].maxCards);
      } else {
        const fallback = createInitialRound(1, 0);
        setRoundsData([fallback]);
        setCurrentRound(1);
        setCardsToPickThisRound(3);
      }
      setActiveCardId(null);
    }
  };

  const soulMarkIndexesMap = useMemo(() => {
    const map: Record<number, number> = {};
    roundsData.forEach((r) => {
      map[r.roundNumber] = r.soulMarkIndex;
    });
    return map;
  }, [roundsData]);

  const roundNamesMap = useMemo(() => {
    const map: Record<number, string> = {};
    roundsData.forEach((r) => {
      map[r.roundNumber] = r.roundName;
    });
    return map;
  }, [roundsData]);
  
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Picker states
  const [deckState, setDeckState] = useState<DeckState | null>(null);
  const [faceDownPositions, setFaceDownPositions] = useState<FaceDownPosition[]>([]);
  const [currentPickCount, setCurrentPickCount] = useState<number>(0);

  // Journal Notepad State (parchment)
  const [journalNotes, setJournalNotes] = useState<string>('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [conversationInput, setConversationInput] = useState('');
  const [conversationSpeaker, setConversationSpeaker] = useState<ConversationSpeaker>('guide');
  const [copySuccess, setCopySuccess] = useState(false);

  // Inspector State
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Load free session from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const restoreTimer = window.setTimeout(() => {
        const saved = sessionStorage.getItem(FREE_SESSION_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as any;
            const hydratedCards = (parsed.cards || [])
              .map((savedCard: any) => {
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

            let loadedRounds: TierRound[] = [];
            if (parsed.roundsConfig && Array.isArray(parsed.roundsConfig)) {
              loadedRounds = parsed.roundsConfig.map((rConf: any) => ({
                roundNumber: rConf.roundNumber,
                roundName: rConf.roundName,
                soulMarkIndex: rConf.soulMarkIndex,
                deckMode: rConf.deckMode || 'fresh',
                maxCards: rConf.maxCards || 3,
                cards: hydratedCards.filter((card) => card.round === rConf.roundNumber),
              }));
            } else {
              loadedRounds = [1, 2, 3].map((rNum) => {
                const rIdx = rNum - 1;
                return {
                  roundNumber: rNum,
                  roundName: parsed.roundNames?.[rNum] || `Vòng ${rNum}`,
                  soulMarkIndex: parsed.soulMarkIndexes?.[rNum] !== undefined ? parsed.soulMarkIndexes[rNum] : rIdx,
                  cards: hydratedCards.filter((card) => card.round === rNum),
                  deckMode: parsed.deckModes?.[rNum] || (rNum === 1 ? 'fresh' : 'continue'),
                  maxCards: parsed.maxCardsList?.[rNum] || 3,
                };
              });
            }

            setRoundsData(loadedRounds);
            setCurrentRound(parsed.currentRound || 1);
            setCardsToPickThisRound(parsed.cardsToPickThisRound || 3);
            setJournalNotes(parsed.journalNotes || '');
            setConversation(parsed.conversation || []);
            setStep('SETUP');
            idCounterRef.current = hydratedCards.length + (parsed.conversation || []).length;
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

  // Persist the free workspace after initial hydration
  useEffect(() => {
    if (!hasLoadedSession.current || typeof window === 'undefined') return;

    const cardsToSave: SavedWorkspaceCard[] = allDrawnCards.map((workspaceCard) => {
      const { card, ...rest } = workspaceCard;
      return {
        ...rest,
        cardId: card.id,
      };
    });

    const payload = {
      currentRound,
      cardsToPickThisRound,
      cards: cardsToSave,
      journalNotes,
      conversation,
      roundsConfig: roundsData.map((r) => ({
        roundNumber: r.roundNumber,
        roundName: r.roundName,
        soulMarkIndex: r.soulMarkIndex,
        deckMode: r.deckMode,
        maxCards: r.maxCards,
      })),
    };

    sessionStorage.setItem(FREE_SESSION_STORAGE_KEY, JSON.stringify(payload));
    sessionStorage.setItem('tarot_free_journal', journalNotes);
  }, [allDrawnCards, cardsToPickThisRound, conversation, currentRound, journalNotes, roundsData]);

  // Save journal to sessionStorage on edit
  const handleJournalChange = (text: string) => {
    setJournalNotes(text);
    sessionStorage.setItem('tarot_free_journal', text);
  };

  // SHUFFLE PER ROUND
  const handleStartShuffle = async () => {
    const curRound = roundsData.find(r => r.roundNumber === currentRound);
    if (!curRound) return;

    setStep('SHUFFLING');
    setCurrentPickCount(curRound.cards.length);

    // If continue mode, bypass hyperShuffle
    if (curRound.deckMode === 'continue' && deckState) {
      setTimeout(() => {
        const remainingCards = 78 - deckState.drawnCardIds.size;
        const faceDowns = prepareFaceDownCards(deckState, remainingCards);
        setFaceDownPositions(faceDowns);
        setStep('PICKING');
      }, reduceMotion ? 100 : 600);
      return;
    }

    // Fresh shuffle
    startCollecting();

    if (shuffleTheme === 'wheel-of-fate') {
      const weathers = ['wind', 'sun', 'fog'] as const;
      const rw = weathers[Math.floor(Math.random() * weathers.length)];
      setWeatherEffect(rw);
    } else {
      setWeatherEffect(null);
    }

    const finishShuffle = async () => {
      const entropy = stopCollecting();
      const shuffledOrder = await hyperShuffle(entropy.events, entropy.timings);
      const newDeck = createNewDeck(shuffledOrder);
      const faceDowns = prepareFaceDownCards(newDeck, 78);

      setDeckState(newDeck);
      setFaceDownPositions(faceDowns);
      setStep('PICKING');
    };

    if (shuffleTheme !== 'soot-sprite') {
      setTimeout(finishShuffle, reduceMotion ? 100 : 1500);
    } else {
      (window as any).finishFreeShuffle = finishShuffle;
    }
  };

  // SELECT CARD FOR ACTIVE ROUND
  const handleSelectCard = (displayIdx: number) => {
    if (step !== 'PICKING' || !deckState) return;

    try {
      const drawn = userPicksFromFaceDown(deckState, faceDownPositions, displayIdx);
      const cardType = getCardById(drawn.cardId);

      if (!cardType) return;

      const activeRoundData = roundsData.find(r => r.roundNumber === currentRound);
      if (!activeRoundData) return;

      const currentRoundCards = activeRoundData.cards;
      const newPickCount = currentRoundCards.length + 1;
      const placement = findNonOverlappingPlacement(currentRound, newPickCount, allDrawnCards.length + 1, allDrawnCards);

      const drawnCard: FreeDrawnCard = {
        id: `free-${currentRound}-${drawn.cardId}-${newPickCount}-${++idCounterRef.current}`,
        card: cardType,
        isReversed: drawn.isReversed,
        pickOrder: newPickCount,
        round: currentRound,
        label: `${activeRoundData.roundName} · Lá ${newPickCount}`,
        note: '',
        locked: false,
        ...placement,
      };
      setActiveCardId(drawnCard.id);

      // Store in roundsData
      setRoundsData((prev) => {
        return prev.map((round) => {
          if (round.roundNumber === currentRound) {
            return {
              ...round,
              cards: [...round.cards, drawnCard],
            };
          }
          return round;
        });
      });

      setCurrentPickCount(newPickCount);

      if (newPickCount >= cardsToPickThisRound) {
        setStep('SETUP');
      } else {
        const remainingCount = activeRoundData.deckMode === 'continue'
          ? 78 - deckState.drawnCardIds.size
          : 78 - newPickCount;
        const faceDowns = prepareFaceDownCards(deckState, remainingCount);
        setFaceDownPositions(faceDowns);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CARD DETAILED INSPECTION
  const handleCardInspect = (card: TarotCardType) => {
    setSelectedCard(card);
    setIsInspectorOpen(true);
  };

  const handleUpdateWorkspaceCard = (cardId: string, updates: Partial<FreeWorkspaceCard>) => {
    setRoundsData((prev) =>
      prev.map((round) => ({
        ...round,
        cards: round.cards.map((c) =>
          c.id === cardId ? { ...c, ...updates } : c
        ),
      }))
    );
  };

  const handleAutoArrangeWorkspace = () => {
    setRoundsData((prev) =>
      prev.map((round) => ({
        ...round,
        cards: round.cards.map((c, index) => ({
          ...c,
          ...getInitialCardPlacement(c.round, index + 1, index + 1),
          pickOrder: index + 1,
        })),
      }))
    );
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

    let clipboardText = `🎨 KHÔNG GIAN TRẢI NGHIỆM TAROT TỰ DO\n`;
    clipboardText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    clipboardText += `📅 Thời gian trải bài: ${dateText}\n\n`;
    roundsData.forEach((r) => {
      clipboardText += formatCardsList(r.roundName.toUpperCase(), r.cards);
    });
    clipboardText += `📝 NHẬT KÝ TỔNG HỢP:\n`;
    clipboardText += `${journalNotes.trim() || '(Không ghi chú)'}\n`;
    clipboardText += `\n💬 TRAO ĐỔI TRONG PHIÊN:\n`;
    clipboardText += conversation.length === 0
      ? '(Chưa có trao đổi được ghi lại)\n'
      : conversation
          .map((message) => {
            const relatedCard = allDrawnCards.find((card) => card.id === message.relatedCardId);
            const cardText = relatedCard ? ` [${relatedCard.card.nameVi}]` : '';
            return `  - ${message.createdAt} · ${message.speaker === 'guide' ? 'Người đọc' : 'Người hỏi'}${cardText}: ${message.text}`;
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
      setRoundsData([
        createInitialRound(1, 0),
        createInitialRound(2, 1),
        createInitialRound(3, 2),
      ]);
      setCardsToPickThisRound(3);
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
    <div className="h-screen w-screen bg-[#070711] select-none flex flex-row overflow-hidden relative">
      <style>{`
        nav {
          display: none !important;
        }
      `}</style>

      {/* Main Workspace Area (takes remaining width) */}
      <div className="flex-1 h-full min-w-0 relative flex flex-col">
        <FreeTarotWorkspace2D
          cards={allDrawnCards}
          activeCardId={activeCardId}
          showCardControlPanel={showCardControlPanel}
          onSelectCard={setActiveCardId}
          onUpdateCard={handleUpdateWorkspaceCard}
          onInspectCard={handleCardInspect}
          onAutoArrange={handleAutoArrangeWorkspace}
          soulMarkIndexes={soulMarkIndexesMap}
          roundNames={roundNamesMap}
          fullScreen={true}
          showRoundSettings={showRoundSettings}
          onToggleRoundSettings={() => setShowRoundSettings(!showRoundSettings)}
          onClearBoard={handleResetAll}
          onCopyResults={handleCopyResults}
          showJournal={showJournal}
          onToggleJournal={() => setShowJournal(!showJournal)}
          onToggleCardControlPanel={() => setShowCardControlPanel(!showCardControlPanel)}
          hasCards={allDrawnCards.length > 0}
        />

        {/* ROUND CONFIGURATION SIDEBAR POPUP (SLIDE-OUT FROM RIGHT) */}
        <AnimatePresence>
          {showRoundSettings && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full sm:w-[350px] bg-[#0d0d1a]/95 border-l border-gold-primary/20 shadow-2xl z-30 flex flex-col p-5 backdrop-blur-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 select-none flex-shrink-0">
                <h3 className="font-cinzel text-xs font-bold text-gold-light uppercase tracking-wider flex items-center gap-1.5">
                  ⚙️ Cài Đặt Vòng Rút
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRoundSettings(false)}
                  className="text-text-secondary hover:text-gold-light transition-colors text-[10px] font-sans uppercase font-bold tracking-wider cursor-pointer"
                >
                  ❌ Đóng
                </button>
              </div>

              {/* Settings Content */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin select-none">
                
                {/* Tab selector */}
                <div className="flex flex-col gap-2 border-b border-white/5 pb-3">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">
                    Chọn Vòng Trải Bài:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {roundsData.map((round) => {
                      const isSelected = currentRound === round.roundNumber;
                      const mark = SOUL_MARKS[round.soulMarkIndex] || SOUL_MARKS[0];
                      return (
                        <button
                          key={round.roundNumber}
                          type="button"
                          onClick={() => {
                            setCurrentRound(round.roundNumber);
                            setCardsToPickThisRound(round.maxCards);
                          }}
                          className="px-2.5 py-1 rounded-xl border text-[9px] font-sans font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 bg-white/5 border-white/10 text-text-secondary hover:border-white/20"
                          style={
                            isSelected
                              ? {
                                  borderColor: mark.color,
                                  color: mark.color,
                                  boxShadow: `0 0 10px rgba(244,162,97,0.15)`,
                                  transform: 'scale(1.05)'
                                }
                              : {}
                          }
                        >
                          <span>{mark.icon}</span>
                          <span>{round.roundName}</span>
                          <span className="px-1 py-0.2 rounded bg-black/30 text-[8px] font-mono">
                            {round.cards.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add round button */}
                  <button
                    type="button"
                    onClick={handleCreateNewRound}
                    className="w-full mt-1.5 py-1.5 rounded-xl border border-dashed border-gold-primary/30 hover:border-gold-light text-gold-light hover:text-white bg-gold-primary/5 hover:bg-gold-primary/15 text-[10px] font-sans font-bold cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-95"
                  >
                    ➕ Thêm Vòng Rút Mới
                  </button>
                </div>

                {/* Configurations for current round */}
                {roundsData.find(r => r.roundNumber === currentRound) && (() => {
                  const activeRoundData = roundsData.find(r => r.roundNumber === currentRound)!;
                  return (
                    <div className="flex flex-col gap-4 text-xs font-lora">
                      
                      {/* Round Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold font-sans">
                          Tên Vòng Đang Chọn:
                        </label>
                        <input
                          type="text"
                          value={activeRoundData.roundName}
                          onChange={(e) => {
                            const name = e.target.value;
                            setRoundsData((prev) => {
                              return prev.map((r) => r.roundNumber === currentRound ? { ...r, roundName: name } : r);
                            });
                          }}
                          className="rounded-xl bg-bg-elevated/45 border border-white/10 focus:border-gold-primary/45 outline-none px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/35"
                        />
                      </div>

                      {/* Soul Marks */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold font-sans">
                          Dấu Ấn Linh Hồn (Màu Viền):
                        </label>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {SOUL_MARKS.map((mark, index) => {
                            const isSelected = activeRoundData.soulMarkIndex === index;
                            return (
                              <button
                                key={mark.name}
                                type="button"
                                onClick={() => {
                                  setRoundsData((prev) => {
                                    return prev.map((r) => r.roundNumber === currentRound ? { ...r, soulMarkIndex: index } : r);
                                  });
                                }}
                                className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs transition-all cursor-pointer ${
                                  isSelected
                                    ? `${mark.bgClass} ${mark.borderClass} scale-110 shadow-lg`
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                                title={mark.name}
                              >
                                <span>{mark.icon}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cards Count Slider */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold font-sans">
                            Số Lá Bài Cần Rút:
                          </label>
                          <span className="px-2 py-0.5 rounded bg-gold-primary/15 border border-gold-primary/30 text-gold-light font-sans font-bold text-[10px]">
                            {activeRoundData.maxCards} lá
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={cardsToPickThisRound}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCardsToPickThisRound(val);
                            setRoundsData((prev) => {
                              return prev.map((r) => r.roundNumber === currentRound ? { ...r, maxCards: val } : r);
                            });
                          }}
                          className="w-full accent-gold-primary bg-white/10 h-1.5 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Shuffle Deck mode */}
                      <div className="flex items-center gap-4 text-[10px] text-text-secondary font-sans mt-1">
                        <span className="font-bold uppercase tracking-wider text-[9px]">Trộn bài:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-text-primary transition-colors">
                          <input
                            type="radio"
                            name={`deckMode-${currentRound}`}
                            checked={activeRoundData.deckMode === 'fresh'}
                            onChange={() => {
                              setRoundsData((prev) => {
                                return prev.map((r) => r.roundNumber === currentRound ? { ...r, deckMode: 'fresh' } : r);
                              });
                            }}
                            className="accent-gold-primary w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Trộn mới 🔄</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer hover:text-text-primary transition-colors">
                          <input
                            type="radio"
                            name={`deckMode-${currentRound}`}
                            checked={activeRoundData.deckMode === 'continue'}
                            onChange={() => {
                              setRoundsData((prev) => {
                                return prev.map((r) => r.roundNumber === currentRound ? { ...r, deckMode: 'continue' } : r);
                              });
                            }}
                            className="accent-gold-primary w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Rút tiếp ➡️</span>
                        </label>
                      </div>

                      {/* Action Buttons inside Drawer */}
                      <div className="flex flex-col gap-2 mt-3 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoundSettings(false); // Close settings drawer when draw starts to see the overlay
                            handleStartShuffle();
                          }}
                          className="w-full py-2.5 font-sans font-bold text-[11px] uppercase tracking-widest rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_12px_var(--color-gold-glow)] flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <span>🃏 Bắt Đầu Rút Bài</span>
                        </button>

                        {roundsData.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteRound(currentRound)}
                            className="w-full py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-xl bg-red-950/20 border border-red-500/25 hover:border-red-500 hover:bg-red-950/40 text-red-400 cursor-pointer transition-all flex items-center justify-center gap-1"
                          >
                            🗑️ Xóa Vòng Này
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CARD DECK DRAWING OVERLAY */}
        <AnimatePresence>
          {(step === 'SHUFFLING' || step === 'PICKING') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 bg-[#070711]/92 backdrop-blur-md z-40 flex flex-col items-center justify-center p-4 border border-gold-primary/20"
            >
              {/* Close button at top right */}
              <button
                type="button"
                onClick={() => setStep('SETUP')}
                className="absolute top-4 right-4 z-50 px-3 py-1.5 text-text-secondary hover:text-gold-light transition-colors rounded-xl bg-white/5 border border-white/10 hover:border-gold-primary/30 cursor-pointer text-[10px] font-sans uppercase font-bold tracking-wider"
              >
                ❌ Đóng Cửa Sổ
              </button>

              {/* Inside is the CardDeck */}
              <div className="relative w-full max-w-4xl flex flex-col items-center justify-center gap-2 overflow-visible">
                {step === 'PICKING' && roundsData.find(r => r.roundNumber === currentRound) && (
                  <div className="text-center mt-2 flex flex-col gap-0.5 z-10 select-none">
                    <span className="text-[9px] font-sans text-text-secondary uppercase tracking-widest leading-none font-bold">
                      Đang nhặt {roundsData.find(r => r.roundNumber === currentRound)?.roundName}:
                    </span>
                    <span className="text-xs font-cinzel text-gold-light font-bold uppercase tracking-wider animate-pulse">
                      Nhặt quân số {(roundsData.find(r => r.roundNumber === currentRound)?.cards.length || 0) + 1} / {cardsToPickThisRound}
                    </span>
                  </div>
                )}

                <CardDeck
                  cardsCount={
                    roundsData.find(r => r.roundNumber === currentRound)?.deckMode === 'continue' && deckState
                      ? 78 - deckState.drawnCardIds.size
                      : 78 - (roundsData.find(r => r.roundNumber === currentRound)?.cards.length || 0)
                  }
                  onSelectCard={handleSelectCard}
                  isShuffling={step === 'SHUFFLING'}
                  isDeckSpread={step === 'PICKING'}
                  shuffleTheme={shuffleTheme}
                  pickingTheme={pickingTheme}
                  weatherEffect={weatherEffect}
                  reduceMotion={reduceMotion}
                  onStopShuffle={() => {
                    if ((window as any).finishFreeShuffle) {
                      (window as any).finishFreeShuffle();
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT: Professional session notes and conversation panel */}
      <AnimatePresence>
        {showJournal && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="w-full sm:w-[350px] flex-shrink-0 border-l border-white/10 bg-[#0d0d1a]/95 flex flex-col h-full z-20 shadow-2xl relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute inset-0 opacity-[0.035] pointer-events-none bg-radial from-transparent to-[#f4a261]/20 z-0" />

            <div className="flex-1 flex flex-col h-full p-4 md:p-5 gap-4 overflow-hidden relative z-10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0 z-10 select-none">
                <div className="flex items-center gap-2">
                  <div>
                    <h4 className="font-cinzel text-xs font-bold text-gold-light tracking-widest uppercase">
                      Phiên Trải Nghiệm Tarot
                    </h4>
                    <p className="text-[9px] text-text-secondary/55 font-lora italic leading-none mt-1">
                      Ghi lại trao đổi, cảm nhận và các kết luận trong phiên
                    </p>
                  </div>
                </div>
              </div>

              <div className="z-10 flex flex-col gap-2 min-h-0 flex-1">
                <div className="flex items-center justify-between gap-2 select-none flex-shrink-0">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider font-sans font-bold">
                    Trao đổi tự do
                  </span>
                  {activeWorkspaceCard && (
                    <span className="max-w-[150px] truncate text-[9px] text-gold-light/75 font-lora italic">
                      Gắn với: {activeWorkspaceCard.card.nameVi}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-h-[120px] overflow-y-auto rounded-2xl border border-white/[0.08] bg-black/20 p-3 flex flex-col gap-2 scrollbar-thin">
                  {conversation.length > 0 ? (
                    conversation.map((message) => {
                      const relatedCard = allDrawnCards.find((card) => card.id === message.relatedCardId);
                      const isGuide = message.speaker === 'guide';
                      return (
                        <div
                          key={message.id}
                          className={`max-w-[92%] rounded-2xl px-3 py-2 border text-xs leading-relaxed ${
                            isGuide
                              ? 'self-start bg-gold-primary/10 border-gold-primary/18 text-text-primary rounded-tl-sm'
                              : 'self-end bg-white/[0.055] border-white/10 text-text-primary rounded-tr-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[8px] font-sans font-bold uppercase tracking-wider text-text-secondary/60 mb-1 select-none">
                            <span>{isGuide ? 'Người đọc' : 'Người hỏi'}</span>
                            <span>{message.createdAt}</span>
                          </div>
                          <p className="font-lora whitespace-pre-line">{message.text}</p>
                          {relatedCard && (
                            <span className="mt-1 inline-block text-[8px] text-gold-light/70 font-sans uppercase tracking-wider select-none">
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

                <form onSubmit={handleAddConversationMessage} className="flex flex-col gap-2 flex-shrink-0">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConversationSpeaker('guide')}
                      className={`py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        conversationSpeaker === 'guide'
                          ? 'bg-gold-primary/18 border-gold-primary text-gold-light'
                          : 'bg-white/5 border-white/10 text-text-secondary hover:border-gold-primary/30'
                      }`}
                    >
                      Người đọc
                    </button>
                    <button
                      type="button"
                      onClick={() => setConversationSpeaker('seeker')}
                      className={`py-2 rounded-xl border text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        conversationSpeaker === 'seeker'
                          ? 'bg-[#2a9d8f]/18 border-[#2a9d8f] text-[#48cae4]'
                          : 'bg-white/5 border-white/10 text-text-secondary hover:border-[#2a9d8f]/35'
                      }`}
                    >
                      Người hỏi
                    </button>
                  </div>
                  <textarea
                    value={conversationInput}
                    onChange={(event) => setConversationInput(event.target.value)}
                    placeholder="Nhập câu hỏi, phản hồi..."
                    className="h-14 resize-none rounded-xl bg-bg-elevated/45 border border-white/10 focus:border-gold-primary/45 outline-none px-3 py-2 text-xs leading-relaxed text-text-primary placeholder:text-text-secondary/35 scrollbar-thin"
                  />
                  <button
                    type="submit"
                    disabled={!conversationInput.trim()}
                    className="w-full py-2 rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep font-sans font-bold text-xs uppercase tracking-widest cursor-pointer transition-all disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Ghi Vào Phiên
                  </button>
                </form>
              </div>

              <div className="h-44 py-1 flex flex-col relative z-10 flex-shrink-0">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider font-sans font-bold mb-2 select-none">
                  Nhật ký tổng hợp
                </label>
                <textarea
                  value={journalNotes}
                  onChange={(e) => handleJournalChange(e.target.value)}
                  placeholder="Tóm tắt bối cảnh, lời khuyên..."
                  className="w-full flex-1 bg-transparent border-none focus:outline-none resize-none font-lora text-xs md:text-sm text-amber-100 placeholder:text-amber-100/25 leading-relaxed overflow-y-auto scrollbar-thin"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(231,111,81,0.06) 1px, transparent 1px)',
                    backgroundSize: '100% 28px',
                    lineHeight: '28px',
                  }}
                />
              </div>

              <div className="border-t border-[#e76f51]/15 pt-3 flex-shrink-0 flex items-center justify-between z-10 select-none">
                <div className="text-[9px] text-text-secondary/40 font-lora italic leading-tight max-w-[150px]">
                  ✓ Tự do điều khiển và nhặt bài không giới hạn.
                </div>

                <button
                  onClick={handleCopyResults}
                  disabled={allDrawnCards.length === 0}
                  className="px-3 py-2 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95 flex items-center gap-1 bg-white/5 border border-white/10 hover:border-gold-primary hover:bg-white/10 text-gold-light"
                >
                  {copySuccess ? '✓ Đã Sao Chép' : '📋 Sao Chép'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* inspector Modal */}
      {selectedCard && (
        <CardInspector
          card={selectedCard}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          singleCardOnly={true}
        />
      )}
    </div>
  );
}
