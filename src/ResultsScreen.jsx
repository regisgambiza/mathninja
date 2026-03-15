import React from 'react';
import s from './ResultsScreen.module.css';

const msgs = [
  'Keep practising — you\'ll get it! 💪',
  'Getting there! 🎯',
  'Nice work! ⚡',
  'Math Ninja! 🥷',
  'Absolutely legendary!! 🔥',
];

export default function ResultsScreen({ mode, results, onReplay, onHome }) {
  const { score, correctTaps, wrongTaps, bestCombo, level } = results;
  const msgIdx = Math.min(Math.floor(score / 80), msgs.length - 1);

  return (
    <div className={s.wrap}>
      <div className={s.ninja}>🥷</div>
      <h1 className={s.title}>Game Over</h1>
      <div className={s.score}>{score}</div>
      <p className={s.msg}>{msgs[msgIdx]}</p>

      <div className={s.statsBox}>
        {[
          ['Topic', mode.charAt(0).toUpperCase() + mode.slice(1)],
          ['Level reached', 'Lv ' + (level || 1)],
          ['Correct taps', correctTaps],
          ['Wrong taps', wrongTaps],
          ['Best combo', 'x' + bestCombo],
        ].map(([k, v]) => (
          <div key={k} className={s.row}>
            <span className={s.key}>{k}</span>
            <span className={s.val}>{v}</span>
          </div>
        ))}
      </div>

      <button className={s.replayBtn} onClick={onReplay}>Play Again</button>
      <button className={s.homeBtn} onClick={onHome}>🏠 Change Topic</button>
    </div>
  );
}
