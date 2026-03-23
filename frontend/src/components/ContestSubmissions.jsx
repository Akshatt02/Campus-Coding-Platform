import React, { useEffect, useState } from 'react';
import api from '../api';

// Helper function (from Submissions.js)
const getVerdictStyle = (verdict) => {
  if (!verdict) return 'badge-default';
  const v = verdict.toLowerCase();
  if (v.includes('ac')) return 'badge-green';
  if (v.includes('wa') || v.includes('re')) return 'badge-red';
  if (v.includes('tle')) return 'badge-amber';
  if (v.includes('ce')) return 'badge-blue';
  return 'badge-default';
};

// Helper function (from Contests.js)
const formatDateTime = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleString(undefined, options);
};

export default function ContestSubmissions({ contest, token }) {
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    user_name: '',
    verdict: '',
    problem_title: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchContestSubmissions(token, contest.id, filters);
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && contest?.id) load();
  }, [token, contest?.id]); // Only load on initial mount

  const apply = async (e) => {
    e?.preventDefault();
    await load();
  };

  // Reset filters and reload data
  const reset = async () => {
    const newFilters = { user_name: '', verdict: '', problem_title: '' };
    setFilters(newFilters);
    // Need to pass newFilters to load() directly, since setState is async
    setLoading(true);
    setError('');
    try {
      const data = await api.fetchContestSubmissions(token, contest.id, newFilters);
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8 anim-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            <h3 className="text-xl font-bold mb-1">Submissions</h3>
            <p className="text-sm muted">
                Complete log of submissions during the contest.
            </p>
        </div>
        <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={load}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Sync
            </button>
        </div>
      </div>

      {/* Styled filter form */}
      <form
        onSubmit={apply}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8 p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl"
      >
        <div className="form-group flex-1">
          <label className="form-label">User</label>
          <input
            placeholder="Search name..."
            value={filters.user_name}
            onChange={(e) =>
              setFilters({ ...filters, user_name: e.target.value })
            }
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Verdict</label>
          <select
            value={filters.verdict}
            onChange={(e) =>
              setFilters({ ...filters, verdict: e.target.value })
            }
            className="form-select"
          >
            <option value="" className="form-option">All</option>
            <option value="AC" className="form-option">Accepted</option>
            <option value="WA" className="form-option">Wrong Answer</option>
            <option value="TLE" className="form-option">Time Limit</option>
            <option value="RE" className="form-option">Runtime Error</option>
            <option value="CE" className="form-option">Compile Error</option>
          </select>
        </div>
        <div className="form-group flex-1">
          <label className="form-label">Problem</label>
          <input
            placeholder="Search title..."
            value={filters.problem_title}
            onChange={(e) =>
              setFilters({ ...filters, problem_title: e.target.value })
            }
            className="form-input"
          />
        </div>
        <div className="flex gap-3 h-[45px]">
          <button className="btn btn-primary flex-1" type="submit">
            Filter
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </form>

      {/* Styled states */}
      {error && (
        <div className="p-4 rounded-xl bg-[rgba(239,68,68,0.1)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] text-sm mb-6 text-center">
          {error}
        </div>
      )}
      {loading && <div className="card p-12 text-center">
            <div style={{ width: 32, height: 32, margin: '0 auto 12px', border: '3px solid var(--border)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div className="muted">Loading submissions...</div>
        </div>
      }

      {!loading && !error && submissions.length === 0 && (
        <div className="muted text-center p-12 card bg-[var(--surface-2)] border-dashed">No submissions found.</div>
      )}

      {/* Styled table */}
      {!loading && !error && submissions.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Problem</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="text-xs font-mono muted">
                    {formatDateTime(s.created_at)}
                  </td>
                  <td className="font-bold text-[var(--text-primary)]">{s.user_name}</td>
                  <td className="font-medium">{s.problem_title}</td>
                  <td>
                    <span className={`badge ${getVerdictStyle(s.verdict)}`}>
                      {s.verdict}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}