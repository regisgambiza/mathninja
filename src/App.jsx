// Main Portal App - Routes to different games
import React, { useState, useCallback } from 'react';
import LandingPage from './LandingPage';
import MathNinjaApp from './MathNinjaApp';
import s from './App.module.css';

export default function App() {
  const [currentGame, setCurrentGame] = useState(null);

  const handleChooseGame = useCallback((gameId) => {
    if (gameId === 'mathninja') {
      setCurrentGame('mathninja');
    }
  }, []);

  const handleBackToPortal = useCallback(() => {
    setCurrentGame(null);
  }, []);

  return (
    <div className={s.shell}>
      {currentGame === null && (
        <LandingPage onChooseGame={handleChooseGame} />
      )}
      
      {currentGame === 'mathninja' && (
        <div className={s.gameContainer}>
          <button className={s.backBtn} onClick={handleBackToPortal}>
            ← Back to Portal
          </button>
          <div className={s.gameFrame}>
            <MathNinjaApp />
          </div>
        </div>
      )}
    </div>
  );
}
