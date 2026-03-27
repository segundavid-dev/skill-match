/* ─────────────────────────────────────────────────────────────────────────────
 * Discover Page — Swipe-based opportunity feed + search/filter
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { swipeApi, opportunityApi } from '../api';
import { ratingApi } from '../api/dashboard';
import type { Opportunity, Skill } from '../types';

interface FeedItem extends Opportunity {
    matchScore?: number;
}

/** Normalize requiredSkills from join-table shape to flat Skill[] */
function normalizeSkills(opp: any): Skill[] {
    if (!opp.requiredSkills) return [];
    return opp.requiredSkills.map((rs: any) => rs.skill ? rs.skill : rs);
}

const LOCATION_FILTERS = ['ALL', 'REMOTE', 'IN_PERSON', 'HYBRID'] as const;

export default function DiscoverPage() {
    // Swipe feed state
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [feedError, setFeedError] = useState('');

    // Search state
    const [searchMode, setSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState<string>('ALL');
    const [searchResults, setSearchResults] = useState<Opportunity[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Skills for filter
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<string>('');

    const loadFeed = useCallback(() => {
        setLoading(true);
        setFeedError('');
        swipeApi.getFeed()
            .then(res => {
                const items = (res.data.data || []).map((opp: any) => ({
                    ...opp,
                    requiredSkills: normalizeSkills(opp),
                }));
                setFeed(items);
                setCurrent(0);
                setLoading(false);
            })
            .catch(err => {
                setFeedError(err.response?.data?.message || 'Could not load feed');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        loadFeed();
        ratingApi.getSkills().then(res => setAllSkills(res.data.data || [])).catch(() => {});
    }, [loadFeed]);

    // Touch/drag swipe gesture state
    const cardRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef<{ x: number; y: number } | null>(null);
    const [dragOffset, setDragOffset] = useState(0);
    const [swiping, setSwiping] = useState(false);

    const handleSwipe = useCallback(async (direction: 'LEFT' | 'RIGHT') => {
        if (!feed[current]) return;
        setSwiping(true);
        setDragOffset(direction === 'RIGHT' ? 400 : -400);
        await new Promise(r => setTimeout(r, 250));
        try {
            await swipeApi.swipe({ opportunityId: feed[current].id, direction });
        } catch (err) {
            console.error('Swipe failed:', err);
        }
        setCurrent(c => c + 1);
        setDragOffset(0);
        setSwiping(false);
    }, [feed, current]);

    const onPointerDown = (e: React.PointerEvent) => {
        dragStart.current = { x: e.clientX, y: e.clientY };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragStart.current || swiping) return;
        const dx = e.clientX - dragStart.current.x;
        setDragOffset(dx);
    };
    const onPointerUp = () => {
        if (!dragStart.current || swiping) return;
        const threshold = 80;
        if (dragOffset > threshold) {
            handleSwipe('RIGHT');
        } else if (dragOffset < -threshold) {
            handleSwipe('LEFT');
        } else {
            setDragOffset(0);
        }
        dragStart.current = null;
    };

    const handleSearch = async () => {
        if (!searchQuery.trim() && locationFilter === 'ALL' && !selectedSkill) {
            setSearchMode(false);
            return;
        }
        setSearchMode(true);
        setSearchLoading(true);
        try {
            const params: any = { limit: 20 };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (locationFilter !== 'ALL') params.locationType = locationFilter;
            if (selectedSkill) params.skillId = selectedSkill;
            const res = await opportunityApi.list(params);
            const items = (res.data.data || []).map((opp: any) => ({
                ...opp,
                requiredSkills: normalizeSkills(opp),
            }));
            setSearchResults(items);
        } catch {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchMode(false);
        setSearchQuery('');
        setLocationFilter('ALL');
        setSelectedSkill('');
        setSearchResults([]);
    };

    const handleSearchSwipe = async (oppId: string) => {
        try {
            await swipeApi.swipe({ opportunityId: oppId, direction: 'RIGHT' });
            setSearchResults(prev => prev.filter(o => o.id !== oppId));
        } catch {}
    };

    const opp = feed[current];

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Discover
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>
                    Opportunities matched to your skills
                </p>
            </div>

            {/* Search bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search opportunities..."
                        style={{
                            flex: 1, padding: '10px 16px', borderRadius: 8,
                            border: '1px solid #27272a', background: '#18181b',
                            color: '#fafafa', fontSize: 14, outline: 'none',
                            transition: 'border-color 0.15s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#10b981'}
                        onBlur={e => e.target.style.borderColor = '#27272a'}
                    />
                    <button onClick={handleSearch} style={{
                        padding: '10px 20px', borderRadius: 8, border: 'none',
                        background: '#10b981', color: '#09090b',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>
                        Search
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {LOCATION_FILTERS.map(f => (
                        <button key={f} onClick={() => setLocationFilter(f)} style={{
                            padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                            border: `1px solid ${locationFilter === f ? '#10b981' : '#27272a'}`,
                            background: locationFilter === f ? 'rgba(16,185,129,0.08)' : 'transparent',
                            color: locationFilter === f ? '#10b981' : '#71717a',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                            {f === 'ALL' ? 'All' : f === 'IN_PERSON' ? 'In Person' : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                    {allSkills.length > 0 && (
                        <select
                            value={selectedSkill}
                            onChange={e => setSelectedSkill(e.target.value)}
                            style={{
                                padding: '6px 12px', borderRadius: 8, fontSize: 12,
                                border: '1px solid #27272a', background: '#18181b',
                                color: '#a1a1aa', cursor: 'pointer', outline: 'none',
                            }}
                        >
                            <option value="">All Skills</option>
                            {allSkills.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    )}
                    {searchMode && (
                        <button onClick={clearSearch} style={{
                            padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                            border: '1px solid #ef4444', background: 'transparent',
                            color: '#ef4444', cursor: 'pointer',
                        }}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Search results mode */}
            {searchMode ? (
                searchLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a' }}>Searching...</div>
                ) : searchResults.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 32px',
                        borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                    }}>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 8 }}>
                            No results found
                        </div>
                        <p style={{ fontSize: 14, color: '#71717a' }}>
                            Try different search terms or filters.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {searchResults.map(item => (
                            <div key={item.id} style={{
                                borderRadius: 12, border: '1px solid #27272a',
                                background: '#18181b', padding: '20px 24px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                                            {item.locationType}
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.01em' }}>
                                            {item.title}
                                        </h3>
                                        <p style={{ fontSize: 13, color: '#a1a1aa' }}>
                                            {item.org?.name || 'Organization'}
                                        </p>
                                    </div>
                                    {item.impactMetric && (
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 6,
                                            background: 'rgba(16,185,129,0.08)',
                                            color: '#10b981', fontSize: 11, fontWeight: 600,
                                        }}>
                                            {item.impactMetric}
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#71717a', marginBottom: 12 }}>
                                    {item.description?.slice(0, 120)}{item.description && item.description.length > 120 ? '...' : ''}
                                </p>
                                {item.requiredSkills && item.requiredSkills.length > 0 && (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                        {item.requiredSkills.map((s: any) => (
                                            <span key={s.id} style={{
                                                padding: '3px 8px', borderRadius: 4,
                                                background: '#27272a', color: '#a1a1aa', fontSize: 11,
                                            }}>
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: '#71717a' }}>
                                        {item.spotsNeeded - item.spotsFilled} spots left
                                    </span>
                                    <button onClick={() => handleSearchSwipe(item.id)} style={{
                                        padding: '8px 20px', borderRadius: 8, border: 'none',
                                        background: '#10b981', color: '#09090b',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    }}>
                                        Interested
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )

            /* Swipe feed mode */
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>
                    Loading opportunities...
                </div>
            ) : feedError ? (
                <div style={{
                    textAlign: 'center', padding: '80px 32px',
                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#fafafa', marginBottom: 8 }}>
                        Could not load feed
                    </div>
                    <p style={{ fontSize: 14, color: '#71717a', marginBottom: 24 }}>
                        {feedError}
                    </p>
                    <button onClick={loadFeed} style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none',
                        background: '#10b981', color: '#09090b',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>
                        Retry
                    </button>
                </div>
            ) : !opp ? (
                <div style={{
                    textAlign: 'center', padding: '80px 32px',
                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#fafafa', marginBottom: 8 }}>
                        All caught up
                    </div>
                    <p style={{ fontSize: 14, color: '#71717a', marginBottom: 24 }}>
                        No more opportunities to review. Check back later for new matches.
                    </p>
                    <button onClick={loadFeed} style={{
                        padding: '10px 24px', borderRadius: 8, border: 'none',
                        background: '#10b981', color: '#09090b',
                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}>
                        Refresh Feed
                    </button>
                </div>
            ) : (
                <>
                    {/* Opportunity card — draggable */}
                    <div
                        ref={cardRef}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        style={{
                            borderRadius: 12, border: '1px solid #27272a',
                            background: '#18181b', overflow: 'hidden',
                            transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
                            transition: swiping ? 'transform 0.25s ease' : (dragStart.current ? 'none' : 'transform 0.3s ease'),
                            touchAction: 'pan-y',
                            cursor: 'grab',
                            userSelect: 'none',
                            position: 'relative',
                        }}
                    >
                        {/* Swipe direction indicator */}
                        {dragOffset !== 0 && (
                            <div style={{
                                position: 'absolute', top: 24, zIndex: 10,
                                ...(dragOffset > 0 ? { left: 24 } : { right: 24 }),
                                padding: '8px 16px', borderRadius: 8,
                                border: `2px solid ${dragOffset > 0 ? '#10b981' : '#ef4444'}`,
                                color: dragOffset > 0 ? '#10b981' : '#ef4444',
                                fontSize: 16, fontWeight: 700,
                                opacity: Math.min(Math.abs(dragOffset) / 80, 1),
                                transform: `rotate(${dragOffset > 0 ? -12 : 12}deg)`,
                            }}>
                                {dragOffset > 0 ? 'LIKE' : 'PASS'}
                            </div>
                        )}
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

                        <div style={{ padding: '16px 24px 24px' }}>
                            <p style={{ fontSize: 15, lineHeight: 1.7, color: '#a1a1aa', marginBottom: 20 }}>
                                {opp.description}
                            </p>
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

                    <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#71717a' }}>
                        {current + 1} of {feed.length} &middot; Swipe or use buttons
                    </div>
                </>
            )}
        </div>
    );
}
