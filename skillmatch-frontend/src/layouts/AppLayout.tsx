/* ─────────────────────────────────────────────────────────────────────────────
 * AppLayout — Authenticated shell with top bar + bottom navigation
 * Wraps all authenticated routes (discover, matches, chat, dashboard, profile)
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
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
    const [matchNotif, setMatchNotif] = useState<string | null>(null);
    const initial = getUserInitial();

    useEffect(() => {
        healthApi.check()
            .then(res => setStatus(res.data.status))
            .catch(() => setStatus('error'));
    }, []);

    // Socket.IO: listen for new_match events
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
        const socket: Socket = io(baseUrl, { auth: { token } });

        socket.on('new_match', (data: any) => {
            const title = data?.match?.opportunity?.title || 'an opportunity';
            setMatchNotif(`New match on "${title}"!`);
            setTimeout(() => setMatchNotif(null), 5000);
        });

        return () => { socket.disconnect(); };
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

            {/* ── Match notification ──────────────────────────────────── */}
            {matchNotif && (
                <div style={{
                    position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 100, padding: '12px 24px', borderRadius: 8,
                    background: '#10b981', color: '#09090b',
                    fontSize: 14, fontWeight: 600, boxShadow: '0 4px 24px rgba(16,185,129,0.3)',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    {matchNotif}
                </div>
            )}

            {/* ── Page content (rendered by nested route) ─────────────── */}
            <main>
                <Outlet />
            </main>

            {/* ── Bottom navigation ───────────────────────────────────── */}
            <BottomNav />
        </div>
    );
}
