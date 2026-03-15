import React, { useState, useCallback } from 'react';
import HomeScreen from './HomeScreen';
import InstructionScreen from './InstructionScreen';
import Countdown from './Countdown';
import GameScreen from './GameScreen';
import ResultsScreen from './ResultsScreen';
import { makeTask } from './mathHelpers';
import s from './MathNinjaApp.module.css';

// screens: home | instructions | countdown | game | results
export default function MathNinjaApp() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('factors');
  const [task, setTask] = useState(null);
  const [results, setResults] = useState(null);
  const [gameKey, setGameKey] = useState(0); // force remount GameScreen on replay

  const handleChooseMode = useCallback((m) => {
    setMode(m);
    setTask(makeTask(m));
    setScreen('instructions');
  }, []);

  const handleStartCountdown = useCallback(() => setScreen('countdown'), []);
  const handleCountdownDone = useCallback(() => setScreen('game'), []);

  const handleGameOver = useCallback((r) => {
    setResults(r);
    setScreen('results');
  }, []);

  const handleReplay = useCallback(() => {
    setTask(makeTask(mode));
    setGameKey(k => k + 1);
    setScreen('countdown');
  }, [mode]);

  const handleHome = useCallback(() => setScreen('home'), []);

  return (
    <div className={s.shell}>
      <div className={s.phone}>
        {screen === 'home' && <div className={s.scrollable}><HomeScreen onChoose={handleChooseMode} /></div>}
        {screen === 'instructions' && <div className={s.scrollable}><InstructionScreen mode={mode} task={task} onStart={handleStartCountdown} /></div>}
        {screen === 'countdown' && <Countdown onDone={handleCountdownDone} />}
        {screen === 'game' && task && (
          <GameScreen key={gameKey} mode={mode} initialTask={task} onGameOver={handleGameOver} />
        )}
        {screen === 'results' && results && (
          <div className={s.scrollable}>
            <ResultsScreen mode={mode} results={results} onReplay={handleReplay} onHome={handleHome} />
          </div>
        )}
      </div>
    </div>
  );
}
