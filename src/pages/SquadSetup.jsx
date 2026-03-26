import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createSquad, joinSquadByCode, getAllActiveSquads } from '../services/squadService';
import { CATEGORIES } from '../data/mockData';

export default function SquadSetup({ onComplete }) {
  const { user, refreshSquad } = useApp();
  const [mode, setMode] = useState(null); // 'join' | 'create' | 'browse'
  const [code, setCode] = useState('');
  const [squadName, setSquadName] = useState('');
  const [focus, setFocus] = useState(user?.conservation_category || '');
  const [causeLabel, setCauseLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [squads, setSquads] = useState([]);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(null);
    try {
      await joinSquadByCode(code.trim(), user.user_id);
      await refreshSquad();
      onComplete?.();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!squadName.trim() || !focus) return;
    setLoading(true); setError(null);
    try {
      await createSquad({ name: squadName.trim(), conservation_focus: focus, cause_label: causeLabel, creatorUserId: user.user_id });
      await refreshSquad();
      onComplete?.();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleBrowse = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getAllActiveSquads();
      setSquads(data);
      setMode('browse');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleJoinFromBrowse = async (groupId) => {
    setLoading(true); setError(null);
    try {
      await joinSquadByCode(groupId, user.user_id);
      await refreshSquad();
      onComplete?.();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="onboarding-layout">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          <span className="onboarding-logo-icon">🌿</span>
          <div className="onboarding-title">Find Your Squad</div>
          <div className="onboarding-sub">Join an existing squad or create your own conservation crew.</div>
        </div>

        {error && (
          <div style={{ background: '#1a0a0a', border: '1px solid #FF3B30', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#FF3B30', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {!mode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <button className="btn btn-primary btn-full btn-lg" onClick={() => setMode('join')}>🔑 Join with Code</button>
            <button className="btn btn-secondary btn-full" onClick={handleBrowse} disabled={loading}>🔍 Browse Open Squads</button>
            <button className="btn btn-ghost btn-full" onClick={() => setMode('create')}>➕ Create New Squad</button>
          </div>
        )}

        {mode === 'join' && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Join with Squad Code</h3>
            <div className="field">
              <label className="label">8-character squad code</label>
              <input className="input" placeholder="e.g. GRN4LIFE" value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={8} style={{ letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center', fontSize: 20, fontWeight: 700 }} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-ghost" onClick={() => setMode(null)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleJoin} disabled={loading || code.length < 6}>
                {loading ? '⏳ Joining…' : '🌱 Join Squad'}
              </button>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Create a New Squad</h3>
            <div className="field">
              <label className="label">Squad Name</label>
              <input className="input" placeholder="e.g. Green Frontier" value={squadName} onChange={e => setSquadName(e.target.value)} maxLength={64} />
            </div>
            <div className="field">
              <label className="label">Conservation Focus</label>
              <div className="grid-4" style={{ marginBottom: 'var(--space-3)' }}>
                {CATEGORIES.map(c => (
                  <div key={c.key} className={`category-card ${focus === c.key ? 'selected' : ''}`} onClick={() => setFocus(c.key)} style={{ padding: 'var(--space-2)' }}>
                    <div className="category-card-icon" style={{ fontSize: 20 }}>{c.icon}</div>
                    <div className="category-card-name" style={{ fontSize: 10 }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="field">
              <label className="label">Cause Label <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
              <input className="input" placeholder="e.g. Mumbai Beach Cleanup Crew" value={causeLabel} onChange={e => setCauseLabel(e.target.value)} maxLength={128} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-ghost" onClick={() => setMode(null)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={loading || !squadName || !focus}>
                {loading ? '⏳ Creating…' : '🚀 Create Squad'}
              </button>
            </div>
          </div>
        )}

        {mode === 'browse' && (
          <div>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Open Squads</h3>
            {squads.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No open squads found. Be the first to create one!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {squads.filter(s => s.member_count < 6).slice(0, 8).map(s => (
                  <div key={s.squad_id} className="card card-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.conservation_focus?.replace(/_/g, ' ')} · {s.member_count}/6 members</div>
                      {s.cause_label && <div style={{ fontSize: 11, color: 'var(--green-mid)' }}>📍 {s.cause_label}</div>}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleJoinFromBrowse(s.group_id)} disabled={loading}>Join</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-ghost" onClick={() => setMode(null)}>← Back</button>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setMode('create')}>➕ Create Instead</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
