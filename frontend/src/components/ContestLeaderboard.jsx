import React, { useEffect, useState } from 'react';
import api from '../api';

export default function ContestLeaderboard({ contest, token }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.fetchContestLeaderboard(token, contest.id);
        setRows(data.leaderboard || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    if (token && contest.id) load();
  }, [contest.id, token]);

  return (
    <div className="card p-8 anim-fade-in">
      <h3 className="text-xl font-bold mb-6">Leaderboard</h3>

      {loading && (
          <div className="p-12 text-center">
            <div className="ui-spinner ui-spinner-lg mx-auto mb-3" />
            <div className="muted">Loading leaderboard...</div>
          </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[rgba(239,68,68,0.1)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] text-sm mb-6 text-center">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="data-table">
            <thead>
              <tr>
                <th className="!text-center">Rank</th>
                <th>User</th>
                <th className="!text-center">Solved</th>
                <th className="!text-center">Penalty</th>
                <th className="!text-center">Time (min)</th>
                <th className="!text-center">Wrongs</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user_id} className={r.rank <= 3 ? 'bg-[var(--surface-2)]/50' : ''}>
                  <td className="text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-extrabold ${
                        r.rank === 1 ? 'bg-[var(--amber)] text-[var(--on-accent)] shadow-sm' :
                        r.rank === 2 ? 'bg-stone-300 text-stone-900' :
                        r.rank === 3 ? 'bg-amber-800 text-[var(--on-accent)]' : 'text-[var(--text-muted)]'
                    }`}>
                        {r.rank}
                    </span>
                  </td>
                  <td className="font-bold text-[var(--text-primary)]">{r.user_name}</td>
                  <td className="text-center font-bold text-[var(--emerald)] font-mono">
                    {r.solved_count}
                  </td>
                  <td className="text-center font-mono">{r.penalty}</td>
                  <td className="text-center font-mono">{r.time_sum_minutes}</td>
                  <td className="text-center text-[var(--red)] font-semibold font-mono">{r.wrong_before_total}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center muted py-12 bg-[var(--surface-2)]/30 border-dashed"
                  >
                    No leaderboard data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}