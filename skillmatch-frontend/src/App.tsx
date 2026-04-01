import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/* ─── Pages ─────────────────────────────────────────────────────────────────── */
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';

/* ─── Layouts ───────────────────────────────────────────────────────────────── */
import AppLayout from './layouts/AppLayout';

/* ─── App Pages ─────────────────────────────────────────────────────────────── */
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';

/* ─── Mobile Wrapper Support ────────────────────────────────────────────────── */
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import AppSplashScreen from './components/AppSplashScreen';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateOpportunityPage from './pages/CreateOpportunityPage';
import OpportunityApplicantsPage from './pages/OpportunityApplicantsPage';

function AppIndex() {
    try {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const role = JSON.parse(atob(token.split('.')[1])).role;
            if (role === 'ORGANIZATION') return <Navigate to="/app/dashboard" replace />;
        }
    } catch {}
    return <Navigate to="/app/discover" replace />;
}

export default function App() {
    const isNative = Capacitor.isNativePlatform();

    React.useEffect(() => {
        if (isNative) {
            CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                if (canGoBack) {
                    window.history.back();
                } else {
                    CapacitorApp.exitApp();
                }
            });
        }
        return () => {
            if (isNative) {
                CapacitorApp.removeAllListeners();
            }
        };
    }, [isNative]);

    const [showSplash, setShowSplash] = React.useState(isNative); // Only show splash on native

    if (showSplash) {
        return <AppSplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* ── Public Routes ─────────────────────────────────────────── */}
                <Route path="/" element={isNative ? <Navigate to="/login" replace /> : <LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />

                {/* ── Authenticated Routes (wrapped in AppLayout) ──────────── */}
                <Route path="/app" element={<AppLayout />}>
                    <Route index element={<AppIndex />} />
                    <Route path="discover" element={<DiscoverPage />} />
                    <Route path="matches" element={<MatchesPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="messages/:roomId" element={<ChatPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="create-opportunity" element={<CreateOpportunityPage />} />
                    <Route path="opportunities/:id/applicants" element={<OpportunityApplicantsPage />} />
                </Route>

                {/* ── Fallback ──────────────────────────────────────────────── */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
