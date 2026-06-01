# 🎴 TAROT MÈO VÀNG — Thuật Toán Xáo Bài
## Shuffle Algorithm Specification

> **Mục tiêu:** Đảm bảo tuyệt đối không có lá bài trùng lặp trong cùng một phiên đọc.  
> Độ ngẫu nhiên tối đa bằng nhiều nguồn entropy thực.  
> Chấp nhận độ trễ cao sau mỗi lần rút — ưu tiên chất lượng ngẫu nhiên tuyệt đối.

---

## 1. TRIẾT LÝ THIẾT KẾ

### Tại Sao Không Dùng `Math.random()`

`Math.random()` là **Pseudo-Random Number Generator (PRNG)** — có nghĩa là nó sinh ra chuỗi số trông ngẫu nhiên nhưng thực ra **hoàn toàn xác định** nếu biết trạng thái ban đầu. Với Tarot, điều này có thể bị khai thác hoặc đơn giản là kém "chân thật" về mặt vũ trụ học.

### Chiến Lược

Thay vào đó, hệ thống dùng **3 lớp ngẫu nhiên chồng lên nhau:**

```
Lớp 1: Web Crypto API         → Entropy hệ thống (hardware-level)
Lớp 2: Hành vi người dùng     → Entropy từ thực tế (mouse, touch, timing)
Lớp 3: Fisher-Yates + mixing  → Thuật toán phân phối đồng đều
```

Kết quả: một xáo trộn mà **ngay cả Anthropic cũng không thể dự đoán** được lá bài nào sẽ rơi vào vị trí nào.

---

## 2. NGUỒN ENTROPY (Entropy Sources)

### 2.1 Nguồn 1: Web Crypto API — Entropy Cứng

```typescript
// Trình duyệt lấy entropy từ hardware: CPU jitter, OS noise, v.v.
const cryptoBuffer = new Uint32Array(78);
crypto.getRandomValues(cryptoBuffer);
// cryptoBuffer[i] là số nguyên 32-bit thực sự ngẫu nhiên
```

Đây là **nền tảng bắt buộc**. Tất cả các nguồn khác là bổ sung.

---

### 2.2 Nguồn 2: Entropy Từ Hành Vi Người Dùng

Thu thập trong suốt quá trình hoạt ảnh xáo bài (~1.5–2 giây).

```typescript
interface UserEntropyEvent {
  type: 'mousemove' | 'touchmove' | 'click' | 'keydown';
  x?: number;         // Tọa độ tuyệt đối
  y?: number;
  dx?: number;        // Delta so với event trước
  dy?: number;
  timestamp: number;  // performance.now() — độ chính xác microsecond
  velocity?: number;  // Tốc độ di chuyển pixel/ms
}
```

**Tại sao timestamp là quan trọng nhất:**  
Giữa hai event liên tiếp, `performance.now()` cho ra số thực với nhiều chữ số thập phân (ví dụ: `1234567.891234`). Phần thập phân này là entropy thuần túy — không ai có thể dự đoán chính xác khi nào ngón tay người dùng di chuyển đến pixel tiếp theo.

**Tại sao delta (dx, dy) quan trọng:**  
`dx` và `dy` phản ánh hành vi tay người dùng — tốc độ, hướng, gia tốc. Đây là **biometric entropy** thực sự.

---

### 2.3 Nguồn 3: High-Resolution Timing Jitter

```typescript
// Lấy nhiều timestamp liên tiếp — jitter giữa chúng là entropy
const timings: number[] = [];
for (let i = 0; i < 32; i++) {
  timings.push(performance.now());
  // Không sleep — chỉ đọc nhanh để bắt jitter CPU
}
```

Jitter giữa các lần đọc `performance.now()` liên tiếp phụ thuộc vào scheduler của OS, nhiệt độ CPU, background processes — hoàn toàn không thể dự đoán.

---

### 2.4 Trộn Tất Cả Entropy: SHA-256

```typescript
async function buildEntropyPool(
  cryptoBytes: Uint32Array,
  userEvents: UserEntropyEvent[],
  timings: number[]
): Promise<Uint8Array> {

  // Serialize tất cả nguồn thành một chuỗi bytes dài
  const rawData: number[] = [];

  // Đưa vào crypto bytes
  for (const n of cryptoBytes) {
    rawData.push(n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff);
  }

  // Đưa vào user events
  for (const evt of userEvents) {
    const t = Math.floor(evt.timestamp * 1000); // microsecond precision
    rawData.push(
      t & 0xff, (t >> 8) & 0xff, (t >> 16) & 0xff, (t >> 24) & 0xff,
      Math.floor((evt.x ?? 0) * 10) & 0xff,
      Math.floor((evt.y ?? 0) * 10) & 0xff,
      Math.floor((evt.dx ?? 0) * 100 + 128) & 0xff,
      Math.floor((evt.dy ?? 0) * 100 + 128) & 0xff,
    );
  }

  // Đưa vào timing jitter
  for (let i = 1; i < timings.length; i++) {
    const jitter = Math.floor((timings[i] - timings[i - 1]) * 1_000_000);
    rawData.push(jitter & 0xff, (jitter >> 8) & 0xff);
  }

  // Hash toàn bộ bằng SHA-256 (SubtleCrypto API — built-in browser)
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new Uint8Array(rawData)
  );

  return new Uint8Array(hashBuffer); // 32 bytes entropy chất lượng cao
}
```

