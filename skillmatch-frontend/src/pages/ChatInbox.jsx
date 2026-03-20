import React from 'react';
import { MATCHES } from '../data/constants';

export default function ChatInbox({ onOpenChat }) {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 640, margin: '0 auto', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0F172A', marginBottom: 4 }}>
        Messages
      </h2>
      <p style={{ color: '#64748B', marginBottom: 24 }}>{MATCHES.length} conversations</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MATCHES.map((m) => (
          <div
            key={m.id}
            onClick={() => onOpenChat(m)}
            style={{
              background: 'white', borderRadius: 16, padding: '16px 20px',
              marginBottom: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              transition: 'all 0.2s', border: '1.5px solid transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.border = '1.5px solid #A7F3D0')}
            onMouseLeave={(e) => (e.currentTarget.style.border = '1.5px solid transparent')}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: `linear-gradient(135deg,${m.color},${m.color}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 16,
              }}>
                {m.avatar}
              </div>
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 10, height: 10, borderRadius: '50%',
                background: '#10B981', border: '2px solid white',
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 16 }}>{m.name}</span>
                <span style={{ color: '#94A3B8', fontSize: 12, flexShrink: 0 }}>{m.time}</span>
              </div>
              <div style={{ color: '#059669', fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{m.role}</div>
              <p style={{
                color: '#64748B', fontSize: 14,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {m.lastMsg}
              </p>
            </div>

            {/* Unread badge */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#10B981', flexShrink: 0,
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}
