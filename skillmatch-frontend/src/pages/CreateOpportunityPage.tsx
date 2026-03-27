import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunityApi } from '../api';
import { ratingApi } from '../api';
import type { LocationType, Skill } from '../types';

export default function CreateOpportunityPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        locationType: 'REMOTE' as LocationType,
        location: '',
        startDate: '',
        endDate: '',
        spotsNeeded: 1,
        impactMetric: '',
    });

    useEffect(() => {
        ratingApi.getSkills().then(res => setSkills(res.data.data)).catch(() => {});
    }, []);

    const toggleSkill = (id: string) => {
        setSelectedSkills(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await opportunityApi.create({
                ...form,
                spotsNeeded: Number(form.spotsNeeded),
                skillIds: selectedSkills,
                startDate: form.startDate || undefined,
                endDate: form.endDate || undefined,
                location: form.location || undefined,
                impactMetric: form.impactMetric || undefined,
            });
            navigate('/app/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create opportunity.');
        } finally {
            setLoading(false);
        }
    };

    const locationTypes: { value: LocationType; label: string }[] = [
        { value: 'REMOTE', label: 'Remote' },
        { value: 'IN_PERSON', label: 'In Person' },
        { value: 'HYBRID', label: 'Hybrid' },
    ];

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Post an Opportunity
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>
                    Describe the volunteer role you need filled
                </p>
            </div>

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
                {/* Title */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                        Title
                    </label>
                    <input
                        type="text" required value={form.title}
                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Frontend Developer for Education Platform"
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: 8,
                            border: '1px solid #27272a', background: '#18181b',
                            color: '#fafafa', fontSize: 15, outline: 'none',
                        }}
                    />
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                        Description
                    </label>
                    <textarea
                        required value={form.description}
                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Describe what the volunteer will be doing, expected commitment, etc."
                        rows={4}
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: 8,
                            border: '1px solid #27272a', background: '#18181b',
                            color: '#fafafa', fontSize: 15, outline: 'none', resize: 'vertical',
                        }}
                    />
                </div>

                {/* Location Type */}
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 10 }}>
                        Location Type
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        {locationTypes.map(lt => (
                            <button key={lt.value} type="button"
                                onClick={() => setForm(p => ({ ...p, locationType: lt.value }))}
                                style={{
                                    padding: '12px', borderRadius: 8, textAlign: 'center',
                                    border: `1px solid ${form.locationType === lt.value ? '#10b981' : '#27272a'}`,
                                    background: form.locationType === lt.value ? 'rgba(16,185,129,0.06)' : '#18181b',
                                    color: form.locationType === lt.value ? '#10b981' : '#a1a1aa',
                                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                }}
                            >
                                {lt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location (conditional) */}
                {form.locationType !== 'REMOTE' && (
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Location
                        </label>
                        <input
                            type="text" value={form.location}
                            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                            placeholder="e.g. Lagos, Nigeria"
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: 8,
                                border: '1px solid #27272a', background: '#18181b',
                                color: '#fafafa', fontSize: 15, outline: 'none',
                            }}
                        />
                    </div>
                )}

                {/* Spots & Impact */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Spots Needed
                        </label>
                        <input
                            type="number" min={1} required value={form.spotsNeeded}
                            onChange={e => setForm(p => ({ ...p, spotsNeeded: parseInt(e.target.value) || 1 }))}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: 8,
                                border: '1px solid #27272a', background: '#18181b',
                                color: '#fafafa', fontSize: 15, outline: 'none',
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Impact Metric
                        </label>
                        <input
                            type="text" value={form.impactMetric}
                            onChange={e => setForm(p => ({ ...p, impactMetric: e.target.value }))}
                            placeholder="e.g. 500 students"
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: 8,
                                border: '1px solid #27272a', background: '#18181b',
                                color: '#fafafa', fontSize: 15, outline: 'none',
                            }}
                        />
                    </div>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            Start Date
                        </label>
                        <input
                            type="date" value={form.startDate}
                            onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: 8,
                                border: '1px solid #27272a', background: '#18181b',
                                color: '#fafafa', fontSize: 15, outline: 'none',
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 8 }}>
                            End Date
                        </label>
                        <input
                            type="date" value={form.endDate}
                            onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: 8,
                                border: '1px solid #27272a', background: '#18181b',
                                color: '#fafafa', fontSize: 15, outline: 'none',
                            }}
                        />
                    </div>
                </div>

                {/* Required Skills */}
                <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#a1a1aa', marginBottom: 12 }}>
                        Required Skills
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {skills.map(skill => (
                            <button key={skill.id} type="button"
                                onClick={() => toggleSkill(skill.id)}
                                style={{
                                    padding: '8px 16px', borderRadius: 50,
                                    border: `1px solid ${selectedSkills.includes(skill.id) ? '#10b981' : '#27272a'}`,
                                    background: selectedSkills.includes(skill.id) ? '#10b981' : '#18181b',
                                    color: selectedSkills.includes(skill.id) ? '#09090b' : '#a1a1aa',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                }}
                            >
                                {skill.name}
                            </button>
                        ))}
                    </div>
                </div>

                <button type="submit" disabled={loading} style={{
                    width: '100%', padding: '14px 0', borderRadius: 8, border: 'none',
                    background: '#10b981', color: '#09090b', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
                }}>
                    {loading ? 'Creating...' : 'Post Opportunity'}
                </button>
            </form>
        </div>
    );
}
