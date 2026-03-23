import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import * as api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminContestCreate() {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Updated message state to hold text and type
  const [message, setMessage] = useState({ text: '', type: '' });

  const [contestId, setContestId] = useState(null);
  const navigate = useNavigate();

  // Helper to render styled messages
  const renderMessage = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    return (
      <div
        className={`mb-4 p-3 rounded-md ${isSuccess
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
          } text-sm`}
      >
        {message.text}
      </div>
    );
  };

  const handleContest = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' }); // Clear message
    if (!title || !startTime || !endTime) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setMessage({ text: 'End time must be after start time.', type: 'error' });
      return;
    }
    try {
      const res = await api.createAdminContest(token, {
        title,
        start_time: startTime,
        end_time: endTime,
      });
      setMessage({
        text: `✅ Contest created successfully (ID: ${res.contestId})`,
        type: 'success',
      });
      setContestId(res.contestId);
    } catch (err) {
      setMessage({ text: err.message || 'Error creating contest', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create College-wide Contest</h1>

      {/* Card 1: Create Contest */}
      <div className="card p-6">
        <h2 className="text-xl mb-4 font-semibold">Create New Contest</h2>

        {renderMessage()}

        <form onSubmit={handleContest} className="flex flex-col gap-4">
          <input
            className="form-input"
            placeholder="Contest Title"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            disabled={contestId} // Disable after creation
          />
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="datetime-local"
              className="form-input flex-1"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={contestId}
            />
            <input
              type="datetime-local"
              className="form-input flex-1"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={contestId}
            />
          </div>
          {!contestId && (
            <button className="btn btn-primary w-full" type="submit">
              Create Contest
            </button>
          )}
        </form>
      </div>

      {/* Card 2: Link to Edit (shows after contest is created) */}
      {contestId && (
        <div className="card p-6">
          <h2 className="text-xl mb-3 font-semibold">
            Contest Created
          </h2>
          <p className="muted mb-4">
            You can now add problems by editing the contest.
          </p>
          <button
            className="btn btn-primary w-full" // Use primary button for next step
            onClick={() => navigate(`/admin/contest/${contestId}/edit`)}
          >
            Edit Contest & Add Problems →
          </button>
        </div>
      )}
    </div>
  );
}