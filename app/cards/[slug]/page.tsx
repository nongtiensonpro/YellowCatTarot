'use client';

import React, { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCardBySlug, tarotCards, TarotCard as TarotCardType } from '@/lib/cards-data';
import TarotCard from '@/components/TarotCard';
import { useApiKey } from '@/components/ApiKeyProvider';
import { interpretCards } from '@/lib/gemini';
import AIInterpretation from '@/components/AIInterpretation';
import CardInspector from '@/components/CardInspector';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CardDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const card = useMemo(() => getCardBySlug(slug), [slug]);
  const { apiKey } = useApiKey();

  // State for interactive features
  const [isReversed, setIsReversed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(true);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  if (!card) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-bg-deep text-center">
        <h2 className="font-cinzel text-xl text-gold-dark font-bold mb-4">
          Lá bài phép thuật không tồn tại! 🐱💨
        </h2>
        <Link
          href="/cards"
          className="px-5 py-2 font-sans font-semibold rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep transition-all shadow-[0_0_10px_var(--color-gold-glow)]"
        >
          Quay Lại Thư Viện
        </Link>
      </div>
    );
  }

  // Find previous and next card for navigation
  const currentIndex = tarotCards.findIndex((c) => c.id === card.id);
  const prevCard = currentIndex > 0 ? tarotCards[currentIndex - 1] : null;
  const nextCard = currentIndex < tarotCards.length - 1 ? tarotCards[currentIndex + 1] : null;

  // Ask Mèo Vàng AI about this card
  const handleAskMèoVàng = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      // Trigger modal alert or let the AIInterpretation component handle it
      setIsAskingAi(true);
      setAiError('Mèo Vàng cần API Key ở mục Cài Đặt (⚙️ góc trên bên phải) để có thể luận giải bài cho bạn nhé! 🐱🔑');
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiInterpretation('');
    setIsAskingAi(true);

    try {
      const promptQuestion = aiQuestion.trim()
        ? `Lá bài ${card.nameVi} (${card.nameEn}) ở trạng thái ${isReversed ? 'NGƯỢC' : 'XUÔI'}. Câu hỏi đặc biệt của người dùng: "${aiQuestion.trim()}"`
        : `Hãy cho tôi biết thêm bài học thông thái chuyên sâu từ lá bài ${card.nameVi} (${card.nameEn}) ở trạng thái ${isReversed ? 'NGƯỢC' : 'XUÔI'}.`;

      // Call client-side Gemini function
      const response = await interpretCards(
        apiKey,
        [
          {
            slug: card.slug,
            nameVi: card.nameVi,
            nameEn: card.nameEn,
            isReversed,
            position: 'Lá Bài Nghiên Cứu',
          },
        ],
        {
          type: 'single',
          nameVi: 'Tra Cứu Chi Tiết',
          descriptionVi: 'Tra cứu chi tiết lá bài đơn lẻ',
          positions: [{ id: 1, nameVi: 'Lá Bài Nghiên Cứu', descriptionVi: '' }],
        },
        promptQuestion
      );

      setAiInterpretation(response.interpretation);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Có lỗi xảy ra khi truyền tin tới Gemini AI. Thử lại sau nhé!');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans border-b border-gold-primary/10 pb-4">
          <div className="text-text-secondary flex gap-1.5 items-center">
            <Link href="/" className="hover:text-gold-light transition-colors">
              Trang Chủ
            </Link>
            <span>/</span>
            <Link href="/cards" className="hover:text-gold-light transition-colors">
              Thư Viện Bài
            </Link>
            <span>/</span>
            <span className="text-gold-light font-medium">{card.nameVi}</span>
          </div>

          {/* Prev/Next Navigation */}
          <div className="flex gap-3">
            {prevCard && (
              <Link
                href={`/cards/${prevCard.slug}`}
                className="px-3 py-1.5 rounded-lg bg-bg-surface border border-gold-primary/10 text-text-secondary hover:text-gold-light hover:border-gold-primary/40 transition-all flex items-center gap-1 font-semibold"
              >
                ◀ {prevCard.nameVi}
              </Link>
            )}
            {nextCard && (
              <Link
                href={`/cards/${nextCard.slug}`}
                className="px-3 py-1.5 rounded-lg bg-bg-surface border border-gold-primary/10 text-text-secondary hover:text-gold-light hover:border-gold-primary/40 transition-all flex items-center gap-1 font-semibold"
              >
                {nextCard.nameVi} ▶
              </Link>
            )}
          </div>
        </div>

        {/* Core Layout (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start mt-2">
          
          {/* COLUMN 1: Large Card Image & Controls (2/5 size) */}
          <div className="md:col-span-2 flex flex-col items-center gap-5">
            {/* Interactive Card display wrapper */}
            <div className="relative group">
              <TarotCard
                card={card}
                isFlipped={isFlipped}
                isReversed={isReversed}
                size="lg"
                interactive={true}
                onClick={() => setIsFlipped(!isFlipped)}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-2.5 w-full max-w-[220px] font-sans">
              {/* Toggle Flip button */}
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-bg-surface hover:bg-bg-elevated border border-gold-primary/20 text-text-primary hover:text-gold-light cursor-pointer transition-all"
              >
                🔄 {isFlipped ? 'Úp Lá Bài' : 'Lật Lá Bài'}
              </button>

              {/* Toggle Reversed button */}
              <button
                onClick={() => setIsReversed(!isReversed)}
                disabled={!isFlipped}
                className="w-full py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-bg-surface hover:bg-bg-elevated border border-gold-primary/20 text-text-primary hover:text-gold-light cursor-pointer transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                ↩ {isReversed ? 'Xoay Xuôi Lá Bài' : 'Xoay Ngược Lá Bài'}
              </button>

              {/* Advanced Zoom/Inspect button */}
              <button
                onClick={() => setIsInspectorOpen(true)}
                disabled={!isFlipped}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-gold-primary to-gold-dark hover:from-gold-light hover:to-gold-primary text-bg-deep cursor-pointer transition-all shadow-[0_0_12px_rgba(244,162,97,0.25)] flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none mt-1"
              >
                🔍 Ngắm Chi Tiết Cực Nét
              </button>
            </div>

            {/* Badges info */}
            <div className="w-full max-w-[220px] bg-bg-surface/30 border border-gold-primary/10 rounded-xl p-3 flex flex-col gap-2 text-center text-xs">
              <div>
                <span className="text-text-secondary">Thuộc bộ:</span>{' '}
                <span className="font-sans font-bold text-gold-light uppercase tracking-wider">
                  {card.arcana === 'major' ? 'Đại Bí Ẩn (Major)' : 'Tiểu Bí Ẩn (Minor)'}
                </span>
              </div>
              {card.suit && (
                <div>
                  <span className="text-text-secondary">Chất bài:</span>{' '}
                  <span className="font-sans font-bold text-gold-light uppercase tracking-wider">
                    {card.suit === 'wands' && '🔥 Quyền Trượng'}
                    {card.suit === 'cups' && '💧 Thánh Bôi'}
                    {card.suit === 'swords' && '⚔️ Kiếm'}
                    {card.suit === 'pentacles' && '🪙 Tiền Vàng'}
                  </span>
                </div>
              )}
              <div>
                <span className="text-text-secondary">Số hiệu:</span>{' '}
                <span className="font-sans font-bold text-gold-light uppercase tracking-wider">
                  #{card.number}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Info & Meanings & AI questioning (3/5 size) */}
          <div className="md:col-span-3 flex flex-col gap-6">
            {/* Header info */}
            <div className="flex flex-col gap-1 border-b border-gold-primary/10 pb-4">
              <h1 className="font-cinzel text-3xl font-bold text-gold-light tracking-wide">
                Lá bài: {card.nameVi}
              </h1>
              <h2 className="font-lora text-lg text-text-secondary italic opacity-85">
                Tên gốc: {card.nameEn}
              </h2>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {card.keywordsVi.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-gold-primary/10 border border-gold-primary/30 text-gold-light text-xs font-sans font-semibold uppercase tracking-wider"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Statically hardcoded meanings */}
            <div className="flex flex-col gap-4 font-lora">
              {/* Meaning Upright */}
              <div
                className={`border rounded-2xl p-4 transition-all duration-300 ${
                  !isReversed
                    ? 'bg-[#2d6a4f]/5 border-[#2d6a4f]/30 ring-1 ring-[#2d6a4f]/15 shadow-lg'
                    : 'bg-bg-surface/30 border-gold-primary/10 opacity-70'
                }`}
              >
                <h3 className="font-sans font-bold text-sm text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  ✦ Ý Nghĩa Chiều Xuôi (Upright)
                </h3>
                <p className="text-text-primary text-sm leading-relaxed">{card.meaningUpright}</p>
              </div>

              {/* Meaning Reversed */}
              <div
                className={`border rounded-2xl p-4 transition-all duration-300 ${
                  isReversed
                    ? 'bg-[#e76f51]/5 border-[#e76f51]/35 ring-1 ring-[#e76f51]/15 shadow-lg'
                    : 'bg-bg-surface/30 border-gold-primary/10 opacity-70'
                }`}
              >
                <h3 className="font-sans font-bold text-sm text-gold-dark uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  ↩ Ý Nghĩa Chiều Ngược (Reversed)
                </h3>
                <p className="text-text-primary text-sm leading-relaxed">{card.meaningReversed}</p>
              </div>
            </div>

            {/* ASK MÈO VÀNG AI PANEL */}
            <div className="bg-bg-surface/40 border border-gold-primary/20 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
              <h3 className="font-cinzel text-base text-gold-light font-bold tracking-wider flex items-center gap-2">
                ✨ Hỏi Mèo Vàng Về Lá Bài Này
              </h3>
              
              <p className="text-xs text-text-secondary leading-relaxed font-lora italic">
                Bạn có thắc mắc gì đặc biệt về lá bài {card.nameVi} ở thế {isReversed ? 'ngược' : 'xuôi'} trong tình huống của bạn không? Hãy đặt câu hỏi để nhận luận giải tâm tình từ Mèo Vàng.
              </p>

              <form onSubmit={handleAskMèoVàng} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="Ví dụ: Tình yêu sắp tới với lá bài này sẽ ra sao?..."
                  className="flex-1 bg-bg-elevated/50 border border-gold-primary/10 focus:border-gold-light focus:outline-none rounded-xl px-4 py-2 text-xs md:text-sm font-lora text-text-primary placeholder:text-text-secondary/40 focus:shadow-[0_0_10px_var(--color-gold-glow)] transition-all"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-4 py-2 font-sans font-bold text-xs md:text-sm rounded-xl bg-gold-primary hover:bg-gold-light text-bg-deep cursor-pointer transition-all shadow-[0_0_10px_var(--color-gold-glow)] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {aiLoading ? 'Đang Luận...' : 'Gửi Câu Hỏi'}
                </button>
              </form>

              {/* AI output display */}
              {isAskingAi && (
                <div className="border-t border-gold-primary/10 pt-4 mt-1 animate-[fadeIn_0.3s_ease-out]">
                  <AIInterpretation
                    interpretation={aiInterpretation}
                    loading={aiLoading}
                    error={aiError}
                    onRetry={() => {
                      const mockEvent = { preventDefault: () => {} } as React.FormEvent;
                      handleAskMèoVàng(mockEvent);
                    }}
                  />
                </div>
              )}
            </div>

          </div>

          <CardInspector
            card={card}
            isOpen={isInspectorOpen}
            onClose={() => setIsInspectorOpen(false)}
          />

        </div>

      </div>
    </div>
  );
}
