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
    <div className="comment-node mt-6">
      <div className="blog-comment-surface p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-3)] text-[10px] font-bold text-[var(--text-primary)]">
              {comment.user_name?.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-[var(--text-primary)] text-sm">{comment.user_name}</span>
          </div>
          <time className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider" dateTime={comment.created_at}>
            {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>
        <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] mb-4">{comment.content}</p>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--cyan)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-2)] group-hover:bg-[var(--cyan-dim)] transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 10h4.708c.954 0 1.706.84 1.488 1.76l-1.216 5.122A2 2 0 0116.994 18H7a2 2 0 01-2-2v-7a2 2 0 011.203-1.841l5.316-2.316A2.5 2.5 0 0115 7.5V10z" />
              </svg>
            </div>
            {comment.likes || 0}
          </button>
          <button
            type="button"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--cyan)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-2)] group-hover:bg-[var(--cyan-dim)] transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
              </svg>
            </div>
            Reply
          </button>
        </div>
        {showReplyForm && (
          <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-5 animate-in fade-in zoom-in duration-300">
            <textarea
              className="form-input h-24 w-full resize-y text-sm bg-[var(--bg)]"
              placeholder="Write a thoughtful reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleReply} className="btn btn-primary px-5 py-2 text-xs">
                Post Reply
              </button>
              <button type="button" onClick={() => setShowReplyForm(false)} className="btn btn-ghost px-5 py-2 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies mt-2">
          {comment.replies.map((r) => (
            <Comment key={r.id} comment={r} blogId={blogId} loadBlog={loadBlog} />
          ))}
        </div>
      )}
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
    <article className="blog-shell px-4 py-12 sm:py-16">
      <Link to="/blogs" className="blog-back-link mb-10 group">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface-2)] group-hover:bg-[var(--cyan-dim)] transition-colors">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
        <span className="font-bold tracking-tight">Return to feed</span>
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl mb-10">
          {blog.title}
        </h1>

        <div className="flex flex-col gap-8 pb-10 border-b border-[var(--border)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--cyan)] to-[var(--emerald)] text-lg font-black text-[var(--on-accent)] shadow-lg shadow-cyan-900/20">
              {blog.author_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--text-primary)] leading-tight">{blog.author_name}</div>
              <div className="flex items-center gap-2 mt-1">
                <time className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]" dateTime={blog.created_at}>
                  {new Date(blog.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span className="text-[var(--border)]">•</span>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--cyan)]">Article</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="blog-vote-pill h-11">
              <button 
                type="button" 
                onClick={() => handleVote(1)} 
                className="w-10 hover:!bg-[var(--cyan-dim)] hover:!text-[var(--cyan)] transition-all"
                title="Upvote"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <div className="flex items-center justify-center min-w-[3rem] px-2 h-full bg-[var(--surface-3)]/30 font-display font-black text-base text-[var(--text-primary)] tabular-nums">
                {score}
              </div>
              <button 
                type="button" 
                onClick={() => handleVote(-1)} 
                className="w-10 hover:!bg-[rgba(239,68,68,0.1)] hover:!text-[var(--red)] transition-all"
                title="Downvote"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {(user?.id === blog.author_id || user?.role === 'admin') && (
              <div className="flex items-center gap-2 pl-4 border-l border-[var(--border)]">
                <Link to={`/blogs/${id}/edit`} className="btn btn-ghost !h-11 !px-4 text-xs font-bold uppercase tracking-widest">
                  Edit
                </Link>
                <button type="button" onClick={handleDelete} className="btn btn-danger !h-11 !px-4 text-xs font-bold uppercase tracking-widest">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="blog-article-body anim-fade-up mb-20">{blog.content}</div>

      <section className="border-t-2 border-[var(--border)] pt-16 anim-fade-up">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Discussion
            <span className="ml-3 text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">
              {blog.total_comments ?? 0} Comments
            </span>
          </h2>
        </div>

        {user ? (
          <div className="card mb-12 overflow-hidden border-[var(--border-accent)] bg-[var(--surface-2)]/30">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]/50">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Join the conversation</span>
            </div>
            <div className="p-6">
              <textarea
                id="new-comment"
                className="form-input mb-4 min-h-[8rem] w-full resize-y text-base bg-[var(--surface)] border-none focus:ring-2 focus:ring-[var(--cyan-dim)]"
                placeholder="Share your technical perspective or ask a question…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Be respectful and constructive
                </div>
                <button type="button" onClick={handlePostComment} className="btn btn-primary !px-10 !h-11 font-bold">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-2)]/20 px-8 py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-[var(--surface-3)] flex items-center justify-center mb-4">
               <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              Authentication required to participate.
            </p>
            <Link to="/login" className="mt-4 btn btn-ghost !inline-flex hover:!bg-[var(--cyan-dim)] !text-[var(--cyan)] font-bold">
              Sign In to Reply
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {!blog.comments || blog.comments.length === 0 ? (
            <div className="py-10 text-center border-t border-[var(--border)] border-dashed rounded-xl">
              <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest italic">No responses yet</p>
            </div>
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
