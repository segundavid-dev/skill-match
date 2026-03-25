/* ─────────────────────────────────────────────────────────────────────────────
 * AppLayout — Authenticated shell with top bar + bottom navigation
 * Wraps all authenticated routes (discover, matches, chat, dashboard, profile)
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import BottomNav from '../components/BottomNav';
import { healthApi } from '../api';

function getUserInitial(): string {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return '?';
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email: string = payload.email || '';
        return email.charAt(0).toUpperCase() || '?';
    } catch {
        return '?';
    }
}

export default function AppLayout() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<string>('checking...');
    const initial = getUserInitial();

    useEffect(() => {
        healthApi.check()
            .then(res => setStatus(res.data.status))
            .catch(() => setStatus('error'));
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#09090b',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            paddingBottom: 80,
            color: '#fafafa',
        }}>
            {/* ── Top bar ─────────────────────────────────────────────── */}
            <header style={{
                background: 'rgba(9, 9, 11, 0.8)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid #1f1f23',
                padding: '0 24px',
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}>
                <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/app/discover')}
                >
                    <Logo />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{
                        fontSize: 12,
                        color: status === 'healthy' ? '#10B981' : '#EF4444',
                    }}>
                        {status === 'healthy' ? 'Connected' : 'Disconnected'}
                    </span>
                    <div
                        onClick={() => navigate('/app/profile')}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#18181b',
                            border: '1px solid #27272a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10B981',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        {initial}
                    </div>
                </div>
            </header>

            {/* ── Page content (rendered by nested route) ─────────────── */}
            <main>
                <Outlet />
            </main>

            {/* ── Bottom navigation ───────────────────────────────────── */}
            <BottomNav />
        </div>
    );
}
