export interface CardPlacementResult {
  x: number;
  y: number;
  rotation: number;
  label: string;
}

export type SpreadLayoutType =
  | 'auto'
  | 'single'
  | 'three-card'
  | 'five-card'
  | 'relationship'
  | 'horseshoe'
  | 'celtic-cross'
  | 'wheel-of-year'
  | 'mandala'
  | 'full-deck'
  | 'tree-of-life-78'
  | 'etteilla-78'
  | 'grid';

export interface SpreadPresetInfo {
  id: SpreadLayoutType;
  nameVi: string;
  icon: string;
  recommendedCards: number;
  description: string;
}

export const SPREAD_PRESETS: SpreadPresetInfo[] = [
  { id: 'auto', nameVi: 'Tự Động Theo Số Lá', icon: '🪄', recommendedCards: 0, description: 'Tự nhận diện số lá bài và sắp xếp sơ đồ chuẩn' },
  { id: 'single', nameVi: 'Đơn Lá (1 Lá)', icon: '🃏', recommendedCards: 1, description: '1 lá góc trên bên trái cho thông điệp ngày / câu hỏi đơn' },
  { id: 'three-card', nameVi: 'Quá Khứ - Hiện Tại - Tương Lai (3 Lá)', icon: '⏳', recommendedCards: 3, description: '3 lá xếp ngang từ trái qua phải (Quá khứ ➔ Hiện tại ➔ Tương lai)' },
  { id: 'five-card', nameVi: 'Ngũ Hành Thập Tự (5 Lá)', icon: '⭐', recommendedCards: 5, description: 'Sơ đồ hình chữ thập 5 lá (Hiện tại, Quá khứ, Tương lai, Nguồn gốc, Tiềm năng)' },
  { id: 'relationship', nameVi: 'Mối Quan Hệ (6-7 Lá)', icon: '💞', recommendedCards: 7, description: 'Sơ đồ đối sánh cảm xúc, suy nghĩ của Bạn và Đối Phương' },
  { id: 'horseshoe', nameVi: 'Móng Ngựa (7 Lá)', icon: '🧲', recommendedCards: 7, description: 'Sơ đồ hình cung Móng Ngựa cho góc nhìn toàn cảnh vấn đề' },
  { id: 'celtic-cross', nameVi: 'Thập Tự Celtic (10 Lá)', icon: '✝️', recommendedCards: 10, description: 'Sơ đồ huyền thoại 10 lá phân tích chi tiết sâu sắc' },
  { id: 'wheel-of-year', nameVi: 'Bánh Xe 12 Tháng (12 Lá)', icon: '🎡', recommendedCards: 12, description: '12 lá tương ứng 12 tháng / 12 nhà hoàng đạo' },
  { id: 'mandala', nameVi: 'Mandala Tâm Linh (13 Lá)', icon: '🏵️', recommendedCards: 13, description: 'Vòng tròn Mandala 13 lá bao gồm Linh Hồn, 8 Hướng và 4 Nguyên Tố' },
  { id: 'full-deck', nameVi: 'Đại Sơ Đồ 78 Lá Bài (Full Deck)', icon: '🏛️', recommendedCards: 78, description: 'Đại sơ đồ huyền thoại toàn bộ 78 lá bài xếp 6 tầng Đại & Tiểu Ẩn Số' },
  { id: 'tree-of-life-78', nameVi: 'Cây Đời Kabbalah 78 Lá (Tree of Life)', icon: '🌳', recommendedCards: 78, description: 'Đại sơ đồ Cây Đời 78 lá (10 Sephiroth + 22 Con Đường + 4 Thế Giới Nguyên Tố)' },
  { id: 'etteilla-78', nameVi: 'Sơ Đồ Cổ Điển Etteilla 78 Lá', icon: '📜', recommendedCards: 78, description: 'Đại sơ đồ cổ điển Etteilla thế kỷ 18 phân bổ 78 lá thành 4 tầng Vận Mệnh' },
  { id: 'grid', nameVi: 'Lưới Ngang Ngăn Nắp', icon: '🧱', recommendedCards: 0, description: 'Sắp xếp hàng ngang từ góc trái sang phải đều đặn' },
];

export function getSpreadPresetInfo(presetId: SpreadLayoutType): SpreadPresetInfo {
  return SPREAD_PRESETS.find((p) => p.id === presetId) || SPREAD_PRESETS[0];
}

