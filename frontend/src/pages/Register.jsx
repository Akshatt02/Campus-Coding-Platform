import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api, { fetchDepartments } from '../api';

const STEPS = ['Account', 'Academic', 'Done'];

export default function Register() {
  const { user, setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', batch: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) navigate('/contests'); }, [user, navigate]);

  useEffect(() => {
    fetchDepartments()
      .then(setDepartments)
      .catch(() => setDepartments([]));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const nextStep = (e) => {
    e.preventDefault();
    setError(null);
    if (step === 0) {
      if (!form.name || !form.email || !form.password) return setError('Please fill all fields.');
      if (form.password.length < 6) return setError('Password must be at least 6 characters.');
      setStep(1);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.department) return setError('Please select a department.');
    if (!form.batch) return setError('Please enter your batch year.');
    setLoading(true);
    try {
      const res = await api.register({ ...form, department_id: form.department });
      setToken(res.token);
      setUser(res.user);
      navigate('/problems');
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = ((step) / (STEPS.length - 1)) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      padding: '40px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '-30%', left: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(21,128,61,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-5%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(161,98,7,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="anim-fade-up" style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
            <div style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, color: 'var(--on-accent)',
              margin: '0 auto', fontFamily: 'var(--font-display)',
              boxShadow: '0 8px 20px rgba(161,98,7,0.2)',
            }}>C</div>
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26, fontWeight: 800,
            letterSpacing: '-0.02em', marginBottom: 6,
          }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Join CodeArena and start competing
          </p>
        </div>

        {/* Step progress */}
        <div className="anim-fade-up delay-1" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i <= step ? 'var(--cyan)' : 'var(--surface-2)',
                    border: `2px solid ${i <= step ? 'var(--cyan)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: i <= step ? 'var(--on-accent)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    transition: 'all 0.3s',
                    boxShadow: i <= step ? '0 4px 12px rgba(161,98,7,0.3)' : 'none',
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-display)',
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: i <= step ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: '0 8px', marginBottom: 18,
                    background: i < step ? 'var(--cyan)' : 'var(--border)',
                    borderRadius: 2, transition: 'background 0.4s',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Card */}
        <div
          className="anim-fade-up delay-2"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 32,
            boxShadow: '0 10px 30px rgba(28,25,23,0.08)',
          }}
        >
          {error && (
            <div className="ui-alert-error" style={{ marginBottom: 20, fontSize: 13 }}>
              <span>⚠</span> {error}
            </div>
          )}

          {step === 0 && (
            <form onSubmit={nextStep} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input required className="form-input" placeholder="Arjun Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input required type="email" className="form-input" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    required type={showPass ? 'text' : 'password'}
                    className="form-input" placeholder="Min. 6 characters"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 4 }}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {/* Password strength */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 3, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (form.password.length / 10) * 100)}%`,
                        background: form.password.length < 6 ? 'var(--red)' : form.password.length < 10 ? 'var(--amber)' : 'var(--emerald)',
                        borderRadius: 2, transition: 'width 0.3s, background 0.3s',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: form.password.length < 6 ? 'var(--red)' : form.password.length < 10 ? 'var(--amber)' : 'var(--emerald)', marginTop: 3, display: 'block' }}>
                      {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '13px', fontSize: 15, borderRadius: 10, marginTop: 4 }}>
                Continue →
              </button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)} required>
                  <option value="" disabled>Select your department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Batch year</label>
                <input
                  required type="number" className="form-input"
                  placeholder="e.g. 2022" value={form.batch}
                  onChange={e => set('batch', e.target.value)}
                  min="2000" max="2099"
                />
              </div>

              {/* Preview */}
              <div style={{
                padding: '14px 16px',
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: 13, color: 'var(--text-secondary)',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{form.name}</div>
                <div>{form.email}</div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button" onClick={() => { setStep(0); setError(null); }}
                  className="btn btn-ghost" style={{ flex: 1, padding: '13px', borderRadius: 10 }}>
                  ← Back
                </button>
                <button
                  type="submit" disabled={loading}
                  className="btn btn-primary" style={{ flex: 2, padding: '13px', borderRadius: 10, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating...' : 'Create account'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--cyan)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}