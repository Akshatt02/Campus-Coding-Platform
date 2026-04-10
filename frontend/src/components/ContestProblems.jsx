import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import CodeEditor from './CodeEditor';

// Helper to format date (copied from Contests.js for consistency)
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

export default function ContestProblems({ contestId, onSubmit, registered }) {
  const { token, user } = useContext(AuthContext);
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Main component error
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.fetchContestProblems(contestId, token);
        setContest(data.contest || null);
        setProblems(data.problems || []);
        setFiltered(data.problems || []);
      } catch (err) {
        setError(err?.message || 'Failed to load contest problems');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [contestId, token]);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (!s) setFiltered(problems);
    else setFiltered(problems.filter((p) => p.title.toLowerCase().includes(s)));
  }, [search, problems]);

  // Styled loading state
  if (loading) {
    return (
        <div className="card p-12 text-center">
            <div className="ui-spinner ui-spinner-lg mx-auto mb-3" />
            <div className="muted">Loading problems...</div>
        </div>
    );
  }

  // Styled error state
  if (error) {
    return (
      <div className="card p-6 bg-[rgba(239,68,68,0.1)] text-[var(--red)] border-[rgba(239,68,68,0.2)] text-sm text-center">
        {error}
      </div>
    );
  }

  // Styled not found state
  if (!contest) {
    return <div className="card p-12 text-center muted">Contest not found</div>;
  }

  const now = new Date();
  const start = new Date(contest.start_time);
  const end = new Date(contest.end_time);
  const isOngoing = now >= start && now <= end;
  const isPast = now > end;
  const canSubmit = isOngoing;

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="card p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Contest Problems</h2>
            <span className={`badge ${isOngoing ? 'badge-green' : isPast ? 'badge-default' : 'badge-cyan'}`}>
                {isOngoing ? 'Live' : isPast ? 'Ended' : 'Upcoming'}
            </span>
          </div>
          <div className="text-sm font-mono muted bg-[var(--surface-2)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
            <span className="text-[var(--cyan)]">{formatDateTime(contest.start_time)}</span>
            <span className="mx-2 opacity-30">→</span>
            <span className="text-[var(--emerald)]">{formatDateTime(contest.end_time)}</span>
          </div>
        </div>

        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
            <input
              type="text"
              placeholder="Search problems by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input !pl-11"
            />
        </div>

        {/* Styled Info/Warning Messages */}
        {!canSubmit && isPast && (
          <div className="mt-6 p-4 text-sm bg-gray-500/5 text-gray-400 rounded-xl border border-gray-500/10 flex items-center gap-3">
             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Contest finished — submissions closed.
          </div>
        )}
        {!canSubmit && !isPast && (
          <div className="mt-6 p-4 text-sm bg-[var(--cyan-dim)] text-[var(--cyan)] rounded-xl border border-[var(--cyan-glow)] flex items-center gap-3">
             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Contest has not started yet.
          </div>
        )}
        {user && user.role === 'user' && !registered && (
          <div className="mt-6 p-4 text-sm bg-[rgba(245,158,11,0.1)] text-[var(--amber)] rounded-xl border border-[rgba(245,158,11,0.2)] flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            You are not registered for this contest. Please register to submit solutions.
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="card p-8 text-center muted">No problems found.</div>
      )}

      {/* Problem List */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="card p-5 flex flex-col md:flex-row md:items-center md:justify-between group hover:border-[var(--border-accent)] transition-all"
          >
            <div>
              <div className="text-lg font-bold group-hover:text-[var(--cyan)] transition-colors">{p.title}</div>
              <div className="text-xs font-mono muted uppercase tracking-wider mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${p.difficulty === 'easy' ? 'bg-[var(--emerald)]' : p.difficulty === 'hard' ? 'bg-[var(--red)]' : 'bg-[var(--amber)]'}`} />
                    {p.difficulty}
                </span>
                {p.tags && (
                    <>
                        <span className="opacity-30">|</span>
                        <span>{p.tags}</span>
                    </>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedProblemId(p.id)}
                disabled={!canSubmit || !registered}
              >
                Solve
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProblemId && (
        <div className="mt-6">
          <CodeEditor problemId={selectedProblemId} contestId={contestId} onSubmit={onSubmit} />
          <div className="mt-4 text-center">
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedProblemId(null)}
            >
              Close Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
}