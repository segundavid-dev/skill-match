import React, { useState, useEffect, useRef } from 'react';

interface LandingPageProps {
    onVolunteer: () => void;
    onNonProfit: () => void;
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const STATS: { value: string; label: string }[] = [
    { value: '12,450+', label: 'Active Volunteers' },
    { value: '890', label: 'Partner Organizations' },
    { value: '94%', label: 'Successful Match Rate' },
    { value: '47K+', label: 'Lives Impacted' },
];

const PROCESS_STEPS = [
    {
        step: '01',
        title: 'Build Your Profile',
        desc: 'Define your skills, interests, and availability. Our system understands what you bring to the table.',
    },
    {
        step: '02',
        title: 'Discover Opportunities',
        desc: 'Browse curated volunteer roles matched to your profile. Filter by cause, location, and commitment level.',
    },
    {
        step: '03',
        title: 'Connect & Contribute',
        desc: 'Apply directly, get confirmed, and start making a measurable difference in your community.',
    },
];

const FEATURES = [
    {
        title: 'Smart Matching',
        desc: 'Our algorithm pairs your skills with the organizations that need them most — not random listings, real alignment.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                <path d="m8 11h6" />
                <path d="m11 8v6" />
            </svg>
        ),
    },
    {
        title: 'Real-Time Chat',
        desc: 'Communicate directly with organizations. No middlemen, no delays — just clear, efficient coordination.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
    {
        title: 'Impact Tracking',
        desc: 'See the real-world outcome of your contributions. Hours logged, projects completed, communities served.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
    },
    {
        title: 'For Organizations',
        desc: 'Post opportunities, review applicants, and manage your volunteer workforce — all from one dashboard.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
            </svg>
        ),
    },
];

const TESTIMONIALS = [
    {
        name: 'Amara Osei',
        role: 'Frontend Developer',
        org: 'Green Earth Foundation',
        text: 'Found my match in 2 days. Now I\'m building tools that track deforestation across three continents.',
    },
    {
        name: 'Fatima Al-Hassan',
        role: 'Visual Designer',
        org: 'Health Bridge NGO',
        text: 'SkillMatch made it effortless. My health awareness designs have reached over 50,000 people in rural communities.',
    },
    {
        name: 'Chidi Nwosu',
        role: 'STEM Educator',
        org: 'Bright Minds Academy',
        text: 'I\'ve mentored 12 students this month alone. The matching process was seamless and the impact is tangible.',
    },
];

/* ─── Animated counter hook ─────────────────────────────────────────────────── */

