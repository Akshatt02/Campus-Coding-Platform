import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

// A helper function to format dates (you can move this to a utils file)
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

export default function Contests() {
  const { token } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.fetchContests(token);
        if (Array.isArray(data)) {
          setContests(data);
        } else {
          console.warn('Unexpected response format:', data);
          setContests([]); // Ensure it's an array
        }
      } catch (e) {
        console.error('Failed to load contests:', e);
        setContests([]); // Set to empty array on error
      }
      setLoading(false);
    };
    if (token) load();
  }, [token]);

  const now = new Date();

  const categorize = (contest) => {
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);
    if (now < start) return 'Upcoming';
    if (now > end) return 'Past';
    return 'Ongoing';
  };

  // Function to get a color class based on category
  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Ongoing':
        return 'badge-green';
      case 'Upcoming':
        return 'badge-cyan';
      case 'Past':
        return 'badge-default';
      default:
        return 'badge-default';
    }
  };

  return (
    <div className="anim-fade-in space-y-8" style={{ padding: '24px 0' }}>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Contests</h1>
        <p className="text-[var(--text-secondary)]">Compete with your peers and climb the global leaderboard.</p>
      </div>

      {loading && (
        <div className="card p-12 text-center">
             <div className="ui-spinner ui-spinner-lg mx-auto mb-3" />
             <div className="muted">Loading contests...</div>
        </div>
      )}

      {!loading && contests.length === 0 && (
        <div className="card p-12 text-center muted">
          No contests found at the moment.
        </div>
      )}

      {!loading && contests.length > 0 && (
        <div className="grid gap-6 md:grid-cols-1">
          {contests.map((c) => {
            const category = categorize(c);
            const badgeClass = getBadgeStyle(category);
            return (
              <div
                key={c.id}
                className="card p-6 flex flex-col md:flex-row md:items-center md:justify-between group hover:border-[var(--border-accent)] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold group-hover:text-[var(--cyan)] transition-colors">{c.title}</h2>
                    <span className={`badge ${badgeClass}`}>
                      {category}
                    </span>
                  </div>
                  
                  <div className="text-sm font-bold text-[var(--cyan)] mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {c.department_name
                      ? `${c.department_name} Department`
                      : 'College-wide'}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm muted">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateTime(c.start_time)}
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                        {formatDateTime(c.end_time)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-0">
                  <Link
                    to={`/contests/${c.id}`}
                    className="btn btn-primary"
                    aria-label={`Open contest ${c.title}`}
                  >
                    Enter Contest
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5-5 5M6 7l5 5-5 5" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}