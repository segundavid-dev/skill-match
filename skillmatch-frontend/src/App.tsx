import React, { useState } from 'react';
import Logo from './components/Logo.tsx';
import BottomNav from './components/BottomNav.tsx';
import LandingPage from './pages/LandingPage.tsx';
import AuthModal from './pages/AuthModal.tsx';
import ProfileWizard from './pages/ProfileWizard.tsx';
import SwipeScreen from './pages/SwipeScreen.tsx';
import MatchesPage from './pages/MatchesPage.tsx';
import ChatInbox from './pages/ChatInbox.tsx';
import ChatPage from './pages/ChatPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import type { Opportunity, MatchItem } from './data/constants.ts';
import { apiClient } from './api/client.ts';
import { useEffect } from 'react';

type Screen = 'landing' | 'wizard' | 'app';
type TabId = 'swipe' | 'matches' | 'chat' | 'dashboard' | 'profile';

/*
 * App-level "router" — uses a simple screen state machine instead of
 * react-router-dom so the app works as a single deployable file with no
 * server-side routing config needed.
 *
 * screen values:
 *   'landing'  → public marketing page
 *   'wizard'   → volunteer profile creation (multi-step)
 *   'app'      → authenticated shell with bottom nav
 */
export default function App() {
    const [screen, setScreen] = useState<Screen>('landing');
    const [role, setRole] = useState<string | null>(null);
    const [showAuth, setShowAuth] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('swipe');
    const [chatMatch, setChatMatch] = useState<MatchItem | null>(null);
    const [darkMode, setDarkMode] = useState(false);
    const [backendStatus, setBackendStatus] = useState<string>('checking...');

    useEffect(() => {
        apiClient.get('/health')
            .then(data => setBackendStatus(data.status))
            .catch(err => setBackendStatus('error'));
    }, []);

    // ── Auth completion ────────────────────────────────────────────────────────
    const handleAuthComplete = (selectedRole: string) => {
        setRole(selectedRole);
        setShowAuth(false);
        // Volunteers go through onboarding wizard; nonprofits land on dashboard
        setScreen(selectedRole === 'nonprofit' ? 'app' : 'wizard');
    };

    // Handle match from SwipeScreen (Opportunity → MatchItem conversion)
    const handleSwipeMatch = (opp: Opportunity) => {
        setChatMatch({
            id: opp.id,
            name: opp.org,
            role: opp.role,
            avatar: opp.org.split(' ').map(w => w[0]).join('').slice(0, 2),
            color: opp.color,
            time: 'just now',
            lastMsg: 'You matched!',
        });
    };

    // ── Landing page ───────────────────────────────────────────────────────────
    if (screen === 'landing') {
        return (
            <>
                <LandingPage
                    onVolunteer={() => setShowAuth(true)}
                    onNonProfit={() => setShowAuth(true)}
                />
                {showAuth && (
                    <AuthModal
                        onClose={() => setShowAuth(false)}
                        onComplete={handleAuthComplete}
                    />
                )}
            </>
        );
    }

    // ── Volunteer onboarding wizard ────────────────────────────────────────────
    if (screen === 'wizard') {
        return <ProfileWizard onComplete={() => setScreen('app')} />;
    }

    // ── Full-screen chat (overlays the app shell) ──────────────────────────────
    if (chatMatch) {
        return <ChatPage match={chatMatch} onBack={() => setChatMatch(null)} />;
    }

    // ── Authenticated app shell ────────────────────────────────────────────────
    return (
        <div style={{
            minHeight: '100vh',
            background: darkMode ? '#0F172A' : '#F8FAFC',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            paddingBottom: 80,
        }}>
            {/* Top bar */}
            <div style={{
                background: darkMode ? '#1E293B' : 'white',
                borderBottom: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`,
                padding: '0 20px', height: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 50,
                boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
            }}>
                <Logo />
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: backendStatus === 'healthy' ? '#10B981' : '#EF4444' }}>
                        Backend: {backendStatus}
                    </span>
                    {/* Dark mode toggle */}
                    <button
                        onClick={() => setDarkMode((d) => !d)}
                        style={{
                            background: darkMode ? '#334155' : '#F1F5F9',
                            border: 'none', borderRadius: 10,
                            width: 36, height: 36, cursor: 'pointer',
                            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    {/* Avatar */}
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#10B981,#059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}>
                        A
                    </div>
                </div>
            </div>

            {/* Page content */}
            {activeTab === 'swipe' && (
                <SwipeScreen onMatch={handleSwipeMatch} />
            )}
            {activeTab === 'matches' && (
                <MatchesPage onOpenChat={(m) => setChatMatch(m)} />
            )}
            {activeTab === 'chat' && (
                <ChatInbox onOpenChat={(m) => setChatMatch(m)} />
            )}
            {activeTab === 'dashboard' && (
                <Dashboard role={role} />
            )}
            {activeTab === 'profile' && (
                <ProfilePage />
            )}

            {/* Bottom navigation */}
            <BottomNav active={activeTab} onNav={(id) => setActiveTab(id as TabId)} />
        </div>
    );
}
