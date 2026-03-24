/* ─────────────────────────────────────────────────────────────────────────────
 * Login Page
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authApi.login({ email, password });
            const { tokens } = res.data.data;
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            navigate('/app/discover');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
                    <img src="/logo.jpg" alt="SkillMatch" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <span style={{ fontWeight: 700, fontSize: 18, color: '#fafafa', letterSpacing: '-0.02em' }}>
                        SkillMatch
                    </span>
                </Link>

                <h1 style={{
                    fontSize: 28, fontWeight: 700, color: '#fafafa',
                    letterSpacing: '-0.03em', marginBottom: 8,
                }}>
                    Welcome back
                </h1>
                <p style={{ fontSize: 15, color: '#71717a', marginBottom: 32 }}>
                    Sign in to continue to your account
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
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%', padding: '12px 16px',
                                borderRadius: 8, border: '1px solid #27272a',
                                background: '#18181b', color: '#fafafa',
                                fontSize: 15, outline: 'none',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#a1a1aa' }}>
                                Password
                            </label>
                            <Link to="/forgot-password" style={{ fontSize: 13, color: '#10b981', textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            style={{
                                width: '100%', padding: '12px 16px',
                                borderRadius: 8, border: '1px solid #27272a',
                                background: '#18181b', color: '#fafafa',
                                fontSize: 15, outline: 'none',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px 0',
                            borderRadius: 8, border: 'none',
                            background: '#10b981', color: '#09090b',
                            fontSize: 15, fontWeight: 600, cursor: 'pointer',
                            opacity: loading ? 0.6 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#71717a' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
