import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

const Comment = ({ comment, blogId, loadBlog }) => {
  const { user, token } = useContext(AuthContext);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleLike = async () => {
    if (!user) return alert('Please login to like');
    try {
      await api.likeComment(token, comment.id);
      loadBlog();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await api.createComment(token, blogId, replyText, comment.id);
      setReplyText('');
      setShowReplyForm(false);
      loadBlog();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 border-l-2 border-[var(--border-accent)] pl-4 sm:pl-5">
      <div className="blog-comment-surface p-4 sm:p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-[var(--cyan)]">{comment.user_name}</span>
          <time className="text-xs text-[var(--text-muted)]" dateTime={comment.created_at}>
            {new Date(comment.created_at).toLocaleString()}
          </time>
        </div>
        <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{comment.content}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--cyan)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708c.954 0 1.706.84 1.488 1.76l-1.216 5.122A2 2 0 0116.994 18H7a2 2 0 01-2-2v-7a2 2 0 011.203-1.841l5.316-2.316A2.5 2.5 0 0115 7.5V10z" />
            </svg>
            {comment.likes || 0}
          </button>
          <button
            type="button"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--cyan)]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
            </svg>
            Reply
          </button>
        </div>
        {showReplyForm && (
          <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
            <textarea
              className="form-input h-24 w-full resize-y text-sm"
              placeholder="Write a reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleReply} className="btn btn-primary px-4 py-2 text-xs">
                Submit
              </button>
              <button type="button" onClick={() => setShowReplyForm(false)} className="btn btn-ghost px-4 py-2 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {comment.replies && comment.replies.map((r) => (
        <Comment key={r.id} comment={r} blogId={blogId} loadBlog={loadBlog} />
      ))}
    </div>
  );
};

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [blog, setBlog] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlog();
  }, [id]);

  const loadBlog = async () => {
    try {
      const data = await api.fetchBlogById(id);
      setBlog(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (vote) => {
    if (!user) return alert('Please login to vote');
    try {
      await api.voteBlog(token, id, vote);
      loadBlog();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.createComment(token, id, commentText);
      setCommentText('');
      loadBlog();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await api.deleteBlog(token, id);
      navigate('/blogs');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div className="ui-spinner ui-spinner-lg" />
        <p className="muted text-sm">Loading post…</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-shell px-4 py-16 text-center">
        <p className="font-medium text-[var(--text-primary)]">Post not found.</p>
        <Link to="/blogs" className="blog-back-link mt-6 inline-flex justify-center">
          ← Back to blogs
        </Link>
      </div>
    );
  }

  const score = (blog.likes || 0) - (blog.dislikes || 0);

  return (
    <article className="blog-shell px-4 py-8 sm:py-10">
      <Link to="/blogs" className="blog-back-link mb-8">
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        All posts
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl sm:leading-tight">
          {blog.title}
        </h1>

        <div className="mt-8 flex flex-col gap-6 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--emerald)] text-sm font-bold text-[var(--on-accent)] shadow-sm">
              {blog.author_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-semibold text-[var(--text-primary)]">{blog.author_name}</div>
              <time className="text-sm text-[var(--text-muted)]" dateTime={blog.created_at}>
                {new Date(blog.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="blog-vote-pill">
              <button type="button" onClick={() => handleVote(1)} title="Upvote" aria-label="Upvote">
                <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <span className="border-x border-[var(--border)] px-3 font-mono text-sm font-bold text-[var(--text-primary)] tabular-nums">
                {score}
              </span>
              <button type="button" onClick={() => handleVote(-1)} title="Downvote" aria-label="Downvote">
                <svg className="mx-auto h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {(user?.id === blog.author_id || user?.role === 'admin') && (
              <div className="flex flex-wrap gap-2">
                <Link to={`/blogs/${id}/edit`} className="btn btn-ghost gap-2 px-4 py-2 text-sm">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                <button type="button" onClick={handleDelete} className="btn btn-danger gap-2 px-4 py-2 text-sm">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="blog-article-body anim-fade-up mb-16">{blog.content}</div>

      <section className="border-t border-[var(--border)] pt-12 anim-fade-up">
        <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">
          Comments
          <span className="ml-2 text-base font-normal text-[var(--text-muted)]">({blog.total_comments ?? 0})</span>
        </h2>

        {user ? (
          <div className="card mb-10 p-5 sm:p-6">
            <label className="form-label mb-2" htmlFor="new-comment">
              Add a comment
            </label>
            <textarea
              id="new-comment"
              className="form-input mb-4 min-h-[7.5rem] w-full resize-y text-[15px] leading-relaxed"
              placeholder="Share your thoughts…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="button" onClick={handlePostComment} className="btn btn-primary px-8">
              Post comment
            </button>
          </div>
        ) : (
          <div className="mb-10 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)]/40 px-6 py-8 text-center text-sm text-[var(--text-secondary)]">
            <Link to="/login" className="font-semibold text-[var(--cyan)] hover:underline">
              Sign in
            </Link>{' '}
            to join the discussion.
          </div>
        )}

        <div className="space-y-2">
          {!blog.comments || blog.comments.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No comments yet. Be the first to reply.</p>
          ) : (
            (blog.comments || []).map((comment) => (
              <Comment key={comment.id} comment={comment} blogId={id} loadBlog={loadBlog} />
            ))
          )}
        </div>
      </section>
    </article>
  );
}
