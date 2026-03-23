import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const VERDICT_CONFIG = {
  AC:  { label: 'Accepted',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> },
  WA:  { label: 'Wrong',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg> },
  TLE: { label: 'Time Limit',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  RE:  { label: 'Runtime Err', color: '#a78bfa', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.25)', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  CE:  { label: 'Compile Err', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)', icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
};

function getVerdict(v) {
  return VERDICT_CONFIG[v] || { label: v, color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border)', icon: '?' };
}

function VerdictBadge({ verdict }) {
  const cfg = getVerdict(verdict);
  return (
    <span className="badge font-bold px-3 py-1 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
      {cfg.icon}
      {verdict === 'AC' ? 'Accepted' : verdict === 'WA' ? 'Wrong' : verdict === 'TLE' ? 'Time Limit' : verdict === 'RE' ? 'Runtime Err' : verdict === 'CE' ? 'Compile Err' : verdict}
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
      {[
        { label: 'Submissions', value: total, color: 'var(--text-secondary)' },
        { label: 'Accepted', value: acCount, color: 'var(--emerald)' },
        { label: 'Success Rate', value: `${rate}%`, color: rate > 60 ? 'var(--emerald)' : rate > 30 ? 'var(--amber)' : 'var(--red)' },
        { label: 'Attempted', value: distinctProblems, color: 'var(--cyan)' },
        { label: 'Solved', value: solvedProblems, color: 'var(--violet)' },
      ].map(({ label, value, color }) => (
        <div key={label} className="card p-6 flex flex-col items-center justify-center text-center group">
          <div className="stat-num text-3xl mb-1 group-hover:scale-110 transition-transform" style={{ color }}>{value}</div>
          <div className="muted font-bold uppercase tracking-widest text-[9px]">{label}</div>
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
    <>
      <div className="max-w-5xl mx-auto space-y-8 anim-fade-in" style={{ padding: '24px 0' }}>
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Submission Logs</h1>
            <p className="text-[var(--text-secondary)]">A comprehensive archive of your coding performance and problem history.</p>
          </div>

          {loading && (
            <div className="card p-12 text-center">
              <div style={{ width: 32, height: 32, margin: '0 auto 12px', border: '3px solid var(--border)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <div className="muted font-display uppercase tracking-widest text-xs">Retrieving Submissions...</div>
            </div>
          )}

          {err && (
            <div className="card p-6 bg-[rgba(239,68,68,0.1)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] text-center">
              {err}
            </div>
          )}

          {!loading && !err && (
            <>
              {/* Stats bar */}
              <StatsBar subs={subs} />

              {/* Filters */}
              <div className="card p-4 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input
                    className="form-input !pl-11 !bg-[var(--surface-2)] !py-2.5"
                    placeholder="Seach by problem title..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 p-1 bg-[var(--surface-2)] rounded-lg">
                  {['ALL', 'AC', 'WA', 'TLE', 'RE', 'CE'].map(v => {
                    const isActive = verdictFilter === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setVerdictFilter(v)}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                          isActive 
                            ? 'bg-[var(--surface-3)] text-[var(--cyan)] shadow-sm' 
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]/50'
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table */}
              {filtered.length === 0 ? (
                <div className="card p-12 text-center muted italic border-dashed border-[var(--border)]">
                  No submissions found matching the criteria.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Problem</th>
                        <th className="!text-center">Timestamp</th>
                        <th className="!text-right">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div className="font-bold text-[var(--text-primary)]">{s.title || `Problem #${s.problem_id}`}</div>
                            {s.contest_id && (
                              <div className="text-[10px] muted font-mono mt-0.5">CONTEST #{s.contest_id}</div>
                            )}
                          </td>
                          <td className="text-center font-mono text-[var(--text-muted)] text-xs">
                            {formatRelative(s.created_at)}
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end">
                              <VerdictBadge verdict={s.verdict} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {filtered.length > 0 && (
                <div className="text-right mt-4 text-xs muted font-mono uppercase tracking-tighter">
                  Showing {filtered.length} of {subs.length} submissions
                </div>
              )}
            </>
          )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}