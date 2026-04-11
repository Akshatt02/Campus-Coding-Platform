import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

export default function FacultyMyContests() {
  const { token } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await api.fetchFacultyContests(token);
        setContests(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContests();
  }, [token]);

  // Styled loading state
  if (loading) {
    return <div className="card p-8 text-center muted">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Created Contests</h1>

      {contests.length === 0 ? (
        // Styled empty state
        <div className="card p-8 text-center muted">
          No contests created yet.
        </div>
      ) : (
        // Using a div instead of <ul> for more flexible card styling
        <div className="space-y-4">
          {contests.map((c) => (
            // Using the theme's 'card' class
            <div
              key={c.id}
              className="card p-5 flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div>
                {/* Using default (dark) text color */}
                <h3 className="text-xl font-semibold">{c.title}</h3>
                {/* Using 'muted' class for secondary text */}
                <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                  {formatDateTime(c.start_time)}
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  {formatDateTime(c.end_time)}
                </p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                {/* Using 'btn-ghost' for the "Edit" action */}
                {new Date() <= new Date(c.end_time) ? (
                  <Link
                    to={`/faculty/contest/${c.id}/edit`}
                    className="btn btn-ghost"
                  >
                    Edit
                  </Link>
                ) : (
                  // Styled disabled-looking button
                  <span
                    className="btn btn-ghost opacity-60 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    Edit
                  </span>
                )}
                {/* Using 'btn-primary' for the main "View" action */}
                <Link to={`/contests/${c.id}`} className="btn btn-primary">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}