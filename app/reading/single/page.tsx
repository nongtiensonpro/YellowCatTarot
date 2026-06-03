'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRandomCards, TarotCard as TarotCardType } from '@/lib/cards-data';
import { spreadTypes } from '@/lib/spreads';
import { interpretCards, createUserPrompt } from '@/lib/gemini';
import { useApiKey } from '@/components/ApiKeyProvider';
import TarotCard from '@/components/TarotCard';
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

// Trạng thái của máy trạng thái rút bài
type FlowStep = 'INPUT' | 'SHUFFLING' | 'PICKING' | 'RESULT' | 'INTERPRETING' | 'COMPLETE';

export default function SingleCardReading() {
  const { apiKey, shuffleTheme, pickingTheme, reduceMotion } = useApiKey();
  const spreadType = spreadTypes.single;
  const [weatherEffect, setWeatherEffect] = useState<'wind' | 'sun' | 'fog' | null>(null);

  // React State
  const [step, setStep] = useState<FlowStep>('INPUT');
  const [userQuestion, setUserQuestion] = useState('');
  
  // Game states
  const [deckCount, setDeckCount] = useState(78);
  const [shuffledCards, setShuffledCards] = useState<{ card: TarotCardType; isReversed: boolean }[]>([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [revealedCard, setRevealedCard] = useState<{ card: TarotCardType; isReversed: boolean } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // AI states
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  // Cập nhật trạng thái thoại và hành động của Mèo Vàng tương ứng với mỗi bước
  const getCatProps = (): { state: YellowCatState; speech: string } => {
    switch (step) {
      case 'INPUT':
        return {
          state: 'idle',
          speech: 'Xin chào! Mèo Vàng đã chuẩn bị sẵn bộ bài RWS. Hãy tập trung tâm trí vào câu hỏi của bạn bên dưới nhé...',
        };
      case 'SHUFFLING':
        return {
          state: 'shuffle',
          speech: 'Mèo Vàng đang đảo bài, xáo trộn các nguồn năng lượng vũ trụ cho bạn đây... ✨🐾',
        };
      case 'PICKING':
        return {
          state: 'idle',
          speech: 'Xong rồi! Hãy hít một hơi thật sâu và click chọn lá bài mà trực giác của bạn cảm thấy bị thu hút nhất nhé.',
        };
      case 'RESULT':
        return {
          state: 'happy',
          speech: revealedCard
            ? `Tuyệt vời! Bạn rút được lá ${revealedCard.card.nameVi} (${revealedCard.card.nameEn}) thế ${
                revealedCard.isReversed ? 'ngược' : 'xuôi'
              }. Nhấp nút dưới để Mèo Vàng luận bài nhé!`
            : 'Mèo Vàng chúc mừng bạn đã chọn được quân bài định mệnh!',
        };
      case 'INTERPRETING':
        return {
          state: 'reading',
          speech: 'Mèo Vàng đang nhìn vào sâu quả cầu pha lê để lắng nghe thông điệp vũ trụ dành cho bạn... 🐱🔮',
        };
      case 'COMPLETE':
        return {
          state: 'happy',
          speech: 'Mèo Vàng đã hoàn thành luận giải rồi! Hi vọng thông điệp này sẽ mang lại cho bạn sự ấm áp và bình yên. 🐱🍂',
        };
      default:
        return { state: 'idle', speech: 'Mèo Vàng luôn đồng hành cùng bạn!' };
    }
  };

  const catProps = getCatProps();

  // Bắt đầu xáo bài
  const handleStartShuffle = () => {
    setStep('SHUFFLING');
    setSelectedCardIdx(null);
    setRevealedCard(null);
    setIsFlipped(false);
    setAiInterpretation('');
    setAiError('');

    // Tạo sẵn 1 lá bài ngẫu nhiên thực sự từ deck 78 lá
    const randomResults = getRandomCards(1);
    setShuffledCards(randomResults);

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
      // Thời gian xáo bài: 1.8 giây, tự động chuyển sang bước PICKING
      setTimeout(finishShuffle, reduceMotion ? 100 : 1800);
    } else {
      (window as any).finishSingleShuffle = finishShuffle;
    }
  };

  // Chọn lá bài
  const handleSelectCard = (index: number) => {
    if (step !== 'PICKING' || shuffledCards.length === 0) return;

    setSelectedCardIdx(index);
    setRevealedCard(shuffledCards[0]); // Lấy lá bài đã được random từ trước
    setStep('RESULT');

    // Chờ 100ms rồi lật bài để hiệu ứng mượt
    setTimeout(() => {
      setIsFlipped(true);
    }, 150);
  };

  // Gọi AI luận giải
  const handleGetInterpretation = async () => {
    if (!revealedCard) return;

    if (!apiKey) {
      setStep('INPUT'); // Trở lại bước nhập để nhắc nhở
      // Mở settings hoặc alert
      alert('Vui lòng cài đặt API Key trong menu ⚙️ góc trên bên phải trước khi nhận luận giải từ AI nhé! Khóa này hoàn toàn miễn phí.');
      return;
    }

    setStep('INTERPRETING');
    setAiLoading(true);
    setAiError('');
    setAiInterpretation('');

    try {
      const cardsReading = [
        {
          slug: revealedCard.card.slug,
          nameVi: revealedCard.card.nameVi,
          nameEn: revealedCard.card.nameEn,
          isReversed: revealedCard.isReversed,
          position: 'Lá Bài Duy Nhất',
          arcana: revealedCard.card.arcana,
          suit: revealedCard.card.suit,
          number: revealedCard.card.number,
          keywordsVi: revealedCard.card.keywordsVi,
          meaningUpright: revealedCard.card.meaningUpright,
          meaningReversed: revealedCard.card.meaningReversed,
        },
      ];
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
      setStep('RESULT'); // Trở lại bước kết quả để có thể bấm thử lại
    } finally {
      setAiLoading(false);
    }
  };

  // Làm lại từ đầu
  const handleReset = () => {
    setStep('INPUT');
    setUserQuestion('');
    setSelectedCardIdx(null);
    setRevealedCard(null);
    setIsFlipped(false);
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
            Rút Một Lá Bài Tarot
          </h1>
          <p className="font-lora text-xs md:text-sm text-text-secondary italic mt-1">
            Nhận thông điệp chỉ dẫn tập trung trực tiếp từ vũ trụ cho ngày hôm nay.
          </p>
        </div>

        {/* Core Screen */}
        <div className="flex flex-col gap-6 items-stretch mt-2">
          
          {/* TOP SIDEBAR: Character Mèo Vàng (Full width, centered) */}
          <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-4 bg-bg-surface/10 border border-gold-primary/5 rounded-2xl z-20">
            <YellowCat3D
              state={catProps.state}
              size="lg"
              speechBubble={catProps.speech}
              drawnCardsCount={revealedCard ? 1 : 0}
              className="mt-4"
            />
          </div>

          {/* BOTTOM WORKBOARD: Table and cards interaction */}
          <div className="w-full flex flex-col gap-6 items-stretch relative z-10">
            
            {/* STEP 1: INPUT QUESTION */}
            {step === 'INPUT' && (
              <div className="bg-bg-surface/40 border border-gold-primary/15 rounded-2xl p-6 shadow-xl flex flex-col gap-5 animate-[fadeIn_0.3s_ease-out]">
                <h3 className="font-cinzel text-base md:text-lg text-gold-light font-bold tracking-wide">
                  💬 Gửi Trực Giác Của Bạn Vào Câu Hỏi
                </h3>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-text-secondary font-sans uppercase tracking-wider font-semibold">
                    Bạn muốn hỏi vũ trụ điều gì? (Không bắt buộc)
                  </label>
                  <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ví dụ: Công việc sắp tới của tôi có suôn sẻ không? Hay năng lượng ngày hôm nay của tôi là gì?..."
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

            {/* STEP 2: SHUFFLING & PICKING CARDS TABLE */}
            {(step === 'SHUFFLING' || step === 'PICKING') && (
              <div className="bg-[#12122b]/50 border border-gold-primary/15 rounded-2xl p-4 shadow-2xl flex flex-col items-center relative overflow-visible animate-[fadeIn_0.3s_ease-out] min-h-[380px] md:min-h-[440px]">
                {/* Mystic circle bg */}
                <div className="absolute w-[300px] h-[300px] rounded-full border border-gold-primary/5 -z-10 animate-[spin_60s_linear_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                
                {step === 'PICKING' && (
                  <span className="text-[10px] md:text-xs font-sans text-gold-light/75 uppercase tracking-widest font-semibold text-center mt-2 animate-pulse">
                    ✨ Nhấp chọn 1 quân bài bên dưới theo trực giác của bạn ✨
                  </span>
                )}

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
                    if ((window as any).finishSingleShuffle) {
                      (window as any).finishSingleShuffle();
                    }
                  }}
                />
              </div>
            )}

            {/* STEP 3: RESULT REVEALED CARD & AI CALL */}
            {(step === 'RESULT' || step === 'INTERPRETING' || step === 'COMPLETE') && revealedCard && (
              <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                
                {/* Display card and basic info */}
                <div className="bg-bg-surface/30 border border-gold-primary/15 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-center">
                  
                  {/* Card view */}
                  <div className="flex flex-col items-center gap-3">
                    <TarotCard
                      card={revealedCard.card}
                      isFlipped={isFlipped}
                      isReversed={revealedCard.isReversed}
                      size="lg"
                      interactive={false}
                    />
                    <button
                      onClick={() => setIsInspectorOpen(true)}
                      className="w-full py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-bg-surface hover:bg-bg-elevated border border-gold-primary/20 text-gold-light hover:text-white cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(244,162,97,0.15)]"
                    >
                      🔍 Ngắm Bản Vẽ Cực Nét
                    </button>
                  </div>

                  {/* Quick meaning info */}
                  <div className="flex-1 flex flex-col gap-4 font-lora text-center sm:text-left">
                    <div className="flex flex-col gap-1.5 border-b border-gold-primary/10 pb-3">
                      <span className="text-[10px] text-gold-light/60 font-sans tracking-widest uppercase font-bold">
                        Quân Bài Định Mệnh Của Bạn:
                      </span>
                      <h2 className="font-cinzel text-2xl font-bold text-gold-light tracking-wide">
                        {revealedCard.card.nameVi} ({revealedCard.card.nameEn})
                      </h2>
                      <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-gold-dark">
                        {revealedCard.isReversed ? '↩ Chiều Ngược (Reversed)' : '✦ Chiều Xuôi (Upright)'}
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {revealedCard.card.keywordsVi.map((keyword, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-gold-primary/10 border border-gold-primary/20 text-gold-light text-[10px] font-sans font-semibold uppercase tracking-wider">
                          #{keyword}
                        </span>
                      ))}
                    </div>

                    <p className="text-text-primary text-xs md:text-sm leading-relaxed italic border-l-2 border-gold-primary/20 pl-3">
                      {revealedCard.isReversed ? revealedCard.card.meaningReversed : revealedCard.card.meaningUpright}
                    </p>

                    {step === 'RESULT' && (
                      <button
                        onClick={handleGetInterpretation}
                        disabled={aiLoading}
                        className="w-full mt-2 py-3 font-sans font-bold text-sm uppercase tracking-widest rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_12px_var(--color-gold-glow)] flex items-center justify-center gap-1.5"
                      >
                        <span>✨ Nhận Luận Giải Từ Mèo Vàng</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Interpretation Box */}
                {(step === 'INTERPRETING' || step === 'COMPLETE') && (
                  <AIInterpretation
                    interpretation={aiInterpretation}
                    loading={aiLoading}
                    error={aiError}
                    onRetry={handleGetInterpretation}
                    spreadInfo={`Lá bài duy nhất: ${revealedCard.card.nameVi} (${
                      revealedCard.isReversed ? 'Ngược' : 'Xuôi'
                    }) ${userQuestion ? `| Câu hỏi: "${userQuestion}"` : ''}`}
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
                      🔄 Rút Lá Bài Khác
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

      {revealedCard && (
        <CardInspector
          card={revealedCard.card}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
        />
      )}

    </div>
  );
}
