import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

/**
 * Helper component for the top stat boxes (from ContestSummary.js).
 */
const StatCard = ({ title, value, color }) => (
  <div className="card p-6 flex-1 relative overflow-hidden group">
    <div style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }} />
    <div className="form-label mb-2 group-hover:text-[var(--text-primary)] transition-colors">{title}</div>
    <div className="stat-num text-4xl" style={{ color: color }}>{value}</div>
  </div>
);

export default function AdminAnalytics() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [batchFilter, setBatchFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [stats, setStats] = useState({});
  const [batchStats, setBatchStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const deps = await api.fetchDepartments();
        // Assuming deps is an array of objects like { id: 1, name: 'CSE' }
        setDepartments(deps.map((d) => d.name));

        const res = await api.fetchAdminAnalytics(token);
        setUsers(res.users || []);
        setFiltered(res.users || []);
        setStats(res.stats || {});
        setBatchStats(res.batchStats || []);
        setDepartmentStats(res.departmentStats || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  useEffect(() => {
    let result = users;
    if (batchFilter !== 'all')
      result = result.filter((u) => u.batch === batchFilter);
    if (deptFilter !== 'all')
      result = result.filter((u) => u.department === deptFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [users, batchFilter, deptFilter, search]);

  const handleDownload = async () => {
    setDownloadError(null);
    try {
      const blob = await api.downloadAdminAnalytics(token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'admin_batch_stats.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setDownloadError('Failed to download CSV'); // Use styled error
    }
  };

  // Styled loading state
  if (loading) {
    return (
      <div className="card p-8 text-center muted">Loading analytics...</div>
    );
  }

  // Styled error state
  if (error) {
    return (
      <div className="card p-6 bg-[rgba(239,68,68,0.1)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] max-w-lg mx-auto text-center">
        {error}
      </div>
    );
  }

  const batches = Array.from(new Set(users.map((u) => u.batch))).sort();

  return (
    <div className="anim-fade-in space-y-8" style={{ padding: '24px 0' }}>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-[var(--text-secondary)]">Master administrative dashboard for system-wide overview.</p>
      </div>

      {/* Styled Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users ?? 0}
          color="var(--cyan)"
        />
        <StatCard
          title="Faculty"
          value={stats.faculty ?? 0}
          color="var(--violet)"
        />
        <StatCard
          title="Problems"
          value={stats.problems ?? 0}
          color="var(--emerald)"
        />
        <StatCard
          title="Contests"
          value={stats.contests ?? 0}
          color="var(--amber)"
        />
      </div>

      {/* Batch-wise Summary Card */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Batch Summary
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={handleDownload}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export CSV
          </button>
        </div>
        {downloadError && (
          <div className="mb-4 p-3 rounded-md bg-[rgba(239,68,68,0.1)] text-[var(--red)] border border-[rgba(239,68,68,0.2)] text-sm">
            {downloadError}
          </div>
        )}
        {batchStats && batchStats.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="!text-center">Batch</th>
                  <th className="!text-center">Users</th>
                  <th className="!text-center">Peak Rating</th>
                  <th className="!text-center">Max Solved</th>
                  <th className="!text-center">Avg Rating</th>
                  <th className="!text-center">Avg Solved</th>
                </tr>
              </thead>
              <tbody>
                {batchStats.map((b) => (
                  <tr key={b.batch}>
                    <td className="text-center font-bold text-[var(--text-primary)]">{b.batch}</td>
                    <td className="text-center font-mono">{b.users_count}</td>
                    <td className="text-center font-bold text-[var(--amber)] font-mono">{b.highest_rating ?? 0}</td>
                    <td className="text-center font-bold text-[var(--emerald)] font-mono">{b.highest_solved ?? 0}</td>
                    <td className="text-center font-mono muted">
                      {Number(b.avg_rating || 0).toFixed(0)}
                    </td>
                    <td className="text-center font-mono muted">
                      {Number(b.avg_solved || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="muted text-center p-12 bg-[var(--surface-2)]/30 border border-dashed border-[var(--border)] rounded-xl">
            No batch stats available at this time.
          </div>
        )}
      </div>

      {/* Department-wise Summary Card */}
      <div className="card p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--violet)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Department Analytics
        </h3>
        {departmentStats && departmentStats.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th className="!text-center">Students</th>
                  <th className="!text-center">Top Rating</th>
                  <th className="!text-center">Top Solved</th>
                  <th className="!text-center">Avg Rating</th>
                  <th className="!text-center">Avg Solved</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((d) => (
                  <tr key={d.department}>
                    <td className="font-bold text-[var(--text-primary)]">{d.department}</td>
                    <td className="text-center font-mono">{d.users_count}</td>
                    <td className="text-center font-bold text-[var(--amber)] font-mono">{d.highest_rating ?? 0}</td>
                    <td className="text-center font-bold text-[var(--emerald)] font-mono">{d.highest_solved ?? 0}</td>
                    <td className="text-center font-mono muted">
                      {Number(d.avg_rating || 0).toFixed(0)}
                    </td>
                    <td className="text-center font-mono muted">
                      {Number(d.avg_solved || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="muted text-center p-12 bg-[var(--surface-2)]/30 border border-dashed border-[var(--border)] rounded-xl">
            No department data available.
          </div>
        )}
      </div>

      {/* Filter and User Leaderboard Section */}
      <div className="card p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--amber)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Master Leaderboard
            </h3>
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="form-input !text-xs !py-1.5 !pl-9 !w-48 !bg-[var(--surface-2)]"
                    />
                </div>
                <select
                    value={batchFilter}
                    onChange={(e) => setBatchFilter(e.target.value)}
                    className="form-select !text-xs !py-1.5 !bg-[var(--surface-2)] !w-32"
                >
                    <option value="all">All Batches</option>
                    {batches.map((b) => <option key={b} value={b}>Batch {b}</option>)}
                </select>
                <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="form-select !text-xs !py-1.5 !bg-[var(--surface-2)] !w-40"
                >
                    <option value="all">All Depts</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th className="!text-center">Dept</th>
                <th className="!text-center">Batch</th>
                <th className="!text-center">Rating</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => navigate(`/profile/${u.id}`)}
                  className="cursor-pointer"
                >
                  <td>
                    <div className="font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors">{u.name}</div>
                    <div className="text-[10px] muted uppercase font-mono">{u.id}</div>
                  </td>
                  <td className="text-center font-mono text-sm">{u.department || '—'}</td>
                  <td className="text-center font-mono text-sm">{u.batch}</td>
                  <td className="text-center">
                    <span className="badge badge-amber font-mono font-bold">
                      {u.rating}
                    </span>
                  </td>
                  <td className="font-mono text-[10px] muted">{u.email}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center muted py-12 italic bg-[var(--surface-2)]/30 border-dashed"
                  >
                    No matching users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}