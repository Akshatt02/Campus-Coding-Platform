import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

function StatCard({ icon, label, value, sub, color = 'var(--cyan)' }) {
  return (
    <div className="card p-6 flex-1 relative overflow-hidden group">
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}12, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div className="text-2xl mb-4 opacity-80 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="stat-num text-3xl mb-1" style={{ color }}>
        {value}
      </div>
      <div className="muted uppercase tracking-widest text-[10px] font-bold">
        {label}
      </div>
      {sub && <div className="text-[11px] muted mt-2 italic">{sub}</div>}
    </div>
  );
}

function DifficultyBar({ label, attempted, solved, color }) {
  const pct = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
  return (
    <div className="py-4 border-b border-[var(--border)] last:border-0">
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-2.5">
          <span style={{
            display: 'inline-block', width: 8, height: 8,
            borderRadius: '50%', background: color,
            boxShadow: `0 0 10px ${color}88`,
          }} />
          <span className="font-bold text-[var(--text-primary)] text-sm">{label}</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-[11px] muted font-mono">{attempted} tried</span>
          <span className="font-mono font-bold text-sm" style={{ color }}>{solved} solved</span>
        </div>
      </div>
      <div className="h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 12px ${color}44`,
          }}
        />
      </div>
    </div>
  );
}

function TagRow({ name, attempted, solved }) {
  const pct = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--border)] last:border-0 group">
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors">{name}</span>
          <span className="text-[10px] font-mono muted">
            <span className="text-[var(--cyan)] font-bold">{solved}</span>/{attempted}
          </span>
        </div>
        <div className="h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct > 70 ? 'var(--emerald)' : pct > 40 ? 'var(--cyan)' : 'var(--amber)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function getRatingColor(rating) {
  if (!rating) return 'var(--text-muted)';
  if (rating >= 2100) return 'var(--amber)';
  if (rating >= 1900) return 'var(--violet)';
  if (rating >= 1700) return 'var(--cyan)';
  if (rating >= 1500) return 'var(--emerald)';
  return 'var(--text-secondary)';
}

function getRatingLabel(rating) {
  if (!rating) return '';
  if (rating >= 2100) return 'Grandmaster';
  if (rating >= 1900) return 'Master';
  if (rating >= 1700) return 'Expert';
  if (rating >= 1500) return 'Specialist';
  return 'Newbie';
}