// ────────────────────────────────────────────
// Card Dimensions Reference:
//   CARD_WIDTH  = 120px
//   CARD_HEIGHT = 208px
//   BOARD_WIDTH = 1800px
//
// Spacing Rules (to prevent overlap & clipping):
//   Horizontal gap between cards: >= 140px (card width 120 + 20 margin)
//   Vertical gap between cards:   >= 230px (card height 208 + 22 margin)
//   Left margin from board edge:  >= 30px
//   Top margin from lane top:     >= 10px
// ────────────────────────────────────────────

const CARD_W = 120;
const CARD_H = 208;
const MIN_GAP_X = 145;  // horizontal spacing between card left edges
const MIN_GAP_Y = 235;  // vertical spacing between card top edges
const MARGIN_LEFT = 40;  // left padding from board edge
const MARGIN_TOP = 20;   // top padding within lane
export function getPresetLaneHeight(presetId: SpreadLayoutType): number {
  switch (presetId) {
    case 'full-deck':
    case 'tree-of-life-78':
    case 'etteilla-78':
      return 1550;
    case 'celtic-cross':
    case 'wheel-of-year':
    case 'mandala':
      return 850;
    case 'relationship':
    case 'five-card':
    case 'horseshoe':
      return 720;
    default:
      return 650;
  }
}

export function calculateRoundLaneTop(
  roundNumber: number,
  presetsMap?: Record<number, SpreadLayoutType>
): number {
  let top = 40;
  for (let r = 1; r < roundNumber; r++) {
    const preset = presetsMap?.[r] || 'auto';
    top += getPresetLaneHeight(preset) + 120; // 120px safe gap between round lanes
  }
  return top;
}

