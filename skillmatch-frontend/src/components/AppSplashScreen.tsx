import React, { useEffect, useState } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

interface AppSplashScreenProps {
    onFinish: () => void;
}

export default function AppSplashScreen({ onFinish }: AppSplashScreenProps) {
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            StatusBar.setStyle({ style: Style.Light });
            StatusBar.setBackgroundColor({ color: '#ffffff' });
        }

        // Mock a loading time before fading out
        const timer1 = setTimeout(() => {
            setOpacity(0);
        }, 1500);

        // Tell parent the splash is done once faded out
        const timer2 = setTimeout(() => {
            onFinish();
        }, 2000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [onFinish]);

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                opacity: opacity,
                transition: 'opacity 0.5s ease-in-out'
            }}
        >
            <img 
                src="/logo.jpg" 
                alt="SkillMatch Logo" 
                style={{
                    width: '150px',
                    height: 'auto',
                    borderRadius: '20px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}
            />
        </div>
    );
}
