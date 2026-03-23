import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';
import ContestSubmissions from '../components/ContestSubmissions';
import ContestLeaderboard from '../components/ContestLeaderboard';
import ContestProblems from '../components/ContestProblems';
import ContestSummary from '../components/ContestSummary';
import RatingManager from '../components/RatingManager';

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

export default function ContestDetail() {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);

  const [contest, setContest] = useState(null);
  const [tab, setTab] = useState('leaderboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  
  // Added message state to replace alerts
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const loadContest = async () => {
      try {
        const data = await api.fetchContestById(id, token);
        setContest(data.contest || data);
      } catch (err) {
        console.error('Error loading contest:', err);
        setError('Failed to load contest');
      } finally {
        setLoading(false);
      }
    };
    if (token) loadContest();
  }, [id, token]);

  useEffect(() => {
    const loadParticipants = async () => {
      if (!token || !contest) return;
      setLoadingParticipants(true);
      try {
        const data = await api.fetchContestParticipants(token, contest.id);
        setParticipants(data.participants || []);
        setRegistered(Boolean(data.registered));
      } catch (err) {
        console.error('Failed to load participants', err);
      } finally {
        setLoadingParticipants(false);
      }
    };
    loadParticipants();
  }, [token, contest?.id]);

  const handleRegister = async () => {
    if (!token) {
      setMessage({ text: 'Please log in to register.', type: 'error' });
      return;
    }
    setMessage({ text: '', type: '' }); // Clear previous message
    try {
      const data = await api.registerForContest(token, contest.id);
      setRegistered(true);
      setParticipants(data.participants || []);
      setMessage({ text: 'Registered successfully!', type: 'success' });
    } catch (err) {
      console.error('Register error', err);
      setMessage({
        text: err?.message || 'Failed to register',
        type: 'error',
      });
    }
  };

  // Helper to render styled messages
  const renderMessage = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    return (
      <div
        className={`mt-3 p-3 rounded-md border ${
          isSuccess
            ? 'bg-[rgba(16,185,129,0.1)] text-[var(--emerald)] border-[rgba(16,185,129,0.2)]'
            : 'bg-[rgba(239,68,68,0.1)] text-[var(--red)] border-[rgba(239,68,68,0.2)]'
        } text-sm`}
      >
        {message.text}
      </div>
    );
  };

  // Styled loading state
  if (loading) {
    return (
      <div className="card p-8 text-center muted">Loading contest...</div>
    );
  }

  // Styled error state
  if (error || !contest) {
    return (
      <div className="card p-6 bg-red-100 text-red-700 max-w-lg mx-auto text-center">
        {error || 'Contest not found'}
      </div>
    );
  }

  const now = new Date();
  const start = new Date(contest.start_time);
  const end = new Date(contest.end_time);

  const isUpcoming = now < start;
  const isOngoing = now >= start && now <= end;
  const isEnded = now > end;
  const showTabs = !isUpcoming; // Only hide when upcoming
  const showRegisterButton = (isUpcoming || isOngoing) && user;
  const canManageRatings =
    user && (user.role === 'admin' || user.id === contest.created_by);

  return (
    <div className="space-y-6">
      {/* Contest header */}
      <div className="card p-6">
        <h1 className="text-3xl font-bold">{contest.title}</h1>
        <div className="text-lg muted">
          {contest.department_name
            ? `${contest.department_name} Department`
            : 'College-wide'}
        </div>
        <div className="mt-2 text-[var(--text-secondary)] flex items-center gap-2">
          {formatDateTime(contest.start_time)}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          {formatDateTime(contest.end_time)}
        </div>

        {/* Styled registration button/badge */}
        {showRegisterButton && user?.role === 'user' && (
          registered ? (
            <span className="badge !bg-green-100 !text-green-700 !font-bold mt-4">
              Registered
            </span>
          ) : (
            <button
              className="btn btn-primary mt-4" // Use btn-primary for clear action
              onClick={handleRegister}
              disabled={loadingParticipants}
            >
              {loadingParticipants ? 'Please wait...' : 'Register for Contest'}
            </button>
          )
        )}
        {/* Show registration messages */}
        {showRegisterButton && user?.role === 'user' && renderMessage()}
      </div>

      {/* Participants list */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold">
          Participants ({participants.length})
        </h3>
        {loadingParticipants ? (
          <div className="muted mt-2">Loading participants...</div>
        ) : participants.length > 0 ? (
          <div className="text-sm muted mt-2 space-y-1 max-h-32 overflow-y-auto">
            {participants.map((p) => (
              <div key={p.user_id}>{p.user_name}</div>
            ))}
          </div>
        ) : (
          <div className="muted mt-2">No participants yet.</div>
        )}
      </div>

      {/* Upcoming contest notice */}
      {isUpcoming && (
        <div className="card p-6 muted">
          Contest hasn’t started yet. Tabs and problems will appear once it
          begins.
        </div>
      )}

      {/* Tabs + Content (visible when ongoing or ended) */}
      {showTabs && (
        <>
          {/* Tabs */}
          <div className="card p-4 flex flex-wrap gap-2 items-center">
            {[
              { key: 'leaderboard', label: 'Leaderboard' },
              { key: 'submissions', label: 'Submissions' },
              { key: 'problems', label: 'Problems' },
              { key: 'summary', label: 'Summary' },
              ...(canManageRatings ? [{ key: 'ratings', label: 'Ratings' }] : []),
            ].map(({ key, label }) => (
              <button
                key={key}
                // Use btn-primary for active, btn-ghost for inactive
                className={`btn ${
                  tab === key ? 'btn-primary' : 'btn-ghost'
                }`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'leaderboard' && (
            <ContestLeaderboard contest={contest} token={token} />
          )}

          {tab === 'submissions' && (
            <ContestSubmissions contest={contest} token={token} />
          )}

          {tab === 'problems' && (
            <div className="card">
              <ContestProblems contestId={id} registered={registered} />
            </div>
          )}

          {tab === 'summary' && (
            <ContestSummary contest={contest} token={token} />
          )}

          {tab === 'ratings' && canManageRatings && (
            <RatingManager
              contest={contest}
              participants={participants}
              token={token}
              onUpdated={() =>
                api
                  .fetchContestParticipants(token, contest.id)
                  .then((d) => setParticipants(d.participants || []))
              }
            />
          )}
        </>
      )}
    </div>
  );
}