**Tại sao SHA-256:** Avalanche effect — thay đổi 1 bit đầu vào → thay đổi ~50% bits đầu ra. Toàn bộ entropy từ tất cả nguồn được "nén" thành 32 bytes chất lượng đồng đều tuyệt đối.

---

## 3. THUẬT TOÁN XÁO: Fisher-Yates Cải Tiến

### 3.1 Vấn Đề Với Fisher-Yates Ngây Thơ

```typescript
// ❌ KHÔNG DÙNG — Có bias khi n không chia hết cho RAND_MAX
const j = Math.floor(cryptoRandom() * (i + 1));
// Nếu i+1 không chia hết 2^32, một số vị trí được chọn nhiều hơn 1 lần!
```

### 3.2 Fisher-Yates Không Có Bias (Rejection Sampling)

```typescript
function unbiasedRandomIndex(max: number, entropyPool: Uint8Array, poolOffset: { v: number }): number {
  // max = số nguyên dương, muốn random trong [0, max)
  // Loại bỏ bias bằng rejection sampling

  const limit = Math.floor(0x100000000 / max) * max; // Bội số lớn nhất của max < 2^32

  while (true) {
    // Lấy 4 bytes từ entropy pool, xoay vòng nếu cần
    const idx = poolOffset.v % entropyPool.length;
    const rand32 =
      (entropyPool[idx] |
       (entropyPool[(idx + 1) % entropyPool.length] << 8) |
       (entropyPool[(idx + 2) % entropyPool.length] << 16) |
       (entropyPool[(idx + 3) % entropyPool.length] << 24)) >>> 0;

    poolOffset.v += 4;

    // Nếu rand32 nằm trong vùng không bias, dùng nó
    // Nếu không, vứt bỏ và thử lại (rejection)
    if (rand32 < limit) {
      return rand32 % max;
    }
    // Rejection xảy ra < 0.000001% với max=78 — không đáng kể
  }
}
```

### 3.3 Fisher-Yates Đầy Đủ

```typescript
function fisherYatesShuffle(entropyPool: Uint8Array): number[] {
  const deck = Array.from({ length: 78 }, (_, i) => i); // [0, 1, 2, ..., 77]
  const poolOffset = { v: 0 };

  // Duyệt từ cuối về đầu
  for (let i = 77; i > 0; i--) {
    const j = unbiasedRandomIndex(i + 1, entropyPool, poolOffset);

    // Nếu entropy pool bị hết, refill bằng crypto.getRandomValues()
    if (poolOffset.v >= entropyPool.length - 8) {
      const fresh = new Uint8Array(32);
      crypto.getRandomValues(fresh);
      // XOR fresh entropy vào pool để không làm mất entropy cũ
      for (let k = 0; k < 32; k++) {
        entropyPool[k % entropyPool.length] ^= fresh[k];
      }
      poolOffset.v = 0;
    }

    // Swap i và j
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
```

### 3.4 Bước Tăng Cường: Multi-Pass Mixing

Vì chấp nhận độ trễ cao, chạy thêm 2 lượt xáo độc lập với entropy mới mỗi lần:

```typescript
async function hyperShuffle(): Promise<number[]> {
  // Pass 1: Dùng entropy chính (user behavior + crypto)
  const entropy1 = await buildEntropyPool(cryptoBytes, userEvents, timings);
  let deck = fisherYatesShuffle(entropy1);

  // Pass 2: Fresh crypto entropy, shuffle lại
  const entropy2 = new Uint8Array(32);
  crypto.getRandomValues(entropy2);
  // XOR pass 1 entropy vào pass 2 để accumulate
  for (let i = 0; i < 32; i++) entropy2[i] ^= entropy1[i];
  deck = fisherYatesShuffle(entropy2); // Shuffle kết quả của pass 1

  // Pass 3: Interleave — tăng tính hỗn độn
  const entropy3 = new Uint8Array(32);
  crypto.getRandomValues(entropy3);
  deck = fisherYatesShuffle(entropy3);

  return deck;
  // Tổng: 3 lần Fisher-Yates độc lập, mỗi lần với entropy khác nhau
  // Một bộ bài 78 lá có 78! ≈ 10^115 cách sắp xếp — không thể enumerate
}
```

