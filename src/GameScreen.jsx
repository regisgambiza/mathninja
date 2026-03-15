import React, { useEffect, useRef, useCallback } from 'react';
import s from './GameScreen.module.css';
import { pick, rand, makeTask } from './mathHelpers';

const BALL_COLS = ['#7C6FCD', '#5B8FD4', '#6DAACC', '#9B8DC4', '#7EA8B8', '#c47c8a', '#7dbb8f'];
// Gentle, gradual level ramp: small bumps in speed and spawn rate each tier
// Very gentle 12-level ramp (minimal deltas per level)
const LEVELS = [
  { level: 1, speedMult: 0.35, spawnRate: 240, threshold: 0 },
  { level: 2, speedMult: 0.40, spawnRate: 232, threshold: 100 },
  { level: 3, speedMult: 0.45, spawnRate: 224, threshold: 220 },
  { level: 4, speedMult: 0.50, spawnRate: 216, threshold: 360 },
  { level: 5, speedMult: 0.55, spawnRate: 208, threshold: 520 },
  { level: 6, speedMult: 0.60, spawnRate: 200, threshold: 700 },
  { level: 7, speedMult: 0.66, spawnRate: 192, threshold: 900 },
  { level: 8, speedMult: 0.72, spawnRate: 184, threshold: 1120 },
  { level: 9, speedMult: 0.78, spawnRate: 176, threshold: 1360 },
  { level: 10, speedMult: 0.84, spawnRate: 168, threshold: 1620 },
  { level: 11, speedMult: 0.90, spawnRate: 160, threshold: 1900 },
  { level: 12, speedMult: 0.98, spawnRate: 150, threshold: 2200 },
];

