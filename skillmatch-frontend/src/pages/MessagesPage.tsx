/* ─────────────────────────────────────────────────────────────────────────────
 * Messages Page — Chat inbox
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../api';
import type { ChatRoom } from '../types';

export default function MessagesPage() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chatApi.getMyChats()
            .then(res => { setRooms(res.data.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Messages
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>
                    Conversations with your matched organizations
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>Loading...</div>
            ) : rooms.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 32px',
                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 8 }}>
                        No messages yet
                    </div>
                    <p style={{ fontSize: 14, color: '#71717a' }}>
                        Messages will appear here once you match with an organization.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid #27272a' }}>
                    {rooms.map((room) => {
                        const lastMessage = room.messages?.[room.messages.length - 1];
                        return (
                            <div
                                key={room.id}
                                onClick={() => navigate(`/app/messages/${room.id}`)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '16px 20px', background: '#18181b',
                                    cursor: 'pointer', transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f23'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#18181b'}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: '#27272a', border: '1px solid #3f3f46',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 700, color: '#10b981', flexShrink: 0,
                                }}>
                                    {room.match?.opportunity?.org?.name?.[0] || 'C'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 2 }}>
                                        {room.match?.opportunity?.org?.name || 'Chat Room'}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {lastMessage?.content || 'No messages yet'}
                                    </div>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m9 18 6-6-6-6" />
                                </svg>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