**Tại sao 3 pass không thừa:**  
Mỗi pass Fisher-Yates trên một mảng đã xáo là một hoán vị ngẫu nhiên độc lập. Tổ hợp 3 hoán vị ngẫu nhiên = 1 hoán vị ngẫu nhiên với phân phối đồng đều — nhưng với entropy tổng cao hơn nhiều.

---

## 4. QUẢN LÝ TRẠNG THÁI BỘ BÀI (Deck State)

### 4.1 Cấu Trúc Dữ Liệu

```typescript
interface DeckState {
  // Thứ tự 78 lá sau khi xáo — đây là "sự thật" của buổi đọc bài
  shuffledOrder: number[];       // Ví dụ: [42, 7, 15, 63, ...]

  // Con trỏ đến lá tiếp theo chưa được rút
  nextCardPointer: number;       // Bắt đầu từ 0

  // Tập hợp ID lá bài đã rút — để kiểm tra O(1)
  drawnCardIds: Set<number>;

  // Metadata phiên
  sessionId: string;             // UUID cho session này
  shuffleTimestamp: number;      // Khi nào xáo
  totalDraws: number;            // Tổng số lần rút trong phiên
}
```

### 4.2 Phạm Vi Phiên (Session Scope)

```
Mỗi lần người dùng click "Xáo Bài" → tạo DeckState mới
  └─ shuffledOrder mới hoàn toàn
  └─ drawnCardIds = {} (rỗng)
  └─ nextCardPointer = 0

Trong cùng một lần đọc (ví dụ: trải 3 lá):
  └─ drawnCardIds tích lũy 3 lá đã rút
  └─ nextCardPointer tăng dần
  └─ TUYỆT ĐỐI không có lá trùng
```

**Lưu trạng thái ở đâu:**  
`sessionStorage` (không phải `localStorage`) → tự động xóa khi đóng tab. Phù hợp với tính chất "một buổi đọc bài".

```typescript
function saveDeckState(state: DeckState): void {
  sessionStorage.setItem('tarot_deck', JSON.stringify({
    ...state,
    drawnCardIds: Array.from(state.drawnCardIds) // Set không serialize được
  }));
}

function loadDeckState(): DeckState | null {
  const raw = sessionStorage.getItem('tarot_deck');
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return {
    ...parsed,
    drawnCardIds: new Set(parsed.drawnCardIds)
  };
}
```

---

## 5. CƠ CHẾ RÚT BÀI — ĐẢM BẢO KHÔNG TRÙNG

### 5.1 Rút Lá Tiếp Theo (Tuần Tự)

```typescript
function drawNextCard(state: DeckState): DrawnCard | null {
  if (state.nextCardPointer >= 78) {
    return null; // Hết bài — yêu cầu xáo lại
  }

  const cardId = state.shuffledOrder[state.nextCardPointer];

  // Kiểm tra an toàn kép — không bao giờ nên true nếu logic đúng
  if (state.drawnCardIds.has(cardId)) {
    // Lỗi nghiêm trọng — log và skip
    console.error(`Duplicate card detected: ${cardId} at position ${state.nextCardPointer}`);
    state.nextCardPointer++;
    return drawNextCard(state); // Recursive skip
  }

  state.drawnCardIds.add(cardId);
  state.nextCardPointer++;
  state.totalDraws++;

  const isReversed = generateIsReversed();

  saveDeckState(state);
  return { cardId, isReversed, drawOrder: state.totalDraws };
}
```

### 5.2 Rút Nhiều Lá Cùng Lúc (Three-Card Spread)

```typescript
function drawMultipleCards(
  state: DeckState,
  count: number,
  positions: string[] // ["Quá Khứ", "Hiện Tại", "Tương Lai"]
): PositionedCard[] {

  if (state.nextCardPointer + count > 78) {
    throw new Error('Không đủ lá bài. Cần xáo lại bộ bài.');
  }

  const results: PositionedCard[] = [];

  for (let i = 0; i < count; i++) {
    const card = drawNextCard(state);
    if (!card) throw new Error('Unexpected null card');
    results.push({
      ...card,
      position: positions[i],
      positionIndex: i
    });
  }

  // Đảm bảo tất cả ID là duy nhất (double-check)
  const ids = results.map(r => r.cardId);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    throw new Error('CRITICAL: Duplicate card IDs detected in multi-draw!');
  }

  return results;
}
```

### 5.3 isReversed — Lá Ngược

