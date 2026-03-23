import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        alert("Unauthorized");
        return navigate("/blogs");
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
      alert("Failed to save blog");
    }
  };

  if (loading) return <div className="flex justify-center p-20 text-[var(--cyan)]">Loading editor...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-extrabold mb-10 gradient-text">
        {id ? 'Edit Blog' : 'Create New Blog'}
      </h1>

      <form onSubmit={handleSubmit} className="card p-8 bg-[var(--surface)] space-y-8 anim-fade-up delay-1">
        <div>
          <label className="form-label mb-2">Title</label>
          <input
            type="text"
            className="form-input w-full p-4 text-xl font-bold"
            placeholder="Enter a catchy title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="form-label mb-2">Content</label>
          <textarea
            className="form-input w-full p-6 h-96 text-lg leading-relaxed"
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn btn-primary px-10 py-3">
            {id ? 'Update Blog' : 'Publish Blog'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost px-10">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
