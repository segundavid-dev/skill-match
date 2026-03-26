/* ─────────────────────────────────────────────────────────────────────────────
 * Onboarding Page — Profile setup for both Volunteers and Organizations
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { volunteerApi, orgApi } from '../api';
import { ratingApi } from '../api/dashboard';
import type { CreateVolunteerProfilePayload, CreateOrgProfilePayload, Availability, Skill, Role } from '../types';

function getRoleFromToken(): Role {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return 'VOLUNTEER';
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || 'VOLUNTEER';
    } catch {
        return 'VOLUNTEER';
    }
}

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [role] = useState<Role>(getRoleFromToken);

    // Volunteer form
    const [volForm, setVolForm] = useState<CreateVolunteerProfilePayload>({
        fullName: '',
        bio: '',
        location: '',
        availability: [],
        causes: [],
        skillIds: [],
    });

    // Org form
    const [orgForm, setOrgForm] = useState<CreateOrgProfilePayload>({
        name: '',
        mission: '',
        website: '',
        location: '',
        causeTags: [],
    });

    // Skills for picker
    const [allSkills, setAllSkills] = useState<Skill[]>([]);

    useEffect(() => {
        if (role === 'VOLUNTEER') {
            ratingApi.getSkills().then(res => {
                setAllSkills(res.data.data || []);
            }).catch(() => {});
        }
    }, [role]);

    const handleCheckbox = (group: 'availability' | 'causes', value: string) => {
        setVolForm(prev => {
            const current = (prev[group] || []) as string[];
            return {
                ...prev,
                [group]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
            };
        });
    };

    const toggleSkill = (skillId: string) => {
        setVolForm(prev => {
            const ids = prev.skillIds || [];
            return {
                ...prev,
                skillIds: ids.includes(skillId) ? ids.filter(id => id !== skillId) : [...ids, skillId],
            };
        });
    };

    const toggleCauseTag = (tag: string) => {
        setOrgForm(prev => {
            const tags = prev.causeTags || [];
            return {
                ...prev,
                causeTags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag],
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (role === 'VOLUNTEER') {
                await volunteerApi.createProfile(volForm);
                navigate('/app/discover');
            } else {
                await orgApi.createProfile(orgForm);
                navigate('/app/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const availabilities: { id: Availability; label: string }[] = [
        { id: 'weekdays', label: 'Weekdays' },
        { id: 'weekends', label: 'Weekends' },
        { id: 'evenings', label: 'Evenings' },
        { id: 'flexible', label: 'Flexible' },
    ];

    const popularCauses = [
        'Education', 'Environment', 'Healthcare', 'Poverty',
        'Animal Welfare', 'Human Rights', 'Arts & Culture',
    ];

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px 16px',
        borderRadius: 8, border: '1px solid #27272a',
        background: '#09090b', color: '#fafafa',
        fontSize: 15, outline: 'none', transition: 'border-color 0.15s',
    };

    const isValid = role === 'VOLUNTEER' ? volForm.fullName.trim() : orgForm.name.trim();

    return (
        <div style={{
            minHeight: '100vh', background: '#09090b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, color: '#fafafa',
        }}>
            <div style={{
                width: '100%', maxWidth: 560,
                background: '#18181b', border: '1px solid #27272a',
                borderRadius: 16, padding: '40px 32px',
            }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
                    {role === 'VOLUNTEER' ? 'Complete your profile' : 'Set up your organization'}
                </h1>
                <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 32 }}>
                    {role === 'VOLUNTEER'
                        ? 'Help us match you with the right opportunities by providing a few details.'
                        : 'Tell volunteers about your organization so they can find you.'}
                </p>

                {error && (
                    <div style={{
                        padding: '12px 16px', borderRadius: 8,
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#f87171', fontSize: 14, marginBottom: 24,
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {role === 'VOLUNTEER' ? (
                        <>
                            {/* Full Name */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                    Full Name
                                </label>
                                <input
                                    type="text" value={volForm.fullName} required placeholder="e.g. Jane Doe"
                                    onChange={e => setVolForm(p => ({ ...p, fullName: e.target.value }))}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#27272a'}
                                />
                            </div>

                            {/* Bio */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                    Bio
                                </label>
                                <textarea
                                    value={volForm.bio || ''} placeholder="Tell us about yourself..." rows={3}
                                    onChange={e => setVolForm(p => ({ ...p, bio: e.target.value }))}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#27272a'}
                                />
                            </div>

                            {/* Location */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                    Location
                                </label>
                                <input
                                    type="text" value={volForm.location || ''} placeholder="e.g. Lagos, Nigeria"
                                    onChange={e => setVolForm(p => ({ ...p, location: e.target.value }))}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#27272a'}
                                />
                            </div>

                            {/* Skills */}
                            {allSkills.length > 0 && (
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 12 }}>
                                        Your Skills
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {allSkills.map(skill => {
                                            const selected = volForm.skillIds?.includes(skill.id);
                                            return (
                                                <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                                                    style={{
                                                        padding: '8px 16px', borderRadius: 50,
                                                        border: `1px solid ${selected ? '#10b981' : '#27272a'}`,
                                                        background: selected ? '#10b981' : '#09090b',
                                                        color: selected ? '#09090b' : '#a1a1aa',
                                                        fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                                    }}
                                                >
                                                    {skill.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Availability */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 12 }}>
                                    Availability
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    {availabilities.map(opt => (
                                        <button key={opt.id} type="button" onClick={() => handleCheckbox('availability', opt.id)}
                                            style={{
                                                padding: '12px', borderRadius: 8, textAlign: 'center',
                                                border: `1px solid ${volForm.availability?.includes(opt.id) ? '#10b981' : '#27272a'}`,
                                                background: volForm.availability?.includes(opt.id) ? 'rgba(16, 185, 129, 0.06)' : '#09090b',
                                                color: volForm.availability?.includes(opt.id) ? '#10b981' : '#a1a1aa',
                                                fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Causes */}
                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 12 }}>
                                    Causes you care about
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {popularCauses.map(cause => (
                                        <button key={cause} type="button" onClick={() => handleCheckbox('causes', cause)}
                                            style={{
                                                padding: '8px 16px', borderRadius: 50,
                                                border: `1px solid ${volForm.causes?.includes(cause) ? '#10b981' : '#27272a'}`,
                                                background: volForm.causes?.includes(cause) ? '#10b981' : '#09090b',
                                                color: volForm.causes?.includes(cause) ? '#09090b' : '#a1a1aa',
                                                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                        >
                                            {cause}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Org Name */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                    Organization Name
                                </label>
                                <input
                                    type="text" value={orgForm.name} required placeholder="e.g. Green Earth Foundation"
                                    onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#27272a'}
                                />
                            </div>

                            {/* Mission */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                    Mission Statement
                                </label>
                                <textarea
                                    value={orgForm.mission || ''} placeholder="What does your organization do?" rows={3}
                                    onChange={e => setOrgForm(p => ({ ...p, mission: e.target.value }))}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#27272a'}
                                />
                            </div>

                            {/* Website */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                    Website
                                </label>
                                <input
                                    type="url" value={orgForm.website || ''} placeholder="https://yourorg.com"
                                    onChange={e => setOrgForm(p => ({ ...p, website: e.target.value }))}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#27272a'}
                                />
                            </div>

                            {/* Location */}
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                                    Location
                                </label>
                                <input
                                    type="text" value={orgForm.location || ''} placeholder="e.g. Lagos, Nigeria"
                                    onChange={e => setOrgForm(p => ({ ...p, location: e.target.value }))}
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#27272a'}
                                />
                            </div>

                            {/* Cause Tags */}
                            <div style={{ marginBottom: 32 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 12 }}>
                                    Focus Areas
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {popularCauses.map(cause => (
                                        <button key={cause} type="button" onClick={() => toggleCauseTag(cause)}
                                            style={{
                                                padding: '8px 16px', borderRadius: 50,
                                                border: `1px solid ${orgForm.causeTags?.includes(cause) ? '#10b981' : '#27272a'}`,
                                                background: orgForm.causeTags?.includes(cause) ? '#10b981' : '#09090b',
                                                color: orgForm.causeTags?.includes(cause) ? '#09090b' : '#a1a1aa',
                                                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                        >
                                            {cause}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit" disabled={loading || !isValid}
                        style={{
                            width: '100%', padding: '14px 0',
                            borderRadius: 8, border: 'none',
                            background: '#10b981', color: '#09090b',
                            fontSize: 15, fontWeight: 600, cursor: 'pointer',
                            opacity: (loading || !isValid) ? 0.6 : 1, transition: 'all 0.2s',
                        }}
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
}
