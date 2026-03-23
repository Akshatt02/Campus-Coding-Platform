const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const json = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
};

export const login = async (email, password, role) => {
  const body = { email, password };
  if (role) body.role = role;
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchContestSummary = async (token, contestId) => {
  const res = await fetch(`${BASE}/api/contests/${contestId}/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const updateParticipantRating = async (token, contestId, userId, rating_after) => {
  const res = await fetch(`${BASE}/api/contests/${contestId}/participants/${userId}/rating`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rating_after }),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const register = async (payload) => {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};


export const registerFaculty = async (payload) => {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, role: 'faculty' }),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchDepartments = async () => {
  const res = await fetch(`${BASE}/api/departments`);
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchProblems = async (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/api/problems?${q}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchTestcases = async (problemId, token) => {
  const res = await fetch(`${BASE}/api/problems/${problemId}/testcases`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const createSubmission = async (token, payload) => {
  const res = await fetch(`${BASE}/api/submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const submitCode = async (code, languageId, input) => {
  const res = await fetch(`${BASE}/api/code/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      input: input || ''
    })
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const getResult = async (token) => {
  const res = await fetch(`${BASE}/api/code/result/${token}`);
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const getMySubmissions = async (token) => {
  const res = await fetch(`${BASE}/api/submissions/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchContests = async (token) => {
  const res = await fetch(`${BASE}/api/contests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchProfile = async (token) => {
  const res = await fetch(`${BASE}/api/profile/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchProfileById = async (token, id) => {
  const res = await fetch(`${BASE}/api/profile/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const fetchContestSubmissions = async (token, contestId, params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/api/contests/${contestId}/submissions?${q}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchContestLeaderboard = async (token, contestId) => {
  const res = await fetch(`${BASE}/api/contests/${contestId}/leaderboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchContestProblems = async (contestId, token) => {
  const res = await fetch(`${BASE}/api/contests/${contestId}/problems`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchContestById = async (contestId, token) => {
  const res = await fetch(`${BASE}/api/contests/${contestId}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchContestParticipants = async (token, contestId) => {
  const res = await fetch(`${BASE}/api/contests/${contestId}/participants`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const registerForContest = async (token, contestId) => {
  const res = await fetch(`${BASE}/api/contests/${contestId}/register`, {
    method: 'POST',
    headers: { Authorization: token ? `Bearer ${token}` : '' }
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

async function fetchDepartmentUsers(token, department) {
  const res = await fetch(`${BASE}/api/departments/department/${department}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch department users');
  return res.json();
}

export const createContest = async (token, payload) => {
  const res = await fetch(`${BASE}/api/faculty/contests/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const createAdminContest = async (token, payload) => {
  const res = await fetch(`${BASE}/api/admin/contests/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const createProblem = async (token, payload) => {
  const res = await fetch(`${BASE}/api/faculty/contests/problems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const addProblemToContest = async (token, contestId, problemId) => {
  const res = await fetch(`${BASE}/api/faculty/contests/${contestId}/problems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ problemId }),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchFacultyContests = async (token) => {
  const res = await fetch(`${BASE}/api/faculty/contests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchAdminContests = async (token) => {
  const res = await fetch(`${BASE}/api/admin/contests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const fetchAdminAnalytics = async (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/api/admin/analytics?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const downloadAdminAnalytics = async (token, params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/api/admin/analytics/download?${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let text;
    try {
      text = await res.text();
    } catch (e) {
      text = 'Unknown error';
    }
    console.error('Download failed:', res.status, text);
    throw new Error(`Failed to download CSV: ${res.status}`);
  }

  const blob = await res.blob();
  return blob;
};

export const fetchDepartmentBatchStats = async (token, department) => {
  const res = await fetch(`${BASE}/api/departments/department/${department}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const downloadDepartmentBatchStats = async (token, department) => {
  const res = await fetch(`${BASE}/api/departments/department/${department}/stats?format=csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await json(res);
    throw data;
  }
  const blob = await res.blob();
  return blob;
};

export const removeProblemFromContest = async (token, contestId, problemId) => {
  const res = await fetch(`${BASE}/api/faculty/contests/${contestId}/problems/${problemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const updateContest = async (token, contestId, payload) => {
  const res = await fetch(`${BASE}/api/faculty/contests/${contestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const deleteContest = async (token, contestId) => {
  const res = await fetch(`${BASE}/api/faculty/contests/${contestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const removeProblemFromContestAdmin = async (token, contestId, problemId) => {
  const res = await fetch(`${BASE}/api/admin/contests/${contestId}/problems/${problemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const updateContestAdmin = async (token, contestId, payload) => {
  const res = await fetch(`${BASE}/api/admin/contests/${contestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export const deleteContestAdmin = async (token, contestId) => {
  const res = await fetch(`${BASE}/api/admin/contests/${contestId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await json(res);
  if (!res.ok) throw data;
  return data;
};

export default {
  login,
  register,
  registerFaculty,
  fetchDepartments,
  fetchProblems,
  createSubmission,
  getMySubmissions,
  fetchContests,
  fetchProfile,
  fetchProfileById,
  fetchContestSubmissions,
  fetchContestLeaderboard,
  fetchContestProblems,
  fetchContestById,
  fetchContestParticipants,
  fetchContestSummary,
  updateParticipantRating,
  registerForContest,
  fetchDepartmentUsers,
  createContest,
  createProblem,
  addProblemToContest,
  fetchFacultyContests,
  removeProblemFromContest,
  updateContest,
  deleteContest,
  createAdminContest,
  fetchAdminContests,
  fetchAdminAnalytics,
  downloadAdminAnalytics,
  removeProblemFromContestAdmin,
  fetchDepartmentBatchStats,
  downloadDepartmentBatchStats,
  updateContestAdmin,
  deleteContestAdmin,
  submitCode,
  getResult,
  fetchTestcases,
};
