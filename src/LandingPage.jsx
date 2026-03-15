import React from 'react';
import s from './LandingPage.module.css';

const games = [
  {
    id: 'mathninja',
    title: 'Math Ninja',
    icon: '🥷',
    description: 'Tap falling numbers that match the math rule. Features factors, multiples, primes and mixed challenges with 10 progressive levels!',
    color: '#7C6FCD',
    players: '1 Player',
    skills: ['Mental Math', 'Quick Thinking', 'Focus'],
  },
  {
    id: 'coming-soon',
    title: 'More Games',
    icon: '🎮',
    description: 'New math games coming soon! Check back later for more fun challenges.',
    color: '#5B8FD4',
    players: '-',
    skills: ['-'],
    locked: true,
  },
];

export default function LandingPage({ onChooseGame }) {
  return (
    <div className={s.wrap}>
      <header className={s.header}>
        <div className={s.logo}>
          <span className={s.logoIcon}>🧮</span>
          <h1 className={s.logoText}>Math Games Portal</h1>
        </div>
        <p className={s.tagline}>Fun & Educational Math Games for Kids</p>
      </header>

      <main className={s.main}>
        <h2 className={s.sectionTitle}>Choose a Game</h2>
        
        <div className={s.gamesGrid}>
          {games.map(game => (
            <div 
              key={game.id} 
              className={`${s.gameCard} ${game.locked ? s.locked : ''}`}
              style={!game.locked ? { borderColor: game.color + '66' } : {}}
              onClick={() => !game.locked && onChooseGame(game.id)}
            >
              <div className={s.cardHeader} style={!game.locked ? { background: game.color + '33' } : {}}>
                <span className={s.gameIcon}>{game.icon}</span>
                {game.locked && <span className={s.lockedBadge}>🔒 Coming Soon</span>}
              </div>
              
              <div className={s.cardBody}>
                <h3 className={s.gameTitle}>{game.title}</h3>
                <p className={s.gameDesc}>{game.description}</p>
                
                <div className={s.gameMeta}>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>Players</span>
                    <span className={s.metaValue}>{game.players}</span>
                  </div>
                  <div className={s.metaItem}>
                    <span className={s.metaLabel}>Skills</span>
                    <span className={s.metaValue}>{game.skills.join(', ')}</span>
                  </div>
                </div>
              </div>
              
              {!game.locked && (
                <button className={s.playBtn} style={{ background: game.color }}>
                  ▶ Play Now
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className={s.footer}>
        <p>Made with ❤️ by Regis | Grade 6-8 Math Practice</p>
      </footer>
    </div>
  );
}
