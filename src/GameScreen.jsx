import React, { useRef, useCallback, useLayoutEffect } from 'react';
import s from './GameScreen.module.css';
import { pick, rand, makeTask } from './mathHelpers';

const BALL_COLS = ['#7C6FCD', '#5B8FD4', '#6DAACC', '#9B8DC4', '#7EA8B8', '#c47c8a', '#7dbb8f'];

// Level configuration: speed multiplier, spawn rate, score threshold for next level
const LEVELS = [
  { level: 1, speedMult: 0.5, spawnRate: 200, threshold: 0, name: 'Practice' },
  { level: 2, speedMult: 0.7, spawnRate: 170, threshold: 100, name: 'Beginner' },
  { level: 3, speedMult: 0.9, spawnRate: 140, threshold: 250, name: 'Easy' },
  { level: 4, speedMult: 1.1, spawnRate: 120, threshold: 450, name: 'Normal' },
  { level: 5, speedMult: 1.3, spawnRate: 100, threshold: 700, name: 'Medium' },
  { level: 6, speedMult: 1.5, spawnRate: 85, threshold: 1000, name: 'Hard' },
  { level: 7, speedMult: 1.7, spawnRate: 70, threshold: 1400, name: 'Expert' },
  { level: 8, speedMult: 2.0, spawnRate: 55, threshold: 1900, name: 'Master' },
  { level: 9, speedMult: 2.3, spawnRate: 45, threshold: 2500, name: 'Legend' },
  { level: 10, speedMult: 2.6, spawnRate: 35, threshold: 3200, name: 'Ninja!' },
];

