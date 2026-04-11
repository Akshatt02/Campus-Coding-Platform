import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

function excerpt(text, max = 200) {
  if (!text) return '';
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const data = await api.fetchBlogs();
      setBlogs(data);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div className="ui-spinner ui-spinner-lg" />
        <p className="muted text-sm">Loading posts…</p>
      </div>
    );
  }

  return (
    <div className="blog-shell px-4 py-8 sm:py-10">
      <header className="mb-10 flex flex-col gap-6 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Community
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Blogs & editorials
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Writeups, tutorials, and announcements from students and faculty on campus.
          </p>
        </div>
        {user && (
          <Link to="/blogs/create" className="btn btn-primary shrink-0 self-start sm:self-auto">
            New post
          </Link>
        )}
      </header>

      {blogs.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-2xl text-[var(--text-muted)]">
            📝
          </div>
          <p className="font-medium text-[var(--text-primary)]">No posts yet</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            When someone publishes a blog, it will show up here.
          </p>
          {user && (
            <Link to="/blogs/create" className="btn btn-primary mt-6">
              Write the first post
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {blogs.map((blog) => (
            <li key={blog.id}>
              <Link
                to={`/blogs/${blog.id}`}
                className="group card block p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-accent)] hover:shadow-md sm:p-6"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--cyan)] sm:text-2xl">
                      {blog.title}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-[var(--text-secondary)]">
                      {excerpt(blog.content)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--cyan)] text-xs font-bold text-[var(--on-accent)]">
                          {blog.author_name?.charAt(0).toUpperCase() || '?'}
                        </span>
                        <span className="font-medium text-[var(--text-secondary)]">{blog.author_name}</span>
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <time dateTime={blog.created_at}>
                        {new Date(blog.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3 lg:flex-col lg:items-end">
                    <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm tabular-nums text-[var(--text-primary)]">
                      <svg className="h-4 w-4 text-[var(--cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="font-mono font-semibold">
                        {(blog.likes ?? 0) - (blog.dislikes ?? 0)}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">score</span>
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm tabular-nums text-[var(--text-primary)]">
                      <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-mono font-semibold">{blog.comment_count ?? 0}</span>
                      <span className="text-xs text-[var(--text-muted)]">comments</span>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
