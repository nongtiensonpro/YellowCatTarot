'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useWebGLSupport } from '../lib/useWebGLSupport';
import YellowCatSVG from './YellowCat';
import { CatModel } from './three/CatModel';
import { MagicParticles } from './three/MagicParticles';

export type YellowCatState = 'idle' | 'reading' | 'sleeping' | 'surprised' | 'happy' | 'shuffle';

interface YellowCat3DProps {
  state: YellowCatState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  speechBubble?: string;
  className?: string;
  drawnCardsCount?: number;
}

const sizeMap = {
  sm: 'w-[48px] h-[48px]',
  md: 'w-[120px] h-[120px]',
  lg: 'w-[180px] h-[180px]',
  hero: 'w-[260px] h-[260px] md:w-[320px] md:h-[320px]',
};

// Chiều rộng tối đa bong bóng thoại phù hợp từng kích cỡ mèo
const bubbleMaxWidthMap = {
  sm: 'max-w-[160px]',
  md: 'max-w-[220px]',
  lg: 'max-w-[260px] md:max-w-[280px]',
  hero: 'max-w-[300px] md:max-w-[340px]',
};

export default function YellowCat3D({
  state,
  size = 'md',
  speechBubble,
  className = '',
  drawnCardsCount = 0,
}: YellowCat3DProps) {
  const [mounted, setMounted] = useState(false);
  const isWebGLSupported = useWebGLSupport();

  // Đảm bảo mount phía client để tránh hydration mismatch (lỗi SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Nếu chưa mount (phía server) hoặc trình duyệt không hỗ trợ WebGL -> FALLBACK sang SVG cũ
  if (!mounted || !isWebGLSupported) {
    return (
      <YellowCatSVG
        state={state}
        size={size}
        speechBubble={speechBubble}
        className={className}
      />
    );
  }

  const sizeClass = sizeMap[size];
  const bubbleMaxWidth = bubbleMaxWidthMap[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>

      {/* 3D CANVAS FRAME — Mèo Vàng luôn hiển thị trọn vẹn ở trên cùng */}
      <div className={`relative ${sizeClass} z-10 flex items-center justify-center flex-shrink-0`}>
        {/* Lớp bóng đổ mềm dưới sàn */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[75%] h-[10%] bg-black/35 rounded-full blur-sm -z-10 pointer-events-none" />

        <Canvas
          shadows="percentage"
          camera={{ position: [0, 0.1, 2.1], fov: 40 }}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          dpr={[1, 2]}
          className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
        >
          {/* Hệ thống ánh sáng Studio chuyên nghiệp */}
          <ambientLight intensity={1.4} color="#ffe8b5" />
          
          <directionalLight
            position={[4, 5, 3]}
            intensity={1.5}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
            shadow-bias={-0.001}
          />
          
          <directionalLight
            position={[-3, -1, 1]}
            intensity={0.6}
            color="#9b5de5"
          />

          <directionalLight
            position={[0, -3, 0]}
            intensity={0.2}
            color="#f4a261"
          />

          {/* Render Mô hình Mèo 3D & Hạt bụi ma thuật */}
          <Suspense fallback={null}>
            <group position={[0, -0.2, 0]}>
              <CatModel state={state} drawnCardsCount={drawnCardsCount} />
              <MagicParticles state={state} />
            </group>
          </Suspense>
        </Canvas>
      </div>

      {/* Bong bóng thoại Ghibli — nằm BÊN DƯỚI mô hình mèo, không bao giờ che mèo */}
      {speechBubble && (
        <div className={`relative ${bubbleMaxWidth} mt-2 animate-[fadeIn_0.3s_ease-out] z-20`}>
          {/* Mũi nhọn chỉ lên phía mèo */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-surface border-l border-t border-gold-primary/30 rotate-45 z-10" />
          
          {/* Nội dung bong bóng */}
          <div className="bg-bg-surface border border-gold-primary/30 rounded-2xl px-4 py-2.5 shadow-2xl">
            <p className="text-xs md:text-sm font-lora text-text-primary text-center leading-relaxed">{speechBubble}</p>
          </div>
        </div>
      )}
    </div>
  );
}