export default function GameScreen({ mode, initialTask, onGameOver }) {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const shakeRef = useRef(null);
  const stateRef = useRef(null);

  // DOM refs for HUD
  const scoreEl = useRef(null);
  const livesEl = useRef(null);
  const comboEl = useRef(null);
  const taskBigEl = useRef(null);
  const taskHintEl = useRef(null);
  const floatyContainer = useRef(null);
  const levelEl = useRef(null);
  const levelNameEl = useRef(null);

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

  // Trigger wrong answer animation (screen shake + red flash)
  const triggerWrongAnimation = useCallback(() => {
    if (shakeRef.current) {
      shakeRef.current.classList.remove(s.shake);
      // Force reflow
      void shakeRef.current.offsetWidth;
      shakeRef.current.classList.add(s.shake);
      setTimeout(() => {
        shakeRef.current?.classList.remove(s.shake);
      }, 500);
    }
  }, []);

  // Get current level based on score
  const getLevelForScore = useCallback((score) => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (score >= LEVELS[i].threshold) return LEVELS[i];
    }
    return LEVELS[0];
  }, []);

  // Update level display
  const updateLevelDisplay = useCallback((level) => {
    if (levelEl.current) levelEl.current.textContent = 'Lv ' + level.level;
    if (levelNameEl.current) levelNameEl.current.textContent = level.name;
  }, []);

  // Initialize game and start loop when initialTask is available
  useLayoutEffect(() => {
    if (!initialTask) return;

    const canvas = canvasRef.current;
    const appEl = appRef.current;
    if (!canvas || !appEl) return;

    // Initialize state
    stateRef.current = {
      score: 0, lives: 3, combo: 1, bestCombo: 1, comboTick: 0,
      correctTaps: 0, wrongTaps: 0,
      balls: [], particles: [],
      spawnTick: 0, spawnRate: LEVELS[0].spawnRate, tick: 0,
      task: initialTask, running: true,
      level: 1,
    };

    // Update HUD with initial task
    if (taskBigEl.current) taskBigEl.current.textContent = initialTask.bigtext;
    if (taskHintEl.current) taskHintEl.current.textContent = initialTask.hint;
    updateLevelDisplay(LEVELS[0]);

    const ctx = canvas.getContext('2d');
    const st = stateRef.current;

    const isCanvasReady = () => {
      const c = canvasRef.current;
      return c && c.width >= 240 && c.height >= 320;
    };

    function resize() {
      const app = appRef.current;
      if (!app || !canvasRef.current) return;
      const width = app.clientWidth || app.offsetWidth || window.innerWidth;
      const height = app.clientHeight || app.offsetHeight || window.innerHeight;
      // Fallback to sensible playfield size if layout measurements are tiny
      const safeW = Math.max(width, window.innerWidth || 0, 360);
      const safeH = Math.max(height, window.innerHeight || 0, 640);
      canvasRef.current.width = Math.max(1, safeW);
      canvasRef.current.height = Math.max(1, safeH);
    }
    resize();
    // Spawn an initial ball right away so the screen isn't empty
    spawnBall();
    let ro;
    if (typeof ResizeObserver !== 'undefined' && appRef.current) {
      ro = new ResizeObserver(resize);
      ro.observe(appRef.current);
    } else {
      window.addEventListener('resize', resize);
    }

    function spawnBall() {
      if (!isCanvasReady()) return;
      const task = st.task;
      if (!task || !task.pool) return;
      const isTarget = Math.random() > 0.45;
      const targets = task.pool.filter(n => task.isTarget(n));
      const nonTargets = task.pool.filter(n => !task.isTarget(n));
      if (!targets.length || !nonTargets.length) return;
      const num = isTarget ? pick(targets) : pick(nonTargets);
      const r = rand(26, 38);
      const x = r + 8 + Math.random() * (canvas.width - r * 2 - 16);
      const currentLevel = getLevelForScore(st.score);
      const speed = (0.7 + Math.random() * 0.6 + st.tick / 5000) * currentLevel.speedMult;
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
      // If canvas hasn't been sized yet, try again next frame without progressing game state
      if (!isCanvasReady()) {
        resize();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.018)'; ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = 0; y < canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

      // spawn
      const currentLevel = getLevelForScore(st.score);
      if (currentLevel.level !== st.level) {
        // Level up!
        st.level = currentLevel.level;
        st.spawnRate = currentLevel.spawnRate;
        // Generate new task for the new level
        st.task = makeTask(mode);
        if (taskBigEl.current) taskBigEl.current.textContent = st.task.bigtext;
        if (taskHintEl.current) taskHintEl.current.textContent = st.task.hint;
        // Clear existing balls to avoid confusion with old task
        st.balls.forEach(b => { b.alive = false; b.alpha = 0; });
        updateLevelDisplay(currentLevel);
        addFloaty(canvas.width / 2, canvas.height / 2, '🎉 LEVEL ' + currentLevel.level + '!', '#ffff00');
      }

      st.spawnTick++;
      if (st.spawnTick >= st.spawnRate) {
        st.spawnTick = 0; spawnBall();
        if (st.tick > 500 && Math.random() < 0.28) spawnBall();
      }

      // mixed mode refresh
      if (mode === 'mixed' && st.tick % 720 === 0) {
        st.task = makeTask('mixed');
        if (taskBigEl.current) taskBigEl.current.textContent = st.task.bigtext;
        if (taskHintEl.current) taskHintEl.current.textContent = st.task.hint;
        st.balls = [];
      }

      const bannerTop = Math.max(200, canvas.height - 88);

      // balls
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
            if (st.lives <= 0) { st.running = false; setTimeout(() => onGameOver({ score: st.score, correctTaps: st.correctTaps, wrongTaps: st.wrongTaps, bestCombo: st.bestCombo, level: st.level }), 500); }
          }
          b.alive = false; b.alpha = 0; return;
        }
        drawBall(b);
      });

      // particles
      st.particles = st.particles.filter(p => p.life > 0.05);
      st.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life -= 0.045;
        ctx.save(); ctx.globalAlpha = p.life * 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      });

      // combo decay
      if (st.comboTick > 0) st.comboTick--;
      else if (st.combo > 1) { st.combo--; if (comboEl.current) comboEl.current.textContent = 'x' + st.combo; }
    }

    loop();
    return () => {
      if (stateRef.current) stateRef.current.running = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', resize);
    };
  }, [initialTask, mode, onGameOver, updateLivesDOM, addFloaty, updateLevelDisplay, getLevelForScore]);

  const handleTap = useCallback((e) => {
    e.preventDefault();
    const st = stateRef.current;
    if (!st || !st.running) return;
    const c = canvasRef.current;
    if (!c || c.width < 240 || c.height < 320) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * sx;
    const cy = (e.clientY - rect.top) * sy;

    for (let i = st.balls.length - 1; i >= 0; i--) {
      const b = st.balls[i];
      if (!b.alive) continue;
      if (Math.sqrt((cx - b.x) ** 2 + (cy - b.y) ** 2) < b.r + 12) {
        b.alive = false;
        // particles
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
          triggerWrongAnimation();
          if (st.lives <= 0) {
            st.running = false;
            setTimeout(() => onGameOver({ score: st.score, correctTaps: st.correctTaps, wrongTaps: st.wrongTaps, bestCombo: st.bestCombo, level: st.level }), 500);
          }
        }
        break;
      }
    }
  }, [addFloaty, onGameOver, updateLivesDOM, triggerWrongAnimation]);

  return (
    <div className={s.wrap} ref={shakeRef}>
      <div className={s.gameInner} ref={appRef}>
        <canvas ref={canvasRef} className={s.canvas} onPointerDown={handleTap} />

        {/* HUD */}
        <div className={s.hud}>
          <div className={s.hudBox}>
            <div className={s.hudLabel}>Score</div>
            <div className={s.hudVal} ref={scoreEl}>0</div>
          </div>
          <div className={s.hudBox}>
            <div className={s.hudLabel}>Level</div>
            <div className={s.hudVal}>
              <span ref={levelEl}>Lv 1</span>
              <span ref={levelNameEl} className={s.levelName}>Practice</span>
            </div>
          </div>
          <div className={s.hudBox} ref={livesEl} style={{ fontSize: 18, letterSpacing: 2 }}>❤️❤️❤️</div>
          <div className={s.hudBox}>
            <div className={s.hudLabel}>Combo</div>
            <div className={s.hudVal} ref={comboEl}>x1</div>
          </div>
        </div>

        {/* Floaty container */}
        <div className={s.floatyLayer} ref={floatyContainer} />

        {/* Task banner */}
        <div className={s.taskBanner}>
          <div className={s.taskCard}>
            <div ref={taskBigEl} className={s.taskBig}>{initialTask?.bigtext}</div>
            <div ref={taskHintEl} className={s.taskHint}>{initialTask?.hint}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
