/* ─────────────────────────────────────────────────────────────────────────────
 * Onboarding Page — Initial profile setup for new users
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { volunteerApi } from '../api';
import type { CreateVolunteerProfilePayload, Availability } from '../types';

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<CreateVolunteerProfilePayload>({
        fullName: '',
        bio: '',
        location: '',
        availability: [],
        causes: [],
    });

    const handleCheckbox = (group: 'availability' | 'causes', value: string) => {
        setFormData(prev => {
            const current = (prev[group] || []) as string[];
            if (current.includes(value)) {
                return { ...prev, [group]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [group]: [...current, value] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await volunteerApi.createProfile(formData);
            navigate('/app/discover');
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

    return (
        <div style={{
            minHeight: '100vh',
            background: '#09090b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#fafafa',
        }}>
            <div style={{
                width: '100%', maxWidth: 560,
                background: '#18181b',
                border: '1px solid #27272a',
                borderRadius: 16,
                padding: '40px 32px',
            }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
                    Complete your profile
                </h1>
                <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 32 }}>
                    Help us match you with the right opportunities by providing a few details.
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
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            required
                            placeholder="e.g. Jane Doe"
                            style={{
                                width: '100%', padding: '12px 16px',
                                borderRadius: 8, border: '1px solid #27272a',
                                background: '#09090b', color: '#fafafa',
                                fontSize: 15, outline: 'none', transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Bio
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us a little about yourself and why you want to volunteer..."
                            rows={3}
                            style={{
                                width: '100%', padding: '12px 16px',
                                borderRadius: 8, border: '1px solid #27272a',
                                background: '#09090b', color: '#fafafa',
                                fontSize: 15, outline: 'none', transition: 'border-color 0.15s',
                                resize: 'vertical',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 12 }}>
                            Availability
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {availabilities.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleCheckbox('availability', opt.id)}
                                    style={{
                                        padding: '12px', borderRadius: 8, textAlign: 'center',
                                        border: `1px solid ${formData.availability?.includes(opt.id) ? '#10b981' : '#27272a'}`,
                                        background: formData.availability?.includes(opt.id) ? 'rgba(16, 185, 129, 0.06)' : '#09090b',
                                        color: formData.availability?.includes(opt.id) ? '#10b981' : '#a1a1aa',
                                        fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: 32 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 12 }}>
                            Causes you care about
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {popularCauses.map((cause) => (
                                <button
                                    key={cause}
                                    type="button"
                                    onClick={() => handleCheckbox('causes', cause)}
                                    style={{
                                        padding: '8px 16px', borderRadius: 50,
                                        border: `1px solid ${formData.causes?.includes(cause) ? '#10b981' : '#27272a'}`,
                                        background: formData.causes?.includes(cause) ? '#10b981' : '#09090b',
                                        color: formData.causes?.includes(cause) ? '#09090b' : '#a1a1aa',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                >
                                    {cause}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.fullName.trim()}
                        style={{
                            width: '100%', padding: '14px 0',
                            borderRadius: 8, border: 'none',
                            background: '#10b981', color: '#09090b',
                            fontSize: 15, fontWeight: 600, cursor: 'pointer',
                            opacity: (loading || !formData.fullName.trim()) ? 0.6 : 1,
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
}
