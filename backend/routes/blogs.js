import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  voteBlog,
  addComment,
  likeComment
} from '../controllers/blogController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/', authMiddleware, createBlog);
router.put('/:id', authMiddleware, updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);
router.post('/:id/vote', authMiddleware, voteBlog);
router.post('/:id/comments', authMiddleware, addComment);
router.post('/comments/:id/like', authMiddleware, likeComment);

export default router;
