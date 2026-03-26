import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getActiveTrades, getTradeHistory, respondToTrade } from '../services/tradeService';
import { getUserItems } from '../services/inventoryService';

const STATUS_COLOR = { accepted: '#4CAF50', declined: '#FF3B30', countered: '#FF9800', expired: '#888', pending: '#2196F3' };
const ITEM_ICONS = {
  shield: '🌿', hp_potion: '🧪', streak_freeze: '❄️',
  terraformers_bulwark: '🛡️', healers_salve: '💊', rangers_compass: '📍',
  hydromancers_tide_chart: '🗺️', herbalists_bloom_flare: '🌸', limited_edition: '✨'
};

export default function TradeHub() {
  const { user, members } = useApp();
  const [tab, setTab] = useState('active');
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  // Send trade form
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendItem, setSendItem] = useState('');
  const [sendCoins, setSendCoins] = useState(0);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [a, h, items] = await Promise.all([
        getActiveTrades(user.user_id),
        getTradeHistory(user.user_id),
        getUserItems(user.user_id),
      ]);
      setActive(a);
      setHistory(h);
      setMyItems(items);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(load, [user]);

  const handleRespond = async (tradeId, action) => {
    setActing(tradeId);
    try {
      await respondToTrade(tradeId, action);
      await load();
    } catch (err) { alert(err.message); }
    finally { setActing(null); }
  };

  const handleSend = async () => {
    if (!sendRecipient || !sendItem) { setSendError('Select a squadmate and an item first.'); return; }
    setSending(true); setSendError(null);
    try {
      const { createTrade } = await import('../services/tradeService');
      await createTrade({ initiatorId: user.user_id, recipientId: sendRecipient, offeredItemId: sendItem, offeredCoins: sendCoins });
      setSendSuccess(true); setSendRecipient(''); setSendItem(''); setSendCoins(0);
      await load();
    } catch (err) { setSendError(err.message); }
    finally { setSending(false); }
  };

  const squadmates = members.filter(m => m.user_id !== user?.user_id);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">↔️ Trade Hub</div>
        <div className="page-subtitle">Exchange items with your squadmates.</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-5)' }}>
        {[['active', '📬 Active Offers'], ['send', '📤 Send Trade'], ['history', '📋 History']].map(([k, l]) => (
          <button key={k} className={`btn btn-sm ${tab === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading…</div> : null}

      {/* Active Offers */}
      {tab === 'active' && !loading && (
        active.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No active trade offers. Start one!</div>
        ) : active.map(t => {
          const isIncoming = t.recipient_user_id === user?.user_id;
          return (
            <div key={t.trade_id} className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div className="avatar" style={{ width: 36, height: 36, background: '#2A3A2A', fontSize: 16 }}>
                  {isIncoming ? '📥' : '📤'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {isIncoming ? `Offer from ${t.initiator?.username}` : `Offer to ${t.recipient?.username}`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(t.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 'var(--space-3)' }}>
                  <div style={{ fontSize: 24 }}>{ITEM_ICONS[t.offered_item?.item_type] || '📦'}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{t.offered_item?.item_type?.replace(/_/g, ' ') || 'Unknown'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t.offered_item?.rarity}</div>
                  {t.offered_coins > 0 && <div style={{ fontSize: 12, color: 'var(--coin)', fontWeight: 700 }}>+ 🌿 {t.offered_coins}</div>}
                </div>
                <div style={{ fontSize: 20 }}>⇄</div>
                <div style={{ flex: 1, textAlign: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 'var(--space-3)' }}>
                  {t.requested_item ? (
                    <>
                      <div style={{ fontSize: 24 }}>{ITEM_ICONS[t.requested_item?.item_type] || '📦'}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{t.requested_item?.item_type?.replace(/_/g, ' ')}</div>
                    </>
                  ) : <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No item requested</div>}
                </div>
              </div>
              {isIncoming && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleRespond(t.trade_id, 'declined')} disabled={acting === t.trade_id}>Decline</button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleRespond(t.trade_id, 'accepted')} disabled={acting === t.trade_id}>
                    {acting === t.trade_id ? '⏳' : '✓ Accept'}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Send Trade */}
      {tab === 'send' && (
        <div className="card card-pad">
          {sendSuccess && <div style={{ color: '#4CAF50', marginBottom: 12, fontSize: 13 }}>✅ Trade offer sent!</div>}
          {sendError && <div style={{ color: '#FF3B30', marginBottom: 12, fontSize: 13 }}>⚠️ {sendError}</div>}
          <div className="field">
            <label className="label">Send To (Squadmate)</label>
            <select className="input" value={sendRecipient} onChange={e => setSendRecipient(e.target.value)}>
              <option value="">Select squadmate…</option>
              {squadmates.map(m => <option key={m.user_id} value={m.user_id}>{m.username} ({m.role})</option>)}
            </select>
            {squadmates.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>No squadmates yet. Join a squad with others!</div>}
          </div>
          <div className="field">
            <label className="label">Your Item to Offer</label>
            <select className="input" value={sendItem} onChange={e => setSendItem(e.target.value)}>
              <option value="">Select item…</option>
              {myItems.map(i => <option key={i.item_id} value={i.item_id}>{ITEM_ICONS[i.item_type] || '📦'} {i.item_type?.replace(/_/g, ' ')} ({i.rarity})</option>)}
            </select>
            {myItems.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>No items in inventory. Complete check-ins for item drops!</div>}
          </div>
          <div className="field">
            <label className="label">Coin Supplement (optional)</label>
            <input className="input" type="number" min={0} value={sendCoins} onChange={e => setSendCoins(Number(e.target.value))} placeholder="0" />
          </div>
          <button className="btn btn-primary btn-full" onClick={handleSend} disabled={sending || !sendRecipient || !sendItem}>
            {sending ? '⏳ Sending…' : '📤 Send Trade Offer'}
          </button>
        </div>
      )}

      {/* History */}
      {tab === 'history' && !loading && (
        history.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No trade history yet.</div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            {history.map(t => (
              <div key={t.trade_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22 }}>{ITEM_ICONS[t.offered_item?.item_type] || '📦'}</div>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{t.initiator?.username || 'Unknown'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t.offered_item?.item_type?.replace(/_/g, ' ')} · {new Date(t.resolved_at || t.created_at).toLocaleDateString()}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[t.status], textTransform: 'capitalize' }}>{t.status}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
