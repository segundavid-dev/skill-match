/* ─────────────────────────────────────────────────────────────────────────────
 * Dashboard Page — Stats overview for volunteer or org
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
    const [role] = useState(getRoleFromToken);
    const isOrg = role === 'ORGANIZATION';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetcher = isOrg ? dashboardApi.org() : dashboardApi.volunteer();
        fetcher
            .then(res => { setDashData(res.data.data); setLoading(false); })
            .catch(() => { setError('Could not load dashboard'); setLoading(false); });
    }, [isOrg]);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>Loading dashboard...</div>;
    }

    const stats = !isOrg
        ? [
            { label: 'Total Matches', value: dashData?.stats?.totalMatches ?? 0 },
            { label: 'Confirmed', value: dashData?.stats?.confirmed ?? 0 },
            { label: 'Completed', value: dashData?.stats?.completed ?? 0 },
            { label: 'Avg Rating', value: dashData?.stats?.avgRating ?? 0 },
        ]
        : [
            { label: 'Opportunities', value: dashData?.stats?.activeOpportunities ?? 0 },
            { label: 'Matches', value: dashData?.stats?.totalMatches ?? 0 },
            { label: 'Confirmed', value: dashData?.stats?.totalConfirmed ?? 0 },
            { label: 'Fill Rate', value: `${dashData?.stats?.fillRate ?? 0}%` },
        ];

    const recentMatches = dashData?.recentMatches || [];

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                        Dashboard
                    </h1>
                    <p style={{ fontSize: 14, color: '#71717a' }}>
                        {isOrg ? 'Manage your opportunities and volunteers' : 'Your activity overview'}
                    </p>
                </div>
                {isOrg && (
                    <button
                        onClick={() => navigate('/app/create-opportunity')}
                        style={{
                            padding: '10px 24px', borderRadius: 8, border: 'none',
                            background: '#10b981', color: '#09090b',
                            fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14" /><path d="M5 12h14" />
                        </svg>
                        Post Opportunity
                    </button>
                )}
            </div>

            {error ? (
                <div style={{
                    textAlign: 'center', padding: '60px 32px',
                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                }}>
                    <p style={{ color: '#71717a' }}>{error}</p>
                </div>
            ) : (
                <>
                    {/* Stats grid */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 1, borderRadius: 12, overflow: 'hidden',
                        border: '1px solid #27272a', marginBottom: 48,
                    }}>
                        {stats.map((s) => (
                            <div key={s.label} style={{ padding: '24px 20px', background: '#18181b' }}>
                                <div style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}>{s.label}</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>
                                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Opportunities list (org only) */}
                    {isOrg && dashData?.opportunities?.length > 0 && (
                        <div style={{ marginBottom: 48 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 16 }}>
                                Your Opportunities
                            </h2>
                            <div style={{ borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
                                {dashData.opportunities.map((opp: any) => (
                                    <div key={opp.id} onClick={() => navigate(`/app/opportunities/${opp.id}/applicants`)}
                                        style={{
                                            padding: '16px 20px', background: '#18181b',
                                            borderBottom: '1px solid #27272a',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            cursor: 'pointer', transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#1f1f23'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#18181b'}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 2 }}>
                                                {opp.title}
                                            </div>
                                            <div style={{ fontSize: 13, color: '#71717a' }}>
                                                {opp.spotsFilled}/{opp.spotsNeeded} filled &middot; {opp._count?.matches ?? 0} matches
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 4,
                                                background: opp.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : '#27272a',
                                                color: opp.status === 'ACTIVE' ? '#10b981' : '#71717a',
                                                fontSize: 12, fontWeight: 600,
                                            }}>
                                                {opp.status}
                                            </span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m9 18 6-6-6-6" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent matches */}
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 16 }}>
                            Recent Matches
                        </h2>
                        <div style={{ borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
                            {recentMatches.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#18181b' }}>
                                    <p style={{ color: '#71717a', fontSize: 14 }}>No recent matches to display.</p>
                                </div>
                            ) : (
                                recentMatches.map((item: any) => (
                                    <div key={item.id} style={{
                                        padding: '16px 20px', background: '#18181b',
                                        borderBottom: '1px solid #27272a',
                                        display: 'flex', alignItems: 'center', gap: 12,
                                    }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: item.status === 'MUTUAL' ? '#10b981' : '#71717a',
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 500, color: '#fafafa' }}>
                                                {isOrg
                                                    ? item.volunteer?.fullName || 'Volunteer'
                                                    : item.opportunity?.title || 'Opportunity'
                                                }
                                            </div>
                                            <div style={{ fontSize: 12, color: '#71717a' }}>
                                                {item.status} &middot; {new Date(item.createdAt).toLocaleDateString()}
                                                {isOrg && item.opportunity?.title && ` · ${item.opportunity.title}`}
                                            </div>
                                        </div>
                                        {item.matchScore != null && (
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 4,
                                                background: 'rgba(16,185,129,0.1)',
                                                color: '#10b981', fontSize: 12, fontWeight: 600,
                                            }}>
                                                {Math.round(item.matchScore)}%
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