export default function GameScreen({ mode, initialTask, onGameOver }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const stateRef = useRef(null);

  const scoreEl = useRef(null);
  const livesEl = useRef(null);
  const comboEl = useRef(null);
  const levelEl = useRef(null);
  const taskBigEl = useRef(null);
  const taskHintEl = useRef(null);
  const floatyContainer = useRef(null);

  const updateLivesDOM = useCallback((lives) => {
    if (livesEl.current)
      livesEl.current.textContent = '❤️'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
  }, []);

  const addFloaty = useCallback((x, y, text, color) => {
    const el = document.createElement('div');
    el.className = 'floaty';
    el.style.left = (x - 28) + 'px';
    el.style.top = Math.max(60, y - 16) + 'px';
    el.style.color = color;
    el.textContent = text;
    floatyContainer.current?.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }, []);

  const updateLevelDOM = useCallback((lvl) => {
    if (levelEl.current) levelEl.current.textContent = `Lv ${lvl}`;
  }, []);

  useEffect(() => {
    if (!initialTask) return;
    const canvas = canvasRef.current;
    const app = appRef.current;
    if (!canvas || !app) return;

    const st = {
      score: 0, lives: 3, combo: 1, bestCombo: 1, comboTick: 0,
      correctTaps: 0, wrongTaps: 0,
      balls: [], particles: [],
      spawnTick: 0, spawnRate: LEVELS[0].spawnRate, tick: 0,
      task: initialTask, running: false,
      level: 1, speedMult: LEVELS[0].speedMult,
    };
    stateRef.current = st;

    if (taskBigEl.current) taskBigEl.current.textContent = initialTask.bigtext;
    if (taskHintEl.current) taskHintEl.current.textContent = initialTask.hint;
    updateLevelDOM(1);

    const ctx = canvas.getContext('2d');

    const getLevelForScore = (score) => {
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i].threshold) return LEVELS[i];
      }
      return LEVELS[0];
    };

    function resize() {
      const rect = app.getBoundingClientRect();
      const w = rect.width  > 10 ? rect.width  : (app.offsetWidth  || 360);
      const h = rect.height > 10 ? rect.height : (app.offsetHeight || 640);
      canvas.width  = Math.round(w);
      canvas.height = Math.round(h);
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(app);

    function spawnBall() {
      const task = st.task;
      if (!task?.pool || canvas.width < 50 || canvas.height < 50) return;
      const isTarget = Math.random() > 0.45;
      const targets    = task.pool.filter(n => task.isTarget(n));
      const nonTargets = task.pool.filter(n => !task.isTarget(n));
      if (!targets.length || !nonTargets.length) return;
      const num = isTarget ? pick(targets) : pick(nonTargets);
      const r = rand(26, 38);
      const x = r + 8 + Math.random() * (canvas.width - r * 2 - 16);
      const speed = (0.7 + Math.random() * 0.6 + st.tick / 5000) * st.speedMult;
      const col = pick(BALL_COLS);
      st.balls.push({ x, y: -r - 10, r, num, isTarget: task.isTarget(num), col, speed, alive: true, alpha: 1, vx: (Math.random() - 0.5) * 0.5 });
    }

    function drawBall(b) {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 6, 0, Math.PI * 2);
      ctx.fillStyle = b.col + '1a'; ctx.fill();
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.col + '30'; ctx.fill();
      ctx.strokeStyle = b.col + 'cc'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${Math.floor(b.r * 0.72)}px Nunito, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.num, b.x, b.y);
      ctx.restore();
    }

    let raf;
    function loop() {
      if (!st.running) return;
      raf = requestAnimationFrame(loop);
      st.tick++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255,255,255,0.018)'; ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

      // Level check: increase speed/spawn rate and swap question when threshold crossed
      const currentLevel = getLevelForScore(st.score);
      if (currentLevel.level !== st.level) {
        st.level = currentLevel.level;
        st.spawnRate = currentLevel.spawnRate;
        st.speedMult = currentLevel.speedMult;
        // Generate new task with new number for this level
        st.task = makeTask(mode);
        // Clear existing balls and spawn new ones with the new task
        st.balls.forEach(b => { b.alive = false; b.alpha = 0; });
        // Update the task display immediately
        if (taskBigEl.current) taskBigEl.current.textContent = st.task.bigtext;
        if (taskHintEl.current) taskHintEl.current.textContent = st.task.hint;
        updateLevelDOM(st.level);
        addFloaty(canvas.width / 2, canvas.height / 2, `Lv ${st.level}!`, '#ffff55');
      }

      st.spawnTick++;
      if (st.spawnTick >= st.spawnRate) {
        st.spawnTick = 0;
        spawnBall();
        if (st.tick > 500 && Math.random() < 0.28) spawnBall();
      }

      if (mode === 'mixed' && st.tick % 720 === 0) {
        st.task = makeTask('mixed');
        if (taskBigEl.current) taskBigEl.current.textContent = st.task.bigtext;
        if (taskHintEl.current) taskHintEl.current.textContent = st.task.hint;
        st.balls = [];
      }

      const bannerTop = canvas.height - 88;

      st.balls = st.balls.filter(b => b.alpha > 0.05);
      st.balls.forEach(b => {
        if (!b.alive) { b.alpha -= 0.1; return; }
        b.y += b.speed; b.x += b.vx;
        b.x = Math.max(b.r, Math.min(canvas.width - b.r, b.x));
        if (b.y > bannerTop - b.r) {
          if (b.isTarget) {
            st.lives--;
            updateLivesDOM(st.lives);
            addFloaty(b.x, bannerTop - 20, 'missed ❤️', '#ff7c7c');
            if (st.lives <= 0) {
              st.running = false;
              setTimeout(() => onGameOver({ score: st.score, correctTaps: st.correctTaps, wrongTaps: st.wrongTaps, bestCombo: st.bestCombo }), 500);
            }
          }
          b.alive = false; b.alpha = 0; return;
        }
        drawBall(b);
      });

      st.particles = st.particles.filter(p => p.life > 0.05);
      st.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.045;
        ctx.save(); ctx.globalAlpha = p.life * 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      });

      if (st.comboTick > 0) st.comboTick--;
      else if (st.combo > 1) { st.combo--; if (comboEl.current) comboEl.current.textContent = 'x' + st.combo; }
    }

    // Defer start by 2 frames so the phone-shell layout fully renders
    let r1 = requestAnimationFrame(() => {
      let r2 = requestAnimationFrame(() => {
        resize();
        st.running = true;
        updateLevelDOM(st.level);
        addFloaty(canvas.width / 2, canvas.height / 2, `Lv ${st.level}!`, '#ffff55');
        spawnBall();
        loop();
      });
    });

    return () => {
      if (stateRef.current) stateRef.current.running = false;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(r1);
      ro.disconnect();
    };
  }, [initialTask, mode, onGameOver, updateLivesDOM, addFloaty]);

  const handleTap = useCallback((e) => {
    e.preventDefault();
    const st = stateRef.current;
    if (!st || !st.running) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    const cx = (src.clientX - rect.left) * sx;
    const cy = (src.clientY - rect.top)  * sy;

    for (let i = st.balls.length - 1; i >= 0; i--) {
      const b = st.balls[i];
      if (!b.alive) continue;
      if (Math.sqrt((cx - b.x) ** 2 + (cy - b.y) ** 2) < b.r + 12) {
        b.alive = false;
        for (let j = 0; j < 10; j++) {
          const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 4;
          st.particles.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 2 + Math.random() * 3, life: 1 });
        }
        if (b.isTarget) {
          st.correctTaps++;
          st.score += 10 * st.combo;
          st.combo = Math.min(st.combo + 1, 8);
          st.bestCombo = Math.max(st.bestCombo, st.combo);
          st.comboTick = 100;
          addFloaty(b.x, b.y, '✓ +' + (10 * st.combo), '#7fffcc');
          if (scoreEl.current) scoreEl.current.textContent = st.score;
          if (comboEl.current) comboEl.current.textContent = 'x' + st.combo;
        } else {
          st.wrongTaps++;
          st.lives--;
          st.combo = 1; st.comboTick = 0;
          addFloaty(b.x, b.y, '✕ Wrong!', '#ff7c7c');
          if (comboEl.current) comboEl.current.textContent = 'x1';
          updateLivesDOM(st.lives);
          if (st.lives <= 0) {
            st.running = false;
            setTimeout(() => onGameOver({ score: st.score, correctTaps: st.correctTaps, wrongTaps: st.wrongTaps, bestCombo: st.bestCombo }), 500);
          }
        }
        break;
      }
    }
  }, [addFloaty, onGameOver, updateLivesDOM]);

  return (
    <div className={s.wrap} ref={appRef}>
      <canvas ref={canvasRef} className={s.canvas}
        onClick={handleTap}
        onTouchStart={handleTap} />

      <div className={s.hud}>
        <div className={s.hudBox}>
          <div className={s.hudLabel}>Score</div>
          <div className={s.hudVal} ref={scoreEl}>0</div>
        </div>
        <div className={s.hudBox}>
          <div className={s.hudLabel}>Level</div>
          <div className={s.hudVal} ref={levelEl}>Lv 1</div>
        </div>
        <div className={s.hudBox} ref={livesEl} style={{ fontSize: 18, letterSpacing: 2 }}>❤️❤️❤️</div>
        <div className={s.hudBox}>
          <div className={s.hudLabel}>Combo</div>
          <div className={s.hudVal} ref={comboEl}>x1</div>
        </div>
      </div>
<div className={s.floatyLayer} ref={floatyContainer} />

      <div className={s.taskBanner}>
        <div className={s.taskCard}>
          <div ref={taskBigEl} className={s.taskBig}>{initialTask?.bigtext}</div>
          <div ref={taskHintEl} className={s.taskHint}>{initialTask?.hint}</div>
        </div>
      </div>
    </div>
  );
}
