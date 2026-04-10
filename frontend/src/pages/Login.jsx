import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';

const ROLE_OPTIONS = [
  { value: 'user', label: 'Student', icon: '🎓', desc: 'Compete and track progress' },
  { value: 'faculty', label: 'Faculty', icon: '👨‍🏫', desc: 'Create contests and problems' },
  { value: 'admin', label: 'Admin', icon: '⚙️', desc: 'Full platform access' },
];

export default function Login() {
  const { user, setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => { if (user) navigate('/contests'); }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(email, password, role);
      setToken(res.token);
      setUser(res.user);
      navigate('/contests');
    } catch (err) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left panel — decorative */}
      <div style={{
        flex: '0 0 45%',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48,
        position: 'relative',
        overflow: 'hidden',
      }} className="hidden lg:flex">
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(161,98,7,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(161,98,7,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />
        {/* Radial gradient */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(161,98,7,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          {/* Big icon */}
          <div style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, fontWeight: 800, color: 'var(--on-accent)',
            margin: '0 auto 32px',
            boxShadow: '0 8px 24px rgba(161,98,7,0.25)',
            fontFamily: 'var(--font-display)',
          }}>
            C
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32, fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 12,
            background: 'linear-gradient(135deg, var(--text-primary), var(--text-secondary))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            CodeArena
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>
            Your competitive programming home. Compete, submit, climb the leaderboard.
          </p>

          {/* Small stat pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            {[['500+', 'Problems'], ['50+', 'Contests'], ['1000+', 'Students']].map(([v, l]) => (
              <div key={l} style={{
                padding: '6px 14px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                fontSize: 12,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-secondary)',
              }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>{v}</span> {l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="anim-fade-up">

          <div style={{ marginBottom: 36 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28, fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Sign in to your CodeArena account
            </p>
          </div>

          {error && (
            <div className="ui-alert-error" style={{ marginBottom: 20 }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">Account type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {ROLE_OPTIONS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    style={{
                      padding: '10px 8px',
                      background: role === value ? 'var(--cyan-dim)' : 'var(--bg-2)',
                      border: `1px solid ${role === value ? 'var(--cyan)' : 'var(--border)'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      color: role === value ? 'var(--cyan)' : 'var(--text-secondary)',
                      letterSpacing: '0.04em',
                    }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="form-input"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  required
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', fontSize: 14, padding: 4,
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '13px', fontSize: 15, borderRadius: 10, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid rgba(161,98,7,0.25)',
                    borderTopColor: 'var(--cyan)',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          <div style={{
            marginTop: 28, paddingTop: 24,
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: 14, color: 'var(--text-muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
              Create one free
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}