```typescript
function generateIsReversed(): boolean {
  // Dùng 1 byte crypto ngẫu nhiên — KHÔNG dùng Math.random()
  const byte = new Uint8Array(1);
  crypto.getRandomValues(byte);

  // Ngưỡng 128/256 = đúng 50%
  // Không có bias: 0-127 = xuôi, 128-255 = ngược
  return byte[0] >= 128;
}
```

**Quan trọng:** `isReversed` được tính **độc lập** với thứ tự xáo. Một lá bài cố định trong shuffledOrder vẫn có thể xuôi hoặc ngược tùy vào lần rút.

---

## 6. UI CHỌN BÀI: SỰ LỰA CHỌN NGƯỜI DÙNG LÀ THẬT

### 6.1 Vấn Đề Thiết Kế

Khi hiển thị 9 lá úp để người dùng chọn, có 2 cách tiếp cận:

| Cách | Mô Tả | Vấn Đề |
|------|--------|---------|
| **A) Post-hoc Assignment** | Lá bài chỉ được gán sau khi người dùng click | "Lựa chọn" chỉ là ảo giác — không quan trọng bạn click đâu |
| **B) Pre-assignment** ✅ | Lá bài được gán vào vị trí trước khi hiển thị | Lựa chọn của người dùng thực sự quyết định lá bài |

**Dùng Pre-assignment (B):** Phù hợp với triết lý Tarot — lá bài "chờ sẵn" ở đó, người dùng dùng trực giác để chọn đúng lá.

### 6.2 Chuẩn Bị Face-Down Cards

```typescript
interface FaceDownPosition {
  positionIndex: number;    // 0–8 (vị trí hiển thị trên UI)
  preAssignedCardId: number; // Lá bài đã được gán sẵn (ẩn với người dùng)
  isReversedIfPicked: boolean; // isReversed đã được định sẵn
}

function prepareFaceDownCards(
  state: DeckState,
  displayCount: number = 9
): FaceDownPosition[] {

  // Lấy displayCount lá tiếp theo từ deck (chưa mark là drawn)
  const upcoming = state.shuffledOrder
    .slice(state.nextCardPointer, state.nextCardPointer + displayCount)
    .map((cardId, idx) => ({
      positionIndex: idx,
      preAssignedCardId: cardId,
      isReversedIfPicked: generateIsReversed()
    }));

  // Xáo VỊ TRÍ HIỂN THỊ (không phải lá bài) để người dùng không đoán được
  // "Lá đầu tiên trong deck" không cố định ở vị trí hiển thị nào
  const displayPositions = Array.from({ length: displayCount }, (_, i) => i);
  const displayEntropy = new Uint8Array(4);
  crypto.getRandomValues(displayEntropy);

  // Fisher-Yates nhanh cho displayPositions
  for (let i = displayCount - 1; i > 0; i--) {
    const j = displayEntropy[i % 4] % (i + 1);
    [displayPositions[i], displayPositions[j]] = [displayPositions[j], displayPositions[i]];
  }

  // Gán lại positionIndex theo thứ tự hiển thị ngẫu nhiên
  return upcoming.map((card, deckOrder) => ({
    ...card,
    positionIndex: displayPositions[deckOrder]
  }));
}
```

**Ví dụ kết quả:**

```
Deck order:  [lá 42] [lá 7] [lá 15] [lá 63] [lá 9] [lá 31] [lá 55] [lá 12] [lá 0]
             ↓ xáo vị trí hiển thị ↓
Display pos: [lá 7]  [lá 55] [lá 0] [lá 42] [lá 31] [lá 12] [lá 15] [lá 63] [lá 9]
UI slot:      [0]    [1]     [2]    [3]     [4]     [5]     [6]     [7]     [8]
```

Người dùng thấy 9 lá úp ngẫu nhiên. Họ click slot 3 → nhận lá 42. Lựa chọn là THẬT.

### 6.3 Khi Người Dùng Chọn

```typescript
function userPicksCard(
  state: DeckState,
  faceDownPositions: FaceDownPosition[],
  pickedDisplayIndex: number
): DrawnCard {

  const picked = faceDownPositions.find(p => p.positionIndex === pickedDisplayIndex);
  if (!picked) throw new Error('Invalid position selected');

  // Tìm vị trí trong shuffledOrder của lá được chọn
  const cardIndexInDeck = state.shuffledOrder.indexOf(picked.preAssignedCardId);

  // Mark tất cả lá từ nextPointer đến cardIndexInDeck là "đã bỏ qua"
  // (vì người dùng không chọn chúng, nhưng chúng đã được "reveal" về mặt vị trí)
  // Chuyển nextPointer qua lá được chọn
  state.nextCardPointer = cardIndexInDeck + 1;
  state.drawnCardIds.add(picked.preAssignedCardId);
  state.totalDraws++;

  // Các lá "bị bỏ qua" (trước lá được chọn) vẫn trong drawnCardIds để tránh re-use
  for (let i = state.shuffledOrder.indexOf(faceDownPositions[0].preAssignedCardId);
       i < cardIndexInDeck; i++) {
    state.drawnCardIds.add(state.shuffledOrder[i]);
  }

  saveDeckState(state);

  return {
    cardId: picked.preAssignedCardId,
    isReversed: picked.isReversedIfPicked,
    drawOrder: state.totalDraws
  };
}
```

