import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
    const imgSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
    const fontSize = size === 'sm' ? 15 : size === 'lg' ? 22 : 18;
    const textColor = variant === 'dark' ? '#fafafa' : '#09090b';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
                src="/logo.jpg"
                alt="SkillMatch logo"
                style={{
                    width: imgSize,
                    height: imgSize,
                    borderRadius: size === 'sm' ? 6 : 8,
                    objectFit: 'contain',
                }}
            />
            <span
                style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize,
                    color: textColor,
                    letterSpacing: '-0.02em',
                }}
            >
                SkillMatch
            </span>
        </div>
    );
}
