# 🐱✨ Kế Hoạch Triển Khai — TAROT MÈO VÀNG

## Mô Tả Dự Án

Website Tarot tương tác sử dụng bộ bài **Rider-Waite-Smith (RWS)** 78 lá, nhân vật dẫn dắt là **Mèo Vàng** phong cách Studio Ghibli, luận giải AI bằng tiếng Việt qua Google Gemini.

**Tech stack:** Next.js 14+ (App Router) · TypeScript · Tailwind CSS · Framer Motion · Google Gemini API

---

## ✅ Các Vấn Đề Đã Xác Nhận

| Vấn đề | Kết luận |
|--------|---------|
| File `Swords.webp` | **Là Ace of Swords** — map `ace-of-swords` → `Swords.webp` |
| Gemini Model | Dùng **fallback chain** với `gemini-2.5-flash` làm primary |
| API Key | **Client-side** — người dùng tự nhập, lưu `sessionStorage`, không lưu server |
| Nhân vật Mèo Vàng | **Tự tạo** bằng SVG inline + CSS animation |

---

## Thay Đổi Kiến Trúc Quan Trọng

> [!IMPORTANT]
> ### API Key Client-Side — Thay đổi so với spec gốc
> Spec gốc yêu cầu API key bảo mật server-side qua API Route. Theo yêu cầu mới:
> - **Người dùng tự nhập API key** trong UI (modal/drawer settings)
> - Key được lưu trong **`sessionStorage`** (tự xóa khi đóng tab)
> - Gọi Gemini **trực tiếp từ client** qua `@google/generative-ai` SDK
> - **Không cần** API route `/api/interpret` → giảm complexity
> - **Không cần** `.env.local` cho Gemini key → deploy Vercel đơn giản hơn
>
> **Trade-off:** Key nằm trong browser memory, nhưng đây là key cá nhân của user và user chủ động chọn cách này.

> [!IMPORTANT]
> ### Gemini Model Fallback Chain
> Thay vì hardcode 1 model, hệ thống sẽ **tự động thử lần lượt** các model cho đến khi thành công:
> ```typescript
> const FALLBACK_MODEL_ORDER = [
>   'gemini-2.5-flash',          // Primary — nhanh, free tier tốt
>   'gemini-flash-latest',       // Fallback 1
>   'gemini-3-flash-preview',    // Fallback 2
>   'gemini-3.1-flash-lite-preview',
>   'gemini-pro-latest',
>   'gemini-2.5-pro',
>   'gemini-3.1-pro-preview',
> ] as const;
> ```
> User cũng có thể chọn model cụ thể trong settings.

---

## Phân Tích File Ảnh — ĐÃ XÁC NHẬN ĐẦY ĐỦ

### Tổng cộng: **78 files .webp** ✅

```
ImageTarrot/
├── MajorArcana/          # 22 files ✅
│   ├── TheFool.webp, TheMagician.webp, TheHighPriestess.webp
│   ├── TheEmpress.webp, TheEmperor.webp, TheHierophant.webp
│   ├── TheLovers.webp, Chariot.webp, Strength.webp
│   ├── TheHermit.webp, WheelofFortune.webp, Justice.webp
│   ├── TheHangedMan.webp, Death.webp, Temperance.webp
│   ├── TheDevil.webp, TheTower.webp, TheStar.webp
│   ├── TheMoon.webp, TheSun.webp, Judgement.webp
│   └── TheWorld.webp
│
├── MinorArcana/
│   ├── Wands/            # 14 files ✅ (AceofWands → KingofWands)
│   ├── Cups/             # 14 files ✅ (AceofCups → KingofCups)
│   ├── Swords/           # 14 files ✅ (Swords.webp = Ace of Swords)
│   └── Pentacles/        # 14 files ✅ (AceofPentacles → KingofPentacles)
```

### Bảng Mapping Slug ↔ File Path (trích mẫu)

