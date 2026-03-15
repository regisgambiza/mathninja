import React from 'react';
import s from './HomeScreen.module.css';

const modes = [
  { id: 'factors',   icon: '🌿', title: 'Factors',        sub: 'Which numbers divide exactly into N?' },
  { id: 'multiples', icon: '✖️', title: 'Multiples',       sub: 'Which numbers are in the N times table?' },
  { id: 'primes',    icon: '💎', title: 'Prime Numbers',   sub: 'Numbers with exactly 2 factors only' },
  { id: 'mixed',     icon: '⚡', title: 'Mixed Challenge', sub: 'All topics — rule changes every 30s' },
];

export default function HomeScreen({ onChoose }) {
  return (
    <div className={s.wrap}>
      <div className={s.hero}>
        <div className={s.sword}>⚔️</div>
        <h1 className={s.title}>Math Ninja</h1>
        <p className={s.tagline}>Numbers fall. You decide. Tap fast — think faster.</p>
      </div>

      <div className={s.howbox}>
        <div className={s.howTitle}>HOW TO PLAY</div>
        {[
          ['1', 'A rule appears at the bottom — e.g. "Tap factors of 18"'],
          ['2', 'Numbers fall from the top. ALL look the same — use maths to decide!'],
          ['3', 'Tap the correct numbers. Wrong tap = lose a life ❤️'],
          ['4', 'Let a correct number fall off = lose a life too!'],
        ].map(([n, t]) => (
          <div key={n} className={s.howrow}>
            <div className={s.hownum}>{n}</div>
            <div className={s.howtext}>{t}</div>
          </div>
        ))}
      </div>

      <div className={s.modeLabel}>CHOOSE A TOPIC</div>
      <div className={s.modeGrid}>
        {modes.map(m => (
          <button key={m.id} className={s.modeCard} onClick={() => onChoose(m.id)}>
            <span className={s.modeIcon}>{m.icon}</span>
            <div className={s.modeBody}>
              <div className={s.modeTitle}>{m.title}</div>
              <div className={s.modeSub}>{m.sub}</div>
            </div>
            <span className={s.arrow}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
