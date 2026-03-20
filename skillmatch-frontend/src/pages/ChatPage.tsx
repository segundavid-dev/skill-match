import React, { useState, useEffect, useRef } from 'react';
import { MESSAGES } from '../data/constants.ts';
import type { MatchItem, Message } from '../data/constants.ts';

interface ChatPageProps {
    match: MatchItem;
    onBack: () => void;
}

export default function ChatPage({ match, onBack }: ChatPageProps) {
    const [msgs, setMsgs] = useState<Message[]>(MESSAGES[match?.id] || []);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs, typing]);

    const send = () => {
        if (!input.trim()) return;
        const text = input;
        setInput('');
        setMsgs((m) => [...m, { from: 'me', text, time: 'now' }]);
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMsgs((m) => [...m, {
                from: 'them',
                text: "Thanks for your message! We'll be in touch shortly.",
                time: 'now',
            }]);
        }, 2000);
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100vh',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: 640, margin: '0 auto', background: '#F8FAFC',
        }}>
            {/* Header */}
            <div style={{
                background: 'white', padding: '16px 20px', borderBottom: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: 16,
                position: 'sticky', top: 0, zIndex: 10,
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: '#F1F5F9', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}
                >
                    ←
                </button>
                <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg,${match?.color || '#10B981'},${match?.color || '#10B981'}88)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 15,
                }}>
                    {match?.avatar}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{match?.name}</div>
                    <div style={{ color: '#10B981', fontSize: 12, fontWeight: 600 }}>● Online · {match?.role}</div>
                </div>
                <button style={{
                    background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none',
                    borderRadius: 10, padding: '8px 16px', color: 'white',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                    Confirm Role
                </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {msgs.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '75%', padding: '12px 16px',
                            borderRadius: m.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: m.from === 'me' ? 'linear-gradient(135deg,#10B981,#059669)' : 'white',
                            color: m.from === 'me' ? 'white' : '#0F172A',
                            fontSize: 15, lineHeight: 1.6,
                            boxShadow: m.from !== 'me' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        }}>
                            {m.text}
                            <div style={{
                                fontSize: 11,
                                color: m.from === 'me' ? 'rgba(255,255,255,0.55)' : '#94A3B8',
                                marginTop: 4, textAlign: 'right',
                            }}>
                                {m.time}
                            </div>
                        </div>
                    </div>
                ))}

                {typing && (
                    <>
                        <style>{`@keyframes typingDot{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{
                                display: 'flex', gap: 5, padding: '14px 18px', background: 'white',
                                borderRadius: '18px 18px 18px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}>
                                {[0, 1, 2].map((i) => (
                                    <div key={i} style={{
                                        width: 8, height: 8, borderRadius: '50%', background: '#94A3B8',
                                        animation: `typingDot 1.2s infinite ${i * 0.2}s`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    </>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{
                background: 'white', padding: '16px 20px', borderTop: '1px solid #E2E8F0',
                display: 'flex', gap: 12, alignItems: 'center',
            }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Type a message..."
                    style={{
                        flex: 1, padding: '14px 18px', border: '1.5px solid #E2E8F0',
                        borderRadius: 50, fontSize: 15, outline: 'none',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    onFocus={(e) => (e.target.style.border = '1.5px solid #10B981')}
                    onBlur={(e) => (e.target.style.border = '1.5px solid #E2E8F0')}
                />
                <button
                    onClick={send}
                    style={{
                        width: 48, height: 48, borderRadius: '50%', border: 'none',
                        background: 'linear-gradient(135deg,#10B981,#059669)',
                        color: 'white', fontSize: 18, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                >
                    →
                </button>
            </div>
        </div>
    );
}
