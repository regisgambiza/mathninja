import React from 'react';
import s from './InstructionScreen.module.css';
import { pick } from './mathHelpers';

const BALL_COLS = ['#7C6FCD', '#5B8FD4', '#6DAACC', '#9B8DC4', '#7EA8B8', '#5E9BB5'];

const modeDesc = {
  factors: (task) =>
    `A factor divides a number exactly — no remainder left over. For example, 3 is a factor of 12 because 12 ÷ 3 = 4 perfectly. 5 is not a factor because 12 ÷ 5 = 2.4.`,
  multiples: (task) =>
    `A multiple is a number that appears in a times table. If you can write it as N × something, it's a multiple. For example, 20 is a multiple of 4 because 4 × 5 = 20.`,
  primes: () =>
    `A prime number has exactly 2 factors: 1 and itself. So 7 is prime (only 1 and 7 divide it). But 9 is NOT prime because 1, 3, and 9 all divide it.`,
  mixed: () =>
    `The rule will change every 30 seconds! Always check the task bar at the bottom before you tap.`,
};

export default function InstructionScreen({ mode, task, onStart }) {
  const modeLabel = { factors: '🌿 Factors', multiples: '✖️ Multiples', primes: '💎 Primes', mixed: '⚡ Mixed' }[mode];
  const sampleNums = (task?.pool || []).slice(0, 6);

  return (
    <div className={s.wrap}>
      <div className={s.modeTag}>{modeLabel}</div>
      <div className={s.taskBox}>
        <div className={s.taskLabel}>YOUR TASK</div>
        <div className={s.taskText}>{task?.bigtext}</div>
        <div className={s.taskHint}>{task?.example}</div>
      </div>

      <div className={s.descBox}>
        <div className={s.descText}>{modeDesc[mode]?.(task)}</div>
      </div>

      <div className={s.previewSection}>
        <div className={s.previewLabel}>All balls look identical — no colour clues!</div>
        <div className={s.previewRow}>
          {sampleNums.map((n, i) => (
            <div key={i} className={s.ball} style={{ borderColor: BALL_COLS[i % BALL_COLS.length] + 'cc', background: BALL_COLS[i % BALL_COLS.length] + '28' }}>
              {n}
            </div>
          ))}
        </div>
      </div>

      <button className={s.startBtn} onClick={onStart}>
        ▶ Start Game
      </button>
    </div>
  );
}
