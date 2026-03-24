/* ─────────────────────────────────────────────────────────────────────────────
 * Profile Page — User profile view & edit
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, volunteerApi } from '../api';
import type { User, VolunteerProfile } from '../types';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<VolunteerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authApi.me()
            .then(res => {
                setUser(res.data.data);
                if (res.data.data.role === 'VOLUNTEER') {
                    return volunteerApi.getMyProfile()
                        .then(p => setProfile(p.data.data))
                        .catch(() => {});
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) authApi.logout(refreshToken).catch(() => {});
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>Loading...</div>;
    }

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                    Profile
                </h1>
                <p style={{ fontSize: 14, color: '#71717a' }}>
                    Manage your account and preferences
                </p>
            </div>

            {/* Profile card */}
            <div style={{
                borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden', marginBottom: 24,
            }}>
                <div style={{
                    padding: '24px 20px',
                    background: '#18181b',
                    display: 'flex', alignItems: 'center', gap: 16,
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#27272a', border: '1px solid #3f3f46',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 700, color: '#10b981',
                    }}>
                        {profile?.fullName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#fafafa' }}>
                            {profile?.fullName || user?.email || 'User'}
                        </div>
                        <div style={{ fontSize: 13, color: '#71717a' }}>
                            {user?.email}
                        </div>
                        <div style={{
                            display: 'inline-block', marginTop: 4,
                            padding: '2px 8px', borderRadius: 4,
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981', fontSize: 12, fontWeight: 600,
                        }}>
                            {user?.role}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile details */}
            {profile && (
                <div style={{
                    borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden', marginBottom: 24,
                }}>
                    {[
                        { label: 'Bio', value: profile.bio || 'Not set' },
                        { label: 'Location', value: profile.location || 'Not set' },
                        { label: 'Availability', value: profile.availability?.join(', ') || 'Not set' },
                        { label: 'Causes', value: profile.causes?.join(', ') || 'Not set' },
                        { label: 'Impact Score', value: String(profile.impactScore) },
                    ].map((item, i) => (
                        <div key={item.label} style={{
                            padding: '16px 20px', background: '#18181b',
                            borderBottom: i < 4 ? '1px solid #27272a' : 'none',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 14, color: '#a1a1aa' }}>{item.label}</span>
                            <span style={{ fontSize: 14, color: '#fafafa', textAlign: 'right', maxWidth: '60%' }}>
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div style={{
                borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden',
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', padding: '16px 20px',
                        background: '#18181b', border: 'none',
                        color: '#ef4444', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f23'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#18181b'}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
