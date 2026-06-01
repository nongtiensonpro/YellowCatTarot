# 🐱✨ TAROT MÈO VÀNG
## Vibe Coding Specification — Website Tarot Rider-Waite-Smith

> **Dành cho:** AI Coding Agent  
> **Phiên bản:** 1.0  
> **Mục tiêu:** Xây dựng website Tarot tương tác với nhân vật Mèo Vàng phong cách Studio Ghibli,  
> sử dụng bộ bài RWS thực tế và AI Google Gemini để luận giải bài bằng tiếng Việt.

---

## 1. TỔNG QUAN DỰ ÁN

### Mô Tả
Website Tarot tương tác sử dụng bộ bài **Rider-Waite-Smith (RWS)** — bộ bài Tarot kinh điển và phổ biến nhất thế giới. Người dùng khám phá, rút bài, và nhận luận giải từ nhân vật **Mèo Vàng** huyền bí — một chú mèo vàng nhân cách hóa thông thái theo phong cách Studio Ghibli. Mọi luận giải được tạo bởi Google Gemini (miễn phí), hoàn toàn bằng tiếng Việt.

### Đối Tượng Người Dùng
Người Việt quan tâm đến Tarot, tâm linh, và những ai yêu thích thẩm mỹ Studio Ghibli.

### Mục Tiêu Cốt Lõi
1. Xem và tra cứu đầy đủ 78 lá bài RWS với ảnh thực tế chất lượng cao
2. Rút bài ngẫu nhiên — đơn lẻ hoặc trải nhiều lá
3. AI Gemini luận giải bài bằng tiếng Việt qua giọng nói của Mèo Vàng
4. Trải nghiệm huyền bí, ấm áp, đậm chất Ghibli — không tối tăm, không đáng sợ

---

## 2. TECH STACK

| Hạng Mục | Công Nghệ | Lý Do |
|---|---|---|
| Framework | **Next.js 14+** (App Router) | Tối ưu native cho Vercel, API Routes bảo vệ key AI |
| Language | **TypeScript** | Type safety cho card data và API contracts |
| Styling | **Tailwind CSS** | Dễ custom theme Ghibli, responsive nhanh |
| Animation | **Framer Motion** | Card flip 3D, shuffle, fade transitions mượt |
| AI | **Google Gemini API** (`gemini-1.5-flash`) | Free tier, đủ mạnh cho tarot reading |
| Font | **Google Fonts** | Cinzel (tiêu đề huyền bí) + Lora (body ấm áp) |
| Images | **next/image** | Tối ưu 78 file .webp, lazy loading tự động |
| Deployment | **Vercel** | Native Next.js, zero-config, CDN toàn cầu |

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN

```
tarot-meo-vang/
├── app/
│   ├── layout.tsx                    # Root layout, font, metadata, favicon
│   ├── page.tsx                      # Trang chủ — Landing page
│   ├── globals.css                   # CSS variables, global styles, animations
│   │
│   ├── cards/
│   │   ├── page.tsx                  # Bộ sưu tập 78 lá — gallery + filter + search
│   │   └── [slug]/
│   │       └── page.tsx              # Chi tiết từng lá bài
│   │
│   ├── reading/
│   │   ├── page.tsx                  # Hub chọn kiểu trải bài
│   │   ├── single/
│   │   │   └── page.tsx              # Rút một lá
│   │   ├── three-card/
│   │   │   └── page.tsx              # Trải ba lá
│   │   └── celtic-cross/
│   │       └── page.tsx              # Celtic Cross (Phase 2 — hiện có thể để placeholder)
│   │
│   └── api/
│       └── interpret/
│           └── route.ts              # ⭐ Server-side Gemini API call — bảo vệ API key
│
├── components/
│   ├── TarotCard.tsx                 # Card với flip animation 3D
│   ├── CardBack.tsx                  # Mặt sau lá bài (Mèo Vàng pattern)
│   ├── CardDeck.tsx                  # UI xáo bài, chọn bài
│   ├── YellowCat.tsx                 # Nhân vật Mèo Vàng, nhiều trạng thái
│   ├── ReadingBoard.tsx              # Bàn trải bài — layout các vị trí
│   ├── AIInterpretation.tsx          # Hiển thị kết quả Gemini (typewriter effect)
│   ├── CardGrid.tsx                  # Grid hiển thị nhiều lá bài
│   ├── FilterBar.tsx                 # Lọc theo arcana, suit
│   └── Navigation.tsx                # Top nav
│
├── lib/
│   ├── cards-data.ts                 # ⭐ Dữ liệu đầy đủ 78 lá bài
│   ├── spreads.ts                    # Định nghĩa cấu trúc các kiểu trải bài
│   └── gemini.ts                     # Gemini client helper (chỉ dùng server-side)
│
└── public/
    ├── cards/                        # ⭐ 78 file .webp lá bài (user đã có sẵn)
    │   ├── the-fool.webp
    │   ├── the-magician.webp
    │   └── ... (xem mapping đầy đủ ở Mục 4)
    └── images/
        ├── yellow-cat-idle.svg       # Mèo Vàng ngồi bình thường
        ├── yellow-cat-reading.svg    # Mèo Vàng đang xem bài / nhìn cầu pha lê
        ├── yellow-cat-surprised.svg  # Mèo Vàng ngạc nhiên (error state)
        ├── yellow-cat-sleeping.svg   # Mèo Vàng ngủ (empty state)
        └── ghibli-bg.webp            # Background rừng đêm Ghibli
```