export function calculateRoundCardLayout(
  cardsCount: number,
  roundNumber: number,
  presetId: SpreadLayoutType = 'auto',
  presetsMap?: Record<number, SpreadLayoutType>
): CardPlacementResult[] {
  // Base Top-Left coordinates for each round lane (Dynamic dynamic laneTop with 120px spacing)
  const laneTop = calculateRoundLaneTop(roundNumber, presetsMap);

  let activeType = presetId;
  if (activeType === 'auto') {
    if (cardsCount === 1) activeType = 'single';
    else if (cardsCount === 3) activeType = 'three-card';
    else if (cardsCount === 5) activeType = 'five-card';
    else if (cardsCount === 6) activeType = 'relationship';
    else if (cardsCount === 7) activeType = 'horseshoe';
    else if (cardsCount === 10) activeType = 'celtic-cross';
    else if (cardsCount === 12) activeType = 'wheel-of-year';
    else if (cardsCount === 13) activeType = 'mandala';
    else if (cardsCount === 78) activeType = 'full-deck';
    else if (cardsCount >= 9 && cardsCount < 13 && cardsCount !== 10) activeType = 'mandala';
    else activeType = 'grid';
  }

  const results: CardPlacementResult[] = [];

  switch (activeType) {
    // ─── SINGLE CARD ────────────────────────────
    case 'single': {
      results.push({
        x: MARGIN_LEFT,
        y: laneTop + MARGIN_TOP,
        rotation: 0,
        label: `Vòng ${roundNumber} · Lá Bài Chủ Đạo`,
      });
      break;
    }

    // ─── 3-CARD: PAST / PRESENT / FUTURE ────────
    case 'three-card': {
      const labels = ['1. Quá Khứ (Past)', '2. Hiện Tại (Present)', '3. Tương Lai (Future)'];
      for (let i = 0; i < cardsCount; i++) {
        results.push({
          x: MARGIN_LEFT + i * MIN_GAP_X,
          y: laneTop + MARGIN_TOP,
          rotation: 0,
          label: labels[i] || `Vòng ${roundNumber} · Lá #${i + 1}`,
        });
      }
      break;
    }

    // ─── 5-CARD: CROSS (Thập Tự) ─────────────────
    //        [5. Crown]
    //  [2. Past] [1. Center] [3. Future]
    //        [4. Base]
    case 'five-card': {
      const labels = [
        '1. Hiện Tại (Center)',
        '2. Quá Khứ (Past)',
        '3. Tương Lai (Future)',
        '4. Nguồn Gốc (Base)',
        '5. Tiềm Năng (Crown)',
      ];
      const crossCX = MARGIN_LEFT + MIN_GAP_X;       // center column x
      const crossCY = laneTop + MARGIN_TOP + MIN_GAP_Y; // center row y

      const positions = [
        { x: crossCX, y: crossCY },                          // 1. Center
        { x: crossCX - MIN_GAP_X, y: crossCY },              // 2. Past (left)
        { x: crossCX + MIN_GAP_X, y: crossCY },              // 3. Future (right)
        { x: crossCX, y: crossCY + MIN_GAP_Y },              // 4. Base (below)
        { x: crossCX, y: crossCY - MIN_GAP_Y },              // 5. Crown (above)
      ];

      for (let i = 0; i < cardsCount; i++) {
        const pos = positions[i] || { x: MARGIN_LEFT + i * MIN_GAP_X, y: laneTop + MARGIN_TOP };
        results.push({
          x: pos.x,
          y: pos.y,
          rotation: 0,
          label: labels[i] || `Vòng ${roundNumber} · Lá #${i + 1}`,
        });
      }
      break;
    }

    // ─── RELATIONSHIP (6-7 CARDS): TWO COLUMNS + CENTER ──
    case 'relationship': {
      const labels = [
        '1. Suy Nghĩ Bạn',
        '2. Cảm Xúc Bạn',
        '3. Suy Nghĩ Đối Phương',
        '4. Cảm Xúc Đối Phương',
        '5. Năng Lượng Chung',
        '6. Thử Thách Mối Quan Hệ',
        '7. Tương Lai Kết Nối',
      ];
      // Left column (You), Center column (Shared), Right column (Partner)
      // Vertical spacing: MIN_GAP_Y between rows
      const colLeft = MARGIN_LEFT;
      const colCenter = MARGIN_LEFT + MIN_GAP_X * 2;
      const colRight = MARGIN_LEFT + MIN_GAP_X * 4;
      const row1Y = laneTop + MARGIN_TOP;
      const row2Y = row1Y + MIN_GAP_Y;

      const positions = [
        { x: colLeft, y: row1Y },      // 1. Your Thoughts
        { x: colLeft, y: row2Y },      // 2. Your Feelings
        { x: colRight, y: row1Y },     // 3. Partner Thoughts
        { x: colRight, y: row2Y },     // 4. Partner Feelings
        { x: colCenter, y: row1Y },    // 5. Shared Energy
        { x: colCenter, y: row1Y + Math.round(MIN_GAP_Y * 0.5) }, // 6. Challenge
        { x: colCenter, y: row2Y },    // 7. Future Connection
      ];
      for (let i = 0; i < cardsCount; i++) {
        const pos = positions[i] || { x: MARGIN_LEFT + i * MIN_GAP_X, y: row1Y };
        results.push({
          x: pos.x,
          y: pos.y,
          rotation: 0,
          label: labels[i] || `Vòng ${roundNumber} · Lá #${i + 1}`,
        });
      }
      break;
    }

    // ─── HORSESHOE (7 CARDS): U-ARC ─────────────
    case 'horseshoe': {
      const labels = [
        '1. Quá Khứ',
        '2. Hiện Tại',
        '3. Ảo Tưởng / Ẩn Số',
        '4. Thách Thức Trực Tiếp',
        '5. Tác Động Xung Quanh',
        '6. Lời Khuyên',
        '7. Kết Quả Cuối Cùng',
      ];
      const total = Math.min(7, cardsCount);
      const arcSpan = MIN_GAP_X * 6; // total horizontal span
      const centerArcX = MARGIN_LEFT + arcSpan / 2;
      for (let i = 0; i < cardsCount; i++) {
        if (i < 7) {
          const t = i / (total - 1 || 1);
          const x = centerArcX - arcSpan / 2 + t * arcSpan;
          const normX = (t - 0.5) * 2;
          const y = laneTop + MARGIN_TOP + (1 - normX * normX) * 90;
          const rot = normX * 10;
          results.push({
            x,
            y,
            rotation: Math.round(rot),
            label: labels[i] || `Vòng ${roundNumber} · Lá #${i + 1}`,
          });
        } else {
          results.push({
            x: MARGIN_LEFT + i * MIN_GAP_X,
            y: laneTop + MARGIN_TOP,
            rotation: 0,
            label: `Vòng ${roundNumber} · Lá #${i + 1}`,
          });
        }
      }
      break;
    }

    // ─── CELTIC CROSS (10 CARDS) ────────────────
    case 'celtic-cross': {
      const labels = [
        '1. Hiện Tại (Current)',
        '2. Thử Thách (Crossing)',
        '3. Nền Tảng (Foundation)',
        '4. Quá Khứ Gần (Recent Past)',
        '5. Tầm Nhìn (Crown)',
        '6. Tương Lai Gần (Near Future)',
        '7. Bản Thân (Self)',
        '8. Môi Trường (Environment)',
        '9. Hy Vọng & Lo Sợ (Hopes/Fears)',
        '10. Kết Quả Cuối (Outcome)',
      ];
      // Cross section center
      const crossCX = MARGIN_LEFT + MIN_GAP_X * 2;
      const crossCY = laneTop + MARGIN_TOP + CARD_H + 20; // enough room for Crown above

      // Staff column (right side)
      const staffX = crossCX + MIN_GAP_X * 2.5;

      const positions = [
        { x: crossCX, y: crossCY, rot: 0 },                          // 1. Current (center)
        { x: crossCX, y: crossCY, rot: 90 },                          // 2. Crossing (rotated 90°)
        { x: crossCX, y: crossCY + MIN_GAP_Y, rot: 0 },              // 3. Foundation (below)
        { x: crossCX - MIN_GAP_X, y: crossCY, rot: 0 },              // 4. Recent Past (left)
        { x: crossCX, y: crossCY - MIN_GAP_Y, rot: 0 },              // 5. Crown (above)
        { x: crossCX + MIN_GAP_X, y: crossCY, rot: 0 },              // 6. Near Future (right)
        { x: staffX, y: crossCY + MIN_GAP_Y, rot: 0 },               // 7. Self (staff bottom)
        { x: staffX, y: crossCY + Math.round(MIN_GAP_Y * 0.33), rot: 0 }, // 8. Environment
        { x: staffX, y: crossCY - Math.round(MIN_GAP_Y * 0.33), rot: 0 }, // 9. Hopes/Fears
        { x: staffX, y: crossCY - MIN_GAP_Y, rot: 0 },               // 10. Outcome (staff top)
      ];
      for (let i = 0; i < cardsCount; i++) {
        const pos = positions[i] || { x: MARGIN_LEFT + i * MIN_GAP_X, y: laneTop + MARGIN_TOP, rot: 0 };
        results.push({
          x: pos.x,
          y: pos.y,
          rotation: pos.rot,
          label: labels[i] || `Vòng ${roundNumber} · Lá #${i + 1}`,
        });
      }
      break;
    }

    // ─── WHEEL OF THE YEAR (12 CARDS): CLOCK CIRCLE ──
    case 'wheel-of-year': {
      const labels = [
        '1. Tháng 1 / Nhà 1 (Bản Thân)',
        '2. Tháng 2 / Nhà 2 (Tài Chính)',
        '3. Tháng 3 / Nhà 3 (Giao Tiếp)',
        '4. Tháng 4 / Nhà 4 (Gia Đình)',
        '5. Tháng 5 / Nhà 5 (Sáng Tạo)',
        '6. Tháng 6 / Nhà 6 (Sức Khỏe)',
        '7. Tháng 7 / Nhà 7 (Đối Tác)',
        '8. Tháng 8 / Nhà 8 (Biến Đổi)',
        '9. Tháng 9 / Nhà 9 (Tri Thức)',
        '10. Tháng 10 / Nhà 10 (Sự Nghiệp)',
        '11. Tháng 11 / Nhà 11 (Cộng Đồng)',
        '12. Tháng 12 / Nhà 12 (Tâm Linh)',
      ];
      // Circle needs radius large enough that cards don't overlap
      // Arc spacing = 2*PI*r / 12 must be >= MIN_GAP_X for horizontal neighbors
      const radius = 200;
      const centerCircleX = MARGIN_LEFT + radius + CARD_W / 2;
      const cy = laneTop + MARGIN_TOP + radius + CARD_H / 2;

      for (let i = 0; i < cardsCount; i++) {
        if (i < 12) {
          const angleDeg = -90 + i * (360 / 12);
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = centerCircleX + radius * Math.cos(angleRad);
          const y = cy + radius * Math.sin(angleRad);
          results.push({
            x,
            y,
            rotation: 0,
            label: labels[i] || `Vòng ${roundNumber} · Lá #${i + 1}`,
          });
        } else {
          results.push({
            x: MARGIN_LEFT + i * MIN_GAP_X,
            y: laneTop + MARGIN_TOP,
            rotation: 0,
            label: `Vòng ${roundNumber} · Lá #${i + 1}`,
          });
        }
      }
      break;
    }

    // ─── MANDALA (13 CARDS): CENTER + 8 DIRECTIONS + 4 ELEMENTS ────
    case 'mandala': {
      const labels = [
        '1. Linh Hồn (Center)',
        '2. Hướng Bắc (Tri Thức & Sứ Mệnh)',
        '3. Hướng Đông Bắc (Cơ Hội & Quý Nhân)',
        '4. Hướng Đông (Khởi Đầu & Năng Lượng)',
        '5. Hướng Đông Nam (Tài Chính & Trú Ngụ)',
        '6. Hướng Nam (Đam Mê & Danh Tiếng)',
        '7. Hướng Tây Nam (Mối Quan Hệ & Kết Nối)',
        '8. Hướng Tây (Cảm Xúc & Trực Giác)',
        '9. Hướng Tây Bắc (Thử Thách & Nghiệp)',
        '10. Nguyên Tố Lửa (Ý Chí & Hành Động)',
        '11. Nguyên Tố Nước (Tình Cảm & Tâm Lý)',
        '12. Nguyên Tố Khí (Tư Duy & Trí Tuệ)',
        '13. Nguyên Tố Đất (Thực Tại & Kết Quả)',
      ];
      const radiusInner = 175;
      const radiusOuter = 265;
      const centerCircleX = MARGIN_LEFT + radiusOuter + CARD_W / 2 + 10;
      const cy = laneTop + MARGIN_TOP + radiusOuter + CARD_H / 2 - 30;

      for (let i = 0; i < cardsCount; i++) {
        if (i === 0) {
          results.push({
            x: centerCircleX,
            y: cy,
            rotation: 0,
            label: labels[0],
          });
        } else if (i < 9) {
          // 8 Inner Directions
          const angleDeg = -90 + (i - 1) * (360 / 8);
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = centerCircleX + radiusInner * Math.cos(angleRad);
          const y = cy + radiusInner * Math.sin(angleRad);
          results.push({
            x,
            y,
            rotation: 0,
            label: labels[i] || `Vòng ${roundNumber} · Hướng #${i}`,
          });
        } else if (i < 13) {
          // 4 Outer Corner Element Pillars
          const outerAngles = [-45, 45, 135, 225];
          const angleDeg = outerAngles[i - 9];
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = centerCircleX + radiusOuter * Math.cos(angleRad);
          const y = cy + radiusOuter * Math.sin(angleRad);
          results.push({
            x,
            y,
            rotation: 0,
            label: labels[i] || `Vòng ${roundNumber} · Nguyên Tố #${i - 8}`,
          });
        } else {
          const overflowIdx = i - 13;
          results.push({
            x: MARGIN_LEFT + overflowIdx * MIN_GAP_X,
            y: laneTop + MARGIN_TOP,
            rotation: 0,
            label: `Vòng ${roundNumber} · Lá #${i + 1}`,
          });
        }
      }
      break;
    }

    // ─── FULL DECK (78 CARDS): SPACIOUS GRAND TABLEAU (LARGE SOLAR RING + 4 DISTINCT CORNERS) ───────
    case 'full-deck': {
      const majorLabels = [
        '0. The Fool (Tâm Điểm)', 'I. The Magician', 'II. The High Priestess', 'III. The Empress', 'IV. The Emperor',
        'V. The Hierophant', 'VI. The Lovers', 'VII. The Chariot', 'VIII. Strength', 'IX. The Hermit',
        'X. Wheel of Fortune', 'XI. Justice', 'XII. The Hanged Man', 'XIII. Death', 'XIV. Temperance',
        'XV. The Devil', 'XVI. The Tower', 'XVII. The Star', 'XVIII. The Moon', 'XIX. The Sun',
        'XX. Judgement', 'XXI. The World'
      ];
      const rankNames = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'];

      // Center Solar Wheel for 22 Major Arcana Cards (Spacious radius)
      const centerX = 1350;
      const centerY = laneTop + MARGIN_TOP + 450;
      const radiusX = 410;
      const radiusY = 270;

      // 4 Corner Quadrants for 56 Minor Arcana (4 suits x 14 cards each)
      const quadGapX = 138;
      const quadGapY = 235;

      const topLeftX = 60;
      const topLeftY = laneTop + MARGIN_TOP + 30;

      const topRightX = 1860;
      const topRightY = laneTop + MARGIN_TOP + 30;

      const bottomLeftX = 60;
      const bottomLeftY = laneTop + MARGIN_TOP + 640;

      const bottomRightX = 1860;
      const bottomRightY = laneTop + MARGIN_TOP + 640;

      for (let i = 0; i < cardsCount; i++) {
        if (i === 0) {
          // Major 0: The Fool in the exact center
          results.push({
            x: centerX,
            y: centerY,
            rotation: 0,
            label: `Đại Ẩn Số · ${majorLabels[0]}`,
          });
        } else if (i < 22) {
          // Major 1-21 in a large oval ring around the center
          const angleDeg = -90 + (i - 1) * (360 / 21);
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = centerX + radiusX * Math.cos(angleRad);
          const y = centerY + radiusY * Math.sin(angleRad);
          results.push({
            x,
            y,
            rotation: Math.round(angleDeg / 8),
            label: `Đại Ẩn Số · ${majorLabels[i] || `#${i}`}`,
          });
        } else if (i < 36) {
          // Wands (14 cards: 2 rows of 7 in Top-Left)
          const idx = i - 22;
          const r = Math.floor(idx / 7);
          const c = idx % 7;
          results.push({
            x: topLeftX + c * quadGapX,
            y: topLeftY + r * quadGapY,
            rotation: 0,
            label: `Bộ Gậy (Lửa) · ${rankNames[idx] || `#${idx + 1}`}`,
          });
        } else if (i < 50) {
          // Cups (14 cards: 2 rows of 7 in Top-Right)
          const idx = i - 36;
          const r = Math.floor(idx / 7);
          const c = idx % 7;
          results.push({
            x: topRightX + c * quadGapX,
            y: topRightY + r * quadGapY,
            rotation: 0,
            label: `Bộ Cốc (Nước) · ${rankNames[idx] || `#${idx + 1}`}`,
          });
        } else if (i < 64) {
          // Swords (14 cards: 2 rows of 7 in Bottom-Left)
          const idx = i - 50;
          const r = Math.floor(idx / 7);
          const c = idx % 7;
          results.push({
            x: bottomLeftX + c * quadGapX,
            y: bottomLeftY + r * quadGapY,
            rotation: 0,
            label: `Bộ Kiếm (Khí) · ${rankNames[idx] || `#${idx + 1}`}`,
          });
        } else if (i < 78) {
          // Pentacles (14 cards: 2 rows of 7 in Bottom-Right)
          const idx = i - 64;
          const r = Math.floor(idx / 7);
          const c = idx % 7;
          results.push({
            x: bottomRightX + c * quadGapX,
            y: bottomRightY + r * quadGapY,
            rotation: 0,
            label: `Bộ Tiền (Đất) · ${rankNames[idx] || `#${idx + 1}`}`,
          });
        } else {
          // Overflow
          const overflowIdx = i - 78;
          results.push({
            x: MARGIN_LEFT + overflowIdx * MIN_GAP_X,
            y: laneTop + MARGIN_TOP,
            rotation: 0,
            label: `Vòng ${roundNumber} · Lá #${i + 1}`,
          });
        }
      }
      break;
    }

    // ─── TREE OF LIFE (78 CARDS): KABBALAH TREE OF LIFE + 4 ELEMENTAL WORLDS ───────
    case 'tree-of-life-78': {
      const sephirothLabels = [
        '1. Kether (Vương Miện)', '2. Chokmah (Tri Thức)', '3. Binah (Thấu Hiểu)',
        '4. Chesed (Lòng Bác Ái)', '5. Geburah (Nghiêm Luật)', '6. Tiphareth (Vẻ Đẹp Tâm Điểm)',
        '7. Netzach (Chiến Thắng)', '8. Hod (Vinh Quang)', '9. Yesod (Nền Tảng)', '10. Malkuth (Vương Quốc Thực Tại)'
      ];

      const pathLabels = [
        'Con Đường 11 (Kether-Chokmah)', 'Con Đường 12 (Kether-Binah)', 'Con Đường 13 (Kether-Tiphareth)',
        'Con Đường 14 (Chokmah-Binah)', 'Con Đường 15 (Chokmah-Tiphareth)', 'Con Đường 16 (Chokmah-Chesed)',
        'Con Đường 17 (Binah-Tiphareth)', 'Con Đường 18 (Binah-Geburah)', 'Con Đường 19 (Chesed-Geburah)',
        'Con Đường 20 (Chesed-Tiphareth)', 'Con Đường 21 (Chesed-Netzach)', 'Con Đường 22 (Geburah-Tiphareth)',
        'Con Đường 23 (Geburah-Hod)', 'Con Đường 24 (Tiphareth-Netzach)', 'Con Đường 25 (Tiphareth-Yesod)',
        'Con Đường 26 (Tiphareth-Hod)', 'Con Đường 27 (Netzach-Hod)', 'Con Đường 28 (Netzach-Yesod)',
        'Con Đường 29 (Netzach-Malkuth)', 'Con Đường 30 (Hod-Yesod)', 'Con Đường 31 (Hod-Malkuth)',
        'Con Đường 32 (Yesod-Malkuth)'
      ];

      const centerTreeX = 1350;
      const startTreeY = laneTop + MARGIN_TOP + 40;

      // 10 Sephiroth positions in Tree Pillars
      const sephPositions = [
        { x: centerTreeX, y: startTreeY },                       // 1. Kether
        { x: centerTreeX + 280, y: startTreeY + 120 },            // 2. Chokmah
        { x: centerTreeX - 280, y: startTreeY + 120 },            // 3. Binah
        { x: centerTreeX + 280, y: startTreeY + 340 },            // 4. Chesed
        { x: centerTreeX - 280, y: startTreeY + 340 },            // 5. Geburah
        { x: centerTreeX, y: startTreeY + 450 },                  // 6. Tiphareth (Heart)
        { x: centerTreeX + 280, y: startTreeY + 660 },            // 7. Netzach
        { x: centerTreeX - 280, y: startTreeY + 660 },            // 8. Hod
        { x: centerTreeX, y: startTreeY + 820 },                  // 9. Yesod
        { x: centerTreeX, y: startTreeY + 1010 },                 // 10. Malkuth
      ];

      // 4 Elemental Worlds (46 Minor Arcana Cards = 4 Quadrants x 11-12 Cards)
      const quadGapX = 135;
      const quadGapY = 225;

      const topLeftX = 60;
      const topLeftY = laneTop + MARGIN_TOP + 40;

      const topRightX = 1860;
      const topRightY = laneTop + MARGIN_TOP + 40;

      const bottomLeftX = 60;
      const bottomLeftY = laneTop + MARGIN_TOP + 640;

      const bottomRightX = 1860;
      const bottomRightY = laneTop + MARGIN_TOP + 640;

      for (let i = 0; i < cardsCount; i++) {
        if (i < 10) {
          // 10 Sephiroth Spheres
          const pos = sephPositions[i];
          results.push({
            x: pos.x,
            y: pos.y,
            rotation: 0,
            label: `Sephira · ${sephirothLabels[i]}`,
          });
        } else if (i < 32) {
          // 22 Major Arcana Paths
          const pathIdx = i - 10;
          const angleDeg = -90 + pathIdx * (360 / 22);
          const angleRad = (angleDeg * Math.PI) / 180;
          const x = centerTreeX + 440 * Math.cos(angleRad);
          const y = (startTreeY + 480) + 380 * Math.sin(angleRad);
          results.push({
            x,
            y,
            rotation: Math.round(angleDeg / 8),
            label: `Đại Ẩn Số · ${pathLabels[pathIdx] || `#${pathIdx + 11}`}`,
          });
        } else if (i < 43) {
          // Atziluth (Fire World - Top Left: 11 cards)
          const idx = i - 32;
          const r = Math.floor(idx / 6);
          const c = idx % 6;
          results.push({
            x: topLeftX + c * quadGapX,
            y: topLeftY + r * quadGapY,
            rotation: 0,
            label: `Thế Giới Atziluth (Lửa) · Lá #${idx + 1}`,
          });
        } else if (i < 54) {
          // Briah (Water World - Top Right: 11 cards)
          const idx = i - 43;
          const r = Math.floor(idx / 6);
          const c = idx % 6;
          results.push({
            x: topRightX + c * quadGapX,
            y: topRightY + r * quadGapY,
            rotation: 0,
            label: `Thế Giới Briah (Nước) · Lá #${idx + 1}`,
          });
        } else if (i < 66) {
          // Yetzirah (Air World - Bottom Left: 12 cards)
          const idx = i - 54;
          const r = Math.floor(idx / 6);
          const c = idx % 6;
          results.push({
            x: bottomLeftX + c * quadGapX,
            y: bottomLeftY + r * quadGapY,
            rotation: 0,
            label: `Thế Giới Yetzirah (Khí) · Lá #${idx + 1}`,
          });
        } else if (i < 78) {
          // Assiah (Earth World - Bottom Right: 12 cards)
          const idx = i - 66;
          const r = Math.floor(idx / 6);
          const c = idx % 6;
          results.push({
            x: bottomRightX + c * quadGapX,
            y: bottomRightY + r * quadGapY,
            rotation: 0,
            label: `Thế Giới Assiah (Đất) · Lá #${idx + 1}`,
          });
        } else {
          // Overflow
          const overflowIdx = i - 78;
          results.push({
            x: MARGIN_LEFT + overflowIdx * MIN_GAP_X,
            y: laneTop + MARGIN_TOP,
            rotation: 0,
            label: `Vòng ${roundNumber} · Lá #${i + 1}`,
          });
        }
      }
      break;
    }

    // ─── ETTEILLA (78 CARDS): 4 SPHERES OF DESTINY (SPIRITUAL, MATERIAL, EMOTIONAL, LIFE) ───
    case 'etteilla-78': {
      const spiritualLabels = [
        'Tầng 1 (Tâm Linh) · 1. Trí Tuệ Tối Cao', 'Tầng 1 (Tâm Linh) · 2. Ánh Sáng Tinh Thần',
        'Tầng 1 (Tâm Linh) · 3. Khát Vọng Tâm Linh', 'Tầng 1 (Tâm Linh) · 4. Trực Giác Bí Truyền',
        'Tầng 1 (Tâm Linh) · 5. Lý Trí Thấu Xuốt', 'Tầng 1 (Tâm Linh) · 6. Tình Yêu Thượng Đế',
        'Tầng 1 (Tâm Linh) · 7. Ý Chí Kiến Tạo', 'Tầng 1 (Tâm Linh) · 8. Sự Thật Vĩnh Hằng',
        'Tầng 1 (Tâm Linh) · 9. Bình Yên Tâm Thức', 'Tầng 1 (Tâm Linh) · 10. Trở Về Nguồn Cội',
        'Tầng 1 (Tâm Linh) · 11. Sự Giác Ngộ'
      ];

      const gapX = 138;
      const gapY = 235;

      // Tier 1: Spiritual & Mind Arc (11 cards in Top Crescent Arc)
      const centerArcX = 1350;
      const arcY = laneTop + MARGIN_TOP + 40;
      const arcWidth = 1400;

      // Tier 2: Physical & Material World (15 cards in Mid-Left: 2 rows x 8 cards)
      const matX = 60;
      const matY = laneTop + MARGIN_TOP + 320;

      // Tier 3: Emotional & Moral World (16 cards in Mid-Right: 2 rows x 8 cards)
      const emoX = 1860;
      const emoY = laneTop + MARGIN_TOP + 320;

      // Tier 4: Destiny & Life Circumstances (36 cards in Bottom Grid: 3 rows x 12 cards)
      const destX = 300;
      const destY = laneTop + MARGIN_TOP + 800;

      for (let i = 0; i < cardsCount; i++) {
        if (i < 11) {
          // Tier 1: 11 Spiritual Cards in Top Arc
          const t = i / 10;
          const x = centerArcX - arcWidth / 2 + t * arcWidth;
          const normX = (t - 0.5) * 2;
          const y = arcY + (1 - normX * normX) * 110;
          const rot = normX * 12;
          results.push({
            x,
            y,
            rotation: Math.round(rot),
            label: spiritualLabels[i] || `Etteilla Tầng 1 · Lá #${i + 1}`,
          });
        } else if (i < 26) {
          // Tier 2: 15 Physical & Material Cards (Mid-Left)
          const idx = i - 11;
          const r = Math.floor(idx / 8);
          const c = idx % 8;
          results.push({
            x: matX + c * gapX,
            y: matY + r * gapY,
            rotation: 0,
            label: `Tầng 2 (Vật Chất & Thực Tại) · Lá #${idx + 1}`,
          });
        } else if (i < 42) {
          // Tier 3: 16 Emotional & Moral Cards (Mid-Right)
          const idx = i - 26;
          const r = Math.floor(idx / 8);
          const c = idx % 8;
          results.push({
            x: emoX + c * gapX,
            y: emoY + r * gapY,
            rotation: 0,
            label: `Tầng 3 (Cảm Xúc & Đạo Đức) · Lá #${idx + 1}`,
          });
        } else if (i < 78) {
          // Tier 4: 36 Destiny & Life Circumstances Cards (Bottom Grid: 3 rows x 12 cards)
          const idx = i - 42;
          const r = Math.floor(idx / 12);
          const c = idx % 12;
          results.push({
            x: destX + c * gapX,
            y: destY + r * gapY,
            rotation: 0,
            label: `Tầng 4 (Vận Mệnh & Cuộc Sống) · Lá #${idx + 1}`,
          });
        } else {
          // Overflow
          const overflowIdx = i - 78;
          results.push({
            x: MARGIN_LEFT + overflowIdx * MIN_GAP_X,
            y: laneTop + MARGIN_TOP,
            rotation: 0,
            label: `Vòng ${roundNumber} · Lá #${i + 1}`,
          });
        }
      }
      break;
    }

    // ─── GRID (DEFAULT): NEAT HORIZONTAL ROWS ───
    case 'grid':
    default: {
      const cardsPerRow = 8;
      for (let i = 0; i < cardsCount; i++) {
        const row = Math.floor(i / cardsPerRow);
        const col = i % cardsPerRow;
        results.push({
          x: MARGIN_LEFT + col * MIN_GAP_X,
          y: laneTop + MARGIN_TOP + row * MIN_GAP_Y,
          rotation: 0,
          label: `Vòng ${roundNumber} · Lá #${i + 1}`,
        });
      }
      break;
    }
  }

  return results;
}
