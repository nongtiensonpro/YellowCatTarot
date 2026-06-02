'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useApiKey } from '@/components/ApiKeyProvider';
import { TarotCard as TarotCardType, tarotCards, getCardById } from '@/lib/cards-data';
import { spreadTypes } from '@/lib/spreads';
import { interpretCards, CardReading, createUserPrompt } from '@/lib/gemini';
import CardDeck from '@/components/CardDeck';
import CelticCrossBoard from '@/components/CelticCrossBoard';
import AIInterpretation from '@/components/AIInterpretation';
import CardInspector from '@/components/CardInspector';
import { YellowCatState } from '@/components/YellowCat';
import {
  hyperShuffle,
  createNewDeck,
  prepareFaceDownCards,
  userPicksFromFaceDown,
  DeckState,
  FaceDownPosition,
  PositionedCard,
  saveDeck,
  loadDeck,
  clearDeck
} from '@/lib/tarot-deck';
import { useEntropyCollector } from '@/hooks/useEntropyCollector';

const YellowCat3D = dynamic(() => import('@/components/YellowCat3D'), {
  ssr: false,
  loading: () => (
    <div className="w-[180px] h-[180px] flex items-center justify-center">
      <div className="animate-pulse text-gold-light/60 font-cinzel text-xs">Đang đánh thức Mèo Vàng...</div>
    </div>
  ),
});

type FlowStep = 'INPUT' | 'SHUFFLING' | 'PICKING' | 'RESULT' | 'INTERPRETING' | 'COMPLETE';

