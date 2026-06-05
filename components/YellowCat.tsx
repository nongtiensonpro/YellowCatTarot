'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  bodyVariants,
  headVariants,
  hatVariants,
  earLeftVariants,
  earRightVariants,
  tailVariants,
  bellVariants,
  whiskerLeftVariants,
  whiskerRightVariants,
  pawLeftVariants,
  pawRightVariants,
  crystalBallVariants,
  sparkleVariants,
} from './YellowCatAnimations';

export type YellowCatState = 'idle' | 'reading' | 'sleeping' | 'surprised' | 'happy' | 'shuffle';

interface YellowCatProps {
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

// Transition cấu hình cho mắt di chuyển mượt mà (eye tracking)
const pupilTransition = { type: 'spring' as const, stiffness: 120, damping: 14 };

export default function YellowCat({
  state,
  size = 'md',
  speechBubble,
  className = '',
  drawnCardsCount,
}: YellowCatProps) {
  const sizeClass = sizeMap[size];

  // Quản lý trạng thái local để kích hoạt phản ứng rút bài
  const [localState, setLocalState] = useState<YellowCatState>(state);
  const [showShockwave, setShowShockwave] = useState(false);
  const prevCardsCount = useRef<number | undefined>(drawnCardsCount);

  // Tọa độ pointer để làm eye tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Đồng bộ localState với prop state khi prop thay đổi bên ngoài
  useEffect(() => {
    setLocalState(state);
  }, [state]);

  // Xử lý sự kiện rút bài (khi drawnCardsCount tăng lên)
  useEffect(() => {
    if (
      drawnCardsCount !== undefined &&
      prevCardsCount.current !== undefined &&
      drawnCardsCount > prevCardsCount.current
    ) {
      // Nhảy nẩy mình ngạc nhiên và phát sóng ma thuật
      setLocalState('surprised');
      setShowShockwave(true);

      // Chuyển sang vui sướng (happy) sau 800ms
      const happyTimeout = setTimeout(() => {
        setLocalState('happy');

        // Quay lại trạng thái ban đầu sau 2 giây vui vẻ
        const revertTimeout = setTimeout(() => {
          setLocalState(state);
        }, 2000);

        return () => clearTimeout(revertTimeout);
      }, 800);

      return () => clearTimeout(happyTimeout);
    }
    prevCardsCount.current = drawnCardsCount;
  }, [drawnCardsCount, state]);

  // Lắng nghe di chuyển chuột để làm eye tracking (chỉ khi mèo đang idle)
  useEffect(() => {
    if (localState !== 'idle') return;

    const handleMouseMove = (e: MouseEvent) => {
      // Chuẩn hóa tọa độ chuột từ -1 đến 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [localState]);

  // Tính toán độ lệch con ngươi mắt (tối đa di chuyển trong tròng mắt là 4px ngang, 3px dọc)
  const pupilX = localState === 'idle' ? mousePos.x * 4 : 0;
  const pupilY = localState === 'idle' ? mousePos.y * 2.5 : 0;

  // Định nghĩa các biến phụ trợ để hiển thị chi tiết phù hợp
  const isSleeping = localState === 'sleeping';
  const isHappy = localState === 'happy';
  const isSurprised = localState === 'surprised';
  const isReading = localState === 'reading';
  const isShuffle = localState === 'shuffle';

  return (
    <div className={`flex flex-col items-center justify-center select-none relative ${className}`}>
      
      {/* SVG Mascot Mèo Vàng 2D */}
      <div className={`relative ${sizeClass} z-10 flex items-center justify-center`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
        >
          {/* Gradients và Filters */}
          <defs>
            <radialGradient id="crystal-gradient" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#d6bbfb" />
              <stop offset="50%" stopColor="#9b5de5" />
              <stop offset="100%" stopColor="#120c3a" />
            </radialGradient>
            
            <radialGradient id="bell-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff275" />
              <stop offset="60%" stopColor="#ffd166" />
              <stop offset="100%" stopColor="#e76f51" />
            </radialGradient>

            <filter id="glow-bell" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glow-eye" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="glow-crystal" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BÓNG DƯỚI ĐẤT */}
          <ellipse cx="100" cy="183" rx="58" ry="8" fill="black" fillOpacity="0.25" />

          {/* VÒNG SÓNG MA THUẬT (Rút bài phản ứng) */}
          <AnimatePresence>
            {showShockwave && (
              <motion.circle
                cx="100"
                cy="140"
                initial={{ r: 10, opacity: 0.8, strokeWidth: 6 }}
                animate={{ r: 85, opacity: 0, strokeWidth: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                fill="none"
                stroke="#ffd166"
                onAnimationComplete={() => setShowShockwave(false)}
              />
            )}
          </AnimatePresence>

          {/* HIỆU ỨNG ZZZ KHI NGỦ */}
          {isSleeping && (
            <g>
              <motion.text
                x="142" y="65"
                fill="#ffd166"
                className="text-xs font-sans font-bold"
                animate={{ y: [65, 45, 40], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
              >
                Z
              </motion.text>
              <motion.text
                x="156" y="52"
                fill="#ffd166"
                className="text-[9px] font-sans font-bold"
                animate={{ y: [52, 35, 30], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1, ease: "easeOut" }}
              >
                z
              </motion.text>
              <motion.text
                x="132" y="42"
                fill="#ffd166"
                className="text-[10px] font-sans font-bold"
                animate={{ y: [42, 25, 20], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, delay: 2, ease: "easeOut" }}
              >
                z
              </motion.text>
            </g>
          )}

          {/* HIỆU ỨNG CHẤM THAN KHI GIẬT MÌNH */}
          {isSurprised && (
            <motion.g
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="origin-bottom"
            >
              {/* Dấu chấm than trên đầu mũ */}
              <rect x="97" y="5" width="6" height="14" rx="3" fill="#ff4d6d" />
              <circle cx="100" cy="25" r="3.5" fill="#ff4d6d" />
              
              {/* Tia chớp giật mình 2 bên tai */}
              <path d="M38 32 L26 22 M162 32 L174 22" stroke="#ff4d6d" strokeWidth="2.5" strokeLinecap="round" />
            </motion.g>
          )}

          {/* HIỆU ỨNG LẤP LÁNH KHI HAPPY */}
          {isHappy && (
            <g>
              <motion.path d="M30 65 L33 68 L30 71 L27 68 Z" fill="#ffd166" variants={sparkleVariants} animate="animate" />
              <motion.path d="M170 65 L173 68 L170 71 L167 68 Z" fill="#ffd166" variants={sparkleVariants} animate="animate" transition={{ delay: 0.3 }} />
              <motion.path d="M55 25 L57 27 L55 29 L53 27 Z" fill="#ffd166" variants={sparkleVariants} animate="animate" transition={{ delay: 0.6 }} />
              <motion.path d="M145 25 L147 27 L145 29 L143 27 Z" fill="#ffd166" variants={sparkleVariants} animate="animate" transition={{ delay: 0.9 }} />
            </g>
          )}

          {/* ĐUÔI MÈO (Nằm dưới thân) */}
          <motion.g
            variants={tailVariants}
            animate={localState}
            style={{ originX: '135px', originY: '165px' }}
          >
            {/* Đuôi màu cam */}
            <path
              d="M135 165 C155 165, 175 150, 170 120 C167 105, 155 108, 158 118 C160 128, 148 148, 135 153 Z"
              fill="#f4a261"
            />
            {/* Sọc trên đuôi */}
            <path d="M152 143 C156 141, 161 143, 163 146" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M159 131 C163 129, 167 131, 169 134" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M163 119 C165 117, 169 118, 170 120" stroke="#e76f51" strokeWidth="2" strokeLinecap="round" fill="none" />
          </motion.g>

          {/* THÂN MÈO (Body) */}
          <motion.g
            variants={bodyVariants}
            animate={localState}
            style={{ originX: '100px', originY: '185px' }}
          >
            {/* Dáng ngồi/nằm */}
            <path
              d={
                isSleeping
                  ? "M100 85 C50 85, 42 120, 42 152 C42 176, 70 180, 100 180 C130 180, 158 176, 158 152 C158 120, 150 85, 100 85 Z"
                  : "M100 95 C62 95, 52 125, 52 165 C52 178, 68 181, 100 181 C132 181, 148 178, 148 165 C148 125, 138 95, 100 95 Z"
              }
              fill="#f4a261"
            />

            {/* Sọc vằn trên lưng mèo (Tabby Stripes) */}
            {!isSleeping && (
              <>
                {/* Sọc vai trái */}
                <path d="M53 135 Q65 137 70 133" stroke="#e76f51" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M54 147 Q63 148 67 145" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Sọc vai phải */}
                <path d="M147 135 Q135 137 130 133" stroke="#e76f51" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M146 147 Q137 148 133 145" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            )}

            {/* Lông ngực xù (Chest Fluff) */}
            <path
              d={
                isSleeping
                  ? "M100 110 C80 110, 72 125, 72 142 C72 158, 85 163, 100 163 C115 163, 128 158, 128 142 C128 125, 120 110, 100 110 Z"
                  : "M100 118 C82 118, 74 130, 74 154 C74 168, 86 170, 100 170 C114 170, 126 168, 126 154 C126 130, 118 118, 100 118 Z"
              }
              fill="#ffd166"
              fillOpacity="0.4"
            />
            {/* Lông ngực xù chi tiết bằng màu kem sáng */}
            {!isSleeping && (
              <path
                d="M100 120 C92 120, 88 126, 92 134 C94 137, 98 135, 100 142 C102 135, 106 137, 108 134 C112 126, 108 120, 100 120 Z"
                fill="#fffcf2"
                fillOpacity="0.8"
              />
            )}

            {/* CHÂN TRƯỚC (Paws) */}
            {/* Chân trái */}
            <motion.g
              variants={pawLeftVariants}
              animate={localState}
              className="origin-top"
            >
              {isHappy || isShuffle ? (
                // Chân giơ lên - Thấy đệm hồng
                <g>
                  {/* Cánh tay cam */}
                  <path d="M58 145 C54 130, 68 118, 72 126 C76 132, 68 145, 62 148 Z" fill="#f4a261" />
                  {/* Bàn chân tròn vàng */}
                  <circle cx="72" cy="125" r="9.5" fill="#ffd166" stroke="#f4a261" strokeWidth="1" />
                  {/* Đệm chân chính hồng đào */}
                  <ellipse cx="72" cy="126" rx="5" ry="4" fill="#ffb3b3" />
                  {/* 3 đệm ngón */}
                  <circle cx="66" cy="120" r="1.8" fill="#ffb3b3" />
                  <circle cx="72" cy="117" r="1.8" fill="#ffb3b3" />
                  <circle cx="78" cy="120" r="1.8" fill="#ffb3b3" />
                </g>
              ) : (
                // Chân nằm dưới đất
                <path
                  d={
                    isSleeping
                      ? "M68 165 C68 158, 78 158, 83 165 C85 170, 78 172, 68 172 Z"
                      : "M66 172 C66 166, 78 166, 83 172 C83 177, 76 179, 66 179 Z"
                  }
                  fill="#ffd166"
                />
              )}
            </motion.g>

            {/* Chân phải */}
            <motion.g
              variants={pawRightVariants}
              animate={localState}
              className="origin-top"
            >
              {isHappy || isShuffle ? (
                // Chân giơ lên - Thấy đệm hồng
                <g>
                  {/* Cánh tay cam */}
                  <path d="M142 145 C146 130, 132 118, 128 126 C124 132, 132 145, 138 148 Z" fill="#f4a261" />
                  {/* Bàn chân tròn vàng */}
                  <circle cx="128" cy="125" r="9.5" fill="#ffd166" stroke="#f4a261" strokeWidth="1" />
                  {/* Đệm chân chính hồng đào */}
                  <ellipse cx="128" cy="126" rx="5" ry="4" fill="#ffb3b3" />
                  {/* 3 đệm ngón */}
                  <circle cx="122" cy="120" r="1.8" fill="#ffb3b3" />
                  <circle cx="128" cy="117" r="1.8" fill="#ffb3b3" />
                  <circle cx="134" cy="120" r="1.8" fill="#ffb3b3" />
                </g>
              ) : (
                // Chân nằm dưới đất
                <path
                  d={
                    isSleeping
                      ? "M132 165 C132 158, 122 158, 117 165 C115 170, 122 172, 132 172 Z"
                      : "M134 172 C134 166, 122 166, 117 172 C117 177, 124 179, 134 179 Z"
                  }
                  fill="#ffd166"
                />
              )}
            </motion.g>

            {/* ĐẦU MÈO (Head) */}
            <motion.g
              variants={headVariants}
              animate={localState}
              style={{ originX: '100px', originY: '115px' }}
            >
              {/* TAI MÈO */}
              {/* Tai trái */}
              <motion.g
                variants={earLeftVariants}
                animate={localState}
                style={{ originX: '65px', originY: '60px' }}
              >
                {/* Vành tai cam */}
                <path d="M64 56 L38 18 L70 46 Z" fill="#f4a261" />
                {/* Lòng tai hồng */}
                <path d="M61 52 L44 24 L66 45 Z" fill="#e76f51" fillOpacity="0.7" />
              </motion.g>

              {/* Tai phải */}
              <motion.g
                variants={earRightVariants}
                animate={localState}
                style={{ originX: '135px', originY: '60px' }}
              >
                {/* Vành tai cam */}
                <path d="M136 56 L162 18 L130 46 Z" fill="#f4a261" />
                {/* Lòng tai hồng */}
                <path d="M139 52 L156 24 L134 45 Z" fill="#e76f51" fillOpacity="0.7" />
              </motion.g>

              {/* Mặt mèo tròn trịa */}
              <path
                d={
                  isSleeping
                    ? "M100 90 C65 90, 58 108, 58 128 C58 148, 78 154, 100 154 C122 154, 142 148, 142 128 C142 108, 135 90, 100 90 Z"
                    : "M100 48 C65 48, 58 68, 58 88 C58 108, 78 116, 100 116 C122 116, 142 108, 142 88 C142 68, 135 48, 100 48 Z"
                }
                fill="#ffd166"
              />

              {/* SỌC VẰN TABBY TRÊN ĐẦU (Forehead) */}
              {!isSleeping && (
                <g>
                  {/* Sọc trán chữ M */}
                  <path
                    d="M90 52 L95 62 L98 56 L100 64 L102 56 L105 62 L110 52"
                    stroke="#e76f51"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  {/* Hai sọc nhỏ bên trán */}
                  <path d="M82 58 L86 64" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M118 58 L114 64" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                  {/* Sọc má trái */}
                  <path d="M60 90 Q68 91 71 89" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M60 96 Q66 97 68 95" stroke="#e76f51" strokeWidth="2" strokeLinecap="round" fill="none" />
                  {/* Sọc má phải */}
                  <path d="M140 90 Q132 91 129 89" stroke="#e76f51" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M140 96 Q134 97 132 95" stroke="#e76f51" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              )}

              {/* MŨ PHÙ THỦY MINI (Wizard Hat) */}
              {!isSleeping && (
                <motion.g
                  variants={hatVariants}
                  animate={localState}
                  style={{ originX: '100px', originY: '48px' }}
                >
                  {/* Vành mũ tím */}
                  <path d="M65 48 C75 44, 125 44, 135 48 C140 50, 125 53, 100 53 C75 53, 60 50, 65 48 Z" fill="#7209b7" />
                  {/* Chóp mũ tím */}
                  <path d="M72 47 C74 32, 85 14, 102 8 C108 20, 118 32, 128 47 Z" fill="#560bad" />
                  {/* Đai mũ cam */}
                  <path d="M74 46 C80 43, 120 43, 126 46 L127 49 C121 46, 79 46, 73 49 Z" fill="#e76f51" />
                  {/* Ngôi sao vàng mini trên đai mũ */}
                  <path d="M100 41 L101.5 44 L104.5 44.5 L102 46.5 L103 49.5 L100 48 L97 49.5 L98 46.5 L95.5 44.5 L98.5 44 Z" fill="#ffd166" className="animate-pulse" />
                </motion.g>
              )}

              {/* MẮT MÈO (Eyes) */}
              {isSleeping ? (
                // Mắt nhắm khi ngủ
                <g>
                  <path d="M76 116 C79 120, 85 120, 88 116" stroke="#090916" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M112 116 C115 120, 121 120, 124 116" stroke="#090916" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
              ) : isHappy ? (
                // Mắt híp cười khi vui
                <g>
                  <path d="M74 86 C78 81, 84 81, 88 86" stroke="#090916" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M112 86 C116 81, 122 81, 126 86" stroke="#090916" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              ) : (
                // Mắt mở tròn (Idle, Surprised, Shuffle, Reading)
                <g>
                  {/* Mắt trái */}
                  <ellipse cx="80" cy="85" rx="10" ry={isSurprised ? "10" : "8.5"} fill="#090916" />
                  {/* Con ngươi + Phản sáng (Trái) */}
                  <motion.g
                    animate={{ x: pupilX, y: pupilY }}
                    transition={pupilTransition}
                  >
                    {isReading ? (
                      // Mắt phát sáng tím huyền bí khi reading
                      <>
                        <circle cx="80" cy="85" r="7.5" fill="#9b5de5" filter="url(#glow-eye)" />
                        <circle cx="80" cy="85" r="4.5" fill="#d6bbfb" />
                        <circle cx="77" cy="82" r="2" fill="white" />
                      </>
                    ) : (
                      // Mắt bình thường đen lóng lánh
                      <>
                        <circle cx="77.5" cy="82" r="3.2" fill="white" />
                        <circle cx="82.5" cy="87.5" r="1.5" fill="white" />
                      </>
                    )}
                  </motion.g>

                  {/* Mắt phải */}
                  <ellipse cx="120" cy="85" rx="10" ry={isSurprised ? "10" : "8.5"} fill="#090916" />
                  {/* Con ngươi + Phản sáng (Phải) */}
                  <motion.g
                    animate={{ x: pupilX, y: pupilY }}
                    transition={pupilTransition}
                  >
                    {isReading ? (
                      <>
                        <circle cx="120" cy="85" r="7.5" fill="#9b5de5" filter="url(#glow-eye)" />
                        <circle cx="120" cy="85" r="4.5" fill="#d6bbfb" />
                        <circle cx="117" cy="82" r="2" fill="white" />
                      </>
                    ) : (
                      <>
                        <circle cx="117.5" cy="82" r="3.2" fill="white" />
                        <circle cx="122.5" cy="87.5" r="1.5" fill="white" />
                      </>
                    )}
                  </motion.g>
                </g>
              )}

              {/* LÔNG MÀY BIỂU CẢM (Eyebrows) */}
              {!isSleeping && (
                <g>
                  {/* Lông mày trái */}
                  <motion.path
                    d="M70 73 Q80 70 88 74"
                    stroke="#e76f51"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    animate={
                      isSurprised
                        ? { y: -5, rotate: -10 }
                        : isReading
                        ? { y: 2, rotate: 12 }
                        : { y: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.3 }}
                  />
                  {/* Lông mày phải */}
                  <motion.path
                    d="M112 74 Q120 70 130 73"
                    stroke="#e76f51"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    animate={
                      isSurprised
                        ? { y: -5, rotate: 10 }
                        : isReading
                        ? { y: 2, rotate: -12 }
                        : { y: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.3 }}
                  />
                </g>
              )}

              {/* GÒ MÁ PHỒNG HỒNG (Cheek Puffs) */}
              <g>
                <motion.ellipse
                  cx="66"
                  cy={isSleeping ? "124" : "96"}
                  rx="7"
                  ry="4"
                  fill="#ff85a1"
                  fillOpacity="0.5"
                  animate={{ scale: isSleeping ? [1, 1.15, 1] : [1, 1.06, 1] }}
                  transition={{ duration: isSleeping ? 4.5 : 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.ellipse
                  cx="134"
                  cy={isSleeping ? "124" : "96"}
                  rx="7"
                  ry="4"
                  fill="#ff85a1"
                  fillOpacity="0.5"
                  animate={{ scale: isSleeping ? [1, 1.15, 1] : [1, 1.06, 1] }}
                  transition={{ duration: isSleeping ? 4.5 : 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </g>

              {/* MŨI MÈO (Nose) */}
              <polygon
                points={isSleeping ? "98,125 102,125 100,127.5" : "98,94 102,94 100,96.5"}
                fill="#e76f51"
              />

              {/* MIỆNG W-CURVE (Mouth) */}
              <path
                d={
                  isSleeping
                    ? "M96 130 C98 131, 100 131, 100 131 C100 131, 102 131, 104 130"
                    : isSurprised
                    ? "M96 100 Q100 108 104 100"
                    : "M94 100 C96 102, 98 102, 100 100 C102 102, 104 102, 106 100"
                }
                stroke="#090916"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill={isSurprised ? '#e76f51' : 'none'}
              />

              {/* RÂU MÈO (Whiskers) */}
              {/* Râu trái */}
              <motion.g variants={whiskerLeftVariants} animate={localState}>
                <path d={isSleeping ? "M53 128 L35 130 M53 133 L32 137" : "M53 93 L33 91 M53 97 L29 98 M53 101 L31 105"} stroke="#090916" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
              </motion.g>
              {/* Râu phải */}
              <motion.g variants={whiskerRightVariants} animate={localState}>
                <path d={isSleeping ? "M147 128 L165 130 M147 133 L168 137" : "M147 93 L167 91 M147 97 L171 98 M147 101 L169 105"} stroke="#090916" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
              </motion.g>

              {/* VÒNG CỔ & LỤC LẠC (Necklace & Magic Bell) */}
              {!isSleeping && (
                <g>
                  {/* Vòng cổ đỏ */}
                  <path d="M72 112 C72 112, 90 120, 100 120 C110 120, 128 112, 128 112" stroke="#e76f51" strokeWidth="3.5" strokeLinecap="round" />
                  
                  {/* Lục lạc lắc lư */}
                  <motion.g
                    variants={bellVariants}
                    animate={localState}
                    style={{ originX: '100px', originY: '120px' }}
                  >
                    {/* Quả chuông tròn vàng */}
                    <circle
                      cx="100"
                      cy="126"
                      r="7.5"
                      fill="url(#bell-gradient)"
                      stroke="#f4a261"
                      strokeWidth="0.8"
                      filter={isReading || isHappy ? "url(#glow-bell)" : undefined}
                    />
                    {/* Chi tiết rãnh chuông */}
                    <circle cx="100" cy="128" r="1.5" fill="#0d0d1a" />
                    <line x1="97" y1="126" x2="103" y2="126" stroke="#0d0d1a" strokeWidth="1" />
                  </motion.g>
                </g>
              )}
            </motion.g>
          </motion.g>

          {/* HIỆU ỨNG RÚT BÀI (Shuffle state - bài bay tung tóe) */}
          {isShuffle && (
            <g>
              {/* Lá bài bên trái 1 */}
              <motion.g
                initial={{ x: 55, y: 155, rotate: 0, opacity: 0 }}
                animate={{ x: [55, 30, 20, 50], y: [155, 130, 150, 155], rotate: [0, -45, -90, -180], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              >
                <rect x="-8" y="-12" width="16" height="24" rx="2" fill="#fff5eb" stroke="#9b5de5" strokeWidth="1.5" />
                <path d="M-3 -5 L3 5 M3 -5 L-3 5" stroke="#9b5de5" strokeWidth="1" />
              </motion.g>
              {/* Lá bài bên phải 1 */}
              <motion.g
                initial={{ x: 145, y: 155, rotate: 0, opacity: 0 }}
                animate={{ x: [145, 170, 180, 150], y: [155, 130, 150, 155], rotate: [0, 45, 90, 180], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4, ease: "linear" }}
              >
                <rect x="-8" y="-12" width="16" height="24" rx="2" fill="#fff5eb" stroke="#9b5de5" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="3" fill="#ffd166" />
              </motion.g>
              {/* Lá bài bay ở giữa */}
              <motion.g
                initial={{ x: 100, y: 160, rotate: 0, opacity: 0 }}
                animate={{ x: [100, 115, 85, 100], y: [160, 135, 120, 160], rotate: [0, 90, 270, 360], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.8, ease: "easeInOut" }}
              >
                <rect x="-6" y="-10" width="12" height="20" rx="1.5" fill="#fff5eb" stroke="#e76f51" strokeWidth="1" />
                <path d="M-2 0 H2" stroke="#e76f51" strokeWidth="1" />
              </motion.g>
            </g>
          )}

          {/* QUẢ CẦU PHA LÊ PHÁT SÁNG (Reading state) */}
          {isReading && (
            <motion.g
              variants={crystalBallVariants}
              animate="animate"
              className="origin-bottom"
            >
              {/* Đế quả cầu bằng vàng */}
              <path d="M86 181 H114 L109 170 H91 Z" fill="#ffd166" stroke="#e76f51" strokeWidth="1" />
              
              {/* Quả cầu pha lê */}
              <circle
                cx="100"
                cy="162"
                r="19"
                fill="url(#crystal-gradient)"
                stroke="#ffd166"
                strokeWidth="1.2"
                filter="url(#glow-crystal)"
              />
              {/* Điểm bóng sáng trên quả cầu */}
              <circle cx="94" cy="154" r="5" fill="white" fillOpacity="0.4" />
              <circle cx="91" cy="157" r="2" fill="white" fillOpacity="0.3" />
            </motion.g>
          )}
        </svg>
      </div>

      {/* Bong bóng thoại - Nằm bên dưới mascot rất cân đối */}
      {speechBubble && (
        <div className="relative max-w-[240px] md:max-w-[280px] mt-2 animate-[fadeIn_0.3s_ease-out] z-20">
          {/* Mũi nhọn chỉ lên phía mèo */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-surface border-l border-t border-gold-primary/30 rotate-45 z-10" />
          
          {/* Nội dung bong bóng */}
          <div className="bg-bg-surface border border-gold-primary/30 rounded-2xl px-4 py-2.5 shadow-2xl">
            <p className="text-xs md:text-sm font-lora text-text-primary text-center leading-relaxed">
              {speechBubble}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
