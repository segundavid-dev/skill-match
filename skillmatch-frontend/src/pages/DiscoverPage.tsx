/* ─────────────────────────────────────────────────────────────────────────────
 * Discover Page — Swipe-based opportunity feed
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { swipeApi } from '../api';
import type { Opportunity, Skill } from '../types';

interface FeedItem extends Opportunity {
    matchScore?: number;
}

/** Normalize requiredSkills from join-table shape to flat Skill[] */
function normalizeSkills(opp: any): Skill[] {
    if (!opp.requiredSkills) return [];
    return opp.requiredSkills.map((rs: any) => rs.skill ? rs.skill : rs);
}

export default function DiscoverPage() {
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        swipeApi.getFeed()
            .then(res => {
                const items = (res.data.data || []).map((opp: any) => ({
                    ...opp,
                    requiredSkills: normalizeSkills(opp),
                }));
                setFeed(items);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSwipe = async (direction: 'LEFT' | 'RIGHT') => {
        if (!feed[current]) return;
        try {
            await swipeApi.swipe({ opportunityId: feed[current].id, direction });
            setCurrent(c => c + 1);
        } catch (err) {
            console.error('Swipe failed:', err);
        }
    };

    const opp = feed[current];

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Discover
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>
                    Opportunities matched to your skills
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>
                    Loading opportunities...
                </div>
            ) : !opp ? (
                <div style={{
                    textAlign: 'center', padding: '80px 32px',
                    borderRadius: 12, border: '1px solid #27272a',
                    background: '#18181b',
                }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#fafafa', marginBottom: 8 }}>
                        All caught up
                    </div>
                    <p style={{ fontSize: 14, color: '#71717a' }}>
                        No more opportunities to review. Check back later for new matches.
                    </p>
                </div>
            ) : (
                <>
                    {/* Opportunity card */}
                    <div style={{
                        borderRadius: 12, border: '1px solid #27272a',
                        background: '#18181b', overflow: 'hidden',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '24px 24px 0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                        }}>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                    {opp.locationType}
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em', marginBottom: 4 }}>
                                    {opp.title}
                                </h2>
                                <p style={{ fontSize: 14, color: '#a1a1aa' }}>
                                    {opp.org?.name || 'Organization'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {opp.matchScore != null && (
                                    <span style={{
                                        padding: '6px 12px', borderRadius: 6,
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        border: '1px solid rgba(16, 185, 129, 0.25)',
                                        color: '#10b981', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                                    }}>
                                        {Math.round(opp.matchScore)}% match
                                    </span>
                                )}
                                {opp.impactMetric && (
                                    <span style={{
                                        padding: '6px 12px', borderRadius: 6,
                                        background: 'rgba(16, 185, 129, 0.08)',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        color: '#10b981', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                                    }}>
                                        {opp.impactMetric}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ padding: '16px 24px 24px' }}>
                            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#a1a1aa', marginBottom: 20 }}>
                                {opp.description}
                            </p>

                            {/* Skills */}
                            {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                                    {opp.requiredSkills.map(s => (
                                        <span key={s.id} style={{
                                            padding: '4px 10px', borderRadius: 4,
                                            background: '#27272a', color: '#a1a1aa',
                                            fontSize: 12, fontWeight: 500,
                                        }}>
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Meta */}
                            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#71717a' }}>
                                {opp.location && <span>{opp.location}</span>}
                                <span>{opp.spotsNeeded - opp.spotsFilled} spots left</span>
                            </div>
                        </div>
                    </div>

                    {/* Swipe actions */}
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
                        <button onClick={() => handleSwipe('LEFT')} style={{
                            width: 56, height: 56, borderRadius: '50%',
                            border: '1px solid #27272a', background: '#18181b',
                            color: '#ef4444', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                            </svg>
                        </button>
                        <button onClick={() => handleSwipe('RIGHT')} style={{
                            width: 56, height: 56, borderRadius: '50%',
                            border: 'none', background: '#10b981',
                            color: '#09090b', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress */}
                    <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#71717a' }}>
                        {current + 1} of {feed.length}
                    </div>
                </>
            )}
        </div>
    );
}
