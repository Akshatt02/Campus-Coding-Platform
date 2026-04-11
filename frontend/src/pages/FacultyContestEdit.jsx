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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="card p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">{message}</h3>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            Confirm
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

export default function FacultyContestEdit() {
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
        const res = await api.fetchContestById(id, token);
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
      await api.updateContest(token, id, {
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
          await api.deleteContest(token, id);
          navigate('/faculty/my-contests');
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
          await api.removeProblemFromContest(token, id, pId);
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
      const probRes = await api.createProblem(token, {
        title: problemForm.title,
        statement: problemForm.statement,
        difficulty: problemForm.difficulty,
        tags,
        testcases: validTestcases,
      });
      await api.addProblemToContest(token, id, probRes.problemId);
      
      // Reload problems to get the newly added one
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

  // Render the styled message
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Render Modal */}
      {modal.isOpen && (
        <ConfirmationModal
          message={modal.message}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal({ isOpen: false, message: '', onConfirm: null })}
        />
      )}

      {isPast ? (
        // "Contest Ended" View
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-3">Contest #{id} (Ended)</h2>
          {renderMessage()}
          <div className="muted mb-4">
            This contest has ended. Editing is locked. You can still delete the
            contest.
          </div>
          <button
            type="button"
            className="btn bg-red-600 text-white hover:bg-red-700"
            onClick={handleDeleteContest}
          >
            Delete contest
          </button>
        </div>
      ) : (
        // "Editable" View
        <>
          {/* Edit Contest Details Card */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-3">Edit Contest #{id}</h2>
            {renderMessage()}
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <input
                placeholder="Contest Title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="datetime-local"
                  className="form-input flex-1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <input
                  type="datetime-local"
                  className="form-input flex-1"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button className="btn btn-primary" type="submit">
                  Save changes
                </button>
                <button
                  type="button"
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteContest}
                >
                  Delete contest
                </button>
              </div>
            </form>
          </div>

          {/* Problems in Contest Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Problems in Contest</h3>
            {problems.length === 0 ? (
              <p className="muted">No problems yet</p>
            ) : (
              <div className="space-y-3">
                {problems.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-4 bg-sky-50 border border-sky-100 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-sm muted capitalize">
                        {p.difficulty}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-ghost"
                        onClick={() => navigate(`/problems/${p.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn bg-red-600 text-white hover:bg-red-700"
                        onClick={() => handleRemoveProblem(p.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create & Add Problem Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">
              Create & Add Problem
            </h3>
            <form onSubmit={handleAddProblem} className="flex flex-col gap-4">
              <input
                className="form-input"
                placeholder="Title"
                value={problemForm.title}
                onChange={(e) =>
                  setProblemForm({ ...problemForm, title: e.target.value })
                }
                required
              />
              <textarea
                className="form-input"
                placeholder="Statement"
                value={problemForm.statement}
                onChange={(e) =>
                  setProblemForm({ ...problemForm, statement: e.target.value })
                }
                required
              />
              <select
                className="form-select"
                value={problemForm.difficulty}
                onChange={(e) =>
                  setProblemForm({
                    ...problemForm,
                    difficulty: e.target.value,
                  })
                }
              >
                <option value="easy" className="form-option">Easy</option>
                <option value="medium" className="form-option">Medium</option>
                <option value="hard" className="form-option">Hard</option>
              </select>
              <input
                className="form-input"
                placeholder="Tags (comma separated, e.g., math,dp)"
                value={problemForm.tags}
                onChange={(e) =>
                  setProblemForm({ ...problemForm, tags: e.target.value })
                }
                required
              />

              {/* Test Cases */}
              <div className="space-y-2">
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

              <button className="btn btn-primary">Create & Add</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}