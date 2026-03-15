export function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

export function getFactors(n) {
  const f = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) f.push(i);
  return f;
}

export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
export function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export function makeTask(mode) {
  const which = mode === 'mixed' ? pick(['factors', 'multiples', 'primes']) : mode;

  if (which === 'factors') {
    const n = pick([12, 18, 20, 24, 30, 36, 40, 42, 48]);
    const f = getFactors(n);
    const nf = [];
    while (nf.length < 16) {
      const x = rand(2, Math.max(n + 8, 25));
      if (!f.includes(x) && !nf.includes(x)) nf.push(x);
    }
    return {
      type: 'factors',
      bigtext: `TAP the FACTORS of ${n}`,
      hint: `Factors divide ${n} exactly with no remainder`,
      example: `e.g. ${f.filter(x => x > 1 && x < n).slice(0, 3).join(', ')} ✓`,
      isTarget: x => x > 0 && x <= n && n % x === 0,
      pool: shuffle([...f, ...nf]),
      icon: '🌿',
    };
  }

  if (which === 'multiples') {
    const base = pick([3, 4, 5, 6, 7, 8, 9]);
    const ms = Array.from({ length: 10 }, (_, i) => base * (i + 2));
    const nm = [];
    while (nm.length < 16) {
      const x = rand(2, 90);
      if (x % base !== 0 && !nm.includes(x)) nm.push(x);
    }
    return {
      type: 'multiples',
      bigtext: `TAP the MULTIPLES of ${base}`,
      hint: `Multiples are in the ${base}× times table`,
      example: `e.g. ${ms.slice(0, 4).join(', ')}... ✓`,
      isTarget: x => x % base === 0,
      pool: shuffle([...ms, ...nm]),
      icon: '✖️',
    };
  }

  // primes
  const ps = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
  const cs = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 30];
  return {
    type: 'primes',
    bigtext: `TAP the PRIME numbers`,
    hint: `A prime has exactly 2 factors: 1 and itself`,
    example: `e.g. 2, 3, 5, 7, 11 ✓`,
    isTarget: isPrime,
    pool: shuffle([...ps, ...cs]),
    icon: '💎',
  };
}
