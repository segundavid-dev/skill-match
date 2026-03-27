/* ─────────────────────────────────────────────────────────────────────────────
 * Dashboard Page — Distinct layouts for volunteer and org
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';

function getRoleFromToken(): string {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return 'VOLUNTEER';
        return JSON.parse(atob(token.split('.')[1])).role || 'VOLUNTEER';
    } catch { return 'VOLUNTEER'; }
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [dashData, setDashData] = useState<any>(null);
    const [role] = useState(getRoleFromToken());
    const isOrg = role === 'ORGANIZATION';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetcher = isOrg ? dashboardApi.org() : dashboardApi.volunteer();
        fetcher
            .then(res => { setDashData(res.data.data); setLoading(false); })
            .catch(err => {
                const msg = err.response?.data?.message || err.message || 'Could not load dashboard';
                setError(msg);
                setLoading(false);
            });
    }, [isOrg]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>Loading dashboard...</div>;
    }

    if (error) {
        return (
            <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{
                    textAlign: 'center', padding: '60px 32px',
                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                }}>
                    <p style={{ color: '#71717a' }}>{error}</p>
                </div>
            </div>
        );
    }

    const recentMatches = dashData?.recentMatches || [];

    /* ── ORGANIZATION DASHBOARD ───────────────────────────────── */
    if (isOrg) {
        const orgStats = [
            { label: 'Active Opportunities', value: dashData?.stats?.activeOpportunities ?? 0 },
            { label: 'Total Matches', value: dashData?.stats?.totalMatches ?? 0 },
            { label: 'Confirmed', value: dashData?.stats?.totalConfirmed ?? 0 },
            { label: 'Fill Rate', value: `${dashData?.stats?.fillRate ?? 0}%` },
        ];

        return (
            <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                            {dashData?.org?.name || 'Organization'} Dashboard
                        </h1>
                        <p style={{ fontSize: 14, color: '#71717a' }}>Manage your opportunities and volunteers</p>
                    </div>
                    <button onClick={() => navigate('/app/create-opportunity')} style={{
                        padding: '12px 28px', borderRadius: 8, border: 'none',
                        background: '#10b981', color: '#09090b',
                        fontSize: 15, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 0 20px rgba(16,185,129,0.2)',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14" /><path d="M5 12h14" />
                        </svg>
                        Post Opportunity
                    </button>
                </div>

                {/* Stats */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 1, borderRadius: 12, overflow: 'hidden',
                    border: '1px solid #27272a', marginBottom: 48,
                }}>
                    {orgStats.map(s => (
                        <div key={s.label} style={{ padding: '24px 20px', background: '#18181b' }}>
                            <div style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}>{s.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>
                                {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Opportunities with progress bars */}
                {dashData?.opportunities?.length > 0 && (
                    <div style={{ marginBottom: 48 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 16 }}>
                            Your Opportunities
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {dashData.opportunities.map((opp: any) => {
                                const fillPct = opp.spotsNeeded > 0
                                    ? Math.round((opp.spotsFilled / opp.spotsNeeded) * 100) : 0;
                                return (
                                    <div key={opp.id} onClick={() => navigate(`/app/opportunities/${opp.id}/applicants`)}
                                        style={{
                                            borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                                            padding: '20px', cursor: 'pointer', transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#1f1f23'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#18181b'}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <div>
                                                <div style={{ fontSize: 16, fontWeight: 600, color: '#fafafa' }}>{opp.title}</div>
                                                <div style={{ fontSize: 13, color: '#71717a' }}>
                                                    {opp._count?.matches ?? 0} matches &middot; {opp.spotsFilled}/{opp.spotsNeeded} filled
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: 4,
                                                    background: opp.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : '#27272a',
                                                    color: opp.status === 'ACTIVE' ? '#10b981' : '#71717a',
                                                    fontSize: 12, fontWeight: 600,
                                                }}>
                                                    {opp.status}
                                                </span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5"><path d="m9 18 6-6-6-6" /></svg>
                                            </div>
                                        </div>
                                        <div style={{ height: 4, borderRadius: 2, background: '#27272a', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', width: `${fillPct}%`, borderRadius: 2,
                                                background: '#10b981', transition: 'width 0.3s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent matched volunteers */}
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 16 }}>
                        Recent Matched Volunteers
                    </h2>
                    {recentMatches.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '40px 20px',
                            borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                        }}>
                            <p style={{ color: '#71717a', fontSize: 14 }}>No mutual matches yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {recentMatches.map((match: any) => (
                                <div key={match.id} style={{
                                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b', padding: '20px',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%', background: '#27272a',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14, fontWeight: 700, color: '#10b981',
                                        }}>
                                            {(match.volunteer?.fullName || 'V')[0].toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: '#fafafa' }}>
                                                {match.volunteer?.fullName || 'Volunteer'}
                                            </div>
                                            <div style={{ fontSize: 13, color: '#71717a' }}>
                                                {match.opportunity?.title || 'Opportunity'}
                                            </div>
                                        </div>
                                    </div>
                                    {match.volunteer?.skills?.length > 0 && (
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                            {match.volunteer.skills.slice(0, 4).map((vs: any) => (
                                                <span key={vs.skill?.name} style={{
                                                    padding: '3px 8px', borderRadius: 4,
                                                    background: '#27272a', color: '#a1a1aa', fontSize: 11,
                                                }}>
                                                    {vs.skill?.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>
                                            {Math.round(match.matchScore)}% match
                                        </span>
                                        <button
                                            onClick={e => { e.stopPropagation(); match.chatRoom && navigate(`/app/messages/${match.chatRoom.id}`); }}
                                            disabled={!match.chatRoom}
                                            style={{
                                                background: 'none', border: '1px solid #27272a', borderRadius: 8,
                                                padding: '6px 12px', cursor: match.chatRoom ? 'pointer' : 'default',
                                                color: match.chatRoom ? '#10b981' : '#3f3f46',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                opacity: match.chatRoom ? 1 : 0.4,
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            <span style={{ fontSize: 12, fontWeight: 600 }}>Message</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── VOLUNTEER DASHBOARD ──────────────────────────────────── */
    const volStats = [
        { label: 'Total Matches', value: dashData?.stats?.totalMatches ?? 0 },
        { label: 'Confirmed', value: dashData?.stats?.confirmed ?? 0 },
        { label: 'Completed', value: dashData?.stats?.completed ?? 0 },
        { label: 'Avg Rating', value: dashData?.stats?.avgRating ?? 0 },
    ];

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
            {/* Greeting */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Welcome back, {dashData?.profile?.fullName?.split(' ')[0] || 'Volunteer'}
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>Your activity overview</p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 1, borderRadius: 12, overflow: 'hidden',
                border: '1px solid #27272a', marginBottom: 48,
            }}>
                {volStats.map(s => (
                    <div key={s.label} style={{ padding: '24px 20px', background: '#18181b' }}>
                        <div style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}>{s.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>
                            {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Matches as cards */}
            <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 16 }}>
                    Recent Matches
                </h2>
                {recentMatches.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '40px 20px',
                        borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                    }}>
                        <p style={{ color: '#71717a', fontSize: 14, marginBottom: 16 }}>No matches yet. Start discovering!</p>
                        <button onClick={() => navigate('/app/discover')} style={{
                            padding: '10px 24px', borderRadius: 8, border: 'none',
                            background: '#10b981', color: '#09090b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        }}>
                            Browse Opportunities
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {recentMatches.map((match: any) => (
                            <div key={match.id} style={{
                                borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                                padding: '20px', display: 'flex', flexDirection: 'column', gap: 12,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%', background: '#27272a',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 700, color: '#10b981', flexShrink: 0,
                                    }}>
                                        {(match.opportunity?.org?.name || 'O')[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: '#fafafa' }}>
                                            {match.opportunity?.title || 'Opportunity'}
                                        </div>
                                        <div style={{ fontSize: 13, color: '#71717a' }}>
                                            {match.opportunity?.org?.name || 'Organization'}
                                        </div>
                                    </div>
                                    {match.matchScore != null && (
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 4,
                                            background: 'rgba(16,185,129,0.1)', color: '#10b981',
                                            fontSize: 12, fontWeight: 600,
                                        }}>
                                            {Math.round(match.matchScore)}%
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: 12, fontWeight: 600,
                                        color: match.status === 'MUTUAL' ? '#10b981' : '#71717a',
                                    }}>
                                        {match.status}
                                    </span>
                                    <button
                                        onClick={() => match.chatRoom && navigate(`/app/messages/${match.chatRoom.id}`)}
                                        disabled={!match.chatRoom}
                                        style={{
                                            background: 'none', border: '1px solid #27272a', borderRadius: 8,
                                            padding: '6px 12px', cursor: match.chatRoom ? 'pointer' : 'default',
                                            color: match.chatRoom ? '#10b981' : '#3f3f46',
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            opacity: match.chatRoom ? 1 : 0.4,
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>Message</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Opportunities */}
            {dashData?.upcomingOpportunities?.length > 0 && (
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 16 }}>
                        Upcoming
                    </h2>
                    <div style={{ borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
                        {dashData.upcomingOpportunities.map((p: any) => (
                            <div key={p.id} style={{
                                padding: '16px 20px', background: '#18181b',
                                borderBottom: '1px solid #27272a',
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: p.status === 'CONFIRMED' ? '#10b981' : '#71717a',
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fafafa' }}>
                                        {p.opportunity?.title || 'Opportunity'}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#71717a' }}>
                                        {p.opportunity?.org?.name} &middot; {p.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
