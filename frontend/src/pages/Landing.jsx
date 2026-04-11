import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Department contests & practice',
    desc: 'Faculty schedule timed rounds; you see standings and penalties the same way as in a typical college OJ — without leaving campus.',
    color: 'var(--cyan)',
    glow: 'rgba(161,98,7,0.18)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Submissions & analytics',
    desc: 'Track AC rate, weak topics, and difficulty mix from your own submissions — useful for labs and revision before internal tests.',
    color: 'var(--emerald)',
    glow: 'rgba(16,185,129,0.12)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.143-7.714L2 12l6.857-2.143L11 3z" />
      </svg>
    ),
    title: 'Cohort rating',
    desc: 'A college-wide rating that updates with contests here — compare progress with your batch and seniors in a single place.',
    color: 'var(--amber)',
    glow: 'rgba(180,83,9,0.18)',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Problem bank',
    desc: 'Filter by difficulty and tags, run custom input, and submit against test cases — aligned with how programming labs are actually graded.',
    color: 'var(--violet)',
    glow: 'rgba(109,40,217,0.14)',
  },
];

const STEPS = [
  { n: '1', title: 'Register with your details', text: 'Use your college email, pick department and batch so standings can stay organized by cohort.' },
  { n: '2', title: 'Practice or enter a contest', text: 'Solve from the archive between rounds, then join scheduled contests when your faculty opens them.' },
  { n: '3', title: 'Review results', text: 'See verdicts, penalties, and how you rank against others on campus — not a global commercial scoreboard.' },
];

const DEMO_ROWS = [
  { rank: 1, name: 'Ananya Iyer', dept: 'CSE', yr: '2025', solved: 5, penalty: 248, rating: 1840 },
  { rank: 2, name: 'Karthik Menon', dept: 'CSE', yr: '2024', solved: 5, penalty: 310, rating: 1812 },
  { rank: 3, name: 'Neha Gupta', dept: 'IT', yr: '2025', solved: 4, penalty: 180, rating: 1765 },
  { rank: 4, name: 'Rahul Bose', dept: 'ECE', yr: '2025', solved: 4, penalty: 240, rating: 1720 },
];

