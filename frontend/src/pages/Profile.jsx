import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

function StatCard({ icon, label, value, sub, color = 'var(--cyan)', accent }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '22px 20px',
      position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.25s, box-shadow 0.25s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color;
      e.currentTarget.style.boxShadow = `0 0 20px ${color}22`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}12, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 22, marginBottom: 10 }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30,
        color, lineHeight: 1, marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function DifficultyBar({ label, attempted, solved, color }) {
  const pct = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8,
            borderRadius: '50%', background: color,
            boxShadow: `0 0 6px ${color}`,
          }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{attempted} attempted</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color }}>{solved} solved</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color,
          borderRadius: 2,
          boxShadow: `0 0 8px ${color}66`,
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}

function TagRow({ name, attempted, solved }) {
  const pct = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{name}</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--cyan)' }}>{solved}</span>/{attempted}
          </span>
        </div>
        <div style={{ height: 3, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: pct > 70 ? 'var(--emerald)' : pct > 40 ? 'var(--cyan)' : '#f59e0b',
            borderRadius: 2, transition: 'width 0.6s',
          }} />
        </div>
      </div>
    </div>
  );
}

function getRatingColor(rating) {
  if (!rating) return 'var(--text-muted)';
  if (rating >= 2100) return '#f59e0b';
  if (rating >= 1900) return '#a78bfa';
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
      <div style={{ padding: '20px 24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, color: '#f87171', fontSize: 14 }}>
        ⚠ {error}
      </div>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--text-muted)' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 14 }}>Loading profile...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const { user, stats, weak_topics, difficulty_counts = [], tag_counts = [], contests_count = 0, contest_history = [] } = profile;
  const ratingColor = getRatingColor(user.rating);
  const ratingLabel = getRatingLabel(user.rating);

  const getDiff = (d) => difficulty_counts.find(r => (r.difficulty || '').toLowerCase() === d) || { attempted: 0, solved: 0 };
  const weakFiltered = (weak_topics || []).filter(t => Number(t.wrong_percent) >= 40);

  return (
    <div style={{ minHeight: '100vh', padding: '32px 0 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* ── PROFILE HEADER ── */}
        <div className="anim-fade-up" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 20, padding: '28px 32px',
          marginBottom: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200,
            background: `radial-gradient(circle, ${ratingColor}10 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: `linear-gradient(135deg, ${ratingColor}, ${ratingColor}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: '#080c14',
              fontFamily: 'var(--font-display)',
              boxShadow: `0 0 24px ${ratingColor}44`,
              flexShrink: 0,
            }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24,
                  letterSpacing: '-0.02em', margin: 0,
                }}>
                  {user.name}
                </h1>
                {ratingLabel && (
                  <span style={{
                    padding: '3px 10px',
                    background: `${ratingColor}15`,
                    border: `1px solid ${ratingColor}40`,
                    borderRadius: 6,
                    fontSize: 11, fontWeight: 700,
                    fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: ratingColor,
                  }}>{ratingLabel}</span>
                )}
                {isOwnProfile && (
                  <span style={{
                    padding: '3px 10px',
                    background: 'var(--cyan-dim)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    borderRadius: 6,
                    fontSize: 11, fontWeight: 700,
                    fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--cyan)',
                  }}>You</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {user.department || 'No Department'} · Batch {user.batch || '—'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {user.email}
                </span>
              </div>
            </div>

            {/* Rating big display */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 48, lineHeight: 1, color: ratingColor,
                textShadow: `0 0 30px ${ratingColor}66`,
              }}>
                {user.rating ?? '—'}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>
                Rating
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div className="anim-fade-up delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12, marginBottom: 24,
        }}>
          <StatCard icon="📤" label="Submissions" value={stats.total} color="var(--text-secondary)" />
          <StatCard icon="✅" label="Accepted" value={stats.ac} color="var(--emerald)" />
          <StatCard icon="🎯" label="Accuracy" value={`${stats.ac_percent}%`} color={stats.ac_percent > 60 ? 'var(--emerald)' : '#f59e0b'} />
          <StatCard icon="🏆" label="Contests" value={contests_count} color="var(--cyan)" />
        </div>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="anim-fade-up delay-2">

          {/* Difficulty Breakdown */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>
              Difficulty Breakdown
            </h3>
            <DifficultyBar label="Easy" {...getDiff('easy')} color="var(--emerald)" />
            <DifficultyBar label="Medium" {...getDiff('medium')} color="#f59e0b" />
            <DifficultyBar label="Hard" {...getDiff('hard')} color="#ef4444" />
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
                <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                <div style={{ color: 'var(--emerald)', fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: 14 }}>No weak topics found</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Keep up the great work!</div>
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
                        <div style={{ height: '100%', width: `${t.wrong_percent}%`, background: '#ef4444', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: '#f87171', minWidth: 40, textAlign: 'right' }}>
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
                <div style={{ fontSize: 28, marginBottom: 8 }}>🏅</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No contests participated yet</div>
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
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.04)'}
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}