import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      loadBlog();
    }
  }, [id]);

  const loadBlog = async () => {
    try {
      const blog = await api.fetchBlogById(id);
      if (blog.author_id !== user.id && user.role !== 'admin') {
        alert('Unauthorized');
        return navigate('/blogs');
      }
      setTitle(blog.title);
      setContent(blog.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      if (id) {
        await api.updateBlog(token, id, { title, content });
      } else {
        await api.createBlog(token, { title, content });
      }
      navigate('/blogs');
    } catch (err) {
      console.error(err);
      alert('Failed to save blog');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div className="ui-spinner ui-spinner-lg" />
        <p className="muted text-sm">Loading editor…</p>
      </div>
    );
  }

  return (
    <div className="blog-editor-shell px-4 py-8 sm:py-10">
      <Link to="/blogs" className="blog-back-link mb-6">
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to blogs
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {id ? 'Edit post' : 'Write a new post'}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Plain text for now — title and body are saved as you submit. You can use line breaks for paragraphs.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card anim-fade-up space-y-6 p-6 sm:p-8">
        <div className="form-group">
          <label className="form-label" htmlFor="blog-title">
            Title
          </label>
          <input
            id="blog-title"
            type="text"
            className="form-input text-base font-semibold sm:text-lg"
            placeholder="e.g. Why we use segment trees in contest prep"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="blog-content">
            Body
          </label>
          <textarea
            id="blog-content"
            className="form-input min-h-[22rem] resize-y font-normal leading-relaxed sm:text-[15px]"
            placeholder="Write your editorial, notes, or announcement…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
          <button type="submit" className="btn btn-primary px-8">
            {id ? 'Save changes' : 'Publish'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost px-6">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
