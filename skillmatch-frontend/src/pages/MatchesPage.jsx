import React, { useState } from 'react';
import { MATCHES } from '../data/constants';

const TABS = ['all', 'pending', 'accepted'];

export default function MatchesPage({ onOpenChat }) {
  const [tab, setTab] = useState('all');

  return (
    <div style={{ padding: '24px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0F172A', marginBottom: 4 }}>
        Your Matches
      </h2>
      <p style={{ color: '#64748B', marginBottom: 24 }}>{MATCHES.length} mutual connections</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', borderRadius: 50,
              border: `2px solid ${tab === t ? '#10B981' : '#E2E8F0'}`,
              background: tab === t ? '#ECFDF5' : 'white',
              color: tab === t ? '#059669' : '#64748B',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              textTransform: 'capitalize', transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Match cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MATCHES.map((m) => (
          <div
            key={m.id}
            onClick={() => onOpenChat(m)}
            style={{
              background: 'white', borderRadius: 16, padding: '16px 20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              transition: 'all 0.2s', border: '1.5px solid transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.border = '1.5px solid #A7F3D0')}
            onMouseLeave={(e) => (e.currentTarget.style.border = '1.5px solid transparent')}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: `linear-gradient(135deg,${m.color},${m.color}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 16,
            }}>
              {m.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 16 }}>{m.name}</span>
                <span style={{ color: '#94A3B8', fontSize: 12 }}>{m.time}</span>
              </div>
              <div style={{ color: '#059669', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{m.role}</div>
              <p style={{
                color: '#64748B', fontSize: 14,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {m.lastMsg}
              </p>
            </div>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
