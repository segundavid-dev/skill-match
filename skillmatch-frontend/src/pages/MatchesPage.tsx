/* ─────────────────────────────────────────────────────────────────────────────
 * Matches Page — List of matches for both volunteers and orgs
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { swipeApi } from '../api';
import type { Match } from '../types';

function getRoleFromToken(): string {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return 'VOLUNTEER';
        return JSON.parse(atob(token.split('.')[1])).role || 'VOLUNTEER';
    } catch { return 'VOLUNTEER'; }
}

export default function MatchesPage() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const role = getRoleFromToken();
    const isOrg = role === 'ORGANIZATION';

    useEffect(() => {
        swipeApi.getMatches()
            .then(res => { setMatches(res.data.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Matches
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>
                    {isOrg ? 'Volunteers matched with your opportunities' : "Organizations you've connected with"}
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>Loading...</div>
            ) : matches.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 32px',
                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 8 }}>
                        No matches yet
                    </div>
                    <p style={{ fontSize: 14, color: '#71717a', marginBottom: 24 }}>
                        {isOrg
                            ? 'Matches will appear when volunteers swipe on your opportunities.'
                            : 'Start discovering opportunities to find your first match.'}
                    </p>
                    {!isOrg && (
                        <button onClick={() => navigate('/app/discover')} style={{
                            padding: '10px 24px', borderRadius: 8, border: 'none',
                            background: '#10b981', color: '#09090b',
                            fontSize: 14, fontWeight: 600, cursor: 'pointer',
                        }}>
                            Browse Opportunities
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid #27272a' }}>
                    {matches.map((match: any) => {
                        const displayName = isOrg
                            ? match.volunteer?.fullName || 'Volunteer'
                            : match.opportunity?.org?.name || 'Organization';
                        const subtitle = isOrg
                            ? match.opportunity?.title || 'Opportunity'
                            : match.opportunity?.title || 'Opportunity';
                        const initial = displayName[0]?.toUpperCase() || 'M';

                        return (
                            <div
                                key={match.id}
                                onClick={() => match.chatRoom && navigate(`/app/messages/${match.chatRoom.id}`)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 16,
                                    padding: '16px 20px', background: '#18181b',
                                    cursor: match.chatRoom ? 'pointer' : 'default',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#1f1f23'}
                                onMouseLeave={e => e.currentTarget.style.background = '#18181b'}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: '#27272a', border: '1px solid #3f3f46',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 700, color: '#10b981', flexShrink: 0,
                                }}>
                                    {initial}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fafafa', marginBottom: 2 }}>
                                        {displayName}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {subtitle} &middot; {match.status}
                                    </div>
                                </div>
                                <span style={{
                                    padding: '4px 10px', borderRadius: 4,
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10b981', fontSize: 12, fontWeight: 600, flexShrink: 0,
                                }}>
                                    {Math.round(match.matchScore)}% match
                                </span>
                                {match.chatRoom && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m9 18 6-6-6-6" />
                                    </svg>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
