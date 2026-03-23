import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Helper function to get a color-coded style for the difficulty badge
const getDifficultyStyle = (difficulty) => {
  if (!difficulty) return 'badge-default';
  const d = difficulty.toLowerCase();
  if (d === 'easy') return 'badge-green';
  if (d === 'medium') return 'badge-amber';
  if (d === 'hard') return 'badge-red';
  return 'badge-default';
};

export default function ProblemSet() {
  const { token } = useContext(AuthContext);
  const [problems, setProblems] = useState([]);
  const [q, setQ] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (q) params.q = q;
      if (difficulty) params.difficulty = difficulty;
      if (tags) params.tags = tags;
      const res = await api.fetchProblems(token, params);
      setProblems(res.data || []);
    } catch (err) {
      setError(err?.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // Load on initial render

  const submitFilter = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="anim-fade-in space-y-8" style={{ padding: '24px 0' }}>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Problem Set</h1>
        <p className="text-[var(--text-secondary)]">Sharpen your skills with our curated collection of coding challenges.</p>
      </div>

      {/* Filter Card */}
      <div className="card p-8">
        <form
          onSubmit={submitFilter}
          className="grid grid-cols-1 md:grid-cols-7 gap-6 items-end"
        >
          {/* Search */}
          <div className="md:col-span-2">
            <label className="form-label">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="form-input"
              placeholder="Search title..."
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="form-label">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="form-select"
            >
              <option value="" className="form-option">
                Any
              </option>
              <option value="easy" className="form-option">
                Easy
              </option>
              <option value="medium" className="form-option">
                Medium
              </option>
              <option value="hard" className="form-option">
                Hard
              </option>
            </select>
          </div>

          {/* Tags */}
          <div className="md:col-span-2">
            <label className="form-label">Tags</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="form-input"
              placeholder="math, dp, graphs"
            />
          </div>

          {/* Filter Button */}
          <div>
            <button className="btn btn-primary w-full">Filter</button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card p-12 text-center">
             <div style={{ width: 32, height: 32, margin: '0 auto 12px', border: '3px solid var(--border)', borderTopColor: 'var(--cyan)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
             <div className="muted">Loading problems...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-6 bg-[rgba(239,68,68,0.1)] text-[var(--red)] border-[rgba(239,68,68,0.2)] max-w-lg mx-auto text-center">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && problems.length === 0 && (
        <div className="card p-12 text-center">
          <div className="muted mb-2">No problems match your current filters.</div>
          <button onClick={() => { setQ(''); setDifficulty(''); setTags(''); load(); }} className="btn btn-ghost btn-sm">Clear all filters</button>
        </div>
      )}

      {/* Problem List */}
      {!loading && !error && problems.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((p) => (
            <div key={p.id} className="card p-6 hover:border-[var(--border-accent)] transition-colors group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--cyan)] transition-colors">{p.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getDifficultyStyle(p.difficulty)}`}>
                      {p.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono muted">
                        <svg className="w-3.5 h-3.5 text-[var(--emerald)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        {p.ac_percent ?? 0}%
                    </div>
                  </div>
                  {p.tags && (
                      <div className="mt-4 flex flex-wrap gap-2">
                          {p.tags.split(',').map(tag => (
                              <span key={tag} className="text-[10px] uppercase tracking-wider font-bold py-1 px-2 rounded bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
                                  {tag.trim()}
                              </span>
                          ))}
                      </div>
                  )}
                </div>

                <Link
                  to={`/problems/${p.id}`}
                  state={{ problem: p }}
                  className="btn btn-secondary btn-sm"
                >
                  View
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}