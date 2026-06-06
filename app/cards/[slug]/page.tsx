'use client';

import React, { use, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCardBySlug, tarotCards, TarotCard as TarotCardType } from '@/lib/cards-data';
import { getCardDetailBySlug } from '@/lib/cards-details';
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
  const deepDetail = useMemo(() => getCardDetailBySlug(slug), [slug]);
  const { apiKey, setBackgroundTheme } = useApiKey();

  useEffect(() => {
    setBackgroundTheme('mystic-night');
  }, [setBackgroundTheme]);

  // State for interactive features
  const [isReversed, setIsReversed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(true);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiInterpretation, setAiInterpretation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Detailed Tab selector
  const [detailTab, setDetailTab] = useState<'overview' | 'upright' | 'reversed' | 'advice'>('overview');

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
            arcana: card.arcana,
            suit: card.suit,
            number: card.number,
            keywordsVi: card.keywordsVi,
            meaningUpright: card.meaningUpright,
            meaningReversed: card.meaningReversed,
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
    <div className="flex-1 w-full bg-transparent py-8 px-4 sm:px-6 lg:px-8 select-none">
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

            {/* Detailed Meanings / Tab Interface */}
            {deepDetail ? (
              <div className="flex flex-col gap-5">
                {/* Detailed Tabs Selector */}
                <div className="flex border-b border-gold-primary/10 pb-1 gap-2 overflow-x-auto no-scrollbar font-sans font-bold text-xs md:text-sm select-none">
                  <button
                    onClick={() => setDetailTab('overview')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                      detailTab === 'overview'
                        ? 'text-gold-light bg-gold-primary/10 border-b-2 border-gold-light rounded-b-none'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/30'
                    }`}
                  >
                    <span>👁️ Tổng Quan & Biểu Tượng</span>
                  </button>
                  <button
                    onClick={() => setDetailTab('upright')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                      detailTab === 'upright'
                        ? 'text-gold-light bg-gold-primary/10 border-b-2 border-gold-light rounded-b-none'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/30'
                    }`}
                  >
                    <span>☀️ Ý Nghĩa Chiều Xuôi</span>
                  </button>
                  <button
                    onClick={() => setDetailTab('reversed')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                      detailTab === 'reversed'
                        ? 'text-gold-light bg-gold-primary/10 border-b-2 border-gold-light rounded-b-none'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/30'
                    }`}
                  >
                    <span>↩️ Ý Nghĩa Chiều Ngược</span>
                  </button>
                  <button
                    onClick={() => setDetailTab('advice')}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                      detailTab === 'advice'
                        ? 'text-gold-light bg-gold-primary/10 border-b-2 border-gold-light rounded-b-none'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface/30'
                    }`}
                  >
                    <span>🐱 Lời Khuyên Mèo Vàng</span>
                  </button>
                </div>

                {/* Detailed Tabs Content Container */}
                <div className="bg-[#161633]/30 border border-gold-primary/15 rounded-2xl p-5 shadow-2xl backdrop-blur-md min-h-[220px] font-lora">
                  
                  {/* OVERVIEW TAB */}
                  {detailTab === 'overview' && (
                    <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                      <div>
                        <h4 className="font-sans font-bold text-xs text-gold-light uppercase tracking-widest mb-1.5">
                          🔮 Ý Nghĩa Tổng Quan Chuyên Sâu
                        </h4>
                        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{deepDetail.generalOverview}</p>
                      </div>
                      <div className="border-t border-gold-primary/5 pt-4 mt-2">
                        <h4 className="font-sans font-bold text-xs text-gold-light uppercase tracking-widest mb-1.5">
                          🎨 Giải Mã Biểu Tượng Hình Ảnh (Rider-Waite-Smith)
                        </h4>
                        <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{deepDetail.symbolism}</p>
                      </div>
                    </div>
                  )}

                  {/* UPRIGHT TAB */}
                  {detailTab === 'upright' && (
                    <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                      <div className="bg-[#2d6a4f]/5 border border-[#2d6a4f]/25 rounded-xl p-3.5 shadow-sm">
                        <span className="text-[10px] font-sans font-bold text-green-400 uppercase tracking-widest">✦ Thông Điệp Xuôi Chung</span>
                        <p className="text-text-primary text-xs md:text-sm mt-1 leading-relaxed">{deepDetail.upright.general}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3.5 mt-2">
                        <div className="border border-white/5 rounded-xl p-3.5 bg-bg-surface/10 flex flex-col gap-1">
                          <span className="text-xs font-sans font-bold text-[#ffd166] uppercase tracking-wider flex items-center gap-1.5">💼 Công Việc & Tài Chính</span>
                          <p className="text-text-primary text-xs md:text-sm leading-relaxed">{deepDetail.upright.career}</p>
                        </div>
                        <div className="border border-white/5 rounded-xl p-3.5 bg-bg-surface/10 flex flex-col gap-1">
                          <span className="text-xs font-sans font-bold text-[#ffd166] uppercase tracking-wider flex items-center gap-1.5">💜 Tình Cảm & Mối Quan Hệ</span>
                          <p className="text-text-primary text-xs md:text-sm leading-relaxed">{deepDetail.upright.love}</p>
                        </div>
                        <div className="border border-white/5 rounded-xl p-3.5 bg-bg-surface/10 flex flex-col gap-1">
                          <span className="text-xs font-sans font-bold text-[#ffd166] uppercase tracking-wider flex items-center gap-1.5">🌿 Sức Khỏe & Tinh Thần</span>
                          <p className="text-text-primary text-xs md:text-sm leading-relaxed">{deepDetail.upright.health}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* REVERSED TAB */}
                  {detailTab === 'reversed' && (
                    <div className="flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                      <div className="bg-[#e76f51]/5 border border-[#e76f51]/25 rounded-xl p-3.5 shadow-sm">
                        <span className="text-[10px] font-sans font-bold text-gold-dark uppercase tracking-widest">↩ Thông Điệp Ngược Chung</span>
                        <p className="text-text-primary text-xs md:text-sm mt-1 leading-relaxed">{deepDetail.reversed.general}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3.5 mt-2">
                        <div className="border border-white/5 rounded-xl p-3.5 bg-bg-surface/10 flex flex-col gap-1">
                          <span className="text-xs font-sans font-bold text-[#ffd166] uppercase tracking-wider flex items-center gap-1.5">💼 Công Việc & Tài Chính</span>
                          <p className="text-text-primary text-xs md:text-sm leading-relaxed">{deepDetail.reversed.career}</p>
                        </div>
                        <div className="border border-white/5 rounded-xl p-3.5 bg-bg-surface/10 flex flex-col gap-1">
                          <span className="text-xs font-sans font-bold text-[#ffd166] uppercase tracking-wider flex items-center gap-1.5">💜 Tình Cảm & Mối Quan Hệ</span>
                          <p className="text-text-primary text-xs md:text-sm leading-relaxed">{deepDetail.reversed.love}</p>
                        </div>
                        <div className="border border-white/5 rounded-xl p-3.5 bg-bg-surface/10 flex flex-col gap-1">
                          <span className="text-xs font-sans font-bold text-[#ffd166] uppercase tracking-wider flex items-center gap-1.5">🌿 Sức Khỏe & Tinh Thần</span>
                          <p className="text-text-primary text-xs md:text-sm leading-relaxed">{deepDetail.reversed.health}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ADVICE TAB */}
                  {detailTab === 'advice' && (
                    <div className="flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out] relative overflow-hidden p-4 rounded-xl border border-gold-primary/20 bg-gold-primary/5 shadow-md">
                      <div className="absolute w-28 h-28 rounded-full bg-gold-primary/5 blur-xl -top-5 -right-5 pointer-events-none" />
                      <h4 className="font-sans font-bold text-xs text-gold-light uppercase tracking-widest flex items-center gap-1.5">
                        🐱 Lời Nhắn Ấm Áp Từ Mèo Vàng
                      </h4>
                      <p className="text-text-primary text-sm leading-relaxed italic whitespace-pre-wrap">{deepDetail.advice}</p>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Basic Statically hardcoded meanings */}
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

                {/* Cozy Ghibli Suit placeholder card info */}
                <div className="flex flex-col gap-3 p-4 rounded-2xl border border-gold-primary/15 bg-bg-surface/35 shadow-md font-lora">
                  <h4 className="text-xs font-sans font-extrabold text-gold-light uppercase tracking-widest flex items-center gap-1.5">
                    🐾 Nhật Ký Gác Mái Mèo Vàng
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed italic">
                    "Quý nhân ơi, tập hồ sơ chuyên sâu đầy đủ về bộ ẩn phụ này đang được miêu miêu nhỏ bé cẩn thận ghi chép lại... Hiện tại quý nhân có thể đọc ý nghĩa cơ bản bên trên hoặc gõ câu hỏi xuống khung dưới để em kết nối vũ trụ luận giải chi tiết lập tức nhé! 🐱🔮🍵"
                  </p>
                </div>
              </div>
            )}

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
