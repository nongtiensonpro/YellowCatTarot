'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
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
import {
  getOrInitPersonality,
  incrementPersonalityStat,
  recordCardDraw,
  checkComfortingNeeded,
  checkReunion,
  Personality,
  getLevel,
  getOrInitGamification,
  saveGamificationState,
  updateGamification,
  GamificationState
} from './YellowCatMoodMemory';

export type YellowCatState =
  | 'idle'
  | 'reading'
  | 'sleeping'
  | 'surprised'
  | 'happy'
  | 'shuffle'
  | 'curious'
  | 'mischievous'
  | 'solemn'
  | 'contemplative'
  | 'drowsy'
  | 'focused';

interface YellowCatProps {
  state: YellowCatState;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  speechBubble?: string;
  className?: string;
  drawnCardsCount?: number;
  showControls?: boolean;
  // ── HOÀNG KIM: Thông tin lá bài hiện tại để kích hoạt trí tuệ Tarot ──
  currentCard?: {
    slug: string;
    arcana: 'major' | 'minor';
    suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
    isReversed?: boolean;
    positionIndex?: number; // Vị trí lá bài (ví dụ: 0: Quá khứ, 1: Hiện tại, 2: Tương lai)
  };
  // Bối cảnh trải bài để mèo phản ứng (Celtic Cross đội vương miện, 3-Card liếc mắt...)
  spreadContext?: 'single' | 'three-card' | 'celtic-cross' | 'interactive' | 'free';
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
  currentCard,
  spreadContext,
  showControls = false,
}: YellowCatProps) {
  const sizeClass = sizeMap[size];

  // Quản lý trạng thái local để kích hoạt phản ứng rút bài
  const [localState, setLocalState] = useState<YellowCatState>(state);
  const [showShockwave, setShowShockwave] = useState(false);
  const prevCardsCount = useRef<number | undefined>(drawnCardsCount);

  // Tọa độ pointer để làm eye tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── HOÀNG KIM: Hệ thống ánh sáng viền Rim Light theo thời gian thực ──
  const [rimColor, setRimColor] = useState('#ffd166'); // Mặc định vàng gold
  const [ambientThemeName, setAmbientThemeName] = useState('Ngày');

  // ── HOÀNG KIM: Nhận biết mùa thực tế để đổi trang phục & hạt bay ──
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  const [ambientParticles, setAmbientParticles] = useState<{ id: number; delay: number; x: number }[]>([]);

  // ── HOÀNG KIM: Các hạt nguyên tố bộ ẩn phụ (Cups, Wands, Swords, Pentacles) ──
  const [suitParticles, setSuitParticles] = useState<{ id: number; delay: number; x: number }[]>([]);

  // ── HOÀNG KIM GIAI ĐOẠN 3 & 4: Thiết lập cá tính, tương tác cử chỉ & bong bóng thoại & Gamification ──
  const [personality, setPersonality] = useState<Personality>({
    curiosity: 50,
    mysticism: 50,
    playfulness: 50,
    wisdom: 50,
  });
  const [interactionState, setInteractionState] = useState<'none' | 'stroked' | 'poked' | 'hat-dropped'>('none');
  const [localSpeechBubble, setLocalSpeechBubble] = useState<string | undefined>(speechBubble);
  
  const [gamification, setGamification] = useState<GamificationState>({
    bondPoints: 0,
    hunger: 100,
    lastSavedTime: Date.now(),
    activeForm: 'yellow',
    activeGlasses: false,
    activeBowTie: false,
  });
  const [isClient, setIsClient] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [reduceMotionSetting, setReduceMotionSetting] = useState(false);

  const strokeDistance = useRef(0);
  const lastPointerX = useRef<number | null>(null);
  const lastPointerY = useRef<number | null>(null);
  const isPointerDownOnHead = useRef(false);

  const lastHatClickTime = useRef(0);

  const ambientNodes = useRef<{
    ctx: AudioContext | null;
    osc1: OscillatorNode | null;
    osc2: OscillatorNode | null;
    gain: GainNode | null;
    filter: BiquadFilterNode | null;
  }>({ ctx: null, osc1: null, osc2: null, gain: null, filter: null });

  // Đồng bộ speechBubble prop
  useEffect(() => {
    setLocalSpeechBubble(speechBubble);
  }, [speechBubble]);

  // Nhận diện Reduced Motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReduceMotionSetting(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReduceMotionSetting(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Trí tuệ cá tính & Hội ngộ/An ủi khi nạp trang
  useEffect(() => {
    setIsClient(true);
    const p = getOrInitPersonality();
    setPersonality(p);
    
    const g = getOrInitGamification();
    setGamification(g);

    const { isReunion, daysPassed } = checkReunion();
    if (isReunion) {
      setInteractionState('none');
      setLocalState('happy');
      setLocalSpeechBubble(`Quý nhân ơi! Đã hơn ${Math.floor(daysPassed)} ngày rồi Mèo Vàng mới được gặp lại quý nhân... Em nhớ quý nhân khôn xiết! 🐱💖`);
      
      const timer = setTimeout(() => {
        setLocalState(state);
        setLocalSpeechBubble(speechBubble);
      }, 5000);
      return () => clearTimeout(timer);
    }

    if (checkComfortingNeeded()) {
      setLocalState('solemn');
      setLocalSpeechBubble("Mèo Vàng cảm thấy năng lượng của quý nhân đang trĩu nặng... Để em ôm an ủi quý nhân một cái thật ấm áp nhé 🐾🕯️");
    }
  }, []);

  // 定 kỳ mỗi 5 phút kiểm tra và cập nhật độ đói hao hụt theo thời gian thực
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = setInterval(() => {
      const g = getOrInitGamification();
      setGamification(g);
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Theo dõi rút bài ghi nhận LocalStorage & Cộng điểm Gamification
  useEffect(() => {
    if (currentCard) {
      const { comfortMode } = recordCardDraw(currentCard.slug, currentCard.isReversed || false);
      if (comfortMode) {
        setLocalState('solemn');
        setLocalSpeechBubble("Mèo Vàng ở đây ôm quý nhân một cái thật ấm áp nhé... Đừng lo lắng, sóng gió nào rồi cũng sẽ qua thôi 🐾🕯️");
      }
      setPersonality(getOrInitPersonality());

      // Cộng điểm Gamification khi rút bài (+5 bondPoints, +40 hunger)
      const { state: updatedG, isLevelUp, newLevel } = updateGamification(5, 40);
      setGamification(updatedG);
      if (isLevelUp) {
        setLocalSpeechBubble(`🌟 CHÚC MỪNG! Mèo Vàng đã thăng lên Cấp ${newLevel} thân thiết! Hãy xem phụ kiện mới nhé 💖🎉`);
        setShowShockwave(true);
        playChimeSound();
      }
    }
  }, [currentCard]);

  // Thiết lập Audio Ambient thích ứng
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isMuted) {
      if (ambientNodes.current.gain) {
        ambientNodes.current.gain.gain.setValueAtTime(ambientNodes.current.gain.gain.value, ambientNodes.current.ctx!.currentTime);
        ambientNodes.current.gain.gain.exponentialRampToValueAtTime(0.001, ambientNodes.current.ctx!.currentTime + 0.5);
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      let ctx = ambientNodes.current.ctx;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioContextClass();
        ambientNodes.current.ctx = ctx;
      }
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      let gain = ambientNodes.current.gain;
      if (!gain) {
        gain = ctx.createGain();
        gain.connect(ctx.destination);
        ambientNodes.current.gain = gain;
      }

      let filter = ambientNodes.current.filter;
      if (!filter) {
        filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.connect(gain);
        ambientNodes.current.filter = filter;
      }

      let osc1 = ambientNodes.current.osc1;
      if (!osc1) {
        osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(146.83, ctx.currentTime);
        osc1.connect(filter);
        osc1.start();
        ambientNodes.current.osc1 = osc1;
      }

      let osc2 = ambientNodes.current.osc2;
      if (!osc2) {
        osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(220.00, ctx.currentTime);
        osc2.connect(filter);
        osc2.start();
        ambientNodes.current.osc2 = osc2;
      }

      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.035, ctx.currentTime + 0.8);
    } catch (e) {}
  }, [isMuted]);

  // Thay đổi tần số nhạc nền ambient theo trạng thái
  useEffect(() => {
    if (isMuted || !ambientNodes.current.ctx) return;
    const ctx = ambientNodes.current.ctx;
    const osc1 = ambientNodes.current.osc1;
    const osc2 = ambientNodes.current.osc2;
    const filter = ambientNodes.current.filter;

    if (!osc1 || !osc2 || !filter) return;

    if (localState === 'reading') {
      osc1.frequency.exponentialRampToValueAtTime(98.00, ctx.currentTime + 1.2);
      osc2.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 1.2);
    } else if (localState === 'sleeping') {
      osc1.frequency.exponentialRampToValueAtTime(73.42, ctx.currentTime + 1.5);
      osc2.frequency.exponentialRampToValueAtTime(110.00, ctx.currentTime + 1.5);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 1.5);
    } else if (localState === 'happy') {
      osc1.frequency.exponentialRampToValueAtTime(164.81, ctx.currentTime + 1.0);
      osc2.frequency.exponentialRampToValueAtTime(246.94, ctx.currentTime + 1.0);
      filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 1.0);
    } else {
      osc1.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 1.0);
      osc2.frequency.exponentialRampToValueAtTime(220.00, ctx.currentTime + 1.0);
      filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.0);
    }
  }, [localState, isMuted]);

  // Dọn dẹp AudioNodes khi unmount
  useEffect(() => {
    return () => {
      const nodes = ambientNodes.current;
      if (nodes.osc1) { try { nodes.osc1.stop(); } catch(e){} }
      if (nodes.osc2) { try { nodes.osc2.stop(); } catch(e){} }
      if (nodes.ctx) { try { nodes.ctx.close(); } catch(e){} }
    };
  }, []);

  // Nhàn rỗi tự nhúc nhích dựa trên độ nghịch ngợm playfulness
  useEffect(() => {
    if (localState !== 'idle' || interactionState !== 'none') return;
    const intervalSec = Math.max(6000, 16000 - (personality.playfulness / 100) * 10000);

    const interval = setInterval(() => {
      if (Math.random() < 0.45) {
        const playfulStates: YellowCatState[] = ['curious', 'mischievous', 'contemplative'];
        const randomState = playfulStates[Math.floor(Math.random() * playfulStates.length)];
        
        setLocalState(randomState);
        setTimeout(() => {
          setLocalState(state);
        }, 1800);
      }
    }, intervalSec);

    return () => clearInterval(interval);
  }, [localState, interactionState, personality.playfulness, state]);

  // Âm thanh Web Audio tổng hợp
  const playPurrSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(28, ctx.currentTime);
      
      const modulator = ctx.createOscillator();
      modulator.frequency.setValueAtTime(6, ctx.currentTime);
      
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(8, ctx.currentTime);
      
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.3);
      mainGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
      
      modulator.connect(modGain);
      modGain.connect(osc.frequency);
      osc.connect(mainGain);
      mainGain.connect(ctx.destination);
      
      modulator.start();
      osc.start();
      modulator.stop(ctx.currentTime + 2.0);
      osc.stop(ctx.currentTime + 2.0);
    } catch (e) {}
  };

  const playPokeSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  const playChimeSound = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const freqs = [880, 1109, 1318, 1661];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        const startTime = ctx.currentTime + idx * 0.04;
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.8);
      });
    } catch (e) {}
  };

  // Cử chỉ tương tác
  const handlePointerDownHead = (e: React.PointerEvent) => {
    isPointerDownOnHead.current = true;
    strokeDistance.current = 0;
    lastPointerX.current = e.clientX;
    lastPointerY.current = e.clientY;
  };

  const handlePointerMoveHead = (e: React.PointerEvent) => {
    if (!isPointerDownOnHead.current || lastPointerX.current === null || lastPointerY.current === null) return;
    const dx = Math.abs(e.clientX - lastPointerX.current);
    const dy = Math.abs(e.clientY - lastPointerY.current);
    strokeDistance.current += dx + dy;
    lastPointerX.current = e.clientX;
    lastPointerY.current = e.clientY;

    if (strokeDistance.current > 75 && interactionState === 'none') {
      triggerStroke();
    }
  };

  const triggerStroke = () => {
    setInteractionState('stroked');
    playPurrSound();
    incrementPersonalityStat('playfulness', 1);
    setPersonality(getOrInitPersonality());

    // Cập nhật điểm thân thiết (+2) và độ đói (+15)
    const { state: updatedG, isLevelUp, newLevel } = updateGamification(2, 15);
    setGamification(updatedG);

    if (isLevelUp) {
      setLocalSpeechBubble(`🌟 CHÚC MỪNG! Mèo Vàng đã thăng lên Cấp ${newLevel} thân thiết! 🎉`);
      setShowShockwave(true);
      playChimeSound();
    } else {
      setLocalSpeechBubble("Ưm... dễ chịu quá đi... gừ gừ... 🥰🐾");
    }

    setTimeout(() => {
      setInteractionState('none');
      setLocalSpeechBubble(speechBubble);
    }, 2500);
  };

  const triggerPoke = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (interactionState !== 'none') return;
    setInteractionState('poked');
    playPokeSound();
    incrementPersonalityStat('curiosity', 1);
    setPersonality(getOrInitPersonality());

    const { state: updatedG, isLevelUp, newLevel } = updateGamification(1, 0);
    setGamification(updatedG);

    if (isLevelUp) {
      setLocalSpeechBubble(`🌟 CHÚC MỪNG! Mèo Vàng đã thăng lên Cấp ${newLevel} thân thiết! 🎉`);
      setShowShockwave(true);
      playChimeSound();
    } else {
      setLocalSpeechBubble("Ư... nhột quá nghen! Đừng chọc bụng em chứ! 🐾😿");
    }

    setTimeout(() => {
      setInteractionState('none');
      setLocalSpeechBubble(speechBubble);
    }, 2300);
  };

  const handleHatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastHatClickTime.current < 300) {
      triggerHatDrop();
    }
    lastHatClickTime.current = now;
  };

  const triggerHatDrop = () => {
    setInteractionState('hat-dropped');
    playChimeSound();
    incrementPersonalityStat('mysticism', 1);
    setPersonality(getOrInitPersonality());

    const { state: updatedG, isLevelUp, newLevel } = updateGamification(1, 0);
    setGamification(updatedG);

    if (isLevelUp) {
      setLocalSpeechBubble(`🌟 CHÚC MỪNG! Mèo Vàng đã thăng lên Cấp ${newLevel} thân thiết! 🎉`);
      setShowShockwave(true);
      playChimeSound();
    } else {
      setLocalSpeechBubble("Ối! Chiếc mũ của em rơi mất rồi... 🎩🙀");
    }

    setTimeout(() => {
      setInteractionState('none');
      setLocalSpeechBubble(speechBubble);
    }, 3000);
  };

  const handleFeed = () => {
    if (gamification.hunger >= 100) {
      setLocalSpeechBubble("Mèo Vàng no căng bụng rồi quý nhân ơi! Cảm ơn thịnh tình của quý nhân 🐾🐟");
      return;
    }
    const { state: updatedG } = updateGamification(2, 35);
    setGamification(updatedG);
    playPurrSound();
    setInteractionState('stroked');
    setLocalSpeechBubble("Ngoàm ngoàm... Cá nướng thơm quá! Cảm ơn quý nhân thương yêu... 🐟😻");
    
    setTimeout(() => {
      setInteractionState('none');
      setLocalSpeechBubble(speechBubble);
    }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;
    if (key === ' ') {
      e.preventDefault();
      triggerStroke();
    } else if (key === 'f' || key === 'F') {
      e.preventDefault();
      handleFeed();
    } else if (['1', '2', '3', '4', '5', '6'].includes(key)) {
      e.preventDefault();
      const moods: YellowCatState[] = ['idle', 'reading', 'sleeping', 'surprised', 'happy', 'focused'];
      const index = parseInt(key, 10) - 1;
      setLocalState(moods[index]);
    }
  };

  const getWisdomModifiedBubble = (text: string | undefined) => {
    if (!text) return text;
    if (personality.wisdom > 65 && !text.includes('🌌') && !text.includes('🧘‍♂️') && text.length > 20) {
      const wisdomSuffixes = [
        " Vũ trụ đang dịch chuyển theo ý chí lành quý nhân... 🌌",
        " Vạn sự tùy duyên, tâm tĩnh ắt huệ tự sinh... 🧘‍♂️",
        " Lắng nghe tiếng vọng từ tiềm thức thẳm sâu... 🕯️",
        " Mỗi ngã rẽ đều chứa đựng một bài học giác ngộ... 🍂",
      ];
      const index = Math.floor((text.length) % wisdomSuffixes.length);
      return text + wisdomSuffixes[index];
    }
    return text;
  };

  useEffect(() => {
    // 1. Cập nhật Rim Light
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 10) {
      setRimColor('#ffe5a3'); // Bình minh: vàng ấm dịu
      setAmbientThemeName('Bình minh');
    } else if (hour >= 10 && hour < 17) {
      setRimColor('#ffffff'); // Ngày: ánh sáng trắng trong trẻo
      setAmbientThemeName('Ngày');
    } else if (hour >= 17 && hour < 22) {
      setRimColor('#f4a261'); // Hoàng hôn: cam đỏ ấm áp
      setAmbientThemeName('Hoàng hôn');
    } else {
      setRimColor('#9b5de5'); // Đêm: tím neon huyền bí
      setAmbientThemeName('Đêm');
    }

    // 2. Cập nhật mùa (0 = Tháng 1, 11 = Tháng 12)
    const month = new Date().getMonth();
    if (month >= 1 && month <= 3) {
      setSeason('spring'); // Tháng 2, 3, 4: Xuân
    } else if (month >= 4 && month <= 6) {
      setSeason('summer'); // Tháng 5, 6, 7: Hạ
    } else if (month >= 7 && month <= 9) {
      setSeason('autumn'); // Tháng 8, 9, 10: Thu
    } else {
      setSeason('winter'); // Tháng 11, 12, 1: Đông
    }

    // 3. Khởi tạo danh sách hạt ngẫu nhiên bay nền
    setAmbientParticles(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        delay: i * 1.3,
        x: 25 + Math.random() * 150,
      }))
    );
  }, []);

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

  // Kích hoạt hạt nguyên tố khi nhận được currentCard mới
  useEffect(() => {
    if (currentCard && currentCard.arcana === 'minor' && currentCard.suit) {
      setSuitParticles(
        Array.from({ length: 5 }, (_, i) => ({
          id: i,
          delay: i * 0.4,
          x: 40 + Math.random() * 120,
        }))
      );
    } else {
      setSuitParticles([]);
    }
  }, [currentCard]);

  // ── HOÀNG KIM: Xác định màu lông phủ theo dominant color của lá bài ──
  let cardThemeColor = 'transparent';
  if (currentCard) {
    const slug = currentCard.slug;
    if (slug === 'the-sun') {
      cardThemeColor = '#fb8500'; // Cam vàng rực rỡ
    } else if (slug === 'the-moon') {
      cardThemeColor = '#219ebc'; // Xanh ngọc bạc mát lạnh
    } else if (slug === 'the-star') {
      cardThemeColor = '#0096c7'; // Xanh lam thẫm rạng rỡ
    } else if (slug === 'death') {
      cardThemeColor = '#4f5d75'; // Xám tím u tối
    } else if (slug === 'the-tower') {
      cardThemeColor = '#ef233c'; // Đỏ lửa sụp đổ
    } else if (slug === 'the-lovers') {
      cardThemeColor = '#ff85a1'; // Hồng ngọt ngào tình nhân
    } else if (slug === 'the-hermit') {
      cardThemeColor = '#d4a373'; // Nâu đất trầm cô độc
    } else if (currentCard.arcana === 'minor' && currentCard.suit) {
      // Tông màu ẩn phụ
      const suit = currentCard.suit;
      if (suit === 'cups') cardThemeColor = '#48cae4';
      if (suit === 'wands') cardThemeColor = '#fb8500';
      if (suit === 'swords') cardThemeColor = '#bde0fe';
      if (suit === 'pentacles') cardThemeColor = '#ffd166';
    }
  }

  const isShadowForm = gamification?.activeForm === 'shadow';
  const isOracleForm = gamification?.activeForm === 'oracle';
  const catBodyColor = isShadowForm ? '#2f3e46' : isOracleForm ? '#f8f9fa' : '#f4a261';
  const catHeadColor = isShadowForm ? '#354f52' : isOracleForm ? '#e2f2fe' : '#ffd166';
  const catCollarColor = isShadowForm ? '#ffd166' : isOracleForm ? '#457b9d' : '#e76f51';
  const catStripeColor = isShadowForm ? '#1a252c' : isOracleForm ? '#d0e3ff' : '#e76f51';
  const catChestFurColor = isShadowForm ? '#bde0fe' : isOracleForm ? '#e0f2fe' : '#ffd166';
  const catInnerEarColor = isShadowForm ? '#7209b7' : isOracleForm ? '#bde0fe' : '#e76f51';
  const catEyeColor = isShadowForm ? '#06d6a0' : '#090916';

  // Tính toán độ lệch con ngươi mắt
  let pupilX = 0;
  let pupilY = 0;

  // ── HOÀNG KIM: Thấu hiểu bối cảnh trải bài 3 lá để liếc mắt trái/giữa/phải ──
  if (spreadContext === 'three-card' && currentCard && currentCard.positionIndex !== undefined) {
    const posIdx = currentCard.positionIndex;
    if (posIdx === 0) {
      pupilX = -3.5; // Liếc trái (Quá khứ)
      pupilY = 0;
    } else if (posIdx === 1) {
      pupilX = 0; // Nhìn thẳng (Hiện tại)
      pupilY = 0;
    } else if (posIdx === 2) {
      pupilX = 3.5; // Liếc phải (Tương lai)
      pupilY = 0;
    }
  } else if (localState === 'idle') {
    const curAmp = 1 + (personality.curiosity / 100) * 1.5;
    pupilX = mousePos.x * 4 * curAmp;
    pupilY = mousePos.y * 2.5 * curAmp;
  } else if (localState === 'solemn' || currentCard?.slug === 'death') {
    pupilY = 3.2; // Cúi nhìn xuống u sầu
  } else if (localState === 'focused') {
    pupilX = -3.5; // Liếc nhìn sang trái
    pupilY = 1.5;
  }

  // Định nghĩa trạng thái hoạt ảnh active (bao gồm cả đè từ tương tác)
  const activeAnimateState = interactionState !== 'none' ? interactionState : localState;

  // Định nghĩa các trạng thái
  const isSleeping = activeAnimateState === 'sleeping';
  const isHappy = activeAnimateState === 'happy' || activeAnimateState === 'stroked';
  const isSurprised = activeAnimateState === 'surprised' || activeAnimateState === 'hat-dropped';
  const isReading = activeAnimateState === 'reading';
  const isShuffle = activeAnimateState === 'shuffle';

  // 6 trạng thái cảm xúc mới
  const isCurious = activeAnimateState === 'curious';
  const isMischievous = activeAnimateState === 'mischievous' || activeAnimateState === 'poked';
  const isSolemn = activeAnimateState === 'solemn';
  const isContemplative = activeAnimateState === 'contemplative';
  const isDrowsy = activeAnimateState === 'drowsy';
  const isFocused = activeAnimateState === 'focused';

  // Kiểm tra lá bài ẩn chính đặc thù
  const isTheHermit = currentCard?.slug === 'the-hermit';
  const isTheLovers = currentCard?.slug === 'the-lovers';
  const isTheDevil = currentCard?.slug === 'the-devil';
  const isTheTower = currentCard?.slug === 'the-tower';
  const isTheFool = currentCard?.slug === 'the-fool';

  return (
    <div 
      className={`flex flex-col items-center justify-center select-none relative ${className} outline-none focus:outline-none rounded-3xl p-2`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Mèo Vàng Tarot Mascot. Sử dụng phím khoảng trắng để vuốt ve, phím F để cho ăn, các phím từ 1 đến 6 để thay đổi biểu cảm."
    >
      <MotionConfig reducedMotion={reduceMotionSetting ? "always" : "never"}>
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

            <filter id="glow-rim-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" />
            </filter>

            {/* ── HOÀNG KIM: Bộ lọc lay động gió feTurbulence ── */}
            <filter id="wind-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="1" result="noise" />
              <motion.feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                animate={{ scale: [1.5, 3.2, 1.5] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            {/* Gradient xoáy của mắt tâm linh (Reading) */}
            <radialGradient id="reading-eye-gradient" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
              <stop offset="0%" stopColor="#fff275" />
              <stop offset="50%" stopColor="#9b5de5" />
              <stop offset="100%" stopColor="#090916" />
            </radialGradient>

            <radialGradient id="shadow-bell-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#bde0fe" />
              <stop offset="60%" stopColor="#7209b7" />
              <stop offset="100%" stopColor="#3a0ca3" />
            </radialGradient>

            <radialGradient id="oracle-bell-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#457b9d" />
              <stop offset="100%" stopColor="#1d3557" />
            </radialGradient>
          </defs>

          {/* BÓNG DƯỚI ĐẤT */}
          <ellipse cx="100" cy="183" rx="58" ry="8" fill="black" fillOpacity="0.25" />

          {/* Rim Light phát sáng viền đổi màu thực tế */}
          <circle cx="100" cy="110" r="72" fill={rimColor} opacity={0.08 + (personality.mysticism / 100) * 0.12} filter="url(#glow-rim-blur)" />

          {/* ── HOÀNG KIM: Cánh dơi đặc thù của lá bài The Devil ── */}
          {isTheDevil && (
            <g>
              {/* Cánh trái */}
              <motion.path
                d="M45 110 C20 100, 15 125, 25 140 C28 135, 33 135, 36 140 C39 130, 43 120, 45 110 Z"
                fill="#3a0ca3"
                stroke="#090916"
                strokeWidth="1.5"
                animate={{ rotate: [-5, 8, -5], y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ originX: "45px", originY: "110px" }}
              />
              {/* Cánh phải */}
              <motion.path
                d="M155 110 C180 100, 185 125, 175 140 C172 135, 167 135, 164 140 C161 130, 157 120, 155 110 Z"
                fill="#3a0ca3"
                stroke="#090916"
                strokeWidth="1.5"
                animate={{ rotate: [5, -8, 5], y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
                style={{ originX: "155px", originY: "110px" }}
              />
            </g>
          )}

          {/* Các hạt môi trường bay động theo mùa */}
          {ambientParticles.map((p) => {
            if (season === 'spring') {
              return (
                <motion.path
                  key={p.id}
                  d="M0 0 C-2 2, -3 2, -2 4 C-1 3, 1 3, 0 0 Z"
                  fill="#ffb3c1"
                  initial={{ x: p.x, y: 10, opacity: 0, scale: 0.8 }}
                  animate={{
                    y: 190,
                    x: p.x + (p.id % 2 === 0 ? 25 : -25),
                    rotate: 360,
                    opacity: [0, 0.7, 0.7, 0]
                  }}
                  transition={{
                    duration: 7.5,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "linear"
                  }}
                />
              );
            } else if (season === 'summer') {
              return (
                <motion.circle
                  key={p.id}
                  r="2.5"
                  fill="#fff275"
                  filter="url(#glow-bell)"
                  initial={{ cx: p.x, cy: 190, opacity: 0 }}
                  animate={{
                    cy: 20,
                    cx: p.x + (p.id % 2 === 0 ? 30 : -30),
                    opacity: [0, 0.8, 0.8, 0]
                  }}
                  transition={{
                    duration: 8.5,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeInOut"
                  }}
                />
              );
            } else if (season === 'autumn') {
              return (
                <motion.path
                  key={p.id}
                  d="M0 -3 L2 1 L5 0 L2 3 L3 6 L0 4 L-3 6 L-2 3 L-5 0 L-2 1 Z"
                  fill="#e76f51"
                  initial={{ x: p.x, y: 10, opacity: 0, rotate: 0 }}
                  animate={{
                    y: 190,
                    x: p.x + (p.id % 2 === 0 ? 20 : -20),
                    rotate: 180,
                    opacity: [0, 0.6, 0.6, 0]
                  }}
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "linear"
                  }}
                />
              );
            } else {
              return (
                <motion.circle
                  key={p.id}
                  r="2.5"
                  fill="#ffffff"
                  initial={{ cx: p.x, cy: 10, opacity: 0 }}
                  animate={{
                    cy: 190,
                    cx: p.x + (p.id % 2 === 0 ? 15 : -15),
                    opacity: [0, 0.9, 0.9, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "linear"
                  }}
                />
              );
            }
          })}

          {/* ── HOÀNG KIM: Các hạt nguyên tố bộ ẩn phụ (Cups, Wands, Swords, Pentacles) ── */}
          {currentCard?.arcana === 'minor' && currentCard.suit === 'cups' && suitParticles.map((p) => (
            <motion.path
              key={p.id}
              d="M0 0 C-1.5 1.5, -3 3, -3 4.5 C-3 6, -1.5 7, 0 7 C1.5 7, 3 6, 3 4.5 C3 3, 1.5 1.5, 0 0 Z"
              fill="#48cae4"
              initial={{ x: p.x, y: 160, opacity: 0, scale: 0.6 }}
              animate={{
                y: [160, 60],
                x: [p.x, p.x + (p.id % 2 === 0 ? 18 : -18)],
                opacity: [0, 0.8, 0]
              }}
              transition={{ duration: 2.2, repeat: Infinity, delay: p.delay }}
            />
          ))}

          {currentCard?.arcana === 'minor' && currentCard.suit === 'wands' && suitParticles.map((p) => (
            <motion.circle
              key={p.id}
              r="3.2"
              fill="#fb8500"
              filter="url(#glow-bell)"
              initial={{ cx: p.x, cy: 155, opacity: 0 }}
              animate={{
                cy: [155, 45],
                cx: [p.x, p.x + (p.id % 2 === 0 ? 22 : -22)],
                opacity: [0, 0.9, 0]
              }}
              transition={{ duration: 1.8, repeat: Infinity, delay: p.delay }}
            />
          ))}

          {currentCard?.arcana === 'minor' && currentCard.suit === 'swords' && suitParticles.map((p) => (
            <motion.path
              key={p.id}
              d="M0 0 L-2 4 H1 L-1 8 L3 3 H0 L2 0 Z"
              fill="#bde0fe"
              initial={{ x: p.x, y: 155, opacity: 0, scale: 0.8 }}
              animate={{
                y: [155, 50],
                x: [p.x, p.x + (p.id % 2 === 0 ? 12 : -12)],
                opacity: [0, 0.9, 0]
              }}
              transition={{ duration: 1.4, repeat: Infinity, delay: p.delay }}
            />
          ))}

          {currentCard?.arcana === 'minor' && currentCard.suit === 'pentacles' && suitParticles.map((p) => (
            <motion.g
              key={p.id}
              initial={{ x: p.x, y: 10, opacity: 0, rotate: 0 }}
              animate={{
                y: 190,
                x: p.x + (p.id % 2 === 0 ? 16 : -16),
                rotate: 360,
                opacity: [0, 0.85, 0]
              }}
              transition={{ duration: 3.2, repeat: Infinity, delay: p.delay, ease: "linear" }}
            >
              <circle cx="0" cy="0" r="4.2" fill="#ffd166" stroke="#fb8500" strokeWidth="0.5" />
              <rect x="-1.5" y="-1.5" width="3" height="3" fill="#0d0d1a" />
            </motion.g>
          ))}

          {/* ── HOÀNG KIM: Thả tim hồng đặc thù của lá bài The Lovers ── */}
          {isTheLovers && (
            <g>
              <motion.path
                d="M10 30 C8 27, 4 27, 4 31 C4 35, 10 39, 10 39 C10 39, 16 35, 16 31 C16 27, 12 27, 10 30 Z"
                fill="#ff4d6d"
                initial={{ x: 50, y: 75, scale: 0, opacity: 0 }}
                animate={{ y: [75, 35], scale: [0.6, 0.9, 0.6], opacity: [0, 0.85, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.path
                d="M10 30 C8 27, 4 27, 4 31 C4 35, 10 39, 10 39 C10 39, 16 35, 16 31 C16 27, 12 27, 10 30 Z"
                fill="#ff4d6d"
                initial={{ x: 135, y: 70, scale: 0, opacity: 0 }}
                animate={{ y: [70, 30], scale: [0.5, 0.8, 0.5], opacity: [0, 0.85, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, delay: 1.3, ease: "easeOut" }}
              />
            </g>
          )}

          {/* VÒNG SÓNG MA THUẬT */}
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

          {/* HIỆU ỨNG ZZZ KHI NGỦ / BUỒN NGỦ */}
          {(isSleeping || isDrowsy) && (
            <g>
              <motion.text
                x="142" y="65"
                fill="#ffd166"
                className="text-xs font-sans font-bold"
                animate={{ y: [65, 45, 40], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: isDrowsy ? 4.5 : 3, repeat: Infinity, ease: "easeOut" }}
              >
                Z
              </motion.text>
              <motion.text
                x="156" y="52"
                fill="#ffd166"
                className="text-[9px] font-sans font-bold"
                animate={{ y: [52, 35, 30], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: isDrowsy ? 4.5 : 3, repeat: Infinity, delay: 1.2, ease: "easeOut" }}
              >
                z
              </motion.text>
              <motion.text
                x="132" y="42"
                fill="#ffd166"
                className="text-[10px] font-sans font-bold"
                animate={{ y: [42, 25, 20], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: isDrowsy ? 4.5 : 3, repeat: Infinity, delay: 2.4, ease: "easeOut" }}
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
              <rect x="97" y="5" width="6" height="14" rx="3" fill="#ff4d6d" />
              <circle cx="100" cy="25" r="3.5" fill="#ff4d6d" />
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
            animate={activeAnimateState}
            style={{ originX: '135px', originY: '165px' }}
            filter="url(#wind-filter)"
          >
            {/* Đuôi màu cam */}
            <path
              d="M135 165 C155 165, 175 150, 170 120 C167 105, 155 108, 158 118 C160 128, 148 148, 135 153 Z"
              fill={catBodyColor}
            />
            {/* Sọc trên đuôi */}
            <path d="M152 143 C156 141, 161 143, 163 146" stroke={catStripeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M159 131 C163 129, 167 131, 169 134" stroke={catStripeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M163 119 C165 117, 169 118, 170 120" stroke={catStripeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          </motion.g>

          {/* ── HOÀNG KIM: Dịch chuyển Mèo rơi tự do đặc thù cho The Fool ── */}
          <motion.g
            animate={
              isTheFool
                ? { y: [0, -10, 12, 0], scaleY: [1, 0.9, 1.1, 1] }
                : {}
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* THÂN MÈO (Body) */}
            <motion.g
              variants={bodyVariants}
              animate={activeAnimateState}
              style={{ originX: '100px', originY: '185px' }}
            >
              {/* Dáng ngồi/nằm */}
              <path
                d={
                  isSleeping
                    ? "M100 85 C50 85, 42 120, 42 152 C42 176, 70 180, 100 180 C130 180, 158 176, 158 152 C158 120, 150 85, 100 85 Z"
                    : "M100 95 C62 95, 52 125, 52 165 C52 178, 68 181, 100 181 C132 181, 148 178, 148 165 C148 125, 138 95, 100 95 Z"
                }
                fill={catBodyColor}
              />

              {/* Lớp phủ màu Tarot (Tarot Color Tint Overlay) */}
              {cardThemeColor !== 'transparent' && (
                <g opacity="0.15">
                  <path
                    d={
                      isSleeping
                        ? "M100 85 C50 85, 42 120, 42 152 C42 176, 70 180, 100 180 C130 180, 158 176, 158 152 C158 120, 150 85, 100 85 Z"
                        : "M100 95 C62 95, 52 125, 52 165 C52 178, 68 181, 100 181 C132 181, 148 178, 148 165 C148 125, 138 95, 100 95 Z"
                    }
                    fill={cardThemeColor}
                  />
                </g>
              )}

              {/* Sọc vằn lưng */}
              {!isSleeping && (
                <>
                  <path d="M53 135 Q65 137 70 133" stroke={catStripeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M54 147 Q63 148 67 145" stroke={catStripeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M147 135 Q135 137 130 133" stroke={catStripeColor} strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M146 147 Q137 148 133 145" stroke={catStripeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
              )}

              {/* Lông ngực xù */}
              <path
                d={
                  isSleeping
                    ? "M100 110 C80 110, 72 125, 72 142 C72 158, 85 163, 100 163 C115 163, 128 158, 128 142 C128 125, 120 110, 100 110 Z"
                    : "M100 118 C82 118, 74 130, 74 154 C74 168, 86 170, 100 170 C114 170, 126 168, 126 154 C126 130, 118 118, 100 118 Z"
                }
                fill={catChestFurColor}
                fillOpacity="0.4"
                filter="url(#wind-filter)"
              />
              {!isSleeping && (
                <path
                  d="M100 120 C92 120, 88 126, 92 134 C94 137, 98 135, 100 142 C102 135, 106 137, 108 134 C112 126, 108 120, 100 120 Z"
                  fill="#fffcf2"
                  fillOpacity="0.8"
                  filter="url(#wind-filter)"
                />
              )}

              {/* CHÂN TRƯỚC (Paws) */}
              {/* Chân trái */}
              <motion.g
                variants={pawLeftVariants}
                animate={activeAnimateState}
                className="origin-top"
              >
                {isHappy || isShuffle || isContemplative || isTheHermit ? (
                  // Chân giơ lên - Thấy đệm hồng (Hoặc cầm đèn lồng)
                  <g>
                    <path
                      d={
                        isContemplative || isTheHermit
                          ? "M56 150 C54 134, 68 116, 75 125 C79 132, 68 148, 60 152 Z"
                          : "M58 145 C54 130, 68 118, 72 126 C76 132, 68 145, 62 148 Z"
                      }
                      fill={catBodyColor}
                    />
                    <circle
                      cx={isContemplative || isTheHermit ? "74.5" : "72"}
                      cy={isContemplative || isTheHermit ? "123" : "125"}
                      r="9.5"
                      fill={catChestFurColor}
                      stroke={catBodyColor}
                      strokeWidth="1"
                    />
                    <ellipse
                      cx={isContemplative || isTheHermit ? "74.5" : "72"}
                      cy={isContemplative || isTheHermit ? "124" : "126"}
                      rx="5"
                      ry="4"
                      fill="#ffb3b3"
                    />
                    <circle cx={isContemplative || isTheHermit ? "68.5" : "66"} cy={isContemplative || isTheHermit ? "118" : "120"} r="1.8" fill="#ffb3b3" />
                    <circle cx={isContemplative || isTheHermit ? "74.5" : "72"} cy={isContemplative || isTheHermit ? "115" : "117"} r="1.8" fill="#ffb3b3" />
                    <circle cx={isContemplative || isTheHermit ? "80.5" : "78"} cy={isContemplative || isTheHermit ? "118" : "120"} r="1.8" fill="#ffb3b3" />
                    
                    {/* ── HOÀNG KIM: Đèn bão cầm tay của Ẩn Sĩ The Hermit ── */}
                    {isTheHermit && (
                      <g>
                        {/* Quai treo */}
                        <path d="M74.5 123 L74.5 113 H68.5" stroke="#4f5d75" strokeWidth="1.2" fill="none" />
                        {/* Nắp đèn */}
                        <path d="M64 113 H73 L71 110 H66 Z" fill="#ffd166" stroke="#4f5d75" strokeWidth="0.8" />
                        {/* Thủy tinh và nguồn sáng phát sáng */}
                        <path d="M65 113 H72 L70.5 121 H66.5 Z" fill="#ffd166" fillOpacity="0.4" stroke="#4f5d75" strokeWidth="0.8" />
                        <circle cx="68.5" cy="117" r="2.5" fill="#fff8dc" filter="url(#glow-bell)" />
                        {/* Đáy đèn */}
                        <rect x="65" y="121" width="7" height="2" rx="0.5" fill="#4f5d75" />
                      </g>
                    )}
                  </g>
                ) : (
                  <path
                    d={
                      isSleeping || isSolemn || isDrowsy
                        ? "M68 165 C68 158, 78 158, 83 165 C85 170, 78 172, 68 172 Z"
                        : "M66 172 C66 166, 78 166, 83 172 C83 177, 76 179, 66 179 Z"
                    }
                    fill={catChestFurColor}
                  />
                )}
              </motion.g>

              {/* Chân phải */}
              <motion.g
                variants={pawRightVariants}
                animate={activeAnimateState}
                className="origin-top"
              >
                {isHappy || isShuffle ? (
                  <g>
                    <path d="M142 145 C146 130, 132 118, 128 126 C124 132, 132 145, 138 148 Z" fill={catBodyColor} />
                    <circle cx="128" cy="125" r="9.5" fill={catChestFurColor} stroke={catBodyColor} strokeWidth="1" />
                    <ellipse cx="128" cy="126" rx="5" ry="4" fill="#ffb3b3" />
                    <circle cx="122" cy="120" r="1.8" fill="#ffb3b3" />
                    <circle cx="128" cy="117" r="1.8" fill="#ffb3b3" />
                    <circle cx="134" cy="120" r="1.8" fill="#ffb3b3" />
                  </g>
                ) : (
                  <path
                    d={
                      isSleeping || isSolemn || isDrowsy
                        ? "M132 165 C132 158, 122 158, 117 165 C115 170, 122 172, 132 172 Z"
                        : "M134 172 C134 166, 122 166, 117 172 C117 177, 124 179, 134 179 Z"
                  }
                  fill={catChestFurColor}
                />
              )}
            </motion.g>

            {/* ĐẦU MÈO (Head) */}
            <motion.g
              variants={headVariants}
              animate={activeAnimateState}
              style={{ originX: '100px', originY: '115px' }}
            >
              {/* TAI MÈO */}
              <motion.g
                variants={earLeftVariants}
                animate={activeAnimateState}
                style={{ originX: '65px', originY: '60px' }}
              >
                <path d="M64 56 L38 18 L70 46 Z" fill={catBodyColor} />
                <path d="M61 52 L44 24 L66 45 Z" fill={catInnerEarColor} fillOpacity="0.7" />
              </motion.g>

              <motion.g
                variants={earRightVariants}
                animate={activeAnimateState}
                style={{ originX: '135px', originY: '60px' }}
              >
                <path d="M136 56 L162 18 L130 46 Z" fill={catBodyColor} />
                <path d="M139 52 L156 24 L134 45 Z" fill={catInnerEarColor} fillOpacity="0.7" />
              </motion.g>

              {/* Mặt mèo */}
              <path
                d={
                  isSleeping || isSolemn || isContemplative || isDrowsy
                    ? "M100 90 C65 90, 58 108, 58 128 C58 148, 78 154, 100 154 C122 154, 142 148, 142 128 C142 108, 135 90, 100 90 Z"
                    : "M100 48 C65 48, 58 68, 58 88 C58 108, 78 116, 100 116 C122 116, 142 108, 142 88 C142 68, 135 48, 100 48 Z"
                }
                fill={catHeadColor}
              />

              {/* MẮT THỨ BA (Oracle Form) */}
              {isOracleForm && (
                <g>
                  {/* Tròng mắt thứ ba */}
                  <ellipse cx="100" cy={(isSleeping || isSolemn || isContemplative || isDrowsy) ? 108 : 68} rx="7" ry="4.5" fill="#090916" stroke="#457b9d" strokeWidth="0.8" />
                  {/* Con ngươi xanh ngọc phát sáng nhấp nháy */}
                  <motion.circle
                    cx="100"
                    cy={(isSleeping || isSolemn || isContemplative || isDrowsy) ? 108 : 68}
                    r="2.5"
                    fill="#06d6a0"
                    filter="url(#glow-eye)"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Điểm sáng */}
                  <circle cx="99" cy={((isSleeping || isSolemn || isContemplative || isDrowsy) ? 108 : 68) - 1.2} r="0.8" fill="white" />
                </g>
              )}

              {/* KÍNH HỌC GIẢ (Scholar Glasses) */}
              {gamification?.activeGlasses && (
                <g stroke="#3d3d3d" strokeWidth="2.5" fill="none" opacity="0.9">
                  {/* Mắt kính trái */}
                  <circle cx="80" cy={isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85} r="14" />
                  {/* Mắt kính phải */}
                  <circle cx="120" cy={isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85} r="14" />
                  {/* Cầu kính */}
                  <path d={`M94 ${isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85} Q100 ${(isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85) - 3} 106 ${isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85}`} strokeLinecap="round" />
                  {/* Gọng kính trái */}
                  <path d={`M66 ${isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85} L58 ${(isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85) - 2}`} strokeLinecap="round" />
                  {/* Gọng kính phải */}
                  <path d={`M134 ${isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85} L142 ${(isDrowsy || isContemplative ? 94 : isSleeping ? 116 : 85) - 2}`} strokeLinecap="round" />
                </g>
              )}

              {/* Lớp phủ màu Tarot cho Đầu */}
              {cardThemeColor !== 'transparent' && (
                <g opacity="0.15">
                  <path
                    d={
                      isSleeping || isSolemn || isContemplative || isDrowsy
                        ? "M100 90 C65 90, 58 108, 58 128 C58 148, 78 154, 100 154 C122 154, 142 148, 142 128 C142 108, 135 90, 100 90 Z"
                        : "M100 48 C65 48, 58 68, 58 88 C58 108, 78 116, 100 116 C122 116, 142 108, 142 88 C142 68, 135 48, 100 48 Z"
                    }
                    fill={cardThemeColor}
                  />
                </g>
              )}

              {/* SỌC VẰN TABBY TRÊN ĐẦU */}
              {!isSleeping && (
                <g>
                  <path
                    d="M90 52 L95 62 L98 56 L100 64 L102 56 L105 62 L110 52"
                    stroke={catStripeColor}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path d="M82 58 L86 64" stroke={catStripeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M118 58 L114 64" stroke={catStripeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />

                  <path d="M60 90 Q68 91 71 89" stroke={catStripeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M60 96 Q66 97 68 95" stroke={catStripeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M140 90 Q132 91 129 89" stroke={catStripeColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M140 96 Q134 97 132 95" stroke={catStripeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              )}

              {/* MŨ PHÙ THỦY MINI */}
              {!isSleeping && (
                <motion.g
                  variants={hatVariants}
                  animate={activeAnimateState}
                  style={{ originX: '100px', originY: '48px' }}
                >
                  <path
                    d={
                      isTheTower
                        ? "M85 70 C95 66, 145 66, 155 70 C160 72, 145 75, 120 75 C95 75, 80 72, 85 70 Z" // Mũ rơi xếch xuống của The Tower
                        : "M65 48 C75 44, 125 44, 135 48 C140 50, 125 53, 100 53 C75 53, 60 50, 65 48 Z"
                    }
                    fill={isTheTower ? "#4a4a5a" : "#7209b7"}
                  />
                  <path
                    d={
                      isTheTower
                        ? "M92 69 C94 54, 105 36, 122 30 C128 42, 138 54, 148 69 Z" // Chóp lệch nghiêng ngửa
                        : "M72 47 C74 32, 85 14, 102 8 C108 20, 118 32, 128 47 Z"
                    }
                    fill={isTheTower ? "#2d2d3a" : "#560bad"}
                  />
                  <path
                    d={
                      isTheTower
                        ? "M94 68 C100 65, 140 65, 146 68 L147 71 C141 68, 99 68, 93 71 Z"
                        : "M74 46 C80 43, 120 43, 126 46 L127 49 C121 46, 79 46, 73 49 Z"
                    }
                    fill="#e76f51"
                  />
                  <path
                    d={
                      isTheTower
                        ? "M120 63 L121.5 66 L124.5 66.5 L122 68.5 L123 71.5 L120 70 L117 71.5 L118 68.5 L115.5 66.5 L118.5 66 Z"
                        : "M100 41 L101.5 44 L104.5 44.5 L102 46.5 L103 49.5 L100 48 L97 49.5 L98 46.5 L95.5 44.5 L98.5 44 Z"
                    }
                    fill="#ffd166"
                    className="animate-pulse"
                  />
                  
                  {/* Tuyết đông đọng trên mũ */}
                  {season === 'winter' && (
                    <>
                      <path
                        d={
                          isTheTower
                            ? "M119 30 C121 28, 124 28, 126 30 L123 36 Z"
                            : "M99 8 C101 6, 104 6, 106 8 L103 14 C100 13, 99 12, 99 8 Z"
                        }
                        fill="#ffffff"
                        opacity="0.9"
                      />
                      <path
                        d={
                          isTheTower
                            ? "M95 70 C105 67, 135 67, 145 70 Z"
                            : "M75 48 C85 45, 115 45, 125 48 C120 46, 80 46, 75 48 Z"
                        }
                        fill="#ffffff"
                        opacity="0.95"
                      />
                    </>
                  )}

                  {/* ── HOÀNG KIM: Vương miện nhỏ hoàng kim của Celtic Cross Spread ── */}
                  {spreadContext === 'celtic-cross' && (
                    <motion.path
                      d="M90 38 L93 30 L97 34 L100 28 L103 34 L107 30 L110 38 Z"
                      fill="#ffd166"
                      stroke="#fb8500"
                      strokeWidth="0.8"
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ originX: "100px", originY: "38px" }}
                    />
                  )}
                </motion.g>
              )}

              {/* MẮT MÈO */}
              {isSleeping ? (
                <g>
                  <path d="M76 116 C79 120, 85 120, 88 116" stroke="#090916" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M112 116 C115 120, 121 120, 124 116" stroke="#090916" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
              ) : isHappy ? (
                <g>
                  <path d="M74 86 C78 81, 84 81, 88 86" stroke="#090916" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <path d="M112 86 C116 81, 122 81, 126 86" stroke="#090916" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </g>
              ) : isMischievous ? (
                <g>
                  <path d="M74 86 C78 81, 84 81, 88 86" stroke="#090916" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <ellipse cx="120" cy="85" rx="10" ry="8.5" fill={catEyeColor} />
                  <motion.g animate={{ x: pupilX, y: pupilY }} transition={pupilTransition}>
                    <circle cx="117.5" cy="82" r="3.2" fill="white" />
                    <circle cx="122.5" cy="87.5" r="1.5" fill="white" />
                  </motion.g>
                </g>
              ) : isFocused ? (
                <g>
                  <ellipse cx="80" cy="85" rx="10" ry="3.5" fill={catEyeColor} />
                  <motion.g animate={{ x: pupilX, y: pupilY }} transition={pupilTransition}>
                    <circle cx="78" cy="84" r="2.2" fill="white" />
                  </motion.g>

                  <ellipse cx="120" cy="85" rx="10" ry="8.5" fill={catEyeColor} />
                  <motion.g animate={{ x: pupilX, y: pupilY }} transition={pupilTransition}>
                    <circle cx="117.5" cy="82" r="3.2" fill="white" />
                    <circle cx="122.5" cy="87.5" r="1.5" fill="white" />
                  </motion.g>
                </g>
              ) : isDrowsy ? (
                <g>
                  <ellipse cx="80" cy="94" rx="10" ry="2.2" fill={catEyeColor} />
                  <ellipse cx="120" cy="94" rx="10" ry="2.2" fill={catEyeColor} />
                </g>
              ) : isContemplative ? (
                <g>
                  <ellipse cx="80" cy="94" rx="10" ry="3.5" fill={catEyeColor} />
                  <motion.g animate={{ x: pupilX, y: pupilY }} transition={pupilTransition}>
                    <circle cx="78" cy="93" r="2" fill="white" />
                  </motion.g>

                  <ellipse cx="120" cy="94" rx="10" ry="3.5" fill={catEyeColor} />
                  <motion.g animate={{ x: pupilX, y: pupilY }} transition={pupilTransition}>
                    <circle cx="118" cy="93" r="2" fill="white" />
                  </motion.g>
                </g>
              ) : (
                <g>
                  {/* Mắt trái */}
                  <ellipse cx="80" cy="85" rx="10" ry={isSurprised || isTheTower ? "10" : "8.5"} fill={catEyeColor} />
                  <motion.g
                    animate={{ x: pupilX, y: pupilY }}
                    transition={pupilTransition}
                  >
                    {isReading ? (
                      <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        style={{ originX: "80px", originY: "85px" }}
                      >
                        <circle cx="80" cy="85" r="7.5" fill="url(#reading-eye-gradient)" filter="url(#glow-eye)" />
                        <circle cx="80" cy="85" r="4.2" fill="#ffd166" />
                      </motion.g>
                    ) : (
                      <>
                        <circle cx="77.5" cy="82" r="3.2" fill="white" />
                        <circle cx="82.5" cy="87.5" r="1.5" fill="white" />
                      </>
                    )}
                  </motion.g>

                  {/* Mắt phải */}
                  <ellipse cx="120" cy="85" rx="10" ry={isSurprised || isTheTower ? "10" : "8.5"} fill={catEyeColor} />
                  <motion.g
                    animate={{ x: pupilX, y: pupilY }}
                    transition={pupilTransition}
                  >
                    {isReading ? (
                      <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8 / (1 + (personality.mysticism / 100)), repeat: Infinity, ease: "linear" }}
                        style={{ originX: "120px", originY: "85px" }}
                      >
                        <circle cx="120" cy="85" r="7.5" fill="url(#reading-eye-gradient)" filter="url(#glow-eye)" />
                        <circle cx="120" cy="85" r="4.2" fill="#ffd166" />
                      </motion.g>
                    ) : (
                      <>
                        <circle cx="117.5" cy="82" r="3.2" fill="white" />
                        <circle cx="122.5" cy="87.5" r="1.5" fill="white" />
                      </>
                    )}
                  </motion.g>
                </g>
              )}

              {/* LÔNG MÀY BIỂU CẢM */}
              {!isSleeping && (
                <g>
                  <motion.path
                    d="M70 73 Q80 70 88 74"
                    stroke={catStripeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    animate={
                      isSurprised || isTheTower
                        ? { y: -5, rotate: -12 }
                        : isReading
                        ? { y: 2, rotate: 12 }
                        : isSolemn || currentCard?.slug === 'death'
                        ? { y: 2.5, rotate: 10 }
                        : isCurious
                        ? { y: -3, rotate: -8 }
                        : { y: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.3 }}
                  />
                  <motion.path
                    d="M112 74 Q120 70 130 73"
                    stroke={catStripeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    animate={
                      isSurprised || isTheTower
                        ? { y: -5, rotate: 12 }
                        : isReading
                        ? { y: 2, rotate: -12 }
                        : isSolemn || currentCard?.slug === 'death'
                        ? { y: 2.5, rotate: -10 }
                        : isCurious
                        ? { y: 1, rotate: 8 }
                        : { y: 0, rotate: 0 }
                    }
                    transition={{ duration: 0.3 }}
                  />
                </g>
              )}

              {/* GÒ MÁ PHỒNG HỒNG */}
              <g>
                <motion.ellipse
                  cx="66"
                  cy={isSleeping || isSolemn || isContemplative || isDrowsy ? "124" : "96"}
                  rx="7"
                  ry="4"
                  fill={isTheLovers ? "#ff4d6d" : "#ff85a1"}
                  fillOpacity={isTheLovers ? 0.75 : 0.5}
                  animate={{
                    scale: isSleeping || isDrowsy ? [1, 1.15, 1] : isTheLovers ? [1, 1.18, 1] : [1, 1.06, 1]
                  }}
                  transition={{ duration: isSleeping || isDrowsy ? 4.5 : 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.ellipse
                  cx="134"
                  cy={isSleeping || isSolemn || isContemplative || isDrowsy ? "124" : "96"}
                  rx="7"
                  ry="4"
                  fill={isTheLovers ? "#ff4d6d" : "#ff85a1"}
                  fillOpacity={isTheLovers ? 0.75 : 0.5}
                  animate={{
                    scale: isSleeping || isDrowsy ? [1, 1.15, 1] : isTheLovers ? [1, 1.18, 1] : [1, 1.06, 1]
                  }}
                  transition={{ duration: isSleeping || isDrowsy ? 4.5 : 3.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </g>

              {/* MŨI MÈO */}
              <polygon
                points={isSleeping || isSolemn || isContemplative || isDrowsy ? "98,125 102,125 100,127.5" : "98,94 102,94 100,96.5"}
                fill="#e76f51"
              />

              {/* MIỆNG MÈO */}
              <path
                d={
                  isSleeping
                    ? "M96 130 C98 131, 100 131, 100 131 C100 131, 102 131, 104 130"
                    : isSurprised || isTheTower
                    ? "M96 100 Q100 108 104 100" // O to
                    : isDrowsy || isCurious
                    ? "M97 100 Q100 105 103 100" // O nhỏ
                    : isSolemn || currentCard?.slug === 'death'
                    ? "M95 103 C97 100, 103 100, 105 103" // U cụp
                    : isMischievous
                    ? "M94 99 C97 101, 99 101, 102 98 C104 99, 106 99, 108 97" // Smirk
                    : "M94 100 C96 102, 98 102, 100 100 C102 102, 104 102, 106 100" // W cute
                }
                stroke="#090916"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill={isSurprised || isTheTower || isDrowsy || isCurious ? '#e76f51' : 'none'}
              />

              {/* RÂU MÈO */}
              <motion.g variants={whiskerLeftVariants} animate={activeAnimateState}>
                <path d={isSleeping || isSolemn || isContemplative || isDrowsy ? "M53 128 L35 130 M53 133 L32 137" : "M53 93 L33 91 M53 97 L29 98 M53 101 L31 105"} stroke="#090916" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
              </motion.g>
              <motion.g variants={whiskerRightVariants} animate={activeAnimateState}>
                <path d={isSleeping || isSolemn || isContemplative || isDrowsy ? "M147 128 L165 130 M147 133 L168 137" : "M147 93 L167 91 M147 97 L171 98 M147 101 L169 105"} stroke="#090916" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
              </motion.g>

              {/* VÒNG CỔ & LỤC LẠC */}
              {!isSleeping && (
                <g>
                  <path d="M72 112 C72 112, 90 120, 100 120 C110 120, 128 112, 128 112" stroke={catCollarColor} strokeWidth="3.5" strokeLinecap="round" />
                  
                  {/* NƠ ĐỎ CỔ ÁO (Red Bow Tie) */}
                  {gamification?.activeBowTie && (
                    <g fill="#d90429" stroke="#9d0208" strokeWidth="1">
                      {/* Cánh nơ trái */}
                      <path d="M100 120 L88 112 C85 110, 82 114, 85 120 L94 122 Z" />
                      {/* Cánh nơ phải */}
                      <path d="M100 120 L112 112 C115 110, 118 114, 115 120 L106 122 Z" />
                      {/* Nút thắt nơ tròn ở giữa */}
                      <circle cx="100" cy="120" r="4.2" fill="#ef233c" stroke="#9d0208" strokeWidth="1" />
                    </g>
                  )}

                  <motion.g
                    variants={bellVariants}
                    animate={activeAnimateState}
                    style={{ originX: '100px', originY: '120px' }}
                  >
                    <circle
                      cx="100"
                      cy="126"
                      r="7.5"
                      fill={isShadowForm ? "url(#shadow-bell-gradient)" : isOracleForm ? "url(#oracle-bell-gradient)" : "url(#bell-gradient)"}
                      stroke={isShadowForm ? "#7209b7" : isOracleForm ? "#457b9d" : "#f4a261"}
                      strokeWidth="0.8"
                      filter={isReading || isHappy || isCurious ? "url(#glow-bell)" : undefined}
                    />
                    <circle cx="100" cy="128" r="1.5" fill="#0d0d1a" />
                    <line x1="97" y1="126" x2="103" y2="126" stroke="#0d0d1a" strokeWidth="1" />
                  </motion.g>
                </g>
              )}
            </motion.g>
          </motion.g>
        </motion.g>

        {/* ── HOÀNG KIM: Dù nhỏ bồng bềnh của The Fool bay phía trên đầu ── */}
        {isTheFool && (
          <motion.g
            animate={{ y: [0, -10, 12, 0], rotate: [-2, 3, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Cán dù */}
            <path d="M96 15 L96 0" stroke="#f4a261" strokeWidth="2.2" />
            <path d="M96 0 A3 3 0 0 1 93 -3" stroke="#f4a261" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Tán dù */}
            <path d="M74 15 C74 0, 118 0, 118 15 Z" fill="#ffb703" stroke="#090916" strokeWidth="1.2" />
            <circle cx="96" cy="1" r="2.5" fill="#ef233c" />
          </motion.g>
        )}

        {/* HIỆU ỨNG RÚT BÀI (Shuffle state) */}
        {isShuffle && (
          <g>
            <motion.g
              initial={{ x: 55, y: 155, rotate: 0, opacity: 0 }}
              animate={{ x: [55, 30, 20, 50], y: [155, 130, 150, 155], rotate: [0, -45, -90, -180], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <rect x="-8" y="-12" width="16" height="24" rx="2" fill="#fff5eb" stroke="#9b5de5" strokeWidth="1.5" />
              <path d="M-3 -5 L3 5 M3 -5 L-3 5" stroke="#9b5de5" strokeWidth="1" />
            </motion.g>
            <motion.g
              initial={{ x: 145, y: 155, rotate: 0, opacity: 0 }}
              animate={{ x: [145, 170, 180, 150], y: [155, 130, 150, 155], rotate: [0, 45, 90, 180], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4, ease: "linear" }}
            >
              <rect x="-8" y="-12" width="16" height="24" rx="2" fill="#fff5eb" stroke="#9b5de5" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3" fill="#ffd166" />
            </motion.g>
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
            <path d="M86 181 H114 L109 170 H91 Z" fill="#ffd166" stroke="#e76f51" strokeWidth="1" />
            <circle
              cx="100"
              cy="162"
              r="19"
              fill="url(#crystal-gradient)"
              stroke="#ffd166"
              strokeWidth="1.2"
              filter="url(#glow-crystal)"
            />
            <circle cx="94" cy="154" r="5" fill="white" fillOpacity="0.4" />
            <circle cx="91" cy="157" r="2" fill="white" fillOpacity="0.3" />
          </motion.g>
        )}

        {/* ── HOÀNG KIM GIAI ĐOẠN 3: Vùng tương tác trong suốt ── */}
        {/* Vùng tương tác Đầu mèo (Vuốt head) */}
        <ellipse
          cx="100"
          cy="85"
          rx="45"
          ry="35"
          fill="transparent"
          className="cursor-pointer"
          onPointerDown={handlePointerDownHead}
          onPointerMove={handlePointerMoveHead}
          onPointerUp={() => { isPointerDownOnHead.current = false; }}
          onPointerLeave={() => { isPointerDownOnHead.current = false; }}
        />

        {/* Vùng tương tác Mũ (Double tap để rơi) */}
        <ellipse
          cx="100"
          cy="30"
          rx="40"
          ry="25"
          fill="transparent"
          className="cursor-pointer"
          onClick={handleHatClick}
        />

        {/* Vùng tương tác Bụng (Poke chọc bụng) */}
        <ellipse
          cx="100"
          cy="150"
          rx="45"
          ry="30"
          fill="transparent"
          className="cursor-pointer"
          onClick={triggerPoke}
        />
      </svg>
      </div>

      {/* Bong bóng thoại bên dưới */}
      {localSpeechBubble && (
        <div className="relative max-w-[240px] md:max-w-[280px] mt-2 animate-[fadeIn_0.3s_ease-out] z-20">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-surface border-l border-t border-gold-primary/30 rotate-45 z-10" />
          
          <div className="bg-bg-surface border border-gold-primary/30 rounded-2xl px-4 py-2.5 shadow-2xl overflow-hidden relative">
            <p className="text-xs md:text-sm font-lora text-text-primary text-center leading-relaxed">
              {getWisdomModifiedBubble(localSpeechBubble)}
            </p>
            
            {/* ── HOÀNG KIM: Hiển thị Ambient Theme + Lá bài được nhuộm màu ── */}
            <span className="block text-[8px] text-text-secondary/30 text-center font-sans tracking-widest uppercase mt-1">
              {ambientThemeName} · {season === 'spring' ? 'Mùa Xuân' : season === 'summer' ? 'Mùa Hạ' : season === 'autumn' ? 'Mùa Thu' : 'Mùa Đông'}
              {currentCard && ` · ${currentCard.arcana === 'major' ? 'Ẩn Chính' : 'Ẩn Phụ'}`}
            </span>

            {/* Thanh tiến trình thời gian rút ngắn (Timer Progress Bar) */}
            <motion.div
              key={localSpeechBubble}
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 10, ease: "linear" }}
              className="h-0.5 bg-gold-primary/50 absolute bottom-0 left-0 right-0 origin-left"
            />
          </div>
        </div>
      )}

      </MotionConfig>

      {isClient && showControls && (
        <div className="mt-4 w-full max-w-[260px] md:max-w-[300px] bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl p-3 shadow-xl text-text-primary flex flex-col gap-2.5 z-20">
          {/* Hàng 1: Chỉ số Hunger & Bond Level */}
          <div className="flex justify-between items-center text-[10px] md:text-xs">
            <div className="flex items-center gap-1">
              <span>🐟 Đói:</span>
              <span className="font-bold">{gamification?.hunger}%</span>
              {/* Progress bar nhỏ cho Đói */}
              <div className="w-12 h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${gamification?.hunger < 30 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${gamification?.hunger}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <span>👑 Cấp {getLevel(gamification?.bondPoints || 0)}:</span>
              <span className="font-bold text-gold-primary">{gamification?.bondPoints} XP</span>
            </div>
          </div>

          {/* Hàng 2: Nút Cho ăn & Bật tắt âm thanh */}
          <div className="flex gap-2">
            <button
              onClick={handleFeed}
              className="flex-1 bg-gold-primary hover:bg-gold-primary/80 active:scale-95 text-bg-surface font-semibold text-xs py-1.5 px-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-1"
            >
              <span>🍖</span> Cho ăn
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 ${
                isMuted 
                  ? 'bg-black/10 hover:bg-black/20 border border-white/10' 
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isMuted ? '🔇 Tắt nhạc' : '🔊 Bật nhạc'}
            </button>
          </div>

          {/* Hàng 3: Phụ kiện & Hình thái (chỉ hiện nếu đã mở khóa) */}
          <div className="border-t border-white/10 pt-2 flex flex-col gap-1.5 text-[10px] md:text-xs text-text-secondary">
            {/* Phụ kiện */}
            <div className="flex justify-between items-center">
              <span>Trang bị:</span>
              <div className="flex gap-2">
                {/* Nơ đỏ (Cấp 2) */}
                {getLevel(gamification?.bondPoints || 0) >= 2 ? (
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={gamification?.activeBowTie || false}
                      onChange={(e) => {
                        const updated = { ...gamification, activeBowTie: e.target.checked };
                        setGamification(updated);
                        saveGamificationState(updated);
                      }}
                      className="accent-gold-primary"
                    />
                    <span>🎀 Nơ</span>
                  </label>
                ) : (
                  <span className="opacity-40">🔒 Cấp 2: Nơ</span>
                )}

                {/* Kính (Cấp 3) */}
                {getLevel(gamification?.bondPoints || 0) >= 3 ? (
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={gamification?.activeGlasses || false}
                      onChange={(e) => {
                        const updated = { ...gamification, activeGlasses: e.target.checked };
                        setGamification(updated);
                        saveGamificationState(updated);
                      }}
                      className="accent-gold-primary"
                    />
                    <span>👓 Kính</span>
                  </label>
                ) : (
                  <span className="opacity-40">🔒 Cấp 3: Kính</span>
                )}
              </div>
            </div>

            {/* Hình thái */}
            <div className="flex justify-between items-center">
              <span>Hình thái:</span>
              <div className="flex gap-1.5">
                {/* Vàng (Cấp 1) */}
                <button
                  onClick={() => {
                    const updated = { ...gamification, activeForm: 'yellow' as const };
                    setGamification(updated);
                    saveGamificationState(updated);
                  }}
                  className={`w-4 h-4 rounded-full bg-amber-400 border transition-all ${
                    gamification?.activeForm === 'yellow' ? 'border-white scale-110 shadow-md ring-2 ring-gold-primary' : 'border-transparent opacity-60'
                  }`}
                  title="Mèo Vàng"
                />

                {/* Bóng tối (Cấp 3) */}
                {getLevel(gamification?.bondPoints || 0) >= 3 ? (
                  <button
                    onClick={() => {
                      const updated = { ...gamification, activeForm: 'shadow' as const };
                      setGamification(updated);
                      saveGamificationState(updated);
                    }}
                    className={`w-4 h-4 rounded-full bg-slate-800 border transition-all ${
                      gamification?.activeForm === 'shadow' ? 'border-white scale-110 shadow-md ring-2 ring-gold-primary' : 'border-transparent opacity-60'
                    }`}
                    title="Mèo Shadow"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-800/20 border border-dashed border-white/20 flex items-center justify-center text-[8px] cursor-not-allowed opacity-40" title="Khóa (Cấp 3)">🔒</div>
                )}

                {/* Tiên tri (Cấp 4) */}
                {getLevel(gamification?.bondPoints || 0) >= 4 ? (
                  <button
                    onClick={() => {
                      const updated = { ...gamification, activeForm: 'oracle' as const };
                      setGamification(updated);
                      saveGamificationState(updated);
                    }}
                    className={`w-4 h-4 rounded-full bg-slate-100 border transition-all ${
                      gamification?.activeForm === 'oracle' ? 'border-white scale-110 shadow-md ring-2 ring-gold-primary' : 'border-transparent opacity-60'
                    }`}
                    title="Mèo Tiên Tri"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-slate-100/20 border border-dashed border-white/20 flex items-center justify-center text-[8px] cursor-not-allowed opacity-40" title="Khóa (Cấp 4)">🔒</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
