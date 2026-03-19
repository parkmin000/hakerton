export interface Restaurant {
  id: number;
  name: string;
  category: string;
  distance?: number;
}

export interface Player {
  id: string;
  name: string;
  selectedCardIndex: number | null;
  isPayer: boolean;
}

export type GameState = 'setup' | 'card-select' | 'drawing' | 'result';

export interface GameResult {
  restaurant: Restaurant | null;
  payers: Player[];
}
