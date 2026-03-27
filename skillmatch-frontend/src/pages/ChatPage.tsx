/* ─────────────────────────────────────────────────────────────────────────────
 * Chat Page — Individual conversation thread with real-time WebSocket
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { chatApi } from '../api';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

function getCurrentUserId(): string {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return '';
        return JSON.parse(atob(token.split('.')[1])).userId || '';
    } catch { return ''; }
}

export default function ChatPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [otherName, setOtherName] = useState('Conversation');
    const [otherInitial, setOtherInitial] = useState('C');
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const currentUserId = getCurrentUserId();

    // Load room metadata + initial messages
    useEffect(() => {
        if (!roomId) return;

        // Fetch room to get participant names
        chatApi.getRoom(roomId).then(res => {
            const room = res.data.data;
            const other = room.participants?.find((p: any) => p.user?.id !== currentUserId);
            if (other?.user) {
                const name = other.user.volunteerProfile?.fullName
                    || other.user.orgProfile?.name
                    || 'Chat';
                setOtherName(name);
                setOtherInitial(name[0]?.toUpperCase() || 'C');
            }
        }).catch(() => {});

        chatApi.getMessages(roomId)
            .then(res => { setMessages(res.data.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [roomId]);

    // Connect to Socket.IO
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!roomId || !token) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            socket.emit('join_room', roomId);
        });

        socket.on('new_message', (message: Message) => {
            setMessages(prev => {
                // Avoid duplicates (in case we already added it optimistically)
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
        });

        socketRef.current = socket;

        return () => {
            socket.emit('leave_room', roomId);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [roomId]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !roomId) return;
        const content = input.trim();
        setInput('');

        // Send via WebSocket if connected, otherwise fall back to REST
        if (socketRef.current?.connected) {
            socketRef.current.emit('send_message', { roomId, content });
        } else {
            try {
                const { data } = await chatApi.sendMessage(roomId, { content });
                setMessages(prev => [...prev, data.data]);
            } catch (err) {
                console.error('Send failed:', err);
            }
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: '#09090b',
            display: 'flex', flexDirection: 'column', zIndex: 200,
            fontFamily: "'Space Grotesk', sans-serif",
        }}>
            {/* Header */}
            <div style={{
                padding: '0 16px', height: 64,
                borderBottom: '1px solid #1f1f23',
                display: 'flex', alignItems: 'center', gap: 12,
            }}>
                <button onClick={() => navigate('/app/messages')} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#a1a1aa', display: 'flex', padding: 4,
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </button>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#18181b', border: '1px solid #27272a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#10b981',
                }}>
                    {otherInitial}
                </div>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fafafa' }}>{otherName}</div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>
                        {socketRef.current?.connected ? 'Online' : 'Connecting...'}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{
                flex: 1, overflowY: 'auto', padding: '24px 16px',
                display: 'flex', flexDirection: 'column', gap: 12,
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#71717a', padding: '40px 0' }}>Loading...</div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#71717a', padding: '40px 0' }}>
                        No messages yet. Say hello!
                    </div>
                ) : messages.map((msg) => {
                    const isMine = msg.senderId === currentUserId;
                    return (
                        <div key={msg.id} style={{
                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                        }}>
                            <div style={{
                                padding: '10px 16px', borderRadius: 12,
                                background: isMine ? '#10b981' : '#18181b',
                                color: isMine ? '#09090b' : '#fafafa',
                                fontSize: 15, lineHeight: 1.5,
                                borderBottomRightRadius: isMine ? 4 : 12,
                                borderBottomLeftRadius: isMine ? 12 : 4,
                            }}>
                                {msg.content}
                            </div>
                            <div style={{
                                fontSize: 11, color: '#71717a', marginTop: 4,
                                textAlign: isMine ? 'right' : 'left',
                            }}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input */}
            <div style={{
                padding: '12px 16px', borderTop: '1px solid #1f1f23',
                display: 'flex', gap: 12, alignItems: 'center',
            }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    style={{
                        flex: 1, padding: '12px 16px',
                        borderRadius: 8, border: '1px solid #27272a',
                        background: '#18181b', color: '#fafafa',
                        fontSize: 15, outline: 'none',
                    }}
                />
                <button onClick={handleSend} disabled={!input.trim()} style={{
                    width: 44, height: 44, borderRadius: 8, border: 'none',
                    background: input.trim() ? '#10b981' : '#27272a',
                    color: input.trim() ? '#09090b' : '#71717a',
                    cursor: input.trim() ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