> ⚠️ **Quan trọng về ảnh bài:** Toàn bộ 78 file `.webp` đặt trong `/public/cards/`. Tên file phải khớp với cột `slug` trong bảng Mục 4 (ví dụ: `the-fool.webp`). Nếu tên file hiện tại khác, hãy tạo một **slug-to-filename mapping object** trong `lib/cards-data.ts` để ánh xạ.

---

## 4. DỮ LIỆU 78 LÁ BÀI RWS

### Cấu Trúc TypeScript

```typescript
interface TarotCard {
  id: number;            // 0–77, duy nhất
  slug: string;          // Tên file ảnh (không có .webp), cũng là URL param
  nameEn: string;        // Tên tiếng Anh
  nameVi: string;        // Tên tiếng Việt
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles'; // Chỉ minor arcana
  number: string;        // '0'–'21' (major) | 'ace'–'king' (minor)
  keywordsVi: string[];  // 3–5 từ khóa tiếng Việt (năng lượng chính của lá)
}
```

---

### 4.1 Major Arcana — Đại Bí Ẩn (22 lá)

| ID | Slug (= tên file .webp) | Tên EN | Tên VI | Keywords VI |
|----|------------------------|--------|--------|-------------|
| 0 | `the-fool` | The Fool | Kẻ Hề | khởi đầu, tự do, liều lĩnh, ngây thơ |
| 1 | `the-magician` | The Magician | Pháp Sư | ý chí, tài năng, hành động, sáng tạo |
| 2 | `the-high-priestess` | The High Priestess | Nữ Tu Sĩ | trực giác, bí ẩn, nội tâm, tiềm thức |
| 3 | `the-empress` | The Empress | Nữ Hoàng | phong phú, nuôi dưỡng, sáng tạo, thiên nhiên |
| 4 | `the-emperor` | The Emperor | Hoàng Đế | quyền lực, cấu trúc, lý trí, ổn định |
| 5 | `the-hierophant` | The Hierophant | Giáo Hoàng | truyền thống, tín ngưỡng, hướng dẫn, tuân thủ |
| 6 | `the-lovers` | The Lovers | Đôi Tình Nhân | tình yêu, lựa chọn, liên kết, giá trị |
| 7 | `the-chariot` | The Chariot | Chiến Xa | ý chí, chiến thắng, kiểm soát, quyết tâm |
| 8 | `strength` | Strength | Sức Mạnh | can đảm, kiên nhẫn, nội lực, lòng trắc ẩn |
| 9 | `the-hermit` | The Hermit | Ẩn Sĩ | nội tâm, cô đơn, tìm kiếm, khôn ngoan |
| 10 | `wheel-of-fortune` | Wheel of Fortune | Bánh Xe Vận Mệnh | vận may, chu kỳ, thay đổi, số phận |
| 11 | `justice` | Justice | Công Lý | sự thật, công bằng, nhân quả, cân bằng |
| 12 | `the-hanged-man` | The Hanged Man | Người Bị Treo | buông bỏ, góc nhìn mới, hy sinh, chờ đợi |
| 13 | `death` | Death | Thần Chết | kết thúc, chuyển hóa, buông bỏ, tái sinh |
| 14 | `temperance` | Temperance | Điều Độ | cân bằng, kiên nhẫn, hòa hợp, chữa lành |
| 15 | `the-devil` | The Devil | Ác Quỷ | ràng buộc, nghiện ngập, ảo tưởng, vật chất |
| 16 | `the-tower` | The Tower | Tháp Sụp Đổ | đột phá, hỗn loạn, mặc khải, phá hủy |
| 17 | `the-star` | The Star | Ngôi Sao | hi vọng, chữa lành, cảm hứng, bình yên |
| 18 | `the-moon` | The Moon | Mặt Trăng | ảo giác, sợ hãi, tiềm thức, mơ hồ |
| 19 | `the-sun` | The Sun | Mặt Trời | hạnh phúc, thành công, sức sống, rõ ràng |
| 20 | `judgement` | Judgement | Phán Xét | thức tỉnh, tái sinh, gọi mời, tha thứ |
| 21 | `the-world` | The World | Thế Giới | hoàn thành, tích hợp, trọn vẹn, thành tựu |

---

### 4.2 Minor Arcana — Wands / Quyền Trượng · Lửa & Hành Động (14 lá)

| ID | Slug | Tên EN | Tên VI |
|----|------|--------|--------|
| 22 | `ace-of-wands` | Ace of Wands | Át Quyền Trượng |
| 23 | `two-of-wands` | Two of Wands | Hai Quyền Trượng |
| 24 | `three-of-wands` | Three of Wands | Ba Quyền Trượng |
| 25 | `four-of-wands` | Four of Wands | Bốn Quyền Trượng |
| 26 | `five-of-wands` | Five of Wands | Năm Quyền Trượng |
| 27 | `six-of-wands` | Six of Wands | Sáu Quyền Trượng |
| 28 | `seven-of-wands` | Seven of Wands | Bảy Quyền Trượng |
| 29 | `eight-of-wands` | Eight of Wands | Tám Quyền Trượng |
| 30 | `nine-of-wands` | Nine of Wands | Chín Quyền Trượng |
| 31 | `ten-of-wands` | Ten of Wands | Mười Quyền Trượng |
| 32 | `page-of-wands` | Page of Wands | Thị Đồng Quyền Trượng |
| 33 | `knight-of-wands` | Knight of Wands | Hiệp Sĩ Quyền Trượng |
| 34 | `queen-of-wands` | Queen of Wands | Hoàng Hậu Quyền Trượng |
| 35 | `king-of-wands` | King of Wands | Vua Quyền Trượng |

