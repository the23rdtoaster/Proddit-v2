import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { chatWithGemini } from '../services/aiService';

const SUGGESTED = [
  "Why did my credit score drop?",
  "Help me plan my conservation week 🌿",
  "What's my total impact so far?",
  "Should I switch to a different squad?",
  "I don't have much time this week — suggest easy micro-tasks",
];

export default function AIAssistant() {
  const { user } = useApp();
  const [messages, setMessages] = useState([
    { role: 'model', text: `🌱 Hey${user?.username ? ` ${user.username}` : ''}! I'm your Proddit eco-coach. Ask me anything — task planning, your score, squad advice, or just need some motivation to go green today!` }
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg = { role: 'user', text: msg };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    try {
      // Pass conversation history (skip system first message)
      const history = messages.slice(1);
      const reply = await chatWithGemini(history, msg, user);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: '🌿 Something went wrong. Try again!' }]);
    } finally {
      setThinking(false);
    }
  };

  const roleAbility = {
    terraformer: 'Earthwall (Daily cooldown)',
    healer: 'Mend (Daily cooldown)',
    ranger: 'Seed Share (Weekly cooldown)',
    herbalist: 'Bloom Bomb (Daily cooldown)',
    hydromancer: 'Tidal Surge (Daily cooldown)',
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div className="page-title">🤖 AI Eco-Coach</div>
        <div className="page-subtitle">Private chat — your squad can't see this.</div>
      </div>

      {/* User context pill */}
      {user && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {[
            `${user.level ? `Lv.${user.level}` : ''} ${user.role || ''}`,
            `⭐ ${user.credit_score || 500}`,
            `🔥 ${user.streak_count || 0} day streak`,
            `🌿 ${user.prodcoins || 0} coins`,
          ].filter(Boolean).map(s => (
            <span key={s} className="badge badge-green" style={{ fontSize: 11 }}>{s.trim()}</span>
          ))}
          {user.role && (
            <span className="badge" style={{ fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              ⚡ {roleAbility[user.role]}
            </span>
          )}
        </div>
      )}

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', paddingBottom: 'var(--space-4)' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#4CAF50' : 'var(--surface)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px', color: 'var(--text-muted)', fontSize: 14 }}>
              🌿 Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => send(s)} className="btn btn-ghost btn-sm" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="card card-pad" style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input
            className="input"
            placeholder="Ask your eco-coach anything…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !thinking && send()}
            style={{ flex: 1 }}
            disabled={thinking}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={thinking || !input.trim()} style={{ flexShrink: 0 }}>
            {thinking ? '⏳' : '🌍 Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
