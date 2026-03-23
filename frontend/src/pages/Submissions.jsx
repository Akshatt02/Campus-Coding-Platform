import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const VERDICT_CONFIG = {
  AC:  { label: 'Accepted',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: '✓' },
  WA:  { label: 'Wrong',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: '✗' },
  TLE: { label: 'Time Limit',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: '⏱' },
  RE:  { label: 'Runtime Err', color: '#a78bfa', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.25)', icon: '⚡' },
  CE:  { label: 'Compile Err', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)', icon: '⚙' },
};

function getVerdict(v) {
  return VERDICT_CONFIG[v] || { label: v, color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)', icon: '?' };
}

function VerdictBadge({ verdict }) {
  const cfg = getVerdict(verdict);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 6, fontSize: 11, fontWeight: 700,
      fontFamily: 'var(--font-display)', letterSpacing: '0.04em',
      color: cfg.color, textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 10 }}>{cfg.icon}</span>
      {verdict}
    </span>
  );
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatsBar({ subs }) {
  const total = subs.length;
  if (total === 0) return null;

  const counts = {};
  subs.forEach(s => { counts[s.verdict] = (counts[s.verdict] || 0) + 1; });
  const acCount = counts.AC || 0;
  const rate = total ? Math.round((acCount / total) * 100) : 0;

  const distinctProblems = new Set(subs.map(s => s.problem_id)).size;
  const solvedProblems = new Set(subs.filter(s => s.verdict === 'AC').map(s => s.problem_id)).size;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
      gap: 12, marginBottom: 24,
    }}>
      {[
        { label: 'Total Submissions', value: total, color: 'var(--text-primary)' },
        { label: 'Accepted', value: acCount, color: 'var(--emerald)' },
        { label: 'Acceptance Rate', value: `${rate}%`, color: rate > 60 ? 'var(--emerald)' : rate > 30 ? '#f59e0b' : '#ef4444' },
        { label: 'Problems Attempted', value: distinctProblems, color: 'var(--cyan)' },
        { label: 'Problems Solved', value: solvedProblems, color: '#a78bfa' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12, padding: '16px 18px',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 26, color, lineHeight: 1, marginBottom: 5,
          }}>{value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Submissions() {
  const { token } = useContext(AuthContext);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [filter, setFilter] = useState('');
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await api.getMySubmissions(token);
        setSubs(res.data || []);
      } catch (e) {
        setErr(e?.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const filtered = subs.filter(s => {
    const matchTitle = !filter || s.title?.toLowerCase().includes(filter.toLowerCase());
    const matchVerdict = verdictFilter === 'ALL' || s.verdict === verdictFilter;
    return matchTitle && matchVerdict;
  });

  return (
    <div style={{ minHeight: '100vh', padding: '32px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800,
            letterSpacing: '-0.02em', marginBottom: 4,
          }}>
            My Submissions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Your complete submission history across all problems
          </p>
        </div>

        {loading && (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '60px 24px', textAlign: 'center',
            color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
          }}>
            <div style={{
              width: 32, height: 32, margin: '0 auto 12px',
              border: '3px solid var(--border)', borderTopColor: 'var(--cyan)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            Loading submissions...
          </div>
        )}

        {err && (
          <div style={{
            padding: '14px 18px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10,
            color: '#f87171', fontSize: 14, marginBottom: 24,
          }}>⚠ {err}</div>
        )}

        {!loading && !err && (
          <>
            {/* Stats bar */}
            <StatsBar subs={subs} />

            {/* Filters */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', gap: 12, alignItems: 'center',
              flexWrap: 'wrap', marginBottom: 12,
            }}>
              <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', fontSize: 14, pointerEvents: 'none',
                }}>🔍</span>
                <input
                  className="form-input"
                  placeholder="Filter by problem..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{ paddingLeft: 34, fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['ALL', 'AC', 'WA', 'TLE', 'RE', 'CE'].map(v => {
                  const cfg = v === 'ALL' ? null : getVerdict(v);
                  const isActive = verdictFilter === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setVerdictFilter(v)}
                      style={{
                        padding: '5px 12px',
                        background: isActive
                          ? (cfg ? cfg.bg : 'var(--cyan-dim)')
                          : 'var(--bg-2)',
                        border: `1px solid ${isActive ? (cfg ? cfg.border : 'var(--cyan)') : 'var(--border)'}`,
                        borderRadius: 6, cursor: 'pointer',
                        fontSize: 11, fontWeight: 700,
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '0.04em',
                        color: isActive ? (cfg ? cfg.color : 'var(--cyan)') : 'var(--text-muted)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '60px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>
                  No submissions found
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  {subs.length === 0 ? "You haven't submitted any solutions yet." : "No submissions match your current filter."}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 14, overflow: 'hidden',
              }}>
                {/* Table header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 130px 110px',
                  padding: '10px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                }}>
                  {['Problem', 'When', 'Verdict'].map(h => (
                    <div key={h} style={{
                      fontSize: 11, fontWeight: 600,
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.07em', textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      textAlign: h === 'Verdict' ? 'right' : 'left',
                    }}>{h}</div>
                  ))}
                </div>

                {/* Rows */}
                {filtered.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 130px 110px',
                      padding: '14px 20px',
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                      alignItems: 'center',
                      transition: 'background 0.15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Problem name */}
                    <div>
                      <div style={{
                        fontWeight: 600, fontSize: 14,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '-0.01em',
                      }}>
                        {s.title || `Problem #${s.problem_id}`}
                      </div>
                      {s.contest_id && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                          Contest #{s.contest_id}
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {formatRelative(s.created_at)}
                    </div>

                    {/* Verdict */}
                    <div style={{ textAlign: 'right' }}>
                      <VerdictBadge verdict={s.verdict} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtered.length > 0 && (
              <div style={{
                textAlign: 'right', marginTop: 10,
                fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)',
              }}>
                Showing {filtered.length} of {subs.length} submissions
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}