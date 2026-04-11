import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path) =>
    `relative text-sm font-medium transition-colors duration-200 py-1 ${
      isActive(path)
        ? 'text-[var(--cyan)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    }`;

  const activeUnderline = (path) =>
    isActive(path) ? (
      <span
        style={{
          position: 'absolute', bottom: -2, left: 0, right: 0,
          height: 2, background: 'var(--cyan)',
          borderRadius: 999,
          boxShadow: '0 0 8px var(--cyan)',
        }}
      />
    ) : null;

  const studentLinks = [
    { to: '/problems', label: 'Problems' },
    { to: '/contests', label: 'Contests' },
    { to: '/blogs', label: 'Blogs' },
    { to: '/submissions', label: 'Submissions' },
    { to: '/profile', label: 'Profile' },
  ];

  const staffLinks = [
    { to: '/problems', label: 'Problems' },
    { to: '/contests', label: 'Contests' },
    { to: '/blogs', label: 'Blogs' },
    {
      to: user?.role === 'admin' ? '/admin/analytics' : '/faculty/analytics',
      label: 'Analytics',
    },
    {
      to: user?.role === 'admin' ? '/admin/create-contest' : '/faculty/create-contest',
      label: 'Create',
    },
    {
      to: user?.role === 'admin' ? '/admin/my-contests' : '/faculty/my-contests',
      label: 'My Contests',
    },
  ];

  const links = user && (user.role === 'admin' || user.role === 'faculty')
    ? staffLinks
    : studentLinks.filter(l => l.to !== '/submissions' && l.to !== '/profile' ? true : !!user);

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'var(--nav-border)' : 'transparent'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 20,
            letterSpacing: '-0.02em',
            textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span
            style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
              borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: 'var(--on-accent)',
              boxShadow: '0 2px 8px rgba(161, 98, 7, 0.2)',
              flexShrink: 0,
            }}
          >
            C
          </span>
          <span
            style={{
              background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CodeArena
          </span>
        </Link>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1, justifyContent: 'center' }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className={navLinkClass(to)} style={{ textDecoration: 'none', position: 'relative', fontFamily: 'var(--font-display)' }}>
              {label}
              {activeUnderline(to)}
            </Link>
          ))}
        </nav>

        {/* User Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              {/* User chip */}
              <Link
                to={user.role === 'user' ? '/profile' : '#'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 12px 5px 5px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span
                  style={{
                    width: 26, height: 26,
                    background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--on-accent)',
                    fontFamily: 'var(--font-display)',
                    flexShrink: 0,
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
              </Link>

              <button
                onClick={logout}
                style={{
                  padding: '6px 14px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--red)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                  e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 16px' }}>
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: 13, padding: '7px 16px' }}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}