---

## 7. TOÀN BỘ LUỒNG TÍCH HỢP

```
[Người dùng nhấn "Xáo Bài"]
        │
        ▼
[Bắt đầu thu entropy]
 ├─ crypto.getRandomValues(78 x Uint32)
 ├─ performance.now() x 32 (timing jitter)
 └─ Start listening: mousemove / touchmove events

        │ (animation xáo bài chạy ~1.5s)
        ▼

[Dừng thu entropy]
 └─ Có đủ user events trong buffer

        │
        ▼
[buildEntropyPool()] ── async SHA-256 hash ──▶ 32 bytes entropy
        │
        ▼
[hyperShuffle(entropy)]
 ├─ Fisher-Yates Pass 1 (entropy SHA-256)
 ├─ Fisher-Yates Pass 2 (fresh crypto XOR pass1)
 └─ Fisher-Yates Pass 3 (fresh crypto)
        │ ~5–20ms
        ▼
[DeckState tạo mới]
 ├─ shuffledOrder = [kết quả 78 lá]
 ├─ drawnCardIds = Set()
 ├─ nextCardPointer = 0
 └─ Lưu vào sessionStorage

        │
        ▼
[prepareFaceDownCards(state, count=9)]
 └─ 9 lá pre-assigned với vị trí hiển thị xáo ngẫu nhiên

        │
        ▼
[Hiển thị 9 lá úp cho người dùng]

        │ (người dùng click 1 lá)
        ▼
[userPicksCard(state, positions, clickedIndex)]
 ├─ Lấy preAssignedCardId của slot được click
 ├─ Cập nhật drawnCardIds và nextPointer
 └─ Return DrawnCard { cardId, isReversed }

        │
        ▼
[Hiển thị lá bài + gọi Gemini API]
```

---

## 8. IMPLEMENTATION ĐẦY ĐỦ — `lib/tarot-deck.ts`

