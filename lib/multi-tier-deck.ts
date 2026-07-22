import { DeckState } from './tarot-deck';
import { TarotCard as TarotCardType } from './cards-data';

export interface MultiRoundCard {
  id: string;
  card: TarotCardType;
  isReversed: boolean;
  pickOrder: number;
  round: number;
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
  label?: string;
  note?: string;
  locked?: boolean;
  deckId?: string;
}

export interface TierRound {
  roundNumber: number;
  roundName: string;               // Custom name (e.g. "Vòng Nhận Thức")
  soulMarkIndex: number;           // Index in SOUL_MARKS
  cards: MultiRoundCard[];          // Drawn cards in this round
  deckMode: 'fresh' | 'continue'; // Reset deck or continue drawing
  maxCards: number;                // Max cards limit for this round (1-20)
  activeLayoutPreset?: string;     // Active layout preset ID (e.g. "three-card", "celtic-cross")
}

export interface MultiTierState {
  rounds: TierRound[];
  currentRoundNumber: number;
  globalDrawnIds: number[];       // All drawn card IDs across all rounds
}

// Helpers
export function createInitialRound(roundNumber: number, soulMarkIndex: number): TierRound {
  return {
    roundNumber,
    roundName: `Vòng ${roundNumber}`,
    soulMarkIndex,
    cards: [],
    deckMode: roundNumber === 1 ? 'fresh' : 'continue',
    maxCards: 3,
  };
}
