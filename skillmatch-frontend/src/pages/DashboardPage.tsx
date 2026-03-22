/* ─────────────────────────────────────────────────────────────────────────────
 * Dashboard Page — Stats overview for volunteer or org
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../api';
import type { VolunteerDashboard, OrgDashboard } from '../types';

export default function DashboardPage() {
    const [vDash, setVDash] = useState<VolunteerDashboard | null>(null);
    const [oDash, setODash] = useState<OrgDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Try volunteer dashboard first, then org
        dashboardApi.volunteer()
            .then(res => { setVDash(res.data.data); setLoading(false); })
            .catch(() => {
                dashboardApi.org()
                    .then(res => { setODash(res.data.data); setLoading(false); })
                    .catch(() => { setError('Could not load dashboard'); setLoading(false); });
            });
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>Loading dashboard...</div>;
    }

    const stats = vDash
        ? [
            { label: 'Total Matches', value: vDash.totalMatches },
            { label: 'Active Projects', value: vDash.activeParticipations },
            { label: 'Impact Score', value: vDash.impactScore },
            { label: 'Completed', value: vDash.completedHours },
        ]
        : oDash
        ? [
            { label: 'Opportunities', value: oDash.totalOpportunities },
            { label: 'Applications', value: oDash.totalApplications },
            { label: 'Active Volunteers', value: oDash.activeVolunteers },
            { label: 'Completed', value: oDash.completedProjects },
        ]
        : [];

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Dashboard
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>
                    Your activity overview
                </p>
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
                                <div style={{ fontSize: 13, color: '#71717a', marginBottom: 8 }}>
                                    {s.label}
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>
                                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent activity */}
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 16 }}>
                            Recent Activity
                        </h2>
                        <div style={{
                            borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden',
                        }}>
                            {(vDash?.recentMatches || oDash?.recentOpportunities || []).length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#18181b' }}>
                                    <p style={{ color: '#71717a', fontSize: 14 }}>No recent activity to display.</p>
                                </div>
                            ) : (
                                (vDash?.recentMatches || []).map((match) => (
                                    <div key={match.id} style={{
                                        padding: '16px 20px', background: '#18181b',
                                        borderBottom: '1px solid #27272a',
                                        display: 'flex', alignItems: 'center', gap: 12,
                                    }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: match.status === 'MUTUAL' ? '#10b981' : '#71717a',
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 500, color: '#fafafa' }}>
                                                {match.opportunity?.title || 'Match'}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#71717a' }}>
                                                {match.status} &middot; {new Date(match.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
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
