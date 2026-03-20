import React from 'react';

interface NavItem {
    id: string;
    icon: string;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'swipe', icon: '🎯', label: 'Discover' },
    { id: 'matches', icon: '💚', label: 'Matches' },
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'profile', icon: '👤', label: 'Profile' },
];

interface BottomNavProps {
    active: string;
    onNav: (id: string) => void;
}

export default function BottomNav({ active, onNav }: BottomNavProps) {
    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                padding: '8px 0 20px',
                zIndex: 100,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
            }}
        >
            {NAV_ITEMS.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onNav(item.id)}
                    style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        padding: '6px 4px',
                    }}
                >
                    <span
                        style={{
                            fontSize: 22,
                            filter: active === item.id ? 'none' : 'grayscale(80%)',
                            transform: active === item.id ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 0.2s',
                            display: 'block',
                        }}
                    >
                        {item.icon}
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: active === item.id ? 700 : 500,
                            color: active === item.id ? '#10B981' : '#94A3B8',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                    >
                        {item.label}
                    </span>
                    {active === item.id && (
                        <div
                            style={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                background: '#10B981',
                            }}
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
