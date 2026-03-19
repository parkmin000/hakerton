import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const CardSelectPage = () => {
  const { players, selectCard, startDrawing, gameState } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameState === 'drawing') {
      navigate('/draw');
    }
  }, [gameState, navigate]);

  const currentPlayer = useMemo(() => {
    return players.find((p) => p.selectedCardIndex === null);
  }, [players]);

  const allSelected = !currentPlayer;

  const handleCardClick = (index: number) => {
    if (allSelected) return;

    // Check if card is already taken
    const isTaken = players.some((p) => p.selectedCardIndex === index);
    if (isTaken) {
      alert('이미 선택된 카드입니다.');
      return;
    }

    if (currentPlayer) {
      selectCard(currentPlayer.id, index);
    }
  };

  // Generate cards array based on number of players
  const cards = Array.from({ length: players.length }, (_, i) => i);

  return (
    <div>
      <h2>카드 뽑기</h2>
      <p style={{ marginBottom: '20px' }}>
        {allSelected
          ? '모든 참가자가 카드를 선택했습니다.'
          : `${currentPlayer?.name}님의 차례입니다. 카드를 선택해주세요.`}
      </p>

      <div className="player-list">
        {players.map((player) => (
          <div
            key={player.id}
            className={`player-badge ${
              player.selectedCardIndex !== null ? 'has-selected' : ''
            }`}
            style={{
              border:
                currentPlayer?.id === player.id ? '2px solid #4CAF50' : 'none',
            }}
          >
            {player.name}
            {player.selectedCardIndex !== null && ' ✔'}
          </div>
        ))}
      </div>

      <div className="card-grid">
        {cards.map((index) => {
          const takenBy = players.find((p) => p.selectedCardIndex === index);
          return (
            <div
              key={index}
              className={`card ${takenBy ? 'selected' : ''}`}
              onClick={() => handleCardClick(index)}
              style={{
                backgroundColor: takenBy ? '#e0e0e0' : '#333',
                color: takenBy ? '#333' : '#fff',
                cursor: takenBy || allSelected ? 'default' : 'pointer',
              }}
            >
              <div className="card-content">
                {takenBy ? takenBy.name : '?'}
              </div>
            </div>
          );
        })}
      </div>

      {allSelected && (
        <button
          onClick={startDrawing}
          style={{ marginTop: '30px', fontSize: '1.2rem' }}
        >
          결과 추첨 시작!
        </button>
      )}
    </div>
  );
};

export default CardSelectPage;
