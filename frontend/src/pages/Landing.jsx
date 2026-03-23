import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time Contests',
    desc: 'Compete in live coding contests with instant leaderboard updates and penalty scoring.',
    color: 'var(--cyan)',
    glow: 'rgba(0,212,255,0.15)',
  },
  {
    icon: '📊',
    title: 'Deep Analytics',
    desc: 'Track your rating, weak topics, and difficulty distribution across all submissions.',
    color: 'var(--emerald)',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    icon: '🏆',
    title: 'Rating System',
    desc: 'Earn and grow your competitive rating. Every contest changes your standing.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: '🎯',
    title: 'Problem Archive',
    desc: 'Filter by difficulty, tags, and acceptance rate. Practice at your own pace.',
    color: '#a78bfa',
    glow: 'rgba(124,58,237,0.15)',
  },
];

const STATS = [
  { value: '500+', label: 'Problems', color: 'var(--cyan)' },
  { value: '50+', label: 'Contests', color: 'var(--emerald)' },
  { value: '1000+', label: 'Students', color: '#a78bfa' },
  { value: '95%', label: 'Uptime', color: '#f59e0b' },
];

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const num = parseInt(target.replace(/\D/g, '')) || 0;
        const suffix = target.replace(/[\d]/g, '');
        let start = 0;
        const step = Math.ceil(num / 40);
        const timer = setInterval(() => {
          start += step;
          if (start >= num) { setCount(target); clearInterval(timer); }
          else setCount(start + suffix);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count || '0'}</span>;
}

export default function Landing() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/contests');
  }, [user, navigate]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 100, paddingBottom: 80 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

          {/* Eyebrow chip */}
          <div className="anim-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px',
            background: 'var(--cyan-dim)',
            border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: 999,
            marginBottom: 32,
            fontSize: 12, fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: 'var(--cyan)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)', animation: 'pulse-glow 2s ease-in-out infinite', display: 'inline-block' }} />
            Now open for all departments
          </div>

          {/* Headline */}
          <h1
            className="anim-fade-up delay-1"
            style={{
              fontSize: 'clamp(42px, 7vw, 80px)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 24,
            }}
          >
            Where coders
            <br />
            <span className="gradient-text">compete & grow</span>
          </h1>

          {/* Subheadline */}
          <p
            className="anim-fade-up delay-2"
            style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 520,
              margin: '0 auto 40px',
            }}
          >
            CodeArena is your college's competitive programming platform — built for students who want to push their limits.
          </p>

          {/* CTAs */}
          <div
            className="anim-fade-up delay-3"
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link
              to="/register"
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: 15, borderRadius: 12 }}
            >
              Start Competing
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ padding: '14px 32px', fontSize: 15, borderRadius: 12 }}
            >
              Sign in
            </Link>
            <Link
              to="/faculty/register"
              className="btn btn-ghost"
              style={{ padding: '14px 32px', fontSize: 15, borderRadius: 12 }}
            >
              I'm Faculty
            </Link>
          </div>
        </div>

        {/* Hero visual - terminal card */}
        <div
          className="anim-fade-up delay-4"
          style={{
            maxWidth: 680, margin: '60px auto 0',
            padding: '0 24px',
          }}
        >
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(0,212,255,0.08), 0 20px 60px rgba(0,0,0,0.5)',
          }}>
            {/* Terminal top bar */}
            <div style={{
              background: 'var(--surface-2)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid var(--border)',
            }}>
              {['#ef4444','#f59e0b','#10b981'].map((c, i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
              ))}
              <span style={{ marginLeft: 8, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                codearena — leaderboard
              </span>
            </div>
            {/* Fake leaderboard rows */}
            <div style={{ padding: '16px 0' }}>
              {[
                { rank: 1, name: 'Arjun Sharma', solved: 5, penalty: 248, rating: 2140 },
                { rank: 2, name: 'Priya Nair', solved: 5, penalty: 310, rating: 2087 },
                { rank: 3, name: 'Rohan Mehta', solved: 4, penalty: 180, rating: 1956 },
                { rank: 4, name: 'Sneha Patel', solved: 4, penalty: 240, rating: 1890 },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  padding: '10px 20px',
                  borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                  opacity: 1 - i * 0.1,
                  transition: 'background 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    width: 28, fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: 13,
                    color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3f' : 'var(--text-muted)',
                  }}>#{row.rank}</span>
                  <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{row.name}</span>
                  <span style={{ width: 60, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--emerald)', fontWeight: 600 }}>{row.solved}</span>
                  <span style={{ width: 80, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{row.penalty}min</span>
                  <span style={{
                    width: 60, textAlign: 'right',
                    fontFamily: 'var(--font-mono)', fontSize: 13,
                    color: 'var(--cyan)', fontWeight: 700,
                  }}>{row.rating}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 24px' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 1,
          background: 'var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {STATS.map(({ value, label, color }) => (
            <div key={label} style={{
              background: 'var(--surface)',
              padding: '32px 24px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 40,
                color,
                lineHeight: 1,
                marginBottom: 8,
                textShadow: `0 0 30px ${color}`,
              }}>
                <AnimatedCounter target={value} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 100px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 12,
            }}>
              Everything you need to{' '}
              <span className="gradient-text">level up</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              Built for competitive programming at the college level.
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
                  borderRadius: 16,
                  padding: 28,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.boxShadow = `0 0 30px ${glow}`;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  background: `${glow}`,
                  border: `1px solid ${color}44`,
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  marginBottom: 16,
                }}>
                  {icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700, fontSize: 17,
                  marginBottom: 8, color: 'var(--text-primary)',
                }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '60px 24px 80px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            Ready to start?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Join thousands of students sharpening their skills and climbing the leaderboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }}>
              Create free account
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '13px 28px', fontSize: 15, borderRadius: 12 }}>
              Already have one? Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}