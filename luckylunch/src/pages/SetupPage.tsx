import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const SetupPage = () => {
  const { startGame, gameState } = useGame();
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [payerCount, setPayerCount] = useState<number>(1);
  const [names, setNames] = useState<string[]>(['', '', '']);

  useEffect(() => {
    if (gameState === 'card-select') {
      navigate('/select');
    }
  }, [gameState, navigate]);

  useEffect(() => {
    // Adjust names array when player count changes
    setNames((prev) => {
      const newNames = [...prev];
      if (playerCount > prev.length) {
        for (let i = prev.length; i < playerCount; i++) {
          newNames.push('');
        }
      } else {
        newNames.length = playerCount;
      }
      return newNames;
    });
    
    // Ensure payer count is valid
    if (payerCount >= playerCount) {
      setPayerCount(playerCount - 1);
    }
  }, [playerCount]);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (names.some((name) => !name.trim())) {
      alert('모든 참가자의 이름을 입력해주세요.');
      return;
    }
    startGame(names, payerCount);
  };

  return (
    <div className="setup-container">
      <h1>Lucky Lunch 🍀</h1>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '350px' }}>
        <div className="input-group">
          <label htmlFor="playerCount">참가 인원 ({playerCount}명)</label>
          <input
            type="range"
            id="playerCount"
            min="2"
            max="10"
            value={playerCount}
            onChange={(e) => setPlayerCount(parseInt(e.target.value))}
          />
        </div>

        <div className="input-group">
          <label htmlFor="payerCount">결제자 수 ({payerCount}명)</label>
          <input
            type="range"
            id="payerCount"
            min="1"
            max={playerCount - 1}
            value={payerCount}
            onChange={(e) => setPayerCount(parseInt(e.target.value))}
            disabled={playerCount <= 1}
          />
        </div>

        <div className="input-group">
          <label>참가자 이름</label>
          {names.map((name, index) => (
            <input
              key={index}
              type="text"
              placeholder={`참가자 ${index + 1}`}
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              required
            />
          ))}
        </div>

        <button type="submit" style={{ marginTop: '20px', width: '100%' }}>
          게임 시작
        </button>
      </form>
    </div>
  );
};

export default SetupPage;
