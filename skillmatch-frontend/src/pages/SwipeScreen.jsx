import React, { useState } from 'react';
import { OPPORTUNITIES } from '../data/constants';
import SwipeCard from '../components/SwipeCard';
import Confetti from '../components/Confetti';

export default function SwipeScreen({ onMatch }) {
  const [cards, setCards] = useState([...OPPORTUNITIES]);
  const [matchCard, setMatchCard] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const current = cards[cards.length - 1];

  const pass = () => setCards((c) => c.slice(0, -1));

  const interest = () => {
    const card = cards[cards.length - 1];
    setCards((c) => c.slice(0, -1));
    if (Math.random() > 0.35) {
      setMatchCard(card);
      setShowConfetti(true);
    }
  };

  if (matchCard) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#0F3D2E,#0D3038)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <Confetti active={showConfetti} />
        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}`}</style>
        <div>
          <div style={{ fontSize: 80, marginBottom: 24, animation: 'bounce 1s infinite' }}>🎉</div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(36px,8vw,52px)',
            color: 'white', marginBottom: 16, letterSpacing: -1,
          }}>
            It's a Match!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 18, marginBottom: 8 }}>
            You and <strong style={{ color: '#34D399' }}>{matchCard.org}</strong>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 40 }}>are interested in each other</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onMatch(matchCard)}
              style={{
                padding: '16px 32px', borderRadius: 50, border: 'none',
                background: 'linear-gradient(135deg,#10B981,#059669)',
                color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer',
              }}
            >
              💬 Message Now
            </button>
            <button
              onClick={() => { setMatchCard(null); setShowConfetti(false); }}
              style={{
                padding: '16px 32px', borderRadius: 50,
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'transparent', color: 'white',
                fontWeight: 700, fontSize: 16, cursor: 'pointer',
              }}
            >
              Keep Swiping →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '70vh', flexDirection: 'column', gap: 16,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{ fontSize: 64 }}>🌟</div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0F172A' }}>
          You've seen everything!
        </h2>
        <p style={{ color: '#64748B' }}>Check back later for new opportunities</p>
        <button
          onClick={() => setCards([...OPPORTUNITIES])}
          style={{
            padding: '14px 32px', borderRadius: 50, border: 'none',
            background: 'linear-gradient(135deg,#10B981,#14B8A6)',
            color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 15,
          }}
        >
          Reset & Swipe Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif",
      maxWidth: 480, margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#0F172A', marginBottom: 4 }}>
          Discover Opportunities
        </h2>
        <p style={{ color: '#64748B', fontSize: 14 }}>
          {cards.length} remaining · Swipe or use buttons
        </p>
      </div>

      {/* Card stack */}
      <div style={{ position: 'relative', height: 480 }}>
        {cards.slice(-3).map((opp, i, arr) => (
          <div
            key={opp.id}
            style={{
              position: 'absolute', inset: 0,
              transform: `scale(${1 - (arr.length - 1 - i) * 0.04}) translateY(${(arr.length - 1 - i) * -12}px)`,
              zIndex: i,
              transition: 'transform 0.3s',
            }}
          >
            {i === arr.length - 1 ? (
              <SwipeCard opp={opp} onPass={pass} onInterest={interest} />
            ) : (
              <div style={{
                position: 'absolute', inset: 0, background: 'white',
                borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 32 }}>
        <button
          onClick={pass}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '2px solid #FCA5A5', background: 'white',
            fontSize: 24, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(239,68,68,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ✕
        </button>
        <button
          onClick={interest}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '2px solid #6EE7B7', background: 'white',
            fontSize: 24, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          ✓
        </button>
      </div>
      <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 12 }}>
        ← Swipe left to pass · Swipe right to match →
      </p>
    </div>
  );
}
