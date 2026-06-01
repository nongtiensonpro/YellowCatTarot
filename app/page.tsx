'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDailyCard, TarotCard as TarotCardType } from '@/lib/cards-data';
import dynamic from 'next/dynamic';
import TarotCard from '@/components/TarotCard';

const YellowCat3D = dynamic(() => import('@/components/YellowCat3D'), {
  ssr: false,
  loading: () => (
    <div className="w-[260px] h-[260px] md:w-[320px] md:h-[320px] flex items-center justify-center">
      <div className="animate-pulse text-gold-light/60 font-cinzel text-xs">Đang triệu hồi Mèo Vàng 3D...</div>
    </div>
  ),
});

export default function Home() {
  const [dailyData, setDailyData] = useState<{ card: TarotCardType; isReversed: boolean } | null>(null);
  const [isDailyFlipped, setIsDailyFlipped] = useState(false);
  const [particles, setParticles] = useState<{ id: number; left: string; delay: string; duration: string; size: string }[]>([]);
  const [stars, setStars] = useState<{ id: number; top: string; left: string; delay: string; duration: string; scale: string }[]>([]);

  // Generate dynamic particles and stars client-side to avoid hydration mismatches
  useEffect(() => {
    // Seeded random daily card
    const daily = getDailyCard();
    setDailyData(daily);

    // Create background floating dust particles
    const tempParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 15}s`,
      size: `${2 + Math.random() * 4}px`,
    }));
    setParticles(tempParticles);

    // Create twinkling stars
    const tempStars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 60}%`, // Chỉ ở phần bầu trời trên hero
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${2 + Math.random() * 3}s`,
      scale: `${0.4 + Math.random() * 0.8}`,
    }));
    setStars(tempStars);
  }, []);

  return (
    <div className="flex-1 w-full bg-[#0d0d1a] relative overflow-hidden select-none flex flex-col items-center">
      
      {/* 🌌 HERO BACKGROUND: DUST PARTICLES & STARS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-ghibli-stars opacity-35" />
      
      {/* Twinkling Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1.5 h-1.5 bg-star-white rounded-full opacity-30"
            style={{
              top: star.top,
              left: star.left,
              transform: `scale(${star.scale})`,
              animation: `starTwinkle ${star.duration} ease-in-out infinite`,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Floating Dust Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-gold-light/45 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              bottom: '-20px',
              left: p.left,
              filter: 'blur(0.5px)',
              animation: `particleDust ${p.duration} linear infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 🚀 HERO SECTION */}
      <section className="relative z-10 w-full max-w-5xl px-4 pt-10 md:pt-16 pb-12 flex flex-col items-center text-center gap-6">
        
        {/* Animated Hero character sits on the old wooden desk */}
        <div className="relative">
          {/* Wooden table outline below the cat */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-amber-900/60 via-amber-800/80 to-amber-900/60 rounded-full border border-gold-primary/25 shadow-lg" />
          
          <YellowCat3D
            state="idle"
            size="hero"
            speechBubble="Chào mừng bạn đến với căn nhà gỗ phép thuật của Mèo Vàng! Hôm nay bạn muốn tìm câu trả lời từ các quân bài chứ? 🐱✨"
          />
        </div>

        {/* Branding Title */}
        <div className="flex flex-col gap-2.5 max-w-xl">
          <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-black text-gold-primary tracking-widest leading-none drop-shadow-[0_0_15px_rgba(244,162,97,0.4)] animate-[pulse_4s_infinite]">
            TAROT MÈO VÀNG
          </h1>
          <p className="font-lora text-sm md:text-base text-text-secondary italic leading-relaxed px-2">
            Khám phá những chỉ dẫn thông thái từ vũ trụ thông qua bộ bài kinh điển Rider-Waite-Smith, trò chuyện cùng chú mèo vàng ấm áp phong cách Studio Ghibli.
          </p>
        </div>

        {/* Hero Actions CTA */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md font-sans font-extrabold tracking-widest text-sm mt-2">
          <Link
            href="/reading"
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-gold-primary via-gold-light to-gold-primary text-bg-deep uppercase transition-all duration-300 hover:shadow-[0_0_20px_var(--color-gold-light)] hover:scale-103 text-center"
          >
            🃏 Rút Bài Ngay
          </Link>
          <Link
            href="/cards"
            className="flex-1 py-3.5 rounded-2xl bg-bg-surface/50 border border-gold-primary/30 text-text-primary hover:text-gold-light hover:border-gold-light/60 hover:bg-bg-surface/80 uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(244,162,97,0.15)] text-center flex items-center justify-center"
          >
            📚 Tra Cứu Bộ Bài
          </Link>
        </div>

      </section>

      {/* 🌟 FEATURE TILES SECTION */}
      <section className="relative z-10 w-full max-w-5xl px-4 py-8 border-t border-gold-primary/10 bg-bg-mid/30 backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-lora">
          {/* Tile 1 */}
          <div className="bg-bg-surface/20 border border-gold-primary/10 rounded-2xl p-5 shadow-xl flex flex-col gap-2 items-center text-center">
            <span className="text-2xl">📚</span>
            <h3 className="font-cinzel text-sm text-gold-light font-bold uppercase tracking-wider">
              78 Lá Bài Rider-Waite-Smith
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Tra cứu đầy đủ hình ảnh thực tế chất lượng cao, các từ khóa cốt lõi và bài học chi tiết cho cả hai chiều xuôi - ngược của 78 quân bài.
            </p>
          </div>

          {/* Tile 2 */}
          <div className="bg-bg-surface/20 border border-gold-primary/10 rounded-2xl p-5 shadow-xl flex flex-col gap-2 items-center text-center">
            <span className="text-2xl">🃏</span>
            <h3 className="font-cinzel text-sm text-gold-light font-bold uppercase tracking-wider">
              Không Gian Trải Bài Đa Dạng
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Rút bài một lá nhận thông điệp nhanh hàng ngày, hoặc trải bài ba lá phân tích sâu sắc Quá Khứ - Hiện Tại - Tương Lai của mọi sự kiện.
            </p>
          </div>

          {/* Tile 3 */}
          <div className="bg-bg-surface/20 border border-gold-primary/10 rounded-2xl p-5 shadow-xl flex flex-col gap-2 items-center text-center">
            <span className="text-2xl">✨</span>
            <h3 className="font-cinzel text-sm text-gold-light font-bold uppercase tracking-wider">
              Luận Giải Trực Tiếp Bằng AI
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Gọi trực tiếp trí tuệ nhân tạo Google Gemini Studio bằng API Key cá nhân để nhận luận giải tâm tình đầy thông thái từ Mèo Vàng.
            </p>
          </div>
        </div>
      </section>

      {/* 🌙 DAILY CARD WIDGET */}
      <section className="relative z-10 w-full max-w-5xl px-4 py-12 border-t border-gold-primary/10 flex flex-col items-center gap-6">
        
        <div className="text-center flex flex-col gap-1">
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-gold-primary tracking-wide">
            🔮 Thông Điệp Ngày Hôm Nay
          </h2>
          <p className="font-lora text-xs text-text-secondary italic">
            Lá bài ngẫu nhiên được chọn theo ngày (Seeded Random) để ban tặng bạn năng lượng dẫn dắt.
          </p>
        </div>

        {dailyData && (
          <div className="bg-bg-surface/30 border border-gold-primary/15 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row gap-6 items-center justify-center w-full max-w-2xl transition-all hover:border-gold-primary/30">
            
            {/* Click to flip interactive daily card */}
            <div className="flex flex-col items-center gap-2">
              <TarotCard
                card={dailyData.card}
                isFlipped={isDailyFlipped}
                isReversed={dailyData.isReversed}
                size="md"
                interactive={true}
                onClick={() => setIsDailyFlipped(!isDailyFlipped)}
              />
              <span className="text-[10px] font-sans font-semibold text-text-secondary/60 uppercase tracking-widest mt-1 animate-pulse">
                {isDailyFlipped ? '👆 Click để úp bài' : '👆 Click để lật bài'}
              </span>
            </div>

            {/* Daily Card Information Description */}
            <div className="flex-1 flex flex-col gap-3.5 text-center sm:text-left font-lora">
              {isDailyFlipped ? (
                <div className="flex flex-col gap-3 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex flex-col gap-0.5 border-b border-gold-primary/10 pb-2">
                    <span className="text-[10px] text-gold-light/60 font-sans tracking-widest uppercase">
                      Lá Bài Của Ngày:
                    </span>
                    <h3 className="font-cinzel text-xl font-bold text-gold-primary tracking-wide">
                      {dailyData.card.nameVi} ({dailyData.card.nameEn})
                    </h3>
                    <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest text-gold-dark mt-0.5">
                      {dailyData.isReversed ? '↩ Chiều Ngược' : '✦ Chiều Xuôi'}
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {dailyData.card.keywordsVi.map((k, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-gold-primary/10 border border-gold-primary/20 text-gold-light text-[9px] font-sans font-semibold uppercase tracking-wider">
                        #{k}
                      </span>
                    ))}
                  </div>

                  <p className="text-text-primary text-xs md:text-sm leading-relaxed italic border-l-2 border-gold-primary/20 pl-3">
                    {dailyData.isReversed ? dailyData.card.meaningReversed : dailyData.card.meaningUpright}
                  </p>

                  <Link
                    href={`/cards/${dailyData.card.slug}`}
                    className="text-gold-primary hover:text-gold-light underline text-xs font-sans font-semibold transition-colors mt-1"
                  >
                    Xem chi tiết nghiên cứu lá bài này ↗
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center sm:items-start justify-center h-full gap-2 py-4">
                  <h4 className="font-cinzel text-lg font-bold text-gold-light">
                    Món Quà Bí Mật Đang Chờ Đón!
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Vũ trụ đã gửi gắm một quân bài định hướng cho năng lượng của ngày hôm nay. Hãy click lật lá bài bên cạnh để khám phá điều kỳ diệu dành riêng cho bạn!
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </section>

      {/* ⛩️ SIMPLE RUSTIC FOOTER */}
      <footer className="relative z-10 w-full max-w-5xl py-8 mt-8 border-t border-gold-primary/10 text-center font-lora text-xs text-text-secondary/60 flex flex-col gap-2">
        <p className="tracking-wide">
          🐱 ✦ **TAROT MÈO VÀNG** ✦ 🐱
        </p>
        <p className="leading-relaxed px-4">
          Hình ảnh lá bài thuộc bộ bài **Rider-Waite-Smith (1909)** kinh điển. Thiết kế giao diện và âm hưởng Studio Ghibli được kiến tạo bởi Claude/Gemini AI. 
        </p>
        <p className="opacity-80 mt-2 font-sans text-[10px]">
          &copy; {new Date().getFullYear()} Tarot Mèo Vàng. Mọi quyền được bảo lưu. Vạn dặm bình an.
        </p>
      </footer>

    </div>
  );
}