| Slug (URL & code) | File thực tế | Ghi chú |
|---|---|---|
| `the-fool` | `MajorArcana/TheFool.webp` | |
| `the-chariot` | `MajorArcana/Chariot.webp` | ⚠️ Không có prefix "The" |
| `strength` | `MajorArcana/Strength.webp` | |
| `ace-of-swords` | `MinorArcana/Swords/Swords.webp` | ⚠️ Tên gốc khác biệt |
| `ace-of-wands` | `MinorArcana/Wands/AceofWands.webp` | |
| `king-of-pentacles` | `MinorArcana/Pentacles/KingofPentacles.webp` | |

> [!NOTE]
> Một số Major Arcana không có prefix "The" trong filename (Chariot, Strength, Justice, Death, Temperance, Judgement). Tất cả đều được xử lý qua `cardImageMap`.

---

## Proposed Changes — 11 Steps

---

### Step 1: Project Setup

#### [NEW] Khởi tạo Next.js project tại `d:\YellowCatTarot\`

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir=false
npm install framer-motion @google/generative-ai
```

**Cấu trúc thư mục sau setup:**
```
d:\YellowCatTarot\
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Landing page
│   └── globals.css         # Theme variables, animations
├── components/             # Shared components
├── lib/                    # Data & utilities
├── public/
│   └── cards/              # ← Copy từ ImageTarrot/
│       ├── MajorArcana/
│       └── MinorArcana/
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

#### [NEW] [globals.css](file:///d:/YellowCatTarot/app/globals.css)
- CSS custom properties: bảng màu Ghibli (Mục 5.2 spec)
- Dark theme only — `--bg-deep: #0d0d1a`
- Animation keyframes: `@keyframes particleDust`, `@keyframes starTwinkle`, `@keyframes glowPulse`, `@keyframes typewriter`
- Card flip 3D base: `perspective`, `backface-visibility`
- Tailwind `@layer` extensions

#### [NEW] [layout.tsx](file:///d:/YellowCatTarot/app/layout.tsx)
- Google Fonts: `Cinzel`, `Cinzel_Decorative`, `Lora`, `Inter` — subset `latin,vietnamese`
- Root metadata: title "Tarot Mèo Vàng", description tiếng Việt, OG tags
- Dark background body
- Navigation component

#### [NEW] [tailwind.config.ts](file:///d:/YellowCatTarot/tailwind.config.ts)
- Extend colors: `gold`, `mystic`, `forest`, `ghibli-sky`, `star-white`
- Extend fontFamily: `cinzel`, `cinzel-decorative`, `lora`, `inter`
- Custom animations: `flip`, `float`, `glow`, `twinkle`

#### Copy ảnh lá bài
```bash
# Copy ImageTarrot/ → public/cards/ giữ nguyên cấu trúc
xcopy /E /I "ImageTarrot" "public\cards"
```

---

### Step 2: Card Data & Image Mapping

#### [NEW] [cards-data.ts](file:///d:/YellowCatTarot/lib/cards-data.ts)

**File lớn nhất và quan trọng nhất** — chứa toàn bộ dữ liệu 78 lá:

```typescript
export interface TarotCard {
  id: number;                    // 0–77
  slug: string;                  // kebab-case, URL param
  nameEn: string;
  nameVi: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: string;
  keywordsVi: string[];          // 3–5 từ khóa
  meaningUpright: string;        // ~100 chữ tiếng Việt
  meaningReversed: string;       // ~100 chữ tiếng Việt
  imagePath: string;             // Đường dẫn file thực tế trong /public/cards/
}

// Helper functions
export function getCardBySlug(slug: string): TarotCard | undefined;
export function getCardsByArcana(arcana: 'major' | 'minor'): TarotCard[];
export function getCardsBySuit(suit: string): TarotCard[];
export function searchCards(query: string): TarotCard[];
export function getRandomCards(count: number): TarotCard[]; // Fisher-Yates shuffle
export function getDailyCard(date: Date): TarotCard;        // Seeded random
```

