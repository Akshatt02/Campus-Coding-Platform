import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';
import CodeEditor from './CodeEditor';

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

const getDifficultyBadge = (difficulty) => {
  const d = (difficulty || '').toLowerCase();
  if (d === 'easy') return '!bg-green-100 !text-green-800';
  if (d === 'medium') return '!bg-yellow-100 !text-yellow-800';
  if (d === 'hard') return '!bg-red-100 !text-red-800';
  return 'badge badge-default';
};

export default function ContestProblems({ contestId, registered }) {
  const { token, user } = useContext(AuthContext);
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false);
        setError('');
        setContest(null);
        setProblems([]);
        setFiltered([]);
        return;
      }
      setLoading(true);
      try {
        const data = await api.fetchContestProblems(contestId, token);
        setContest(data.contest || null);
        const list = data.problems || [];
        setProblems(list);
        setFiltered(list);
      } catch (err) {
        setError(err?.message || 'Failed to load contest problems');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contestId, token]);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    if (!s) setFiltered(problems);
    else setFiltered(problems.filter((p) => p.title.toLowerCase().includes(s)));
  }, [search, problems]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedProblemId(null);
      return;
    }
    if (!filtered.some((p) => p.id === selectedProblemId)) {
      setSelectedProblemId(filtered[0].id);
    }
  }, [filtered, selectedProblemId]);

  const selected = useMemo(
    () => filtered.find((p) => p.id === selectedProblemId) || filtered[0] || null,
    [filtered, selectedProblemId]
  );

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="ui-spinner ui-spinner-lg mx-auto mb-3" />
        <div className="muted">Loading problems…</div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="card p-10 text-center">
        <p className="mb-4 text-[var(--text-secondary)]">Sign in to view problems and the contest workspace.</p>
        <Link to="/login" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.06)] p-6 text-center text-sm text-[var(--red)]">
        {error}
      </div>
    );
  }

  if (!contest) {
    return <div className="card p-12 text-center muted">Contest not found</div>;
  }

  const now = new Date();
  const start = new Date(contest.start_time);
  const end = new Date(contest.end_time);
  const isOngoing = now >= start && now <= end;
  const isPast = now > end;
  const canSubmit = isOngoing;

  const staffCanTry =
    user && (user.role === 'admin' || user.role === 'faculty');
  const canUseContestEditor =
    canSubmit && (registered || staffCanTry);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Problems</h2>
            <span
              className={`badge font-bold ${isOngoing ? 'badge-green' : isPast ? 'badge-default' : 'badge-cyan'}`}
            >
              {isOngoing ? 'Live' : isPast ? 'Ended' : 'Upcoming'}
            </span>
          </div>
          <div className="font-mono text-xs text-[var(--text-muted)] sm:text-sm">
            <span className="text-[var(--cyan)]">{formatDateTime(contest.start_time)}</span>
            <span className="mx-2 opacity-40">→</span>
            <span className="text-[var(--emerald)]">{formatDateTime(contest.end_time)}</span>
          </div>
        </div>

        <div className="relative mt-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search problems…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input !pl-11"
          />
        </div>

        {isPast && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-secondary)]">
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-[var(--text-primary)]">This contest has ended</p>
              <p className="mt-1 text-[var(--text-secondary)]">
                Submissions are closed.{' '}
                <strong className="text-[var(--text-primary)]">Open in problem bank</strong> to practice with the full editor and your submission history.
              </p>
            </div>
          </div>
        )}

        {!canSubmit && !isPast && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--border-accent)] bg-[var(--cyan-dim)] p-4 text-sm text-[var(--cyan)]">
            <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Contest has not started yet. Problem statements unlock when the window opens.</span>
          </div>
        )}

        {user?.role === 'user' && canSubmit && !registered && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[rgba(180,83,9,0.25)] bg-[rgba(180,83,9,0.08)] p-4 text-sm text-[var(--amber)]">
            <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Register for this contest to submit solutions from the editor.</span>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center muted">No problems match your search.</div>
      ) : (
        <>
          {/* Problem tabs (LeetCode-style) */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filtered.map((p, i) => {
              const active = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProblemId(p.id)}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                    active
                      ? 'border-[var(--border-accent)] bg-[var(--surface-2)] text-[var(--text-primary)] shadow-sm'
                      : 'border-transparent bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
                  } `}
                >
                  <span className="font-mono text-xs text-[var(--cyan)]">{String.fromCharCode(65 + i)}.</span>{' '}
                  <span className="line-clamp-1">{p.title}</span>
                </button>
              );
            })}
          </div>

          <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Statement */}
            <div className="card flex h-[400px] flex-col overflow-hidden p-0 lg:h-[min(85vh,750px)]">
              {selected ? (
                <>
                  <div className="border-b border-[var(--border)] px-5 py-4">
                    <h3 className="text-lg font-bold leading-snug text-[var(--text-primary)] sm:text-xl">
                      {selected.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`badge ${getDifficultyBadge(selected.difficulty)}`}>
                        {selected.difficulty || '—'}
                      </span>
                      {selected.ac_percent != null && (
                        <span className="badge badge-default">AC {Number(selected.ac_percent).toFixed(0)}%</span>
                      )}
                      {selected.tags && (
                        <span className="text-xs text-[var(--text-muted)]">{selected.tags}</span>
                      )}
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {selected.statement ? (
                      <div
                        className="problem-statement !border-0 !bg-transparent p-0 !shadow-none"
                        dangerouslySetInnerHTML={{ __html: selected.statement }}
                      />
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">No statement available for this problem.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center muted">Select a problem.</div>
              )}
            </div>

            {/* Editor or ended CTA */}
            <div className="flex h-[500px] min-h-0 flex-col gap-4 lg:h-[min(85vh,750px)]">
              {selected && canUseContestEditor && (
                <CodeEditor
                  key={selected.id}
                  problemId={selected.id}
                  contestId={contestId}
                  problemTitle={selected.title}
                  contextLabel="Contest"
                />
              )}

              {selected && isPast && (
                <div className="card p-6">
                  <h4 className="font-bold text-[var(--text-primary)]">Contest ended</h4>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    The contest editor is closed. Continue on the main problem page to run code against tests and track your submissions.
                  </p>
                  <Link
                    to={`/problems/${selected.id}`}
                    state={{ problem: selected }}
                    className="btn btn-primary mt-4 inline-flex w-full justify-center sm:w-auto"
                  >
                    Open in problem bank
                  </Link>
                </div>
              )}

              {selected && canSubmit && !canUseContestEditor && user?.role === 'user' && (
                <div className="card p-8 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Register above to unlock the code editor and submit for this contest.
                  </p>
                </div>
              )}

              {selected && canSubmit && !user && (
                <div className="card p-8 text-center">
                  <p className="mb-4 text-sm text-[var(--text-secondary)]">
                    Sign in with your student account to use the contest editor and submit.
                  </p>
                  <Link to="/login" className="btn btn-primary">
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
