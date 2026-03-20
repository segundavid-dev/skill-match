import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo.tsx';

interface LandingPageProps {
    onVolunteer: () => void;
    onNonProfit: () => void;
}

const TESTIMONIALS = [
    {
        name: 'Amara Osei',
        role: 'Frontend Dev → Green Earth',
        text: 'Found my match in 2 days. Now I\'m building tools that protect rainforests.',
    },
    {
        name: 'Fatima Al-Hassan',
        role: 'Designer → Health Bridge',
        text: 'SkillMatch made it feel effortless. My designs are now saving lives.',
    },
    {
        name: 'Chidi Nwosu',
        role: 'Teacher → Bright Minds',
        text: 'I swipe during my lunch break. Already mentored 12 kids this month.',
    },
];

const STATS: [string, string][] = [
    ['12,450', 'Volunteers'],
    ['890', 'Organizations'],
    ['94%', 'Match Rate'],
    ['47K', 'Lives Touched'],
];

const HOW_IT_WORKS = [
    { n: '01', icon: '✨', title: 'Build Your Profile', desc: 'Tell us your skills, availability and the causes you care about most.' },
    { n: '02', icon: '🎯', title: 'Swipe & Match', desc: 'Browse curated opportunities. Swipe right when something sparks your interest.' },
    { n: '03', icon: '🚀', title: 'Make Impact', desc: 'Connect directly, confirm your role, and start doing work that matters.' },
];

