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

      {/* 🌟 FEATURE SHOWCASE SECTION */}
      <section className="relative z-10 w-full max-w-5xl px-4 py-10 border-t border-gold-primary/10">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="font-cinzel text-xl md:text-2xl font-bold text-gold-primary tracking-wide">
            ✦ Khám Phá Tính Năng ✦
          </h2>
          <p className="font-lora text-xs text-text-secondary italic mt-1.5">
            Hệ sinh thái Tarot toàn diện với trí tuệ nhân tạo và trải nghiệm tương tác sống động
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-lora">
          
          {/* ★ Feature 1: Interactive Dialog Mode — HIGHLIGHTED */}
          <Link
            href="/reading/interactive"
            className="group md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#1c1a38]/60 via-bg-surface/30 to-[#1c1a38]/60 border border-gold-primary/30 hover:border-gold-light/70 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row gap-5 items-center transition-all duration-400 hover:shadow-[0_0_30px_rgba(244,162,97,0.2)] hover:-translate-y-0.5 cursor-pointer"
          >
            {/* Animated shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-gold-primary/0 via-gold-primary/5 to-gold-primary/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gold-primary/5 blur-3xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-primary/20 to-gold-primary/5 border-2 border-gold-primary/40 flex items-center justify-center text-3xl shadow-[0_0_12px_rgba(244,162,97,0.2)] group-hover:scale-110 transition-transform flex-shrink-0 relative">
              💬
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-light opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-primary"></span>
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h3 className="font-cinzel text-base md:text-lg font-bold text-gold-light group-hover:text-white transition-colors">
                  Đối Thoại Cùng Mèo Vàng
                </h3>
                <span className="px-2 py-0.5 text-[8px] font-sans font-bold tracking-widest rounded bg-gold-primary/15 border border-gold-primary/35 text-gold-light uppercase animate-[pulse_3s_infinite]">
                  MỚI ✨
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Cuộc hội thoại chiều sâu với AI. Vừa trò chuyện, vừa nhặt bài làm rõ — rẽ nhánh cây động lên tới 20 lá để tháo gỡ mọi nút thắt. Mèo Vàng sẽ chủ động gợi ý rút thêm bài khi cần hướng bạn đến lối đi tốt đẹp hơn.
              </p>
            </div>
            <div className="text-gold-light group-hover:translate-x-1.5 transition-transform duration-200 text-lg hidden sm:block">
              ➔
            </div>
          </Link>

          {/* Feature 2: Card Library */}
          <Link
            href="/cards"
            className="group bg-bg-surface/20 border border-gold-primary/10 hover:border-gold-light/50 rounded-2xl p-5 shadow-xl flex gap-4 items-center transition-all duration-300 hover:-translate-y-0.5 hover:bg-bg-surface/35 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gold-primary/10 border border-gold-primary/25 flex items-center justify-center text-2xl group-hover:bg-gold-primary/20 transition-all flex-shrink-0">
              📚
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="font-cinzel text-sm font-bold text-gold-light group-hover:text-white transition-colors uppercase tracking-wider">
                Thư Viện 78 Lá Bài
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Hình ảnh Rider-Waite-Smith chất lượng cao, từ khóa, bài học chi tiết chiều xuôi & ngược. Hỗ trợ ngắm lá bài toàn màn hình.
              </p>
            </div>
          </Link>

          {/* Feature 3: Mèo Vàng Profile */}
          <Link
            href="/meo-vang"
            className="group bg-bg-surface/20 border border-gold-primary/10 hover:border-gold-light/50 rounded-2xl p-5 shadow-xl flex gap-4 items-center transition-all duration-300 hover:-translate-y-0.5 hover:bg-bg-surface/35 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gold-primary/10 border border-gold-primary/25 flex items-center justify-center text-2xl group-hover:bg-gold-primary/20 transition-all flex-shrink-0">
              🐱
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="font-cinzel text-sm font-bold text-gold-light group-hover:text-white transition-colors uppercase tracking-wider">
                Hồ Sơ Mèo Vàng
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Tính cách, giao thức chữa lành, cẩm nang đối thoại chi tiết và hướng dẫn sử dụng chế độ đặc biệt.
              </p>
            </div>
          </Link>

          {/* Feature 4: Reading Modes — Spreads */}
          <Link
            href="/reading"
            className="group md:col-span-2 bg-bg-surface/20 border border-gold-primary/10 hover:border-gold-light/50 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-bg-surface/35 cursor-pointer"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-xl bg-gold-primary/10 border border-gold-primary/25 flex items-center justify-center text-2xl group-hover:bg-gold-primary/20 transition-all flex-shrink-0">
                🃏
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <h3 className="font-cinzel text-sm font-bold text-gold-light group-hover:text-white transition-colors uppercase tracking-wider">
                  5 Kiểu Trải Bài Đa Dạng
                </h3>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Từ rút nhanh 1 lá đến Celtic Cross 10 lá kinh điển — mỗi kiểu trải bài đều được Gemini AI luận giải sâu sắc bằng Markdown phong phú.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { icon: '1', label: 'Một Lá', desc: 'Thông điệp nhanh' },
                { icon: '3', label: 'Ba Lá', desc: 'Quá Khứ → Tương Lai' },
                { icon: '10', label: 'Celtic Cross', desc: 'Phân tích toàn diện' },
                { icon: '💬', label: 'Đối Thoại', desc: 'Nhặt bài động' },
                { icon: '🎨', label: 'Tự Do', desc: 'Kéo thả & ghi chú' },
              ].map((s) => (
                <div key={s.label} className="bg-bg-mid/40 border border-gold-primary/10 rounded-lg px-3 py-2 text-center group-hover:border-gold-primary/20 transition-colors">
                  <div className="text-lg font-bold text-gold-primary font-sans">{s.icon}</div>
                  <div className="text-[10px] font-cinzel font-bold text-text-primary tracking-wider mt-0.5">{s.label}</div>
                  <div className="text-[9px] text-text-secondary mt-0.5">{s.desc}</div>
                </div>
              ))}
            </div>
          </Link>

          {/* Feature 5: AI Integration */}
          <div className="bg-bg-surface/20 border border-gold-primary/10 rounded-2xl p-5 shadow-xl flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-gold-primary/10 border border-gold-primary/25 flex items-center justify-center text-2xl flex-shrink-0">
              🤖
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="font-cinzel text-sm text-gold-light font-bold uppercase tracking-wider">
                AI Gemini Luận Giải
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Kết nối Google Gemini Studio bằng API Key cá nhân. Phản hồi Markdown phong phú với bảng, danh sách, in đậm & emoji.
              </p>
            </div>
          </div>

          {/* Feature 6: Card Inspector */}
          <div className="bg-bg-surface/20 border border-gold-primary/10 rounded-2xl p-5 shadow-xl flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-gold-primary/10 border border-gold-primary/25 flex items-center justify-center text-2xl flex-shrink-0">
              🔍
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="font-cinzel text-sm text-gold-light font-bold uppercase tracking-wider">
                Ngắm Bài Toàn Màn Hình
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Phóng to từng lá bài ra toàn bộ màn hình để chiêm nghiệm chi tiết nghệ thuật và biểu tượng ẩn dấu bên trong.
              </p>
            </div>
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