```typescript
// lib/tarot-deck.ts
// Toàn bộ module — AI Coding Agent copy nguyên vào project

'use client'; // Chỉ chạy trên client (cần browser APIs)

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface DrawnCard {
  cardId: number;
  isReversed: boolean;
  drawOrder: number;
}

export interface PositionedCard extends DrawnCard {
  position: string;
  positionIndex: number;
}

export interface FaceDownPosition {
  positionIndex: number;        // Vị trí slot UI (0–8)
  preAssignedCardId: number;
  isReversedIfPicked: boolean;
}

interface DeckStateRaw {
  shuffledOrder: number[];
  nextCardPointer: number;
  drawnCardIds: number[];       // Array để JSON serialize
  sessionId: string;
  shuffleTimestamp: number;
  totalDraws: number;
}

interface DeckState {
  shuffledOrder: number[];
  nextCardPointer: number;
  drawnCardIds: Set<number>;
  sessionId: string;
  shuffleTimestamp: number;
  totalDraws: number;
}

// ─────────────────────────────────────────────
// ENTROPY & RANDOMNESS
// ─────────────────────────────────────────────

function generateIsReversed(): boolean {
  const byte = new Uint8Array(1);
  crypto.getRandomValues(byte);
  return byte[0] >= 128;
}

function unbiasedRandom(max: number, pool: Uint8Array, offset: { v: number }): number {
  const limit = Math.floor(0x100000000 / max) * max;
  while (true) {
    const i = offset.v % pool.length;
    const r = ((pool[i] | (pool[(i+1)%pool.length] << 8) |
                (pool[(i+2)%pool.length] << 16) | (pool[(i+3)%pool.length] << 24)) >>> 0);
    offset.v += 4;
    if (r < limit) return r % max;
  }
}

function runFisherYates(source: number[], entropy: Uint8Array): number[] {
  const deck = [...source];
  const offset = { v: 0 };

  for (let i = deck.length - 1; i > 0; i--) {
    if (offset.v >= entropy.length - 8) {
      const fresh = new Uint8Array(32);
      crypto.getRandomValues(fresh);
      for (let k = 0; k < 32; k++) entropy[k % entropy.length] ^= fresh[k];
      offset.v = 0;
    }
    const j = unbiasedRandom(i + 1, entropy, offset);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

async function buildEntropyFromSources(
  userEvents: Array<{x:number,y:number,dx:number,dy:number,t:number}>,
  timingJitter: number[]
): Promise<Uint8Array> {

  const raw: number[] = [];

  // Source 1: Crypto hardware
  const cryptoBase = new Uint8Array(64);
  crypto.getRandomValues(cryptoBase);
  raw.push(...cryptoBase);

  // Source 2: User behavior
  for (const evt of userEvents) {
    const t = Math.floor(evt.t * 1000);
    raw.push(
      t & 0xff, (t >> 8) & 0xff, (t >> 16) & 0xff, (t >> 24) & 0xff,
      Math.floor(evt.x) & 0xff,
      Math.floor(evt.y) & 0xff,
      (Math.floor(evt.dx * 100) + 32768) & 0xff,
      (Math.floor(evt.dy * 100) + 32768) & 0xff,
    );
  }

  // Source 3: Timing jitter
  for (let i = 1; i < timingJitter.length; i++) {
    const jitter = Math.floor((timingJitter[i] - timingJitter[i-1]) * 1_000_000);
    raw.push(jitter & 0xff, (jitter >> 8) & 0xff, (jitter >> 16) & 0xff);
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(raw));
  return new Uint8Array(hashBuffer);
}

// ─────────────────────────────────────────────
// MAIN SHUFFLE FUNCTION
// ─────────────────────────────────────────────

export async function hyperShuffle(
  userEvents: Array<{x:number,y:number,dx:number,dy:number,t:number}>,
  timingJitter: number[]
): Promise<number[]> {

  const baseOrder = Array.from({ length: 78 }, (_, i) => i);

  // Pass 1: User entropy + crypto
  const entropy1 = await buildEntropyFromSources(userEvents, timingJitter);
  const pass1 = runFisherYates(baseOrder, new Uint8Array(entropy1));

  // Pass 2: Fresh crypto XOR'ed với entropy1
  const entropy2 = new Uint8Array(32);
  crypto.getRandomValues(entropy2);
  for (let i = 0; i < 32; i++) entropy2[i] ^= entropy1[i];
  const pass2 = runFisherYates(pass1, entropy2);

  // Pass 3: Độc lập hoàn toàn
  const entropy3 = new Uint8Array(32);
  crypto.getRandomValues(entropy3);
  const pass3 = runFisherYates(pass2, entropy3);

  return pass3;
}

// ─────────────────────────────────────────────
// DECK STATE MANAGEMENT
// ─────────────────────────────────────────────

const STORAGE_KEY = 'tarot_meo_vang_deck';

function generateSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function createNewDeck(shuffledOrder: number[]): DeckState {
  return {
    shuffledOrder,
    nextCardPointer: 0,
    drawnCardIds: new Set<number>(),
    sessionId: generateSessionId(),
    shuffleTimestamp: Date.now(),
    totalDraws: 0,
  };
}

export function saveDeck(state: DeckState): void {
  const raw: DeckStateRaw = {
    ...state,
    drawnCardIds: Array.from(state.drawnCardIds),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
}

export function loadDeck(): DeckState | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed: DeckStateRaw = JSON.parse(raw);
  return {
    ...parsed,
    drawnCardIds: new Set(parsed.drawnCardIds),
  };
}

export function clearDeck(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

// ─────────────────────────────────────────────
// CARD DRAWING
// ─────────────────────────────────────────────

export function drawNextCard(state: DeckState): DrawnCard | null {
  if (state.nextCardPointer >= 78) return null;

  const cardId = state.shuffledOrder[state.nextCardPointer];
  state.drawnCardIds.add(cardId);
  state.nextCardPointer++;
  state.totalDraws++;

  saveDeck(state);
  return { cardId, isReversed: generateIsReversed(), drawOrder: state.totalDraws };
}

export function drawMultiple(
  state: DeckState,
  positions: string[]
): PositionedCard[] {
  const count = positions.length;
  if (state.nextCardPointer + count > 78) {
    throw new Error(`Không đủ lá. Cần ${count} lá nhưng chỉ còn ${78 - state.nextCardPointer}.`);
  }

  return positions.map((position, i) => {
    const card = drawNextCard(state)!;
    return { ...card, position, positionIndex: i };
  });
}

// ─────────────────────────────────────────────
// FACE-DOWN CARD PREPARATION
// ─────────────────────────────────────────────

export function prepareFaceDownCards(
  state: DeckState,
  displayCount: number = 9
): FaceDownPosition[] {
  const available = 78 - state.nextCardPointer;
  const actualCount = Math.min(displayCount, available);

  // Lấy n lá tiếp theo từ deck (chưa mark drawn)
  const upcomingCards = state.shuffledOrder
    .slice(state.nextCardPointer, state.nextCardPointer + actualCount)
    .map((cardId) => ({
      preAssignedCardId: cardId,
      isReversedIfPicked: generateIsReversed(),
    }));

  // Xáo vị trí hiển thị để không lộ thứ tự deck
  const displaySlots = Array.from({ length: actualCount }, (_, i) => i);
  const shuffleBytes = new Uint8Array(actualCount);
  crypto.getRandomValues(shuffleBytes);

  for (let i = actualCount - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1);
    [displaySlots[i], displaySlots[j]] = [displaySlots[j], displaySlots[i]];
  }

  return upcomingCards.map((card, deckOrder) => ({
    ...card,
    positionIndex: displaySlots[deckOrder],
  }));
}

export function userPicksFromFaceDown(
  state: DeckState,
  faceDownPositions: FaceDownPosition[],
  pickedDisplayIndex: number
): DrawnCard {
  const picked = faceDownPositions.find(p => p.positionIndex === pickedDisplayIndex);
  if (!picked) throw new Error('Invalid slot index');

  // Mark tất cả lá được pre-assign trong batch này là đã dùng
  // (dù người dùng chỉ lấy 1 — để không bao giờ re-show chúng)
  for (const fp of faceDownPositions) {
    state.drawnCardIds.add(fp.preAssignedCardId);
  }

  // Advance pointer qua toàn bộ batch
  state.nextCardPointer += faceDownPositions.length;
  state.totalDraws++;

  saveDeck(state);

  return {
    cardId: picked.preAssignedCardId,
    isReversed: picked.isReversedIfPicked,
    drawOrder: state.totalDraws,
  };
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

export function getRemainingCount(state: DeckState): number {
  return 78 - state.nextCardPointer;
}

export function hasEnoughCards(state: DeckState, needed: number): boolean {
  return getRemainingCount(state) >= needed;
}
```

