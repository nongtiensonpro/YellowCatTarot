'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useApiKey } from './ApiKeyProvider';

interface CardBackProps {
  className?: string;
}

export default function CardBack({ className = '' }: CardBackProps) {
  const [mounted, setMounted] = useState(false);
  const [randomBackFile, setRandomBackFile] = useState('Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg');

  let preferredCardBack = 'default';
  try {
    const context = useApiKey();
    preferredCardBack = context?.preferredCardBack || 'default';
  } catch (e) {
    // Kháng lỗi khi render trong các context cô lập (tests, storybook, etc.)
  }

  useEffect(() => {
    setMounted(true);
    const files = [
      'Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg',
      'Backofthecard1.jpeg',
      'Backofthecard2.jpeg',
      'Backofthecard3.jpeg',
      'Backofthecard4.jpeg',
      'Backofthecard5.jpeg',
      'Backofthecard7.jpeg',
      'Backofthecard8.jpeg',
      'Backofthecard9.jpeg'
    ];
    const randomIndex = Math.floor(Math.random() * files.length);
    setRandomBackFile(files[randomIndex]);
  }, []);

  // 1. Mặt sau dạng SVG Ghibli hoạt họa nếu được chọn
  if (preferredCardBack === 'ghibli-svg') {
    return (
      <div
        className={`relative w-full h-full rounded-2xl border-2 border-gold-light/60 overflow-hidden bg-gradient-to-br from-[#12122a] via-[#1a1a3e] to-[#0d0d1a] flex items-center justify-center p-3 select-none ${className}`}
        style={{
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(244, 162, 97, 0.15)',
        }}
      >
        {/* Decorative inner border */}
        <div className="absolute inset-1.5 rounded-[10px] border border-gold-primary/30 pointer-events-none" />

        {/* Twinkling star particles behind the cat */}
        <div className="absolute inset-0 bg-ghibli-stars opacity-40 pointer-events-none" />

        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-gold-light/40 rounded-tl" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-gold-light/40 rounded-tr" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-gold-light/40 rounded-bl" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-gold-light/40 rounded-br" />

        {/* Center mystical emblem */}
        <div className="relative flex flex-col items-center justify-center z-10 scale-95">
          {/* Mystic circle border */}
          <div className="absolute w-24 h-24 rounded-full border border-gold-light/25 animate-[spin_40s_linear_infinite]" />
          <div className="absolute w-[86px] h-[86px] rounded-full border border-dashed border-gold-primary/20 animate-[spin_25s_linear_infinite_reverse]" />

          {/* Glow effect */}
          <div className="absolute w-16 h-16 rounded-full bg-gold-primary/10 blur-xl animate-pulse" />

          {/* Crescent Moon & Cat Silhouette SVG */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative drop-shadow-[0_0_8px_rgba(255,209,102,0.4)]"
          >
            {/* Crescent Moon */}
            <path
              d="M58 20C48 20 38 27 34 37C30 47 32 58 39 66C46 74 57 76 66 72C56 78 43 76 34 68C25 60 22 47 27 36C32 25 44 18 58 20Z"
              fill="url(#moon-gradient)"
            />

            {/* Little Stars */}
            <path d="M25 22L26.5 24.5L29 25L26.5 25.5L25 28L23.5 25.5L21 25L23.5 24.5L25 22Z" fill="#ffd166" className="animate-[starTwinkle_2s_infinite]" />
            <path d="M72 30L73 31.5L74.5 32L73 32.5L72 34L71 32.5L69.5 32L71 31.5L72 30Z" fill="#ffd166" className="animate-[starTwinkle_3s_infinite]" />
            <path d="M70 70L71 71.5L72.5 72L71 72.5L70 74L69 72.5L67.5 72L69 71.5L70 70Z" fill="#ffd166" className="animate-[starTwinkle_2.5s_infinite]" fillOpacity="0.7" />

            {/* Sitting Cat Silhouette */}
            <path
              d="M52 46C49.5 46 47 48.5 47 51C47 53.5 48.5 56 46 58.5C44.5 60 41 60 39.5 61.5C38 63 39 65 39.5 66C40 67 41.5 68 44 68C48 68 50.5 65.5 52 64C53 65 54 66 55.5 66C57 66 58.5 65.5 59.5 64.5C60 65.5 61 66 62.5 66C64 66 66.5 63 65.5 61C65 60 62 58.5 61.5 57C61 55.5 60.5 53 60.5 51C60.5 48 59 46 57 46C55.5 46 54.5 47 53.5 47C52.5 47 52.5 46 52 46Z"
              fill="#090916"
            />
            {/* Cat body glow highlight */}
            <path
              d="M52 46.5C49.8 46.5 47.5 48.8 47.5 51C47.5 53.2 48.9 55.5 46.5 58C45.3 59.2 42.2 59.3 40.5 60.8C39.5 61.8 39.8 63.5 40.5 64.8C42 63.8 43.8 63.5 45 62.2C46.2 61 47.5 59.5 49 59C51 58.3 52.8 59 54.5 59.8C56.2 60.6 58 61.5 59.8 61.5C61 61.5 62.5 60.8 63.5 59.8C64.5 58.8 65 57.5 64.5 56.5C63.8 55 61.5 53.8 61 52.5C60.5 51.2 60 48.8 60 46.8C58 46.8 56.5 48.2 55.5 49C54.2 49.8 53.2 49.8 52 46.5Z"
              fill="url(#cat-edge-glow)"
              fillOpacity="0.25"
            />

            {/* Gradients */}
            <defs>
              <radialGradient id="moon-gradient" cx="45%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#ffd166" />
                <stop offset="60%" stopColor="#f4a261" />
                <stop offset="100%" stopColor="#e76f51" />
              </radialGradient>
              <linearGradient id="cat-edge-glow" x1="40" y1="46" x2="65" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffd166" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>

          {/* Small golden star indicator on top and bottom centers */}
          <div className="absolute -top-10 w-2 h-2 rotate-45 bg-gold-light/40" />
          <div className="absolute -bottom-10 w-2 h-2 rotate-45 bg-gold-light/40" />
        </div>
      </div>
    );
  }

  // 2. Các lựa chọn dạng hình ảnh (Mặc định ngẫu nhiên 'default' hoặc các JPEG 2K khác)
  const isDefault = preferredCardBack === 'default';
  const imgFileName = isDefault
    ? (mounted ? randomBackFile : 'Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg')
    : preferredCardBack;

  // Bản gốc Waite-Smith (nếu hiển thị)
  const isOriginalRWS = imgFileName === 'Waite–Smith_Tarot_Roses_and_Lilies_cropped.jpg';

  return (
    <div
      className={`relative w-full h-full rounded-2xl border-2 border-gold-light/60 overflow-hidden bg-[#0d0d1a] flex items-center justify-center select-none group ${className}`}
      style={{
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.6), 0 0 10px rgba(244, 162, 97, 0.15)',
      }}
    >
      {/* Lớp ảnh mặt sau */}
      <Image
        src={`/cards/Backofthecard/${imgFileName}`}
        alt="Mặt sau lá bài Tarot"
        fill
        sizes="(max-width: 640px) 150px, 300px"
        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
          isOriginalRWS ? 'opacity-90 contrast-[1.02] brightness-95' : ''
        }`}
        priority
      />

      {/* Hiệu ứng hạt giấy cổ điển / antique texture overlay dành riêng cho bản gốc phân giải thấp */}
      {isOriginalRWS && (
        <div className="absolute inset-0 bg-[#f4ebd0]/5 mix-blend-overlay pointer-events-none" />
      )}

      {/* Khung viền chỉ vàng Ghibli tinh tế ở lớp phủ trên */}
      <div className="absolute inset-1.5 rounded-[10px] border border-gold-primary/30 pointer-events-none" />

      {/* Các góc trang trí cổ điển */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-gold-light/40 rounded-tl pointer-events-none" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-gold-light/40 rounded-tr pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-gold-light/40 rounded-bl pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-gold-light/40 rounded-br pointer-events-none" />

      {/* Hiệu ứng lấp lánh nhẹ huyền bí phủ lên */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-60 pointer-events-none" />
    </div>
  );
}
