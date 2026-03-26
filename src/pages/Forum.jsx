import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getForumPosts, createForumPost, addReaction, subscribeToForumPosts } from '../services/forumService';
import { supabase } from '../lib/supabase';

const ROLE_ICONS = { terraformer: '⛰️', healer: '💚', ranger: '🌿', herbalist: '🌸', hydromancer: '💧' };
const ECO_REACTIONS = ['🌱', '🌊', '♻️', '☀️', '🌍', '💧', '🐝', '🌿'];
const VERDICT_BADGE = { pass: '✅', borderline: '⚠️', fail: '❌', no_image: null };

export default function Forum() {
  const { user, squad } = useApp();
  const [posts, setPosts] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const loadPosts = async () => {
    if (!squad) return;
    try {
      const data = await getForumPosts(squad.squad_id);
      setPosts(data.reverse()); // Show oldest first
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!squad) { setLoading(false); return; }
    loadPosts();

    // Realtime subscription
    const channel = subscribeToForumPosts(squad.squad_id, (payload) => {
      setPosts(prev => [...prev, payload.new]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => supabase.removeChannel(channel);
  }, [squad]);

  const handleSend = async () => {
    if (!newText.trim() || !user || !squad) return;
    setSending(true);
    try {
      await createForumPost({ squadId: squad.squad_id, authorUserId: user.user_id, contentText: newText.trim() });
      setNewText('');
      await loadPosts();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  const handleReact = async (postId, emoji) => {
    try {
      await addReaction(postId, emoji);
      setPosts(prev => prev.map(p => p.post_id !== postId ? p : {
        ...p, reactions: { ...(p.reactions || {}), [emoji]: ((p.reactions || {})[emoji] || 0) + 1 }
      }));
    } catch {}
  };

  if (!squad) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="page-header"><div className="page-title">🌿 Squad Forum</div></div>
        <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Join a squad to see the forum.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div className="page-header">
        <div className="page-title">🌿 Squad Forum</div>
        <div className="page-subtitle">{squad.name} · conservation feed</div>
      </div>

      {error && <div style={{ color: '#FF3B30', fontSize: 13, marginBottom: 8 }}>⚠️ {error}</div>}

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingBottom: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading posts…</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No posts yet. Be the first to share! 🌱</div>
        ) : posts.map(post => {
          if (post.is_system) {
            return (
              <div key={post.post_id} style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: 'var(--space-2)', background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>
                {post.content_text}
              </div>
            );
          }
          const author = post.author || {};
          const verdict = post.ai_verdict && VERDICT_BADGE[post.ai_verdict];
          return (
            <div key={post.post_id} className="card card-pad">
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <div className="avatar" style={{ background: '#2A3A2A', width: 36, height: 36, fontSize: 16, flexShrink: 0 }}>
                  {ROLE_ICONS[author.role] || '🌿'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {author.username || 'Earthkeeper'}
                    <span style={{ fontSize: 11, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{author.role}</span>
                    {verdict && <span style={{ fontSize: 14 }}>{verdict}</span>}
                    {post.is_check_in_linked && <span className="badge badge-green" style={{ fontSize: 9 }}>check-in</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              {post.content_text && <p style={{ fontSize: 14, marginBottom: 'var(--space-2)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{post.content_text}</p>}
              {post.proof_url && <img src={post.proof_url} alt="Proof" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--r-md)', marginBottom: 'var(--space-2)' }} />}
              {/* Reactions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'var(--space-2)' }}>
                {Object.entries(post.reactions || {}).map(([emoji, count]) => count > 0 && (
                  <button key={emoji} onClick={() => handleReact(post.post_id, emoji)}
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 10px', fontSize: 13, cursor: 'pointer', color: 'var(--text-primary)' }}>
                    {emoji} {count}
                  </button>
                ))}
                {ECO_REACTIONS.map(emoji => (
                  <button key={emoji} onClick={() => handleReact(post.post_id, emoji)}
                    style={{ background: 'transparent', border: '1px solid transparent', borderRadius: 20, padding: '3px 8px', fontSize: 13, cursor: 'pointer', opacity: 0.5 }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="card card-pad" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input
            className="input"
            placeholder="Share your conservation action…"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !sending && handleSend()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={sending || !newText.trim()} style={{ flexShrink: 0 }}>
            {sending ? '⏳' : '🌱 Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
