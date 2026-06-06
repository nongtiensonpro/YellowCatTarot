'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useApiKey } from './ApiKeyProvider';

interface Props {
  theme?: 'mystic-night' | 'enchanted-forest' | 'celestial-dawn';
}

interface ParticleItem {
  id: number;
  left: string;
  top?: string;
  delay: string;
  duration: string;
  size: string;
}

interface FloatingCardItem {
  id: number;
  top: string;
  delay: string;
  duration: string;
  scale: number;
}

interface PawItem {
  id: number;
  left: string;
  top: string;
  delay: string;
  rotation: string;
}

export default function GhibliAnimatedBackground({ theme: propTheme }: Props) {
  const { preferredCardBack, backgroundTheme } = useApiKey();
  const theme = propTheme || backgroundTheme;
  const [isMounted, setIsMounted] = useState(false);
  const [bgImage, setBgImage] = useState<string>('');
  const [reduceMotion, setReduceMotion] = useState(false);

  // States cho các lớp động để tránh Hydration Mismatch
  const [stars, setStars] = useState<ParticleItem[]>([]);
  const [dusts, setDusts] = useState<ParticleItem[]>([]);
  const [fireflies, setFireflies] = useState<ParticleItem[]>([]);
  const [floatingCards, setFloatingCards] = useState<FloatingCardItem[]>([]);
  const [paws, setPaws] = useState<PawItem[]>([]);

  useEffect(() => {
    setIsMounted(true);

    // Kiểm tra chế độ reduced motion của hệ thống
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    // Tương thích ngược: Đọc tùy chọn mặt sau bài để làm hình nền mờ dưới đáy
    if (preferredCardBack && preferredCardBack !== 'default' && preferredCardBack !== 'ghibli-svg') {
      setBgImage(preferredCardBack);
    } else {
      setBgImage('');
    }

    return () => mediaQuery.removeEventListener('change', listener);
  }, [preferredCardBack]);

  // Sinh dữ liệu random client-side
  useEffect(() => {
    if (!isMounted) return;

    // 1. Sao nhấp nháy (chỉ ở nửa trên màn hình)
    const tempStars = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 50}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      size: `${1 + Math.random() * 2}px`,
    }));
    setStars(tempStars);

    // 2. Hạt bụi vàng bay lên
    const tempDusts = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${12 + Math.random() * 10}s`,
      size: `${2 + Math.random() * 3}px`,
    }));
    setDusts(tempDusts);

    // 3. Đom đóm xanh lá lượn sóng
    const tempFireflies = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${18 + Math.random() * 12}s`,
      size: `${4 + Math.random() * 3}px`,
    }));
    setFireflies(tempFireflies);

    // 4. Lá bài Tarot mini trôi nổi ngang
    const tempCards = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      top: `${20 + Math.random() * 50}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${40 + Math.random() * 20}s`,
      scale: 0.7 + Math.random() * 0.5,
    }));
    setFloatingCards(tempCards);

    // 5. Dấu chân mèo mờ ảo
    const tempPaws = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      left: `${15 + Math.random() * 70}%`,
      top: `${60 + Math.random() * 25}%`,
      delay: `${Math.random() * 12}s`,
      rotation: `${-20 + Math.random() * 40}deg`,
    }));
    setPaws(tempPaws);
  }, [isMounted]);

  if (!isMounted) {
    // Render một skeleton nền tĩnh tối trong quá trình SSR để tránh nhấp nháy giao diện
    return (
      <div className="fixed inset-0 -z-50 bg-[#0d0d1a]" />
    );
  }

  // Định nghĩa màu sắc các dãy núi và tinh vân theo từng theme
  let bgGradient = 'bg-gradient-to-b from-[#060614] via-[#0b0b21] to-[#121230]';
  let hillFarColor = '#09091b';
  let hillMidColor = '#0d0d26';
  let hillCloseColor = '#121235';
  let nebulaColor1 = 'rgba(155, 93, 229, 0.04)'; // Tím
  let nebulaColor2 = 'rgba(244, 162, 97, 0.03)'; // Vàng cát

  if (theme === 'enchanted-forest') {
    bgGradient = 'bg-gradient-to-b from-[#03060a] via-[#071117] to-[#0a181c]';
    hillFarColor = '#04080c';
    hillMidColor = '#071116';
    hillCloseColor = '#0a191c';
    nebulaColor1 = 'rgba(45, 106, 79, 0.05)'; // Xanh lá rừng
    nebulaColor2 = 'rgba(155, 93, 229, 0.03)'; // Tím
  } else if (theme === 'celestial-dawn') {
    bgGradient = 'bg-gradient-to-b from-[#0a0514] via-[#1a0c24] to-[#2b1536]';
    hillFarColor = '#0d071a';
    hillMidColor = '#190b24';
    hillCloseColor = '#261233';
    nebulaColor1 = 'rgba(244, 162, 97, 0.06)'; // Vàng ấm bình minh
    nebulaColor2 = 'rgba(183, 212, 231, 0.04)'; // Xanh bầu trời
  }

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none select-none">
      {/* LỚP 1: BẦU TRỜI Gradient & Tinh vân mờ ảo */}
      <div className={`absolute inset-0 ${bgGradient} transition-all duration-1000`} />

      {/* Tương thích ngược: Ảnh nền mờ phía dưới đáy nếu người dùng chọn cụ thể */}
      {bgImage && (
        <div className="absolute inset-0 z-0 opacity-15 mix-blend-lighten filter blur-[70px] scale-105">
          <Image
            src={`/cards/Backofthecard/${bgImage}`}
            alt="Preferred Card Back Background"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Tinh vân chuyển động siêu chậm (chỉ kích hoạt khi không bật reduce motion) */}
      {!reduceMotion && (
        <>
          <div
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] animate-nebula pointer-events-none"
            style={{ backgroundColor: nebulaColor1, animationDuration: '140s' }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] animate-nebula pointer-events-none"
            style={{ backgroundColor: nebulaColor2, animationDuration: '190s', animationDelay: '-40s' }}
          />
        </>
      )}

      {/* Bầu trời sao tĩnh phong cách Ghibli */}
      <div className="absolute inset-0 bg-ghibli-stars opacity-25" />

      {/* Lớp sao lấp lánh động (Stars Twinkling) */}
      {!reduceMotion && (
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-amber-100 rounded-full opacity-40"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                animation: `starTwinkle ${star.duration} ease-in-out infinite`,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* LỚP 2: MẶT TRĂNG LƯỠI LIỀM VÀNG & EASTER EGG MÈO VÀNG */}
      <div 
        className="absolute top-[8%] right-[10%] w-[120px] h-[120px] flex items-center justify-center pointer-events-auto"
        title="Mặt trăng Ghibli - Thử rê chuột ngắm Mèo Vàng xem!"
      >
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full filter drop-shadow-[0_0_12px_rgba(255,209,102,0.3)] ${
            !reduceMotion ? 'animate-moon-glow' : ''
          } group cursor-help`}
        >
          <defs>
            <linearGradient id="moonGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd166" />
              <stop offset="60%" stopColor="#f4a261" />
              <stop offset="100%" stopColor="#e76f51" />
            </linearGradient>
          </defs>
          
          {/* Lưỡi liềm vàng */}
          <path
            d="M60,15 A40,40 0 1,0 105,60 A32,32 0 1,1 60,15 Z"
            fill="url(#moonGlowGrad)"
          />

          {/* Easter egg: Chú mèo vàng nhỏ xíu ngồi trên trăng (Silhouette hiện rõ hơn khi hover vào trăng) */}
          <g className="opacity-10 group-hover:opacity-85 transition-opacity duration-700">
            {/* Thân mèo */}
            <path
              d="M 52,43 
                 C 51,40 54,37 54,33 
                 C 54,31 52,28 54,28 
                 C 55,28 55.5,29 55.5,29.5 
                 C 55.5,28.5 58,28 58.5,29 
                 C 59,30 57,32 57,34.5 
                 C 57,38.5 61.5,41 61.5,43.5 
                 C 61.5,45 59.5,46 57.5,46 
                 L 55,46 
                 C 52.5,46 52,44.5 52,43 Z"
              fill="#221105"
            />
            {/* Đuôi mèo cong xuống */}
            <path
              d="M 54.5,45.5 C 54.5,49.5 52,52.5 48.5,52.5"
              fill="none"
              stroke="#221105"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Mắt phát sáng nhỏ xíu màu lục ngọc */}
            <circle cx="55.2" cy="31" r="0.6" fill="#52b788" />
            <circle cx="57.2" cy="31" r="0.6" fill="#52b788" />
          </g>
        </svg>
      </div>

      {/* LỚP 3: ĐỒI NÚI GHIBLI SILHOUETTE */}
      <div className="absolute bottom-0 left-0 w-full h-[180px] sm:h-[240px] z-10 pointer-events-none">
        <svg
          viewBox="0 0 1000 240"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Dãy đồi xa */}
          <path
            d="M0,170 Q280,105 520,165 T1000,140 L1000,240 L0,240 Z"
            fill={hillFarColor}
            className="opacity-75 transition-colors duration-1000"
          />

          {/* Dãy đồi vừa */}
          <path
            d="M0,195 Q220,150 480,190 T1000,165 L1000,240 L0,240 Z"
            fill={hillMidColor}
            className="opacity-85 transition-colors duration-1000"
          />

          {/* Dãy đồi gần */}
          <path
            d="M0,215 Q340,165 680,210 T1000,190 L1000,240 L0,240 Z"
            fill={hillCloseColor}
            className="transition-colors duration-1000"
          />

          {/* Chi tiết silhouette cây thông nhỏ ở đồi gần */}
          <g fill={hillCloseColor} className="opacity-90">
            {/* Cây 1 */}
            <polygon points="340,170 336,182 344,182" />
            <polygon points="340,177 334,192 346,192" />
            <rect x="339" y="192" width="2" height="15" />
            {/* Cây 2 */}
            <polygon points="355,162 352,174 358,174" />
            <polygon points="355,170 350,185 360,185" />
            <rect x="354" y="185" width="2" height="12" />
            {/* Cây 3 */}
            <polygon points="675,195 672,205 678,205" />
            <polygon points="675,201 670,213 680,213" />
            <rect x="674" y="213" width="2" height="10" />
          </g>
        </svg>
      </div>

      {/* Sương mù mỏng trôi lãng đãng sát đồi núi (chỉ kích hoạt ở theme enchanted-forest) */}
      {theme === 'enchanted-forest' && !reduceMotion && (
        <div className="absolute bottom-0 left-0 w-full h-[120px] bg-gradient-to-t from-[#0a191c]/40 to-transparent z-15 opacity-60 animate-fog-drift pointer-events-none" />
      )}

      {/* LỚP 4: LÁ BÀI TAROT MINI TRÔI NỔI */}
      {!reduceMotion && (
        <div className="absolute inset-0 z-5">
          {floatingCards.map((card) => (
            <div
              key={card.id}
              className="absolute animate-float-card opacity-0"
              style={{
                top: card.top,
                animationDelay: card.delay,
                animationDuration: card.duration,
                transform: `scale(${card.scale})`,
              }}
            >
              {/* Vẽ một lá bài mini bằng SVG tinh xảo */}
              <svg width="24" height="38" viewBox="0 0 24 38" className="filter drop-shadow-[0_0_5px_rgba(244,162,97,0.2)]">
                <rect
                  x="1"
                  y="1"
                  width="22"
                  height="36"
                  rx="2"
                  fill="rgba(13, 13, 26, 0.6)"
                  stroke="#ffd166"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />
                <rect
                  x="2.5"
                  y="2.5"
                  width="19"
                  height="33"
                  rx="1"
                  fill="none"
                  stroke="#f4a261"
                  strokeWidth="0.4"
                  strokeOpacity="0.3"
                />
                {/* Symbol Ngôi sao 4 cánh ở giữa lá bài */}
                <path
                  d="M12,14 L13.5,19 L19,19 L14.5,22 L16,27 L12,24 L8,27 L9.5,22 L5,19 L10.5,19 Z"
                  fill="#ffd166"
                  fillOpacity="0.25"
                  transform="scale(0.6) translate(8, 12)"
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* LỚP 5: HẠT BỤI VÀNG & ĐOM ĐÓM LẤP LÁNH */}
      {!reduceMotion && (
        <div className="absolute inset-0 z-20">
          {/* Hạt bụi vàng bay lên */}
          {dusts.map((dust) => (
            <div
              key={dust.id}
              className="absolute bg-[#ffd166]/35 rounded-full"
              style={{
                width: dust.size,
                height: dust.size,
                bottom: '-10px',
                left: dust.left,
                filter: 'blur(0.4px)',
                animation: `particleDust ${dust.duration} linear infinite`,
                animationDelay: dust.delay,
              }}
            />
          ))}

          {/* Đom đóm xanh phát sáng */}
          {fireflies.map((ff) => (
            <div
              key={ff.id}
              className="absolute bg-[#52b788]/60 rounded-full animate-firefly"
              style={{
                width: ff.size,
                height: ff.size,
                bottom: '-20px',
                left: ff.left,
                filter: 'blur(0.8px)',
                boxShadow: '0 0 8px #52b788, 0 0 15px rgba(82, 183, 136, 0.4)',
                animationDelay: ff.delay,
                animationDuration: ff.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* LỚP 6: DẤU CHÂN MÈO MỜ ẢO 🐾 */}
      {!reduceMotion && (
        <div className="absolute inset-0 z-25">
          {paws.map((paw) => (
            <div
              key={paw.id}
              className="absolute animate-paw opacity-0"
              style={{
                left: paw.left,
                top: paw.top,
                animationDelay: paw.delay,
                transform: `rotate(${paw.rotation})`,
              }}
            >
              {/* Paw print SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffd166" fillOpacity="0.15">
                {/* Đệm chân lớn */}
                <path d="M12,14 C9.5,14 8,16 8,18.5 C8,21 10,22 12,22 C14,22 16,21 16,18.5 C16,16 14.5,14 12,14 Z" />
                {/* 4 ngón nhỏ */}
                <ellipse cx="6" cy="11" rx="2.2" ry="3.2" transform="rotate(-15 6 11)" />
                <ellipse cx="10" cy="7.5" rx="2.2" ry="3.2" />
                <ellipse cx="14" cy="7.5" rx="2.2" ry="3.2" />
                <ellipse cx="18" cy="11" rx="2.2" ry="3.2" transform="rotate(15 18 11)" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
