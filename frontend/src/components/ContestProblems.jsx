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
    return <div className="p-8 text-center muted">Loading problems...</div>;
  }

  // Styled error state
  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-700 text-sm rounded-md">
        {error}
      </div>
    );
  }

  // Styled not found state
  if (!contest) {
    return <div className="p-8 text-center muted">Contest not found</div>;
  }

  const now = new Date();
  const start = new Date(contest.start_time);
  const end = new Date(contest.end_time);
  const isOngoing = now >= start && now <= end;
  const isPast = now > end;
  const canSubmit = isOngoing;

  return (
    <div className="space-y-4">
      {/* Header card - now part of the component, not the parent */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h2 className="text-xl font-bold">Contest Problems</h2>
          <div className="text-sm muted">
            {formatDateTime(contest.start_time)} → {formatDateTime(contest.end_time)}
          </div>
        </div>

        <input
          type="text"
          placeholder="🔍 Search by problem name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input mt-4 w-full"
        />

        {/* Styled Info/Warning Messages */}
        {!canSubmit && isPast && (
          <div className="mt-3 p-3 text-sm bg-gray-100 text-gray-700 rounded-md">
            Contest finished — submissions closed.
          </div>
        )}
        {!canSubmit && !isPast && (
          <div className="mt-3 p-3 text-sm bg-sky-100 text-sky-700 rounded-md">
            Contest not started yet.
          </div>
        )}
        {user && user.role === 'user' && !registered && (
          <div className="mt-3 p-3 text-sm bg-yellow-100 text-yellow-700 rounded-md">
            You are not registered for this contest. Please register from the
            contest header to submit solutions.
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
            className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm muted capitalize">
                Difficulty: {p.difficulty}{' '}
                {p.tags ? `| Tags: ${p.tags}` : ''}
              </div>
            </div>

            <div className="mt-3 md:mt-0">
              {user && user.role !== 'admin' && user.role !== 'faculty' && user.id !== contest.created_by && (
                <button
                  className="btn btn-primary"
                  onClick={() => setSelectedProblemId(p.id)}
                  disabled={!canSubmit || !registered}
                >
                  Solve
                </button>
              )}
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