---

### 4.3 Minor Arcana — Cups / Thánh Bôi · Nước & Cảm Xúc (14 lá)

| ID | Slug | Tên EN | Tên VI |
|----|------|--------|--------|
| 36 | `ace-of-cups` | Ace of Cups | Át Thánh Bôi |
| 37 | `two-of-cups` | Two of Cups | Hai Thánh Bôi |
| 38 | `three-of-cups` | Three of Cups | Ba Thánh Bôi |
| 39 | `four-of-cups` | Four of Cups | Bốn Thánh Bôi |
| 40 | `five-of-cups` | Five of Cups | Năm Thánh Bôi |
| 41 | `six-of-cups` | Six of Cups | Sáu Thánh Bôi |
| 42 | `seven-of-cups` | Seven of Cups | Bảy Thánh Bôi |
| 43 | `eight-of-cups` | Eight of Cups | Tám Thánh Bôi |
| 44 | `nine-of-cups` | Nine of Cups | Chín Thánh Bôi |
| 45 | `ten-of-cups` | Ten of Cups | Mười Thánh Bôi |
| 46 | `page-of-cups` | Page of Cups | Thị Đồng Thánh Bôi |
| 47 | `knight-of-cups` | Knight of Cups | Hiệp Sĩ Thánh Bôi |
| 48 | `queen-of-cups` | Queen of Cups | Hoàng Hậu Thánh Bôi |
| 49 | `king-of-cups` | King of Cups | Vua Thánh Bôi |

---

### 4.4 Minor Arcana — Swords / Kiếm · Gió & Tư Duy (14 lá)

| ID | Slug | Tên EN | Tên VI |
|----|------|--------|--------|
| 50 | `ace-of-swords` | Ace of Swords | Át Kiếm |
| 51 | `two-of-swords` | Two of Swords | Hai Kiếm |
| 52 | `three-of-swords` | Three of Swords | Ba Kiếm |
| 53 | `four-of-swords` | Four of Swords | Bốn Kiếm |
| 54 | `five-of-swords` | Five of Swords | Năm Kiếm |
| 55 | `six-of-swords` | Six of Swords | Sáu Kiếm |
| 56 | `seven-of-swords` | Seven of Swords | Bảy Kiếm |
| 57 | `eight-of-swords` | Eight of Swords | Tám Kiếm |
| 58 | `nine-of-swords` | Nine of Swords | Chín Kiếm |
| 59 | `ten-of-swords` | Ten of Swords | Mười Kiếm |
| 60 | `page-of-swords` | Page of Swords | Thị Đồng Kiếm |
| 61 | `knight-of-swords` | Knight of Swords | Hiệp Sĩ Kiếm |
| 62 | `queen-of-swords` | Queen of Swords | Hoàng Hậu Kiếm |
| 63 | `king-of-swords` | King of Swords | Vua Kiếm |

---

### 4.5 Minor Arcana — Pentacles / Tiền Vàng · Đất & Vật Chất (14 lá)

| ID | Slug | Tên EN | Tên VI |
|----|------|--------|--------|
| 64 | `ace-of-pentacles` | Ace of Pentacles | Át Tiền Vàng |
| 65 | `two-of-pentacles` | Two of Pentacles | Hai Tiền Vàng |
| 66 | `three-of-pentacles` | Three of Pentacles | Ba Tiền Vàng |
| 67 | `four-of-pentacles` | Four of Pentacles | Bốn Tiền Vàng |
| 68 | `five-of-pentacles` | Five of Pentacles | Năm Tiền Vàng |
| 69 | `six-of-pentacles` | Six of Pentacles | Sáu Tiền Vàng |
| 70 | `seven-of-pentacles` | Seven of Pentacles | Bảy Tiền Vàng |
| 71 | `eight-of-pentacles` | Eight of Pentacles | Tám Tiền Vàng |
| 72 | `nine-of-pentacles` | Nine of Pentacles | Chín Tiền Vàng |
| 73 | `ten-of-pentacles` | Ten of Pentacles | Mười Tiền Vàng |
| 74 | `page-of-pentacles` | Page of Pentacles | Thị Đồng Tiền Vàng |
| 75 | `knight-of-pentacles` | Knight of Pentacles | Hiệp Sĩ Tiền Vàng |
| 76 | `queen-of-pentacles` | Queen of Pentacles | Hoàng Hậu Tiền Vàng |
| 77 | `king-of-pentacles` | King of Pentacles | Vua Tiền Vàng |

---

## 5. THIẾT KẾ GIAO DIỆN

### 5.1 Phong Cách Tổng Thể — Mèo Vàng × Studio Ghibli

