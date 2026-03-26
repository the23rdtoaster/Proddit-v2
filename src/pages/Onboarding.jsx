import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, ROLES } from '../data/mockData';
import { upsertUser } from '../services/userService';

const steps = ['Sign In', 'Persona', 'Focus', 'Task Setup'];

const personas = [
  { key: 'high_schooler',   label: 'High Schooler',        icon: '🎒', desc: 'Building habits early, making school greener' },
  { key: 'college_student', label: 'College Student',      icon: '📚', desc: 'Campus activism, sustainable living on a budget' },
  { key: 'professional',    label: 'Working Professional', icon: '💼', desc: 'Driving change in the workplace and beyond' },
];

const roleList = [
  { key: 'terraformer', label: 'Terraformer', icon: '⛰️', ability: 'Earthwall — Blocks next HP damage' },
  { key: 'healer',      label: 'Healer',      icon: '💚', ability: 'Mend — Restores Squad HP' },
  { key: 'ranger',      label: 'Ranger',      icon: '🌿', ability: 'Seed Share — Duplicates squadmate item' },
  { key: 'herbalist',   label: 'Herbalist',   icon: '🌸', ability: 'Bloom Bomb — Nudges slacking members' },
  { key: 'hydromancer', label: 'Hydromancer', icon: '💧', ability: 'Tidal Surge — 2× coins before noon' },
];

export default function Onboarding() {
  const { login, session, user, setUser, setOnboarded } = useApp();
  const [step, setStep] = useState(session ? 1 : 0);
  const [persona, setPersona] = useState('');
  const [categories, setCategories] = useState([]);
  const [role, setRole] = useState('');
  const [taskText, setTaskText] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const aiSchedule = {
    hours: 1.5,
    days: 6,
    tasks: ['Separate dry and wet waste each morning', 'Refuse single-use plastic at canteens', 'Walk short distances instead of riding'],
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await login();
      // After OAuth redirect, onAuthStateChange handles the rest
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFinish = async () => {
    if (!session?.user) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await upsertUser(session.user, {
        persona,
        conservation_category: categories.join(', '),
        role,
        task_description: taskText,
        hours_per_day: aiSchedule.hours,
        days_per_week: aiSchedule.days,
      });
      setUser(updated);
      setOnboarded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step === 0) { handleGoogleLogin(); return; }
    if (step === 1 && !persona) return;
    if (step === 2 && (categories.length < 3 || !role)) return;
    if (step === 3) { handleFinish(); return; }
    setStep(s => s + 1);
  };

  return (
    <div className="onboarding-layout">
      <div className="onboarding-card">
        <div className="onboarding-logo">
          <span className="onboarding-logo-icon">🌱</span>
          <div className="onboarding-title">Proddit</div>
          <div className="onboarding-sub">Conservation Habit Survival — for people who give a damn.</div>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {steps.map((label, i) => (
            <div key={i} className="step" style={{ flex: '0 0 auto' }}>
              <div className={`step-number ${i <= step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <div className={`step-label ${i === step ? 'active' : ''}`}>{label}</div>
              {i < steps.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#1a0a0a', border: '1px solid #FF3B30', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#FF3B30', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step 0: Sign In */}
        {step === 0 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
              <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>🌍</div>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                Welcome, Earthkeeper
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Join a squad, log your conservation acts, and protect your planet together.
              </p>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleGoogleLogin} style={{ gap: 'var(--space-3)', fontSize: 'var(--text-base)' }}>
              <span>🔐</span> Continue with Google
            </button>
            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              By signing in you agree to Proddit's conservation pledge and community guidelines.
            </div>
          </div>
        )}

        {/* Step 1: Persona */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Who are you?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>This helps us tailor your conservation experience.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
              {personas.map(p => (
                <div key={p.key} className={`persona-card ${persona === p.key ? 'selected' : ''}`} onClick={() => setPersona(p.key)}>
                  <span className="persona-card-icon">{p.icon}</span>
                  <div>
                    <div className="persona-card-name">{p.label}</div>
                    <div className="persona-card-desc">{p.desc}</div>
                  </div>
                  {persona === p.key && <span style={{ marginLeft: 'auto', color: 'var(--green-dark)', fontSize: '20px' }}>✓</span>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={next} disabled={!persona}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 2: Conservation Focus + Role */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Your Conservation Focus</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Pick at least 3 primary causes (interests) — this shapes your squad matching.</p>
            <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
              {CATEGORIES.map(c => {
                const isSelected = categories.includes(c.key);
                return (
                  <div key={c.key} className={`category-card ${isSelected ? 'selected' : ''}`} onClick={() => {
                    if (isSelected) setCategories(categories.filter(x => x !== c.key));
                    else setCategories([...categories, c.key]);
                  }}>
                    <div className="category-card-icon">{c.icon}</div>
                    <div className="category-card-name">{c.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="section-label">Choose Your Role</div>
            <div className="grid-3" style={{ marginBottom: 'var(--space-6)', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-2)' }}>
              {roleList.map(r => (
                <div key={r.key} className={`role-card ${role === r.key ? 'selected' : ''}`} onClick={() => setRole(r.key)} style={{ padding: 'var(--space-3)' }}>
                  <div className="role-card-icon">{r.icon}</div>
                  <div className="role-card-name" style={{ fontSize: 'var(--text-xs)' }}>{r.label}</div>
                  <div className="role-card-ability" style={{ fontSize: '10px' }}>{r.ability}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={next} disabled={categories.length < 3 || !role}>Continue →</button>
            </div>
          </div>
        )}

        {/* Step 3: Task Setup */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>What will you do daily?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Be specific — you'll need to prove this every day with a photo.</p>
            <div className="field">
              <label className="label">Your Conservation Commitment</label>
              <textarea className="textarea" rows={3} placeholder="e.g. Segregate household waste and walk to college instead of taking an auto" value={taskText} onChange={e => setTaskText(e.target.value)} />
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAI(true)} disabled={!taskText} style={{ marginBottom: 'var(--space-4)' }}>
              ✨ Generate AI Schedule
            </button>
            {showAI && (
              <div className="ai-schedule-card">
                <div style={{ fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--success)' }}>✅ AI-Suggested Schedule</div>
                <div style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                  <strong>{aiSchedule.hours} hrs/day · {aiSchedule.days} days/week</strong>
                </div>
                <div className="section-label">Suggested Daily Tasks</div>
                {aiSchedule.tasks.map((t, i) => (
                  <div key={i} style={{ fontSize: 'var(--text-sm)', display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
                    <span>🌱</span> {t}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleFinish} disabled={saving || !taskText}>
                {saving ? '⏳ Saving…' : '🌍 Join the Movement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
