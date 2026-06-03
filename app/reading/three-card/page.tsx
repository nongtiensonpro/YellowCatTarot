'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRandomCards, TarotCard as TarotCardType } from '@/lib/cards-data';
import { spreadTypes } from '@/lib/spreads';
import { interpretCards, CardReading, createUserPrompt } from '@/lib/gemini';
import { useApiKey } from '@/components/ApiKeyProvider';
import ReadingBoard from '@/components/ReadingBoard';
import CardDeck from '@/components/CardDeck';
import dynamic from 'next/dynamic';
import { YellowCatState } from '@/components/YellowCat';
import AIInterpretation from '@/components/AIInterpretation';

import CardInspector from '@/components/CardInspector';

const YellowCat3D = dynamic(() => import('@/components/YellowCat3D'), {
  ssr: false,
  loading: () => (
    <div className="w-[180px] h-[180px] flex items-center justify-center">
      <div className="animate-pulse text-gold-light/60 font-cinzel text-xs">Đang đánh thức Mèo Vàng...</div>
    </div>
  ),
});

type FlowStep = 'INPUT' | 'SHUFFLING' | 'PICKING' | 'RESULT' | 'INTERPRETING' | 'COMPLETE';

export default function ThreeCardReading() {
  const { apiKey, shuffleTheme, pickingTheme, reduceMotion } = useApiKey();
  const spreadType = spreadTypes['three-card'];
  const [weatherEffect, setWeatherEffect] = useState<'wind' | 'sun' | 'fog' | null>(null);

  // React state
  const [step, setStep] = useState<FlowStep>('INPUT');
  const [userQuestion, setUserQuestion] = useState('');

  // Cards state
  const [deckCount, setDeckCount] = useState(78);
  const [drawnCards, setDrawnCards] = useState<{
    card: TarotCardType;
    isReversed: boolean;
    isFlipped: boolean;
  }[]>([]);
  
  // Cache để chuẩn bị bài trước lúc xáo bài
  const [preparedCards, setPreparedCards] = useState<{ card: TarotCardType; isReversed: boolean }[]>([]);

  // Selected card for high-resolution inspection
  const [selectedInspectCard, setSelectedInspectCard] = useState<TarotCardType | null>(null);

  // AI states
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  // Đồng bộ Mèo Vàng theo bước hiện tại
  const getCatProps = (): { state: YellowCatState; speech: string } => {
    switch (step) {
      case 'INPUT':
        return {
          state: 'idle',
          speech: 'Trải bài 3 lá giúp soi rọi Quá Khứ, Hiện Tại và Tương Lai. Hãy nhập câu hỏi tập trung rồi xáo bài nhé!',
        };
      case 'SHUFFLING':
        return {
          state: 'shuffle',
          speech: drawnCards.length === 0
            ? 'Mèo Vàng đang kết hợp năng lượng thời gian của bạn vào các quân bài... 🐾🕰️'
            : 'Mèo Vàng đang xáo bài để bạn nhặt tiếp lá mới nhé... ✨🐾',
        };
      case 'PICKING':
        const drawnCount = drawnCards.filter((c) => c.isFlipped).length;
        if (drawnCount === 0) {
          return { state: 'idle', speech: 'Đầu tiên, hãy rút lá bài đại diện cho vị thế QUÁ KHỨ của bạn...' };
        } else if (drawnCount === 1) {
          return { state: 'idle', speech: 'Tốt lắm. Tiếp theo, hãy rút lá bài của HIỆN TẠI...' };
        } else {
          return { state: 'idle', speech: 'Lá cuối cùng! Hãy chọn lá bài cho viễn cảnh TƯƠNG LAI...' };
        }
      case 'RESULT':
        return {
          state: 'happy',
          speech: 'Cả ba quân bài định mệnh đã hé lộ! Bạn đã sẵn sàng lắng nghe Mèo Vàng luận giải toàn cảnh chưa?',
        };
      case 'INTERPRETING':
        return {
          state: 'reading',
          speech: 'Ba dòng năng lượng thời gian đang giao thoa... Mèo Vàng đang tập trung luận giải cho bạn nhé! 🐱🔮',
        };
      case 'COMPLETE':
        return {
          state: 'happy',
          speech: 'Mèo Vàng đã dệt xong sợi dây thời gian liên kết 3 lá bài rồi. Hãy cùng ngẫm nghĩ nhé! 🐱🍂',
        };
      default:
        return { state: 'idle', speech: 'Mèo Vàng luôn lắng nghe bạn!' };
    }
  };

  const catProps = getCatProps();

  // Bắt đầu xáo bài
  const handleStartShuffle = () => {
    setStep('SHUFFLING');
    setDrawnCards([]);
    setAiInterpretation('');
    setAiError('');

    // Đảm bảo rút 3 lá bài khác nhau hoàn toàn từ deck 78 lá (Fisher-Yates)
    const randomResults = getRandomCards(3);
    setPreparedCards(randomResults);

    if (shuffleTheme === 'wheel-of-fate') {
      const weathers = ['wind', 'sun', 'fog'] as const;
      const rw = weathers[Math.floor(Math.random() * weathers.length)];
      setWeatherEffect(rw);
    } else {
      setWeatherEffect(null);
    }

    const finishShuffle = () => {
      setStep('PICKING');
    };

    if (shuffleTheme !== 'soot-sprite') {
      setTimeout(finishShuffle, reduceMotion ? 100 : 1800);
    } else {
      (window as any).finishThreeShuffle = finishShuffle;
    }
  };

  // Chọn từng lá bài thủ công
  const handleSelectCard = (index: number) => {
    if (step !== 'PICKING' || preparedCards.length === 0) return;

    const drawnCount = drawnCards.length;
    if (drawnCount >= 3) return;

    // Rút lá bài tiếp theo từ danh sách đã chuẩn bị sẵn
    const nextCard = preparedCards[drawnCount];
    const newDrawn = [
      ...drawnCards,
      {
        card: nextCard.card,
        isReversed: nextCard.isReversed,
        isFlipped: true,
      },
    ];

    setDrawnCards(newDrawn);

    // Nếu đã rút đủ 3 lá
    if (newDrawn.length === 3) {
      setStep('RESULT');
    } else {
      setStep('SHUFFLING');

      if (shuffleTheme === 'wheel-of-fate') {
        const weathers = ['wind', 'sun', 'fog'] as const;
        const rw = weathers[Math.floor(Math.random() * weathers.length)];
        setWeatherEffect(rw);
      } else {
        setWeatherEffect(null);
      }

      const finishShuffle = () => {
        setStep('PICKING');
      };

      if (shuffleTheme !== 'soot-sprite') {
        setTimeout(finishShuffle, reduceMotion ? 100 : 1500);
      } else {
        (window as any).finishThreeShuffle = finishShuffle;
      }
    }
  };

  // Chế độ tự động rút nhanh 3 lá
  const handleAutoDraw = () => {
    if (step !== 'PICKING' || preparedCards.length === 0) return;

    // Thiết lập trạng thái ban đầu úp bài
    const tempCards = preparedCards.map((c) => ({
      card: c.card,
      isReversed: c.isReversed,
      isFlipped: false,
    }));
    setDrawnCards(tempCards);
    setStep('RESULT');

    // Kích hoạt hiệu ứng lật tuần tự với delay 0.4 giây mỗi lá
    tempCards.forEach((_, idx) => {
      setTimeout(() => {
        setDrawnCards((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, isFlipped: true } : c))
        );
      }, (idx + 1) * 400);
    });
  };

  // Gọi AI luận giải
  const handleGetInterpretation = async () => {
    if (drawnCards.length < 3) return;

    if (!apiKey) {
      alert('Vui lòng cài đặt API Key trong menu cài đặt ⚙️ góc trên bên phải trước khi gọi AI nhé!');
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

      const response = await interpretCards(
        apiKey,
        cardsReading,
        spreadType,
        userQuestion
      );

      setAiInterpretation(response.interpretation);
      setStep('COMPLETE');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi kết nối vũ trụ. Xin thử lại sau!');
      setStep('RESULT');
    } finally {
      setAiLoading(false);
    }
  };

  // Rút lại từ đầu
  const handleReset = () => {
    setStep('INPUT');
    setUserQuestion('');
    setDrawnCards([]);
    setPreparedCards([]);
    setAiInterpretation('');
    setAiError('');
    setUserPrompt('');
  };

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-8 px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6 items-stretch">
        
        {/* Title */}
        <div className="text-center border-b border-gold-primary/10 pb-4">
          <h1 className="font-cinzel text-2xl md:text-3xl font-extrabold text-gold-primary tracking-wider drop-shadow-[0_0_8px_var(--color-gold-glow)]">
            Trải Bài Tarot Ba Lá
          </h1>
          <p className="font-lora text-xs md:text-sm text-text-secondary italic mt-1">
            Soi tỏ mối quan hệ nhân quả giữa Quá Khứ · Hiện Tại · Tương Lai của câu chuyện.
          </p>
        </div>

        {/* Core Screen */}
        <div className="flex flex-col gap-6 items-stretch mt-2">
          
          {/* TOP COLUMN: Character Mèo Vàng (Full width, centered) */}
          <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-4 bg-bg-surface/10 border border-gold-primary/5 rounded-2xl z-20 gap-4">
            
            {/* Lớp thông báo Tiến trình rút bài ngay trên đầu Mèo Vàng */}
            {step === 'PICKING' && (
              <div className="w-full flex flex-col items-center gap-2 border-b border-gold-primary/10 pb-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="px-3 py-1 rounded-full bg-gold-primary/10 border border-gold-primary/20 text-gold-light text-xs font-sans font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_8px_rgba(244,162,97,0.15)]">
                  <span>🔮 Tiến Trình:</span>
                  <span className="text-white">{drawnCards.length} / 3 Lá</span>
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

            {/* Nút rút bài nhanh gần gũi với Mèo Vàng */}
            {step === 'PICKING' && (
              <button
                onClick={handleAutoDraw}
                className="w-full py-2.5 font-sans font-bold text-xs uppercase tracking-widest rounded-xl bg-gold-primary/15 border border-gold-primary/45 hover:border-gold-light hover:bg-gold-primary/25 text-gold-light hover:text-white cursor-pointer transition-all active:scale-95 shadow-[0_0_10px_rgba(244,162,97,0.1)] flex items-center justify-center gap-1.5 animate-[fadeIn_0.3s_ease-out]"
              >
                <span>🪄 Mèo Vàng Rút Nhanh</span>
              </button>
            )}
          </div>

          {/* BOTTOM COLUMN: Table and cards */}
          <div className="w-full flex flex-col gap-6 items-stretch relative z-10">
            
            {/* STEP 1: INPUT QUESTION */}
            {step === 'INPUT' && (
              <div className="bg-bg-surface/40 border border-gold-primary/15 rounded-2xl p-6 shadow-xl flex flex-col gap-5 animate-[fadeIn_0.3s_ease-out]">
                <h3 className="font-cinzel text-base md:text-lg text-gold-light font-bold tracking-wide">
                  💬 Gửi Trực Giác Của Bạn Vào Câu Hỏi Thời Gian
                </h3>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-secondary font-sans uppercase tracking-wider font-semibold">
                    Nhập chủ đề/câu hỏi thời gian của bạn (Ví dụ: Sự nghiệp năm nay của tôi...)
                  </label>
                  <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Nhập câu hỏi để Mèo Vàng kết hợp xâu chuỗi thông điệp 3 lá một cách chính xác nhất nhé..."
                    className="w-full h-24 bg-bg-elevated/40 border border-gold-primary/10 focus:border-gold-light focus:outline-none rounded-xl p-4 text-xs md:text-sm font-lora text-text-primary placeholder:text-text-secondary/40 focus:shadow-[0_0_12px_var(--color-gold-glow)] transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleStartShuffle}
                  className="w-full py-3.5 font-sans font-bold text-sm uppercase tracking-widest rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_15px_var(--color-gold-glow)] flex items-center justify-center gap-2"
                >
                  <span>🃏 Bắt Đầu Xáo Bài</span>
                </button>
              </div>
            )}

            {/* STEP 2: SHUFFLING & CARD DECK */}
            {(step === 'SHUFFLING' || step === 'PICKING') && (
              <div className="bg-[#12122b]/50 border border-gold-primary/15 rounded-2xl p-4 shadow-2xl flex flex-col items-center relative overflow-visible animate-[fadeIn_0.3s_ease-out] min-h-[380px] md:min-h-[440px]">
                {/* Magic bg rings */}
                <div className="absolute w-[300px] h-[300px] rounded-full border border-gold-primary/5 -z-10 animate-[spin_60s_linear_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                
                {/* Đã chuyển Tiến trình và Rút Nhanh sang cạnh Mèo Vàng ở cột trái */}

                <CardDeck
                  cardsCount={deckCount}
                  onSelectCard={handleSelectCard}
                  isShuffling={step === 'SHUFFLING'}
                  isDeckSpread={step === 'PICKING'}
                  shuffleTheme={shuffleTheme}
                  pickingTheme={pickingTheme}
                  weatherEffect={weatherEffect}
                  reduceMotion={reduceMotion}
                  onStopShuffle={() => {
                    if ((window as any).finishThreeShuffle) {
                      (window as any).finishThreeShuffle();
                    }
                  }}
                />
              </div>
            )}

            {/* STEP 3: RESULT READING BOARD & AI CALL */}
            {(step === 'RESULT' || step === 'INTERPRETING' || step === 'COMPLETE') && drawnCards.length > 0 && (
              <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                
                {/* Table board layout */}
                <div className="bg-bg-surface/35 border border-gold-primary/15 rounded-2xl p-5 shadow-2xl flex flex-col gap-5 items-center">
                  <span className="text-[10px] font-sans font-bold text-gold-light/60 uppercase tracking-widest">
                    Bàn Trải Bài Ba Lá Của Bạn:
                  </span>
                  
                  <ReadingBoard
                    cards={drawnCards}
                    spreadType={spreadType}
                    interactive={false}
                    onInspectCard={(card) => setSelectedInspectCard(card)}
                  />

                  {step === 'RESULT' && (
                    <button
                      onClick={handleGetInterpretation}
                      disabled={aiLoading}
                      className="w-full max-w-lg mt-2 py-3.5 font-sans font-bold text-sm uppercase tracking-widest rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_12px_var(--color-gold-glow)] flex items-center justify-center gap-1.5"
                    >
                      <span>✨ Luận Giải Toàn Bộ Trải Bài</span>
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
                    spreadInfo={`Trải bài 3 lá (Quá Khứ: ${drawnCards[0].card.nameVi} | Hiện Tại: ${drawnCards[1].card.nameVi} | Tương Lai: ${drawnCards[2].card.nameVi}) ${userQuestion ? `| Câu hỏi: "${userQuestion}"` : ''}`}
                    userPrompt={userPrompt}
                  />
                )}

                {/* Final Complete Tools Menu */}
                {step === 'COMPLETE' && (
                  <div className="flex flex-wrap gap-3 justify-center md:justify-end font-sans">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl bg-bg-surface hover:bg-bg-elevated border border-gold-primary/20 text-text-primary hover:text-gold-light cursor-pointer transition-all"
                    >
                      🔄 Rút Trải Bài Khác
                    </button>
                    <Link
                      href="/"
                      className="px-5 py-2.5 text-xs md:text-sm font-bold rounded-xl bg-bg-surface hover:bg-bg-elevated border border-gold-primary/20 text-text-secondary hover:text-text-primary transition-all flex items-center justify-center"
                    >
                      🏠 Về Trang Chủ
                    </Link>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

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
