/* ─────────────────────────────────────────────────────────────────────────────
 * Profile Page — User profile view & edit
 * ──────────────────────────────────────────────────────────────────────────── */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, volunteerApi, orgApi } from '../api';
import type { User, VolunteerProfile, OrganizationProfile } from '../types';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [volProfile, setVolProfile] = useState<VolunteerProfile | null>(null);
    const [orgProfile, setOrgProfile] = useState<OrganizationProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authApi.me()
            .then(async res => {
                const u = res.data.data;
                setUser(u);
                if (u.role === 'VOLUNTEER') {
                    try { const p = await volunteerApi.getMyProfile(); setVolProfile(p.data.data); } catch {}
                } else if (u.role === 'ORGANIZATION') {
                    try { const p = await orgApi.getMyProfile(); setOrgProfile(p.data.data); } catch {}
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

    const displayName = volProfile?.fullName || orgProfile?.name || user?.email || 'User';
    const initial = displayName[0]?.toUpperCase() || 'U';

    const profileDetails = volProfile
        ? [
            { label: 'Bio', value: volProfile.bio || 'Not set' },
            { label: 'Location', value: volProfile.location || 'Not set' },
            { label: 'Availability', value: volProfile.availability?.join(', ') || 'Not set' },
            { label: 'Causes', value: volProfile.causes?.join(', ') || 'Not set' },
            { label: 'Impact Score', value: String(volProfile.impactScore) },
        ]
        : orgProfile
        ? [
            { label: 'Mission', value: orgProfile.mission || 'Not set' },
            { label: 'Website', value: orgProfile.website || 'Not set' },
            { label: 'Location', value: orgProfile.location || 'Not set' },
            { label: 'Focus Areas', value: orgProfile.causeTags?.join(', ') || 'Not set' },
            { label: 'Verified', value: orgProfile.verifiedBadge ? 'Yes' : 'No' },
        ]
        : [];

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
                    padding: '24px 20px', background: '#18181b',
                    display: 'flex', alignItems: 'center', gap: 16,
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#27272a', border: '1px solid #3f3f46',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 700, color: '#10b981',
                    }}>
                        {initial}
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#fafafa' }}>
                            {displayName}
                        </div>
                        <div style={{ fontSize: 13, color: '#71717a' }}>{user?.email}</div>
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
            {profileDetails.length > 0 && (
                <div style={{
                    borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden', marginBottom: 24,
                }}>
                    {profileDetails.map((item, i) => (
                        <div key={item.label} style={{
                            padding: '16px 20px', background: '#18181b',
                            borderBottom: i < profileDetails.length - 1 ? '1px solid #27272a' : 'none',
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
            <div style={{ borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%', padding: '16px 20px',
                        background: '#18181b', border: 'none',
                        color: '#ef4444', fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1f1f23'}
                    onMouseLeave={e => e.currentTarget.style.background = '#18181b'}
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
