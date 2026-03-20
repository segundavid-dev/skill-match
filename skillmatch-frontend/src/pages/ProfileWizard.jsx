import React, { useState } from 'react';
import { SKILLS, CAUSES } from '../data/constants';

const TOTAL_STEPS = 4;

function ProgressBar({ step }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#64748B', fontSize: 13 }}>Step {step} of {TOTAL_STEPS}</span>
        <span style={{ color: '#10B981', fontWeight: 700, fontSize: 13 }}>
          {Math.round((step / TOTAL_STEPS) * 100)}% complete
        </span>
      </div>
      <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg,#10B981,#14B8A6)',
          borderRadius: 3,
          width: `${(step / TOTAL_STEPS) * 100}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < step ? '#10B981' : '#E2E8F0',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '14px 16px', border: '1.5px solid #E2E8F0',
  borderRadius: 12, fontSize: 15, outline: 'none', width: '100%',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

export default function ProfileWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: '', bio: '', skills: [], causes: [], availability: 'weekends' });

  const toggleSkill = (s) =>
    setData((d) => ({ ...d, skills: d.skills.includes(s) ? d.skills.filter((x) => x !== s) : [...d.skills, s] }));

  const toggleCause = (c) =>
    setData((d) => ({ ...d, causes: d.causes.includes(c) ? d.causes.filter((x) => x !== c) : [...d.causes, c] }));

  return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: 40,
        width: '100%', maxWidth: 560,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        <ProgressBar step={step} />

        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0F172A', marginBottom: 8 }}>
              Let's build your profile
            </h2>
            <p style={{ color: '#64748B', marginBottom: 24 }}>Tell the world a bit about you</p>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg,#10B981,#14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, margin: '0 auto 24px', cursor: 'pointer',
              border: '3px dashed rgba(52,211,153,0.5)',
            }}>
              +
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                value={data.name} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                placeholder="Full name" style={inputStyle}
                onFocus={(e) => (e.target.style.border = '1.5px solid #10B981')}
                onBlur={(e) => (e.target.style.border = '1.5px solid #E2E8F0')}
              />
              <input
                placeholder="City, Country" style={inputStyle}
                onFocus={(e) => (e.target.style.border = '1.5px solid #10B981')}
                onBlur={(e) => (e.target.style.border = '1.5px solid #E2E8F0')}
              />
              <textarea
                value={data.bio} onChange={(e) => setData((d) => ({ ...d, bio: e.target.value }))}
                placeholder="Tell organizations why you want to volunteer..." rows={3}
                style={{ ...inputStyle, resize: 'none' }}
                onFocus={(e) => (e.target.style.border = '1.5px solid #10B981')}
                onBlur={(e) => (e.target.style.border = '1.5px solid #E2E8F0')}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0F172A', marginBottom: 8 }}>
              What are your superpowers?
            </h2>
            <p style={{ color: '#64748B', marginBottom: 24 }}>
              Select all skills that apply — <strong style={{ color: '#10B981' }}>{data.skills.length}</strong> selected
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SKILLS.map((s) => (
                <button
                  key={s} onClick={() => toggleSkill(s)}
                  style={{
                    padding: '10px 18px', borderRadius: 50,
                    border: `2px solid ${data.skills.includes(s) ? '#10B981' : '#E2E8F0'}`,
                    background: data.skills.includes(s) ? '#ECFDF5' : 'white',
                    color: data.skills.includes(s) ? '#059669' : '#475569',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {data.skills.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0F172A', marginBottom: 8 }}>
              When can you give?
            </h2>
            <p style={{ color: '#64748B', marginBottom: 24 }}>And what causes move you?</p>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontWeight: 600, color: '#0F172A', marginBottom: 10, display: 'block' }}>Availability</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['weekdays', 'weekends', 'evenings', 'flexible'].map((a) => (
                  <button
                    key={a} onClick={() => setData((d) => ({ ...d, availability: a }))}
                    style={{
                      flex: '1 1 100px', padding: '12px 8px', borderRadius: 12,
                      border: `2px solid ${data.availability === a ? '#10B981' : '#E2E8F0'}`,
                      background: data.availability === a ? '#ECFDF5' : 'white',
                      color: data.availability === a ? '#059669' : '#475569',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <label style={{ fontWeight: 600, color: '#0F172A', marginBottom: 12, display: 'block' }}>Causes you care about</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CAUSES.map((c) => (
                <button
                  key={c} onClick={() => toggleCause(c)}
                  style={{
                    padding: '10px 18px', borderRadius: 50,
                    border: `2px solid ${data.causes.includes(c) ? '#F59E0B' : '#E2E8F0'}`,
                    background: data.causes.includes(c) ? '#FFFBEB' : 'white',
                    color: data.causes.includes(c) ? '#D97706' : '#475569',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {data.causes.includes(c) ? '★ ' : ''}{c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0F172A', marginBottom: 8 }}>
              Looking great! 🎉
            </h2>
            <p style={{ color: '#64748B', marginBottom: 24 }}>Review your profile before going live</p>
            <div style={{
              background: 'linear-gradient(135deg,#ECFDF5,#F0FDFA)',
              border: '1.5px solid #A7F3D0', borderRadius: 20, padding: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#10B981,#14B8A6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 22,
                }}>
                  {(data.name || 'U')[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#0F172A' }}>{data.name || 'Your Name'}</div>
                  <div style={{ color: '#059669', fontSize: 14 }}>Volunteer · {data.availability}</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: 13, marginBottom: 6 }}>
                  Skills ({data.skills.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {data.skills.slice(0, 6).map((s) => (
                    <span key={s} style={{
                      background: '#D1FAE5', color: '#059669',
                      padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#374151', fontSize: 13, marginBottom: 6 }}>
                  Causes ({data.causes.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {data.causes.slice(0, 5).map((c) => (
                    <span key={c} style={{
                      background: '#FEF3C7', color: '#D97706',
                      padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 600,
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={{
                flex: 1, padding: 16, borderRadius: 12, border: '1.5px solid #E2E8F0',
                background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 15, color: '#475569',
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={step === TOTAL_STEPS ? onComplete : () => setStep((s) => s + 1)}
            style={{
              flex: 2, padding: 16, borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#10B981,#059669)',
              color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}
          >
            {step === TOTAL_STEPS ? '🚀 Launch My Profile' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
