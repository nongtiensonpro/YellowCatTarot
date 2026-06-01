'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const YellowCat3D = dynamic(() => import('@/components/YellowCat3D'), {
  ssr: false,
  loading: () => (
    <div className="w-[180px] h-[180px] flex items-center justify-center">
      <div className="animate-pulse text-gold-light/60 font-cinzel text-xs">Đang đánh thức Mèo Vàng...</div>
    </div>
  ),
});

export default function ReadingHub() {
  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#0d0d1a] to-[#12122a] py-8 px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8 items-stretch mt-4">
        
        {/* Title */}
        <div className="text-center border-b border-gold-primary/10 pb-5">
          <h1 className="font-cinzel text-2xl md:text-3xl font-extrabold text-gold-primary tracking-wider drop-shadow-[0_0_8px_var(--color-gold-glow)]">
            Không Gian Trải Bài Tarot
          </h1>
          <p className="font-lora text-xs md:text-sm text-text-secondary italic mt-1.5">
            Lựa chọn hình thức rút bài thích hợp để giải đáp những thắc mắc sâu thẳm trong lòng.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-2">
          
          {/* Mèo Vàng character (4/12 size) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4">
            <YellowCat3D
              state="idle"
              size="lg"
              speechBubble="Bạn muốn cùng Mèo Vàng lắng nghe lời chỉ dẫn nào của vũ trụ hôm nay? Hãy chọn một kiểu trải bài nhé! 🐱✨"
              className="mt-14"
            />
          </div>

          {/* Spreads Selector list (8/12 size) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Option 1: Single Card Spread */}
            <Link
              href="/reading/single"
              className="group bg-bg-surface/30 border border-gold-primary/20 hover:border-gold-light/60 rounded-2xl p-5 shadow-xl flex gap-5 items-center transition-all duration-300 hover:-translate-y-1 hover:bg-bg-surface/50 hover:shadow-[0_0_15px_rgba(244,162,97,0.15)] cursor-pointer"
            >
              <div className="w-12 h-16 rounded-lg bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary text-xl font-bold font-sans group-hover:bg-gold-primary/25 transition-all">
                1
              </div>
              <div className="flex-1 flex flex-col gap-1 text-left font-lora">
                <h3 className="font-cinzel font-bold text-base md:text-lg text-text-primary group-hover:text-gold-light transition-colors">
                  Rút Bài Một Lá (Single Card)
                </h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                  Nhận một thông điệp cô đọng, tập trung trực tiếp giải đáp nhanh cho câu hỏi hoặc năng lượng chung của ngày hôm nay.
                </p>
              </div>
              <div className="text-gold-primary group-hover:translate-x-1.5 transition-transform duration-200">
                ➔
              </div>
            </Link>

            {/* Option 2: Three Card Spread */}
            <Link
              href="/reading/three-card"
              className="group bg-bg-surface/30 border border-gold-primary/20 hover:border-gold-light/60 rounded-2xl p-5 shadow-xl flex gap-5 items-center transition-all duration-300 hover:-translate-y-1 hover:bg-bg-surface/50 hover:shadow-[0_0_15px_rgba(244,162,97,0.15)] cursor-pointer"
            >
              <div className="w-12 h-16 rounded-lg bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary text-xl font-bold font-sans group-hover:bg-gold-primary/25 transition-all">
                3
              </div>
              <div className="flex-1 flex flex-col gap-1 text-left font-lora">
                <h3 className="font-cinzel font-bold text-base md:text-lg text-text-primary group-hover:text-gold-light transition-colors">
                  Trải Ba Lá (Quá Khứ - Hiện Tại - Tương Lai)
                </h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                  Xem xét tiến trình thời gian và dòng chảy nguyên nhân - kết quả của câu chuyện để tìm phương án giải quyết tối ưu.
                </p>
              </div>
              <div className="text-gold-primary group-hover:translate-x-1.5 transition-transform duration-200">
                ➔
              </div>
            </Link>

            {/* Option 3: Celtic Cross Spread */}
            <Link
              href="/reading/celtic-cross"
              className="group bg-bg-surface/30 border border-gold-primary/20 hover:border-gold-light/60 rounded-2xl p-5 shadow-xl flex gap-5 items-center transition-all duration-300 hover:-translate-y-1 hover:bg-bg-surface/50 hover:shadow-[0_0_15px_rgba(244,162,97,0.15)] cursor-pointer"
            >
              <div className="w-12 h-16 rounded-lg bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center text-gold-primary text-xl font-bold font-sans group-hover:bg-gold-primary/25 transition-all">
                10
              </div>
              <div className="flex-1 flex flex-col gap-1 text-left font-lora">
                <h3 className="font-cinzel font-bold text-base md:text-lg text-text-primary group-hover:text-gold-light transition-colors">
                  Trải Bài Celtic Cross (10 Lá)
                </h3>
                <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                  Kiểu trải bài cổ điển kinh điển và sâu sắc bậc nhất thế giới, giúp phân tích đa chiều toàn diện mọi ngóc ngách vấn đề phức tạp.
                </p>
              </div>
              <div className="text-gold-primary group-hover:translate-x-1.5 transition-transform duration-200">
                ➔
              </div>
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}
