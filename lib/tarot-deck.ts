'use client';

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
  positionIndex: number;        // Vị trí slot UI
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

export interface DeckState {
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
  timingJitter: number[],
  totalCards: number = 78
): Promise<number[]> {

  const baseOrder = Array.from({ length: totalCards }, (_, i) => i);

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
    shuffledOrder: state.shuffledOrder,
    nextCardPointer: state.nextCardPointer,
    drawnCardIds: Array.from(state.drawnCardIds),
    sessionId: state.sessionId,
    shuffleTimestamp: state.shuffleTimestamp,
    totalDraws: state.totalDraws,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
}

export function loadDeck(): DeckState | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed: DeckStateRaw = JSON.parse(raw);
  return {
    shuffledOrder: parsed.shuffledOrder,
    nextCardPointer: parsed.nextCardPointer,
    drawnCardIds: new Set(parsed.drawnCardIds),
    sessionId: parsed.sessionId,
    shuffleTimestamp: parsed.shuffleTimestamp,
    totalDraws: parsed.totalDraws,
  };
}

export function clearDeck(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

// ─────────────────────────────────────────────
// CARD DRAWING
// ─────────────────────────────────────────────

export function drawNextCard(state: DeckState): DrawnCard | null {
  if (state.nextCardPointer >= state.shuffledOrder.length) return null;

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
  const total = state.shuffledOrder.length;
  if (state.nextCardPointer + count > total) {
    throw new Error(`Không đủ lá. Cần ${count} lá nhưng chỉ còn ${total - state.nextCardPointer}.`);
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
  const total = state.shuffledOrder.length;
  const available = total - state.nextCardPointer;
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
    preAssignedCardId: card.preAssignedCardId,
    isReversedIfPicked: card.isReversedIfPicked,
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

  // Tìm vị trí của lá bài được chọn trong shuffledOrder
  const idxInDeck = state.shuffledOrder.indexOf(picked.preAssignedCardId);
  if (idxInDeck === -1) {
    throw new Error('Picked card not found in deck');
  }

  // Đổi chỗ lá bài được chọn về vị trí nextCardPointer hiện tại để cố định thứ tự rút
  if (idxInDeck >= state.nextCardPointer) {
    const temp = state.shuffledOrder[state.nextCardPointer];
    state.shuffledOrder[state.nextCardPointer] = state.shuffledOrder[idxInDeck];
    state.shuffledOrder[idxInDeck] = temp;
  }

  // Chỉ đánh dấu duy nhất lá bài được chọn là đã dùng
  state.drawnCardIds.add(picked.preAssignedCardId);

  // Chỉ tịnh tiến pointer lên 1 lá
  state.nextCardPointer++;
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
  return state.shuffledOrder.length - state.nextCardPointer;
}

export function hasEnoughCards(state: DeckState, needed: number): boolean {
  return getRemainingCount(state) >= needed;
}