**Ý nghĩa tĩnh (Option B):** Hardcode ~100 chữ tiếng Việt cho meaningUpright + meaningReversed mỗi lá.

#### [NEW] [spreads.ts](file:///d:/YellowCatTarot/lib/spreads.ts)
```typescript
export interface SpreadPosition {
  id: number;
  nameVi: string;
  description: string;
}

export interface SpreadType {
  type: 'single' | 'three-card' | 'celtic-cross';
  nameVi: string;
  positions: SpreadPosition[];
}
```

---

### Step 3: Component TarotCard + CardBack

#### [NEW] [TarotCard.tsx](file:///d:/YellowCatTarot/components/TarotCard.tsx)
- `next/image` với ảnh lá bài
- **Flip 3D**: Framer Motion `rotateY(0→180°)`, `backfaceVisibility: hidden`, duration 0.6s
- Prop `isReversed`: `rotate(180deg)` + badge "↩ NGƯỢC" (màu `--gold-dark`)
- Prop `isFlipped`: control flip state
- Hover: `translateY(-8px)` + `box-shadow: 0 0 20px var(--gold-glow)`
- `alt` text: `"Lá bài Tarot [Tên VI] - [Xuôi/Ngược]"`
- Variants: `size="sm" | "md" | "lg"` cho gallery vs detail vs reading

#### [NEW] [CardBack.tsx](file:///d:/YellowCatTarot/components/CardBack.tsx)
- **100% CSS + SVG inline** — không cần ảnh ngoài
- Nền: `linear-gradient(135deg, #1a1a3e, #0d0d2b)`
- Trung tâm: SVG inline — trăng lưỡi liềm + bóng mèo ngồi (silhouette)
- Border: `2px solid var(--gold-light)` + repeating pattern (ngôi sao nhỏ CSS)
- Subtle animation: glow pulse nhẹ trên border

---

### Step 4: Gallery `/cards`

#### [NEW] [CardGrid.tsx](file:///d:/YellowCatTarot/components/CardGrid.tsx)
- CSS Grid responsive: `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))`
- Tailwind: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`
- Mỗi item: TarotCard (sm) + tên VI + tên EN muted
- Lazy loading: `loading="lazy"` + skeleton placeholder (shimmer animation)
- Framer Motion `staggerChildren` khi render grid
- Click → navigate `/cards/[slug]`

#### [NEW] [FilterBar.tsx](file:///d:/YellowCatTarot/components/FilterBar.tsx)
- Row 1: Toggle buttons — `Tất Cả` | `Đại Bí Ẩn (22)` | `Tiểu Bí Ẩn (56)`
- Row 2 (conditional): Suit buttons — `🔥 Quyền Trượng` | `💧 Thánh Bôi` | `⚔️ Kiếm` | `🪙 Tiền Vàng`
- Row 3: Search input with icon, debounced 300ms
- Styled: glass-morphism background, gold border, rounded pills
- State managed via URL search params (shareable filters)

#### [NEW] [app/cards/page.tsx](file:///d:/YellowCatTarot/app/cards/page.tsx)
- Header: "Bộ Bài Rider-Waite-Smith" + counter badge "78 lá bài"
- FilterBar + CardGrid
- Section dividers khi filter = "Tất Cả": "✦ Đại Bí Ẩn (22 lá)" → grid → "✦ Quyền Trượng (14 lá)" → ...
- `generateMetadata()`: title "Bộ Bài 78 Lá — Tarot Mèo Vàng"

---

### Step 5: Card Detail `/cards/[slug]`

#### [NEW] [app/cards/\[slug\]/page.tsx](file:///d:/YellowCatTarot/app/cards/[slug]/page.tsx)

**Desktop layout (2 cột):**
```
┌──────────────────────────────────────────┐
│ Breadcrumb: Trang Chủ > Bộ Bài > [Tên]  │
├─────────────────┬────────────────────────┤
│                 │  Kẻ Hề (Cinzel, lớn)   │
│   [Ảnh lá bài]  │  The Fool (muted)      │
│   400px+ width  │                        │
│   border vàng   │  ☆ Đại Bí Ẩn · #0      │
│   glow nhẹ      │                        │
│                 │  Tags: khởi đầu, tự do  │
│                 │                        │
│                 │  ▸ Ý Nghĩa Xuôi ✦      │
│                 │  [100 chữ tiếng Việt]   │
│                 │                        │
│                 │  ▸ Ý Nghĩa Ngược ↩     │
│                 │  [100 chữ tiếng Việt]   │
│                 │                        │
│                 │  [✨ Hỏi Mèo Vàng]     │
├─────────────────┴────────────────────────┤
│ Prev/Next card navigation                │
└──────────────────────────────────────────┘
```

- Mobile: stack 1 cột
- `generateMetadata()` dynamic: title "[Tên VI] — Tarot Mèo Vàng"
- Nút "Hỏi Mèo Vàng" → mở drawer gọi Gemini (cần API key)

---

### Step 6: Gemini Client-Side Integration

> [!NOTE]
> Thay đổi lớn so với spec gốc: **không dùng API route**, gọi Gemini trực tiếp từ client.

#### [NEW] [gemini.ts](file:///d:/YellowCatTarot/lib/gemini.ts)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_MODEL_ORDER = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-pro-latest',
  'gemini-2.5-pro',
  'gemini-3.1-pro-preview',
] as const;

// System prompt nhân cách Mèo Vàng (Mục 7.3 spec)
const YELLOW_CAT_SYSTEM_PROMPT = `...`;

// Thử lần lượt models, trả về kết quả đầu tiên thành công
export async function interpretCards(
  apiKey: string,
  cards: CardReading[],
  spreadType: SpreadType,
  userQuestion?: string,
  preferredModel?: string
): Promise<{ interpretation: string; modelUsed: string }>;
```

