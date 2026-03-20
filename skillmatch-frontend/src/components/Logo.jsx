import React from 'react';

export default function Logo({ size = 'md' }) {
  const imgSize = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const fontSize = size === 'sm' ? 16 : size === 'lg' ? 26 : 20;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src="/logo.jpg"
        alt="SkillMatch logo"
        style={{
          width: imgSize,
          height: imgSize,
          borderRadius: 8,
          objectFit: 'contain',
          background: 'white',
        }}
      />
      <span
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontWeight: 700,
          fontSize,
          background: 'linear-gradient(135deg, #10B981, #14B8A6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: -0.5,
        }}
      >
        SkillMatch
      </span>
    </div>
  );
}