Đây **không phải** Tarot dark/gothic thông thường. Đây là Tarot **ấm áp, huyền bí, dễ thương** — như ngồi trong căn nhà nhỏ giữa khu rừng thần kỳ về đêm, cạnh lò sưởi, nghe một chú mèo vàng kể chuyện vũ trụ. Cảm giác an toàn, tò mò, và kỳ diệu.

**Tham chiếu thẩm mỹ:** Spirited Away, My Neighbor Totoro, Howl's Moving Castle, Kiki's Delivery Service.

### 5.2 Bảng Màu CSS

```css
:root {
  /* Backgrounds */
  --bg-deep: #0d0d1a;          /* Nền tối nhất — bầu trời đêm */
  --bg-mid: #12122a;           /* Nền chính */
  --bg-surface: #1a1a3e;       /* Card, panel surfaces */
  --bg-elevated: #22224a;      /* Hover states, dropdowns */

  /* Gold — Màu chủ đạo Mèo Vàng */
  --gold-primary: #f4a261;     /* Vàng cam — màu lông Mèo Vàng */
  --gold-light: #ffd166;       /* Vàng sáng — highlights, glows */
  --gold-dark: #e76f51;        /* Vàng đậm — accents, borders */
  --gold-glow: rgba(244,162,97,0.3); /* Glow effect */

  /* Accent */
  --mystic-purple: #9b5de5;    /* Tím huyền bí */
  --forest-green: #2d6a4f;     /* Xanh lá rừng Ghibli */
  --ghibli-sky: #b7d4e7;       /* Xanh trời Ghibli */
  --star-white: #fff8dc;       /* Trắng/vàng nhạt — ánh sao */

  /* Text */
  --text-primary: #f8f4e3;     /* Kem — body text */
  --text-secondary: #c9b89a;   /* Nâu nhạt — muted text */
  --text-accent: #ffd166;      /* Vàng — emphasized text */
}
```

### 5.3 Typography

- **Tiêu đề chính** (`h1`, `h2`): Font `Cinzel` — cổ điển, huyền bí, Roman serif
- **Tiêu đề phụ** (`h3`, `h4`): Font `Cinzel Decorative`
- **Body, mô tả, luận giải AI**: Font `Lora` — serif ấm áp, đọc tốt
- **UI labels, badges, số**: Font `Inter` — clean, neutral
- Tất cả font phải **hỗ trợ đầy đủ tiếng Việt** (Unicode, diacritics). Test kỹ với chữ có dấu.

### 5.4 Nhân Vật Mèo Vàng

Mèo Vàng là **linh hồn của website** — không phải mascot trang trí, mà là nhân vật dẫn dắt xuyên suốt trải nghiệm người dùng.

**Đặc điểm hình ảnh:**
- Lông vàng óng (màu `--gold-primary`)
- Mắt xanh lam huyền bí hoặc xanh ngọc
- Đeo vòng cổ có huy hiệu trăng lưỡi liềm + ngôi sao
- Đuôi dài, cụp hoặc vẫy tùy trạng thái

**Các trạng thái (SVG/CSS animated):**

| Trạng Thái | Khi Nào Dùng | Hành Động |
|-----------|-------------|-----------|
| `idle` | Trang chủ, trạng thái mặc định | Ngồi thẳng, đuôi vẫy nhẹ |
| `reading` | Đang gọi Gemini AI | Nhìn chằm chằm vào quả cầu pha lê, ánh mắt phát sáng |
| `shuffle` | Người dùng xáo bài | Hai chân trước đang xáo bài nhanh |
| `sleeping` | Empty state, chưa rút bài | Ngủ tròn, ZZZ bay |
| `surprised` | Error / Rate limit | Tai dựng, mắt mở to, "!" trên đầu |
| `happy` | Sau khi luận giải xong | Gật đầu hài lòng, đuôi vẫy |
| `pointing` | CTA buttons | Chỉ tay về phía nút |

**Xuất hiện ở đâu:**

| Vị Trí | Vai Trò |
|--------|---------|
| Logo / Navigation | Biểu tượng mèo nhỏ 32×32px |
| Hero trang chủ | Kích thước lớn, ngồi trước bộ bài |
| Loading states | `reading` pose + spinner vàng |
| Empty states | `sleeping` pose |
| Sidebar trang reading | `idle` pose, thoại gợi ý |
| Kết quả AI | `happy` pose sau khi text hiện |
| Error | `surprised` pose + message |

### 5.5 Hiệu Ứng & Animation

| Hiệu Ứng | Mô Tả Kỹ Thuật |
|----------|----------------|
| **Card Flip 3D** | Framer Motion `rotateY` 0→180°, back face hidden. Duration 0.6s |
| **Card Hover** | `translateY(-8px)` + box-shadow vàng lan rộng. Duration 0.2s |
| **Shuffle** | Cards fan out, overlap, xáo ngẫu nhiên với spring animation |
| **Reversed Card** | CSS `rotate(180deg)` + badge nhỏ "↩ NGƯỢC" màu cam |
| **Particle Dust** | Canvas hoặc CSS keyframes — hạt bụi vàng nhỏ lơ lửng trên background |
| **Typewriter AI** | Text Gemini xuất hiện từng ký tự, cursor nhấp nháy |
| **Page Transition** | Framer Motion `AnimatePresence` — fade + slide nhẹ |
| **Glow Effect** | Box-shadow vàng pulse khi lá bài được chọn |
| **Star Twinkling** | Các ngôi sao nhỏ trên background nhấp nháy async |

