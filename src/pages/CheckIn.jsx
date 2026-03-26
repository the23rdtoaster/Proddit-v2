import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { uploadProofPhoto, callGeminiVision, submitCheckIn, getTodayCheckIn } from '../services/checkInService';
import { grantItemDrop } from '../services/inventoryService';

const VERDICTS = {
  pass:       { icon: '✅', label: 'Verified!',     color: 'pass',   coins: 50, xp: 120 },
  borderline: { icon: '⚠️', label: 'Borderline',   color: 'border', coins: 0,  xp: 0 },
  fail:       { icon: '❌', label: 'Not Verified',  color: 'fail',   coins: 0,  xp: 0 },
};

export default function CheckIn() {
  const { user, squad, refreshUser } = useApp();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [share, setShare] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [itemDrop, setItemDrop] = useState(null);
  const [reactions, setReactions] = useState({});
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      getTodayCheckIn(user.user_id).then(ci => {
        if (ci) { setAlreadyDone(true); setVerdict({ ...VERDICTS[ci.ai_verdict || 'borderline'], key: ci.ai_verdict, confidence: ci.ai_confidence || 0.7, coins_earned: ci.coins_earned, xp_earned: ci.xp_earned }); }
      }).catch(() => {});
    }
  }, [user]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setVerdict(null); setError(null);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const handleSubmit = async () => {
    if (!file || !user || !squad) return;
    setLoading(true); setError(null);
    try {
      // 1. Upload to Supabase Storage
      const proofUrl = await uploadProofPhoto(file, user.user_id);

      // 2. Call Gemini Vision
      const geminiResult = await callGeminiVision(proofUrl, user.task_description);
      const v = geminiResult.verdict;
      const confidence = geminiResult.confidence;

      // 3. Save check-in to DB
      const { coinsEarned, xpEarned } = await submitCheckIn({
        userId: user.user_id,
        squadId: squad.squad_id,
        proofUrl,
        caption,
        shareToForum: share,
        verdict: v,
        confidence,
        category: user.conservation_category,
        taskDescription: user.task_description,
      });

      // 4. Item drop (20% on pass)
      let drop = null;
      if (v === 'pass' && Math.random() < 0.2) {
        drop = await grantItemDrop(user.user_id);
        setItemDrop(drop);
      }

      // 5. Update user in context
      await refreshUser();

      setVerdict({ ...VERDICTS[v], key: v, confidence, coins_earned: coinsEarned, xp_earned: xpEarned });
      setAlreadyDone(v === 'pass');
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyDone && verdict) {
    return (
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="page-header">
          <div className="page-title">📷 Daily Check-In</div>
          <div className="page-subtitle">Today's conservation action has been logged!</div>
        </div>
        <div className={`verification-card verdict-pass`} style={{ padding: 'var(--space-5)' }}>
          <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 8 }}>✅</div>
          <div style={{ textAlign: 'center', fontWeight: 800, fontSize: 'var(--text-lg)', marginBottom: 4 }}>Check-in Complete!</div>
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>
            Come back tomorrow to keep your streak going.
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div style={{ flex: 1, textAlign: 'center', background: 'white', borderRadius: 'var(--r-md)', padding: 'var(--space-3)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--coin)' }}>+{verdict.coins_earned || 50}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>ProdCoins</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', background: 'white', borderRadius: 'var(--r-md)', padding: 'var(--space-3)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--xp)' }}>+{verdict.xp_earned || 120}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>XP</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title">📷 Daily Check-In</div>
        <div className="page-subtitle">Upload proof of your conservation action to earn ProdCoins and protect Squad HP.</div>
      </div>

      {error && (
        <div style={{ background: '#1a0a0a', border: '1px solid #FF3B30', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#FF3B30', fontSize: 13 }}>⚠️ {error}</div>
      )}

      {/* Upload Zone */}
      {!preview ? (
        <div
          className={`upload-zone ${dragging ? 'drag' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>📸</div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Drop your proof photo here</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
            or click to browse · JPEG/PNG · max 10MB
          </div>
          <button className="btn btn-primary" onClick={e => { e.stopPropagation(); document.getElementById('file-input').click(); }}>
            📁 Choose File
          </button>
          <input id="file-input" type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', marginBottom: 'var(--space-5)' }}>
          <img src={preview} alt="Proof" style={{ width: '100%', maxHeight: 320, objectFit: 'cover' }} />
          <div style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setFile(null); setPreview(null); setVerdict(null); setItemDrop(null); }}>
              🔄 Change Photo
            </button>
            <span className="badge badge-green" style={{ alignSelf: 'center' }}>📎 {file?.name}</span>
          </div>
        </div>
      )}

      {preview && !verdict && (
        <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="field">
            <label className="label">Caption <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
            <input className="input" placeholder="What did you do today? e.g. Collected 1kg of plastic…" value={caption} onChange={e => setCaption(e.target.value)} />
          </div>
          <div className="toggle-row">
            <div>
              <div className="toggle-label">Share to Squad Forum</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Your proof will appear in the squad feed</div>
            </div>
            <button className={`toggle ${share ? 'on' : ''}`} onClick={() => setShare(s => !s)} />
          </div>
          <div className="divider" />
          <button className="btn btn-primary btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
            {loading ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>⏳ Verifying with Gemini Flash Vision…</span> : '🔍 Submit for Verification'}
          </button>
          {user?.task_description && (
            <div style={{ marginTop: 'var(--space-3)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              Gemini will verify: "{user.task_description}"
            </div>
          )}
        </div>
      )}

      {/* Verdict Card */}
      {verdict && !alreadyDone && (
        <div className={`verification-card verdict-${verdict.color}`} style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 32 }}>{verdict.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>{verdict.label}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Gemini Flash Vision · Confidence: {((verdict.confidence || 0) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {verdict.key === 'pass' && (
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
              {[
                { value: `+${verdict.coins_earned || 50}`, label: 'ProdCoins', color: 'var(--coin)' },
                { value: `+${verdict.xp_earned || 120}`, label: 'XP', color: 'var(--xp)' },
                { value: '+10', label: 'Squad HP', color: 'var(--green-dark)' },
              ].map(({ value, label, color }) => (
                <div key={label} style={{ flex: 1, textAlign: 'center', background: 'white', borderRadius: 'var(--r-md)', padding: 'var(--space-3)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {verdict.key === 'borderline' && (
            <div>
              <div style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                Your squadmates need to vote on this submission.
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {[['✓ Legit', true], ['👀 Suspicious', false]].map(([label, good]) => (
                  <button key={label} className={`btn ${good ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                    onClick={() => setReactions(r => ({ ...r, [label]: (r[label] || 0) + 1 }))}>
                    {label} {reactions[label] ? `(${reactions[label]})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {verdict.key === 'fail' && (
            <div className="flag-notice" style={{ marginTop: 'var(--space-2)' }}>
              ⚠️ Verification failed. Repeated failures in 7 days will notify your squad.
            </div>
          )}

          {itemDrop && (
            <div style={{ marginTop: 'var(--space-4)', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--space-3)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <span style={{ fontSize: 28 }}>🎁</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Item Drop!</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  You received a <strong>{itemDrop.item_type?.replace(/_/g, ' ')}</strong> ({itemDrop.rarity}) · Check your Inventory
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
