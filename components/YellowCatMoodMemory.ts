// Module quản lý cá tính và ký ức cảm xúc của Mèo Vàng bằng LocalStorage

export interface Personality {
  curiosity: number;   // Tò mò: liếc mắt nhạy hơn
  mysticism: number;   // Tâm linh: hào quang sáng rộng hơn, mắt đọc bài xoáy nhanh
  playfulness: number; // Nghịch ngợm: hay nhúc nhích tai, vẫy đuôi khi nhàn rỗi
  wisdom: number;      // Triết lý: nói lời thoại sâu sắc cổ xưa hơn
}

export interface DrawHistoryEntry {
  slug: string;
  isReversed: boolean;
  timestamp: number;
}

const PERSONALITY_KEY = 'yellow_cat_personality_matrix';
const HISTORY_KEY = 'yellow_cat_draw_history';
const LAST_VISIT_KEY = 'yellow_cat_last_visit';

// Danh sách các lá bài mang năng lượng thử thách/nặng nề
const HEAVY_CARD_SLUGS = [
  'death',
  'the-tower',
  'the-devil',
  'three-of-swords',
  'five-of-swords',
  'nine-of-swords',
  'ten-of-swords',
];

// Danh sách các lá bài mang năng lượng tích cực mạnh để xóa giải tỏa an ủi
const POSITIVE_CARD_SLUGS = [
  'the-sun',
  'the-star',
  'the-world',
  'the-empress',
  'wheel-of-fortune',
];

export function getOrInitPersonality(): Personality {
  if (typeof window === 'undefined') {
    return { curiosity: 50, mysticism: 50, playfulness: 50, wisdom: 50 };
  }

  try {
    const saved = localStorage.getItem(PERSONALITY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Lỗi đọc personality từ localStorage', e);
  }

  // Khởi tạo ngẫu nhiên từ 20 đến 80
  const initial: Personality = {
    curiosity: Math.floor(20 + Math.random() * 61),
    mysticism: Math.floor(20 + Math.random() * 61),
    playfulness: Math.floor(20 + Math.random() * 61),
    wisdom: Math.floor(20 + Math.random() * 61),
  };

  try {
    localStorage.setItem(PERSONALITY_KEY, JSON.stringify(initial));
  } catch (e) {
    console.error('Lỗi ghi personality vào localStorage', e);
  }

  return initial;
}

export function incrementPersonalityStat(stat: keyof Personality, amount: number): Personality {
  const current = getOrInitPersonality();
  current[stat] = Math.min(100, Math.max(0, current[stat] + amount));

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(PERSONALITY_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Lỗi cập nhật personality', e);
    }
  }
  return current;
}

export function getDrawHistory(): DrawHistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Lỗi đọc lịch sử rút bài', e);
  }
  return [];
}

export function recordCardDraw(slug: string, isReversed: boolean): { history: DrawHistoryEntry[]; comfortMode: boolean } {
  if (typeof window === 'undefined') return { history: [], comfortMode: false };

  // Nếu rút trúng lá tích cực, tự động giải tỏa cảm xúc nặng nề (xóa bớt lịch sử bài xấu)
  let history = getDrawHistory();
  if (POSITIVE_CARD_SLUGS.includes(slug)) {
    // Lọc bỏ bớt các lá bài xấu cũ để giải tỏa an ủi
    history = history.filter(h => !HEAVY_CARD_SLUGS.includes(h.slug));
  }

  const newEntry: DrawHistoryEntry = {
    slug,
    isReversed,
    timestamp: Date.now(),
  };

  // Đẩy lên đầu và giữ tối đa 5 lá gần nhất
  history.unshift(newEntry);
  if (history.length > 5) {
    history = history.slice(0, 5);
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Lỗi ghi lịch sử rút bài', e);
  }

  // Tăng điểm chỉ số tùy thuộc vào loại bài rút
  if (HEAVY_CARD_SLUGS.includes(slug)) {
    incrementPersonalityStat('mysticism', 2); // Bài sâu sắc tăng tâm linh
  } else if (POSITIVE_CARD_SLUGS.includes(slug)) {
    incrementPersonalityStat('playfulness', 3); // Bài tích cực tăng vui tươi
  }

  const comfortMode = checkComfortingNeededInternal(history);
  return { history, comfortMode };
}

function checkComfortingNeededInternal(history: DrawHistoryEntry[]): boolean {
  // Đếm số lượng lá bài mang năng lượng thử thách trong 5 lá gần nhất
  const heavyCount = history.filter(h => HEAVY_CARD_SLUGS.includes(h.slug)).length;
  return heavyCount >= 3;
}