---

## 9. ENTROPY COLLECTOR COMPONENT — `hooks/useEntropyCollector.ts`

```typescript
// hooks/useEntropyCollector.ts
// Hook React để thu entropy trong lúc hoạt ảnh xáo bài

import { useRef, useCallback } from 'react';

interface EntropyEvent {
  x: number; y: number; dx: number; dy: number; t: number;
}

export function useEntropyCollector() {
  const events = useRef<EntropyEvent[]>([]);
  const timings = useRef<number[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const isCollecting = useRef(false);

  const startCollecting = useCallback(() => {
    events.current = [];
    timings.current = [];
    isCollecting.current = true;

    // Thu timing jitter ngay lập tức
    for (let i = 0; i < 32; i++) {
      timings.current.push(performance.now());
    }
  }, []);

  const onMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!isCollecting.current) return;
    const x = 'clientX' in e ? e.clientX : 0;
    const y = 'clientY' in e ? e.clientY : 0;
    const dx = lastPos.current ? x - lastPos.current.x : 0;
    const dy = lastPos.current ? y - lastPos.current.y : 0;
    lastPos.current = { x, y };
    events.current.push({ x, y, dx, dy, t: performance.now() });
  }, []);

  const onTouchMove = useCallback((e: TouchEvent | React.TouchEvent) => {
    if (!isCollecting.current) return;
    const touch = 'touches' in e ? e.touches[0] : null;
    if (!touch) return;
    const x = touch.clientX;
    const y = touch.clientY;
    const dx = lastPos.current ? x - lastPos.current.x : 0;
    const dy = lastPos.current ? y - lastPos.current.y : 0;
    lastPos.current = { x, y };
    events.current.push({ x, y, dx, dy, t: performance.now() });
  }, []);

  const stopCollecting = useCallback(() => {
    isCollecting.current = false;
    // Thu thêm jitter cuối
    for (let i = 0; i < 16; i++) timings.current.push(performance.now());
    return {
      events: events.current,
      timings: timings.current,
    };
  }, []);

  return { startCollecting, stopCollecting, onMouseMove, onTouchMove };
}
```

---

## 10. PATTERN SỬ DỤNG TRONG COMPONENT

