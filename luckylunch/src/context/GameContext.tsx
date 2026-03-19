import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Player, Restaurant, GameState, GameResult } from '../types';
import { restaurants } from '../data/restaurants';

interface GameContextType {
  gameState: GameState;
  players: Player[];
  payerCount: number;
  gameResult: GameResult;
  startGame: (names: string[], payerCount: number) => void;
  selectCard: (playerId: string, cardIndex: number) => void;
  startDrawing: () => void;
  revealResult: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [payerCount, setPayerCount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult>({ restaurant: null, payers: [] });

  // Shuffle array utility
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startGame = (names: string[], count: number) => {
    const newPlayers: Player[] = names.map((name, index) => ({
      id: `p-${index}`,
      name,
      selectedCardIndex: null,
      isPayer: false,
    }));
    setPlayers(newPlayers);
    setPayerCount(count);
    setGameState('card-select');
    setGameResult({ restaurant: null, payers: [] });
  };

  const selectCard = (playerId: string, cardIndex: number) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, selectedCardIndex: cardIndex } : p))
    );
  };

  const startDrawing = () => {
    setGameState('drawing');
  };

  const revealResult = () => {
    // 1. Pick a random restaurant
    const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)];

    // 2. Determine payers
    // Create an array of results: true for payer, false for safe
    const totalPlayers = players.length;
    const results = Array(totalPlayers).fill(false);
    for (let i = 0; i < payerCount; i++) {
      results[i] = true;
    }
    
    // Shuffle the results to assign to card positions
    // cardIndex 0 -> result[0], cardIndex 1 -> result[1], etc.
    const shuffledResults = shuffleArray(results);

    // 3. Assign results to players based on their selected card index
    const updatedPlayers = players.map((player) => {
      // If a player hasn't selected a card (shouldn't happen if UI blocks it),
      // we might need a fallback, but let's assume valid selection.
      // If cardIndex is null, we treat it as 0 or handle error.
      const cardIdx = player.selectedCardIndex ?? 0;
      return {
        ...player,
        isPayer: shuffledResults[cardIdx],
      };
    });

    const payers = updatedPlayers.filter((p) => p.isPayer);

    setPlayers(updatedPlayers);
    setGameResult({ restaurant: randomRestaurant, payers });
    setGameState('result');
  };

  const resetGame = () => {
    setGameState('setup');
    setPlayers([]);
    setPayerCount(0);
    setGameResult({ restaurant: null, payers: [] });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        players,
        payerCount,
        gameResult,
        startGame,
        selectCard,
        startDrawing,
        revealResult,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