export default function Profile() {
  const { token, user: authUser } = useContext(AuthContext);
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const isOwnProfile = !id || id === String(authUser?.id);

  useEffect(() => {
    const load = async () => {
      try {
        const data = id
          ? await api.fetchProfileById(token, id)
          : await api.fetchProfile(token);
        setProfile(data);
      } catch (err) {
        setError(err?.message || 'Failed to load profile');
      }
    };
    if (token) load();
  }, [token, id]);

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="ui-alert-error" style={{ padding: '20px 24px', gap: 10 }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {error}
      </div>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
        <div className="ui-spinner ui-spinner-lg" />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14 }}>Loading profile...</span>
      </div>
    </div>
  );

  const { user, stats, weak_topics, difficulty_counts = [], tag_counts = [], contests_count = 0, contest_history = [] } = profile;
  const ratingColor = getRatingColor(user.rating);
  const ratingLabel = getRatingLabel(user.rating);

  const getDiff = (d) => difficulty_counts.find(r => (r.difficulty || '').toLowerCase() === d) || { attempted: 0, solved: 0 };
  const weakFiltered = (weak_topics || []).filter(t => Number(t.wrong_percent) >= 40);

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 anim-fade-in" style={{ padding: '24px 0' }}>
        {/* ── PROFILE HEADER ── */}
        <div className="card p-10 relative overflow-hidden">
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: -100, right: -100,
            width: 300, height: 300,
            background: `radial-gradient(circle, ${ratingColor}15 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div className="flex items-start gap-10 flex-wrap lg:flex-nowrap relative z-1">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl font-extrabold shadow-2xl flex-shrink-0"
                 style={{
                   background: `linear-gradient(135deg, ${ratingColor}, ${ratingColor}88)`,
                   boxShadow: `0 12px 40px ${ratingColor}33`,
                   color: 'var(--on-accent)',
                 }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-4xl font-extrabold tracking-tight">{user.name}</h1>
                {ratingLabel && (
                  <span className="badge font-bold px-3 py-1 uppercase tracking-widest text-[10px]"
                        style={{ background: `${ratingColor}15`, border: `1px solid ${ratingColor}40`, color: ratingColor }}>
                    {ratingLabel}
                  </span>
                )}
                {isOwnProfile && <span className="badge badge-cyan font-bold px-3 py-1 uppercase tracking-widest text-[10px]">Your Profile</span>}
              </div>
              <div className="flex gap-6 items-center flex-wrap">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    {user.department || 'No Department'} · Batch {user.batch || '—'}
                </div>
                <div className="flex items-center gap-2 muted font-mono text-sm leading-none">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     {user.email}
                </div>
              </div>
            </div>

            {/* Rating big display */}
            <div className="text-right lg:pl-10 lg:border-l border-[var(--border)]">
              <div className="stat-num text-7xl leading-none" style={{ color: ratingColor, textShadow: `0 0 40px ${ratingColor}55` }}>
                {user.rating ?? '—'}
              </div>
              <div className="muted font-bold uppercase tracking-[0.2em] text-[10px] mt-3">Platform Rating</div>
            </div>
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
            label="Total Submissions"
            value={stats.total}
            color="var(--text-secondary)"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
            label="Accepted (AC)"
            value={stats.ac}
            color="var(--emerald)"
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            label="Success Rate"
            value={`${stats.ac_percent}%`}
            color={stats.ac_percent > 60 ? 'var(--emerald)' : 'var(--amber)'}
          />
          <StatCard
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.143-7.714L2 12l6.857-2.143L11 3z" /></svg>}
            label="Competitions"
            value={contests_count}
            color="var(--cyan)"
          />
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="anim-fade-up delay-2">

          {/* Difficulty Breakdown */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
              Difficulty Breakdown
            </h3>
            <DifficultyBar label="Easy" {...getDiff('easy')} color="var(--emerald)" />
            <DifficultyBar label="Medium" {...getDiff('medium')} color="var(--amber)" />
            <DifficultyBar label="Hard" {...getDiff('hard')} color="var(--red)" />
          </div>

          {/* Weak Topics */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4, color: 'var(--text-primary)' }}>
              Weak Topics
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Topics with ≥40% wrong submissions
            </p>
            {weakFiltered.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ color: 'var(--emerald)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div style={{ color: 'var(--emerald)', fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: 14 }}>No weak topics identified</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Excellent performance across all areas.</div>
              </div>
            ) : (
              <div>
                {weakFiltered.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: i < weakFiltered.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                      {t.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 3, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${t.wrong_percent}%`, background: 'var(--red)', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: 'var(--red)', minWidth: 40, textAlign: 'right' }}>
                        {t.wrong_percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tag-wise */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
              Topics Progress
            </h3>
            {tag_counts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No data yet</div>
            ) : (
              <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                {tag_counts.map(t => <TagRow key={t.name} {...t} />)}
              </div>
            )}
          </div>

          {/* Contest History */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
              Contest History
            </h3>
            {contest_history.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                    <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No contest participation recorded yet</div>
              </div>
            ) : (
              <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                {contest_history.map((c, i) => (
                  <Link
                    key={c.id}
                    to={`/contests/${c.id}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 10px', marginBottom: 2,
                      borderRadius: 8, textDecoration: 'none',
                      transition: 'background 0.15s',
                      borderBottom: i < contest_history.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(161,98,7,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(c.start_time).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px',
                      background: c.solved_count > 0 ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
                      border: `1px solid ${c.solved_count > 0 ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                      borderRadius: 6,
                      fontSize: 12, fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      color: c.solved_count > 0 ? 'var(--emerald)' : 'var(--text-muted)',
                    }}>
                      {c.solved_count} solved
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}