import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

const Comment = ({ comment, onReply, blogId, loadBlog }) => {
  const { user, token } = useContext(AuthContext);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleLike = async () => {
    if (!user) return alert('Please login to like');
    try {
      await api.likeComment(token, comment.id);
      loadBlog();
    } catch (err) { console.error(err); }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      await api.createComment(token, blogId, replyText, comment.id);
      setReplyText('');
      setShowReplyForm(false);
      loadBlog();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="mt-4 border-l-2 border-[var(--border)] pl-4">
      <div className="p-4 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[var(--border)]">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-[var(--cyan)]">{comment.user_name}</span>
          <span className="text-xs text-[var(--text-muted)]">{new Date(comment.created_at).toLocaleString()}</span>
        </div>
        <p className="text-[var(--text-secondary)] mb-3">{comment.content}</p>
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708c.954 0 1.706.84 1.488 1.76l-1.216 5.122A2 2 0 0116.994 18H7a2 2 0 01-2-2v-7a2 2 0 011.203-1.841l5.316-2.316A2.5 2.5 0 0115 7.5V10z" />
            </svg>
            <span className="text-xs font-semibold">{comment.likes || 0}</span>
          </button>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors text-xs font-semibold flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
            </svg>
            Reply
          </button>
        </div>
        {showReplyForm && (
          <div className="mt-4 space-y-2">
            <textarea
              className="form-input w-full p-2 h-20 text-sm"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleReply} className="btn btn-primary text-xs py-1 px-3">Submit</button>
              <button onClick={() => setShowReplyForm(false)} className="btn btn-ghost text-xs py-1 px-3">Cancel</button>
            </div>
          </div>
        )}
      </div>
      {comment.replies && comment.replies.map(r => (
        <Comment key={r.id} comment={r} onReply={onReply} blogId={blogId} loadBlog={loadBlog} />
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
    } catch (err) { console.error(err); }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.createComment(token, id, commentText);
      setCommentText('');
      loadBlog();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this blog?")) return;
      try {
          await api.deleteBlog(token, id);
          navigate("/blogs");
      } catch (err) { console.error(err); }
  }

  if (loading) return <div className="flex justify-center p-20 text-[var(--cyan)]">Loading blog...</div>;
  if (!blog) return <div className="text-center p-20">Blog not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link to="/blogs" className="text-[var(--cyan)] hover:underline mb-8 inline-flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Blogs
      </Link>

      <header className="mb-10">
        <h1 className="text-5xl font-extrabold mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {blog.title}
        </h1>
        <div className="flex items-center justify-between pb-8 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--emerald)] flex items-center justify-center font-bold text-[#080c14]">
                 {blog.author_name?.charAt(0).toUpperCase()}
             </div>
             <div>
                 <div className="font-bold text-[var(--text-primary)]">{blog.author_name}</div>
                 <div className="text-sm text-[var(--text-muted)]">{new Date(blog.created_at).toLocaleDateString()}</div>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center bg-[var(--surface-2)] rounded-lg border border-[var(--border)] overflow-hidden">
                 <button
                    onClick={() => handleVote(1)}
                    className="p-2.5 hover:bg-[rgba(255,255,255,0.05)] transition-colors text-[var(--text-secondary)] hover:text-[var(--cyan)]"
                    title="Upvote"
                 >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                 </button>
                 <span className="px-3 font-mono font-bold text-[var(--text-primary)] border-x border-[var(--border)]">
                    {blog.likes - blog.dislikes}
                 </span>
                 <button
                    onClick={() => handleVote(-1)}
                    className="p-2.5 hover:bg-[rgba(255,255,255,0.05)] transition-colors text-[var(--text-secondary)] hover:text-[var(--red)]"
                    title="Downvote"
                 >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                 </button>
             </div>

             {(user?.id === blog.author_id || user?.role === 'admin') && (
                 <div className="flex gap-2">
                     <Link to={`/blogs/${id}/edit`} className="btn btn-ghost py-2 px-4 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                     </Link>
                     <button onClick={handleDelete} className="btn py-2 px-4 text-sm bg-red-900/10 text-red-500 border border-red-500/20 hover:bg-red-900/20 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                     </button>
                 </div>
             )}
          </div>
        </div>
      </header>

      <div className="max-w-none text-[var(--text-secondary)] leading-relaxed text-lg mb-16 whitespace-pre-wrap anim-fade-up delay-2">
        {blog.content}
      </div>

      <section className="mt-20 anim-fade-up delay-3">
        <h3 className="text-2xl font-bold mb-8">Comments ({blog.total_comments || 0})</h3>

        {user ? (
          <div className="mb-10 card p-6 bg-[rgba(255,255,255,0.01)]">
            <textarea
              className="form-input w-full p-4 h-32 mb-4 bg-[#0d121d]"
              placeholder="Post a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={handlePostComment} className="btn btn-primary px-8">Post Comment</button>
          </div>
        ) : (
          <div className="mb-10 p-6 border border-dashed border-[var(--border)] rounded-xl text-center">
            <Link to="/login" className="text-[var(--cyan)] hover:underline">Login</Link> to join the discussion.
          </div>
        )}

        <div className="space-y-6">
          {blog.comments.length === 0 ? (
            <p className="text-[var(--text-muted)]">No comments yet. Start the conversation!</p>
          ) : (
            blog.comments.map(comment => (
              <Comment key={comment.id} comment={comment} blogId={id} loadBlog={loadBlog} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