---

## 6. CÁC TRANG VÀ TÍNH NĂNG CHI TIẾT

### 6.1 Trang Chủ (`/`)

**Mục đích:** Thu hút, tạo cảm xúc, định hướng người dùng vào website.

**Nội dung theo thứ tự từ trên xuống:**

1. **Hero Section** (full viewport height)
   - Background: ảnh/gradient rừng đêm Ghibli, bầu trời sao, ánh trăng
   - Nhân vật Mèo Vàng (`idle` pose) ngồi trên bàn gỗ cũ, bộ bài RWS úp trước mặt
   - Tiêu đề: **"TAROT MÈO VÀNG"** (font Cinzel, to, vàng)
   - Subtitle: *"Khám phá thông điệp vũ trụ cùng chú mèo huyền bí"* (Lora italic)
   - 2 CTA nút lớn: **"🃏 Rút Bài Ngay"** → `/reading` và **"📚 Xem Bộ Bài"** → `/cards`
   - Scroll indicator nhẹ ở dưới

2. **Feature Tiles** (3 cột, ngay dưới hero)
   - Tile 1: Icon bài + "78 Lá Bài" — mô tả ngắn về bộ RWS
   - Tile 2: Icon trải bài + "Nhiều Kiểu Trải" — đơn, ba lá, Celtic Cross
   - Tile 3: Icon AI + "Luận Giải AI" — Gemini bằng tiếng Việt

3. **Footer** đơn giản: tên website, credit bộ bài RWS

---

### 6.2 Bộ Sưu Tập Bài (`/cards`)

**Mục đích:** Tra cứu, khám phá tất cả 78 lá bài.

**Layout và tính năng:**

- **Header:** "Bộ Bài Rider-Waite-Smith" + counter "78 lá bài"
- **Filter Bar:**
  - Nút toggle: `Tất Cả` / `Đại Bí Ẩn` / `Tiểu Bí Ẩn`
  - Khi chọn Tiểu Bí Ẩn: hiện thêm 4 nút suit: `🔥 Quyền Trượng` / `💧 Thánh Bôi` / `⚔️ Kiếm` / `🪙 Tiền Vàng`
- **Search:** Input tìm tên lá (cả EN lẫn VI)
- **Card Grid:** Responsive — 2 cột mobile, 4 cột tablet, 6 cột desktop
  - Mỗi card trong grid: Ảnh lá bài + Tên VI bên dưới + Tên EN nhỏ hơn
  - Hover: float lên + glow vàng + tên lá bài nổi bật
  - Click → `/cards/[slug]`
- **Section headers** phân chia: "Đại Bí Ẩn (22 lá)" và từng suit

---

### 6.3 Chi Tiết Lá Bài (`/cards/[slug]`)

**Mục đích:** Xem đầy đủ thông tin một lá bài.

**Layout (2 cột trên desktop, 1 cột stack trên mobile):**

**Cột trái — Hình ảnh:**
- Ảnh lá bài kích thước lớn (400px+ width), có border vàng và glow nhẹ
- Badge arcana: `Đại Bí Ẩn` hoặc `Tiểu Bí Ẩn — [Suit]`
- Badge số thứ tự

**Cột phải — Thông tin:**
- Tên tiếng Việt (lớn, Cinzel)
- Tên tiếng Anh (nhỏ hơn, muted)
- Từ khóa (tag pills màu vàng)
- **Ý nghĩa Xuôi:** Đoạn text tóm tắt (tĩnh, hardcode trong `cards-data.ts`)
- **Ý nghĩa Ngược:** Đoạn text tóm tắt riêng
- **Nút:** "✨ Hỏi Mèo Vàng về lá bài này" → mở drawer/modal gọi Gemini với câu hỏi tùy chọn

**Breadcrumb:** `Trang Chủ > Bộ Bài > [Tên Lá]`

---

### 6.4 Hub Chọn Kiểu Trải Bài (`/reading`)

**Mục đích:** Trang chuyển tiếp để chọn hình thức đọc bài.

**Layout:** 3 card lựa chọn lớn, trung tâm màn hình.

| Card | Tiêu Đề | Mô Tả | Route |
|------|---------|-------|-------|
| 1️⃣ | **Một Lá** | Câu trả lời tức thì cho hôm nay | `/reading/single` |
| 3️⃣ | **Ba Lá** | Quá Khứ · Hiện Tại · Tương Lai | `/reading/three-card` |
| 🔮 | **Celtic Cross** | Luận giải chuyên sâu 10 lá | `/reading/celtic-cross` (badge "Sắp Ra Mắt" nếu chưa xong) |

Mèo Vàng (`idle` + `pointing`) xuất hiện ở góc phải, có bubble text: *"Bạn muốn hỏi vũ trụ điều gì hôm nay?"*

---

### 6.5 Rút Một Lá (`/reading/single`)

**Luồng trải nghiệm đầy đủ:**

