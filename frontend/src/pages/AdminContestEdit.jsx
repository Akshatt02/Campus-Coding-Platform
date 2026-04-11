import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

/**
 * A reusable modal component for confirmation dialogs.
 * Replaces the native browser `confirm()`.
 */
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.8)] backdrop-blur-sm anim-fade-in">
      <div className="card p-8 max-w-sm w-full border border-[var(--border-accent)] shadow-2xl scale-in">
        <div className="w-12 h-12 rounded-full bg-[rgba(239,68,68,0.1)] flex items-center justify-center mb-6 mx-auto">
            <svg className="w-6 h-6 text-[var(--red)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-xl font-bold mb-2 text-center">Confirm Action</h3>
        <p className="muted text-center mb-8 text-sm">{message}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="btn btn-danger w-full !py-3"
          >
            Confirm & Proceed
          </button>
          <button onClick={onCancel} className="btn btn-ghost w-full">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper to format a date string into YYYY-MM-DDTHH:mm for datetime-local inputs
 */
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function AdminContestEdit() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);

  // Updated message state to hold text and type (success/error)
  const [message, setMessage] = useState({ text: '', type: '' });

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [problemForm, setProblemForm] = useState({
    title: '',
    statement: '',
    difficulty: 'easy',
    tags: '',
    testcases: [{ input: '', expected: '' }, { input: '', expected: '' }],
  });

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.fetchContestById(id, token); // This can be a common endpoint
        setContest(res.contest);
        setProblems(res.problems || []);
        setTitle(res.contest.title || '');
        setStartTime(formatDateForInput(res.contest.start_time));
        setEndTime(formatDateForInput(res.contest.end_time));
      } catch (err) {
        console.error(err);
        setMessage({
          text: err.message || 'Failed to load contest',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [id, token]);

  // Helper to show the modal
  const showConfirmModal = (message, onConfirm) => {
    setModal({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setModal({ isOpen: false, message: '', onConfirm: null });
      },
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      // Use the Admin API route
      await api.updateContestAdmin(token, id, {
        title,
        start_time: startTime,
        end_time: endTime,
      });
      setMessage({ text: 'Contest updated successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.message || 'Error updating contest',
        type: 'error',
      });
    }
  };

  const handleDeleteContest = () => {
    showConfirmModal(
      'Delete this contest? This cannot be undone.',
      async () => {
        try {
          // Use the Admin API route
          await api.deleteContestAdmin(token, id);
          navigate('/admin/contests'); // Navigate to admin contests list
        } catch (err) {
          console.error(err);
          setMessage({
            text: err.message || 'Error deleting contest',
            type: 'error',
          });
        }
      }
    );
  };

  const handleTestcaseChange = (index, field, value) => {
    const newTestcases = [...problemForm.testcases];
    newTestcases[index][field] = value;
    setProblemForm({ ...problemForm, testcases: newTestcases });
  };

  const addTestcase = () => {
    setProblemForm({
      ...problemForm,
      testcases: [...problemForm.testcases, { input: '', expected: '' }]
    });
  };

  const removeTestcase = (index) => {
    if (problemForm.testcases.length > 1) {
      const newTestcases = problemForm.testcases.filter((_, i) => i !== index);
      setProblemForm({ ...problemForm, testcases: newTestcases });
    }
  };

  const handleRemoveProblem = (pId) => {
    showConfirmModal(
      'Remove this problem from the contest?',
      async () => {
        try {
          // Use the Admin API route
          await api.removeProblemFromContestAdmin(token, id, pId);
          setProblems((prev) => prev.filter((p) => p.id !== pId));
          setMessage({ text: 'Problem removed', type: 'success' });
        } catch (err) {
          console.error(err);
          setMessage({
            text: err.message || 'Error removing problem',
            type: 'error',
          });
        }
      }
    );
  };

  const handleAddProblem = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!problemForm.title || !problemForm.statement || !problemForm.tags) {
      setMessage({ text: 'Please fill all problem fields.', type: 'error' });
      return;
    }

    // Validate testcases
    const validTestcases = problemForm.testcases.filter(tc => tc.input.trim() && tc.expected.trim());
    if (validTestcases.length === 0) {
      setMessage({ text: 'Please provide at least one testcase.', type: 'error' });
      return;
    }

    try {
      const tags = problemForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
      // 1. Create the problem (common endpoint)
      const probRes = await api.createProblem(token, {
        title: problemForm.title,
        statement: problemForm.statement,
        difficulty: problemForm.difficulty,
        tags,
        testcases: validTestcases,
      });

      await api.addProblemToContest(token, id, probRes.problemId);

      // 3. Reload problems
      const refreshed = await api.fetchContestById(id, token);
      setProblems(refreshed.problems || []);
      setProblemForm({ title: '', statement: '', difficulty: 'easy', tags: '', testcases: [{ input: '', expected: '' }, { input: '', expected: '' }] });
      setMessage({ text: 'Problem added to contest', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.message || 'Error adding problem',
        type: 'error',
      });
    }
  };

  // Styled loading state
  if (loading) {
    return <div className="card p-8 text-center muted">Loading...</div>;
  }

  const now = new Date();
  const end = contest?.end_time ? new Date(contest.end_time) : null;
  const isPast = end ? now > end : false;

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 anim-fade-in" style={{ padding: '24px 0' }}>
      {/* Render Modal */}
      {modal.isOpen && (
        <ConfirmationModal
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal({ isOpen: false, message: '', onConfirm: null })}
        />
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Manage Contest</h1>
        <p className="text-[var(--text-secondary)]">Administrative controls for contest settings and problem set.</p>
      </div>

      {isPast ? (
        // "Contest Ended" View
        <div className="card p-8 border-dashed border-[var(--border)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="badge badge-amber uppercase tracking-widest text-[10px] font-bold">LOCKED</div>
            <h2 className="text-2xl font-bold">Contest #{id} (Ended)</h2>
          </div>
          {renderMessage()}
          <p className="muted mb-8 italic">
            This contest has concluded. Operational editing is now restricted. You may still remove the contest from the platform records if necessary.
          </p>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteContest}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Purge contest
          </button>
        </div>
      ) : (
        // "Editable" View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Settings */}
            <div className="lg:col-span-1 space-y-6">
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Contest Details
                    </h3>
                    {renderMessage()}
                    <form onSubmit={handleUpdate} className="flex flex-col gap-6">
                        <div className="space-y-1.5">
                            <label className="form-label">Title</label>
                            <input
                                placeholder="Summer Coding Challenge"
                                className="form-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="form-label">Start Time</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="form-label">End Time</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border)]">
                            <button className="btn btn-primary w-full" type="submit">
                                Update Settings
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={handleDeleteContest}
                            >
                                Delete Contest
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Col: Problems */}
            <div className="lg:col-span-2 space-y-8">
                {/* Current Problems */}
                <div className="card p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--emerald)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Contest Problems
                    </h3>
                    <div className="space-y-4">
                        {problems.length === 0 ? (
                            <div className="p-12 text-center muted italic bg-[var(--surface-2)]/30 border border-dashed border-[var(--border)] rounded-xl">
                                This contest currently has no problems. Add some below.
                            </div>
                        ) : (
                            problems.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex justify-between items-center p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl group hover:border-[var(--border-accent)] transition-all"
                                >
                                    <div>
                                        <div className="font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors">{p.title}</div>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`badge ${p.difficulty === 'easy' ? 'badge-emerald' : p.difficulty === 'medium' ? 'badge-amber' : 'badge-red'} !text-[9px] !py-0`}>
                                                {p.difficulty}
                                            </span>
                                            <span className="text-[10px] muted uppercase font-mono">{p.tags}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => navigate(`/problems/${p.id}`)}
                                        >
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRemoveProblem(p.id)}
                                        >
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Add New Problem */}
                <div className="card p-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[var(--violet)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Create & Insert Problem
                    </h3>
                    <form onSubmit={handleAddProblem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="form-label">Problem Title</label>
                            <input
                                className="form-input"
                                placeholder="Optimized Fibonacci Search"
                                value={problemForm.title}
                                onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="form-label">Problem Statement</label>
                            <textarea
                                className="form-input min-h-[120px]"
                                placeholder="Describe the problem, constraints, and test cases..."
                                value={problemForm.statement}
                                onChange={(e) => setProblemForm({ ...problemForm, statement: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="form-label">Difficulty</label>
                            <select
                                className="form-select"
                                value={problemForm.difficulty}
                                onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="form-label">Tags</label>
                            <input
                                className="form-input"
                                placeholder="math, dynamic-programming, greedy"
                                value={problemForm.tags}
                                onChange={(e) => setProblemForm({ ...problemForm, tags: e.target.value })}
                                required
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="block text-sm font-medium">Test Cases:</label>
                            {problemForm.testcases.map((testcase, index) => (
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
                                  disabled={problemForm.testcases.length <= 1}
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
                        <div className="md:col-span-2 pt-4">
                            <button className="btn btn-primary w-full">Deploy Problem to Contest</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}