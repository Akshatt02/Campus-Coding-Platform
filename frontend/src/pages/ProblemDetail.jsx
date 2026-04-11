import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';
import CodeEditor from '../components/CodeEditor';

const VERDICTS = ['AC', 'WA', 'TLE', 'RE', 'CE'];

// Helper function (copied from ProblemSet.js for consistency)
const getDifficultyStyle = (difficulty) => {
  if (!difficulty) return 'badge'; // Default
  const d = difficulty.toLowerCase();
  if (d === 'easy') {
    return '!bg-green-100 !text-green-700'; // Green
  }
  if (d === 'medium') {
    return '!bg-yellow-100 !text-yellow-700'; // Yellow
  }
  if (d === 'hard') {
    return '!bg-red-100 !text-red-700'; // Red
  }
  return 'badge'; // Default badge style from theme.css
};

export default function ProblemDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { token } = useContext(AuthContext);
  const [problem, setProblem] = useState(state?.problem || null);
  const [isLoading, setIsLoading] = useState(!state?.problem); // Add loading state

  useEffect(() => {
    const load = async () => {
      if (problem) return; // Already have it from location state

      setIsLoading(true);
      try {
        const res = await api.fetchProblemById(token, id);
        setProblem(res || null);
      } catch (e) {
        console.error(e);
        // Problem not found or other error
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, problem, token]);

  // Styled loading state
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center muted">
        Loading problem...
      </div>
    );
  }

  // Styled "not found" state
  if (!problem) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="card p-6 bg-red-100 text-red-700 max-w-md w-full text-center">
          Problem not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Problem Card */}
      <div className="card p-6">
        <h2 className="text-3xl font-bold">{problem.title}</h2>
        <div className="flex gap-2 mt-3 mb-4">
          <span
            className={`badge !font-bold ${getDifficultyStyle(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
          <span className="badge">AC: {problem.ac_percent ?? 0}%</span>
        </div>

        {/* Styled problem statement box */}
        <div
          className="problem-statement mt-4 p-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: problem.statement }}
        />
      </div>

      {/* Code Editor */}
      <CodeEditor problemId={problem.id} />
    </div>
  );
}