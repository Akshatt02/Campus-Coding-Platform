// src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProblemSet from './pages/ProblemSet';
import ProblemDetail from './pages/ProblemDetail';
import Submissions from './pages/Submissions';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import FacultyRegister from './pages/FacultyRegister';
import FacultyAnalytics from './pages/FacultyAnalytics';
import FacultyContestCreate from './pages/FacultyContestCreate';
import FacultyContestEdit from './pages/FacultyContestEdit';
import AdminContestCreate from './pages/AdminContestCreate';
import AdminContestEdit from './pages/AdminContestEdit';
import AdminAnalytics from './pages/AdminAnalytics';
import FacultyMyContests from './pages/FacultyMyContests';
import AdminContests from './pages/AdminContests';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import BlogEditor from './pages/BlogEditor';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const location = useLocation();
  const hideNavPaths = ['/', '/login', '/register', '/faculty/register'];

  return (
    <AuthProvider>
      <div className="min-h-screen">
        {!hideNavPaths.includes(location.pathname) && <NavBar />}
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Faculty */}
            <Route path="/faculty/register" element={<FacultyRegister />} />
            <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
            <Route path="/faculty/create-contest" element={<FacultyContestCreate />} />
            <Route path="/faculty/contest/:id/edit" element={<FacultyContestEdit />} />
            <Route path="/faculty/my-contests" element={<FacultyMyContests />} />

            {/* Admin */}
            <Route path="/admin/create-contest" element={<AdminContestCreate />} />
            <Route path="/admin/contest/:id/edit" element={<AdminContestEdit />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/my-contests" element={<AdminContests />} />

            {/* Problems */}
            <Route path="/problems" element={<ProblemSet />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />

            {/* Submissions */}
            <Route path="/submissions" element={<Submissions />} />

            {/* Contests */}
            <Route path="/contests" element={<Contests />} />
            {/* Contest detail: uses query ?tab=leaderboard or ?tab=submissions or shows problems by default */}
            <Route path="/contests/:id" element={<ContestDetail />} />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />

            {/* Blogs */}
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/create" element={<BlogEditor />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/blogs/:id/edit" element={<BlogEditor />} />

            {/* Fallback */}
            <Route path="*" element={<div className="card">Page not found</div>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
