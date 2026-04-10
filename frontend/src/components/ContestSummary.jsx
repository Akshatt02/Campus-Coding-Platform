import React, { useEffect, useState } from 'react';
import api from '../api';

/**
 * Helper component for the top stat boxes.
 */
const StatCard = ({ title, value, children, color }) => (
  <div className="p-5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl flex-1 relative overflow-hidden">
    <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }} />
    <div className="form-label mb-2">{title}</div>
    {value !== undefined && (
      <div className="stat-num text-3xl" style={{ color: color || 'var(--text-primary)' }}>{value}</div>
    )}
    {children && <div className="mt-2">{children}</div>}
  </div>
);

export default function ContestSummary({ contest, token }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [solversCount, setSolversCount] = useState(0);
  const [percentSolvers, setPercentSolvers] = useState(0);
  const [hardest, setHardest] = useState(null);
  const [easiest, setEasiest] = useState(null);

  useEffect(() => {
    if (!contest || !token) return;
    let mounted = true;
    setLoading(true);
    api
      .fetchContestSummary(token, contest.id)
      .then((res) => {
        if (!mounted) return;
        setSummary(res?.summary || []);
        setParticipantsCount(res?.participantsCount || 0);
        setSolversCount(res?.solversCount || 0);
        setPercentSolvers(res?.percent_solvers || 0);
        setHardest(res?.hardestProblem || null);
        setEasiest(res?.easiestProblem || null);
      })
      .catch((err) => setError(err?.message || 'Failed to load summary'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [contest, token]);

  // Styled loading state
  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="ui-spinner ui-spinner-lg mx-auto mb-3" />
        <div className="muted">Loading summary...</div>
      </div>
    );
  }

  // Styled error state
  if (error) {
    return (
      <div className="card p-6 bg-[rgba(239,68,68,0.1)] text-[var(--red)] border-[rgba(239,68,68,0.2)] max-w-lg mx-auto text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="card p-8">
      <h3 className="text-xl font-bold mb-6">Contest Summary</h3>

      {/* Styled Stat Boxes */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Participants"
          value={participantsCount}
          color="var(--cyan)"
        />
        <StatCard title="Solved ≥ 1" color="var(--emerald)">
          <div className="stat-num text-3xl text-[var(--emerald)]">
            {solversCount}
            <span className="text-lg muted ml-2 font-medium">
              ({percentSolvers.toFixed(1)}%)
            </span>
          </div>
        </StatCard>
        <StatCard title="Hardest / Easiest" color="var(--amber)">
          <div className="text-xs space-y-2 mt-1">
            {hardest ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)] shadow-[0_0_6px_var(--red)]" />
                <span className="font-semibold text-[var(--text-primary)]">{hardest.problem_title}</span>
                <span className="muted">({(hardest.success_rate * 100).toFixed(1)}%)</span>
              </div>
            ) : (
              <div className="muted">-</div>
            )}
            {easiest ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] shadow-[0_0_6px_var(--emerald)]" />
                <span className="font-semibold text-[var(--text-primary)]">{easiest.problem_title}</span>
                <span className="muted">({(easiest.success_rate * 100).toFixed(1)}%)</span>
              </div>
            ) : null}
          </div>
        </StatCard>
      </div>

      {/* Styled Table */}
      {summary.length === 0 ? (
        <div className="muted text-center p-12">
          No problems or submissions yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="data-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th className="text-center">Submissions</th>
                <th className="text-center">AC</th>
                <th className="text-center">Unique Solvers</th>
                <th className="text-center">Avg subs to AC</th>
                <th className="text-center">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.problem_id}>
                  <td className="font-bold text-[var(--text-primary)]">{s.problem_title}</td>
                  <td className="text-center font-mono">{Number(s.submissions) || 0}</td>
                  <td className="text-center text-[var(--emerald)] font-bold font-mono">{Number(s.ac_count) || 0}</td>
                  <td className="text-center text-[var(--cyan)] font-bold font-mono">{Number(s.unique_solvers) || 0}</td>
                  <td className="text-center font-mono">
                    {s.avg_submissions_to_ac
                      ? s.avg_submissions_to_ac.toFixed(2)
                      : '-'}
                  </td>
                  <td className="text-center">
                    <span className={`badge ${s.success_rate > 0.7 ? 'badge-green' : s.success_rate > 0.3 ? 'badge-amber' : 'badge-red'}`}>
                        {(s.success_rate * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
