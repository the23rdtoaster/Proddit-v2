import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getUserGoals, createGoal, deleteGoal } from '../services/goalService';
import { CATEGORIES } from '../data/mockData';

const ROLE_ICONS = { terraformer: '⛰️', healer: '💚', ranger: '🌿', herbalist: '🌸', hydromancer: '💧' };
const ROLE_ABILITIES = {
  terraformer: { name: 'Earthwall', desc: 'Blocks next squad HP damage event', cooldown: 'Daily' },
  healer:      { name: 'Mend',      desc: 'Restores 10–15 HP to squad bar',    cooldown: 'Daily' },
  ranger:      { name: 'Seed Share',desc: 'Duplicates an item from squadmate',  cooldown: 'Weekly' },
  herbalist:   { name: 'Bloom Bomb',desc: 'Forces nudge to all squadmates',     cooldown: 'Daily' },
  hydromancer: { name: 'Tidal Surge',desc: '2× ProdCoins before noon',          cooldown: 'Daily' },
};

export default function Profile() {
  const { user, logout } = useApp();
  const [goals, setGoals] = useState([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', conservation_category: '', target_days: 30 });
  const [saving, setSaving] = useState(false);
  const [goalError, setGoalError] = useState(null);

  useEffect(() => {
    if (!user) return;
    getUserGoals(user.user_id).then(setGoals).catch(console.error);
  }, [user]);

  if (!user) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading profile…</div>;

  const xpToNextLevel = (user.level || 1) * 1000;
  const xpProgress = ((user.xp || 0) % 1000) / 10;
  const hpColor = (user.individual_hp || 100) > 60 ? '#4CAF50' : (user.individual_hp || 100) > 30 ? '#FF9800' : '#FF3B30';
  const ability = ROLE_ABILITIES[user.role];
  const impactScore = (user.impact_trees_planted || 0) * 10 + (user.impact_waste_kg || 0) * 2 + (user.impact_events_attended || 0) * 25;

  const handleAddGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.conservation_category) { setGoalError('Please fill all fields.'); return; }
    setSaving(true); setGoalError(null);
    try {
      await createGoal({ userId: user.user_id, title: newGoal.title.trim(), conservationCategory: newGoal.conservation_category, targetDays: newGoal.target_days });
      const updated = await getUserGoals(user.user_id);
      setGoals(updated);
      setShowNewGoal(false);
      setNewGoal({ title: '', conservation_category: '', target_days: 30 });
    } catch (err) { setGoalError(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteGoal = async (goalId) => {
    await deleteGoal(goalId);
    setGoals(prev => prev.filter(g => g.goal_id !== goalId));
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Hero */}
      <div className="card card-pad" style={{ marginBottom: 'var(--space-4)', textAlign: 'center', background: 'linear-gradient(135deg, var(--surface) 0%, #1A2B1A 100%)' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>{ROLE_ICONS[user.role] || '🌿'}</div>
        <div style={{ fontWeight: 800, fontSize: 22 }}>{user.username}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-3)', textTransform: 'capitalize' }}>
          {user.role} · Level {user.level || 1} · {user.persona?.replace(/_/g, ' ')}
        </div>
        {(user.credit_score || 500) >= 850 && (
          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', background: '#FFD70020', border: '1px solid #FFD700', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#FFD700', marginBottom: 12 }}>
            🛡️ Verified Guardian
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {/* HP */}
        <div className="card card-pad">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Individual HP</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: hpColor }}>{user.individual_hp || 100}</div>
          <div className="hp-bar-bg" style={{ height: 6, marginTop: 8 }}>
            <div className="hp-bar-fill" style={{ width: `${user.individual_hp || 100}%`, background: hpColor }} />
          </div>
        </div>
        {/* XP */}
        <div className="card card-pad">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>XP · Level {user.level || 1}</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#9C27B0' }}>{user.xp || 0}</div>
          <div className="hp-bar-bg" style={{ height: 6, marginTop: 8 }}>
            <div className="hp-bar-fill" style={{ width: `${xpProgress}%`, background: '#9C27B0' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{(user.xp || 0) % 1000}/{1000} to Lv.{(user.level || 1) + 1}</div>
        </div>
        {/* Credit Score */}
        <div className="card card-pad">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Credit Score</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#4CAF50' }}>{user.credit_score || 500}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/1000 · {user.credit_score >= 850 ? '🛡️ Guardian' : user.credit_score >= 700 ? '🌟 Rising' : '🌱 Building'}</div>
        </div>
        {/* Streak */}
        <div className="card card-pad">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Green Streak</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#FF9800' }}>{user.streak_count || 0}🔥</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {[7, 30, 100].map(n => (
              <div key={n} style={{ flex: 1, textAlign: 'center', fontSize: 10, padding: '3px 0', borderRadius: 4, background: (user.streak_count || 0) >= n ? '#FF980030' : 'var(--surface-2)', color: (user.streak_count || 0) >= n ? '#FF9800' : 'var(--text-muted)', border: `1px solid ${(user.streak_count || 0) >= n ? '#FF9800' : 'transparent'}` }}>
                {n}d
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Ability */}
      {ability && (
        <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="section-label">Role Ability</div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginTop: 'var(--space-2)' }}>
            <div style={{ fontSize: 32 }}>{ROLE_ICONS[user.role]}</div>
            <div>
              <div style={{ fontWeight: 700 }}>⚡ {ability.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{ability.desc}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Cooldown: {ability.cooldown}</div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Ledger */}
      <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="section-label">Personal Impact</div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
          {[
            { icon: '🌱', label: 'Trees Planted', value: user.impact_trees_planted || 0 },
            { icon: '♻️', label: 'Waste Diverted', value: `${(user.impact_waste_kg || 0).toFixed(1)}kg` },
            { icon: '🌍', label: 'Events', value: user.impact_events_attended || 0 },
            { icon: '⭐', label: 'Impact Score', value: impactScore },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ flex: '1 1 70px', textAlign: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 'var(--space-3)' }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Goals */}
      <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <div className="section-label">Personal Goals</div>
          {goals.filter(g => !g.completed).length < 3 && (
            <button className="btn btn-sm btn-secondary" onClick={() => setShowNewGoal(!showNewGoal)}>+ Add Goal</button>
          )}
        </div>
        {showNewGoal && (
          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            {goalError && <div style={{ color: '#FF3B30', fontSize: 12, marginBottom: 8 }}>⚠️ {goalError}</div>}
            <div className="field">
              <label className="label" style={{ fontSize: 11 }}>Goal Title</label>
              <input className="input" placeholder="e.g. Compost daily for 30 days" value={newGoal.title} onChange={e => setNewGoal(g => ({ ...g, title: e.target.value }))} style={{ fontSize: 13 }} />
            </div>
            <div className="field">
              <label className="label" style={{ fontSize: 11 }}>Conservation Category</label>
              <select className="input" value={newGoal.conservation_category} onChange={e => setNewGoal(g => ({ ...g, conservation_category: e.target.value }))} style={{ fontSize: 13 }}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label" style={{ fontSize: 11 }}>Target Days: {newGoal.target_days}</label>
              <input type="range" min={1} max={100} value={newGoal.target_days} onChange={e => setNewGoal(g => ({ ...g, target_days: Number(e.target.value) }))} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewGoal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={handleAddGoal} disabled={saving}>{saving ? '⏳ Saving…' : '✓ Save Goal'}</button>
            </div>
          </div>
        )}
        {goals.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-6)', fontSize: 13 }}>No goals yet. Add up to 3 personal conservation goals!</div>
        ) : goals.map(g => (
          <div key={g.goal_id} style={{ marginBottom: 'var(--space-3)', opacity: g.completed ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
                  {g.completed && '✅ '}{g.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{g.conservation_category?.replace(/_/g, ' ')}</div>
              </div>
              <button onClick={() => handleDeleteGoal(g.goal_id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div className="hp-bar-bg" style={{ height: 6 }}>
              <div className="hp-bar-fill" style={{ width: `${Math.min(100, ((g.progress_days || 0) / g.target_days) * 100)}%`, background: g.completed ? '#FFD700' : '#4CAF50' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{g.progress_days || 0} / {g.target_days} days</div>
          </div>
        ))}
      </div>

      {/* Task commitment */}
      {user.task_description && (
        <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="section-label">Daily Commitment</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 'var(--space-2)', lineHeight: 1.5 }}>📋 {user.task_description}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{user.hours_per_day}h/day · {user.days_per_week} days/week</div>
        </div>
      )}

      {/* Sign out */}
      <button className="btn btn-ghost btn-full" onClick={logout} style={{ color: '#FF3B30', border: '1px solid #FF3B3040' }}>
        🚪 Sign Out
      </button>
    </div>
  );
}