function useCountUp(target: string, duration = 1800, shouldStart = false) {
    const [display, setDisplay] = useState(target);
    const numericMatch = target.match(/^([\d,]+)/);

    useEffect(() => {
        if (!shouldStart || !numericMatch) return;
        const end = parseInt(numericMatch[1].replace(/,/g, ''), 10);
        const suffix = target.replace(numericMatch[1], '');
        const startTime = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * end);
            setDisplay(current.toLocaleString() + suffix);
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [shouldStart]);

    return display;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export default function LandingPage({ onVolunteer, onNonProfit }: LandingPageProps) {
    const [tIdx, setTIdx] = useState(0);
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);

    /* Auto-rotate testimonials */
    useEffect(() => {
        const t = setInterval(() => setTIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
        return () => clearInterval(t);
    }, []);

    /* Observe stats section */
    useEffect(() => {
        if (!statsRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.3 }
        );
        observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="sm-landing" style={{ minHeight: '100vh', background: '#09090b', color: '#fafafa' }}>
            <style>{`
                /* ─── Design tokens ─────────────────────────────────────────── */
                :root {
                    --sm-bg: #09090b;
                    --sm-surface: #18181b;
                    --sm-border: #27272a;
                    --sm-border-subtle: #1f1f23;
                    --sm-text: #fafafa;
                    --sm-text-secondary: #a1a1aa;
                    --sm-text-muted: #71717a;
                    --sm-accent: #10b981;
                    --sm-accent-hover: #34d399;
                    --sm-accent-subtle: rgba(16, 185, 129, 0.08);
                    --sm-accent-border: rgba(16, 185, 129, 0.2);
                    --sm-radius: 8px;
                    --sm-radius-lg: 12px;
                    --sm-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .sm-landing * { box-sizing: border-box; }

                /* ─── Animations ───────────────────────────────────────────── */
                @keyframes sm-fade-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes sm-fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes sm-glow-pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.7; }
                }
                @keyframes sm-line-grow {
                    from { transform: scaleY(0); }
                    to { transform: scaleY(1); }
                }
                @keyframes sm-grid-fade {
                    from { opacity: 0; }
                    to { opacity: 0.03; }
                }

                .sm-fade-up { animation: sm-fade-up 0.8s ease both; }
                .sm-fade-up-1 { animation: sm-fade-up 0.8s ease 0.1s both; }
                .sm-fade-up-2 { animation: sm-fade-up 0.8s ease 0.2s both; }
                .sm-fade-up-3 { animation: sm-fade-up 0.8s ease 0.3s both; }
                .sm-fade-up-4 { animation: sm-fade-up 0.8s ease 0.4s both; }

                /* ─── Button styles ────────────────────────────────────────── */
                .sm-btn {
                    font-family: var(--sm-font);
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }
                .sm-btn-primary {
                    padding: 12px 28px;
                    border-radius: var(--sm-radius);
                    background: var(--sm-accent);
                    color: #09090b;
                }
                .sm-btn-primary:hover {
                    background: var(--sm-accent-hover);
                    box-shadow: 0 0 24px rgba(16, 185, 129, 0.25);
                }
                .sm-btn-secondary {
                    padding: 12px 28px;
                    border-radius: var(--sm-radius);
                    background: transparent;
                    color: var(--sm-text);
                    border: 1px solid var(--sm-border);
                }
                .sm-btn-secondary:hover {
                    background: var(--sm-surface);
                    border-color: var(--sm-text-muted);
                }
                .sm-btn-ghost {
                    padding: 8px 16px;
                    border-radius: var(--sm-radius);
                    background: transparent;
                    color: var(--sm-text-secondary);
                }
                .sm-btn-ghost:hover {
                    color: var(--sm-text);
                    background: var(--sm-surface);
                }

                /* ─── Nav ──────────────────────────────────────────────────── */
                .sm-nav {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    background: rgba(9, 9, 11, 0.8);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid var(--sm-border-subtle);
                }
                .sm-nav-links {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .sm-nav-link {
                    font-family: var(--sm-font);
                    font-size: 14px;
                    color: var(--sm-text-secondary);
                    padding: 8px 14px;
                    border-radius: 6px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: color 0.15s;
                }
                .sm-nav-link:hover { color: var(--sm-text); }
                .sm-nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                /* ─── Section layout ──────────────────────────────────────── */
                .sm-section {
                    max-width: 1120px;
                    margin: 0 auto;
                    padding: 0 32px;
                }
                .sm-section-header {
                    margin-bottom: 56px;
                }
                .sm-label {
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: var(--sm-accent);
                    margin-bottom: 16px;
                }
                .sm-heading {
                    font-family: var(--sm-font);
                    font-weight: 700;
                    letter-spacing: -0.03em;
                    line-height: 1.15;
                    color: var(--sm-text);
                }
                .sm-heading-xl {
                    font-size: clamp(40px, 6vw, 72px);
                }
                .sm-heading-lg {
                    font-size: clamp(28px, 4vw, 44px);
                }
                .sm-subtext {
                    font-size: 17px;
                    line-height: 1.7;
                    color: var(--sm-text-secondary);
                    max-width: 540px;
                }
                .sm-divider {
                    height: 1px;
                    background: var(--sm-border);
                    border: none;
                    margin: 0;
                }

                /* ─── Responsive ──────────────────────────────────────────── */
                @media (max-width: 768px) {
                    .sm-nav { padding: 0 16px; }
                    .sm-nav-links { display: none; }
                    .sm-section { padding: 0 20px; }
                    .sm-hero-buttons { flex-direction: column; align-items: stretch; }
                    .sm-hero-buttons .sm-btn { justify-content: center; }
                    .sm-features-grid { grid-template-columns: 1fr !important; }
                    .sm-process-grid { grid-template-columns: 1fr !important; }
                    .sm-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .sm-footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
                }
            `}</style>

            {/* ══════════════════════════════════════════════════════════════════
                NAVIGATION
            ═══════════════════════════════════════════════════════════════════ */}
            <nav className="sm-nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    {/* Logo */}
                    <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <img
                            src="/logo.jpg"
                            alt="SkillMatch"
                            style={{ width: 32, height: 32, borderRadius: 8 }}
                        />
                        <span style={{
                            fontFamily: 'var(--sm-font)',
                            fontWeight: 700,
                            fontSize: 18,
                            color: 'var(--sm-text)',
                            letterSpacing: '-0.02em',
                        }}>
                            SkillMatch
                        </span>
                    </a>
                    <div className="sm-nav-links">
                        <button className="sm-nav-link">Features</button>
                        <button className="sm-nav-link">How It Works</button>
                        <button className="sm-nav-link">For Organizations</button>
                    </div>
                </div>
                <div className="sm-nav-actions">
                    <button className="sm-btn sm-btn-ghost" onClick={onVolunteer}>Sign In</button>
                    <button className="sm-btn sm-btn-primary" onClick={onVolunteer}>Get Started</button>
                </div>
            </nav>

            {/* ══════════════════════════════════════════════════════════════════
                HERO
            ═══════════════════════════════════════════════════════════════════ */}
            <section style={{
                padding: '120px 0 100px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Grid background */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `
                        linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '64px 64px',
                    animation: 'sm-grid-fade 1.5s ease both',
                }} />

                {/* Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 800,
                    height: 600,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="sm-section" style={{ position: 'relative' }}>
                    {/* Status badge */}
                    <div className="sm-fade-up" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--sm-accent-subtle)',
                        border: '1px solid var(--sm-accent-border)',
                        borderRadius: 50,
                        padding: '6px 16px',
                        marginBottom: 32,
                    }}>
                        <span style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--sm-accent)',
                            display: 'inline-block',
                            animation: 'sm-glow-pulse 2s ease infinite',
                        }} />
                        <span style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: 'var(--sm-text-secondary)',
                        }}>
                            12,450 volunteers matched and counting
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="sm-heading sm-heading-xl sm-fade-up-1" style={{
                        marginBottom: 24,
                        maxWidth: 720,
                    }}>
                        Your skills deserve<br />
                        <span style={{ color: 'var(--sm-accent)' }}>real impact.</span>
                    </h1>

                    {/* Subtext */}
                    <p className="sm-subtext sm-fade-up-2" style={{
                        marginBottom: 48,
                        fontSize: 18,
                        maxWidth: 560,
                    }}>
                        SkillMatch connects volunteers with organizations that need their exact expertise. 
                        No noise — just meaningful, verified opportunities.
                    </p>

                    {/* Action buttons */}
                    <div className="sm-hero-buttons sm-fade-up-3" style={{ display: 'flex', gap: 12, marginBottom: 80 }}>
                        <button className="sm-btn sm-btn-primary" onClick={onVolunteer} style={{ padding: '14px 32px', fontSize: 15 }}>
                            Start Volunteering
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                            </svg>
                        </button>
                        <button className="sm-btn sm-btn-secondary" onClick={onNonProfit} style={{ padding: '14px 32px', fontSize: 15 }}>
                            Post Opportunities
                        </button>
                    </div>

                    {/* Trusted by logos / social proof */}
                    <div className="sm-fade-up-4" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex' }}>
                            {['AO', 'FA', 'CN', 'KJ', 'RM'].map((initials, i) => (
                                <div key={i} style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: `hsl(${160 + i * 20}, 60%, ${30 + i * 5}%)`,
                                    border: '2px solid var(--sm-bg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#fff',
                                    marginLeft: i > 0 ? -8 : 0,
                                }}>
                                    {initials}
                                </div>
                            ))}
                        </div>
                        <span style={{ fontSize: 14, color: 'var(--sm-text-muted)' }}>
                            Trusted by <strong style={{ color: 'var(--sm-text-secondary)' }}>890+</strong> organizations worldwide
                        </span>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════════
                STATS BAR
            ═══════════════════════════════════════════════════════════════════ */}
            <section ref={statsRef} style={{ borderTop: '1px solid var(--sm-border)', borderBottom: '1px solid var(--sm-border)' }}>
                <div className="sm-section">
                    <div className="sm-stats-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 0,
                    }}>
                        {STATS.map((stat, i) => (
                            <StatCell key={stat.label} stat={stat} index={i} visible={statsVisible} total={STATS.length} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════════
                FEATURES
            ═══════════════════════════════════════════════════════════════════ */}
            <section style={{ padding: '120px 0' }}>
                <div className="sm-section">
                    <div className="sm-section-header">
                        <p className="sm-label">Platform</p>
                        <h2 className="sm-heading sm-heading-lg" style={{ marginBottom: 16 }}>
                            Everything you need to<br />make a difference
                        </h2>
                        <p className="sm-subtext">
                            Built for both volunteers and organizations. One platform, complete workflow.
                        </p>
                    </div>

                    <div className="sm-features-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 1,
                        background: 'var(--sm-border)',
                        borderRadius: 'var(--sm-radius-lg)',
                        overflow: 'hidden',
                    }}>
                        {FEATURES.map((feature) => (
                            <div key={feature.title} style={{
                                padding: 40,
                                background: 'var(--sm-bg)',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sm-surface)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--sm-bg)'; }}
                            >
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 'var(--sm-radius)',
                                    border: '1px solid var(--sm-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--sm-accent)',
                                    marginBottom: 20,
                                }}>
                                    {feature.icon}
                                </div>
                                <h3 style={{
                                    fontFamily: 'var(--sm-font)',
                                    fontWeight: 600,
                                    fontSize: 18,
                                    color: 'var(--sm-text)',
                                    marginBottom: 8,
                                    letterSpacing: '-0.01em',
                                }}>
                                    {feature.title}
                                </h3>
                                <p style={{
                                    fontSize: 15,
                                    lineHeight: 1.7,
                                    color: 'var(--sm-text-muted)',
                                    margin: 0,
                                }}>
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="sm-divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

            {/* ══════════════════════════════════════════════════════════════════
                HOW IT WORKS
            ═══════════════════════════════════════════════════════════════════ */}
            <section style={{ padding: '120px 0' }}>
                <div className="sm-section">
                    <div className="sm-section-header">
                        <p className="sm-label">Process</p>
                        <h2 className="sm-heading sm-heading-lg" style={{ marginBottom: 16 }}>
                            Three steps to impact
                        </h2>
                        <p className="sm-subtext">
                            Get matched in minutes, not months. No overhead, no gatekeeping.
                        </p>
                    </div>

                    <div className="sm-process-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 32,
                    }}>
                        {PROCESS_STEPS.map((step) => (
                            <div key={step.step} style={{
                                position: 'relative',
                                padding: '32px 0',
                            }}>
                                <span style={{
                                    display: 'block',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    fontFamily: 'var(--sm-font)',
                                    color: 'var(--sm-accent)',
                                    marginBottom: 16,
                                    letterSpacing: '0.1em',
                                }}>
                                    STEP {step.step}
                                </span>
                                <div style={{
                                    width: '100%',
                                    height: 1,
                                    background: 'var(--sm-border)',
                                    marginBottom: 24,
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: -3,
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        background: 'var(--sm-accent)',
                                    }} />
                                </div>
                                <h3 style={{
                                    fontFamily: 'var(--sm-font)',
                                    fontWeight: 600,
                                    fontSize: 20,
                                    color: 'var(--sm-text)',
                                    marginBottom: 12,
                                    letterSpacing: '-0.01em',
                                }}>
                                    {step.title}
                                </h3>
                                <p style={{
                                    fontSize: 15,
                                    lineHeight: 1.7,
                                    color: 'var(--sm-text-muted)',
                                    margin: 0,
                                }}>
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <hr className="sm-divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

            {/* ══════════════════════════════════════════════════════════════════
                TESTIMONIALS
            ═══════════════════════════════════════════════════════════════════ */}
            <section style={{ padding: '120px 0' }}>
                <div className="sm-section">
                    <div className="sm-section-header">
                        <p className="sm-label">Community</p>
                        <h2 className="sm-heading sm-heading-lg" style={{ marginBottom: 16 }}>
                            Real people, real results
                        </h2>
                        <p className="sm-subtext">
                            Hear from volunteers who found their purpose through SkillMatch.
                        </p>
                    </div>

                    <div style={{
                        position: 'relative',
                        minHeight: 220,
                        maxWidth: 640,
                    }}>
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} style={{
                                position: i === 0 ? 'relative' : 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                opacity: i === tIdx ? 1 : 0,
                                transform: `translateY(${i === tIdx ? 0 : 12}px)`,
                                transition: 'all 0.5s ease',
                                pointerEvents: i === tIdx ? 'auto' : 'none',
                            }}>
                                {/* Quote mark */}
                                <div style={{
                                    fontSize: 48,
                                    lineHeight: 1,
                                    color: 'var(--sm-accent)',
                                    opacity: 0.3,
                                    marginBottom: 16,
                                    fontFamily: 'Georgia, serif',
                                }}>"</div>

                                <p style={{
                                    fontSize: 20,
                                    lineHeight: 1.7,
                                    color: 'var(--sm-text)',
                                    fontWeight: 400,
                                    marginBottom: 32,
                                    letterSpacing: '-0.01em',
                                }}>
                                    {t.text}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'var(--sm-surface)',
                                        border: '1px solid var(--sm-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: 'var(--sm-accent)',
                                    }}>
                                        {t.name.split(' ').map(w => w[0]).join('')}
                                    </div>
                                    <div>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: 15,
                                            color: 'var(--sm-text)',
                                        }}>
                                            {t.name}
                                        </div>
                                        <div style={{
                                            fontSize: 13,
                                            color: 'var(--sm-text-muted)',
                                        }}>
                                            {t.role} at {t.org}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dots */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 48 }}>
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setTIdx(i)}
                                style={{
                                    width: i === tIdx ? 24 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    border: 'none',
                                    background: i === tIdx ? 'var(--sm-accent)' : 'var(--sm-border)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                                aria-label={`View testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <hr className="sm-divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

            {/* ══════════════════════════════════════════════════════════════════
                CTA
            ═══════════════════════════════════════════════════════════════════ */}
            <section style={{ padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
                {/* CTA Glow */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="sm-section" style={{ position: 'relative', textAlign: 'center' }}>
                    <h2 className="sm-heading sm-heading-lg" style={{
                        marginBottom: 16,
                        maxWidth: 600,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}>
                        Ready to put your skills to work?
                    </h2>
                    <p className="sm-subtext" style={{
                        marginBottom: 48,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        textAlign: 'center',
                    }}>
                        Join thousands of volunteers and organizations already making measurable impact through SkillMatch.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="sm-btn sm-btn-primary" onClick={onVolunteer} style={{ padding: '16px 40px', fontSize: 16 }}>
                            Start Matching — Free
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                            </svg>
                        </button>
                        <button className="sm-btn sm-btn-secondary" onClick={onNonProfit} style={{ padding: '16px 40px', fontSize: 16 }}>
                            List Your Organization
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════════════════════════════ */}
            <footer style={{ borderTop: '1px solid var(--sm-border)' }}>
                <div className="sm-section" style={{ padding: '64px 32px 32px' }}>
                    <div className="sm-footer-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr',
                        gap: 64,
                        marginBottom: 48,
                    }}>
                        {/* Brand */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <img src="/logo.jpg" alt="SkillMatch" style={{ width: 28, height: 28, borderRadius: 6 }} />
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: 16,
                                    color: 'var(--sm-text)',
                                    letterSpacing: '-0.02em',
                                }}>
                                    SkillMatch
                                </span>
                            </div>
                            <p style={{
                                fontSize: 14,
                                lineHeight: 1.6,
                                color: 'var(--sm-text-muted)',
                                maxWidth: 280,
                            }}>
                                Connecting skills to causes that matter. Built for impact, designed for people.
                            </p>
                        </div>

                        {/* Links */}
                        {[
                            {
                                heading: 'Product',
                                links: ['Features', 'How It Works', 'Pricing', 'API'],
                            },
                            {
                                heading: 'Company',
                                links: ['About', 'Blog', 'Careers', 'Contact'],
                            },
                            {
                                heading: 'Legal',
                                links: ['Privacy', 'Terms', 'Security'],
                            },
                        ].map((col) => (
                            <div key={col.heading}>
                                <p style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'var(--sm-text)',
                                    marginBottom: 16,
                                    letterSpacing: '0.02em',
                                }}>
                                    {col.heading}
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {col.links.map((link) => (
                                        <li key={link} style={{ marginBottom: 10 }}>
                                            <a href="#" style={{
                                                fontSize: 14,
                                                color: 'var(--sm-text-muted)',
                                                textDecoration: 'none',
                                                transition: 'color 0.15s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--sm-text)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sm-text-muted)'; }}
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div style={{
                        borderTop: '1px solid var(--sm-border)',
                        paddingTop: 24,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 16,
                    }}>
                        <span style={{ fontSize: 13, color: 'var(--sm-text-muted)' }}>
                            &copy; {new Date().getFullYear()} SkillMatch. All rights reserved.
                        </span>
                        <div style={{ display: 'flex', gap: 20 }}>
                            {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                                <a key={social} href="#" style={{
                                    fontSize: 13,
                                    color: 'var(--sm-text-muted)',
                                    textDecoration: 'none',
                                    transition: 'color 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--sm-text)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--sm-text-muted)'; }}
                                >
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ─── Stat Cell subcomponent ────────────────────────────────────────────────── */

function StatCell({ stat, index, visible, total }: {
    stat: { value: string; label: string };
    index: number;
    visible: boolean;
    total: number;
}) {
    const count = useCountUp(stat.value, 1800, visible);

    return (
        <div style={{
            padding: '40px 32px',
            textAlign: 'center',
            borderRight: index < total - 1 ? '1px solid var(--sm-border)' : 'none',
        }}>
            <div style={{
                fontFamily: 'var(--sm-font)',
                fontWeight: 700,
                fontSize: 32,
                color: 'var(--sm-text)',
                letterSpacing: '-0.03em',
                marginBottom: 4,
            }}>
                {count}
            </div>
            <div style={{
                fontSize: 14,
                color: 'var(--sm-text-muted)',
            }}>
                {stat.label}
            </div>
        </div>
    );
}
