import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const ResultPage = () => {
  const { gameResult, resetGame } = useGame();
  const navigate = useNavigate();

  const handleReset = () => {
    resetGame();
    navigate('/');
  };

  if (!gameResult.restaurant) {
    return <div>결과를 불러오는 중...</div>;
  }

  return (
    <div className="result-container">
      <h1>🎉 결과 발표 🎉</h1>

      <div className="winner-card" style={{ border: '2px solid #2196F3' }}>
        <h2>오늘의 점심</h2>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {gameResult.restaurant.name}
        </div>
        <p style={{ color: '#666' }}>{gameResult.restaurant.category}</p>
      </div>

      <div className="winner-card" style={{ border: '2px solid #f44336', marginTop: '10px' }}>
        <h2>💳 결제자</h2>
        <div className="loser-list">
          {gameResult.payers.map((p) => p.name).join(', ')}
        </div>
        <p>잘 먹겠습니다!</p>
      </div>

      <button onClick={handleReset} style={{ marginTop: '30px', backgroundColor: '#333' }}>
        다시 하기
      </button>
    </div>
  );
};

export default ResultPage;