export default function LandingPage({ onVolunteer, onNonProfit }: LandingPageProps) {
    const [tIdx, setTIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setTIdx((i) => (i + 1) % TESTIMONIALS.length), 4000);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{ minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F8FAFC' }}>
            <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

            {/* NAV */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(248,250,252,0.92)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(16,185,129,0.1)',
                padding: '0 24px', height: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Logo />
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={onVolunteer}
                        style={{
                            padding: '8px 20px', borderRadius: 50, border: '1.5px solid #10B981',
                            background: 'transparent', color: '#10B981', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={onVolunteer}
                        style={{
                            padding: '8px 20px', borderRadius: 50, border: 'none',
                            background: 'linear-gradient(135deg,#10B981,#14B8A6)',
                            color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <div style={{
                minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', padding: '60px 24px',
            }}>
                {/* Hero background image */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'url(/hero-bg.jpg)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                }} />
                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(10,45,32,0.93) 0%, rgba(8,38,46,0.90) 50%, rgba(15,23,42,0.92) 100%)',
                }} />
                {/* Floating orbs */}
                <div style={{
                    position: 'absolute', top: '10%', right: '8%', width: 320, height: 320,
                    borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,0.18),transparent)',
                    animation: 'float 6s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', bottom: '15%', left: '5%', width: 220, height: 220,
                    borderRadius: '50%', background: 'radial-gradient(circle,rgba(20,184,166,0.14),transparent)',
                    animation: 'float 8s ease-in-out infinite 2s',
                }} />

                <div style={{ position: 'relative', textAlign: 'center', maxWidth: 780, animation: 'fadeUp 1s ease' }}>
                    {/* live badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 50, padding: '6px 18px', marginBottom: 32,
                    }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                        <span style={{ color: '#6EE7B7', fontSize: 13, fontWeight: 600 }}>
                            12,450 volunteers · 890 organizations
                        </span>
                    </div>

                    <h1 style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: 'clamp(40px,8vw,80px)',
                        color: 'white', lineHeight: 1.1,
                        margin: '0 0 24px', letterSpacing: -2,
                    }}>
                        Match your skills.<br />
                        <span style={{
                            background: 'linear-gradient(135deg,#10B981,#34D399,#14B8A6)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Make real impact.
                        </span>
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.72)', fontSize: 20, lineHeight: 1.7,
                        marginBottom: 48, maxWidth: 560, margin: '0 auto 48px',
                    }}>
                        Connect with organizations that need your exact skills. Swipe. Match. Change the world — one volunteer at a time.
                    </p>

                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={onVolunteer}
                            style={{
                                padding: '18px 40px', borderRadius: 50, border: 'none',
                                background: 'linear-gradient(135deg,#10B981,#059669)',
                                color: 'white', fontWeight: 700, fontSize: 18, cursor: 'pointer',
                                boxShadow: '0 8px 30px rgba(16,185,129,0.4)',
                                display: 'flex', alignItems: 'center', gap: 10, transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            🙋 I'm a Volunteer
                        </button>
                        <button
                            onClick={onNonProfit}
                            style={{
                                padding: '18px 40px', borderRadius: 50,
                                border: '2px solid rgba(20,184,166,0.7)',
                                background: 'rgba(20,184,166,0.12)',
                                color: '#2DD4BF', fontWeight: 700, fontSize: 18, cursor: 'pointer',
                                backdropFilter: 'blur(10px)', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(20,184,166,0.28)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(20,184,166,0.12)')}
                        >
                            🏢 I'm a Non-Profit
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 64, flexWrap: 'wrap' }}>
                        {STATS.map(([n, l]) => (
                            <div key={l} style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#34D399', fontWeight: 700 }}>{n}</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* HOW IT WORKS */}
            <div style={{ padding: '80px 24px', background: 'white', textAlign: 'center' }}>
                <p style={{ color: '#10B981', fontWeight: 700, letterSpacing: 2, fontSize: 12, textTransform: 'uppercase', marginBottom: 12 }}>
                    Simple Process
                </p>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, color: '#0F172A', marginBottom: 16, letterSpacing: -1 }}>
                    Three steps to impact
                </h2>
                <p style={{ color: '#64748B', fontSize: 18, marginBottom: 60 }}>Get matched in minutes, not months</p>
                <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 960, margin: '0 auto' }}>
                    {HOW_IT_WORKS.map((s) => (
                        <div key={s.n} style={{
                            flex: '1 1 260px', padding: 40,
                            background: 'linear-gradient(135deg,#F0FDF4,#ECFEFF)',
                            borderRadius: 20, textAlign: 'left', position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', top: 20, right: 24,
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: 64, color: 'rgba(16,185,129,0.08)', fontWeight: 900,
                            }}>
                                {s.n}
                            </div>
                            <div style={{ fontSize: 40, marginBottom: 20 }}>{s.icon}</div>
                            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0F172A', marginBottom: 12 }}>{s.title}</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* TESTIMONIALS */}
            <div style={{ background: 'linear-gradient(135deg,#0F3D2E,#0D3038)', padding: '80px 24px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, color: 'white', marginBottom: 48, letterSpacing: -1 }}>
                    Real stories. Real impact.
                </h2>
                <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', minHeight: 180 }}>
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            opacity: i === tIdx ? 1 : 0,
                            transform: `translateY(${i === tIdx ? 0 : 20}px)`,
                            transition: 'all 0.6s ease',
                            pointerEvents: i === tIdx ? 'auto' : 'none',
                        }}>
                            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 22, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24 }}>
                                "{t.text}"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#10B981,#14B8A6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 700,
                                }}>
                                    {t.name[0]}
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ color: '#34D399', fontWeight: 700 }}>{t.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 130 }}>
                    {TESTIMONIALS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setTIdx(i)}
                            style={{
                                width: i === tIdx ? 24 : 8, height: 8, borderRadius: 4, border: 'none',
                                background: i === tIdx ? '#10B981' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s', cursor: 'pointer',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* BOTTOM CTA */}
            <div style={{ padding: '80px 24px', textAlign: 'center', background: '#F0FDF4' }}>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 48, color: '#0F172A', marginBottom: 16, letterSpacing: -1 }}>
                    Ready to make your mark?
                </h2>
                <p style={{ color: '#64748B', fontSize: 18, marginBottom: 40 }}>
                    Join thousands of changemakers already matching their skills to causes they love.
                </p>
                <button
                    onClick={onVolunteer}
                    style={{
                        padding: '20px 56px', borderRadius: 50, border: 'none',
                        background: 'linear-gradient(135deg,#10B981,#059669)',
                        color: 'white', fontWeight: 700, fontSize: 20, cursor: 'pointer',
                        boxShadow: '0 12px 40px rgba(16,185,129,0.35)',
                    }}
                >
                    Start Matching Free →
                </button>
            </div>
        </div>
    );
}