**Bước 1 — Nhập câu hỏi:**
- Text trên màn hình (Mèo Vàng `idle`): *"Hãy tập trung vào câu hỏi của bạn..."*
- Input textarea (tuỳ chọn, placeholder: *"Ví dụ: Tôi có nên thay đổi công việc không?"*)
- Nút lớn: **"🃏 Xáo Bài"**

**Bước 2 — Animation xáo bài:**
- Bộ bài fan out, xáo với Framer Motion spring animation
- Mèo Vàng chuyển sang `shuffle` pose
- Duration: ~1.5 giây
- Sau đó: hiện 9 lá bài úp ngược theo hình vòng cung

**Bước 3 — Chọn lá:**
- Hover từng lá: lá đó float lên nhẹ
- Text gợi ý: *"Chọn lá bài mà bạn cảm thấy thu hút..."*
- Click 1 lá → trigger flip animation

**Bước 4 — Lật bài:**
- Card flip 3D (0.6s)
- Random: 50% xuôi, 50% ngược (rotate 180° nếu ngược)
- Tên lá bài + trạng thái hiện ra bên dưới
- Mèo Vàng → `reading` pose

**Bước 5 — Xem kết quả và gọi AI:**
- Ảnh lá bài to, đẹp ở trung tâm
- Badge: `XUÔI ✦` hoặc `↩ NGƯỢC` (màu cam)
- Nút: **"✨ Nhận Luận Giải từ Mèo Vàng"**
- Click → gọi `POST /api/interpret`

**Bước 6 — AI luận giải:**
- Mèo Vàng → `reading` pose + loading spinner vàng
- Text Gemini xuất hiện với **typewriter effect** (từng ký tự)
- Định dạng đẹp: heading, paragraphs, emoji phù hợp

**Bước 7 — Sau luận giải:**
- Mèo Vàng → `happy` pose
- 3 nút: **"🔄 Rút Lại"** | **"📋 Copy Kết Quả"** | **"🏠 Về Trang Chủ"**

---

### 6.6 Trải Ba Lá (`/reading/three-card`)

**Vị trí và ý nghĩa:**

| Vị Trí | Tên | Ý Nghĩa |
|--------|-----|---------|
| 1 (Trái) | **Quá Khứ** | Nền tảng, điều đã định hình tình huống |
| 2 (Giữa) | **Hiện Tại** | Tình huống và năng lượng đang hiện diện |
| 3 (Phải) | **Tương Lai** | Hướng đi tiềm năng, kết quả có thể xảy ra |

**Luồng tương tác:**

1. Nhập câu hỏi → Xáo bài (tương tự single)
2. Hiển thị deck úp, người dùng click 3 lần liên tiếp để chọn 3 lá
3. Hoặc chế độ tự động: click "Rút 3 Lá Ngẫu Nhiên"
4. 3 lá lật lần lượt từ trái sang phải (mỗi lá 0.4s delay)
5. Layout 3 lá: hàng ngang, label vị trí ở trên mỗi lá
6. Nút: **"✨ Luận Giải Toàn Bộ Trải Bài"**
7. AI trả về 1 đoạn liên tục: luận giải từng lá theo vị trí + cái nhìn tổng thể

**Logic:** 3 lá phải khác nhau (không trùng slug). Mỗi lá random `isReversed` độc lập.

---

### 6.7 Trải Celtic Cross (`/reading/celtic-cross`) — Phase 2

10 vị trí chuẩn Celtic Cross. Đánh dấu **"Sắp Ra Mắt"** trong Phase 1, implement ở Phase 2. Giữ placeholder page với thông báo và countdown hoặc signup form đơn giản.

---

## 7. TÍCH HỢP AI — GOOGLE GEMINI

### 7.1 Cấu Hình Kỹ Thuật

```
Model:         gemini-1.5-flash
Package:       @google/generative-ai
Free Tier:     15 RPM, 1M tokens/day
Env variable:  GEMINI_API_KEY (chỉ server-side)
API Route:     POST /api/interpret
```

**⚠️ Bắt buộc server-side:** Mọi call đến Gemini phải qua Next.js API Route. KHÔNG gọi từ client component. API key KHÔNG được xuất hiện trong client bundle.

### 7.2 Request / Response Contract

**Request `POST /api/interpret`:**
```typescript
{
  cards: Array<{
    slug: string;
    nameVi: string;
    nameEn: string;
    isReversed: boolean;
    position: string;      // "Lá Bài Duy Nhất" | "Quá Khứ" | "Hiện Tại" | "Tương Lai" | ...
  }>;
  spreadType: 'single' | 'three-card' | 'celtic-cross';
  userQuestion?: string;   // Câu hỏi người dùng, có thể rỗng
}
```

**Response:**
```typescript
{
  interpretation: string;  // Markdown text từ Gemini
  error?: string;          // Nếu có lỗi
}
```

### 7.3 System Prompt (Nhân Cách Mèo Vàng)

