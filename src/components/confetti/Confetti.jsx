import { useEffect, useState } from 'react';
import './Confetti.css';

const COLORS = ['#e3350d', '#f7d038', '#30a7d7', '#78C850', '#F85888', '#A890F0', '#EE99AC', '#fff'];
const COUNT = 80;
const DURATION_MS = 2800;

function createPieces() {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100 - 10,
    delay: Math.random() * 400,
    duration: 1800 + Math.random() * 800,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 720,
  }));
}

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return undefined;
    }
    setPieces(createPieces());
    const t = setTimeout(() => setPieces([]), DURATION_MS);
    return () => clearTimeout(t);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-wrap" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            '--rot-end': `${p.rotation + p.rotationSpeed}deg`,
          }}
        />
      ))}
    </div>
  );
}
