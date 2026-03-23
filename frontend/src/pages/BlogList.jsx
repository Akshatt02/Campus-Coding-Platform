import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

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

  if (loading) return <div className="flex justify-center p-20 text-[var(--cyan)]">Loading blogs...</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-end mb-12 anim-fade-up">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 gradient-text">
            Editorials & Blogs
          </h1>
          <p className="text-[var(--text-secondary)]">Insights, tutorials, and community discussions.</p>
        </div>
        {user && (
          <Link to="/blogs/create" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Write a Blog
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {blogs.length === 0 ? (
          <div className="card text-center p-20 border-dashed border-2 border-[var(--border)]">
            <p className="text-[var(--text-muted)]">No blogs found. Be the first to share one!</p>
          </div>
        ) : (
          blogs.map((blog, idx) => (
            <Link
              key={blog.id}
              to={`/blogs/${blog.id}`}
              className={`group block card hover:border-[var(--cyan)] transition-all duration-300 transform hover:-translate-y-1 anim-fade-up delay-${(idx % 5) + 1}`}
              style={{
                padding: '24px',
                textDecoration: 'none'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-[var(--cyan)] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                    {blog.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full bg-[var(--cyan)] text-[#080c14] flex items-center justify-center text-[10px] font-bold">
                        {blog.author_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[var(--text-secondary)] font-medium">{blog.author_name}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--text-primary)]">{blog.likes - blog.dislikes}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--text-primary)]">{blog.comment_count}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Comments</div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {blog.content.substring(0, 180)}...
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