export function checkComfortingNeeded(): boolean {
  return checkComfortingNeededInternal(getDrawHistory());
}

export function checkReunion(): { isReunion: boolean; daysPassed: number } {
  if (typeof window === 'undefined') return { isReunion: false, daysPassed: 0 };

  const now = Date.now();
  const savedVisit = localStorage.getItem(LAST_VISIT_KEY);
  
  try {
    localStorage.setItem(LAST_VISIT_KEY, now.toString());
  } catch (e) {
    console.error('Lỗi ghi thời gian ghé thăm', e);
  }

  if (!savedVisit) {
    return { isReunion: false, daysPassed: 0 };
  }

  const lastTime = parseInt(savedVisit, 10);
  if (isNaN(lastTime)) {
    return { isReunion: false, daysPassed: 0 };
  }

  const diffMs = now - lastTime;
  const daysPassed = diffMs / (1000 * 60 * 60 * 24);

  // Nếu quá 7 ngày
  if (daysPassed >= 7) {
    return { isReunion: true, daysPassed };
  }

  return { isReunion: false, daysPassed };
}

// ── HOÀNG KIM GIAI ĐOẠN 4: Hệ thống Gamification ──

export interface GamificationState {
  bondPoints: number;
  hunger: number;
  lastSavedTime: number;
  activeForm: 'yellow' | 'shadow' | 'oracle';
  activeGlasses: boolean;
  activeBowTie: boolean;
}

const GAMIFICATION_KEY = 'yellow_cat_gamification';

export function getLevel(pts: number): number {
  if (pts >= 250) return 4;
  if (pts >= 120) return 3;
  if (pts >= 50) return 2;
  return 1;
}

export function getOrInitGamification(): GamificationState {
  if (typeof window === 'undefined') {
    return {
      bondPoints: 0,
      hunger: 100,
      lastSavedTime: Date.now(),
      activeForm: 'yellow',
      activeGlasses: false,
      activeBowTie: false,
    };
  }

  try {
    const saved = localStorage.getItem(GAMIFICATION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as GamificationState;
      // Tính toán độ đói giảm theo thời gian (4% mỗi giờ)
      const now = Date.now();
      const elapsedHours = (now - parsed.lastSavedTime) / (1000 * 60 * 60);
      if (elapsedHours > 0.5) { // Chỉ giảm nếu trôi qua hơn 30 phút để tránh dao động quá nhanh
        const hungerLoss = Math.floor(elapsedHours * 4);
        parsed.hunger = Math.max(0, parsed.hunger - hungerLoss);
        parsed.lastSavedTime = now;
        localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (e) {
    console.error('Lỗi đọc gamification từ LocalStorage', e);
  }

  const initial: GamificationState = {
    bondPoints: 0,
    hunger: 100,
    lastSavedTime: Date.now(),
    activeForm: 'yellow',
    activeGlasses: false,
    activeBowTie: false,
  };

  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(initial));
  } catch (e) {
    console.error('Lỗi ghi gamification vào LocalStorage', e);
  }

  return initial;
}

export function saveGamificationState(state: GamificationState): void {
  if (typeof window === 'undefined') return;
  state.lastSavedTime = Date.now();
  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Lỗi lưu gamification', e);
  }
}

export function updateGamification(
  pointsDiff: number,
  hungerDiff: number
): { state: GamificationState; isLevelUp: boolean; oldLevel: number; newLevel: number } {
  const current = getOrInitGamification();
  const oldLevel = getLevel(current.bondPoints);

  current.bondPoints = Math.min(9999, Math.max(0, current.bondPoints + pointsDiff));
  current.hunger = Math.min(100, Math.max(0, current.hunger + hungerDiff));
  current.lastSavedTime = Date.now();

  const newLevel = getLevel(current.bondPoints);
  const isLevelUp = newLevel > oldLevel;

  // Tự động vô hiệu các phụ kiện/hình thái nếu điểm bị giảm bất thường (nếu có reset)
  if (newLevel < 4 && current.activeForm === 'oracle') current.activeForm = 'yellow';
  if (newLevel < 3 && current.activeForm === 'shadow') current.activeForm = 'yellow';
  if (newLevel < 3) current.activeGlasses = false;
  if (newLevel < 2) current.activeBowTie = false;

  saveGamificationState(current);

  return { state: current, isLevelUp, oldLevel, newLevel };
}

