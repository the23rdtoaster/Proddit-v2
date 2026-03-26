import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getUserItems, useItem } from '../services/inventoryService';

const RARITY_COLOR = { common: '#888', rare: '#2196F3', legendary: '#FFD700' };
const ITEM_ICONS = {
  shield: '🌿', hp_potion: '🧪', streak_freeze: '❄️',
  terraformers_bulwark: '🛡️', healers_salve: '💊', rangers_compass: '📍',
  hydromancers_tide_chart: '🗺️', herbalists_bloom_flare: '🌸', limited_edition: '✨'
};

export default function Inventory() {
  const { user } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState(null);

  const load = () => {
    if (!user) return;
    getUserItems(user.user_id).then(setItems).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const handleUse = async (item) => {
    if (item.class_locked && item.class_locked !== user?.role) {
      return alert(`This item is locked to the ${item.class_locked} role.`);
    }
    setUsing(item.item_id);
    try {
      await useItem(item.item_id, user.user_id);
      load();
    } catch (err) { alert(err.message); }
    finally { setUsing(null); }
  };

  const getDecayPercent = (item) => {
    const acquired = new Date(item.acquired_at).getTime();
    const decays = new Date(item.decays_at).getTime();
    const now = Date.now();
    return Math.max(0, Math.min(100, ((decays - now) / (decays - acquired)) * 100));
  };

  const hoursLeft = (item) => {
    const ms = new Date(item.decays_at).getTime() - Date.now();
    if (ms <= 0) return 'Expired';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">🎒 Inventory</div>
        <div className="page-subtitle">Your in-game items — earned from check-in drops and quests. Items decay after 48 hours.</div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading inventory…</div>
      ) : items.length === 0 ? (
        <div className="card card-pad" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontWeight: 700 }}>Inventory Empty</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
            Complete daily check-ins for a 20% chance at item drops!
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          {items.map(item => {
            const decayPct = getDecayPercent(item);
            const locked = item.class_locked && item.class_locked !== user?.role;
            return (
              <div key={item.item_id} className="card card-pad" style={{ opacity: locked ? 0.7 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontSize: 36 }}>{ITEM_ICONS[item.item_type] || '📦'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: RARITY_COLOR[item.rarity], textTransform: 'capitalize' }}>
                      {item.rarity}
                    </span>
                    {item.class_locked && (
                      <span className="badge" style={{ fontSize: 9, background: locked ? '#FF3B3020' : '#4CAF5020', color: locked ? '#FF3B30' : '#4CAF50', border: `1px solid ${locked ? '#FF3B30' : '#4CAF50'}` }}>
                        {locked ? '🔒' : '✓'} {item.class_locked}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontWeight: 700, marginBottom: 4, textTransform: 'capitalize' }}>
                  {item.item_type?.replace(/_/g, ' ')}
                </div>
                {/* Decay bar */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Decay</span><span>{hoursLeft(item)}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${decayPct}%`, background: decayPct > 50 ? '#4CAF50' : decayPct > 25 ? '#FF9800' : '#FF3B30', borderRadius: 2, transition: 'width 1s' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleUse(item)}
                    disabled={using === item.item_id || locked}
                  >
                    {using === item.item_id ? '⏳' : locked ? '🔒 Locked' : '⚡ Use'}
                  </button>
                  <button className="btn btn-ghost btn-sm">↔️ Trade</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
