import React, { useState } from 'react';

const MY_SKILLS = ['Coding', 'Teaching', 'Graphic Design', 'Data Analysis'];

const TESTIMONIALS = [
    { from: 'Green Earth Foundation', text: 'Alex delivered outstanding work on our dashboard. Highly recommended!', rating: 5 },
    { from: 'Bright Minds Academy', text: 'A natural mentor. Our students loved every session.', rating: 5 },
];

export default function ProfilePage() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    return (
        <div style={{ padding: '24px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 600, margin: '0 auto' }}>
            {/* Profile header */}
            <div style={{
                background: 'linear-gradient(135deg,#10B981,#14B8A6)',
                borderRadius: 24, padding: 32, marginBottom: 24, textAlign: 'center', position: 'relative',
            }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)', border: '3px solid white',
                    margin: '0 auto 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                }}>
                    👤
                </div>
                <h2 style={{ color: 'white', fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 4 }}>
                    Alex Johnson
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>Volunteer · Lagos, Nigeria</p>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.2)', borderRadius: 50,
                    padding: '6px 16px', marginTop: 12,
                }}>
                    <span style={{ color: '#FDE68A', fontSize: 16 }}>★</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>4.9</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>· 23 reviews</span>
                </div>
            </div>

            {/* Skills */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>My Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {MY_SKILLS.map((s) => (
                        <span key={s} style={{
                            background: '#ECFDF5', color: '#059669',
                            padding: '8px 16px', borderRadius: 50, fontSize: 14,
                            fontWeight: 600, border: '1px solid #A7F3D0',
                        }}>
                            {s}
                        </span>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Rate a Recent Experience</h3>
                <p style={{ color: '#64748B', fontSize: 14, marginBottom: 16 }}>How was your time with Green Earth Foundation?</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', fontSize: 40, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <span
                            key={i}
                            onMouseEnter={() => setHover(i)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(i)}
                            style={{
                                cursor: 'pointer',
                                color: i <= (hover || rating) ? '#F59E0B' : '#E2E8F0',
                                transition: 'color 0.1s, transform 0.1s',
                                transform: i <= (hover || rating) ? 'scale(1.2)' : 'scale(1)',
                                display: 'inline-block',
                            }}
                        >
                            ★
                        </span>
                    ))}
                </div>
                {rating > 0 && !submitted && (
                    <button
                        onClick={() => setSubmitted(true)}
                        style={{
                            width: '100%', padding: 14, borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg,#10B981,#059669)',
                            color: 'white', fontWeight: 700, cursor: 'pointer',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                    >
                        Submit Review ✓
                    </button>
                )}
                {submitted && (
                    <div style={{
                        textAlign: 'center', padding: 16,
                        background: '#ECFDF5', borderRadius: 12,
                        color: '#059669', fontWeight: 600,
                    }}>
                        ✅ Review submitted! Thank you.
                    </div>
                )}
            </div>

            {/* Testimonials */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Testimonials</h3>
                {TESTIMONIALS.map((r, i) => (
                    <div key={i} style={{ padding: '16px 0', borderBottom: i < TESTIMONIALS.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>{r.from}</span>
                            <span style={{ color: '#F59E0B' }}>{'★'.repeat(r.rating)}</span>
                        </div>
                        <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6 }}>"{r.text}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