export default function Landing() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/contests');
  }, [user, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(161,98,7,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(21,128,61,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <section style={{ position: 'relative', zIndex: 1, paddingTop: 88, paddingBottom: 56 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

          <div className="anim-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px',
            background: 'var(--cyan-dim)',
            border: '1px solid var(--border-accent)',
            borderRadius: 999,
            marginBottom: 24,
            fontSize: 11, fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--cyan)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Campus programming · departments & batches
          </div>

          <h1
            className="anim-fade-up delay-1"
            style={{
              fontSize: 'clamp(32px, 5.5vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              marginBottom: 20,
              color: 'var(--text-primary)',
            }}
          >
            The college hub for{' '}
            <span className="gradient-text">practice & timed contests</span>
          </h1>

          <p
            className="anim-fade-up delay-2"
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: 560,
              margin: '0 auto 28px',
            }}
          >
            CodeArena is an internal-style OJ for your institution: one place to run code, submit against test cases,
            join faculty-run contests, and see how you rank with classmates — without mixing in public CP noise.
          </p>

          <p
            className="anim-fade-up delay-2"
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              maxWidth: 520,
              margin: '0 auto 32px',
            }}
          >
            Students sign up with department and batch. Faculty create contests and review participation. Same workflow your programming lab expects.
          </p>

          <div
            className="anim-fade-up delay-3"
            style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              to="/register"
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: 15, borderRadius: 10 }}
            >
              Student registration
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ padding: '12px 28px', fontSize: 15, borderRadius: 10 }}
            >
              Sign in
            </Link>
            <Link
              to="/faculty/register"
              className="btn btn-ghost"
              style={{ padding: '12px 28px', fontSize: 15, borderRadius: 10 }}
            >
              Faculty signup
            </Link>
          </div>
        </div>

        <div
          className="anim-fade-up delay-4"
          style={{ maxWidth: 760, margin: '48px auto 0', padding: '0 24px' }}
        >
          <p style={{
            fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 10, textAlign: 'center',
          }}>
            Example: intra-college contest leaderboard
          </p>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(28,25,23,0.08)',
          }}>
            <div style={{
              background: 'var(--surface-2)',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid var(--border)',
            }}>
              {['#dc2626', '#d97706', '#15803d'].map((c, i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85 }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                codearena — CS dept · weekly round · live
              </span>
            </div>
            <div style={{ padding: '12px 0', overflowX: 'auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 52px 44px 56px 64px 56px',
                gap: 8,
                padding: '8px 16px',
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--text-muted)', borderBottom: '1px solid var(--border)',
                minWidth: 520,
              }}>
                <span>#</span>
                <span>Name</span>
                <span>Dept</span>
                <span>Yr</span>
                <span className="text-center">AC</span>
                <span className="text-center">Pen.</span>
                <span className="text-right">Rating</span>
              </div>
              {DEMO_ROWS.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '44px 1fr 52px 44px 56px 64px 56px',
                    gap: 8,
                    alignItems: 'center',
                    padding: '10px 16px',
                    borderBottom: i < DEMO_ROWS.length - 1 ? '1px solid var(--border)' : 'none',
                    minWidth: 520,
                    fontSize: 13,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(161,98,7,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    fontWeight: 700,
                    color: i === 0 ? 'var(--amber)' : i === 1 ? 'var(--text-secondary)' : i === 2 ? 'var(--cyan)' : 'var(--text-muted)',
                  }}>
                    {row.rank}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>{row.dept}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{row.yr}</span>
                  <span style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--emerald)', fontWeight: 600 }}>{row.solved}</span>
                  <span style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{row.penalty}</span>
                  <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan)' }}>{row.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '24px 24px 48px' }}>
        <div style={{
          maxWidth: 960, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}>
          {[
            { t: 'On-campus context', d: 'Department, batch, and college-only leaderboards.' },
            { t: 'Faculty workflows', d: 'Create contests, add problems, track cohorts.' },
            { t: 'Standard OJ flow', d: 'Run, submit, verdicts — familiar from DS/Algo labs.' },
            { t: 'One account', d: 'Same login for practice, contests, and profile.' },
          ].map((x) => (
            <div
              key={x.t}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '18px 20px',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{x.t}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{x.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '32px 24px 72px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            How it works for students
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, textAlign: 'center', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.55 }}>
            No growth-hacking funnel — just the usual path from account to contest week.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '22px 20px',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'var(--surface-3)',
                  color: 'var(--cyan)',
                  fontWeight: 800, fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 3.5vw, 34px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: 10,
            }}>
              What you get on this platform
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.55 }}>
              Features match what a campus coding cell or CS department usually needs — not a consumer app checklist.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {FEATURES.map(({ icon, title, desc, color, glow }) => (
              <div
                key={title}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.boxShadow = `0 8px 28px ${glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  background: glow,
                  border: `1px solid ${color}44`,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color,
                  marginBottom: 14,
                }}>
                  {icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 16,
                  marginBottom: 8, color: 'var(--text-primary)',
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.62 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        position: 'relative', zIndex: 1,
        padding: '48px 24px 72px',
        borderTop: '1px solid var(--border)',
        background: 'linear-gradient(180deg, var(--bg-2) 0%, var(--bg) 100%)',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 12,
          }}>
            New batch joining this term?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Create a student account to access problems and contests your department enables. If you teach or coordinate contests, use faculty registration so you can create rounds and review participation.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: 15, borderRadius: 10 }}>
              Register as student
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '12px 26px', fontSize: 15, borderRadius: 10 }}>
              Already registered — sign in
            </Link>
          </div>
          <p style={{ marginTop: 28, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            CodeArena is intended for enrolled students and authorized staff of participating departments.
          </p>
        </div>
      </section>
    </div>
  );
}