#### [NEW] [ApiKeyProvider.tsx](file:///d:/YellowCatTarot/components/ApiKeyProvider.tsx)
- React Context: `ApiKeyContext` — cung cấp key cho toàn app
- Key lưu `sessionStorage` (xóa khi đóng tab)
- Không bao giờ lưu `localStorage` hay gửi lên server

#### [NEW] [ApiKeyModal.tsx](file:///d:/YellowCatTarot/components/ApiKeyModal.tsx)
- Modal nhập API key khi lần đầu gọi AI
- Input type password (ẩn key)
- Link hướng dẫn lấy key: [AI Studio](https://aistudio.google.com/app/apikey)
- Nút "Test Key" — gọi thử 1 request nhỏ
- Checkbox "Nhớ trong phiên này" (sessionStorage)
- Option chọn model ưa thích (dropdown từ FALLBACK_MODEL_ORDER)

#### [DELETE] ~~app/api/interpret/route.ts~~ — Không cần API route

---

### Step 7: Single Card Reading `/reading/single`

#### [NEW] [CardDeck.tsx](file:///d:/YellowCatTarot/components/CardDeck.tsx)
- **Phase 1 — Input:** Textarea câu hỏi (optional) + nút "🃏 Xáo Bài"
- **Phase 2 — Shuffle:** 
  - Framer Motion: cards fan out từ stack → spread → shuffle → fan arc
  - Spring animation, duration ~1.5s
  - Mèo Vàng → `shuffle` state
- **Phase 3 — Pick:** 
  - 9 lá úp theo vòng cung (arc layout)
  - Hover: float lên, subtle glow
  - Text: *"Chọn lá bài mà bạn cảm thấy thu hút..."*
- **Phase 4 — Reveal:**
  - Click → flip 3D (0.6s)
  - Random `isReversed` (50/50)
  - Tên lá + trạng thái badge hiện ra

#### [NEW] [AIInterpretation.tsx](file:///d:/YellowCatTarot/components/AIInterpretation.tsx)
- **Typewriter effect:** Render text từng ký tự, speed ~30ms/char
- Cursor nhấp nháy (CSS `animation: blink 1s infinite`)
- Markdown rendering (bold, paragraphs, emoji)
- Loading state: Mèo Vàng `reading` + spinner vàng orbital
- Error state: Mèo Vàng `surprised` + message + retry button
- Nếu chưa có API key → trigger ApiKeyModal

#### [NEW] [app/reading/single/page.tsx](file:///d:/YellowCatTarot/app/reading/single/page.tsx)
- State machine 7 bước (Mục 6.5 spec):
  ```
  INPUT → SHUFFLING → PICKING → REVEALING → RESULT → INTERPRETING → COMPLETE
  ```
- Mỗi bước có Mèo Vàng ở trạng thái phù hợp
- Kết thúc: 3 nút — "🔄 Rút Lại" / "📋 Copy" / "🏠 Về Trang Chủ"
- Copy: format text đẹp (tên lá + trạng thái + full luận giải)

---

### Step 8: Three-Card Spread `/reading/three-card`

#### [NEW] [ReadingBoard.tsx](file:///d:/YellowCatTarot/components/ReadingBoard.tsx)
- Layout 3 vị trí hàng ngang:
  ```
  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │ QUÁ KHỨ  │  │ HIỆN TẠI │  │ TƯƠNG LAI│
  │  [Card]  │  │  [Card]  │  │  [Card]  │
  └─────────┘  └─────────┘  └─────────┘
  ```
- Label vị trí phía trên mỗi card (pill badge)
- Mobile: stack dọc hoặc horizontal scroll
- Sequential flip: card 1 → (delay 0.4s) → card 2 → (delay 0.4s) → card 3

#### [NEW] [app/reading/three-card/page.tsx](file:///d:/YellowCatTarot/app/reading/three-card/page.tsx)
- 2 chế độ:
  - **Manual:** Click deck 3 lần để chọn 3 lá
  - **Auto:** Nút "✨ Rút 3 Lá Ngẫu Nhiên" → Fisher-Yates shuffle
- Đảm bảo 3 lá khác nhau, mỗi lá random `isReversed` độc lập
- Nút "✨ Luận Giải Toàn Bộ Trải Bài" → gọi Gemini
- AI: luận giải từng lá theo vị trí + cái nhìn tổng thể (400–600 từ)

---

### Step 9: Nhân Vật Mèo Vàng (SVG + CSS Animation)

#### [NEW] [YellowCat.tsx](file:///d:/YellowCatTarot/components/YellowCat.tsx)

**SVG inline animated character** — tự vẽ, không cần file ảnh ngoài:

**Thiết kế:**
- Lông vàng `var(--gold-primary)` (#f4a261) 
- Mắt xanh ngọc lấp lánh
- Vòng cổ huy hiệu trăng + sao
- Đuôi dài cong

**5 trạng thái với CSS keyframes:**

| State | Animation | Kỹ thuật |
|-------|-----------|---------|
| `idle` | Đuôi vẫy nhẹ, mắt chớp đều | `@keyframes tailWag`, `@keyframes blink` |
| `reading` | Mắt phát sáng, nhìn xuống | `filter: drop-shadow(glow)`, transform subtle |
| `sleeping` | Cuộn tròn, ZZZ bay lên | `@keyframes zzz` — text elements float up |
| `surprised` | Tai dựng, mắt mở to, "!" | Scale transform ears, eye pupils dilate |
| `happy` | Đuôi vẫy nhanh, mắt nheo | Faster tailWag, squint eyes |

**Props:**
```typescript
interface YellowCatProps {
  state: 'idle' | 'reading' | 'sleeping' | 'surprised' | 'happy';
  size?: 'sm' | 'md' | 'lg' | 'hero';    // 32px → 300px
  speechBubble?: string;                   // Text bubble gợi ý
  className?: string;
}
```

**Xuất hiện tại:**
- Navigation: `sm` size (32×32px logo)
- Hero trang chủ: `hero` size
- Reading pages: `md` size, sidebar/floating
- Loading/Error: `md` size + speech bubble

---

### Step 10: Trang Chủ + Navigation + Reading Hub

#### [NEW] [Navigation.tsx](file:///d:/YellowCatTarot/components/Navigation.tsx)
- **Desktop:** Logo Mèo Vàng (32px) + "Tarot Mèo Vàng" | links: Bộ Bài · Rút Bài · ⚙️ Settings
- **Mobile:** Hamburger → slide-out menu
- Glass-morphism background: `backdrop-filter: blur(10px)`, semi-transparent
- Active link: gold underline + glow
- Sticky top, z-index cao
- Settings icon → mở ApiKeyModal

#### [NEW] [app/page.tsx](file:///d:/YellowCatTarot/app/page.tsx) — Landing Page

```
┌─────────────────────────────────────────────┐
│              ★ NAVIGATION BAR ★              │
├─────────────────────────────────────────────┤
│                                             │
│     ✨ Background: rừng đêm + sao bay ✨     │
│           particle dust animation            │
│                                             │
│          🐱 MÈO VÀNG (hero size)            │
│              ngồi trên bàn gỗ               │
│                                             │
│        ╔═══════════════════════╗             │
│        ║   TAROT MÈO VÀNG     ║   Cinzel    │
│        ╚═══════════════════════╝   gold glow │
│                                             │
│    "Khám phá thông điệp vũ trụ cùng         │
│         chú mèo huyền bí"      Lora italic  │
│                                             │
│    [🃏 Rút Bài Ngay]  [📚 Xem Bộ Bài]       │
│                                             │
│              ↓ scroll indicator               │
├─────────────────────────────────────────────┤
│                                             │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│   │ 78 Lá   │ │ Nhiều   │ │ Luận    │      │
│   │ Bài RWS │ │ Kiểu    │ │ Giải AI │      │
│   │         │ │ Trải    │ │ Gemini  │      │
│   └─────────┘ └─────────┘ └─────────┘      │
│         Feature Tiles (3 cột)                │
├─────────────────────────────────────────────┤
│   🌙 Lá Bài Ngày Hôm Nay                    │
│   [Daily Card — seeded random theo date]     │
├─────────────────────────────────────────────┤
│           Footer: credits RWS                │
└─────────────────────────────────────────────┘
```

- **Particles:** Canvas hoặc CSS keyframes — hạt bụi vàng lơ lửng
- **Stars:** Div elements với `@keyframes twinkle` async (random delay)
- **Hero CTA buttons:** Large, gold gradient, hover glow effect

#### [NEW] [app/reading/page.tsx](file:///d:/YellowCatTarot/app/reading/page.tsx) — Reading Hub
- 3 card lựa chọn lớn:
  - **Một Lá** → `/reading/single` — "Câu trả lời tức thì"
  - **Ba Lá** → `/reading/three-card` — "Quá Khứ · Hiện Tại · Tương Lai"
  - **Celtic Cross** → badge "🔮 Sắp Ra Mắt" (disabled, mờ)
- Mèo Vàng `idle` + speech bubble: *"Bạn muốn hỏi vũ trụ điều gì hôm nay?"*

#### [NEW] [app/reading/celtic-cross/page.tsx](file:///d:/YellowCatTarot/app/reading/celtic-cross/page.tsx)
- Placeholder: Mèo Vàng `sleeping` + "Tính năng đang được phát triển..."
- Animated sparkles + "Sắp Ra Mắt" text

---

### Step 11: Polish, Error Handling & Testing

#### Error Handling
- React Error Boundary wrapper cho reading sections
- Gemini error messages thân thiện (Mèo Vàng voice):
  - 429: *"Mèo Vàng đang bận xem bài cho quá nhiều người..."*
  - Network: *"Mèo Vàng không kết nối được với vũ trụ..."*
  - No key: *"Mèo Vàng cần chìa khóa ma thuật (API Key) để đọc bài..."*

#### Copy to Clipboard
```
📋 Format copy:
━━━━━━━━━━━━━━━━━━━━
🐱 TAROT MÈO VÀNG
━━━━━━━━━━━━━━━━━━━━
🃏 Lá bài: [Tên VI] ([Tên EN])
⚡ Trạng thái: Xuôi ✦ / Ngược ↩
📅 Ngày: [date]

✨ Luận giải từ Mèo Vàng:
[Full AI interpretation]
━━━━━━━━━━━━━━━━━━━━
```

#### Accessibility
- `alt` text tất cả ảnh: `"Lá bài Tarot [Tên VI] - [Trạng thái]"`
- `aria-live="polite"` cho vùng AI interpretation
- Keyboard navigation: Tab qua card grid, Enter chọn lá
- Focus visible styles (gold outline)

#### SEO
- Trang chủ: `<title>Tarot Mèo Vàng — Khám Phá Thông Điệp Vũ Trụ</title>`
- Cards gallery: `<title>Bộ Bài 78 Lá Rider-Waite-Smith — Tarot Mèo Vàng</title>`
- Card detail: `generateMetadata()` — `<title>[Tên VI] — Tarot Mèo Vàng</title>`
- Reading: `<title>Rút Bài Tarot — Tarot Mèo Vàng</title>`

#### Performance
- `next/image`: lazy load mặc định, `priority` chỉ cho hero + selected card
- Skeleton shimmer cho card grid loading
- Code splitting: reading pages chỉ load khi navigate

---

## Tổng Kết Files

| Thể loại | Files | Chi tiết |
|----------|-------|---------|
| **Components** | 10 | TarotCard, CardBack, CardDeck, CardGrid, FilterBar, ReadingBoard, AIInterpretation, YellowCat, Navigation, ApiKeyModal/Provider |
| **Pages** | 7 | Home, Cards Gallery, Card Detail, Reading Hub, Single, Three-Card, Celtic Cross placeholder |
| **Lib/Data** | 3 | cards-data.ts, spreads.ts, gemini.ts |
| **Config** | 4 | layout.tsx, globals.css, tailwind.config.ts, next.config.js |
| **Tổng** | **~24 files** | |

---

## Verification Plan

### Build & Lint
```bash
npm run build   # TypeScript compile check
npm run lint     # ESLint check
```

### Browser Testing (Manual)
- [ ] **Trang chủ:** Hero render, particles, star twinkling, CTA buttons, daily card
- [ ] **Gallery:** 78 lá load đúng ảnh, filter hoạt động (Major/Minor/Suit), search tiếng Việt
- [ ] **Card Detail:** Ảnh, tên, keywords, ý nghĩa xuôi/ngược, breadcrumb
- [ ] **Single Reading:** 7-step flow end-to-end, flip animation, reversed badge
- [ ] **Three-Card:** 3 lá khác nhau, sequential flip, AI luận giải tổng thể
- [ ] **API Key:** Modal nhập key, test key, sessionStorage persistence, model selection
- [ ] **Gemini AI:** Typewriter effect, fallback model chain, error messages
- [ ] **Mèo Vàng:** 5 trạng thái chuyển đổi đúng context, speech bubbles
- [ ] **Responsive:** Mobile (375px), Tablet (768px), Desktop (1440px)
- [ ] **Fonts:** Tiếng Việt có dấu hiển thị đúng (ă, ơ, ư, ê, ô, đ...)
- [ ] **Dark mode:** Không có flash trắng, nhất quán toàn trang
- [ ] **Copy:** Format text đẹp, paste vào notepad/chat kiểm tra
- [ ] **Mapping ảnh:** Kiểm tra đặc biệt `ace-of-swords` (Swords.webp) và các Major Arcana không prefix "The"
