import pool from '../config/db.js';

export const getBlogs = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT b.*, u.name as author_name,
             (SELECT COUNT(*) FROM blog_votes WHERE blog_id = b.id AND vote = 1) as likes,
             (SELECT COUNT(*) FROM blog_votes WHERE blog_id = b.id AND vote = -1) as dislikes,
             (SELECT COUNT(*) FROM comments WHERE blog_id = b.id) as comment_count
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const [blogs] = await pool.execute(`
      SELECT b.*, u.name as author_name,
             (SELECT COUNT(*) FROM blog_votes WHERE blog_id = b.id AND vote = 1) as likes,
             (SELECT COUNT(*) FROM blog_votes WHERE blog_id = b.id AND vote = -1) as dislikes
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.id = ?
    `, [id]);

    if (blogs.length === 0) return res.status(404).json({ message: 'Blog not found' });

    const [comments] = await pool.execute(`
      SELECT c.*, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.blog_id = ?
      ORDER BY c.created_at ASC
    `, [id]);

    // Handle nested comments (replies)
    const commentMap = {};
    const rootComments = [];
    comments.forEach(c => {
      c.replies = [];
      commentMap[c.id] = c;
      if (c.parent_id) {
        if (commentMap[c.parent_id]) {
          commentMap[c.parent_id].replies.push(c);
        }
      } else {
        rootComments.push(c);
      }
    });

    res.json({ ...blogs[0], comments: rootComments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBlog = async (req, res) => {
  const { title, content } = req.body;
  const author_id = req.user.id;
  try {
    const [result] = await pool.execute(
      'INSERT INTO blogs (title, content, author_id) VALUES (?, ?, ?)',
      [title, content, author_id]
    );
    res.status(201).json({ id: result.insertId, title, content, author_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const user_id = req.user.id;
  try {
    const [blog] = await pool.execute('SELECT author_id FROM blogs WHERE id = ?', [id]);
    if (blog.length === 0) return res.status(404).json({ message: 'Blog not found' });
    if (blog[0].author_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.execute(
      'UPDATE blogs SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
    res.json({ message: 'Blog updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    const [blog] = await pool.execute('SELECT author_id FROM blogs WHERE id = ?', [id]);
    if (blog.length === 0) return res.status(404).json({ message: 'Blog not found' });
    if (blog[0].author_id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const voteBlog = async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body; // 1 or -1
  const user_id = req.user.id;
  try {
    const [existing] = await pool.execute(
      'SELECT vote FROM blog_votes WHERE blog_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existing.length > 0) {
      if (existing[0].vote === vote) {
        // Remove vote if same
        await pool.execute('DELETE FROM blog_votes WHERE blog_id = ? AND user_id = ?', [id, user_id]);
      } else {
        // Update vote
        await pool.execute(
          'UPDATE blog_votes SET vote = ? WHERE blog_id = ? AND user_id = ?',
          [vote, id, user_id]
        );
      }
    } else {
      // Add vote
      await pool.execute(
        'INSERT INTO blog_votes (blog_id, user_id, vote) VALUES (?, ?, ?)',
        [id, user_id, vote]
      );
    }
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  const { id } = req.params;
  const { content, parent_id } = req.body;
  const user_id = req.user.id;
  try {
    const [result] = await pool.execute(
      'INSERT INTO comments (blog_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
      [id, user_id, content, parent_id || null]
    );
    res.status(201).json({ id: result.insertId, blog_id: id, user_id, content, parent_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likeComment = async (req, res) => {
  const { id } = req.params; // comment_id
  const user_id = req.user.id;
  try {
    const [existing] = await pool.execute(
      'SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existing.length > 0) {
      await pool.execute('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?', [id, user_id]);
    } else {
      await pool.execute(
        'INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)',
        [id, user_id]
      );
    }
    res.json({ message: 'Comment like toggled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
