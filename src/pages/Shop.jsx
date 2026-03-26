import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getEcoRewards, redeemReward } from '../services/shopService';

const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'seeds_plants', label: '🌱 Seeds & Plants' },
  { key: 'reusable_goods', label: '♻️ Reusable Goods' },
  { key: 'apparel', label: '👕 Apparel' },
  { key: 'education_kits', label: '📚 Education' },
  { key: 'local_partner', label: '🏪 Local Partners' },
];

export default function Shop() {
  const { user, prodcoins, spendCoins, refreshUser } = useApp();
  const [rewards, setRewards] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [address, setAddress] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getEcoRewards().then(setRewards).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? rewards : rewards.filter(r => r.category === tab);

  const handleRedeem = async (reward) => {
    if (!user) return;
    if (!address.trim()) { setError('Please enter a shipping address.'); return; }
    setError(null);
    try {
      await redeemReward({ userId: user.user_id, rewardId: reward.reward_id, coinCost: reward.coin_cost, shippingAddress: address });
      spendCoins(reward.coin_cost);
      await refreshUser();
      setSuccess(reward.name);
      setRedeeming(null);
      setAddress('');
    } catch (err) { setError(err.message); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">🛍️ Eco Rewards Shop</div>
          <div className="page-subtitle">Redeem your ProdCoins for real eco-friendly products.</div>
        </div>
        <div className="prodcoin-badge">
          <span>🌿</span>
          <span style={{ fontWeight: 700 }}>{prodcoins} coins</span>
        </div>
      </div>

      {success && (
        <div style={{ background: '#0A1A0A', border: '1px solid #4CAF50', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#4CAF50', fontSize: 13 }}>
          ✅ Redeemed <strong>{success}</strong>! We'll email you within 3 business days. 🌱
          <button onClick={() => setSuccess(null)} style={{ marginLeft: 12, fontSize: 11, color: '#4CAF50', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}
      {error && (
        <div style={{ background: '#1a0a0a', border: '1px solid #FF3B30', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#FF3B30', fontSize: 13 }}>
          ⚠️ {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, fontSize: 11, color: '#FF3B30', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-5)', overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORY_TABS.map(t => (
          <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.key)} style={{ whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading rewards…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {filtered.map(reward => {
            const canAfford = prodcoins >= reward.coin_cost;
            const isRedeeming = redeeming?.reward_id === reward.reward_id;
            return (
              <div key={reward.reward_id} className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', opacity: canAfford ? 1 : 0.7 }}>
                <div style={{ fontSize: 40, textAlign: 'center' }}>{reward.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{reward.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>{reward.description}</div>
                </div>
                {reward.stock_available !== null && (
                  <div style={{ fontSize: 11, color: reward.stock_available < 5 ? '#FF9800' : 'var(--text-muted)' }}>
                    {reward.stock_available < 5 ? '⚠️ ' : ''}Only {reward.stock_available} left
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ fontWeight: 800, color: 'var(--coin)', fontSize: 18 }}>🌿 {reward.coin_cost}</div>
                  <button
                    className={`btn btn-sm ${canAfford ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setRedeeming(reward); setError(null); }}
                    disabled={!canAfford}
                  >
                    {canAfford ? 'Redeem' : 'Need more coins'}
                  </button>
                </div>
                {/* Inline address form */}
                {isRedeeming && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)' }}>
                    <div className="field">
                      <label className="label" style={{ fontSize: 11 }}>Shipping Address</label>
                      <textarea className="textarea" rows={2} placeholder="Your full address…" value={address} onChange={e => setAddress(e.target.value)} style={{ fontSize: 13 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setRedeeming(null); setAddress(''); setError(null); }}>Cancel</button>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleRedeem(reward)}>Confirm</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
