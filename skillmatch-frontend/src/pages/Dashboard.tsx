import React from 'react';

interface DashboardProps {
    role: string | null;
}

const VOLUNTEER_STATS: [string, string][] = [
    ['3', 'Active Matches'],
    ['12', 'Hours Given'],
    ['5', 'Orgs Helped'],
    ['94%', 'Impact Score'],
];

const NONPROFIT_STATS: [string, string][] = [
    ['47', 'Active Volunteers'],
    ['12', 'Open Roles'],
    ['89%', 'Fill Rate'],
    ['2.3K', 'Lives Impacted'],
];

const UPCOMING = [
    { date: 'Mar 18', org: 'Bright Minds Academy', role: 'STEM Tutor', color: '#F59E0B' },
    { date: 'Mar 22', org: 'Green Earth Foundation', role: 'Web Developer', color: '#10B981' },
];

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Dashboard({ role }: DashboardProps) {
    const stats = role === 'nonprofit' ? NONPROFIT_STATS : VOLUNTEER_STATS;

    return (
        <div style={{ padding: '24px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 800, margin: '0 auto' }}>
            {/* Welcome banner */}
            <div style={{
                background: 'linear-gradient(135deg,#0F3D2E,#0D3038)', borderRadius: 24,
                padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(16,185,129,0.12)' }} />
                <div style={{ position: 'absolute', bottom: -30, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(20,184,166,0.1)' }} />
                <div style={{ position: 'relative' }}>
                    <div style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 8, fontSize: 14 }}>Good morning! 🌱</div>
                    <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: 'white', marginBottom: 8, letterSpacing: -1 }}>
                        Welcome back,<br />
                        <span style={{ color: '#34D399' }}>Alex</span>
                    </h2>
                    {role !== 'nonprofit' && (
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>
                            You've helped <strong style={{ color: '#34D399' }}>47 people</strong> this month 🎉
                        </p>
                    )}
                </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 24 }}>
                {stats.map(([n, l]) => (
                    <div key={l} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#10B981', fontWeight: 700 }}>{n}</div>
                        <div style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>{l}</div>
                    </div>
                ))}
            </div>

            {/* Upcoming */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: 16, fontSize: 18 }}>Upcoming Opportunities</h3>
                {UPCOMING.map((o, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0',
                        borderBottom: i < UPCOMING.length - 1 ? '1px solid #F1F5F9' : 'none',
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                            background: `${o.color}22`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: o.color }}>{o.date.split(' ')[0]}</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: o.color }}>{o.date.split(' ')[1]}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{o.org}</div>
                            <div style={{ color: '#64748B', fontSize: 13 }}>{o.role}</div>
                        </div>
                        <span style={{
                            background: '#ECFDF5', color: '#059669',
                            padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                        }}>
                            Confirmed
                        </span>
                    </div>
                ))}
            </div>

            {/* Match streak */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 700, color: '#0F172A', fontSize: 18 }}>Match Streak 🔥</h3>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>7 days</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {DAYS.map((d, i) => (
                        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{
                                paddingBottom: '100%', borderRadius: 8, position: 'relative',
                                background: i < 5 ? 'linear-gradient(135deg,#10B981,#059669)' : '#F1F5F9',
                            }}>
                                {i < 5 && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 14,
                                    }}>
                                        ✓
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{d}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
