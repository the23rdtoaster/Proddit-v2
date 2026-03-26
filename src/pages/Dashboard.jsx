import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getSquadQuest } from '../services/squadService';
import { getTodayCheckIn } from '../services/checkInService';
import { supabase } from '../lib/supabase';

const ROLE_ICONS = { terraformer: '⛰️', healer: '💚', ranger: '🌿', herbalist: '🌸', hydromancer: '💧' };
const STATUS_ICON = { done: '✅', pending: '⏳', missed: '✗' };

export default function Dashboard({ onNavigate }) {
  const { user, squad, members, refreshSquad } = useApp();
  const [quest, setQuest] = useState(null);
  const [todayDone, setTodayDone] = useState(false);
  const [liveHP, setLiveHP] = useState(squad?.squad_hp ?? 100);

  useEffect(() => {
    if (!squad) return;
    setLiveHP(squad.squad_hp);

    // Load quest
    getSquadQuest(squad.squad_id).then(setQuest).catch(() => {});

    // Check if user already checked in today
    if (user) getTodayCheckIn(user.user_id).then(ci => setTodayDone(!!ci && ci.final_verdict === 'pass')).catch(() => {});

    // Realtime subscription to squad HP changes
    const channel = supabase
      .channel(`squad-hp-${squad.squad_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'squads',
        filter: `squad_id=eq.${squad.squad_id}`,
      }, (payload) => {
        setLiveHP(payload.new.squad_hp);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [squad, user]);

  const hpColor = liveHP > 60 ? '#4CAF50' : liveHP > 30 ? '#FF9800' : '#FF3B30';
  const impactScore = squad?.total_impact_score || 0;

  const todayStatuses = members.reduce((acc, m) => {
    // For MVP: if a member is the current user & todayDone, show done; others show pending
    acc[m.user_id] = m.user_id === user?.user_id ? (todayDone ? 'done' : 'pending') : 'pending';
    return acc;
  }, {});

  return (
    <div>
      {/* Squad HP Header */}
      <div className="squad-hp-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>{squad?.name || 'Your Squad'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {squad?.conservation_focus?.replace(/_/g, ' ')}
              {squad?.cause_label && ` · ${squad.cause_label}`}
            </div>
          </div>
          <div className="hp-number" style={{ color: hpColor }}>{liveHP}/100</div>
        </div>
        <div className="hp-bar-bg">
          <div className="hp-bar-fill" style={{ width: `${liveHP}%`, background: `linear-gradient(90deg, ${hpColor}, ${hpColor}cc)`, transition: 'width 0.8s ease, background 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Squad HP</span>
          <span>{liveHP > 60 ? '🟢 Healthy' : liveHP > 30 ? '🟡 Warning' : '🔴 Critical'}</span>
        </div>
      </div>

      {/* Members Grid */}
      <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="section-label" style={{ marginBottom: 'var(--space-3)' }}>Squad Members</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {members.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 'var(--space-4)' }}>No squad members yet. Share your squad code!</div>
          ) : members.map(m => (
            <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="avatar" style={{ background: m.user_id === user?.user_id ? '#3A6A4A' : '#2A3A2A', width: 36, height: 36, fontSize: 16, flexShrink: 0 }}>
                {ROLE_ICONS[m.role] || '🌿'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {m.username}
                  {m.user_id === user?.user_id && <span className="badge badge-green" style={{ fontSize: 10 }}>You</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.role} · {m.streak_count || 0}🔥</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 18 }}>{STATUS_ICON[todayStatuses[m.user_id]] || '⏳'}</div>
              </div>
            </div>
          ))}
        </div>
        {squad && (
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Squad Code: </span>
            <code style={{ color: '#4CAF50', fontWeight: 700, letterSpacing: 2 }}>{squad.group_id}</code>
            <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>(share with friends)</span>
          </div>
        )}
      </div>

      {/* Squad Quest */}
      {quest && (
        <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="section-label">Weekly Squad Quest</div>
          <div style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-2)', fontSize: 13, color: 'var(--text-secondary)' }}>{quest.description}</div>
          <div className="hp-bar-bg" style={{ height: 8 }}>
            <div className="hp-bar-fill" style={{ width: `${Math.min(100, ((quest.current_checkins || 0) / (quest.target_checkins || 35)) * 100)}%` }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            {quest.current_checkins || 0} / {quest.target_checkins || 35} check-ins
            {quest.completed && <span style={{ color: '#4CAF50', marginLeft: 8 }}>✅ Complete!</span>}
          </div>
        </div>
      )}

      {/* Impact Ledger */}
      <div className="card card-pad" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="section-label">Squad Impact</div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
          {[
            { icon: '🌱', label: 'Trees Planted', value: members.reduce((s, m) => s + (m.impact_trees_planted || 0), 0) },
            { icon: '♻️', label: 'Waste Diverted', value: `${members.reduce((s, m) => s + (m.impact_waste_kg || 0), 0).toFixed(1)}kg` },
            { icon: '🌍', label: 'Events', value: members.reduce((s, m) => s + (m.impact_events_attended || 0), 0) },
            { icon: '⭐', label: 'Impact Score', value: impactScore },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ flex: '1 1 80px', textAlign: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 'var(--space-3)' }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      {!todayDone ? (
        <button className="btn btn-primary btn-full btn-lg" onClick={() => onNavigate('checkin')}>
          🌱 Log Today's Action
        </button>
      ) : (
        <div className="card card-pad" style={{ textAlign: 'center', border: '1px solid #4CAF5040' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontWeight: 700, color: '#4CAF50' }}>Check-in complete for today!</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Come back tomorrow to keep your streak going.</div>
        </div>
      )}
    </div>
  );
}
