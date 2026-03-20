import React from 'react';

const COLORS = ['#10B981', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#3B82F6'];

export default function Confetti({ active }) {
  if (!active) return null;

  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.8,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 8,
    rot: Math.random() * 360,
    isPill: Math.random() > 0.5,
  }));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes confettiFall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-20px',
            width: p.isPill ? p.size * 2 : p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.isPill ? p.size : '50%',
            transform: `rotate(${p.rot}deg)`,
            animation: `confettiFall 2.8s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
