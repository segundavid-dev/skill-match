/* ─────────────────────────────────────────────────────────────────────────────
 * Opportunity Applicants Page — Org views matched volunteers per opportunity
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { opportunityApi, swipeApi } from '../api';

export default function OpportunityApplicantsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [swipingId, setSwipingId] = useState<string | null>(null);
    const [selectedVol, setSelectedVol] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        opportunityApi.getApplicants(id)
            .then(res => {
                setOpportunity(res.data.data.opportunity);
                setMatches(res.data.data.matches);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Failed to load applicants');
                setLoading(false);
            });
    }, [id]);

    const handleOrgSwipe = async (volunteerId: string, direction: 'LEFT' | 'RIGHT') => {
        if (!id || swipingId) return;
        setSwipingId(volunteerId);
        setActionError('');
        try {
            const res = await swipeApi.orgSwipe({ opportunityId: id, volunteerId, direction });
            setMatches(prev => prev.map(m => {
                if (m.volunteer?.id === volunteerId) {
                    const newStatus = res.data.data.isMutualMatch ? 'MUTUAL' : (direction === 'RIGHT' ? 'ORG_ACCEPTED' : 'REJECTED');
                    return { ...m, status: newStatus, chatRoom: res.data.data.match?.chatRoom || m.chatRoom };
                }
                return m;
            }));
        } catch (err: any) {
            setActionError(err.response?.data?.message || 'Failed to process action. Please try again.');
        } finally {
            setSwipingId(null);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>Loading applicants...</div>;
    }

    if (error) {
        return (
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{
                    textAlign: 'center', padding: '60px 32px',
                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                }}>
                    <p style={{ color: '#f87171' }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
            {/* Back + header */}
            <button onClick={() => navigate('/app/dashboard')} style={{
                background: 'none', border: 'none', color: '#71717a',
                fontSize: 14, cursor: 'pointer', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 4,
            }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                Back to Dashboard
            </button>

            {actionError && (
                <div style={{
                    padding: '12px 16px', borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171', fontSize: 14, marginBottom: 16,
                }}>
                    {actionError}
                </div>
            )}

            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    {opportunity?.title || 'Opportunity'}
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>
                    {matches.length} applicant{matches.length !== 1 ? 's' : ''} &middot; {opportunity?.spotsFilled || 0}/{opportunity?.spotsNeeded || 0} spots filled
                </p>
            </div>

            {matches.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 32px',
                    borderRadius: 12, border: '1px solid #27272a', background: '#18181b',
                }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#fafafa', marginBottom: 8 }}>
                        No applicants yet
                    </div>
                    <p style={{ fontSize: 14, color: '#71717a' }}>
                        Volunteers who swipe right on this opportunity will appear here.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {matches.map((match: any) => {
                        const vol = match.volunteer;
                        const skills = (vol?.skills || []).map((vs: any) => vs.skill?.name || vs.name).filter(Boolean);

                        return (
                            <div key={match.id} style={{
                                borderRadius: 12, border: '1px solid #27272a',
                                background: '#18181b', padding: '20px 24px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                                    <div
                                        onClick={() => setSelectedVol({ ...vol, matchScore: match.matchScore })}
                                        style={{
                                            width: 44, height: 44, borderRadius: '50%',
                                            background: '#27272a', border: '1px solid #3f3f46',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 16, fontWeight: 700, color: '#10b981', flexShrink: 0,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {vol?.fullName?.[0]?.toUpperCase() || 'V'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div
                                            onClick={() => setSelectedVol({ ...vol, matchScore: match.matchScore })}
                                            style={{ fontSize: 16, fontWeight: 600, color: '#fafafa', cursor: 'pointer' }}
                                            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                                            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                                        >
                                            {vol?.fullName || 'Volunteer'}
                                        </div>
                                        <div style={{ fontSize: 13, color: '#71717a' }}>
                                            {vol?.user?.email}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        {match.matchScore != null && (
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 4,
                                                background: 'rgba(16,185,129,0.1)',
                                                color: '#10b981', fontSize: 12, fontWeight: 600,
                                            }}>
                                                {Math.round(match.matchScore)}%
                                            </span>
                                        )}
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 4,
                                            background: match.status === 'MUTUAL' ? 'rgba(16,185,129,0.15)'
                                                : match.status === 'ORG_ACCEPTED' ? 'rgba(59,130,246,0.15)'
                                                : match.status === 'REJECTED' ? 'rgba(239,68,68,0.1)'
                                                : '#27272a',
                                            color: match.status === 'MUTUAL' ? '#10b981'
                                                : match.status === 'ORG_ACCEPTED' ? '#3b82f6'
                                                : match.status === 'REJECTED' ? '#f87171'
                                                : '#71717a',
                                            fontSize: 12, fontWeight: 600,
                                        }}>
                                            {match.status === 'ORG_ACCEPTED' ? 'ACCEPTED' : match.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Skills */}
                                {skills.length > 0 && (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                        {skills.map((s: string) => (
                                            <span key={s} style={{
                                                padding: '3px 8px', borderRadius: 4,
                                                background: '#27272a', color: '#a1a1aa', fontSize: 11,
                                            }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Bio */}
                                {vol?.bio && (
                                    <p style={{ fontSize: 13, lineHeight: 1.5, color: '#71717a', marginBottom: 12 }}>
                                        {vol.bio.slice(0, 150)}{vol.bio.length > 150 ? '...' : ''}
                                    </p>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {match.status === 'MUTUAL' && match.chatRoom ? (
                                        <button onClick={() => navigate(`/app/messages/${match.chatRoom.id}`)} style={{
                                            padding: '8px 20px', borderRadius: 8, border: 'none',
                                            background: '#10b981', color: '#09090b',
                                            fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                        }}>
                                            Chat
                                        </button>
                                    ) : match.status === 'MUTUAL' ? (
                                        <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                                            Matched
                                        </span>
                                    ) : match.status === 'ORG_ACCEPTED' ? (
                                        <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 500 }}>
                                            Accepted — waiting for mutual match
                                        </span>
                                    ) : match.status === 'REJECTED' ? (
                                        <span style={{ fontSize: 13, color: '#71717a', fontWeight: 500 }}>
                                            Passed
                                        </span>
                                    ) : match.status === 'PENDING' ? (
                                        <>
                                            <button
                                                onClick={() => handleOrgSwipe(vol.id, 'RIGHT')}
                                                disabled={swipingId !== null}
                                                style={{
                                                    padding: '8px 20px', borderRadius: 8, border: 'none',
                                                    background: '#10b981', color: '#09090b',
                                                    fontSize: 13, fontWeight: 600,
                                                    cursor: swipingId !== null ? 'not-allowed' : 'pointer',
                                                    opacity: swipingId === vol.id ? 0.6 : swipingId !== null ? 0.4 : 1,
                                                    transition: 'opacity 0.15s',
                                                }}
                                            >
                                                {swipingId === vol.id ? 'Accepting...' : 'Accept'}
                                            </button>
                                            <button
                                                onClick={() => handleOrgSwipe(vol.id, 'LEFT')}
                                                disabled={swipingId !== null}
                                                style={{
                                                    padding: '8px 20px', borderRadius: 8,
                                                    border: '1px solid #27272a', background: 'transparent',
                                                    color: '#71717a', fontSize: 13, fontWeight: 600,
                                                    cursor: swipingId !== null ? 'not-allowed' : 'pointer',
                                                    opacity: swipingId !== null ? 0.4 : 1,
                                                    transition: 'opacity 0.15s',
                                                }}
                                            >
                                                Pass
                                            </button>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Volunteer Profile Modal ────────────────────────────── */}
            {selectedVol && (
                <div
                    onClick={() => setSelectedVol(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 24,
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: '#18181b', borderRadius: 16,
                            border: '1px solid #27272a',
                            width: '100%', maxWidth: 480, maxHeight: '85vh',
                            overflow: 'auto', padding: '32px 28px',
                        }}
                    >
                        {/* Close */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                            <button
                                onClick={() => setSelectedVol(null)}
                                style={{
                                    background: 'none', border: 'none', color: '#71717a',
                                    fontSize: 20, cursor: 'pointer', padding: 4,
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Avatar + Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: '#27272a', border: '2px solid #10b981',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 28, fontWeight: 700, color: '#10b981', marginBottom: 12,
                            }}>
                                {selectedVol.fullName?.[0]?.toUpperCase() || 'V'}
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fafafa', marginBottom: 4 }}>
                                {selectedVol.fullName}
                            </h2>
                            <p style={{ fontSize: 13, color: '#71717a' }}>{selectedVol.user?.email}</p>
                            {selectedVol.matchScore != null && (
                                <span style={{
                                    marginTop: 8, padding: '4px 14px', borderRadius: 20,
                                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                                    color: '#10b981', fontSize: 13, fontWeight: 600,
                                }}>
                                    {Math.round(selectedVol.matchScore)}% match
                                </span>
                            )}
                        </div>

                        {/* Info sections */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Location */}
                            {selectedVol.location && (
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                        Location
                                    </div>
                                    <div style={{ fontSize: 14, color: '#a1a1aa' }}>{selectedVol.location}</div>
                                </div>
                            )}

                            {/* Bio */}
                            {selectedVol.bio && (
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                                        About
                                    </div>
                                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#a1a1aa', margin: 0 }}>
                                        {selectedVol.bio}
                                    </p>
                                </div>
                            )}

                            {/* Skills */}
                            {selectedVol.skills?.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                        Skills
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {selectedVol.skills.map((vs: any) => (
                                            <span key={vs.skill?.name || vs.name} style={{
                                                padding: '6px 14px', borderRadius: 20,
                                                background: '#27272a', color: '#fafafa',
                                                fontSize: 13, fontWeight: 500,
                                            }}>
                                                {vs.skill?.name || vs.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Availability */}
                            {selectedVol.availability?.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                        Availability
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {selectedVol.availability.map((a: string) => (
                                            <span key={a} style={{
                                                padding: '6px 14px', borderRadius: 20,
                                                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                                                color: '#10b981', fontSize: 13, fontWeight: 500,
                                                textTransform: 'capitalize',
                                            }}>
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Causes */}
                            {selectedVol.causes?.length > 0 && (
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                        Causes
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {selectedVol.causes.map((c: string) => (
                                            <span key={c} style={{
                                                padding: '6px 14px', borderRadius: 20,
                                                background: '#27272a', color: '#a1a1aa',
                                                fontSize: 13, fontWeight: 500,
                                            }}>
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