```
Bạn là Mèo Vàng — một chú mèo vàng óng huyền bí, thông thái nhưng cũng rất dễ thương.
Bạn đã đọc bài Tarot từ hàng thế kỷ nay (dù trông vẫn còn trẻ và thỉnh thoảng 
vẫn bị phân tâm bởi những thứ lấp lánh), sử dụng bộ bài Rider-Waite-Smith kinh điển.

Phong cách của bạn:
- Ấm áp, thân thiện, đôi khi có chút dí dỏm nhẹ nhàng
- Huyền bí nhưng gần gũi — không đáng sợ, không quá nghiêm trọng  
- Thực tế và hữu ích — tránh những lời nói chung chung vô nghĩa
- Đôi khi tự xưng "Mèo Vàng" một cách tự nhiên
- Kết thúc mỗi luận giải bằng một lời khuyên hoặc câu hỏi gợi mở nhẹ nhàng

Luôn trả lời bằng tiếng Việt, viết tự nhiên và trôi chảy.
Độ dài: 200–350 từ cho đọc lá đơn, 400–600 từ cho trải ba lá.
Dùng Markdown nhẹ (in đậm, xuống dòng) để dễ đọc, không dùng headers cấp 1-2.
```

### 7.4 User Prompt Template

**Đọc một lá:**
```
Người dùng rút được: **{{nameVi}} ({{nameEn}})** — trạng thái {{isReversed ? "**NGƯỢC ↩**" : "**XUÔI ✦**"}}

{{#if userQuestion}}Câu hỏi của họ: *"{{userQuestion}}"*{{/if}}

Hãy luận giải lá bài này, bao gồm:
- Ý nghĩa cốt lõi của lá trong trạng thái {{isReversed ? "ngược" : "xuôi"}}
- Thông điệp riêng cho tình huống {{#if userQuestion}}liên quan đến câu hỏi trên{{else}}của người dùng{{/if}}
- Một lời khuyên thực tế và ấm áp từ Mèo Vàng
```

**Trải ba lá:**
```
Người dùng đã trải ba lá:
- **QUÁ KHỨ:** {{card1.nameVi}} — {{card1.isReversed ? "NGƯỢC ↩" : "XUÔI ✦"}}
- **HIỆN TẠI:** {{card2.nameVi}} — {{card2.isReversed ? "NGƯỢC ↩" : "XUÔI ✦"}}
- **TƯƠNG LAI:** {{card3.nameVi}} — {{card3.isReversed ? "NGƯỢC ↩" : "XUÔI ✦"}}

{{#if userQuestion}}Câu hỏi: *"{{userQuestion}}"*{{/if}}

Hãy luận giải từng lá theo vị trí của nó, sau đó đưa ra **cái nhìn tổng thể** về 
câu chuyện mà ba lá bài này kể lại cùng nhau.
```

### 7.5 Xử Lý Lỗi và Edge Cases

| Tình Huống | Xử Lý |
|-----------|--------|
| Rate limit (429) | Toast: *"Mèo Vàng đang bận xem bài cho quá nhiều người, thử lại sau ít phút nhé! 🐱"* |
| Network error | Toast: *"Mèo Vàng không kết nối được với vũ trụ lúc này..."* + nút Retry |
| Timeout (>30s) | Abort signal sau 30 giây, hiện error message |
| Empty response | Fallback message thay vì blank |

---

## 8. TÍNH NĂNG PHỤ

### 8.1 Mặt Sau Lá Bài (Card Back Design)
Thiết kế riêng, không dùng mặt sau RWS gốc:
- Nền gradient: tím đậm → xanh đêm
- Trung tâm: biểu tượng Mèo Vàng nhỏ (trăng lưỡi liềm + bóng mèo)
- Border pattern: lặp lại các ngôi sao và lá cây nhỏ phong cách Ghibli
- Màu đường viền: `--gold-light`

### 8.2 Ý Nghĩa Tĩnh Cho 78 Lá
Mỗi trang `/cards/[slug]` cần nội dung ý nghĩa tóm tắt. Coding agent có thể chọn một trong 3 cách:
- **Option A (Khuyến nghị):** Gọi Gemini 1 lần duy nhất lúc build time để generate ý nghĩa cho tất cả 78 lá, lưu vào `cards-data.ts`
- **Option B:** Hardcode sẵn nội dung tóm tắt ngắn (~100 chữ/lá) trong `cards-data.ts`
- **Option C:** Để trống, chỉ hiện nút "Hỏi Mèo Vàng về lá này" gọi AI on-demand

### 8.3 Copy & Share
- Nút "📋 Copy" sau khi có kết quả AI: copy toàn bộ reading (lá bài + trạng thái + luận giải) vào clipboard dưới dạng text đẹp
- Không cần social share phức tạp trong Phase 1

### 8.4 Lịch Sử Đọc Bài — Phase 2
- Lưu `localStorage`: timestamp, lá bài đã rút, câu hỏi, nội dung luận giải
- Trang `/history` xem lại tối đa 20 lần gần nhất
- Nút xóa lịch sử

### 8.5 Daily Card
- Trang chủ hoặc widget nhỏ: "Lá Bài Ngày Hôm Nay"
- Seeded random theo ngày (cùng ngày = cùng lá) để người dùng thấy nhất quán
- Không cần lưu server, tính bằng date seed trên client

---

## 9. RESPONSIVE & ACCESSIBILITY

### Breakpoints
- Mobile: `< 640px` — 2 card/row trong gallery, 1 cột chi tiết
- Tablet: `640px–1024px` — 3–4 card/row
- Desktop: `> 1024px` — 5–6 card/row, 2 cột chi tiết

