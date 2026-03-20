import React, { useState, useRef } from 'react';

export default function SwipeCard({ opp, onPass, onInterest }) {
  const [startX, setStartX] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const cardRef = useRef();

  const getClientX = (e) =>
    e.clientX ?? e.touches?.[0]?.clientX ?? startX;

  const handleStart = (e) => setStartX(getClientX(e));

  const handleMove = (e) => {
    if (startX === null) return;
    setDragX(getClientX(e) - startX);
  };

  const handleEnd = () => {
    if (dragX > 80) doAction('right');
    else if (dragX < -80) doAction('left');
    else setDragX(0);
    setStartX(null);
  };

  const doAction = (dir) => {
    setLeaving(dir);
    setTimeout(() => {
      dir === 'right' ? onInterest() : onPass();
      setLeaving(null);
      setDragX(0);
    }, 380);
  };

  const rot = dragX * 0.08;
  const scale = 1 - Math.abs(dragX) * 0.0005;

  return (
    <div
      ref={cardRef}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        cursor: leaving ? 'default' : 'grab',
        overflow: 'hidden',
        userSelect: 'none',
        border: `2px solid ${dragX > 30 ? '#10B981' : dragX < -30 ? '#EF4444' : 'transparent'}`,
        transform: leaving
          ? `translateX(${leaving === 'right' ? 200 : -200}%) rotate(${leaving === 'right' ? 20 : -20}deg)`
          : `translateX(${dragX}px) rotate(${rot}deg) scale(${scale})`,
        transition: leaving ? 'transform 0.38s ease, opacity 0.38s' : 'transform 0.08s',
        opacity: leaving ? 0 : 1,
      }}
    >
      {/* Match / Pass overlays */}
      {dragX > 30 && (
        <div style={{
          position: 'absolute', top: 24, left: 24, zIndex: 10,
          background: '#10B981', color: 'white', fontWeight: 800,
          fontSize: 20, padding: '8px 20px', borderRadius: 50,
          transform: 'rotate(-12deg)', border: '3px solid white',
        }}>
          MATCH ✓
        </div>
      )}
      {dragX < -30 && (
        <div style={{
          position: 'absolute', top: 24, right: 24, zIndex: 10,
          background: '#EF4444', color: 'white', fontWeight: 800,
          fontSize: 20, padding: '8px 20px', borderRadius: 50,
          transform: 'rotate(12deg)', border: '3px solid white',
        }}>
          PASS ✕
        </div>
      )}

      {/* Card Header */}
      <div style={{
        background: `linear-gradient(135deg, ${opp.color}22, ${opp.color}11)`,
        padding: '32px 28px',
        borderBottom: '1px solid #F1F5F9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: `linear-gradient(135deg, ${opp.color}, ${opp.color}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>
            {opp.emoji}
          </div>
          <div>
            <h3 style={{ fontSize: 22, fontFamily: "'DM Serif Display', serif", color: '#0F172A', marginBottom: 4 }}>
              {opp.role}
            </h3>
            <p style={{ color: '#64748B', fontWeight: 600 }}>{opp.org}</p>
          </div>
        </div>
        <div style={{
          background: 'white', borderRadius: 12, padding: '10px 14px',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>
            SkillMatch Score: {opp.match}% match
          </span>
          <span
            title="Based on your skills, availability & past matches"
            style={{
              width: 18, height: 18, borderRadius: '50%', background: '#E2E8F0',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, cursor: 'help', color: '#64748B',
            }}
          >
            ?
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: 28 }}>
        <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>{opp.desc}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {opp.skills.map((s) => (
            <span key={s} style={{
              background: '#ECFDF5', color: '#059669',
              padding: '6px 14px', borderRadius: 50, fontSize: 13,
              fontWeight: 600, border: '1px solid #A7F3D0',
            }}>
              {s}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 14 }}>
            <span>📍</span><span>{opp.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 14 }}>
            <span>💫</span><span>Impacts {opp.impact}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