export default function CelticCrossReading() {
  const { apiKey } = useApiKey();
  const spreadType = spreadTypes['celtic-cross'];

  // React state
  const [step, setStep] = useState<FlowStep>('INPUT');
  const [userQuestion, setUserQuestion] = useState('');
  
  // Cryptographic deck states
  const [deckState, setDeckState] = useState<DeckState | null>(null);
  const [faceDownCards, setFaceDownCards] = useState<FaceDownPosition[]>([]);
  const [drawnCards, setDrawnCards] = useState<{
    card: TarotCardType;
    isReversed: boolean;
    isFlipped: boolean;
  }[]>([]);

  // Entropy collector
  const { startCollecting, stopCollecting, onMouseMove, onTouchMove } = useEntropyCollector();

  // Card inspector modal state
  const [selectedInspectCard, setSelectedInspectCard] = useState<TarotCardType | null>(null);

  // AI states
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  // Clean deck session on mount
  useEffect(() => {
    clearDeck();
  }, []);

  // Sync Yellow Cat behavior and speak bubble according to the current step
  const getCatProps = (): { state: YellowCatState; speech: string } => {
    switch (step) {
      case 'INPUT':
        return {
          state: 'idle',
          speech: 'Trải bài Celtic Cross 10 lá cung cấp một cái nhìn cực kỳ sâu rộng và toàn cảnh. Hãy tập trung tư duy, nhập câu hỏi rồi cùng xáo bài nhé!',
        };
      case 'SHUFFLING':
        return {
          state: 'shuffle',
          speech: drawnCards.length === 0
            ? 'Mèo Vàng đang thu nhận chuyển động tay của bạn để đảo trộn các năng lượng vũ trụ huyền bí... 🌌🐾'
            : 'Mèo Vàng đang xáo bài để chủ nhân nhặt tiếp lá mới nhé... ✨🐾',
        };
      case 'PICKING':
        const drawnCount = drawnCards.length;
        if (drawnCount === 0) {
          return { state: 'idle', speech: 'Đầu tiên, hãy rút lá bài đại diện cho TÌNH HUỐNG HIỆN TẠI của bạn ở tâm chữ thập...' };
        } else if (drawnCount === 1) {
          return { state: 'idle', speech: 'Rất tốt. Giờ hãy rút lá bài số 2 thể hiện THÁCH THỨC/TRỞ NGẠI đè lên...' };
        } else if (drawnCount === 9) {
          return { state: 'idle', speech: 'Lá cuối cùng! Hãy chọn quân bài số 10 đại diện cho KẾT QUẢ CUỐI CÙNG lâu dài...' };
        } else {
          const nextPosName = spreadType.positions[drawnCount].nameVi;
          return { state: 'idle', speech: `Tiếp tục kết nối trực giác để rút lá bài số ${drawnCount + 1}: ${nextPosName}...` };
        }
      case 'RESULT':
        const isAnyUnflipped = drawnCards.some(c => !c.isFlipped);
        if (isAnyUnflipped) {
          return {
            state: 'happy',
            speech: '10 quân bài định mệnh đã được lựa chọn và đang úp trên bàn trải bài cổ điển! Hãy lật mở chúng để xem nhé!',
          };
        }
        return {
          state: 'happy',
          speech: 'Cả 10 lá bài đã lật mở thành hình sơ đồ Chữ Thập & Cột Phép Thuật! Bạn đã sẵn sàng lắng nghe Mèo Vàng bói toán chưa?',
        };
      case 'INTERPRETING':
        return {
          state: 'reading',
          speech: 'Sơ đồ Celtic Cross đang kết nối và tỏa sáng ma thuật... Mèo Vàng đang tập trung tâm trí cao độ để luận giải đa chiều cho bạn đây! 🔮🐱',
        };
      case 'COMPLETE':
        return {
          state: 'happy',
          speech: 'Bản đồ số phận Celtic Cross đã được dệt xong trọn vẹn rồi. Hãy cùng Mèo Vàng chiêm nghiệm từng góc độ nhé! 🍂🐱',
        };
      default:
        return { state: 'idle', speech: 'Mèo Vàng luôn đồng hành cùng bạn!' };
    }
  };

  const catProps = getCatProps();

  // Trigger high-entropy shuffle animation and algorithms
  const handleStartShuffle = () => {
    setStep('SHUFFLING');
    setDrawnCards([]);
    setAiInterpretation('');
    setAiError('');
    startCollecting();

    // Run shuffle animation for 1.8 seconds while gathering biometric mouse movements
    setTimeout(async () => {
      try {
        const { events, timings } = stopCollecting();
        // Execute the secure 3-pass Fisher-Yates shuffle
        const shuffledOrder = await hyperShuffle(events, timings);
        
        const newDeck = createNewDeck(shuffledOrder);
        // Prepare 78 face down cards for the picker arc (representing the full standard deck)
        const initialFaceDown = prepareFaceDownCards(newDeck, 78);
        
        setDeckState(newDeck);
        setFaceDownCards(initialFaceDown);
        setStep('PICKING');
      } catch (err) {
        console.error(err);
        setStep('INPUT');
        alert('Có lỗi xảy ra khi thu thập năng lượng xáo bài. Hãy thử lại nhé!');
      }
    }, 1800);
  };

  // Card pick handler (Pre-assignment secure algorithm)
  const handleSelectCard = (index: number) => {
    if (step !== 'PICKING' || !deckState || faceDownCards.length === 0) return;

    const currentDrawnCount = drawnCards.length;
    if (currentDrawnCount >= 10) return;

    try {
      // Pick card using secure slot mapping and sweep away used batch
      const drawn = userPicksFromFaceDown(deckState, faceDownCards, index);
      const cardDetail = getCardById(drawn.cardId);

      if (!cardDetail) throw new Error(`Card not found for ID: ${drawn.cardId}`);

      const newDrawn = [
        ...drawnCards,
        {
          card: cardDetail,
          isReversed: drawn.isReversed,
          isFlipped: false, // Keep face down on board initially during drawing phase
        },
      ];

      setDrawnCards(newDrawn);

      if (newDrawn.length === 10) {
        setStep('RESULT');
      } else {
        // Generate a fresh set of face down cards for the next card selection step
        const nextFaceDown = prepareFaceDownCards(deckState, 78 - newDrawn.length);
        setFaceDownCards(nextFaceDown);
        
        setStep('SHUFFLING');
        setTimeout(() => {
          setStep('PICKING');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      alert('Không thể chọn lá bài này. Hãy thử lại hoặc xáo lại bài nhé!');
    }
  };

  // Sequentially reveal all cards on the board one by one with spring-like timing delay
  const handleRevealAll = () => {
    if (drawnCards.length < 10) return;

    // Reset flipped state first
    setDrawnCards(prev => prev.map(c => ({ ...c, isFlipped: false })));

    // Sequential flip animation
    drawnCards.forEach((_, idx) => {
      setTimeout(() => {
        setDrawnCards(prev =>
          prev.map((c, i) => (i === idx ? { ...c, isFlipped: true } : c))
        );
      }, (idx + 1) * 350); // 350ms delay for each card
    });
  };

  // Quick auto-draw for fast testing or skipped draw steps
  const handleAutoDraw = () => {
    if (step !== 'PICKING' || !deckState || faceDownCards.length === 0) return;

    try {
      const results: typeof drawnCards = [];
      let tempDeck = { ...deckState };

      // Pull 10 cards securely
      for (let i = 0; i < 10; i++) {
        const batch = prepareFaceDownCards(tempDeck, 78 - results.length);
        const drawn = userPicksFromFaceDown(tempDeck, batch, 0); // Pick first slot
        const cardDetail = getCardById(drawn.cardId);
        
        if (cardDetail) {
          results.push({
            card: cardDetail,
            isReversed: drawn.isReversed,
            isFlipped: false,
          });
        }
      }

      setDrawnCards(results);
      setDeckState(tempDeck);
      setStep('RESULT');

      // Trigger sequential reveal
      results.forEach((_, idx) => {
        setTimeout(() => {
          setDrawnCards(prev =>
            prev.map((c, i) => (i === idx ? { ...c, isFlipped: true } : c))
          );
        }, (idx + 1) * 350);
      });
    } catch (err) {
      console.error(err);
      alert('Lỗi tự động rút bài. Thử lại nhé!');
    }
  };

  // Reset entire session
  const handleReset = () => {
    clearDeck();
    setDeckState(null);
    setDrawnCards([]);
    setFaceDownCards([]);
    setStep('INPUT');
    setAiInterpretation('');
    setAiError('');
    setUserPrompt('');
  };

  // Request comprehensive Celtic Cross AI reading from Gemini API
  const handleGetInterpretation = async () => {
    if (drawnCards.length < 10) return;

    if (!apiKey) {
      alert('Hãy nhập hoặc cấu hình Gemini API Key ở menu Cài Đặt (⚙️ góc trên bên phải) trước khi xin luận giải của Mèo Vàng nhé! 🐱🔑');
      return;
    }

    setStep('INTERPRETING');
    setAiLoading(true);
    setAiError('');
    setAiInterpretation('');

    try {
      const cardsReading: CardReading[] = drawnCards.map((item, idx) => ({
        slug: item.card.slug,
        nameVi: item.card.nameVi,
        nameEn: item.card.nameEn,
        isReversed: item.isReversed,
        position: spreadType.positions[idx].nameVi,
        arcana: item.card.arcana,
        suit: item.card.suit,
        number: item.card.number,
        keywordsVi: item.card.keywordsVi,
        meaningUpright: item.card.meaningUpright,
        meaningReversed: item.card.meaningReversed,
      }));

      const promptText = createUserPrompt(cardsReading, spreadType, userQuestion);
      setUserPrompt(promptText);

      // Call Gemini model fallback chain
      const response = await interpretCards(apiKey, cardsReading, spreadType, userQuestion);
      setAiInterpretation(response.interpretation);
      setStep('COMPLETE');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Huyền thuật truyền tin tới Gemini bị gián đoạn. Thử lại nhé!');
      setStep('RESULT');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      onMouseMove={onMouseMove}
      onTouchMove={onTouchMove as any}
      className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-8 px-4 sm:px-6 lg:px-8 select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex justify-between items-center text-xs font-sans border-b border-gold-primary/10 pb-4">
          <div className="text-text-secondary flex gap-1.5 items-center">
            <Link href="/" className="hover:text-gold-light transition-colors">Trang Chủ</Link>
            <span>/</span>
            <Link href="/reading" className="hover:text-gold-light transition-colors">Kiểu Trải Bài</Link>
            <span>/</span>
            <span className="text-gold-light font-medium">Celtic Cross (10 Lá)</span>
          </div>
          
          <button
            onClick={handleReset}
            className="text-text-secondary hover:text-gold-light hover:underline transition-colors font-bold"
          >
            🔄 Reset Phiên
          </button>
        </div>

        {/* CORE SCREEN LAYOUT (Vertical Stack) */}
        <div className="flex flex-col gap-6 items-stretch mt-2">
          
          {/* TOP COLUMN: Animated 3D Yellow Cat Mascot (Full width, centered) */}
          <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-4 bg-bg-surface/10 border border-gold-primary/5 rounded-2xl z-20 gap-4">
            
            {/* Lớp thông báo Tiến trình rút bài ngay trên đầu Mèo Vàng */}
            {step === 'PICKING' && (
              <div className="w-full flex flex-col items-center gap-2 border-b border-gold-primary/10 pb-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="px-3 py-1 rounded-full bg-gold-primary/10 border border-gold-primary/20 text-gold-light text-xs font-sans font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_8px_rgba(244,162,97,0.15)]">
                  <span>🔮 Tiến Trình:</span>
                  <span className="text-white">{drawnCards.length} / 10 Lá</span>
                </div>
              </div>
            )}

            <YellowCat3D
              state={catProps.state}
              size="lg"
              speechBubble={catProps.speech}
              drawnCardsCount={drawnCards.filter((c) => c.isFlipped).length}
              className={step === 'PICKING' ? "mt-2" : "mt-4"}
            />

            {/* Nút rút nhanh đưa về gần gũi bên Mèo Vàng */}
            {step === 'PICKING' && (
              <button
                onClick={handleAutoDraw}
                className="w-full py-2.5 font-sans font-bold text-xs uppercase tracking-widest rounded-xl bg-gold-primary/15 border border-gold-primary/45 hover:border-gold-light hover:bg-gold-primary/25 text-gold-light hover:text-white cursor-pointer transition-all active:scale-95 shadow-[0_0_10px_rgba(244,162,97,0.1)] flex items-center justify-center gap-1.5 animate-[fadeIn_0.3s_ease-out]"
              >
                <span>🪄 Mèo Vàng Rút Nhanh</span>
              </button>
            )}
          </div>

          {/* RIGHT COLUMN: Table Interactive Board */}
          <div className="w-full flex flex-col gap-6 items-stretch relative z-10">
            
            {/* STEP 1: INPUT QUESTION */}
            {step === 'INPUT' && (
              <div className="bg-bg-surface/40 border border-gold-primary/15 rounded-2xl p-6 shadow-xl flex flex-col gap-5 animate-[fadeIn_0.3s_ease-out]">
                <h3 className="font-cinzel text-base md:text-lg text-gold-light font-bold tracking-wide flex items-center gap-2">
                  ⚔️ Sơ Đồ Celtic Cross 10 Lá Kinh Điển
                </h3>
                
                <p className="text-xs font-lora text-text-secondary leading-relaxed italic border-l border-gold-primary/20 pl-3">
                  Sơ đồ hình Thập Tự phương Tây kết hợp cây Gậy Phép Thuật phía bên phải. Kiểu bói này soi chiếu toàn bộ ngóc ngách cuộc sống của bạn: từ tình thế hiện hữu, rào cản bên ngoài, nền tảng tiềm thức cho tới kết quả tương lai xa lâu dài.
                </p>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-secondary font-sans uppercase tracking-wider font-semibold">
                    Chủ đề hoặc câu hỏi của bạn (Không bắt buộc)
                  </label>
                  <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Nhập câu hỏi để Mèo Vàng kết nối thông điệp 10 lá bài một cách linh ứng và chính xác nhất nhé..."
                    className="w-full h-24 bg-bg-elevated/45 border border-gold-primary/10 focus:border-gold-light focus:outline-none rounded-xl p-4 text-xs md:text-sm font-lora text-text-primary placeholder:text-text-secondary/40 focus:shadow-[0_0_12px_var(--color-gold-glow)] transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleStartShuffle}
                  className="w-full py-3.5 font-sans font-bold text-sm uppercase tracking-widest rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_15px_var(--color-gold-glow)] flex items-center justify-center gap-2 active:scale-99"
                >
                  <span>🎴 Khởi Tạo Năng Lượng & Xáo Bài</span>
                </button>
              </div>
            )}

            {/* STEP 2: SHUFFLING & CARD DECK */}
            {(step === 'SHUFFLING' || step === 'PICKING') && (
              <div className="bg-[#12122b]/50 border border-gold-primary/15 rounded-2xl p-4 shadow-2xl flex flex-col items-center relative overflow-visible animate-[fadeIn_0.3s_ease-out] min-h-[380px] md:min-h-[440px]">
                {/* Magic background concentric rings */}
                <div className="absolute w-[320px] h-[320px] rounded-full border border-gold-primary/5 -z-10 animate-[spin_80s_linear_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute w-[200px] h-[200px] rounded-full border border-gold-primary/5 -z-10 animate-[spin_40s_linear_infinite_reverse] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                {/* Đã chuyển Tiến trình và Rút Nhanh sang cạnh Mèo Vàng ở cột trái */}

                <CardDeck
                  cardsCount={faceDownCards.length}
                  onSelectCard={handleSelectCard}
                  isShuffling={step === 'SHUFFLING'}
                  isDeckSpread={step === 'PICKING'}
                />
              </div>
            )}

            {/* STEP 3: INTERACTIVE CELTIC CROSS BOARD */}
            {(step === 'RESULT' || step === 'INTERPRETING' || step === 'COMPLETE') && drawnCards.length > 0 && (
              <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                
                {/* Table board layout — Modern glassmorphism */}
                <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-3xl p-4 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col gap-3 items-center overflow-hidden">
                  {/* Decorative top accent */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-primary/20 to-transparent" />

                  <div className="w-full flex justify-between items-center pb-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gold-primary/40 animate-pulse" />
                      <span className="text-[9px] sm:text-[10px] font-sans font-bold text-gold-light/50 uppercase tracking-[0.15em]">
                        Sơ Đồ Celtic Cross
                      </span>
                    </div>
                    
                    <button
                      onClick={handleRevealAll}
                      className="px-3 py-1.5 text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-wider rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-gold-primary/25 text-gold-light/70 hover:text-gold-light transition-all cursor-pointer backdrop-blur-sm"
                    >
                      🔄 Lật Mở Sơ Đồ
                    </button>
                  </div>

                  <CelticCrossBoard
                    cards={drawnCards}
                    interactive={false}
                    onInspectCard={(card) => setSelectedInspectCard(card)}
                  />

                  {step === 'RESULT' && (
                    <button
                      onClick={handleGetInterpretation}
                      disabled={aiLoading || drawnCards.some(c => !c.isFlipped)}
                      className="w-full max-w-md mt-3 py-3.5 font-sans font-bold text-xs sm:text-sm uppercase tracking-widest rounded-2xl bg-gradient-to-r from-gold-primary to-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_20px_rgba(244,162,97,0.25)] hover:shadow-[0_0_30px_rgba(244,162,97,0.4)] flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98]"
                    >
                      <span>✨ Xin Luận Giải Celtic Cross</span>
                    </button>
                  )}
                </div>

                {/* AI Interpretation Box */}
                {(step === 'INTERPRETING' || step === 'COMPLETE') && (
                  <AIInterpretation
                    interpretation={aiInterpretation}
                    loading={aiLoading}
                    error={aiError}
                    onRetry={handleGetInterpretation}
                    spreadInfo={`Trải bài Celtic Cross 10 lá: (1. Hiện tại: ${drawnCards[0].card.nameVi} | 2. Thách thức: ${drawnCards[1].card.nameVi} | 3. Ý thức: ${drawnCards[2].card.nameVi} | 4. Tiềm thức: ${drawnCards[3].card.nameVi} | 5. Quá khứ: ${drawnCards[4].card.nameVi} | 6. Tương lai gần: ${drawnCards[5].card.nameVi} | 7. Bản thân: ${drawnCards[6].card.nameVi} | 8. Môi trường: ${drawnCards[7].card.nameVi} | 9. Hy vọng/Sợ: ${drawnCards[8].card.nameVi} | 10. Kết quả: ${drawnCards[9].card.nameVi}) ${userQuestion ? `| Câu hỏi: "${userQuestion}"` : ''}`}
                    userPrompt={userPrompt}
                  />
                )}

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Advanced Zoom Inspector Modal */}
      {selectedInspectCard && (
        <CardInspector
          card={selectedInspectCard}
          isOpen={!!selectedInspectCard}
          onClose={() => setSelectedInspectCard(null)}
        />
      )}
    </div>
  );
}
