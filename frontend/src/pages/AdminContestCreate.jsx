import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import * as api from '../api';
// FIX 1: Changed 'in' to 'from'
import { useNavigate } from 'react-router-dom';

export default function AdminContestCreate() {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Updated message state to hold text and type
  const [message, setMessage] = useState({ text: '', type: '' });

  const [problem, setProblem] = useState({
    title: '',
    statement: '',
    difficulty: 'easy',
    tags: '',
    testcases: [{ input: '', expected: '' }, { input: '', expected: '' }],
  });
  const [contestId, setContestId] = useState(null);
  const navigate = useNavigate();

  // Helper to render styled messages
  const renderMessage = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    return (
      <div
        className={`mb-4 p-3 rounded-md border ${
          isSuccess
            ? 'bg-[rgba(16,185,129,0.1)] text-[var(--emerald)] border-[rgba(16,185,129,0.2)]'
            : 'bg-[rgba(239,68,68,0.1)] text-[var(--red)] border-[rgba(239,68,68,0.2)]'
        } text-sm`}
      >
        {message.text}
      </div>
    );
  };

  const handleTestcaseChange = (index, field, value) => {
    const newTestcases = [...problem.testcases];
    newTestcases[index][field] = value;
    setProblem({ ...problem, testcases: newTestcases });
  };

  const addTestcase = () => {
    setProblem({
      ...problem,
      testcases: [...problem.testcases, { input: '', expected: '' }]
    });
  };

  const removeTestcase = (index) => {
    if (problem.testcases.length > 1) {
      const newTestcases = problem.testcases.filter((_, i) => i !== index);
      setProblem({ ...problem, testcases: newTestcases });
    }
  };

  const handleContest = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!title || !startTime || !endTime) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setMessage({
        text: 'End time must be after start time.',
        type: 'error',
      });
      return;
    }

    try {
      const res = await api.createAdminContest(token, {
        title,
        start_time: startTime,
        end_time: endTime,
      });
      setMessage({
        text: `Contest created successfully (ID: ${res.contestId})`,
        type: 'success',
      });
      setContestId(res.contestId);
    } catch (err) {
      setMessage({
        text: err.message || 'Error creating contest',
        type: 'error',
      });
    }
  };

  const handleProblem = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!problem.title || !problem.statement || !problem.tags) {
      setMessage({ text: 'Please fill all problem fields.', type: 'error' });
      return;
    }

    // Validate testcases
    const validTestcases = problem.testcases.filter(tc => tc.input.trim() && tc.expected.trim());
    if (validTestcases.length === 0) {
      setMessage({ text: 'Please provide at least one testcase.', type: 'error' });
      return;
    }

    try {
      const tags = problem.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const probRes = await api.createProblem(token, {
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        tags,
        testcases: validTestcases,
      });
      if (contestId) {
        await api.addProblemToContest(token, contestId, probRes.problemId);
      }
      setMessage({ text: 'Problem added successfully.', type: 'success' });
      // Clear form for the next problem
      setProblem({ title: '', statement: '', difficulty: 'easy', tags: '', testcases: [{ input: '', expected: '' }, { input: '', expected: '' }] });
    } catch (err) {
      setMessage({ text: err.message || 'Error adding problem', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create College-wide Contest</h1>

      {/* Card 1: Create Contest */}
      <div className="card p-6">
        <h2 className="text-xl mb-4 font-semibold">Step 1: Create Contest</h2>
        
        {/* Render message inside the card if no contest ID yet */}
        {!contestId && renderMessage()}

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

      {/* Card 2: Add Problems (shows after contest is created) */}
      {contestId && (
        <div className="card p-6">
          <h2 className="text-xl mb-3 font-semibold">
            Step 2: Add Problems to Contest #{contestId}
          </h2>
          
          {/* Render message inside this card now */}
          {renderMessage()}

          <form onSubmit={handleProblem} className="flex flex-col gap-4">
            <input
              className="form-input"
              placeholder="Problem Title"
              value={problem.title}
              required
              onChange={(e) => setProblem({ ...problem, title: e.target.value })}
            />
            <textarea
              className="form-input"
              placeholder="Problem Statement (HTML allowed)"
              value={problem.statement}
              required
              // FIX 2: Changed 'e.targe.value' to 'e.target.value'
              onChange={(e) =>
                setProblem({ ...problem, statement: e.target.value })
              }
            ></textarea>
            <select
              className="form-select"
              value={problem.difficulty}
              onChange={(e) =>
                setProblem({ ...problem, difficulty: e.target.value })
              }
            >
              <option value="easy" className="form-option">Easy</option>
              <option value="medium" className="form-option">Medium</option>
              <option value="hard" className="form-option">Hard</option>
            </select>
            <input
              className="form-input"
              placeholder="Tags (comma separated, e.g., math,dp)"
              required
              value={problem.tags}
              onChange={(e) => setProblem({ ...problem, tags: e.target.value })}
            />

            {/* Test Cases */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Test Cases:</label>
              {problem.testcases.map((testcase, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    className="form-input flex-1"
                    placeholder="Input"
                    value={testcase.input}
                    onChange={(e) => handleTestcaseChange(index, 'input', e.target.value)}
                  />
                  <input
                    className="form-input flex-1"
                    placeholder="Expected Output"
                    value={testcase.expected}
                    onChange={(e) => handleTestcaseChange(index, 'expected', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeTestcase(index)}
                    className="btn btn-ghost !p-2 text-[var(--red)] hover:bg-[rgba(239,68,68,0.1)]"
                    disabled={problem.testcases.length <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTestcase}
                className="btn btn-secondary w-full text-xs py-2"
              >
                <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Add Test Case
              </button>
            </div>

            <button className="btn btn-primary" type="submit">
              Add Problem
            </button>
          </form>
        </div>
      )}

      {/* Navigation Button */}
      <button
        onClick={() => navigate('/admin/my-contests')}
        className="btn btn-ghost w-full flex items-center justify-center gap-2"
      >
        View My Contests
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}