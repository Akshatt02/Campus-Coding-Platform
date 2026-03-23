import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import * as api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminContestCreate() {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
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

  const renderMessage = () => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    return (
      <div
        className={`mb-4 p-3 rounded-md ${
          isSuccess
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
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
        text: `Contest created successfully (ID: ${res.contestId})`,
        type: 'success',
      });
      setContestId(res.contestId);
    } catch (err) {
      setMessage({ text: err.message || 'Error creating contest', type: 'error' });
    }
  };

  const handleProblem = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!problem.title || !problem.statement || !problem.tags) {
      setMessage({ text: 'Please fill all problem fields.', type: 'error' });
      return;
    }

    const validTestcases = problem.testcases.filter(tc => tc.input.trim() && tc.expected.trim());
    if (validTestcases.length === 0) {
      setMessage({ text: 'Please provide at least one testcase.', type: 'error' });
      return;
    }

    try {
      const tags = problem.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const probRes = await api.createProblemAdmin(token, {
        title: problem.title,
        statement: problem.statement,
        difficulty: problem.difficulty,
        tags,
        testcases: validTestcases,
      });
      if (contestId) {
        await api.addProblemToContestAdmin(token, contestId, probRes.problemId);
      }
      setMessage({ text: 'Problem added successfully.', type: 'success' });
      setProblem({ title: '', statement: '', difficulty: 'easy', tags: '', testcases: [{ input: '', expected: '' }, { input: '', expected: '' }] });
    } catch (err) {
      setMessage({ text: err.message || 'Error adding problem', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">Create College-wide Contest</h1>

      {/* Card 1: Create Contest */}
      <div className="card p-6">
        <h2 className="text-xl mb-4 font-semibold">Step 1: Create Contest</h2>
        
        {!contestId && renderMessage()}

        <form onSubmit={handleContest} className="flex flex-col gap-4">
          <input
            className="form-input"
            placeholder="Contest Title"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            disabled={contestId}
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
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
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
                    className="btn btn-ghost text-red-600 hover:text-red-800"
                    disabled={problem.testcases.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTestcase}
                className="btn btn-ghost text-blue-600 hover:text-blue-800"
              >
                + Add Test Case
              </button>
            </div>

            <button className="btn btn-primary" type="submit">
              Add Problem
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
