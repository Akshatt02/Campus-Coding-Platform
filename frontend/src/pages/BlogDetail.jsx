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
        <div className="flex items-center gap-4 text-xs">
          <button onClick={handleLike} className="hover:text-[var(--cyan)] transition-colors flex items-center gap-1">
            Like
          </button>
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="hover:text-[var(--cyan)] transition-colors">
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
      <Link to="/blogs" className="text-[var(--cyan)] hover:underline mb-8 inline-block">← Back to Blogs</Link>

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
             <div className="flex items-center gap-2 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]">
                 <button onClick={() => handleVote(1)} className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-md transition-colors text-lg" title="Like">👍</button>
                 <span className="font-mono font-bold">{blog.likes - blog.dislikes}</span>
                 <button onClick={() => handleVote(-1)} className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-md transition-colors text-lg" title="Dislike">👎</button>
             </div>

             {(user?.id === blog.author_id || user?.role === 'admin') && (
                 <div className="flex gap-2">
                     <Link to={`/blogs/${id}/edit`} className="btn btn-ghost py-2 px-4 text-sm">Edit</Link>
                     <button onClick={handleDelete} className="btn py-2 px-4 text-sm bg-red-900/20 text-red-500 border border-red-500/20 hover:bg-red-900/40">Delete</button>
                 </div>
             )}
          </div>
        </div>
      </header>

      <div className="max-w-none text-[var(--text-secondary)] leading-relaxed text-lg mb-16 whitespace-pre-wrap anim-fade-up delay-2">
        {blog.content}
      </div>

      <section className="mt-20 anim-fade-up delay-3">
        <h3 className="text-2xl font-bold mb-8">Comments ({blog.comments.length})</h3>

        {user ? (
          <div className="mb-10 card p-6 bg-[rgba(255,255,255,0.01)]">
            <textarea
              className="form-input w-full p-4 h-32 mb-4 bg-[#0d121d]"
              placeholder="What are your thoughts?"
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