### Accessibility
- `alt` text có nghĩa cho mọi ảnh lá bài: `"Lá bài Tarot [Tên VI] - [Trạng thái]"`
- Keyboard navigation cho việc chọn bài
- `aria-live` region cho khu vực AI interpretation (thông báo khi content thay đổi)
- Contrast ratio đủ theo WCAG AA

### Performance
- Lazy load ảnh lá bài trong gallery (chỉ load khi vào viewport)
- `priority` chỉ cho ảnh hero và lá bài đang được chọn
- Skeleton loading placeholder khi chờ ảnh

---

## 10. TRIỂN KHAI VERCEL

### Quy Trình
1. Tạo repo GitHub, push toàn bộ code
2. Import vào Vercel (vercel.com/import)
3. Thêm Environment Variable: `GEMINI_API_KEY = [key từ aistudio.google.com]`
4. Click Deploy — Next.js auto-detected, zero config cần thiết

### Lưu Ý Deployment
- 78 ảnh `.webp` trong `/public/cards/` sẽ được serve qua Vercel CDN tự động
- API Route `/api/interpret` chạy trên Vercel Edge Functions hoặc Serverless
- Không cần database, không cần external storage cho Phase 1

---

## 11. BIẾN MÔI TRƯỜNG

```env
# .env.local (KHÔNG commit vào git — đã có trong .gitignore)
GEMINI_API_KEY=AIzaSy...

# Lấy tại: https://aistudio.google.com/app/apikey
# Free tier: 15 requests/phút, 1,000,000 tokens/ngày
# Model dùng: gemini-1.5-flash
```

```env
# .env.example (COMMIT vào git — không có giá trị thật)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 12. GHI CHÚ QUAN TRỌNG CHO AI CODING AGENT

1. **File ảnh:** Kiểm tra tên thực tế của 78 file trong `/public/cards/`. Nếu tên khác slug định nghĩa trong Mục 4, tạo mapping object `const cardImageMap: Record<string, string>` trong `lib/cards-data.ts`. Slug trong URL và data luôn theo chuẩn kebab-case như Mục 4.

2. **API key bảo mật:** `GEMINI_API_KEY` chỉ được dùng trong `app/api/interpret/route.ts` và `lib/gemini.ts`. Server Components được dùng key này nhưng KHÔNG để lộ ra Client Components. Dùng `'use server'` directive đúng chỗ.

3. **Reversed card display:** Khi `isReversed === true`: CSS `transform: rotate(180deg)` trên ảnh. Badge "↩ NGƯỢC" màu `--gold-dark`. Alt text phải phản ánh: `"[Tên lá] - Ngược"`.

4. **Không trùng lá khi trải nhiều lá:** Khi rút 3 lá, dùng Fisher-Yates shuffle để đảm bảo 3 slug khác nhau. `isReversed` của từng lá vẫn random độc lập.

5. **Font Vietnamese:** Load Cinzel, Cinzel Decorative, và Lora từ Google Fonts với `subset=latin,vietnamese`. Kiểm tra render chữ tiếng Việt có dấu.

6. **TypeScript strict:** Bật strict mode. Cards data array phải typed đầy đủ với interface `TarotCard`. API route có typed request/response.

7. **Dark mode only:** Website này chỉ có dark theme. Không cần light mode toggle. Đảm bảo không có màu trắng/sáng không mong muốn.

8. **Tối ưu ảnh Vercel:** Cấu hình `next.config.js` với `images.domains` hoặc `remotePatterns` nếu cần. Với ảnh local trong `/public/`, dùng `next/image` với `width` và `height` cố định hoặc `fill` layout.

9. **Error boundaries:** Wrap các section quan trọng với React Error Boundary để UI không crash hoàn toàn khi Gemini lỗi.

10. **SEO cơ bản:** Metadata cho từng trang — title, description. OG image có thể là ảnh hero Mèo Vàng. Trang `/cards/[slug]` dùng `generateMetadata` với tên lá bài.

---

## 13. THỨ TỰ TRIỂN KHAI KHUYẾN NGHỊ (BUILD ORDER)

```
Phase 1 — Core (Bắt buộc)
├── Step 1: Setup Next.js 14, Tailwind, TypeScript, cấu trúc thư mục
├── Step 2: lib/cards-data.ts — 78 lá bài với đầy đủ data + mapping ảnh
├── Step 3: Component TarotCard — hiển thị ảnh, flip animation
├── Step 4: /cards — Gallery đầy đủ 78 lá, filter, search
├── Step 5: /cards/[slug] — Trang chi tiết lá bài
├── Step 6: API route /api/interpret — Gemini integration
├── Step 7: /reading/single — Rút một lá end-to-end với AI
├── Step 8: /reading/three-card — Trải ba lá với AI
├── Step 9: Nhân vật Mèo Vàng, loading states, error handling
├── Step 10: Trang chủ hoàn chỉnh
└── Step 11: Deploy lên Vercel, test production

Phase 2 — Enhancement (Tùy chọn)
├── /reading/celtic-cross
├── /history — Lịch sử đọc bài (localStorage)
├── Daily Card widget
└── Share feature
```

---

*Tài liệu này được tạo cho workflow Vibe Coding.*  
*AI Coding Agent đọc spec này và triển khai code đầy đủ theo định hướng trên.*  
*Mọi quyết định kỹ thuật không được đề cập: Coding Agent tự quyết định theo best practices.*