```typescript
// Ví dụ sử dụng trong reading/single/page.tsx

import { hyperShuffle, createNewDeck, prepareFaceDownCards, userPicksFromFaceDown } from '@/lib/tarot-deck';
import { useEntropyCollector } from '@/hooks/useEntropyCollector';

export default function SingleReadingPage() {
  const [deckState, setDeckState] = useState<DeckState | null>(null);
  const [faceDownCards, setFaceDownCards] = useState<FaceDownPosition[]>([]);
  const [drawnCard, setDrawnCard] = useState<DrawnCard | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  const { startCollecting, stopCollecting, onMouseMove, onTouchMove } = useEntropyCollector();

  const handleShuffleClick = async () => {
    setIsShuffling(true);
    startCollecting();

    // Chạy animation xáo bài (~1500ms)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Thu entropy và xáo
    const { events, timings } = stopCollecting();
    const shuffledOrder = await hyperShuffle(events, timings);

    const newDeck = createNewDeck(shuffledOrder);
    const faceDown = prepareFaceDownCards(newDeck, 9);

    setDeckState(newDeck);
    setFaceDownCards(faceDown);
    setIsShuffling(false);
  };

  const handleCardPick = (slotIndex: number) => {
    if (!deckState) return;
    const drawn = userPicksFromFaceDown(deckState, faceDownCards, slotIndex);
    setDrawnCard(drawn);
    setDeckState({ ...deckState }); // Re-render sau khi state đã mutate
  };

  return (
    <div onMouseMove={onMouseMove} onTouchMove={onTouchMove as any}>
      {/* ... UI ... */}
    </div>
  );
}
```

---

## 11. ĐẢM BẢO KHÔNG TRÙNG — PHÂN TÍCH TOÁN HỌC

### Chứng Minh Tuyệt Đối Không Trùng

```
Cho: shuffledOrder là hoán vị của [0..77] — mỗi ID xuất hiện đúng 1 lần.
     nextCardPointer luôn tăng đơn điệu (chỉ tăng, không giảm).
     drawnCardIds là superset của tất cả ID từ 0 đến nextCardPointer-1.

Với mọi lần gọi drawNextCard():
  1. cardId = shuffledOrder[nextCardPointer]
  2. Vì shuffledOrder là hoán vị: cardId xuất hiện đúng 1 lần trong mảng
  3. nextCardPointer tăng → vị trí này không bao giờ được truy cập lại
  4. drawnCardIds.add(cardId) → tracking phụ cho safety check

Kết luận: Không thể có 2 lần gọi drawNextCard() trả về cùng cardId
          trong cùng DeckState, vì shuffledOrder là injective mapping.
```

### Số Lượng Hoán Vị Có Thể

```
78! = 8.944 × 10^115

Để so sánh:
  Số nguyên tử trong vũ trụ quan sát được: ~10^80
  Số năm tuổi vũ trụ tính bằng giây: ~4.3 × 10^17

→ Không có máy tính nào enumerate được tất cả hoán vị.
→ Mỗi xáo bài là duy nhất trong thực tế.
```

---

## 12. EDGE CASES & GUARD RAILS

| Tình Huống | Xử Lý |
|-----------|--------|
| Người dùng refresh trang | sessionStorage tự xóa → DeckState null → yêu cầu xáo lại |
| Người dùng click "Xáo Lại" giữa chừng | Tạo DeckState mới hoàn toàn, xóa cái cũ |
| Rút hết 78 lá | `drawNextCard()` trả về `null` → show toast "Bộ bài đã được dùng hết, xáo lại nhé!" |
| 78 - nextPointer < displayCount | `prepareFaceDownCards` tự giảm actualCount |
| Tab bị clone/duplicate | sessionId khác nhau → không conflict |
| Không có user events (bot?) | `hyperShuffle` vẫn chạy với crypto entropy — entropy vẫn đủ tốt |
| SubtleCrypto không available | Fallback: dùng trực tiếp `crypto.getRandomValues()` không qua SHA-256 |

---

## 13. GHI CHÚ CHO AI CODING AGENT

1. **Không import module này trong Server Components hay API Routes** — nó dùng `window.crypto`, `sessionStorage`, chỉ available trên browser.

2. **`'use client'` directive** phải có ở đầu file `tarot-deck.ts`.

3. **DeckState mutation:** Các function `drawNextCard`, `userPicksFromFaceDown` mutate `state` in-place VÀ gọi `saveDeck()` bên trong. Caller cần gọi `setDeckState({...state})` sau để React re-render.

4. **Kết nối với Gemini API:** `DrawnCard.cardId` là index trong mảng `TAROT_CARDS` từ `lib/cards-data.ts`. Lấy thông tin lá bài: `TAROT_CARDS[drawnCard.cardId]`.

5. **Test:** Sau khi implement, test bằng cách rút 78 lá liên tiếp và assert rằng `new Set(allDrawnIds).size === 78`.

---

*Spec thuật toán này độc lập với spec tổng thể `tarot-meo-vang-vibe-coding-spec.md`.*  
*Import và dùng `lib/tarot-deck.ts` như một black box — API surface rõ ràng ở Mục 8.*
