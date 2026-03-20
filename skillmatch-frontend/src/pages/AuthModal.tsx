import React, { useState } from 'react';
import Logo from '../components/Logo.tsx';
import Confetti from '../components/Confetti.tsx';

interface AuthModalProps {
    onClose: () => void;
    onComplete: (role: string) => void;
}

export default function AuthModal({ onClose, onComplete }: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [step, setStep] = useState<'auth' | 'role'>('auth');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const inputStyle: React.CSSProperties = {
        padding: '14px 16px', border: '1.5px solid #E2E8F0',
        borderRadius: 12, fontSize: 15, outline: 'none', width: '100%',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    };

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('role');
    };

    const handleRole = (r: string) => {
        setShowConfetti(true);
        setTimeout(() => {
            setShowConfetti(false);
            onComplete(r);
        }, 2200);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 24, backdropFilter: 'blur(4px)',
        }}>
            <Confetti active={showConfetti} />
            <div style={{
                background: 'white', borderRadius: 24, padding: 40,
                width: '100%', maxWidth: 440, position: 'relative',
                boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
                animation: 'slideUp 0.3s ease',
            }}>
                <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 20, right: 20,
                        background: '#F1F5F9', border: 'none', borderRadius: '50%',
                        width: 32, height: 32, cursor: 'pointer', fontSize: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    ✕
                </button>

                {step === 'auth' && (
                    <>
                        <Logo />
                        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginTop: 24, marginBottom: 8, color: '#0F172A' }}>
                            {mode === 'login' ? 'Welcome back' : 'Create account'}
                        </h2>
                        <p style={{ color: '#64748B', marginBottom: 24, fontSize: 15 }}>
                            Connect your skills with causes that matter
                        </p>
                        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address" type="email" style={inputStyle}
                                onFocus={(e) => (e.target.style.border = '1.5px solid #10B981')}
                                onBlur={(e) => (e.target.style.border = '1.5px solid #E2E8F0')}
                            />
                            <input
                                value={pass} onChange={(e) => setPass(e.target.value)}
                                type="password" placeholder="Password" style={inputStyle}
                                onFocus={(e) => (e.target.style.border = '1.5px solid #10B981')}
                                onBlur={(e) => (e.target.style.border = '1.5px solid #E2E8F0')}
                            />
                            <button type="submit" style={{
                                width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                                background: 'linear-gradient(135deg,#10B981,#059669)',
                                color: 'white', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 4,
                            }}>
                                {mode === 'login' ? 'Sign In →' : 'Create Account →'}
                            </button>
                        </form>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                            {([['🔵', 'Google'], ['🍎', 'Apple']] as const).map(([icon, name]) => (
                                <button
                                    key={name}
                                    onClick={() => setStep('role')}
                                    style={{
                                        flex: 1, padding: '12px', border: '1.5px solid #E2E8F0',
                                        borderRadius: 12, background: 'white', cursor: 'pointer',
                                        fontWeight: 600, fontSize: 14,
                                    }}
                                >
                                    {icon} {name}
                                </button>
                            ))}
                        </div>
                        <p style={{ textAlign: 'center', marginTop: 20, color: '#64748B', fontSize: 14 }}>
                            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
                            <button
                                onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
                                style={{ background: 'none', border: 'none', color: '#10B981', fontWeight: 700, cursor: 'pointer' }}
                            >
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </>
                )}

                {step === 'role' && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 32 }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
                            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 8, color: '#0F172A' }}>
                                Who are you?
                            </h2>
                            <p style={{ color: '#64748B' }}>This helps us personalise your experience</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { r: 'volunteer', icon: '🙋', title: 'Volunteer', desc: 'I want to offer my skills to meaningful causes' },
                                { r: 'nonprofit', icon: '🏢', title: 'Non-Profit / Organization', desc: "I'm looking for skilled volunteers to join our mission" },
                            ].map(({ r, icon, title, desc }) => (
                                <button
                                    key={r}
                                    onClick={() => handleRole(r)}
                                    style={{
                                        padding: '24px', borderRadius: 16, border: '2px solid #E2E8F0',
                                        background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.border = `2px solid ${r === 'volunteer' ? '#10B981' : '#14B8A6'}`;
                                        e.currentTarget.style.background = r === 'volunteer' ? '#F0FDF4' : '#F0FDFA';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.border = '2px solid #E2E8F0';
                                        e.currentTarget.style.background = 'white';
                                    }}
                                >
                                    <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>{title}</div>
                                    <div style={{ color: '#64748B', marginTop: 4 }}>{desc}</div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
