import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const DrawPage = () => {
  const { revealResult, gameState } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameState === 'result') {
      navigate('/result');
    }
  }, [gameState, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      revealResult();
    }, 3000);

    return () => clearTimeout(timer);
  }, [revealResult]);

  return (
    <div className="result-container">
      <h1>운명의 시간...</h1>
      <div className="animate-spin" style={{ fontSize: '4rem', margin: '2rem' }}>
        🎲
      </div>
      <p>오늘의 점심과 결제자는?</p>
    </div>
  );
};

export default DrawPage;
