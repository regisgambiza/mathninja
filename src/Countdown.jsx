import React, { useEffect, useState } from 'react';
import s from './Countdown.module.css';

export default function Countdown({ onDone }) {
  const [n, setN] = useState(3);

  useEffect(() => {
    if (n === 0) { setTimeout(onDone, 600); return; }
    const t = setTimeout(() => setN(v => v - 1), 900);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className={s.wrap}>
      <div className={s.num} key={n}>{n === 0 ? 'GO!' : n}</div>
    </div>
  );
}
