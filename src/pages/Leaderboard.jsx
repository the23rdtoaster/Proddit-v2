import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLeaderboard } from '../services/leaderboardService';
import { CATEGORIES } from '../data/mockData';

const SORT_TABS = [
  { key: 'credit_score', label: '🏆 Credit Score' },
  { key: 'streak_count', label: '🔥 Green Streak' },
  { key: 'impact_score', label: '🌍 Impact Score' },
];

const ROLE_ICONS = { terraformer: '⛰️', healer: '💚', ranger: '🌿', herbalist: '🌸', hydromancer: '💧' };

export default function Leaderboard() {
  const { user } = useApp();
  const [data, setData] = useState([]);
  const [sortBy, setSortBy] = useState('credit_score');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(sortBy, category || null)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sortBy, category]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🏆 Leaderboard</div>
        <div className="page-subtitle">Top conservationists ranked by impact and consistency.</div>
      </div>

      {/* Sort tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {SORT_TABS.map(t => (
          <button key={t.key} className={`btn btn-sm ${sortBy === t.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSortBy(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <select
          className="input"
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ maxWidth: 260, fontSize: 13 }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading leaderboard…</div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {data.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No users yet. Be the first! 🌱</div>
          ) : data.map((row, i) => {
            const isMe = row.user_id === user?.user_id;
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
            const value = sortBy === 'credit_score' ? row.credit_score
                        : sortBy === 'streak_count' ? `${row.streak_count}🔥`
                        : row.impact_score;
            return (
              <div key={row.user_id} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                background: isMe ? 'rgba(76,175,80,0.08)' : 'transparent',
                borderBottom: '1px solid var(--border)',
                borderLeft: isMe ? '3px solid #4CAF50' : '3px solid transparent',
              }}>
                <div style={{ width: 28, textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: 14 }}>
                  {medal || `#${i + 1}`}
                </div>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 16, background: '#2A3A2A', flexShrink: 0 }}>
                  {ROLE_ICONS[row.role] || '🌿'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
                    {row.username}
                    {row.guardian && <span title="Verified Guardian" style={{ fontSize: 14 }}>🛡️</span>}
                    {isMe && <span className="badge badge-green" style={{ fontSize: 10 }}>You</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {row.role} · {row.conservation_category?.replace(/_/g, ' ')}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#4CAF50' }}>{value}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
