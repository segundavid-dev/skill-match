/* ─────────────────────────────────────────────────────────────────────────────
 * Register Page
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import type { Role } from '../types';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'VOLUNTEER' | 'ORGANIZATION'>('VOLUNTEER');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authApi.register({ email, password, role });
            const { tokens } = res.data.data;
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            navigate(role === 'VOLUNTEER' ? '/onboarding' : '/app/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const roleOptions: { value: 'VOLUNTEER' | 'ORGANIZATION'; label: string; desc: string }[] = [
        { value: 'VOLUNTEER', label: 'Volunteer', desc: 'Find opportunities that match your skills' },
        { value: 'ORGANIZATION', label: 'Organization', desc: 'Post opportunities and find volunteers' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
            <div style={{ width: '100%', maxWidth: 400 }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
                    <img src="/logo.jpg" alt="SkillMatch" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <span style={{ fontWeight: 700, fontSize: 18, color: '#fafafa', letterSpacing: '-0.02em' }}>
                        SkillMatch
                    </span>
                </Link>

                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.03em', marginBottom: 8 }}>
                    Create your account
                </h1>
                <p style={{ fontSize: 15, color: '#71717a', marginBottom: 32 }}>
                    Join thousands making a real difference
                </p>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171', fontSize: 14, marginBottom: 24,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Role selector */}
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 10 }}>
                            I want to join as
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {roleOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setRole(opt.value)}
                                    style={{
                                        padding: '16px 14px', borderRadius: 8, textAlign: 'left',
                                        border: `1px solid ${role === opt.value ? '#10b981' : '#27272a'}`,
                                        background: role === opt.value ? 'rgba(16, 185, 129, 0.06)' : '#18181b',
                                        cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                >
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fafafa', marginBottom: 4 }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#71717a', lineHeight: 1.4 }}>
                                        {opt.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Email
                        </label>
                        <input
                            type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required placeholder="you@example.com"
                            style={{
                                width: '100%', padding: '12px 16px',
                                borderRadius: 8, border: '1px solid #27272a',
                                background: '#18181b', color: '#fafafa',
                                fontSize: 15, outline: 'none', transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Password
                        </label>
                        <input
                            type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required placeholder="Min 8 chars, 1 uppercase, 1 number"
                            style={{
                                width: '100%', padding: '12px 16px',
                                borderRadius: 8, border: '1px solid #27272a',
                                background: '#18181b', color: '#fafafa',
                                fontSize: 15, outline: 'none', transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'}
                        />
                    </div>

                    <button
                        type="submit" disabled={loading}
                        style={{
                            width: '100%', padding: '14px 0',
                            borderRadius: 8, border: 'none',
                            background: '#10b981', color: '#09090b',
                            fontSize: 15, fontWeight: 600, cursor: 'pointer',
                            opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
                        }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#71717a' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
